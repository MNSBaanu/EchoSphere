import Phaser from 'phaser';
import Agent from '../agent/Agent.js';
import { gsap } from 'gsap';

/**
 * AttractionScene — Scenario 1: The Attraction
 *
 * NOT a video. The outcome depends on:
 *   1. Which notifications the agent happens to walk near (random positions)
 *   2. Which random events fire (unpredictable timing + type)
 *   3. Whether the player clicks Engage or Resist at decision nodes
 *   4. Whether friend messages expire before the agent "responds"
 *
 * Every run is different. The FSM reacts to events, not just timers.
 */

const FRIEND_MESSAGES = [
  { speaker: 'Mia 💬', text: 'omg did you see that new trend?? 😭' },
  { speaker: 'Mia 💬', text: 'you HAVE to check this out lol' },
  { speaker: 'Kai 💬', text: 'bro this video is everything 🔥' },
  { speaker: 'Mia 💬', text: 'reply!! i sent you something funny' },
  { speaker: 'Kai 💬', text: 'are you online? come see this 👀' },
  { speaker: 'Mia 💬', text: 'hellooo?? you there?' },
];

const NOTIFICATIONS = [
  '❤️  Mia liked your post',
  '🔔  You have 12 new followers!',
  '💬  Kai commented on your photo',
  '🎉  Your post is trending!',
  '🔥  5 people reacted to your story',
  '⭐  You earned a new badge!',
  '📣  Someone shared your post',
  '💌  New message from Mia',
  '🚀  You went viral!',
  '👀  50 people viewed your profile',
];

// Random events that can fire unpredictably
const RANDOM_EVENTS = [
  {
    type: 'RANDOM_GOOD',
    label: '📵 Phone battery at 1%!',
    desc: 'The screen goes dark. Hana looks up.',
    color: '#52b788'
  },
  {
    type: 'RANDOM_GOOD',
    label: '🌧️ It\'s raining outside',
    desc: 'The sound of rain pulls Hana\'s attention away.',
    color: '#74c0fc'
  },
  {
    type: 'RANDOM_BAD',
    label: '🔥 Your post went VIRAL',
    desc: 'Notifications explode. Hana can\'t look away.',
    color: '#ff6b6b'
  },
  {
    type: 'RANDOM_BAD',
    label: '🎰 New addictive game dropped!',
    desc: 'Everyone is playing it. The pull is overwhelming.',
    color: '#ff00ff'
  },
  {
    type: 'RANDOM_GOOD',
    label: '💡 Social media is down',
    desc: 'The platform crashes. Silence.',
    color: '#ffd43b'
  },
];

