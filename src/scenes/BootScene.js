import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Placeholder: load assets here as they are created
    this.load.on('progress', (value) => {
      console.log(`Loading: ${Math.round(value * 100)}%`);
    });
  }

  create() {
    // Show title screen then transition to Digital World
    const { width, height } = this.scale;

    const title = this.add.text(width / 2, height / 2 - 40, 'EchoSphere', {
      fontFamily: '"Press Start 2P"',
      fontSize: '36px',
      color: '#00f5ff',
      stroke: '#7b2fff',
      strokeThickness: 4
    }).setOrigin(0.5);

    const subtitle = this.add.text(width / 2, height / 2 + 20, 'The World You Shape', {
      fontFamily: '"Nunito"',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const hint = this.add.text(width / 2, height / 2 + 80, 'Click to Begin', {
      fontFamily: '"Nunito"',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Blink the hint text
    this.tweens.add({
      targets: hint,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.input.once('pointerdown', () => {
      this.scene.start('DigitalWorldScene');
    });
  }
}
