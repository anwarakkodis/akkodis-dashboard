const fs=require('node:fs');const {DatabaseSync}=require('node:sqlite');process.loadEnvFile('.env');
(async()=>{const db=new DatabaseSync('data/studio.sqlite',{readOnly:true});const users=db.prepare('SELECT * FROM users').all();const pages=db.prepare('SELECT * FROM pages').all();db.close();
async function request(table,method='GET',body){const r=await fetch(process.env.SUPABASE_URL+'/rest/v1/studio_'+table,{method,headers:{apikey:process.env.SUPABASE_SECRET_KEY,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});if(!r.ok)throw Error(table+' request failed: '+r.status);return JSON.parse(await r.text()||'[]');}
const existing=await request('users');for(const u of users){const match=existing.find(x=>x.id===u.id||x.username===u.username);if(match&&JSON.stringify(match)!==JSON.stringify(u)){if(match.id!==u.id||match.password!==u.password)throw Error('Account conflict; migration stopped without overwrite');}if(!match)await request('users','POST',u);}
const remotePages=await request('pages');for(const p of pages){if(remotePages.some(x=>x.id===p.id))throw Error('Page conflict; migration stopped without overwrite');await request('pages','POST',p);}
const check=await request('users');if(!users.every(u=>check.some(x=>x.id===u.id&&x.password===u.password&&x.role===u.role)))throw Error('Account verification failed');
console.log('Verified migration: '+users.length+' accounts, '+pages.length+' pages. SQLite original retained.');
fs.writeFileSync('.env',fs.readFileSync('.env','utf8').replace(/^STUDIO_STORAGE=.*$/m,'STUDIO_STORAGE=supabase'));
})().catch(e=>{console.error(e.message);process.exitCode=1});
