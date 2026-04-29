# 4. State Diagrams — UML Diagrams

## 4.1 Agent FSM State Transition Diagram (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> IDLE
    
    IDLE --> ATTRACTED : NOTIFICATION_SEEN (+happiness:8, +stress:2, engageCount++)
    IDLE --> IDLE : RANDOM_GOOD (+happiness:5, -loneliness:5, timer reset)
    IDLE --> ATTRACTED : timeout > 200 frames (curiosity)
    
    ATTRACTED --> LOOPING : engageCount ≥ 5 OR timer > 600 (no resistance)
    ATTRACTED --> ATTRACTED : NOTIFICATION_SEEN (+happiness:6, +stress:1, engageCount++)
    ATTRACTED --> ATTRACTED : PLAYER_RESIST (-happiness:5, +loneliness:3, resistCount++)
    ATTRACTED --> LOOPING : PLAYER_ENGAGE (+happiness:8, +stress:3, engageCount ≥ 4)
    ATTRACTED --> IDLE : RANDOM_GOOD (-stress:5, -loneliness:5, +happiness:3)
    ATTRACTED --> LOOPING : RANDOM_BAD (+happiness:15, +stress:8, engageCount += 2)
    
    LOOPING --> DISTORTED : stress ≥ 65
    LOOPING --> LOOPING : continuous phone use (+stress:0.02, +loneliness:0.015)
    LOOPING --> LOOPING : FRIEND_IGNORED (ignoredFriends++, +loneliness:12, +stress:5)
    
    DISTORTED --> BREAKING_POINT : stress ≥ 85
    DISTORTED --> DISTORTED : addiction continues (+stress:0.04, -happiness:0.03)
    
    BREAKING_POINT --> RECOVERED : timer > 180 AND resistCount ≥ engageCount AND happiness > 45
    BREAKING_POINT --> LOST : timer > 180 AND (ignoredFriends ≥ 3 OR loneliness > 70)
    BREAKING_POINT --> PARTIAL : timer > 180 AND default (mixed behavior)
    
    RECOVERED --> [*]
    LOST --> [*]
    PARTIAL --> [*]
    
    note right of IDLE
        Upright posture, neutral expression
        Skin: 0xf5c5a3, Blue shirt
        Timer-based curiosity transition
    end note
    
    note right of ATTRACTED
        Slight smile, eyes wider
        Passive happiness rise: +0.03/frame
        Skin: 0xf5c5a3, Blue shirt
    end note
    
    note right of LOOPING
        Slight hunch (1-2), darker skin: 0xedb48a
        Dark blue shirt
        Stress accumulation: +0.02/frame
    end note
    
    note right of DISTORTED
        More hunched (3), skin: 0xd4956e
        Navy shirt, stress: +0.04/frame
        Happiness decay: -0.03/frame
    end note
    
    note right of BREAKING_POINT
        Fully hunched (4), frown + glitch
        Skin: 0xb87a55, Dark navy shirt
        180-frame resolution timer
    end note
