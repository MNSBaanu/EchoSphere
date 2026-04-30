# 7. Intelligence Traits

EchoSphere demonstrates **six distinct AI intelligence traits** across its three scenarios, directly addressing the required agent behaviour criteria.

---

## 7.1 Trait 1: Perceptions — Vision, Hearing, and Sensing

**Location:** `src/scenes/RealWorldScene.js` (`_updateVisionCone`, `_updatePerception`), `src/agent/Agent.js` (`lookAtDirection`), `src/scenes/AttractionScene.js` (`_firePhoneNotification`)

**Description:**
Steve has a realistic multi-modal perception system. He can **see** NPCs within a directional vision cone, **hear** NPCs within an omnidirectional hearing range, **sense** notifications by proximity, and **respond with eye movement** to audio stimuli. These are modelled using trigonometry and are affected by real-world environmental conditions — time of day and phone distraction both reduce what Steve can perceive.

**Vision Cone Parameters:**
- Range: 200px (base)
- Angle: ±45° from facing direction (90° total cone)
- Reduced to ×0.55 at dusk (models low-light visibility)
- Reduced to ×0.6 when phone is visible and addiction > 40 (models distracted attention)

**Hearing Range Parameters:**
- Range: 150px (omnidirectional — no angle restriction)
- Models how sound travels in all directions regardless of facing

**Audio-Visual Response System:**
- **Notification Sound**: 3-loop audio notification (noti.wav) plays when phone buzzes
- **Eye Movement**: Steve's eyes automatically snap toward sound source, hold for 800ms, then return to center
- **Directional Response**: Eyes move left/right based on sound source location

**Implementation:**
```javascript
// Agent.js — Eye movement response to audio stimuli
lookAtDirection(direction) {
  const offset = direction === 'right' ? 15 : -15;
  this._eyeOffset = offset;
  
  // Hold eye position for 800ms, then return to center
  this.scene.time.delayedCall(800, () => {
    this._eyeOffset = 0;
  });
}

// AttractionScene.js — Audio notification with eye response
_firePhoneNotification() {
  // Play notification sound 3 times with 600ms gaps
  if (this.cache.audio.exists('noti')) {
    let playCount = 0;
    const playNext = () => {
      if (playCount >= 3) return;
      playCount++;
      this.sound.play('noti', { volume: 0.8 });
      this.time.delayedCall(600, playNext);
    };
    playNext();
  }
  
  // Agent hears notification — eyes snap toward phone then return
  if (this.agent) {
    this.agent.lookAtDirection('right'); // Phone is to the right
  }
}

// RealWorldScene.js — Perception calculation with environmental modifiers
_updatePerception() {
  const facingAngle = this.agent._facingRight ? 0 : Math.PI;
  const halfCone = Phaser.Math.DegToRad(this.VISION_ANGLE / 2); // 45°

  let visionRange = this.VISION_RANGE; // 200px base
  if (this._timeOfDay === 'dusk') visionRange *= 0.55;           // dusk: -45%
  if (this._phoneVisible && this._addictionLevel > 40) visionRange *= 0.6; // distracted: -40%

  this._npcs.forEach(npc => {
    const dx = npc.x - ax;
    const dy = npc.y - ay;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleToNPC = Math.atan2(dy, dx);
    const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angleToNPC - facingAngle));

    const canSee  = dist < visionRange && angleDiff < halfCone; // directional
    const canHear = dist < this.HEARING_RANGE;                  // omnidirectional

    if ((canSee || canHear) && !npc._perceived) {
      npc._perceived = true;
      this._log(`👁 Steve noticed ${npc.name}`);
    }
  });
}
```

**Real-World Physics:**
The vision cone uses trigonometric angle calculation to determine if an NPC falls within Steve's field of view, modelling the physical limitation of human peripheral vision. The dusk modifier models reduced visibility in low light. The phone distraction modifier models how divided attention narrows effective perception — a documented cognitive phenomenon. The eye movement system models natural human response to audio stimuli.

