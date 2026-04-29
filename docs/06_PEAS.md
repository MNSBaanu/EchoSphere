# 6. PEAS — Performance, Environment, Actuators, Sensors

PEAS is a framework for describing intelligent agents. EchoSphere contains multiple agents, each described below.

---

## 6.1 Primary Agent — Steve (Player-Controlled with AI Behaviour)

| Component | Description |
|-----------|-------------|
| **Performance** | Maximise real-world engagement (relationship level, awareness) while minimising digital addiction. Success = reaching RECOVERED state or completing the learning path. Failure = reaching LOST state or 100% addiction without recovery. |
| **Environment** | Bedroom (AttractionScene), outdoor park (RealWorldScene), study room (LearningScene). Partially observable (vision cone limits what Steve can see). Stochastic (random events affect the environment). Sequential (past actions affect future states). Dynamic (NPCs move, notifications arrive, weather changes). Continuous (smooth movement and emotion values). |
| **Actuators** | Movement (keyboard WASD/arrows), phone pickup (E key), door interaction (F key), scrolling (mouse wheel), task completion (SPACE key), conversation advancement (T key). Visual representation changes with FSM state (posture, skin tone, expression). Eye movement (automatic response to notifications). |
| **Sensors** | Vision cone (200px range, ±45° angle, reduced at dusk), hearing range (150px omnidirectional), proximity detection (phone: 40px X-axis, door: 70px radius, NPC: 90px), notification perception (auditory response with eye tracking), environmental awareness (dusk reduces vision by 45%). |

### Performance Metrics (Steve)
- `addictionLevel` (0–100): Primary addiction metric, increases 0.15/frame during phone use
- `awareness` (0–100): Cognitive clarity, decreases 0.12/frame with phone use
- `stress` (0–100): Emotional pressure, increases 0.08/frame with phone use
- `relationshipLevel` (0–100): Social connection quality
- `memory[]`: Learned behavioural patterns (high_addiction, social_neglect, compulsive_scrolling, mom_advice, avoid_npc)
- FSM state: IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT → outcome

---

## 6.2 NPC Agent — Mom

| Component | Description |
|-----------|-------------|
| **Performance** | Maintain positive relationship with Steve. Give advice when addiction is high (>60%). React appropriately to Steve's phone use. Support family group conversations. |
| **Environment** | Outdoor park. Aware of Steve's position and phone visibility. Responds to other NPCs' emotional states. Participates in 7-line group conversation sequence. |
| **Actuators** | Movement (autonomous wander, approach Steve when ignored), speech bubbles (dialogue lines, angry lines, advice), emotional expression (happy/sad/angry face redraw), position updates via getter/setter, group walk animation to EndScene. |
| **Sensors** | Proximity to Steve (within 90px triggers interaction prompt), Steve's addiction level (>60 triggers one-time advice), Steve's phone visibility (triggers emotional reactions), conversation state (participates in structured dialogue). |

### Mom's Dialogue States
- **Happy** (default): "Hey! You actually came outside! 😊", "I made your favourite snack!"
- **Angry** (phone visible, addiction >50): "You are always on that phone!", "Can you please just be present?"
- **Advice** (addiction >60, once only): Reduces Steve's addiction by 20, increases awareness by 15
- **Group Conversation**: Participates in 7-line structured dialogue sequence

---

## 6.3 NPC Agent — Alex (Friend)

| Component | Description |
|-----------|-------------|
| **Performance** | Engage Steve in social interaction. React to phone use. Support group conversations and activities. |
| **Environment** | Outdoor park. Wanders autonomously. Perceives Steve's proximity and phone state. Participates in group dialogue. |
| **Actuators** | Autonomous wander (random targets every 4s), speech bubbles, emotional expression, approach behaviour (if ignored), group conversation participation, group walk to EndScene. |
| **Sensors** | Steve proximity (90px for interaction), Steve's phone visibility, conversation state, group emotional dynamics. |

### Alex's Dialogue
- **Happy**: "Yo! Finally offline? 😄", "We were about to start without you!"
- **Angry** (phone visible): "Seriously? You are checking your phone again?", "We are right here talking to you!"

---

## 6.4 NPC Agent — Sam (Sibling)

| Component | Description |
|-----------|-------------|
| **Performance** | Seek play and help from Steve. React negatively to phone distraction. Participate in group activities and conversations. |
| **Environment** | Outdoor park. Smallest wander range. Most emotionally reactive to Steve's phone use. |
| **Actuators** | Wander movement, speech bubbles (play-focused lines), emotional expression, approach behaviour, group conversation participation, group walk animation. |
| **Sensors** | Steve proximity, phone visibility, conversation state, group emotional state. |

### Sam's Dialogue
- **Happy**: "Can we play something together?", "You promised you would help me today!"
- **Angry** (phone visible): "You always ignore me for that phone!", "I do not matter to you anymore?"

---

## 6.5 System Agent — Social Media Feed (AttractionScene)

| Component | Description |
|-----------|-------------|
| **Performance** | Maximise Steve's engagement time. Increase addiction level. Trigger auto-scroll at 50% addiction. Provide learning opportunities at 70% and 100% thresholds. |
| **Environment** | Mobile phone screen. Scrollable feed with 12+ notification items. Educational and failure notification popups. |
| **Actuators** | Feed display (notification cards with icons and text), progress bar (addiction visualisation with color changes: green→yellow→red), auto-scroll (speed = (addiction-50)/50×2), educational notification (at 70%), fail notification (at 100%), learning key (redemption after failure). |
| **Sensors** | Scroll events (mouse wheel), addiction level threshold checks (50% for auto-scroll, 70% for educational popup, 100% for failure), user choice detection (Accept/Later buttons), learning key interaction. |

