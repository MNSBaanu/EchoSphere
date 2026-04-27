# 06 — Algorithm & Flow Charts

---

## 6.1 Master Algorithm — Per-Frame Update Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                    GAME LOOP (60fps)                             │
│                  Phaser Scene.update()                           │
└──────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  scene._ended?  │──YES──► STOP
                   └────────┬────────┘
                            │ NO
                            ▼
                   ┌─────────────────┐
                   │  agent.update() │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       fsm.update()  emotions.update()  _handleInput()
              │             │             │
              ▼             ▼             ▼
       Check state    Drift values    Read keyboard
       timeouts       to baseline     Move agent
              │             │             │
              └─────────────┴─────────────┘
                            │
                            ▼
                   _perceive()
                   (check notification proximity)
                            │
                            ▼
                   _updateAIVariables()
                   (addiction decay, awareness recovery,
                    hunch update, learning patterns)
                            │
                            ▼
                   _updateVisuals()
                   (redraw character, update state badge,
                    glitch offset, perception ring)
                            │
                            ▼
                   _syncHUD()
                   (update DOM: stress, happiness,
                    loneliness bars, state badge)
                            │
                            ▼
              ┌─────────────────────────────┐
              │  Scene-specific update()    │
              │  (proximity checks,         │
              │   auto-scroll, conflict,    │
              │   vision cone, NPC wander)  │
              └─────────────────────────────┘
```

---

## 6.2 Addiction Algorithm

```
START: addictionLevel = 0, awareness = 70

EVERY FRAME (phone screen open):
┌─────────────────────────────────────────────────────┐
│  addictionLevel += 0.15                              │
│  awareness -= 0.12                                   │
│  stress += 0.08                                      │
│  happiness -= 0.05                                   │
└─────────────────────────────────────────────────────┘

ON SCROLL EVENT:
┌─────────────────────────────────────────────────────┐
│  addictionLevel += 0.3                               │
│  awareness -= 0.2                                    │
│  stress += 0.1                                       │
│  scrollCount++                                       │
└─────────────────────────────────────────────────────┘

EVERY FRAME (phone NOT open):
┌─────────────────────────────────────────────────────┐
│  addictionLevel -= 0.02  (natural decay)             │
│  awareness += 0.05       (natural recovery)          │
└─────────────────────────────────────────────────────┘

HUNCH LEVEL UPDATE:
┌─────────────────────────────────────────────────────┐
│  addiction > 80 → hunchLevel = 4                     │
│  addiction > 60 → hunchLevel = 3                     │
│  addiction > 40 → hunchLevel = 2                     │
│  addiction > 20 → hunchLevel = 1                     │
│  else           → hunchLevel = 0                     │
└─────────────────────────────────────────────────────┘

AUTO-SCROLL CHECK:
┌─────────────────────────────────────────────────────┐
│  IF addiction > 50 AND NOT continuousScrollMode:     │
│    autoScrollEnabled = true                          │
│    speed = ((addiction - 50) / 50) * 2               │
│    scrollOffset += speed (clamped to maxOffset)      │
└─────────────────────────────────────────────────────┘

TRANSITION CHECK:
┌─────────────────────────────────────────────────────┐
│  IF NOT continuousScrollMode AND (                   │
│    addiction >= 100 OR                               │
│    (addiction > 85 AND ignoredMessages >= 2) OR      │
│    (awareness < 20 AND addiction > 80)               │
│  ):                                                  │
│    delay 800ms → transitionToRealWorld()             │
└─────────────────────────────────────────────────────┘
```

---

## 6.3 FSM Transition Algorithm

```
INPUT: eventName (string)
STATE: current FSM state

┌─────────────────────────────────────────────────────┐
│  SWITCH (current state):                             │
│                                                      │
│  IDLE:                                               │
│    NOTIFICATION_SEEN → happiness+8, stress+2         │
│                      → engageCount++                 │
│                      → transition to ATTRACTED       │
│    RANDOM_GOOD       → happiness+5, loneliness-5     │
│                      → reset idle timer              │
│                                                      │
│  ATTRACTED:                                          │
│    NOTIFICATION_SEEN → happiness+6, stress+1         │
│                      → engageCount++                 │
│                      → IF engageCount >= 5:          │
│                          transition to LOOPING       │
│    PLAYER_RESIST     → happiness-5, loneliness+3     │
│                      → resistCount++                 │
│                      → IF resistCount >= 3:          │
│                          transition to LOOPING       │
│    PLAYER_ENGAGE     → happiness+8, stress+3         │
│                      → engageCount++                 │
│                      → IF engageCount >= 4:          │
│                          transition to LOOPING       │
│    RANDOM_BAD        → happiness+15, stress+8        │
│                      → engageCount += 2              │
│                      → IF engageCount >= 5:          │
│                          transition to LOOPING       │
│                                                      │
│  LOOPING:                                            │
│    FRIEND_IGNORED    → loneliness+12, stress+5       │
│                      → ignoredFriends++              │
│    PLAYER_RESIST     → stress-8, happiness-3         │
│                      → resistCount++                 │
│    (timer > 600)     → stress >= 65:                 │
│                          transition to DISTORTED     │
│                                                      │
│  BREAKING_POINT:                                     │
│    (timer > 180)     → _resolveOutcome()             │
│      resistCount >= engageCount AND happiness > 45   │
│        → RECOVERED                                   │
│      ignoredFriends >= 3 OR loneliness > 70          │
│        → LOST                                        │
│      else → PARTIAL                                  │
└─────────────────────────────────────────────────────┘
```

---

## 6.4 NPC Perception Algorithm

```
INPUT: Kai position (ax, ay), facing direction, addictionLevel, timeOfDay

