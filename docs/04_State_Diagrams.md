# 4. State Diagrams — UML Diagrams

## 4.1 Agent FSM State Transition Diagram

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    FSM STATES                           │
                    └─────────────────────────────────────────────────────────┘

                              [NOTIFICATION_SEEN]
              ┌──────────┐  ─────────────────────►  ┌────────────┐
              │          │                           │            │
              │   IDLE   │                           │  ATTRACTED │
              │          │  ◄─────────────────────── │            │
              └──────────┘    [RANDOM_GOOD /          └────────────┘
                               timer reset]                │
                                                           │ engageCount ≥ 5
                                                           │ OR timer > 600
                                                           │ (no resistance)
                                                           ▼
                                                    ┌────────────┐
                                                    │            │
                                                    │  LOOPING   │
                                                    │            │
                                                    └────────────┘
                                                           │
                                                           │ stress ≥ 65
                                                           ▼
                                                    ┌────────────┐
                                                    │            │
                                                    │ DISTORTED  │
                                                    │            │
                                                    └────────────┘
                                                           │
                                                           │ stress ≥ 85
                                                           ▼
                                                    ┌──────────────┐
                                                    │              │
                                                    │BREAKING_POINT│
                                                    │              │
                                                    └──────────────┘
                                                           │
                              ┌────────────────────────────┼────────────────────────┐
                              │                            │                        │
                              ▼                            ▼                        ▼
                       ┌──────────┐               ┌──────────────┐          ┌──────────┐
                       │          │               │              │          │          │
                       │RECOVERED │               │   PARTIAL    │          │   LOST   │
                       │          │               │              │          │          │
                       └──────────┘               └──────────────┘          └──────────┘
                    (resist ≥ engage             (default mixed           (ignoredFriends ≥ 3
                     AND happiness > 45)          behaviour)               OR loneliness > 70)
```

### State Descriptions

| State | Description | Visual Indicator |
|-------|-------------|-----------------|
| **IDLE** | Agent is calm, not yet engaged | Upright posture, neutral expression |
| **ATTRACTED** | Agent notices phone, curiosity engaged | Slight smile, eyes wider |
| **LOOPING** | Habit forming, compulsive checking | Slight hunch, darker skin tone |
| **DISTORTED** | Reality distorted, stress rising | More hunched, darker appearance |
| **BREAKING_POINT** | Critical stress, about to break | Fully hunched, frown, glitch effect |
| **RECOVERED** | Agent chose real world | Green shirt, upright, smile |
| **PARTIAL** | Mixed outcome | Yellow/amber shirt |
| **LOST** | Fully addicted | Dark grey, minimal expression |

### Transition Triggers

| From | To | Trigger |
|------|----|---------|
| IDLE | ATTRACTED | NOTIFICATION_SEEN event |
| IDLE | IDLE | RANDOM_GOOD (timer reset) |
| ATTRACTED | LOOPING | engageCount ≥ 5 OR timer > 600 with no resistance |
| LOOPING | DISTORTED | stress ≥ 65 |
| DISTORTED | BREAKING_POINT | stress ≥ 85 |
| BREAKING_POINT | RECOVERED | resistCount ≥ engageCount AND happiness > 45 |
| BREAKING_POINT | LOST | ignoredFriends ≥ 3 OR loneliness > 70 |
| BREAKING_POINT | PARTIAL | Default (mixed behaviour) |

---

## 4.2 Scene Flow Diagram

```
┌──────────┐
│BootScene │
│ (Title)  │
└──────────┘
      │
      │ Click anywhere
      ▼
┌──────────────────┐
│ AttractionScene  │◄──────────────────────────────────┐
│ (Scenario 1)     │                                   │
│                  │                                   │
│ Phone on table   │                                   │
│ Door on left     │                                   │
└──────────────────┘                                   │
      │                    │                           │
      │ Walk to door        │ Pick up phone             │
      │ (press near door)   │ (press E near phone)      │
      ▼                    ▼                           │
┌──────────────┐    ┌──────────────────┐               │
│RealWorldScene│    │  Mobile Screen   │               │
│ (Scenario 2) │    │  (Feed Scroll)   │               │
│              │    │                  │               │
│ 3 NPCs       │    │ Addiction rises  │               │
│ Conversation │    │                  │               │
│ Random events│    │ At 70%:          │               │
└──────────────┘    │ Decision popup   │               │
      │             │                  │               │
      │ Walk to road│ Accept → Learn   │               │
      │ (after conv)│ Decline → Scroll │               │
      ▼             │                  │               │
