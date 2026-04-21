import Phaser from 'phaser';
import Agent from '../agent/Agent.js';

export default class DigitalWorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DigitalWorldScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Neon background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0d2b);

    // Grid lines for digital aesthetic
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x7b2fff, 0.2);
    for (let x = 0; x < width; x += 40) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 40) {
      graphics.lineBetween(0, y, width, y);
    }

    // Zone label
    this.add.text(width / 2, 30, '[ DIGITAL WORLD ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#00f5ff'
    }).setOrigin(0.5);

    // Portal to Real World
    this.portalGraphic = this.add.circle(width - 80, height / 2, 30, 0x52b788, 0.8);
    this.add.text(width - 80, height / 2 + 50, 'Real\nWorld', {
      fontFamily: '"Nunito"',
      fontSize: '11px',
      color: '#52b788',
      align: 'center'
    }).setOrigin(0.5);

    // Spawn agent
    this.agent = new Agent(this, width / 2, height / 2);

    // Pulse portal
    this.tweens.add({
      targets: this.portalGraphic,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  update() {
    if (this.agent) this.agent.update();
  }
}
