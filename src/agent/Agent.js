import FSM from './FSM.js';
import EmotionSystem from './EmotionSystem.js';

/**
 * Agent — "Steve", teen boy character
 * Drawn with Phaser Graphics at 3× scale for crisp visuals.
 * Movement: keyboard arrow keys / WASD — player controlled.
 * FSM still reacts to events (notifications walked into, random events, etc.)
 */
export default class Agent {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.emotions = new EmotionSystem();
    this.fsm      = new FSM(this);

    // ── AI Core Variables (CRITICAL FOR VIVA) ────────────────────────────
    this.addictionLevel = 0;      // 0-100: drives behavior & transitions
    this.awareness = 70;           // 0-100: decreases with phone use
    this.curiosity = 60;           // 0-100: drives initial attraction
    this.relationshipLevel = 50;   // 0-100: affected by message responses
    this.memory = [];              // Learning system: stores behavioral patterns
    this.ignoredMessages = 0;      // Tracks social neglect
    this.scrollCount = 0;          // Interaction frequency metric
    this.timeOnPhone = 0;          // Total time spent (frames)

    this._perceptionCooldown = 0;
    this.vx = 0;
    this.vy = 0;
    this._facingRight = true;
    this._walkCycle   = 0;
    this._glitchOffset = 0;
    this._moving = false;
    this.hasPhone = false;
    this._bouncing = false;
    this.rubberBand = false;
    this.hunchLevel = 0; // 0 = upright, 4 = fully hunched
    this.keysLocked = false; // Can lock keyboard control
    this.speed = 6; // movement speed — can be overridden per scene
    this._eyeOffset = 0; // horizontal iris/pupil shift for look-direction animation

    // Keyboard input
    this._keys = scene.input.keyboard.createCursorKeys();
    this._wasd = scene.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Shadow
    this._shadow = scene.add.ellipse(x, y + 52, 44, 10, 0x000000, 0.18).setDepth(9);

    // Main graphics container
    this.container = scene.add.container(x, y).setDepth(10);
    this._gfx = scene.add.graphics();
    this.container.add(this._gfx);

    // Glow layer behind character — hidden (kept for state-based logic)
    this._glow = scene.add.circle(x, y, 38, 0x000000, 0.0).setDepth(9).setVisible(false);

    // Name tag — removed
    this.nameTag = { setPosition: () => {}, setText: () => {}, setStyle: () => {}, setAlpha: () => {} };

    // State label — removed
    this.stateLabel = { setText: () => {}, setPosition: () => {}, setStyle: () => {}, setAlpha: () => {} };

    // Perception ring — hidden
    this.perceptionRing = scene.add.circle(x, y, 90)
      .setStrokeStyle(0, 0x1e3a5f, 0)
      .setFillStyle(0x000000, 0)
      .setDepth(5)
      .setVisible(false);

    // Controls hint removed