export default class AttractionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AttractionScene' });
    this.notifications = [];
    this._msgIndex = 0;
    this._pendingFriendMsg = false; // true while a friend msg is on screen waiting
    this._decisionPending = false;  // true while player choice buttons are shown
    this._ended = false;
  }

  create() {
    const { width, height } = this.scale;

    // ── Background — deep gradient-style digital world ────────────────────
    // Base dark layer
    this.bg = this.add.rectangle(width / 2, height / 2, width, height, 0x08081a);

    // Subtle radial glow in centre using layered circles
    const glowColors = [0x1a0a3a, 0x120830, 0x0d0620, 0x08081a];
    const glowSizes  = [600, 450, 300, 150];
    glowColors.forEach((col, i) => {
      this.add.circle(width / 2, height / 2, glowSizes[i], col, 0.4).setDepth(0);
    });

    // Floor line — gives a sense of ground
    const floor = this.add.graphics().setDepth(1);
    floor.lineStyle(1, 0x2a1a4a, 0.6);
    floor.lineBetween(0, height - 80, width, height - 80);

    // Subtle ambient particles
    this._spawnBackgroundOrbs(width, height);

    // Scene title — clean, minimal
    this.add.text(20, 18, 'DIGITAL WORLD', {
      fontSize: '10px', color: '#ffffff', alpha: 0.3
    }).setDepth(2);

    this.add.text(20, 34, 'Scenario 1 — The Attraction', {
      fontSize: '9px', color: '#7b2fff', alpha: 0.5
    }).setDepth(2);

    // ── Agent ─────────────────────────────────────────────────────────────
    this.agent = new Agent(this, width / 2, height / 2);

    // FSM transition handler — scene reacts to every state change
    this.agent.fsm.onTransition((newState, reason) => {
      this._onStateChange(newState, reason);
    });

    // ── Notification spawner — random delay each time ─────────────────────
    this._scheduleNextNotification();

    // ── Friend message spawner ────────────────────────────────────────────
    this._scheduleNextFriendMessage();

    // ── Random event spawner — fires at unpredictable intervals ──────────
    this._scheduleRandomEvent();

    // ── Player choice buttons (shown at decision nodes) ───────────────────
    this._buildChoiceButtons(width, height);

    // ── Event log (bottom-left) ───────────────────────────────────────────
    this._logLines = [];
    this._buildEventLog(width, height);
  }

  update() {
    if (this._ended) return;
    if (this.agent) this.agent.update();
    this.notifications = this.notifications.filter(n => n.active);
  }

  // ── State change handler — scene responds visually to every transition ───
  _onStateChange(newState, reason) {
    this._log(`→ ${newState}`, reason);

    if (newState === 'ATTRACTED') {
      // Background warms up slightly
      this.tweens.add({ targets: this.bg, fillColor: 0x110d2b, duration: 1000 });
      this._showDecisionNode('You feel the pull of the screen...', 'Engage', 'Resist');
    }

    if (newState === 'LOOPING') {
      this._endScene('LOOPING', reason);
    }

    if (newState === 'RECOVERED' || newState === 'PARTIAL' || newState === 'LOST') {
      this._endScene(newState, reason);
    }
  }

  // ── Notification spawning — random position, random delay ────────────────
  _scheduleNextNotification() {
    const delay = Phaser.Math.Between(1500, 4000); // unpredictable timing
    this.time.delayedCall(delay, () => {
      if (!this._ended) {
        this._spawnNotification();
        this._scheduleNextNotification();
      }
    });
  }

  _spawnNotification() {
    const { width, height } = this.scale;
    const x    = Phaser.Math.Between(100, width - 100);
    const y    = Phaser.Math.Between(80,  height - 80);
    const text = Phaser.Utils.Array.GetRandom(NOTIFICATIONS);

    const bubble = this.add.container(x, y).setDepth(8);
    const bg = this.add.rectangle(0, 0, 210, 38, 0x1a0a3a, 0.92)
      .setStrokeStyle(1.5, 0xff00ff, 1);
    const label = this.add.text(0, 0, text, {
      fontSize: '10px', color: '#ffffff', wordWrap: { width: 190 }
    }).setOrigin(0.5);
    bubble.add([bg, label]);
    bubble.x = x;
    bubble.y = y;
    bubble._seen = false;

    gsap.fromTo(bubble, { alpha: 0, scale: 0.5 }, { alpha: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' });

    // Notification lives for a random duration — if agent doesn't reach it, it's "ignored"
    const lifetime = Phaser.Math.Between(3000, 6000);
    this.time.delayedCall(lifetime, () => {
      if (bubble.active) {
        if (!bubble._seen) {
          // Agent never perceived it — fire ignored event
          this.agent.onNotificationIgnored();
        }
        gsap.to(bubble, {
          alpha: 0, scale: 0.4, duration: 0.25,
          onComplete: () => { if (bubble.active) bubble.destroy(); }
        });
      }
    });

    this.notifications.push(bubble);
    this._showHTMLNotification(text);
  }

  // ── Friend message — NLP interaction ─────────────────────────────────────
  _scheduleNextFriendMessage() {
    const delay = Phaser.Math.Between(5000, 10000);
    this.time.delayedCall(delay, () => {
      if (!this._ended) {
        this._showFriendMessage();
        this._scheduleNextFriendMessage();
      }
    });
  }

  _showFriendMessage() {
    const msg = FRIEND_MESSAGES[this._msgIndex % FRIEND_MESSAGES.length];
    this._msgIndex++;
    this._pendingFriendMsg = true;

    const box     = document.getElementById('dialogue-box');
    const speaker = document.getElementById('dialogue-speaker');
    const textEl  = document.getElementById('dialogue-text');
    if (!box || !speaker || !textEl) return;

    speaker.textContent = msg.speaker;
    textEl.textContent  = msg.text;
    box.classList.remove('hidden');
    gsap.fromTo(box, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });

    // Fire NLP event into agent
    this.agent.onFriendMessage();
    this._log(`📩 ${msg.speaker}`, msg.text.slice(0, 30));

    // Message expires after random time — if no player interaction, it's "ignored"
    const expiry = Phaser.Math.Between(4000, 7000);
    this.time.delayedCall(expiry, () => {
      if (this._pendingFriendMsg) {
        this._pendingFriendMsg = false;
        this.agent.onFriendIgnored();
        this._log('⚠️ Ignored', msg.speaker + ' got no reply');
      }
      gsap.to(box, {
        y: 20, opacity: 0, duration: 0.3,
        onComplete: () => box.classList.add('hidden')
      });
    });
  }

  // ── Random events — fire at unpredictable times ───────────────────────────
  _scheduleRandomEvent() {
    // Random delay between 8 and 20 seconds — truly unpredictable
    const delay = Phaser.Math.Between(8000, 20000);
    this.time.delayedCall(delay, () => {
      if (!this._ended) {
        this._fireRandomEvent();
        this._scheduleRandomEvent(); // schedule next one
      }
    });
  }

  _fireRandomEvent() {
    const event = Phaser.Utils.Array.GetRandom(RANDOM_EVENTS);
    this.agent.onRandomEvent(event.type);
    this._log(event.label, event.desc);

    // Show random event banner
    const { width, height } = this.scale;
    const banner = this.add.container(width / 2, height / 2 - 80).setDepth(25);
    const bg = this.add.rectangle(0, 0, 420, 60, 0x000000, 0.85)
      .setStrokeStyle(2, parseInt(event.color.replace('#', '0x')), 1);
    const title = this.add.text(0, -10, event.label, {
      fontSize: '14px', color: event.color
    }).setOrigin(0.5);
    const desc = this.add.text(0, 12, event.desc, {
      fontSize: '10px', color: '#cccccc'
    }).setOrigin(0.5);
    banner.add([bg, title, desc]);

    gsap.fromTo(banner, { alpha: 0, y: height / 2 - 100 }, { alpha: 1, y: height / 2 - 80, duration: 0.4 });
    this.time.delayedCall(3000, () => {
      gsap.to(banner, { alpha: 0, duration: 0.4, onComplete: () => banner.destroy() });
    });
  }

  // ── Decision node — player can influence the agent ────────────────────────
  _showDecisionNode(prompt, yesLabel, noLabel) {
    if (this._decisionPending) return;
    this._decisionPending = true;

    const promptEl = document.getElementById('decision-prompt');
    const btnEngage = document.getElementById('btn-engage');
    const btnResist = document.getElementById('btn-resist');
    const panel = document.getElementById('decision-panel');
    if (!panel) return;

    if (promptEl) promptEl.textContent = prompt;
    if (btnEngage) btnEngage.textContent = yesLabel;
    if (btnResist) btnResist.textContent = noLabel;

    panel.classList.remove('hidden');
    gsap.fromTo(panel, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.35 });

    // Auto-dismiss after 6 seconds if player doesn't choose
    this.time.delayedCall(6000, () => {
      if (this._decisionPending) {
        this._decisionPending = false;
        panel.classList.add('hidden');
        this._log('⏱ No choice made', 'agent decided on its own');
      }
    });
  }

  _buildChoiceButtons(width, height) {
    // Buttons are in HTML overlay — wire them up
    const btnEngage = document.getElementById('btn-engage');
    const btnResist = document.getElementById('btn-resist');
    const panel     = document.getElementById('decision-panel');

    if (btnEngage) {
      btnEngage.addEventListener('click', () => {
        if (!this._decisionPending) return;
        this._decisionPending = false;
        panel.classList.add('hidden');
        this.agent.onPlayerChoice('PLAYER_ENGAGE');
        this._log('🎮 Player', 'chose to Engage');
      });
    }
    if (btnResist) {
      btnResist.addEventListener('click', () => {
        if (!this._decisionPending) return;
        this._decisionPending = false;
        panel.classList.add('hidden');
        this.agent.onPlayerChoice('PLAYER_RESIST');
        this._log('🎮 Player', 'chose to Resist');
      });
    }
  }

  // ── Event log ─────────────────────────────────────────────────────────────
  _buildEventLog(width, height) {
    this._logContainer = this.add.container(10, height - 10).setDepth(15);
  }

  _log(label, detail = '') {
    const { height } = this.scene.scene.sys.scale;
    const line = `${label}${detail ? ' — ' + detail : ''}`;
    this._logLines.push(line);
    if (this._logLines.length > 6) this._logLines.shift();

    // Rebuild log text
    this._logContainer.removeAll(true);
    this._logLines.forEach((l, i) => {
      const t = this.add.text(0, -(this._logLines.length - i) * 16, l, {
        fontSize: '9px',
        color: '#888888',
        backgroundColor: '#00000066',
        padding: { x: 3, y: 1 }
      });
      this._logContainer.add(t);
    });
  }

  // ── HTML notification popup ───────────────────────────────────────────────
  _showHTMLNotification(text) {
    const popup = document.getElementById('notification-popup');
    const textEl = document.getElementById('notification-text');
    if (!popup || !textEl) return;
    textEl.textContent = text;
    popup.classList.remove('hidden');
    gsap.fromTo(popup, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35 });
    setTimeout(() => {
      gsap.to(popup, {
        x: 60, opacity: 0, duration: 0.3,
        onComplete: () => popup.classList.add('hidden')
      });
    }, 2500);
  }

  // ── Background ambient orbs — subtle, professional ───────────────────────
  _spawnBackgroundOrbs(width, height) {
    const colours = [0x7b2fff, 0x4a00e0, 0x00b4d8, 0x6a0dad];
    for (let i = 0; i < 6; i++) {
      const orb = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(60, 140),
        Phaser.Utils.Array.GetRandom(colours), 0.04
      ).setDepth(0);
      this.tweens.add({
        targets: orb,
        y: orb.y - Phaser.Math.Between(15, 40),
        alpha: 0.07,
        duration: Phaser.Math.Between(4000, 8000),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    }
  }

  // ── Scene end — show outcome ──────────────────────────────────────────────
  _endScene(outcome, reason) {
    if (this._ended) return;
    this._ended = true;

    const { width, height } = this.scale;

    const overlayColour = {
      LOOPING:       0x110000,
      RECOVERED:     0x001100,
      PARTIAL:       0x111100,
      LOST:          0x000000,
    }[outcome] || 0x000000;

    const messages = {
      LOOPING:   { title: '🔁 The Loop Begins', sub: 'Hana is hooked. The habit is forming.', color: '#ff6600' },
      RECOVERED: { title: '✅ Resisted!', sub: 'Hana stepped back before it was too late.', color: '#00ff88' },
      PARTIAL:   { title: '🔶 Mixed Signals', sub: 'Hana is torn between both worlds.', color: '#ffcc00' },
      LOST:      { title: '❌ Lost in the Feed', sub: 'Hana is completely absorbed.', color: '#ff4444' },
    };

    const m = messages[outcome] || { title: outcome, sub: reason, color: '#ffffff' };

    // Fade overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, overlayColour, 0)
      .setDepth(30);
    this.tweens.add({ targets: overlay, fillAlpha: 0.75, duration: 1200 });

    this.time.delayedCall(800, () => {
      this.add.text(width / 2, height / 2 - 30, m.title, {
        fontSize: '28px', color: m.color, stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(31);

      this.add.text(width / 2, height / 2 + 20, m.sub, {
        fontSize: '14px', color: '#cccccc'
      }).setOrigin(0.5).setDepth(31);

      this.add.text(width / 2, height / 2 + 60, `Reason: ${reason}`, {
        fontSize: '10px', color: '#666666'
      }).setOrigin(0.5).setDepth(31);

      // Stats
      const fsm = this.agent.fsm;
      this.add.text(width / 2, height / 2 + 90,
        `Engaged: ${fsm.engageCount}  |  Resisted: ${fsm.resistCount}  |  Friends ignored: ${fsm.ignoredFriends}`,
        { fontSize: '10px', color: '#888888' }
      ).setOrigin(0.5).setDepth(31);

      this.add.text(width / 2, height / 2 + 120, 'Click to continue →', {
        fontSize: '11px', color: '#555555'
      }).setOrigin(0.5).setDepth(31);

      this.input.once('pointerdown', () => {
        // Scenario 2 scene will be started here
        console.log('[Scene] Scenario 1 ended with:', outcome);
      });
    });
  }
}
