# 8. Algorithms — Flowcharts and Pseudocode

## 8.1 Main Game Loop Algorithm (Mermaid Flowchart)

```mermaid
flowchart TD
    A[Initialize Phaser Game Engine] --> B[Load Scenes: Boot, Attraction, RealWorld, Learning, End]
    B --> C[Start BootScene]
    C --> D[Game Loop - Every Frame ~16.67ms]
    
    D --> E{Current Scene?}
    E -->|AttractionScene| F[Call AttractionScene.update]
    E -->|RealWorldScene| G[Call RealWorldScene.update]
    E -->|LearningScene| H[Call LearningScene.update]
    E -->|BootScene| I[Call BootScene.update]
    E -->|EndScene| J[Call EndScene.update]
    
    F --> D
    G --> D
    H --> D
    I --> D
    J --> D
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style E fill:#fff3e0
```

## 8.2 Agent Update Algorithm (Mermaid Flowchart)

```mermaid
flowchart TD
    A[Agent.update Start] --> B[Call fsm.update - FSM timer transitions]
    B --> C[Call emotions.update - Drift toward baseline]
    C --> D[Call _handleInput - Process keyboard WASD/arrows]
    D --> E[Call _updateAIVariables - Update addiction, hunch, memory]
    
    E --> F{perceptionCooldown > 0?}
    F -->|Yes| G[Decrement perceptionCooldown]
    F -->|No| H[Agent.update Complete]
    G --> H
    
    style A fill:#e8f5e8
    style H fill:#fce4ec
```

## 8.3 FSM Transition Algorithm (Mermaid Flowchart)

```mermaid
flowchart TD
    A[FSM.handleEvent eventName] --> B{Current State?}
    
    B -->|IDLE| C{Event Type?}
    C -->|NOTIFICATION_SEEN| D[+8 happiness, +2 stress, engageCount++]
    D --> E[Transition to ATTRACTED]
    C -->|RANDOM_GOOD| F[+5 happiness, -5 loneliness, reset timer]
    F --> G[Stay in IDLE]
    
    B -->|ATTRACTED| H{Event Type?}
    H -->|NOTIFICATION_SEEN| I[+6 happiness, +1 stress, engageCount++]
    I --> J{engageCount >= 5?}
    J -->|Yes| K[Transition to LOOPING]
    J -->|No| L[Stay in ATTRACTED]
    H -->|PLAYER_RESIST| M[resistCount++, -5 happiness, +3 loneliness]
    H -->|RANDOM_GOOD| N[-5 stress, -5 loneliness, +3 happiness]
    
    B -->|LOOPING| O[+0.02 stress, +0.015 loneliness per frame]
    O --> P{stress >= 65?}
    P -->|Yes| Q[Transition to DISTORTED]
    P -->|No| R[Stay in LOOPING]
    
    B -->|DISTORTED| S[+0.04 stress, -0.03 happiness per frame]
    S --> T{stress >= 85?}
    T -->|Yes| U[Transition to BREAKING_POINT]
    T -->|No| V[Stay in DISTORTED]
    
    B -->|BREAKING_POINT| W{timer > 180 frames?}
    W -->|Yes| X[Call _resolveOutcome]
    W -->|No| Y[Continue in BREAKING_POINT]
    
    X --> Z{Outcome Logic}
    Z -->|resistCount >= engageCount AND happiness > 45| AA[Transition to RECOVERED]
    Z -->|ignoredFriends >= 3 OR loneliness > 70| BB[Transition to LOST]
    Z -->|Default mixed behavior| CC[Transition to PARTIAL]
    
    style A fill:#e1f5fe
    style E fill:#c8e6c9
    style K fill:#ffcdd2
    style Q fill:#ffcdd2
    style U fill:#ffcdd2
    style AA fill:#c8e6c9
    style BB fill:#ffcdd2
    style CC fill:#fff3e0
```

## 8.4 Addiction Progression Algorithm (Mermaid Flowchart)

