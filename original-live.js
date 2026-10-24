

function getAppBaseUrl(){
  try{
    var u=new URL(window.location.href);
    u.search="";
    u.hash="";
    return u.toString();
  }catch(e){
    return window.location.href.split("?")[0].split("#")[0];
  }
}

function getParticipantUrl() {
  var u = new URL(getAppBaseUrl());
  u.searchParams.set("participant", "1");
  return u.toString();
}
function renderQrCode(el,text,cssSize){
  if(!el||!window.QRCode)return;
  var dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));
  var gen=Math.max(320,Math.round((cssSize||200)*dpr));
  el.innerHTML="";
  var holder=document.createElement("div");
  el.appendChild(holder);
  new QRCode(holder,{text:text,width:gen,height:gen});
  var img=holder.querySelector("img");
  if(img){img.style.width=(cssSize||200)+"px";img.style.height=(cssSize||200)+"px";img.style.maxWidth="100%";img.style.display="block";img.style.margin="0 auto";img.style.imageRendering="pixelated";}
}
function initParticipantQR() {
  var input = document.getElementById("participantUrl");
  var link = getParticipantUrl();
  if (input) input.value = link;

  var hero=document.getElementById("participantQr");
  if(hero){
    hero.style.display="none";
    var hb=hero.parentNode;
    if(hb && window.QRCode){
      var old=hb.querySelector(".dynamic-qr");
      if(old)old.remove();
      var div=document.createElement("div");
      div.className="dynamic-qr";
      hb.appendChild(div);
      renderQrCode(div,link,220);

    }
  }

  var note=document.querySelector(".qr-note span");
  if(note){
    try{note.textContent="Destino: "+new URL(link).host;}catch(e){}
  }
}
function copyParticipantUrl() {
  var input = document.getElementById("participantUrl");
  if (!input) return;
  var value = input.value;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(value).then(function(){
      var btn = input.nextElementSibling;
      if (btn) { var old=btn.textContent; btn.textContent="Copiada"; setTimeout(function(){btn.textContent=old;},1400); }
    });
  } else {
    input.select();
    document.execCommand("copy");
  }
}
window.addEventListener("DOMContentLoaded", function(){ if (!isParticipantView() && !isConsultationView()) initParticipantQR(); });



// V8 · opción múltiple automática por módulo
console.info("VENTO Retro Live V10.14 · retroalimentación dinámica");

// =========================================================
// PARTICIPANT APP
// =========================================================
var PARTICIPANT_STATES = {
  WAITING: "waiting",
  OPEN_RESPONSE: "open-response",
  VALIDATION: "validation",
  MULTIPLE_CHOICE: "multiple-choice",
  RESULT: "result",
  CLOSED: "closed"
};

var ParticipantSession = {
  currentState: PARTICIPANT_STATES.WAITING,
  activeExercise: null,
  selectedChoice: null,
  validationIndex: 0
};

/*
  Esta capa está preparada para sustituirse por Supabase/Firebase.
  La implementación actual NO sincroniza entre dispositivos.
*/
var SUPABASE_URL = "https://rgpxpwsmrttdckietunr.supabase.co";
var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Tu4EzniNiS5cqqf0UeGn6w_MB80ZfV9";
var sb = null;
function getSupabaseClient(){
  if(sb && typeof sb.rpc === "function") return sb;
  var lib = window.supabase || globalThis.supabase;
  if(!lib || typeof lib.createClient !== "function") {
    throw new Error("No se pudo cargar la conexión en vivo. Verifica tu conexión a internet y vuelve a abrir la página.");
  }
  const url = "https://rgpxpwsmrttdckietunr.supabase.co";
  const key = "sb_publishable_Tu4EzniNiS5cqqf0UeGn6w_MB80ZfV9";
  if(!url || !/^https:\/\/.+\.supabase\.co$/.test(url)) {
    throw new Error("La URL de conexión de Supabase no está configurada correctamente.");
  }
  if(!key) {
    throw new Error("La clave pública de Supabase no está configurada.");
  }
  sb = lib.createClient(url, key);
  if(!sb || typeof sb.rpc !== "function") {
    throw new Error("No fue posible inicializar la conexión con Supabase. Recarga la página e inténtalo nuevamente.");
  }
  return sb;
}
var LiveContext = { sessionCode:null, sessionId:null, participantToken:null, channel:null, poll:null, acceptedResponses:[] };

function rpcData(result){ if(result.error) throw result.error; return result.data || {}; }
function normalizeRpc(v){ if(v && typeof v === "object") return v; return {}; }

var SessionService = {
  joinSession: async function(profile) {
    getSupabaseClient();
    var code = new URLSearchParams(location.search).get("session") || sessionStorage.getItem("ventoSessionCode");
    if(!code) throw new Error("El QR no contiene un código de sesión.");
    var data = normalizeRpc(rpcData(await getSupabaseClient().rpc("join_live_session", {p_session_code:code, p_name:profile.name, p_agency:profile.agency})));
    if(data.success === false) throw new Error(data.error || "No fue posible ingresar a la sesión.");
    LiveContext.sessionCode = code;
    LiveContext.participantToken = data.participant_token || data.token || data.access_token;
    LiveContext.sessionId = data.session_id || null;
    sessionStorage.setItem("participantName", profile.name);
    sessionStorage.setItem("participantAgency", profile.agency);
    sessionStorage.setItem("ventoSessionCode", code);
    if(LiveContext.participantToken) sessionStorage.setItem("ventoParticipantToken", LiveContext.participantToken);
    return data;
  },
  getActiveExercise: async function() { return await fetchParticipantState(); },
  submitResponse: async function(payload) {
    var r=await getSupabaseClient().rpc("submit_open_response", {p_session_code:LiveContext.sessionCode, p_participant_token:LiveContext.participantToken, p_answer:payload.answer});
    var d=normalizeRpc(rpcData(r));
    return {accepted:!!(d.accepted || d.success), limited:!!(d.limited || d.limit_reached || d.accepted===false), raw:d};
  },
  submitValidation: async function(payload) {
    var responseId = ParticipantSession.activeExercise && ParticipantSession.activeExercise.responseId;
    if(!responseId) throw new Error("No hay respuesta seleccionada para validar.");
    return normalizeRpc(rpcData(await getSupabaseClient().rpc("submit_validation", {p_session_code:LiveContext.sessionCode,p_participant_token:LiveContext.participantToken,p_response_id:responseId,p_verdict:payload.validation})));
  },
  submitMultipleChoice: async function(payload) {
    return normalizeRpc(rpcData(await getSupabaseClient().rpc("submit_multiple_choice", {p_session_code:LiveContext.sessionCode,p_participant_token:LiveContext.participantToken,p_answer:Object.assign({choice:payload.answer},payload.details||{})})));
  },
  subscribeToSession: function(callback) {
    LiveContext.sessionCode = LiveContext.sessionCode || new URLSearchParams(location.search).get("session") || sessionStorage.getItem("ventoSessionCode");
    LiveContext.participantToken = LiveContext.participantToken || sessionStorage.getItem("ventoParticipantToken");
    var tick=async function(){ try{ callback(await fetchParticipantState()); }catch(e){ console.error(e); } };
    tick(); LiveContext.poll=setInterval(tick,1500);
    if(sb && LiveContext.sessionCode){
      LiveContext.channel=getSupabaseClient().channel("vento-session-"+LiveContext.sessionCode).on("postgres_changes",{event:"*",schema:"public",table:"live_sessions"},tick).on("postgres_changes",{event:"*",schema:"public",table:"responses"},tick).subscribe();
    }
    return function(){ if(LiveContext.poll) clearInterval(LiveContext.poll); if(LiveContext.channel && sb) sb.removeChannel(LiveContext.channel); };
  }
};


function findLocalExerciseDefinition(ex){
  if(!ex)return null;
  var defs=[];
  if(typeof LIVE_EXERCISES==="object"&&LIVE_EXERCISES){
    Object.keys(LIVE_EXERCISES).forEach(function(k){
      var d=LIVE_EXERCISES[k];
      if(d)defs.push(d);
    });
  }
  if(typeof REINFORCEMENT_BANK==="object"&&REINFORCEMENT_BANK){
    Object.keys(REINFORCEMENT_BANK).forEach(function(k){
      (REINFORCEMENT_BANK[k]||[]).forEach(function(x){if(x)defs.push(x);});
    });
  }

  function norm(v){
    return String(v||"").toLowerCase().trim()
      .replace(/_[0-9]{8,}$/,"")
      .replace(/\s+/g," ");
  }

  var key=norm(ex.exercise_key||ex.key);
  var title=norm(ex.title);
  var question=norm(ex.question);

  return defs.find(function(d){return key && norm(d.key)===key;}) ||
         defs.find(function(d){return question && norm(d.question)===question;}) ||
         defs.find(function(d){return title && norm(d.title)===title;}) ||
         null;
}
function enrichParticipantExerciseForResult(ex,state){
  if(!ex||state!==PARTICIPANT_STATES.RESULT)return ex;
  var local=findLocalExerciseDefinition(ex);
  if(ex.correct_answer==null&&local)ex.correct_answer=local.correct;
  if((!ex.explanation)&&local)ex.explanation=local.explanation||"";
  if((!Array.isArray(ex.options)||!ex.options.length)&&local)ex.options=local.options||[];
  return ex;
}
async function fetchParticipantState(){
  if(!sb || !LiveContext.sessionCode) return {state:PARTICIPANT_STATES.WAITING,exercise:null};

  var sr=await getSupabaseClient().from("live_sessions")
    .select("id,code,state,active_exercise_id")
    .eq("code",LiveContext.sessionCode)
    .neq("state","ended")
    .maybeSingle();

  if(sr.error) throw sr.error;
  if(!sr.data) return {state:PARTICIPANT_STATES.CLOSED,exercise:null};

  LiveContext.sessionId=sr.data.id;
  var resolvedState=sr.data.state || PARTICIPANT_STATES.WAITING;

  // Cuando la facilitadora libera el resultado, usamos exclusivamente
  // la RPC segura participant_result para obtener:
  // respuesta del participante + respuesta correcta + veredicto.
  if(resolvedState===PARTICIPANT_STATES.RESULT){
    LiveContext.participantToken = LiveContext.participantToken || sessionStorage.getItem("ventoParticipantToken");

    if(!LiveContext.participantToken){
      return {
        state:PARTICIPANT_STATES.RESULT,
        exercise:{
          title:"Resultado",
          result_error:"No se encontró el token del participante."
        }
      };
    }

    var rpc=await getSupabaseClient().rpc("participant_result",{
      p_session_code:LiveContext.sessionCode,
      p_participant_token:LiveContext.participantToken
    });

    if(rpc.error) throw rpc.error;

    var result=normalizeRpc(rpc.data);
    if(result.success===false){
      return {
        state:PARTICIPANT_STATES.RESULT,
        exercise:{
          title:"Resultado",
          result_error:result.message || result.error || "No fue posible evaluar la respuesta."
        }
      };
    }

    return {
      state:PARTICIPANT_STATES.RESULT,
      exercise:{
        id:result.exercise_id || sr.data.active_exercise_id,
        title:result.title || "Actividad",
        question:result.question || "",
        options:Array.isArray(result.options) ? result.options :
          (result.options && result.options.items ? result.options.items : []),
        explanation:result.explanation || "",
        participant_answer_index:
          result.answer_index===null || result.answer_index===undefined
            ? null : Number(result.answer_index),
        participant_answer_text:result.answer_text || "",
        correct_answer:
          result.correct_index===null || result.correct_index===undefined
            ? null : Number(result.correct_index),
        correct_text:result.correct_text || "",
        is_correct:
          typeof result.is_correct==="boolean" ? result.is_correct : null,
        evaluated:result.evaluated===true,
        has_response:result.has_response===true,
        result_source:"participant_result"
      }
    };
  }

  var ex=null;
  if(sr.data.active_exercise_id){
    var er=await getSupabaseClient().from("exercises")
      .select("*")
      .eq("id",sr.data.active_exercise_id)
      .maybeSingle();
    if(!er.error) ex=er.data;
  }

  if(ex){
    ex.options = Array.isArray(ex.options)
      ? ex.options
      : (ex.options && ex.options.items ? ex.options.items : []);
  }

  if(resolvedState===PARTICIPANT_STATES.VALIDATION && ex){
    var rr=await getSupabaseClient().from("responses")
      .select("id,answer_text,accepted_slot")
      .eq("session_id",sr.data.id)
      .eq("exercise_id",ex.id)
      .eq("accepted",true)
      .order("accepted_slot");

    if(!rr.error && rr.data && rr.data.length){
      var idx=Math.min(ParticipantSession.validationIndex||0,rr.data.length-1);
      ex.response=rr.data[idx].answer_text;
      ex.responseId=rr.data[idx].id;
      ex.index=idx+1;
      ex.total=rr.data.length;
    }
  }

  return {state:resolvedState,exercise:ex};
}

function isParticipantView() {
  return !isConsultationView() && new URLSearchParams(window.location.search).get("participant") === "1";
}

