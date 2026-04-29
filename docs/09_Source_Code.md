# 9. Source Code Listing

> All source code is fully annotated. Key files are listed below with their purpose and critical annotated excerpts. Full source is in the `src/` directory.

---

## 9.1 `src/agent/FSM.js` — Finite State Machine

```javascript
/**
 * FSM — Finite State Machine for the EchoSphere agent
 *
 * States:
 *   IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT → RECOVERED | PARTIAL | LOST
 *
 * Transitions are driven by EVENTS fired into the FSM, not timers alone.
 * Each state reacts differently to the same event — that's what makes it state-based.
 */
export default class FSM {
  constructor(agent) {
    this.agent = agent;
    this.state = 'IDLE';          // Initial state
    this._timer = 0;              // Frame counter for timeout transitions

    // Counters that accumulate across events — drive alternative endings
    this.engageCount    = 0;  // How many times agent engaged with digital content
    this.resistCount    = 0;  // How many times agent resisted
    this.ignoredFriends = 0;  // How many friend messages went unanswered

    this._listeners = []; // Transition callbacks for scene notification
  }

  // Force the FSM into a specific state (used when a scene starts mid-story)
  forceState(state) {
    this.state = state;
    this._timer = 0;
  }

  // Main per-frame tick — handles timeout-based fallbacks
  update() {
    this._timer++;
    const e = this.agent.emotions;

    switch (this.state) {
      case 'IDLE':
        // If nothing happens for too long, agent gets curious
        if (this._timer > 200) this._transition('ATTRACTED', 'timeout — curiosity');
        break;

      case 'ATTRACTED':
        // Passive happiness rise while attracted
        e.applyEvent({ happiness: 0.03 });
        // If attracted too long with no resistance → loop forms
        if (this._timer > 600 && this.resistCount === 0) {
          this._transition('LOOPING', 'no resistance — habit forming');
        }
        break;

      case 'LOOPING':
        // Stress and loneliness accumulate in the loop
        e.applyEvent({ stress: 0.02, loneliness: 0.015 });
        if (e.stress >= 65) this._transition('DISTORTED', 'stress threshold');
        break;

      case 'DISTORTED':
        // Reality distortion — stress spikes, happiness drops
        e.applyEvent({ stress: 0.04, happiness: -0.03 });
        if (e.stress >= 85) this._transition('BREAKING_POINT', 'stress critical');
        break;

      case 'BREAKING_POINT':
        // After 180 frames (~3 seconds), resolve the outcome
        if (this._timer > 180) this._resolveOutcome();
        break;
    }
  }

  // Event handler — called by scene when something happens
  handleEvent(eventName) {
    const e = this.agent.emotions;

    switch (this.state) {
      case 'IDLE':
        if (eventName === 'NOTIFICATION_SEEN') {
          e.applyEvent({ happiness: 8, stress: 2 });
          this.engageCount++;
          this._transition('ATTRACTED', 'first notification caught attention');
        }
        break;

      case 'ATTRACTED':
        if (eventName === 'NOTIFICATION_SEEN') {
          e.applyEvent({ happiness: 6, stress: 1 });
          this.engageCount++;
          // Too many engagements → loop starts forming
          if (this.engageCount >= 5) {
            this._transition('LOOPING', 'repeated engagement — habit forming');
          }
        }
        if (eventName === 'PLAYER_RESIST') {
          e.applyEvent({ happiness: -5, loneliness: 3 });
          this.resistCount++;
          if (this.resistCount >= 3) {
            this._transition('LOOPING', 'player resisted — but loop already forming');
          }
        }
        break;
    }
  }

  // Determine final outcome from BREAKING_POINT
  _resolveOutcome() {
    const e = this.agent.emotions;
    const recovered = this.resistCount >= this.engageCount && e.happiness > 45;
    const lost = this.ignoredFriends >= 3 || e.loneliness > 70;

    if (recovered) {
      this._transition('RECOVERED', 'player resisted enough — recovery');
    } else if (lost) {
      this._transition('LOST', 'too many ignored friends — lost');
    } else {
      this._transition('PARTIAL', 'mixed behaviour — partial recovery');
    }
  }

  // Internal transition with notification
  _transition(newState, reason) {
    const old = this.state;
    this.state = newState;
    this._timer = 0;
    this._listeners.forEach(fn => fn(newState, reason));
    console.log(`[FSM] ${old} → ${newState} (${reason})`);
  }
}
```

