(function(){'use strict';
function setup(){
 if(!isConsultationView()||isParticipantView())return;
 const materials=(window.AULA_DOWNLOAD_MATERIALS||[]).filter(x=>x.id==='cotizacion-oficial'&&Array.isArray(x.files)&&x.files.length&&x.files.every(f=>/^materiales\/[a-z0-9_-]+\.(xlsx|pdf)$/i.test(f.path)));
 if(!materials.length||document.getElementById('aulaDownloads'))return;
 const header=document.querySelector('.topbar');if(!header)return;
 const button=document.createElement('button');button.id='aulaDownloads';button.type='button';button.textContent='Descargas';button.title='Materiales descargables';button.setAttribute('aria-label','Materiales descargables');button.setAttribute('aria-haspopup','dialog');
 const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','Materiales descargables');dialog.style.cssText='max-width:560px;width:90vw;padding:28px;border:1px solid #d3dde7;border-radius:22px;color:#233a50';
 const title=document.createElement('h2');title.textContent='Formato oficial de cotización';dialog.append(title);
 const note=document.createElement('p');note.textContent='Descarga el archivo autorizado para utilizarlo en tu agencia.';dialog.append(note);
 materials.forEach(m=>m.files.forEach(f=>{const a=document.createElement('a');a.href=f.path;a.download=f.path.split('/').pop();a.textContent=f.label;a.style.cssText='display:block;margin:18px 0;padding:14px;background:#eaf4ff;border-radius:10px';dialog.append(a)}));
 const close=document.createElement('button');close.textContent='Cerrar';close.type='button';close.onclick=()=>dialog.close();dialog.append(close);button.onclick=()=>dialog.showModal();header.append(button);document.body.append(dialog);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
