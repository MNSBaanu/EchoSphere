# 5. Flow — Scene and System Flows

## 5.1 Overall Game Flow

```
START
  │
  ▼
[BootScene]
  Title screen with EchoSphere branding
  Click anywhere to begin
  │
  ▼
[AttractionScene] ─────────────────────────────────────────────────┐
  Steve's bedroom                                                     │
  Phone notification fires at 300ms                                 │
  Social media icons appear                                         │
  │                                                                 │
  ├── Player walks to DOOR ──────────────────────────────────────► [RealWorldScene]
  │   (press near door)                                             │
  │                                                                 │
  └── Player walks to PHONE                                         │
      (press E near phone)                                          │
      │                                                             │
      ▼                                                             │
      Mobile Screen Opens                                           │
      Feed scrolling begins                                         │
      Addiction level rises                                         │
      │                                                             │
      ├── At 70% addiction:                                         │
      │   Learning notification popup                               │
      │   ├── "Accept" → [LearningScene] ──────────────────────────┤
      │   └── "Later" → Continue scrolling                         │
      │                                                             │
      └── At 100% addiction:                                        │
          Fail notification popup                                   │
          OK → Learning Key appears                                 │
          Click Key → [LearningScene] ───────────────────────────► │
                                                                    │
[LearningScene]                                                     │
  Study room                                                        │
  2 tasks (SPACE to fill progress)                                  │
  Complete all → Success card                                       │
  Click → Return to [AttractionScene] ◄──────────────────────────┘
  
[RealWorldScene]
  Outdoor park
  3 NPCs (Mom, Alex, Sam)
  Press T to advance conversation
  7 conversation lines
  After last line → NPCs and Steve walk to road
  │
  ▼
[EndScene]
  Journey Complete screen
  No restart — permanent end
```

---

## 5.2 Addiction Progression Flow (AttractionScene)

```
Phone Picked Up
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Every Frame (while mobile screen open):             │
│                                                      │
│  agent.usePhone()                                    │
│    addictionLevel += 0.15                            │
│    awareness      -= 0.12                            │
│    stress         += 0.08                            │
│                                                      │
│  _updateProgressBar()                                │
│    progress = addictionLevel                         │
│    bar colour: green → yellow → red                  │
│                                                      │
│  if addictionLevel > 50 AND not auto-scroll:         │
│    enable auto-scroll                                │
│                                                      │
│  if auto-scroll enabled:                             │
│    speed = (addictionLevel - 50) / 50 × 2           │
│    scrollOffset += speed                             │
└─────────────────────────────────────────────────────┘
      │
      ├── addictionLevel ≥ 70 AND not _decisionShown:
      │     _decisionPending = true  (PAUSE progress)
      │     Show educational notification popup
      │     ├── Accept → LearningScene
      │     └── Later  → _decisionPending = false (RESUME)
      │                   _continuousScrollMode = true
      │
      └── addictionLevel ≥ 100 AND not _failShown:
            Show fail notification
            OK → Show learning key
            Click key → LearningScene
```

---

## 5.3 NPC Perception and Interaction Flow (RealWorldScene)

```
Every Frame:
      │
      ▼
_updatePerception()
  For each NPC:
    dx = npc.x - agent.x
    dy = npc.y - agent.y
    dist = √(dx² + dy²)
    angleToNPC = atan2(dy, dx)
    angleDiff = |Wrap(angleToNPC - facingAngle)|
    
    canSee = dist < visionRange AND angleDiff < halfCone
    canHear = dist < hearingRange
    
    if (canSee OR canHear) AND not perceived:
      npc._perceived = true
      log "Steve noticed [NPC name]"
      
_updatePlayerProximity()
  For each NPC:
    if dist < 90 AND npc._perceived:
      show interact prompt [T]
      
Player presses T:
  if _convActive: → advance greeting conversation
  else if near NPC: → _npcSpeak(npc)
  
_npcSpeak(npc):
  if _convActive: return (blocked)
  if _avoidedNPC === npc.id: return (learned avoidance)
  if mom AND addiction > 60 AND not _adviceGiven:
    → _giveAdvice() (learning event)
  else:
    if phone visible AND addiction > 50:
      npc.emotion = angry/sad
      use angryLines
      _playerIgnoreCount++
      if _badInteractions ≥ 2: learn to avoid NPC
    else:
      npc.emotion = happy
      if returning visit: use returnLines
      else: use normal lines
      _playerEngageCount++
      _learnedNPCs.add(npc.id)
```

