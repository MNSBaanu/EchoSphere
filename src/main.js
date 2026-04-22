import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import AttractionScene from './scenes/AttractionScene.js';
import TheLoopScene from './scenes/TheLoopScene.js';
import DistortionScene from './scenes/DistortionScene.js';
import LearningScene from './scenes/LearningScene.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#f0f4ff',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, AttractionScene, TheLoopScene, DistortionScene, LearningScene]
};

const game = new Phaser.Game(config);

export default game;
