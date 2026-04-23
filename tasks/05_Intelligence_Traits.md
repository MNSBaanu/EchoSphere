# 05 — Intelligence Traits Description with Code Snippets

---

## 5.1 Perception

**Description:**
Kai detects incoming stimuli from the environment — notifications, nearby NPCs, and objects. Perception is not omniscient: in the Real World scene, Kai can only perceive NPCs within his vision cone (90° field of view) or hearing range (150px). On the phone, perception is limited to the feed itself.

**Implementation — Notification Perception (AttractionScene / Agent.js):**
```javascript
// Agent._perceive() — called every frame
_perceive() {
  if (!this.scene.notifications) return;
  if (this._perceptionCooldown > 0) return;

  this.scene.notifications.forEach(n => {
    if (!n.active || n._seen) return;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, n.x, n.y);
    if (dist < 90) {
      this.fsm.handleEvent('NOTIFICATION_SEEN');
      this._perceptionCooldown = 50;
      n._seen = true;
    }
  });
}
```

**Implementation — Vision Cone (RealWorldScene.js):**
```javascript
_updateVisionCone() {
  let range = this.VISION_RANGE; // 200px default
  if (this._timeOfDay === 'dusk') range *= 0.55;
  if (this._phoneVisible && this._addictionLevel > 40) range *= 0.6;

  const facingAngle = this.agent._facingRight ? 0 : Math.PI;
  const halfCone = Phaser.Math.DegToRad(this.VISION_ANGLE / 2); // 45°

  // Draw cone
  g.fillStyle(0xffd700, 1);
  g.beginPath();
  g.moveTo(ax, ay);
  for (let i = 0; i <= 16; i++) {
    const a = (facingAngle - halfCone) + (i / 16) * (halfCone * 2);
    g.lineTo(ax + Math.cos(a) * range, ay + Math.sin(a) * range);
  }
  g.closePath();
  g.fillPath();
}
```

**Key insight:** Vision range shrinks at dusk AND when the phone is out — modeling how phone use reduces real-world awareness.

---

## 5.2 Decision Making

**Description:**
Every major action in EchoSphere is a decision point. The FSM handles event-driven decisions. At key moments, the player is presented with a decision node UI. The agent also makes autonomous decisions (e.g. approaching the phone after curiosity timeout).

**Implementation — FSM Event Handler (FSM.js):**
```javascript
handleEvent(eventName) {
  switch (this.state) {
    case 'ATTRACTED':
      if (eventName === 'NOTIFICATION_SEEN') {
        this.agent.emotions.applyEvent({ happiness: 6, stress: 1 });
        this.engageCount++;
        if (this.engageCount >= 5) {
          this._transition('LOOPING', 'repeated engagement — habit forming');
        }
      }
      if (eventName === 'PLAYER_RESIST') {
        this.agent.emotions.applyEvent({ happiness: -5, loneliness: 3 });
        this.resistCount++;
        if (this.resistCount >= 3) {
          this._transition('LOOPING', 'player resisted — but loop already forming');
        }
      }
      break;
  }
}
```

**Implementation — Behavior-Based Transition (AttractionScene.js):**
```javascript
// NOT time-based — multiple conditions must be met
if (!this._continuousScrollMode && (
    this.agent.addictionLevel >= 100 ||
    (this.agent.addictionLevel > 85 && this.agent.ignoredMessages >= 2) ||
    (this.agent.awareness < 20 && this.agent.addictionLevel > 80))) {

  this._log('🌀 Transition', `Addiction: ${this.agent.addictionLevel.toFixed(0)}%,
    Ignored: ${this.agent.ignoredMessages},
    Awareness: ${this.agent.awareness.toFixed(0)}%`);

  this.time.delayedCall(800, () => {
    this._transitionToRealWorld();
  });
}
```

**Implementation — Outcome Resolution (FSM.js):**
```javascript
_resolveOutcome() {
  const e = this.agent.emotions;
  if (this.resistCount >= this.engageCount && e.happiness > 45) {
    this._transition('RECOVERED', 'resisted more than engaged — recovered');
  } else if (this.ignoredFriends >= 3 || e.loneliness > 70) {
    this._transition('LOST', 'too isolated — lost in the loop');
  } else {
    this._transition('PARTIAL', 'mixed behaviour — partial recovery');
  }
}
```

---

## 5.3 Emotional Intelligence

**Description:**
Kai tracks three emotional dimensions — stress, happiness, loneliness — that drift toward baselines and are perturbed by events. These values influence FSM transitions, NPC reactions, and visual appearance.

**Implementation — EmotionSystem.js:**
```javascript
export default class EmotionSystem {
  constructor() {
    this.stress    = 10;   // baseline
    this.happiness = 60;   // baseline
    this.loneliness = 20;  // baseline
  }

  // Called every frame — values drift back toward baseline
  update() {
    this.stress     = this._drift(this.stress,     10,  0.008);
    this.happiness  = this._drift(this.happiness,  60,  0.005);
    this.loneliness = this._drift(this.loneliness, 20,  0.005);
  }

  _drift(current, baseline, rate) {
    if (current > baseline) return Math.max(baseline, current - rate);
    if (current < baseline) return Math.min(baseline, current + rate);
    return current;
  }

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

**Implementation — Phone use impacts emotions (Agent.js):**
```javascript
usePhone(deltaTime = 1) {
  this.timeOnPhone += deltaTime;
  this.addictionLevel = Math.min(100, this.addictionLevel + 0.15);
  this.awareness = Math.max(0, this.awareness - 0.12);
  this.emotions.applyEvent({ stress: 0.08, happiness: -0.05 });
}

