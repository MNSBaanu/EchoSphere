import FSM from './FSM.js';
import EmotionSystem from './EmotionSystem.js';

/**
 * Agent — "Hana", the anime-styled teen character
 * Drawn entirely with Phaser Graphics — no external sprite needed.
 *
 * Character anatomy:
 *   - Hair (layered, anime-style)
 *   - Head + face (eyes, blush, expression)
 *   - Body (school uniform top)
 *   - Arms
 *   - Legs + shoes
 *   - Phone prop (visible when in ATTRACTED/LOOPING state)
 *
 * Visual state changes:
 *   IDLE           → neutral expression, slow walk
 *   ATTRACTED      → wide eyes, phone out, faster
 *   LOOPING        → hunched, phone glow, orange tint
 *   DISTORTED      → glitch effect, red tint
 *   BREAKING_POINT → shaking, dark
 *   RECOVERED      → upright, bright, phone away
 *   LOST           → slumped, grey
 */
export default class Agent {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.emotions = new EmotionSystem();
    this.fsm      = new FSM(this);

    this._perceptionCooldown = 0;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this._targetX = null;
    this._targetY = null;
    this._facingRight = true;
    this._walkCycle = 0;
    this._glitchOffset = 0;

    // Container holds all character parts — move the container to move the character
    this.container = scene.add.container(x, y).setDepth(10);

    this._buildCharacter();

    // Name tag above character
    this.nameTag = scene.add.text(x, y - 58, 'Hana', {
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5).setDepth(11);

    // State label below character
    this.stateLabel = scene.add.text(x, y + 52, 'IDLE', {
      fontSize: '9px',
      color: '#00f5ff',
      backgroundColor: '#00000099',
      padding: { x: 4, y: 1 }
    }).setOrigin(0.5).setDepth(11);

    // Perception ring (faint, around character)
    this.perceptionRing = scene.add.circle(x, y, 85)
      .setStrokeStyle(1, 0x00f5ff, 0.15)
      .setFillStyle(0x000000, 0)
      .setDepth(5);
  }

  // ── Build character graphics ──────────────────────────────────────────────
  _buildCharacter() {
    const g = this.scene.add.graphics();
    this._gfx = g;
    this.container.add(g);
    this._drawCharacter('IDLE');
  }

