process.loadEnvFile('.env');const crypto=require('crypto'),assert=require('assert/strict');
(async()=>{const headers={apikey:process.env.SUPABASE_SECRET_KEY,'Content-Type':'application/json'};async function rest(t,method='GET',body){const r=await fetch(process.env.SUPABASE_URL+'/rest/v1/studio_'+t,{method,headers,body:body?JSON.stringify(body):undefined});assert.ok(r.ok,'Database check failed '+r.status);return JSON.parse(await r.text()||'[]');}
const [u]=await rest('users?username=eq.admin');const raw=crypto.randomBytes(32).toString('hex'),token=crypto.createHash('sha256').update(raw).digest('hex');const id=crypto.randomUUID();
try{await rest('sessions','POST',{token,user_id:u.id,expires:Date.now()+60000});let r=await fetch('http://localhost:3000/api/me',{headers:{Cookie:'studio_session='+raw}});assert.equal(r.status,200);assert.equal((await r.json()).username,'admin');
await rest('pages','POST',{id,owner:u.id,title:'Temporary connection check',blocks:'[]',updated:new Date().toISOString()});const [page]=await rest('pages?id=eq.'+id);assert.equal(page.title,'Temporary connection check');
const anon=await fetch(process.env.SUPABASE_URL+'/rest/v1/studio_users?select=id',{headers:{apikey:process.env.SUPABASE_PUBLISHABLE_KEY}});assert.ok([401,403].includes(anon.status),'Public database access must be denied');
console.log('PASS authenticated dashboard session, database write/read, and blocked public account access');
}finally{await rest('pages?id=eq.'+id,'DELETE');await rest('sessions?token=eq.'+token,'DELETE');}})().catch(e=>{console.error(e.message);process.exitCode=1});
