const tables={users:['id','username','password','role','reset','active'],sessions:['token','user_id','expires'],pages:['id','owner','title','blocks','updated','shared_by']};
function createSupabaseStore({url,key,fetcher=fetch}){
 if(!url||!key)throw Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env before enabling Supabase');
 const base=new URL(url);if(base.protocol!=='https:')throw Error('Supabase requires HTTPS');
 async function request(table,method='GET',params={},body,prefer){
  const target=new URL('/rest/v1/studio_'+table,base);for(const [k,v] of Object.entries(params))target.searchParams.set(k,v);
  const response=await fetcher(target,{method,headers:{apikey:key,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error(response.status===409?'Record already exists':'Supabase database request failed ('+response.status+'). Check configuration and run supabase-schema.sql.');
  return response.status===204?[]:JSON.parse(await response.text()||'[]');
 }
 return {exec(){},prepare(sql){return {async get(...args){return (await this.all(...args))[0];},async all(...args){
  if(sql.startsWith('SELECT u.* FROM sessions')){const sessions=await request('sessions','GET',{token:'eq.'+args[0],expires:'gt.'+args[1]});if(!sessions[0])return [];return request('users','GET',{id:'eq.'+sessions[0].user_id,active:'eq.1'});}
  const match=sql.match(/^SELECT (.+) FROM (users|pages|sessions)(.*)$/);if(!match)throw Error('Unsupported database query');
  const [,cols,table,tail]=match;const params={select:cols};let i=0;
  const where=tail.match(/ WHERE (.*?)(?: ORDER BY| LIMIT|$)/)?.[1];if(where)for(const term of where.split(' AND ')){const m=term.match(/^(\w+)(=|<>|>)(\?|1)$/);if(!m)throw Error('Unsupported database filter');params[m[1]]=({'=':'eq','<>':'neq','>':'gt'}[m[2]])+'.'+(m[3]==='?'?args[i++]:1);}
  const order=tail.match(/ ORDER BY (\w+)( DESC)?/);if(order)params.order=order[1]+(order[2]?'.desc':'.asc');if(tail.includes('LIMIT 1'))params.limit='1';return request(table,'GET',params);
 },async run(...args){
  let m=sql.match(/^INSERT INTO (users|sessions|pages)(?:\(([^)]+)\))? VALUES\(([^)]+)\)/);
  if(m){const [,table,columns,values]=m;let i=0;const record={};(columns?columns.split(','):tables[table]).forEach((col,n)=>record[col]=values.split(',')[n]==='?'?args[i++]:Number(values.split(',')[n]));
   if(sql.includes('ON CONFLICT')){
    // Never overwrite another owner's page, including concurrent insert attempts.
    const existing=await request(table,'GET',{id:'eq.'+record.id,select:'owner'});
    if(existing.length){if(existing[0].owner!==record.owner)throw Error('Page not found');const {id,owner,...changes}=record;return request(table,'PATCH',{id:'eq.'+id,owner:'eq.'+owner},changes);}
   }
   return request(table,'POST',{},record);
  }
  m=sql.match(/^(UPDATE (\w+) SET (.+)|DELETE FROM (\w+)) WHERE (.+)$/);if(!m)throw Error('Unsupported database write');
  const table=m[2]||m[4],params={},record={};let i=0;
  if(m[3])for(const assignment of m[3].split(',')){const [col,value]=assignment.split('=');record[col]=value==='?'?args[i++]:Number(value);}
  for(const term of m[5].split(' AND ')){const filter=term.match(/^(\w+)(=|<>)(\?)$/);if(!filter)throw Error('Unsupported database filter');params[filter[1]]=(filter[2]==='='?'eq.':'neq.')+args[i++];}
  return request(table,m[2]?'PATCH':'DELETE',params,m[2]?record:undefined);
 }}}};
}
module.exports={createSupabaseStore};
