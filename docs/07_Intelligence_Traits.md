# 7. Intelligence Traits

EchoSphere demonstrates five distinct AI intelligence traits across its three scenarios.

---

## 7.1 Trait 1: Emotional Intelligence (EmotionSystem)

**Location:** `src/agent/EmotionSystem.js`, `src/agent/FSM.js`

**Description:**  
The agent maintains three quantifiable emotional states — stress, happiness, and loneliness — that drift toward baseline values each frame and are modified by events. These emotions directly drive FSM state transitions, creating emergent behaviour that feels psychologically authentic.

**Implementation:**
```javascript
// EmotionSystem.js — Three emotions with baseline drift
constructor() {
  this.stress    = 10;   // baseline
  this.happiness = 60;   // baseline
  this.loneliness = 20;  // baseline
}

update() {
  // Emotions drift back to baseline every frame
  this.stress     = this._drift(this.stress,     10,  0.008);
  this.happiness  = this._drift(this.happiness,  60,  0.005);
  this.loneliness = this._drift(this.loneliness, 20,  0.005);
}

applyEvent(delta) {
  // Events modify emotions, clamped to 0-100
  if (delta.stress !== undefined)
    this.stress = Math.min(100, Math.max(0, this.stress + delta.stress));
  // ... happiness, loneliness similarly
}
```

**Emotion-Driven Transitions:**
- `stress ≥ 65` → LOOPING transitions to DISTORTED
- `stress ≥ 85` → DISTORTED transitions to BREAKING_POINT
- `happiness > 45` (at BREAKING_POINT) → RECOVERED outcome
- `loneliness > 70` (at BREAKING_POINT) → LOST outcome

**NPC Emotional Intelligence:**
- NPCs react to each other's emotions (contagious happiness)
- When one NPC is angry, others show concern and offer support
- NPCs calm down after receiving support from others

**Evidence in Code:**
```javascript
// FSM.js — Emotion thresholds drive transitions
case 'LOOPING':
  e.applyEvent({ stress: 0.02, loneliness: 0.015 });
  if (e.stress >= 65) this._transition('DISTORTED', 'stress threshold');
  break;
```

---

## 7.2 Trait 2: Learning and Memory

**Location:** `src/agent/Agent.js` (`_updateAIVariables`), `src/scenes/RealWorldScene.js` (`_npcSpeak`, `_giveAdvice`)

**Description:**  
The agent maintains a `memory` array that stores behavioural patterns learned during gameplay. These memories persist across scene transitions and modify future behaviour — the agent does not repeat the same mistakes.

**Patterns Learned:**

| Pattern | Trigger | Effect |
|---------|---------|--------|
| `'high_addiction'` | addictionLevel > 80 | Logged, informs FSM |
| `'social_neglect'` | ignoredMessages ≥ 2 | Logged, informs FSM |
| `'compulsive_scrolling'` | scrollCount > 50 | Logged, informs FSM |
| `'mom_advice'` | Mom gives advice | -20 addiction, +15 awareness, advice not repeated |
| `'avoid_[npcId]'` | 2 bad interactions with NPC | Steve avoids that NPC in future |

**Implementation:**
```javascript
// Agent.js — Learning system
_updateAIVariables() {
  if (this.addictionLevel > 80 && !this.memory.includes('high_addiction')) {
    this.memory.push('high_addiction');
    console.log('🧠 Agent learned: high_addiction pattern');
  }
  if (this.ignoredMessages >= 2 && !this.memory.includes('social_neglect')) {
    this.memory.push('social_neglect');
    console.log('🧠 Agent learned: social_neglect pattern');
  }
}

// RealWorldScene.js — Mom's advice stored in memory
_giveAdvice(npc) {
  if (this._adviceGiven || npc.id !== 'mom') return;
  this._adviceGiven = true;
  if (this.agent && !this.agent.memory.includes('mom_advice')) {
    this.agent.memory.push('mom_advice');
    this._log('🧠 Steve learned: mom_advice — will not ignore Mom again');
  }
  this._addictionLevel = Math.max(0, this._addictionLevel - 20);
  this._awareness = Math.min(100, this._awareness + 15);
}

// NPC avoidance learning
npc._badInteractions = (npc._badInteractions || 0) + 1;
if (npc._badInteractions >= 2 && npc.id !== 'mom') {
  this._avoidedNPC = npc.id;
  this._log(`🧠 Steve learned: avoid ${npc.name} after repeated conflict`);
  if (this.agent) this.agent.memory.push(`avoid_${npc.id}`);
}
```