### Feed System States
- **Manual Scroll** (0-49% addiction): User controls scrolling
- **Auto-scroll** (50-69% addiction): System takes control, speed increases with addiction
- **Educational Opportunity** (70% addiction): Popup with Accept→LearningScene or Later→continuous scroll
- **Failure State** (100% addiction): Failure popup → Learning key → redemption path

---

## 6.6 System Agent — Learning Environment (LearningScene)

| Component | Description |
|-----------|-------------|
| **Performance** | Provide educational content about digital wellness. Reduce Steve's addiction and increase awareness through task completion. |
| **Environment** | Study room with desk, laptop, motivational posters, certificates. Calm, focused learning atmosphere. |
| **Actuators** | Task progress bars (2 tasks), SPACE key interaction, success notifications, state transfer back to AttractionScene with improved metrics. |
| **Sensors** | Task completion detection (SPACE key presses), progress tracking (0-100% per task), completion state monitoring. |

### Learning Outcomes
- **Successful Completion**: Reduces addiction by 30-40%, increases awareness by 25-35%
- **Memory Transfer**: Passes learned behaviors back to AttractionScene
- **State Restoration**: Returns Steve to bedroom with improved metrics

---

## 6.7 PEAS Summary Table

| Agent | Performance Measure | Environment | Actuators | Sensors |
|-------|--------------------|-----------|-----------|---------| 
| **Steve** | Awareness, relationship, addiction control, FSM outcome | Bedroom, park, study room | Movement, phone pickup, scrolling, task completion, eye movement | Vision cone (200px ±45°, reduced at dusk), hearing (150px), proximity (90px), notification audio |
| **Mom** | Relationship maintenance, advice delivery, group participation | Outdoor park | Wander, speech bubbles, emotion display, advice dialogue, group conversation | Steve proximity, addiction level, phone visibility, conversation state |
| **Alex** | Social engagement, group activities | Outdoor park | Wander, speech bubbles, emotion display, group conversation | Steve proximity, phone visibility, conversation state |
| **Sam** | Play engagement, group participation | Outdoor park | Wander, speech bubbles, emotion display, group conversation | Steve proximity, phone visibility, conversation state |
| **Feed System** | Addiction maximisation, learning opportunities | Phone screen | Feed display, auto-scroll, notifications, decision popups, learning key | Scroll events, addiction thresholds (50%, 70%, 100%), user choices |
| **Learning System** | Educational delivery, metric improvement | Study room | Task displays, progress tracking, success feedback | Task completion, SPACE key input, progress monitoring |

---

## 6.8 Intelligence Traits Mapped to PEAS

| Intelligence Trait | Agent | PEAS Component | Implementation |
|-------------------|-------|---------------|----------------|
| **Perceptions** | Steve | Sensors | Vision cone (200px ±45°), hearing range (150px), eye movement response to notifications, dusk vision reduction |
| **Emotional Intelligence** | Steve + all NPCs | Performance + Actuators | Emotion system (stress, happiness, loneliness), NPC emotional reactions to Steve's behavior |
| **Natural Language Communication** | All NPCs + Steve | Actuators | Speech bubbles, context-sensitive dialogue, 7-line structured group conversation |
| **Learning** | Steve | Performance | Memory array tracking patterns, advice retention, behavioral modification, mistake avoidance |
| **Searching / Pathfinding** | All NPCs | Actuators | Autonomous wander patterns, approach behaviors, group movement coordination |
| **Decision Making** | Steve + Feed System | Performance | FSM state transitions, educational choice popups, redemption opportunities, NPC autonomous decisions |

---

## 6.9 Environment Properties

| Property | Value | Justification |
|----------|-------|---------------|
| **Observability** | Partially observable | Vision cone limits perception; dusk reduces vision by 45%; NPCs outside range not perceived |
| **Determinism** | Stochastic | Random events (dusk, rain, wind) occur with probability; notification timing varies |
| **Episodicity** | Sequential | Past actions (memory, addiction, relationships) affect future states; learning transfers between scenes |
| **Dynamism** | Dynamic | NPCs move autonomously; notifications arrive; weather changes; auto-scroll activates |
| **Continuity** | Continuous | Smooth movement, continuous emotion/addiction values, real-time progression |
| **Agent count** | Multi-agent | Steve + 3 NPCs + Feed System + Learning System operate simultaneously |

---

## 6.10 Scene Transitions and State Persistence

| Transition | Data Transferred | Purpose |
|------------|------------------|---------|
| **AttractionScene → RealWorldScene** | addictionLevel, awareness, relationshipLevel, hasPhone, memory[] | Carry behavioral consequences to social interactions |
| **AttractionScene → LearningScene** | Current state for restoration | Enable learning intervention and return |
| **LearningScene → AttractionScene** | Reduced addiction, improved awareness, enhanced memory | Apply learning benefits and continue story |
| **RealWorldScene → EndScene** | Final state summary | Conclude journey with achieved outcomes |

This PEAS framework demonstrates how EchoSphere implements a sophisticated multi-agent system where each agent has clearly defined performance measures, environmental awareness, action capabilities, and sensory inputs, all working together to create an intelligent simulation of digital addiction and social interaction challenges.
