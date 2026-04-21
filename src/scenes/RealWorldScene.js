import Phaser from 'phaser';
import Agent from '../agent/Agent.js';

export default class RealWorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RealWorldScene' });
  }

  create() {
    const { width, height } = this.scale;

    // Warm background
    this.add.rectangle(width / 2, height / 2, width, height, 0xfdf6ec);

    // Zone label
    this.add.text(width / 2, 30, '[ REAL WORLD ]', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#f4a261'
    }).setOrigin(0.5);

    // Portal back to Digital World
    this.portalGraphic = this.add.circle(80, height / 2, 30, 0x00f5ff, 0.8);
    this.add.text(80, height / 2 + 50, 'Digital\nWorld', {
      fontFamily: '"Nunito"',
      fontSize: '11px',
      color: '#00f5ff',
      align: 'center'
    }).setOrigin(0.5);

    // Spawn agent
    this.agent = new Agent(this, width / 2, height / 2);

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