function normalizeParticipantName(value) {
  var clean = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  clean = clean.replace(/[^A-Za-zÑñ\s'\-]/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
  return clean;
}

/* Todos los registros de nombre se guardan y se muestran en MAYÚSCULAS. */
function displayParticipantName(value) {
  return String(value == null ? "" : value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toUpperCase();
}

function agencySearchNorm(value){
  return String(value==null?"":value)
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^A-Za-z0-9]+/g," ").replace(/\s+/g," ").trim().toUpperCase();
}

function buildAgencyIndex(selectEl){
  var list=[];
  if(!selectEl)return list;
  Array.prototype.forEach.call(selectEl.options,function(o){
    var label=String(o.value||o.text||"").replace(/\s+/g," ").trim();
    if(!label)return;
    var m=label.match(/^(\d{3,6})\s+(.*)$/);
    list.push({
      value:o.value||label,
      label:label,
      num:m?m[1]:"",
      name:(m?m[2]:label).replace(/\s+/g," ").trim(),
      norm:agencySearchNorm(label),
      normNum:m?m[1]:"",
      normName:agencySearchNorm(m?m[2]:label)
    });
  });
  return list;
}

function filterAgencies(index,query,limit){
  var q=agencySearchNorm(query);
  if(!q)return [];
  var scored=[];
  index.forEach(function(a){
    var score=-1;
    if(a.normNum===q)score=0;
    else if(a.normName===q)score=1;
    else if(a.normNum.indexOf(q)===0)score=2;
    else if(a.normName.indexOf(q)===0)score=3;
    else if(a.norm.indexOf(q)>=0)score=4;
    if(score>=0)scored.push({a:a,score:score});
  });
  scored.sort(function(x,y){ return x.score-y.score || x.a.label.localeCompare(y.a.label,"es"); });
  return scored.slice(0,limit||10).map(function(x){return x.a;});
}

function initAgencySearch(selectEl,inputEl,suggestEl,countEl){
  if(!selectEl||!inputEl)return null;
  var index=buildAgencyIndex(selectEl);
  var matches=[],active=-1;

  function closeList(){
    if(suggestEl){suggestEl.classList.remove("open");suggestEl.innerHTML="";}
    inputEl.setAttribute("aria-expanded","false");
    active=-1;
  }
  function commit(agency){
    selectEl.value=agency;
    inputEl.value=agency||"";
    if(countEl)countEl.textContent=agency?"Agencia seleccionada: "+agency:"";
    closeList();
  }
  function paint(){
    if(!suggestEl)return;
    if(!matches.length){ closeList(); return; }
    suggestEl.innerHTML=matches.map(function(a,i){
      return '<button class="agency-suggest-item'+(i===active?' active':'')+'" data-agency="'+escapeParticipantHtml(a.value)+'" role="option" aria-selected="'+(i===active?'true':'false')+'" type="button">'+
        (a.num?'<span class="agency-suggest-num">'+escapeParticipantHtml(a.num)+'</span>':'')+
        '<span class="agency-suggest-name">'+escapeParticipantHtml(a.name)+'</span></button>';
    }).join("");
    suggestEl.classList.add("open");
    inputEl.setAttribute("aria-expanded","true");
    suggestEl.querySelectorAll(".agency-suggest-item").forEach(function(btn){
      btn.addEventListener("mousedown",function(e){ e.preventDefault(); commit(btn.getAttribute("data-agency")); });
    });
  }
  function search(){
    var q=inputEl.value.trim();
    if(selectEl.value && agencySearchNorm(selectEl.value)===agencySearchNorm(q)){ if(countEl)countEl.textContent="Agencia seleccionada: "+selectEl.value; closeList(); return; }
    selectEl.value="";
    matches=filterAgencies(index,q,10);
    active=matches.length?0:-1;
    if(countEl)countEl.textContent=q?(matches.length?(matches.length===10?"10 coincidencias (escribe más para afinar)":matches.length+" coincidencia"+(matches.length===1?"":"s")):"Sin coincidencias: escribe el número o nombre de tu agencia"):"";
    paint();
  }

  inputEl.addEventListener("input",search);
  inputEl.addEventListener("focus",function(){ if(inputEl.value.trim())search(); });
  inputEl.addEventListener("keydown",function(e){
    if(e.key==="ArrowDown"||e.key==="ArrowUp"){
      if(!matches.length)return;
      e.preventDefault();
      active=e.key==="ArrowDown"?(active+1)%matches.length:(active-1+matches.length)%matches.length;
      paint();
      var cur=suggestEl&&suggestEl.querySelector(".agency-suggest-item.active");
      if(cur)cur.scrollIntoView({block:"nearest"});
    }else if(e.key==="Enter"){
      if(matches.length&&active>=0){ e.preventDefault(); commit(matches[active].value); }
    }else if(e.key==="Escape"){
      closeList();
    }
  });
  inputEl.addEventListener("blur",function(){ setTimeout(closeList,120); });
  return {index:index,commit:commit,close:closeList};
}

function initParticipantApp() {
  document.body.classList.add("participant-view");

  var login = document.getElementById("participantLogin");
  var session = document.getElementById("participantSession");
  var btn = document.getElementById("participantJoinBtn");

  if (!login || !session || !btn) return;

  var savedName = sessionStorage.getItem("participantName") || "";
  var savedAgency = sessionStorage.getItem("participantAgency") || "";

  var nameInput = document.getElementById("participantNameInput");
  var agencyInput = document.getElementById("participantAgencyInput");
  var agencySearch = document.getElementById("participantAgencySearch");
  var agencySuggest = document.getElementById("agencySuggest");
  var agencyCount = document.getElementById("agencyCount");
  if (savedName) nameInput.value = normalizeParticipantName(savedName);
  if (savedAgency) agencyInput.value = savedAgency;

  var agencyPicker = initAgencySearch(agencyInput,agencySearch,agencySuggest,agencyCount);
  if (agencyPicker && savedAgency && agencyInput.value){
    if (agencySearch) agencySearch.value = savedAgency;
    if (agencyCount) agencyCount.textContent = "Agencia seleccionada: " + savedAgency;
  }

  function forceUpper(input){
    var pos=input.selectionStart,val=input.value,up=normalizeParticipantName(val);
    if(up!==val){ input.value=up; try{input.setSelectionRange(pos,pos);}catch(e){} }
  }
  nameInput.addEventListener("input",function(){ forceUpper(nameInput); });
  nameInput.addEventListener("blur", function(){ nameInput.value = normalizeParticipantName(nameInput.value); });
  nameInput.addEventListener("change", function(){ nameInput.value = normalizeParticipantName(nameInput.value); });

  btn.addEventListener("click", function() {
    var name = normalizeParticipantName(nameInput.value);
    nameInput.value = name;
    var agency = agencyInput.value.trim();
    var error = document.getElementById("participantLoginError");

    if (!name) {
      error.textContent = "Escribe tu nombre para continuar.";
      return;
    }
    if (!agency) {
      var typed = agencySearch ? agencySearch.value.trim() : "";
      error.textContent = typed
        ? "Elige tu agencia de la lista de coincidencias antes de continuar."
        : "Escribe el número o nombre de tu agencia para continuar.";
      if (typed && agencyPicker) {
        var exact = filterAgencies(agencyPicker.index,typed,2);
        if (exact.length === 1) agencyPicker.commit(exact[0].value);
        else if (agencySearch) agencySearch.focus();
      }
      return;
    }
    error.textContent = "";

    btn.disabled = true;
    SessionService.joinSession({ name: name, agency: agency }).then(function() {
      enterParticipantSession(name, agency);
    }).catch(function(err){ error.textContent = err.message || "No fue posible ingresar."; }).finally(function(){ btn.disabled=false; });
  });
}

function enterParticipantSession(name, agency) {
  document.getElementById("participantLogin").hidden = true;
  document.getElementById("participantSession").hidden = false;

  var chip = document.getElementById("participantUserChip");
  chip.hidden = false;
  document.getElementById("participantUserName").textContent = displayParticipantName(name);
  document.getElementById("participantUserAgency").textContent = agency;

  SessionService.subscribeToSession(function(sessionState) {
    var nextState = sessionState.state || PARTICIPANT_STATES.WAITING;
    var nextExercise = sessionState.exercise || null;
    var prevExerciseId = ParticipantSession.activeExercise && ParticipantSession.activeExercise.id;
    var nextExerciseId = nextExercise && nextExercise.id;
    var stateChanged = ParticipantSession.currentState !== nextState;
    var exerciseChanged = prevExerciseId !== nextExerciseId;
    ParticipantSession.currentState = nextState;
    ParticipantSession.activeExercise = nextExercise;
    if (stateChanged || exerciseChanged || !document.getElementById("participantStateHost").hasChildNodes()) {
      ParticipantSession.selectedChoice = nextExerciseId ? getSavedParticipantChoice(nextExerciseId) : null;
      renderParticipantState(nextState);
    }
  });
}

function renderParticipantState(state) {
  var host = document.getElementById("participantStateHost");
  if (!host) return;

  if (state === PARTICIPANT_STATES.OPEN_RESPONSE) {
    // V8: las dinámicas nuevas son de opción múltiple. Si una sesión antigua conserva
    // el estado abierto, evitamos mostrar un campo de texto que pueda borrarse al refrescar.
    if (ParticipantSession.activeExercise && ParticipantSession.activeExercise.options && ParticipantSession.activeExercise.options.length) {
      renderParticipantMultipleChoice(host);
    } else {
      renderParticipantWaiting(host);
    }
    return;
  }
  if (state === PARTICIPANT_STATES.VALIDATION) {
    renderParticipantValidation(host);
    return;
  }
  if (state === PARTICIPANT_STATES.MULTIPLE_CHOICE) {
    renderParticipantMultipleChoice(host);
    return;
  }
  if (state === PARTICIPANT_STATES.RESULT) {
    renderParticipantResult(host);
    return;
  }
  if (state === PARTICIPANT_STATES.CLOSED) {
    renderParticipantClosed(host);
    return;
  }
  renderParticipantWaiting(host);
}

function renderParticipantWaiting(host) {
  host.innerHTML =
    '<div class="participant-wait">' +
      '<div class="participant-pulse"></div>' +
      '<div class="participant-status"><span class="participant-dot"></span> Sesión en curso</div>' +
      '<h2>Espera la siguiente dinámica</h2>' +
      '<p>La facilitadora habilitará la siguiente actividad en esta misma pantalla.</p>' +
      '<div class="participant-note">No necesitas actualizar la página. Las actividades aparecerán automáticamente cuando el facilitador las habilite.</div>' +
    '</div>';
}

function renderParticipantOpenResponse(host) {
  var ex = ParticipantSession.activeExercise || {
    title: "Reto · Sondeo",
    prompt: "Un cliente comenta que tarda casi dos horas para llegar al trabajo y termina agotado.",
    question: "¿Cuál identificarías como problema interno?"
  };

  host.innerHTML =
    '<div class="participant-kicker">' + escapeParticipantHtml(ex.title || "Actividad") + '</div>' +
    '<h2>' + escapeParticipantHtml(ex.prompt || "") + '</h2>' +
    '<div class="participant-question">' + escapeParticipantHtml(ex.question || "") + '</div>' +
    '<textarea class="participant-textarea" id="participantOpenText" placeholder="Escribe tu respuesta..."></textarea>' +
    '<button class="participant-primary" id="participantOpenSubmit" type="button" onclick="submitOpenResponse()">Enviar respuesta</button>' +
    '<div id="participantOpenFeedback"></div>';
}

function submitOpenResponse() {
  var field = document.getElementById("participantOpenText");
  var btn = document.getElementById("participantOpenSubmit");
  var feedback = document.getElementById("participantOpenFeedback");
  if (!field || !field.value.trim()) return;

  field.disabled = true;
  btn.disabled = true;

  SessionService.submitResponse({
    participant: sessionStorage.getItem("participantName"),
    agency: sessionStorage.getItem("participantAgency"),
    exercise: ParticipantSession.activeExercise,
    answer: field.value.trim()
  }).then(function(result) {
    feedback.innerHTML = '<div class="participant-confirm">Respuesta enviada.</div>';
    logParticipantActivity(ParticipantSession.activeExercise, null, field.value.trim());
    if (result && result.accepted) handleResponseAccepted();
    if (result && result.limited) handleResponseLimitReached();
  });
}

function handleResponseAccepted() {
  var feedback = document.getElementById("participantOpenFeedback");
  if (feedback) feedback.innerHTML += '<div class="participant-note">Tu respuesta quedó registrada. Cuando exista backend real, aquí se indicará si fue una de las primeras 5 aceptadas.</div>';
}

function handleResponseLimitReached() {
  var feedback = document.getElementById("participantOpenFeedback");
  if (feedback) feedback.innerHTML += '<div class="participant-note">Ya tenemos las 5 respuestas. Ahora participa en la validación grupal.</div>';
}

function renderParticipantValidation(host) {
  var ex = ParticipantSession.activeExercise || {
    title: "Validación grupal",
    response: "Creo que el problema es que usa transporte público.",
    index: 1,
    total: 5
  };

  host.innerHTML =
    '<div class="participant-kicker">' + escapeParticipantHtml(ex.title || "Validación grupal") + '</div>' +
    '<h2>Respuesta ' + (ex.index || 1) + ' de ' + (ex.total || 5) + '</h2>' +
    '<div class="participant-validation-card">' + escapeParticipantHtml(ex.response || "") + '</div>' +
    '<div class="participant-question">¿Cómo evaluarías esta respuesta?</div>' +
    '<div class="participant-choices">' +
      validationChoice("correct", "Correcta") +
      validationChoice("partial", "Parcialmente correcta") +
      validationChoice("incorrect", "Incorrecta") +
    '</div>' +
    '<button class="participant-primary" id="participantValidationSubmit" type="button" onclick="submitValidation()" disabled>Enviar validación</button>';
}

function validationChoice(value, label) {
  return '<button class="participant-choice" type="button" data-validation="' + value + '" onclick="selectValidation(this)"><span>' + label + '</span></button>';
}

function selectValidation(btn) {
  document.querySelectorAll("[data-validation]").forEach(function(b){ b.classList.remove("selected"); });
  btn.classList.add("selected");
  ParticipantSession.selectedChoice = btn.dataset.validation;
  document.getElementById("participantValidationSubmit").disabled = false;
}

function submitValidation() {
  if (!ParticipantSession.selectedChoice) return;
  var btn = document.getElementById("participantValidationSubmit");
  btn.disabled = true;

  SessionService.submitValidation({
    participant: sessionStorage.getItem("participantName"),
    validation: ParticipantSession.selectedChoice
  }).then(function() {
    var host = document.getElementById("participantStateHost");
    host.innerHTML += '<div class="participant-confirm">Validación enviada.</div>';
  });
}


function participantAnswerKey(exerciseId){return "ventoAnswer:"+(exerciseId||"unknown");}

function exerciseIdentity(ex){
  if(!ex)return "";
  return String(ex.id||ex.exercise_key||ex.key||ex.title||ex.question||"");
}

function saveParticipantChoice(exerciseId, choice, ex){
  try{
    sessionStorage.setItem(participantAnswerKey(exerciseId), String(choice));
    sessionStorage.setItem("ventoLastParticipantAnswer", JSON.stringify({
      exerciseId:String(exerciseId||""),
      identity:exerciseIdentity(ex||ParticipantSession.activeExercise),
      choice:Number(choice)
    }));
  }catch(e){}
}

/* Bitácora local del participante: conserva nombre, agencia, tiempo de
   respuesta, respuesta y fecha de cada actividad, aunque se cierre el
   navegador o se pierda la conexión con el servidor. */
function participantResultsKey(){return "ventoParticipantResults:"+(LiveContext.sessionCode||sessionStorage.getItem("ventoSessionCode")||"sin-sesion");}
function getParticipantResults(){
  try{var raw=localStorage.getItem(participantResultsKey());var list=raw?JSON.parse(raw):[];return Array.isArray(list)?list:[];}catch(e){return [];}
}
function participantActivityElapsedSeconds(ex){
  try{
    var duration=liveExerciseDuration(ex);
    var remaining=participantRemainingSeconds(ex);
    var elapsed=duration-remaining;
    if(isFinite(elapsed)&&elapsed>=0)return Math.round(elapsed);
  }catch(e){}
  return null;
}
function recordParticipantResult(entry){
  try{
    var list=getParticipantResults();
    var key=String(entry.exerciseId||"");
    if(key) list=list.filter(function(x){return String(x.exerciseId||"")!==key;});
    list.push(entry);
    localStorage.setItem(participantResultsKey(),JSON.stringify(list));
  }catch(e){}
}
function participantAnswerLabel(ex,index){
  var opts=ex&&Array.isArray(ex.options)?ex.options:[];
  if(Number.isInteger(index)&&opts[index]!=null)return String.fromCharCode(65+index)+". "+opts[index];
  return "—";
}
function logParticipantActivity(ex,answerIndex,answerText){
  try{
    var act=ex||ParticipantSession.activeExercise||{};
    recordParticipantResult({
      exerciseId:act.id!=null?String(act.id):exerciseIdentity(act),
      activity:act.title||"Actividad",
      name:displayParticipantName(sessionStorage.getItem("participantName")),
      agency:sessionStorage.getItem("participantAgency")||"—",
      answerIndex:Number.isInteger(answerIndex)?answerIndex:null,
      answer:answerText||"—",
      elapsedSeconds:participantActivityElapsedSeconds(act),
      session:LiveContext.sessionCode||sessionStorage.getItem("ventoSessionCode")||"",
      recordedAt:new Date().toISOString()
    });
  }catch(e){}
}

function getSavedParticipantChoice(exerciseId, ex){
  try{
    var raw=sessionStorage.getItem(participantAnswerKey(exerciseId));
    if(raw!==null){
      var direct=Number(raw);
      if(Number.isInteger(direct))return direct;
    }

    // Respaldo: conserva la última respuesta aunque el objeto de ejercicio
    // cambie ligeramente al pasar de multiple-choice -> waiting -> result.
    var lastRaw=sessionStorage.getItem("ventoLastParticipantAnswer");
    if(lastRaw){
      var last=JSON.parse(lastRaw);
      var currentIdentity=exerciseIdentity(ex||ParticipantSession.activeExercise);
      var sameId=String(last.exerciseId||"")===String(exerciseId||"");
      var sameIdentity=last.identity && currentIdentity && String(last.identity)===String(currentIdentity);
      if((sameId||sameIdentity) && Number.isInteger(Number(last.choice))) return Number(last.choice);
    }
    return null;
  }catch(e){return null;}
}
function parseCorrectChoice(value){
  var ca=value;
  if(ca==null)return null;
  if(typeof ca==="string"){
    try{ca=JSON.parse(ca)}catch(e){
      var n=Number(ca); return Number.isInteger(n)?n:null;
    }
  }
  if(typeof ca==="number")return Number.isInteger(ca)?ca:null;
  if(ca && typeof ca==="object"){
    if(ca.choice!=null)return Number(ca.choice);
    if(ca.index!=null)return Number(ca.index);
    if(ca.answer!=null)return Number(ca.answer);
  }
  return null;
}

function renderParticipantMultipleChoice(host) {
  var ex = ParticipantSession.activeExercise || {
    title: "Pregunta en vivo",
    question: "¿Cuál de estos corresponde a un problema interno?",
    options: ["Tipo de terreno", "Cansancio y frustración", "Horario de salida", "Distancia recorrida"]
  };

  var savedChoice = getSavedParticipantChoice(ex.id, ex);
  ParticipantSession.selectedChoice = savedChoice;

  var options = (ex.options || []).map(function(opt, i) {
    var wasSelected = savedChoice===i;
    return '<button class="participant-choice'+(wasSelected?' selected sent-choice':'')+'" type="button" data-mc="' + i + '" onclick="selectParticipantMC(this)"'+(savedChoice!==null?' disabled':'')+'>' +
      '<span class="letter">' + String.fromCharCode(65+i) + '</span><span>' + escapeParticipantHtml(opt) + '</span></button>';
  }).join("");

  host.innerHTML =
    '<div class="learning-tag">Actividad de refuerzo</div>' +
    '<div class="participant-kicker">' + escapeParticipantHtml(ex.title || "Pregunta") + '</div>' +
    (ex.prompt ? '<div class="participant-note" style="margin-bottom:12px">' + escapeParticipantHtml(ex.prompt) + '</div>' : '') +
    '<div class="participant-question">' + escapeParticipantHtml(ex.question || "") + '</div>' +
    '<div class="participant-choices">' + options + '</div>' +
    '<button class="participant-primary" id="participantMCSubmit" type="button" onclick="submitMultipleChoice()" disabled>'+(savedChoice===null?'Enviar respuesta':'Respuesta registrada')+'</button>' +
    (savedChoice!==null?'<div class="participant-pending-eval" id="participantSentConfirm">'+
      '<div class="participant-pending-head"><span class="participant-pending-dot"></span>Respuesta recibida · pendiente de evaluación</div>'+
      '<div class="participant-pending-copy"><strong>Esto no significa que sea correcta.</strong> El resultado aparecerá cuando la facilitadora lo muestre.</div>'+
    '</div>':'');
}

function selectParticipantMC(btn) {
  document.querySelectorAll("[data-mc]").forEach(function(b){ b.classList.remove("selected"); });
  btn.classList.add("selected");
  ParticipantSession.selectedChoice = Number(btn.dataset.mc);
  document.getElementById("participantMCSubmit").disabled = false;
}

function submitMultipleChoice() {
  if (ParticipantSession.selectedChoice === null) return;
  var btn = document.getElementById("participantMCSubmit");
  btn.disabled = true;
  var choices = document.querySelectorAll("[data-mc]");
  choices.forEach(function(choice){ choice.disabled = true; if(Number(choice.dataset.mc)===ParticipantSession.selectedChoice) choice.classList.add("sent-choice"); });

  SessionService.submitMultipleChoice({
    participant: sessionStorage.getItem("participantName"),
    answer: ParticipantSession.selectedChoice
  }).then(function() {
    if(ParticipantSession.activeExercise && ParticipantSession.activeExercise.id){
      saveParticipantChoice(ParticipantSession.activeExercise.id, ParticipantSession.selectedChoice, ParticipantSession.activeExercise);
    }
    logParticipantActivity(ParticipantSession.activeExercise, ParticipantSession.selectedChoice, participantAnswerLabel(ParticipantSession.activeExercise, ParticipantSession.selectedChoice));
    var host=document.getElementById("participantStateHost");
    var existing=document.getElementById("participantSentConfirm");
    if(!existing){
      var div=document.createElement("div");
      div.id="participantSentConfirm";
      div.className="participant-pending-eval";
      div.innerHTML='<div class="participant-pending-head"><span class="participant-pending-dot"></span>Respuesta recibida · pendiente de evaluación</div>'+
        '<div class="participant-pending-copy"><strong>Esto no significa que sea correcta.</strong> El resultado aparecerá cuando la facilitadora lo muestre.</div>';
      host.appendChild(div);
    }
  }).catch(function(err){
    btn.disabled=false; choices.forEach(function(choice){choice.disabled=false});
    var host=document.getElementById("participantStateHost");
    var div=document.createElement("div");div.className="participant-error";div.textContent=err.message||"No fue posible registrar la respuesta.";host.appendChild(div);
  });
}

function renderParticipantResult(host) {
  var ex = ParticipantSession.activeExercise || {};

  if(ex.result_error){
    host.innerHTML =
      '<div class="participant-kicker">Resultado</div>'+
      '<div class="participant-pending-eval">'+
        '<div class="participant-pending-head"><span class="participant-pending-dot"></span>No fue posible evaluar esta respuesta</div>'+
        '<div class="participant-pending-copy">'+escapeParticipantHtml(ex.result_error)+'</div>'+
      '</div>';
    return;
  }

  if(ex.evaluated!==true || ex.has_response!==true){
    host.innerHTML =
      '<div class="participant-kicker">Resultado</div>'+
      '<div class="participant-pending-eval">'+
        '<div class="participant-pending-head"><span class="participant-pending-dot"></span>Respuesta pendiente de evaluación</div>'+
        '<div class="participant-pending-copy">Tu respuesta fue registrada, pero todavía no existe un resultado disponible.</div>'+
      '</div>';
    return;
  }

  var options=Array.isArray(ex.options)?ex.options:[];
  var selected=Number.isInteger(Number(ex.participant_answer_index))
    ? Number(ex.participant_answer_index)
    : null;
  var correct=Number.isInteger(Number(ex.correct_answer))
    ? Number(ex.correct_answer)
    : null;
  var isCorrect = ex.is_correct===true;
  var hasVerdict = typeof ex.is_correct==="boolean";

  var selectedText = ex.participant_answer_text ||
    (selected!==null && options[selected]!=null ? options[selected] : "");
  var correctText = ex.correct_text ||
    (correct!==null && options[correct]!=null ? options[correct] : "");

  if(!hasVerdict){
    host.innerHTML =
      '<div class="participant-kicker">Resultado</div>'+
      '<div class="participant-pending-eval">'+
        '<div class="participant-pending-head"><span class="participant-pending-dot"></span>No fue posible comparar las respuestas</div>'+
        '<div class="participant-pending-copy">La actividad llegó a resultado, pero Supabase no devolvió un veredicto correcto/incorrecto.</div>'+
      '</div>';
    return;
  }

  var verdictHtml = isCorrect
    ? '<div class="motivation-card correct">'+
        '<div class="motivation-emoji">🏆 🤩</div>'+
        '<div class="motivation-title">¡Respuesta correcta!</div>'+
        '<div class="motivation-text">Identificaste correctamente el criterio. Sigue aplicándolo así en tus interacciones.</div>'+
      '</div>'
    : '<div class="motivation-card incorrect">'+
        '<div class="motivation-emoji">😔</div>'+
        '<div class="motivation-title">Respuesta incorrecta</div>'+
        '<div class="motivation-text">Revisa la respuesta correcta y úsala como referencia para la siguiente actividad.</div>'+
      '</div>';

  var choicesHtml=options.map(function(opt,i){
    var cls="participant-choice";
    if(correct!==null && i===correct) cls+=" answer-correct";
    if(!isCorrect && selected!==null && i===selected) cls+=" answer-incorrect";
    return '<div class="'+cls+'" style="cursor:default">'+
      '<span class="letter">'+String.fromCharCode(65+i)+'</span>'+
      '<span>'+escapeParticipantHtml(opt)+'</span>'+
    '</div>';
  }).join("");

  host.innerHTML =
    '<div class="participant-kicker">Resultado de tu respuesta</div>'+
    '<h2>'+escapeParticipantHtml(ex.title||"Actividad")+'</h2>'+
    verdictHtml+
    '<div class="participant-result-answer '+(isCorrect?'correct':'incorrect')+'" style="margin-top:14px">'+
      '<div class="participant-result-choice"><strong>Tu respuesta:</strong> '+
        escapeParticipantHtml(selectedText || "Respuesta registrada")+
      '</div>'+
      (!isCorrect
        ? '<div class="participant-correct-choice"><strong>Respuesta correcta:</strong> '+
            escapeParticipantHtml(correctText || "Consulta el criterio con la facilitadora")+
          '</div>'
        : '')+
    '</div>'+
    (choicesHtml
      ? '<div class="participant-choices" style="margin-top:14px">'+choicesHtml+'</div>'
      : '')+
    (ex.explanation
      ? '<div class="participant-confirm" style="margin-top:14px"><strong>¿Por qué?</strong><br>'+
          escapeParticipantHtml(ex.explanation)+
        '</div>'
      : '');
}

function renderParticipantClosed(host) {
  host.innerHTML =
    '<div class="participant-wait">' +
      '<div class="participant-status">Sesi\u00f3n finalizada</div>' +
      '<h2>Gracias por participar</h2>' +
      '<p>Esta sesi\u00f3n ya termin\u00f3, as\u00ed que no hay m\u00e1s actividades por responder. Puedes cerrar esta pantalla.</p>' +
    '</div>';
}

function escapeParticipantHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =========================================================
// V8 · DINAMICAS AUTOMATICAS POR MODULO
// =========================================================
// =========================================================
// V10.12 · BANCO NACIONAL DE ESCENARIOS
// Escenarios distintos a la presentación · México
// Sin cronómetro · conserva la lógica Supabase estable
// =========================================================

var LIVE_EXERCISES = {"mod01":{"key":"plan-exito-nacional","title":"Reto · Plan de Éxito","prompt":"En una agencia de una ciudad fronteriza, una clienta llega por primera vez y comenta que todavía está comparando modelos y formas de pago.","question":"¿Cuál es la mejor manera de iniciar el acompañamiento?","options":["Mostrar primero los modelos con mayor promoción","Explicar que se buscará el modelo adecuado, se revisará cómo ajustarlo a su presupuesto y se explicarán las alternativas de protección","Preguntar cuánto puede pagar al mes antes de explicar el proceso","Comenzar directamente con las especificaciones del modelo más vendido"],"correct":1,"explanation":"El Plan de Éxito debe comunicarse al inicio y orientar la conversación alrededor de modelo ideal, presupuesto y protección."},"mod02":{"key":"sondeo-localidad","title":"Reto · Sondeo","prompt":"Una clienta comenta: “Vivo en una localidad a unos 35 minutos de aquí y casi todos mis movimientos son entre mi comunidad y la cabecera.”","question":"¿Qué problema externo podemos afirmar con esa información?","options":["Tiene dificultades de transporte","Necesita una motocicleta resistente","Gasta demasiado en trasladarse","Todavía no podemos afirmar que exista un problema; debemos profundizar"],"correct":3,"explanation":"La localidad, la distancia y el tipo de recorrido son contexto. El asesor debe profundizar antes de convertirlos en un problema."},"mod03":{"key":"script-zona-metropolitana","title":"Reto · Script Maestro","prompt":"En una zona metropolitana, el cliente explica que pierde mucho tiempo esperando conexiones entre distintos transportes y quiere tener mayor autonomía para llegar al trabajo.","question":"¿Cuál argumento aplica mejor el Script Maestro?","options":["Este modelo tiene un diseño deportivo y tablero digital.","Como quieres depender menos de las conexiones de transporte, este modelo puede darte mayor autonomía en tus traslados; revisemos además si sus características se ajustan al recorrido que haces.","Es uno de los modelos que más vendemos en esta ciudad.","Te conviene porque aquí hay mucho tráfico."],"correct":1,"explanation":"El argumento debe partir de una necesidad expresada por el cliente, no de una generalización sobre la ciudad, y vincularla con un beneficio relevante."},"mod04":{"key":"ventec-conectividad-v2","title":"Reto · VENTEC","prompt":"Una clienta ve el distintivo VENTEC en la motocicleta y pregunta: «¿Qué es y para qué me sirve?».","question":"¿Qué explicación corresponde a VENTEC?","options":["Es el nombre de todas las características de iluminación de la motocicleta.","Es tecnología que conecta casco, teléfono y motocicleta; explico sus funciones y aprovecho para ofrecer un casco.","Es una cobertura de seguro contra accidentes.","Basta con mencionar que incluye VENTEC, sin explicar qué aporta."],"correct":1,"explanation":"VENTEC debe explicarse como tecnología de conectividad entre casco, teléfono y motocicleta. No se confunde con iluminación, garantía o seguro. Además de explicar qué aporta, se aprovecha la conversación para ofrecer un casco."},"mod05":{"key":"garantia-primer-comprador","title":"Reto · Garantía","prompt":"En una agencia del Bajío, un cliente que comprará su primera motocicleta pregunta qué respaldo tendrá después de llevársela y cuándo debe regresar a servicio.","question":"¿Cuál explicación es la más completa?","options":["Tiene 3 años de garantía.","La garantía es de hasta 33,000 km.","Cuenta con 3 años o 33,000 km de garantía y el primer servicio corresponde a los 30 días o 300 km.","El servicio y la garantía se explican únicamente después del pago."],"correct":2,"explanation":"La propuesta debe integrar el respaldo de 3 años o 33,000 km y el primer servicio a los 30 días o 300 km."},"mod06":{"key":"poliza-zona-comercial","title":"Reto · Póliza contra robo con violencia","prompt":"Una clienta que utiliza su motocicleta para desplazarse a distintos puntos de venta comenta que le preocupa proteger la inversión que está por realizar.","question":"¿Cómo debe integrarse la póliza a la conversación?","options":["Prometiendo que cualquier robo estará cubierto","Explicando su cobertura y condiciones como parte de la propuesta de protección, vinculándola con la preocupación que la clienta expresó","Sustituyendo con ella la explicación de garantía","Mencionándola únicamente después de cerrar la venta"],"correct":1,"explanation":"La póliza puede fortalecer la propuesta de valor cuando responde a una preocupación real, pero debe explicarse sin promesas absolutas."},"mod07":{"key":"ana-carretera","title":"Reto · Seguro ANA","prompt":"Un cliente comenta que parte de sus recorridos habituales son por carretera y pregunta qué opciones existen para protegerse ante un accidente.","question":"¿Cuál es la mejor respuesta del asesor?","options":["Decir que la garantía ya cubre cualquier accidente","Explicar qué protección ofrece el Seguro ANA y sus condiciones, diferenciándolo de garantía y póliza contra robo","Asegurar que con el seguro no tendrá gastos","Evitar el tema hasta que haya pagado"],"correct":1,"explanation":"La necesidad fue expresada por el cliente. El asesor debe explicar el Seguro ANA y diferenciar correctamente cada mecanismo de protección."},"mod08":{"key":"quote-builder-cotizacion","title":"Arma la cotización · Cierre transicional","prompt":"La clienta Andrea Hernández está interesada en una HYPER 310 y solicita una cotización para revisar el presupuesto familiar. Completa los cinco datos indispensables de la cotización.","question":"Coloca cada dato en el campo correcto.","options":["Cotización incompleta","Cotización completa"],"correct":1,"explanation":"La cotización debe incluir vigencia de 3 días desde la emisión, nombre de la persona a quien se dirige, vendedor y contacto, forma de pago con su desglose y modelo de la motocicleta.","kind":"quote-builder","quote":{"slots":[{"id":"vigencia","label":"Fecha / vigencia","correct":"q_vigencia"},{"id":"cliente","label":"Presupuesto para","correct":"q_cliente"},{"id":"vendedor","label":"Vendedor / contacto","correct":"q_vendedor"},{"id":"pago","label":"Forma de pago","correct":"q_pago"},{"id":"modelo","label":"Modelo","correct":"q_modelo"}],"cards":[{"id":"q_vigencia","text":"Emisión 11/09/2026 · Vigencia 14/09/2026"},{"id":"q_cliente","text":"Andrea Hernández"},{"id":"q_vendedor","text":"Carlos Ramírez · 55 0000 0000"},{"id":"q_pago","text":"Contado · Total $38,999.00"},{"id":"q_modelo","text":"HYPER 310"},{"id":"d_vigencia","text":"Emisión 11/09/2026 · Vigencia 16/09/2026"},{"id":"d_vendedor","text":"Carlos Ramírez"},{"id":"d_pago","text":"Crédito · por definir"}]}},"mod09":{"key":"pilot-localidad","title":"Reto · Bitácora y PILOT","prompt":"Un cliente de una localidad cercana comenta que volverá a la cabecera municipal el próximo viernes y pide que lo contacten ese día para revisar disponibilidad.","question":"¿Qué debe hacer el asesor para asegurar continuidad?","options":["Recordarlo de memoria","Guardar el número únicamente en su teléfono","Registrar la gestión en PILOT y programar la tarea de seguimiento para la fecha acordada","Esperar a que el cliente visite nuevamente la agencia"],"correct":2,"explanation":"El acuerdo debe quedar registrado en PILOT con una siguiente acción concreta para conservar trazabilidad."},"casoFinal":{"key":"final-nacional","title":"Reto final · Integración","prompt":"En una ciudad turística, un cliente que permanecerá varios meses en México explica que busca una motocicleta para sus recorridos cotidianos. Conoce poco de motocicletas y quiere entender bien qué opción se ajusta a su uso y presupuesto.","question":"¿Cuál secuencia de atención es más sólida?","options":["Mostrar el modelo más vendido → precio → cierre","Plan de Éxito → sondeo para identificar necesidades reales → vincular producto/VENTEC → explicar protección → cierre y registro","Preguntar su nacionalidad → elegir modelo → financiamiento","Promociones → características técnicas → pedir apartado"],"correct":1,"explanation":"El contexto del cliente no sustituye el proceso. La atención debe descubrir necesidades reales, construir valor relevante, explicar protección y dejar trazabilidad."}};
var REINFORCEMENT_BANK = {"mod01":[{"key":"plan-exito-zona-turistica","title":"Refuerzo · Plan de Éxito · Zona turística","prompt":"En una zona turística, un cliente comenta que no conoce bien la oferta de motocicletas y quiere comparar antes de decidir.","question":"¿Qué apertura ordena mejor la conversación?","options":["Primero te enseño las promociones.","Vamos a identificar qué modelo se ajusta mejor a lo que necesitas, revisar tu presupuesto y explicarte las alternativas de protección.","¿Cuánto dinero traes hoy?","Te voy a mostrar nuestro modelo más vendido."],"correct":1,"explanation":"El Plan de Éxito establece desde el inicio cómo se acompañará la decisión, sin asumir necesidades por el lugar donde se encuentra la agencia."},{"key":"plan-exito-ciudad-media","title":"Refuerzo · Plan de Éxito · Cliente explorando","prompt":"En una ciudad media, un cliente entra diciendo: “Quiero conocer opciones porque sería mi primera moto.”","question":"¿Qué debe ocurrir antes de comenzar a recomendar modelos?","options":["Presentar el Plan de Éxito","Mostrar la motocicleta de menor precio","Explicar únicamente VENTO CREDIT","Solicitar un apartado"],"correct":0,"explanation":"Antes de explorar necesidades y producto, el asesor debe explicar el acompañamiento mediante el Plan de Éxito."}],"mod02":[{"key":"sondeo-reservado","title":"Refuerzo · Sondeo · Cliente reservado","prompt":"Un cliente está explorando opciones, pero responde de forma breve. Dice que la moto sería para uso personal y que todavía está revisando qué le conviene.","question":"¿Qué debería hacer el asesor?","options":["Asumir que busca economía","Hacer preguntas más concretas y sencillas que le ayuden a describir situaciones reales de uso","Dejar de sondear porque responde poco","Recomendar el modelo con mayor cilindrada"],"correct":1,"explanation":"El cliente sigue explorando. El asesor puede adaptar el sondeo para facilitar respuestas, sin inventar necesidades ni convertir respuestas breves en rechazo."},{"key":"sondeo-rural","title":"Refuerzo · Sondeo · Camino y contexto","prompt":"Un cliente comenta: “Vivo fuera de la cabecera y parte del camino hacia mi casa no está pavimentado.”","question":"¿Cuál es la lectura correcta?","options":["Su problema es el terreno","Necesita automáticamente una motocicleta doble propósito","Es información de contexto que debe profundizarse para conocer qué dificultad concreta le genera","Su problema interno es la inseguridad"],"correct":2,"explanation":"El tipo de camino es un factor de uso. Debe investigarse qué ocurre realmente antes de definir un problema."}],"mod03":[{"key":"script-reparto","title":"Refuerzo · Script Maestro · Trabajo independiente","prompt":"Un cliente que trabaja por su cuenta explica que hace varios recorridos al día y que el gasto frecuente de traslado reduce lo que gana.","question":"¿Qué argumento está mejor construido?","options":["Este modelo tiene tanque de 10 litros.","Como buscas cuidar lo que gastas en tus recorridos diarios, revisemos el rendimiento de este modelo y cómo podría ayudarte a optimizar consumo según el uso que nos comentaste.","Es la moto ideal para repartidores.","Todos los que trabajan por su cuenta compran este modelo."],"correct":1,"explanation":"Se vincula una característica con una necesidad expresada, sin generalizar por la ocupación del cliente."},{"key":"script-no-asumir-turismo","title":"Refuerzo · Script Maestro · Evita suposiciones","prompt":"Una persona extranjera que vive temporalmente en una zona turística pregunta por una motocicleta. Aún no ha explicado qué dificultad busca resolver.","question":"¿Qué debe evitar el asesor?","options":["Preguntar por sus recorridos","Explorar su experiencia con motocicletas","Asumir que necesita un modelo específico por ser extranjero o estar en una zona turística","Preguntar qué espera de su compra"],"correct":2,"explanation":"La procedencia y el contexto geográfico no determinan por sí mismos una necesidad. La recomendación debe partir del sondeo."}],"mod04":[{"key":"ventec-diferenciar-protecciones-v2","title":"Refuerzo · VENTEC · Diferencia los conceptos","prompt":"Un cliente pregunta si VENTEC es lo mismo que la garantía o el Seguro ANA.","question":"¿Cómo aclaras la diferencia?","options":["Le digo que los tres son seguros.","Explico que VENTEC es conectividad y presento garantía y seguro por separado, con sus condiciones.","Le digo que VENTEC cubre cualquier falla.","Evito explicarlo y cambio de tema."],"correct":1,"explanation":"VENTEC se explica como conectividad. Garantía y seguro son conceptos distintos y deben presentarse por separado, sin prometer beneficios que no correspondan."},{"key":"ventec-explicacion-casco-v2","title":"Refuerzo · VENTEC · Explica y ofrece el casco","prompt":"Después de explicar VENTEC, el cliente pregunta cómo aprovecharlo y comenta que todavía no tiene casco.","question":"¿Qué siguiente paso es adecuado?","options":["Prometer que cualquier dispositivo funciona sin revisar sus condiciones.","Terminar la explicación sin ofrecer ayuda.","Explicar las funciones y condiciones de uso que correspondan y ofrecer una opción de casco, verificando la información del producto.","Decir que el casco sustituye la póliza contra robo."],"correct":2,"explanation":"La conversación debe explicar VENTEC con información confirmada y aprovechar la venta cruzada de casco. No se aseguran funciones o compatibilidades sin verificarlas."}],"mod05":[{"key":"garantia-desconfianza","title":"Refuerzo · Garantía · Cliente cuidadoso","prompt":"Un cliente comenta que antes de comprar quiere entender qué respaldo tendrá si surge algún inconveniente con la motocicleta.","question":"¿Qué enfoque genera mayor confianza?","options":["Decir que nunca tendrá problemas","Explicar claramente garantía, vigencia y primer servicio, sin prometer coberturas inexistentes","Evitar detalles para no complicar la venta","Hablar solo del precio del servicio"],"correct":1,"explanation":"La claridad sobre el respaldo postventa reduce incertidumbre sin generar expectativas incorrectas."},{"key":"garantia-servicio","title":"Refuerzo · Garantía · Primer servicio","prompt":"Una clienta vive en una localidad y pregunta cuándo tendría que organizar su primera visita de servicio después de la compra.","question":"¿Qué dato debe quedar claro?","options":["Únicamente que tiene garantía","Primer servicio a los 30 días o 300 km, además de explicar la garantía aplicable","Que puede regresar cuando lo considere necesario","Que el primer servicio no tiene relación con el respaldo postventa"],"correct":1,"explanation":"La información operativa del primer servicio forma parte de una explicación completa del respaldo postventa."}],"mod06":[{"key":"poliza-experiencia-previa","title":"Refuerzo · Póliza · Preocupación explícita","prompt":"Un cliente comenta: “Ya tuve una moto y me la robaron; por eso ahora me preocupa mucho proteger lo que voy a comprar.”","question":"¿Qué debe hacer el asesor?","options":["Prometer que no perderá su inversión","Explicar correctamente la póliza, sus condiciones y cómo se integra a la propuesta de protección","Evitar hablar de robo","Decir únicamente que VENTO incluye póliza"],"correct":1,"explanation":"La preocupación es real y explícita. La póliza debe explicarse con precisión y sin promesas absolutas."},{"key":"poliza-sin-preocupacion","title":"Refuerzo · Póliza · Propuesta de valor","prompt":"El cliente no ha expresado una experiencia previa de robo, pero el asesor debe explicar la propuesta de protección de la compra.","question":"¿Cuál es el enfoque correcto?","options":["Inventar un riesgo para generar urgencia","Explicar la póliza y sus condiciones como parte de la propuesta de valor, sin atribuir al cliente un miedo que no expresó","Omitirla por completo","Garantizar cobertura total"],"correct":1,"explanation":"La póliza puede explicarse como parte de la propuesta sin fabricar una necesidad emocional inexistente."}],"mod07":[{"key":"ana-primer-comprador","title":"Refuerzo · Seguro ANA · Diferencia conceptos","prompt":"Un cliente que comprará su primera motocicleta pregunta si garantía, póliza contra robo y seguro son lo mismo.","question":"¿Qué debe hacer el asesor?","options":["Simplificar diciendo que todos protegen lo mismo","Explicar la función y diferencias de cada alternativa","Hablar únicamente de garantía","Elegir una opción por el cliente"],"correct":1,"explanation":"Diferenciar los mecanismos de protección evita expectativas incorrectas y permite una decisión informada."},{"key":"ana-zona-metropolitana","title":"Refuerzo · Seguro ANA · Necesidad expresada","prompt":"Una clienta comenta que le preocupa la posibilidad de sufrir un accidente durante sus recorridos diarios y pregunta qué alternativas existen.","question":"¿Cuál es la mejor transición?","options":["Como te preocupa ese riesgo, revisemos qué ofrece el Seguro ANA y sus condiciones para que valores si responde a lo que necesitas.","Todos deberían contratarlo.","Con el seguro no tendrás ningún problema.","Lo revisamos después de pagar."],"correct":0,"explanation":"La recomendación parte de una preocupación expresada y explica la alternativa sin asegurar resultados."}],"mod08":[{"key":"cierre-pareja","title":"Refuerzo · Cierre · Próximo compromiso","prompt":"Un cliente sigue interesado, pero necesita revisar la propuesta con su pareja antes de tomar una decisión.","question":"¿Qué cierre transicional es más sólido?","options":["Aquí estamos cuando gustes.","Acordar un momento concreto para retomar la conversación y dejarle la información necesaria para revisarla","Cerrar el lead","Insistir en que decida en ese momento"],"correct":1,"explanation":"El siguiente paso debe ser específico y facilitar la continuidad de una decisión que sigue abierta."},{"key":"cierre-comparacion","title":"Refuerzo · Cierre · Comparación pendiente","prompt":"Una clienta está comparando dos opciones y pide una cotización para revisar diferencias con calma.","question":"¿Qué debe buscar el asesor al cerrar esta interacción?","options":["Forzar una decisión inmediata","Entregar la información relevante y acordar el siguiente contacto para resolver la comparación","Eliminar una de las opciones sin consultarle","Esperar indefinidamente"],"correct":1,"explanation":"La comparación aún está abierta; un cierre transicional debe convertirla en un siguiente compromiso concreto."}],"mod09":[{"key":"pilot-zona-turistica","title":"Refuerzo · PILOT · Cliente temporal","prompt":"Un cliente que estará varios meses en una zona turística pide que lo contacten el lunes porque ese día definirá su presupuesto.","question":"¿Qué asegura la continuidad?","options":["Guardar su número en el celular","Registrar la gestión y programar en PILOT la tarea para el lunes","Esperar a que vuelva a la agencia","Enviar información sin registrar nada"],"correct":1,"explanation":"La trazabilidad debe mantenerse aunque el cliente esté temporalmente en la zona."},{"key":"pilot-seguimiento","title":"Refuerzo · PILOT · Acuerdo concreto","prompt":"Una clienta pide que la contacten después de su quincena y acuerda con el asesor hablar el próximo miércoles por la tarde.","question":"¿Cuál registro es más útil?","options":["Interesada","Pendiente","Registrar la gestión y crear una tarea de seguimiento asociada al acuerdo del miércoles","Cerrar el lead hasta que tenga dinero"],"correct":2,"explanation":"PILOT debe reflejar el acuerdo real y la próxima acción para que el seguimiento sea gestionable."}],"casoFinal":[{"key":"final-localidad","title":"Refuerzo final · Localidad","prompt":"Una clienta vive en una localidad, se desplaza varias veces por semana a la cabecera y está evaluando su primera motocicleta. Todavía no ha explicado qué dificultades le generan esos traslados.","question":"¿Cuál es el siguiente paso más sólido?","options":["Recomendar una moto para caminos difíciles","Profundizar el sondeo antes de vincular características o beneficios","Asumir que busca ahorrar combustible","Presentar primero la póliza"],"correct":1,"explanation":"El contexto geográfico no sustituye la identificación de problemas reales. Primero debe profundizarse el sondeo."},{"key":"final-cliente-reservado","title":"Refuerzo final · Cliente reservado","prompt":"Un cliente está comparando opciones y participa poco en la conversación. Confirma que todavía quiere conocer qué alternativa podría ajustarse mejor a sus recorridos y presupuesto.","question":"¿Cuál actuación demuestra mejor adaptación de la metodología?","options":["Abandonar el sondeo","Hacer preguntas concretas, escuchar sus respuestas y construir la recomendación únicamente con necesidades que él confirme","Asumir que su prioridad es precio","Presentar todas las características para compensar la falta de información"],"correct":1,"explanation":"El asesor debe facilitar la conversación sin inventar necesidades. El escenario mantiene al cliente en exploración para evaluar la calidad del sondeo."}]};

var AutoLiveExercise={sectionId:"mod01",activityIndex:0};

var NATIONAL_SCENARIO_META={
  mod01:{contextos:["frontera","zona turística","ciudad media"],competencia:"encuadre"},
  mod02:{contextos:["localidad","cliente reservado","zona rural"],competencia:"sondeo"},
  mod03:{contextos:["metrópoli","trabajo independiente","zona turística"],competencia:"vinculación"},
  mod04:{contextos:["zona industrial","lluvia","distancia"],competencia:"VENTEC"},
  mod05:{contextos:["primer comprador","cliente cuidadoso","localidad"],competencia:"postventa"},
  mod06:{contextos:["movilidad comercial","experiencia previa","propuesta de valor"],competencia:"protección"},
  mod07:{contextos:["carretera","primer comprador","metrópoli"],competencia:"seguro"},
  mod08:{contextos:["presupuesto familiar","pareja","comparación"],competencia:"cierre"},
  mod09:{contextos:["localidad","zona turística","seguimiento"],competencia:"trazabilidad"},
  casoFinal:{contextos:["zona turística","localidad","cliente reservado"],competencia:"integración"}
};

function getModuleExerciseList(sectionId){
  var base = LIVE_EXERCISES[sectionId] || LIVE_EXERCISES.mod01;
  var extra = REINFORCEMENT_BANK[sectionId] || [];
  return [base].concat(extra);
}
function getCurrentLiveExercise(){
  var list=getModuleExerciseList(AutoLiveExercise.sectionId);
  var idx=Math.max(0,Math.min(AutoLiveExercise.activityIndex,list.length-1));
  AutoLiveExercise.activityIndex=idx;
  return list[idx];
}
function loadCurrentLiveExercise(){
  var ex=getCurrentLiveExercise(); if(!ex)return;
  var list=getModuleExerciseList(AutoLiveExercise.sectionId);
  var detected=document.getElementById("liveDetectedModule"); if(detected) detected.textContent=(LIVE_EXERCISES[AutoLiveExercise.sectionId]||LIVE_EXERCISES.mod01).title.replace(/^Reto\s*·\s*/,"");
  var counter=document.getElementById("liveActivityIndex"); if(counter) counter.textContent="Actividad "+(AutoLiveExercise.activityIndex+1)+" de "+list.length;
  var title=document.getElementById("liveExerciseTitle"),prompt=document.getElementById("liveExercisePrompt"),question=document.getElementById("liveExerciseQuestion"),options=document.getElementById("liveExerciseOptions"),correct=document.getElementById("liveCorrectAnswer"),exp=document.getElementById("liveExplanation");
  if(title)title.value=ex.title;if(prompt)prompt.value=ex.prompt||"";if(question)question.value=ex.question;if(options)options.value=ex.options.join("\n");if(correct)correct.value=String(ex.correct);if(exp)exp.value=ex.explanation||"";
  var launch=document.getElementById("launchExerciseBtn");
  if(launch) launch.textContent="Lanzar · "+ex.title.replace(/^Reto[:·]?\s*/i,"");
}
function changeReinforcement(delta){
  var list=getModuleExerciseList(AutoLiveExercise.sectionId);
  AutoLiveExercise.activityIndex=(AutoLiveExercise.activityIndex+delta+list.length)%list.length;
  loadCurrentLiveExercise();
}

function setDetectedModule(id,force){
  if(!LIVE_EXERCISES[id]) return;
  var changed=AutoLiveExercise.sectionId!==id;
  if(changed || force){
    AutoLiveExercise.sectionId=id;
    if(changed) AutoLiveExercise.activityIndex=0;
    loadCurrentLiveExercise();
    document.querySelectorAll("[data-live-current='true']").forEach(function(el){el.removeAttribute("data-live-current")});
    var sec=document.getElementById(id);
    if(sec) sec.setAttribute("data-live-current","true");
  }
}

var _moduleDetectRaf=0;
function detectModuleFromViewport(){
  if(_moduleDetectRaf) return;
  _moduleDetectRaf=requestAnimationFrame(function(){
    _moduleDetectRaf=0;
    var ids=Object.keys(LIVE_EXERCISES);
    var anchor=Math.max(130,Math.min(window.innerHeight*.38,360));
    var best=null,bestDist=Infinity;
    ids.forEach(function(id){
      var el=document.getElementById(id);
      if(!el)return;
      var r=el.getBoundingClientRect();
      if(r.bottom<90 || r.top>window.innerHeight*.88)return;
      var inside=(r.top<=anchor && r.bottom>=anchor);
      var dist=inside?0:Math.min(Math.abs(r.top-anchor),Math.abs(r.bottom-anchor));
      if(dist<bestDist){bestDist=dist;best=id;}
    });
    if(best) setDetectedModule(best);
  });
}

function initAutoLiveExercises(){
  loadCurrentLiveExercise();
  window.addEventListener("scroll",detectModuleFromViewport,{passive:true});
  window.addEventListener("resize",detectModuleFromViewport,{passive:true});

  document.querySelectorAll('a[href^="#"],button[onclick*="goToSection"]').forEach(function(el){
    el.addEventListener("click",function(){
      var href=el.getAttribute("href")||"";
      var oc=el.getAttribute("onclick")||"";
      var m=href.match(/^#(mod\d+|casoFinal)$/) || oc.match(/goToSection\('(mod\d+|casoFinal)'\)/);
      if(m && m[1]) setDetectedModule(m[1],true);
      setTimeout(detectModuleFromViewport,180);
      setTimeout(detectModuleFromViewport,650);
    });
  });

  document.querySelectorAll('[onclick*="openChal"]').forEach(function(btn){
    btn.addEventListener("click",function(){
      var m=(btn.getAttribute("onclick")||"").match(/openChal\('(mod\d+)'\)/);
      if(m) setDetectedModule(m[1],true);
    });
  });

  window.addEventListener("hashchange",function(){
    var id=(location.hash||"").replace("#","");
    if(LIVE_EXERCISES[id]) setDetectedModule(id,true);
  });

  setTimeout(detectModuleFromViewport,100);
}



var _actionToastTimer=null;
function showActionToast(message){
  var t=document.getElementById("actionToast");
  if(!t)return;
  t.textContent=message||"";
  t.classList.add("show");
  clearTimeout(_actionToastTimer);
  _actionToastTimer=setTimeout(function(){t.classList.remove("show")},2200);
}

var FacilitatorLive={accessToken:null,sessionId:null,sessionCode:null,snapshotTimer:null};
function liveError(msg){ var e=document.getElementById("livePanelError"); if(e)e.textContent=msg||""; }

function setLivePanelOpen(open){
  var tools=document.getElementById("fabP");
  if(open && tools) tools.classList.remove("open");
  var panel=document.getElementById("liveControlPanel");
  var btn=document.getElementById("livePanelToggle");
  if(!panel||!btn)return;
  panel.classList.toggle("live-panel-hidden",!open);
  panel.classList.toggle("open",!!open);
  btn.classList.toggle("panel-open",!!open);
  btn.setAttribute("aria-expanded",open?"true":"false");
  var txt=document.getElementById("livePanelToggleText");
  if(txt) txt.textContent=open?"Ocultar sesión":"Sesión en vivo";
}

function updateLivePanelToggle(){
  var btn=document.getElementById("livePanelToggle");
  if(!btn)return;
  btn.classList.toggle("session-active",!!(FacilitatorLive&&FacilitatorLive.sessionId));
}

function initFacilitatorApp(){
  if(isConsultationView())return;
  setTimeout(function(){setLivePanelOpen(false);updateLivePanelToggle();},0);
  try{ getSupabaseClient(); }catch(e){ var le=document.getElementById("facLoginError"); if(le) le.textContent=e.message; }
  var overlay=document.getElementById("facilitatorLoginOverlay"), toggle=document.getElementById("livePanelToggle"), panel=document.getElementById("liveControlPanel");
  document.getElementById("facLoginBtn").onclick=facilitatorLogin;
  document.getElementById("facPin").addEventListener("keydown",function(e){if(e.key==="Enter")facilitatorLogin();});
  document.getElementById("facLogoutBtn").onclick=facilitatorLogout;
  document.getElementById("createSessionBtn").onclick=createLiveSession; document.getElementById("copyLiveLink").onclick=copyLiveParticipantLink;
  document.getElementById("prevReinforcementBtn").onclick=function(){changeReinforcement(-1)}; document.getElementById("nextReinforcementBtn").onclick=function(){changeReinforcement(1)};
  document.getElementById("livePanelToggle").onclick=function(){
    var btn=document.getElementById("livePanelToggle");
    var isOpen=btn && btn.getAttribute("aria-expanded")==="true";
    setLivePanelOpen(!isOpen);
  };
  document.getElementById("launchExerciseBtn").onclick=launchLiveExercise; document.getElementById("closeVotingBtn").onclick=closeLiveVoting;
  document.getElementById("stateResultBtn").onclick=function(){setLiveState("result")}; document.getElementById("stateWaitingBtn").onclick=function(){setLiveState("waiting")};
  document.getElementById("endLiveSessionBtn").onclick=endLiveSession; var recoverBtn=document.getElementById("recoverLiveSessionBtn");if(recoverBtn)recoverBtn.onclick=recoverLiveSession;
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"){
      var b=document.getElementById("livePanelToggle");
      if(b && b.getAttribute("aria-expanded")==="true") setLivePanelOpen(false);
    }
  });
  initAutoLiveExercises();
  var saved=sessionStorage.getItem("ventoFacilitatorToken"); if(saved){FacilitatorLive.accessToken=saved; overlay.style.display="none"; toggle.hidden=false; document.getElementById("facDisplayName").textContent=sessionStorage.getItem("ventoFacilitatorName")||"Facilitador";setLivePanelOpen(false);}
}
async function facilitatorLogin(){
  var u=document.getElementById("facUser").value.trim(),p=document.getElementById("facPin").value,e=document.getElementById("facLoginError"),b=document.getElementById("facLoginBtn"); if(!u||!p){e.textContent="Escribe usuario y PIN.";return} b.disabled=true;e.textContent="";
  try{var d=normalizeRpc(rpcData(await getSupabaseClient().rpc("facilitator_login",{p_username:u,p_pin:p})));if(d.success===false)throw new Error(d.error||"Acceso incorrecto"); FacilitatorLive.accessToken=d.access_token;sessionStorage.setItem("ventoFacilitatorToken",d.access_token);sessionStorage.setItem("ventoFacilitatorName",d.display_name||u);document.getElementById("facDisplayName").textContent=d.display_name||u;document.getElementById("facilitatorLoginOverlay").style.display="none";document.getElementById("livePanelToggle").hidden=false;setLivePanelOpen(true);updateLivePanelToggle();showActionToast("Acceso de facilitador correcto.");}catch(err){e.textContent=err.message||"No fue posible iniciar sesión."}finally{b.disabled=false;document.getElementById("facPin").value=""}
}