```mermaid
flowchart TD
    A[Mobile Screen Open] --> B{Loop Conditions Met?}
    B -->|mobileScreenOpen AND NOT ended AND NOT decisionPending| C[Phone Usage Effects]
    B -->|No| Z[Exit Loop]
    
    C --> D[+0.15 addictionLevel, -0.12 awareness, +0.08 stress]
    D --> E[Update Progress Bar]
    E --> F{Progress Color}
    F -->|< 33%| G[Green Bar]
    F -->|33-66%| H[Yellow Bar]
    F -->|> 66%| I[Red Bar]
    
    G --> J{addictionLevel > 50?}
    H --> J
    I --> J
    
    J -->|Yes AND NOT autoScrollEnabled| K[Enable Auto-Scroll]
    J -->|No| L{Check Decision Triggers}
    
    K --> M{continuousScrollMode?}
    M -->|No| N[Calculate Scroll Speed: addictionLevel-50/50 × 2]
    M -->|Yes| L
    N --> O[Update Scroll Position]
    O --> L
    
    L --> P{addictionLevel >= 70 AND NOT decisionShown?}
    P -->|Yes| Q[Show Educational Popup, Pause Loop]
    P -->|No| R{addictionLevel >= 100 AND NOT failShown?}
    
    R -->|Yes| S[Show Fail Notification]
    R -->|No| B
    
    Q --> T{User Choice}
    T -->|Accept| U[Go to LearningScene]
    T -->|Later| V[Enable Continuous Scroll Mode]
    V --> B
    
    S --> W[Show Learning Key]
    W --> X[Go to LearningScene]
    
    style A fill:#e1f5fe
    style C fill:#ffcdd2
    style K fill:#fff3e0
    style Q fill:#c8e6c9
    style S fill:#ffcdd2
    style U fill:#c8e6c9
    style X fill:#c8e6c9
```

## 8.5 Perception Algorithm (Vision Cone) (Mermaid Flowchart)

```mermaid
flowchart TD
    A[Update Perception] --> B[Calculate Facing Angle]
    B --> C[Set Base Vision Range: 200px]
    C --> D{Time of Day?}
    D -->|Dusk| E[visionRange × 0.55]
    D -->|Day| F{Phone Visible AND addiction > 40?}
    E --> F
    F -->|Yes| G[visionRange × 0.6]
    F -->|No| H[Keep Current Range]
    G --> H
    
    H --> I[For Each NPC]
    I --> J[Calculate Distance and Angle to NPC]
    J --> K{Within Vision Cone?}
    K -->|dist < visionRange AND angleDiff < 45°| L[canSee = TRUE]
    K -->|No| M{Within Hearing Range?}
    
    M -->|dist < 150px| N[canHear = TRUE]
    M -->|No| O[Cannot Perceive]
    
    L --> P{Can Perceive AND NOT perceived?}
    N --> P
    P -->|Yes| Q[Set npc.perceived = TRUE]
    P -->|No| R{Cannot Perceive AND perceived?}
    
    Q --> S[Log: Steve noticed NPC]
    S --> T[Next NPC]
    
    R -->|Yes| U[Set npc.perceived = FALSE]
    R -->|No| T
    U --> T
    O --> T
    
    T --> V{More NPCs?}
    V -->|Yes| I
    V -->|No| W[Perception Update Complete]
    
    style A fill:#e1f5fe
    style Q fill:#c8e6c9
    style U fill:#ffcdd2
    style W fill:#fce4ec
```

## 8.6 NPC Seek Steering Algorithm (Mermaid Flowchart)

```mermaid
flowchart TD
    A[NPC Decide to Approach] --> B{Already Seeking OR Speaking?}
    B -->|Yes| C[Return - No Action]
    B -->|No| D[Set seekingPlayer = TRUE]
    
    D --> E[Start Seek Loop - Every 50ms]
    E --> F[Calculate Distance to Steve]
    F --> G{Distance < 80px?}
    
    G -->|Yes| H[Stop Seeking Loop]
    G -->|No| I[Steer NPC Toward Steve]
    
    H --> J[Set seekingPlayer = FALSE]
    J --> K[Call _npcSpeak - Arrived]
    
    I --> L[Calculate Direction Vector]
    L --> M[dx = targetX - npc.x, dy = targetY - npc.y]
    M --> N[dist = sqrt dx² + dy²]
    N --> O{dist < 5?}
    
    O -->|Yes| P[Already at Target - Return]
    O -->|No| Q[Normalize Direction and Apply Speed]
    
    Q --> R[npc.x += dx/dist × 0.6, npc.y += dy/dist × 0.6]
    R --> S[Redraw NPC at New Position]
    S --> T[Continue Seek Loop]
    T --> E
    
    style A fill:#e1f5fe
    style D fill:#fff3e0
    style K fill:#c8e6c9
    style Q fill:#ffcdd2
```

