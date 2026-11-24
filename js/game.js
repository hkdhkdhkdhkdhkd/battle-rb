/* ==========================================================
   STREET CLASH LIVE · 界面 / 输入 / 流程
   ========================================================== */
(function () {
  'use strict';

  var ROSTER = window.ROSTER || [];
  var Fight = window.Fight;
  var Renderer = window.Renderer;

  function $(id) { return document.getElementById(id); }

  var els = {
    screens: document.querySelectorAll('.screen'),
    grid: $('roster-grid'),
    filters: $('filters'),
    detail: $('detail'),
    picked: $('picked-info'),
    pickerChip: $('picker-chip'),
    lock: $('btn-lock'),
    stageWrap: $('stage-wrap'),
    canvas: $('game'),
    stageMsg: $('stage-msg'),
    overlay: $('overlay'),
    ovKicker: $('ov-kicker'),
    ovTitle: $('ov-title'),
    ovSub: $('ov-sub'),
    ovActions: $('ov-actions'),
    timer: $('timer'),
    roundLabel: $('round-label'),
    pips: $('pips')
  };
  var ctx = els.canvas.getContext('2d');

  var S = {
    screen: 'title',
    picks: [null, null],
    locked: [false, false],
    picker: 0,
    filter: '全部',
    battle: null,
    paused: false,
    overlayOpen: false,
    endPending: false,
    endTimer: 0,
    lastPhase: '',
    lastMsg: '',
    hpShow: [100, 100],
    last: 0
  };

  var FILTERS = ['全部', '均衡', '速攻', '重装', '技巧', '远程'];

  /* ---------------- 键位 ---------------- */
  var P1MAP = {
    left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'],
    light: ['KeyJ'], heavy: ['KeyK'], kick: ['KeyL'],
    impact: ['KeyE'], parry: ['KeyR'], rush: ['KeyF'], super: ['Space'],
    skills: [['KeyU'], ['KeyI'], ['KeyO'], ['KeyP']]
  };
  var P2MAP = {
    left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'],
    light: ['Digit1', 'Numpad1'], heavy: ['Digit2', 'Numpad2'], kick: ['Digit3', 'Numpad3'],
    impact: ['Digit4', 'Numpad4'], parry: ['Digit5', 'Numpad5'], rush: ['Digit6', 'Numpad6'],
    super: ['Enter', 'NumpadEnter'],
    skills: [['Digit7', 'Numpad7'], ['Digit8', 'Numpad8'], ['Digit9', 'Numpad9'], ['Digit0', 'Numpad0']]
  };
  var GAME_KEYS = {};
  [P1MAP, P2MAP].forEach(function (m) {
    Object.keys(m).forEach(function (k) {
      if (k === 'skills') m.skills.forEach(function (arr) { arr.forEach(function (c) { GAME_KEYS[c] = 1; }); });
      else m[k].forEach(function (c) { GAME_KEYS[c] = 1; });
    });
  });
  GAME_KEYS.Escape = 1;

  var held = new Set();
  var pressed = new Set();

  window.addEventListener('keydown', function (e) {
    if (S.screen === 'battle' && GAME_KEYS[e.code]) e.preventDefault();
    if (e.repeat) return;
    held.add(e.code);
    pressed.add(e.code);
    if (e.code === 'Escape' && S.screen === 'battle' && S.battle) togglePause();
  });
  window.addEventListener('keyup', function (e) {
    held.delete(e.code);
  });
  window.addEventListener('blur', function () {
    held.clear();
    pressed.clear();
  });

  function isHeld(arr) { for (var i = 0; i < arr.length; i++) if (held.has(arr[i])) return true; return false; }
  function wasPressed(arr) { for (var i = 0; i < arr.length; i++) if (pressed.has(arr[i])) return true; return false; }

  function buildInput(map) {
    return {
      held: {
        left: isHeld(map.left), right: isHeld(map.right),
        up: isHeld(map.up), down: isHeld(map.down)
      },
      press: {
        up: wasPressed(map.up),
        light: wasPressed(map.light), heavy: wasPressed(map.heavy), kick: wasPressed(map.kick),
        impact: wasPressed(map.impact), parry: wasPressed(map.parry), rush: wasPressed(map.rush),
        super: wasPressed(map.super),
        skills: map.skills.map(wasPressed)
      }
    };
  }

  /* ---------------- 屏幕 ---------------- */
  function show(name) {
    S.screen = name;
    els.screens.forEach(function (s) {
      s.classList.toggle('active', s.id === 'screen-' + name);
    });
    if (name === 'battle') requestAnimationFrame(fitCanvas);
  }

  function fitCanvas() {
    var r = els.stageWrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var scale = Math.min(r.width / 1280, r.height / 720);
    els.canvas.style.width = Math.round(1280 * scale) + 'px';
    els.canvas.style.height = Math.round(720 * scale) + 'px';
  }
  window.addEventListener('resize', fitCanvas);

  /* ---------------- 选人 ---------------- */
  function buildFilters() {
    els.filters.innerHTML = FILTERS.map(function (f) {
      return '<button class="chip' + (f === S.filter ? ' active' : '') + '" data-f="' + f + '">' + f + '</button>';
    }).join('');
  }

  function rosterList() {
    return ROSTER.filter(function (f) { return S.filter === '全部' || f.tag === S.filter; });
  }

  function cardHTML(f) {
    var cls = 'card';
    if (S.picks[0] === f) cls += ' is-p1';
    if (S.picks[1] === f) cls += ' is-p2';
    return '<button class="' + cls + '" style="--h:' + f.hue + '" data-id="' + f.id + '">' +
      '<span class="card-art"><span class="card-kanji">' + f.kanji + '</span></span>' +
      '<span class="card-tag">' + f.tag + '</span>' +
      '<span class="card-badge">' + (S.picks[1] === f && S.picks[0] !== f ? 'P2' : (S.picks[0] === f && S.picks[1] === f ? 'P1/2' : (S.picks[0] === f ? 'P1' : 'P2'))) + '</span>' +
      '<span class="card-name"><b>' + f.name + '</b><small>' + f.en + '</small></span>' +
      '</button>';
  }

  function renderGrid() {
    els.grid.innerHTML = rosterList().map(cardHTML).join('');
  }

  function renderPicked() {
    var a = S.picks[0], b = S.picks[1];
    var txt = '';
    if (a) txt += '<span class="pick p1"><b>' + a.name + '</b> ' + a.style + '</span>';
    else txt += '<span class="pick p1 muted">P1 待选择</span>';
    if (b) txt += '<span class="pick p2"><b>' + b.name + '</b> ' + b.style + '</span>';
    else txt += '<span class="pick p2 muted">P2 待选择</span>';
    els.picked.innerHTML = txt;

    els.pickerChip.textContent = S.picker === 0 ? 'P1 选择中' : 'P2 选择中';
    els.pickerChip.classList.toggle('p2', S.picker === 1);
    els.lock.textContent = S.picker === 0 ? 'P1 锁定' : 'P2 锁定';
    els.lock.disabled = !S.picks[S.picker];
  }

  function statBar(label, val, max) {
    var pct = Math.round(Math.min(100, val / max * 100));
    return '<div class="stat"><span class="stat-label">' + label + '</span>' +
      '<span class="stat-track"><i style="width:' + pct + '%"></i></span>' +
      '<span class="stat-num">' + val + '</span></div>';
  }

  function renderDetail(f) {
    if (!f) {
      els.detail.innerHTML = '<div class="detail-empty">选择一名角色查看详情</div>';
      return;
    }
    var keys = S.picker === 0 ? ['U', 'I', 'O', 'P'] : ['7', '8', '9', '0'];
    var skills = f.skills.map(function (s, i) {
      return '<div class="skill-item">' +
        '<span class="sk-key">' + keys[i] + '</span>' +
        '<div class="sk-body"><div class="sk-head"><b>' + s.n + '</b>' +
        '<span class="sk-cost">' + (s.c ? '驱动 ' + s.c : '无消耗') + (s.cd ? ' · 冷却 ' + s.cd + 's' : '') + '</span></div>' +
        '<p>' + s.d + '</p></div></div>';
    }).join('');
    els.detail.innerHTML =
      '<div class="detail-hero" style="--h:' + f.hue + '">' +
        '<div class="detail-emblem"><span>' + f.kanji + '</span></div>' +
        '<div class="detail-id"><h2>' + f.name + '</h2>' +
        '<div class="detail-en">' + f.en + '</div>' +
        '<div class="detail-meta">' + f.style + ' · <em>' + f.tag + '</em></div></div>' +
      '</div>' +
      '<div class="stats">' +
        statBar('体力', f.hp, 116) + statBar('攻击', f.atk, 14) +
        statBar('防御', f.def, 13) + statBar('速度', f.spd, 14) +
      '</div>' +
      '<div class="skill-title">专属技能 <span>SPECIALS</span></div>' +
      '<div class="skill-list">' + skills + '</div>' +
      '<div class="super-card" style="--h:' + f.hue + '">' +
        '<div class="super-head"><span>超必杀</span><b>' + f.super.n + '</b></div>' +
        '<p>' + f.super.d + '</p>' +
      '</div>';
  }

  function pick(f) {
    if (S.locked[S.picker]) return;
    S.picks[S.picker] = f;
    renderGrid();
    renderDetail(f);
    renderPicked();
  }

  function lockPick() {
    if (S.locked[S.picker]) return;
    if (!S.picks[S.picker]) {
      els.pickerChip.classList.add('shake');
      setTimeout(function () { els.pickerChip.classList.remove('shake'); }, 400);
      return;
    }
    S.locked[S.picker] = true;
    if (S.picker === 0) {
      S.picker = 1;
      renderGrid();
      renderDetail(S.picks[1]);
      renderPicked();
      els.pickerChip.classList.add('flash');
      setTimeout(function () { els.pickerChip.classList.remove('flash'); }, 500);
    } else {
      startBattle();
    }
  }

  function resetSelect() {
    S.picks = [null, null];
    S.locked = [false, false];
    S.picker = 0;
    S.filter = '全部';
    buildFilters();
    renderGrid();
    renderDetail(null);
    renderPicked();
  }

  els.filters.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    S.filter = b.dataset.f;
    buildFilters();
    renderGrid();
  });

  els.grid.addEventListener('click', function (e) {
    var card = e.target.closest('.card');
    if (!card) return;
    var f = ROSTER.find(function (x) { return x.id === card.dataset.id; });
    if (f) pick(f);
  });

  $('btn-lock').addEventListener('click', lockPick);
  $('btn-random').addEventListener('click', function () {
    if (S.locked[S.picker]) return;
    var pool = rosterList();
    if (!pool.length) return;
    pick(pool[Math.floor(Math.random() * pool.length)]);
  });
  $('btn-reset').addEventListener('click', resetSelect);
  $('btn-start').addEventListener('click', function () { resetSelect(); show('select'); });
  $('btn-back-title').addEventListener('click', function () { show('title'); });
  $('btn-rules').addEventListener('click', function () { $('rules-modal').classList.add('show'); });
  $('btn-close-rules').addEventListener('click', function () { $('rules-modal').classList.remove('show'); });
  $('rules-modal').addEventListener('click', function (e) {
    if (e.target === $('rules-modal')) $('rules-modal').classList.remove('show');
  });

  /* ---------------- 战斗 HUD ---------------- */
  function setupBattleHUD() {
    var b = S.battle;
    for (var i = 0; i < 2; i++) {
      var f = b.f[i];
      $('name-' + i).textContent = f.def.name;
      $('style-' + i).textContent = f.def.style;
      $('hp-fill-' + i).style.width = '100%';
      $('hp-trail-' + i).style.width = '100%';
      $('hp-text-' + i).textContent = Math.ceil(f.hp);
      $('meter-fill-' + i).style.width = '0%';
      S.hpShow[i] = 100;
      var dr = $('drive-' + i);
      var html = '';
      for (var d = 0; d < Fight.MAX_DRIVE; d++) html += '<i><b></b></i>';
      dr.innerHTML = html;
    }
    els.pips.innerHTML =
      '<span class="pip" data-p="0"></span><span class="pip" data-p="0"></span>' +
      '<span class="psep"></span>' +
      '<span class="pip" data-p="1"></span><span class="pip" data-p="1"></span>';
    els.overlay.classList.remove('show');
  }

  function updateHUD(dt) {
    var b = S.battle;
    for (var i = 0; i < 2; i++) {
      var f = b.f[i];
      var pct = Math.max(0, f.hp / f.maxHp * 100);
      $('hp-fill-' + i).style.width = pct + '%';
      S.hpShow[i] = Math.max(pct, S.hpShow[i] - dt * 42);
      $('hp-trail-' + i).style.width = S.hpShow[i] + '%';
      $('hp-text-' + i).textContent = Math.max(0, Math.ceil(f.hp));
      var pips = $('drive-' + i).children;
      for (var d = 0; d < pips.length; d++) {
        var v = Math.max(0, Math.min(1, f.drive - d));
        pips[d].firstChild.style.width = (v * 100) + '%';
      }
      $('drive-' + i).classList.toggle('burning', f.burned > 0);
      $('meter-fill-' + i).style.width = Math.min(100, f.meter) + '%';
      $('meter-fill-' + i).parentElement.classList.toggle('full', f.meter >= 100);
    }
    var t = Math.ceil(b.time);
    els.timer.textContent = t < 10 ? '0' + t : String(t);
    els.timer.classList.toggle('low', b.time <= 10);
    els.roundLabel.textContent = 'ROUND ' + b.round;
    var pipsEls = els.pips.querySelectorAll('.pip');
    var c0 = 0, c1 = 0;
    for (var k = 0; k < pipsEls.length; k++) {
      var p = +pipsEls[k].dataset.p;
      var need = p === 0 ? b.score[0] : b.score[1];
      var idx = p === 0 ? (c0++) : (c1++);
      pipsEls[k].classList.toggle('on', idx < need);
    }
  }

  function startBattle() {
    S.battle = Fight.createBattle(S.picks[0], S.picks[1]);
    S.paused = false;
    S.overlayOpen = false;
    S.endPending = false;
    S.lastPhase = 'intro';
    S.lastMsg = '';
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    setupBattleHUD();
    updateHUD(0);
    show('battle');
    showMsg('ROUND 1');
  }

  /* ---------------- 舞台文字 ---------------- */
  var msgTimer = null;
  function showMsg(text, cls) {
    els.stageMsg.textContent = text;
    els.stageMsg.className = 'stage-msg show ' + (cls || '');
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = setTimeout(function () {
      els.stageMsg.className = 'stage-msg ' + (cls || '');
    }, 900);
  }

  /* ---------------- 覆盖层 ---------------- */
  function openOverlay(kicker, title, sub, actions) {
    els.ovKicker.textContent = kicker;
    els.ovTitle.textContent = title;
    els.ovSub.innerHTML = sub || '';
    els.ovActions.innerHTML = '';
    actions.forEach(function (a) {
      var btn = document.createElement('button');
      btn.className = 'btn ' + (a.primary ? 'btn-hero' : 'btn-ghost');
      btn.textContent = a.label;
      btn.addEventListener('click', function () { btn.blur(); a.fn(); });
      els.ovActions.appendChild(btn);
    });
    els.overlay.classList.add('show');
    S.overlayOpen = true;
  }

  function closeOverlay() {
    els.overlay.classList.remove('show');
    S.overlayOpen = false;
  }

  function showRoundEnd() {
    var b = S.battle;
    var r = b.lastRound || { kind: 'ko', winner: 0 };
    var title = r.kind === 'time' ? 'TIME UP' : 'K.O.';
    if (r.winner == null) title = 'DRAW';
    var sub = r.winner == null
      ? '本回合平局，比分不变<br><span class="ov-score">' + b.score[0] + ' : ' + b.score[1] + '</span>'
      : '<b>' + b.f[r.winner].def.name + '</b> 拿下第 ' + b.round + ' 回合<br><span class="ov-score">' + b.score[0] + ' : ' + b.score[1] + '</span>';
    openOverlay('ROUND ' + b.round, title, sub, [{
      label: '下一回合 →',
      primary: true,
      fn: function () {
        closeOverlay();
        b.nextRound();
        S.endPending = false;
        S.lastPhase = 'intro';
        S.lastMsg = '';
        updateHUD(0);
        showMsg('ROUND ' + b.round);
      }
    }]);
  }

  function showMatchEnd() {
    var b = S.battle;
    var w = b.matchWinner;
    openOverlay('MATCH RESULT', 'WINNER',
      '<b>P' + (w + 1) + ' · ' + b.f[w].def.name + '</b><br><span class="ov-score">最终比分 ' + b.score[0] + ' : ' + b.score[1] + '</span>',
      [
        { label: '再战一场', primary: true, fn: function () { closeOverlay(); startBattle(); } },
        { label: '更换角色', fn: function () { closeOverlay(); resetSelect(); show('select'); } },
        { label: '返回标题', fn: function () { closeOverlay(); show('title'); } }
      ]);
  }

  function togglePause() {
    if (S.overlayOpen) {
      if (S.paused) { closeOverlay(); S.paused = false; }
      return;
    }
    S.paused = !S.paused;
    if (S.paused) {
      openOverlay('PAUSED', '暂停', '按 ESC 继续',
        [
          { label: '继续', primary: true, fn: function () { closeOverlay(); S.paused = false; } },
          { label: '重新开始', fn: function () { closeOverlay(); startBattle(); } },
          { label: '返回标题', fn: function () { closeOverlay(); show('title'); } }
        ]);
    }
  }

  /* ---------------- 主循环 ---------------- */
  function loop(ts) {
    requestAnimationFrame(loop);
    var dt = S.last ? Math.min(0.033, (ts - S.last) / 1000) : 0.016;
    S.last = ts;

    if (S.screen === 'battle' && S.battle) {
      var b = S.battle;

      if (!S.paused && !S.overlayOpen) {
        b.update(dt, [buildInput(P1MAP), buildInput(P2MAP)]);
        updateHUD(dt);

        if (b.phase === 'intro' && b.msg !== S.lastMsg) {
          S.lastMsg = b.msg;
          showMsg(b.msg);
        }
        if (S.lastPhase === 'intro' && b.phase === 'fight') {
          showMsg('FIGHT!', 'fight');
          S.lastPhase = 'fight';
        }
        if (b.phase === 'fight') S.lastPhase = 'fight';

        if ((b.phase === 'roundOver' || b.phase === 'matchOver') && !S.endPending) {
          S.endPending = true;
          S.endTimer = 0.85;
          showMsg(b.lastRound && b.lastRound.kind === 'time' ? 'TIME UP' : 'K.O.', 'ko');
        }
        if (S.endPending) {
          S.endTimer -= dt;
          if (S.endTimer <= 0 && !S.overlayOpen) {
            if (b.phase === 'matchOver') showMatchEnd();
            else showRoundEnd();
          }
        }
      } else if (!S.overlayOpen) {
        updateHUD(dt);
      }

      Renderer.draw(ctx, b, performance.now() / 1000);
    }

    pressed.clear();
  }

  /* ---------------- 初始化 ---------------- */
  buildFilters();
  renderGrid();
  renderPicked();
  requestAnimationFrame(loop);
})();
