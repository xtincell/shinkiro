import io
import json
import os
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch
import entreprise as e

CONFIG={'instance':'recette-a','name':'Recette A','origin':'http://localhost:3392','port':3392,'database':'recette_a','databaseUser':'recette_a'}

class Installation(unittest.TestCase):
    def test_separate_installations_do_not_share_secrets(self):
        with tempfile.TemporaryDirectory() as root:
            a=e.prepare(CONFIG,Path(root)/'a')
            b=e.prepare({**CONFIG,'instance':'recette-b','origin':'http://127.0.0.1:3393','port':3393},Path(root)/'b')
            for key in ['SHINKIRO_AUTH_SECRET','POSTGRES_PASSWORD','SHINKIRO_MEDIA_KEY']:
                self.assertNotEqual(e.environment(a)[key],e.environment(b)[key])
            self.assertEqual(os.stat(a).st_mode & 0o777,0o700)
            self.assertEqual(os.stat(a/'.env').st_mode & 0o777,0o600)

    def test_prepare_cannot_overwrite_an_installation(self):
        with tempfile.TemporaryDirectory() as root:
            p=e.prepare(CONFIG,Path(root)/'a');before=(p/'.env').read_bytes()
            with self.assertRaises(ValueError):e.prepare(CONFIG,p)
            self.assertEqual((p/'.env').read_bytes(),before)

    def test_external_http_or_credentials_are_refused_before_creation(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root)/'new'
            for origin in ['http://entreprise.example','https://user:pass@example.com','https://example.com/path','https://example.com/?key=value']:
                with self.subTest(origin=origin),self.assertRaises(ValueError):e.prepare({**CONFIG,'origin':origin},p)
                self.assertFalse(p.exists())

    def test_compose_does_not_inherit_an_operator_or_provider_environment(self):
        with tempfile.TemporaryDirectory() as root:
            p=e.prepare(CONFIG,Path(root)/'a')
            with patch.dict(os.environ,{'SHINKIRO_INSTANCE':'real-production','OPENAI_API_KEY':'private-probe','POSTGRES_PASSWORD':'private-probe'}),patch.object(e,'run') as run:
                e.compose(p,'config','-q')
                args,kwargs=run.call_args
                self.assertIn('recette-a',args[0])
                for key in ['SHINKIRO_INSTANCE','OPENAI_API_KEY','POSTGRES_PASSWORD']:self.assertNotIn(key,kwargs['env'])

    def backup_fixture(self,p,member='./source.txt',link=False):
        for name in ['database.dump','.env','instance.json','compose.yml']:(p/name).write_text('fixture')
        with tarfile.open(p/'media.tar','w') as tar:
            info=tarfile.TarInfo(member)
            if link:info.type=tarfile.SYMTYPE;info.linkname='/etc/passwd';tar.addfile(info)
            else:info.size=5;tar.addfile(info,io.BytesIO(b'probe'))
        e.write_json(p/'backup.json',{'schema':1,'profile':'socle-manuel-fusee-v1','databaseFingerprint':{'Fixture':{'rows':1,'digest':'synthetic-receipt'}},'files':{name:e.digest(p/name) for name in ['database.dump','media.tar','.env','instance.json','compose.yml']}})

    def test_altered_backup_refuses_restore_before_any_docker_or_target(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root);self.backup_fixture(p);(p/'database.dump').write_text('tampered')
            with patch.object(e,'run') as run,self.assertRaises(ValueError):e.restore(p,p/'target','restore-a','http://localhost:3394',3394)
            run.assert_not_called();self.assertFalse((p/'target').exists())

    def test_media_traversal_and_links_are_refused(self):
        for member,link in [('../escape',False),('/absolute',False),('./unsafe-link',True)]:
            with self.subTest(member=member),tempfile.TemporaryDirectory() as root:
                p=Path(root);self.backup_fixture(p,member,link)
                with self.assertRaises(ValueError):e.validate_backup(p)

    def test_safe_media_archive_is_accepted(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root);self.backup_fixture(p)
            self.assertEqual(e.validate_backup(p)['profile'],'socle-manuel-fusee-v1')

    def test_workbench_binding_is_separate_and_stays_stable_after_recovery(self):
        with tempfile.TemporaryDirectory() as root:
            config={**CONFIG,'barre':True,'barreImage':'sha256:'+'a'*64}
            a=e.prepare(config,Path(root)/'a')
            b=e.prepare({**config,'instance':'recette-b'},Path(root)/'b')
            old=e.environment(a)
            self.assertNotEqual(old['SHINKIRO_BARRE_INSTANCE'],e.environment(b)['SHINKIRO_BARRE_INSTANCE'])
            restored=e.prepare({**config,'instance':'recette-restore'},Path(root)/'restore',old)
            new=e.environment(restored)
            self.assertEqual(new['SHINKIRO_BARRE_INSTANCE'],old['SHINKIRO_BARRE_INSTANCE'])
            self.assertEqual(new['SHINKIRO_BARRE_OPERATOR_IDS'],old['SHINKIRO_BARRE_OPERATOR_IDS'])
            self.assertNotEqual(new['SHINKIRO_INSTALLATION_ID'],old['SHINKIRO_INSTALLATION_ID'])
            self.assertEqual((restored/'barre-maison.js').read_bytes(),(a/'barre-maison.js').read_bytes())
            self.assertEqual(new['COMPOSE_PROFILES'],'workbench')

    def test_workbench_requires_an_immutable_image_before_creation(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root)/'target'
            with self.assertRaises(ValueError):e.prepare({**CONFIG,'barre':True,'barreImage':'latest'},p)
            self.assertFalse(p.exists())

    def test_integrated_backup_validates_the_workbench_files_and_profile(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root);self.backup_fixture(p)
            for name in ['barre-depots.tar','barre-review.tar']:(p/name).write_bytes((p/'media.tar').read_bytes())
            (p/'barre-maison.js').write_text('window.MAISON = {};')
            (p/'instance.json').write_text(json.dumps({**CONFIG,'barre':True,'barreImage':'sha256:'+'b'*64}))
            m=json.loads((p/'backup.json').read_text());m.update(schema=2,profile='socle-manuel-fusee-barre-v2')
            for name in ['instance.json','barre-maison.js','barre-depots.tar','barre-review.tar']:m['files'][name]=e.digest(p/name)
            m['barreFingerprint']={name:e.archive_fingerprint(p/name) for name in ['barre-depots.tar','barre-review.tar']}
            e.write_json(p/'backup.json',m)
            self.assertEqual(e.validate_backup(p)['schema'],2)
            (p/'barre-review.tar').write_bytes(b'tampered')
            with self.assertRaises(ValueError):e.validate_backup(p)

    def test_foreign_docker_resources_block_the_first_mutation(self):
        with tempfile.TemporaryDirectory() as root:
            p=e.prepare(CONFIG,Path(root)/'a')
            from types import SimpleNamespace
            with patch.object(e,'run',side_effect=[SimpleNamespace(stdout='foreign-container\n'),SimpleNamespace(stdout='{"shinkiro.installation":"other-installation"}')]) as run,patch.object(e,'compose') as compose:
                with self.assertRaises(ValueError):e.up(p)
                compose.assert_not_called()
                self.assertEqual(run.call_count,2)

    def test_foreign_installation_cannot_be_stopped(self):
        with tempfile.TemporaryDirectory() as root:
            p=e.prepare(CONFIG,Path(root)/'a')
            from types import SimpleNamespace
            with patch.object(e,'run',side_effect=[SimpleNamespace(stdout='foreign-container\n'),SimpleNamespace(stdout='{"shinkiro.installation":"other-installation"}')]),patch.object(e,'compose') as compose:
                with self.assertRaises(ValueError):e.stop(p)
                compose.assert_not_called()

    def test_stop_preserves_resources_and_guards_before_docker(self):
        with tempfile.TemporaryDirectory() as root:
            p=e.prepare(CONFIG,Path(root)/'a')
            calls=[]
            with patch.object(e,'guard_ownership',side_effect=lambda _:calls.append('owner')),patch.object(e,'compose',side_effect=lambda _,*args:calls.append(args)):
                result=e.stop(p)
            self.assertEqual(calls,['owner',('stop','--timeout','60')])
            self.assertEqual(result,{'stopped':'recette-a','resourcesDeleted':False})