## 8.7 Learning System Algorithm (Mermaid Flowchart)

```mermaid
flowchart TD
    A[Agent._updateAIVariables] --> B{Phone Usage?}
    B -->|NOT hasPhone OR NOT mobileScreenOpen| C[Addiction Decay: -0.02]
    B -->|Using Phone| D{Mobile Screen Open?}
    
    C --> D
    D -->|No| E[Awareness Recovery: +0.05]
    D -->|Yes| F[Calculate Hunch Level]
    E --> F
    
    F --> G{Addiction Level?}
    G -->|> 80| H[hunchLevel = 4]
    G -->|> 60| I[hunchLevel = 3]
    G -->|> 40| J[hunchLevel = 2]
    G -->|> 20| K[hunchLevel = 1]
    G -->|<= 20| L[hunchLevel = 0]
    
    H --> M[Check Learning Patterns]
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N{addictionLevel > 80 AND 'high_addiction' NOT in memory?}
    N -->|Yes| O[memory.push 'high_addiction']
    N -->|No| P{ignoredMessages >= 2 AND 'social_neglect' NOT in memory?}
    
    O --> Q[Log: Agent learned high_addiction pattern]
    Q --> P
    
    P -->|Yes| R[memory.push 'social_neglect']
    P -->|No| S{scrollCount > 50 AND 'compulsive_scrolling' NOT in memory?}
    
    R --> T[Log: Agent learned social_neglect pattern]
    T --> S
    
    S -->|Yes| U[memory.push 'compulsive_scrolling']
    S -->|No| V[Learning Update Complete]
    
    U --> W[Log: Agent learned compulsive_scrolling pattern]
    W --> V
    
    style A fill:#e1f5fe
    style O fill:#c8e6c9
    style R fill:#c8e6c9
    style U fill:#c8e6c9
    style V fill:#fce4ec
```

## 8.8 Emotion Drift Algorithm (Mermaid Flowchart)

```mermaid
flowchart TD
    A[EmotionSystem.update] --> B[Process Stress Drift]
    B --> C{stress > baseline 10?}
    C -->|Yes| D[stress = max baseline, stress - 0.008]
    C -->|No| E{stress < baseline 10?}
    E -->|Yes| F[stress = min baseline, stress + 0.008]
    E -->|No| G[stress unchanged]
    
    D --> H[Process Happiness Drift]
    F --> H
    G --> H
    
    H --> I{happiness > baseline 60?}
    I -->|Yes| J[happiness = max baseline, happiness - 0.005]
    I -->|No| K{happiness < baseline 60?}
    K -->|Yes| L[happiness = min baseline, happiness + 0.005]
    K -->|No| M[happiness unchanged]
    
    J --> N[Process Loneliness Drift]
    L --> N
    M --> N
    
    N --> O{loneliness > baseline 20?}
    O -->|Yes| P[loneliness = max baseline, loneliness - 0.005]
    O -->|No| Q{loneliness < baseline 20?}
    Q -->|Yes| R[loneliness = min baseline, loneliness + 0.005]
    Q -->|No| S[loneliness unchanged]
    
    P --> T[Emotion Update Complete]
    R --> T
    S --> T
    
    style A fill:#e1f5fe
    style T fill:#fce4ec
```

## 8.9 Eye Movement & Audio Response Algorithm (Mermaid Flowchart)

```mermaid
flowchart TD
    A[Notification Sound Plays] --> B[Play noti.wav 3 times with 600ms gaps]
    B --> C[Determine Direction: Phone is right of Steve]
    C --> D[Call agent.lookAtDirection 'right']
    
    D --> E[Calculate Target Offset: direction === 'right' ? 2 : -2]
    E --> F[Start Eye Movement Tween]
    F --> G[Tween _eyeOffset to targetOffset over 200ms]
    G --> H[Hold Position for 800ms]
    H --> I[Tween _eyeOffset back to 0 over 400ms]
    I --> J[Eye Movement Complete]
    
    J --> K[Visual Update in _drawCharacter]
    K --> L[Calculate Eye Offset: eo = Clamp _eyeOffset, -2, 2 × S]
    L --> M[Apply to Iris Position: gl + -6×S + eo, -25×S]
    M --> N[Apply to Pupil Position: gl + 6×S + eo, -25×S]
    N --> O[Render Updated Eye Position]
    
    style A fill:#e1f5fe
    style D fill:#fff3e0
    style J fill:#c8e6c9
    style O fill:#fce4ec
```

