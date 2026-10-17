(function(){'use strict';
function setup(){
 if(!isConsultationView()||isParticipantView())return;
 const materials=(window.AULA_DOWNLOAD_MATERIALS||[]).filter(x=>x.id==='cotizacion-oficial'&&Array.isArray(x.files)&&x.files.length&&x.files.every(f=>/^materiales\/[a-z0-9_-]+\.(xlsx|pdf)$/i.test(f.path)));
 if(!materials.length||document.getElementById('aulaDownloads'))return;
 const header=document.querySelector('.topbar');if(!header)return;
 const button=document.createElement('button');button.id='aulaDownloads';button.type='button';button.textContent='Descargas';button.title='Materiales descargables';button.setAttribute('aria-label','Materiales descargables');button.setAttribute('aria-haspopup','dialog');
 const dialog=document.createElement('dialog');dialog.setAttribute('aria-label','Materiales descargables');dialog.style.cssText='margin:auto;max-width:560px;width:90vw;max-height:85vh;overflow:auto;padding:28px;box-shadow:0 20px 70px #102d3d33;border:1px solid #d3dde7;border-radius:22px;color:#233a50';
 const title=document.createElement('h2');title.textContent='Formato oficial de cotización';title.style.cssText='font-size:28px;color:#233a50;line-height:1.2';dialog.append(title);
 const note=document.createElement('p');note.textContent='Descarga el archivo autorizado para utilizarlo en tu agencia.';note.style.marginTop='12px';dialog.append(note);
 materials.forEach(m=>m.files.forEach(f=>{const a=document.createElement('a');a.href=f.path;a.download=f.path.split('/').pop();a.textContent=f.label;a.style.cssText='display:block;margin:18px 0;padding:14px;background:#eaf4ff;color:#1769bb;border-radius:10px';dialog.append(a)}));
 const close=document.createElement('button');close.textContent='Cerrar';close.type='button';close.style.cssText='padding:10px 18px;border:1px solid #b8cee8;background:#eef4fc;color:#233a50;border-radius:10px';close.onclick=()=>dialog.close();dialog.append(close);button.onclick=()=>dialog.showModal();header.append(button);document.body.append(dialog);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
