import FSM from './FSM.js';
import EmotionSystem from './EmotionSystem.js';

/**
 * Agent — the teen character "Hana"
 *
 * Traits active in Scenario 1:
 *   Perception       — detects nearby notifications, changes behaviour
 *   Emotional Intel  — emotion meter drives visual state (colour, speed)
 *   NLP              — reacts to friend messages
 *   Decision Making  — chooses to engage or wander based on state + emotion
 */
export default class Agent {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.emotions = new EmotionSystem();
    this.fsm      = new FSM(this);

    this.perceivedStimuli = [];
    this._perceptionCooldown = 0; // prevent firing event every frame for same notif

    // Movement
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
    this._targetX = null;
    this._targetY = null;

    // Visuals
    this.body = scene.add.circle(x, y, 18, 0xff00ff).setDepth(10);
    this.nameTag = scene.add.text(x, y - 30, 'Hana', {
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(10);

    // Perception radius ring
    this.perceptionRing = scene.add.circle(x, y, 90)
      .setStrokeStyle(1, 0x00f5ff, 0.2)
      .setFillStyle(0x000000, 0)
      .setDepth(5);

    // State label under name
    this.stateLabel = scene.add.text(x, y + 28, 'IDLE', {
      fontSize: '9px',
      color: '#00f5ff',
      backgroundColor: '#00000099',
      padding: { x: 3, y: 1 }
    }).setOrigin(0.5).setDepth(10);
  }

  update() {
    this.fsm.update();
    this.emotions.update();
    this._perceive();
    this._move();
    this._updateVisuals();
    this._syncHUD();
    if (this._perceptionCooldown > 0) this._perceptionCooldown--;
  }

  // ── Perception trait ──────────────────────────────────────────────────────
  _perceive() {
    if (!this.scene.notifications) return;
    if (this._perceptionCooldown > 0) return;

    let closest = null;
    let closestDist = Infinity;

    this.scene.notifications.forEach(n => {
      if (!n.active) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, n.x, n.y);
      if (dist < 90 && dist < closestDist) {
        closest = n;
        closestDist = dist;
      }
    });

    if (closest) {
      // Fire perception event into FSM — state decides what happens
      this.fsm.handleEvent('NOTIFICATION_SEEN');
      this._perceptionCooldown = 60; // ~1 second cooldown

      // Decision Making: move toward it
      this._targetX = closest.x;
      this._targetY = closest.y;

      // Mark notification as "seen" so it can expire naturally
      closest._seen = true;
    }
  }

  // Called by scene when a notification expires without being seen
  onNotificationIgnored() {
    this.fsm.handleEvent('NOTIFICATION_IGNORED');
  }

  // Called by scene when a friend message arrives
  onFriendMessage() {
    this.fsm.handleEvent('FRIEND_MESSAGE');
  }

  // Called by scene when a friend message expires unanswered
  onFriendIgnored() {
    this.fsm.handleEvent('FRIEND_IGNORED');
  }

  // Called by scene when a random event fires
  onRandomEvent(type) {
    this.fsm.handleEvent(type); // 'RANDOM_GOOD' or 'RANDOM_BAD'
  }

  // Called by player clicking Engage / Resist buttons
  onPlayerChoice(choice) {
    this.fsm.handleEvent(choice); // 'PLAYER_ENGAGE' or 'PLAYER_RESIST'
  }

  // ── Movement ──────────────────────────────────────────────────────────────
  _move() {
    const { width, height } = this.scene.scale;

    if (this._targetX !== null) {
      // Pathfind toward target
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this._targetX, this._targetY);
      const dist  = Phaser.Math.Distance.Between(this.x, this.y, this._targetX, this._targetY);
      const speed = this._speedForState();

      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;

      if (dist < 10) this._targetX = this._targetY = null; // reached
    } else {
      // Wander with organic drift
      this.vx += (Math.random() - 0.5) * 0.08;
      this.vy += (Math.random() - 0.5) * 0.08;
    }

    // Clamp speed
    const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    const max = this._speedForState();
    if (spd > max) { this.vx = (this.vx / spd) * max; this.vy = (this.vy / spd) * max; }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 30 || this.x > width - 30)  this.vx *= -1;
    if (this.y < 60 || this.y > height - 30) this.vy *= -1;

    this.body.setPosition(this.x, this.y);
    this.nameTag.setPosition(this.x, this.y - 30);
    this.stateLabel.setPosition(this.x, this.y + 28);
    this.perceptionRing.setPosition(this.x, this.y);
  }

  // Speed varies by emotional state — stressed = faster/erratic, idle = slow
  _speedForState() {
    const stress = this.emotions.stress;
    if (stress > 70) return 2.8;
    if (stress > 40) return 2.0;
    return 1.4;
  }

  // ── Visuals reflect emotional state ──────────────────────────────────────
  _updateVisuals() {
    const state = this.fsm.state;
    this.stateLabel.setText(state);

    // Body colour changes with state
    const colours = {
      IDLE:           0xaaaaaa,
      ATTRACTED:      0xff00ff,
      LOOPING:        0xff6600,
      DISTORTED:      0xff0000,
      BREAKING_POINT: 0x880000,
      RECOVERED:      0x00ff88,
      PARTIAL:        0xffcc00,
      LOST:           0x333333,
    };
    this.body.setFillStyle(colours[state] || 0xffffff);

    // Perception ring pulses faster when stressed
    const alpha = 0.1 + (this.emotions.stress / 100) * 0.4;
    this.perceptionRing.setStrokeStyle(1, 0x00f5ff, alpha);
  }

  // ── HUD sync ──────────────────────────────────────────────────────────────
  _syncHUD() {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.style.width = `${Math.round(val)}%`;
    };
    set('meter-stress',     this.emotions.stress);
    set('meter-happiness',  this.emotions.happiness);
    set('meter-loneliness', this.emotions.loneliness);

    const badge = document.getElementById('state-badge');
    if (badge) badge.textContent = `STATE: ${this.fsm.state}`;
  }
}