## 8.10 LearningScene Task Completion Algorithm (Mermaid Flowchart)

```mermaid
flowchart TD
    A[LearningScene Start] --> B[Display 2 Educational Tasks]
    B --> C[Focus on Task 1]
    C --> D[Wait for SPACE Key Input]
    
    D --> E{SPACE Pressed?}
    E -->|Yes| F[progress += 8]
    E -->|No| D
    
    F --> G[Update Progress Bar Visual]
    G --> H{progress >= taskProgressMax?}
    H -->|No| D
    H -->|Yes| I[Set _taskCompleting = TRUE]
    
    I --> J[Call _completeTask Task1]
    J --> K[Destroy Task 1 Card]
    K --> L[Create Task 2]
    L --> M[Focus on Task 2]
    
    M --> N[Wait for SPACE Key Input]
    N --> O{SPACE Pressed?}
    O -->|Yes| P[progress += 8]
    O -->|No| N
    
    P --> Q[Update Progress Bar Visual]
    Q --> R{progress >= taskProgressMax?}
    R -->|No| N
    R -->|Yes| S[Set _taskCompleting = TRUE]
    
    S --> T[Call _completeTask Task2]
    T --> U[Both Tasks Complete]
    U --> V[Calculate Learning Benefits]
    V --> W[Addiction: random -30 to -40]
    W --> X[Awareness: random +25 to +35]
    X --> Y[Memory: add 'educational_completion']
    Y --> Z[Show Success Card]
    Z --> AA[Return to AttractionScene with Improved Stats]
    
    style A fill:#e1f5fe
    style I fill:#fff3e0
    style S fill:#fff3e0
    style V fill:#c8e6c9
    style AA fill:#fce4ec
```

---

## Pseudocode Algorithms

### Algorithm 8.1: Main Game Loop
```
ALGORITHM: EchoSphere Main Loop
─────────────────────────────────────────────────────────────────
BEGIN
  INITIALISE Phaser game engine
  LOAD scenes: [Boot, Attraction, RealWorld, Learning, End]
  START BootScene

  LOOP (every frame ~16.67ms):
    IF current scene is AttractionScene:
      CALL AttractionScene.update()
    ELSE IF current scene is RealWorldScene:
      CALL RealWorldScene.update()
    ELSE IF current scene is LearningScene:
      CALL LearningScene.update()
    END IF
  END LOOP
END
```

### Algorithm 8.2: Agent Update
```
ALGORITHM: Agent.update()
─────────────────────────────────────────────────────────────────
BEGIN
  CALL fsm.update()           // FSM timer-based transitions
  CALL emotions.update()      // Drift emotions toward baseline
  CALL _handleInput()         // Process keyboard input
  CALL _updateAIVariables()   // Update addiction, hunch, memory
  
  IF perceptionCooldown > 0:
    DECREMENT perceptionCooldown
  END IF
END
```

### Algorithm 8.3: FSM Event Handling
```
ALGORITHM: FSM.handleEvent(eventName)
─────────────────────────────────────────────────────────────────
BEGIN
  SWITCH currentState:
    
    CASE 'IDLE':
      IF eventName = 'NOTIFICATION_SEEN':
        emotions.happiness += 8, emotions.stress += 2
        engageCount++
        TRANSITION to 'ATTRACTED'
      END IF
    
    CASE 'ATTRACTED':
      IF eventName = 'NOTIFICATION_SEEN':
        emotions.happiness += 6, emotions.stress += 1
        engageCount++
        IF engageCount >= 5:
          TRANSITION to 'LOOPING'
        END IF
      END IF
    
    CASE 'LOOPING':
      emotions.stress += 0.02 per frame
      emotions.loneliness += 0.015 per frame
      IF emotions.stress >= 65:
        TRANSITION to 'DISTORTED'
      END IF
    
    CASE 'DISTORTED':
      emotions.stress += 0.04 per frame
      emotions.happiness -= 0.03 per frame
      IF emotions.stress >= 85:
        TRANSITION to 'BREAKING_POINT'
      END IF
    
    CASE 'BREAKING_POINT':
      IF timer > 180 frames:
        CALL _resolveOutcome()
      END IF
  
  END SWITCH
END
```

