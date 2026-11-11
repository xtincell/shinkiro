#!/usr/bin/env python3
"""Installation du socle manuel, avec Docker Compose et les migrations natives.

Pas de gestionnaire de comptes, de modèles ou d'agents. L'inscription reste
dans La Fusée. La Barre, Radar et Danmem s'ajoutent par option, chacun avec son
stockage propre ; Argos et les rôles d'agents n'entrent pas dans ce profil.
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import tarfile
from urllib.parse import urlsplit

HERE = Path(__file__).resolve().parent
FUSEE = 'ghcr.io/xtincell/adve-project@sha256:47618a47c7d997551b63fbe61a6b902d4907892b15dfac1ef14958aba8a3edea'
POSTGRES = 'pgvector/pgvector@sha256:ad2e18408bf447f62092a8a5259e7df10505c5a0360bd1a1853ac8b8b0763da2'
DIGEST_IMAGE = r'(?:[a-zA-Z0-9./_-]+@)?sha256:[a-f0-9]{64}'
# Optional components, each with its own Compose profile. The socle has none.
COMPONENTS = ('barre','radar','danmem')
PROFILES = {'barre':'workbench','radar':'radar','danmem':'memoire'}
RADAR_SECRETS = ['SHINKIRO_RADAR_DB_PASSWORD','SHINKIRO_RADAR_PASSWORD','SHINKIRO_RADAR_COOKIE_SECRET','SHINKIRO_RADAR_API_KEY','SHINKIRO_RADAR_FEED_TOKEN']
DANMEM_SECRETS = ['SHINKIRO_DANMEM_DB_PASSWORD','SHINKIRO_DANMEM_TOKEN']
# Component databases: (Compose service, user, database). Each is its own PostgreSQL.
DATABASES = {'radar':('radar-db','radar','radar'),'danmem':('danmem-db','danmem','danmem')}

def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')
    path.chmod(0o600)

def validate(config):
    for key in ['instance','database','databaseUser']:
        if not re.fullmatch(r'[a-z][a-z0-9_-]{2,45}', config[key]):
            raise ValueError('Identifiant invalide : '+key)
    url=urlsplit(config['origin'])
    local=url.hostname in ('localhost','127.0.0.1')
    if (url.scheme!='https' and not (local and url.scheme=='http')) or url.username or url.password or url.path or url.query or url.fragment:
        raise ValueError('Origine HTTPS requise ; HTTP réservé à localhost ou 127.0.0.1.')
    if not url.hostname or not 1024 <= int(config['port']) <= 65535:
        raise ValueError('Origine ou port invalide')
    if not config['name'].strip() or '\n' in config['name']:
        raise ValueError('Nom d’entreprise requis')
    if config.get('barre'):
        if not re.fullmatch(DIGEST_IMAGE,config.get('barreImage','')):
            raise ValueError('Une image La Barre qualifiée par son digest est requise')
    if 'fuseeImage' in config and not re.fullmatch(DIGEST_IMAGE,str(config['fuseeImage'])):
        raise ValueError('Une image La Fusée qualifiée par son digest est requise')
    if config.get('radar'):
        if not re.fullmatch(DIGEST_IMAGE,str(config.get('radarImage',''))):
            raise ValueError('Une image Radar qualifiée par son digest est requise')
        port=config.get('radarPort')
        if type(port) is not int or not 1024<=port<=65535 or port==int(config['port']):
            raise ValueError('Radar exige son propre port local, distinct de celui de La Fusée')
        if not re.fullmatch(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',str(config.get('radarAdminEmail',''))):
            raise ValueError('Radar exige l’adresse de son responsable')
        if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_+-]*(?:/[A-Za-z0-9_+-]+){0,2}',str(config.get('radarTimezone','UTC'))):
            raise ValueError('Fuseau horaire Radar invalide')
    if config.get('danmem') and not re.fullmatch(DIGEST_IMAGE,str(config.get('danmemImage',''))):
        raise ValueError('Une image Danmem qualifiée par son digest est requise')
    return config

def components(config):
    """Optional owned components, in their fixed order."""
    return [name for name in COMPONENTS if config.get(name)]

def writers(config):
    """Every process that writes this company's data and is frozen together for a backup."""
    return ['fusee',*components(config)]

