# 🌐 EchoSphere: The World You Shape

> An interactive, AI-driven agent simulation about a teenage student navigating digital addiction — and finding his way back to real-world connections.

*Implemented by Baanu & Irfa*

---

## 🎯 What Is This?

**EchoSphere** is a browser-based intelligent agent simulation built with Phaser.js. You follow **Kai**, a teen whose choices between his phone and the real world shape his emotional state, relationships, and behavior.

The simulation is **not linear**. It uses a behavior-driven AI system — Kai's FSM state, addiction level, awareness, and memory all influence what happens next. Every run can end differently.

---

## 🗺️ Scene Flow

```
Boot Screen
     │
     ▼
Scenario 1: The Attraction (Bedroom)
     │
     ├── 📱 Pick up Phone → Social Feed → Addiction builds
     │        │                              │
     │        │                    Behavior-based transition
     │        │                    (not a timer — 3 conditions)
     │        │                              │
     │        └──────────────────────────────▼
     │                               Scenario 3: Distortion
     │
     └── 🚪 Open Door [F] → Scenario 2: Real World
                                  │
                             5 alternative endings
                             based on NPC interactions,
                             learning, and phone behavior
                                  │
                                  ▼
                             Scenario 3: Distortion
```

---

## 🎬 Scenes

| # | Key | Scene | Description |
|---|---|---|---|
| 0 | `BootScene` | Boot Screen | Animated title screen with ? info panel |
| 1 | `AttractionScene` | The Attraction | Bedroom — phone or door decision |
| 2 | `RealWorldScene` | Real World | Outdoor park with NPCs, vision cone, weather |
| 3 | `DistortionScene` | Distortion | Split-world glitch scene |
| 4 | `TheLoopScene` | The Loop | *(in development)* |

See **[SCENARIOS.md](./SCENARIOS.md)** for the full breakdown of every scene.

---

## 🧠 AI Intelligence Traits

| Trait | How It Works |
|---|---|
| **Perception** | Vision cone (90°, 200px) drawn each frame. Hearing range (150px) independent of direction. Range shrinks at dusk and when phone is out. NPCs only interactable when perceived. |
| **Decision Making** | Phone vs door; reply vs ignore messages; behavior-based scene transitions (3 conditions, not a timer); 5 alternative endings in Real World. |
| **Emotional Intelligence** | `stress`, `happiness`, `loneliness` affect FSM and NPC reactions. NPC faces redraw live per emotion. Angry NPC triggers chain reaction in nearby NPCs. |
| **Learning** | `agent.memory[]` stores patterns (`high_addiction`, `social_neglect`, `compulsive_scrolling`, `mom_advice`). Kai avoids NPCs after repeated conflict. Mom's advice given only once. |
| **NL Communication** | Speech bubbles with emotion-colored borders. NPCs call out when Kai is in hearing range. Context-aware dialogue changes on return visits. |
| **Pathfinding** | Agent walks to phone/door. NPCs wander autonomously. NPCs seek Kai via steering when ignored. Rain sends all NPCs to bench shelter. |

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
speed = ((addiction - 50) / 50) * 2
```

### Behavior-Based Transition (not a timer)
```javascript
addictionLevel >= 100
|| (addictionLevel > 85 && ignoredMessages >= 2)
|| (awareness < 20 && addictionLevel > 80)
```

### FSM States
```
IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT
                                              │
                              ┌───────────────┼───────────────┐
                           RECOVERED       PARTIAL          LOST
```

### Hunch System
Kai's posture degrades visually as addiction rises:
- 0–20%: upright
- 20–40%: slight lean
- 40–60%: noticeable hunch
- 60–80%: heavy hunch
- 80–100%: fully hunched

---

## 🌿 Real World — Intelligence Highlights

### Vision Cone
- 90° field of view, 200px range
- Drawn as a golden wedge from Kai's position every frame
- Shrinks at dusk (55%) and when phone is out (60%)

### Hearing Range
- 150px radius circle, direction-independent
- NPCs within range can be heard even outside the vision cone

### NPC Emotional Intelligence
- NPCs react to Kai's addiction level with angry/sad expressions
- Angry NPC triggers chain reaction — others respond with concern
- NPC faces redraw live (eyebrows, iris color, mouth shape)

### Learning
- Kai remembers NPCs he's spoken to (different dialogue on return)
- After 2 bad interactions with same NPC → Kai avoids them permanently
- Mom gives advice once → `mom_advice` stored in memory → addiction -20

### 5 Alternative Endings
| Condition | Ending |
|---|---|
| Advice learned + low addiction + high relations | 🌿 Full Recovery |
| 3+ conversations + high relations | 💚 Real Connection |
| 3+ ignored interactions | 📱 Still Distracted |
| Avoided NPC after conflict | 😔 Bridges Burned |
| Mixed behavior | 🤔 Uncertain Path |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Game Engine | [Phaser.js 3](https://phaser.io/) |
| Animations | [GSAP](https://greensock.com/gsap/) |
| UI / HUD | HTML5 + [Tailwind CSS](https://tailwindcss.com/) |
| Logic | Vanilla JavaScript ES6 modules |
| Build Tool | [Vite](https://vitejs.dev/) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |

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
| `Arrow Keys` / `WASD` | Move Kai |
| `E` | Pick up phone (when nearby) |
| `F` | Open door (when nearby) |
| `T` | Talk to NPC (when perceived) |
| `ESC` | Close phone screen |
| `N` | Skip current scene |
| `SPACE` / `ENTER` | Start (Boot screen) |

---

## 📁 Project Structure

```
src/
├── agent/
│   ├── Agent.js          # Kai — movement, drawing, AI variables
│   ├── FSM.js            # Finite State Machine
│   └── EmotionSystem.js  # Stress / happiness / loneliness
├── scenes/
│   ├── BootScene.js      # Loading screen with ? info panel
│   ├── AttractionScene.js # Scenario 1 — bedroom
│   ├── RealWorldScene.js  # Scenario 2 — outdoor park
│   ├── DistortionScene.js # Scenario 3 — split world
│   └── TheLoopScene.js    # Scenario 4 (in development)
├── styles/
│   └── main.css          # Tailwind + font imports
└── main.js               # Phaser game config + scene registration
```

---

## 🎓 Academic Context

This project demonstrates the following AI agent behaviors for academic assessment:

- ✅ **State-based behavior** — FSM with 8 states and event-driven transitions
- ✅ **Perception** — vision cone and hearing range with real-world physics
- ✅ **Emotional intelligence** — emotion variables affect behavior and NPC reactions
- ✅ **Natural language communication** — speech bubbles with context-aware dialogue
- ✅ **Learning** — memory system stores patterns and influences future decisions
- ✅ **Pathfinding** — steering behaviors for agent and NPCs
- ✅ **Decision making** — behavior-driven transitions, not time-based
- ✅ **Alternative endings** — 5 outcomes based on accumulated behavior
- ✅ **Random events** — unpredictable world events (dusk, rain, wind, NPC approach)

> *"We enhanced the interaction by linking user actions to agent variables such as addiction and awareness. The transition to the next scenario is not time-based, but behavior-driven, ensuring the agent demonstrates intelligent decision-making and learning."*