async function recoverLiveSession(){
  var btn=document.getElementById("recoverLiveSessionBtn");
  if(btn){btn.disabled=true;btn.textContent="Sincronizando...";}
  try{
    if(!FacilitatorLive.accessToken)throw new Error("Inicia sesión como facilitador.");
    if(!FacilitatorLive.sessionId){
      var savedId=sessionStorage.getItem("ventoLiveSessionId");
      var savedCode=sessionStorage.getItem("ventoLiveSessionCode");
      if(savedId){FacilitatorLive.sessionId=savedId;FacilitatorLive.sessionCode=savedCode||"";}
    }
    if(!FacilitatorLive.sessionId)throw new Error("No hay una sesión activa para recuperar.");
    await refreshSnapshot();
    try{await loadParticipantRegistry();}catch(e){}
    showActionToast("Sesión sincronizada.");
  }catch(e){
    liveError(e.message||"No fue posible recuperar la sesión.");
  }finally{
    if(btn){btn.disabled=false;btn.textContent="Recuperar / sincronizar sesión";}
  }
}

async function facilitatorLogout(){try{if(FacilitatorLive.accessToken)await getSupabaseClient().rpc("facilitator_logout",{p_access_token:FacilitatorLive.accessToken})}catch(e){} sessionStorage.removeItem("ventoFacilitatorToken");sessionStorage.removeItem("ventoFacilitatorName");location.reload()}
async function createLiveSession(){
  liveError("");try{var title=document.getElementById("liveSessionTitle").value.trim()||"Retroalimentación Masiva";var d=normalizeRpc(rpcData(await getSupabaseClient().rpc("create_live_session",{p_access_token:FacilitatorLive.accessToken,p_title:title})));if(d.success===false)throw new Error(d.error);FacilitatorLive.sessionId=d.session_id||d.id;FacilitatorLive.sessionCode=d.code||d.session_code;sessionStorage.setItem("ventoLiveSessionId",FacilitatorLive.sessionId||"");sessionStorage.setItem("ventoLiveSessionCode",FacilitatorLive.sessionCode||"");if(!FacilitatorLive.sessionId||!FacilitatorLive.sessionCode)throw new Error("La sesión se creó, pero la respuesta no incluyó ID/código.");showLiveSession();updateLivePanelToggle();setLivePanelOpen(true);startSnapshot();showActionToast("Sesión creada. El QR ya está disponible.");}catch(e){liveError(e.message)}
}
function showLiveSession(){document.getElementById("liveCreateBlock").hidden=true;document.getElementById("liveActiveBlock").hidden=false;document.getElementById("liveCode").textContent=FacilitatorLive.sessionCode;var u=new URL(getAppBaseUrl());u.searchParams.set("participant","1");u.searchParams.set("session",FacilitatorLive.sessionCode);var link=u.toString();document.getElementById("liveParticipantLink").textContent=link;var pUrl=document.getElementById("participantUrl");if(pUrl)pUrl.value=link;var q=document.getElementById("liveQrBox");q.innerHTML="";renderQrCode(q,link,200);var hero=document.getElementById("participantQr");if(hero)hero.style.display="none";var hb=hero&&hero.parentNode;if(hb&&window.QRCode){var old=hb.querySelector(".dynamic-qr");if(old)old.remove();var div=document.createElement("div");div.className="dynamic-qr";hb.appendChild(div);renderQrCode(div,link,220);}}
function copyTextFallback(value){
  var el=document.createElement("textarea");
  el.value=value;el.setAttribute("readonly","");el.style.position="fixed";el.style.top="0";el.style.left="-9999px";el.style.opacity="0";
  document.body.appendChild(el);
  var ok=false;
  try{el.focus();el.select();if(typeof el.setSelectionRange==="function")el.setSelectionRange(0,value.length);ok=document.execCommand("copy")===true;}catch(e){ok=false;}
  try{document.body.removeChild(el);}catch(e2){}
  return ok;
}
function copyLiveParticipantLink(){
  var value=document.getElementById("liveParticipantLink").textContent;
  function copied(){showActionToast("Liga copiada.");}
  function fallback(){if(copyTextFallback(value)){copied();return;}showActionToast("No fue posible copiar automáticamente.");}
  try{
    if(navigator.clipboard&&typeof navigator.clipboard.writeText==="function"){navigator.clipboard.writeText(value).then(copied).catch(fallback);return;}
  }catch(e){}
  fallback();
}
async function launchLiveExercise(){
  liveError("");
  var launchBtn=document.getElementById("launchExerciseBtn");
  if(launchBtn)launchBtn.disabled=true;
  try{
    if(!FacilitatorLive.sessionId) throw new Error("Primero crea una sesión en vivo.");
    var ex = getCurrentLiveExercise();
    if(!ex) throw new Error("No se encontró una dinámica para el módulo actual.");
    var args={
      p_access_token:FacilitatorLive.accessToken,
      p_session_id:FacilitatorLive.sessionId,
      p_exercise_key:ex.key+"_"+Date.now(),
      p_type:"multiple-choice",
      p_title:ex.title,
      p_prompt:ex.prompt||"",
      p_question:ex.question,
      p_options:ex.options,
      p_correct_answer:ex.correct,
      p_explanation:ex.explanation||""
    };
    var d=normalizeRpc(rpcData(await getSupabaseClient().rpc("facilitator_launch_exercise",args)));
    if(d.success===false) throw new Error(d.error||"No se pudo lanzar la actividad");
    FacilitatorLive.lastLaunchedExerciseId=d.exercise_id||d.exercise?.id||null;
    startSnapshot();
    showActionToast("Actividad enviada a los participantes.");
    startLiveCountdown(liveExerciseDuration(ex));
  }catch(e){liveError(e.message||"No se pudo lanzar la actividad");}
  finally{if(launchBtn)launchBtn.disabled=false;}
}


