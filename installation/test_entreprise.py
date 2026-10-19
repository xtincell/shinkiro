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

if __name__=='__main__':unittest.main()
