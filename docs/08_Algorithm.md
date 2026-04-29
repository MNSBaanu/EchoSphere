# 8. Algorithms — Flowcharts

## 8.1 Overall Game Flow

```mermaid
flowchart TD
    A([Start]) --> B[Boot Screen]
    B --> C[Steve's Bedroom]
    C --> D{Player Choice}
    D -->|Pick up Phone| E[Social Media Feed]
    D -->|Walk to Door| F[Real World - Park]
    E --> G{Addiction Level}
    G -->|70%| H{Learn Now?}
    G -->|100%| I[Fail - Learning Key]
    H -->|Yes| J[Learning Scene]
    H -->|No| G
    I --> J
    J --> K[Return to Bedroom - Improved]
    K --> F
    F --> L[Talk to Family & Friends]
    L --> M([End Scene])
```

---

## 8.2 Agent FSM States

```mermaid
flowchart TD
    A([IDLE]) --> B[ATTRACTED]
    B --> C[LOOPING]
    C --> D[DISTORTED]
    D --> E[BREAKING POINT]
    E --> F([RECOVERED])
    E --> G([PARTIAL])
    E --> H([LOST])

    A -->|Notification seen| B
    B -->|Engaged too much| C
    C -->|Stress ≥ 65| D
    D -->|Stress ≥ 85| E
    E -->|Resisted more| F
    E -->|Mixed behavior| G
    E -->|Ignored friends| H
```

---

## 8.3 Phone Addiction Progression

```mermaid
flowchart TD
    A([Phone Picked Up]) --> B[Addiction Increases per Frame]
    B --> C{Addiction Level?}
    C -->|Below 50%| D[Manual Scroll Only]
    C -->|Above 50%| E[Auto-Scroll Activates]
    C -->|Reaches 70%| F[Educational Popup]
    C -->|Reaches 100%| G[Failure Notification]
    D --> B
    E --> B
    F --> H{Accept?}
    H -->|Yes| I([Go to Learning Scene])
    H -->|No| B
    G --> J[Learning Key Appears]
    J --> I
```

---

## 8.4 NPC Perception & Interaction

```mermaid
flowchart TD
    A([NPC Wandering]) --> B{Steve Nearby?}
    B -->|In Vision Cone 200px| C[NPC Perceived]
    B -->|In Hearing Range 150px| C
    B -->|Not in Range| A
    C --> D{Steve Presses T?}
    D -->|No| A
    D -->|Yes| E{Steve's State?}
    E -->|Low Addiction| F[Happy Dialogue]
    E -->|High Addiction + Phone| G[Angry Dialogue]
    E -->|Mom + Addiction > 60%| H[Give Advice]
    F --> I([Return to Wandering])
    G --> I
    H --> I
```

---

## 8.5 Learning System

```mermaid
flowchart TD
    A([Enter Learning Scene]) --> B[Show Task 1]
    B --> C{Press SPACE?}
    C -->|Yes| D[Fill Progress Bar]
    C -->|No| C
    D --> E{Task 1 Complete?}
    E -->|No| C
    E -->|Yes| F[Show Task 2]
    F --> G{Press SPACE?}
    G -->|Yes| H[Fill Progress Bar]
    G -->|No| G
    H --> I{Task 2 Complete?}
    I -->|No| G
    I -->|Yes| J[Apply Benefits]
    J --> K[Addiction -30 to -40]
    K --> L[Awareness +25 to +35]
    L --> M([Return to Bedroom])
```

---

## 8.6 Emotion System

```mermaid
flowchart TD
    A([Event Occurs]) --> B{Event Type}
    B -->|Notification Seen| C[Happiness +8, Stress +2]
    B -->|Friend Ignored| D[Loneliness +8, Happiness -5]
    B -->|Player Engages| E[Happiness +8, Stress +3]
    B -->|Random Good| F[Stress -5, Loneliness -5]
    C --> G[Check FSM Thresholds]
    D --> G
    E --> G
    F --> G
    G --> H{Stress Level?}
    H -->|≥ 65| I[FSM → DISTORTED]
    H -->|≥ 85| J[FSM → BREAKING POINT]
    H -->|Normal| K[Drift Back to Baseline]
    I --> K
    J --> K
    K --> A
```

---

## 8.7 Memory & Learning Patterns

```mermaid
flowchart TD
    A([Monitor Behavior]) --> B{Addiction > 80%?}
    B -->|Yes| C[Store: high_addiction]
    B -->|No| D{Ignored 2+ Messages?}
    C --> D
    D -->|Yes| E[Store: social_neglect]
    D -->|No| F{Scrolled 50+ Times?}
    E --> F
    F -->|Yes| G[Store: compulsive_scrolling]
    F -->|No| H{Mom Gave Advice?}
    G --> H
    H -->|Yes| I[Store: mom_advice]
    H -->|No| J{2 Bad NPC Interactions?}
    I --> J
    J -->|Yes| K[Store: avoid_npc]
    J -->|No| L([Memory Updated])
    K --> L
```

---

## 8.8 Eye Movement Response

```mermaid
flowchart TD
    A([Notification Fires]) --> B[Play Sound 3 Times]
    B --> C[Eyes Snap to Right]
    C --> D[Hold 800ms]
    D --> E[Eyes Return to Center]
    E --> F[Agent Responds to Phone]
    F --> G([Normal State Resumes])
```
