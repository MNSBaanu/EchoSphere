import Phaser from 'phaser';
import Agent from '../agent/Agent.js';
import { gsap } from 'gsap';

const FRIEND_MESSAGES = [
  { speaker: 'Mia 💬', text: 'omg did you see that new trend?? 😭' },
  { speaker: 'Mia 💬', text: 'you HAVE to check this out lol' },
  { speaker: 'Mia 💬', text: 'reply!! i sent you something funny' },
  { speaker: 'Mia 💬', text: 'hellooo?? you there?' },
];

const POSITIVE_COMMENTS = [
  { icon: '❤️', text: 'Mia liked your photo!' },
  { icon: '🔥', text: 'Kai: "bro this is fire!!"' },
  { icon: '😍', text: '47 people loved your post' },
  { icon: '⭐', text: 'You earned a new badge!' },
  { icon: '🎉', text: 'Mia: "omg you\'re so funny"' },
  { icon: '💬', text: '12 new comments on your post' },
  { icon: '🚀', text: 'Your post is trending!' },
  { icon: '👏', text: 'Mia: "this is everything!!"' },
  { icon: '💖', text: '100 likes in 10 minutes!' },
  { icon: '✨', text: 'Kai: "you\'re the best lol"' },
];

// Reward particles: hearts, stars, confetti colors
const PARTICLE_EMOJIS = ['❤️', '⭐', '✨', '💛', '🎉', '💖', '🌟'];