onScroll() {
  this.scrollCount++;
  this.addictionLevel = Math.min(100, this.addictionLevel + 0.3);
  this.awareness = Math.max(0, this.awareness - 0.2);
  this.emotions.applyEvent({ stress: 0.1 });
}
```

**NPC emotional reactions (RealWorldScene.js):**
```javascript
// NPC switches to angry/sad if Kai has phone out
if (this._phoneVisible && this._addictionLevel > 50) {
  npc.emotion = this._addictionLevel > 75 ? 'angry' : 'sad';
  // Redraws NPC with furrowed brows, frown, red iris
  npc.drawNPC(npc.emotion);
}
```

---

## 5.4 Learning

**Description:**
The Learning system stores behavioral patterns in `agent.memory[]`. These patterns persist across scenes and influence future behavior. Mom's advice is given only once. Avoided NPCs are remembered. Bad grade memory drives the return to studies.

**Implementation — Pattern Recognition (Agent.js):**
```javascript
_updateAIVariables() {
  // Learning: Store behavioral patterns
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
```

**Implementation — Mom's advice (one-time learning, RealWorldScene.js):**
```javascript
_giveAdvice(npc) {
  if (this._adviceGiven || npc.id !== 'mom') return;
  this._adviceGiven = true;

  // Kai learns — store in memory
  if (this.agent && !this.agent.memory.includes('mom_advice')) {
    this.agent.memory.push('mom_advice');
    this._log('🧠 Kai learned: mom_advice — will not ignore Mom again');
  }

  // Addiction drops significantly after advice
  this._addictionLevel = Math.max(0, this._addictionLevel - 20);
  this._awareness = Math.min(100, this._awareness + 15);
}
```

**Implementation — Memory-based NPC avoidance (RealWorldScene.js):**
```javascript
_npcSpeak(npc) {
  // Skip NPC Kai decided to avoid
  if (this._avoidedNPC === npc.id) {
    this._log(`🧠 Kai remembers avoiding ${npc.name} — walking away`);
    return;
  }
  // ...
}
```

---

## 5.5 Natural Language Communication

**Description:**
NPCs communicate through context-aware dialogue. The dialogue system selects lines based on Kai's addiction level, phone visibility, and whether this is a returning visit. NPCs use different emotional registers (happy, neutral, sad, angry).

**Implementation — Context-aware NPC speech (RealWorldScene.js):**
```javascript
_npcSpeak(npc) {
  const isReturningVisit = this._learnedNPCs.has(npc.id);

  // Emotional Intelligence: NPC reacts to phone addiction
  let line;
  if (this._phoneVisible && this._addictionLevel > 50) {
    npc.emotion = this._addictionLevel > 75 ? 'angry' : 'sad';
    const angryLines = npc.data.angryLines;
    line = angryLines[Math.floor(Math.random() * angryLines.length)];
  } else {
    // Normal dialogue — advances through lines on each visit
    line = npc.data.lines[npc.lineIndex % npc.data.lines.length];
    npc.lineIndex++;
    npc.emotion = 'happy';
  }

  this._learnedNPCs.add(npc.id);
  this._createSpeechBubble(npc.x, npc.y - 55, line, npc.data.color, npc.emotion);
}
```

---

## 5.6 Pathfinding

**Description:**
Kai navigates to the phone and door using auto-walk with threshold detection. NPCs use a seek behavior to approach Kai when ignored. NPC wander uses a timer-based target selection within a bounded zone.

**Implementation — Agent auto-walk (AttractionScene.js):**
```javascript
_walkAgentToTarget(targetX, targetY, threshold, callback) {
  if (!this.agent) return;
  const dx = targetX - this.agent.x;
  const dy = targetY - this.agent.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < threshold) {
    if (callback) callback();
  } else {
    const speed = 2;
    this.agent.x += (dx / dist) * speed;
    this.agent.y += (dy / dist) * speed;
  }
}
```

**Implementation — NPC seek behavior (RealWorldScene.js):**
```javascript
_npcDecideToApproach(npc) {
  npc._seekingPlayer = true;

  const seekInterval = this.time.addEvent({
    delay: 50,
    callback: () => {
      const dx = this.agent.x - npc.x;
      const dy = this.agent.y - npc.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
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

_steerNPCToward(npc, tx, ty) {
  const dx = tx - npc.x;
  const dy = ty - npc.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 5) return;
  const speed = this.NPC_WANDER_SPEED; // 0.6 px/frame
  npc.x += (dx / dist) * speed;
  npc.y += (dy / dist) * speed;
  if (npc.drawNPC) npc.drawNPC(npc.emotion);
}
```

**Implementation — NPC wander (RealWorldScene.js):**
```javascript
_updateNPCWander() {
  this._npcs.forEach(npc => {
    if (npc._seekingPlayer) return;
    npc._wanderTimer = (npc._wanderTimer || 0) + 1;

    if (npc._wanderTimer > 240) { // ~4 seconds at 60fps
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
