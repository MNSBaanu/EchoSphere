import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import AttractionScene from './scenes/AttractionScene.js';
import LearningScene from './scenes/LearningScene.js';
import RealWorldScene from './scenes/RealWorldScene.js';
import TripScene from './scenes/TripScene.js';
import EndScene from './scenes/EndScene.js';

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
  scene: [BootScene, AttractionScene, LearningScene, RealWorldScene, TripScene, EndScene]
};

const game = new Phaser.Game(config);

export default game;