async function closeLiveVoting(){
  liveError("");
  try{
    if(!FacilitatorLive.sessionId) throw new Error("Primero crea una sesión.");
    var d=normalizeRpc(rpcData(await getSupabaseClient().rpc("facilitator_set_state",{
      p_access_token:FacilitatorLive.accessToken,
      p_session_id:FacilitatorLive.sessionId,
      p_state:"waiting"
    })));
    if(d.success===false) throw new Error(d.error||"No fue posible cerrar la votación.");
    document.getElementById("liveSessionStatus").textContent="Votación cerrada · resultados listos para revisar";
    await refreshSnapshot();
  }catch(e){liveError(e.message||"No fue posible cerrar la votación.");}
}

function extractChoiceIndex(row){
  var v=row && row.answer_json;
  if(v==null && row) v=row.answer;
  if(typeof v==="string"){
    try{v=JSON.parse(v)}catch(e){
      var n=Number(v); return Number.isFinite(n)?n:null;
    }
  }
  if(typeof v==="number") return v;
  if(v && typeof v==="object"){
    if(v.choice!=null) return Number(v.choice);
    if(v.answer!=null) return Number(v.answer);
    if(v.index!=null) return Number(v.index);
  }
  return null;
}

function renderLiveDistribution(options, rows, correctIndex, reveal){
  var host=document.getElementById("liveResponseSummary");
  if(!host)return;
  options=Array.isArray(options)?options:[];
  rows=Array.isArray(rows)?rows:[];
  if(!options.length){
    host.innerHTML='<div class="live-muted">La actividad actual no tiene opciones configuradas.</div>';
    return;
  }
  var counts=options.map(function(){return 0});
  rows.forEach(function(r){
    var idx=extractChoiceIndex(r);
    if(Number.isInteger(idx) && idx>=0 && idx<counts.length) counts[idx]++;
  });
  var total=counts.reduce(function(a,b){return a+b},0);
  host.innerHTML='<div class="live-answer-summary">'+options.map(function(opt,i){
    var pct=total?Math.round((counts[i]/total)*100):0;
    var criterion=(reveal && i===correctIndex)?' · Criterio correcto':'';
    return '<div class="live-answer-row">'+
      '<div class="live-answer-head"><span class="live-answer-label">'+String.fromCharCode(65+i)+'. '+escapeParticipantHtml(opt)+criterion+'</span><span class="live-answer-pct">'+counts[i]+' · '+pct+'%</span></div>'+
      '<div class="live-answer-track"><div class="live-answer-fill" style="width:'+pct+'%"></div></div>'+
      '</div>';
  }).join('')+'</div>';
}