┌──────────┐        │ At 100%:         │               │
│ EndScene │        │ Fail popup       │               │
│ (The End)│        │ → Learning Key   │               │
└──────────┘        └──────────────────┘               │
                           │                           │
                           │ Accept learning /          │
                           │ Click learning key         │
                           ▼                           │
                    ┌──────────────────┐               │
                    │  LearningScene   │               │
                    │  (Scenario 3)    │               │
                    │                  │               │
                    │ 2 study tasks    │               │
                    │ SPACE to fill    │               │
                    │ progress bar     │               │
                    │                  │               │
                    │ Complete → card  │               │
                    │ Click → return   │───────────────┘
                    └──────────────────┘
```

---

## 4.3 NPC Behaviour State Diagram (RealWorldScene)

```
                    ┌──────────┐
                    │ WANDERING│ ◄──── Default state
                    │ (neutral)│       Picks new target every 4s
                    └──────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              │ Steve in range        │ Random event:
              │ (vision/hearing)    │ "approach" triggered
              ▼                     ▼
        ┌──────────┐         ┌──────────────┐
        │ PERCEIVED│         │  SEEKING     │
        │ (neutral)│         │  PLAYER      │
        └──────────┘         └──────────────┘
              │                     │
              │ Steve presses T       │ Arrives within 80px
              │ (proximity)         │
              ▼                     ▼
        ┌──────────┐         ┌──────────────┐
        │ SPEAKING │◄────────│   SPEAKING   │
        │ (happy / │         │   (happy /   │
        │  angry / │         │    angry)    │
        │  sad)    │         └──────────────┘
        └──────────┘
              │
              │ 3.5s auto-dismiss
              ▼
        ┌──────────┐
        │ NEUTRAL  │ ──────► Back to WANDERING
        └──────────┘
```

---

## 4.4 Class Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Agent                                    │
├─────────────────────────────────────────────────────────────────┤
│ + x, y : number                                                  │
│ + addictionLevel : number (0-100)                                │
│ + awareness : number (0-100)                                     │
│ + curiosity : number (0-100)                                     │
│ + relationshipLevel : number (0-100)                             │
│ + memory : string[]                                              │
│ + hunchLevel : number (0-4)                                      │
│ + hasPhone : boolean                                             │
│ + speed : number                                                 │
│ + keysLocked : boolean                                           │
├─────────────────────────────────────────────────────────────────┤
│ + update() : void                                                │
│ + usePhone(deltaTime) : void                                     │
│ + onScroll() : void                                              │
│ + respondToMessage(action) : void                                │
│ + bounce() : void                                                │
│ - _handleInput() : void                                          │
│ - _perceive() : void                                             │
│ - _updateAIVariables() : void                                    │
│ - _drawCharacter(state) : void                                   │
│ - _updateVisuals() : void                                        │
└─────────────────────────────────────────────────────────────────┘
         │ has-a                    │ has-a
         ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│      FSM         │    │    EmotionSystem      │
├──────────────────┤    ├──────────────────────┤
│ + state : string │    │ + stress : number     │
│ + engageCount    │    │ + happiness : number  │
│ + resistCount    │    │ + loneliness : number │
│ + ignoredFriends │    ├──────────────────────┤
├──────────────────┤    │ + update() : void     │
│ + update()       │    │ + applyEvent(delta)   │
│ + handleEvent()  │    │ - _drift()            │
│ + forceState()   │    └──────────────────────┘
│ + onTransition() │
│ - _transition()  │
│ - _resolveOutcome│
└──────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Scene Hierarchy                                │
├──────────────────────────────────────────────────────────────────┤
│  Phaser.Scene                                                     │
│       │                                                           │
│       ├── BootScene          (title screen)                       │
│       ├── AttractionScene    (Scenario 1 — uses Agent)            │
│       ├── RealWorldScene     (Scenario 2 — uses Agent + NPCs)     │
│       ├── LearningScene      (Scenario 3 — uses Agent)            │
│       ├── TripScene          (road trip — standalone)             │
│       └── EndScene           (completion screen)                  │
└──────────────────────────────────────────────────────────────────┘
```
