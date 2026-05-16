# EchoSphere

Intelligent agent simulation artefact implementing perception, reasoning, action, and learning in a dynamic multi-agent environment.

**Authors:** Baanu & Irfa

---

## Overview

EchoSphere models an autonomous agent (**Steve**) that operates through a sense–think–act–learn cycle. Behaviour is driven by internal state, a finite state machine, and persistent memory—not by fixed scripting.

---

## Features

- Multimodal **perception** (vision cone, hearing, proximity and audio stimuli)
- **Decision making** from addiction level, awareness, and emotional variables
- **Emotional intelligence** (stress, happiness, loneliness) with inter-agent response
- **Natural language communication** between agents
- **Learning and memory** with cross-scenario persistence
- **Pathfinding** and autonomous NPC navigation
- **State-based behaviour** via an event-driven FSM

---

## Requirements

- [Node.js](https://nodejs.org/) 18+
- npm 9+

---

## Installation

```bash
git clone <repository-url>
cd echosphere
npm install
```

---

## Usage

**Development**

```bash
npm run dev
```

Open `http://localhost:5173` in a web browser.

**Production build**

```bash
npm run build
npm run preview
```

---

## Project Structure

```
EchoSphere/
├── public/               # Static assets
├── src/
│   ├── agent/            # Agent core (Agent, FSM, EmotionSystem)
│   ├── scenes/           # Environment modules
│   ├── styles/
│   └── main.js           # Application entry point
├── dist/                 # Production build output (after npm run build)
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | [Phaser.js 3](https://phaser.io/) |
| Agent logic | JavaScript (ES modules) |
| Animation | [GSAP](https://greensock.com/gsap/) |
| Build | [Vite](https://vitejs.dev/) |
| UI overlay | Tailwind CSS |

---

## Licence

Academic project — Top-up programme. All rights reserved by the authors unless otherwise stated.
