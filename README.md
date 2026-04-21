# 🌐 EchoSphere: The World You Shape

> An interactive, agent-based simulation game about a teen navigating the pull of digital addiction — and finding their way back to the real world.

---

## 🎯 Overview

**EchoSphere** is a browser-based intelligent agent simulation built with Phaser.js, p5.js, and Tailwind CSS. An anime-styled teen agent moves autonomously between a vibrant Digital World and a fading Real World, making decisions driven by six AI intelligence traits. The story branches into multiple endings based on events, choices, and random happenings — no two playthroughs are the same.

---

## 🧠 Agent Intelligence Traits

| Trait | Description |
|---|---|
| **Perception** | Detects incoming notifications, nearby NPCs, and environmental sounds |
| **Emotional Intelligence** | Tracks an internal emotion meter — `stress`, `happiness`, `loneliness` |
| **NLP** | Processes and responds to text/audio messages from friend and family NPCs |
| **Learning** | Stores past decisions in memory; prior actions influence future behavior |
| **Pathfinding** | Navigates between Digital and Real World zones using A* pathfinding |
| **Decision Making** | Core logic engine — every major action is a weighted, state-driven choice |

---

## 🗺️ The 5 Scenes

See **[SCENARIOS.md](./SCENARIOS.md)** for the full breakdown of each scene.

| # | Scene | Phase |
|---|---|---|
| 1 | The Attraction | Initial Engagement |
| 2 | The Loop | Habit Formation |
| 3 | The Distortion | Conflict |
| 4 | The Breaking Point | Critical Decision |
| 5 | The Outcome | Final State (3 possible endings) |

---

## 🌍 Environment

| Zone | Description |
|---|---|
| **Digital World** | Neon-lit, notification-heavy, fast-paced. Glowing UI, anime-style pixel art. |
| **Real World** | Warm, natural tones. Degrades visually as addiction deepens. Restored on good ending. |

Agents move between zones via transition portals. Each zone's visual state reflects the agent's current emotional and behavioral condition.

---

## 👾 Characters

- **Main Agent** — Anime-styled teen. FSM-driven behavior. Reacts to environment, NPCs, and emotion levels.
- **Friend NPC** — Sends messages; can pull the agent toward reality or deeper into the loop.
- **Parent NPC** — Calls and appears in the real world. Relationship degrades if ignored.
- **Social Media Bot NPCs** — Hostile agents that spam notifications to keep the agent trapped.

---

## 🔀 State-Based Behavior

```
IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT → [RECOVERED | PARTIAL | LOST]
```

State transitions are triggered by:
- Incoming notifications (random frequency)
- NPC interactions (friend messages, parent calls)
- Emotion meter thresholds
- Player-influenced choices at decision nodes
- Random environmental events

---

## ⚡ Random Events

- 📵 Phone battery dies — forces real-world interaction
- 🌧️ Rainstorm draws the agent outside
- 💬 Unexpected message from a long-lost friend
- 🔔 Viral notification spikes the addiction loop
- 🛑 Social media platform goes down temporarily

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Game Engine** | [Phaser.js](https://phaser.io/) — scenes, physics, sprites, input |
| **Creative Visuals** | [p5.js](https://p5js.org/) — generative art, emotion visualizations |
| **Frontend / UI** | HTML5 + [Tailwind CSS](https://tailwindcss.com/) — HUD, meters, dialogue |
| **Animations** | [GSAP](https://greensock.com/gsap/) *(optional)* — UI transitions, pop-ins |
| **Logic** | Vanilla JavaScript (ES6 modules) — FSM, pathfinding, NLP dialogue |

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

## 🎮 How It Works

1. The simulation runs autonomously — the agent acts on its own intelligence.
2. At **decision nodes**, you can influence the agent's choice.
3. Watch the **emotion meters** in the HUD — they drive state transitions.
4. Random events fire unpredictably — no two runs are identical.
5. The story branches at **Scene 4** based on accumulated decisions and emotional state.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