    this._drawCharacter('IDLE');
  }

  // ── Draw teen boy character ───────────────────────────────────────────────
  _drawCharacter(state) {
    const g = this._gfx;
    g.clear();

    const S = 2.8; // scale multiplier — bigger character
    const w = this._walkCycle;
    const gl = this._glitchOffset;
    const legSwing = Math.sin(w) * (this._moving ? 8 : 0);
    const armSwing = Math.sin(w) * (this._moving ? 6 : 0);

    // ── Palette — MAIN AGENT COLORS STAY CONSTANT ────────────────────────
    // Shirt (0x2563eb) and eye color (0x1e3a5f) never change for main agent
    const P = {
      IDLE:           { skin: 0xf5c5a3, hair: 0x3d2314, shirt: 0x2563eb, pants: 0x1e3a5f, shoe: 0x111827, eye: 0x1e3a5f, phone: null,   glow: 0x000000, glowA: 0 },
      ATTRACTED:      { skin: 0xf5c5a3, hair: 0x3d2314, shirt: 0x2563eb, pants: 0x1e3a5f, shoe: 0x111827, eye: 0x1e3a5f, phone: 0x111827, glow: 0x000000, glowA: 0 },

      LOOPING:        { skin: 0xedb48a, hair: 0x2c1a0e, shirt: 0x1d4ed8, pants: 0x172554, shoe: 0x0f172a, eye: 0x1e3a5f, phone: 0x0f172a, glow: 0xea580c, glowA: 0.18 },
      DISTORTED:      { skin: 0xd4956e, hair: 0x1a0f08, shirt: 0x1e40af, pants: 0x0f1f3d, shoe: 0x080f1e, eye: 0x1e3a5f, phone: 0x080f1e, glow: 0xdc2626, glowA: 0.25 },
      BREAKING_POINT: { skin: 0xb87a55, hair: 0x0f0805, shirt: 0x1e3a8a, pants: 0x0a1628, shoe: 0x050a14, eye: 0x1e3a5f, phone: 0x050a14, glow: 0x7f1d1d, glowA: 0.3 },
      RECOVERED:      { skin: 0xf5c5a3, hair: 0x3d2314, shirt: 0x16a34a, pants: 0x14532d, shoe: 0x052e16, eye: 0x1e3a5f, phone: null,   glow: 0x16a34a, glowA: 0.15 },
      PARTIAL:        { skin: 0xefc090, hair: 0x2c1a0e, shirt: 0xca8a04, pants: 0x3f2d00, shoe: 0x1c1300, eye: 0x1e3a5f, phone: 0x1c1300, glow: 0xca8a04, glowA: 0.12 },
      LOST:           { skin: 0x9a8070, hair: 0x111111, shirt: 0x1f2937, pants: 0x111827, shoe: 0x030712, eye: 0x1e3a5f, phone: 0x030712, glow: 0x000000, glowA: 0 },

    }[state] || { skin: 0xf5c5a3, hair: 0x3d2314, shirt: 0x2563eb, pants: 0x1e3a5f, shoe: 0x111827, eye: 0x1e3a5f, phone: null, glow: 0x000000, glowA: 0 };

    const showPhone = this.hasPhone && P.phone !== null;


    // ── Hunch transform — compress posture but no rotation ────────
    const hunch = this.hunchLevel; // 0–4
    const hunchScaleY = 1 - hunch * 0.06; // body compresses vertically
    const hunchOffsetY = hunch * 6;     // sinks slightly downward
    // No rotation - keep agent upright

    this.container.setRotation(0);
    this.container.setScale(this._facingRight ? 1 : -1, hunchScaleY);

    // Update glow
    this._glow.setFillStyle(P.glow, P.glowA);

    // ── Right shoe ────────────────────────────────────────────────────────
    g.fillStyle(P.shoe, 1);
    g.fillRoundedRect(gl + 4*S, (28 - legSwing)*S, 9*S, 5*S, 2);

    // ── Left shoe ─────────────────────────────────────────────────────────
    g.fillStyle(P.shoe, 1);
    g.fillRoundedRect(gl + -13*S, (28 + legSwing)*S, 9*S, 5*S, 2);

    // ── Right leg ─────────────────────────────────────────────────────────
    g.fillStyle(P.pants, 1);
    g.fillRoundedRect(gl + 5*S, (10)*S, 7*S, (18 - legSwing)*S, 2);

    // ── Left leg ──────────────────────────────────────────────────────────
    g.fillStyle(P.pants, 1);
    g.fillRoundedRect(gl + -12*S, (10)*S, 7*S, (18 + legSwing)*S, 2);

    // ── Body ──────────────────────────────────────────────────────────────
    g.fillStyle(P.shirt, 1);
    g.fillRoundedRect(gl + -13*S, -8*S, 26*S, 20*S, 4);

    // Shirt collar V
    g.fillStyle(P.skin, 1);
    g.fillTriangle(
      gl + -3*S, -8*S,
      gl +  3*S, -8*S,
      gl +  0,   -2*S
    );

    // Shirt pocket detail
    g.fillStyle(0xffffff, 0.15);
    g.fillRoundedRect(gl + 4*S, -4*S, 5*S, 4*S, 1);

    // ── Right arm ─────────────────────────────────────────────────────────
    g.fillStyle(P.shirt, 1);
    if (showPhone) {
      // Arm raised holding phone
      g.fillRoundedRect(gl + 13*S, -10*S, 6*S, 14*S, 2);
    } else {
      g.fillRoundedRect(gl + 13*S, -6*S, 6*S, (16 + armSwing)*S, 2);
    }

    // ── Left arm ──────────────────────────────────────────────────────────
    g.fillStyle(P.shirt, 1);
    g.fillRoundedRect(gl + -19*S, -6*S, 6*S, (16 - armSwing)*S, 2);

    // ── Right hand ────────────────────────────────────────────────────────
    g.fillStyle(P.skin, 1);
    g.fillCircle(gl + 16*S, showPhone ? 4*S : (10 + armSwing)*S, 4*S);

    // ── Left hand ─────────────────────────────────────────────────────────
    g.fillStyle(P.skin, 1);
    g.fillCircle(gl + -16*S, (10 - armSwing)*S, 4*S);

    // ── Phone ─────────────────────────────────────────────────────────────
    if (showPhone) {
      g.fillStyle(P.phone, 1);
      g.fillRoundedRect(gl + 18*S, -12*S, 8*S, 14*S, 2);
      // Screen glow pulse
      const pulse = 0.55 + Math.sin(w * 3) * 0.25;
      g.fillStyle(0x38bdf8, pulse);
      g.fillRoundedRect(gl + 19*S, -11*S, 6*S, 10*S, 1);
      // Content lines on screen
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(gl + 20*S, -9*S, 4*S, 1*S);
      g.fillRect(gl + 20*S, -7*S, 3*S, 1*S);
      g.fillRect(gl + 20*S, -5*S, 4*S, 1*S);
      g.fillRect(gl + 20*S, -3*S, 2*S, 1*S);
    }

    // ── Neck ──────────────────────────────────────────────────────────────
    g.fillStyle(P.skin, 1);
    g.fillRect(gl + -3*S, -14*S, 6*S, 8*S);

    // ── Head ──────────────────────────────────────────────────────────────
    g.fillStyle(P.skin, 1);
    g.fillEllipse(gl + 0, -26*S, 24*S, 26*S);

    // ── Ear left ──────────────────────────────────────────────────────────
    g.fillStyle(P.skin, 1);
    g.fillEllipse(gl + -12*S, -24*S, 5*S, 7*S);

    // ── Ear right ─────────────────────────────────────────────────────────
    g.fillStyle(P.skin, 1);
    g.fillEllipse(gl + 12*S, -24*S, 5*S, 7*S);

    // ── Hair back ─────────────────────────────────────────────────────────
    g.fillStyle(P.hair, 1);
    g.fillEllipse(gl + 0, -40*S, 26*S, 14*S);
    g.fillRect(gl + -12*S, -44*S, 24*S, 16*S);

    // ── Hair front / smooth teen style (NO SPIKES) ────────────────────────
    g.fillStyle(P.hair, 1);
    // Main top
    g.fillEllipse(gl + 0, -43*S, 22*S, 10*S);
    // Smooth rounded bangs — teen boy style (no spikes)
    g.fillEllipse(gl + -8*S, -40*S, 6*S, 6*S);
    g.fillEllipse(gl + -2*S, -41*S, 6*S, 6*S);
    g.fillEllipse(gl + 4*S, -40*S, 6*S, 6*S);
    // Side hair
    g.fillEllipse(gl + -13*S, -34*S, 6*S, 12*S);
    g.fillEllipse(gl +  13*S, -34*S, 6*S, 12*S);

    // ── Eyebrows ──────────────────────────────────────────────────────────
    g.lineStyle(2.5*S * 0.4, P.hair, 1);
    if (state === 'BREAKING_POINT' || state === 'DISTORTED') {
      g.beginPath(); g.moveTo(gl + -10*S, -30*S); g.lineTo(gl + -4*S, -28*S); g.strokePath();
      g.beginPath(); g.moveTo(gl +  10*S, -30*S); g.lineTo(gl +  4*S, -28*S); g.strokePath();
    } else if (state === 'RECOVERED') {
      g.beginPath(); g.moveTo(gl + -10*S, -29*S); g.lineTo(gl + -4*S, -31*S); g.strokePath();
      g.beginPath(); g.moveTo(gl +  10*S, -29*S); g.lineTo(gl +  4*S, -31*S); g.strokePath();
    } else {
      g.beginPath(); g.moveTo(gl + -10*S, -30*S); g.lineTo(gl + -4*S, -30*S); g.strokePath();
      g.beginPath(); g.moveTo(gl +  10*S, -30*S); g.lineTo(gl +  4*S, -30*S); g.strokePath();
    }

    // ── Eye whites ────────────────────────────────────────────────────────
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(gl + -6*S, -25*S, 8*S, 7*S);
    g.fillEllipse(gl +  6*S, -25*S, 8*S, 7*S);

    // ── Iris ──────────────────────────────────────────────────────────────
    g.fillStyle(P.eye, 1);
    const irisR = state === 'ATTRACTED' ? 3.2*S : state === 'LOST' ? 1.8*S : 2.6*S;
    // _eyeOffset shifts iris/pupil horizontally so agent looks toward a sound source
    const eo = Phaser.Math.Clamp(this._eyeOffset, -2, 2) * S;
    g.fillCircle(gl + -6*S + eo, -25*S, irisR);
    g.fillCircle(gl +  6*S + eo, -25*S, irisR);

    // ── Pupil ─────────────────────────────────────────────────────────────
    g.fillStyle(0x000000, 1);
    g.fillCircle(gl + -6*S + eo, -25*S, irisR * 0.5);
    g.fillCircle(gl +  6*S + eo, -25*S, irisR * 0.5);

    // ── Eye shine ─────────────────────────────────────────────────────────
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(gl + -5*S + eo, -26*S, 1.2*S);
    g.fillCircle(gl +  7*S + eo, -26*S, 1.2*S);

    // ── Eye outline ───────────────────────────────────────────────────────
    g.lineStyle(1.2*S * 0.4, P.hair, 0.8);
    g.strokeEllipse(gl + -6*S, -25*S, 8*S, 7*S);
    g.strokeEllipse(gl +  6*S, -25*S, 8*S, 7*S);

    // ── Nose ──────────────────────────────────────────────────────────────
    g.fillStyle(P.skin, 1);
    g.lineStyle(1.2, 0xc8845a, 0.6);
    g.beginPath();
    g.moveTo(gl + -1.5*S, -20*S);
    g.lineTo(gl + -2.5*S, -17*S);
    g.lineTo(gl +  2.5*S, -17*S);
    g.strokePath();

    // ── Mouth ─────────────────────────────────────────────────────────────
    g.lineStyle(1.8*S * 0.4, 0x8b4513, 1);
    if (state === 'RECOVERED') {
      // Smile — arc curving downward
      g.beginPath(); g.arc(gl, -14*S, 4*S, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false); g.strokePath();
    } else if (state === 'LOST' || state === 'BREAKING_POINT') {
      // Frown — arc curving upward
      g.beginPath(); g.arc(gl, -14*S, 4*S, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false); g.strokePath();
    } else if (state === 'ATTRACTED') {
      // Slight smile
      g.beginPath(); g.arc(gl, -14.5*S, 3.5*S, Phaser.Math.DegToRad(25), Phaser.Math.DegToRad(155), false); g.strokePath();
    } else {
      // Neutral line
      g.beginPath(); g.moveTo(gl + -3*S, -15*S); g.lineTo(gl + 3*S, -15*S); g.strokePath();
    }

    // ── Subtle cheek blush ────────────────────────────────────────────────
    if (state === 'ATTRACTED' || state === 'RECOVERED') {
      g.fillStyle(0xfca5a5, 0.25);
      g.fillEllipse(gl + -9*S, -21*S, 7*S, 4*S);
      g.fillEllipse(gl +  9*S, -21*S, 7*S, 4*S);
    }
  }

  // ── Update ────────────────────────────────────────────────────────────────
  update() {
    this.fsm.update();
    this.emotions.update();
    this._handleInput();
    this._perceive();
    this._updateVisuals();
    this._syncHUD();
    this._updateAIVariables();
    if (this._perceptionCooldown > 0) this._perceptionCooldown--;
  }

  // ── AI Variable Updates (CORE INTELLIGENCE) ───────────────────────────────
  _updateAIVariables() {
    // Addiction naturally decays slowly when not using phone
    if (!this.hasPhone || !this.scene._mobileScreenOpen) {
      this.addictionLevel = Math.max(0, this.addictionLevel - 0.02);
    }

    // Awareness naturally recovers when not distracted
    if (!this.scene._mobileScreenOpen) {
      this.awareness = Math.min(100, this.awareness + 0.05);
    }

    // Update hunch level based on addiction
    if (this.addictionLevel > 80) {
      this.hunchLevel = 4;
    } else if (this.addictionLevel > 60) {
      this.hunchLevel = 3;
    } else if (this.addictionLevel > 40) {
      this.hunchLevel = 2;
    } else if (this.addictionLevel > 20) {
      this.hunchLevel = 1;
    } else {
      this.hunchLevel = 0;
    }

    // Learning: Store behavioral patterns
    if (this.addictionLevel > 80 && !this.memory.includes('high_addiction')) {
      this.memory.push('high_addiction');
      console.log('🧠 Agent learned: high_addiction pattern');
    }
    if (this.ignoredMessages >= 2 && !this.memory.includes('social_neglect')) {
      this.memory.push('social_neglect');
      console.log('🧠 Agent learned: social_neglect pattern');
    }
    if (this.scrollCount > 50 && !this.memory.includes('compulsive_scrolling')) {
      this.memory.push('compulsive_scrolling');
      console.log('🧠 Agent learned: compulsive_scrolling pattern');
    }
  }

  // ── Phone Usage Impact ────────────────────────────────────────────────────
  usePhone(deltaTime = 1) {
    this.timeOnPhone += deltaTime;
    this.addictionLevel = Math.min(100, this.addictionLevel + 0.15);
    this.awareness = Math.max(0, this.awareness - 0.12);
    this.emotions.applyEvent({ stress: 0.08, happiness: -0.05 });
  }

  // ── Scroll Action ─────────────────────────────────────────────────────────
  onScroll() {
    this.scrollCount++;
    this.addictionLevel = Math.min(100, this.addictionLevel + 0.3);
    this.awareness = Math.max(0, this.awareness - 0.2);
    this.emotions.applyEvent({ stress: 0.1 });
  }

  // ── Message Response ──────────────────────────────────────────────────────
  respondToMessage(action) {
    if (action === 'reply') {
      this.relationshipLevel = Math.min(100, this.relationshipLevel + 10);
      this.awareness = Math.min(100, this.awareness + 5);
      this.emotions.applyEvent({ happiness: 5, loneliness: -5 });
      console.log('💬 Agent replied to message - relationship improved');
    } else if (action === 'ignore') {
      this.ignoredMessages++;
      this.relationshipLevel = Math.max(0, this.relationshipLevel - 5);
      this.addictionLevel = Math.min(100, this.addictionLevel + 2);
      this.emotions.applyEvent({ loneliness: 3 });
      console.log('🚫 Agent ignored message - relationship damaged');
    }
  }

  // ── Keyboard input ────────────────────────────────────────────────────────
  _handleInput() {
    if (this.keysLocked) return; // Allow locking keyboard control
    
    const { width, height } = this.scene.scale;
    const speed = this.speed;
    const k = this._keys;
    const w = this._wasd;

    this.vx = 0;
    this.vy = 0;

    if (k.left.isDown  || w.left.isDown)  this.vx = -speed;
    if (k.right.isDown || w.right.isDown) this.vx =  speed;
    if (k.up.isDown    || w.up.isDown)    this.vy = -speed;
    if (k.down.isDown  || w.down.isDown)  this.vy =  speed;

    // Diagonal normalise
    if (this.vx !== 0 && this.vy !== 0) {
      this.vx *= 0.707;
      this.vy *= 0.707;
    }

    this._moving = this.vx !== 0 || this.vy !== 0;
    if (this._moving) this._walkCycle += 0.18;

    if (this.vx > 0) this._facingRight = true;
    if (this.vx < 0) this._facingRight = false;

    this.x += this.vx;
    this.y += this.vy;

    // ── Hard boundary clamp (all scenes) ─────────────────────────────────
    const margin = 24;
    const topBarH = 52;
    this.x = Phaser.Math.Clamp(this.x, margin, width  - margin);
    this.y = Phaser.Math.Clamp(this.y, topBarH + margin, height - margin);

    // ── Rubber-band boundary (Scene 2) ────────────────────────────────────
    if (this.rubberBand) {
      const margin = 60;
      const snapZone = 30; // how far past margin before snap triggers

      const overLeft   = this.x < margin;
      const overRight  = this.x > width - margin;
      const overTop    = this.y < 80 + margin;
      const overBottom = this.y > height - 70 - margin;

      if (overLeft || overRight || overTop || overBottom) {
        if (!this._snapping) {
          this._snapping = true;
          // Notify scene so it can show a visual cue
          if (this.scene._onRubberBandSnap) this.scene._onRubberBandSnap();

          // Snap back to center with a spring tween
          const targetX = width / 2;
          const targetY = height / 2;

          this.scene.tweens.add({
            targets: this,
            x: targetX, y: targetY,
            duration: 500,
            ease: 'Back.easeOut',
            onUpdate: () => {
              this.container.setPosition(this.x, this._bouncing ? this.container.y : this.y);
              this._shadow.setPosition(this.x, this.y + 52);
              this._glow.setPosition(this.x, this.y);
              this.nameTag.setPosition(this.x, this.y - 105);
              this.stateLabel.setPosition(this.x, this.y + 68);
              this.perceptionRing.setPosition(this.x, this.y);
            },
            onComplete: () => { this._snapping = false; }
          });
        }
      }
    }

    this.container.setPosition(this.x, this._bouncing ? this.container.y : this.y);
    this.container.setScale(this._facingRight ? 1 : -1, 1 - this.hunchLevel * 0.06);
    this._shadow.setPosition(this.x, this.y + 52);
    this._glow.setPosition(this.x, this.y);
    this.nameTag.setPosition(this.x, this.y - 105);
    this.stateLabel.setPosition(this.x, this.y + 68);
    this.perceptionRing.setPosition(this.x, this.y);

  }

  // ── Perception ────────────────────────────────────────────────────────────
  _perceive() {
    if (!this.scene.notifications) return;
    if (this._perceptionCooldown > 0) return;

    this.scene.notifications.forEach(n => {
      if (!n.active || n._seen) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, n.x, n.y);
      if (dist < 90) {
        // Only fire if scene hasn't already handled it
        if (!this.scene._notificationFired) {
          this.fsm.handleEvent('NOTIFICATION_SEEN');
        }
        this._perceptionCooldown = 50;
        n._seen = true;
      }
    });
  }

  onNotificationIgnored() { this.fsm.handleEvent('NOTIFICATION_IGNORED'); }
  onFriendMessage()        { this.fsm.handleEvent('FRIEND_MESSAGE'); }
  onFriendIgnored()        { this.fsm.handleEvent('FRIEND_IGNORED'); }
  onRandomEvent(type)      { this.fsm.handleEvent(type); }
  onPlayerChoice(choice)   { this.fsm.handleEvent(choice); }

  // ── Look toward a direction (eye animation on hearing notification) ──────
  /**
   * Snaps eyes toward 'right' or 'left', holds briefly, then returns to centre.
   * Called when Steve hears the notification sound.
   */
  lookAtDirection(direction) {
    const targetOffset = direction === 'right' ? 2 : -2;

    // Cancel any running eye tween
    if (this._eyeTween) {
      this._eyeTween.stop();
      this._eyeTween = null;
    }

    // Step 1 — snap eyes to the side quickly
    this._eyeTween = this.scene.tweens.addCounter({
      from: 0,
      to: targetOffset,
      duration: 120,
      ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        this._eyeOffset = tween.getValue();
      },
      onComplete: () => {
        // Step 2 — hold for 800ms (agent is "listening / reacting")
        this.scene.time.delayedCall(800, () => {
          // Step 3 — return to centre smoothly
          this._eyeTween = this.scene.tweens.addCounter({
            from: targetOffset,
            to: 0,
            duration: 300,
            ease: 'Sine.easeInOut',
            onUpdate: (tween) => {
              this._eyeOffset = tween.getValue();
            },
            onComplete: () => {
              this._eyeOffset = 0;
              this._eyeTween = null;
            }
          });
        });
      }
    });
  }

  // ── Bounce / victory hop ──────────────────────────────────────────────────
  bounce() {
    if (this._bouncing) return;
    this._bouncing = true;

    const baseY = this.y;

    // Three quick hops, each smaller — like a happy jump
    this.scene.tweens.add({
      targets: this.container,
      y: this.container.y - 28,
      duration: 160,
      ease: 'Sine.easeOut',
      yoyo: false,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.container,
          y: this.container.y + 28,
          duration: 140,
          ease: 'Bounce.easeOut',
          onComplete: () => {
            // Second smaller hop
            this.scene.tweens.add({
              targets: this.container,
              y: this.container.y - 14,
              duration: 110,
              ease: 'Sine.easeOut',
              yoyo: false,
              onComplete: () => {
                this.scene.tweens.add({
                  targets: this.container,
                  y: this.container.y + 14,
                  duration: 100,
                  ease: 'Bounce.easeOut',
                  onComplete: () => { this._bouncing = false; }
                });
              }
            });
          }
        });
      }
    });

    // Squash & stretch on the shadow during bounce
    this.scene.tweens.add({
      targets: this._shadow,
      scaleX: 0.5, scaleY: 0.5, alpha: 0.05,
      duration: 160, yoyo: true,
      onComplete: () => { this._shadow.setScale(1); this._shadow.setAlpha(0.18); }
    });
  }

  // ── Visuals ───────────────────────────────────────────────────────────────
  _updateVisuals() {
    const state = this.fsm.state;
    this.stateLabel.setText(state);

    // State badge colour
    const badgeColors = {
      IDLE: '#1a1a2e', ATTRACTED: '#4c1d95', LOOPING: '#7c2d12',
      DISTORTED: '#7f1d1d', BREAKING_POINT: '#450a0a',
      RECOVERED: '#14532d', PARTIAL: '#713f12', LOST: '#111827'
    };
    this.stateLabel.setStyle({
      backgroundColor: (badgeColors[state] || '#1a1a2e') + 'ee'
    });

    // Glitch in distorted states
    this._glitchOffset = (state === 'DISTORTED' || state === 'BREAKING_POINT')
      && Math.random() < 0.07 ? Phaser.Math.Between(-4, 4) : 0;

    this._drawCharacter(state);

    // Perception ring
    const ringAlpha = 0.1 + (this.emotions.stress / 100) * 0.4;
    const ringColor = state === 'RECOVERED' ? 0x16a34a : 0x1e3a5f;
    this.perceptionRing.setStrokeStyle(2, ringColor, ringAlpha);
  }

  // ── HUD ───────────────────────────────────────────────────────────────────
  _syncHUD() {
    const set = (barId, valId, val) => {
      const bar = document.getElementById(barId);
      const lbl = document.getElementById(valId);
      const pct = Math.round(val);
      if (bar) bar.style.width = `${pct}%`;
      if (lbl) lbl.textContent = `${pct}%`;
    };
    set('meter-stress',     'val-stress',     this.emotions.stress);
    set('meter-happiness',  'val-happiness',  this.emotions.happiness);
    set('meter-loneliness', 'val-loneliness', this.emotions.loneliness);

    const badge = document.getElementById('state-badge');
    if (badge) badge.textContent = `STATE: ${this.fsm.state}`;
  }
}
