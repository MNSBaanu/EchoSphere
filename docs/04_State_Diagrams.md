# 4. State Diagrams

## 4.1 Agent FSM — Full State Transitions

```mermaid
stateDiagram-v2
    [*] --> IDLE

    IDLE --> ATTRACTED : Notification seen
    IDLE --> ATTRACTED : Idle too long (curiosity)
    IDLE --> IDLE : Random good event

    ATTRACTED --> LOOPING : Engaged 5+ times
    ATTRACTED --> LOOPING : No resistance after 600 frames
    ATTRACTED --> LOOPING : Player kept engaging (4+ times)
    ATTRACTED --> LOOPING : Viral post spike
    ATTRACTED --> ATTRACTED : Notification seen again
    ATTRACTED --> ATTRACTED : Player resisted
    ATTRACTED --> ATTRACTED : Friend message received
    ATTRACTED --> ATTRACTED : Random good event

    LOOPING --> DISTORTED : Stress reaches 65
    LOOPING --> LOOPING : Friend ignored
    LOOPING --> LOOPING : Random bad event
    LOOPING --> LOOPING : Player resisted

    DISTORTED --> BREAKING_POINT : Stress reaches 85
    DISTORTED --> DISTORTED : Friend ignored
    DISTORTED --> DISTORTED : Player resisted

    BREAKING_POINT --> RECOVERED : Resisted more than engaged
    BREAKING_POINT --> LOST : Ignored 3+ friends
    BREAKING_POINT --> PARTIAL : Mixed behavior

    RECOVERED --> [*]
    PARTIAL --> [*]
    LOST --> [*]
```

---

## 4.2 Scene Flow

```mermaid
flowchart TD
    A([Boot]) --> B[Bedroom]
    B --> C{Phone or Door?}
    C -->|Press E — Phone| D[Social Media Feed]
    C -->|Press F — Door| G[Real World]
    D --> E{Addiction?}
    E -->|50%| D2[Auto-Scroll On]
    E -->|70%| F{Learn Now?}
    E -->|100%| H[Fail + Learning Key]
    D2 --> E
    F -->|Yes| L[Learning Scene]
    F -->|No| D
    H --> L
    L --> G
    G --> I([End])
```

---

## 4.3 AttractionScene — Phone States

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> PhoneOpen : Press E near phone
    Idle --> DoorExit : Press F near door

    PhoneOpen --> ManualScroll : Addiction 0–49%
    ManualScroll --> AutoScroll : Addiction hits 50%
    AutoScroll --> ManualScroll : Phone closed

    AutoScroll --> EducationPopup : Addiction hits 70%
    EducationPopup --> LearningScene : Accept
    EducationPopup --> ContinuousScroll : Later

    ContinuousScroll --> FailPopup : Addiction hits 100%
    AutoScroll --> FailPopup : Addiction hits 100%
    FailPopup --> LearningScene : Click learning key

    DoorExit --> [*] : Go to RealWorldScene
    LearningScene --> [*] : Scene transition
```

---

## 4.4 NPC Behavior — States

```mermaid
stateDiagram-v2
    [*] --> Wandering

    Wandering --> Perceived : Steve enters vision cone or hearing range
    Wandering --> Seeking : Random approach triggered

    Perceived --> Speaking : Steve presses T nearby
    Seeking --> Speaking : NPC reaches Steve

    Speaking --> HappyTalk : Phone hidden, low addiction
    Speaking --> AngryTalk : Phone visible, high addiction
    Speaking --> GiveAdvice : Mom + addiction over 60%
    Speaking --> Avoided : 2+ bad interactions learned

    HappyTalk --> Cooldown : 3.5s
    AngryTalk --> Cooldown : 3.5s
    GiveAdvice --> Cooldown : Reduces addiction
    Avoided --> Wandering : No interaction

    Cooldown --> Wandering : Resume
```

---

## 4.5 LearningScene — Task States

```mermaid
stateDiagram-v2
    [*] --> Task1Active
    Task1Active --> Task1Active : SPACE pressed, filling bar
    Task1Active --> Task1Done : Bar full
    Task1Done --> Task2Active : Next task loads
    Task2Active --> Task2Active : SPACE pressed, filling bar
    Task2Active --> Task2Done : Bar full
    Task2Done --> SuccessCard : Both tasks complete
    SuccessCard --> [*] : Return with improved stats
```

---

## 4.6 Emotion System — States

```mermaid
stateDiagram-v2
    [*] --> Baseline

    Baseline --> Rising : Negative event
    Baseline --> Falling : Positive event

    Rising --> FSMCheck : Stress updated
    Falling --> FSMCheck : Emotions updated

    FSMCheck --> DISTORTED : Stress hits 65
    FSMCheck --> BREAKING_POINT : Stress hits 85
    FSMCheck --> Drifting : No threshold hit

    DISTORTED --> Drifting
    BREAKING_POINT --> Drifting
    Drifting --> Baseline : Slowly returns to normal
```

---

## 4.7 Memory & Learning — States

```mermaid
stateDiagram-v2
    [*] --> Monitoring

    Monitoring --> Detected : Behavior threshold crossed
    Detected --> Stored : Pattern added to memory
    Stored --> Applied : Behavior changes

    Applied --> Monitoring : Continue watching

    note right of Detected
        Triggers:
        Addiction over 80
        Ignored 2+ messages
        Scrolled 50+ times
        Mom gave advice
        2 bad NPC interactions
        Completed learning tasks
    end note
```

---

## 4.8 Eye Movement — States

```mermaid
stateDiagram-v2
    [*] --> Center
    Center --> SnapRight : Notification sound plays
    SnapRight --> Holding : Eyes locked on phone
    Holding --> Returning : 800ms passed
    Returning --> Center : Eyes back to normal
    Center --> AgentResponds : FSM triggered
    AgentResponds --> [*]
```

---

## Reference Tables

### FSM States
| State | Meaning | Visual |
|-------|---------|--------|
| IDLE | Calm, not engaged | Upright, neutral |
| ATTRACTED | Phone caught attention | Slight smile |
| LOOPING | Habit forming | Slight hunch |
| DISTORTED | Stressed, losing grip | More hunched |
| BREAKING_POINT | Critical moment | Fully hunched, frown |
| RECOVERED | Chose real world | Upright, green shirt |
| PARTIAL | Mixed outcome | Neutral |
| LOST | Fully addicted | Hunched, grey |

### Addiction Thresholds
| Level | Effect |
|-------|--------|
| 50% | Auto-scroll activates |
| 70% | Educational popup shown |
| 100% | Failure — learning key appears |

### Scene Transitions
| From | To | Trigger |
|------|----|---------|
| Boot | Bedroom | Click screen |
| Bedroom | Real World | Press F at door |
| Bedroom | Learning | Accept popup or learning key |
| Learning | Bedroom | Complete both tasks |
| Real World | End | Finish conversation |
