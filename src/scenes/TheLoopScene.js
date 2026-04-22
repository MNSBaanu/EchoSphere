import Phaser from 'phaser';
import Agent from '../agent/Agent.js';
import { gsap } from 'gsap';

const LOOP_NOTIFICATIONS = [
  '🔔  You have 47 new notifications',
  '🔥  Your streak is on fire!',
  '💬  Mia posted again — don\'t miss it',
  '📣  Trending now: check it out',
  '⭐  New content just for you',
  '🎯  You\'re in the top 10% today!',
  '🔁  Kai, you haven\'t scrolled in 2 mins',
  '💡  Recommended: 12 new posts',
  '🚨  Breaking: everyone is talking about this',
  '🎰  Spin your daily reward!',
];

const LOOP_MESSAGES = [
  { speaker: 'Mia 💬', text: 'you\'ve been online for hours lol' },
  { speaker: 'Kai\'s Mom 📞', text: 'Kai, dinner is ready. Come down.' },
  { speaker: 'Mia 💬', text: 'wait are you even reading these??' },
  { speaker: 'Kai\'s Mom 📞', text: 'Kai? I called you three times.' },
  { speaker: 'Mia 💬', text: 'bro put the phone down for 5 mins 😅' },
];

export default class TheLoopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TheLoopScene' });
    this._msgIndex = 0;
    this._ended = false;
    this._decisionPending = false;
    this._logLines = [];
  }

  create() {
    const { width, height } = this.scale;

    // ── Background — Infinite Scroll Feed ───────────────────────────────
    this._buildScrollFeed(width, height);

    // ── Top bar ───────────────────────────────────────────────────────────
    const topBar = this.add.graphics().setDepth(3);
    topBar.fillStyle(0x0f0c29, 1);
    topBar.fillRect(0, 0, width, 52);

    this.add.text(24, 14, '🌐  EchoSphere', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffffff'
    }).setDepth(4);

    this.add.text(width / 2, 14, 'SCENARIO 2 — THE LOOP', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '14px', color: '#f59e0b', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(4);

    this.add.text(width - 24, 14, 'Digital World  ·  [N] skip  ·  [H] hunch', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '13px', color: '#818cf8'
    }).setOrigin(1, 0).setDepth(4);

    // ── Agent ─────────────────────────────────────────────────────────────
    this.agent = new Agent(this, width / 2, height / 2 + 30);
    // Force into LOOPING state immediately
    this.agent.fsm.forceState('LOOPING');
    // Enable rubber-band boundary — player can try to escape but gets snapped back
    this.agent.rubberBand = true;
    this.agent.hasPhone = true;

    // ── H key — hunch the agent forward ───────────────────────────────────
    this.input.keyboard.on('keydown-H', () => {
      if (this._ended) return;
      if (this.agent.hunchLevel < 4) {
        this.agent.hunchLevel++;
        this._showHunchFeedback(this.agent.hunchLevel);
      }
    });

    this.agent.fsm.onTransition((newState, reason) => {
      this._onStateChange(newState, reason);
    });

    // ── Timers ────────────────────────────────────────────────────────────
    this._scheduleNextMessage();
    this._scheduleDecisionNode();

    // ── Dev shortcut: press N to skip to Scene 3 ──────────────────────────
    this.input.keyboard.once('keydown-N', () => {
      if (!this._ended) {
        this._ended = true;
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          // Scene 3 will be wired here
          console.log('[Dev] Scene 3 not built yet — press N skipped to end');
        });
      }
    });

    // ── Event log ─────────────────────────────────────────────────────────
    this._logContainer = this.add.container(16, height - 16).setDepth(15);

    // ── Choice buttons ────────────────────────────────────────────────────
    this._buildChoiceButtons();

    // ── Clock ─────────────────────────────────────────────────────────────
    this._buildClock(width, height);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  update() {
    if (this._ended) return;
    if (this.agent) this.agent.update();
    this._updateFeed();
    this._updateClock();
  }

  _updateFeed() {
    if (!this._feedCards) return;
    const { height } = this.scale;
    // Gradually increase speed over time
    this._feedSpeed = Math.min(6, (this._feedSpeed || 1) + 0.0003);

    this._feedCards.forEach(card => {
      card.y -= this._feedSpeed;
      if (card.y < -80) {
        card.y = height + 80;
        card.x = this._randomFeedX();
        // Refresh card content
        this._refreshFeedCard(card);
      }
    });
  }

  // ── Clock ─────────────────────────────────────────────────────────────────
  _buildClock(width, height) {
    const cx = width - 80;
    const cy = height - 130;
    const r  = 44;

    this._clockAngle = 0;      // current hand angle (radians)
    this._clockSpeed = 0.01;   // starts slow, accelerates

    // Clock face
    const face = this.add.graphics().setDepth(12);
    face.fillStyle(0x0f0a2e, 1);
    face.fillCircle(cx, cy, r);
    face.lineStyle(3, 0x6366f1, 1);
    face.strokeCircle(cx, cy, r);

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const mx = cx + Math.cos(a) * (r - 8);
      const my = cy + Math.sin(a) * (r - 8);
      const dot = this.add.circle(mx, my, i % 3 === 0 ? 3 : 1.5, 0xa5b4fc, 1).setDepth(12);
    }

    // Clock label
    this.add.text(cx, cy + r + 14, 'TIME LOST', {
      fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6366f1'
    }).setOrigin(0.5).setDepth(12);

    // Minute hand (long)
    this._minuteHand = this.add.graphics().setDepth(13);
    // Hour hand (short)
    this._hourHand = this.add.graphics().setDepth(13);
    // Second hand (thin, red)
    this._secondHand = this.add.graphics().setDepth(13);
    // Center pin
    this.add.circle(cx, cy, 4, 0xf97316, 1).setDepth(14);

    this._clockCx = cx;
    this._clockCy = cy;
    this._clockR  = r;

    // Glow that intensifies as clock speeds up
    this._clockGlow = this.add.circle(cx, cy, r + 6, 0x6366f1, 0).setDepth(11);
  }

  _updateClock() {
    if (!this._minuteHand) return;

    // Speed increases tied to feed speed — same acceleration curve
    this._clockSpeed = 0.01 + (this._feedSpeed || 1) * 0.04;

    this._clockAngle += this._clockSpeed;

    const cx = this._clockCx;
    const cy = this._clockCy;
    const r  = this._clockR;

    // Minute hand — full rotation = clockAngle
    const mAngle = this._clockAngle - Math.PI / 2;
    this._minuteHand.clear();
    this._minuteHand.lineStyle(3, 0xe0e7ff, 1);
    this._minuteHand.lineBetween(
      cx, cy,
      cx + Math.cos(mAngle) * (r - 10),
      cy + Math.sin(mAngle) * (r - 10)
    );

    // Hour hand — 1/12 speed of minute
    const hAngle = this._clockAngle / 12 - Math.PI / 2;
    this._hourHand.clear();
    this._hourHand.lineStyle(4, 0xa5b4fc, 1);
    this._hourHand.lineBetween(
      cx, cy,
      cx + Math.cos(hAngle) * (r - 18),
      cy + Math.sin(hAngle) * (r - 18)
    );

    // Second hand — 60× speed of minute
    const sAngle = this._clockAngle * 60 - Math.PI / 2;
    this._secondHand.clear();
    this._secondHand.lineStyle(1.5, 0xf97316, 1);
    this._secondHand.lineBetween(
      cx, cy,
      cx + Math.cos(sAngle) * (r - 6),
      cy + Math.sin(sAngle) * (r - 6)
    );

    // Glow pulses stronger as clock speeds up
    const glowAlpha = Math.min(0.35, (this._feedSpeed - 1) * 0.07);
    this._clockGlow.setFillStyle(0x6366f1, glowAlpha);
  }

  // ── Infinite Scroll Feed background ───────────────────────────────────────
  _buildScrollFeed(width, height) {
    // Dark gradient background
    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x0f0a2e, 1);
    bg.fillRect(0, 0, width, height);

    // Subtle vignette
    const vignette = this.add.graphics().setDepth(0);
    vignette.fillStyle(0x000000, 0.3);
    vignette.fillCircle(width / 2, height / 2, Math.max(width, height) * 0.8);
    vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);

    // Ground platform
    const ground = this.add.graphics().setDepth(1);
    ground.fillStyle(0x1e1b4b, 1);
    ground.fillRect(0, height - 70, width, 70);
    ground.lineStyle(2, 0x4f46e5, 1);
    ground.lineBetween(0, height - 70, width, height - 70);

    // Feed cards
    this._feedCards = [];
    this._feedSpeed = 1;

    const feedContent = [
      { emoji: '❤️', text: 'Mia liked your photo', sub: '2 mins ago', color: 0xf43f5e },
      { emoji: '🔥', text: 'Trending: New Challenge', sub: '5 mins ago', color: 0xf97316 },
      { emoji: '💬', text: '847 comments on your post', sub: '12 mins ago', color: 0x6366f1 },
      { emoji: '🚀', text: 'Your post is going viral!', sub: '18 mins ago', color: 0x8b5cf6 },
      { emoji: '⭐', text: 'You earned a new badge', sub: '23 mins ago', color: 0xfbbf24 },
      { emoji: '🎯', text: 'Recommended for you', sub: '30 mins ago', color: 0x4ade80 },
      { emoji: '📣', text: 'Sponsored: Check this out', sub: '35 mins ago', color: 0x06b6d4 },
      { emoji: '🔔', text: 'Kai commented on your story', sub: '42 mins ago', color: 0xa78bfa },
      { emoji: '💖', text: '1.2k people liked this', sub: '48 mins ago', color: 0xec4899 },
      { emoji: '✨', text: 'New content just for you', sub: '1 hour ago', color: 0xfde047 },
      { emoji: '👀', text: '50 people viewed your profile', sub: '1 hour ago', color: 0x3b82f6 },
      { emoji: '🎉', text: 'Your friend posted a photo', sub: '2 hours ago', color: 0x10b981 },
    ];

    for (let i = 0; i < 18; i++) {
      const content = Phaser.Utils.Array.GetRandom(feedContent);
      const card = this._createFeedCard(content);
      card.x = this._randomFeedX();
      card.y = Phaser.Math.Between(-200, height + 200);
      card.setDepth(2);
      this._feedCards.push(card);
    }
  }

  _randomFeedX() {
    const { width } = this.scale;
    const cols = 3;
    const colWidth = width / cols;
    const col = Phaser.Math.Between(0, cols - 1);
    return col * colWidth + colWidth / 2;
  }

  _createFeedCard(content) {
    const card = this.add.container(0, 0);

    const w = 280;
    const h = 90;

    // Shadow
    const shadow = this.add.rectangle(3, 3, w, h, 0x000000, 0.3);
    // Card background
    const bg = this.add.rectangle(0, 0, w, h, 0x1e1b4b, 0.95);
    bg.setStrokeStyle(2, content.color, 0.6);

    // Accent bar on left
    const accent = this.add.rectangle(-w / 2, 0, 4, h, content.color, 1);

    // Emoji icon
    const emoji = this.add.text(-w / 2 + 28, -10, content.emoji, {
      fontSize: '24px'
    }).setOrigin(0.5);

    // Main text
    const mainText = this.add.text(-w / 2 + 60, -12, content.text, {
      fontFamily: 'Inter, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#e0e7ff',
      wordWrap: { width: w - 80 }
    }).setOrigin(0, 0.5);

    // Subtext (time)
    const subText = this.add.text(-w / 2 + 60, 12, content.sub, {
      fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#94a3b8'
    }).setOrigin(0, 0.5);

    // Interaction icons
    const likeIcon = this.add.text(w / 2 - 80, 28, '❤️ 1.2k', {
      fontSize: '10px', color: '#94a3b8'
    }).setOrigin(0.5);
    const commentIcon = this.add.text(w / 2 - 20, 28, '💬 847', {
      fontSize: '10px', color: '#94a3b8'
    }).setOrigin(0.5);

    card.add([shadow, bg, accent, emoji, mainText, subText, likeIcon, commentIcon]);

    // Store content for refresh
    card._content = content;

    return card;
  }

  _refreshFeedCard(card) {
    const feedContent = [
      { emoji: '❤️', text: 'Mia liked your photo', sub: '2 mins ago', color: 0xf43f5e },
      { emoji: '🔥', text: 'Trending: New Challenge', sub: '5 mins ago', color: 0xf97316 },
      { emoji: '💬', text: '847 comments on your post', sub: '12 mins ago', color: 0x6366f1 },
      { emoji: '🚀', text: 'Your post is going viral!', sub: '18 mins ago', color: 0x8b5cf6 },
      { emoji: '⭐', text: 'You earned a new badge', sub: '23 mins ago', color: 0xfbbf24 },
      { emoji: '🎯', text: 'Recommended for you', sub: '30 mins ago', color: 0x4ade80 },
      { emoji: '📣', text: 'Sponsored: Check this out', sub: '35 mins ago', color: 0x06b6d4 },
      { emoji: '🔔', text: 'Kai commented on your story', sub: '42 mins ago', color: 0xa78bfa },
      { emoji: '💖', text: '1.2k people liked this', sub: '48 mins ago', color: 0xec4899 },
      { emoji: '✨', text: 'New content just for you', sub: '1 hour ago', color: 0xfde047 },
    ];
    const newContent = Phaser.Utils.Array.GetRandom(feedContent);
    card._content = newContent;

    // Update visuals
    const bg = card.list[1];
    bg.setStrokeStyle(2, newContent.color, 0.6);
    const accent = card.list[2];
    accent.setFillStyle(newContent.color, 1);
    const emoji = card.list[3];
    emoji.setText(newContent.emoji);
    const mainText = card.list[4];
    mainText.setText(newContent.text);
    const subText = card.list[5];
    subText.setText(newContent.sub);
  }

  // ── Hunch feedback ────────────────────────────────────────────────────────
  _showHunchFeedback(level) {
    const { width, height } = this.scale;

    const messages = {
      1: { text: 'Kai leans in a little...', color: '#a5b4fc' },
      2: { text: 'He\'s really into this now.', color: '#f59e0b' },
      3: { text: 'Kai barely looks up anymore.', color: '#f97316' },
      4: { text: 'Fully absorbed. The world disappears.', color: '#ef4444' },
    };
    const { text, color } = messages[level];

    const msg = this.add.container(width / 2, height - 110).setDepth(30);
    const bg  = this.add.rectangle(0, 0, 400, 44, 0x000000, 0.8);
    bg.setStrokeStyle(2, parseInt(color.replace('#', '0x')), 1);
    const txt = this.add.text(0, 0, text, {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '14px', color
    }).setOrigin(0.5);
    msg.add([bg, txt]);

    gsap.fromTo(msg,
      { alpha: 0, y: height - 90 },
      { alpha: 1, y: height - 110, duration: 0.35, ease: 'back.out(1.5)',
        onComplete: () => {
          gsap.to(msg, { alpha: 0, duration: 0.4, delay: 2, onComplete: () => msg.destroy() });
        }
      }
    );

    // At max hunch, also apply FSM stress
    if (level === 4) {
      this.agent.emotions.applyEvent({ stress: 20, loneliness: 15 });
    }
  }

  // ── Rubber-band snap visual cue ───────────────────────────────────────────
  _onRubberBandSnap() {
    const { width, height } = this.scale;

    // Screen flash
    this.cameras.main.shake(200, 0.008);

    // "You can't leave" message
    const msg = this.add.container(width / 2, height / 2 - 80).setDepth(30);
    const bg  = this.add.rectangle(0, 0, 320, 48, 0x000000, 0.85);
    bg.setStrokeStyle(2, 0xf97316, 1);
    const txt = this.add.text(0, 0, '🔁  Kai can\'t put it down...', {
      fontFamily: 'Sora, Inter, sans-serif', fontSize: '15px', color: '#f97316'
    }).setOrigin(0.5);
    msg.add([bg, txt]);

    gsap.fromTo(msg, { alpha: 0, scale: 0.8 }, { alpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)',
      onComplete: () => {
        gsap.to(msg, { alpha: 0, duration: 0.4, delay: 1.2, onComplete: () => msg.destroy() });
      }
    });
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  _scheduleNextNotification() {
    // Faster than Scene 1 — habit is forming
    this.time.delayedCall(Phaser.Math.Between(1200, 3000), () => {
      if (!this._ended) { this._spawnNotification(); this._scheduleNextNotification(); }
    });
  }

  _spawnNotification() {
    const { width, height } = this.scale;
    const x    = Phaser.Math.Between(120, width - 120);
    const y    = Phaser.Math.Between(70, height - 90);
    const text = Phaser.Utils.Array.GetRandom(LOOP_NOTIFICATIONS);

    const bubble = this.add.container(x, y).setDepth(8);
    const shadow = this.add.rectangle(3, 3, 240, 46, 0x000000, 0.15);
    const bg     = this.add.rectangle(0, 0, 240, 46, 0x1e1b4b, 0.95);
    bg.setStrokeStyle(2, 0x7c3aed, 1);
    const strip  = this.add.rectangle(-109, 0, 22, 46, 0x7c3aed, 1);
    const icon   = this.add.text(-109, 0, '🔔', { fontSize: '12px' }).setOrigin(0.5);
    const label  = this.add.text(14, 0, text, {
      fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#e0e7ff',
      wordWrap: { width: 185 }
    }).setOrigin(0, 0.5);

    bubble.add([shadow, bg, strip, icon, label]);

    gsap.fromTo(bubble, { alpha: 0, scale: 0.7 }, { alpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' });

    this.time.delayedCall(Phaser.Math.Between(2500, 5000), () => {
      if (bubble.active) {
        gsap.to(bubble, { alpha: 0, scale: 0.8, duration: 0.3, onComplete: () => { if (bubble.active) bubble.destroy(); } });
      }
    });

    this._showHTMLNotification(text);
    this.agent.onNotificationIgnored(); // loop = agent always reacts
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  _scheduleNextMessage() {
    this.time.delayedCall(Phaser.Math.Between(6000, 12000), () => {
      if (!this._ended) { this._showMessage(); this._scheduleNextMessage(); }
    });
  }

  _showMessage() {
    const msg = LOOP_MESSAGES[this._msgIndex % LOOP_MESSAGES.length];
    this._msgIndex++;

    const box     = document.getElementById('dialogue-box');
    const speaker = document.getElementById('dialogue-speaker');
    const textEl  = document.getElementById('dialogue-text');
    if (!box || !speaker || !textEl) return;

    speaker.textContent = msg.speaker;
    textEl.textContent  = msg.text;
    box.classList.remove('hidden');
    gsap.fromTo(box, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });

    this._log(`📩 ${msg.speaker}`, msg.text.slice(0, 36));

    this.time.delayedCall(5000, () => {
      gsap.to(box, { y: 20, opacity: 0, duration: 0.3, onComplete: () => box.classList.add('hidden') });
    });
  }

  // ── Decision node ─────────────────────────────────────────────────────────
  _scheduleDecisionNode() {
    // Show a decision after ~15s into the scene
    this.time.delayedCall(15000, () => {
      if (!this._ended) this._showDecisionNode();
    });
  }

  _showDecisionNode() {
    if (this._decisionPending) return;
    this._decisionPending = true;

    const panel    = document.getElementById('decision-panel');
    const promptEl = document.getElementById('decision-prompt');
    const btnE     = document.getElementById('btn-engage');
    const btnR     = document.getElementById('btn-resist');
    if (!panel) return;

    if (promptEl) promptEl.textContent = 'Kai\'s mom is calling. Keep scrolling or put the phone down?';
    if (btnE) btnE.textContent = 'Keep Scrolling';
    if (btnR) btnR.textContent = 'Put It Down';

    panel.classList.remove('hidden');
    gsap.fromTo(panel, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' });

    // Auto-resolve after 8s
    this.time.delayedCall(8000, () => {
      if (this._decisionPending) {
        this._decisionPending = false;
        panel.classList.add('hidden');
        this.agent.onPlayerChoice('PLAYER_ENGAGE');
        this._log('⏱ Auto', 'Kai kept scrolling');
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
      this._log('🎮 Player', 'kept scrolling');
    });

    btnR?.addEventListener('click', () => {
      if (!this._decisionPending) return;
      this._decisionPending = false;
      panel.classList.add('hidden');
      this.agent.onPlayerChoice('PLAYER_RESIST');
      this._log('🎮 Player', 'put the phone down');
    });
  }

  // ── State change ──────────────────────────────────────────────────────────
  _onStateChange(newState, reason) {
    this._log(`→ ${newState}`, reason);
    if (['DISTORTED', 'RECOVERED', 'PARTIAL', 'LOST'].includes(newState)) {
      this._endScene(newState, reason);
    }
  }

  // ── Event log ─────────────────────────────────────────────────────────────
  _log(label, detail = '') {
    const line = `${label}${detail ? '  —  ' + detail : ''}`;
    this._logLines.push(line);
    if (this._logLines.length > 5) this._logLines.shift();
    this._logContainer.removeAll(true);
    this._logLines.forEach((l, i) => {
      const t = this.add.text(0, -(this._logLines.length - i) * 18, l, {
        fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#94a3b8',
        backgroundColor: '#0f172acc', padding: { x: 6, y: 2 }
      });
      this._logContainer.add(t);
    });
  }

  // ── HTML notification ─────────────────────────────────────────────────────
  _showHTMLNotification(text) {
    const popup  = document.getElementById('notification-popup');
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
      DISTORTED:  { title: '⚠️ Reality is Blurring',    sub: 'Kai can\'t tell what\'s real anymore.',     tc: '#f59e0b' },
      RECOVERED:  { title: '✅ Kai Broke the Loop',      sub: 'He put the phone down. It wasn\'t easy.',   tc: '#16a34a' },
      PARTIAL:    { title: '🔶 Barely Holding On',       sub: 'Kai is fighting the habit — barely.',       tc: '#ca8a04' },
      LOST:       { title: '❌ Fully Absorbed',          sub: 'The loop has him completely.',              tc: '#dc2626' },
    }[outcome] || { title: outcome, sub: reason, tc: '#ffffff' };

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a, 0).setDepth(30);
    this.tweens.add({ targets: overlay, fillAlpha: 0.92, duration: 1000 });

    this.time.delayedCall(700, () => {
      const card = this.add.container(width / 2, height / 2).setDepth(31);

      const cardBg  = this.add.rectangle(0, 0, 560, 260, 0x1e293b, 1);
      cardBg.setStrokeStyle(3, parseInt(cfg.tc.replace('#', '0x')), 1);
      const accent  = this.add.rectangle(0, -130, 560, 8, parseInt(cfg.tc.replace('#', '0x')), 1);
      const titleT  = this.add.text(0, -70, cfg.title, {
        fontFamily: 'Sora, Inter, sans-serif', fontSize: '30px', fontStyle: 'bold', color: cfg.tc
      }).setOrigin(0.5);
      const subT    = this.add.text(0, -20, cfg.sub, {
        fontFamily: 'Sora, Inter, sans-serif', fontSize: '16px', color: '#94a3b8'
      }).setOrigin(0.5);
      const statsT  = this.add.text(0, 20,
        `Engaged: ${this.agent.fsm.engageCount}   ·   Resisted: ${this.agent.fsm.resistCount}`,
        { fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#475569' }
      ).setOrigin(0.5);
      const hintT   = this.add.text(0, 90, 'Click anywhere to continue →', {
        fontFamily: 'Sora, Inter, sans-serif', fontSize: '13px', color: '#475569'
      }).setOrigin(0.5);

      this.tweens.add({ targets: hintT, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
      card.add([cardBg, accent, titleT, subT, statsT, hintT]);

      gsap.fromTo(card, { alpha: 0, scale: 0.85 }, { alpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.3)' });

      this.input.once('pointerdown', () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          // Scene 3 will be wired here when built
          console.log('[Scene] The Loop ended:', outcome, '— Scene 3 coming next');
        });
      });
    });
  }
}
