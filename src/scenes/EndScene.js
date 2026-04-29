import Phaser from 'phaser';

const FONT = 'Inter, sans-serif';

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  create() {
    const { width: W, height: H } = this.scale;

    // ── Dark background ───────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0c29, 1);
    bg.fillRect(0, 0, W, H);

    // ── Ambient glow orbs ─────────────────────────────────────────────────
    const orbs = [
      { x: W * 0.15, y: H * 0.25, r: 220, c: 0x4ade80, a: 0.07 },
      { x: W * 0.85, y: H * 0.55, r: 260, c: 0x4f46e5, a: 0.07 },
      { x: W * 0.5,  y: H * 0.85, r: 190, c: 0x7c3aed, a: 0.06 },
    ];
    orbs.forEach(o => {
      const orb = this.add.circle(o.x, o.y, o.r, o.c, o.a);
      this.tweens.add({
        targets: orb, alpha: o.a + 0.05, y: o.y - 25,
        duration: Phaser.Math.Between(4000, 7000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    });

    // ── Leaf particles (decorative) ───────────────────────────────────────
    const leaves = ['🌿', '🍃', '✨', '💚', '🌱'];
    for (let i = 0; i < 12; i++) {
      const lx = Phaser.Math.Between(40, W - 40);
      const ly = Phaser.Math.Between(40, H - 40);
      const leaf = this.add.text(lx, ly, Phaser.Utils.Array.GetRandom(leaves), {
        fontSize: `${Phaser.Math.Between(14, 26)}px`
      }).setAlpha(0.18).setOrigin(0.5);
      this.tweens.add({
        targets: leaf,
        y: ly - Phaser.Math.Between(20, 50),
        alpha: 0.08,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    // ── Glow behind title ─────────────────────────────────────────────────
    this.add.circle(W / 2, H * 0.28, 130, 0x4ade80, 0.10);

    // ── EchoSphere logo ───────────────────────────────────────────────────
    this.add.text(W / 2, H * 0.18, 'EchoSphere', {
      fontFamily: FONT, fontSize: '52px', fontStyle: 'bold',
      color: '#ffffff', stroke: '#4ade80', strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 4, color: '#4ade80', blur: 18, fill: true }
    }).setOrigin(0.5);

    // ── Big end title ─────────────────────────────────────────────────────
    this.add.text(W / 2, H * 0.30, '🌿  Journey Complete', {
      fontFamily: FONT, fontSize: '38px', fontStyle: 'bold', color: '#4ade80'
    }).setOrigin(0.5);

    // ── Divider ───────────────────────────────────────────────────────────
    const div = this.add.graphics();
    div.lineStyle(1, 0x4ade80, 0.4);
    div.lineBetween(W / 2 - 160, H * 0.38, W / 2 + 160, H * 0.38);

    // ── Story summary ─────────────────────────────────────────────────────
    const lines = [
      'Steve faced the pull of the digital world,',
      'but chose to reconnect with what truly matters.',
      '',
      'Real moments. Real people. Real life.',
    ];
    lines.forEach((line, i) => {
      this.add.text(W / 2, H * 0.43 + i * 30, line, {
        fontFamily: FONT,
        fontSize: line === '' ? '0px' : '16px',
        color: i === 3 ? '#86efac' : '#cbd5e1',
        fontStyle: i === 3 ? 'bold' : 'normal',
        letterSpacing: i === 3 ? 1 : 0
      }).setOrigin(0.5);
    });

    // ── Stats card ────────────────────────────────────────────────────────
    const cardY = H * 0.63;
    const cardBg = this.add.rectangle(W / 2, cardY, 420, 90, 0x1e1b4b, 0.85);
    cardBg.setStrokeStyle(1.5, 0x4f46e5, 0.6);

    const stats = [
      { label: '🌿 Real World', value: 'Reached' },
      { label: '📚 Learning',   value: 'Completed' },
      { label: '💚 Connection', value: 'Restored' },
    ];
    stats.forEach((s, i) => {
      const sx = W / 2 - 130 + i * 130;
      this.add.text(sx, cardY - 18, s.label, {
        fontFamily: FONT, fontSize: '12px', color: '#94a3b8'
      }).setOrigin(0.5);
      this.add.text(sx, cardY + 8, s.value, {
        fontFamily: FONT, fontSize: '15px', color: '#4ade80', fontStyle: 'bold'
      }).setOrigin(0.5);
    });

    // ── Credits ───────────────────────────────────────────────────────────
    this.add.text(W / 2, H - 52, 'Implemented by Baanu & Irfa', {
      fontFamily: FONT, fontSize: '17px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, H - 26, 'EchoSphere v1.0  ·  Built with Phaser.js', {
      fontFamily: FONT, fontSize: '13px', color: '#3730a3'
    }).setOrigin(0.5);

    // ── "The End" badge ───────────────────────────────────────────────────
    const endBadge = this.add.text(W / 2, H * 0.77, '— The End —', {
      fontFamily: FONT, fontSize: '20px', color: '#6366f1', letterSpacing: 4
    }).setOrigin(0.5);
    this.tweens.add({
      targets: endBadge, alpha: 0.4, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  }
}
