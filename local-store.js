// Browser-only replacement for the old server API: static logins + pages stored in this browser's localStorage.
(()=>{
const cfg=window.STUDIO_LOGINS,KEY='studio-pages-v1',SESSION='studio-session';
const fail=(status,error)=>{const e=Error(error);e.status=status;throw e;};
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return {};}};
const write=data=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch{fail(507,'Browser storage is full. Export skeleton files and delete old pages.');}};
const sha=async text=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const user=id=>({id,username:id,role:'editor'});
const current=()=>{const id=sessionStorage.getItem(SESSION);return cfg.ids.includes(id)?id:null;};
const need=()=>current()||fail(401,'Not signed in');
window.api=async(path,options={})=>{
 const method=options.method||'GET',body=options.body;
 if(path==='/api/me'){const id=need();return user(id);}
 if(path==='/api/login'){
  const id=cfg.ids.find(x=>x.toLowerCase()===String(body.username||'').trim().toLowerCase());
  if(!id||await sha(String(body.password||''))!==cfg.passwordSha256)fail(401,'Incorrect login ID or password');
  sessionStorage.setItem(SESSION,id);return user(id);
 }
 if(path==='/api/logout'){sessionStorage.removeItem(SESSION);return {ok:true};}
 const id=need(),data=read(),pages=data[id]=data[id]||[];
 if(path==='/api/users')return cfg.ids.map(user);
 if(path==='/api/pages')return [...pages].sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
 const m=path.match(/^\/api\/pages\/([a-zA-Z0-9-]+)(\/share)?$/);
 if(m){
  const pid=m[1],i=pages.findIndex(p=>p.id===pid);
  if(m[2]&&method==='POST'){
   if(i<0)fail(404,'Page not found');
   if(!cfg.ids.includes(body.userId)||body.userId===id)fail(400,'Choose another login ID');
   (data[body.userId]=data[body.userId]||[]).push({...JSON.parse(JSON.stringify(pages[i])),id:crypto.randomUUID(),updated:new Date().toISOString(),sharedBy:id});
   write(data);return {ok:true};
  }
  if(method==='PUT'){const page={id:pid,title:String(body.title||''),blocks:body.blocks||[],updated:new Date().toISOString(),sharedBy:i>=0?pages[i].sharedBy:body.sharedBy};if(i>=0)pages[i]=page;else pages.push(page);write(data);return page;}
  if(method==='DELETE'){if(i>=0)pages.splice(i,1);write(data);return {ok:true};}
 }
 fail(404,'Not found');
};
})();