RADAR={'radar':True,'radarImage':'sha256:'+'c'*64,'radarPort':3395,'radarAdminEmail':'responsable@entreprise.example'}
DANMEM={'danmem':True,'danmemImage':'sha256:'+'d'*64}
SOCLE_KEYS=['SHINKIRO_FUSEE_IMAGE','SHINKIRO_DATABASE_IMAGE','POSTGRES_PASSWORD','SHINKIRO_AUTH_SECRET','SHINKIRO_MEDIA_KEY',
            'SHINKIRO_INSTANCE','POSTGRES_DB','SHINKIRO_INSTALLATION_ID','POSTGRES_USER','SHINKIRO_ORIGIN','SHINKIRO_CANONICAL_HOST','SHINKIRO_HTTP_PORT']
COMPONENT_SECRETS=['SHINKIRO_RADAR_DB_PASSWORD','SHINKIRO_RADAR_PASSWORD','SHINKIRO_RADAR_COOKIE_SECRET','SHINKIRO_RADAR_API_KEY',
                   'SHINKIRO_RADAR_FEED_TOKEN','SHINKIRO_DANMEM_DB_PASSWORD','SHINKIRO_DANMEM_TOKEN']

def has_compose():
    import shutil,subprocess
    if not shutil.which('docker'):return False
    return subprocess.run(['docker','compose','version'],capture_output=True).returncode==0