**Stacked Environmental Modifiers:**
```
Normal day:              visionRange = 200px
Dusk only:               visionRange = 200 × 0.55 = 110px
Phone distraction only:  visionRange = 200 × 0.60 = 120px
Dusk + phone:            visionRange = 200 × 0.55 × 0.60 = 66px
```

---

## 7.2 Trait 2: Emotional Intelligence

**Location:** `src/agent/EmotionSystem.js`, `src/agent/FSM.js`, `src/scenes/RealWorldScene.js`

**Description:**
The agent maintains three quantifiable emotional states — **stress**, **happiness**, and **loneliness** — that drift toward baseline values each frame and are modified by events. These emotions directly drive FSM state transitions. NPCs also have emotional states and **respond to each other's emotions** — when one NPC is angry, others show concern and offer support, demonstrating inter-agent emotional intelligence.

**Steve's Emotion Baselines:**
- Stress: baseline 10 (calm)
- Happiness: baseline 60 (content)
- Loneliness: baseline 20 (connected)

**Implementation:**
```javascript
// EmotionSystem.js — Baseline drift (homeostasis model)
update() {
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

**Emotion-Driven FSM Transitions:**
- `stress ≥ 65` → LOOPING transitions to DISTORTED
- `stress ≥ 85` → DISTORTED transitions to BREAKING_POINT
- `happiness > 45` (at BREAKING_POINT) → RECOVERED outcome
- `loneliness > 70` (at BREAKING_POINT) → LOST outcome

**Events That Modify Emotions:**
| Event | Happiness | Stress | Loneliness |
|-------|-----------|--------|------------|
| NOTIFICATION_SEEN | +8 | +2 | — |
| FRIEND_MESSAGE | +10 | — | -8 |
| FRIEND_IGNORED | -5 | — | +8 |
| PLAYER_ENGAGE | +8 | +3 | — |
| PLAYER_RESIST | -5 | — | +3 |
| RANDOM_GOOD | +3 | -5 | -5 |
| RANDOM_BAD | +15 | +8 | — |

**NPC Emotional Intelligence (Inter-Agent Response):**
- NPCs react to Steve's addiction level — if phone is visible and addiction > 50, NPCs become angry or sad
- When one NPC is angry, others show concern and offer support (emotional contagion)
- NPCs calm down after receiving support from other NPCs
- Mom specifically responds with advice when Steve's addiction exceeds 60

```javascript
// FSM.js — Emotion thresholds drive state transitions
case 'LOOPING':
  e.applyEvent({ stress: 0.02, loneliness: 0.015 });
  if (e.stress >= 65) this._transition('DISTORTED', 'stress threshold');
  break;
