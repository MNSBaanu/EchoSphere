# 02 — State Diagrams with Description (UML)

---

## 2.1 Master FSM — Agent (Kai) State Diagram

```
                        ┌─────────────────────────────────────────────────────┐
                        │                   AGENT FSM                         │
                        └─────────────────────────────────────────────────────┘

                                    [START]
                                       │
                                       ▼
                              ┌─────────────────┐
                              │      IDLE        │
                              │  addiction = 0   │
                              │  awareness = 70  │
                              └────────┬─────────┘
                                       │  NOTIFICATION_SEEN
                                       │  or timeout (200 frames)
                                       ▼
                              ┌─────────────────┐
                              │   ATTRACTED      │◄──────────────────────────┐
                              │  happiness ↑     │                           │
                              │  stress ↑ (low)  │                           │
                              └────────┬─────────┘                           │
                                       │  engageCount ≥ 5                    │
                                       │  or PLAYER_ENGAGE × 4               │
                                       ▼                                      │
                              ┌─────────────────┐                            │
                              │    LOOPING       │                            │
                              │  stress ↑↑       │                            │
                              │  loneliness ↑    │                            │
                              └────────┬─────────┘                            │
                                       │  stress ≥ 65                         │
                                       ▼                                      │
                              ┌─────────────────┐                            │
                              │   DISTORTED      │                            │
                              │  happiness ↓↓    │                            │
                              │  stress ↑↑↑      │                            │
                              └────────┬─────────┘                            │
                                       │  stress ≥ 85                         │
                                       ▼                                      │
                              ┌─────────────────┐                            │
                              │ BREAKING_POINT   │                            │
                              │  timer > 180     │                            │
                              └────────┬─────────┘                            │
                                       │                                      │
                    ┌──────────────────┼──────────────────┐                  │
                    │                  │                   │                  │
                    ▼                  ▼                   ▼                  │
           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
           │  RECOVERED   │  │   PARTIAL    │  │     LOST     │             │
           │ resist ≥     │  │  mixed       │  │ ignoredFriends│             │
           │ engage AND   │  │  behavior    │  │ ≥ 3 OR       │             │
           │ happiness>45 │  │              │  │ loneliness>70│             │
           └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 2.2 State Descriptions

### IDLE
- **Entry condition:** Simulation start
- **Behavior:** Kai stands in the bedroom. No active engagement. Curiosity timer counts up.
- **Exit condition:** `NOTIFICATION_SEEN` event OR timer exceeds 200 frames (curiosity triggers autonomous approach)
- **Emotion baseline:** stress=10, happiness=60, loneliness=20

### ATTRACTED
- **Entry condition:** First notification perceived
- **Behavior:** Kai is drawn to the phone. Happiness rises. Each new notification increments `engageCount`.
- **Exit condition:** `engageCount ≥ 5` OR `PLAYER_ENGAGE × 4` → LOOPING
- **Emotion changes:** happiness +6 per notification, stress +1

### LOOPING
- **Entry condition:** Habit formed through repeated engagement
- **Behavior:** Kai is stuck in the scroll cycle. Stress and loneliness rise each frame. Friend messages can slow the loop if resist count is higher than engage count.
- **Exit condition:** `stress ≥ 65` → DISTORTED
- **Emotion changes:** stress +0.02/frame, loneliness +0.015/frame

### DISTORTED
- **Entry condition:** Stress threshold crossed
- **Behavior:** Kai's perception of reality blurs. Happiness actively decreases. Friend messages have reduced effect.
- **Exit condition:** `stress ≥ 85` → BREAKING_POINT
- **Emotion changes:** stress +0.04/frame, happiness -0.03/frame

### BREAKING_POINT
- **Entry condition:** Critical stress level
- **Behavior:** Kai must make a final choice. Timer counts 180 frames then resolves automatically.
- **Exit condition:** Timer expires → `_resolveOutcome()` called
- **Resolution logic:**
  - `resistCount ≥ engageCount AND happiness > 45` → RECOVERED
  - `ignoredFriends ≥ 3 OR loneliness > 70` → LOST
  - Otherwise → PARTIAL

### RECOVERED
- **Visual:** Green shirt, smile, blush, upright posture
- **Meaning:** Kai balanced digital use with real-world responsibilities

### PARTIAL
- **Visual:** Amber/yellow tones, neutral expression
- **Meaning:** Inconsistent behavior — some recovery, some relapse

### LOST
- **Visual:** Grey tones, frown, hunched posture
- **Meaning:** Fully absorbed in the loop — relationships and academics failed

---

## 2.3 Scene-Level State Diagram

```
[BootScene]
     │  click anywhere
     ▼
