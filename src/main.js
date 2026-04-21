import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import AttractionScene from './scenes/AttractionScene.js';

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
  scene: [BootScene, AttractionScene]
};

const game = new Phaser.Game(config);

export default game;
