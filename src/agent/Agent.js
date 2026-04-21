import FSM from './FSM.js';
import EmotionSystem from './EmotionSystem.js';

export default class Agent {
  constructor(scene, x, y) {
    this.scene = scene;

    // Visual placeholder — will be replaced with sprite
    this.graphic = scene.add.circle(x, y, 20, 0xff00ff);
    this.label = scene.add.text(x, y - 32, 'Agent', {
      fontFamily: '"Nunito"',
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.x = x;
    this.y = y;

    this.emotions = new EmotionSystem();
    this.fsm = new FSM(this);

    // Simple wander velocity
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
  }

  update() {
    this.fsm.update();
    this.emotions.update();
    this._wander();
    this._syncHUD();
  }

  _wander() {
    const { width, height } = this.scene.scale;

    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 30 || this.x > width - 30) this.vx *= -1;
    if (this.y < 60 || this.y > height - 30) this.vy *= -1;

    this.graphic.setPosition(this.x, this.y);
    this.label.setPosition(this.x, this.y - 32);
  }

  _syncHUD() {
    const e = this.emotions;
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.style.width = `${Math.round(val)}%`;
    };
    set('meter-stress', e.stress);
    set('meter-happiness', e.happiness);
    set('meter-loneliness', e.loneliness);

    const badge = document.getElementById('state-badge');
    if (badge) badge.textContent = `STATE: ${this.fsm.state}`;
  }
}
