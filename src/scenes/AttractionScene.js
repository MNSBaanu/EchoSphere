import Phaser from 'phaser';
import Agent from '../agent/Agent.js';
import { gsap } from 'gsap';

/**
 * AttractionScene — Scenario 1: The Attraction (Initial Engagement Phase)
 *
 * Environment: Bright, colorful, neon digital world
 * Agent traits active: Perception · Emotional Intelligence · NLP · Decision Making
 *
 * What happens:
 * - Agent enters the digital world (IDLE state)
 * - Notifications start appearing randomly (Perception)
 * - Agent detects and moves toward them (Decision Making)
 * - Each interaction boosts happiness (Emotional Intelligence)
 * - Friend messages pop up via dialogue box (NLP)
 * - FSM transitions IDLE → ATTRACTED as engagement grows
 */

// Friend NLP messages for Scenario 1
const FRIEND_MESSAGES = [
  { speaker: 'Mia 💬', text: 'omg did you see that new trend?? 😭' },
  { speaker: 'Mia 💬', text: 'you HAVE to check this out lol' },
  { speaker: 'Kai 💬', text: 'bro this video is everything 🔥' },
  { speaker: 'Mia 💬', text: 'reply!! i sent you something funny' },
  { speaker: 'Kai 💬', text: 'are you online? come see this 👀' },
];

// Notification content pool
const NOTIFICATIONS = [
  '❤️  Mia liked your post',
  '🔔  You have 12 new followers!',
  '💬  Kai commented on your photo',
  '🎉  Your post is trending!',
  '🔥  5 people reacted to your story',
  '⭐  You earned a new badge!',
  '📣  Someone shared your post',
  '💌  New message from Mia',
];

export default class AttractionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AttractionScene' });
    this.notifications = []; // shared with Agent for perception
    this._notifTimer = 0;
    this._msgTimer   = 0;
    this._msgIndex   = 0;
  }

  create() {
    const { width, height } = this.scale;

    // ── Background: deep neon digital world ──────────────────────────────
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0d2b);

    // Grid lines — digital aesthetic
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x7b2fff, 0.15);
    for (let x = 0; x < width; x += 40)  grid.lineBetween(x, 0, x, height);
    for (let y = 0; y < height; y += 40) grid.lineBetween(0, y, width, y);

    // Floating colour orbs in background for vibrancy
    this._spawnBackgroundOrbs(width, height);

    // Scene label
    this.add.text(width / 2, 22, '✦  DIGITAL WORLD  ✦', {
      fontSize: '11px',
      color: '#00f5ff',
      alpha: 0.7
    }).setOrigin(0.5);

    this.add.text(width / 2, 42, 'SCENARIO 1 — THE ATTRACTION', {
      fontSize: '9px',
      color: '#7b2fff',
      alpha: 0.6
    }).setOrigin(0.5);

    // ── Spawn agent in centre ─────────────────────────────────────────────
    this.agent = new Agent(this, width / 2, height / 2);

    // Listen for FSM state change to trigger next scene
    this.agent.fsm.onTransition((newState) => {
      if (newState === 'LOOPING') {
        // Scenario 2 will be wired here
        this._showSceneEnd('Scenario 1 complete — entering The Loop...');
      }
    });

    // ── Notification spawn timer ──────────────────────────────────────────
    this.time.addEvent({
      delay: Phaser.Math.Between(1800, 3000),
      callback: this._spawnNotification,
      callbackScope: this,
      loop: true
    });

    // ── Friend message timer (NLP) ────────────────────────────────────────
    this.time.addEvent({
      delay: 4000,
      callback: this._showFriendMessage,
      callbackScope: this,
      loop: true
    });
  }

  update() {
    if (this.agent) this.agent.update();

    // Clean up collected notifications
    this.notifications = this.notifications.filter(n => n.active);
  }

  // ── Spawn a floating notification icon ───────────────────────────────────
  _spawnNotification() {
    const { width, height } = this.scale;

    const x = Phaser.Math.Between(80, width - 80);
    const y = Phaser.Math.Between(80, height - 80);
    const text = Phaser.Utils.Array.GetRandom(NOTIFICATIONS);

    // Glowing notification bubble
    const bubble = this.add.container(x, y).setDepth(8);

    const bg = this.add.rectangle(0, 0, 200, 36, 0x1a0a3a, 0.92)
      .setStrokeStyle(1.5, 0xff00ff, 1);

    const label = this.add.text(0, 0, text, {
      fontSize: '10px',
      color: '#ffffff',
      wordWrap: { width: 180 }
    }).setOrigin(0.5);

    bubble.add([bg, label]);

    // Store x/y on container for perception distance check
    bubble.x = x;
    bubble.y = y;

    // Pulse in with GSAP
    gsap.fromTo(bubble, { alpha: 0, scale: 0.6 }, { alpha: 1, scale: 1, duration: 0.35, ease: 'back.out(1.5)' });

    // Auto-remove after 4 seconds
    this.time.delayedCall(4000, () => {
      gsap.to(bubble, {
        alpha: 0, scale: 0.5, duration: 0.3,
        onComplete: () => bubble.destroy()
      });
    });

    this.notifications.push(bubble);

    // Also show in HTML popup briefly
    this._showHTMLNotification(text);
  }

  // ── HTML overlay notification (top-right popup) ───────────────────────────
  _showHTMLNotification(text) {
    const popup = document.getElementById('notification-popup');
    const textEl = document.getElementById('notification-text');
    if (!popup || !textEl) return;

    textEl.textContent = text;
    popup.classList.remove('hidden');

    gsap.fromTo(popup, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 });

    setTimeout(() => {
      gsap.to(popup, {
        x: 60, opacity: 0, duration: 0.3,
        onComplete: () => popup.classList.add('hidden')
      });
    }, 2500);
  }

  // ── NLP friend message dialogue ───────────────────────────────────────────
  _showFriendMessage() {
    const msg = FRIEND_MESSAGES[this._msgIndex % FRIEND_MESSAGES.length];
    this._msgIndex++;

    const box     = document.getElementById('dialogue-box');
    const speaker = document.getElementById('dialogue-speaker');
    const textEl  = document.getElementById('dialogue-text');
    if (!box || !speaker || !textEl) return;

    speaker.textContent = msg.speaker;
    textEl.textContent  = msg.text;
    box.classList.remove('hidden');

    gsap.fromTo(box, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });

    // Receiving a message boosts happiness (NLP → Emotional Intelligence)
    if (this.agent) {
      this.agent.emotions.applyEvent({ happiness: 5, loneliness: -3 });
    }

    setTimeout(() => {
      gsap.to(box, {
        y: 20, opacity: 0, duration: 0.3,
        onComplete: () => box.classList.add('hidden')
      });
    }, 3000);
  }

  // ── Decorative background orbs ────────────────────────────────────────────
  _spawnBackgroundOrbs(width, height) {
    const colours = [0xff00ff, 0x00f5ff, 0x7b2fff, 0xffcc00];
    for (let i = 0; i < 8; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(30, 80),
        Phaser.Utils.Array.GetRandom(colours),
        0.06
      ).setDepth(1);

      // Slow float animation
      this.tweens.add({
        targets: orb,
        y: orb.y - Phaser.Math.Between(20, 60),
        alpha: 0.12,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  // ── Scene end message ─────────────────────────────────────────────────────
  _showSceneEnd(msg) {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(20);
    this.add.text(width / 2, height / 2, msg, {
      fontSize: '16px',
      color: '#00f5ff',
      align: 'center'
    }).setOrigin(0.5).setDepth(21);
  }
}