def prepare(config, destination, inherited_env=None):
    config={**validate(config),'installationId':secrets.token_hex(16)}
    p=Path(destination).resolve()
    if p.exists(): raise ValueError('La destination doit être nouvelle ; aucun fichier existant ne sera remplacé.')
    p.mkdir(mode=0o700,parents=True)
    write_json(p/'instance.json',config)
    (p/'compose.yml').write_bytes((HERE/'compose.yml').read_bytes())
    env=inherited_env or {
        'SHINKIRO_FUSEE_IMAGE':FUSEE,'SHINKIRO_DATABASE_IMAGE':POSTGRES,
        'POSTGRES_PASSWORD':secrets.token_hex(32),'SHINKIRO_AUTH_SECRET':secrets.token_hex(32),
        'SHINKIRO_MEDIA_KEY':secrets.token_hex(32),
    }
    if config.get('fuseeImage'):env={**env,'SHINKIRO_FUSEE_IMAGE':config['fuseeImage']}
    env={**env,'SHINKIRO_INSTANCE':config['instance'],'POSTGRES_DB':config['database'],
         'SHINKIRO_INSTALLATION_ID':config['installationId'],
         'POSTGRES_USER':config['databaseUser'],'SHINKIRO_ORIGIN':config['origin'],
         'SHINKIRO_CANONICAL_HOST':urlsplit(config['origin']).netloc,'SHINKIRO_HTTP_PORT':str(config['port'])}
    if config.get('barre'):
        env={**env,'COMPOSE_PROFILES':'workbench','SHINKIRO_BARRE_IMAGE':config['barreImage'],
             'SHINKIRO_BARRE_UPSTREAM':'http://barre:3000','SHINKIRO_BARRE_DEPOT':'entreprise.json',
             'SHINKIRO_BARRE_OPERATOR_IDS':env.get('SHINKIRO_BARRE_OPERATOR_IDS',config['instance']),
             'SHINKIRO_BARRE_INSTANCE':env.get('SHINKIRO_BARRE_INSTANCE','barre-'+secrets.token_hex(16))}
        profile='window.MAISON = MAISON_BASE.creer('+json.dumps({'nom':config['name']},ensure_ascii=False)+');\n'
        (p/'barre-maison.js').write_text(profile);(p/'barre-maison.js').chmod(0o644)
    # Radar and Danmem: their own database, secrets generated here unless a backup
    # brings them back. The Radar identity names this dossier store in Fusée
    # references (RADAR / instance / brief / id) and survives a recovery.
    if config.get('radar'):
        env={**env,'SHINKIRO_RADAR_IMAGE':config['radarImage'],'SHINKIRO_RADAR_HTTP_PORT':str(config['radarPort']),
             'SHINKIRO_RADAR_ADMIN_EMAIL':config['radarAdminEmail'],'SHINKIRO_RADAR_TZ':config.get('radarTimezone','UTC'),
             **{key:env.get(key) or secrets.token_hex(32) for key in RADAR_SECRETS},
             'SHINKIRO_RADAR_INSTANCE':env.get('SHINKIRO_RADAR_INSTANCE') or 'radar-'+secrets.token_hex(16)}
    if config.get('danmem'):
        env={**env,'SHINKIRO_DANMEM_IMAGE':config['danmemImage'],**{key:env.get(key) or secrets.token_hex(32) for key in DANMEM_SECRETS}}
    if config.get('radar') or config.get('danmem'):
        env={**env,'COMPOSE_PROFILES':','.join(PROFILES[name] for name in components(config))}
    if any('\n' in str(v) or '\r' in str(v) for v in env.values()): raise ValueError('Valeur multiligne refusée')
    with (p/'.env').open('x') as f:
        os.chmod(f.name,0o600)
        f.write(''.join(k+'='+str(v)+'\n' for k,v in env.items()))
    return p

def load(p):
    return validate(json.loads((p/'instance.json').read_text()))

def environment(p):
    return dict(line.split('=',1) for line in (p/'.env').read_text().splitlines() if line)

