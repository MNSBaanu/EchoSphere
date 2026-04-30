# 12. References

---

## 12.1 Core Technologies

**Phaser.js 3**
Davey, R. *Phaser — A fast, fun and free open source HTML5 game framework.*
https://phaser.io/
Version 3.x — Used for scene management, graphics rendering (Canvas API), input handling, tweens, geometry masks, and game loop management across all four scenes (BootScene, AttractionScene, RealWorldScene, LearningScene, EndScene).

**GSAP (GreenSock Animation Platform)**
GreenSock. *GSAP — Professional-grade JavaScript animation for the modern web.*
https://greensock.com/gsap/
Used for UI transitions, mobile screen pop-in animations, card animations, NPC speech bubble fade effects, and learning key reveal sequences.

**Vite**
You, E. *Vite — Next Generation Frontend Tooling.*
https://vitejs.dev/
Used as the build tool and development server. Static assets (noti.wav) served from the public/ directory via Vite's static file handling.

**Node.js & npm**
OpenJS Foundation. *Node.js — JavaScript runtime built on Chrome's V8 engine.*
https://nodejs.org/
Used for dependency management and running the development environment.

---

## 12.2 AI & Agent Theory

**Russell, S. & Norvig, P.**
*Artificial Intelligence: A Modern Approach.* 4th Edition.
Pearson, 2020.
Referenced for: PEAS framework (Performance, Environment, Actuators, Sensors), rational agent design, FSM-based agent architectures, perception and action models, and environment classification (partially observable, stochastic, sequential, dynamic, continuous, multi-agent).

**Wooldridge, M.**
*An Introduction to MultiAgent Systems.* 2nd Edition.
Wiley, 2009.
Referenced for: agent autonomy, reactive vs deliberative agents, multi-agent interaction, and environment classification used in the PEAS documentation.

**Millington, I. & Funge, J.**
*Artificial Intelligence for Games.* 2nd Edition.
CRC Press, 2009.
Referenced for: Finite State Machine implementation, seek steering behavior (normalized direction vector × speed), wander behavior with bounded zones, and pathfinding concepts applied to NPC movement in RealWorldScene.

**Buckland, M.**
*Programming Game AI by Example.*
Wordware Publishing, 2004.
Referenced for: state machine design patterns, steering behaviors, and agent decision-making architectures implemented in FSM.js and RealWorldScene.js.

---

## 12.3 Digital Addiction Research

**Twenge, J. M., & Campbell, W. K.**
*Associations between screen time and lower psychological well-being among children and adolescents.*
Preventive Medicine Reports, 12, 271–283. 2018.
Referenced for: the documented relationship between screen time and stress, loneliness, and reduced happiness in teenagers — directly modeled in the EmotionSystem (stress, happiness, loneliness variables).

**Alter, A.**
*Irresistible: The Rise of Addictive Technology and the Business of Keeping Us Hooked.*
Penguin Press, 2017.
Referenced for: variable reward schedules in social media (slot machine model), infinite scroll mechanics, and the loss of agency in addictive behavior — directly modeled by the auto-scroll system that activates at 50% addiction.

**Anderson, E. L., Steen, E., & Stavropoulos, V.**
*Internet use and Problematic Internet Use: a systematic review of longitudinal research trends in adolescence and emergent adulthood.*
International Journal of Adolescence and Youth, 22(4), 430–454. 2017.
Referenced for: habit formation loop (attraction → looping → distortion) that maps directly to the FSM states ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT.

**Kuss, D. J., & Griffiths, M. D.**
*Online Social Networking and Addiction — A Review of the Psychological Literature.*
International Journal of Environmental Research and Public Health, 8(9), 3528–3552. 2011.
Referenced for: social reinforcement mechanisms in digital addiction and the role of notifications in triggering compulsive checking behavior — modeled by the notification system and FSM NOTIFICATION_SEEN event.

---

## 12.4 Emotional Intelligence in AI

**Picard, R. W.**
*Affective Computing.*
MIT Press, 1997.
Referenced for: the concept of machines tracking and responding to emotional states; theoretical basis for the EmotionSystem class (stress, happiness, loneliness) and its homeostasis drift model.

**Bates, J.**
*The Role of Emotion in Believable Agents.*
Communications of the ACM, 37(7), 122–125. 1994.
Referenced for: emotion-driven behavior in game agents; emotional state influencing decision-making and visual expression — implemented through FSM state-to-visual mapping (skin color, posture, expression).

