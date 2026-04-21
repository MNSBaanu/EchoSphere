import Phaser from 'phaser';
import Agent from '../agent/Agent.js';
import { gsap } from 'gsap';

const FRIEND_MESSAGES = [
  { speaker: 'Mia 💬', text: 'omg did you see that new trend?? 😭' },
  { speaker: 'Mia 💬', text: 'you HAVE to check this out lol' },
  { speaker: 'Kai 💬', text: 'bro this video is everything 🔥' },
  { speaker: 'Mia 💬', text: 'reply!! i sent you something funny' },
  { speaker: 'Kai 💬', text: 'are you online? come see this 👀' },
  { speaker: 'Mia 💬', text: 'hellooo?? you there?' },
];

const NOTIFICATIONS = [
  '❤️  Mia liked your post',
  '🔔  12 new followers!',
  '💬  Kai commented on your photo',
  '🎉  Your post is trending!',
  '🔥  5 people reacted to your story',
  '⭐  You earned a new badge!',
  '📣  Someone shared your post',
  '💌  New message from Mia',
  '🚀  You went viral!',
  '👀  50 people viewed your profile',
];

const RANDOM_EVENTS = [
  { type: 'RANDOM_GOOD', label: '📵 Phone battery at 1%!',    desc: 'The screen goes dark. Kai looks up.',           color: 0x16a34a, hex: '#16a34a' },
  { type: 'RANDOM_GOOD', label: '🌧️ It\'s raining outside',   desc: 'The sound of rain pulls Kai\'s attention away.', color: 0x0284c7, hex: '#0284c7' },
  { type: 'RANDOM_BAD',  label: '🔥 Your post went VIRAL',    desc: 'Notifications explode. Kai can\'t look away.',   color: 0xdc2626, hex: '#dc2626' },
  { type: 'RANDOM_BAD',  label: '🎰 New addictive game dropped!', desc: 'Everyone is playing it.',                    color: 0x7c3aed, hex: '#7c3aed' },
  { type: 'RANDOM_GOOD', label: '💡 Social media is down',    desc: 'The platform crashes. Silence.',                color: 0xca8a04, hex: '#ca8a04' },
];