**Memory Persistence:**
```javascript
// AttractionScene → RealWorldScene data transfer
this.scene.start('RealWorldScene', {
  memory: this.agent ? [...this.agent.memory] : [],
  // ...
});

// RealWorldScene reads memory
this.agent.memory = [...this._memory];
```

---

## 7.3 Trait 3: Visual Perception (Vision Cone + Hearing Range)

**Location:** `src/scenes/RealWorldScene.js` (`_updateVisionCone`, `_updatePerception`)

**Description:**  
Steve has a realistic perception system with a directional vision cone and an omnidirectional hearing range. These are modelled using trigonometry and are affected by environmental conditions (time of day, phone use).

**Vision Cone Parameters:**
- Range: 200px (base)
- Angle: ±45° from facing direction (90° total cone)
- Reduced to ×0.55 at dusk
- Reduced to ×0.6 when phone is visible and addiction > 40

**Hearing Range Parameters:**
- Range: 150px (omnidirectional — no angle restriction)
- Not affected by environmental conditions

**Implementation:**
```javascript
// RealWorldScene.js — Perception calculation
_updatePerception() {
  const facingAngle = this.agent._facingRight ? 0 : Math.PI;
  const halfCone = Phaser.Math.DegToRad(this.VISION_ANGLE / 2); // 45°

  let visionRange = this.VISION_RANGE; // 200px
  if (this._timeOfDay === 'dusk') visionRange *= 0.55;
  if (this._phoneVisible && this._addictionLevel > 40) visionRange *= 0.6;

  this._npcs.forEach(npc => {
    const dx = npc.x - ax;
    const dy = npc.y - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleToNPC = Math.atan2(dy, dx);
    const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToNPC - facingAngle));

    const canSee  = dist < visionRange && angleDiff < halfCone;
    const canHear = dist < this.HEARING_RANGE; // 150px

    if ((canSee || canHear) && !npc._perceived) {
      npc._perceived = true;
      if (!this._learnedNPCs.has(npc.id)) {
        this._log(`👁 Steve noticed ${npc.name}`);
      }
    }
  });
}
```

**Real-World Physics:**
The vision cone models how humans have a limited field of view (~180° in reality, simplified to 90° for gameplay). The hearing range models how sound travels in all directions regardless of facing. The dusk modifier models reduced visibility in low light — a direct real-world physics analogy.

---

## 7.4 Trait 4: Autonomous Agent Behaviour (NPC Pathfinding and Decision-Making)

**Location:** `src/scenes/RealWorldScene.js` (`_updateNPCWander`, `_npcDecideToApproach`, `_steerNPCToward`)

**Description:**  
NPCs exhibit autonomous behaviour including random wandering, goal-directed pathfinding toward Steve, and decision-making about when to approach. This uses a simple seek steering behaviour.

**Wander Behaviour:**
```javascript
_updateNPCWander() {
  this._npcs.forEach(npc => {
    if (npc._seekingPlayer) return; // pathfinding overrides wander
    npc._wanderTimer = (npc._wanderTimer || 0) + 1;

    if (npc._wanderTimer > 240) { // every ~4 seconds
      npc._wanderTimer = 0;
      const spread = 60;
      const baseX = this._w * npc.data.x;
      const baseY = this._h * npc.data.y;
      npc._wanderTarget = {
        x: Phaser.Math.Clamp(baseX + Phaser.Math.Between(-spread, spread), 60, this._w - 60),
        y: Phaser.Math.Clamp(baseY + Phaser.Math.Between(-spread/2, spread/2), 80, this._groundY)
      };
    }
    if (npc._wanderTarget) {
      this._steerNPCToward(npc, npc._wanderTarget.x, npc._wanderTarget.y);
    }
  });
}
```