def run(command, **kwargs):
    try:return subprocess.run(command,check=True,**kwargs)
    except subprocess.CalledProcessError as error:
        if kwargs.get('capture_output'):
            raise RuntimeError((error.stderr or error.stdout or 'Commande en échec').strip()) from None
        raise

def compose(p,*args,**kwargs):
    config=load(p)
    command=['docker','compose','--project-name',config['instance'],'--env-file',str(p/'.env'),'-f',str(p/'compose.yml'),*args]
    # Compose cannot inherit provider keys or a real deployment's settings.
    env={k:v for k,v in os.environ.items() if k in ['PATH','HOME','DOCKER_HOST','DOCKER_CONTEXT','DOCKER_CONFIG','XDG_RUNTIME_DIR']}
    return run(command,env=env,**kwargs)

def container(p,service):
    value=compose(p,'ps','-aq',service,capture_output=True,text=True).stdout.strip()
    if not re.fullmatch(r'[a-f0-9]{12,64}',value): raise ValueError('Un seul conteneur attendu : '+service)
    return value

def guard_ownership(p):
    c=load(p)
    identity=c.get('installationId')
    if not identity:raise ValueError('Identité d’installation absente')
    for kind,ls,field in [('container',['ps','-aq'],'.Config.Labels'),('volume',['volume','ls','-q'],'.Labels'),('network',['network','ls','-q'],'.Labels')]:
        ids=run(['docker',*ls,'--filter','label=com.docker.compose.project='+c['instance']],capture_output=True,text=True).stdout.split()
        for id in ids:
            labels=json.loads(run(['docker','inspect','--type',kind,'--format','{{json '+field+'}}',id],capture_output=True,text=True).stdout)
            if not labels or labels.get('shinkiro.installation')!=identity:raise ValueError('Ressource existante étrangère à cette installation : '+kind)

def query(p,source,payload=None,service='fusee'):
    guard_ownership(p)
    r=run(['docker','exec','-i',container(p,service),'node','-e',source],
          input=json.dumps(payload) if payload is not None else '',capture_output=True,text=True)
    return json.loads(r.stdout)

MIGRATIONS = r'''const fs=require('fs'),crypto=require('crypto'),{Client}=require('pg');
(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();try{
const dirs=fs.readdirSync('prisma/migrations',{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort();
const rows=(await c.query('SELECT migration_name,checksum FROM "_prisma_migrations" WHERE finished_at IS NOT NULL')).rows;
for(const name of dirs){const h=crypto.createHash('sha256').update(fs.readFileSync('prisma/migrations/'+name+'/migration.sql')).digest('hex');
if(!rows.some(r=>r.migration_name===name&&r.checksum===h))throw Error('Migration absente ou différente : '+name);}
console.log(JSON.stringify({migrations:dirs.length,checksumsMatch:true}));
}finally{await c.end();}})().catch(e=>{console.error(e.message);process.exitCode=1});'''

# Fusée side of the Radar contract: identity links only, never copied state.
RADAR_REFERENCES = r'''const {Client}=require('pg');let text='';process.stdin.on('data',c=>text+=c);process.stdin.on('end',async()=>{
const f=JSON.parse(text),c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();try{
const rows=(await c.query('SELECT "sourceRefs" r FROM "BrandNode" WHERE jsonb_typeof("sourceRefs")=\'array\'')).rows;
const own=new Set();let other=0;for(const row of rows)for(const ref of row.r){if(!ref||ref.system!=='RADAR')continue;
if(ref.instance===f.instance&&ref.kind==='brief'&&/^[1-9][0-9]*$/.test(String(ref.id)))own.add(String(ref.id));else other++;}
console.log(JSON.stringify({ids:[...own].sort(),otherInstances:other}));
}catch(e){console.error(e.message);process.exitCode=1;}finally{await c.end();}});'''