class Composants(unittest.TestCase):
    def test_socle_without_option_keeps_its_exact_environment(self):
        with tempfile.TemporaryDirectory() as root:
            env=e.environment(e.prepare(CONFIG,Path(root)/'a'))
            self.assertEqual(list(env),SOCLE_KEYS)
            self.assertEqual(env['SHINKIRO_FUSEE_IMAGE'],e.FUSEE)

    def test_component_images_must_be_immutable_before_creation(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root)/'target'
            for bad in [{**CONFIG,**RADAR,'radarImage':'radar:latest'},{**CONFIG,**DANMEM,'danmemImage':'danmem'},
                        {**CONFIG,**RADAR,'radarImage':''},{**CONFIG,'fuseeImage':'ghcr.io/xtincell/adve-project:latest'}]:
                with self.subTest(bad=bad),self.assertRaises(ValueError):e.prepare(bad,p)
                self.assertFalse(p.exists())

    def test_radar_requires_its_own_loopback_port_and_an_owner(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root)/'target'
            for bad in [{**CONFIG,**RADAR,'radarPort':CONFIG['port']},{**CONFIG,**RADAR,'radarPort':80},{**CONFIG,**RADAR,'radarPort':'3395'},
                        {**CONFIG,**RADAR,'radarAdminEmail':''},{**CONFIG,**RADAR,'radarAdminEmail':'a@b.example\nX=1'},
                        {**CONFIG,**RADAR,'radarTimezone':'Africa/Douala;rm'}]:
                with self.subTest(bad=bad),self.assertRaises(ValueError):e.prepare(bad,p)
                self.assertFalse(p.exists())

    def test_components_receive_distinct_secrets_per_installation(self):
        with tempfile.TemporaryDirectory() as root:
            a=e.environment(e.prepare({**CONFIG,**RADAR,**DANMEM},Path(root)/'a'))
            b=e.environment(e.prepare({**CONFIG,**RADAR,**DANMEM,'instance':'recette-b'},Path(root)/'b'))
            values=[a[k] for k in COMPONENT_SECRETS+['SHINKIRO_AUTH_SECRET','POSTGRES_PASSWORD','SHINKIRO_MEDIA_KEY']]
            self.assertEqual(len(values),len(set(values)),'un secret est partagé entre deux usages')
            for key in COMPONENT_SECRETS+['SHINKIRO_RADAR_INSTANCE']:
                self.assertRegex(a[key],r'^[a-z0-9-]{32,}$');self.assertNotEqual(a[key],b[key])
            self.assertRegex(a['SHINKIRO_RADAR_INSTANCE'],r'^radar-[a-f0-9]{32}$')
            self.assertEqual(a['COMPOSE_PROFILES'],'radar,memoire')
            self.assertEqual(os.stat(Path(root)/'a'/'.env').st_mode & 0o777,0o600)

    def test_component_identity_and_keys_survive_recovery_but_not_the_docker_identity(self):
        with tempfile.TemporaryDirectory() as root:
            config={**CONFIG,**RADAR,**DANMEM,'barre':True,'barreImage':'sha256:'+'a'*64}
            old=e.environment(e.prepare(config,Path(root)/'a'))
            new=e.environment(e.prepare({**config,'instance':'recette-reprise','radarPort':3396},Path(root)/'r',old))
            for key in COMPONENT_SECRETS+['SHINKIRO_RADAR_INSTANCE','SHINKIRO_BARRE_INSTANCE','SHINKIRO_MEDIA_KEY']:self.assertEqual(new[key],old[key])
            self.assertNotEqual(new['SHINKIRO_INSTALLATION_ID'],old['SHINKIRO_INSTALLATION_ID'])
            self.assertEqual(new['SHINKIRO_RADAR_HTTP_PORT'],'3396')
            self.assertEqual(new['COMPOSE_PROFILES'],'workbench,radar,memoire')

    def test_fusee_image_option_is_digest_qualified(self):
        with tempfile.TemporaryDirectory() as root:
            image='ghcr.io/xtincell/adve-project@sha256:'+'e'*64
            env=e.environment(e.prepare({**CONFIG,'fuseeImage':image},Path(root)/'a'))
            self.assertEqual(env['SHINKIRO_FUSEE_IMAGE'],image)
            self.assertEqual(list(env),SOCLE_KEYS)

    def test_writers_cover_every_owned_component(self):
        self.assertEqual(e.writers(CONFIG),['fusee'])
        self.assertEqual(e.writers({**CONFIG,**RADAR,**DANMEM,'barre':True}),['fusee','barre','radar','danmem'])

    def extended_fixture(self,p,components=('radar','danmem')):
        Installation.backup_fixture(self,p)
        config={**CONFIG,**(RADAR if 'radar' in components else {}),**(DANMEM if 'danmem' in components else {})}
        (p/'instance.json').write_text(json.dumps(config))
        m=json.loads((p/'backup.json').read_text())
        m.update(schema=3,profile='socle-manuel-fusee-v3',components=list(components))
        m['files']['instance.json']=e.digest(p/'instance.json')
        if 'radar' in components:
            (p/'radar.dump').write_text('radar-fixture')
            (p/'radar-data.tar').write_bytes((p/'media.tar').read_bytes())
            for name in ['radar.dump','radar-data.tar']:m['files'][name]=e.digest(p/name)
            m['radarDatabaseFingerprint']={'briefs':{'rows':1,'digest':'synthetic'}}
            m['radarDataFingerprint']=e.archive_fingerprint(p/'radar-data.tar')
        if 'danmem' in components:
            (p/'danmem.dump').write_text('danmem-fixture');m['files']['danmem.dump']=e.digest(p/'danmem.dump')
            m['danmemDatabaseFingerprint']={'observations':{'rows':1,'digest':'synthetic'}}
            m['danmemExtensions']={'vector':'0.8.4'}
        e.write_json(p/'backup.json',m)
        return m

    def test_extended_backup_validates_component_files_and_profile(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root);self.extended_fixture(p)
            self.assertEqual(e.validate_backup(p)['schema'],3)
            (p/'radar-data.tar').write_bytes(b'tampered')
            with self.assertRaises(ValueError):e.validate_backup(p)

    def test_extended_backup_refuses_missing_fingerprints_or_mismatched_components(self):
        for change in [lambda m:m.pop('radarDatabaseFingerprint'),lambda m:m.pop('danmemDatabaseFingerprint'),
                       lambda m:m.pop('danmemExtensions'),lambda m:m.update(components=['radar']),
                       lambda m:m.update(components=['radar','danmem','galahad'])]:
            with self.subTest(change=change),tempfile.TemporaryDirectory() as root:
                p=Path(root);m=self.extended_fixture(p);change(m);e.write_json(p/'backup.json',m)
                with self.assertRaises(ValueError):e.validate_backup(p)

    def test_radar_files_archive_refuses_links_and_traversal(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root);m=self.extended_fixture(p,('radar',))
            with tarfile.open(p/'radar-data.tar','w') as tar:
                info=tarfile.TarInfo('./visuels/../../escape');info.size=1;tar.addfile(info,io.BytesIO(b'x'))
            m['files']['radar-data.tar']=e.digest(p/'radar-data.tar');e.write_json(p/'backup.json',m)
            with self.assertRaises(ValueError):e.validate_backup(p)

    def test_restore_of_radar_backup_requires_a_new_radar_port_before_docker(self):
        with tempfile.TemporaryDirectory() as root:
            p=Path(root);self.extended_fixture(p,('radar',))
            with patch.object(e,'run') as run:
                for port in [None,3394]:
                    with self.subTest(port=port),self.assertRaises(ValueError):e.restore(p,p/'target','restore-a','http://localhost:3394',3394,port)
                run.assert_not_called()
            self.assertFalse((p/'target').exists())

    def test_backup_freezes_every_component_and_restarts_them_on_failure(self):
        with tempfile.TemporaryDirectory() as root:
            p=e.prepare({**CONFIG,**RADAR,**DANMEM},Path(root)/'a')
            calls=[]
            with patch.object(e,'guard_ownership'),patch.object(e,'verify',return_value={}),patch.object(e,'container',return_value='c'*12),\
                 patch.object(e,'compose',side_effect=lambda _,*args,**k:calls.append(args)),\
                 patch.object(e,'database_fingerprint',side_effect=RuntimeError('dump interrompu')):
                with self.assertRaises(RuntimeError):e.backup(p,Path(root)/'b')
            self.assertEqual(calls,[('stop','fusee','radar','danmem'),('start','fusee','radar','danmem')])