export default class AttractionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AttractionScene' });
    this._msgIndex = 0;
    this._pendingFriendMsg = false;
    this._decisionPending = false;
    this._ended = false;
    this._logLines = [];
    this._engageStreak = 0;   // combo counter
    this._phonePickedUp = false;
  }

  create() {
    const { width, height } = this.scale;

    // ── Background: Dual-Layer Depth ─────────────────────────────────────
    this._drawBackground(width, height);

    // Ground is now part of _drawBackground — no separate ground needed here

    // ── Top bar ───────────────────────────────────────────────────────────
    const topBar = this.add.graphics().setDepth(3);
    topBar.fillStyle(0x1e1b4b, 1);
    topBar.fillRect(0, 0, width, 52);

    this.add.text(24, 14, '🌐  EchoSphere', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffffff'
    }).setDepth(4);

    this.add.text(width / 2, 14, 'SCENARIO 1 — THE ATTRACTION', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '14px', color: '#a5b4fc', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(4);

    this.add.text(width - 24, 14, 'Digital World  ·  [N] skip', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '13px', color: '#818cf8'
    }).setOrigin(1, 0).setDepth(4);

    // ── Glowing phone object ──────────────────────────────────────────────
    this._spawnPhone(width, height);

    // ── Agent ─────────────────────────────────────────────────────────────
    this.agent = new Agent(this, 120, height / 2 + 30);
    // Disable keyboard control until phone is picked up
    this.agent._keys.left.enabled  = false;
    this.agent._keys.right.enabled = false;
    this.agent._keys.up.enabled    = false;
    this.agent._keys.down.enabled  = false;
    this.agent._wasd.left.enabled  = false;
    this.agent._wasd.right.enabled = false;
    this.agent._wasd.up.enabled    = false;
    this.agent._wasd.down.enabled  = false;
    this.agent.fsm.onTransition((newState, reason) => {
      this._onStateChange(newState, reason);
    });

    // ── Friend messages ───────────────────────────────────────────────────
    this._scheduleNextFriendMessage();

    // ── Dev skip ──────────────────────────────────────────────────────────
    this.input.keyboard.once('keydown-N', () => {
      if (!this._ended) {
        this._ended = true;
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('TheLoopScene');
        });
      }
    });

    // ── UI ────────────────────────────────────────────────────────────────
    this._buildChoiceButtons();
    this._logContainer = this.add.container(16, height - 16).setDepth(15);
  }

  update() {
    if (this._ended) return;
    if (this.agent) this.agent.update();

    // Once phone is placed, walk agent toward it until picked up
    if (!this._phonePickedUp && this._phone) {
      this._walkAgentToPhone();
    }
  }

  // ── Background: Dual-Layer Depth ─────────────────────────────────────────
  _drawBackground(width, height) {
    // ── Layer 1: Gradient sky ─────────────────────────────────────────────
    const sky = this.add.graphics().setDepth(0);
    sky.fillGradientStyle(0x1a1040, 0x1a1040, 0x2d1b69, 0x3b2a8a, 1);
    sky.fillRect(0, 0, width, height);

    // Soft radial glow in center-top — like a light source behind the scene
    const glowColors = [
      { x: width * 0.5,  y: height * 0.2, r: 320, c: 0x6366f1, a: 0.12 },
      { x: width * 0.2,  y: height * 0.4, r: 200, c: 0x8b5cf6, a: 0.08 },
      { x: width * 0.8,  y: height * 0.3, r: 240, c: 0x4f46e5, a: 0.09 },
    ];
    glowColors.forEach(({ x, y, r, c, a }) => {
      const orb = this.add.circle(x, y, r, c, a).setDepth(0);
      this.tweens.add({
        targets: orb, alpha: a + 0.06, y: y - 18,
        duration: Phaser.Math.Between(5000, 8000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    });

    // ── Layer 2: Perspective grid floor ───────────────────────────────────
    const grid = this.add.graphics().setDepth(1);
    const horizon = height * 0.62; // vanishing point height
    const vp = { x: width / 2, y: horizon }; // vanishing point

    grid.lineStyle(1, 0x6366f1, 0.35);

    // Vertical lines converging to vanishing point
    const cols = 18;
    for (let i = 0; i <= cols; i++) {
      const bx = (width / cols) * i; // bottom x spread
      grid.beginPath();
      grid.moveTo(vp.x, vp.y);
      grid.lineTo(bx, height);
      grid.strokePath();
    }

    // Horizontal lines — spaced closer near horizon (perspective)
    const rows = 10;
    for (let r = 1; r <= rows; r++) {
      const t = (r / rows) ** 1.8; // exponential spacing
      const y = horizon + (height - horizon) * t;
      const xLeft  = vp.x - (vp.x * t * 1.1);
      const xRight = vp.x + (vp.x * t * 1.1);
      grid.beginPath();
      grid.moveTo(xLeft, y);
      grid.lineTo(xRight, y);
      grid.strokePath();
    }

    // Horizon glow line
    const horizonGlow = this.add.graphics().setDepth(1);
    horizonGlow.lineStyle(2, 0xa5b4fc, 0.5);
    horizonGlow.lineBetween(0, horizon, width, horizon);

    // Subtle floor fill below horizon
    const floor = this.add.graphics().setDepth(1);
    floor.fillStyle(0x0f0a2e, 0.6);
    floor.fillRect(0, horizon, width, height - horizon);

    // ── Layer 3: Floating UI cards (midground) ────────────────────────────
    const cards = [
      { icon: '📸', label: 'Photos',   x: width * 0.12, y: height * 0.28, delay: 0    },
      { icon: '🎵', label: 'Music',    x: width * 0.88, y: height * 0.22, delay: 800  },
      { icon: '💬', label: 'Messages', x: width * 0.08, y: height * 0.52, delay: 1600 },
      { icon: '🎮', label: 'Games',    x: width * 0.92, y: height * 0.48, delay: 400  },
      { icon: '📱', label: 'Social',   x: width * 0.18, y: height * 0.72, delay: 1200 },
      { icon: '🌐', label: 'Browse',   x: width * 0.82, y: height * 0.68, delay: 2000 },
    ];

    cards.forEach(({ icon, label, x, y, delay }) => {
      const card = this.add.container(x, y).setDepth(2).setAlpha(0);

      const bg = this.add.rectangle(0, 0, 72, 72, 0xffffff, 0.07);
      bg.setStrokeStyle(1, 0x818cf8, 0.5);
      const iconT = this.add.text(0, -10, icon, { fontSize: '22px' }).setOrigin(0.5);
      const labelT = this.add.text(0, 18, label, {
        fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#c7d2fe'
      }).setOrigin(0.5);

      card.add([bg, iconT, labelT]);

      // Fade in with delay, then drift up and down forever
      this.time.delayedCall(delay, () => {
        this.tweens.add({ targets: card, alpha: 0.85, duration: 800, ease: 'Sine.easeOut' });
      });

      const floatAmp = Phaser.Math.Between(10, 22);
      this.tweens.add({
        targets: card,
        y: y - floatAmp,
        duration: Phaser.Math.Between(3000, 5500),
        delay,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    });

    // ── Stars / particles in sky ──────────────────────────────────────────
    for (let i = 0; i < 55; i++) {
      const sx = Phaser.Math.Between(0, width);
      const sy = Phaser.Math.Between(0, horizon * 0.9);
      const sr = Math.random() < 0.15 ? 2 : 1;
      const star = this.add.circle(sx, sy, sr, 0xe0e7ff, Phaser.Math.FloatBetween(0.2, 0.7)).setDepth(0);
      this.tweens.add({
        targets: star, alpha: 0.1,
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        ease: 'Sine.easeInOut'
      });
    }
  }

  // ── Feature 1: Glowing phone ──────────────────────────────────────────────
  _spawnPhone(width, height) {
    const px = width / 2 + 80;
    const py = height / 2 + 10;

    // Outer glow ring
    this._phoneGlow = this.add.circle(px, py, 44, 0xfbbf24, 0.25).setDepth(4);
    this.tweens.add({
      targets: this._phoneGlow,
      scaleX: 1.5, scaleY: 1.5, alpha: 0,
      duration: 1200, repeat: -1, ease: 'Sine.easeOut'
    });

    // Phone body
    const phone = this.add.container(px, py).setDepth(5);

    const body = this.add.rectangle(0, 0, 36, 60, 0x1e1b4b, 1);
    body.setStrokeStyle(3, 0xfbbf24, 1);
    const screen = this.add.rectangle(0, -4, 28, 44, 0x6366f1, 1);
    const homeBtn = this.add.circle(0, 24, 5, 0xfbbf24, 1);
    const screenText = this.add.text(0, -4, '📱', { fontSize: '18px' }).setOrigin(0.5);

    phone.add([body, screen, homeBtn, screenText]);

    // Warm pulse tween on the phone
    this.tweens.add({
      targets: phone,
      scaleX: 1.08, scaleY: 1.08,
      duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    this._phone = phone;
    this._phonePos = { x: px, y: py };
  }

  // ── Walk agent toward phone ───────────────────────────────────────────────
  _walkAgentToPhone() {
    const dx = this._phonePos.x - this.agent.x;
    const dy = this._phonePos.y - this.agent.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 48) {
      // Override velocity so agent walks toward phone automatically
      const speed = 1.2;
      this.agent.x += (dx / dist) * speed;
      this.agent.y += (dy / dist) * speed;
      // Sync container position manually since we're bypassing _handleInput
      this.agent.container.setPosition(this.agent.x, this.agent._bouncing ? this.agent.container.y : this.agent.y);
      this.agent._shadow.setPosition(this.agent.x, this.agent.y + 52);
      this.agent._glow.setPosition(this.agent.x, this.agent.y);
      this.agent.nameTag.setPosition(this.agent.x, this.agent.y - 80);
      this.agent.stateLabel.setPosition(this.agent.x, this.agent.y + 68);
      this.agent.perceptionRing.setPosition(this.agent.x, this.agent.y);
    } else {
      // Close enough — pick it up
      this._pickUpPhone();
    }
  }

  _pickUpPhone() {
    this._phonePickedUp = true;

    // Phone flies up to agent and disappears
    gsap.to(this._phone, {
      x: this.agent.x, y: this.agent.y - 30,
      scale: 0, alpha: 0, duration: 0.5, ease: 'back.in(2)',
      onComplete: () => { if (this._phone.active) this._phone.destroy(); }
    });
    if (this._phoneGlow && this._phoneGlow.active) this._phoneGlow.destroy();

    // Sparkle burst on pickup
    this._burstParticles(this.agent.x, this.agent.y, 14);
    this.agent.bounce();
    this._log('📱 Kai', 'picked up the phone!');

    // Re-enable keyboard control now that agent has the phone
    this.agent.hasPhone = true;
    this.agent._keys.left.enabled  = true;
    this.agent._keys.right.enabled = true;
    this.agent._keys.up.enabled    = true;
    this.agent._keys.down.enabled  = true;
    this.agent._wasd.left.enabled  = true;
    this.agent._wasd.right.enabled = true;
    this.agent._wasd.up.enabled    = true;
    this.agent._wasd.down.enabled  = true;

    // Trigger FSM — agent just discovered social media
    this.agent.fsm.handleEvent('NOTIFICATION_SEEN');

    // After pickup, start periodic reward interactions
    this._scheduleRewardInteraction();
  }

  // ── Feature 2: Particle burst (hearts / stars / confetti) ─────────────────
  _burstParticles(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      const emoji = Phaser.Utils.Array.GetRandom(PARTICLE_EMOJIS);
      const angle = (i / count) * Math.PI * 2;
      const dist  = Phaser.Math.Between(40, 90);
      const tx    = x + Math.cos(angle) * dist;
      const ty    = y + Math.sin(angle) * dist;

      const p = this.add.text(x, y, emoji, { fontSize: '18px' })
        .setOrigin(0.5)
        .setDepth(20);

      gsap.to(p, {
        x: tx, y: ty - 30,
        alpha: 0, scale: 1.4,
        duration: Phaser.Math.Between(600, 1000) / 1000,
        ease: 'power2.out',
        onComplete: () => { if (p.active) p.destroy(); }
      });
    }
  }

  // ── Periodic reward interactions after phone pickup ───────────────────────
  _scheduleRewardInteraction() {
    this.time.delayedCall(Phaser.Math.Between(2000, 4000), () => {
      if (!this._ended) {
        this._doRewardInteraction();
        this._scheduleRewardInteraction();
      }
    });
  }

  _doRewardInteraction() {
    this._engageStreak++;
    this.agent.fsm.handleEvent('NOTIFICATION_SEEN');

    // Step 1: show comment bubble rising from the phone position (agent's hand)
    const comment = Phaser.Utils.Array.GetRandom(POSITIVE_COMMENTS);
    this._showCommentBubble(comment, () => {
      // Step 2: after bubble appears, agent bounces + particles
      this.agent.bounce();
      this._burstParticles(this.agent.x, this.agent.y, 8);
      // Step 3: combo counter
      this._showCombo(this._engageStreak);
      // Step 4: addiction progression
      this._progressAddiction(this._engageStreak);
    });
  }

  // ── Comment bubble rising from phone ─────────────────────────────────────
  _showCommentBubble(comment, onRead) {
    // Spawn at agent's position (phone is in hand, roughly right side)
    const bx = this.agent.x + 40;
    const by = this.agent.y - 30;

    const bubble = this.add.container(bx, by).setDepth(22);

    // Outer glow ring that expands outward
    const glow = this.add.circle(0, 0, 30, 0x6366f1, 0.3);
    bubble.add(glow);
    gsap.to(glow, { 
      scale: 2.5, alpha: 0, duration: 0.5, ease: 'power2.out'
    });

    // Card background with gradient-like layering
    const shadow = this.add.rectangle(3, 3, 200, 52, 0x000000, 0.12);
    const bg = this.add.rectangle(0, 0, 200, 52, 0xffffff, 0.98);
    
    // Animated gradient stripe on left edge
    const stripe = this.add.rectangle(-98, 0, 4, 52, 0x6366f1, 1);
    gsap.to(stripe, {
      fillColor: 0xa855f7, duration: 0.8, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Soft inner border
    const border = this.add.rectangle(0, 0, 200, 52);
    border.setStrokeStyle(2, 0x818cf8, 0.6);
    border.setFillStyle(0x000000, 0);

    // Tail triangle pointing down toward phone — with subtle shadow
    const tailShadow = this.add.triangle(2, 28, -8, 0, 8, 0, 0, 14, 0x000000, 0.08);
    const tail = this.add.triangle(0, 26, -8, 0, 8, 0, 0, 14, 0xffffff, 0.98);

    // Icon with pulsing glow behind it
    const iconGlow = this.add.circle(-78, 0, 16, 0xfbbf24, 0.25);
    gsap.to(iconGlow, {
      scale: 1.3, alpha: 0.05, duration: 0.6, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    const iconBg = this.add.circle(-78, 0, 14, 0xfef3c7, 1);
    const iconT = this.add.text(-78, 0, comment.icon, {
      fontSize: '18px'
    }).setOrigin(0.5);

    // Text with subtle fade-in typing effect
    const textT = this.add.text(-50, 0, '', {
      fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#1e1b4b', fontStyle: '600',
      wordWrap: { width: 135 }
    }).setOrigin(0, 0.5);

    // Sparkle particles around the bubble
    const sparkles = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const dist = 35;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist;
      const sparkle = this.add.text(sx, sy, '✨', { fontSize: '10px' }).setOrigin(0.5).setAlpha(0);
      sparkles.push(sparkle);
      bubble.add(sparkle);
    }

    bubble.add([shadow, bg, stripe, border, tailShadow, tail, iconGlow, iconBg, iconT, textT]);

    // Pop in from phone with overshoot spring
    gsap.fromTo(bubble, 
      { alpha: 0, scale: 0.3, y: by + 20, rotation: -0.15 },
      { alpha: 1, scale: 1, y: by - 10, rotation: 0, duration: 0.45, ease: 'back.out(2.5)',
        onComplete: () => {
          // Typing effect for text
          let charIndex = 0;
          const typeInterval = setInterval(() => {
            if (charIndex < comment.text.length) {
              textT.setText(comment.text.slice(0, charIndex + 1));
              charIndex++;
            } else {
              clearInterval(typeInterval);
              // Text fully typed — agent has "read" it
              if (onRead) onRead();
            }
          }, 25);

          // Sparkles burst outward
          sparkles.forEach((s, i) => {
            gsap.to(s, {
              alpha: 1, scale: 1.2, duration: 0.3, delay: i * 0.05,
              onComplete: () => {
                gsap.to(s, { alpha: 0, scale: 0.5, duration: 0.4 });
              }
            });
          });

          // Hold briefly then float away and fade
          gsap.to(bubble, {
            y: by - 60, alpha: 0, scale: 0.9, duration: 0.7, delay: 1.2, ease: 'Sine.easeIn',
            onComplete: () => { if (bubble.active) bubble.destroy(); }
          });
        }
      }
    );

    // Subtle wobble while visible
    gsap.to(bubble, {
      rotation: 0.03, duration: 0.4, yoyo: true, repeat: 3, ease: 'Sine.easeInOut'
    });
  }

  // ── Feature 3: Combo counter ──────────────────────────────────────────────
  _showCombo(streak) {
    const { width } = this.scale;

    const labels = {
      2: '2x  Nice!',
      3: '3x  Engagement!',
      5: '5x  Streak! 🔥',
      8: '8x  On Fire!! 🔥🔥',
      10: '10x  ADDICTED 💀',
    };
    const label = labels[streak] || (streak >= 10 ? `${streak}x  Can\'t Stop! 💀` : `${streak}x  Keep Going!`);

    // Color gets more intense with streak
    const color = streak >= 8 ? '#ef4444' : streak >= 5 ? '#f97316' : streak >= 3 ? '#f59e0b' : '#6366f1';

    const combo = this.add.container(width / 2, 90).setDepth(22);
    const bg = this.add.rectangle(0, 0, 280, 44, 0xffffff, 0.95);
    bg.setStrokeStyle(3, parseInt(color.replace('#', '0x')), 1);
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '18px', fontStyle: 'bold', color
    }).setOrigin(0.5);
    combo.add([bg, txt]);

    gsap.fromTo(combo, { alpha: 0, scale: 0.6, y: 70 }, { alpha: 1, scale: 1, y: 90, duration: 0.3, ease: 'back.out(2)' });
    this.time.delayedCall(1400, () => {
      gsap.to(combo, { alpha: 0, y: 70, duration: 0.3, onComplete: () => combo.destroy() });
    });

    this._log(`🎯 ${streak}x streak`, label);
  }

  // ── Addiction progression — visual corruption + auto-transition ───────────
  _progressAddiction(streak) {
    const { width, height } = this.scale;

    // ── Milestone 3: scene starts to warm/darken slightly ─────────────────
    if (streak === 3) {
      this._showAddictionWarning('Kai is really enjoying this...', '#f59e0b');
      // Warm the sky slightly
      this.tweens.add({
        targets: this.cameras.main,
        duration: 3000, ease: 'Sine.easeInOut',
        onUpdate: (tween) => {
          const t = tween.progress;
          this.cameras.main.setTint(
            Phaser.Display.Color.GetColor(
              Math.round(255),
              Math.round(255 - t * 30),
              Math.round(255 - t * 40)
            )
          );
        }
      });
    }

    // ── Milestone 5: agent glow intensifies, grid pulses ──────────────────
    if (streak === 5) {
      this._showAddictionWarning('He can\'t put it down...', '#f97316');
      // Flash the screen with a warm overlay
      const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xff6600, 0).setDepth(28);
      this.tweens.add({
        targets: flash, fillAlpha: 0.12, duration: 400,
        yoyo: true, repeat: 1,
        onComplete: () => flash.destroy()
      });
      // Speed up reward interactions
      this._rewardInterval = Math.max(1200, (this._rewardInterval || 3000) - 600);
    }

    // ── Milestone 7: screen glitch effect ─────────────────────────────────
    if (streak === 7) {
      this._showAddictionWarning('Reality is fading away...', '#ef4444');
      this._startGlitchEffect();
    }

    // ── Milestone 8: addiction lock-in — begin transition sequence ─────────
    if (streak === 8) {
      this._showAddictionWarning('Kai is ADDICTED. The loop begins...', '#dc2626');
      // Give it 3 seconds to show the warning, then auto-transition
      this.time.delayedCall(3000, () => {
        if (!this._ended) this._transitionToLoop();
      });
    }
  }

  // ── Addiction warning banner ──────────────────────────────────────────────
  _showAddictionWarning(message, color) {
    const { width, height } = this.scale;
    const hexColor = parseInt(color.replace('#', '0x'));

    const banner = this.add.container(width / 2, height / 2).setDepth(29).setAlpha(0);

    const bg = this.add.rectangle(0, 0, width * 0.7, 56, 0x000000, 0.75);
    bg.setStrokeStyle(2, hexColor, 1);
    const bar = this.add.rectangle(0, -28, width * 0.7, 4, hexColor, 1);
    const txt = this.add.text(0, 0, message, {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '18px', fontStyle: 'bold', color
    }).setOrigin(0.5);

    banner.add([bg, bar, txt]);

    gsap.fromTo(banner,
      { alpha: 0, scale: 0.9 },
      { alpha: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)',
        onComplete: () => {
          this.time.delayedCall(2000, () => {
            gsap.to(banner, { alpha: 0, duration: 0.5, onComplete: () => banner.destroy() });
          });
        }
      }
    );
  }

  // ── Glitch effect — screen tears and color shifts ─────────────────────────
  _startGlitchEffect() {
    const { width, height } = this.scale;
    let glitchCount = 0;

    const doGlitch = () => {
      if (this._ended || glitchCount > 6) return;
      glitchCount++;

      // Random color tint flash
      const colors = [0xff0044, 0x00ffff, 0xff6600, 0x9900ff];
      const c = Phaser.Utils.Array.GetRandom(colors);
      this.cameras.main.flash(80, (c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff);

      // Camera shake
      this.cameras.main.shake(120, 0.006);

      // Schedule next glitch
      this.time.delayedCall(Phaser.Math.Between(300, 900), doGlitch);
    };

    doGlitch();
  }

  // ── Auto-transition to Scene 2 ────────────────────────────────────────────
  _transitionToLoop() {
    if (this._ended) return;
    this._ended = true;

    const { width, height } = this.scale;

    // Final dramatic flash
    this.cameras.main.flash(300, 255, 100, 0);
    this.cameras.main.shake(400, 0.012);

    // Dark vignette closes in
    const vignette = this.add.graphics().setDepth(35);
    vignette.fillStyle(0x000000, 0);
    vignette.fillRect(0, 0, width, height);

    this.time.delayedCall(400, () => {
      // Show "The Loop Begins" title card
      const card = this.add.container(width / 2, height / 2).setDepth(36);
      const cardBg = this.add.rectangle(0, 0, 500, 140, 0x000000, 0.9);
      cardBg.setStrokeStyle(3, 0xf97316, 1);
      const title = this.add.text(0, -25, '🔁 The Loop Begins', {
        fontFamily: 'Sora, Inter, sans-serif', fontSize: '32px', fontStyle: 'bold', color: '#f97316'
      }).setOrigin(0.5);
      const sub = this.add.text(0, 20, 'Kai is hooked. The habit is forming.', {
        fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#94a3b8'
      }).setOrigin(0.5);
      card.add([cardBg, title, sub]);

      gsap.fromTo(card, { alpha: 0, scale: 0.8 }, { alpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' });

      // After 2.5s, fade to black and go to Scene 2
      this.time.delayedCall(2500, () => {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('TheLoopScene');
        });
      });
    });
  }
  _scheduleNextFriendMessage() {
    this.time.delayedCall(Phaser.Math.Between(8000, 14000), () => {
      if (!this._ended && this._phonePickedUp) {
        this._showFriendMessage();
        this._scheduleNextFriendMessage();
      } else if (!this._ended) {
        this._scheduleNextFriendMessage();
      }
    });
  }

  _showFriendMessage() {
    const msg = FRIEND_MESSAGES[this._msgIndex % FRIEND_MESSAGES.length];
    this._msgIndex++;
    this._pendingFriendMsg = true;

    const box     = document.getElementById('dialogue-box');
    const speaker = document.getElementById('dialogue-speaker');
    const textEl  = document.getElementById('dialogue-text');
    if (!box || !speaker || !textEl) return;

    speaker.textContent = msg.speaker;
    textEl.textContent  = msg.text;
    box.classList.remove('hidden');
    gsap.fromTo(box, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });

    this.agent.onFriendMessage();
    this._log(`📩 ${msg.speaker}`, msg.text.slice(0, 32));

    this.time.delayedCall(5000, () => {
      this._pendingFriendMsg = false;
      gsap.to(box, { y: 20, opacity: 0, duration: 0.3, onComplete: () => box.classList.add('hidden') });
    });
  }

  // ── State change ──────────────────────────────────────────────────────────
  _onStateChange(newState, reason) {
    this._log(`→ ${newState}`, reason);
    if (newState === 'ATTRACTED') {
      this._showDecisionNode('Kai feels the pull of the screen...', 'Engage', 'Resist');
    }
    // LOOPING is now handled by _progressAddiction auto-transition
    // Other terminal states (edge cases) still end the scene
    if (['RECOVERED', 'PARTIAL', 'LOST'].includes(newState)) {
      this._transitionToLoop();
    }
  }

  // ── Decision node ─────────────────────────────────────────────────────────
  _showDecisionNode(prompt, yesLabel, noLabel) {
    if (this._decisionPending) return;
    this._decisionPending = true;

    const panel    = document.getElementById('decision-panel');
    const promptEl = document.getElementById('decision-prompt');
    const btnE     = document.getElementById('btn-engage');
    const btnR     = document.getElementById('btn-resist');
    if (!panel) return;

    if (promptEl) promptEl.textContent = prompt;
    if (btnE) btnE.textContent = yesLabel;
    if (btnR) btnR.textContent = noLabel;

    panel.classList.remove('hidden');
    gsap.fromTo(panel, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' });

    this.time.delayedCall(7000, () => {
      if (this._decisionPending) {
        this._decisionPending = false;
        panel.classList.add('hidden');
        this._log('⏱ No choice', 'Kai decided on his own');
      }
    });
  }

  _buildChoiceButtons() {
    const panel = document.getElementById('decision-panel');
    const btnE  = document.getElementById('btn-engage');
    const btnR  = document.getElementById('btn-resist');

    btnE?.addEventListener('click', () => {
      if (!this._decisionPending) return;
      this._decisionPending = false;
      panel.classList.add('hidden');
      this.agent.onPlayerChoice('PLAYER_ENGAGE');
      this._log('🎮 Player', 'chose to Engage');
    });

    btnR?.addEventListener('click', () => {
      if (!this._decisionPending) return;
      this._decisionPending = false;
      panel.classList.add('hidden');
      this.agent.onPlayerChoice('PLAYER_RESIST');
      this._log('🎮 Player', 'chose to Resist');
    });
  }

  // ── Event log ─────────────────────────────────────────────────────────────
  _log(label, detail = '') {
    const line = `${label}${detail ? '  —  ' + detail : ''}`;
    this._logLines.push(line);
    if (this._logLines.length > 5) this._logLines.shift();
    this._logContainer.removeAll(true);
    this._logLines.forEach((l, i) => {
      const t = this.add.text(0, -(this._logLines.length - i) * 18, l, {
        fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#475569',
        backgroundColor: '#ffffffcc', padding: { x: 6, y: 2 }
      });
      this._logContainer.add(t);
    });
  }

}