```

**Visual Feedback:**
The agent's appearance changes with each FSM state — skin tone darkens, posture hunches, and expression changes — providing immediate visual feedback of the AI's internal emotional state.

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

## 7.3 Trait 3: Natural Language Communication Among Agents

**Location:** `src/scenes/RealWorldScene.js` (`_npcSpeak`, `_startGreetings`, `_createSpeechBubble`, `_giveAdvice`)

**Description:**
Agents communicate through **speech bubbles** — callout signs of text that appear above characters during interactions. NPCs have distinct dialogue sets that change based on context: normal lines, angry lines, return-visit lines, and advice lines. The 7-line greeting conversation sequence is a structured multi-agent dialogue where Mom, Alex, and Sam each speak in turn. All communication is reactive — what an NPC says depends on Steve's current state.

**Dialogue System:**
```javascript
// NPC_DATA — Each NPC has context-sensitive dialogue sets
{
  id: "mom",
  lines: [                          // normal lines (low addiction)
    "Hey! You actually came outside! 😊",
    "I made your favourite snack!",
    "It is so nice to see you without that phone.",
    "Want to take a walk together?",
  ],
  angryLines: [                     // triggered when phone visible + addiction > 50
    "You are always on that phone!",
    "Can you please just be present?",
    "I miss spending time with you.",
  ],
}
```

**Greeting Conversation (7-line multi-agent dialogue):**
```javascript
// _startGreetings() — structured conversation sequence
// Each press of [T] advances to the next speaker
const GREET_CONV = [
  { npc: 'mom',     text: "Oh sweetheart, you came outside! 🌟",    emotion: 'happy' },
  { npc: 'sibling', text: "Yay! Can we play now? 🎉",               emotion: 'happy' },
  { npc: 'friend',  text: "Finally! We have been waiting! 😄",      emotion: 'happy' },
  { npc: 'mom',     text: "It is such a beautiful day outside.",     emotion: 'happy' },
  { npc: 'sibling', text: "Can we play something together?",         emotion: 'happy' },
  { npc: 'friend',  text: "We were about to start without you!",    emotion: 'happy' },
  { npc: 'mom',     text: "Let's head out together! 💚",            emotion: 'happy' },
];
```

**Context-Sensitive Speech:**
```javascript
// _npcSpeak(npc) — NPC chooses dialogue based on Steve's state
_npcSpeak(npc) {
  if (this._avoidedNPC === npc.id) return; // learned avoidance — no speech

  if (npc.id === 'mom' && this._addictionLevel > 60 && !this._adviceGiven) {
    this._giveAdvice(npc); // special advice dialogue
  } else if (this._phoneVisible && this._addictionLevel > 50) {
    npc.emotion = 'angry';
    // NPC speaks angry lines — responds to Steve's phone use
    const line = Phaser.Utils.Array.GetRandom(npc.data.angryLines);
    this._createSpeechBubble(npc.x, npc.y - 110, line, npc.data.color, 'angry');
  } else {
    npc.emotion = 'happy';
    const line = Phaser.Utils.Array.GetRandom(npc.data.lines);
    this._createSpeechBubble(npc.x, npc.y - 110, line, npc.data.color, 'happy');
  }
}
```

**Random Environmental Speech:**
NPCs also speak spontaneously during random events:
- During wind: *"Whoa, that wind! 💨"*
- When calling Steve: *"Hey Steve! Over here! 👋"*, *"Steve! Can you hear me?"*
- When Steve checks phone: *"Oh no, not the phone again... 😔"*, *"We were having such a good time... 😢"*

**Notification Bell (Social Media "Communication"):**
The notification bell icon in RealWorldScene represents incoming social media messages — a form of digital communication that competes with real-world NPC dialogue, reinforcing the simulation's core theme.

---

## 7.4 Trait 4: Learning and Memory

**Location:** `src/agent/Agent.js` (`_updateAIVariables`), `src/scenes/RealWorldScene.js` (`_npcSpeak`, `_giveAdvice`), `src/scenes/LearningScene.js`, `src/scenes/AttractionScene.js` (`_showLearningKey`)

**Description:**
The agent maintains a `memory` array that stores behavioural patterns learned during gameplay. These memories **persist across scene transitions** and modify future behaviour — the agent does not repeat the same mistakes. Steve learns from advice, recognises his own compulsive patterns, avoids NPCs who have reacted badly to him, and can learn from educational content in the LearningScene. The system includes both **proactive learning** (accepting educational opportunities) and **redemptive learning** (learning from failure).

**Patterns Learned:**

| Pattern | Trigger | Effect |
|---------|---------|--------|
| `'high_addiction'` | addictionLevel > 80 | Logged, informs FSM outcome |
| `'social_neglect'` | ignoredMessages ≥ 2 | Logged, informs FSM outcome |
| `'compulsive_scrolling'` | scrollCount > 50 | Logged, informs FSM outcome |
| `'mom_advice'` | Mom gives advice | -20 addiction, +15 awareness, advice not repeated |
| `'avoid_[npcId]'` | 2 bad interactions with NPC | Steve avoids that NPC in future |
| `'educational_completion'` | LearningScene tasks completed | -30-40 addiction, +25-35 awareness |
| `'redemption_learning'` | Learning after 100% failure | Recovery from complete addiction failure |

**Learning Opportunities System:**
```javascript
// AttractionScene.js — Educational notification at 70% addiction
_showEducationalNotification() {
  // Popup with Accept/Later choice
  // Accept → LearningScene (proactive learning)
  // Later → Continue scrolling (missed opportunity)
}

