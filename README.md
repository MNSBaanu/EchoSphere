# 🌐 EchoSphere: The World You Shape

> An interactive, AI-driven agent simulation about a teenage student navigating digital addiction — and finding his way back to real-world connections.

*Implemented by Baanu & Irfa*

---

## 🎯 What Is This?

**EchoSphere** is a browser-based intelligent agent simulation built with Phaser.js. You follow **Steve**, a teen whose choices between his phone and the real world shape his emotional state, relationships, and behaviour.

The simulation is **not linear**. It uses a behaviour-driven AI system — Steve's FSM state, addiction level, awareness, and memory all influence what happens next. Every run can end differently.

---

## 🗺️ Scene Flow

```
Boot Screen
     │
     ▼
Scenario 1: The Attraction (Bedroom)
     │
     ├── 📱 Walk to Phone → Press [E] to pick up
     │        │
     │        ▼
     │   Social Media Feed opens
     │   Addiction level rises each frame
     │        │
     │        ├── At 70% addiction → Learning notification popup
     │        │        ├── Accept  → Scenario 3: Learning Path
     │        │        └── Later   → Keep scrolling
     │        │
     │        └── At 100% addiction → Fail notification
     │                 └── OK → Learning Key → Scenario 3: Learning Path
     │
     └── 🚪 Walk to Door → Scenario 2: Real World
                                  │
                             Press [T] to advance conversation
                             with Mom, Alex, and Sam (7 lines)
                                  │
                             After conversation → group walks to road
                                  │
                                  ▼
                             End Screen (Journey Complete)

Scenario 3: Learning Path
     │
     Complete 2 study tasks with [SPACE]
     │
     ▼
     Return to Scenario 1
```

---

## 🎬 Scenes

| # | Key | Scene | Description |
|---|---|---|---|
| 0 | `BootScene` | Boot Screen | Animated title screen with info panel |
| 1 | `AttractionScene` | The Attraction | Bedroom — phone or door decision |
| 2 | `RealWorldScene` | Real World | Outdoor park with NPCs, vision cone, weather |
| 3 | `LearningScene` | Learning Path | Study room — complete tasks to earn XP |
| 4 | `TripScene` | Road Trip | Driving scene (accessible via code) |
| 5 | `EndScene` | Journey Complete | Final end screen |

---

## 🧠 AI Intelligence Traits

| Trait | How It Works |
|---|---|
| **Perception** | Vision cone (90°, 200px) calculated each frame using trigonometry. Hearing range (150px) omnidirectional. Range shrinks at dusk (×0.55) and when phone is visible (×0.6). NPCs only interactable when perceived. |
| **Emotional Intelligence** | `stress`, `happiness`, `loneliness` drift toward baseline each frame and are modified by events. Emotions drive FSM transitions (stress ≥ 65 → DISTORTED, stress ≥ 85 → BREAKING_POINT). NPC faces redraw live per emotion. |
| **Learning & Memory** | `agent.memory[]` stores patterns (`high_addiction`, `social_neglect`, `compulsive_scrolling`, `mom_advice`, `avoid_[npc]`). Steve avoids NPCs after repeated conflict. Mom's advice given only once. Memory persists across scenes. |
| **Decision Making** | Phone vs door; 70% addiction decision popup (learn or scroll); behaviour-based FSM outcomes (RECOVERED / PARTIAL / LOST). |
| **Autonomous Behaviour** | NPCs wander autonomously (new target every 4s). NPCs seek Steve via steering when ignored. Rain sends all NPCs to bench shelter. Group walks to road after conversation. |
| **State-Based Behaviour** | FSM with 8 states and event-driven transitions. Same event produces different responses depending on current state. |

---

## 🤖 How the AI Core Works

### Addiction Variable (drives everything)
```
Phone use:  addictionLevel += 0.15 / frame
Scrolling:  addictionLevel += 0.3 / scroll
Idle:       addictionLevel -= 0.02 / frame
```

### Auto-Scroll (agent loses control)
```
addiction > 50%  →  auto-scroll activates
speed = ((addiction - 50) / 50) × 2
```

### Decision Triggers
```
addiction ≥ 70%  →  Learning notification popup (progress pauses)
addiction ≥ 100% →  Fail notification → Learning Key
```

### FSM States
```
IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT
                                              │
                              ┌───────────────┼───────────────┐
                           RECOVERED       PARTIAL          LOST
```

### Hunch System
Steve's posture degrades visually as addiction rises:
- 0–20%: upright
- 20–40%: slight lean
- 40–60%: noticeable hunch
- 60–80%: heavy hunch
- 80–100%: fully hunched