@unittest.skipUnless(has_compose(),'Docker Compose absent')
class ComposeEffectif(unittest.TestCase):
    def effective(self,config,root,env=None):
        import subprocess
        p=e.prepare(config,Path(root)/config['instance'],env)
        r=subprocess.run(['docker','compose','--project-name',config['instance'],'--env-file',str(p/'.env'),'-f',str(p/'compose.yml'),'config','--format','json'],
                         capture_output=True,text=True,check=True,env={'PATH':os.environ.get('PATH','/usr/bin:/bin')})
        return json.loads(r.stdout)

    def test_options_leave_the_socle_services_untouched(self):
        with tempfile.TemporaryDirectory() as root:
            socle=self.effective(CONFIG,root)
            env=e.environment(Path(root)/CONFIG['instance'])
            full=self.effective({**CONFIG,**RADAR,**DANMEM,'instance':'recette-c'},root,env)
            self.assertEqual(sorted(socle['services']),['db','fusee'])
            self.assertEqual(sorted(socle['volumes']),['database','media'])
            self.assertEqual(sorted(socle['networks']),['ingress','private'])
            for service in ['db','fusee']:
                self.assertEqual(sorted(socle['services'][service]),sorted(full['services'][service]),service)
                for section in socle['services'][service]:
                    if section!='labels':  # seule l'identité Docker de l'installation diffère
                        self.assertEqual(json.dumps(socle['services'][service][section],sort_keys=True),
                                         json.dumps(full['services'][service][section],sort_keys=True),service+'.'+section)

    def test_components_stay_private_labelled_and_without_public_port(self):
        with tempfile.TemporaryDirectory() as root:
            full=self.effective({**CONFIG,**RADAR,**DANMEM},root)
            identity=json.loads((Path(root)/CONFIG['instance']/'instance.json').read_text())['installationId']
            self.assertEqual(sorted(full['services']),['danmem','danmem-db','danmem-migrate','db','fusee','radar','radar-db'])
            for name,service in full['services'].items():
                self.assertEqual(service['labels']['shinkiro.installation'],identity,name)
                for port in service.get('ports',[]):self.assertEqual(port['host_ip'],'127.0.0.1',name)
                if name not in ('fusee','radar'):self.assertNotIn('ports',service,name)
                self.assertRegex(service['image'],r'(?:@|^)sha256:[a-f0-9]{64}$',name)
            for name in ['radar-db','danmem-db','danmem-migrate','danmem']:
                for network in full['services'][name]['networks']:self.assertTrue(full['networks'][network].get('internal'),name+' '+network)
            # No component shares a network with La Fusée or its database.
            socle=set(full['services']['db']['networks'])|set(full['services']['fusee']['networks'])
            for name in ['radar','radar-db','danmem','danmem-db','danmem-migrate']:
                self.assertFalse(socle&set(full['services'][name]['networks']),name)
            self.assertEqual(full['networks']['radar-ingress']['driver_opts'],{'com.docker.network.bridge.enable_ip_masquerade':'false'})
            self.assertEqual(full['services']['danmem']['environment']['WORKER_ENABLED'],'false')
            # Node as PID 1 ignores SIGTERM: without an init, stop waits then kills.
            for name in ['radar','danmem']:self.assertIs(full['services'][name].get('init'),True,name)
            for volume in full['volumes'].values():self.assertEqual(volume['labels']['shinkiro.installation'],identity)
            for network in full['networks'].values():self.assertEqual(network['labels']['shinkiro.installation'],identity)

if __name__=='__main__':unittest.main()