async function setLiveState(state){
  liveError("");
  var btn=document.getElementById("stateResultBtn");
  if(state==="result" && btn){btn.disabled=true;btn.textContent="Publicando...";}
  try{
    if(!FacilitatorLive.sessionId) throw new Error("Primero crea una sesión.");
    var d=normalizeRpc(rpcData(await getSupabaseClient().rpc("facilitator_set_state",{
      p_access_token:FacilitatorLive.accessToken,
      p_session_id:FacilitatorLive.sessionId,
      p_state:state
    })));
    if(d && d.success===false) throw new Error(d.error||"No fue posible cambiar el estado.");
    await refreshSnapshot();
    if(state==="result"){showActionToast("Resultado enviado a los participantes.");document.getElementById("liveSessionStatus").textContent="Resultado visible en celulares";}
  }catch(e){
    liveError(e.message||"No fue posible cambiar el estado.");
  }finally{
    if(btn){btn.disabled=false;btn.textContent="Mostrar resultado";}
  }
}
async function endLiveSession(){if(!confirm("¿Finalizar esta sesión en vivo?"))return;try{await getSupabaseClient().rpc("facilitator_end_session",{p_access_token:FacilitatorLive.accessToken,p_session_id:FacilitatorLive.sessionId});if(FacilitatorLive.snapshotTimer)clearInterval(FacilitatorLive.snapshotTimer);document.getElementById("liveSessionStatus").textContent="Sesión finalizada";document.getElementById("liveState").textContent="ended"}catch(e){liveError(e.message)}}
function startSnapshot(){if(FacilitatorLive.snapshotTimer)clearInterval(FacilitatorLive.snapshotTimer);refreshSnapshot();FacilitatorLive.snapshotTimer=setInterval(refreshSnapshot,1500)}