---

## 5.4 Learning System Flow

```
Agent Memory Array: []

Event: addictionLevel > 80
  → memory.push('high_addiction')
  → console: "Agent learned: high_addiction pattern"

Event: ignoredMessages ≥ 2
  → memory.push('social_neglect')
  → console: "Agent learned: social_neglect pattern"

Event: scrollCount > 50
  → memory.push('compulsive_scrolling')
  → console: "Agent learned: compulsive_scrolling pattern"

Event: Mom gives advice (RealWorldScene)
  → memory.push('mom_advice')
  → addictionLevel -= 20
  → awareness += 15
  → _adviceGiven = true (won't repeat)
  → console: "Steve learned: mom_advice"

Event: 2 bad interactions with same NPC
  → memory.push('avoid_[npcId]')
  → _avoidedNPC = npc.id
  → console: "Steve learned: avoid [name]"

Memory persists across scenes:
  AttractionScene → RealWorldScene:
    data.memory = [...agent.memory]
  RealWorldScene reads:
    this._memory = data.memory
    this.agent.memory = [...this._memory]
```

---

## 5.5 Emotion System Flow

```
Every Frame:
  EmotionSystem.update()
    stress     → drift toward baseline 10  (rate: 0.008/frame)
    happiness  → drift toward baseline 60  (rate: 0.005/frame)
    loneliness → drift toward baseline 20  (rate: 0.005/frame)

Events that modify emotions:
  NOTIFICATION_SEEN:   happiness +8,  stress +2
  FRIEND_MESSAGE:      happiness +10, loneliness -8
  FRIEND_IGNORED:      loneliness +8, happiness -5
  PLAYER_ENGAGE:       happiness +8,  stress +3
  PLAYER_RESIST:       happiness -5,  loneliness +3
  RANDOM_GOOD:         stress -5,     loneliness -5, happiness +3
  RANDOM_BAD:          happiness +15, stress +8

FSM checks emotions each frame:
  LOOPING state:
    stress ≥ 65 → transition to DISTORTED
  DISTORTED state:
    stress ≥ 85 → transition to BREAKING_POINT
  BREAKING_POINT resolution:
    happiness > 45 AND resistCount ≥ engageCount → RECOVERED
    loneliness > 70 OR ignoredFriends ≥ 3 → LOST
    else → PARTIAL
```

---

## 5.6 Greeting Conversation Flow (RealWorldScene)

```
Scene loads → 3 second delay → _startGreetings()

_convActive = true  (blocks all other NPC speech)

Hint text: "Press [T] to start conversation (0/7)"

Player presses T:
  index = 0, waiting = false
  → showMessage(0): Mom speaks
  → waiting = true
  → hint: "Press [T] for next (1/7)"

Player presses T again:
  → clearAllBubbles() (destroy previous)
  → showMessage(1): Sibling speaks
  → waiting = true
  → hint: "Press [T] for next (2/7)"

... continues for all 7 lines ...

Player presses T on last line (index = 7):
  → clearAllBubbles()
  → _convActive = false
  → _convTHandler = null
  → remove T key listener
  → 400ms delay → _agentWalkToRoad()

_agentWalkToRoad():
  Lock agent keys
  Tween Steve to position[1]
  Tween each NPC to their position
  NPCs redraw at new position each frame (pos getter/setter)
  After duration + 1000ms → _transitionToTrip()

_transitionToTrip():
  500ms delay → scene.start('EndScene')
```