# Radar side: the wall is closed to anonymous callers, the machine key reads the
# dossiers, and every Fusée reference to this Radar names an existing brief.
RADAR_CHECK = r'''let text='';process.stdin.on('data',c=>text+=c);process.stdin.on('end',async()=>{try{
const f=JSON.parse(text),base='http://127.0.0.1:3000/rest/v1/',h={Authorization:'Bearer '+process.env.RADAR_API_KEY};
const anonymous=(await fetch(base+'briefs?select=id&limit=1')).status;if(anonymous!==401)throw Error('Radar accessible sans authentification : '+anonymous);
const r=await fetch(base+'briefs?select=id&order=id.asc&limit=1',{headers:h});if(!r.ok)throw Error('Radar indisponible : '+r.status);await r.json();
const found=new Set();for(let i=0;i<f.ids.length;i+=100){const part=f.ids.slice(i,i+100);
const q=await fetch(base+'briefs?select=id&id=in.('+part.join(',')+')',{headers:h});if(!q.ok)throw Error('Lecture Radar refusée : '+q.status);
for(const row of await q.json())found.add(String(row.id));}
console.log(JSON.stringify({anonymousStatus:anonymous,references:f.ids.length,resolved:f.ids.filter(id=>found.has(id)).length,received:true}));
}catch(e){console.error(e.message);process.exitCode=1}});'''

DANMEM_CHECK = r'''(async()=>{const base='http://127.0.0.1:8790/',h=await fetch(base+'health'),health=await h.json();
if(!h.ok||!health.ok)throw Error('Danmem indisponible : '+(health.schema||h.status));
const anonymous=(await fetch(base+'peers')).status;if(anonymous!==401)throw Error('Danmem accessible sans clé : '+anonymous);
const w=await fetch(base+'whoami',{headers:{Authorization:'Bearer '+process.env.MEMORY_API_TOKEN}});if(!w.ok)throw Error('Clé Danmem refusée : '+w.status);
const who=await w.json();console.log(JSON.stringify({schema:'complet',worker:health.worker.enabled,anonymousStatus:anonymous,identity:who.identity,received:true}));
})().catch(e=>{console.error(e.message);process.exitCode=1});'''

def verify(p):
    result=query(p,MIGRATIONS)
    config=load(p)
    if config.get('radar'):
        instance=environment(p)['SHINKIRO_RADAR_INSTANCE']
        refs=query(p,RADAR_REFERENCES,{'instance':instance})
        result['radar']={'instance':instance,**query(p,RADAR_CHECK,{'ids':refs['ids']},'radar'),'otherRadarReferences':refs['otherInstances']}
    if config.get('danmem'):
        result['danmem']=query(p,DANMEM_CHECK,service='danmem')
    if config.get('barre'):
        result['barre']=query(p,"""(async()=>{const r=await fetch(process.env.PORTFOLIO_BARRE_UPSTREAM+'/depots/manifeste.json');if(!r.ok)throw Error('Dépôt La Barre indisponible');const m=await r.json();if(m.reference!==process.env.PORTFOLIO_BARRE_DEPOT)throw Error('Dépôt La Barre différent du raccord');console.log(JSON.stringify({depot:m.reference,received:true}));})().catch(e=>{console.error(e.message);process.exitCode=1});""")
    return result

# Compose cannot require a value only when a profile is active: this does.
REQUIRED = {'radar':['SHINKIRO_RADAR_IMAGE','SHINKIRO_RADAR_HTTP_PORT','SHINKIRO_RADAR_ADMIN_EMAIL','SHINKIRO_RADAR_TZ','SHINKIRO_RADAR_INSTANCE',*RADAR_SECRETS],
            'danmem':['SHINKIRO_DANMEM_IMAGE',*DANMEM_SECRETS]}

def check_environment(p):
    env=environment(p); config=load(p)
    active=[name for name in env.get('COMPOSE_PROFILES','').split(',') if name]
    for name in components(config):
        missing=[key for key in REQUIRED.get(name,[]) if not env.get(key)]
        if missing:raise ValueError('Configuration privée incomplète pour '+name+' : '+', '.join(missing))
        if PROFILES[name] not in active:raise ValueError('Profil Compose absent pour '+name)

def up(p):
    guard_ownership(p)
    check_environment(p)
    compose(p,'config','-q')
    compose(p,'up','-d','--wait','--wait-timeout','120')
    # The native entrypoint is best effort; this acceptance check is not.
    return verify(p)

def stop(p):
    guard_ownership(p)
    # Preserve containers, named volumes, networks, images and configuration.
    compose(p,'stop','--timeout','60')
    return {'stopped':load(p)['instance'],'resourcesDeleted':False}