```

## 4.2 Overall Scene Flow Diagram (Mermaid)

```mermaid
flowchart TD
    A[BootScene<br/>Title Screen] --> B[AttractionScene<br/>Steve's Bedroom]
    
    B --> C{Player Choice}
    C -->|Walk to Door<br/>Press F near door| D[RealWorldScene<br/>Outdoor Park]
    C -->|Pick up Phone<br/>Press E near phone| E[Mobile Screen<br/>Social Media Feed]
    
    E --> F{Addiction Progression}
    F -->|Manual Scroll<br/>0-49% addiction| G[User Controls Scrolling]
    F -->|Auto-Scroll<br/>50-69% addiction| H[System Takes Control]
    F -->|70% Addiction| I{Educational Popup}
    F -->|100% Addiction| J[Failure Notification]
    
    G --> H : addiction increases
    H --> I : addiction reaches 70%
    H --> J : addiction reaches 100%
    
    I -->|Accept Learning| K[LearningScene<br/>Study Room]
    I -->|Later| L[Continuous Scroll Mode]
    
    L --> J : addiction reaches 100%
    
    J --> M[Learning Key Appears]
    M -->|Click Key| K
    
    K --> N{Task 1 Complete?}
    N -->|SPACE key progress| O{Task 2 Complete?}
    N -->|No| N
    O -->|SPACE key progress| P[Success Card]
    O -->|No| O
    
    P -->|Click| Q[Return to AttractionScene<br/>Improved Stats]
    Q --> D
    
    D --> R[3-Second Delay]
    R --> S[7-Line Group Conversation<br/>T key advances]
    S --> T[Group Walk to Road<br/>400ms + 1000ms delay]
    T --> U[EndScene<br/>Journey Complete]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style D fill:#e8f5e8
    style K fill:#fff3e0
    style U fill:#fce4ec
```

## 4.3 AttractionScene Addiction Progression (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> SceneStart
    
    SceneStart --> NotificationFired : 300ms delay
    NotificationFired --> PlayerChoice : 3x audio + eye snap + social icons
    
    PlayerChoice --> PhonePickup : Press E (proximity < 40px X-axis)
    PlayerChoice --> DoorExit : Press F (proximity < 70px radius)
    
    PhonePickup --> MobileScreen : Screen opens, addiction tracking starts
    MobileScreen --> ManualScroll : addiction 0-49%
    MobileScreen --> AutoScroll : addiction > 50%
    
    ManualScroll --> AutoScroll : usePhone() +0.15 addiction/frame
    AutoScroll --> EducationalPopup : addiction ≥ 70%
    AutoScroll --> FailurePopup : addiction ≥ 100%
    
    EducationalPopup --> LearningTransition : Accept button
    EducationalPopup --> ContinuousScroll : Later button
    
    ContinuousScroll --> FailurePopup : addiction ≥ 100%
    
    FailurePopup --> LearningKey : OK button
    LearningKey --> LearningTransition : Click key
    
    DoorExit --> RealWorldTransition
    LearningTransition --> [*] : scene.start('LearningScene')
    RealWorldTransition --> [*] : scene.start('RealWorldScene')
    
    note right of NotificationFired
        - noti.wav plays 3x (600ms gaps)
        - agent.lookAtDirection('right')
        - Eyes snap to phone, hold 800ms
        - FSM: IDLE → ATTRACTED
        - Social media icons burst animation
    end note
    
    note right of AutoScroll
        - Speed = (addiction-50)/50 × 2
        - _autoScrollEnabled = true
        - Progress bar: green→yellow→red
        - Agent loses control
    end note
    
    note right of ManualScroll
        - Mouse wheel scrolling
        - agent.usePhone() per frame:
          +0.15 addiction, -0.12 awareness
          +0.08 stress, -0.05 happiness
    end note
```

## 4.4 RealWorldScene NPC Behavior (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> Wandering
    
    Wandering --> Perceived : Steve in vision cone (200px ±45°) OR hearing range (150px)
    Wandering --> Seeking : Random approach event (8s timer)
    
    Perceived --> Speaking : Steve presses T AND proximity < 90px
    Seeking --> Speaking : NPC arrives within 80px of Steve
    
    Speaking --> DialogueChoice : Evaluate Steve's state
    
    DialogueChoice --> HappyDialogue : phone hidden OR addiction < 50
    DialogueChoice --> AngryDialogue : phone visible AND addiction ≥ 50
    DialogueChoice --> AdviceDialogue : Mom AND addiction > 60 AND not _adviceGiven
    DialogueChoice --> AvoidanceState : _avoidedNPC === npc.id
    
    HappyDialogue --> Cooldown : 3.5s auto-dismiss
    AngryDialogue --> Cooldown : 3.5s auto-dismiss + _badInteractions++
    AdviceDialogue --> Cooldown : -20 addiction, +15 awareness, _adviceGiven = true
    AvoidanceState --> Wandering : No interaction (learned behavior)
    
    Cooldown --> Wandering : Return to default state
    
    note right of Wandering
        - Random targets every 240 frames (4s)
        - Wander speed: 0.6 px/frame
        - Vision affected by dusk (×0.55)
        - Phone distraction (×0.6 if addiction > 40)
    end note
    
    note right of Seeking
        Seek steering algorithm:
        dx = target.x - npc.x
        dy = target.y - npc.y  
        dist = sqrt(dx² + dy²)
        npc.x += (dx/dist) × speed
        npc.y += (dy/dist) × speed
    end note
    
    note right of AdviceDialogue
        Mom's advice (once only):
        "Put the phone down. Real moments matter more."
        Immediate stat improvements
        memory.push('mom_advice')
    end note
```

## 4.5 LearningScene Task System (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> SceneInit
    
    SceneInit --> TasksPresented : 2 educational tasks displayed
    TasksPresented --> Task1Active : Focus on first task
    
    Task1Active --> Task1Progress : SPACE key pressed
    Task1Progress --> Task1Active : Continue filling (progress < 100%)
    Task1Progress --> Task1Complete : progress ≥ _taskProgressMax
    
    Task1Complete --> Task2Active : Card destroyed, new task created
    
    Task2Active --> Task2Progress : SPACE key pressed  
    Task2Progress --> Task2Active : Continue filling (progress < 100%)
    Task2Progress --> Task2Complete : progress ≥ _taskProgressMax
    
    Task2Complete --> AllTasksComplete : Both tasks finished
    AllTasksComplete --> SuccessCard : Show completion message
    SuccessCard --> ReturnToAttraction : Click to continue
    
    ReturnToAttraction --> [*] : scene.start('AttractionScene', improvedStats)
    
    note right of Task1Progress
        SPACE key mechanics:
        - progress += 8 per press
        - Visual progress bar update
        - _taskCompleting flag prevents spam
    end note
    
    note right of AllTasksComplete
        Learning Benefits:
        - Addiction: random(-30, -40)
        - Awareness: random(+25, +35)  
        - Memory: add 'educational_completion'
        - State persists across scenes
    end note
    
    note right of ReturnToAttraction
        Data Transfer:
        {
          addictionLevel: reducedAddiction,
          awareness: improvedAwareness,
          memory: [...memory, 'educational_completion']
        }
    end note
```

## 4.6 Emotion System Mechanics (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> Baseline
    
    Baseline --> EventTriggered : FSM event occurs
    
    EventTriggered --> StressModification : Events affecting stress
    EventTriggered --> HappinessModification : Events affecting happiness  
    EventTriggered --> LonelinessModification : Events affecting loneliness
    
    StressModification --> EmotionUpdate : Apply delta changes
    HappinessModification --> EmotionUpdate
    LonelinessModification --> EmotionUpdate
    
    EmotionUpdate --> FSMThresholdCheck : Check transition triggers
    
    FSMThresholdCheck --> FSMTransition : stress ≥ 65 OR stress ≥ 85
    FSMThresholdCheck --> BaselineDrift : No FSM trigger
    
    FSMTransition --> BaselineDrift : State changed
    
    BaselineDrift --> Baseline : Drift toward baseline (per frame)
    
    note right of Baseline
        Baseline Values (homeostasis):
        - Stress: 10 (calm)
        - Happiness: 60 (content)
        - Loneliness: 20 (connected)
        
        Drift Rates (per frame):
        - Stress: 0.008
        - Happiness: 0.005  
        - Loneliness: 0.005
    end note
    
    note right of EventTriggered
        Key Events & Deltas:
        NOTIFICATION_SEEN: +8 happiness, +2 stress
        FRIEND_MESSAGE: +10 happiness, -8 loneliness
        FRIEND_IGNORED: -5 happiness, +8 loneliness
        PLAYER_ENGAGE: +8 happiness, +3 stress
        PLAYER_RESIST: -5 happiness, +3 loneliness
        RANDOM_GOOD: +3 happiness, -5 stress, -5 loneliness
        RANDOM_BAD: +15 happiness, +8 stress
    end note
    
    note right of FSMThresholdCheck
        FSM Triggers:
        - stress ≥ 65: LOOPING → DISTORTED
        - stress ≥ 85: DISTORTED → BREAKING_POINT
        - happiness > 45 (at BREAKING_POINT): → RECOVERED
        - loneliness > 70 (at BREAKING_POINT): → LOST
    end note
```

## 4.7 Learning & Memory System (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> MemoryInit
    
    MemoryInit --> PatternMonitoring : Continuous behavior tracking
    
    PatternMonitoring --> HighAddictionDetected : addictionLevel > 80
    PatternMonitoring --> SocialNeglectDetected : ignoredMessages ≥ 2
    PatternMonitoring --> CompulsiveScrollDetected : scrollCount > 50
    PatternMonitoring --> MomAdviceReceived : Mom gives advice (addiction > 60)
    PatternMonitoring --> NPCConflictDetected : 2+ bad interactions with same NPC
    PatternMonitoring --> EducationalCompleted : LearningScene tasks finished
    
    HighAddictionDetected --> MemoryStorage : memory.push('high_addiction')
    SocialNeglectDetected --> MemoryStorage : memory.push('social_neglect')
    CompulsiveScrollDetected --> MemoryStorage : memory.push('compulsive_scrolling')
    MomAdviceReceived --> MemoryStorage : memory.push('mom_advice')
    NPCConflictDetected --> MemoryStorage : memory.push('avoid_[npcId]')
    EducationalCompleted --> MemoryStorage : memory.push('educational_completion')
    
    MemoryStorage --> BehaviorModification : Apply learned behavior
    
    BehaviorModification --> AdviceEffect : -20 addiction, +15 awareness
    BehaviorModification --> AvoidanceEffect : _avoidedNPC = npc.id (skip interactions)
    BehaviorModification --> EducationalEffect : -30 to -40 addiction, +25 to +35 awareness
    BehaviorModification --> PatternRecognition : Inform FSM outcome resolution
    
    AdviceEffect --> CrossScenePersistence : Transfer state between scenes
    AvoidanceEffect --> CrossScenePersistence
    EducationalEffect --> CrossScenePersistence
    PatternRecognition --> CrossScenePersistence
    
    CrossScenePersistence --> PatternMonitoring : Continue monitoring
    
    note right of MemoryStorage
        Memory Constraints:
        - Each pattern stored only once
        - Checked with memory.includes()
        - Prevents duplicate learning
        - Console logging for debugging
    end note
    
    note right of CrossScenePersistence
        Scene Data Transfer:
        AttractionScene ↔ RealWorldScene ↔ LearningScene
        
        Transferred Data:
        - memory[] array
        - addictionLevel (0-100)
        - awareness (0-100)  
        - relationshipLevel (0-100)
        - hasPhone boolean
    end note
    
    note right of BehaviorModification
        Learning Types:
        1. Social Learning (Mom's advice)
        2. Avoidance Learning (NPC conflicts)
        3. Educational Learning (LearningScene)
        4. Pattern Recognition (behavioral tracking)
        5. Cross-Scene Persistence (state transfer)
    end note
```

## 4.8 Eye Movement & Perception System (Mermaid)

```mermaid
stateDiagram-v2
    [*] --> EyesCenter
    
    EyesCenter --> AudioDetected : Notification sound plays
    
    AudioDetected --> EyeMovement : lookAtDirection(direction)
    
    EyeMovement --> EyesSnapped : _eyeOffset = ±2 (left/right)
    EyesSnapped --> EyesHolding : Hold position for 800ms
    EyesHolding --> EyesReturning : Tween back to center
    EyesReturning --> EyesCenter : _eyeOffset = 0
    
    note right of AudioDetected
        Notification System:
        - noti.wav plays 3x with 600ms gaps
        - Phone position determines direction
        - Phone is right of Steve → 'right'
    end note
    
    note right of EyeMovement
        Eye Animation:
        - Clamp offset to ±2 pixels
        - GSAP tween for smooth movement
        - Affects iris and pupil position
        - Visual feedback for audio perception
    end note
    
    note right of EyesSnapped
        Visual Implementation:
        - eo = Phaser.Math.Clamp(_eyeOffset, -2, 2) × S
        - Applied to iris/pupil drawing:
          g.fillCircle(gl + -6×S + eo, -25×S, irisR)
          g.fillCircle(gl + 6×S + eo, -25×S, irisR)
    end note
```

---

## State Descriptions

### FSM States (Based on Actual Implementation)
| State | Description | Visual Indicator | Skin Color | Shirt Color | Behavior |
|-------|-------------|-----------------|------------|-------------|----------|
| **IDLE** | Agent calm, not engaged | Upright posture, neutral | `0xf5c5a3` | Blue | Timer-based curiosity (200 frames) |
| **ATTRACTED** | Phone caught attention | Slight smile, eyes wider | `0xf5c5a3` | Blue | Passive happiness +0.03/frame |
| **LOOPING** | Habit forming, compulsive | Slight hunch (1-2), darker | `0xedb48a` | Dark blue | Stress +0.02, loneliness +0.015/frame |
| **DISTORTED** | Reality distorted, stressed | More hunched (3) | `0xd4956e` | Navy | Stress +0.04, happiness -0.03/frame |
| **BREAKING_POINT** | Critical decision point | Fully hunched (4), frown | `0xb87a55` | Dark navy | 180-frame resolution timer |
| **RECOVERED** | Chose real world | Green shirt, upright, smile | `0xf5c5a3` | Green | Final positive outcome |
| **PARTIAL** | Mixed behavior outcome | Neutral expression | `0xf5c5a3` | Amber | Moderate success |
| **LOST** | Fully addicted | Dark grey, hunched | `0x9a8070` | Dark grey | Complete failure |

### Addiction Progression Thresholds
| Threshold | Trigger | Effect |
|-----------|---------|--------|
| **50%** | Auto-scroll activation | System takes control, speed = (addiction-50)/50×2 |
| **70%** | Educational popup | Accept→LearningScene, Later→continuous scroll |
| **100%** | Failure notification | Learning key appears for redemption |

### Scene Transitions (Actual Implementation)
| From Scene | To Scene | Trigger | Data Transferred |
|------------|----------|---------|------------------|
| **BootScene** | **AttractionScene** | Click anywhere | None |
| **AttractionScene** | **RealWorldScene** | Press F near door | addiction, awareness, relationship, hasPhone, memory |
| **AttractionScene** | **LearningScene** | Accept popup OR click learning key | Current state for restoration |
| **LearningScene** | **AttractionScene** | Complete tasks | Improved addiction/awareness, enhanced memory |
| **RealWorldScene** | **EndScene** | Complete 7-line conversation + walk | Final state |

### NPC Behavior States (Current Implementation)
| State | Description | Trigger | Duration |
|-------|-------------|---------|----------|
| **Wandering** | Random movement | Default state | 240 frames per target |
| **Perceived** | Steve noticed | Vision cone OR hearing range | Until interaction |
| **Seeking** | Approaching Steve | Random event (8s timer) | Until within 80px |
| **Speaking** | Active dialogue | T key + proximity <90px | 3.5s auto-dismiss |
| **Avoidance** | Learned to avoid | 2+ bad interactions | Permanent per NPC |

This updated documentation now accurately reflects the actual implementation in the EchoSphere codebase, including precise timing values, thresholds, and behavioral mechanics as coded in the JavaScript files.