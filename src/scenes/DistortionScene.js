import Phaser from 'phaser';
import Agent from '../agent/Agent.js';
import { gsap } from 'gsap';

export default class DistortionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DistortionScene' });
    this._ended = false;
    this._splitX = 0;
    this._splitVelocity = 0;
    this._glitchTimer = 0;
    this._logLines = [];
  }

  create() {
    const { width, height } = this.scale;
    this._width  = width;
    this._height = height;
    this._groundY = height - 70;
    this._splitX  = width / 2;

    // Layer order:
    // 0 — real world bg (redrawn each frame)
    // 1 — real world furniture (static, drawn once)
    // 2 — digital world bg (redrawn each frame)
    // 3 — digital grid (redrawn each frame)
    // 4 — split line (redrawn each frame)
    // 5 — top bar + UI

    this._realBg   = this.add.graphics().setDepth(0);
    this._furniture = this.add.graphics().setDepth(1);
    this._digiBg   = this.add.graphics().setDepth(2);
    this._digiGrid = this.add.graphics().setDepth(3);
    this._splitGfx = this.add.graphics().setDepth(4);

    // Draw furniture once
    this._drawFurniture();

    // ── Top bar ───────────────────────────────────────────────────────────
    const topBar = this.add.graphics().setDepth(10);
    topBar.fillStyle(0x1a0a2e, 1);
    topBar.fillRect(0, 0, width, 52);

    this.add.text(24, 14, '🌐  EchoSphere', {
      fontFamily: 'Sora, Inter, sans-serif',
      fontSize: '20px', fontStyle: 'bold', color: '#ffffff'
    }).setDepth(11);

    this.add.text(width / 2, 14, 'SCENARIO 3 — THE DISTORTION', {
      fontFamily: 'Sora, Inter, sans-serif',
      fontSize: '14px', color: '#f97316', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(11);

    this.add.text(width - 24, 14, '[N] skip', {
      fontFamily: 'Sora, Inter, sans-serif',
      fontSize: '13px', color: '#818cf8'
    }).setOrigin(1, 0).setDepth(11);

    // ── Agent ─────────────────────────────────────────────────────────────
    this.agent = new Agent(this, width / 2, this._groundY - 60);
    this.agent.fsm.forceState('DISTORTED');
    this.agent.hasPhone = true;

    // ── Dev skip ──────────────────────────────────────────────────────────
    this.input.keyboard.once('keydown-N', () => {
      if (!this._ended) this._endScene();
    });

    // ── Event log ─────────────────────────────────────────────────────────
    this._logContainer = this.add.container(16, height - 16).setDepth(15);

    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  update() {
    if (this._ended) return;
    if (this.agent) this.agent.update();
    this._updateSplit();
  }

  // ── Split world — redrawn every frame ────────────────────────────────────
  _updateSplit() {
    const { _width: W, _height: H, _groundY: GY } = this;

    // Animate split position
    this._glitchTimer++;
    if (this._glitchTimer > Phaser.Math.Between(60, 180)) {
      this._glitchTimer = 0;
      this._splitVelocity += Phaser.Math.Between(-200, 200);
    }
    this._splitVelocity += (W / 2 - this._splitX) * 0.04; // spring to center
    this._splitVelocity *= 0.88;
    this._splitX += this._splitVelocity;
    this._splitX = Phaser.Math.Clamp(this._splitX, 80, W - 80);

    const sx = Math.round(this._splitX);

    // ── Real world bg (left) ──────────────────────────────────────────────
    this._realBg.clear();
    // Sky
    this._realBg.fillStyle(0xfde8c8, 1);
    this._realBg.fillRect(0, 52, sx, GY - 52);
    // Floor
    this._realBg.fillStyle(0xc8a06e, 1);
    this._realBg.fillRect(0, GY, sx, H - GY);
    // Floor planks
    this._realBg.lineStyle(1, 0xa0784a, 0.5);
    for (let px = 0; px < sx; px += 40) {
      this._realBg.lineBetween(px, GY, px, H);
    }
    // Sunlight wash
    this._realBg.fillStyle(0xfff3e0, 0.12);
    this._realBg.fillRect(0, 52, sx * 0.5, GY * 0.4);

    // ── Digital world bg (right) ──────────────────────────────────────────
    this._digiBg.clear();
    this._digiBg.fillStyle(0x060d1a, 1);
    this._digiBg.fillRect(sx, 52, W - sx, GY - 52);
    this._digiBg.fillStyle(0x05080f, 1);
    this._digiBg.fillRect(sx, GY, W - sx, H - GY);
    // Horizon glow
    this._digiBg.fillStyle(0x1a0a2e, 0.6);
    this._digiBg.fillRect(sx, GY - 80, W - sx, 80);
    // Floor edge
    this._digiBg.lineStyle(2, 0x6366f1, 0.6);
    this._digiBg.lineBetween(sx, GY, W, GY);

    // ── Digital grid (right) ──────────────────────────────────────────────
    this._digiGrid.clear();
    this._digiGrid.lineStyle(1, 0x4f46e5, 0.3);
    const vpx = sx + (W - sx) / 2;
    const vpy = GY * 0.65;
    const cols = 12;
    for (let i = 0; i <= cols; i++) {
      const bx = sx + ((W - sx) / cols) * i;
      this._digiGrid.beginPath();
      this._digiGrid.moveTo(vpx, vpy);
      this._digiGrid.lineTo(bx, GY);
      this._digiGrid.strokePath();
    }
    for (let r = 1; r <= 7; r++) {
      const t = (r / 7) ** 1.6;
      const gy = vpy + (GY - vpy) * t;
      if (gy < GY) {
        this._digiGrid.beginPath();
        this._digiGrid.moveTo(sx, gy);
        this._digiGrid.lineTo(W, gy);
        this._digiGrid.strokePath();
      }
    }

    // ── Split line ────────────────────────────────────────────────────────
    this._splitGfx.clear();

    // Chromatic aberration
    this._splitGfx.lineStyle(2, 0xff0044, 0.3);
    this._splitGfx.lineBetween(sx - 4, 52, sx - 4, H);
    this._splitGfx.lineStyle(2, 0x00f5ff, 0.3);
    this._splitGfx.lineBetween(sx + 4, 52, sx + 4, H);

    // Jagged white line
    const segs = 24;
    const segH = (H - 52) / segs;
    for (let i = 0; i < segs; i++) {
      const y1 = 52 + i * segH;
      const y2 = 52 + (i + 1) * segH;
      const j  = Phaser.Math.Between(-5, 5);
      this._splitGfx.lineStyle(2, 0xffffff, 0.85);
      this._splitGfx.lineBetween(sx + j, y1, sx + j, y2);
    }

    // Soft glow
    this._splitGfx.lineStyle(14, 0xffffff, 0.04);
    this._splitGfx.lineBetween(sx, 52, sx, H);

    // Clip furniture to left side — cover right portion with digital bg color
    // (digital bg already draws over the right side at depth 2, furniture at depth 1)
  }

  // ── Real world furniture (drawn once at depth 1) ──────────────────────────
  _drawFurniture() {
    const g = this._furniture;
    const { _width: W, _groundY: GY } = this;

    // Window
    const wx = 60, wy = 80, ww = 130, wh = 100;
    g.fillStyle(0x87ceeb, 0.8);
    g.fillRect(wx, wy, ww, wh);
    g.fillStyle(0xfff8e7, 0.35);
    g.fillRect(wx + 10, wy + 10, ww - 20, wh - 20);
    g.lineStyle(5, 0x8b6914, 1);
    g.strokeRect(wx, wy, ww, wh);
    g.lineStyle(3, 0x8b6914, 1);
    g.lineBetween(wx + ww / 2, wy, wx + ww / 2, wy + wh);
    g.lineBetween(wx, wy + wh / 2, wx + ww, wy + wh / 2);

    // Bookshelf
    g.fillStyle(0x8b5e3c, 1);
    g.fillRect(20, 220, 110, 14);  // top shelf
    g.fillRect(20, 290, 110, 12);  // mid shelf
    g.fillRect(20, 360, 110, 12);  // bottom shelf
    g.fillRect(20, 220, 12, 155);  // left side
    g.fillRect(118, 220, 12, 155); // right side
    // Books
    const bookColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c];
    bookColors.forEach((c, i) => {
      g.fillStyle(c, 1);
      g.fillRect(24 + i * 16, 234, 12, 54);
    });
    bookColors.forEach((c, i) => {
      g.fillStyle(c, 0.75);
      g.fillRect(24 + i * 16, 304, 12, 52);
    });

    // Desk
    g.fillStyle(0xa0784a, 1);
    g.fillRect(30, GY - 80, 180, 14);
    g.fillRect(30, GY - 66, 10, 66);
    g.fillRect(200, GY - 66, 10, 66);

    // Lamp on desk
    g.fillStyle(0x666666, 1);
    g.fillRect(170, GY - 120, 5, 40);
    g.fillStyle(0xffd700, 1);
    g.fillRect(148, GY - 130, 30, 12);

    // Plant
    const px = Math.round(W * 0.28);
    g.fillStyle(0x6b4226, 1);
    g.fillRect(px - 8, GY - 48, 16, 48);
    g.fillStyle(0x2d6a4f, 1);
    g.fillCircle(px, GY - 52, 26);
    g.fillStyle(0x40916c, 1);
    g.fillCircle(px - 18, GY - 62, 16);
    g.fillCircle(px + 18, GY - 58, 18);
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

  // ── End scene ─────────────────────────────────────────────────────────────
  _endScene() {
    if (this._ended) return;
    this._ended = true;

    const { _width: W, _height: H } = this;

    this.cameras.main.flash(400, 150, 0, 255);
    this.cameras.main.shake(300, 0.012);

    this.time.delayedCall(500, () => {
      const card = this.add.container(W / 2, H / 2).setDepth(40);
      const bg   = this.add.rectangle(0, 0, 520, 130, 0x000000, 0.92);
      bg.setStrokeStyle(3, 0xf97316, 1);
      const title = this.add.text(0, -22, '🧩 The Breaking Point', {
        fontFamily: 'Sora, Inter, sans-serif', fontSize: '32px', fontStyle: 'bold', color: '#f97316'
      }).setOrigin(0.5);
      const sub = this.add.text(0, 22, 'Kai must make a choice.', {
        fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#94a3b8'
      }).setOrigin(0.5);
      card.add([bg, title, sub]);

      gsap.fromTo(card, { alpha: 0, scale: 0.8 }, { alpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' });

      this.time.delayedCall(2500, () => {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          console.log('[Scene] Scene 3 ended — Scene 4 coming next');
        });
      });
    });
  }
}
