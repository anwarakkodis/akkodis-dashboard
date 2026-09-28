const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.setHeader('Content-Type',({'html':'text/html','css':'text/css','js':'text/javascript'})[path.extname(file).slice(1)]||'application/octet-stream');res.end(data);});}).listen(3000,'0.0.0.0',()=>console.log('Blog Studio: http://localhost:3000'));
