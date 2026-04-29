# 1. Introduction

## EchoSphere: The World You Shape

**Team Members:** Baanu & Irfa

---

EchoSphere is a 2D browser-based intelligent agent simulation built using Phaser.js 3, JavaScript ES6+, and GSAP. It is designed within the field of Artificial Intelligence, focusing on agent behaviour, decision-making, and emotional intelligence. The simulation places the player in control of an autonomous agent named Steve — a teenage student — who must navigate a series of interconnected scenarios that model the real-world problem of digital addiction and its impact on academic performance and social relationships.

## Agent Behaviour and Goal

Steve is an intelligent software agent pursuing a goal — maintaining real-world relationships and academic performance — amidst various obstacles. The primary obstacle is digital addiction: a phone notification arrives almost immediately, and every decision the player makes has measurable consequences. Steve encounters three other agents (Mom, Alex, and Sam) who act as friends, offering support, advice, and social interaction. The environment is partially observable, stochastic, and dynamic: NPCs move autonomously, random events alter the world, and the agent's internal state evolves continuously based on accumulated behaviour.

## State-Based Behaviour

The simulation is driven by a **Finite State Machine with eight states**: IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT → RECOVERED / PARTIAL / LOST. Steve undergoes state transitions in response to events — picking up the phone, receiving notifications, interacting with NPCs, and accumulating stress. The simulation is **not linear**: it reaches alternative endings depending on the events and actions of all agents. Random happenings (dusk, rain, wind, spontaneous NPC approaches) make the outcome unpredictable.

## Intelligence Traits

EchoSphere demonstrates all six required AI intelligence traits:

1. **Perceptions** — Steve has a directional vision cone (200px, ±45°) and omnidirectional hearing range (150px). Environmental conditions (dusk, phone distraction) reduce what he can perceive, modelling real-world physics.

2. **Emotional Intelligence** — Steve's EmotionSystem tracks stress, happiness, and loneliness. These emotions drive FSM transitions. NPCs respond to Steve's emotional state and to each other — when one NPC is angry, others show concern and offer support.

3. **Natural Language Communication** — Agents communicate through speech bubbles (callout signs of text). NPCs have context-sensitive dialogue sets that change based on Steve's addiction level and phone use. A structured 7-line multi-agent greeting conversation plays out in the outdoor scenario.

4. **Learning** — Steve's `memory` array stores behavioural patterns that persist across scenes. He learns from Mom's advice (reducing addiction permanently), recognises compulsive patterns, and avoids NPCs after repeated bad interactions — not making the same mistake twice.

5. **Searching / Pathfinding** — NPCs use seek steering to pathfind toward Steve, wander randomly between targets, and seek shelter during rain events. The walk-to-road sequence is a coordinated multi-agent pathfinding sequence.

6. **Decision Making** — The FSM evaluates accumulated behaviour counters and emotional state to determine which of three endings Steve reaches. Player decision nodes at key moments (door vs phone, study vs scroll) and NPC autonomous decisions create a non-linear, unpredictable simulation.

## Real-World Physics

The simulation implements real-world physics including: trigonometric vision cone calculation, omnidirectional hearing range, environmental modifiers on perception (dusk reduces vision by 45%, phone distraction by 40%), posture compression modelling the physical effects of phone use, and seek steering with normalised direction vectors.

## Technical Foundation

The simulation is built entirely in JavaScript using Phaser.js 3 for rendering and game logic, GSAP for animations, and Vite as the build tool. All graphics are procedurally drawn using the Phaser Graphics API — no external image assets are required. The architecture separates concerns cleanly: `Agent.js` handles the player character and AI variables, `FSM.js` manages state transitions, `EmotionSystem.js` models emotional states, and six scene classes handle the distinct scenarios.

The result is a demonstrable AI simulation where every system — from the emotion drift model to the NPC seek-steering algorithm — reflects a deliberate and technically grounded application of artificial intelligence principles to a problem that is both socially relevant and academically meaningful.