function retroCorrectIndex(ex){
  if(!ex)return null;
  var c=ex.correct_answer;
  if(c && typeof c==="object"){
    if(c.choice!==undefined)c=c.choice;
    else if(c.answer!==undefined)c=c.answer;
    else if(c.index!==undefined)c=c.index;
  }
  var n=Number(c);
  return Number.isInteger(n)?n:null;
}
function updateRetroFeedbackSummary(rows,participants,exercise){
  var box=document.getElementById("retroFeedbackSummary");if(!box)return;
  rows=Array.isArray(rows)?rows:[];
  participants=Array.isArray(participants)?participants:[];
  var total=participants.length;
  var unique={};
  rows.forEach(function(r){if(r&&r.participant_id!=null)unique[String(r.participant_id)]=1;});
  var responded=Object.keys(unique).length || rows.length;
  var participation=total?Math.round(responded/total*100):0;

  var correct=retroCorrectIndex(exercise),scored=0,ok=0,choices={};
  rows.forEach(function(r){
    var x=extractChoiceIndex(r);
    if(Number.isInteger(x)){
      choices[x]=(choices[x]||0)+1;
      if(Number.isInteger(correct)){scored++;if(x===correct)ok++;}
    }
  });
  var understanding=scored?Math.round(ok/scored*100):null;
  var status=understanding==null?"Sin criterio":understanding>=80?"Comprensión alta":understanding>=60?"Comprensión media":"Requiere refuerzo";
  var cls=understanding==null?"":understanding>=80?"high":understanding>=60?"mid":"low";

  document.getElementById("retroParticipationMetric").textContent=total?(participation+"%"):(responded+" resp.");
  document.getElementById("retroUnderstandingMetric").textContent=understanding==null?"—":understanding+"%";
  var sm=document.getElementById("retroStatusMetric");
  sm.innerHTML='<span class="retro-status-pill '+cls+'">'+status+'</span>';
  document.getElementById("retroParticipationLine").textContent=
    total ? (responded+" de "+total+" participantes han respondido.") : (responded+" respuestas registradas.");

  var distract=document.getElementById("retroDistractorNote");
  var topWrong=null,topCount=0;
  Object.keys(choices).forEach(function(k){
    var n=Number(k);
    if(n!==correct && choices[k]>topCount){topWrong=n;topCount=choices[k];}
  });
  if(topWrong!=null && exercise && Array.isArray(exercise.options) && exercise.options[topWrong]){
    distract.innerHTML='<strong>Confusión más frecuente:</strong> '+escapeParticipantHtml(exercise.options[topWrong])+
      ' ('+topCount+' respuesta'+(topCount===1?'':'s')+').';
  }else distract.textContent="";

  var note=document.getElementById("retroReinforceNote");
  if(understanding!=null && understanding<60){
    note.hidden=false;
    note.textContent="Este criterio presenta una oportunidad clara de retroalimentación. Conviene reforzarlo con otro escenario antes de continuar.";
  }else if(understanding!=null && understanding<80){
    note.hidden=false;
    note.textContent="La comprensión es parcial. Puedes reforzar el criterio si durante la conversación persisten dudas.";
  }else{
    note.hidden=true;note.textContent="";
  }
  box.hidden=false;
}

/* Puente hacia la vista Meet: solo entrega datos ya leídos. Ninguna decisión cambia aquí. */
function meetSync(payload){window.AulaLivePayload=payload;try{if(window.AulaProjection)AulaProjection.sync(payload);if(window.VentoMeet&&VentoMeet.sync)VentoMeet.sync(payload);}catch(e){}}

async function refreshSnapshot(){
  updateLivePanelToggle();
  if(!FacilitatorLive.sessionId)return;
  try{
    var d=normalizeRpc(rpcData(await getSupabaseClient().rpc("facilitator_snapshot",{
      p_access_token:FacilitatorLive.accessToken,
      p_session_id:FacilitatorLive.sessionId
    })));

    var sess=d.session||d.live_session||{};
    var participants=d.participant_count!=null?d.participant_count:(Array.isArray(d.participants)?d.participants.length:0);
    var state=sess.state||d.state||"—";
    var activeExerciseId=sess.active_exercise_id||d.active_exercise_id||null;

    document.getElementById("liveParticipantCount").textContent=participants;
    document.getElementById("liveState").textContent=state;
    document.getElementById("liveSessionStatus").textContent="Sesión "+FacilitatorLive.sessionCode+" · "+state;

    // Si el snapshot no expone el ejercicio activo, lo obtenemos de la sesión pública.
    if(!activeExerciseId){
      var sr=await getSupabaseClient().from("live_sessions")
        .select("active_exercise_id,state")
        .eq("id",FacilitatorLive.sessionId)
        .maybeSingle();
      if(!sr.error && sr.data){
        activeExerciseId=sr.data.active_exercise_id;
        state=sr.data.state||state;
        document.getElementById("liveState").textContent=state;
      }
    }

    if(!activeExerciseId){
      document.getElementById("liveAcceptedCount").textContent="0";
      document.getElementById("liveResponseSummary").innerHTML="";
      document.getElementById("liveResponses").innerHTML="Aún no hay una actividad lanzada.";
      meetSync({state:state,options:[],rows:[],correctIndex:null,participants:{},total:participants,exercise:null,exerciseId:null});
      return;
    }

    var er=await getSupabaseClient().from("exercises")
      .select("id,options,correct_answer,title,question,prompt,explanation,created_at")
      .eq("id",activeExerciseId)
      .maybeSingle();
    var ex=(!er.error&&er.data)?er.data:null;
    var options=ex?(Array.isArray(ex.options)?ex.options:(ex.options&&ex.options.items?ex.options.items:[])):[];

    // Para opción múltiple necesitamos answer_json, no answer_text.
    var rr=await getSupabaseClient().from("responses")
      .select("*")
      .eq("session_id",FacilitatorLive.sessionId)
      .eq("exercise_id",activeExerciseId)
      .order("created_at",{ascending:true});

    var rows=(!rr.error&&Array.isArray(rr.data))?rr.data:[];

    // Fallback: algunas instalaciones sólo devuelven respuestas vía facilitator_snapshot.
    if(!rows.length){
      var snapRows=d.accepted_responses||d.responses||[];
      if(Array.isArray(snapRows)) rows=snapRows;
    }

    document.getElementById("liveAcceptedCount").textContent=rows.length;

    var correctIndex=null;
    if(ex && ex.correct_answer!=null){
      var ca=ex.correct_answer;
      if(typeof ca==="string"){
        try{var parsed=JSON.parse(ca);ca=parsed}catch(e){}
      }
      if(typeof ca==="number") correctIndex=ca;
      else if(ca && typeof ca==="object" && ca.choice!=null) correctIndex=Number(ca.choice);
      else if(typeof ca==="string" && ca.trim()!=="") correctIndex=Number(ca);
    }

    renderLiveDistribution(options,rows,correctIndex,state==="result");

    var participantMap={};

    // Si el snapshot ya trae identidad, se aprovecha.
    if(Array.isArray(d.participants)){
      participantMap=participantIdentityMap(d.participants);
    }

    // Fuente principal y estable: RPC autenticada del facilitador.
    try{
      var facilitatorParticipants=await loadFacilitatorParticipants();
      var rpcMap=participantIdentityMap(facilitatorParticipants);
      Object.keys(rpcMap).forEach(function(k){ participantMap[k]=rpcMap[k]; });
    }catch(e){
      console.warn("No fue posible enriquecer identidad de participantes",e);
    }


    try{
      var feedbackParticipants=Object.keys(participantMap).map(function(k){return participantMap[k];});
      var feedbackExercise=null;
      if(FacilitatorLive.exerciseId){
        try{
          var fx=await getSupabaseClient().from("exercises").select("*").eq("id",FacilitatorLive.exerciseId).maybeSingle();
          if(!fx.error)feedbackExercise=fx.data;
        }catch(e){}
      }
      if(!feedbackExercise && d.exercise)feedbackExercise=d.exercise;
      updateRetroFeedbackSummary(rows,feedbackParticipants,feedbackExercise||ex);
    }catch(e){console.warn("Resumen de retroalimentación no disponible",e);}

    if(rows.length){
      document.getElementById("liveResponses").innerHTML=
        '<b style="display:block;margin-bottom:5px;color:#263247">Detalle registrado</b>'+
        rows.map(function(r,i){
          var idx=extractChoiceIndex(r);
          var answer=(Number.isInteger(idx)&&options[idx]!=null)
            ? String.fromCharCode(65+idx)+'. '+options[idx]
            : (r.answer_text||"Respuesta registrada");
          var person=participantMap[String(r.participant_id)]||{};
          var personName=displayParticipantName(person.name||person.participant_name||r.participant_name||r.name||"");
          var personAgency=person.agency||person.agencia||r.participant_agency||r.agency||r.agencia||"";
          var who=personName
            ? escapeParticipantHtml(personName)+(personAgency?' · '+escapeParticipantHtml(personAgency):'')
            : (personAgency?'Colaborador · '+escapeParticipantHtml(personAgency):'Participante '+(i+1));

          var verdict="", verdictClass="";
          if(state==="result" && Number.isInteger(correctIndex) && Number.isInteger(idx)){
            var ok=idx===correctIndex;
            verdict='<span class="live-answer-verdict '+(ok?'correct':'incorrect')+'">'+(ok?'Correcta':'Incorrecta')+'</span>';
            verdictClass=ok?" correct-answer":" incorrect-answer";
          }
          return '<div class="live-answer-person'+verdictClass+'"><b>'+who+'</b><br>'+escapeParticipantHtml(answer)+'<br>'+verdict+'</div>';
        }).join("");
    }else{
      document.getElementById("liveResponses").innerHTML="Aún no hay respuestas registradas para esta actividad.";
    }
    meetSync({state:state,options:options,rows:rows,correctIndex:correctIndex,participants:participantMap,total:participants,exercise:ex,exerciseId:activeExerciseId});
  }catch(e){
    console.error("refreshSnapshot",e);
    liveError("No fue posible actualizar las respuestas: "+(e.message||e));
  }
}




