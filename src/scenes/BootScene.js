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
      fontFamily: 'Sora, Inter, sans-serif',
      fontSize: '58px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#4f46e5',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 4, color: '#4f46e5', blur: 20, fill: true }
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 + 18, 'The World You Shape', {
      fontFamily: 'Sora, Inter, sans-serif',
      fontSize: '22px',
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
      fontSize: '14px',
      color: '#6366f1',
      letterSpacing: 1
    }).setOrigin(0.5);

    // ── Click to begin ────────────────────────────────────────────────────
    const hint = this.add.text(width / 2, height / 2 + 130, '▶  Click anywhere to begin', {
      fontFamily: 'Sora, Inter, sans-serif',
      fontSize: '16px',
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

    // ── Version / credit ──────────────────────────────────────────────────
    this.add.text(width / 2, height - 24, 'EchoSphere v1.0  ·  Built with Phaser.js', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '11px',
      color: '#3730a3',
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('AttractionScene');
      });
    });
  }
}
