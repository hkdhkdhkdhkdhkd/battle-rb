/* ==========================================================
   STREET CLASH LIVE · Canvas 渲染
   ========================================================== */
(function () {
  'use strict';

  var W = 1280, H = 720;
  var GROUND = 600;

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function limb(ctx, x1, y1, x2, y2, w, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawStage(ctx, battle, t) {
    var sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, '#120a24');
    sky.addColorStop(0.45, '#2a1230');
    sky.addColorStop(0.8, '#5a1f2c');
    sky.addColorStop(1, '#1a0d18');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, GROUND + 10);

    // 巨月
    var moon = ctx.createRadialGradient(920, 190, 10, 920, 190, 150);
    moon.addColorStop(0, 'rgba(255,214,120,.85)');
    moon.addColorStop(0.35, 'rgba(255,120,80,.28)');
    moon.addColorStop(1, 'rgba(255,80,60,0)');
    ctx.fillStyle = moon;
    ctx.beginPath(); ctx.arc(920, 190, 160, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,226,170,.9)';
    ctx.beginPath(); ctx.arc(920, 190, 62, 0, Math.PI * 2); ctx.fill();

    // 远景楼群
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    ctx.fillStyle = 'rgba(10,6,18,.85)';
    for (var x = -40; x < W + 40; x += 46) {
      var bh = 70 + rnd() * 170;
      ctx.fillRect(x, GROUND - 60 - bh, 40, bh + 60);
      if (rnd() > 0.55) {
        ctx.fillStyle = 'rgba(255,190,90,.16)';
        for (var wy = GROUND - 56 - bh + 12; wy < GROUND - 90; wy += 26) {
          for (var wx = x + 7; wx < x + 34; wx += 12) {
            if (rnd() > 0.55) ctx.fillRect(wx, wy, 5, 8);
          }
        }
        ctx.fillStyle = 'rgba(10,6,18,.85)';
      }
    }
    // 霓虹招牌
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(t * 2) * 0.08;
    ctx.fillStyle = 'rgba(255,59,47,.5)';
    ctx.fillRect(120, 250, 8, 120);
    ctx.fillStyle = 'rgba(61,139,255,.5)';
    ctx.fillRect(1160, 210, 8, 150);
    ctx.restore();

    // 观众席
    ctx.fillStyle = '#0b0712';
    ctx.fillRect(0, GROUND - 74, W, 44);
    for (var cx = 14; cx < W; cx += 30) {
      var ch = 16 + ((cx * 13) % 12);
      ctx.beginPath();
      ctx.arc(cx, GROUND - 60 - (cx % 3) * 3, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // 地面
    var fl = ctx.createLinearGradient(0, GROUND, 0, H);
    fl.addColorStop(0, '#241329');
    fl.addColorStop(1, '#0a0710');
    ctx.fillStyle = fl;
    ctx.fillRect(0, GROUND, W, H - GROUND);

    // 透视线
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth = 1;
    for (var gx = -400; gx <= W + 400; gx += 90) {
      ctx.beginPath();
      ctx.moveTo(W / 2 + (gx - W / 2) * 0.25, GROUND);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (var gy = GROUND + 22; gy < H; gy += 26) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    // 地面高光
    var glow = ctx.createRadialGradient(W / 2, GROUND + 10, 20, W / 2, GROUND + 10, 520);
    glow.addColorStop(0, 'rgba(255,90,80,.16)');
    glow.addColorStop(1, 'rgba(255,90,80,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, GROUND - 10, W, H - GROUND + 10);

    // 场地边界光
    ctx.fillStyle = 'rgba(255,225,77,.18)';
    ctx.fillRect(108, GROUND - 4, 4, 26);
    ctx.fillRect(1168, GROUND - 4, 4, 26);
  }

  function poseOf(f) {
    var crouch = f.crouch || f.state === 'crouch';
    var crouchY = crouch ? 36 : 0;
    var p = {
      crouch: crouch, crouchY: crouchY,
      hip: { x: 0, y: -66 + crouchY },
      shoulder: { x: 0, y: -112 + crouchY },
      head: { x: 2, y: -136 + crouchY },
      lean: 0,
      frontArm: { elbow: { x: 14, y: -96 + crouchY }, hand: { x: 22, y: -116 + crouchY } },
      backArm: { elbow: { x: -14, y: -96 + crouchY }, hand: { x: -6, y: -120 + crouchY } },
      frontLeg: { knee: { x: 16, y: -34 }, foot: { x: 20, y: 0 } },
      backLeg: { knee: { x: -16, y: -34 }, foot: { x: -22, y: 0 } },
      rot: 0
    };
    var t = f.animT;
    if (f.state === 'idle' || f.state === 'block') {
      var bob = Math.sin(t * 3.4) * 2.2;
      p.hip.y += bob; p.shoulder.y += bob; p.head.y += bob;
    }
    if (f.state === 'walk') {
      var sw = Math.sin(f.walkT * 12) * 16;
      p.frontLeg.knee.x = 16 + sw * 0.4; p.frontLeg.foot.x = 20 + sw;
      p.backLeg.knee.x = -16 - sw * 0.4; p.backLeg.foot.x = -22 - sw;
      p.frontArm.hand.x = 22 - sw * 0.5;
      p.hip.y += Math.abs(Math.cos(f.walkT * 12)) * 2;
    }
    if (f.state === 'jump') {
      p.frontLeg.knee.y = -52; p.frontLeg.foot.y = -40; p.frontLeg.foot.x = 18;
      p.backLeg.knee.y = -56; p.backLeg.foot.y = -44; p.backLeg.foot.x = -14;
      p.frontArm.hand.y = -132; p.frontArm.hand.x = 24;
      p.backArm.hand.y = -134; p.backArm.hand.x = -10;
    }
    if (f.state === 'hit') {
      p.lean = -0.14;
      p.head.x = -12;
      p.frontArm.hand.x = 8; p.frontArm.hand.y = -140;
      p.backArm.hand.x = -24; p.backArm.hand.y = -150;
    }
    if (f.state === 'parry') {
      p.frontArm = { elbow: { x: 14, y: -102 }, hand: { x: 30, y: -112 } };
      p.backArm = { elbow: { x: 6, y: -96 }, hand: { x: 24, y: -118 } };
      p.lean = 0.06;
    }
    if (f.state === 'super') {
      p.crouch = true; p.crouchY = 18;
      p.hip.y = -48; p.shoulder.y = -94; p.head.y = -118;
      p.frontArm = { elbow: { x: 22, y: -78 }, hand: { x: 36, y: -60 } };
      p.backArm = { elbow: { x: -20, y: -80 }, hand: { x: -34, y: -64 } };
      p.frontLeg.foot.x = 30; p.backLeg.foot.x = -34;
    }
    if (f.state === 'attack' && f.move) {
      var m = f.move;
      var ext = 0;
      var tt = m.t;
      if (tt >= m.startup) ext = Math.min(1, (tt - m.startup) / Math.max(0.03, m.active));
      else ext = (tt / Math.max(0.03, m.startup)) * 0.35;
      if (tt >= m.startup + m.active) ext = Math.max(0, 1 - (tt - m.startup - m.active) / Math.max(0.05, m.recovery));
      var anim = m.anim || 'punch';

      if (anim === 'punch' || anim === 'heavy' || anim === 'impact' || anim === 'grab') {
        p.frontArm.elbow = { x: 18 + 24 * ext, y: -104 };
        p.frontArm.hand = { x: 26 + 58 * ext, y: -108 - (anim === 'impact' ? 6 : 0) };
        p.lean = 0.1 * ext;
        if (anim === 'heavy' || anim === 'impact') {
          p.backArm.elbow = { x: -18, y: -100 };
          p.backArm.hand = { x: 2 + 30 * ext, y: -104 };
        }
      } else if (anim === 'kick' || anim === 'multi') {
        p.frontLeg.knee = { x: 26 + 16 * ext, y: -52 };
        p.frontLeg.foot = { x: 34 + 62 * ext, y: -62 - 6 * ext };
        p.backLeg.knee = { x: -12, y: -34 };
        p.backLeg.foot = { x: -16, y: 0 };
        p.lean = -0.06 * ext;
      } else if (anim === 'uppercut') {
        p.frontArm.elbow = { x: 20, y: -126 };
        p.frontArm.hand = { x: 16, y: -190 - 24 * ext };
        p.lean = 0.1;
        p.hip.y -= 8 * ext;
      } else if (anim === 'cast') {
        p.frontArm.elbow = { x: 22, y: -104 };
        p.frontArm.hand = { x: 44 + 20 * ext, y: -104 };
        p.backArm.elbow = { x: 16, y: -98 };
        p.backArm.hand = { x: 36, y: -100 };
        p.lean = 0.08;
      } else if (anim === 'buff') {
        p.frontArm.elbow = { x: 18, y: -130 };
        p.frontArm.hand = { x: 20, y: -168 };
        p.backArm.elbow = { x: -18, y: -130 };
        p.backArm.hand = { x: -20, y: -168 };
        p.head.y -= 2;
      } else if (anim === 'dash') {
        p.lean = 0.28;
        p.frontLeg.foot.x = 30; p.backLeg.foot.x = -34;
      }
    }
    if (f.state === 'ko') {
      p.rot = -1.35 * Math.min(1, f.koT || 0.6);
    }
    return p;
  }

  function drawFighter(ctx, f, battle) {
    // 影子
    var airH = Math.max(0, GROUND - f.y);
    var shAlpha = 0.45 * (1 - airH / 400);
    if (shAlpha > 0.03) {
      ctx.fillStyle = 'rgba(0,0,0,' + shAlpha + ')';
      ctx.beginPath();
      ctx.ellipse(f.x, GROUND + 4, 42 - airH * 0.04, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    var hue = f.def.hue;
    var suit = 'hsl(' + hue + ',70%,50%)';
    var suitDark = 'hsl(' + hue + ',60%,34%)';
    var skin = '#e6b489';
    var p = poseOf(f);

    ctx.save();
    ctx.translate(f.x, f.y);

    // 气场：能量满 / 超必杀 / 燃烧
    if (f.meter >= 100 || f.state === 'super') {
      var aura = ctx.createRadialGradient(0, -90, 10, 0, -90, 92);
      aura.addColorStop(0, 'hsla(' + hue + ',100%,65%,.0)');
      aura.addColorStop(0.55, 'hsla(' + hue + ',100%,65%,.22)');
      aura.addColorStop(1, 'hsla(' + hue + ',100%,65%,0)');
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.ellipse(0, -86, 78 + Math.sin(battle.t * 8) * 5, 108, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (f.burned > 0) {
      ctx.strokeStyle = 'rgba(255,80,50,' + (0.4 + Math.sin(battle.t * 18) * 0.2) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, -80, 52, 96, 0, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.scale(f.facing, 1);
    if (p.rot) ctx.rotate(p.rot);
    if (f.state === 'ko') ctx.translate(0, 26);
    if (p.lean) ctx.rotate(p.lean * 0.35);

    // 后腿
    limb(ctx, p.hip.x - 8, p.hip.y, p.backLeg.knee.x, p.backLeg.knee.y, 14, suitDark);
    limb(ctx, p.backLeg.knee.x, p.backLeg.knee.y, p.backLeg.foot.x, p.backLeg.foot.y, 12, suitDark);
    ctx.fillStyle = '#1a1a22';
    ctx.beginPath(); ctx.ellipse(p.backLeg.foot.x + 4, p.backLeg.foot.y - 3, 13, 6, 0, 0, Math.PI * 2); ctx.fill();

    // 后臂
    limb(ctx, p.shoulder.x - 10, p.shoulder.y + 6, p.backArm.elbow.x, p.backArm.elbow.y, 11, suitDark);
    limb(ctx, p.backArm.elbow.x, p.backArm.elbow.y, p.backArm.hand.x, p.backArm.hand.y, 10, skin);
    ctx.fillStyle = '#f3c9a0';
    ctx.beginPath(); ctx.arc(p.backArm.hand.x, p.backArm.hand.y, 7, 0, Math.PI * 2); ctx.fill();

    // 躯干
    ctx.fillStyle = suit;
    rr(ctx, -19, p.shoulder.y - 2, 38, p.hip.y - p.shoulder.y + 12, 12);
    ctx.fill();
    // 衣领
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath();
    ctx.moveTo(-12, p.shoulder.y - 2);
    ctx.lineTo(0, p.shoulder.y + 20);
    ctx.lineTo(12, p.shoulder.y - 2);
    ctx.closePath(); ctx.fill();
    // 腰带
    ctx.fillStyle = '#111117';
    ctx.fillRect(-20, p.hip.y - 4, 40, 9);
    ctx.fillStyle = 'hsl(' + hue + ',85%,62%)';
    ctx.fillRect(-20, p.hip.y - 1, 40, 2);

    // 前腿
    limb(ctx, p.hip.x + 6, p.hip.y, p.frontLeg.knee.x, p.frontLeg.knee.y, 15, suit);
    limb(ctx, p.frontLeg.knee.x, p.frontLeg.knee.y, p.frontLeg.foot.x, p.frontLeg.foot.y, 13, suit);
    ctx.fillStyle = '#22222c';
    ctx.beginPath(); ctx.ellipse(p.frontLeg.foot.x + 4, p.frontLeg.foot.y - 3, 14, 6, 0, 0, Math.PI * 2); ctx.fill();

    // 头
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(p.head.x, p.head.y, 17, 0, Math.PI * 2); ctx.fill();
    // 头发
    ctx.fillStyle = '#17131c';
    ctx.beginPath();
    ctx.arc(p.head.x, p.head.y - 4, 17, Math.PI * 1.02, Math.PI * 1.98);
    ctx.fill();
    // 头带
    ctx.strokeStyle = 'hsl(' + hue + ',85%,58%)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(p.head.x - 17, p.head.y - 3);
    ctx.lineTo(p.head.x + 17, p.head.y - 6);
    ctx.stroke();
    // 飘带
    ctx.strokeStyle = 'hsl(' + hue + ',85%,58%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.head.x - 16, p.head.y - 4);
    ctx.quadraticCurveTo(p.head.x - 32, p.head.y + 2 + Math.sin(battle.t * 7) * 4, p.head.x - 40, p.head.y + 14);
    ctx.stroke();
    // 眼睛
    ctx.fillStyle = '#0d0d12';
    ctx.fillRect(p.head.x + 7, p.head.y - 3, 4, 3);

    // 前臂
    limb(ctx, p.shoulder.x + 10, p.shoulder.y + 6, p.frontArm.elbow.x, p.frontArm.elbow.y, 12, suit);
    limb(ctx, p.frontArm.elbow.x, p.frontArm.elbow.y, p.frontArm.hand.x, p.frontArm.hand.y, 11, skin);
    ctx.fillStyle = '#f3c9a0';
    ctx.beginPath(); ctx.arc(p.frontArm.hand.x, p.frontArm.hand.y, 8, 0, Math.PI * 2); ctx.fill();

    // 手套 / 拳套
    ctx.fillStyle = 'hsl(' + hue + ',80%,58%)';
    ctx.beginPath(); ctx.arc(p.frontArm.hand.x, p.frontArm.hand.y, 8, 0, Math.PI * 2); ctx.fill();

    // 腿法光效
    if (f.state === 'attack' && f.move && (f.move.anim === 'kick' || f.move.anim === 'multi')) {
      ctx.strokeStyle = 'hsla(' + hue + ',100%,72%,.7)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.hip.x, p.hip.y + 4, 70, -0.9, 0.7);
      ctx.stroke();
    }

    ctx.restore();

    // 防御光盾
    if (f.state === 'block' || f.parry > 0) {
      ctx.save();
      ctx.globalAlpha = f.parry > 0 ? 0.9 : 0.5;
      ctx.strokeStyle = f.parry > 0 ? '#ffe14d' : '#8fc0ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(f.x + f.facing * 24, f.y - 96, 44, -1.1, 1.1);
      ctx.stroke();
      ctx.restore();
    }

    // 命中闪白
    if (f.hitFlash > 0.05) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = f.hitFlash * 0.25;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y - 80, 34, 84, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 护盾
    if (f.shield > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(125,211,252,.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(f.x, f.y - 82, 46, 88, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawProjectiles(ctx, battle) {
    for (var i = 0; i < battle.projectiles.length; i++) {
      var p = battle.projectiles[i];
      var hue = p.hue;
      // 拖尾
      for (var k = 1; k <= 5; k++) {
        ctx.save();
        ctx.globalAlpha = 0.16 / k;
        ctx.fillStyle = 'hsl(' + hue + ',100%,70%)';
        ctx.beginPath();
        ctx.arc(p.x - p.vx * 0.02 * k, p.y, p.r * (1 - k * 0.1), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      var g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.r);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.4, 'hsl(' + hue + ',100%,72%)');
      g.addColorStop(1, 'hsla(' + hue + ',100%,60%,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'hsla(' + hue + ',100%,82%,.85)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawSparks(ctx, battle) {
    for (var i = 0; i < battle.sparks.length; i++) {
      var s = battle.sparks[i];
      var a = Math.max(0, s.life / s.max);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (0.5 + (1 - a) * 0.8), 0, Math.PI * 2);
      ctx.fill();
      if (s.size > 22) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (1.1 + (1 - a) * 1.6), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawPops(ctx, battle) {
    for (var i = 0; i < battle.pops.length; i++) {
      var p = battle.pops[i];
      var a = Math.min(1, p.life / (p.max * 0.6));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = '900 ' + p.size + 'px Impact, "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,.75)';
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    }
  }

  function drawCombo(ctx, battle) {
    for (var i = 0; i < 2; i++) {
      var f = battle.f[i];
      if (f.combo >= 2 && f.comboTimer > 0) {
        var x = f.x;
        var y = f.y - 220;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '900 30px Impact, "Arial Black", sans-serif';
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(0,0,0,.7)';
        ctx.strokeText(f.combo + ' HIT', x, y);
        ctx.fillStyle = '#ffe14d';
        ctx.fillText(f.combo + ' HIT', x, y);
        ctx.font = '900 13px "PingFang SC", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        ctx.fillText('COMBO', x, y + 18);
        ctx.restore();
      }
    }
  }

  function drawSuper(ctx, battle) {
    var s = battle.superFx;
    if (!s) return;
    var att = battle.f[s.owner];
    var hue = att.def.hue;
    var prog = Math.min(1, s.t / s.dur);

    ctx.save();
    ctx.fillStyle = 'rgba(4,2,10,.42)';
    ctx.fillRect(0, 0, W, H);

    // 放射线
    ctx.translate(W / 2, 330);
    ctx.globalAlpha = 0.5;
    for (var i = 0; i < 28; i++) {
      var ang = (i / 28) * Math.PI * 2 + battle.t * 0.6;
      ctx.strokeStyle = 'hsla(' + hue + ',100%,65%,.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 120, Math.sin(ang) * 120);
      ctx.lineTo(Math.cos(ang) * 700, Math.sin(ang) * 700);
      ctx.stroke();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 角色特写光
    var g = ctx.createRadialGradient(att.x, att.y - 110, 20, att.x, att.y - 110, 260);
    g.addColorStop(0, 'hsla(' + hue + ',100%,65%,.55)');
    g.addColorStop(1, 'hsla(' + hue + ',100%,65%,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(att.x, att.y - 110, 260, 0, Math.PI * 2); ctx.fill();

    // 超必杀名字
    var name = att.def.super.n;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 62px Impact, "Arial Black", sans-serif';
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0,0,0,.8)';
    var scale = 0.9 + Math.sin(Math.min(1, s.t * 3) * Math.PI / 2) * 0.12;
    ctx.translate(W / 2, 128);
    ctx.scale(scale, scale);
    ctx.strokeText(name, 0, 0);
    var grad = ctx.createLinearGradient(0, -50, 0, 20);
    grad.addColorStop(0, '#fff7cf');
    grad.addColorStop(1, 'hsl(' + hue + ',100%,62%)');
    ctx.fillStyle = grad;
    ctx.fillText(name, 0, 0);
    ctx.font = '900 20px "PingFang SC", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.strokeStyle = 'rgba(0,0,0,.7)';
    ctx.lineWidth = 4;
    ctx.strokeText('SUPER ART', 0, 34);
    ctx.fillText('SUPER ART', 0, 34);
    ctx.restore();

    // 进度条
    ctx.fillStyle = 'rgba(255,255,255,.15)';
    ctx.fillRect(W / 2 - 240, 176, 480, 4);
    ctx.fillStyle = 'hsl(' + hue + ',100%,65%)';
    ctx.fillRect(W / 2 - 240, 176, 480 * prog, 4);
    ctx.restore();
  }

  function draw(ctx, battle, now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var sh = battle.shake;
    if (sh > 0.2) {
      ctx.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh);
    }

    drawStage(ctx, battle, now);

    // 角色按 y 排序（空中在后面？简单按 y）
    var order = battle.f.slice().sort(function (a, b) { return a.y - b.y; });
    for (var i = 0; i < order.length; i++) drawFighter(ctx, order[i], battle);

    drawProjectiles(ctx, battle);
    drawSparks(ctx, battle);
    drawPops(ctx, battle);
    drawCombo(ctx, battle);

    if (battle.superFlash > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.85, battle.superFlash);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    drawSuper(ctx, battle);

    // 屏幕边缘暗角
    var vig = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 780);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  window.Renderer = { draw: draw, W: W, H: H, GROUND: GROUND };
})();
