/* Automatic slide, detail and scroll synchronization. No participant data. */
(function(){
'use strict';
let previous='',scheduled=0,locking=false,projectedDocument=null;
const docs=new WeakSet();
function windowMeet(){return window.AulaProjection?.getWindow?.()}
function frameHere(){return document.querySelector('.slide.active iframe[data-aula-designed]')}
function frameThere(){return windowMeet()?.document.querySelector('#aulaProjectStage iframe')}
function fraction(el){return el.scrollTop/Math.max(1,el.scrollHeight-el.clientHeight)}
function transferScroll(from,to){if(!to||locking)return;locking=true;to.scrollTop=fraction(from)*Math.max(0,to.scrollHeight-to.clientHeight);setTimeout(()=>{locking=false},35)}
function scrollElement(doc){return doc.scrollingElement||doc.documentElement}
function attach(doc,other){
 if(!doc||docs.has(doc))return;docs.add(doc);
 doc.addEventListener('scroll',()=>{if(locking||window.AulaProjection?.getMode?.()!=='slide')return;const dest=other();if(dest)transferScroll(scrollElement(doc),scrollElement(dest))},{passive:true,capture:true});
 doc.addEventListener('toggle',e=>{if(e.target.tagName!=='DETAILS'||locking)return;const dest=other();if(!dest)return;const index=[...doc.querySelectorAll('details')].indexOf(e.target),target=dest.querySelectorAll('details')[index];if(target&&target.open!==e.target.open){locking=true;target.open=e.target.open;setTimeout(()=>{locking=false},35)}},true);
 doc.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,button,summary'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goSlide(currentSlide+(e.key==='ArrowRight'?1:-1))}});
}
function bindFrames(){
 const here=frameHere(),there=frameThere();
 for(const frame of [here,there]){if(!frame)continue;if(!frame.dataset.flowLoad){frame.dataset.flowLoad='1';frame.addEventListener('load',bindFrames)}}
 try{attach(here?.contentDocument,()=>frameThere()?.contentDocument);attach(there?.contentDocument,()=>frameHere()?.contentDocument);if(here?.contentDocument&&there?.contentDocument){const a=here.contentDocument.querySelectorAll('details'),b=there.contentDocument.querySelectorAll('details');a.forEach((d,i)=>{if(b[i])b[i].open=d.open});transferScroll(scrollElement(here.contentDocument),scrollElement(there.contentDocument))}}catch{}
}
function sendCurrent(){if(!windowMeet()||windowMeet().closed)return;document.getElementById('aulaSendSlide')?.click();bindFrames()}
function schedule(){cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(sendCurrent)}
function projectionRendered(){
 const win=windowMeet();if(!win||win.closed)return;
 const doc=win.document;
 if(doc!==projectedDocument){projectedDocument=doc;const bar=doc.createElement('nav');bar.id='aulaMeetNavigation';bar.setAttribute('aria-label','Navegar presentación');bar.style.cssText='position:sticky;top:0;z-index:99999;display:flex;justify-content:space-between;align-items:center;padding:8px 24px;background:#f7f8f4;border-bottom:1px solid #d7e1db;font:14px Segoe UI,Arial';bar.innerHTML='<button id="flowPrevious">Anterior</button><span>VENTO Aula · Vista Meet</span><button id="flowNext">Siguiente</button>';doc.body.prepend(bar);doc.getElementById('flowPrevious').onclick=()=>goSlide(currentSlide-1);doc.getElementById('flowNext').onclick=()=>goSlide(currentSlide+1);doc.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();goSlide(currentSlide+(e.key==='ArrowRight'?1:-1))}});doc.addEventListener('scroll',()=>{if(window.AulaProjection?.getMode?.()!=='slide'||frameThere()||locking)return;const active=document.querySelector('.slide.active');if(active)transferScroll(scrollElement(doc),active)},{passive:true});}
 doc.getElementById('flowPrevious').disabled=currentSlide<=0;doc.getElementById('flowNext').disabled=currentSlide>=SLIDES.length-1;bindFrames();
}
const originalGo=goSlide;
goSlide=function(i){originalGo(i);const key=LiveWorkspace.course+':'+currentSlide;if(key!==previous){previous=key;if(windowMeet()&&!windowMeet().closed)schedule()}bindFrames()};
document.addEventListener('scroll',e=>{if(locking||frameHere()||window.AulaProjection?.getMode?.()!=='slide')return;const win=windowMeet(),active=document.querySelector('.slide.active');if(!win||win.closed||!active)return;const target=e.target;if(target===active)transferScroll(active,scrollElement(win.document))},{capture:true,passive:true});
window.AulaFlow={projectionRendered};
})();