---

## 🌿 Real World — Intelligence Highlights

### Vision Cone
- 90° field of view, 200px range
- Calculated using `Math.atan2` and `Phaser.Math.Angle.Wrap` each frame
- Shrinks at dusk (×0.55) and when phone is visible (×0.6)

### Hearing Range
- 150px radius, direction-independent
- NPCs within range can be heard even outside the vision cone

### NPC Emotional Intelligence
- NPCs react to Steve's phone use with angry/sad expressions
- Angry NPC triggers chain reaction — others respond with concern
- NPC faces redraw live (eyebrows, iris colour, mouth shape)
- Contagious happiness: happy NPCs make others happy

### Learning
- Steve remembers NPCs he's spoken to (different dialogue on return visits)
- After 2 bad interactions with same NPC → Steve avoids them permanently
- Mom gives advice once → `mom_advice` stored in memory → addiction −20, awareness +15

### Conversation System
- 7-line scripted conversation with Mom, Alex, and Sam
- Press **[T]** to advance one message at a time
- Previous bubble is cleared before next appears (one message at a time)
- After all 7 lines → group walks to road → End Screen

---

## 📱 Scenario 1 — Addiction Flow

```
Phone picked up
      │
      ▼
Feed scrolling → addiction rises
      │
      ├── addiction > 50% → auto-scroll enables
      │
      ├── addiction ≥ 70% → PAUSE progress
      │        Learning notification appears
      │        ├── Accept → LearningScene
      │        └── Later  → continuous scroll mode
      │
      └── addiction ≥ 100% → Fail notification
               OK → Learning Key appears
               Click → LearningScene
```

---

## � Scenario 3 — Learning Path

- Two study tasks: **Mathematics** and **Science**
- Press **[SPACE]** to fill the progress bar (50% per press → 2 presses to complete)
- Completing a task earns XP and triggers a particle burst
- After both tasks → success card → click to return to Scenario 1

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Game Engine | [Phaser.js 3](https://phaser.io/) |
| Animations | [GSAP](https://greensock.com/gsap/) |
| Logic | Vanilla JavaScript ES6 modules |
| Build Tool | [Vite](https://vitejs.dev/) |
| Fonts | Inter (Google Fonts) |

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/echosphere.git
cd echosphere
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🎮 Controls

| Key | Action |
|---|---|
| `Arrow Keys` / `WASD` | Move Steve |
| `E` | Pick up phone (when aligned with phone on X axis) |
| `T` | Talk to NPC / advance conversation |
| `SPACE` | Fill study task progress bar (Learning Scene) |
| `N` / `F` | Skip current scene |

---

## 📁 Project Structure

```
src/
├── agent/
│   ├── Agent.js           # Steve — movement, drawing, AI variables
│   ├── FSM.js             # Finite State Machine (8 states)
│   └── EmotionSystem.js   # Stress / happiness / loneliness
├── scenes/
│   ├── BootScene.js       # Title screen with info panel
│   ├── AttractionScene.js # Scenario 1 — bedroom, phone vs door
│   ├── RealWorldScene.js  # Scenario 2 — outdoor park, NPCs
│   ├── LearningScene.js   # Scenario 3 — study room, tasks
│   ├── TripScene.js       # Road trip driving scene
│   └── EndScene.js        # Journey Complete end screen
├── styles/
│   └── main.css           # Global styles
└── main.js                # Phaser game config + scene registration
```

---

## 🎓 Academic Context

This project demonstrates the following AI agent behaviours for academic assessment:

- ✅ **State-based behaviour** — FSM with 8 states and event-driven transitions
- ✅ **Perception** — vision cone and hearing range with real-world physics modifiers
- ✅ **Emotional intelligence** — emotion variables (stress, happiness, loneliness) drive FSM and NPC reactions
- ✅ **Learning & memory** — memory array stores patterns and influences future decisions across scenes
- ✅ **Autonomous NPC behaviour** — wandering, seek steering, approach decisions, emotional contagion
- ✅ **Decision making** — behaviour-driven transitions at 70% and 100% addiction thresholds
- ✅ **Real-world physics** — vision cone angle calculation, dusk/distraction modifiers, posture hunch system
- ✅ **Random events** — unpredictable world events (dusk, rain, wind, NPC approach, hearing events)

> *"The transition to the next scenario is not time-based, but behaviour-driven, ensuring the agent demonstrates intelligent decision-making and learning."*
