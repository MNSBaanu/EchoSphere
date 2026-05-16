# EchoSphere: The World You Shape

> An interactive, AI-driven agent simulation about a teenage student navigating digital addiction — and finding his way back to real-world connections.

*Implemented by Baanu & Irfa*

---

## What Is This?

**EchoSphere** is a browser-based intelligent agent simulation built with **Phaser.js 3**. You follow **Steve**, an AI agent whose behaviour is driven by perception, internal state, decisions, and memory — not by a fixed script.

The simulation is **non-linear**: FSM state, addiction level, awareness, emotions, and memory all influence what happens next. Different runs can produce different outcomes.

---

## AI Agent Model

Steve follows the core intelligent-agent cycle:

| Phase | In EchoSphere |
|--------|----------------|
| **Sense** | Vision cone, hearing range, phone notifications (audio + proximity), eye movement toward sound |
| **Think** | Processes inputs using addiction, awareness, emotions, and FSM state |
| **Act** | Movement, phone use, scrolling, NPC dialogue, autonomous NPC movement |
| **Learn** | `memory[]` stores patterns; behaviour adjusts across scenes |

### Intelligence traits

| Trait | Implementation |
|--------|----------------|
| **Perception** | 90° vision cone (200px), 150px hearing; reduced at dusk (×0.55) and when distracted by phone (×0.6) |
| **Emotional intelligence** | `stress`, `happiness`, `loneliness` with baseline drift; drives FSM transitions; NPC emotional reactions and contagion |
| **Natural language communication** | Speech bubbles; context-sensitive lines (`normal` / `angry` / advice); 7-line group conversation |
| **Learning & memory** | Patterns: `high_addiction`, `social_neglect`, `compulsive_scrolling`, `mom_advice`, `avoid_[npc]`, `educational_completion`; persists across scenes |
| **Searching & pathfinding** | NPC wander targets, seek steering toward Steve, rain shelter pathfinding, group walk to road |
| **Decision making** | Phone vs door; learn vs scroll at 70%; redemption at 100%; engage vs ignore NPCs; FSM outcomes |
| **State-based behaviour** | FSM with event-driven transitions; same event, different response per state |

### FSM states

```
IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT
                                              │
                              ┌───────────────┼───────────────┐
                           RECOVERED       PARTIAL          LOST
```

Transitions are triggered by **events** (notifications, scrolling, friend messages, player choices), not time alone.

### Core variables

| Variable | Role |
|----------|------|
| `addictionLevel` (0–100) | Drives phone behaviour, auto-scroll, hunch, learning triggers |
| `awareness` (0–100) | Decreases with phone use; recovers when idle |
| `memory[]` | Stores learned patterns; influences future behaviour |
| Emotions | `stress`, `happiness`, `loneliness` — affect FSM and NPC interaction |

**Addiction rules**

```
Phone use (open feed):  addiction += 0.15 / frame
Scroll (wheel):         addiction += 0.3 per scroll
Idle (no phone):        addiction -= 0.02 / frame

addiction > 50%  →  auto-scroll (agent loses control)
addiction ≥ 70%  →  learning notification (progress pauses)
addiction ≥ 100% →  fail notification → learning key (redemption)
```

**Appearance**

- Outfit colours stay **fixed** (initial palette) across all FSM states.
- **Expression** and **posture hunch** still reflect addiction and emotional state.

---

## Scene flow

```
BootScene
     │
     ▼
AttractionScene (Bedroom)
     │
     ├── Phone → [E] pick up → social feed
     │        ├── ≥70% addiction → Accept → LearningScene  OR  Later → keep scrolling
     │        └── ≥100% addiction → Fail → Learning key → LearningScene
     │
     └── Door → [F] → RealWorldScene
                        │
                        ├── Move near NPCs → [T] talk (no on-screen label)
                        ├── Auto 7-line group conversation → [T] advance
                        └── Group walks to road → EndScene

LearningScene
     │
     Complete 2 tasks ([SPACE]) → return to AttractionScene (improved stats)
```

### Registered scenes

| Key | Scene | Description |
|-----|--------|-------------|
| `BootScene` | Boot | Title screen and project info |
| `AttractionScene` | The Attraction | Bedroom — phone vs door |
| `LearningScene` | Learning Path | Study room — Mathematics & Science tasks |
| `RealWorldScene` | Real World | Park with Mom, Alex, Sam; perception, weather, dialogue |
| `EndScene` | Journey Complete | End screen after group walk |

---

## Controls

| Key | Scene | Action |
|-----|--------|--------|
| `Arrow Keys` / `WASD` | All (when unlocked) | Move Steve |
| `E` | Attraction | Pick up phone (near phone) |
| `ESC` | Attraction | Close phone feed |
| `F` | Attraction | Enter real world (near door) |
| Mouse wheel | Attraction | Scroll social feed |
| `T` | Real World | Talk to nearby NPC / advance group conversation |
| `SPACE` | Learning | Progress current study task |

---

## Real World highlights

- **NPCs:** Mom, Alex (friend), Sam (sibling) — context-sensitive dialogue and emotional reactions.
- **Perception:** Steve must perceive NPCs (see or hear) before interaction; vision shrinks at dusk and when phone-distracted.
- **Learning:** Mom’s advice once; avoid NPC after 2 bad interactions; memory carries from other scenes.
- **Events:** Random dusk, rain, wind, NPC approach, and hearing events.
- **UI:** No “Press [T] to talk” labels — `[T]` still works when near NPCs or during the group conversation.

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Game engine | [Phaser.js 3](https://phaser.io/) |
| Animations | [GSAP](https://greensock.com/gsap/) |
| Logic | Vanilla JavaScript (ES modules) |
| Build | [Vite](https://vitejs.dev/) |
| Styling | Tailwind CSS (HUD overlay) + `main.css` |
| Fonts | Inter, Sora (Google Fonts) |
| Audio | `public/noti.wav` (phone notification) |

---

## Getting started

```bash
git clone <your-repo-url>
cd echosphere
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

```bash
npm run build    # production build
npm run preview  # preview production build
```

---

## Project structure

```
EchoSphere/
├── public/
│   └── noti.wav              # Phone notification sound
├── docs/                     # Academic documentation (PEAS, traits, FSM, etc.)
├── index.html                # Game container + emotion HUD overlay
├── src/
│   ├── agent/
│   │   ├── Agent.js          # Steve — movement, drawing, AI variables, memory
│   │   ├── FSM.js            # Finite state machine
│   │   └── EmotionSystem.js  # Stress / happiness / loneliness
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── AttractionScene.js
│   │   ├── LearningScene.js
│   │   ├── RealWorldScene.js
│   │   └── EndScene.js
│   ├── styles/
│   │   └── main.css
│   └── main.js               # Phaser config + scene registration
├── package.json
└── vite.config.js
```

---

## Academic context

EchoSphere demonstrates intelligent agent design for academic assessment:

- **State-based behaviour** — FSM with multiple states and event-driven transitions  
- **Perception** — multimodal sensing with environmental modifiers  
- **Emotional intelligence** — internal emotions and inter-agent emotional response  
- **Natural language communication** — structured multi-agent dialogue  
- **Learning** — memory-based adaptation across scenarios  
- **Pathfinding** — autonomous NPC navigation and goal seeking  
- **Decision making** — behaviour-driven thresholds and non-linear outcomes  
- **Real-world modelling** — vision physics, distraction, posture, stochastic events  

> Transitions between scenarios are **behaviour-driven**, not time-based — the agent demonstrates sensing, reasoning, acting, and learning in a changing environment.

Further detail: see `docs/07_Intelligence_Traits.md` and related files in `docs/`.
