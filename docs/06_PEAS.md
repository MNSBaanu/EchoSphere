# 6. PEAS — Performance, Environment, Actuators, Sensors

PEAS is a framework for describing intelligent agents. EchoSphere contains multiple agents, each described below.

---

## 6.1 Primary Agent — Steve (Player-Controlled with AI Behaviour)

| Component | Description |
|-----------|-------------|
| **Performance** | Maximise real-world engagement (relationship level, awareness) while minimising digital addiction. Success = reaching RECOVERED state or completing the learning path. Failure = reaching LOST state or 100% addiction without recovery. |
| **Environment** | Bedroom (Scenario 1), outdoor park (Scenario 2), study room (Scenario 3). Partially observable (vision cone limits what Steve can see). Stochastic (random events affect the environment). Sequential (past actions affect future states). Dynamic (NPCs move, notifications arrive, weather changes). Continuous (smooth movement and emotion values). |
| **Actuators** | Movement (keyboard WASD/arrows), phone pickup (E key), door interaction (proximity), scrolling (mouse wheel), task completion (SPACE key), conversation advancement (T key). Visual representation changes with FSM state (posture, skin tone, expression). |
| **Sensors** | Vision cone (200px range, ±45° angle), hearing range (150px omnidirectional), proximity detection (phone: 40px X-axis, door: 70px radius, NPC: 90px), notification perception (within 90px of notification objects). |

### Performance Metrics (Steve)
- `addictionLevel` (0–100): Primary addiction metric
- `awareness` (0–100): Cognitive clarity, decreases with phone use
- `relationshipLevel` (0–100): Social connection quality
- `memory[]`: Learned behavioural patterns
- FSM state: IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT → outcome

---

## 6.2 NPC Agent — Mom

| Component | Description |
|-----------|-------------|
| **Performance** | Maintain positive relationship with Steve. Give advice when addiction is high. React appropriately to Steve's phone use. |
| **Environment** | Outdoor park. Aware of Steve's position and phone visibility. Responds to other NPCs' emotional states. |
| **Actuators** | Movement (autonomous wander, approach Steve when ignored), speech bubbles (dialogue lines, angry lines, advice), emotional expression (happy/sad/angry face redraw), position updates via getter/setter. |
| **Sensors** | Proximity to Steve (within 80px triggers speech after approach), Steve's addiction level (> 60 triggers advice), Steve's phone visibility (triggers angry/sad lines), other NPCs' emotions (contagious happiness). |

### Mom's Dialogue States
- **Happy** (default): Positive greeting lines
- **Angry** (phone visible, addiction > 75): Confrontational lines
- **Sad** (phone visible, addiction 50–75): Disappointed lines
- **Advice** (addiction > 60, first time only): "Put the phone down. Real moments matter more. 💚"

---

## 6.3 NPC Agent — Alex (Friend)

| Component | Description |
|-----------|-------------|
| **Performance** | Engage Steve in social interaction. React to phone use. Support other NPCs when they are upset. |
| **Environment** | Outdoor park. Wanders autonomously. Perceives Steve's proximity and phone state. |
| **Actuators** | Autonomous wander (60px spread, new target every 4s), speech bubbles, emotional expression, approach behaviour (if ignored), excited walk during trip sequence. |
| **Sensors** | Steve proximity (90px for interaction), Steve's phone visibility, other NPCs' emotional states (responds with support lines when Mom is angry). |

---

## 6.4 NPC Agent — Sam (Sibling)

| Component | Description |
|-----------|-------------|
| **Performance** | Seek play and help from Steve. React negatively to phone distraction. Participate in group activities. |
| **Environment** | Outdoor park. Smallest wander range. Most emotionally reactive to Steve's phone use. |
| **Actuators** | Wander movement, speech bubbles (play-focused lines), emotional expression, approach behaviour, group walk animation. |
| **Sensors** | Steve proximity, phone visibility, group emotional state (contagious happiness from other NPCs). |

---

## 6.5 System Agent — Social Media Feed (AttractionScene)

| Component | Description |
|-----------|-------------|
| **Performance** | Maximise Steve's engagement time. Increase addiction level. Trigger auto-scroll when addiction threshold is reached. |
| **Environment** | Mobile phone screen. Scrollable feed with 13+ notification items. |
| **Actuators** | Feed display (notification cards with icons and text), progress bar (addiction visualisation), auto-scroll (speed proportional to addiction), educational notification (at 70%), fail notification (at 100%), learning key (after fail). |
| **Sensors** | Scroll events (mouse wheel), addiction level threshold checks (50% for auto-scroll, 70% for decision, 100% for fail), time elapsed (8s for educational notification in original design). |

---

## 6.6 PEAS Summary Table

| Agent | Performance Measure | Environment | Actuators | Sensors |
|-------|--------------------|-----------|-----------|---------| 
| **Steve** | Awareness, relationship, FSM outcome | Bedroom, park, study room | Movement, phone pickup, scrolling, task completion | Vision cone (200px ±45°), hearing range (150px), proximity detection (90px) |
| **Mom** | Relationship maintenance, advice delivery | Outdoor park | Wander, speech bubbles, emotion display, approach, advice dialogue | Steve proximity, addiction level, phone visibility, other NPC emotions |
| **Alex** | Social engagement, emotional support | Outdoor park | Wander, speech bubbles, emotion display, approach | Steve proximity, phone visibility, NPC emotions |
| **Sam** | Play engagement, group participation | Outdoor park | Wander, speech bubbles, emotion display, approach | Steve proximity, phone visibility, group emotions |
| **Feed System** | Addiction maximisation | Phone screen | Feed display, auto-scroll, notifications, decision popups | Scroll events, addiction thresholds (50%, 70%, 100%) |

---

## 6.7 Intelligence Traits Mapped to PEAS

| Intelligence Trait | Agent | PEAS Component |
|-------------------|-------|---------------|
| **Perceptions** (vision, hearing, sensing) | Steve | Sensors: vision cone, hearing range, proximity |
| **Emotional Intelligence** | Steve + all NPCs | Performance + Actuators: emotion-driven behaviour and NPC reactions |
| **Natural Language Communication** | All NPCs + Steve | Actuators: speech bubbles, context-sensitive dialogue, 7-line conversation |
| **Learning** | Steve | Performance: memory array, advice retention, NPC avoidance |
| **Searching / Pathfinding** | All NPCs | Actuators: seek steering, wander, shelter pathfinding |
| **Decision Making** | Steve (FSM) + NPCs | Performance: FSM outcome resolution, player choice nodes, NPC autonomous decisions |

---

## 6.8 Environment Properties

| Property | Value | Justification |
|----------|-------|---------------|
| **Observability** | Partially observable | Vision cone limits what Steve perceives; NPCs outside range are not perceived |
| **Determinism** | Stochastic | Random events (dusk, rain, wind, NPC approach) occur with probability |
| **Episodicity** | Sequential | Past actions (memory, addiction level, relationship) affect future states |
| **Dynamism** | Dynamic | NPCs move autonomously; notifications arrive; weather changes |
| **Continuity** | Continuous | Smooth movement, continuous emotion values, real-time addiction progression |
| **Agent count** | Multi-agent | Steve + 3 NPCs + Feed System all operate simultaneously |