### Algorithm 8.4: Addiction Progression
```
ALGORITHM: AttractionScene Phone Usage Loop
─────────────────────────────────────────────────────────────────
BEGIN
  WHILE mobileScreenOpen AND NOT ended AND NOT decisionPending:
    
    // Phone usage effects per frame
    agent.addictionLevel += 0.15
    agent.awareness      -= 0.12
    agent.emotions.stress += 0.08
    
    // Auto-scroll activation at 50% addiction
    IF addictionLevel > 50 AND NOT autoScrollEnabled:
      autoScrollEnabled = TRUE
      scrollSpeed = (addictionLevel - 50) / 50 × 2
    END IF
    
    // Educational popup at 70% addiction
    IF addictionLevel >= 70 AND NOT decisionShown:
      SHOW educational notification popup
      PAUSE loop (decisionPending = TRUE)
    END IF
    
    // Failure notification at 100% addiction
    IF addictionLevel >= 100 AND NOT failShown:
      SHOW fail notification → learning key
    END IF
  
  END WHILE
END
```

### Algorithm 8.5: Vision Cone Perception
```
ALGORITHM: RealWorldScene._updatePerception()
─────────────────────────────────────────────────────────────────
BEGIN
  facingAngle = IF agent._facingRight THEN 0 ELSE π
  halfCone = DegToRad(45)  // ±45° = 90° total cone
  
  visionRange = 200  // base range in pixels
  IF timeOfDay = 'dusk': visionRange × 0.55
  IF phoneVisible AND addictionLevel > 40: visionRange × 0.6
  
  FOR EACH npc IN npcs:
    dx = npc.x - agent.x
    dy = npc.y - agent.y
    dist = SQRT(dx² + dy²)
    angleToNPC = ATAN2(dy, dx)
    angleDiff = ABS(Wrap(angleToNPC - facingAngle))
    
    canSee  = (dist < visionRange) AND (angleDiff < halfCone)
    canHear = (dist < 150)  // omnidirectional hearing
    
    IF (canSee OR canHear) AND NOT npc.perceived:
      npc.perceived = TRUE
      LOG "Steve noticed [npc.name]"
    END IF
  END FOR
END
```

### Algorithm 8.6: NPC Seek Steering
```
ALGORITHM: RealWorldScene._steerNPCToward(npc, targetX, targetY)
─────────────────────────────────────────────────────────────────
BEGIN
  dx = targetX - npc.x
  dy = targetY - npc.y
  dist = SQRT(dx² + dy²)
  
  IF dist < 5: RETURN  // already at target
  
  speed = 0.6  // NPC_WANDER_SPEED px/frame
  
  // Normalize direction vector and scale by speed
  npc.x += (dx / dist) × speed
  npc.y += (dy / dist) × speed
  
  // Redraw NPC at new position
  npc.drawNPC(npc.emotion)
END
```

### Algorithm 8.7: Learning & Memory System
```
ALGORITHM: Agent._updateAIVariables()
─────────────────────────────────────────────────────────────────
BEGIN
  // Learning pattern detection (each stored only once)
  IF addictionLevel > 80 AND 'high_addiction' NOT IN memory:
    memory.PUSH('high_addiction')
    LOG "Agent learned: high_addiction pattern"
  END IF
  
  IF ignoredMessages >= 2 AND 'social_neglect' NOT IN memory:
    memory.PUSH('social_neglect')
    LOG "Agent learned: social_neglect pattern"
  END IF
  
  IF scrollCount > 50 AND 'compulsive_scrolling' NOT IN memory:
    memory.PUSH('compulsive_scrolling')
    LOG "Agent learned: compulsive_scrolling pattern"
  END IF
END
```

### Algorithm 8.8: Emotion Homeostasis
```
ALGORITHM: EmotionSystem.update()
─────────────────────────────────────────────────────────────────
BEGIN
  // Drift each emotion toward baseline at fixed rate
  stress     = DRIFT(stress,     baseline=10,  rate=0.008)
  happiness  = DRIFT(happiness,  baseline=60,  rate=0.005)
  loneliness = DRIFT(loneliness, baseline=20,  rate=0.005)
END

FUNCTION DRIFT(current, baseline, rate):
  IF current > baseline:
    RETURN MAX(baseline, current - rate)
  ELSE IF current < baseline:
    RETURN MIN(baseline, current + rate)
  ELSE:
    RETURN current
  END IF
END FUNCTION
```