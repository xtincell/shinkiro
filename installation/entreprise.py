#!/usr/bin/env python3
"""Installation du socle manuel, avec Docker Compose et les migrations natives.

Pas de gestionnaire de comptes, de modèles ou d'agents. L'inscription reste
dans La Fusée. Les autres stockages de la flotte ont leur propre réception.
"""
import argparse
import hashlib
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
    return config

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
    env={**env,'SHINKIRO_INSTANCE':config['instance'],'POSTGRES_DB':config['database'],
         'SHINKIRO_INSTALLATION_ID':config['installationId'],
         'POSTGRES_USER':config['databaseUser'],'SHINKIRO_ORIGIN':config['origin'],
         'SHINKIRO_CANONICAL_HOST':urlsplit(config['origin']).netloc,'SHINKIRO_HTTP_PORT':str(config['port'])}
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

def query(p,source,payload=None):
    guard_ownership(p)
    r=run(['docker','exec','-i',container(p,'fusee'),'node','-e',source],
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

def verify(p):
    return query(p,MIGRATIONS)

def up(p):
    guard_ownership(p)
    compose(p,'config','-q')
    compose(p,'up','-d','--wait','--wait-timeout','120')
    # The native entrypoint is best effort; this acceptance check is not.
    return verify(p)

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

def database_fingerprint(p):
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
    r=run(['docker','exec',container(p,'db'),'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U',c['databaseUser'],'-d',c['database'],'-c',sql],capture_output=True,text=True)
    return json.loads(r.stdout)

def backup(p,destination):
    guard_ownership(p)
    verify(p)
    dest=Path(destination).resolve()
    if dest.exists(): raise ValueError('Destination de sauvegarde déjà présente')
    dest.mkdir(mode=0o700,parents=True)
    c=load(p); app=container(p,'fusee'); db=container(p,'db')
    # Pause only this company's writer. PostgreSQL remains available for dump.
    compose(p,'stop','fusee')
    try:
        fingerprint=database_fingerprint(p)
        with (dest/'database.dump').open('xb') as f:
            os.chmod(f.name,0o600)
            run(['docker','exec',db,'pg_dump','-U',c['databaseUser'],'-d',c['database'],'-Fc','--no-owner','--no-privileges'],stdout=f)
        with (dest/'media.tar').open('xb') as f:
            os.chmod(f.name,0o600)
            run(['docker','cp',app+':/app/private-media/.','-'],stdout=f)
        for name in ['.env','instance.json','compose.yml']:
            (dest/name).write_bytes((p/name).read_bytes());(dest/name).chmod(0o600)
        manifest={'schema':1,'profile':'socle-manuel-fusee-v1','instance':c['instance'],
                  'files':{name:digest(dest/name) for name in ['database.dump','media.tar','.env','instance.json','compose.yml']},
                  'databaseFingerprint':fingerprint,
                  'scope':['PostgreSQL complet','originaux et médias privés','configuration de cette instance'],
                  'excluded':['La Barre','Radar','Argos','Galahad','Talos','Hulysse','Danmem','connecteurs externes']}
        write_json(dest/'backup.json',manifest)
        return {'backup':str(dest),'profile':manifest['profile'],'files':len(manifest['files'])}
    finally:compose(p,'start','fusee')

def validate_backup(source):
    m=json.loads((source/'backup.json').read_text())
    names=['database.dump','media.tar','.env','instance.json','compose.yml']
    if m['schema']!=1 or m['profile']!='socle-manuel-fusee-v1' or set(m['files'])!=set(names):raise ValueError('Sauvegarde non reconnue')
    if not isinstance(m.get('databaseFingerprint'),dict) or not m['databaseFingerprint']:raise ValueError('Empreintes de tables absentes')
    for name in names:
        if (source/name).is_symlink() or digest(source/name)!=m['files'][name]:raise ValueError('Sauvegarde altérée : '+name)
    with tarfile.open(source/'media.tar') as tar:
        for item in tar:
            if item.name.startswith('/') or '..' in Path(item.name).parts or not (item.isfile() or item.isdir()):raise ValueError('Chemin ou lien de média refusé')
    return m

def restore(source,p,instance,origin,port):
    validate_backup(source)
    config=json.loads((source/'instance.json').read_text())
    config.update(instance=instance,origin=origin,port=port)
    p=prepare(config,p,environment(source))
    guard_ownership(p)
    # Restore through the qualified current recipe. The archived composition
    # remains evidence; image digests, auth/media keys and data come from backup.
    compose(p,'up','-d','--wait','db')
    compose(p,'create','--no-recreate','fusee')
    with (source/'database.dump').open('rb') as f:
        run(['docker','exec','-i',container(p,'db'),'pg_restore','-U',config['databaseUser'],'-d',config['database'],'--no-owner','--no-privileges','--exit-on-error'],stdin=f)
    with (source/'media.tar').open('rb') as f:
            run(['docker','cp','-a','-',container(p,'fusee')+':/app/private-media'],stdin=f)
    manifest=json.loads((source/'backup.json').read_text())
    fingerprint=database_fingerprint(p)
    if fingerprint!=manifest['databaseFingerprint']:
        raise ValueError('Le contenu restauré diffère de la sauvegarde ; application non démarrée.')
    return {**up(p),'restoredTables':len(fingerprint),'databaseContentMatches':True}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest='action',required=True)
    p=sub.add_parser('preparer');p.add_argument('configuration',type=Path);p.add_argument('destination',type=Path)
    for action in ['demarrer','verifier','provisionner','sauvegarder']:
        p=sub.add_parser(action);p.add_argument('installation',type=Path)
        if action=='provisionner':p.add_argument('--compte-inscrit',required=True)
        if action=='sauvegarder':p.add_argument('--destination',required=True,type=Path)
    p=sub.add_parser('restaurer');p.add_argument('sauvegarde',type=Path);p.add_argument('destination',type=Path)
    p.add_argument('--instance',required=True);p.add_argument('--origine',required=True);p.add_argument('--port',required=True,type=int)
    a=parser.parse_args()
    if a.action=='preparer':result={'prepared':str(prepare(json.loads(a.configuration.read_text()),a.destination))}
    elif a.action=='restaurer':result=restore(a.sauvegarde.resolve(),a.destination,a.instance,a.origine,a.port)
    else:
        p=a.installation.resolve()
        if a.action=='demarrer':result=up(p)
        elif a.action=='verifier':result=verify(p)
        elif a.action=='provisionner':result=query(p,PROVISION,{**load(p),'email':a.compte_inscrit})
        else:result=backup(p,a.destination)
    print(json.dumps(result,ensure_ascii=False))

if __name__=='__main__':main()
