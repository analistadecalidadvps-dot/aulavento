/* Aula HTML v1: declarative lessons reuse the existing live-session engine. */
(function(){
'use strict';
const cache=new Map();
function parse(source){
  const doc=new DOMParser().parseFromString(source,'text/html');
  const node=doc.querySelector('script[type="application/json"][id="aula-course"]');
  if(!node)return null;
  let meta;try{meta=JSON.parse(node.textContent)}catch{throw Error('Los datos de conexión del HTML no son JSON válido.')}
  if(meta.schema!=='vento-aula-course'||meta.version!==1)throw Error('Versión de conexión HTML no compatible.');
  const sections=[...doc.querySelectorAll('main > .slide')];
  if(!Array.isArray(meta.steps)||!meta.steps.length||meta.steps.length>100||meta.steps.length!==sections.length)throw Error('Cada paso del HTML debe corresponder a una diapositiva en main.');
  return {...meta,steps:meta.steps,design:{source}};
}
function validate(design,count){
  if(!design||typeof design.source!=='string'||design.source.length>35000000)throw Error('El HTML conectado es inválido o supera 35 MB.');
  const meta=parse(design.source);
  if(!meta||meta.steps.length!==count)throw Error('El HTML y el contenido de la capacitación no coinciden.');
  return {source:design.source};
}
function prepare(course){
  const source=course.design.source;
  if(cache.has(course.id)&&cache.get(course.id).source===source)return cache.get(course.id);
  const doc=new DOMParser().parseFromString(source,'text/html');
  const sections=[...doc.querySelectorAll('main > .slide')];
  const styles=[...doc.querySelectorAll('style')].map(s=>s.textContent).join('\n');
  function clean(node){
    const copy=node.cloneNode(true);
    copy.querySelectorAll('script,iframe,object,embed,form,input,textarea,select,button,[data-private],.export-actions,#summary').forEach(n=>n.remove());
    copy.querySelectorAll('.options').forEach(n=>n.remove());
    copy.querySelectorAll('.feedback').forEach(n=>n.remove());
    copy.querySelectorAll('.answer-reading').forEach(n=>n.remove());
    [copy,...copy.querySelectorAll('*')].forEach(n=>{for(const a of [...n.attributes]){if(/^on/i.test(a.name)||/^(?:javascript|vbscript):/i.test(a.value.trim()))n.removeAttribute(a.name)}});
    copy.classList.remove('active');copy.removeAttribute('aria-hidden');
    return copy.outerHTML;
  }
  const sectionsClean=sections.map(clean);
  const header=doc.querySelector('.brand')?clean(doc.querySelector('.brand')):'';
  const entry={source,styles,sections:sectionsClean,header};cache.set(course.id,entry);return entry;
}
function documentFor(course,index){
  const p=prepare(course);if(!p.sections[index])return '';
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src &apos;none&apos;; img-src data: https:; style-src &apos;unsafe-inline&apos;; font-src data: https:; base-uri &apos;none&apos;; form-action &apos;none&apos;"><title>'+escape(course.steps[index].title)+'</title><style>'+p.styles+'\nbody{margin:0}.slide{display:block!important;min-height:calc(100vh - 75px)!important}.aula-frame-brand{padding:16px 5vw;border-bottom:1px solid #dce4df}.hero{min-height:calc(100vh - 75px)!important}.quiz{display:none!important}.notes{display:none!important}html{overflow:auto}</style></head><body><header class="aula-frame-brand">'+p.header+'</header><main>'+p.sections[index]+'</main></body></html>';
}
function mount(course,index){
  const nodes=document.querySelectorAll('iframe[data-aula-designed]');
  nodes.forEach(frame=>{const selected=Number(frame.dataset.aulaDesigned)===index;if(selected&&!frame.hasAttribute('srcdoc'))frame.srcdoc=documentFor(course,index);if(!selected)frame.removeAttribute('srcdoc')});
}
window.AulaDesign={parse,validate,documentFor,mount};
})();
