const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation'};
const server=http.createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Method not allowed');}
 let name;try{name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname)}catch{res.writeHead(400);return res.end('Bad request');}
 const filename=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 const relative=path.relative(root,filename);
 if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(path.sep).some(p=>p.startsWith('.'))){res.writeHead(403);return res.end('Forbidden');}
 fs.stat(filename,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404);return res.end('Not found');}
  res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});
  if(req.method==='HEAD')return res.end();
  const stream=fs.createReadStream(filename);stream.on('error',()=>res.destroy());stream.pipe(res);
 });
});
server.on('error',err=>{console.error(err.code==='EADDRINUSE'?'El puerto 8766 ya está ocupado. Revisa si VENTO Aula está abierto.':err.message);process.exitCode=1});
server.listen(8766,'127.0.0.1',()=>console.log('VENTO Aula: http://127.0.0.1:8766 · Ctrl+C para detener'));
