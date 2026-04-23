# 🌐 EchoSphere: The World You Shape

> An interactive, agent-based simulation about a teenage student navigating the pull of digital addiction — and finding his way back to balance, real-world connections, and academic success.

---

## 🎯 Overview

**EchoSphere** is a browser-based intelligent agent simulation built with Phaser.js, GSAP, and Tailwind CSS. The player follows **Kai**, a teenage student whose daily choices between his phone and the real world compound into outcomes that shape his academic results and relationships.

The simulation is not linear — it is a **behavioral loop**. Kai can fall into addiction, recover through learning, get distracted while studying, and cycle back again. Each pass through the loop, the AI's Learning system makes Kai more resilient. The Real World acts as the anchor that keeps pulling him toward balance.

---

## 🗺️ The Story Flow

```
              Agent (Kai)
             /            \
        Mobile           Real World
           |                  |
      Attraction          NPC Interaction
           |             (Balancing — EI +
    Decision Node:        NL Communication)
    Scroll or Study?           |
       /        \              ↓
  Addiction    Studies ←───────┘
      |            |
      |     (Distraction possible
      |      → back to Addiction)
      ↓            ↓
  Bad Grades   Good Grades
      |
  [Learning]
      ↓
  Back to Studies
```

---

## 🎬 The Scenes

| # | Scene | Description |
|---|---|---|
| 0 | Boot | Title screen — Kai's story begins |
| 1 | The Attraction | Bedroom fork — phone or door? |
| 2 | Addiction | Social feed loop, auto-scroll, ignored messages |
| 3 | Results (Bad) | Consequence of addiction — bad grades |
| 4 | Studies | Desk tasks, XP system, distraction risk |
| 5 | Real World | Outdoor NPC interactions, vision cone, balancing |
| 6 | Results (Good) | Outcome of sustained study and balance |

See **[SCENARIOS.md](./SCENARIOS.md)** for the full breakdown of each scene.

---

## 🧠 Agent Intelligence Traits

| Trait | Description | Active In |
|---|---|---|
| **Perception** | Detects notifications, NPCs, environmental cues via vision cone and hearing range | Scenes 1, 4, 5 |
| **Decision Making** | Weighted, state-driven choices — phone vs door, scroll vs study, reply vs ignore | Scenes 1, 2, 4 |
| **Emotional Intelligence** | Tracks `stress`, `happiness`, `loneliness` — affects behavior and NPC reactions | Scenes 2, 4, 5 |
| **Learning** | Stores behavioral patterns in memory; failure drives recovery behavior | Scenes 2, 3, 4 |
| **NL Communication** | NPC dialogue system with emotional responses, advice, and context-aware reactions | Scene 5 |
| **Pathfinding** | Agent navigates to phone/door; NPCs autonomously seek Kai when ignored | Scenes 1, 5 |

---

## 🔁 The Core Loop

The simulation is built around a repeating behavioral cycle:

1. Kai gets attracted to his phone (Scene 1)
2. Addiction deepens — awareness drops, relationships suffer (Scene 2)
3. Bad grades arrive as a consequence (Scene 3)
4. The Learning system fires — Kai remembers the failure and returns to studying (Scene 4)
5. While studying, distractions can pull him back to addiction (loop continues)
6. Real-world interactions restore balance and feed back into studies (Scene 5)
7. Sustained study leads to good grades (Scene 6)

Each cycle through the loop, Kai's AI becomes more resilient. The Learning system stores patterns like `high_addiction`, `social_neglect`, and `compulsive_scrolling` — and uses them to influence future decisions.

---

## 🤖 How the AI Works

### Addiction Variable
- Rises by 0.15/frame during phone use, 0.3 per scroll
- Decays at 0.02/frame when phone is put down
- Drives visual hunch (4 levels), auto-scroll, and state transitions

### Auto-Scroll (Loss of Control)
- Activates when `addictionLevel > 50`
- Speed scales with addiction: `((addiction - 50) / 50) * 2`
- Demonstrates the agent losing autonomy to the system

### Behavior-Based Transitions
Transitions are **not time-based**. Multiple conditions must be met:
```javascript
addictionLevel >= 100
|| (addictionLevel > 85 && ignoredMessages >= 2)
|| (awareness < 20 && addictionLevel > 80)
```

### Learning System
Patterns stored in `agent.memory[]`:
- `high_addiction` — addiction exceeded 80%
- `social_neglect` — 2+ messages ignored
- `compulsive_scrolling` — scroll count exceeded threshold
- `mom_advice` — received advice from Mom NPC (not repeated)

### Vision Cone + Hearing (Real World)
- 90° field of view, range shrinks at dusk and when phone is out
- Hearing range: 150px regardless of direction
- NPCs outside perception range are not noticed or interacted with

---

## 🌍 Environment Zones

| Zone | Description |
|---|---|
| **Bedroom (Mobile)** | Warm room with phone on desk and door to outside. First decision point. |
| **Social Feed** | Full-screen phone UI with scrollable notifications, addiction bars, emotion meters. |
| **Study Room** | Desk with laptop, notebook, bookshelf. Task cards and XP system. |
| **Outdoor Park** | Sunny park with NPCs, vision cone, weather events, and bench. |

---

## 👾 Characters

- **Kai** — The main agent. FSM-driven behavior. Reacts to environment, NPCs, and internal emotion levels. Hunches forward as addiction increases.
- **Mom** — Gives advice once when addiction is high. Kai learns from her and stores it in memory.
- **Alex (Friend)** — Casual NPC. Reacts with frustration if Kai has his phone out.
- **Sam (Sibling)** — Younger NPC. Seeks attention and reacts emotionally to being ignored.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Game Engine** | [Phaser.js 3](https://phaser.io/) — scenes, input, tweens, graphics |
| **Animations** | [GSAP](https://greensock.com/gsap/) — UI transitions, pop-ins, card animations |
| **Frontend / UI** | HTML5 + [Tailwind CSS](https://tailwindcss.com/) — HUD, meters, dialogue boxes |
| **Logic** | Vanilla JavaScript ES6 modules — FSM, learning system, emotion engine |
| **Build Tool** | [Vite](https://vitejs.dev/) — fast dev server and bundler |

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
| `Arrow Keys / WASD` | Move Kai |
| `E` | Pick up phone (when nearby) |
| `T` | Talk to NPC (when nearby and perceived) |
| `SPACE` | Progress study task (hold to fill bar) |
| `C` | Sit / stand at desk |
| `N` | Skip current scene |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Implemented by Baanu & Irfa*
