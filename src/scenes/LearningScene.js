import Phaser from 'phaser';
import Agent from '../agent/Agent.js';
import { gsap } from 'gsap';

const FONT      = 'Sora, Inter, sans-serif';
const FONT_BODY = 'Inter, sans-serif';

// Study tasks the agent works through
const STUDY_TASKS = [
  { subject: '📐 Mathematics',  task: 'Solving quadratic equations',   xp: 30 },
  { subject: '🔬 Science',      task: 'Reading about photosynthesis',  xp: 25 },
];

export default class LearningScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LearningScene' });
    this._ended   = false;
    this._taskIdx = 0;
    this._xp      = 0;
    this._isSitting = false;
    this._chair = null;
  }

  create(data = {}) {
    const { width, height } = this.scale;
    this._width   = width;
    this._height  = height;
    this._groundY = height - 70;
    
    // Check if agent came from key redemption
    this._fromKeyRedemption = data.fromKeyRedemption || false;

    // ── Background — warm study room ─────────────────────────────────────
    this._drawStudyRoom(width, height);

    // ── Top bar ───────────────────────────────────────────────────────────
    const topBar = this.add.graphics().setDepth(10);
    topBar.fillStyle(0x1e3a5f, 1);
    topBar.fillRect(0, 0, width, 52);

    this.add.text(24, 14, '🌐  EchoSphere', {
      fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: '#ffffff'
    }).setDepth(11);

    this.add.text(width / 2, 14, 'LEARNING PATH — THE PRODUCTIVE CHOICE', {
      fontFamily: FONT, fontSize: '14px', color: '#4ade80', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(11);

    this.add.text(width - 24, 14, '[N] skip', {
      fontFamily: FONT, fontSize: '13px', color: '#818cf8'
    }).setOrigin(1, 0).setDepth(11);

    // ── XP bar ────────────────────────────────────────────────────────────
    this._buildXPBar(width);

    // ── Agent ─────────────────────────────────────────────────────────────
    this.agent = new Agent(this, width * 0.38, this._groundY - 60);
    this.agent.fsm.forceState('IDLE');
    this.agent.hasPhone = false;

    // ── Desk + study UI ───────────────────────────────────────────────────
    this._buildStudyDesk(width, height);

    // ── Start first task after a moment ──────────────────────────────────
    this.time.delayedCall(1500, () => this._startNextTask());

    // ── Dev skip ──────────────────────────────────────────────────────────
    this.input.keyboard.once('keydown-N', () => {
      if (!this._ended) this._endScene('good');
    });

    // ── Sit/Stand functionality ─────────────────────────────────────────────
    this.input.keyboard.on('keydown-C', () => {
      if (!this._ended) this._toggleSitting();
    });
  }

  update() {
    if (this._ended) return;
    if (this.agent) this.agent.update();
  }

  // ── Study room background ─────────────────────────────────────────────────
  _drawStudyRoom(width, height) {
    const g = this.add.graphics().setDepth(0);
    const groundY = height - 70;

    // Warm cream walls
    g.fillStyle(0xfff8f0, 1);
    g.fillRect(0, 0, width, height);

    // Back wall
    g.fillStyle(0xfef3e2, 1);
    g.fillRect(0, 52, width, groundY - 52);

    // Floor — warm wood
    g.fillStyle(0xd4a96a, 1);
    g.fillRect(0, groundY, width, height - groundY);
    g.fillStyle(0xe8c08a, 1);
    g.fillRect(0, groundY, width, 8);
    g.lineStyle(1, 0xc49050, 0.3);
    for (let x = 0; x < width; x += 80) {
      g.lineBetween(x, groundY, x, height);
    }

    // Baseboard
    g.fillStyle(0xf0e0c8, 1);
    g.fillRect(0, groundY - 12, width, 12);

    // Wallpaper dots
    g.fillStyle(0xf0e8e0, 0.4);
    for (let wx = 40; wx < width; wx += 60) {
      for (let wy = 80; wy < groundY; wy += 50) {
        g.fillCircle(wx, wy, 2);
      }
    }

    // Window — bright daylight
    const winX = width * 0.62, winY = 90, winW = 160, winH = 140;
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(winX, winY, winW, winH);
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(winX + 30, winY + 25, 40, 18);
    g.fillEllipse(winX + 60, winY + 18, 30, 14);
    g.lineStyle(4, 0xcccccc, 1);
    g.strokeRect(winX, winY, winW, winH);
    g.lineStyle(3, 0xcccccc, 1);
    g.lineBetween(winX + winW / 2, winY, winX + winW / 2, winY + winH);
    g.lineBetween(winX, winY + winH / 2, winX + winW, winY + winH / 2);
    // Sunlight rays
    g.fillStyle(0xfffde7, 0.15);
    g.fillRect(winX, winY + winH, winW, groundY - winY - winH);

    // Bookshelf — ground level
    const sx = width * 0.78, sy = groundY - 160;
    g.fillStyle(0x8b6914, 1);
    g.fillRect(sx, sy, 160, 12);
    g.fillRect(sx, sy + 70, 160, 12);
    g.fillRect(sx, sy + 140, 160, 12);
    g.fillRect(sx, sy, 12, 155);
    g.fillRect(sx + 148, sy, 12, 155);
    const bc = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22, 0x2980b9];
    bc.forEach((c, i) => {
      g.fillStyle(c, 1);
      g.fillRect(sx + 14 + i * 17, sy - 56, 14, 56);
    });
    bc.forEach((c, i) => {
      g.fillStyle(c, 0.8);
      g.fillRect(sx + 14 + i * 17, sy + 14, 14, 54);
    });

    // Motivational poster
    g.fillStyle(0xffffff, 1);
    g.fillRect(width * 0.08, 100, 100, 130);
    g.fillStyle(0x16a34a, 1);
    g.fillRect(width * 0.08 + 4, 104, 92, 122);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(width * 0.08 + 14, 120, 72, 8);
    g.fillRect(width * 0.08 + 20, 134, 60, 6);
    g.fillRect(width * 0.08 + 14, 148, 72, 6);
    g.fillStyle(0x4ade80, 1);
    g.fillCircle(width * 0.08 + 50, 180, 22);
    g.fillStyle(0xffffff, 1);
    g.fillRect(width * 0.08 + 44, 170, 12, 20);
    g.fillRect(width * 0.08 + 38, 176, 24, 8);

    // Clock on wall
    const clockX = width * 0.35, clockY = 80, clockR = 25;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(clockX, clockY, clockR);
    g.fillStyle(0x1e3a5f, 1);
    g.fillCircle(clockX, clockY, 3);
    g.lineStyle(2, 0x1e3a5f, 1);
    g.lineBetween(clockX, clockY, clockX + 12, clockY - 8);
    g.lineBetween(clockX, clockY, clockX - 6, clockY + 10);
    g.lineStyle(1, 0x6b7280, 0.5);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x1 = clockX + Math.cos(angle) * (clockR - 3);
      const y1 = clockY + Math.sin(angle) * (clockR - 3);
      const x2 = clockX + Math.cos(angle) * clockR;
      const y2 = clockY + Math.sin(angle) * clockR;
      g.lineBetween(x1, y1, x2, y2);
    }

    // Potted plant
    const plantX = width * 0.85, plantY = groundY - 40;
    g.fillStyle(0x8b4513, 1);
    g.fillRect(plantX - 15, plantY, 30, 40);
    g.fillStyle(0x654321, 1);
    g.fillRect(plantX - 12, plantY + 5, 24, 30);
    // Plant leaves
    g.fillStyle(0x16a34a, 1);
    g.fillEllipse(plantX, plantY - 10, 25, 35);
    g.fillEllipse(plantX - 8, plantY - 5, 15, 20);
    g.fillEllipse(plantX + 8, plantY - 8, 18, 25);
    g.fillStyle(0x22c55e, 1);
    g.fillCircle(plantX, plantY - 15, 8);

    // Wall calendar
    const calX = width * 0.52, calY = 110;
    g.fillStyle(0xffffff, 1);
    g.fillRect(calX, calY, 60, 80);
    g.fillStyle(0x1e3a5f, 1);
    g.fillRect(calX + 4, calY + 4, 52, 12);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(calX + 8, calY + 6, 44, 8);
    // Calendar grid
    g.lineStyle(1, 0xd1d5db, 0.5);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) {
        const x = calX + 8 + col * 7;
        const y = calY + 22 + row * 10;
        g.strokeRect(x, y, 6, 8);
      }
    }

    // Certificates/Awards on wall
    const cert1X = width * 0.25, cert1Y = 90;
    g.fillStyle(0xffffff, 1);
    g.fillRect(cert1X, cert1Y, 80, 60);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(cert1X + 4, cert1Y + 4, 72, 52);
    g.fillStyle(0xffffff, 1);
    g.fillRect(cert1X + 8, cert1Y + 8, 64, 44);
    // Certificate text lines
    g.fillStyle(0x1e3a5f, 1);
    g.fillRect(cert1X + 12, cert1Y + 12, 40, 3);
    g.fillRect(cert1X + 12, cert1Y + 18, 56, 2);
    g.fillRect(cert1X + 12, cert1Y + 24, 48, 2);
    // Gold star
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(cert1X + 60, cert1Y + 30, 8);

    const cert2X = width * 0.25, cert2Y = 160;
    g.fillStyle(0xffffff, 1);
    g.fillRect(cert2X, cert2Y, 80, 60);
    g.fillStyle(0x3b82f6, 1);
    g.fillRect(cert2X + 4, cert2Y + 4, 72, 52);
    g.fillStyle(0xffffff, 1);
    g.fillRect(cert2X + 8, cert2Y + 8, 64, 44);
    // Certificate ribbon
    g.fillStyle(0x3b82f6, 1);
    g.fillRect(cert2X + 30, cert2Y + 35, 20, 15);
    g.fillStyle(0xffffff, 1);
    g.fillRect(cert2X + 35, cert2Y + 40, 10, 5);

      }

  // ── XP bar ────────────────────────────────────────────────────────────────
  _buildXPBar(width) {
    const barY = 62;
    this.add.text(width / 2 - 160, barY, '⭐ XP:', {
      fontFamily: FONT_BODY, fontSize: '12px', color: '#4ade80'
    }).setOrigin(0, 0.5).setDepth(12);

    const barBg = this.add.rectangle(width / 2, barY, 260, 12, 0x1e3a5f, 1).setDepth(12);
    barBg.setStrokeStyle(1, 0x4ade80, 0.5);

    this._xpBar = this.add.rectangle(width / 2 - 130, barY, 0, 10, 0x4ade80, 1)
      .setOrigin(0, 0.5).setDepth(12);
    this._xpBarMax = 260;

    this._xpLabel = this.add.text(width / 2 + 140, barY, '0 / 130 XP', {
      fontFamily: FONT_BODY, fontSize: '11px', color: '#4ade80'
    }).setOrigin(0, 0.5).setDepth(12);
  }

  // ── Study desk ────────────────────────────────────────────────────────────
  _buildStudyDesk(width, height) {
    const groundY = height - 70;
    const deskX = width * 0.42;
    const deskY = groundY - 90;
    const deskW = width * 0.28;

    const g = this.add.graphics().setDepth(3);
    // Desk surface
    g.fillStyle(0xa0522d, 1);
    g.fillRoundedRect(deskX, deskY, deskW, 14, 3);
    g.fillStyle(0xc8783c, 1);
    g.fillRoundedRect(deskX + 2, deskY + 2, deskW - 4, 5, 2);
    // Legs
    g.fillStyle(0x8b4513, 1);
    g.fillRect(deskX + 10, deskY + 14, 12, groundY - deskY - 14);
    g.fillRect(deskX + deskW - 22, deskY + 14, 12, groundY - deskY - 14);

    // Laptop on desk
    const lapX = deskX + deskW * 0.3;
    const lapY = deskY - 50;
    g.fillStyle(0x374151, 1);
    g.fillRoundedRect(lapX, lapY, 100, 60, 4);
    g.fillStyle(0x1e40af, 1);
    g.fillRoundedRect(lapX + 4, lapY + 4, 92, 52, 3);
    // Screen content lines
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(lapX + 10, lapY + 12, 60, 4);
    g.fillRect(lapX + 10, lapY + 20, 45, 3);
    g.fillRect(lapX + 10, lapY + 28, 55, 3);
    g.fillRect(lapX + 10, lapY + 36, 40, 3);
    // Keyboard base
    g.fillStyle(0x4b5563, 1);
    g.fillRoundedRect(lapX - 5, deskY, 110, 10, 2);

    // Notebook + pencil
    g.fillStyle(0xfef9c3, 1);
    g.fillRoundedRect(deskX + 10, deskY - 30, 70, 28, 2);
    g.lineStyle(1, 0xfde047, 0.5);
    for (let l = 0; l < 4; l++) {
      g.lineBetween(deskX + 14, deskY - 24 + l * 6, deskX + 76, deskY - 24 + l * 6);
    }
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(deskX + 82, deskY - 32, 5, 30);
    g.fillStyle(0xf97316, 1);
    g.fillRect(deskX + 82, deskY - 2, 5, 6);

    // Chair
    this._buildChair(width, height, deskX, deskY, deskW);

    // Additional plants
    const plantG = this.add.graphics().setDepth(2);
    
    // Hanging plant near window
    const hangX = width * 0.75, hangY = 60;
    plantG.fillStyle(0x6b7280, 1);
    plantG.fillRect(hangX, hangY, 4, 20);
    plantG.fillStyle(0x16a34a, 1);
    // Hanging leaves
    for (let i = 0; i < 6; i++) {
      const leafX = hangX + (i % 2 === 0 ? -8 : 8);
      const leafY = hangY + 25 + i * 8;
      plantG.fillEllipse(leafX, leafY, 6, 12);
    }
    plantG.fillStyle(0x22c55e, 1);
    plantG.fillCircle(hangX, hangY + 70, 5);

    // Tall floor plant near bookshelf
    const tallX = width * 0.70, tallY = height - 70 - 60;
    plantG.fillStyle(0x8b4513, 1);
    plantG.fillRect(tallX - 10, tallY, 20, 60);
    plantG.fillStyle(0x654321, 1);
    plantG.fillRect(tallX - 8, tallY + 10, 16, 40);
    // Large leaves
    plantG.fillStyle(0x16a34a, 1);
    plantG.fillEllipse(tallX - 15, tallY - 20, 12, 25);
    plantG.fillEllipse(tallX + 15, tallY - 25, 10, 20);
    plantG.fillEllipse(tallX, tallY - 35, 8, 30);
    plantG.fillEllipse(tallX - 10, tallY - 15, 8, 18);
    plantG.fillEllipse(tallX + 8, tallY - 18, 7, 15);
    plantG.fillStyle(0x22c55e, 1);
    plantG.fillCircle(tallX, tallY - 40, 6);

    // Task card area (shown dynamically)
    this._taskCardX = width / 2;
    this._taskCardY = height * 0.3;
  }

  // ── Start next study task ─────────────────────────────────────────────────
  _startNextTask() {
    if (this._taskIdx >= STUDY_TASKS.length) {
      // All tasks completed - go to normal ending
      this._endScene('good');
      return;
    }

    const task = STUDY_TASKS[this._taskIdx];
    this._showTaskCard(task);
  }

  // ── Task card ─────────────────────────────────────────────────────────────
  _showTaskCard(task) {
    const { width, height } = this.scale;

    // Remove previous card if exists
    if (this._taskCard) {
      gsap.to(this._taskCard, { alpha: 0, duration: 0.3, onComplete: () => this._taskCard?.destroy() });
    }

    this._taskCard = this.add.container(this._taskCardX, this._taskCardY).setDepth(20).setAlpha(0);

    const cardW = 320, cardH = 120;
    const bg = this.add.rectangle(0, 0, cardW, cardH, 0xffffff, 0.97);
    bg.setStrokeStyle(3, 0x16a34a, 1);

    const accent = this.add.rectangle(-cardW / 2, 0, 5, cardH, 0x16a34a, 1);

    const subjectT = this.add.text(-cardW / 2 + 16, -30, task.subject, {
      fontFamily: FONT, fontSize: '16px', fontStyle: 'bold', color: '#16a34a'
    }).setOrigin(0, 0.5);

    const taskT = this.add.text(-cardW / 2 + 16, -5, task.task, {
      fontFamily: FONT_BODY, fontSize: '12px', color: '#374151',
      wordWrap: { width: cardW - 40 }
    }).setOrigin(0, 0.5);

    // Progress bar for this task
    const pbBg = this.add.rectangle(0, 28, cardW - 32, 10, 0xe5e7eb, 1);
    this._taskProgress = this.add.rectangle(-cardW / 2 + 16, 28, 0, 8, 0x16a34a, 1).setOrigin(0, 0.5);
    this._taskProgressMax = cardW - 32;

    const xpT = this.add.text(cardW / 2 - 12, -30, `+${task.xp} XP`, {
      fontFamily: FONT, fontSize: '12px', fontStyle: 'bold', color: '#16a34a'
    }).setOrigin(1, 0.5);

    const hintT = this.add.text(0, 45, 'Click [SPACE] to finish task', {
      fontFamily: FONT_BODY, fontSize: '10px', color: '#9ca3af'
    }).setOrigin(0.5);

    this._taskCard.add([bg, accent, subjectT, taskT, pbBg, this._taskProgress, xpT, hintT]);

    gsap.fromTo(this._taskCard,
      { alpha: 0, y: this._taskCardY - 20 },
      { alpha: 1, y: this._taskCardY, duration: 0.5, ease: 'back.out(1.5)' }
    );

    
    // Agent shows excitement (no jumping)
    this.time.delayedCall(400, () => {
      // Agent remains calm and focused
    });

    // SPACE key fills the progress bar and completes the task
    this._studyKey = this.input.keyboard.on('keydown-SPACE', () => {
      if (this._ended || this._taskCompleting) return;
      this._fillTaskProgress(task);
    });
  }

  // ── Fill progress bar on SPACE hold ──────────────────────────────────────
  _fillTaskProgress(task) {
    if (!this._taskProgress || this._taskCompleting) return;

    const currentW = this._taskProgress.width;
    const newW = Math.min(this._taskProgressMax, currentW + this._taskProgressMax * 0.5);
    this._taskProgress.width = newW;

    // Agent shows focus while studying (no jumping)
    if (Math.random() < 0.15) {
      // Agent remains focused without jumping
    }

    if (newW >= this._taskProgressMax) {
      this._taskCompleting = true;
      this._completeTask(task);
    }
  }

  // ── Complete task ─────────────────────────────────────────────────────────
  _completeTask(task) {
    // Remove the completed card
    const cardToDestroy = this._taskCard;
    this._taskCard = null;
    if (cardToDestroy) {
      gsap.to(cardToDestroy, { alpha: 0, duration: 0.3, onComplete: () => {
        if (cardToDestroy.active) cardToDestroy.destroy();
      }});
    }

    this._xp += task.xp;
    this._taskIdx++;

    // Update XP bar
    const totalXP = STUDY_TASKS.reduce((s, t) => s + t.xp, 0);
    const xpPct = this._xp / totalXP;
    this._xpBar.width = xpPct * this._xpBarMax;
    this._xpLabel.setText(`${this._xp} / ${totalXP} XP`);

    // Completion burst
    this._burstParticles(this.agent.x, this.agent.y);

    this.time.delayedCall(1000, () => {
      this._taskCompleting = false;
      // Remove old SPACE listener before starting next task
      if (this._studyKey) {
        this.input.keyboard.off('keydown-SPACE', this._studyKey);
        this._studyKey = null;
      }
      this._startNextTask();
    });
  }

  // ── Particle burst ────────────────────────────────────────────────────────
  _burstParticles(x, y) {
    const emojis = ['⭐', '✨', '📚', '💡', '🎉', '💚'];
    for (let i = 0; i < 8; i++) {
      const emoji = emojis[i % emojis.length];
      const angle = (i / 8) * Math.PI * 2;
      const dist  = Phaser.Math.Between(40, 80);
      const p = this.add.text(x, y, emoji, { fontSize: '16px' })
        .setOrigin(0.5).setDepth(20);
      gsap.to(p, {
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 20,
        alpha: 0, scale: 1.3,
        duration: 0.8, ease: 'power2.out',
        onComplete: () => { if (p.active) p.destroy(); }
      });
    }
  }

  
  
  // ── End scene ─────────────────────────────────────────────────────────────
  _endScene(outcome) {
    if (this._ended) return;
    this._ended = true;

    // Remove any active study key listener
    if (this._studyKey) {
      this.input.keyboard.off('keydown-SPACE', this._studyKey);
      this._studyKey = null;
    }

    // Remove any lingering task card
    if (this._taskCard) {
      this._taskCard.destroy();
      this._taskCard = null;
    }

    const { _width: W, _height: H } = this;

    const card = this.add.container(W / 2, H / 2).setDepth(40);
    const bg   = this.add.rectangle(0, 0, 540, 160, 0xffffff, 0.97);
    bg.setStrokeStyle(3, 0x16a34a, 1);
    const title = this.add.text(0, -35, '✅ Steve chose to learn!', {
      fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: '#16a34a'
    }).setOrigin(0.5);
    const sub = this.add.text(0, 10, `He earned ${this._xp} XP and grew as a person.`, {
      fontFamily: FONT_BODY, fontSize: '15px', color: '#374151'
    }).setOrigin(0.5);
    const hint = this.add.text(0, 55, 'Click anywhere to return →', {
      fontFamily: FONT_BODY, fontSize: '12px', color: '#9ca3af'
    }).setOrigin(0.5);
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });
    card.add([bg, title, sub, hint]);

    gsap.fromTo(card, { alpha: 0, scale: 0.85 }, { alpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' });

    this.input.once('pointerdown', () => {
      // Pass reduced addiction level back to AttractionScene
      const reducedAddiction = this.agent ? Math.max(0, this.agent.addictionLevel - 30) : 0;
      const improvedAwareness = this.agent ? Math.min(100, this.agent.awareness + 20) : 70;
      const memory = this.agent ? [...this.agent.memory] : [];

      // Push learning memory if not already there
      if (!memory.includes('completed_learning')) {
        memory.push('completed_learning');
      }

      this.scene.start('AttractionScene', {
        addictionLevel: reducedAddiction,
        awareness: improvedAwareness,
        memory: memory,
      });
    });
  }

  // ── Build chair ─────────────────────────────────────────────────────────────
  _buildChair(width, height, deskX, deskY, deskW) {
    const chairX = deskX + deskW * 0.5;
    const chairY = height - 70;
    
    const g = this.add.graphics().setDepth(2);
    
    // Chair seat
    g.fillStyle(0x654321, 1);
    g.fillRoundedRect(chairX - 25, chairY - 45, 50, 8, 2);
    g.fillStyle(0x8b6914, 1);
    g.fillRoundedRect(chairX - 23, chairY - 43, 46, 4, 1);
    
    // Chair back
    g.fillStyle(0x654321, 1);
    g.fillRoundedRect(chairX - 25, chairY - 85, 50, 45, 3);
    g.fillStyle(0x8b6914, 1);
    g.fillRoundedRect(chairX - 23, chairY - 83, 46, 40, 2);
    
    // Chair legs
    g.fillStyle(0x4a3426, 1);
    g.fillRect(chairX - 20, chairY - 37, 4, 37);
    g.fillRect(chairX + 16, chairY - 37, 4, 37);
    g.fillRect(chairX - 20, chairY - 85, 4, 45);
    g.fillRect(chairX + 16, chairY - 85, 4, 45);
    
    // Store chair position for sitting logic
    this._chair = {
      x: chairX,
      y: chairY - 45,
      width: 50,
      height: 85
    };
  }

  // ── Toggle sitting/standing ─────────────────────────────────────────────────
  _toggleSitting() {
    if (this._isSitting) {
      // Stand up
      this._isSitting = false;
      this.agent.y = this._groundY - 60;
      this.agent.fsm.forceState('IDLE');
          } else {
      // Sit down
      this._isSitting = true;
      this.agent.x = this._chair.x - 20;
      this.agent.y = this._groundY - 60;
      this.agent.fsm.forceState('IDLE');
            
      // Add sitting animation
      this.tweens.add({
        targets: this.agent,
        x: this._chair.x - 20,
        duration: 300,
        ease: 'power2.out'
      });
    }
    
  }
}