PROVISION = r'''const {Client}=require('pg');let text='';process.stdin.on('data',c=>text+=c);process.stdin.on('end',async()=>{
const f=JSON.parse(text),c=new Client({connectionString:process.env.DATABASE_URL});await c.connect();try{
await c.query('BEGIN');await c.query('LOCK TABLE "Operator", "User" IN EXCLUSIVE MODE');
const operators=(await c.query('SELECT id FROM "Operator"')).rows;
const users=(await c.query('SELECT id,email,role,"operatorId" FROM "User"')).rows;
if(operators.length||users.length!==1||users[0].email!==f.email||users[0].operatorId||users[0].role!=='USER')throw Error('Provisionnement réservé à une installation vide avec un seul compte USER inscrit dans La Fusée.');
for(const table of ['Client','Strategy'])if(Number((await c.query('SELECT count(*) n FROM "'+table+'"')).rows[0].n))throw Error('Des données métier existent déjà.');
await c.query('INSERT INTO "Operator" (id,name,slug,status,"licenseType","licensedAt","licenseExpiry","updatedAt") VALUES($1,$2,$3,\'ACTIVE\',\'TRIAL\',now(),now()+interval \'31 days\',now())',[f.instance,f.name,f.instance]);
await c.query('UPDATE "User" SET "operatorId"=$1,role=\'ADMIN\',"updatedAt"=now() WHERE id=$2',[f.instance,users[0].id]);
await c.query('COMMIT');console.log(JSON.stringify({operator:f.instance,owner:users[0].id,provisioned:true}));
}catch(e){await c.query('ROLLBACK');console.error(e.message);process.exitCode=1;}finally{await c.end();}});'''

