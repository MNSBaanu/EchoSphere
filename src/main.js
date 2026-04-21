import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import DigitalWorldScene from './scenes/DigitalWorldScene.js';
import RealWorldScene from './scenes/RealWorldScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#0d0d2b',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, DigitalWorldScene, RealWorldScene]
};

const game = new Phaser.Game(config);

export default game;
