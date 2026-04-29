# 2. Problem Description

## Problem Statement
Digital addiction among teenagers is a growing global concern. Social media platforms are engineered to maximise engagement through psychological mechanisms — variable reward schedules, social validation, and fear of missing out (FOMO). These systems exploit the same neural pathways as addictive substances, making it difficult for users to disengage voluntarily.

The core problem this simulation addresses is:

> **How can an AI agent model the psychological journey of digital addiction — from initial attraction through habit formation to potential recovery — in a way that is both technically rigorous and educationally meaningful?**

## Real-World Context
Research indicates that:
- The average teenager spends 7+ hours per day on screens
- Social media platforms use algorithmic feeds designed to maximise scroll time
- Dopamine-driven feedback loops (likes, comments, notifications) create compulsive checking behaviour
- Real-world relationships and academic performance suffer as a consequence

## Simulation Scope
EchoSphere models this problem through three interconnected scenarios:

### Scenario 1 — The Attraction (AttractionScene)
Kai is in his bedroom. A phone notification arrives. The player must decide whether to pick up the phone or walk to the door (real world). If the phone is picked up, a social media feed opens. As Kai scrolls, his addiction level rises, his awareness drops, and the FSM progresses through increasingly compulsive states. At 70% addiction, a learning notification appears offering a choice to study. At 100%, Kai fails his exam.

### Scenario 2 — The Real World (RealWorldScene)
Kai steps outside and encounters three NPCs: his mother, his friend Alex, and his sibling Sam. Each NPC has emotional states, dialogue, and autonomous behaviour. Kai must engage with them using the T key. A notification bell in the corner tempts Kai back to his phone. Random environmental events (dusk, rain, wind) affect perception. The scenario ends when the group decides to go on a trip together.

### Scenario 3 — The Learning Path (LearningScene)
If Kai chooses to study (either from the 70% decision or after failing), he enters a study room. Two academic tasks must be completed by pressing SPACE to fill progress bars. Completing tasks earns XP and reinforces positive behaviour. After completion, Kai returns to Scenario 1 with the knowledge gained.

## Design Goals
| Goal | Implementation |
|------|---------------|
| Model addiction progression | FSM with 8 states driven by emotion thresholds |
| Show real-world consequences | NPC relationship tracking, awareness degradation |
| Provide meaningful choices | Decision nodes at 70% addiction, door vs phone |
| Demonstrate AI learning | Memory array storing behavioural patterns |
| Simulate perception | Vision cone (200px, ±45°) and hearing range (150px) |
| Reflect real-world physics | Environmental modifiers on perception (dusk, phone distraction) |

## Constraints and Assumptions
- The simulation runs in a web browser using Phaser.js
- All graphics are procedurally drawn using Phaser Graphics API (no external image assets)
- The agent (Kai) is player-controlled for movement but AI-driven for emotional and behavioural responses
- NPC behaviour is autonomous (wandering, approaching, emotional reactions)
- The simulation is designed for educational demonstration, not clinical accuracy
