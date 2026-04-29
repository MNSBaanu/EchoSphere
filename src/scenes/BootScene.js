import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Assets loaded here as they are created
  }

  create() {
    const { width, height } = this.scale;

    // ── Dark gradient background ──────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0f0c29, 0x0f0c29, 0x1e1b4b, 0x302b63, 1);
    bg.fillRect(0, 0, width, height);

    // Subtle ambient glow orbs
    const orbs = [
      { x: width * 0.2,  y: height * 0.3, r: 200, c: 0x4f46e5, a: 0.08 },
      { x: width * 0.8,  y: height * 0.6, r: 250, c: 0x7c3aed, a: 0.07 },
      { x: width * 0.5,  y: height * 0.8, r: 180, c: 0x2563eb, a: 0.06 },
    ];
    orbs.forEach(o => {
      const orb = this.add.circle(o.x, o.y, o.r, o.c, o.a);
      this.tweens.add({
        targets: orb, alpha: o.a + 0.05, y: o.y - 30,
        duration: Phaser.Math.Between(4000, 7000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    });

    // ── Logo / title ──────────────────────────────────────────────────────
    // Glow behind title
    this.add.circle(width / 2, height / 2 - 40, 120, 0x4f46e5, 0.12);

    // Main title
    this.add.text(width / 2, height / 2 - 55, 'EchoSphere', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#4f46e5',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 4, color: '#4f46e5', blur: 20, fill: true }
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 + 18, 'The World You Shape', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '26px',
      fontStyle: '600',
      color: '#a5b4fc',
      letterSpacing: 3
    }).setOrigin(0.5);

    // Divider line
    const line = this.add.graphics();
    line.lineStyle(1, 0x4f46e5, 0.5);
    line.lineBetween(width / 2 - 120, height / 2 + 52, width / 2 + 120, height / 2 + 52);

    // Tagline
    this.add.text(width / 2, height / 2 + 72, 'An intelligent agent simulation', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      color: '#6366f1',
      letterSpacing: 1
    }).setOrigin(0.5);

    // ── Click to begin ────────────────────────────────────────────────────
    const hint = this.add.text(width / 2, height / 2 + 130, '▶  Click anywhere to begin', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#e0e7ff',
      backgroundColor: '#4f46e520',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: hint,
      alpha: 0.3,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ── HELP BUTTON (Top Right) ───────────────────────────────────────────
    const helpX = width - 40;
    const helpY = 40;

    // Help button background
    const helpBg = this.add.circle(helpX, helpY, 22, 0x6366f1, 1);
    helpBg.setStrokeStyle(2, 0x818cf8, 1);
    helpBg.setInteractive({ useHandCursor: true });

    // Help button text
    const helpText = this.add.text(helpX, helpY, '?', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Help button glow
    const helpGlow = this.add.circle(helpX, helpY, 22, 0x6366f1, 0.3);
    this.tweens.add({
      targets: helpGlow,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 1500,
      repeat: -1,
      ease: 'Sine.easeOut'
    });

    // Help button hover
    helpBg.on('pointerover', () => {
      helpBg.setFillStyle(0x818cf8);
      this.tweens.add({
        targets: [helpBg, helpText],
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 200,
        ease: 'Back.easeOut'
      });
    });

    helpBg.on('pointerout', () => {
      helpBg.setFillStyle(0x6366f1);
      this.tweens.add({
        targets: [helpBg, helpText],
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Back.easeIn'
      });
    });

    // Help button click - show info panel
    helpBg.on('pointerdown', () => {
      this._showInfoPanel();
    });

    // ── Credits (Bottom) ──────────────────────────────────────────────────
    this.add.text(width / 2, height - 50, 'Implemented by Baanu & Irfa', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // ── Version / credit ──────────────────────────────────────────────────
    this.add.text(width / 2, height - 24, 'EchoSphere v1.0  ·  Built with Phaser.js', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#3730a3',
    }).setOrigin(0.5);

    this.input.once('pointerdown', (pointer) => {
      // Don't start if clicking help button
      if (!helpBg.getBounds().contains(pointer.x, pointer.y)) {
        this.scene.start('AttractionScene');
      }
    });
  }

  _showInfoPanel() {
    if (this._infoPanelOpen) return;
    this._infoPanelOpen = true;

    const { width, height } = this.scale;
    const panelItems = []; // track ALL objects for clean destroy

    // Dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    overlay.setInteractive();
    overlay.setDepth(1000);
    panelItems.push(overlay);

    // Info panel background
    const panelW = Math.min(600, width - 80);
    const panelH = Math.min(500, height - 100);
    const panel = this.add.rectangle(width / 2, height / 2, panelW, panelH, 0x1e1b4b, 1);
    panel.setStrokeStyle(3, 0x6366f1, 1);
    panel.setDepth(1001);
    panelItems.push(panel);

    // Close button
    const closeBtn = this.add.circle(width / 2 + panelW / 2 - 30, height / 2 - panelH / 2 + 30, 20, 0xef4444, 1);
    closeBtn.setStrokeStyle(2, 0xdc2626, 1);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.setDepth(1002);
    panelItems.push(closeBtn);

    const closeTxt = this.add.text(width / 2 + panelW / 2 - 30, height / 2 - panelH / 2 + 30, '✕', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(1002);
    panelItems.push(closeTxt);

    // Title
    panelItems.push(
      this.add.text(width / 2, height / 2 - panelH / 2 + 40, 'About EchoSphere', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5).setDepth(1002)
    );

    const contentY = height / 2 - panelH / 2 + 90;
    const contentX = width / 2 - panelW / 2 + 40;

    // Technologies Used
    panelItems.push(
      this.add.text(contentX, contentY, '🛠️ Technologies Used:', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#6366f1'
      }).setDepth(1002)
    );

    const techList = [
      '• Phaser.js 3 - Game engine for 2D rendering',
      '• JavaScript ES6+ - Core programming language',
      '• GSAP - Advanced animation library',
      '• Tailwind CSS - UI styling framework',
      '• Vite - Fast build tool and dev server'
    ];

    techList.forEach((tech, i) => {
      panelItems.push(
        this.add.text(contentX + 20, contentY + 30 + i * 25, tech, {
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: '#e2e8f0',
          wordWrap: { width: panelW - 80 }
        }).setDepth(1002)
      );
    });

    // How It Works
    panelItems.push(
      this.add.text(contentX, contentY + 180, '🧠 How It Works:', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#6366f1'
      }).setDepth(1002)
    );

    const howItWorks = [
      'This simulation demonstrates an AI-driven agent caught',
      'between digital addiction and real-world connections.',
      '',
      '• Agent has addiction, awareness & emotion variables',
      '• Behavior changes based on choices (phone vs door)',
      '• Auto-scroll activates when addiction > 50%',
      '• Learning system stores behavioral patterns',
      '• Transitions are behavior-based, not time-based'
    ];

    howItWorks.forEach((line, i) => {
      panelItems.push(
        this.add.text(contentX + 20, contentY + 210 + i * 22, line, {
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: '#e2e8f0',
          wordWrap: { width: panelW - 80 }
        }).setDepth(1002)
      );
    });

    // Close — destroy ALL tracked items
    const closePanel = () => {
      panelItems.forEach(item => { if (item && item.active) item.destroy(); });
      this._infoPanelOpen = false;
    };

    closeBtn.on('pointerdown', closePanel);
    overlay.on('pointerdown', closePanel);

    // Animate in
    panelItems.forEach(item => item.setAlpha(0));
    this.tweens.add({
      targets: panelItems,
      alpha: 1,
      duration: 300,
      ease: 'Power2.easeOut'
    });
  }
}