**Seek Steering (Pathfinding):**
```javascript
_steerNPCToward(npc, tx, ty) {
  const dx = tx - npc.x;
  const dy = ty - npc.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 5) return;
  const speed = this.NPC_WANDER_SPEED; // 0.6 px/frame
  npc.x += (dx / dist) * speed; // normalised direction × speed
  npc.y += (dy / dist) * speed;
  if (npc.drawNPC) npc.drawNPC(npc.emotion);
}
```

**Decision to Approach:**
```javascript
_npcDecideToApproach(npc) {
  if (npc._seekingPlayer || npc.bubble) return;
  npc._seekingPlayer = true;
  const seekInterval = this.time.addEvent({
    delay: 50,
    callback: () => {
      const dist = Phaser.Math.Distance.Between(this.agent.x, this.agent.y, npc.x, npc.y);
      if (dist < 80) {
        seekInterval.remove();
        npc._seekingPlayer = false;
        this._npcSpeak(npc); // arrived — speak
      } else {
        this._steerNPCToward(npc, this.agent.x, this.agent.y);
      }
    },
    loop: true
  });
}
```

---

## 7.5 Trait 5: State-Based Decision Making (Finite State Machine)

**Location:** `src/agent/FSM.js`

**Description:**  
The FSM models the psychological progression of digital addiction through 8 distinct states. Each state reacts differently to the same event — this is the defining characteristic of state-based intelligence. The FSM uses both event-driven transitions and timer-based fallbacks.

**Key Design Principle:**
The same event (`NOTIFICATION_SEEN`) has different effects depending on the current state:
- In **IDLE**: Triggers transition to ATTRACTED
- In **ATTRACTED**: Increments engageCount, may trigger LOOPING
- In **LOOPING/DISTORTED**: No direct effect (already past this stage)

**Outcome Resolution:**
```javascript
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
```

**Visual Feedback:**
The agent's appearance changes with each FSM state — skin tone darkens, posture hunches, and expression changes — providing immediate visual feedback of the AI's internal state.

| State | Skin | Shirt | Hunch | Expression |
|-------|------|-------|-------|------------|
| IDLE | `0xf5c5a3` | Blue | 0 | Neutral |
| ATTRACTED | `0xf5c5a3` | Blue | 0 | Slight smile |
| LOOPING | `0xedb48a` | Dark blue | 1-2 | Neutral |
| DISTORTED | `0xd4956e` | Navy | 3 | Frown |
| BREAKING_POINT | `0xb87a55` | Dark navy | 4 | Frown + glitch |
| RECOVERED | `0xf5c5a3` | Green | 0 | Smile |
| LOST | `0x9a8070` | Dark grey | 4 | Minimal |

---

## 7.6 Real-World Physics Implementation

**Location:** `src/scenes/RealWorldScene.js`

**Vision Cone Physics:**
The vision cone uses trigonometric angle calculation to determine if an NPC falls within Steve's field of view. This models the physical limitation of human peripheral vision.

```javascript
// Angle difference between facing direction and direction to NPC
const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToNPC - facingAngle));
const canSee = dist < visionRange && angleDiff < halfCone; // halfCone = 45°
```

**Environmental Modifiers:**
- **Dusk**: Vision range × 0.55 — models reduced visibility in low light
- **Phone distraction**: Vision range × 0.6 — models reduced attention when distracted
- **Rain**: NPCs seek shelter (pathfind to bench) — models weather-driven behaviour
- **Wind**: Visual streaks + NPC comments — models environmental awareness

**Hunch Physics:**
The agent's posture (hunchLevel 0–4) compresses the character's vertical scale:
```javascript
const hunchScaleY = 1 - hunch * 0.06; // body compresses vertically
this.container.setScale(this._facingRight ? 1 : -1, hunchScaleY);
```
This models the physical effect of prolonged phone use on posture — a documented real-world phenomenon.