async function loadFacilitatorParticipants(){
  var list=[];
  try{
    var rpc=await getSupabaseClient().rpc("facilitator_participant_details",{
      p_access_token:FacilitatorLive.accessToken,
      p_session_id:FacilitatorLive.sessionId
    });
    var data=normalizeRpc(rpcData(rpc));
    if(data && data.success!==false && Array.isArray(data.participants)){
      list=data.participants;
    }
  }catch(e){
    console.warn("No fue posible obtener participantes vía RPC",e);
  }

  // Fallback únicamente si RLS permite lectura directa.
  if(!list.length){
    try{
      var direct=await getSupabaseClient().from("participants")
        .select("id,name,agency,joined_at")
        .eq("session_id",FacilitatorLive.sessionId)
        .order("joined_at",{ascending:true});
      if(!direct.error && Array.isArray(direct.data)) list=direct.data;
    }catch(e){
      console.warn("Fallback directo de participantes no disponible",e);
    }
  }
  return list;
}
function participantIdentityMap(list){
  var map={};
  (list||[]).forEach(function(p){
    var id=p && (p.id||p.participant_id);
    if(id!=null) map[String(id)]=p;
  });
  return map;
}

var ParticipantRegistry={rows:[],summary:[],participants:[],exercises:{},sessionCode:""};
function openParticipantRegistry(){var m=document.getElementById("participantRegistryModal");if(!m)return;var p=document.getElementById("fabP");if(p)p.classList.remove("open");m.classList.add("open");m.setAttribute("aria-hidden","false");loadParticipantRegistry();}
function closeParticipantRegistry(){var m=document.getElementById("participantRegistryModal");if(m){m.classList.remove("open");m.setAttribute("aria-hidden","true");}}
function registryFormatDate(v){if(!v)return "—";try{return new Date(v).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"});}catch(e){return String(v);}}
function registryCorrectIndex(ex){if(!ex)return null;var n=parseCorrectChoice(ex.correct_answer);if(Number.isInteger(n))return n;var l=findLocalExerciseDefinition(ex);return l&&Number.isInteger(l.correct)?l.correct:null;}
function registryAnswerText(r,ex){var o=ex&&Array.isArray(ex.options)?ex.options:[],i=extractChoiceIndex(r);if(Number.isInteger(i))return o[i]!=null?String.fromCharCode(65+i)+". "+o[i]:"Opción "+(i+1);return r.answer_text||r.answer||"—";}
function registryFormatSeconds(s){if(s==null||!isFinite(s))return "—";s=Math.max(0,Math.round(s));if(s<60)return s+" s";var m=Math.floor(s/60),r=s%60;return m+" min "+(r?(r+" s"):"");}
function registryTimestamp(v){if(!v)return null;var t=new Date(v).getTime();return isFinite(t)?t:null;}

/* Tiempo de respuesta: la diferencia entre el lanzamiento de la actividad y el
   envío de la respuesta. Si el servidor no permite calcularlo, se usa el tiempo
   que el participante reportó desde su dispositivo. */
function registryElapsedSeconds(r,ex){
  var a=registryTimestamp(r&&(r.created_at||r.submitted_at||r.answered_at));
  var b=registryTimestamp(ex&&(ex.created_at||ex.launched_at||ex.started_at||ex.published_at));
  if(a!=null&&b!=null){
    var d=(a-b)/1000;
    if(isFinite(d)&&d>=0)return d;
  }
  var rep=Number(r&&(r.elapsed_seconds!=null?r.elapsed_seconds:r.response_seconds));
  if(isFinite(rep)&&rep>=0)return rep;
  return null;
}

/* Copia de seguridad local: aunque se caiga Supabase o se cierre la sesión,
   los resultados ya descargados siguen guardados en este dispositivo. */
function registryStoreKey(){return "ventoRegistry:"+(FacilitatorLive.sessionCode||FacilitatorLive.sessionId||"sin-sesion");}
function registryLoadStore(){
  try{var raw=localStorage.getItem(registryStoreKey());var d=raw?JSON.parse(raw):null;return d&&Array.isArray(d.rows)?d:null;}catch(e){return null;}
}
function registrySaveStore(rows,summary,participants){
  try{
    localStorage.setItem(registryStoreKey(),JSON.stringify({
      savedAt:new Date().toISOString(),
      sessionCode:FacilitatorLive.sessionCode||"",
      rows:rows||[],
      summary:summary||[],
      participants:participants||[]
    }));
  }catch(e){}
}
function registryRowKey(x){return [x.participantKey||"",x.agency||"",x.activity||"",x.created_at||""].join("|");}
function registryMergeRows(fresh,stored){
  var out=(fresh||[]).slice(),seen={};
  out.forEach(function(x){seen[registryRowKey(x)]=1;});
  (stored||[]).forEach(function(x){var k=registryRowKey(x);if(!seen[k]){seen[k]=1;out.push(x);}});
  out.sort(function(a,b){return String(a.created_at||"").localeCompare(String(b.created_at||""));});
  return out;
}

function registryBuildSummary(rows){
  var byKey={},order=[];
  (rows||[]).forEach(function(x){
    var key=x.participantKey||(x.participant+" @ "+x.agency);
    if(!byKey[key]){
      byKey[key]={participantKey:key,participant:x.participant,agency:x.agency,activities:0,scored:0,correct:0,points:0,totalSeconds:0,timed:0};
      order.push(key);
    }
    var s=byKey[key];
    s.activities++;
    if(x.verdict==="Correcta"){s.correct++;s.scored++;s.points++;}
    else if(x.verdict==="Incorrecta"){s.scored++;}
    if(x.elapsed!=null){s.totalSeconds+=x.elapsed;s.timed++;}
  });
  return order.map(function(k){
    var s=byKey[k];
    s.finalScore=s.points;
    s.maxScore=s.scored;
    s.grade=s.scored?Math.round(s.points/s.scored*100):null;
    s.avgSeconds=s.timed?s.totalSeconds/s.timed:null;
    return s;
  }).sort(function(a,b){ return b.finalScore-a.finalScore || String(a.participant).localeCompare(String(b.participant),"es"); });
}

async function loadParticipantRegistry(){
  var body=document.getElementById("registryRows");
  var sumBody=document.getElementById("registrySummaryRows");
  if(!body)return;
  if(sumBody)sumBody.innerHTML='<tr><td class="registry-empty" colspan="8">Cargando puntajes...</td></tr>';
  if(!FacilitatorLive.sessionId){
    var cached=registryLoadStore();
    if(cached&&cached.rows.length){
      renderParticipantRegistry(cached.rows,registryBuildSummary(cached.rows),cached.participants||[],true);
      return;
    }
    body.innerHTML='<tr><td colspan="8" class="registry-empty">Primero crea una sesión en vivo.</td></tr>';
    return;
  }
  body.innerHTML='<tr><td colspan="8" class="registry-empty">Cargando registro...</td></tr>';
  document.getElementById("registrySessionLabel").textContent="Sesión "+(FacilitatorLive.sessionCode||"");

  try{
    var c=getSupabaseClient();

    // La identidad se obtiene por la RPC segura. La tabla participants usa joined_at,
    // no created_at; esto corrige el registro vacío de nombre/agencia.
    var ps=await loadFacilitatorParticipants();

    var rr=await c.from("responses")
      .select("*")
      .eq("session_id",FacilitatorLive.sessionId)
      .order("created_at",{ascending:true});
    var rs=(!rr.error&&Array.isArray(rr.data))?rr.data:[];

    // Si RLS impide respuestas directas, usar snapshot autenticado como respaldo.
    if(!rs.length){
      try{
        var snap=normalizeRpc(rpcData(await c.rpc("facilitator_snapshot",{
          p_access_token:FacilitatorLive.accessToken,
          p_session_id:FacilitatorLive.sessionId
        })));
        var snapRows=snap.accepted_responses||snap.responses||[];
        if(Array.isArray(snapRows)) rs=snapRows;
      }catch(e){
        console.warn("Fallback de respuestas por snapshot no disponible",e);
      }
    }

    var ids=Array.from(new Set(rs.map(function(r){return r.exercise_id;}).filter(Boolean))),es=[];
    if(ids.length){
      var er=await c.from("exercises").select("*").in("id",ids);
      if(!er.error&&Array.isArray(er.data)) es=er.data;
    }

    var pm=participantIdentityMap(ps),em={};
    es.forEach(function(e){em[String(e.id)]=e;});

    var rows=rs.map(function(r,i){
      var p=pm[String(r.participant_id)]||{};
      var ex=em[String(r.exercise_id)]||{};
      var idx=extractChoiceIndex(r),correct=registryCorrectIndex(ex);
      var graded=Number.isInteger(idx)&&Number.isInteger(correct);
      var verdict=graded?(idx===correct?"Correcta":"Incorrecta"):"Sin criterio";
      var name=displayParticipantName(p.name||p.participant_name||r.participant_name||r.name||("PARTICIPANTE "+(i+1)));
      var agency=p.agency||p.agencia||r.participant_agency||r.agency||r.agencia||"—";
      var activity=ex.title||r.exercise_title||"Actividad";

      return{
        participantKey:(p.id!=null?String(p.id):name)+"|"+agency,
        participantId:p.id!=null?String(p.id):null,
        participant:name,
        agency:agency,
        activity:activity,
        exerciseId:r.exercise_id!=null?String(r.exercise_id):null,
        answer:registryAnswerText(r,ex),
        answerIndex:Number.isInteger(idx)?idx:null,
        verdict:verdict,
        points:graded?(idx===correct?1:0):0,
        maxPoints:graded?1:0,
        elapsed:registryElapsedSeconds(r,ex),
        created_at:r.created_at||r.submitted_at||null
      };
    });

    // Se conserva también lo descargado antes, por si el servidor ya no responde.
    var stored=registryLoadStore();
    var all=stored?registryMergeRows(rows,stored.rows):rows;
    var summary=registryBuildSummary(all);
    registrySaveStore(all,summary,ps);
    renderParticipantRegistry(all,summary,ps,false);

  }catch(e){
    var cached=registryLoadStore();
    if(cached&&cached.rows.length){
      renderParticipantRegistry(cached.rows,registryBuildSummary(cached.rows),cached.participants||[],true);
      return;
    }
    body.innerHTML='<tr><td colspan="8" class="registry-empty">No fue posible cargar el registro: '+escapeParticipantHtml(e.message||String(e))+'</td></tr>';
    if(sumBody)sumBody.innerHTML='<tr><td class="registry-empty" colspan="8">—</td></tr>';
  }
}

function renderParticipantRegistry(rows,summary,participants,fromCache){
  var body=document.getElementById("registryRows");
  var sumBody=document.getElementById("registrySummaryRows");
  if(!body)return;

  ParticipantRegistry={
    rows:rows||[],
    summary:summary||[],
    participants:participants||[],
    exercises:ParticipantRegistry.exercises||{},
    sessionCode:FacilitatorLive.sessionCode||""
  };

  var scored=rows.filter(function(x){return x.maxPoints>0;});
  var ok=scored.filter(function(x){return x.points>0;}).length;
  var totalPoints=rows.reduce(function(a,x){return a+(x.points||0);},0);
  var totalAnswered=summary.length;

  var pc=document.getElementById("registryParticipantCount");
  var rc=document.getElementById("registryResponseCount");
  var cr=document.getElementById("registryCorrectRate");
  var av=document.getElementById("registryAvgScore");
  if(pc)pc.textContent=totalAnswered||participants.length;
  if(rc)rc.textContent=rows.length;
  if(cr)cr.textContent=scored.length?Math.round(ok/scored.length*100)+"%":"—";
  if(av)av.textContent=totalAnswered?(totalPoints/totalAnswered).toFixed(1)+" pts por participante":"—";

  var label=document.getElementById("registrySessionLabel");
  if(label){
    var store=registryLoadStore();
    label.textContent="Sesión "+(FacilitatorLive.sessionCode||"")+(fromCache?" · copia local":"")+(fromCache&&store&&store.savedAt?" · guardado "+registryFormatDate(store.savedAt):"");
  }

  body.innerHTML=rows.length
    ?rows.map(function(x){
      var cls=x.verdict==="Correcta"?"ok":x.verdict==="Incorrecta"?"bad":"na";
      return '<tr>'+
        '<td><strong>'+escapeParticipantHtml(x.participant)+'</strong></td>'+
        '<td>'+escapeParticipantHtml(x.agency)+'</td>'+
        '<td>'+escapeParticipantHtml(x.activity)+'</td>'+
        '<td>'+escapeParticipantHtml(x.answer)+'</td>'+
        '<td><span class="registry-verdict '+cls+'">'+escapeParticipantHtml(x.verdict)+'</span></td>'+
        '<td>'+escapeParticipantHtml(registryFormatSeconds(x.elapsed))+'</td>'+
        '<td><strong>'+(x.maxPoints?x.points+" / "+x.maxPoints:"—")+'</strong></td>'+
        '<td>'+escapeParticipantHtml(registryFormatDate(x.created_at))+'</td>'+
      '</tr>';
    }).join("")
    :'<tr><td colspan="8" class="registry-empty">Aún no hay respuestas registradas.</td></tr>';

  if(sumBody){
    sumBody.innerHTML=summary.length
      ?summary.map(function(s){
        return '<tr>'+
          '<td><strong>'+escapeParticipantHtml(s.participant)+'</strong></td>'+
          '<td>'+escapeParticipantHtml(s.agency)+'</td>'+
          '<td>'+s.activities+'</td>'+
          '<td>'+s.correct+'</td>'+
          '<td><strong>'+s.finalScore+'</strong></td>'+
          '<td>'+(s.grade!=null?s.grade+"%":"—")+'</td>'+
          '<td>'+escapeParticipantHtml(registryFormatSeconds(s.timed?s.totalSeconds:null))+'</td>'+
          '<td>'+escapeParticipantHtml(registryFormatSeconds(s.avgSeconds))+'</td>'+
        '</tr>';
      }).join("")
      :'<tr><td colspan="8" class="registry-empty">Aún no hay puntajes calculados.</td></tr>';
  }
}

function csvCell(v){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"';}
function registryDownloadCsv(lines,name){
  var blob=new Blob(["\uFEFF"+lines.join("\r\n")],{type:"text/csv;charset=utf-8;"});
  var url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url)},500);
}
function downloadParticipantRegistryCSV(){
  var rows=ParticipantRegistry.rows||[];
  if(!rows.length){showActionToast("Aún no hay respuestas para exportar.");return;}
  var head=[["Participante","Agencia","Actividad","Respuesta","Opción","Resultado","Puntos","Puntaje máximo","Tiempo (segundos)","Tiempo","Fecha / hora"]];
  var lines=[head[0].map(csvCell).join(",")];
  rows.forEach(function(x){
    lines.push([x.participant,x.agency,x.activity,x.answer,x.answerIndex==null?"":x.answerIndex+1,x.verdict,x.points,x.maxPoints,x.elapsed==null?"":Math.round(x.elapsed),registryFormatSeconds(x.elapsed),registryFormatDate(x.created_at)].map(csvCell).join(","));
  });
  registryDownloadCsv(lines,"Retroalimentacion_Detalle_"+(FacilitatorLive.sessionCode||"sesion")+".csv");
}
function downloadParticipantSummaryCSV(){
  var rows=ParticipantRegistry.summary||[];
  if(!rows.length){showActionToast("Aún no hay puntajes para exportar.");return;}
  var lines=[["Participante","Agencia","Actividades respondidas","Aciertos","Puntaje final","Puntaje máximo","Calificación %","Tiempo total (segundos)","Tiempo promedio (segundos)"].map(csvCell).join(",")];
  rows.forEach(function(s){
    lines.push([s.participant,s.agency,s.activities,s.correct,s.finalScore,s.maxScore,s.grade==null?"":s.grade,Math.round(s.totalSeconds||0),s.avgSeconds==null?"":Math.round(s.avgSeconds)].map(csvCell).join(","));
  });
  registryDownloadCsv(lines,"Retroalimentacion_Resumen_"+(FacilitatorLive.sessionCode||"sesion")+".csv");
}
async function downloadParticipantResponses(){
  if(!FacilitatorLive.sessionId){showActionToast("Primero crea una sesión en vivo.");return;}
  await loadParticipantRegistry();
  downloadParticipantRegistryCSV();
}
document.addEventListener("click",function(e){var m=document.getElementById("participantRegistryModal");if(m&&e.target===m)closeParticipantRegistry();});



