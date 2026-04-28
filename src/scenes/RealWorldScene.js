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
    y: 0.62,
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
    y: 0.65,
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
    y: 0.68,
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

    this.cameras.main.fadeIn(800, 255, 240, 200);

    // ── Background: warm outdoor park ────────────────────────────────────
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

    // ── Vision cone graphics (drawn each frame) ───────────────────────────
    this._visionGfx = this.add.graphics().setDepth(6).setAlpha(0.12);

    // ── Phone in hand (if carried) ────────────────────────────────────────
    if (this._hasPhone || this._addictionLevel > 30) {
      this._phoneVisible = true;
      this._phoneNotifText = this.add.text(0, 0, "", {
        fontFamily: FONT, fontSize: "12px", color: "#ffffff",
        backgroundColor: "#6366f1dd", padding: { x: 8, y: 4 }
      }).setDepth(15).setAlpha(0);
    }

    // ── Awareness HUD ─────────────────────────────────────────────────────
    this._buildHUD(width, height);

    // ── Weather / time-of-day overlay (drawn on top) ──────────────────────
    this._weatherOverlay = this.add.graphics().setDepth(18).setAlpha(0);

    // ── Start NPC greeting sequence ───────────────────────────────────────
    this.time.delayedCall(1200, () => this._startGreetings());

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

    // Draw cone
    g.fillStyle(0xffd700, 1);
    g.beginPath();
    g.moveTo(ax, ay);
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const a = (facingAngle - halfCone) + (i / steps) * (halfCone * 2);
      g.lineTo(ax + Math.cos(a) * range, ay + Math.sin(a) * range);
    }
    g.closePath();
    g.fillPath();

    // Hearing ring (dashed circle)
    g.lineStyle(1, 0x38bdf8, 0.25);
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
        this._createSpeechBubble(npc.x, npc.y - 55, 'Whoa, that wind! 💨', npc.data.color, 'neutral');
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
          this._createSpeechBubble(npc.x, npc.y - 55, line, npc.data.color, 'happy');
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
    const bubble = this._createSpeechBubble(npc.x, npc.y - 55, adviceLine, npc.data.color, 'happy');
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

  // ── Outdoor background ────────────────────────────────────────────────────
  _drawOutdoor(width, height) {
    const g = this.add.graphics().setDepth(0);
    const groundY = height * 0.75;

    // Sky gradient
    g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xfde8c8, 0xfde8c8, 1);
    g.fillRect(0, 0, width, groundY);

    // Sun
    g.fillStyle(0xffd700, 1);
    g.fillCircle(width * 0.85, height * 0.15, 50);
    g.fillStyle(0xfff3b0, 0.3);
    g.fillCircle(width * 0.85, height * 0.15, 75);

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

      // Shoes
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

      // Hair
      g.fillStyle(0x3d2314, 1);
      g.fillEllipse(x, y - 40 * S, 26 * S, 14 * S);
      g.fillRect(x - 12 * S, y - 44 * S, 24 * S, 16 * S);
      g.fillEllipse(x, y - 43 * S, 22 * S, 10 * S);
      g.fillTriangle(x - 10 * S, y - 40 * S, x - 5 * S, y - 40 * S, x - 8 * S, y - 48 * S);
      g.fillTriangle(x - 4 * S, y - 41 * S, x + 2 * S, y - 41 * S, x - 1 * S, y - 50 * S);
      g.fillTriangle(x + 2 * S, y - 41 * S, x + 8 * S, y - 41 * S, x + 5 * S, y - 49 * S);

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
        g.beginPath(); g.arc(x, y - 12 * S, 4 * S, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false); g.strokePath();
        // Blush
        g.fillStyle(0xfca5a5, 0.25);
        g.fillEllipse(x - 9 * S, y - 21 * S, 7 * S, 4 * S);
        g.fillEllipse(x + 9 * S, y - 21 * S, 7 * S, 4 * S);
      } else if (emotion === 'angry' || emotion === 'sad') {
        g.beginPath(); g.arc(x, y - 16 * S, 4 * S, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false); g.strokePath();
      } else {
        g.beginPath(); g.moveTo(x - 3 * S, y - 13 * S); g.lineTo(x + 3 * S, y - 13 * S); g.strokePath();
      }
    };

    drawNPC(data.emotion);

    // Name tag
    const nameTag = this.add.text(x, y - 62 * S * 0.36 - 30, data.name, {
      fontFamily: FONT, fontSize: "14px", fontStyle: "bold",
      color: "#ffffff", backgroundColor: "#00000099",
      padding: { x: 7, y: 4 }
    }).setOrigin(0.5).setDepth(9);

    // Emotion indicator
    const emotionEmoji = { happy: "😊", neutral: "😐", angry: "😠", sad: "😢" };
    const emotionTag = this.add.text(x + 30, y - 62 * S * 0.36 - 30, emotionEmoji[data.emotion] || "😐", {
      fontSize: "18px"
    }).setOrigin(0.5).setDepth(9);

    // Idle float animation
    this.tweens.add({
      targets: [nameTag, emotionTag],
      y: "+=6", duration: 1800 + Math.random() * 600,
      yoyo: true, repeat: -1, ease: "Sine.easeInOut"
    });

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
    const y = height * 0.68;

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

  // ── HUD ───────────────────────────────────────────────────────────────────
  _buildHUD(width, height) {
    const hud = this.add.container(width - 200, 62).setDepth(25);

    const bg = this.add.rectangle(0, 0, 185, 110, 0x000000, 0.6);
    bg.setStrokeStyle(1, 0x4ade80, 0.5);

    const title = this.add.text(0, -40, "Agent State", {
      fontFamily: FONT, fontSize: "12px", color: "#86efac", fontStyle: "bold"
    }).setOrigin(0.5);

    // Awareness bar
    const awLabel = this.add.text(-70, -20, "👁 Awareness", {
      fontFamily: FONT, fontSize: "10px", color: "#e2e8f0"
    }).setOrigin(0, 0.5);
    const awBg = this.add.rectangle(20, -20, 60, 8, 0x1e293b, 1).setOrigin(0, 0.5);
    this._awBar = this.add.rectangle(20, -20, (this._awareness / 100) * 60, 6, 0x3b82f6, 1).setOrigin(0, 0.5);

    // Addiction bar
    const adLabel = this.add.text(-70, 0, "📱 Addiction", {
      fontFamily: FONT, fontSize: "10px", color: "#e2e8f0"
    }).setOrigin(0, 0.5);
    const adBg = this.add.rectangle(20, 0, 60, 8, 0x1e293b, 1).setOrigin(0, 0.5);
    this._adBar = this.add.rectangle(20, 0, (this._addictionLevel / 100) * 60, 6, 0xef4444, 1).setOrigin(0, 0.5);

    // Relationship bar
    const relLabel = this.add.text(-70, 20, "💬 Relations", {
      fontFamily: FONT, fontSize: "10px", color: "#e2e8f0"
    }).setOrigin(0, 0.5);
    const relBg = this.add.rectangle(20, 20, 60, 8, 0x1e293b, 1).setOrigin(0, 0.5);
    this._relBar = this.add.rectangle(20, 20, (this._relationshipLevel / 100) * 60, 6, 0x10b981, 1).setOrigin(0, 0.5);

    hud.add([bg, title, awLabel, awBg, this._awBar, adLabel, adBg, this._adBar, relLabel, relBg, this._relBar]);
  }

  _updateHUD() {
    if (this._awBar)  this._awBar.width  = (this._awareness / 100) * 60;
    if (this._adBar)  this._adBar.width  = (this._addictionLevel / 100) * 60;
    if (this._relBar) this._relBar.width = (this._relationshipLevel / 100) * 60;
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

    // Register T key for this NPC
    npc._talkKey = this.input.keyboard.on("keydown-T", () => {
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

    // Build speech bubble
    const bubble = this._createSpeechBubble(npc.x, npc.y - 55, line, npc.data.color, npc.emotion);
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

    // ── Emotional response: if angry, nearby NPCs react too ───────────────
    if (npc.emotion === "angry") {
      this._npcs.forEach(other => {
        if (other.id !== npc.id && !other.bubble) {
          this.time.delayedCall(800, () => {
            other.emotion = "sad";
            if (other.emotionTag) other.emotionTag.setText("😢");
            if (other.drawNPC) other.drawNPC("sad");
            const supportLine = "Are you okay? 😟";
            const b = this._createSpeechBubble(other.x, other.y - 55, supportLine, other.data.color, "sad");
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
    }
  }

  // ── Speech bubble factory ─────────────────────────────────────────────────
  _createSpeechBubble(x, y, text, color, emotion) {
    const container = this.add.container(x, y).setDepth(20);

    const maxW = 220;
    const padding = 12;

    // Measure text
    const tempTxt = this.add.text(0, 0, text, {
      fontFamily: FONT, fontSize: "13px",
      wordWrap: { width: maxW - padding * 2 }
    });
    const tw = Math.min(tempTxt.width + padding * 2, maxW);
    const th = tempTxt.height + padding * 2;
    tempTxt.destroy();

    // Emotion-based border color
    const borderColors = { happy: 0x4ade80, neutral: 0x94a3b8, angry: 0xef4444, sad: 0x60a5fa };
    const borderColor = borderColors[emotion] || color;

    // Bubble background
    const bg = this.add.rectangle(0, 0, tw, th, 0xffffff, 0.97);
    bg.setStrokeStyle(3, borderColor, 1);

    // Emotion accent strip on left
    const strip = this.add.rectangle(-tw / 2 + 4, 0, 6, th, borderColor, 1);

    // Text
    const txt = this.add.text(-tw / 2 + padding + 4, 0, text, {
      fontFamily: FONT, fontSize: "13px", color: "#1e1b4b",
      wordWrap: { width: tw - padding * 2 - 8 }
    }).setOrigin(0, 0.5);

    // Tail (triangle pointing down)
    const tail = this.add.triangle(0, th / 2 + 8, -8, 0, 8, 0, 0, 14, 0xffffff, 1);
    tail.setStrokeStyle(1, borderColor, 0.5);

    container.add([bg, strip, txt, tail]);

    // Animate in
    container.setAlpha(0).setScale(0.8);
    gsap.to(container, { alpha: 1, duration: 0.25, ease: "power2.out" });
    this.tweens.add({
      targets: container, scaleX: 1, scaleY: 1, duration: 250, ease: "Back.easeOut"
    });

    return container;
  }

  // ── Greeting sequence on scene start ─────────────────────────────────────
  _startGreetings() {
    this._npcs.forEach((npc, i) => {
      this.time.delayedCall(i * 1200, () => {
        if (this._ended) return;
        const line = npc.data.lines[0];
        const bubble = this._createSpeechBubble(npc.x, npc.y - 55, line, npc.data.color, "happy");
        npc.bubble = bubble;
        npc.emotion = "happy";
        if (npc.emotionTag) npc.emotionTag.setText("😊");
        this.time.delayedCall(3000, () => {
          if (npc.bubble === bubble) {
            gsap.to(bubble, { alpha: 0, duration: 0.3, onComplete: () => bubble.destroy() });
            npc.bubble = null;
            npc.emotion = "neutral";
            if (npc.emotionTag) npc.emotionTag.setText("😐");
          }
        });
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
          reactingNpc.x, reactingNpc.y - 55,
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
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BootScene");
      });
    });
  }
}
