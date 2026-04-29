# 1. Introduction

## EchoSphere: The World You Shape

**Team Members:** Baanu & Irfa

---

EchoSphere is a 2D browser-based intelligent agent simulation built using Phaser.js 3 and JavaScript. The simulation is set around a teenage student named Steve, who is controlled by the player using keyboard inputs. The story explores a problem that is very common today — digital addiction and how it affects a teenager's relationships, studies, and mental health.

The simulation takes place across three connected scenes. It starts in Steve's bedroom, where a phone notification arrives almost immediately. The player must decide whether to pick up the phone or walk outside. If Steve picks up the phone, a social media feed opens and his addiction level begins to rise. At 70% addiction, a study reminder appears giving Steve a chance to stop. At 100%, he fails his exam. If the player chooses to go outside instead, Steve enters the real world where he meets his mother, his friend Alex, and his sibling Sam. These characters move on their own, react to Steve's phone use, and hold conversations with him. Random events like dusk, rain, and wind also occur, making each run different. A third scene — the study room — gives Steve the chance to complete academic tasks, earn XP, and recover from addiction before returning to the start.

The core of the simulation is a Finite State Machine with eight states that tracks Steve's psychological journey from IDLE through ATTRACTED, LOOPING, DISTORTED, and BREAKING_POINT, ending in one of three outcomes — RECOVERED, PARTIAL, or LOST — depending on the choices made throughout. The simulation is not linear, meaning different decisions lead to different endings.

To demonstrate intelligent agent behaviour, EchoSphere includes six AI traits. Steve has a vision cone and hearing range that model real-world perception, and environmental conditions like dusk or phone distraction reduce what he can see. When the notification sound plays, Steve's eyes automatically shift toward the phone and then return to normal, showing he has heard it. His emotions — stress, happiness, and loneliness — change based on events and directly drive his state transitions. The NPCs communicate through speech bubbles and change what they say depending on Steve's behaviour. Steve also learns from experience: Mom's advice permanently reduces his addiction and is never repeated, and after repeated bad interactions with an NPC, Steve learns to avoid them. The NPCs use pathfinding to walk toward Steve or seek shelter during rain. Finally, the FSM makes decisions based on accumulated behaviour to determine which ending Steve reaches.

EchoSphere was built entirely in JavaScript using Phaser.js 3 for the game engine, GSAP for animations, and Vite as the build tool. All characters and environments are drawn using the Phaser Graphics API with no external image files.