export default class AttractionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AttractionScene' });
    this.notifications = [];
    this._msgIndex = 0;
    this._pendingFriendMsg = false;
    this._decisionPending  = false;
    this._ended = false;
    this._logLines = [];
  }

  create() {
    const { width, height } = this.scale;

    // ── Background — light, airy, professional ────────────────────────────
    // Soft gradient from light lavender to white
    const bgGrad = this.add.graphics().setDepth(0);
    bgGrad.fillGradientStyle(0xf0f4ff, 0xf0f4ff, 0xffffff, 0xffffff, 1);
    bgGrad.fillRect(0, 0, width, height);

    // Soft decorative circles — depth/atmosphere
    this._drawAtmosphere(width, height);

    // Ground platform
    const ground = this.add.graphics().setDepth(1);
    ground.fillStyle(0xe2e8f0, 1);
    ground.fillRect(0, height - 70, width, 70);
    ground.lineStyle(2, 0xc7d2fe, 1);
    ground.lineBetween(0, height - 70, width, height - 70);

    // ── Scene header ──────────────────────────────────────────────────────
    // Top bar
    const topBar = this.add.graphics().setDepth(3);
    topBar.fillStyle(0x1e1b4b, 1);
    topBar.fillRect(0, 0, width, 52);

    this.add.text(24, 14, '🌐  EchoSphere', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffffff'
    }).setDepth(4);

    this.add.text(width / 2, 14, 'SCENARIO 1 — THE ATTRACTION', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '14px', color: '#a5b4fc', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(4);

    this.add.text(width - 24, 14, 'Digital World', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '13px', color: '#818cf8'
    }).setOrigin(1, 0).setDepth(4);

    // ── Agent ─────────────────────────────────────────────────────────────
    this.agent = new Agent(this, width / 2, height / 2 + 30);

    this.agent.fsm.onTransition((newState, reason) => {
      this._onStateChange(newState, reason);
    });

    // ── Timers ────────────────────────────────────────────────────────────
    this._scheduleNextNotification();
    this._scheduleNextFriendMessage();
    this._scheduleRandomEvent();

    // ── UI wiring ─────────────────────────────────────────────────────────
    this._buildChoiceButtons();

    // ── Event log ─────────────────────────────────────────────────────────
    this._logContainer = this.add.container(16, height - 16).setDepth(15);
  }

  update() {
    if (this._ended) return;
    if (this.agent) this.agent.update();
    this.notifications = this.notifications.filter(n => n.active);
  }

  // ── Atmosphere ────────────────────────────────────────────────────────────
  _drawAtmosphere(width, height) {
    const circles = [
      { x: width * 0.1,  y: height * 0.2, r: 180, c: 0xc7d2fe, a: 0.35 },
      { x: width * 0.85, y: height * 0.15, r: 220, c: 0xe0e7ff, a: 0.4 },
      { x: width * 0.5,  y: height * 0.8,  r: 260, c: 0xddd6fe, a: 0.25 },
      { x: width * 0.9,  y: height * 0.7,  r: 150, c: 0xbfdbfe, a: 0.3 },
      { x: width * 0.05, y: height * 0.75, r: 130, c: 0xe0e7ff, a: 0.3 },
    ];
    circles.forEach(({ x, y, r, c, a }) => {
      const orb = this.add.circle(x, y, r, c, a).setDepth(0);
      this.tweens.add({
        targets: orb,
        y: y - 20,
        alpha: a + 0.08,
        duration: Phaser.Math.Between(5000, 9000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    });
  }

  // ── State change ──────────────────────────────────────────────────────────
  _onStateChange(newState, reason) {
    this._log(`→ ${newState}`, reason);

    if (newState === 'ATTRACTED') {
      this._showDecisionNode('Kai feels the pull of the screen...', 'Engage', 'Resist');
    }
    if (newState === 'LOOPING' || newState === 'RECOVERED' || newState === 'PARTIAL' || newState === 'LOST') {
      this._endScene(newState, reason);
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  _scheduleNextNotification() {
    this.time.delayedCall(Phaser.Math.Between(1800, 4500), () => {
      if (!this._ended) { this._spawnNotification(); this._scheduleNextNotification(); }
    });
  }

  _spawnNotification() {
    const { width, height } = this.scale;
    const x    = Phaser.Math.Between(120, width - 120);
    const y    = Phaser.Math.Between(70,  height - 90);
    const text = Phaser.Utils.Array.GetRandom(NOTIFICATIONS);

    const bubble = this.add.container(x, y).setDepth(8);

    // Card shadow
    const shadow = this.add.rectangle(3, 3, 220, 46, 0x000000, 0.08);
    // Card background
    const bg = this.add.rectangle(0, 0, 220, 46, 0xffffff, 0.97);
    bg.setStrokeStyle(2, 0x6366f1, 1);
    // Icon strip
    const strip = this.add.rectangle(-99, 0, 22, 46, 0x6366f1, 1);
    // Bell icon text
    const icon = this.add.text(-99, 0, '🔔', { fontFamily: 'Sora, Inter, sans-serif', fontSize: '12px' }).setOrigin(0.5);
    // Message text
    const label = this.add.text(14, 0, text, {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '12px', color: '#1e1b4b',
      wordWrap: { width: 170 }
    }).setOrigin(0, 0.5);

    bubble.add([shadow, bg, strip, icon, label]);
    bubble.x = x;
    bubble.y = y;
    bubble._seen = false;

    gsap.fromTo(bubble, { alpha: 0, scale: 0.7, y: y - 10 }, { alpha: 1, scale: 1, y, duration: 0.35, ease: 'back.out(1.5)' });

    const lifetime = Phaser.Math.Between(3500, 6500);
    this.time.delayedCall(lifetime, () => {
      if (bubble.active) {
        if (!bubble._seen) this.agent.onNotificationIgnored();
        gsap.to(bubble, { alpha: 0, scale: 0.8, duration: 0.3, onComplete: () => { if (bubble.active) bubble.destroy(); } });
      }
    });

    this.notifications.push(bubble);
    this._showHTMLNotification(text);
  }

  // ── Friend messages ───────────────────────────────────────────────────────
  _scheduleNextFriendMessage() {
    this.time.delayedCall(Phaser.Math.Between(5000, 11000), () => {
      if (!this._ended) { this._showFriendMessage(); this._scheduleNextFriendMessage(); }
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

    const expiry = Phaser.Math.Between(4500, 8000);
    this.time.delayedCall(expiry, () => {
      if (this._pendingFriendMsg) {
        this._pendingFriendMsg = false;
        this.agent.onFriendIgnored();
        this._log('⚠️ Ignored', msg.speaker + ' got no reply');
      }
      gsap.to(box, { y: 20, opacity: 0, duration: 0.3, onComplete: () => box.classList.add('hidden') });
    });
  }

  // ── Random events ─────────────────────────────────────────────────────────
  _scheduleRandomEvent() {
    this.time.delayedCall(Phaser.Math.Between(9000, 22000), () => {
      if (!this._ended) { this._fireRandomEvent(); this._scheduleRandomEvent(); }
    });
  }

  _fireRandomEvent() {
    const ev = Phaser.Utils.Array.GetRandom(RANDOM_EVENTS);
    this.agent.onRandomEvent(ev.type);
    this._log(ev.label, ev.desc);

    const { width, height } = this.scale;
    const banner = this.add.container(width / 2, 80).setDepth(25);

    const bg = this.add.rectangle(0, 0, 480, 58, 0xffffff, 0.97);
    bg.setStrokeStyle(3, ev.color, 1);
    const titleT = this.add.text(0, -10, ev.label, {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '16px', fontStyle: 'bold', color: ev.hex
    }).setOrigin(0.5);
    const descT = this.add.text(0, 12, ev.desc, {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '12px', color: '#475569'
    }).setOrigin(0.5);
    banner.add([bg, titleT, descT]);

    gsap.fromTo(banner, { alpha: 0, y: 60 }, { alpha: 1, y: 80, duration: 0.4, ease: 'back.out(1.3)' });
    this.time.delayedCall(3200, () => {
      gsap.to(banner, { alpha: 0, y: 60, duration: 0.35, onComplete: () => banner.destroy() });
    });
  }

  // ── Decision node ─────────────────────────────────────────────────────────
  _showDecisionNode(prompt, yesLabel, noLabel) {
    if (this._decisionPending) return;
    this._decisionPending = true;

    const panel   = document.getElementById('decision-panel');
    const promptEl = document.getElementById('decision-prompt');
    const btnE    = document.getElementById('btn-engage');
    const btnR    = document.getElementById('btn-resist');
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
        backgroundColor: '#ffffffcc',
        padding: { x: 6, y: 2 }
      });
      this._logContainer.add(t);
    });
  }

  // ── HTML notification popup ───────────────────────────────────────────────
  _showHTMLNotification(text) {
    const popup = document.getElementById('notification-popup');
    const textEl = document.getElementById('notification-text');
    if (!popup || !textEl) return;
    textEl.textContent = text;
    popup.classList.remove('hidden');
    gsap.fromTo(popup, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35 });
    setTimeout(() => {
      gsap.to(popup, { x: 60, opacity: 0, duration: 0.3, onComplete: () => popup.classList.add('hidden') });
    }, 2800);
  }

  // ── Scene end ─────────────────────────────────────────────────────────────
  _endScene(outcome, reason) {
    if (this._ended) return;
    this._ended = true;

    const { width, height } = this.scale;

    const cfg = {
      LOOPING:        { bg: 0xfff7ed, title: '🔁 The Loop Begins',      sub: 'Kai is hooked. The habit is forming.',          tc: '#c2410c', bc: 0xfed7aa },
      RECOVERED:      { bg: 0xf0fdf4, title: '✅ Kai Resisted!',         sub: 'He stepped back before it was too late.',        tc: '#15803d', bc: 0xbbf7d0 },
      PARTIAL:        { bg: 0xfefce8, title: '🔶 Mixed Signals',         sub: 'Kai is torn between both worlds.',               tc: '#a16207', bc: 0xfef08a },
      LOST:           { bg: 0xf8fafc, title: '❌ Lost in the Feed',      sub: 'Kai is completely absorbed.',                    tc: '#dc2626', bc: 0xfecaca },
    }[outcome] || { bg: 0xffffff, title: outcome, sub: reason, tc: '#000000', bc: 0xeeeeee };

    // Fade to outcome colour
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, cfg.bg, 0).setDepth(30);
    this.tweens.add({ targets: overlay, fillAlpha: 0.92, duration: 1000 });

    this.time.delayedCall(700, () => {
      // Outcome card
      const card = this.add.container(width / 2, height / 2).setDepth(31);

      const cardBg = this.add.rectangle(0, 0, 560, 260, 0xffffff, 1);
      cardBg.setStrokeStyle(3, parseInt(cfg.tc.replace('#', '0x')), 1);

      const accent = this.add.rectangle(0, -130, 560, 8, parseInt(cfg.tc.replace('#', '0x')), 1);

      const titleT = this.add.text(0, -70, cfg.title, {
        fontFamily: 'Sora, Inter, sans-serif', fontSize: '32px', fontStyle: 'bold', color: cfg.tc
      }).setOrigin(0.5);

      const subT = this.add.text(0, -20, cfg.sub, {
        fontFamily: 'Sora, Inter, sans-serif', fontSize: '16px', color: '#475569'
      }).setOrigin(0.5);

      const fsm = this.agent.fsm;
      const statsT = this.add.text(0, 20,
        `Engaged: ${fsm.engageCount}   ·   Resisted: ${fsm.resistCount}   ·   Friends ignored: ${fsm.ignoredFriends}`,
        { fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#94a3b8' }
      ).setOrigin(0.5);

      const reasonT = this.add.text(0, 55, `Reason: ${reason}`, {
        fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#cbd5e1'
      }).setOrigin(0.5);

      const hintT = this.add.text(0, 95, 'Click anywhere to continue →', {
        fontFamily: 'Sora, Inter, sans-serif', fontSize: '13px', color: '#94a3b8'
      }).setOrigin(0.5);

      // Blink hint
      this.tweens.add({ targets: hintT, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

      card.add([cardBg, accent, titleT, subT, statsT, reasonT, hintT]);

      gsap.fromTo(card, { alpha: 0, scale: 0.85 }, { alpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.3)' });

      this.input.once('pointerdown', () => {
        console.log('[Scene] Scenario 1 ended:', outcome);
      });
    });
  }
}