def digest(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    return h.hexdigest()

def database_fingerprint(p,service='db',user=None,database=None):
    c=load(p)
    # Only counts and row digests leave PostgreSQL, never table contents.
    sql='''CREATE FUNCTION pg_temp.shinkiro_fingerprint() RETURNS jsonb LANGUAGE plpgsql AS $$
    DECLARE t record; found jsonb; result jsonb := '{}'::jsonb;
    BEGIN
      FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename LOOP
        EXECUTE format($query$SELECT jsonb_build_object('rows', count(*), 'digest', md5(coalesce(string_agg(h, '' ORDER BY h), ''))) FROM (SELECT md5(to_jsonb(r)::text) h FROM public.%I r) s$query$, t.tablename) INTO found;
        result := result || jsonb_build_object(t.tablename,found);
      END LOOP;
      RETURN result;
    END $$; SELECT pg_temp.shinkiro_fingerprint();'''
    r=run(['docker','exec',container(p,service),'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U',user or c['databaseUser'],'-d',database or c['database'],'-c',sql],capture_output=True,text=True)
    return json.loads(r.stdout)

def component_fingerprint(p,name):
    service,user,database=DATABASES[name]
    return database_fingerprint(p,service,user,database)

def psql_value(p,name,sql):
    service,user,database=DATABASES[name]
    return run(['docker','exec',container(p,service),'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U',user,'-d',database,'-c',sql],capture_output=True,text=True).stdout.strip()

DANMEM_EXTENSIONS = "SELECT coalesce(jsonb_object_agg(extname,extversion),'{}'::jsonb) FROM pg_extension WHERE extname<>'plpgsql'"
DANMEM_CLAIMED = "SELECT coalesce(jsonb_agg(id::text ORDER BY id),'[]'::jsonb) FROM jobs WHERE status='claimed'"

def backup(p,destination):
    guard_ownership(p)
    checked=verify(p)
    dest=Path(destination).resolve()
    if dest.exists(): raise ValueError('Destination de sauvegarde déjà présente')
    dest.mkdir(mode=0o700,parents=True)
    c=load(p); app=container(p,'fusee'); db=container(p,'db')
    extended=bool(c.get('radar') or c.get('danmem'))
    # Freeze every owned writer. The databases remain available for dump.
    frozen=writers(c)
    compose(p,'stop',*frozen)
    try:
        fingerprint=database_fingerprint(p)
        with (dest/'database.dump').open('xb') as f:
            os.chmod(f.name,0o600)
            run(['docker','exec',db,'pg_dump','-U',c['databaseUser'],'-d',c['database'],'-Fc','--no-owner','--no-privileges'],stdout=f)
        with (dest/'media.tar').open('xb') as f:
            os.chmod(f.name,0o600)
            run(['docker','cp',app+':/app/private-media/.','-'],stdout=f)
        barre_files=[]
        if c.get('barre'):
            for name,folder in [('barre-depots.tar','/app/depots'),('barre-review.tar','/app/assets/review')]:
                with (dest/name).open('xb') as f:
                    os.chmod(f.name,0o600)
                    run(['docker','cp',container(p,'barre')+':'+folder+'/.','-'],stdout=f)
                barre_files.append(name)
            barre_files.append('barre-maison.js')
            (dest/'barre-maison.js').write_bytes((p/'barre-maison.js').read_bytes());(dest/'barre-maison.js').chmod(0o600)
        component_files=[]
        for name in [n for n in ('radar','danmem') if c.get(n)]:
            service,user,database=DATABASES[name]
            with (dest/(name+'.dump')).open('xb') as f:
                os.chmod(f.name,0o600)
                run(['docker','exec',container(p,service),'pg_dump','-U',user,'-d',database,'-Fc','--no-owner','--no-privileges'],stdout=f)
            component_files.append(name+'.dump')
        if c.get('radar'):
            with (dest/'radar-data.tar').open('xb') as f:
                os.chmod(f.name,0o600)
                run(['docker','cp',container(p,'radar')+':/data/.','-'],stdout=f)
            component_files.append('radar-data.tar')
        for name in ['.env','instance.json','compose.yml']:
            (dest/name).write_bytes((p/name).read_bytes());(dest/name).chmod(0o600)
        if extended:schema,profile=3,'socle-manuel-fusee-v3'
        elif c.get('barre'):schema,profile=2,'socle-manuel-fusee-barre-v2'
        else:schema,profile=1,'socle-manuel-fusee-v1'
        manifest={'schema':schema,'profile':profile,'instance':c['instance'],
                  'files':{name:digest(dest/name) for name in ['database.dump','media.tar','.env','instance.json','compose.yml',*barre_files,*component_files]},
                  'databaseFingerprint':fingerprint,
                  'scope':['PostgreSQL complet','originaux et médias privés','configuration de cette instance'],
                  'excluded':[name for name,present in [('La Barre',c.get('barre')),('Radar',c.get('radar')),('Argos',False),('Galahad',False),
                                                          ('Talos',False),('Hulysse',False),('Danmem',c.get('danmem')),('connecteurs externes',False)] if not present]}
        if c.get('barre'):
            manifest['scope'].extend(['dépôt natif La Barre','médias et éditions de revue La Barre','profil et identité de raccord'])
            manifest['barreFingerprint']={name:archive_fingerprint(dest/name) for name in ['barre-depots.tar','barre-review.tar']}
        if extended:
            manifest['components']=components(c)
        if c.get('radar'):
            manifest['scope'].extend(['base Radar complète (dossiers et journal)','mots de passe personnels et visuels Radar','identité Radar du raccord'])
            manifest['radarDatabaseFingerprint']=component_fingerprint(p,'radar')
            manifest['radarDataFingerprint']=archive_fingerprint(dest/'radar-data.tar')
            manifest['radarReferences']={'fusee':checked['radar']['references'],'resolved':checked['radar']['resolved']}
        if c.get('danmem'):
            manifest['scope'].extend(['base Danmem complète (observations, travaux, clés à identité)'])
            manifest['danmemDatabaseFingerprint']=component_fingerprint(p,'danmem')
            manifest['danmemExtensions']=json.loads(psql_value(p,'danmem',DANMEM_EXTENSIONS))
            # A claimed job without the consumer's receipt is an interrupted effect.
            manifest['danmemClaimedJobs']=json.loads(psql_value(p,'danmem',DANMEM_CLAIMED))
        write_json(dest/'backup.json',manifest)
        return {'backup':str(dest),'profile':manifest['profile'],'files':len(manifest['files'])}
    finally:compose(p,'start',*frozen)

def archive_fingerprint(path):
    files={}
    with tarfile.open(path) as tar:
        for item in tar:
            if item.name.startswith('/') or '..' in Path(item.name).parts or not (item.isfile() or item.isdir()):raise ValueError('Chemin ou lien de média refusé')
            if item.isfile():
                name=str(Path(item.name))
                if name in files:raise ValueError('Fichier dupliqué dans la sauvegarde')
                files[name]={'sha256':hashlib.sha256(tar.extractfile(item).read()).hexdigest(),'mode':item.mode}
    return files

def validate_backup(source):
    m=json.loads((source/'backup.json').read_text())
    names=['database.dump','media.tar','.env','instance.json','compose.yml']
    integrated=m.get('schema')==2 and m.get('profile')=='socle-manuel-fusee-barre-v2'
    extended=m.get('schema')==3 and m.get('profile')=='socle-manuel-fusee-v3'
    parts=m.get('components') if extended else (['barre'] if integrated else [])
    if extended and (not isinstance(parts,list) or parts!=[n for n in COMPONENTS if n in parts] or not {'radar','danmem'}&set(parts)):
        raise ValueError('Composants de sauvegarde non reconnus')
    if 'barre' in parts:names+=['barre-depots.tar','barre-review.tar','barre-maison.js']
    if 'radar' in parts:names+=['radar.dump','radar-data.tar']
    if 'danmem' in parts:names+=['danmem.dump']
    if not (integrated or extended or (m.get('schema')==1 and m.get('profile')=='socle-manuel-fusee-v1')) or set(m['files'])!=set(names):raise ValueError('Sauvegarde non reconnue')
    if not isinstance(m.get('databaseFingerprint'),dict) or not m['databaseFingerprint']:raise ValueError('Empreintes de tables absentes')
    for name in names:
        if (source/name).is_symlink() or digest(source/name)!=m['files'][name]:raise ValueError('Sauvegarde altérée : '+name)
    archive_fingerprint(source/'media.tar')
    if 'barre' in parts:
        if {name:archive_fingerprint(source/name) for name in ['barre-depots.tar','barre-review.tar']}!=m.get('barreFingerprint'):
            raise ValueError('Empreintes La Barre absentes ou différentes')
        if not json.loads((source/'instance.json').read_text()).get('barre'):raise ValueError('Profil La Barre absent de l’installation')
    if extended:
        config=json.loads((source/'instance.json').read_text())
        if [n for n in COMPONENTS if config.get(n)]!=parts:raise ValueError('Composants de l’installation différents de la sauvegarde')
    if 'radar' in parts:
        if not isinstance(m.get('radarDatabaseFingerprint'),dict) or not m['radarDatabaseFingerprint']:raise ValueError('Empreintes Radar absentes')
        if archive_fingerprint(source/'radar-data.tar')!=m.get('radarDataFingerprint'):raise ValueError('Empreintes des fichiers Radar absentes ou différentes')
    if 'danmem' in parts:
        if not isinstance(m.get('danmemDatabaseFingerprint'),dict) or not m['danmemDatabaseFingerprint']:raise ValueError('Empreintes Danmem absentes')
        if not isinstance(m.get('danmemExtensions'),dict) or 'vector' not in m['danmemExtensions']:raise ValueError('Version pgvector de Danmem absente')
    return m

def restore(source,p,instance,origin,port,radar_port=None):
    manifest=validate_backup(source)
    config=json.loads((source/'instance.json').read_text())
    config.update(instance=instance,origin=origin,port=port)
    if config.get('radar'):
        # The original Radar may still serve on its port: the recovery needs its own.
        if radar_port is None or radar_port==config.get('radarPort'):raise ValueError('La reprise exige un nouveau port local Radar')
        config['radarPort']=radar_port
    p=prepare(config,p,environment(source))
    if config.get('barre'):
        (p/'barre-maison.js').write_bytes((source/'barre-maison.js').read_bytes());(p/'barre-maison.js').chmod(0o644)
    guard_ownership(p)
    check_environment(p)
    # Restore through the qualified current recipe. The archived composition
    # remains evidence; image digests, auth/media keys and data come from backup.
    compose(p,'up','-d','--wait','db',*[DATABASES[n][0] for n in ('radar','danmem') if config.get(n)])
    compose(p,'create','--no-recreate',*writers(config))
    with (source/'database.dump').open('rb') as f:
        run(['docker','exec','-i',container(p,'db'),'pg_restore','-U',config['databaseUser'],'-d',config['database'],'--no-owner','--no-privileges','--exit-on-error'],stdin=f)
    with (source/'media.tar').open('rb') as f:
            run(['docker','cp','-a','-',container(p,'fusee')+':/app/private-media'],stdin=f)
    trees=[]
    if config.get('barre'):trees+=[('barre','barre-depots.tar','/app/depots'),('barre','barre-review.tar','/app/assets/review')]
    if config.get('radar'):trees+=[('radar','radar-data.tar','/data')]
    for service,name,folder in trees:
        with (source/name).open('rb') as f:run(['docker','cp','-a','-',container(p,service)+':'+folder],stdin=f)
        received=run(['docker','cp',container(p,service)+':'+folder+'/.','-'],capture_output=True).stdout
        with tarfile.open(fileobj=io.BytesIO(received)) as tar:
            content={str(Path(item.name)):{'sha256':hashlib.sha256(tar.extractfile(item).read()).hexdigest(),'mode':item.mode} for item in tar if item.isfile()}
        if content!=archive_fingerprint(source/name):raise ValueError('Fichiers restaurés différents ('+name+') ; applications non démarrées')
    for name in [n for n in ('radar','danmem') if config.get(n)]:
        service,user,database=DATABASES[name]
        with (source/(name+'.dump')).open('rb') as f:
            run(['docker','exec','-i',container(p,service),'pg_restore','-U',user,'-d',database,'--no-owner','--no-privileges','--exit-on-error'],stdin=f)
    fingerprint=database_fingerprint(p)
    if fingerprint!=manifest['databaseFingerprint']:
        raise ValueError('Le contenu restauré diffère de la sauvegarde ; application non démarrée.')
    restored={'restoredTables':len(fingerprint)}
    for name in [n for n in ('radar','danmem') if config.get(n)]:
        found=component_fingerprint(p,name)
        if found!=manifest[name+'DatabaseFingerprint']:raise ValueError('Base '+name+' restaurée différente ; applications non démarrées')
        restored[name+'Tables']=len(found)
    if config.get('danmem') and json.loads(psql_value(p,'danmem',DANMEM_EXTENSIONS))!=manifest['danmemExtensions']:
        raise ValueError('Extensions Danmem différentes de la sauvegarde ; applications non démarrées')
    return {**up(p),**restored,'databaseContentMatches':True}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest='action',required=True)
    p=sub.add_parser('preparer');p.add_argument('configuration',type=Path);p.add_argument('destination',type=Path)
    for action in ['demarrer','arreter','verifier','provisionner','sauvegarder']:
        p=sub.add_parser(action);p.add_argument('installation',type=Path)
        if action=='provisionner':p.add_argument('--compte-inscrit',required=True)
        if action=='sauvegarder':p.add_argument('--destination',required=True,type=Path)
    p=sub.add_parser('restaurer');p.add_argument('sauvegarde',type=Path);p.add_argument('destination',type=Path)
    p.add_argument('--instance',required=True);p.add_argument('--origine',required=True);p.add_argument('--port',required=True,type=int)
    p.add_argument('--port-radar',type=int,help='Port local de la reprise Radar, si la sauvegarde la contient')
    a=parser.parse_args()
    if a.action=='preparer':result={'prepared':str(prepare(json.loads(a.configuration.read_text()),a.destination))}
    elif a.action=='restaurer':result=restore(a.sauvegarde.resolve(),a.destination,a.instance,a.origine,a.port,a.port_radar)
    else:
        p=a.installation.resolve()
        if a.action=='demarrer':result=up(p)
        elif a.action=='arreter':result=stop(p)
        elif a.action=='verifier':result=verify(p)
        elif a.action=='provisionner':result=query(p,PROVISION,{**load(p),'email':a.compte_inscrit})
        else:result=backup(p,a.destination)
    print(json.dumps(result,ensure_ascii=False))

if __name__=='__main__':main()
