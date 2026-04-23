# 🌍 EchoSphere: The World You Shape — Scenario Breakdown

---

## 🔀 The Core Loop

```
Mobile ──(distraction)──→ Addiction ──→ Results (Bad Grades)
   ↑                           │
   │                    [Learning] remembers failure
   │                           ↓
Real World ──(balancing)──→ Studies ←──────────────────┘
                               │
                    (distraction can pull back)
                               │
                          Results (Good Grades)
```

Kai can cycle through addiction and recovery multiple times. Each cycle, the **Learning system** makes him more resilient — he resists faster and recovers quicker. The Real World acts as the anchor that keeps pulling him back toward balance.

---

## 🎬 Scene 0: Boot Screen

The entry point. Kai's story is introduced with the title "EchoSphere — The World You Shape." The player clicks to begin.

---

## 🎬 Scene 1: The Attraction *(Initial Fork — Mobile Path)*

Kai is in his bedroom. His phone lights up with a notification. This is the **first decision point** — two paths diverge:

- **Walk to the phone** → enters the mobile/addiction loop
- **Walk to the door** → goes outside to the Real World

If Kai picks up the phone, the social feed opens. His `addictionLevel` rises and `awareness` falls with every scroll. After a while, a **study reminder notification** interrupts the feed — a decision node fires:

- **Keep Scrolling** → addiction deepens, transitions toward the Addiction state
- **Go Study** → transitions to the Learning/Studies scene

**AI traits active:** Perception (sees and hears notification) · Decision Making

---

## 📱 Scene 2: Addiction *(Habit Formation)*

Kai stayed on the phone. His addiction level climbs, awareness drops, and his relationship with family degrades as messages get ignored. The agent's **Learning system** records behavioral patterns:

- `high_addiction` — addiction exceeded 80%
- `social_neglect` — two or more messages ignored
- `compulsive_scrolling` — scroll count exceeded threshold

Auto-scroll activates when addiction passes 50%, gradually removing Kai's control. Conflict messages from Mom, friends, and family interrupt the feed — Kai can Reply (relationship improves) or Ignore (relationship drops, addiction rises).

**AI traits active:** Emotional Intelligence · Learning · Decision Making

---

## 📋 Scene 3: Results *(Consequence of Addiction)*

Kai receives his exam results — they are bad. A consequence card displays the outcome of his choices. The **Learning system** activates: Kai remembers this failure and stores it in memory. This drives a forced return to the Studies path. The memory of bad grades makes Kai more likely to resist distraction in the next cycle.

**AI traits active:** Learning (memory of failure drives behavior change)

---

## 📚 Scene 4: Studies / Learning *(The Productive Path)*

Kai sits at his desk and works through study tasks across five subjects — Mathematics, Science, Literature, Coding, and Geography. Progress is made by completing each task (hold SPACE to fill the progress bar). XP is earned for each completed task.

However, the phone can still distract. Notifications fire randomly during study sessions. If Kai's addiction level is still elevated, there is a chance he gets pulled back toward the Addiction path — this is the **distraction loop** shown in the diagram. If he resists and completes all tasks, he moves toward Good Grades.

**AI traits active:** Learning · Emotional Intelligence · Decision Making · Perception (distraction detection)

---

## 🌿 Scene 5: Real World *(Balancing — EI + NL Communication)*

If Kai chose the door at the start, or is trying to balance both worlds, he ends up outside. Three NPCs are present — Mom, Alex (friend), and Sam (sibling) — each with their own dialogue, emotional states, and autonomous behavior.

Kai interacts with NPCs using a **vision cone** (90° field of view) and **hearing range** system. NPCs outside his perception range are not noticed. Real-world interaction restores awareness and reduces addiction. This scene feeds back into Studies — healthy relationships make Kai more resilient to phone addiction in the next cycle.

Random world events fire unpredictably: dusk narrows Kai's vision, rain sends NPCs to shelter, wind gusts trigger NPC comments, and NPCs may walk toward Kai if he ignores them too long.

**AI traits active:** Pathfinding · Emotional Intelligence · NL Communication · Perception (vision cone + hearing)

---

## 🏆 Scene 6: Results *(Good Grades — Outcome)*

Kai completed his studies without falling back into addiction, or successfully recovered from bad grades through the learning loop. The outcome card shows good results. The simulation reflects the cumulative effect of Kai's decisions across all cycles.

**AI traits active:** All six — Perception · Emotional Intelligence · NL Communication · Learning · Pathfinding · Decision Making

---

## 🔀 State Transition Summary

```
IDLE → ATTRACTED → [ADDICTED | STUDYING] → RESULTS → [BAD GRADES | GOOD GRADES]
                         ↑         |
                         └─────────┘  (distraction loop)
```

| Scene | Agent State | World Tone |
|---|---|---|
| 1 — The Attraction | `ATTRACTED` | Bright, colorful, rewarding |
| 2 — Addiction | `LOOPING` | Numbing, distorted time, loss of control |
| 3 — Results (Bad) | `DISTORTED` | Dark, consequence-heavy |
| 4 — Studies | `IDLE / FOCUSED` | Warm, productive, calm |
| 5 — Real World | `AWARE` | Natural, social, restorative |
| 6 — Results (Good) | `RECOVERED` | Bright, balanced, connected |

---

## 🧠 AI Intelligence Traits — Where Each Appears

| Trait | Scenes |
|---|---|
| **Perception** | 1, 4, 5 — detects notifications, NPCs, environmental cues |
| **Decision Making** | 1, 2, 4 — phone vs door, scroll vs study, resist vs engage |
| **Emotional Intelligence** | 2, 4, 5 — stress, happiness, loneliness affect behavior |
| **Learning** | 2, 3, 4 — stores patterns, failure memory drives recovery |
| **NL Communication** | 5 — NPC dialogue, emotional responses, advice system |
| **Pathfinding** | 1, 5 — agent navigates to phone/door, NPCs seek Kai |