// ============================================================
// CRONÓMETRO DE ACTIVIDADES · 20 SEGUNDOS
// ============================================================
var LiveCountdown={timer:null,endsAt:0,audio:null,participantTimer:null};
function tickSound(){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;if(!LiveCountdown.audio)LiveCountdown.audio=new A();var c=LiveCountdown.audio,o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.value=.025;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.045);}catch(e){}}
function paintLiveCountdown(sec){var el=document.getElementById("liveCountdown");if(el){el.textContent=String(Math.max(0,sec));el.classList.toggle("urgent",sec<=3&&sec>0)}}
function startLiveCountdown(seconds){clearInterval(LiveCountdown.timer);LiveCountdown.endsAt=Date.now()+seconds*1000;paintLiveCountdown(seconds);LiveCountdown.timer=setInterval(function(){var s=Math.max(0,Math.ceil((LiveCountdown.endsAt-Date.now())/1000));paintLiveCountdown(s);if(s>0)tickSound();if(s<=0){clearInterval(LiveCountdown.timer);LiveCountdown.timer=null;try{closeLiveVoting();}catch(e){}showActionToast("Tiempo terminado · votación cerrada");}},1000);tickSound();}
function stopLiveCountdown(){if(LiveCountdown.timer)clearInterval(LiveCountdown.timer);LiveCountdown.timer=null;var ex=null;try{ex=getCurrentLiveExercise();}catch(e){}paintLiveCountdown(liveExerciseDuration(ex));}
function liveExerciseDuration(ex){var def=findLocalExerciseDefinition(ex)||ex||{};if(ex&&ex.kind==="quote-builder"||def.kind==="quote-builder")return 60;var name=String(def.title||ex?.title||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),key=String(def.key||ex?.exercise_key||ex?.key||'').toLowerCase();if(/plan de exito/.test(name)||/^plan-exito(-|_)/.test(key))return 30;var words=[def.prompt||ex?.prompt||"",def.question||ex?.question||"",...(def.options||ex?.options||[])].join(" ").trim().split(/\s+/).length;return words>100?45:words>60?30:20;}
function participantRemainingSeconds(ex){var duration=liveExerciseDuration(ex);if(!ex||!ex.created_at)return duration;var t=new Date(ex.created_at).getTime();if(!isFinite(t))return duration;return Math.max(0,Math.ceil((t+duration*1000-Date.now())/1000));}
function mountParticipantCountdown(ex){var host=document.getElementById("participantActivityCountdown");if(!host)return;clearInterval(LiveCountdown.participantTimer);function draw(){var s=participantRemainingSeconds(ex);host.innerHTML='<span>Tiempo para responder</span><b>'+s+'</b>';host.classList.toggle("urgent",s<=3&&s>0);if(s<=0){clearInterval(LiveCountdown.participantTimer);document.querySelectorAll(".participant-choice,.quote-card,.quote-target,.quote-submit").forEach(function(b){b.disabled=true;b.classList.add("used")});}}draw();LiveCountdown.participantTimer=setInterval(draw,250);}

// ============================================================
// COTIZACIÓN INTERACTIVA · MOD08
// ============================================================
function quoteLocalDef(ex){var d=findLocalExerciseDefinition(ex);return d&&d.kind==="quote-builder"?d:null;}
function renderQuoteBuilder(host,ex){
  var def=quoteLocalDef(ex);if(!def||!def.quote){renderParticipantMultipleChoiceDefault(host,ex);return;}
  var draftKey='ventoQuoteDraft:'+exerciseIdentity(ex);
  var savedChoice=getSavedParticipantChoice(ex.id,ex);
  if(savedChoice!==null){host.innerHTML='<div class="participant-wait"><h2>Cotización enviada</h2><p>Tu respuesta ya quedó registrada.</p></div>';return;}
  var placed={};try{placed=JSON.parse(sessionStorage.getItem(draftKey)||'{}')}catch(e){}
  ParticipantSession.quoteState={placed:placed,selected:null};
  var sending=false;
  function locked(){return sending||participantRemainingSeconds(ex)<=0;}
  function saveDraft(){try{sessionStorage.setItem(draftKey,JSON.stringify(ParticipantSession.quoteState.placed))}catch(e){}}
  var q=def.quote;
  host.innerHTML='<div class="participant-status"><span class="participant-dot"></span>Actividad abierta</div><div id="participantActivityCountdown" class="participant-countdown"></div><div class="participant-kicker">Cierre transicional</div><h2>'+escapeParticipantHtml(ex.title||def.title)+'</h2><p>'+escapeParticipantHtml(def.prompt||"")+'</p><div class="participant-question">'+escapeParticipantHtml(def.question||"")+'</div><div class="quote-builder"><div class="quote-sheet"><div class="quote-sheet-head"><div class="quote-sheet-brand">VENTO</div><div class="quote-sheet-sim">SIMULACIÓN</div></div>'+q.slots.map(function(s){return '<button type="button" class="quote-target" data-slot="'+s.id+'" data-label="'+escapeParticipantHtml(s.label)+'"></button>'}).join('')+'</div><div class="quote-builder-note">Arrastra una tarjeta al campo o tócala y después toca el campo correspondiente. Toca un campo ocupado para liberar su tarjeta.</div><div class="quote-bank">'+q.cards.map(function(c){return '<button type="button" draggable="true" class="quote-card" data-card="'+c.id+'">'+escapeParticipantHtml(c.text)+'</button>'}).join('')+'</div><button class="quote-submit" id="quoteSubmitBtn" type="button">Enviar cotización</button></div>';
  var selected=null;
  function sync(){document.querySelectorAll('.quote-card').forEach(function(c){c.classList.toggle('selected',c.dataset.card===selected);var used=Object.values(ParticipantSession.quoteState.placed).indexOf(c.dataset.card)>=0;c.classList.toggle('used',used)});document.querySelectorAll('.quote-target').forEach(function(t){var cid=ParticipantSession.quoteState.placed[t.dataset.slot];var card=q.cards.find(function(c){return c.id===cid});t.classList.toggle('filled',!!card);var old=t.querySelector('.placed-txt');if(old)old.remove();if(card){var sp=document.createElement('span');sp.className='placed-txt';sp.textContent=card.text;t.appendChild(sp)}})}
  function place(slot,cid){if(locked()||!q.slots.some(function(s){return s.id===slot})||!q.cards.some(function(c){return c.id===cid}))return;Object.keys(ParticipantSession.quoteState.placed).forEach(function(k){if(ParticipantSession.quoteState.placed[k]===cid)delete ParticipantSession.quoteState.placed[k]});ParticipantSession.quoteState.placed[slot]=cid;selected=null;saveDraft();sync();}
  host.querySelectorAll('.quote-card').forEach(function(c){c.addEventListener('click',function(){if(locked())return;selected=(selected===c.dataset.card?null:c.dataset.card);sync()});c.addEventListener('dragstart',function(e){e.dataTransfer.setData('text/plain',c.dataset.card)})});
  host.querySelectorAll('.quote-target').forEach(function(t){t.addEventListener('dragover',function(e){e.preventDefault();t.classList.add('active')});t.addEventListener('dragleave',function(){t.classList.remove('active')});t.addEventListener('drop',function(e){e.preventDefault();t.classList.remove('active');place(t.dataset.slot,e.dataTransfer.getData('text/plain'))});t.addEventListener('click',function(){if(locked())return;if(!selected){delete ParticipantSession.quoteState.placed[t.dataset.slot];saveDraft();sync();return}place(t.dataset.slot,selected)})});
  document.getElementById('quoteSubmitBtn').addEventListener('click',async function(){var btn=this;if(locked())return;btn.disabled=true;var complete=q.slots.every(function(s){return ParticipantSession.quoteState.placed[s.id]});if(!complete){btn.disabled=false;var note=host.querySelector('.quote-builder-note');note.textContent='Completa los cinco campos antes de enviar.';return}sending=true;var ok=q.slots.every(function(s){return ParticipantSession.quoteState.placed[s.id]===s.correct});try{var r=await SessionService.submitMultipleChoice({answer:ok?1:0,details:{quote_fields:q.slots.map(function(slot){var card=q.cards.find(function(c){return c.id===ParticipantSession.quoteState.placed[slot.id]});return {field:slot.label,value:card?card.text:""}})}});if(r.success===false||r.accepted===false)throw new Error(r.error||'No se pudo registrar');ParticipantSession.selectedChoice=ok?1:0;saveParticipantChoice(ex.id,ok?1:0,ex);clearInterval(LiveCountdown.participantTimer);logParticipantActivity(ex,ok?1:0,q.slots.map(function(s){var cid=ParticipantSession.quoteState.placed[s.id];var card=q.cards.find(function(c){return c.id===cid});return s.label+': '+(card?card.text:'—')}).join(' | '));host.innerHTML='<div class="participant-wait"><div class="participant-pulse"></div><div class="participant-status"><span class="participant-dot"></span>Respuesta registrada</div><h2>Cotización enviada</h2><p>La facilitadora mostrará el criterio al grupo.</p></div>'}catch(e){sending=false;btn.disabled=participantRemainingSeconds(ex)<=0;var note=host.querySelector('.quote-builder-note');note.textContent=e.message||'No se pudo enviar.'}});
  sync();mountParticipantCountdown(ex);
}
var renderParticipantMultipleChoiceDefault=renderParticipantMultipleChoice;
renderParticipantMultipleChoice=function(host){var ex=ParticipantSession.activeExercise||{};if(quoteLocalDef(ex)){renderQuoteBuilder(host,ex);return;}renderParticipantMultipleChoiceDefault(host);var cd=document.createElement('div');cd.id='participantActivityCountdown';cd.className='participant-countdown';var first=host.firstChild;host.insertBefore(cd,first);mountParticipantCountdown(ex);};

var _setLiveStateBase=setLiveState;
setLiveState=async function(state){if(state!=="multiple-choice")stopLiveCountdown();return await _setLiveStateBase(state);};
var _endLiveSessionBase=endLiveSession;
endLiveSession=async function(){stopLiveCountdown();return await _endLiveSessionBase();};


(function(){
  function startIntegrated(){
    if(isConsultationView())return;
    if(typeof isParticipantView==='function' && isParticipantView()){
      initParticipantApp();
    }else{
      initFacilitatorApp();
      initAutoLiveExercises();
      try{var hash=(location.hash||'').replace('#','');var ix=slideIndex(hash);if(ix>=0)goSlide(ix);}catch(e){}
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startIntegrated);else setTimeout(startIntegrated,0);
})();

