import Phaser from "phaser";
import { gsap } from "gsap";
import Agent from "../agent/Agent.js";

const FONT = "Inter, sans-serif";

// ── NPC dialogue data ─────────────────────────────────────────────────────
const NPC_DATA = [
  {
    id: "mom",
    name: "Mom",
    color: 0xe879a0,
    x: 0.72,
    y: 0.70, // Same level as others
    emotion: "happy",
    lines: [
      "Hey! You actually came outside! 😊",
      "I made your favourite snack!",
      "It is so nice to see you without that phone.",
      "Want to take a walk together?",
    ],
    angryLines: [
      "You are always on that phone!",
      "Can you please just be present?",
      "I miss spending time with you.",
    ],
  },
  {
    id: "friend",
    name: "Alex",
    color: 0x38bdf8,
    x: 0.55,
    y: 0.70, // Same level as others
    emotion: "neutral",
    lines: [
      "Yo! Finally offline? 😄",
      "We were about to start without you!",
      "Bro put the phone down, we are here!",
      "Real life hits different, right?",
    ],
    angryLines: [
      "Seriously? You are checking your phone again?",
      "We are right here talking to you!",
      "Do you even care about us anymore?",
    ],
  },
  {
    id: "sibling",
    name: "Sam",
    color: 0x4ade80,
    x: 0.38,
    y: 0.70, // Same level as others
    emotion: "neutral",
    lines: [
      "Can we play something together?",
      "You promised you would help me today!",
      "I saved your spot at the table!",
    ],
    angryLines: [
      "You always ignore me for that phone!",
      "I do not matter to you anymore?",
    ],
  },
];

export default class RealWorldScene extends Phaser.Scene {
  constructor() {
    super({ key: "RealWorldScene" });
    this._ended = false;
    this._npcs = [];
    this._activeBubbles = [];
    this._phoneVisible = false;
    this._phonePullTimer = 0;
    this._playerIgnoreCount = 0;
    this._playerEngageCount = 0;

    // ── Physics / perception constants ────────────────────────────────────
    this.VISION_RANGE   = 200;   // px — how far Kai can see
    this.VISION_ANGLE   = 90;    // degrees — cone of vision (±45° from facing)
    this.HEARING_RANGE  = 150;   // px — how far Kai can hear NPCs
    this.NPC_WANDER_SPEED = 0.6; // px/frame — NPCs wander slowly

    // ── Learning / memory ─────────────────────────────────────────────────
    this._learnedNPCs   = new Set(); // NPCs Kai has spoken to (not same mistake twice)
    this._avoidedNPC    = null;      // NPC Kai decided to avoid after bad interaction
    this._adviceGiven   = false;     // Mom gave advice once — not repeated

    // ── Random event state ────────────────────────────────────────────────
    this._timeOfDay     = 'day';     // 'day' | 'dusk' — affects vision range
    this._weatherEvent  = null;      // null | 'wind' | 'rain'
    this._randomEventTimer = 0;
  }

  init(data) {
    this._addictionLevel    = data.addictionLevel    ?? 0;
    this._awareness         = data.awareness         ?? 70;
    this._relationshipLevel = data.relationshipLevel ?? 50;
    this._hasPhone          = data.hasPhone          ?? false;
    this._memory            = data.memory            ?? [];
  }

  create() {
    const { width, height } = this.scale;
    this._w = width;
    this._h = height;
    this._groundY = height * 0.75;

    // Background: warm outdoor park
    this._drawOutdoor(width, height);

    // ── Top bar ───────────────────────────────────────────────────────────
    const topBar = this.add.graphics().setDepth(20);
    topBar.fillStyle(0x14532d, 1);
    topBar.fillRect(0, 0, width, 52);

    this.add.text(24, 14, "🌿  EchoSphere", {
      fontFamily: FONT, fontSize: "22px", fontStyle: "bold", color: "#ffffff"
    }).setDepth(21);

    this.add.text(width / 2, 14, "REAL WORLD — OUTSIDE", {
      fontFamily: FONT, fontSize: "16px", color: "#86efac", fontStyle: "bold"
    }).setOrigin(0.5, 0).setDepth(21);

    this.add.text(width - 24, 14, "[N] skip", {
      fontFamily: FONT, fontSize: "14px", color: "#4ade80"
    }).setOrigin(1, 0).setDepth(21);

    // ── Spawn NPCs ────────────────────────────────────────────────────────
    NPC_DATA.forEach(data => this._spawnNPC(data, width, height));

    // ── Player character (Kai) ────────────────────────────────────────────
    this._spawnPlayer(width, height);

    // ── Vision cone graphics (removed - no visual effects) ───────────────
    this._visionGfx = this.add.graphics().setDepth(6).setAlpha(0); // Completely hidden

    // ── Phone in hand (if carried) ────────────────────────────────────────
    if (this._hasPhone || this._addictionLevel > 30) {
      this._phoneVisible = true;
      this._phoneNotifText = this.add.text(0, 0, "", {
        fontFamily: FONT, fontSize: "12px", color: "#ffffff",
        backgroundColor: "#6366f1dd", padding: { x: 8, y: 4 }
      }).setDepth(15).setAlpha(0);
    }

    // ── Notification Icon (distraction trigger) ───────────────────────────
    this._createNotificationIcon();

    // ── Awareness HUD ─────────────────────────────────────────────────────
    this._buildHUD(width, height);

    // ── Weather / time-of-day overlay (drawn on top) ──────────────────────
    this._weatherOverlay = this.add.graphics().setDepth(18).setAlpha(0);

    // ── Start NPC greeting sequence (delayed for smooth entry) ───────────
    this.time.delayedCall(3000, () => this._startGreetings()); // Increased from 1200 to 3000ms

    // ── Phone pull-back loop ──────────────────────────────────────────────
    this.time.addEvent({
      delay: 4000,
      callback: this._phonePullEvent,
      callbackScope: this,
      loop: true
    });

    // ── Random world events ───────────────────────────────────────────────
    this.time.addEvent({
      delay: 8000,
      callback: this._triggerRandomEvent,
      callbackScope: this,
      loop: true
    });

    // ── NPC autonomous wander ─────────────────────────────────────────────
    this._npcs.forEach(npc => this._startNPCWander(npc));

    // ── Skip key ──────────────────────────────────────────────────────────
    this.input.keyboard.once("keydown-N", () => {
      if (!this._ended) this._endScene();
    });
  }

  update() {
    if (this._ended) return;
    this._handlePlayerMovement();
    this._updateVisionCone();
    this._updatePerception();
    this._updateNPCWander();
    this._updatePlayerProximity();
    this._updateHUD();
    this._randomEventTimer++;
  }

  // ── PERCEPTION: Vision cone + hearing range ───────────────────────────────
  _updateVisionCone() {
    if (!this.agent || !this._visionGfx) return;
    const g = this._visionGfx;
    g.clear();

    // Vision range shrinks at dusk, shrinks more if phone is out (distracted)
    let range = this.VISION_RANGE;
    if (this._timeOfDay === 'dusk') range *= 0.55;
    if (this._phoneVisible && this._addictionLevel > 40) range *= 0.6;

    // Facing direction from Agent
    const facingRight = this.agent._facingRight;
    const facingAngle = facingRight ? 0 : Math.PI;
    const halfCone = Phaser.Math.DegToRad(this.VISION_ANGLE / 2);

    const ax = this.agent.x;
    const ay = this.agent.y;

    // Draw cone - invisible (removed yellow vision cone)
    // Vision cone is now hidden for cleaner visuals
    g.fillStyle(0xffd700, 0); // Alpha set to 0 - invisible
    g.beginPath();
    g.moveTo(ax, ay);
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const a = (facingAngle - halfCone) + (i / steps) * (halfCone * 2);
      g.lineTo(ax + Math.cos(a) * range, ay + Math.sin(a) * range);
    }
    g.closePath();
    g.fillPath();