---

## 9.2 `src/agent/EmotionSystem.js` — Emotional Intelligence

```javascript
/**
 * EmotionSystem — tracks stress, happiness, loneliness (0–100)
 * Active in Scenario 1: Emotional Intelligence trait
 * Emotions drift back to baseline each frame (homeostasis model)
 */
export default class EmotionSystem {
  constructor() {
    this.stress    = 10;  // Baseline: calm
    this.happiness = 60;  // Baseline: content
    this.loneliness = 20; // Baseline: connected
  }

  // Called every frame — values drift back toward baseline slowly
  update() {
    this.stress     = this._drift(this.stress,     10,  0.008);
    this.happiness  = this._drift(this.happiness,  60,  0.005);
    this.loneliness = this._drift(this.loneliness, 20,  0.005);
  }

  // Drift function: moves value toward baseline at given rate
  _drift(current, baseline, rate) {
    if (current > baseline) return Math.max(baseline, current - rate);
    if (current < baseline) return Math.min(baseline, current + rate);
    return current;
  }

  // Apply an emotion delta event e.g. { happiness: +15, stress: +5 }
  // All values clamped to 0-100
  applyEvent(delta) {
    if (delta.stress !== undefined)
      this.stress = Math.min(100, Math.max(0, this.stress + delta.stress));
    if (delta.happiness !== undefined)
      this.happiness = Math.min(100, Math.max(0, this.happiness + delta.happiness));
    if (delta.loneliness !== undefined)
      this.loneliness = Math.min(100, Math.max(0, this.loneliness + delta.loneliness));
  }
}
```

---

## 9.3 `src/agent/Agent.js` — Key Methods (Annotated Excerpts)

```javascript
/**
 * Agent — "Kai", teen boy character
 * Player-controlled movement with AI-driven emotional and behavioural responses.
 */

// ── AI Core Variables ────────────────────────────────────────────────────────
this.addictionLevel = 0;      // 0-100: primary addiction metric
this.awareness = 70;           // 0-100: decreases with phone use
this.memory = [];              // Learning system: stores behavioural patterns
this.hunchLevel = 0;           // 0=upright, 4=fully hunched (posture model)
this.speed = 6;                // Movement speed — overridable per scene

// ── Learning System ──────────────────────────────────────────────────────────
_updateAIVariables() {
  // Hunch level maps addiction to posture (real-world physics)
  if (this.addictionLevel > 80)      this.hunchLevel = 4;
  else if (this.addictionLevel > 60) this.hunchLevel = 3;
  else if (this.addictionLevel > 40) this.hunchLevel = 2;
  else if (this.addictionLevel > 20) this.hunchLevel = 1;
  else                               this.hunchLevel = 0;

  // Store behavioural patterns in memory (each stored only once)
  if (this.addictionLevel > 80 && !this.memory.includes('high_addiction')) {
    this.memory.push('high_addiction');
    console.log('🧠 Agent learned: high_addiction pattern');
  }
  if (this.ignoredMessages >= 2 && !this.memory.includes('social_neglect')) {
    this.memory.push('social_neglect');
    console.log('🧠 Agent learned: social_neglect pattern');
  }
}

// ── Phone Usage Impact ───────────────────────────────────────────────────────
usePhone(deltaTime = 1) {
  this.timeOnPhone += deltaTime;
  this.addictionLevel = Math.min(100, this.addictionLevel + 0.15); // addiction rises
  this.awareness = Math.max(0, this.awareness - 0.12);              // awareness drops
  this.emotions.applyEvent({ stress: 0.08, happiness: -0.05 });    // emotional impact
}

// ── Perception ───────────────────────────────────────────────────────────────
_perceive() {
  if (!this.scene.notifications) return;
  if (this._perceptionCooldown > 0) return; // cooldown prevents spam

  this.scene.notifications.forEach(n => {
    if (!n.active || n._seen) return;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, n.x, n.y);
    if (dist < 90) {
      // Only fire if scene hasn't already handled it
      if (!this.scene._notificationFired) {
        this.fsm.handleEvent('NOTIFICATION_SEEN');
      }
      this._perceptionCooldown = 50; // 50 frames cooldown
      n._seen = true;
    }
  });
}
```

