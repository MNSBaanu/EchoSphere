import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Assets will be loaded here as they are created
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 20, 'EchoSphere', {
      fontSize: '36px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 30, 'The World You Shape', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const hint = this.add.text(width / 2, height / 2 + 80, 'Click to Begin', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.input.once('pointerdown', () => {
      this.scene.start('AttractionScene');
    });
  }
}