**Ortony, A., Clore, G. L., & Collins, A.**
*The Cognitive Structure of Emotions.*
Cambridge University Press, 1988.
Referenced for: the theoretical model of how events trigger emotional responses — basis for the `applyEvent(delta)` method in EmotionSystem.js.

---

## 12.5 Learning & Memory in AI

**Sutton, R. S., & Barto, A. G.**
*Reinforcement Learning: An Introduction.* 2nd Edition.
MIT Press, 2018. Available at: http://incompleteideas.net/book/the-book-2nd.html
Referenced for: behavioral reinforcement concepts applied to the learning system — positive reinforcement through educational task completion, negative reinforcement through addiction consequences.

**Anderson, J. R.**
*Learning and Memory: An Integrated Approach.* 2nd Edition.
Wiley, 2000.
Referenced for: memory consolidation and pattern recognition concepts applied to the agent.memory[] array and the one-time learning constraint (patterns stored only once, advice not repeated).

---

## 12.6 Game Development & Simulation

**Shaker, N., Togelius, J., & Nelson, M. J.**
*Procedural Content Generation in Games.*
Springer, 2016. Available at: http://pcgbook.com/
Referenced for: random event generation, emergent narrative, and non-deterministic simulation design — applied to the `_triggerRandomEvent()` system in RealWorldScene.

**Yannakakis, G. N., & Togelius, J.**
*Artificial Intelligence and Games.*
Springer, 2018. Available at: http://gameaibook.org/
Referenced for: agent-based game AI, FSM design patterns, NPC behavior systems, and perception cone implementation.

---

## 12.7 Web Standards & APIs

**MDN Web Docs**
Mozilla Foundation. *Web APIs — HTML5 Canvas, Web Audio API, DOM.*
https://developer.mozilla.org/
Referenced for: Canvas 2D rendering context used by Phaser, Web Audio API for notification sound playback, and browser event handling.

**ECMAScript 2022 Specification**
ECMA International. *ECMAScript Language Specification.*
https://tc39.es/ecma262/
Referenced for: ES6 module syntax (`import`/`export`), arrow functions, destructuring, spread operator, and class-based OOP used throughout the codebase.

**W3C Web Audio API**
World Wide Web Consortium. *Web Audio API Specification.*
https://www.w3.org/TR/webaudio/
Referenced for: audio loading and playback implementation used in the notification sound system (`this.sound.play('noti', { volume: 0.8 })`).

---

## 12.8 Visual & Design References

**Google Fonts — Inter**
https://fonts.google.com/specimen/Inter
Typography used throughout all scenes for readability and modern aesthetic. Applied via `fontFamily: 'Inter, sans-serif'` in all text objects.

**Phaser 3 Documentation**
Davey, R. *Phaser 3 API Documentation.*
https://newdocs.phaser.io/docs/3.60.0
Referenced throughout development for scene lifecycle methods, graphics API, tween system, input handling, geometry masks, and audio management.

**GSAP Documentation**
GreenSock. *GSAP 3 Documentation.*
https://greensock.com/docs/
Referenced for animation API usage including `gsap.to()`, `gsap.fromTo()`, and timeline management used in UI transitions.

---

## 12.9 Project Source Files

| File | Description |
|------|-------------|
| `src/main.js` | Application entry point; Phaser game configuration; scene registry |
| `src/agent/Agent.js` | Primary agent class; movement, perception, phone use, eye movement, visual rendering |
| `src/agent/FSM.js` | Finite State Machine; state transitions, event handling, outcome resolution |
| `src/agent/EmotionSystem.js` | Emotion tracking; stress, happiness, loneliness; baseline drift model |
| `src/scenes/BootScene.js` | Title screen; game entry point |
| `src/scenes/AttractionScene.js` | Scenario 1; bedroom environment; phone addiction system; notification audio |
| `src/scenes/LearningScene.js` | Scenario 2; study room; educational task system; learning benefits |
| `src/scenes/RealWorldScene.js` | Scenario 3; outdoor park; NPC system; perception; conversation |
| `src/scenes/EndScene.js` | Journey completion screen |
| `public/noti.wav` | Notification sound asset; played 3× on phone notification |