    // Hearing ring - also hidden
    g.lineStyle(1, 0x38bdf8, 0); // Alpha set to 0 - invisible
    g.strokeCircle(ax, ay, this.HEARING_RANGE);
  }

  // ── PERCEPTION: Kai perceives NPCs in vision/hearing range ───────────────
  _updatePerception() {
    if (!this.agent) return;
    const ax = this.agent.x;
    const ay = this.agent.y;
    const facingAngle = this.agent._facingRight ? 0 : Math.PI;
    const halfCone = Phaser.Math.DegToRad(this.VISION_ANGLE / 2);

    let visionRange = this.VISION_RANGE;
    if (this._timeOfDay === 'dusk') visionRange *= 0.55;
    if (this._phoneVisible && this._addictionLevel > 40) visionRange *= 0.6;

    this._npcs.forEach(npc => {
      const dx = npc.x - ax;
      const dy = npc.y - ay;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angleToNPC = Math.atan2(dy, dx);
      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToNPC - facingAngle));

      // Can SEE: within cone and range
      const canSee = dist < visionRange && angleDiff < halfCone;
      // Can HEAR: within hearing range (regardless of direction)
      const canHear = dist < this.HEARING_RANGE;

      if ((canSee || canHear) && !npc._perceived) {
        npc._perceived = true;
        // First time perceiving this NPC — log it
        if (!this._learnedNPCs.has(npc.id)) {
          this._log(`👁 Kai noticed ${npc.name}`);
        }
      } else if (!canSee && !canHear) {
        npc._perceived = false;
      }
    });
  }

  // ── PATHFINDING: Steer NPC toward a target (simple seek) ─────────────────
  _steerNPCToward(npc, tx, ty) {
    const dx = tx - npc.x;
    const dy = ty - npc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;
    const speed = this.NPC_WANDER_SPEED;
    npc.x += (dx / dist) * speed;
    npc.y += (dy / dist) * speed;
    // Redraw NPC at new position
    if (npc.drawNPC) npc.drawNPC(npc.emotion);
    if (npc.nameTag) npc.nameTag.setPosition(npc.x, npc.nameTag.y);
    if (npc.emotionTag) npc.emotionTag.setPosition(npc.x + 30, npc.emotionTag.y);
  }

  // ── NPC AUTONOMOUS WANDER ─────────────────────────────────────────────────
  _startNPCWander(npc) {
    npc._wanderTarget = { x: npc.x, y: npc.y };
    npc._wanderTimer  = 0;
  }

  _updateNPCWander() {
    this._npcs.forEach(npc => {
      if (npc._seekingPlayer) return; // pathfinding overrides wander
      npc._wanderTimer = (npc._wanderTimer || 0) + 1;

      // Pick new wander target every ~4s
      if (npc._wanderTimer > 240) {
        npc._wanderTimer = 0;
        const spread = 60;
        const baseX = this._w * npc.data.x;
        const baseY = this._h * npc.data.y;
        npc._wanderTarget = {
          x: Phaser.Math.Clamp(baseX + Phaser.Math.Between(-spread, spread), 60, this._w - 60),
          y: Phaser.Math.Clamp(baseY + Phaser.Math.Between(-spread / 2, spread / 2), 80, this._groundY)
        };
      }

      // Steer toward wander target
      if (npc._wanderTarget) {
        this._steerNPCToward(npc, npc._wanderTarget.x, npc._wanderTarget.y);
      }
    });
  }

  // ── DECISION MAKING: NPC decides to approach Kai if ignored too long ──────
  _npcDecideToApproach(npc) {
    if (npc._seekingPlayer || npc.bubble) return;
    npc._seekingPlayer = true;

    // NPC walks toward Kai
    const seekInterval = this.time.addEvent({
      delay: 50,
      callback: () => {
        if (!this.agent || this._ended) { seekInterval.remove(); return; }
        const dx = this.agent.x - npc.x;
        const dy = this.agent.y - npc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          seekInterval.remove();
          npc._seekingPlayer = false;
          // Arrived — speak
          this._npcSpeak(npc);
        } else {
          this._steerNPCToward(npc, this.agent.x, this.agent.y);
        }
      },
      loop: true
    });
  }

  // ── RANDOM WORLD EVENTS ───────────────────────────────────────────────────
  _triggerRandomEvent() {
    if (this._ended) return;
    const roll = Math.random();

    if (roll < 0.25) {
      // Time shifts to dusk — vision range drops
      this._timeOfDay = 'dusk';
      this._applyDusk();
      this._log('🌅 Dusk falls — Kai\'s vision narrows');
      this.time.delayedCall(12000, () => {
        this._timeOfDay = 'day';
        this._removeDusk();
      });

    } else if (roll < 0.45) {
      // Wind gust — NPCs comment
      this._weatherEvent = 'wind';
      this._showWeatherEffect('wind');
      const npc = Phaser.Utils.Array.GetRandom(this._npcs);
      if (npc) {
        this._createSpeechBubble(npc.x, npc.y - 110, 'Whoa, that wind! 💨', npc.data.color, 'neutral');
      }
      this.time.delayedCall(3000, () => { this._weatherEvent = null; });

    } else if (roll < 0.6) {
      // Rain starts — NPCs seek shelter (pathfind to bench)
      this._weatherEvent = 'rain';
      this._showWeatherEffect('rain');
      this._log('🌧 It started raining!');
      this._npcs.forEach(npc => {
        npc._seekingPlayer = false;
        npc._wanderTarget = { x: this._w * 0.63, y: this._groundY - 20 }; // bench
      });
      this.time.delayedCall(8000, () => {
        this._weatherEvent = null;
        this._weatherOverlay.clear();
        this._weatherOverlay.setAlpha(0);
      });

    } else if (roll < 0.75) {
      // Random NPC decides to approach Kai
      const npc = Phaser.Utils.Array.GetRandom(this._npcs);
      if (npc) {
        this._log(`${npc.name} is coming to find Kai...`);
        this._npcDecideToApproach(npc);
      }

    } else if (roll < 0.88) {
      // Kai hears something — perception event
      const npc = Phaser.Utils.Array.GetRandom(this._npcs);
      if (npc && this.agent) {
        const dist = Phaser.Math.Distance.Between(this.agent.x, this.agent.y, npc.x, npc.y);
        if (dist < this.HEARING_RANGE) {
          const hearLines = ['Hey Kai! Over here! 👋', 'Kai! Can you hear me?', 'Psst! Kai!'];
          const line = Phaser.Utils.Array.GetRandom(hearLines);
          this._createSpeechBubble(npc.x, npc.y - 110, line, npc.data.color, 'happy');
          this._log(`👂 Kai heard ${npc.name} calling`);
          // Kai's awareness increases when he hears someone
          this._awareness = Math.min(100, this._awareness + 8);
        }
      }
    }
    // else: nothing happens — unpredictable
  }

  // ── DUSK EFFECT ───────────────────────────────────────────────────────────
  _applyDusk() {
    const g = this._weatherOverlay;
    g.clear();
    g.fillStyle(0xff6600, 1);
    g.fillRect(0, 0, this._w, this._h);
    gsap.to(this._weatherOverlay, { alpha: 0.22, duration: 2 });
  }

  _removeDusk() {
    gsap.to(this._weatherOverlay, { alpha: 0, duration: 3 });
  }

  // ── WEATHER EFFECTS ───────────────────────────────────────────────────────
  _showWeatherEffect(type) {
    const g = this._weatherOverlay;
    g.clear();

    if (type === 'wind') {
      // Horizontal streaks
      g.lineStyle(1, 0xffffff, 0.4);
      for (let i = 0; i < 20; i++) {
        const y = Phaser.Math.Between(60, this._h);
        const len = Phaser.Math.Between(40, 120);
        g.lineBetween(Phaser.Math.Between(0, this._w), y, Phaser.Math.Between(0, this._w) + len, y);
      }
      gsap.to(this._weatherOverlay, { alpha: 0.6, duration: 0.3, yoyo: true, repeat: 3 });

    } else if (type === 'rain') {
      // Rain drops
      g.lineStyle(1, 0x93c5fd, 0.5);
      for (let i = 0; i < 60; i++) {
        const rx = Phaser.Math.Between(0, this._w);
        const ry = Phaser.Math.Between(60, this._h);
        g.lineBetween(rx, ry, rx - 3, ry + 12);
      }
      gsap.to(this._weatherOverlay, { alpha: 0.7, duration: 0.5 });
    }
  }

  // ── LEARNING: Kai remembers advice from Mom ───────────────────────────────
  _giveAdvice(npc) {
    if (this._adviceGiven || npc.id !== 'mom') return;
    this._adviceGiven = true;

    const adviceLine = 'Put the phone down. Real moments matter more. 💚';
    const bubble = this._createSpeechBubble(npc.x, npc.y - 110, adviceLine, npc.data.color, 'happy');
    npc.bubble = bubble;

    // Kai learns — store in memory
    if (this.agent && !this.agent.memory.includes('mom_advice')) {
      this.agent.memory.push('mom_advice');
      this._log('🧠 Kai learned: mom_advice — will not ignore Mom again');
    }

    // Addiction drops significantly after advice
    this._addictionLevel = Math.max(0, this._addictionLevel - 20);
    this._awareness = Math.min(100, this._awareness + 15);

    this.time.delayedCall(4000, () => {
      if (npc.bubble === bubble) {
        gsap.to(bubble, { alpha: 0, duration: 0.3, onComplete: () => bubble.destroy() });
        npc.bubble = null;
      }
    });
  }

  // ── LOG helper ────────────────────────────────────────────────────────────
  _log(msg) {
    console.log(`[RealWorld] ${msg}`);
  }

  // ── Notification Icon (clickable distraction) ─────────────────────────────
  _createNotificationIcon() {
    const { _w: W } = this;
    
    // Floating notification bell icon in top right
    this._notifIcon = this.add.container(W - 80, 80).setDepth(22).setInteractive(
      new Phaser.Geom.Circle(0, 0, 25), 
      Phaser.Geom.Circle.Contains
    );

    // Background circle
    const bg = this.add.circle(0, 0, 25, 0x6366f1, 1);
    bg.setStrokeStyle(3, 0x4f46e5, 1);

    // Bell icon (using graphics)
    const bell = this.add.graphics();
    bell.lineStyle(3, 0xffffff, 1);
    bell.fillStyle(0xffffff, 1);
    
    // Bell body
    bell.beginPath();
    bell.arc(0, -2, 10, Math.PI * 0.8, Math.PI * 0.2, false);
    bell.lineTo(8, 6);
    bell.lineTo(-8, 6);
    bell.closePath();
    bell.strokePath();
    bell.fillPath();
    
    // Bell clapper
    bell.fillCircle(0, 6, 2);
    
    // Bell top
    bell.fillCircle(0, -12, 3);

    // Notification badge (red dot)
    this._notifBadge = this.add.circle(12, -12, 6, 0xef4444, 1);
    this._notifBadge.setStrokeStyle(2, 0xffffff, 1);

    // Badge number
    const badgeNum = this.add.text(12, -12, "3", {
      fontFamily: FONT, fontSize: "10px", color: "#ffffff", fontStyle: "bold"
    }).setOrigin(0.5);

    this._notifIcon.add([bg, bell, this._notifBadge, badgeNum]);

    // Pulse animation
    this.tweens.add({
      targets: this._notifIcon,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // Click handler
    this._notifIcon.on('pointerdown', () => {
      this._onNotificationClicked();
    });

    // Hover effect
    this._notifIcon.on('pointerover', () => {
      bg.setFillStyle(0x4f46e5, 1);
      this.game.canvas.style.cursor = 'pointer';
    });

    this._notifIcon.on('pointerout', () => {
      bg.setFillStyle(0x6366f1, 1);
      this.game.canvas.style.cursor = 'default';
    });
  }

  // ── Handle notification click (distraction event) ─────────────────────────
  _onNotificationClicked() {
    // Kai gets distracted by phone
    this._phoneVisible = true;
    this._addictionLevel = Math.min(100, this._addictionLevel + 15);
    this._awareness = Math.max(0, this._awareness - 10);
    
    if (this.agent) {
      this.agent.hasPhone = true;
      this.agent.addictionLevel = this._addictionLevel;
      this.agent.awareness = this._awareness;
    }

    // Show distraction message
    const { _w: W, _h: H } = this;
    const distractMsg = this.add.container(W / 2, H / 2 - 50).setDepth(30);
    
    const msgBg = this.add.rectangle(0, 0, 400, 100, 0x6366f1, 0.95);
    msgBg.setStrokeStyle(3, 0x4f46e5, 1);
    
    const msgText = this.add.text(0, -15, "📱 New Notifications!", {
      fontFamily: FONT, fontSize: "24px", color: "#ffffff", fontStyle: "bold"
    }).setOrigin(0.5);
    
    const subText = this.add.text(0, 15, "Kai got distracted by the phone...", {
      fontFamily: FONT, fontSize: "14px", color: "#e0e7ff"
    }).setOrigin(0.5);
    
    distractMsg.add([msgBg, msgText, subText]);
    
    // Animate in
    gsap.fromTo(distractMsg, 
      { alpha: 0, scale: 0.8 }, 
      { alpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
    );
    
    // Fade out after 2 seconds
    this.time.delayedCall(2000, () => {
      gsap.to(distractMsg, {
        alpha: 0,
        duration: 0.5,
        onComplete: () => distractMsg.destroy()
      });
    });

    // NPCs react negatively
    const reactingNpc = Phaser.Utils.Array.GetRandom(this._npcs);
    if (reactingNpc && !reactingNpc.bubble) {
      this.time.delayedCall(1000, () => {
        reactingNpc.emotion = "sad";
        if (reactingNpc.emotionTag) reactingNpc.emotionTag.setText("😢");
        if (reactingNpc.drawNPC) reactingNpc.drawNPC("sad");
        
        const sadLines = [
          "Oh no, not the phone again... 😔",
          "We were having such a good time... 😢",
          "Please put it away... 🥺"
        ];
        const line = Phaser.Utils.Array.GetRandom(sadLines);
        
        const b = this._createSpeechBubble(
          reactingNpc.x, reactingNpc.y - 110,
          line,
          reactingNpc.data.color, "sad"
        );
        reactingNpc.bubble = b;
        
        this.time.delayedCall(3000, () => {
          if (reactingNpc.bubble === b) {
            gsap.to(b, { alpha: 0, duration: 0.3, onComplete: () => b.destroy() });
            reactingNpc.bubble = null;
            reactingNpc.emotion = "neutral";
            if (reactingNpc.emotionTag) reactingNpc.emotionTag.setText("😐");
            if (reactingNpc.drawNPC) reactingNpc.drawNPC("neutral");
          }
        });
      });
    }

    // Update relationships
    this._relationshipLevel = Math.max(0, this._relationshipLevel - 10);
    this._playerIgnoreCount++;

    // Shake notification icon and update badge
    this.tweens.add({
      targets: this._notifIcon,
      angle: -10,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    // Increase badge number
    const currentNum = parseInt(this._notifIcon.list[3].text) || 3;
    this._notifIcon.list[3].setText((currentNum + 2).toString());
  }

  // ── Outdoor background ────────────────────────────────────────────────────
  _drawOutdoor(width, height) {
    const g = this.add.graphics().setDepth(0);
    const groundY = height * 0.75;

    // Sky - solid light blue
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(0, 0, width, groundY);

    // Clouds
    [[0.15, 0.12], [0.4, 0.08], [0.65, 0.14]].forEach(([cx, cy]) => {
      g.fillStyle(0xffffff, 0.9);
      g.fillEllipse(width * cx, height * cy, 120, 45);
      g.fillEllipse(width * cx + 40, height * cy - 10, 90, 35);
      g.fillEllipse(width * cx - 40, height * cy + 5, 80, 30);
    });

    // Grass
    g.fillStyle(0x4ade80, 1);
    g.fillRect(0, groundY, width, height - groundY);
    g.fillStyle(0x22c55e, 1);
    g.fillRect(0, groundY, width, 12);

    // Path
    g.fillStyle(0xe8d5a3, 1);
    g.fillRect(width * 0.35, groundY, width * 0.3, height - groundY);

    // Trees
    [[0.08, 0.55], [0.92, 0.5], [0.2, 0.6], [0.78, 0.58]].forEach(([tx, ty]) => {
      g.fillStyle(0x6b4226, 1);
      g.fillRect(width * tx - 8, height * ty, 16, height * 0.2);
      g.fillStyle(0x16a34a, 1);
      g.fillCircle(width * tx, height * ty - 10, 38);
      g.fillStyle(0x15803d, 1);
      g.fillCircle(width * tx - 18, height * ty + 5, 24);
      g.fillCircle(width * tx + 18, height * ty + 5, 24);
    });

    // Bench
    g.fillStyle(0x8b6914, 1);
    g.fillRect(width * 0.6, groundY - 30, 80, 10);
    g.fillRect(width * 0.6 + 5, groundY - 20, 10, 20);
    g.fillRect(width * 0.6 + 65, groundY - 20, 10, 20);

    // Flowers
    [[0.25, 0.76], [0.45, 0.77], [0.7, 0.76], [0.82, 0.77]].forEach(([fx, fy]) => {
      g.fillStyle(0xfbbf24, 1);
      g.fillCircle(width * fx, height * fy, 5);
      g.fillStyle(0xef4444, 0.8);
      g.fillCircle(width * fx + 10, height * fy + 3, 4);
      g.fillStyle(0xa78bfa, 0.8);
      g.fillCircle(width * fx - 8, height * fy + 5, 4);
    });
  }

  // ── Spawn NPC — drawn with same style as Agent._drawCharacter ───────────
  _spawnNPC(data, width, height) {
    const x = width * data.x;
    const y = height * data.y;

    // NPC shirt colors per character
    const shirtColors = { mom: 0xe879a0, friend: 0x0ea5e9, sibling: 0x16a34a };
    const pantsColors = { mom: 0x9d174d, friend: 0x0c4a6e, sibling: 0x14532d };
    const shirt = shirtColors[data.id] || 0x6366f1;
    const pants = pantsColors[data.id] || 0x1e3a5f;

    const S = 2.2; // slightly smaller than Kai (2.8)
    const g = this.add.graphics().setDepth(8);

    const drawNPC = (emotion) => {
      g.clear();

      // Shadow
      g.fillStyle(0x000000, 0.15);
      g.fillEllipse(x, y + 40 * S * 0.36, 44, 10);

      // ── MOM: Draw dress instead of pants ──────────────────────────────
      if (data.id === 'mom') {
        // Shoes (smaller, more feminine)
        g.fillStyle(0x8b4513, 1);
        g.fillRoundedRect(x + 4 * S, y + (28 - 2) * S, 8 * S, 4 * S, 2);
        g.fillRoundedRect(x - 12 * S, y + (28 + 2) * S, 8 * S, 4 * S, 2);

        // Dress - A-line skirt shape
        g.fillStyle(shirt, 1);
        // Upper dress (fitted)
        g.fillRoundedRect(x - 13 * S, y - 8 * S, 26 * S, 12 * S, 4);
        // Skirt (flared)
        g.beginPath();
        g.moveTo(x - 13 * S, y + 4 * S);
        g.lineTo(x - 18 * S, y + 24 * S);
        g.lineTo(x + 18 * S, y + 24 * S);
        g.lineTo(x + 13 * S, y + 4 * S);
        g.closePath();
        g.fillPath();
        
        // Dress pattern/detail
        g.fillStyle(0xffffff, 0.2);
        g.fillCircle(x - 6 * S, y + 0 * S, 2 * S);
        g.fillCircle(x + 6 * S, y + 0 * S, 2 * S);
        g.fillCircle(x, y + 12 * S, 2 * S);
        
        // Collar (V-neck)
        g.fillStyle(0xf5c5a3, 1);
        g.fillTriangle(x - 4 * S, y - 8 * S, x + 4 * S, y - 8 * S, x, y - 1 * S);
      } else {
        // Regular shoes for others
        g.fillStyle(0x111827, 1);
        g.fillRoundedRect(x + 4 * S, y + (28 - 2) * S, 9 * S, 5 * S, 2);
        g.fillRoundedRect(x - 13 * S, y + (28 + 2) * S, 9 * S, 5 * S, 2);

        // Legs
        g.fillStyle(pants, 1);
        g.fillRoundedRect(x + 5 * S, y + 10 * S, 7 * S, 18 * S, 2);
        g.fillRoundedRect(x - 12 * S, y + 10 * S, 7 * S, 18 * S, 2);

        // Body
        g.fillStyle(shirt, 1);
        g.fillRoundedRect(x - 13 * S, y - 8 * S, 26 * S, 20 * S, 4);

        // Collar
        g.fillStyle(0xf5c5a3, 1);
        g.fillTriangle(x - 3 * S, y - 8 * S, x + 3 * S, y - 8 * S, x, y - 2 * S);
      }

      // Arms
      g.fillStyle(shirt, 1);
      g.fillRoundedRect(x + 13 * S, y - 6 * S, 6 * S, 16 * S, 2);
      g.fillRoundedRect(x - 19 * S, y - 6 * S, 6 * S, 16 * S, 2);

      // Hands
      g.fillStyle(0xf5c5a3, 1);
      g.fillCircle(x + 16 * S, y + 10 * S, 4 * S);
      g.fillCircle(x - 16 * S, y + 10 * S, 4 * S);

      // Neck
      g.fillStyle(0xf5c5a3, 1);
      g.fillRect(x - 3 * S, y - 14 * S, 6 * S, 8 * S);

      // Head
      g.fillStyle(0xf5c5a3, 1);
      g.fillEllipse(x, y - 26 * S, 24 * S, 26 * S);

      // Ears
      g.fillStyle(0xf5c5a3, 1);
      g.fillEllipse(x - 12 * S, y - 24 * S, 5 * S, 7 * S);
      g.fillEllipse(x + 12 * S, y - 24 * S, 5 * S, 7 * S);

      // ── HAIR: Different styles per character (NO SPIKES) ──────────────
      g.fillStyle(0x3d2314, 1);
      
      if (data.id === 'mom') {
        // Mom: Longer, wavy feminine hair (moved up slightly)
        // Back hair (longer)
        g.fillEllipse(x, y - 42 * S, 28 * S, 16 * S);
        g.fillRect(x - 14 * S, y - 46 * S, 28 * S, 20 * S);
        // Top smooth
        g.fillEllipse(x, y - 45 * S, 26 * S, 12 * S);
        // Side waves
        g.fillEllipse(x - 14 * S, y - 34 * S, 8 * S, 16 * S);
        g.fillEllipse(x + 14 * S, y - 34 * S, 8 * S, 16 * S);
        // Bangs (smooth, no spikes)
        g.fillEllipse(x - 8 * S, y - 40 * S, 6 * S, 8 * S);
        g.fillEllipse(x, y - 41 * S, 8 * S, 8 * S);
        g.fillEllipse(x + 8 * S, y - 40 * S, 6 * S, 8 * S);
        
        // Small flower on hair (right side)
        g.fillStyle(0xff69b4, 1); // Pink flower
        g.fillCircle(x + 10 * S, y - 42 * S, 3 * S);
        // Flower petals
        g.fillCircle(x + 8 * S, y - 42 * S, 2 * S);
        g.fillCircle(x + 12 * S, y - 42 * S, 2 * S);
        g.fillCircle(x + 10 * S, y - 40 * S, 2 * S);
        g.fillCircle(x + 10 * S, y - 44 * S, 2 * S);
        // Flower center
        g.fillStyle(0xffd700, 1); // Yellow center
        g.fillCircle(x + 10 * S, y - 42 * S, 1.5 * S);
      } else {
        // Others: Short hair (NO SPIKES - smooth rounded style)
        g.fillEllipse(x, y - 40 * S, 26 * S, 14 * S);
        g.fillRect(x - 12 * S, y - 44 * S, 24 * S, 16 * S);
        g.fillEllipse(x, y - 43 * S, 22 * S, 10 * S);
        // Smooth rounded bangs instead of spikes
        g.fillEllipse(x - 8 * S, y - 40 * S, 6 * S, 6 * S);
        g.fillEllipse(x - 2 * S, y - 41 * S, 6 * S, 6 * S);
        g.fillEllipse(x + 4 * S, y - 40 * S, 6 * S, 6 * S);
        // Side hair
        g.fillEllipse(x - 13 * S, y - 34 * S, 6 * S, 12 * S);
        g.fillEllipse(x + 13 * S, y - 34 * S, 6 * S, 12 * S);
      }

      // Eyebrows
      g.lineStyle(2.5 * S * 0.4, 0x3d2314, 1);
      if (emotion === 'angry') {
        g.beginPath(); g.moveTo(x - 10 * S, y - 30 * S); g.lineTo(x - 4 * S, y - 28 * S); g.strokePath();
        g.beginPath(); g.moveTo(x + 10 * S, y - 30 * S); g.lineTo(x + 4 * S, y - 28 * S); g.strokePath();
      } else if (emotion === 'happy') {
        g.beginPath(); g.moveTo(x - 10 * S, y - 29 * S); g.lineTo(x - 4 * S, y - 31 * S); g.strokePath();
        g.beginPath(); g.moveTo(x + 10 * S, y - 29 * S); g.lineTo(x + 4 * S, y - 31 * S); g.strokePath();
      } else {
        g.beginPath(); g.moveTo(x - 10 * S, y - 30 * S); g.lineTo(x - 4 * S, y - 30 * S); g.strokePath();
        g.beginPath(); g.moveTo(x + 10 * S, y - 30 * S); g.lineTo(x + 4 * S, y - 30 * S); g.strokePath();
      }

      // Eye whites
      g.fillStyle(0xffffff, 1);
      g.fillEllipse(x - 6 * S, y - 25 * S, 8 * S, 7 * S);
      g.fillEllipse(x + 6 * S, y - 25 * S, 8 * S, 7 * S);

      // Iris — color changes with emotion
      const irisColor = emotion === 'angry' ? 0xdc2626 : emotion === 'sad' ? 0x60a5fa : 0x1e3a5f;
      g.fillStyle(irisColor, 1);
      g.fillCircle(x - 6 * S, y - 25 * S, 2.6 * S);
      g.fillCircle(x + 6 * S, y - 25 * S, 2.6 * S);

      // Pupils
      g.fillStyle(0x000000, 1);
      g.fillCircle(x - 6 * S, y - 25 * S, 1.3 * S);
      g.fillCircle(x + 6 * S, y - 25 * S, 1.3 * S);

      // Eye shine
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(x - 5 * S, y - 26 * S, 1.2 * S);
      g.fillCircle(x + 7 * S, y - 26 * S, 1.2 * S);

      // Nose
      g.lineStyle(1.2, 0xc8845a, 0.6);
      g.beginPath();
      g.moveTo(x - 1.5 * S, y - 20 * S);
      g.lineTo(x - 2.5 * S, y - 17 * S);
      g.lineTo(x + 2.5 * S, y - 17 * S);
      g.strokePath();

      // Mouth
      g.lineStyle(1.8 * S * 0.4, 0x8b4513, 1);
      if (emotion === 'happy') {
        g.beginPath(); g.arc(x, y - 14 * S, 4 * S, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false); g.strokePath();
        // Blush
        g.fillStyle(0xfca5a5, 0.25);
        g.fillEllipse(x - 9 * S, y - 21 * S, 7 * S, 4 * S);
        g.fillEllipse(x + 9 * S, y - 21 * S, 7 * S, 4 * S);
      } else if (emotion === 'angry' || emotion === 'sad') {
        g.beginPath(); g.arc(x, y - 14 * S, 4 * S, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false); g.strokePath();
      } else {
        g.beginPath(); g.moveTo(x - 3 * S, y - 15 * S); g.lineTo(x + 3 * S, y - 15 * S); g.strokePath();
      }
    };

    drawNPC(data.emotion);

    // Name tag and emotion indicator — REMOVED for cleaner Real World scene
    // NPCs are identified through interaction and speech bubbles only
    const nameTag = null;
    const emotionTag = null;

    const npc = {
      id: data.id, name: data.name, x, y, g, nameTag, emotionTag,
      data, emotion: data.emotion, lineIndex: 0, bubble: null,
      drawNPC  // store so we can redraw on emotion change
    };
    this._npcs.push(npc);
  }

  // ── Spawn player using the real Agent class ──────────────────────────────
  _spawnPlayer(width, height) {
    const x = width * 0.5;
    const y = height * 0.70; // Same level as NPCs

    this.agent = new Agent(this, x, y);

    // Carry over state from Scenario 1
    this.agent.addictionLevel    = this._addictionLevel;
    this.agent.awareness         = this._awareness;
    this.agent.relationshipLevel = this._relationshipLevel;
    this.agent.hasPhone          = this._hasPhone || this._addictionLevel > 30;
    this.agent.memory            = [...this._memory];

    // Set FSM state based on addiction level
    if (this._addictionLevel > 70) {
      this.agent.fsm.forceState('LOOPING');
    } else if (this._addictionLevel > 40) {
      this.agent.fsm.forceState('ATTRACTED');
    } else {
      this.agent.fsm.forceState('IDLE');
    }

    // Hunch based on addiction
    this.agent.hunchLevel = Math.floor(this._addictionLevel / 25);
  }

  _buildHUD(width, height) {
    // HUD removed — metrics tracked internally only
  }

  _updateHUD() {
    if (this._awBar)  this._awBar.width  = (this._awareness / 100) * 60;
    if (this._adBar)  this._adBar.width  = (this._addictionLevel / 100) * 60;
    if (this._relBar) this._relBar.width = (this._relationshipLevel / 100) * 60;

    // Agent Status HUD removed for cleaner interface
    // Metrics are still tracked internally but not displayed
    // Removed return statement to keep HUD update functionality
  }

  // ── Player movement — delegated to Agent ─────────────────────────────────
  _handlePlayerMovement() {
    if (this.agent) {
      this.agent.update();
      // Sync local vars for proximity checks
      this._playerX = this.agent.x;
      this._playerY = this.agent.y;
    }
  }

  // ── Proximity: player near NPC triggers speech (only if perceived) ─────────
  _updatePlayerProximity() {
    this._npcs.forEach(npc => {
      const dx = npc.x - this._playerX;
      const dy = npc.y - this._playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only show interact prompt if NPC is perceived (in vision or hearing range)
      const canInteract = dist < 90 && npc._perceived;

      if (canInteract && !npc._interactPrompt) {
        this._showInteractPrompt(npc);
      } else if (!canInteract && npc._interactPrompt) {
        this._hideInteractPrompt(npc);
      }
    });
  }

  _showInteractPrompt(npc) {
    if (npc._interactPrompt) return;

    const prompt = this.add.container(npc.x, npc.y - 80).setDepth(15);
    const bg = this.add.rectangle(0, 0, 130, 32, 0x14532d, 0.95);
    bg.setStrokeStyle(2, 0x4ade80, 1);
    const txt = this.add.text(0, 0, "Press [T] to talk", {
      fontFamily: FONT, fontSize: "12px", color: "#ffffff"
    }).setOrigin(0.5);
    prompt.add([bg, txt]);

    npc._interactPrompt = prompt;

    // Register T key for this NPC (only fires if conversation is not active)
    npc._talkKey = this.input.keyboard.on("keydown-T", () => {
      if (this._convTHandler) return; // conversation in progress — ignore proximity talk
      const dx = npc.x - this._playerX;
      const dy = npc.y - this._playerY;
      if (Math.sqrt(dx * dx + dy * dy) < 90) {
        this._npcSpeak(npc);
      }
    });
  }

  _hideInteractPrompt(npc) {
    if (npc._interactPrompt) {
      npc._interactPrompt.destroy();
      npc._interactPrompt = null;
    }
    if (npc._talkKey) {
      this.input.keyboard.off("keydown-T", npc._talkKey);
      npc._talkKey = null;
    }
  }

  // ── NPC Speech Bubble (Natural Language Communication) ────────────────────
  _npcSpeak(npc) {
    // ── LEARNING: Skip NPC Kai decided to avoid ───────────────────────────
    if (this._avoidedNPC === npc.id) {
      this._log(`🧠 Kai remembers avoiding ${npc.name} — walking away`);
      return;
    }

    // Dismiss existing bubble
    if (npc.bubble) { npc.bubble.destroy(); npc.bubble = null; }

    // ── LEARNING: Mom gives advice once if addiction is high ──────────────
    if (npc.id === 'mom' && this._addictionLevel > 60 && !this._adviceGiven) {
      this._giveAdvice(npc);
      return;
    }

    // ── LEARNING: Kai already spoke to this NPC — uses remembered context ─
    const isReturningVisit = this._learnedNPCs.has(npc.id);

    // ── Emotional Intelligence: NPC reacts to phone addiction ─────────────
    let line;
    if (this._phoneVisible && this._addictionLevel > 50) {
      npc.emotion = this._addictionLevel > 75 ? "angry" : "sad";
      const angryLines = npc.data.angryLines;
      line = angryLines[Math.floor(Math.random() * angryLines.length)];
      this._playerIgnoreCount++;
      this._addictionLevel = Math.min(100, this._addictionLevel + 3);
      this._relationshipLevel = Math.max(0, this._relationshipLevel - 8);

      // ── LEARNING: After 2 bad interactions with same NPC, Kai avoids them
      npc._badInteractions = (npc._badInteractions || 0) + 1;
      if (npc._badInteractions >= 2 && npc.id !== 'mom') {
        this._avoidedNPC = npc.id;
        this._log(`🧠 Kai learned: avoid ${npc.name} after repeated conflict`);
        if (this.agent) this.agent.memory.push(`avoid_${npc.id}`);
      }
    } else {
      npc.emotion = "happy";
      // Returning visit — NPC acknowledges it
      if (isReturningVisit) {
        const returnLines = [
          `Good to see you again, Kai! 😊`,
          `You came back! That means a lot.`,
          `Kai! Glad you are still here with us.`
        ];
        line = Phaser.Utils.Array.GetRandom(returnLines);
      } else {
        line = npc.data.lines[npc.lineIndex % npc.data.lines.length];
        npc.lineIndex++;
      }
      this._playerEngageCount++;
      this._awareness = Math.min(100, this._awareness + 5);
      this._relationshipLevel = Math.min(100, this._relationshipLevel + 6);
      this._addictionLevel = Math.max(0, this._addictionLevel - 4);
      // ── LEARNING: Remember this NPC ──────────────────────────────────────
      this._learnedNPCs.add(npc.id);
    }

    // Update emotion emoji + redraw NPC face
    const emotionEmoji = { happy: "😊", neutral: "😐", angry: "😠", sad: "😢" };
    if (npc.emotionTag) npc.emotionTag.setText(emotionEmoji[npc.emotion] || "😐");
    if (npc.drawNPC) npc.drawNPC(npc.emotion);

    // Build speech bubble (positioned well above NPC to not cover them)
    const bubble = this._createSpeechBubble(npc.x, npc.y - 110, line, npc.data.color, npc.emotion);
    npc.bubble = bubble;

    // Auto-dismiss after 3.5s
    this.time.delayedCall(3500, () => {
      if (npc.bubble === bubble) {
        gsap.to(bubble, { alpha: 0, duration: 0.3, onComplete: () => bubble.destroy() });
        npc.bubble = null;
        npc.emotion = "neutral";
        if (npc.emotionTag) npc.emotionTag.setText("😐");
        if (npc.drawNPC) npc.drawNPC("neutral");
      }
    });

    // ── EMOTIONAL INTELLIGENCE: NPCs respond to each other's emotions ────
    if (npc.emotion === "angry") {
      // When one NPC is angry, others show concern and try to help
      this._npcs.forEach(other => {
        if (other.id !== npc.id && !other.bubble) {
          this.time.delayedCall(800, () => {
            other.emotion = "sad";
            if (other.emotionTag) other.emotionTag.setText("😢");
            if (other.drawNPC) other.drawNPC("sad");
            
            // Different NPCs respond differently based on their relationship
            const supportLines = {
              mom: "Honey, I understand you're upset. Let's talk about it. 💚",
              friend: "Hey, I'm here for you. What's wrong? 🤝",
              sibling: "Are you okay? I'm worried about you... 😟"
            };
            const supportLine = supportLines[other.id] || "Are you okay? 😟";
            
            const b = this._createSpeechBubble(other.x, other.y - 110, supportLine, other.data.color, "sad");
            other.bubble = b;
            
            this.time.delayedCall(2500, () => {
              if (other.bubble === b) {
                gsap.to(b, { alpha: 0, duration: 0.3, onComplete: () => b.destroy() });
                other.bubble = null;
                other.emotion = "neutral";
                if (other.emotionTag) other.emotionTag.setText("😐");
                if (other.drawNPC) other.drawNPC("neutral");
              }
            });
          });
        }
      });
      
      // After others show support, angry NPC calms down
      this.time.delayedCall(3500, () => {
        if (npc.emotion === "angry") {
          npc.emotion = "sad";
          if (npc.emotionTag) npc.emotionTag.setText("😢");
          if (npc.drawNPC) npc.drawNPC("sad");
          
          // NPC acknowledges the support
          if (npc.bubble) npc.bubble.destroy();
          const calmLine = "Thanks for understanding... I just feel ignored sometimes. 😔";
          const b = this._createSpeechBubble(npc.x, npc.y - 110, calmLine, npc.data.color, "sad");
          npc.bubble = b;
          
          this.time.delayedCall(3000, () => {
            if (npc.bubble === b) {
              gsap.to(b, { alpha: 0, duration: 0.3, onComplete: () => b.destroy() });
              npc.bubble = null;
              npc.emotion = "neutral";
              if (npc.emotionTag) npc.emotionTag.setText("😐");
              if (npc.drawNPC) npc.drawNPC("neutral");
            }
          });
        }
      });
    }
    
    // ── EMOTIONAL INTELLIGENCE: Happy emotions are contagious ─────────────
    if (npc.emotion === "happy" && this._playerEngageCount > 0) {
      this._npcs.forEach(other => {
        if (other.id !== npc.id && other.emotion !== "angry") {
          this.time.delayedCall(600, () => {
            if (!other.bubble) {
              other.emotion = "happy";
              if (other.emotionTag) other.emotionTag.setText("😊");
              if (other.drawNPC) other.drawNPC("happy");
              
              // Reset after a moment
              this.time.delayedCall(2500, () => {
                if (!other.bubble && other.emotion === "happy") {
                  other.emotion = "neutral";
                  if (other.emotionTag) other.emotionTag.setText("😐");
                  if (other.drawNPC) other.drawNPC("neutral");
                }
              });
            }
          });
        }
      });
    }
  }

  // ── Speech bubble factory (positioned near NPC with gap above head) ──────
  _createSpeechBubble(x, y, text, color, emotion) {
    // Position bubble above the NPC with a gap (y is already NPC.y - 110)
    const container = this.add.container(x, y).setDepth(20);

    const maxW = 280;
    const padding = 14;

    // Measure text
    const tempTxt = this.add.text(0, 0, text, {
      fontFamily: FONT, fontSize: "14px",
      wordWrap: { width: maxW - padding * 2 }
    });
    const tw = Math.min(tempTxt.width + padding * 2, maxW);
    const th = tempTxt.height + padding * 2;
    tempTxt.destroy();

    // Emotion-based border color
    const borderColors = { happy: 0x4ade80, neutral: 0x94a3b8, angry: 0xef4444, sad: 0x60a5fa };
    const borderColor = borderColors[emotion] || color;

    // Bubble background
    const bg = this.add.rectangle(0, 0, tw, th, 0xffffff, 0.98);
    bg.setStrokeStyle(3, borderColor, 1);

    // Emotion accent strip on left
    const strip = this.add.rectangle(-tw / 2 + 4, 0, 6, th, borderColor, 1);

    // Text
    const txt = this.add.text(-tw / 2 + padding + 4, 0, text, {
      fontFamily: FONT, fontSize: "14px", color: "#1e1b4b",
      wordWrap: { width: tw - padding * 2 - 8 }
    }).setOrigin(0, 0.5);

    // Tail pointing down to NPC
    const tail = this.add.graphics();
    tail.fillStyle(0xffffff, 0.98);
    tail.beginPath();
    tail.moveTo(-8, th / 2);
    tail.lineTo(0, th / 2 + 12);
    tail.lineTo(8, th / 2);
    tail.closePath();
    tail.fillPath();
    tail.lineStyle(3, borderColor, 1);
    tail.beginPath();
    tail.moveTo(-8, th / 2);
    tail.lineTo(0, th / 2 + 12);
    tail.lineTo(8, th / 2);
    tail.strokePath();

    container.add([tail, bg, strip, txt]);

    // Animate in
    container.setAlpha(0).setScale(0.9);
    gsap.to(container, { alpha: 1, duration: 0.3, ease: "power2.out" });
    this.tweens.add({
      targets: container, scaleX: 1, scaleY: 1, duration: 300, ease: "Back.easeOut"
    });

    return container;
  }

  // ── Greeting sequence — T key advances one message at a time ────────────
  _startGreetings() {
    const conversation = [
      { npc: "mom",     text: "Hey everyone! It's such a beautiful day outside! 😊", emotion: "happy" },
      { npc: "sibling", text: "Yeah! Can we do something fun together?",               emotion: "happy" },
      { npc: "friend",  text: "I'm down for anything! What do you guys want to do?",   emotion: "happy" },
      { npc: "mom",     text: "How about we go on a trip? We could drive to the lake!", emotion: "happy" },
      { npc: "sibling", text: "Yes! Road trip! Can we pick up more friends on the way?", emotion: "happy" },
      { npc: "friend",  text: "That sounds awesome! I'll bring snacks! 🎉",            emotion: "happy" },
      { npc: "mom",     text: "Perfect! Let's get ready and head to the car! 🚗",      emotion: "happy" },
    ];

    let index = 0;
    let waiting = false; // true while a message is displayed, waiting for T

    // Hint text at bottom
    this._convHint = this.add.text(this._w / 2, this._h - 40,
      `Press [T] to start conversation  (0/${conversation.length})`, {
        fontFamily: FONT, fontSize: "14px", color: "#ffffff",
        backgroundColor: "#00000088", padding: { x: 12, y: 6 }
      }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: this._convHint, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

    const clearAllBubbles = () => {
      this._npcs.forEach(n => {
        if (n.bubble) {
          n.bubble.destroy();
          n.bubble = null;
        }
      });
    };

    const showMessage = (i) => {
      if (this._ended) return;
      clearAllBubbles();

      const { npc: npcId, text, emotion } = conversation[i];
      const npc = this._npcs.find(n => n.id === npcId);
      if (!npc) return;

      const bubble = this._createSpeechBubble(npc.x, npc.y - 110, text, npc.data.color, emotion);
      npc.bubble = bubble;
      npc.emotion = emotion;
      if (npc.drawNPC) npc.drawNPC(emotion);

      if (this._convHint) {
        this._convHint.setText(`Press [T] for next  (${i + 1}/${conversation.length})`);
      }

      waiting = true;
    };

    // Single T key handler — only active during this conversation
    const onT = () => {
      if (this._ended) return;

      if (!waiting && index === 0) {
        // First press — show first message
        showMessage(index);
        index++;
        return;
      }

      if (waiting) {
        // Advance to next
        if (index < conversation.length) {
          showMessage(index);
          index++;
        } else {
          // All done — clear and walk
          waiting = false;
          clearAllBubbles();
          if (this._convHint) { this._convHint.destroy(); this._convHint = null; }
          this.input.keyboard.off("keydown-T", onT);
          this.time.delayedCall(400, () => {
            if (!this._ended) this._agentWalkToRoad();
          });
        }
      }
    };

    this.input.keyboard.on("keydown-T", onT);
    // Store reference so _showInteractPrompt T key doesn't conflict
    this._convTHandler = onT;
  }

  // ── Agent and NPCs walk to road together ──────────────────────────────────
  _agentWalkToRoad() {
    if (!this.agent) return;

    // Lock player controls during automatic walk
    this.agent.keysLocked = true;

    const targetY = this._h - 100; // Bottom of screen (road side)

    // Calculate positions for everyone in a group
    const groupCenterX = this._w / 2;
    const spacing = 80; // Space between characters
    
    // Positions: Mom (left), Kai (center), Friend (right of Kai), Sibling (far right)
    const positions = [
      { x: groupCenterX - spacing * 1.5, y: targetY }, // Mom (leftmost)
      { x: groupCenterX - spacing * 0.5, y: targetY }, // Kai (center-left)
      { x: groupCenterX + spacing * 0.5, y: targetY }, // Friend (center-right)
      { x: groupCenterX + spacing * 1.5, y: targetY }  // Sibling (rightmost)
    ];

    // Kai's target position (center-left)
    const kaiTarget = positions[1];

    // Show message
    this._createSpeechBubble(this.agent.x, this.agent.y - 110, "Let's all go to the car! 🚗", 0x4ade80, "happy");

    // Calculate duration based on distance
    const distance = Phaser.Math.Distance.Between(this.agent.x, this.agent.y, kaiTarget.x, kaiTarget.y);
    const walkSpeed = 2;
    const duration = (distance / walkSpeed) * 16.67;

    // Animate Kai walking
    this.tweens.add({
      targets: this.agent,
      x: kaiTarget.x,
      y: kaiTarget.y,
      duration: duration,
      ease: "Linear",
      onUpdate: () => {
        this.agent._moving = true;
        this.agent._walkCycle += 0.18;
        
        if (kaiTarget.x > this.agent.x) {
          this.agent._facingRight = true;
        } else if (kaiTarget.x < this.agent.x) {
          this.agent._facingRight = false;
        }

        this.agent.container.setPosition(this.agent.x, this.agent.y);
        this.agent.container.setScale(this.agent._facingRight ? 1 : -1, 1 - this.agent.hunchLevel * 0.06);
        this.agent._shadow.setPosition(this.agent.x, this.agent.y + 52);
        this.agent._glow.setPosition(this.agent.x, this.agent.y);
        this.agent.perceptionRing.setPosition(this.agent.x, this.agent.y);
      },
      onComplete: () => {
        this.agent._moving = false;
      }
    });

    // Animate all NPCs walking to their positions
    this._npcs.forEach((npc, index) => {
      // Assign positions: mom=0, friend=2, sibling=3
      let targetPos;
      if (npc.id === 'mom') {
        targetPos = positions[0]; // Leftmost
      } else if (npc.id === 'friend') {
        targetPos = positions[2]; // Center-right
      } else if (npc.id === 'sibling') {
        targetPos = positions[3]; // Rightmost
      }

      if (!targetPos) return;

      const npcDistance = Phaser.Math.Distance.Between(npc.x, npc.y, targetPos.x, targetPos.y);
      const npcDuration = (npcDistance / walkSpeed) * 16.67;

      // Stop any existing wander behavior
      npc._seekingPlayer = false;
      npc._wanderTimer = 0;

      // Show excited emotion
      npc.emotion = "happy";
      if (npc.emotionTag) npc.emotionTag.setText("😊");
      if (npc.drawNPC) npc.drawNPC("happy");

      // Animate NPC walking
      this.tweens.add({
        targets: npc,
        x: targetPos.x,
        y: targetPos.y,
        duration: npcDuration,
        ease: "Linear",
        onUpdate: () => {
          // Update NPC visuals during walk
          if (npc.drawNPC) npc.drawNPC(npc.emotion);
          if (npc.nameTag) npc.nameTag.setPosition(npc.x, npc.nameTag.y);
          if (npc.emotionTag) npc.emotionTag.setPosition(npc.x + 30, npc.emotionTag.y);
        }
      });

      // NPCs say excited things while walking
      const excitedLines = [
        "This is going to be so fun! 😊",
        "Can't wait! 🎉",
        "Road trip time! 🚗",
        "Let's go! 💚"
      ];
      
      this.time.delayedCall(500 + index * 800, () => {
        if (npc.bubble) npc.bubble.destroy();
        const line = Phaser.Utils.Array.GetRandom(excitedLines);
        const bubble = this._createSpeechBubble(npc.x, npc.y - 110, line, npc.data.color, "happy");
        npc.bubble = bubble;
        
        this.time.delayedCall(2500, () => {
          if (npc.bubble === bubble) {
            gsap.to(bubble, { alpha: 0, duration: 0.3, onComplete: () => bubble.destroy() });
            npc.bubble = null;
          }
        });
      });
    });

    // Wait for everyone to arrive, then transition
    this.time.delayedCall(duration + 1000, () => {
      this._transitionToTrip();
    });
  }

  // ── Transition to trip scene ──────────────────────────────────────────────
  _transitionToTrip() {
    if (this._ended) return;
    this._ended = true;

    this.time.delayedCall(500, () => {
      this.scene.start("TripScene", {
        addictionLevel: this._addictionLevel,
        awareness: this._awareness,
        relationshipLevel: this._relationshipLevel
      });
    });
  }

  // ── Phone pull-back event ─────────────────────────────────────────────────
  _phonePullEvent() {
    if (this._ended || !this._phoneVisible) return;

    const pullMessages = [
      "📱 3 new notifications!",
      "📱 Mia posted something!",
      "📱 You have unread messages",
      "📱 Trending now: check it out!",
      "📱 Your post got 10 likes!",
    ];

    const msg = Phaser.Utils.Array.GetRandom(pullMessages);

    // Show notification above player
    if (this._phoneNotifText) {
      const px = this.agent ? this.agent.x : this._playerX;
      const py = this.agent ? this.agent.y : this._playerY;
      this._phoneNotifText.setText(msg);
      this._phoneNotifText.setPosition(px - 60, py - 100);
      this._phoneNotifText.setAlpha(1);

      this.tweens.add({
        targets: this._phoneNotifText,
        y: py - 130,
        alpha: 0,
        duration: 2500,
        ease: "Sine.easeOut"
      });
    }

    // Slightly increase addiction
    this._addictionLevel = Math.min(100, this._addictionLevel + 2);

    // NPCs react if addiction is high
    if (this._addictionLevel > 60) {
      const reactingNpc = Phaser.Utils.Array.GetRandom(this._npcs);
      if (reactingNpc && !reactingNpc.bubble) {
        reactingNpc.emotion = "sad";
        if (reactingNpc.emotionTag) reactingNpc.emotionTag.setText("😢");
        if (reactingNpc.drawNPC) reactingNpc.drawNPC("sad");
        const b = this._createSpeechBubble(
          reactingNpc.x, reactingNpc.y - 110,
          "You are on your phone again... 😔",
          reactingNpc.data.color, "sad"
        );
        reactingNpc.bubble = b;
        this.time.delayedCall(3000, () => {
          if (reactingNpc.bubble === b) {
            gsap.to(b, { alpha: 0, duration: 0.3, onComplete: () => b.destroy() });
            reactingNpc.bubble = null;
            reactingNpc.emotion = "neutral";
            if (reactingNpc.emotionTag) reactingNpc.emotionTag.setText("😐");
          }
        });
      }
    }
  }

  // ── End scene — multiple endings based on behavior ───────────────────────
  _endScene() {
    if (this._ended) return;
    this._ended = true;

    const { _w: W, _h: H } = this;

    // ── DECISION: Determine ending from accumulated behavior ──────────────
    let outcome;
    const learnedAdvice  = this.agent && this.agent.memory.includes('mom_advice');
    const highRelation   = this._relationshipLevel >= 70;
    const lowAddiction   = this._addictionLevel < 30;
    const manyConversations = this._playerEngageCount >= 3;

    if (learnedAdvice && lowAddiction && highRelation) {
      outcome = { title: "🌿 Full Recovery!", color: 0x4ade80,
        sub: "Kai put the phone down and reconnected with the real world." };
    } else if (manyConversations && highRelation) {
      outcome = { title: "💚 Real Connection Made", color: 0x86efac,
        sub: "Kai chose people over the screen." };
    } else if (this._playerIgnoreCount >= 3) {
      outcome = { title: "📱 Still Distracted...", color: 0xfbbf24,
        sub: "The phone kept pulling Kai back. Relationships suffered." };
    } else if (this._avoidedNPC) {
      outcome = { title: "😔 Bridges Burned", color: 0xef4444,
        sub: `Kai avoided ${this._avoidedNPC} after repeated conflict.` };
    } else {
      outcome = { title: "🤔 Uncertain Path", color: 0x94a3b8,
        sub: "Kai is still figuring out the balance." };
    }

    // Show outcome card
    const card = this.add.container(W / 2, H / 2).setDepth(50);
    const bg = this.add.rectangle(0, 0, 520, 140, 0x000000, 0.92);
    bg.setStrokeStyle(3, outcome.color, 1);
    const title = this.add.text(0, -28, outcome.title, {
      fontFamily: FONT, fontSize: "28px", fontStyle: "bold",
      color: "#" + outcome.color.toString(16).padStart(6, "0")
    }).setOrigin(0.5);
    const sub = this.add.text(0, 16, outcome.sub, {
      fontFamily: FONT, fontSize: "14px", color: "#e2e8f0",
      wordWrap: { width: 480 }, align: "center"
    }).setOrigin(0.5);

    // Memory summary
    const memSummary = this.agent && this.agent.memory.length > 0
      ? `🧠 Learned: ${this.agent.memory.join(', ')}`
      : '';
    const memTxt = this.add.text(0, 50, memSummary, {
      fontFamily: FONT, fontSize: "11px", color: "#64748b"
    }).setOrigin(0.5);

    card.add([bg, title, sub, memTxt]);

    gsap.fromTo(card, { alpha: 0, scale: 0.8 }, { alpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" });

    this.time.delayedCall(2000, () => {
      this.scene.start("BootScene");
    });
  }
}
