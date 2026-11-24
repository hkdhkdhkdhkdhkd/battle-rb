/* ==========================================================
   STREET CLASH LIVE · 实时战斗引擎
   两名玩家同屏 1v1，可移动 / 跳跃 / 攻击 / 技能 / 超必杀
   ========================================================== */
(function () {
  'use strict';

  var GROUND = 600;
  var STAGE_L = 120;
  var STAGE_R = 1160;
  var GRAVITY = 2300;
  var ROUND_TIME = 99;
  var MAX_DRIVE = 6;
  var MAX_METER = 100;

  var NORMALS = {
    light: { key: 'light', name: '轻拳', startup: .06, active: .07, recovery: .13, dmg: 4.8, range: 68, y: -152, h: 72, kb: 70, hitstun: .18, blockstun: .12, meter: 7, anim: 'punch', kind: 'normal' },
    heavy: { key: 'heavy', name: '重拳', startup: .13, active: .09, recovery: .28, dmg: 10, range: 84, y: -158, h: 84, kb: 170, hitstun: .34, blockstun: .2, meter: 11, anim: 'heavy', kind: 'normal' },
    kick: { key: 'kick', name: '踢击', startup: .1, active: .1, recovery: .22, dmg: 7.4, range: 104, y: -124, h: 70, kb: 135, hitstun: .25, blockstun: .16, meter: 9, anim: 'kick', kind: 'normal' }
  };

  var IMPACT = {
    name: '驱动爆发', startup: .22, active: .09, recovery: .42, dmg: 13, range: 90,
    y: -160, h: 100, kb: 230, hitstun: .5, blockstun: .5, meter: 12, anim: 'impact', kind: 'impact'
  };

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function hitboxOf(f, m) {
    var range = m.range || 80;
    return {
      x: f.facing > 0 ? f.x + 8 : f.x - 8 - range,
      y: f.y + (m.y || -150),
      w: range,
      h: m.h || 80
    };
  }
  function hurtboxOf(f) {
    var h = f.crouch && !f.airborne ? 104 : 156;
    return { x: f.x - 30, y: f.y - h, w: 60, h: h };
  }

  function makeFighter(def, player, x, facing) {
    return {
      def: def, player: player, x: x, y: GROUND, vx: 0, vy: 0, facing: facing,
      hp: def.hp, maxHp: def.hp,
      drive: MAX_DRIVE, driveDelay: 0, burned: 0,
      meter: 0,
      state: 'idle', stateT: 0, move: null,
      hitstun: 0, blockstun: 0, stun: 0, invuln: 0, armor: 0, parry: 0,
      counter: 0, rush: 0, shield: 0, atkBuff: 0, defBuff: 0, regen: 0,
      dots: [], cds: [0, 0, 0, 0],
      crouch: false, airborne: false,
      combo: 0, comboTimer: 0, hitFlash: 0,
      animT: Math.random() * 4, walkT: 0,
      holdingBack: false, koT: 0
    };
  }

  function resetFighter(f, x, facing) {
    f.x = x; f.y = GROUND; f.vx = 0; f.vy = 0; f.facing = facing;
    f.hp = f.maxHp; f.drive = MAX_DRIVE; f.driveDelay = 0; f.burned = 0;
    f.meter = 0; f.state = 'idle'; f.stateT = 0; f.move = null;
    f.hitstun = 0; f.blockstun = 0; f.stun = 0; f.invuln = 0; f.armor = 0; f.parry = 0;
    f.counter = 0; f.rush = 0; f.shield = 0; f.atkBuff = 0; f.defBuff = 0; f.regen = 0;
    f.dots = []; f.cds = [0, 0, 0, 0]; f.crouch = false; f.airborne = false;
    f.combo = 0; f.comboTimer = 0; f.hitFlash = 0; f.koT = 0; f.walkT = 0;
  }

  function skillKind(sk) {
    var e = sk.e || [];
    if (!sk.p) return 'buff';
    if (e.indexOf('multi') >= 0) return 'multi';
    if (e.indexOf('unguard') >= 0 && sk.p >= 1.7) return 'grab';
    if (e.indexOf('counter') >= 0) return 'uppercut';
    if (e.indexOf('burn') >= 0 || e.indexOf('bleed') >= 0 || e.indexOf('drainSuper') >= 0) return 'projectile';
    if (e.indexOf('pierce') >= 0 && sk.p <= 1.4) return 'projectile';
    return 'strike';
  }

  function Battle(defA, defB) {
    this.f = [makeFighter(defA, 0, 430, 1), makeFighter(defB, 1, 850, -1)];
    this.round = 1;
    this.score = [0, 0];
    this.phase = 'intro';
    this.phaseT = 1.5;
    this.time = ROUND_TIME;
    this.hitstop = 0;
    this.shake = 0;
    this.sparks = [];
    this.pops = [];
    this.projectiles = [];
    this.superFx = null;
    this.superFlash = 0;
    this.matchWinner = null;
    this.lastRound = null;
    this.t = 0;
    this.roundOverT = 0;
    this.msg = 'ROUND 1';
  }

  Battle.prototype.update = function (dt, inputs) {
    dt = Math.min(dt || 0, 0.033);
    this.t += dt;
    this.updateFx(dt);

    if (this.phase === 'intro') {
      this.phaseT -= dt;
      if (this.phaseT <= 0) {
        this.phase = 'fight';
        this.msg = 'FIGHT!';
        this.superFlash = 0.12;
      }
      return;
    }
    if (this.phase !== 'fight') {
      this.roundOverT += dt;
      return;
    }

    if (this.hitstop > 0) { this.hitstop -= dt; return; }

    // 读取防御姿态（后退方向）
    for (var i = 0; i < 2; i++) {
      var inp = inputs[i];
      var fi = this.f[i];
      fi.holdingBack = fi.facing > 0 ? !!inp.held.left : !!inp.held.right;
    }

    if (this.superFx) {
      this.updateSuper(dt);
      this.checkKO();
      return;
    }

    this.time -= dt;
    if (this.time <= 0) { this.time = 0; this.timeUp(); return; }

    this.step(this.f[0], this.f[1], inputs[0], dt);
    this.step(this.f[1], this.f[0], inputs[1], dt);
    this.avoidOverlap();
    this.updateProjectiles(dt);
    this.checkKO();
  };

  Battle.prototype.updateFx = function (dt) {
    this.shake = Math.max(0, this.shake - dt * 60);
    this.superFlash = Math.max(0, this.superFlash - dt * 2.2);
    var i;
    for (i = this.sparks.length - 1; i >= 0; i--) {
      var s = this.sparks[i];
      s.life -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += (s.g === undefined ? 900 : s.g) * dt;
      s.vx *= 0.96;
      if (s.life <= 0) this.sparks.splice(i, 1);
    }
    for (i = this.pops.length - 1; i >= 0; i--) {
      var p = this.pops[i];
      p.life -= dt;
      p.y += p.vy * dt;
      p.vy += 40 * dt;
      if (p.life <= 0) this.pops.splice(i, 1);
    }
  };

  Battle.prototype.step = function (f, opp, input, dt) {
    f.animT += dt;
    f.hitFlash = Math.max(0, f.hitFlash - dt * 2.4);
    f.atkBuff = Math.max(0, f.atkBuff - dt);
    f.defBuff = Math.max(0, f.defBuff - dt);
    f.armor = Math.max(0, f.armor - dt);
    f.counter = Math.max(0, f.counter - dt);
    f.rush = Math.max(0, f.rush - dt);
    f.invuln = Math.max(0, f.invuln - dt);
    f.parry = Math.max(0, f.parry - dt);
    f.comboTimer = Math.max(0, f.comboTimer - dt);
    if (f.comboTimer <= 0) f.combo = 0;
    for (var c = 0; c < 4; c++) if (f.cds[c] > 0) f.cds[c] = Math.max(0, f.cds[c] - dt);

    // 驱动恢复 / 燃烧
    if (f.burned > 0) {
      f.burned -= dt;
      if (f.burned <= 0) { f.burned = 0; f.driveDelay = 0; }
    } else if (f.driveDelay > 0) {
      f.driveDelay -= dt;
    } else if (f.drive < MAX_DRIVE) {
      f.drive = Math.min(MAX_DRIVE, f.drive + dt / 2.6);
    }

    // 持续伤害
    if (f.dots.length) {
      for (var k = 0; k < f.dots.length; k++) {
        var d = f.dots[k];
        d.timer -= dt;
        d.tick += dt;
        if (d.tick >= 0.5) {
          d.tick -= 0.5;
          var dd = d.dps * 0.5;
          this.hurt(f, dd);
          this.pops.push({
            x: f.x + (Math.random() * 26 - 13), y: f.y - 168, vy: -30,
            life: .55, max: .55, text: '-' + Math.round(dd), color: d.type === 'burn' ? '#ff9a3c' : '#ff4d6d', size: 15
          });
        }
      }
      f.dots = f.dots.filter(function (x) { return x.timer > 0; });
    }

    if (f.regen > 0) { f.regen -= dt; this.heal(f, 5 * dt); }
    if (f.hp <= 0) { f.state = 'ko'; return; }

    // 空中
    if (f.airborne) {
      f.vy += GRAVITY * dt;
      f.y += f.vy * dt;
      f.x += f.vx * dt;
      if (f.x < STAGE_L) { f.x = STAGE_L; f.vx = 0; }
      if (f.x > STAGE_R) { f.x = STAGE_R; f.vx = 0; }
      if (f.y >= GROUND) {
        f.y = GROUND; f.vy = 0; f.airborne = false; f.vx = 0;
        if (f.state === 'jump') f.state = 'idle';
      }
      f.facing = opp.x >= f.x ? 1 : -1;
      return;
    }

    // 受击 / 防御硬直 / 眩晕 / 招架
    if (f.hitstun > 0) {
      f.hitstun -= dt; f.state = 'hit'; f.move = null;
      f.x += f.vx * dt; f.vx *= Math.pow(0.015, dt); this.keepInStage(f);
      return;
    }
    if (f.blockstun > 0) {
      f.blockstun -= dt; f.state = 'block';
      f.x += f.vx * dt; f.vx *= Math.pow(0.015, dt); this.keepInStage(f);
      return;
    }
    if (f.stun > 0) {
      f.stun -= dt; f.state = 'hit'; f.move = null;
      f.x += f.vx * dt; f.vx *= Math.pow(0.02, dt); this.keepInStage(f);
      return;
    }
    if (f.parry > 0) {
      f.state = 'parry'; f.vx = 0; this.keepInStage(f);
      return;
    }

    // 招式推进
    if (f.move) {
      var m = f.move;
      m.t += dt;
      f.state = 'attack';

      if (m.kind === 'dash') {
        f.x += f.facing * 820 * dt;
        this.keepInStage(f);
        if (m.t >= m.total) { f.move = null; f.state = 'idle'; }
        return;
      }

      if (m.projectile && !m.hasSpawned && m.t >= (m.spawnAt || m.startup)) {
        m.hasSpawned = true;
        this.spawnProjectile(f, m);
      }

      if (m.dmg > 0 && m.t >= m.startup && m.t <= m.startup + m.active) {
        if (m.multi) {
          if (m.nextHit == null || m.t >= m.nextHit) {
            var landed = this.checkHit(f, opp, m);
            m.nextHit = m.t + 0.085;
            if (landed) m.hitsDone = (m.hitsDone || 0) + 1;
          }
        } else if (!m.hasHit) {
          m.hasHit = true;
          this.checkHit(f, opp, m);
        }
      }

      this.keepInStage(f);
      if (m.t >= m.total) { f.move = null; f.state = 'idle'; }
      return;
    }

    // 自由行动
    f.facing = opp.x >= f.x ? 1 : -1;
    f.crouch = !!input.held.down;

    if (input.press.up) {
      f.vy = -820; f.airborne = true; f.state = 'jump';
      var jd = (input.held.right ? 1 : 0) - (input.held.left ? 1 : 0);
      f.vx = jd * 280;
      return;
    }

    if (input.press.super && f.meter >= MAX_METER) { this.startSuper(f); return; }
    if (input.press.impact && f.drive >= 2) { this.startImpact(f); return; }
    if (input.press.parry && f.drive >= 2) { this.startParry(f); return; }
    if (input.press.rush && f.drive >= 3) { this.startRush(f); return; }
    for (var si = 0; si < 4; si++) {
      if (input.press.skills[si]) { this.startSkill(f, si); return; }
    }
    if (input.press.light) { this.startNormal(f, 'light'); return; }
    if (input.press.heavy) { this.startNormal(f, 'heavy'); return; }
    if (input.press.kick) { this.startNormal(f, 'kick'); return; }

    if (f.crouch) { f.state = 'crouch'; f.vx = 0; this.keepInStage(f); return; }

    var dir = (input.held.right ? 1 : 0) - (input.held.left ? 1 : 0);
    if (dir !== 0) {
      var spd = 220 + f.def.spd * 8;
      f.x += dir * spd * (dir === f.facing ? 1 : 0.78) * dt;
      f.state = 'walk'; f.walkT += dt;
      this.keepInStage(f);
    } else {
      f.state = 'idle';
      f.walkT = 0;
    }
  };

  Battle.prototype.keepInStage = function (f) {
    f.x = clamp(f.x, STAGE_L, STAGE_R);
    if (f.airborne && f.y > GROUND) f.y = GROUND;
  };

  Battle.prototype.startNormal = function (f, key) {
    var b = NORMALS[key];
    f.move = Object.assign({}, b, {
      t: 0, hasHit: false, effects: [], unblockable: false, isSkill: false,
      total: b.startup + b.active + b.recovery
    });
    f.state = 'attack';
  };

  Battle.prototype.spendDrive = function (f, n) {
    f.drive = Math.max(0, f.drive - n);
    f.driveDelay = Math.max(f.driveDelay, 0.8);
    if (f.drive <= 0) { f.burned = 4; f.driveDelay = 4.2; }
  };

  Battle.prototype.startSkill = function (f, idx) {
    if (f.cds[idx] > 0) return;
    var sk = f.def.skills[idx];
    var cost = sk.c || 0;
    if (f.drive < cost) return;
    var e = sk.e || [];
    var kind = skillKind(sk);
    this.spendDrive(f, cost);
    f.cds[idx] = 1.1 + (sk.cd || 0) * 1.6;
    f.meter = Math.min(MAX_METER, f.meter + 7);

    if (kind === 'buff') {
      f.move = {
        name: sk.n, t: 0, hasHit: true, dmg: 0, startup: .12, active: .01, recovery: .42,
        total: .55, anim: 'buff', kind: 'buff', isSkill: true, effects: e
      };
      f.state = 'attack';
      this.applySelf(f, e);
      this.pops.push({ x: f.x, y: f.y - 190, vy: -50, life: .9, max: .9, text: sk.n, color: 'hsl(' + f.def.hue + ',90%,70%)', size: 18 });
      return;
    }

    var m = {
      name: sk.n, t: 0, hasHit: false, effects: e, isSkill: true, kind: kind,
      dmg: 0, unblockable: false, meter: 9, anim: 'heavy'
    };
    if (kind === 'projectile') {
      m.startup = .18; m.active = .05; m.recovery = .42; m.total = .65;
      m.projectile = true; m.spawnAt = .18;
      m.dmg = sk.p * 10.5;
      m.anim = 'cast';
      m.pspd = 640; m.radius = 15 + sk.p * 4;
    } else if (kind === 'multi') {
      m.startup = .1; m.active = .14; m.recovery = .34; m.total = .58;
      m.dmg = sk.p * 7.2; m.multi = true; m.hits = 2;
      m.range = 96; m.y = -150; m.h = 90; m.kb = 75; m.hitstun = .17; m.blockstun = .12;
      m.anim = 'kick';
    } else if (kind === 'grab') {
      m.startup = .16; m.active = .09; m.recovery = .45; m.total = .7;
      m.dmg = sk.p * 13; m.range = 80; m.y = -156; m.h = 100;
      m.kb = 240; m.hitstun = .6; m.unblockable = true; m.anim = 'grab';
    } else if (kind === 'uppercut') {
      m.startup = .09; m.active = .13; m.recovery = .38; m.total = .6;
      m.dmg = sk.p * 12.5; m.range = 84; m.y = -196; m.h = 130;
      m.kb = 120; m.hitstun = .42; m.launch = -560; m.anim = 'uppercut';
      f.invuln = Math.max(f.invuln, .26);
    } else {
      m.startup = .12; m.active = .08; m.recovery = .32; m.total = .52;
      m.dmg = sk.p * 12.5; m.range = 110; m.y = -158; m.h = 96;
      m.kb = 185; m.hitstun = .3; m.anim = 'heavy';
    }
    if (e.indexOf('armor') >= 0) {
      f.armor = Math.max(f.armor, .34);
      m.armorDuring = true;
    }
    f.move = m;
    f.state = 'attack';
  };

  Battle.prototype.startImpact = function (f) {
    this.spendDrive(f, 2);
    f.armor = Math.max(f.armor, .36);
    f.meter = Math.min(MAX_METER, f.meter + 5);
    f.move = Object.assign({}, IMPACT, {
      t: 0, hasHit: false, effects: [], unblockable: false, isSkill: true,
      total: IMPACT.startup + IMPACT.active + IMPACT.recovery
    });
    f.state = 'attack';
  };

  Battle.prototype.startParry = function (f) {
    this.spendDrive(f, 2);
    f.parry = .46;
    f.state = 'parry';
    f.vx = 0;
    f.meter = Math.min(MAX_METER, f.meter + 3);
  };

  Battle.prototype.startRush = function (f) {
    this.spendDrive(f, 3);
    f.rush = 3.2;
    f.move = {
      name: '驱动冲刺', kind: 'dash', t: 0, startup: .01, active: .2,
      recovery: .04, total: .25, dmg: 0, hasHit: true, anim: 'dash', isSkill: true, effects: []
    };
    f.state = 'attack';
  };

  Battle.prototype.startSuper = function (f) {
    if (f.meter < MAX_METER) return;
    f.meter = 0;
    f.move = null;
    f.state = 'super';
    f.invuln = 1.8;
    f.parry = 0;
    f.crouch = false;
    this.superFx = { owner: f.player, t: 0, dur: 1.75, applied: false };
    this.superFlash = .5;
    this.shake = 12;
  };

  Battle.prototype.updateSuper = function (dt) {
    var s = this.superFx;
    s.t += dt;
    var att = this.f[s.owner];
    var def = this.f[1 - s.owner];
    att.state = 'super';
    att.facing = def.x >= att.x ? 1 : -1;
    att.animT += dt;

    if (!s.applied && s.t >= .62) {
      s.applied = true;
      var sp = att.def.super;
      var e = sp.e || [];
      this.hit(att, def, {
        name: sp.n, dmg: sp.p * 13, effects: e, kb: 280, hitstun: .75,
        blockstun: .45, meter: 0, pierce: e.indexOf('pierce') >= 0,
        unblockable: e.indexOf('unguard') >= 0, super: true, launch: -520
      });
      if (e.indexOf('heal') >= 0) this.heal(att, att.maxHp * .28);
      if (e.indexOf('regen') >= 0) att.regen = 3.2;
      if (e.indexOf('armor') >= 0) att.armor = 4;
      this.shake = 28;
      this.superFlash = .45;
    }
    if (s.t >= s.dur) {
      this.superFx = null;
      if (att.state === 'super') att.state = 'idle';
    }
  };

  Battle.prototype.spawnProjectile = function (f, m) {
    this.projectiles.push({
      owner: f.player,
      x: f.x + f.facing * 46,
      y: f.y - 112,
      vx: f.facing * (m.pspd || 640),
      r: m.radius || 18,
      dmg: m.dmg,
      effects: m.effects,
      name: m.name,
      life: 2.2,
      hue: f.def.hue,
      dead: false
    });
    this.sparks.push({
      x: f.x + f.facing * 40, y: f.y - 108, vx: f.facing * 120, vy: 0,
      life: .25, max: .25, color: 'hsl(' + f.def.hue + ',95%,70%)', size: 18, g: 0
    });
  };

  Battle.prototype.updateProjectiles = function (dt) {
    var i, j;
    for (i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      if (p.dead) continue;
      p.x += p.vx * dt;
      p.life -= dt;
      if (p.life <= 0 || p.x < STAGE_L - 60 || p.x > STAGE_R + 60) { p.dead = true; continue; }

      var def = this.f[1 - p.owner];
      if (def.hp > 0 && overlap({ x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 }, hurtboxOf(def))) {
        p.dead = true;
        this.hit(this.f[p.owner], def, {
          name: p.name, dmg: p.dmg, effects: p.effects, kb: 150,
          hitstun: .28, blockstun: .2, meter: 9,
          pierce: (p.effects || []).indexOf('pierce') >= 0,
          unblockable: false, projectile: true
        });
        this.sparks.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: .3, max: .3, color: 'hsl(' + p.hue + ',95%,70%)', size: 26, g: 0 });
        continue;
      }
      // 飞行道具对撞
      for (j = 0; j < this.projectiles.length; j++) {
        var q = this.projectiles[j];
        if (q === p || q.dead || q.owner === p.owner) continue;
        if (overlap({ x: p.x - p.r, y: p.y - p.r, w: p.r * 2, h: p.r * 2 }, { x: q.x - q.r, y: q.y - q.r, w: q.r * 2, h: q.r * 2 })) {
          p.dead = true; q.dead = true;
          this.sparks.push({ x: (p.x + q.x) / 2, y: p.y, vx: 0, vy: 0, life: .4, max: .4, color: '#fff', size: 34, g: 0 });
          this.shake = 5;
        }
      }
    }
    this.projectiles = this.projectiles.filter(function (p) { return !p.dead; });
  };

  Battle.prototype.checkHit = function (att, def, m) {
    if (def.hp <= 0) return false;
    if (!overlap(hitboxOf(att, m), hurtboxOf(def))) return false;
    this.hit(att, def, m);
    return true;
  };

  Battle.prototype.calcDamage = function (att, def, m) {
    var d = m.dmg;
    d *= 0.8 + att.def.atk * 0.024;
    d *= 1 - clamp((def.def.def - 9) * 0.022, -0.05, 0.13);
    if (att.atkBuff > 0) d *= 1.28;
    if (att.rush > 0 && !m.super) d *= 1.4;
    if (def.defBuff > 0) d *= 0.84;
    if (def.armor > 0) d *= 0.55;
    if (def.burned > 0) d *= 1.15;
    if (def.counter > 0) d *= 0.6;
    if ((m.effects || []).indexOf('execute') >= 0 && def.hp < def.maxHp * 0.35) d *= 1.45;
    return d;
  };

  Battle.prototype.hit = function (att, def, m) {
    var e = m.effects || [];
    if (def.invuln > 0) return;

    // 招架
    if (def.parry > 0) {
      def.parry = 0;
      def.meter = Math.min(MAX_METER, def.meter + 22);
      def.drive = Math.min(MAX_DRIVE, def.drive + 1);
      att.vx = -att.facing * 170;
      att.hitstun = Math.max(att.hitstun, .14);
      this.sparks.push({ x: def.x, y: def.y - 110, vx: 0, vy: 0, life: .35, max: .35, color: '#ffe14d', size: 34, g: 0 });
      this.pops.push({ x: def.x, y: def.y - 200, vy: -40, life: .8, max: .8, text: 'PARRY!', color: '#ffe14d', size: 20 });
      this.hitstop = .07; this.shake = 8;
      return;
    }

    var blocked = !m.unblockable && def.holdingBack && def.hitstun <= 0 && def.stun <= 0 && !def.move;
    var dmg = this.calcDamage(att, def, m);

    if (blocked) {
      dmg *= e.indexOf('pierce') >= 0 ? 0.3 : 0.12;
      this.hurt(def, dmg);
      def.blockstun = Math.max(def.blockstun, (m.blockstun || .18));
      def.vx = att.facing * (m.kb || 80) * 0.55;
      def.state = 'block';
      att.meter = Math.min(MAX_METER, att.meter + (m.meter || 8) * 0.5);
      def.meter = Math.min(MAX_METER, def.meter + (m.meter || 8) * 0.3);
      def.drive = Math.min(MAX_DRIVE, def.drive + 0.3);
      this.sparks.push({ x: def.x + def.facing * 26, y: def.y - 112, vx: att.facing * 60, vy: -40, life: .28, max: .28, color: '#8fc0ff', size: 20, g: 0 });
      if (m.kind === 'impact') {
        def.blockstun = 0; def.stun = Math.max(def.stun, .85);
        this.pops.push({ x: def.x, y: def.y - 200, vy: -40, life: .9, max: .9, text: 'GUARD CRUSH', color: '#ff5b5b', size: 18 });
        this.shake = 12;
      }
      this.hitstop = .04;
      return;
    }

    this.hurt(def, dmg);
    def.hitstun = Math.max(def.hitstun, m.hitstun || .2);
    def.state = 'hit';
    def.hitFlash = 1;
    def.vx = (m.kb || 100) * att.facing;
    if (m.launch) { def.vy = m.launch; def.airborne = true; def.y -= 2; }

    att.meter = Math.min(MAX_METER, att.meter + (m.meter || 9));
    def.meter = Math.min(MAX_METER, def.meter + (m.meter || 9) * 0.45);
    att.combo++;
    att.comboTimer = 1.5;
    if (att.rush > 0) att.rush = 0;

    if (def.counter > 0) {
      def.counter = 0;
      this.hurt(att, dmg * 0.4);
      att.hitstun = Math.max(att.hitstun, .2);
      this.pops.push({ x: def.x, y: def.y - 200, vy: -40, life: .8, max: .8, text: '反击', color: '#a855f7', size: 18 });
    }

    this.applyOnHit(att, def, e, dmg);

    this.sparks.push({
      x: def.x - att.facing * 10, y: def.y - 112,
      vx: -att.facing * 120, vy: -60, life: .3, max: .3,
      color: m.super ? '#ffe14d' : 'hsl(' + att.def.hue + ',95%,68%)', size: m.super ? 40 : 24, g: 400
    });
    this.pops.push({
      x: def.x, y: def.y - 180, vy: -55, life: .75, max: .75,
      text: String(Math.round(dmg)), color: m.super ? '#ffe14d' : '#ffffff', size: m.super ? 34 : 22
    });
    this.hitstop = m.super ? .1 : .07;
    this.shake = m.super ? 22 : (m.isSkill ? 9 : 6);
  };

  Battle.prototype.applyOnHit = function (att, def, e, dmg) {
    for (var i = 0; i < e.length; i++) {
      var x = e[i];
      if (x === 'burn' && def.dots.filter(function (d) { return d.type === 'burn'; }).length < 2) {
        def.dots.push({ type: 'burn', dps: 4, timer: 2.6, tick: 0 });
      } else if (x === 'bleed' && def.dots.filter(function (d) { return d.type === 'bleed'; }).length < 2) {
        def.dots.push({ type: 'bleed', dps: 3, timer: 3.4, tick: 0 });
      } else if (x === 'stun') {
        def.stun = Math.max(def.stun, 1.05);
      } else if (x === 'lifesteal') {
        this.heal(att, dmg * 0.45);
      } else if (x === 'driveDrain') {
        def.drive = Math.max(0, def.drive - 1);
      } else if (x === 'drainSuper') {
        def.meter = Math.max(0, def.meter - 18);
      } else if (x === 'counter') {
        att.counter = Math.max(att.counter, 2.6);
      } else if (x === 'superGain') {
        att.meter = Math.min(MAX_METER, att.meter + 18);
      } else if (x === 'heal') {
        this.heal(att, att.maxHp * 0.12);
      } else if (x === 'regen') {
        att.regen = 3.2;
      } else if (x === 'shield') {
        att.shield = Math.max(att.shield, 18);
      } else if (x === 'armor') {
        att.armor = Math.max(att.armor, 2.4);
      } else if (x === 'atkUp') {
        att.atkBuff = Math.max(att.atkBuff, 4);
      } else if (x === 'defUp') {
        att.defBuff = Math.max(att.defBuff, 4);
      }
    }
  };

  Battle.prototype.applySelf = function (f, e) {
    for (var i = 0; i < e.length; i++) {
      var x = e[i];
      if (x === 'heal') this.heal(f, f.maxHp * 0.14);
      else if (x === 'regen') f.regen = 3.4;
      else if (x === 'shield') f.shield = Math.max(f.shield, 22);
      else if (x === 'armor') f.armor = Math.max(f.armor, 3);
      else if (x === 'atkUp') f.atkBuff = Math.max(f.atkBuff, 4);
      else if (x === 'defUp') f.defBuff = Math.max(f.defBuff, 4);
      else if (x === 'counter') f.counter = Math.max(f.counter, 2.6);
      else if (x === 'cleanse') f.dots = [];
      else if (x === 'superGain') f.meter = Math.min(MAX_METER, f.meter + 20);
      else if (x === 'driveGain') f.drive = Math.min(MAX_DRIVE, f.drive + 1);
    }
  };

  Battle.prototype.hurt = function (f, dmg) {
    if (dmg <= 0) return;
    if (f.shield > 0) {
      var a = Math.min(f.shield, dmg);
      f.shield -= a;
      dmg -= a;
      if (a > 0) this.sparks.push({ x: f.x, y: f.y - 100, vx: 0, vy: 0, life: .2, max: .2, color: '#7dd3fc', size: 30, g: 0 });
    }
    f.hp = Math.max(0, f.hp - dmg);
  };

  Battle.prototype.heal = function (f, amount) {
    f.hp = Math.min(f.maxHp, f.hp + amount);
  };

  Battle.prototype.avoidOverlap = function () {
    var a = this.f[0], b = this.f[1];
    if (a.airborne || b.airborne) return;
    var min = 70;
    var d = b.x - a.x;
    if (Math.abs(d) < min) {
      var push = (min - Math.abs(d)) / 2;
      if (d >= 0) { a.x -= push; b.x += push; }
      else { a.x += push; b.x -= push; }
      this.keepInStage(a); this.keepInStage(b);
    }
  };

  Battle.prototype.checkKO = function () {
    if (this.phase !== 'fight') return;
    var a = this.f[0], b = this.f[1];
    if (a.hp > 0 && b.hp > 0) return;
    var winner = (a.hp <= 0 && b.hp <= 0) ? null : (a.hp <= 0 ? 1 : 0);
    this.endRound(winner, 'ko');
  };

  Battle.prototype.timeUp = function () {
    var ra = this.f[0].hp / this.f[0].maxHp;
    var rb = this.f[1].hp / this.f[1].maxHp;
    var winner = Math.abs(ra - rb) < 0.001 ? null : (ra > rb ? 0 : 1);
    this.endRound(winner, 'time');
  };

  Battle.prototype.endRound = function (winner, kind) {
    if (this.phase !== 'fight') return;
    this.lastRound = { winner: winner, kind: kind };
    if (winner != null) this.score[winner]++;
    var done = this.score[0] >= 2 || this.score[1] >= 2;
    this.phase = done ? 'matchOver' : 'roundOver';
    if (done) this.matchWinner = this.score[0] >= 2 ? 0 : 1;
    for (var i = 0; i < 2; i++) {
      var f = this.f[i];
      if (winner === i) f.state = 'win';
      else if (winner != null) { f.state = 'ko'; f.koT = 0; }
      else f.state = 'idle';
      f.move = null; f.parry = 0; f.vx = 0;
    }
    this.roundOverT = 0;
    this.shake = kind === 'ko' ? 20 : 0;
  };

  Battle.prototype.nextRound = function () {
    if (this.phase !== 'roundOver') return false;
    this.round++;
    resetFighter(this.f[0], 430, 1);
    resetFighter(this.f[1], 850, -1);
    this.time = ROUND_TIME;
    this.hitstop = 0;
    this.shake = 0;
    this.sparks = [];
    this.pops = [];
    this.projectiles = [];
    this.superFx = null;
    this.superFlash = 0;
    this.phase = 'intro';
    this.phaseT = 1.4;
    this.msg = 'ROUND ' + this.round;
    this.roundOverT = 0;
    return true;
  };

  function createBattle(defA, defB) { return new Battle(defA, defB); }

  var API = {
    createBattle: createBattle,
    Battle: Battle,
    GROUND: GROUND,
    STAGE_L: STAGE_L,
    STAGE_R: STAGE_R,
    ROUND_TIME: ROUND_TIME,
    MAX_DRIVE: MAX_DRIVE,
    MAX_METER: MAX_METER,
    hurtboxOf: hurtboxOf
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.Fight = API;
})();