  _drawCharacter(state) {
    const g = this._gfx;
    g.clear();

    const walkOffset = Math.sin(this._walkCycle) * 3;
    const glitch = this._glitchOffset;

    // ── Colour palette per state ──────────────────────────────────────────
    const palette = {
      IDLE:           { skin: 0xfcd5b0, hair: 0x2c1810, shirt: 0x4a90d9, pants: 0x2c3e6b, shoe: 0x1a1a2e, eye: 0x3d2b1f, blush: 0xffb3ba, phone: null },
      ATTRACTED:      { skin: 0xfcd5b0, hair: 0x2c1810, shirt: 0x4a90d9, pants: 0x2c3e6b, shoe: 0x1a1a2e, eye: 0x6a3de8, blush: 0xff8fa3, phone: 0x1a1a2e },
      LOOPING:        { skin: 0xf5c49a, hair: 0x2c1810, shirt: 0x3a7bc8, pants: 0x1e2d5a, shoe: 0x111122, eye: 0xff6600, blush: 0xff6b6b, phone: 0x0d0d1a },
      DISTORTED:      { skin: 0xe8b090, hair: 0x1a0f0a, shirt: 0x2a5a9a, pants: 0x141e3a, shoe: 0x0a0a15, eye: 0xff0000, blush: 0xff4444, phone: 0x0a0a0a },
      BREAKING_POINT: { skin: 0xd4956e, hair: 0x150a05, shirt: 0x1a3a6a, pants: 0x0e1428, shoe: 0x050510, eye: 0x880000, blush: 0xcc2222, phone: 0x050505 },
      RECOVERED:      { skin: 0xfcd5b0, hair: 0x2c1810, shirt: 0x5ba85b, pants: 0x2d5a2d, shoe: 0x1a2e1a, eye: 0x2ecc71, blush: 0xffb3ba, phone: null },
      PARTIAL:        { skin: 0xf0c8a0, hair: 0x2c1810, shirt: 0x9a8a3a, pants: 0x3a3a1e, shoe: 0x1a1a0a, eye: 0xccaa00, blush: 0xffcc44, phone: 0x1a1a0a },
      LOST:           { skin: 0xb8a090, hair: 0x1a1a1a, shirt: 0x2a2a2a, pants: 0x1a1a1a, shoe: 0x0a0a0a, eye: 0x444444, blush: 0x666666, phone: 0x050505 },
    };

    const c = palette[state] || palette.IDLE;
    const showPhone = c.phone !== null;

    // ── Shadow ────────────────────────────────────────────────────────────
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(glitch, 46, 28, 8);

    // ── Legs ──────────────────────────────────────────────────────────────
    g.fillStyle(c.pants, 1);
    // Left leg
    g.fillRect(-9 + glitch, 18, 8, 20 + walkOffset);
    // Right leg
    g.fillRect(1 + glitch, 18, 8, 20 - walkOffset);

    // ── Shoes ─────────────────────────────────────────────────────────────
    g.fillStyle(c.shoe, 1);
    g.fillRect(-11 + glitch, 36 + walkOffset, 11, 5);
    g.fillRect(1 + glitch,   36 - walkOffset, 11, 5);

    // ── Body / shirt ──────────────────────────────────────────────────────
    g.fillStyle(c.shirt, 1);
    g.fillRoundedRect(-12 + glitch, -4, 24, 24, 4);

    // Collar detail
    g.fillStyle(0xffffff, 0.3);
    g.fillTriangle(-3 + glitch, -4, 3 + glitch, -4, 0 + glitch, 4);

    // ── Arms ──────────────────────────────────────────────────────────────
    g.fillStyle(c.shirt, 1);
    if (showPhone) {
      // Right arm raised holding phone
      g.fillRect(12 + glitch, -4, 7, 14);
      g.fillRect(-19 + glitch, -4, 7, 18);
    } else {
      // Arms at sides, slight swing
      g.fillRect(12 + glitch, -4, 7, 18 + walkOffset);
      g.fillRect(-19 + glitch, -4, 7, 18 - walkOffset);
    }

    // Hands (skin)
    g.fillStyle(c.skin, 1);
    g.fillCircle(15 + glitch, 14 + (showPhone ? 0 : walkOffset), 4);
    g.fillCircle(-15 + glitch, 14 + (showPhone ? 0 : -walkOffset), 4);

    // ── Phone prop ────────────────────────────────────────────────────────
    if (showPhone) {
      // Phone body
      g.fillStyle(c.phone, 1);
      g.fillRoundedRect(14 + glitch, -2, 10, 16, 2);
      // Screen glow
      const glowAlpha = 0.5 + Math.sin(this._walkCycle * 2) * 0.3;
      g.fillStyle(0x00f5ff, glowAlpha);
      g.fillRoundedRect(15 + glitch, -1, 8, 12, 1);
      // Screen content lines
      g.fillStyle(0xffffff, 0.4);
      g.fillRect(16 + glitch, 1, 6, 1);
      g.fillRect(16 + glitch, 4, 4, 1);
      g.fillRect(16 + glitch, 7, 5, 1);
    }

    // ── Neck ──────────────────────────────────────────────────────────────
    g.fillStyle(c.skin, 1);
    g.fillRect(-4 + glitch, -10, 8, 8);

    // ── Head ──────────────────────────────────────────────────────────────
    g.fillStyle(c.skin, 1);
    g.fillEllipse(0 + glitch, -22, 26, 28);

    // ── Hair — back layer ─────────────────────────────────────────────────
    g.fillStyle(c.hair, 1);
    // Long hair behind (anime style)
    g.fillRect(-13 + glitch, -32, 26, 30);
    g.fillEllipse(-14 + glitch, -10, 10, 24); // left side hair
    g.fillEllipse(14 + glitch, -10, 10, 24);  // right side hair

    // ── Hair — top/front ──────────────────────────────────────────────────
    g.fillStyle(c.hair, 1);
    g.fillEllipse(0 + glitch, -34, 28, 16);   // top of head
    // Anime bangs
    g.fillTriangle(-13 + glitch, -28, -5 + glitch, -28, -10 + glitch, -18);
    g.fillTriangle(-6 + glitch,  -30, 2 + glitch,  -30, -2 + glitch,  -20);
    g.fillTriangle(2 + glitch,   -30, 10 + glitch,  -30, 6 + glitch,  -20);
    g.fillTriangle(8 + glitch,   -28, 14 + glitch,  -26, 10 + glitch, -18);

    // ── Eyes ──────────────────────────────────────────────────────────────
    // Eye whites
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(-6 + glitch, -22, 8, 7);
    g.fillEllipse(6 + glitch,  -22, 8, 7);

    // Iris
    g.fillStyle(c.eye, 1);
    const eyeSize = state === 'ATTRACTED' ? 5 : state === 'LOST' ? 2 : 4;
    g.fillCircle(-6 + glitch, -22, eyeSize);
    g.fillCircle(6 + glitch,  -22, eyeSize);

    // Pupil
    g.fillStyle(0x000000, 1);
    g.fillCircle(-6 + glitch, -22, eyeSize * 0.45);
    g.fillCircle(6 + glitch,  -22, eyeSize * 0.45);

    // Eye shine
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(-5 + glitch, -23, 1.2);
    g.fillCircle(7 + glitch,  -23, 1.2);

    // Eyelashes (top line)
    g.lineStyle(1.5, c.hair, 1);
    g.strokeEllipse(-6 + glitch, -22, 8, 7);
    g.strokeEllipse(6 + glitch,  -22, 8, 7);

    // ── Eyebrows ──────────────────────────────────────────────────────────
    g.lineStyle(1.5, c.hair, 1);
    if (state === 'BREAKING_POINT' || state === 'DISTORTED') {
      // Furrowed brows
      g.beginPath(); g.moveTo(-10 + glitch, -28); g.lineTo(-3 + glitch, -26); g.strokePath();
      g.beginPath(); g.moveTo(10 + glitch,  -28); g.lineTo(3 + glitch,  -26); g.strokePath();
    } else if (state === 'RECOVERED') {
      // Raised happy brows
      g.beginPath(); g.moveTo(-10 + glitch, -27); g.lineTo(-3 + glitch, -29); g.strokePath();
      g.beginPath(); g.moveTo(10 + glitch,  -27); g.lineTo(3 + glitch,  -29); g.strokePath();
    } else {
      // Neutral brows
      g.beginPath(); g.moveTo(-10 + glitch, -27); g.lineTo(-3 + glitch, -27); g.strokePath();
      g.beginPath(); g.moveTo(10 + glitch,  -27); g.lineTo(3 + glitch,  -27); g.strokePath();
    }

    // ── Mouth ─────────────────────────────────────────────────────────────
    g.lineStyle(1.2, 0x8b4513, 1);
    if (state === 'RECOVERED') {
      // Smile
      g.beginPath(); g.moveTo(-4 + glitch, -14); g.quadraticBezierTo(0 + glitch, -11, 4 + glitch, -14); g.strokePath();
    } else if (state === 'LOST' || state === 'BREAKING_POINT') {
      // Frown
      g.beginPath(); g.moveTo(-4 + glitch, -12); g.quadraticBezierTo(0 + glitch, -15, 4 + glitch, -12); g.strokePath();
    } else {
      // Neutral / slight open
      g.beginPath(); g.moveTo(-3 + glitch, -13); g.lineTo(3 + glitch, -13); g.strokePath();
    }

    // ── Blush ─────────────────────────────────────────────────────────────
    if (state !== 'LOST' && state !== 'BREAKING_POINT') {
      g.fillStyle(c.blush, 0.35);
      g.fillEllipse(-9 + glitch, -19, 8, 4);
      g.fillEllipse(9 + glitch,  -19, 8, 4);
    }

    // ── Nose ──────────────────────────────────────────────────────────────
    g.fillStyle(c.skin - 0x101010, 0.5);
    g.fillCircle(0 + glitch, -17, 1.5);
  }