[AttractionScene]
     │
     ├── Walk to Phone ──────────────────────────────────────────────────────┐
     │                                                                        │
     │   ┌─────────────────────────────────────────────────────────────┐    │
     │   │              MOBILE LOOP (AttractionScene)                   │    │
     │   │                                                               │    │
     │   │  Phone picked up → Mobile screen opens                       │    │
     │   │       ↓                                                       │    │
     │   │  Scroll → addiction ↑, awareness ↓                           │    │
     │   │       ↓                                                       │    │
     │   │  Decision Node: Keep Scrolling | Go Study                    │    │
     │   │       ↓                    ↓                                  │    │
     │   │  Addiction ↑↑         [LearningScene]                        │    │
     │   │       ↓                    ↑                                  │    │
     │   │  Bad Grades ──── Learning ─┘                                 │    │
     │   │  (transition to RealWorldScene or loop back)                 │    │
     │   └─────────────────────────────────────────────────────────────┘    │
     │                                                                        │
     └── Walk to Door ─────────────────────────────────────────────────────┘
                                      │
                                      ▼
                              [RealWorldScene]
                                      │
                              NPC interactions
                              Vision cone + hearing
                              Balancing EI + NL
                                      │
                              feeds back to Studies
                                      │
                                      ▼
                              [LearningScene]
                                      │
                              Complete all tasks → Good Grades
                              Distraction fires → back to Addiction
```

---

## 2.4 Addiction Variable State Diagram

```
addictionLevel (0 → 100)

  0%──────────20%──────────50%──────────80%──────────100%
  │           │            │            │             │
  SAFE        MILD         CONTROL      DANGER        CRITICAL
  hunch=0     hunch=1      LOST         hunch=3       hunch=4
              awareness    auto-scroll  learning      transition
              starts ↓     activates    fires         triggers
```

---

## 2.5 Emotion System State Diagram

```
Each emotion: 0 ──────────── baseline ──────────── 100

stress     baseline=10   ← drifts back at 0.008/frame
happiness  baseline=60   ← drifts back at 0.005/frame
loneliness baseline=20   ← drifts back at 0.005/frame

Events perturb values:
  usePhone()    → stress +0.08,  happiness -0.05  (per frame)
  onScroll()    → stress +0.10
  reply()       → happiness +5,  loneliness -5
  ignore()      → loneliness +3
  FRIEND_MSG    → happiness +10, loneliness -8
  RANDOM_BAD    → stress +15,    loneliness +8
```

---

## 2.6 NPC Perception State Diagram (RealWorldScene)

```
NPC State Machine (per NPC: Mom, Alex, Sam)

  ┌──────────┐   Kai enters      ┌──────────────┐
  │ WANDERING│──hearing range──►│  PERCEIVED   │
  │ (default)│                   │  (can hear)  │
  └──────────┘                   └──────┬───────┘
       ▲                                │ Kai enters
       │                                │ vision cone
       │                         ┌──────▼───────┐
       │                         │   VISIBLE    │
       │                         │ (can see)    │
       │                         └──────┬───────┘
       │                                │ dist < 90px
       │                         ┌──────▼───────┐
       │ Kai moves away          │  INTERACT    │
       └─────────────────────────│  PROMPT      │
                                 │  [T] to talk │
                                 └──────┬───────┘
                                        │ T pressed
                                 ┌──────▼───────┐
                                 │   SPEAKING   │
                                 │  bubble shown│
                                 └──────────────┘
```

---

## 2.7 UML Class Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           Agent                                  │
├─────────────────────────────────────────────────────────────────┤
│ + x, y : number                                                  │
│ + addictionLevel : number (0-100)                                │
│ + awareness : number (0-100)                                     │
│ + curiosity : number (0-100)                                     │
│ + relationshipLevel : number (0-100)                             │
│ + memory : string[]                                              │
│ + ignoredMessages : number                                       │
│ + scrollCount : number                                           │
│ + timeOnPhone : number                                           │
│ + hunchLevel : number (0-4)                                      │
│ + hasPhone : boolean                                             │
│ + rubberBand : boolean                                           │
├─────────────────────────────────────────────────────────────────┤
│ + update() : void                                                │
│ + usePhone() : void                                              │
│ + onScroll() : void                                              │
│ + respondToMessage(action) : void                                │
│ + bounce() : void                                                │
│ - _drawCharacter(state) : void                                   │
│ - _handleInput() : void                                          │
│ - _perceive() : void                                             │
│ - _updateAIVariables() : void                                    │
│ - _syncHUD() : void                                              │
└──────────────┬──────────────────────────┬───────────────────────┘
               │ has-a                    │ has-a
               ▼                          ▼
┌──────────────────────┐    ┌──────────────────────────┐
│         FSM          │    │      EmotionSystem        │
├──────────────────────┤    ├──────────────────────────┤
│ + state : string     │    │ + stress : number         │
│ + engageCount : num  │    │ + happiness : number      │
│ + resistCount : num  │    │ + loneliness : number     │
│ + ignoredFriends:num │    ├──────────────────────────┤
├──────────────────────┤    │ + update() : void         │
│ + handleEvent(e)     │    │ + applyEvent(delta) : void│
│ + forceState(s)      │    └──────────────────────────┘
│ + onTransition(fn)   │
│ - _resolveOutcome()  │
│ - _transition(s,r)   │
└──────────────────────┘
```
