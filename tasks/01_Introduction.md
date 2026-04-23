# 01 — Introduction: Agent Scenario & Problem Field

---

## 1.1 Project Title

**EchoSphere: The World You Shape**
An intelligent agent-based simulation of digital addiction and academic decision-making in a teenage student.

---

## 1.2 Agent Scenario

The simulation follows **Kai**, a teenage student who begins each session in his bedroom facing a fundamental choice: pick up his phone or step outside into the real world. This single decision branches into a complex behavioral loop driven by six AI intelligence traits.

Kai is not a scripted character — he is an **autonomous agent** whose behavior emerges from internal state variables, environmental stimuli, and accumulated memory. His posture changes as addiction rises. His relationships degrade when he ignores messages. His academic results reflect the sum of every choice made across the simulation.

The simulation is structured as a **repeating behavioral loop**, not a linear story:

```
Mobile (Attraction)
    ↓
Addiction deepens
    ↓
Bad Grades (Consequence)
    ↓
Learning system fires → returns to Studies
    ↑                          ↓
Real World (Balancing) ← Distraction possible
                               ↓
                          Good Grades
```

Each pass through the loop, Kai's AI becomes more resilient. The Learning system stores behavioral patterns and uses them to influence future decisions.

---

## 1.3 Problem Field

### Domain
Artificial Intelligence · Behavioral Simulation · Human-Computer Interaction · Educational Technology

### Core Problem
Modern teenagers face a documented conflict between digital engagement (social media, notifications, infinite scroll) and real-world responsibilities (academic performance, family relationships, physical presence). This conflict is difficult to study directly because it unfolds over time, involves internal emotional states, and is shaped by unpredictable environmental events.

**EchoSphere models this conflict as an AI agent problem:**
- The agent has internal state variables (addiction, awareness, stress, happiness, loneliness, relationship level)
- The environment generates stimuli (notifications, friend messages, NPC interactions, weather events)
- The agent must make decisions at key nodes (phone vs door, scroll vs study, reply vs ignore)
- Outcomes emerge from the accumulation of those decisions — not from a single choice

### Why an Agent-Based Approach?
A traditional game or animation cannot capture the emergent, non-linear nature of addiction and recovery. An agent-based model allows:
- **Behavior to emerge** from rules rather than be scripted
- **Multiple outcomes** from the same starting conditions depending on choices
- **Learning** — the agent genuinely changes behavior based on past experience
- **Unpredictability** — random environmental events ensure no two runs are identical

---

## 1.4 Problem Description

| Aspect | Description |
|---|---|
| **Agent** | Kai — a teenage student with internal emotional and behavioral state |
| **Environment** | Bedroom, social feed, study room, outdoor park — each with distinct stimuli |
| **Percepts** | Notifications, NPC speech, proximity to objects, time on phone, scroll events |
| **Actions** | Move, pick up phone, scroll, reply/ignore messages, study, interact with NPCs |
| **Goal** | Balance digital engagement with real-world responsibilities to achieve good grades |
| **Challenge** | Addiction mechanics actively work against the goal — the environment is adversarial |

---

## 1.5 Brief Description of Research

The project draws on the following research areas:

**Digital Addiction Modeling**
Research shows that social media platforms use variable reward schedules (similar to slot machines) to drive compulsive usage. EchoSphere models this through the auto-scroll mechanic — once addiction exceeds 50%, the agent loses manual control, mirroring the documented loss of agency in addictive behavior.

**Finite State Machines in AI**
FSMs are a well-established technique for modeling agent behavior. EchoSphere uses an FSM with states `IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT → [RECOVERED | PARTIAL | LOST]`. Transitions are event-driven, not time-based, making behavior reactive and realistic.

**Emotional Intelligence in Agents**
The agent tracks three emotional dimensions — stress, happiness, loneliness — that drift toward baselines and are perturbed by events. This models the documented relationship between social media use and emotional wellbeing.

**Reinforcement Learning Concepts**
The Learning system stores behavioral patterns (`high_addiction`, `social_neglect`, `compulsive_scrolling`) and uses them to influence future behavior — a simplified form of experience-based learning.

---

## 1.6 Challenges Faced

| Challenge | Description | Resolution |
|---|---|---|
| **Behavior-based transitions** | Avoiding time-based scene changes that feel scripted | Implemented multi-condition transition logic combining addiction level, ignored messages, and awareness |
| **Auto-scroll loss of control** | Demonstrating agent losing autonomy without removing player agency entirely | Auto-scroll speed scales with addiction; player can still scroll manually but the feed moves on its own |
| **NPC perception realism** | NPCs should not react to Kai if he cannot perceive them | Implemented vision cone (90°) and hearing range (150px) — NPCs outside both are invisible to Kai |
| **Distraction loop** | Study scene must allow phone to interrupt without breaking the scene flow | Notifications fire randomly during study tasks; addiction level determines probability of distraction |
| **Emotional state visibility** | Internal AI variables must be visible to the player for educational value | Real-time bars for addiction, awareness, stress, happiness, loneliness displayed in the mobile UI and HUD |
| **Scene continuity** | Agent state (addiction, memory, relationships) must carry across scenes | Agent state is passed as data object between scenes via `scene.start(key, data)` |
| **Random event balance** | Random events must feel meaningful, not arbitrary | Events are weighted by probability and only fire when conditions are appropriate (e.g. dusk only during Real World) |

---

## 1.7 Team

**Implemented by Baanu & Irfa**
EchoSphere v1.0 — Built with Phaser.js