// AttractionScene.js — Redemption system at 100% addiction
_showLearningKey() {
  // After failure notification, learning key appears
  // Offers second chance through education
  // Click → LearningScene (redemptive learning)
}
```

**LearningScene Educational System:**
```javascript
// LearningScene.js — Task-based learning with measurable outcomes
_completeTask(taskIndex) {
  this._tasks[taskIndex].completed = true;
  this._tasks[taskIndex].progress = 100;
  
  if (this._tasks.every(task => task.completed)) {
    // All tasks completed — apply learning benefits
    const reductionAmount = Phaser.Math.Between(30, 40);
    const awarenessGain = Phaser.Math.Between(25, 35);
    
    // Transfer improved state back to AttractionScene
    this.scene.start('AttractionScene', {
      addictionLevel: Math.max(0, this._addictionLevel - reductionAmount),
      awareness: Math.min(100, this._awareness + awarenessGain),
      memory: [...this._memory, 'educational_completion']
    });
  }
}
```

**Implementation:**
```javascript
// Agent.js — Learning system (each pattern stored only once)
_updateAIVariables() {
  if (this.addictionLevel > 80 && !this.memory.includes('high_addiction')) {
    this.memory.push('high_addiction');
    console.log('🧠 Agent learned: high_addiction pattern');
  }
  if (this.ignoredMessages >= 2 && !this.memory.includes('social_neglect')) {
    this.memory.push('social_neglect');
    console.log('🧠 Agent learned: social_neglect pattern');
  }
  if (this.scrollCount > 50 && !this.memory.includes('compulsive_scrolling')) {
    this.memory.push('compulsive_scrolling');
    console.log('🧠 Agent learned: compulsive_scrolling pattern');
  }
}

// RealWorldScene.js — Mom's advice stored in memory (not repeated)
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

// NPC avoidance learning — not making the same mistake twice
npc._badInteractions = (npc._badInteractions || 0) + 1;
if (npc._badInteractions >= 2 && npc.id !== 'mom') {
  this._avoidedNPC = npc.id;
  this._log(`🧠 Steve learned: avoid ${npc.name} after repeated conflict`);
  if (this.agent) this.agent.memory.push(`avoid_${npc.id}`);
}
```

**Memory Persistence Across Scenes:**
```javascript
// AttractionScene → RealWorldScene data transfer
this.scene.start('RealWorldScene', {
  memory: this.agent ? [...this.agent.memory] : [],
  addictionLevel: this._addictionLevel,
  awareness: this._awareness,
});

// AttractionScene → LearningScene data transfer
this.scene.start('LearningScene', {
  addictionLevel: this.agent.addictionLevel,
  awareness: this.agent.awareness,
  memory: [...this.agent.memory]
});