---

## 9.4 `src/scenes/RealWorldScene.js` — Key Methods (Annotated Excerpts)

```javascript
// ── Vision Cone Perception ───────────────────────────────────────────────────
_updatePerception() {
  const facingAngle = this.agent._facingRight ? 0 : Math.PI;
  const halfCone = Phaser.Math.DegToRad(this.VISION_ANGLE / 2); // 45°

  // Environmental modifiers reduce vision range
  let visionRange = this.VISION_RANGE; // 200px base
  if (this._timeOfDay === 'dusk') visionRange *= 0.55;           // dusk: -45%
  if (this._phoneVisible && this._addictionLevel > 40) visionRange *= 0.6; // distracted: -40%

  this._npcs.forEach(npc => {
    const dx = npc.x - ax;
    const dy = npc.y - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleToNPC = Math.atan2(dy, dx);
    // Wrap angle difference to handle 0/360 boundary
    const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToNPC - facingAngle));

    const canSee  = dist < visionRange && angleDiff < halfCone; // in cone
    const canHear = dist < this.HEARING_RANGE;                  // omnidirectional

    if ((canSee || canHear) && !npc._perceived) {
      npc._perceived = true;
      if (!this._learnedNPCs.has(npc.id)) {
        this._log(`👁 Kai noticed ${npc.name}`);
      }
    }
  });
}

// ── Mom's Advice (Learning Event) ───────────────────────────────────────────
_giveAdvice(npc) {
  if (this._adviceGiven || npc.id !== 'mom') return; // only once, only Mom
  this._adviceGiven = true;

  const adviceLine = 'Put the phone down. Real moments matter more. 💚';
  const bubble = this._createSpeechBubble(npc.x, npc.y - 110, adviceLine, npc.data.color, 'happy');
  npc.bubble = bubble;

  // Store in agent memory — persists across scenes
  if (this.agent && !this.agent.memory.includes('mom_advice')) {
    this.agent.memory.push('mom_advice');
    this._log('🧠 Kai learned: mom_advice — will not ignore Mom again');
  }

  // Significant addiction reduction after receiving advice
  this._addictionLevel = Math.max(0, this._addictionLevel - 20);
  this._awareness = Math.min(100, this._awareness + 15);
}
```

---

## 9.5 File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `src/agent/Agent.js` | ~500 | Main agent class, AI variables, drawing, input |
| `src/agent/FSM.js` | ~200 | Finite State Machine with 8 states |
| `src/agent/EmotionSystem.js` | ~40 | Stress/happiness/loneliness system |
| `src/scenes/BootScene.js` | ~200 | Title screen |
| `src/scenes/AttractionScene.js` | ~1500 | Scenario 1 — digital attraction |
| `src/scenes/RealWorldScene.js` | ~1577 | Scenario 2 — social interaction |
| `src/scenes/LearningScene.js` | ~550 | Scenario 3 — study path |
| `src/scenes/TripScene.js` | ~900 | Road trip scene |
| `src/scenes/EndScene.js` | ~100 | Completion screen |
| `src/main.js` | ~25 | Phaser game configuration |
| **Total** | **~5600** | |