  // ── Update loop ───────────────────────────────────────────────────────────
  update() {
    this.fsm.update();
    this.emotions.update();
    this._perceive();
    this._move();
    this._updateVisuals();
    this._syncHUD();
    if (this._perceptionCooldown > 0) this._perceptionCooldown--;
  }

  // ── Perception ────────────────────────────────────────────────────────────
  _perceive() {
    if (!this.scene.notifications) return;
    if (this._perceptionCooldown > 0) return;

    let closest = null;
    let closestDist = Infinity;

    this.scene.notifications.forEach(n => {
      if (!n.active) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, n.x, n.y);
      if (dist < 85 && dist < closestDist) {
        closest = n;
        closestDist = dist;
      }
    });

    if (closest) {
      this.fsm.handleEvent('NOTIFICATION_SEEN');
      this._perceptionCooldown = 60;
      this._targetX = closest.x;
      this._targetY = closest.y;
      closest._seen = true;
    }
  }

  onNotificationIgnored() { this.fsm.handleEvent('NOTIFICATION_IGNORED'); }
  onFriendMessage()        { this.fsm.handleEvent('FRIEND_MESSAGE'); }
  onFriendIgnored()        { this.fsm.handleEvent('FRIEND_IGNORED'); }
  onRandomEvent(type)      { this.fsm.handleEvent(type); }
  onPlayerChoice(choice)   { this.fsm.handleEvent(choice); }

  // ── Movement ──────────────────────────────────────────────────────────────
  _move() {
    const { width, height } = this.scene.scale;
    this._walkCycle += 0.12;

    if (this._targetX !== null) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this._targetX, this._targetY);
      const dist  = Phaser.Math.Distance.Between(this.x, this.y, this._targetX, this._targetY);
      const speed = this._speedForState();
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this._facingRight = this.vx >= 0;
      if (dist < 10) this._targetX = this._targetY = null;
    } else {
      this.vx += (Math.random() - 0.5) * 0.08;
      this.vy += (Math.random() - 0.5) * 0.08;
      if (Math.abs(this.vx) > 0.2) this._facingRight = this.vx > 0;
    }

    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const max = this._speedForState();
    if (spd > max) { this.vx = (this.vx / spd) * max; this.vy = (this.vy / spd) * max; }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 40 || this.x > width - 40)  this.vx *= -1;
    if (this.y < 70 || this.y > height - 60) this.vy *= -1;

    this.container.setPosition(this.x, this.y);
    this.container.setScale(this._facingRight ? 1 : -1, 1);
    this.nameTag.setPosition(this.x, this.y - 58);
    this.stateLabel.setPosition(this.x, this.y + 52);
    this.perceptionRing.setPosition(this.x, this.y);
  }

  _speedForState() {
    const stress = this.emotions.stress;
    if (stress > 70) return 2.8;
    if (stress > 40) return 2.0;
    return 1.4;
  }

  // ── Visuals update every frame ────────────────────────────────────────────
  _updateVisuals() {
    const state = this.fsm.state;
    this.stateLabel.setText(state);

    // Glitch effect in DISTORTED state
    if (state === 'DISTORTED' || state === 'BREAKING_POINT') {
      this._glitchOffset = Math.random() < 0.08 ? Phaser.Math.Between(-3, 3) : 0;
    } else {
      this._glitchOffset = 0;
    }

    // Redraw character every frame (walk cycle + state colour)
    this._drawCharacter(state);

    // Perception ring opacity reflects stress
    const alpha = 0.08 + (this.emotions.stress / 100) * 0.35;
    this.perceptionRing.setStrokeStyle(1, 0x00f5ff, alpha);
  }

  // ── HUD ───────────────────────────────────────────────────────────────────
  _syncHUD() {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.style.width = `${Math.round(val)}%`;
    };
    set('meter-stress',     this.emotions.stress);
    set('meter-happiness',  this.emotions.happiness);
    set('meter-loneliness', this.emotions.loneliness);

    const badge = document.getElementById('state-badge');
    if (badge) badge.textContent = `STATE: ${this.fsm.state}`;
  }
}
