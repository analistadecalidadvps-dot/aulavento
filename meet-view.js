/* VENTO AULA · VISTA MEET, PODIO, AUDIO Y CIERRE
   Capa aditiva de presentación. No modifica Supabase, RPC, sesión, credenciales,
   esquema, IndexedDB, QR, courseId, cálculo de respuestas ni exportaciones.
   Solo consume, vía meetSync(), los datos que refreshSnapshot ya leía. */
(function () {
  'use strict';
  if (window.VentoMeet) return;

  var M = {
    payload: null,
    mode: 'off',
    pinned: false,
    sound: sessionStorage.getItem('ventoMeetSound') !== '0',
    clockTimer: null,
    lastSec: null,
    lastKey: '',
    revealedKey: '',
    clockIdle: false
  };

  /* ---------------------------------------------------------- audio */
  var actx = null;
  function audio() {
    try {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      if (!actx) actx = new C();
      if (actx.state === 'suspended') actx.resume();
      return actx;
    } catch (e) { return null; }
  }
  function tone(freq, dur, vol, delay) {
    if (!M.sound) return;
    var c = audio();
    if (!c) return;
    try {
      var t = c.currentTime + (delay || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.04, t + 0.014);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.05);
    } catch (e) {}
  }
  function sfxTick(urgent) {
    if (urgent) { tone(1046, 0.10, 0.05); tone(1568, 0.09, 0.032, 0.09); }
    else tone(784, 0.05, 0.02);
  }
  function sfxTimeUp() { tone(880, 0.10, 0.045); tone(784, 0.10, 0.045, 0.11); tone(523, 0.22, 0.04, 0.22); }
  function sfxReveal() { tone(659, 0.09, 0.038); tone(880, 0.09, 0.038, 0.09); tone(1174, 0.22, 0.042, 0.18); }
  function sfxPodium() { tone(523, 0.08, 0.038); tone(659, 0.08, 0.038, 0.10); tone(784, 0.10, 0.038, 0.20); tone(1046, 0.28, 0.048, 0.30); }

  /* ---------------------------------------------------------- util */
  function esc(v) {
    if (v == null) return '';
    if (typeof escapeParticipantHtml === 'function') return escapeParticipantHtml(String(v));
    return String(v).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function letter(i) { return String.fromCharCode(65 + i); }
  function byId(id) { return document.getElementById(id); }
  function choiceIndex(row) {
    try { return typeof extractChoiceIndex === 'function' ? extractChoiceIndex(row) : null; }
    catch (e) { return null; }
  }
  function optList(p) {
    var o = p && p.options;
    if (Array.isArray(o)) return o;
    if (o && Array.isArray(o.items)) return o.items;
    return [];
  }
  function tally(rows, n) {
    var c = [], i;
    for (i = 0; i < n; i++) c.push(0);
    (rows || []).forEach(function (r) {
      var x = choiceIndex(r);
      if (Number.isInteger(x) && x >= 0 && x < n) c[x]++;
    });
    return c;
  }
  function responders(rows) {
    var seen = {}, n = 0;
    (rows || []).forEach(function (r) {
      var k = r && r.participant_id != null ? String(r.participant_id) : 'x' + n;
      if (!seen[k]) { seen[k] = 1; n++; }
    });
    return n;
  }
  function personName(p, r) {
    var v = (p && (p.name || p.participant_name)) || (r && (r.participant_name || r.name)) || '';
    if (!v) return 'Participante';
    try { if (typeof displayParticipantName === 'function') return displayParticipantName(v) || 'Participante'; }
    catch (e) {}
    return String(v);
  }
  function personAgency(p, r) {
    return String((p && (p.agency || p.agencia)) || (r && (r.participant_agency || r.agency || r.agencia)) || '');
  }
  function secs(v) {
    if (v == null || !isFinite(v)) return '—';
    v = Math.max(0, Math.round(v));
    if (v < 60) return v + ' s';
    var m = Math.floor(v / 60), r = v % 60;
    return m + ' min ' + (r < 10 ? '0' : '') + r + ' s';
  }
  function when(v) {
    var t = v ? new Date(v).getTime() : NaN;
    return isFinite(t) ? t : null;
  }
  function fmtCount(n) { return new Intl.NumberFormat('es-MX').format(n || 0); }

  /* ---------------------------------------------------------- DOM */
  function build() {
    if (byId('meetStage')) return;
    var stage = document.createElement('section');
    stage.id = 'meetStage';
    stage.className = 'meet-stage';
    stage.hidden = true;
    stage.setAttribute('aria-live', 'polite');
    stage.innerHTML =
      '<header class="meet-top">' +
        '<div class="meet-brand">VENTO<em>AULA</em></div>' +
        '<div class="meet-ctx"><b id="meetCtxTitle"></b><span id="meetCtxModule"></span></div>' +
        '<div class="meet-tools">' +
          '<button type="button" class="meet-tool" id="meetSoundBtn" aria-pressed="true" title="Sonido">🔊</button>' +
          '<button type="button" class="meet-tool" id="meetExitBtn" title="Volver a las diapositivas">✕</button>' +
        '</div>' +
      '</header>' +
      '<div class="meet-body">' +
        '<div class="meet-live" id="meetLive">' +
          '<div class="meet-kicker" id="meetKicker">Pregunta abierta</div>' +
          '<h2 class="meet-q" id="meetQuestion"></h2>' +
          '<div class="meet-live-row">' +
            '<div class="meet-clock" id="meetClock"><b id="meetClockNum">—</b><span id="meetClockLabel">Tiempo para responder</span></div>' +
            '<div class="meet-count"><b id="meetAnswered">0 de 0</b><span>respondieron</span></div>' +
          '</div>' +
          '<div class="meet-options" id="meetOptions"></div>' +
        '</div>' +
        '<div class="meet-result" id="meetResult" hidden>' +
          '<div class="meet-correct" id="meetCorrect" hidden></div>' +
          '<div class="meet-total" id="meetTotal"></div>' +
          '<div class="meet-bars" id="meetBars"></div>' +
          '<div class="meet-podium" id="meetPodium" hidden></div>' +
        '</div>' +
        '<div class="meet-done" id="meetDone" hidden>' +
          '<div class="meet-done-badge">Capacitación finalizada</div>' +
          '<h2 class="meet-done-title" id="meetDoneTitle"></h2>' +
          '<div class="meet-done-stats" id="meetDoneStats"></div>' +
          '<div class="meet-done-actions">' +
            '<button type="button" class="meet-action primary" id="meetSaveEvidence">Guardar evidencia</button>' +
            '<button type="button" class="meet-action" id="meetDownloadResponses">Descargar respuestas</button>' +
            '<button type="button" class="meet-action" id="meetOpenEvidence">Ver / exportar evidencia</button>' +
            '<button type="button" class="meet-action alt" id="meetNewSession">Preparar otra sesión</button>' +
          '</div>' +
          '<div class="meet-done-note" id="meetDoneNote"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(stage);

    var fab = document.createElement('button');
    fab.id = 'meetFab';
    fab.type = 'button';
    fab.className = 'meet-fab';
    fab.hidden = false;
    fab.textContent = 'Vista Meet';
    document.body.appendChild(fab);

    byId('meetExitBtn').onclick = function () { M.pinned = false; M.lastKey = ''; apply(); };
    fab.onclick = function () { if(window.AulaProjection?.open){AulaProjection.open();return;} M.pinned = true; apply(); };
    byId('meetSoundBtn').onclick = function () {
      M.sound = !M.sound;
      sessionStorage.setItem('ventoMeetSound', M.sound ? '1' : '0');
      paintSound();
      if (M.sound) tone(880, 0.08, 0.04);
    };
    byId('meetSaveEvidence').onclick = function () { run('saveEvidenceButton'); };
    byId('meetDownloadResponses').onclick = function () { run('downloadParticipantResponses'); };
    byId('meetOpenEvidence').onclick = function () { run('openEvidenceHistory'); };
    byId('meetNewSession').onclick = function () {
      run('newLiveSession');
      M.pinned = false; M.lastKey = ''; M.payload = null; apply();
    };
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var stage = byId('meetStage');
      if (stage && !stage.hidden && M.mode !== 'done') { M.pinned = false; M.lastKey = ''; apply(); }
    });
    paintSound();
  }
  function paintSound() {
    var b = byId('meetSoundBtn');
    if (!b) return;
    b.textContent = M.sound ? '🔊' : '🔇';
    b.setAttribute('aria-pressed', M.sound ? 'true' : 'false');
    b.classList.toggle('is-off', !M.sound);
  }
  function run(fn) {
    try {
      if (typeof window[fn] === 'function') { window[fn](); return; }
    } catch (e) {}
    try { if (typeof showActionToast === 'function') showActionToast('Acción no disponible en este momento.'); } catch (e) {}
  }

  /* ---------------------------------------------------------- RELOJ */
  function startClock() {
    if (M.clockTimer) return;
    M.clockTimer = setInterval(tickClock, 250);
  }
  function stopClock() {
    if (M.clockTimer) clearInterval(M.clockTimer);
    M.clockTimer = null;
    M.lastSec = null;
  }
  function tickClock() {
    var num = byId('meetClockNum');
    if (!num) return;
    var lc = window.LiveCountdown;
    var running = !!(lc && lc.timer && lc.endsAt > Date.now());
    M.clockIdle = !running;
    var clock = byId('meetClock');
    if (clock) clock.classList.toggle('is-idle', !running);
    if (!running) {
      if (M.lastSec !== -1) { num.textContent = '—'; M.lastSec = -1; }
      return;
    }
    var left = Math.max(0, Math.ceil((lc.endsAt - Date.now()) / 1000));
    if (left === M.lastSec) return;
    M.lastSec = left;
    num.textContent = String(left);
    if (clock) clock.classList.toggle('urgent', left <= 5);
    sfxTick(left <= 5);
    if (left === 0) { sfxTimeUp(); }
  }

  /* ---------------------------------------------------------- PODIO */
  /* Solo respuestas correctas y solo tiempos calculados con datos reales:
     created_at de la respuesta menos created_at del lanzamiento. */
  function podium(p) { return window.AulaRank ? AulaRank.top(p) : []; }
  var MEDALS = ['🥇', '🥈', '🥉'];

  /* ---------------------------------------------------------- RENDER */
  function bars(options, rows, correctIndex, reveal) {
    var counts = tally(rows, options.length);
    var total = counts.reduce(function (a, b) { return a + b; }, 0);
    var html = '';
    options.forEach(function (opt, i) {
      var n = counts[i];
      var pct = total ? Math.round((n / total) * 100) : 0;
      var isC = reveal && i === correctIndex;
      html += '<div class="meet-bar' + (isC ? ' is-correct' : '') + '">' +
        '<div class="meet-bar-head"><span class="meet-bar-label">' + letter(i) + '. ' + esc(opt) + (isC ? ' <em>criterio correcto</em>' : '') + '</span>' +
        '<span class="meet-bar-num"><b>' + fmtCount(n) + '</b> · ' + pct + '%</span></div>' +
        '<div class="meet-bar-track"><div class="meet-bar-fill" style="width:' + pct + '%"></div></div>' +
      '</div>';
    });
    return { html: html, total: total, counts: counts };
  }

  function renderLive(p) {
    var options = optList(p);
    var rows = p.rows || [];
    var answered = responders(rows);
    var totalP = Number(p.total) || 0;
    var ex = p.exercise || {};
    var title = ex.title || (typeof getCurrentLiveExercise === 'function' && safeTitle());
    byId('meetCtxTitle').textContent = title || 'Dinámica en vivo';
    byId('meetCtxModule').textContent = (typeof courseName === 'function' ? courseName() : 'Capacitación') +
      (FacilitatorLive && FacilitatorLive.sessionCode ? ' · Sesión ' + FacilitatorLive.sessionCode : '');
    byId('meetQuestion').textContent = ex.question || (typeof getCurrentLiveExercise === 'function' && safeQuestion()) || '';

    var waiting = String(p.state || '').toLowerCase() === 'waiting';
    M.stateWaiting = waiting;
    byId('meetKicker').textContent = waiting ? 'Votación cerrada' : 'Pregunta abierta';
    byId('meetClockLabel').textContent = waiting ? 'Tiempo detenido' : 'Tiempo para responder';

    byId('meetAnswered').textContent = answered + ' de ' + (totalP || answered);
    var b = bars(options, rows, p.correctIndex, false);
    byId('meetOptions').innerHTML = b.html;
  }
  function safeTitle() { try { var e = getCurrentLiveExercise(); return e && e.title; } catch (e) { return ''; } }
  function safeQuestion() { try { var e = getCurrentLiveExercise(); return e && e.question; } catch (e) { return ''; } }

  function renderResult(p) {
    var options = optList(p);
    var rows = p.rows || [];
    var ex = p.exercise || {};
    var correctIndex = Number.isInteger(p.correctIndex) ? p.correctIndex : null;
    byId('meetCtxTitle').textContent = ex.title || 'Resultado';
    byId('meetCtxModule').textContent = (typeof courseName === 'function' ? courseName() : 'Capacitación') +
      (FacilitatorLive && FacilitatorLive.sessionCode ? ' · Sesión ' + FacilitatorLive.sessionCode : '');

    var correctBox = byId('meetCorrect');
    if (correctIndex !== null && options[correctIndex] != null) {
      correctBox.hidden = false;
      correctBox.innerHTML = '<span>Respuesta correcta</span><b>' + letter(correctIndex) + '. ' + esc(options[correctIndex]) + '</b>';
    } else {
      correctBox.hidden = true;
      correctBox.innerHTML = '';
    }

    var b = bars(options, rows, correctIndex, true);
    byId('meetTotal').innerHTML = '<b>' + fmtCount(b.total) + '</b><span>respuestas registradas</span>';
    byId('meetBars').innerHTML = b.html;

    var top = podium(p);
    var host = byId('meetPodium');
    if (!top.length) {
      host.innerHTML = '';
      host.hidden = true;
    } else {
      host.hidden = false;
      host.innerHTML = '<div class="meet-podium-h">Las tres primeras personas en responder</div>' +
        top.map(function (x, i) {
          var who = esc(x.name) + (x.agency ? ' <i>· ' + esc(x.agency) + '</i>' : '');
          return '<div class="meet-podium-row p' + (i + 1) + '">' +
            '<span class="meet-medal">' + MEDALS[i] + '</span>' +
            '<span class="meet-podium-name">' + who + '</span>' +
            '<span class="meet-podium-time">' + (x.seconds === null ? 'Tiempo no disponible' : secs(x.seconds)) + '<small>'+esc(x.verdict)+'</small></span>' +
          '</div>';
        }).join('');
    }

    var key = 'res:' + p.exerciseId + ':' + b.total;
    if (M.revealedKey !== key) {
      M.revealedKey = key;
      host.classList.remove('show'); void host.offsetWidth; host.classList.add('show');
      correctBox.classList.remove('show'); void correctBox.offsetWidth; correctBox.classList.add('show');
      byId('meetBars').classList.remove('show'); void byId('meetBars').offsetWidth; byId('meetBars').classList.add('show');
      sfxReveal();
      if (top.length) setTimeout(sfxPodium, 620);
    }
  }

  function renderDone(p) {
    var rows = p.rows || [];
    var options = optList(p);
    var counts = tally(rows, options.length);
    var correct = Number.isInteger(p.correctIndex) ? counts[p.correctIndex] : 0;
    var answered = responders(rows);
    var totalP = Number(p.total) || 0;
    byId('meetCtxTitle').textContent = 'Cierre de capacitación';
    byId('meetCtxModule').textContent = (typeof courseName === 'function' ? courseName() : 'Capacitación') +
      (FacilitatorLive && FacilitatorLive.sessionCode ? ' · Sesión ' + FacilitatorLive.sessionCode : '');
    byId('meetDoneTitle').textContent = (typeof courseName === 'function' ? courseName() : 'Capacitación') + ' finalizada';
    byId('meetDoneStats').innerHTML =
      '<div class="meet-stat"><b>' + fmtCount(totalP) + '</b><span>participantes</span></div>' +
      '<div class="meet-stat"><b>' + fmtCount(answered) + '</b><span>con respuesta</span></div>' +
      '<div class="meet-stat"><b>' + fmtCount(rows.length) + '</b><span>respuestas</span></div>' +
      '<div class="meet-stat"><b>' + fmtCount(correct) + '</b><span>aciertos</span></div>';
    var saved = '';
    try {
      if (window.Evidence && Evidence.current && Evidence.current.savedAt) {
        saved = 'Evidencia guardada: ' + new Date(Evidence.current.savedAt).toLocaleString('es-MX');
      }
    } catch (e) {}
    byId('meetDoneNote').textContent = saved || 'Guarda la evidencia antes de cerrar la sesión.';
  }

  /* ---------------------------------------------------------- CICLO */
  function classify(p) {
    var st = String(p.state || '').trim().toLowerCase();
    var ended = st === 'ended' || (typeof LiveWorkspace !== 'undefined' && LiveWorkspace.ended === true);
    if (ended) return M.pinned ? 'done' : 'off';
    if (!p.exerciseId) return 'off';
    if (st === 'result') return 'result';
    if (st === 'waiting' || st === 'closed') return M.pinned ? 'live' : 'off';
    return 'live';
  }

  function apply() {
    var stage = byId('meetStage');
    var fab = byId('meetFab');
    if (!stage) return;
    if(window.AulaProjection){stage.hidden=true;if(fab)fab.hidden=false;stopClock();return;}
    var p = M.payload;
    var mode = classify(p);
    M.mode = mode;

    var live = byId('meetLive'), result = byId('meetResult'), done = byId('meetDone');
    live.hidden = mode !== 'live';
    result.hidden = mode !== 'result';
    done.hidden = mode !== 'done';
    stage.hidden = mode === 'off';
    if (fab) fab.hidden = mode !== 'off';

    if (mode === 'off') {
      stage.hidden = true;
      stopClock();
      M.revealedKey = '';
      return;
    }
    stage.classList.toggle('is-done', mode === 'done');

    if (mode === 'live') { startClock(); renderLive(p); }
    else stopClock();
    if (mode === 'result') renderResult(p);
    if (mode === 'done') { M.revealedKey = ''; renderDone(p); }
  }

  /* ---------------------------------------------------------- API */
  var api = {
    sync: function (payload) {
      try {
        M.payload = payload || null;
        var key = (payload ? (payload.state + '|' + payload.exerciseId + '|' + (payload.rows || []).length) : '');
        if (key === M.lastKey) return;
        M.lastKey = key;
        apply();
      } catch (e) {}
    },
    notifyEnded: function () {
      try {
        M.pinned = true;
        M.lastKey = '';
        apply();
      } catch (e) {}
    },
    open: function () { M.pinned = true; apply(); },
    close: function () { M.pinned = false; M.lastKey = ''; apply(); }
  };
  window.VentoMeet = api;

  function boot() {
    if (byId('meetStage')) return;
    if (isConsultationView() || (typeof isParticipantView === 'function' && isParticipantView())) return;
    try { build(); } catch (e) {}
    try {
      var base = window.endLiveSession;
      if (typeof base === 'function') {
        window.endLiveSession = function () {
          var out = base.apply(this, arguments);
          return Promise.resolve(out).then(function (r) {
            try { M.pinned = true; M.lastKey = ''; apply(); } catch (e) {}
            return r;
          });
        };
      }
      var baseNew = window.newLiveSession;
      if (typeof baseNew === 'function') {
        window.newLiveSession = function () {
          var r = baseNew.apply(this, arguments);
          try { M.payload = null; M.pinned = false; M.lastKey = ''; M.revealedKey = ''; apply(); } catch (e) {}
          return r;
        };
      }
      var baseSet = window.setLiveState;
      if (typeof baseSet === 'function') {
        window.setLiveState = function (state) {
          try { if (state === 'result') M.pinned = true; } catch (e) {}
          return baseSet.apply(this, arguments);
        };
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();