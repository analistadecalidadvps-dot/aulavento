/* Cierre aprobado: lectura de datos, sin ejecutar código del reporte externo. */
(function(root){
'use strict';
const SOURCE='https://calidadagenciasvento-create.github.io/mystery-shopper-juniovento/';
const KEY='ventoFollowUp:lastApproved:v1';
const BASELINE='2026-09';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function monthNow(){const p=new Intl.DateTimeFormat('en',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit'}).formatToParts(new Date());return p.find(x=>x.type==='year').value+'-'+p.find(x=>x.type==='month').value}
function validate(input){
 if(!input||input.schemaVersion!==1||input.published!==true)throw Error('El cierre no está aprobado.');
 const period=input.period;if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(period)||period<BASELINE||period>monthNow())throw Error('Periodo no válido.');
 const publishedAt=input.publishedAt;if(typeof publishedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(publishedAt)||!Number.isFinite(Date.parse(publishedAt))||Date.parse(publishedAt)>Date.now()+60000)throw Error('Fecha de publicación no válida.');
 const base=input.base;if(!Number.isInteger(base)||base<10||base>100000)throw Error('Base no válida.');
 const clean=(s,max)=>{if(typeof s!=='string'||!s.trim()||s.length>max)throw Error('Texto no válido.');return s.trim()};
 if(!Array.isArray(input.top5)||input.top5.length!==5)throw Error('Se requieren cinco rubros.');
 const top5=input.top5.map((r,i)=>{if(!Number.isInteger(r.inc)||r.inc<0||r.inc>base||!Number.isInteger(r.pct)||r.pct!==Math.round(r.inc/base*100))throw Error('Conteos o porcentajes no válidos.');return{num:i+1,nombre:clean(r.nombre,180),detalle:clean(r.detalle,800),inc:r.inc,pct:r.pct}});
 if(new Set(top5.map(x=>x.nombre)).size!==5||top5.some((x,i)=>i&&x.inc>top5[i-1].inc))throw Error('Orden de rubros no válido.');
 const agencies=rows=>{if(!Array.isArray(rows)||rows.length!==10)throw Error('Se requieren diez agencias por grupo.');return rows.map(r=>{if(!Number.isFinite(r.cal)||r.cal<0||r.cal>100)throw Error('Calificación no válida.');const agencia=clean(r.agencia,180);if(!/^\d{5}\b/.test(agencia))throw Error('Código de agencia no válido.');return{agencia,cal:r.cal}})};
 const destacadas=agencies(input.destacadas),riesgo=agencies(input.riesgo);
 if(new Set([...destacadas,...riesgo].map(x=>x.agencia.match(/^\d{5}/)[0])).size!==20)throw Error('Agencias duplicadas.');
 return{schemaVersion:1,published:true,period,publishedAt,base,top5,destacadas,riesgo};
}
function parse(html){const doc=new DOMParser().parseFromString(html,'text/html');const blocks=doc.querySelectorAll('script#vento-followup-data[type="application/json"]');if(blocks.length!==1)throw Error('No se encontró un bloque de cierre único.');return validate(JSON.parse(blocks[0].textContent))}
function busy(){return !!(root.FacilitatorLive?.sessionId&&!root.LiveWorkspace?.ended)||!!root.AulaProjection?.isOpen?.()}
function apply(data){
 if(busy())return false;
 root.FOLLOWUP_PERIOD=new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(data.period+'-01T00:00:00Z')).toUpperCase();root.FOLLOWUP_BASE=data.base;
 root.FU_TOP5=data.top5.map(r=>({...r,nombre:escape(r.nombre),detalle:escape(r.detalle)}));
 root.FU_DESTACADAS=data.destacadas.map(r=>({...r,agencia:escape(r.agencia)}));root.FU_RIESGO=data.riesgo.map(r=>({...r,agencia:escape(r.agencia)}));
 for(const [id,render] of [['s_fuintro',root.slideFuIntro],['s_fucomp',root.slideFuComp]]){const node=document.getElementById(id);if(node&&render){const top=node.scrollTop;const template=document.createElement('template');template.innerHTML=render();node.innerHTML=template.content.firstElementChild.innerHTML;node.scrollTop=top}}
 root.AulaFollowUpState={period:data.period,publishedAt:data.publishedAt,source:SOURCE};return true;
}
function newer(a,b){return !b||a.period>b.period||a.period===b.period&&Date.parse(a.publishedAt)>Date.parse(b.publishedAt)}
async function load(){
 let cached=null;try{const raw=localStorage.getItem(KEY);if(raw){cached=validate(JSON.parse(raw));apply(cached)}}catch{}
 if(busy())return{state:'session-preserved'};
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{const response=await fetch(SOURCE,{cache:'no-store',credentials:'omit',signal:controller.signal});if(!response.ok)throw Error('Fuente no disponible.');const length=Number(response.headers.get('content-length'));if(length>2000000)throw Error('Reporte demasiado grande.');const text=await response.text();if(text.length>2000000)throw Error('Reporte demasiado grande.');const incoming=parse(text);if(newer(incoming,cached)){try{localStorage.setItem(KEY,JSON.stringify(incoming))}catch{}if(!apply(incoming))return{state:'next-session',period:incoming.period};return{state:'updated',period:incoming.period}}return{state:'current',period:cached?.period||BASELINE}}
 catch{return{state:'retained',period:cached?.period||BASELINE}}
 finally{clearTimeout(timer)}
}
root.AulaFollowUp={validate,parse,apply,load};
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>load());else load()}
})(typeof window!=='undefined'?window:globalThis);