FOR EACH NPC:
┌─────────────────────────────────────────────────────┐
│  dx = npc.x - ax                                     │
│  dy = npc.y - ay                                     │
│  dist = sqrt(dx² + dy²)                              │
│  angleToNPC = atan2(dy, dx)                          │
│  angleDiff = |wrap(angleToNPC - facingAngle)|        │
│                                                      │
│  visionRange = 200                                   │
│  IF timeOfDay == 'dusk': visionRange *= 0.55         │
│  IF phoneVisible AND addiction > 40: range *= 0.6    │
│                                                      │
│  canSee = dist < visionRange AND angleDiff < 45°     │
│  canHear = dist < 150                                │
│                                                      │
│  IF (canSee OR canHear) AND NOT npc._perceived:      │
│    npc._perceived = true                             │
│    IF first time: log "👁 Kai noticed [name]"        │
│                                                      │
│  IF NOT canSee AND NOT canHear:                      │
│    npc._perceived = false                            │
└─────────────────────────────────────────────────────┘
```

---

## 6.5 Learning Algorithm

```
INPUT: agent state variables (addictionLevel, ignoredMessages, scrollCount)
OUTPUT: memory[] array updated

EVERY FRAME:
┌─────────────────────────────────────────────────────┐
│  IF addictionLevel > 80                              │
│     AND 'high_addiction' NOT IN memory:              │
│    memory.push('high_addiction')                     │
│    console.log('🧠 Agent learned: high_addiction')   │
│                                                      │
│  IF ignoredMessages >= 2                             │
│     AND 'social_neglect' NOT IN memory:              │
│    memory.push('social_neglect')                     │
│    console.log('🧠 Agent learned: social_neglect')   │
│                                                      │
│  IF scrollCount > 50                                 │
│     AND 'compulsive_scrolling' NOT IN memory:        │
│    memory.push('compulsive_scrolling')               │
│    console.log('🧠 Agent learned: compulsive_...')   │
└─────────────────────────────────────────────────────┘

IN REAL WORLD (Mom interaction):
┌─────────────────────────────────────────────────────┐
│  IF npc.id == 'mom'                                  │
│     AND addictionLevel > 60                          │
│     AND adviceGiven == false:                        │
│    adviceGiven = true                                │
│    memory.push('mom_advice')                         │
│    addictionLevel -= 20                              │
│    awareness += 15                                   │
└─────────────────────────────────────────────────────┘
```

---

## 6.6 Study Task Algorithm (LearningScene)

```
INPUT: STUDY_TASKS array (5 tasks with subject, task, xp)
OUTPUT: XP accumulated, tasks completed

START:
  taskIdx = 0, xp = 0

LOOP:
┌─────────────────────────────────────────────────────┐
│  IF taskIdx >= 5: endScene('good')                   │
│                                                      │
│  task = STUDY_TASKS[taskIdx]                         │
│  showTaskCard(task)                                  │
│                                                      │
│  WAIT FOR SPACE KEY:                                 │
│    taskProgress.width += 18 per keypress             │
│    IF taskProgress.width >= maxWidth (288px):        │
│      completeTask(task)                              │
│        xp += task.xp                                 │
│        taskIdx++                                     │
│        xpBar.width = (xp / totalXP) * 260           │
│        burstParticles()                              │
│        delay 1000ms → next task                      │
│                                                      │
│  DISTRACTION CHECK (if addiction > threshold):       │
│    random notification fires                         │
│    IF player engages → back to Addiction path        │
└─────────────────────────────────────────────────────┘
```

---

## 6.7 Random Event Algorithm (RealWorldScene)

```
EVERY 8 SECONDS:
┌─────────────────────────────────────────────────────┐
│  roll = Math.random()                                │
│                                                      │
│  roll < 0.25:  DUSK                                  │
│    timeOfDay = 'dusk'                                │
│    orange overlay (alpha 0.22)                       │
│    vision range *= 0.55                              │
│    after 12s: restore day                            │
│                                                      │
│  roll < 0.45:  WIND                                  │
│    show horizontal streaks                           │
│    random NPC says wind comment                      │
│    after 3s: clear                                   │
│                                                      │
│  roll < 0.60:  RAIN                                  │
│    show rain drops                                   │
│    all NPCs seek bench (pathfind to 63% width)       │
│    after 8s: clear                                   │
│                                                      │
│  roll < 0.75:  NPC APPROACHES                        │
│    random NPC → _npcDecideToApproach()               │
│                                                      │
│  roll < 0.88:  HEARING EVENT                         │
│    IF random NPC within hearing range:               │
│      show speech bubble                              │
│      awareness += 8                                  │
│                                                      │
│  else: nothing (unpredictable world)                 │
└─────────────────────────────────────────────────────┘
```