// LearningScene → AttractionScene with improved metrics
this.scene.start('AttractionScene', {
  addictionLevel: reducedAddiction,
  awareness: improvedAwareness,
  memory: [...this._memory, 'educational_completion']
});
```

**Learning Pathways:**
1. **Proactive Learning**: Accept educational notification at 70% → LearningScene → Return with benefits
2. **Redemptive Learning**: Reach 100% failure → Learning key → LearningScene → Recovery
3. **Social Learning**: Receive advice from Mom → Immediate addiction/awareness adjustment
4. **Behavioral Learning**: Recognize patterns → Avoid repeating mistakes with NPCs
5. **Experiential Learning**: Track compulsive behaviors → Inform FSM outcomes

---

## 7.5 Trait 5: Searching / Pathfinding

**Location:** `src/scenes/RealWorldScene.js` (`_updateNPCWander`, `_npcDecideToApproach`, `_steerNPCToward`)

**Description:**
NPCs exhibit autonomous behaviour including **random wander pathfinding** and **goal-directed seek steering** toward Steve. The seek steering algorithm normalises a direction vector and moves the NPC at a fixed speed toward a target — a classic AI pathfinding technique. When rain occurs, NPCs pathfind to the bench for shelter, demonstrating environment-responsive navigation.

**Wander Behaviour (Random Pathfinding):**
```javascript
_updateNPCWander() {
  this._npcs.forEach(npc => {
    if (npc._seekingPlayer) return; // goal-directed pathfinding overrides wander

    npc._wanderTimer = (npc._wanderTimer || 0) + 1;

    if (npc._wanderTimer > 240) { // pick new target every ~4 seconds
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

**Seek Steering Algorithm (Goal-Directed Pathfinding):**
```javascript
// Normalised direction vector × speed — classic seek steering
_steerNPCToward(npc, tx, ty) {
  const dx = tx - npc.x;
  const dy = ty - npc.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 5) return; // arrived at target

  const speed = this.NPC_WANDER_SPEED; // 0.6 px/frame
  npc.x += (dx / dist) * speed; // normalised direction × speed
  npc.y += (dy / dist) * speed;
  if (npc.drawNPC) npc.drawNPC(npc.emotion);
}
```

**Decision to Approach Steve:**
```javascript
// NPC decides to seek Steve — pathfinds until within 80px, then speaks
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
        this._npcSpeak(npc); // arrived — initiate dialogue
      } else {
        this._steerNPCToward(npc, this.agent.x, this.agent.y); // keep seeking
      }
    },
    loop: true
  });
}
```

**Rain-Triggered Shelter Pathfinding:**
```javascript
// When rain starts, all NPCs pathfind to the bench for shelter
this._npcs.forEach(npc => {
  npc._seekingPlayer = false;
  npc._wanderTarget = { x: this._w * 0.63, y: this._groundY - 20 }; // bench position
});
```

**Walk-to-Road Sequence (Scripted Pathfinding):**
At the end of RealWorldScene, Steve and all NPCs pathfind together toward the road using GSAP tweens — a coordinated multi-agent movement sequence that transitions to the EndScene.

---

## 7.6 Trait 6: Decision Making

**Location:** `src/agent/FSM.js`, `src/scenes/AttractionScene.js`, `src/scenes/RealWorldScene.js`

**Description:**
Decision making operates at two levels: **player-driven decisions** at key narrative choice points, and **AI-driven decisions** made autonomously by the FSM and NPCs. The FSM's outcome resolution is the core decision-making system — it evaluates accumulated behaviour counters and emotional state to determine which of three endings Steve reaches. The simulation is **non-linear**: the same scenario plays out differently depending on the decisions made.

**Player Decision Points:**

| Decision Point | Options | Consequence |
|----------------|---------|-------------|
| Start of AttractionScene | Walk to door (F key) OR pick up phone (E key) | Determines RealWorldScene vs addiction path |
| At 70% addiction | Accept learning OR Later (continue scrolling) | Triggers LearningScene or continuous scroll mode |
| At 100% addiction | Click learning key | Forces redemptive LearningScene path |
| In RealWorldScene | Engage NPCs (T key) OR ignore them | Affects relationship level and FSM outcome |
| Notification bell | Click OR ignore | Increases addiction and triggers NPC sadness |
| LearningScene tasks | Complete (SPACE) OR abandon | Determines learning benefits and return state |

**FSM Autonomous Decision Making:**
```javascript
// FSM._resolveOutcome() — AI evaluates behaviour and decides ending
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

**NPC Autonomous Decision Making:**
```javascript
// NPCs decide whether to approach Steve based on context
_npcDecideToApproach(npc) {
  if (npc._seekingPlayer || npc.bubble) return; // already engaged — no action
  // Decision: approach Steve and initiate dialogue
  npc._seekingPlayer = true;
  // ... seek and speak
}

// NPCs decide what to say based on Steve's state
_npcSpeak(npc) {
  if (this._avoidedNPC === npc.id) return;           // learned avoidance decision
  if (mom && addiction > 60 && !_adviceGiven)         // advice decision
    → _giveAdvice()
  else if (phoneVisible && addiction > 50)            // angry response decision
    → use angryLines
  else                                                // friendly response decision
    → use normal lines
}
```

**Random Event Decision Making:**
The `_triggerRandomEvent()` method fires every 8 seconds with probability-weighted outcomes, making the simulation unpredictable:
```javascript
_triggerRandomEvent() {
  const roll = Math.random();
  if      (roll < 0.25) → dusk falls (vision narrows)
  else if (roll < 0.45) → wind gust (NPC comments)
  else if (roll < 0.60) → rain starts (NPCs seek shelter)
  else if (roll < 0.75) → random NPC approaches Steve
  else if (roll < 0.88) → Steve hears an NPC calling
  else                  → nothing happens
}
```

**Three Alternative Endings (Non-Linear Outcomes):**

| Ending | Condition | Visual |
|--------|-----------|--------|
| **RECOVERED** | resistCount ≥ engageCount AND happiness > 45 | Green shirt, smile, upright posture |
| **LOST** | ignoredFriends ≥ 3 OR loneliness > 70 | Dark grey, minimal expression, hunched |
| **PARTIAL** | Default (mixed behaviour) | Amber shirt, neutral expression |

---

## 7.7 Real-World Physics Summary

EchoSphere implements the following real-world physics models:

| Physics Model | Implementation | Real-World Analogy |
|---------------|---------------|-------------------|
| Vision cone | Trigonometric angle calculation (±45°, 200px) | Human peripheral vision (~90° effective FOV) |
| Hearing range | Omnidirectional circle (150px) | Sound propagates in all directions |
| Dusk vision reduction | visionRange × 0.55 | Reduced visibility in low light |
| Phone distraction | visionRange × 0.6 when addiction > 40 | Divided attention narrows perception |
| Posture compression | hunchScaleY = 1 - hunch × 0.06 | Documented physical effect of phone use on posture |
| Seek steering | Normalised direction vector × speed | Realistic goal-directed movement |
| Emotion homeostasis | Drift-back-to-baseline model | Psychological emotional regulation |
| Stochastic events | Probability-weighted random events | Unpredictable real-world occurrences |

```javascript
// Hunch physics — posture compresses vertically with addiction
const hunchScaleY = 1 - hunch * 0.06; // body compresses vertically
this.container.setScale(this._facingRight ? 1 : -1, hunchScaleY);
// hunchLevel 0 → scale 1.0 (upright)
// hunchLevel 4 → scale 0.76 (24% compression — fully hunched)
```

---

## 7.8 Trait Coverage Summary

| Required Trait | Implemented | Location | Key Features |
|----------------|-------------|----------|--------------|
| **Perceptions** (see, hear, sense) | ✅ | `RealWorldScene.js`, `Agent.js`, `AttractionScene.js` | Vision cone + hearing range + proximity sensing + eye movement response to audio |
| **Emotional intelligence** | ✅ | `EmotionSystem.js`, `FSM.js`, `RealWorldScene.js` | EmotionSystem + NPC emotional reactions + inter-agent contagion + context-sensitive responses |
| **Natural language communication** | ✅ | `RealWorldScene.js` | Speech bubbles, 7-line dialogue, context-sensitive NPC lines, group conversations |
| **Learning** | ✅ | `Agent.js`, `RealWorldScene.js`, `LearningScene.js`, `AttractionScene.js` | Memory array, advice retention, NPC avoidance, educational tasks, redemption system |
| **Searching / Pathfinding** | ✅ | `RealWorldScene.js` | Seek steering, random wander, rain shelter pathfinding, group movement coordination |
| **Decision making** | ✅ | `FSM.js`, `AttractionScene.js`, `RealWorldScene.js`, `LearningScene.js` | FSM outcome resolution, educational choices, redemption opportunities, NPC autonomous decisions |
| **Real-world physics** | ✅ | `RealWorldScene.js`, `Agent.js` | Vision cone trigonometry, hearing range, dusk/distraction modifiers, posture compression, eye movement |

**Additional Intelligence Features:**
- **Adaptive Behavior**: Auto-scroll system that adapts to addiction level
- **State Persistence**: Memory and learning transfer across scenes  
- **Recovery Mechanisms**: Multiple pathways for learning and redemption
- **Environmental Awareness**: Dusk effects, weather responses, spatial navigation
- **Multi-Modal Interaction**: Visual, auditory, and proximity-based perception systems
