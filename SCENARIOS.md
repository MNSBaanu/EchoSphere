# 🌍 EchoSphere: The World You Shape — Scenario Breakdown

---

## 🔀 The Core Loop

```
Boot Screen
     │
     ▼
Scenario 1: The Attraction (Bedroom)
     │
     ├──── 📱 Pick up Phone ────────────────────────────────────────────┐
     │          │                                                        │
     │     Social Feed opens                                             │
     │     addictionLevel rises, awareness falls                        │
     │     Auto-scroll activates at addiction > 50%                     │
     │     Conflict messages fire at addiction > 70%                    │
     │          │                                                        │
     │     Behavior-based transition:                                    │
     │     addiction ≥ 100 OR (>85 + ignored ≥ 2)                       │
     │     OR (awareness < 20 + addiction > 80)                         │
     │          │                                                        │
     │          ▼                                                        │
     │     Scenario 2: Distortion (DistortionScene)                     │
     │                                                                   │
     └──── 🚪 Open Door [F] ──────────────────────────────────────────▶ │
                │                                                        │
           Scenario 2: Real World (RealWorldScene)                      │
           NPC interactions, vision cone, hearing range                 │
           5 alternative endings based on behavior                      │
                │                                                        │
                ▼                                                        │
           Scenario 3: Distortion (DistortionScene) ◀───────────────────┘
```

---

## 🎬 Scene 0: Boot Screen (`BootScene`)

The entry point. Animated loading screen showing the EchoSphere title with floating ambient orbs and a grid background. A **?** button in the top-right opens an info panel showing technologies used and how the system works.

- Click anywhere, press **SPACE**, or press **ENTER** to begin
- Credits: *Implemented by Baanu & Irfa*

---

## 🎬 Scenario 1: The Attraction (`AttractionScene`)

Kai is in his **bedroom**. The room contains a door on the left (leading outside) and a phone on the desk to the right. After 2 seconds, the phone lights up with a notification.

### What Happens
1. Phone glows and a **"New notification!"** bubble appears above it
2. FSM transitions: `IDLE → ATTRACTED`
3. A decision node fires: **Check Phone** or **Go Outside**

### Phone Path
- Walk near the phone → **[E] Pick Up Phone** prompt appears
- Click the phone directly OR press **[E]** to open the mobile screen
- Social feed opens with 12+ scrollable notifications
- **Addiction progress bar** fills (green → yellow → red)
- **3 emotion bars** visible: 👁️ Awareness · 😰 Stress · 💬 Relationship
- Mouse wheel scrolls the feed manually
- At **addiction > 50%**: auto-scroll activates — agent loses control
- At **addiction > 70%**: conflict messages interrupt (Reply / Ignore choice)
- **Reply**: relationship +10, awareness +5
- **Ignore**: ignoredMessages++, relationship -5, addiction +2

### Door Path
- Walk near the door → **[F] Open Door** prompt appears
- If phone is in hand: a pull-back bubble shakes and tempts Kai back
- Press **[F]** → warm sunlight flash → transitions to **RealWorldScene**

### Behavior-Based Transition (not time-based)
```
addictionLevel >= 100
OR (addictionLevel > 85 AND ignoredMessages >= 2)
OR (awareness < 20 AND addictionLevel > 80)
→ transitions to DistortionScene
```

### Bottom HUD (in-canvas)
- **Stress** (red bar) · **Happy** (green bar) · **Lonely** (amber bar)
- **STATE: [FSM state]** badge on the right

**AI Traits Active:** Perception · Decision Making · Emotional Intelligence · Learning

---

## 📱 Scenario 1 — Mobile Screen (Phone UI)

A full-screen phone popup with:

| Element | Description |
|---|---|
| Status bar | Time (9:41) and signal/battery icons |
| App header | 🌐 EchoSphere branding |
| Addiction bar | Fills from 0–100%, color-coded green/yellow/red |
| Emotion bars | 👁️ Awareness (blue) · 😰 Stress (red) · 💬 Relationship (green) |
| Scrollable feed | 12+ notification cards with icons, text, timestamps |
| Auto-scroll | Activates at addiction > 50%, speed scales with addiction |
| Close button | ✕ Close Phone (or press ESC) |

### Conflict Message Popup (at addiction > 70%)
Random message from Mom / Best Friend / Dad / Mia interrupts the feed:
- **✓ Reply** → relationship improves, awareness +5
- **✕ Ignore** → ignoredMessages++, addiction +2, loneliness +3

---

## 🌿 Scenario 2: Real World (`RealWorldScene`)

Kai steps outside into a **sunny park**. Agent state, addiction level, awareness, relationship level, and memory are all carried over from Scenario 1.

### Environment
- Warm outdoor park with trees, bench, flowers, and a path
- **Time of day** can shift to dusk (vision range halved)
- **Weather events** fire randomly: wind gusts, rain

### Three NPCs — Full Character Rendering

| NPC | Role | Shirt Color |
|---|---|---|
| **Mom** | Caring, gives advice once | Pink |
| **Alex** | Friend, casual | Blue |
| **Sam** | Sibling, seeks attention | Green |

Each NPC is drawn with the same full character style as Kai (spiky hair, eyes, mouth, arms, legs, shoes).

### Perception System (Real-World Physics)
- **Vision cone**: 90° FOV, 200px range drawn as a golden wedge each frame
  - Shrinks to 110px at **dusk**
  - Shrinks to 66px when **phone is out** (distracted)
- **Hearing ring**: 150px radius, independent of facing direction
- NPCs only show **[T] to talk** prompt when perceived (in cone OR hearing range)

### Natural Language Communication
- Walk near NPC → **[T] Talk** prompt appears
- Press **[T]** → speech bubble with emotion-colored border pops up
  - 🟢 Green border = happy · 🔴 Red = angry · 🔵 Blue = sad
- NPCs **wander autonomously** around their home position (new target every 4s)
- NPCs **pathfind toward Kai** when ignored too long

### Emotional Intelligence
- If phone is visible AND addiction > 50%: NPC reacts with **angry/sad lines**
- If addiction > 75%: NPC is **angry**
- Angry NPC triggers **chain reaction** — other NPCs respond with "Are you okay? 😟"
- NPC faces **redraw live** with matching eyebrows, iris color, and mouth

### Learning System
- `learnedNPCs` Set — Kai remembers who he's spoken to (different dialogue on return)
- `avoidedNPC` — after 2 bad interactions, Kai refuses to talk to that NPC again
- `mom_advice` — Mom gives advice once when addiction > 60 (addiction -20, awareness +15)
- Memory stored in `agent.memory[]` and shown on outcome card

### Phone Pull-Back (every 4 seconds)
- Notification floats above Kai: *"📱 3 new notifications!"*
- Addiction +2 per event
- If addiction > 60: a random NPC spontaneously says *"You're on your phone again... 😔"*

### Random World Events (every 8 seconds, unpredictable)
| Event | Effect |
|---|---|
| 🌅 Dusk | Orange overlay, vision range halved for 12s |
| 💨 Wind gust | White streaks, NPC comments |
| 🌧 Rain | Blue overlay, all NPCs pathfind to bench shelter |
| 🚶 NPC approach | Random NPC seeks Kai via steering behavior |
| 👂 Hearing event | NPC calls out if within hearing range, awareness +8 |

### HUD (top-right)
- 👁️ Awareness · 📱 Addiction · 💬 Relationship — live bars

### 5 Alternative Endings (behavior-driven, not time-based)

| Condition | Ending |
|---|---|
| Learned advice + low addiction + high relations | 🌿 Full Recovery |
| 3+ conversations + high relations | 💚 Real Connection Made |
| 3+ ignored interactions | 📱 Still Distracted |
| Avoided NPC after repeated conflict | 😔 Bridges Burned |
| Mixed behavior | 🤔 Uncertain Path |

**AI Traits Active:** Perception (vision cone + hearing) · Emotional Intelligence · NL Communication · Learning · Pathfinding · Decision Making

---

## � Scenario 3: Distortion (`DistortionScene`)

The world splits. A jagged animated line divides the screen between the **warm real world** (left) and the **cold digital world** (right). The split position oscillates with spring physics and random glitch jumps.

- Agent is in `DISTORTED` state with phone in hand
- Split line has chromatic aberration (red/cyan offset)
- Real-world furniture visible on the left side
- Digital grid perspective on the right side
- Transitions to a "Breaking Point" card after the scene ends

**AI Traits Active:** Emotional Intelligence · State-based behavior

---

## 🔀 FSM State Transition Summary

```
IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT → RECOVERED | PARTIAL | LOST
```

| State | Trigger | Visual |
|---|---|---|
| `IDLE` | Scene start | Upright, neutral expression |
| `ATTRACTED` | Notification seen | Slight smile, blush, purple glow |
| `LOOPING` | 5+ engagements or no resistance | Orange eyes, hunched |
| `DISTORTED` | Stress ≥ 65 | Red eyes, heavy hunch, glitch offset |
| `BREAKING_POINT` | Stress ≥ 85 | Dark palette, frown |
| `RECOVERED` | Resisted more than engaged | Green shirt, smile, green glow |
| `PARTIAL` | Mixed behavior | Amber palette |
| `LOST` | Too isolated | Grey palette, tiny iris |

---

## 🧠 AI Intelligence Traits — Full Map

| Trait | Where Implemented | Detail |
|---|---|---|
| **Perception** | Scenario 1, 2 | Phone notification detection; vision cone (90°, 200px); hearing range (150px); range shrinks at dusk and with phone out |
| **Decision Making** | Scenario 1, 2 | Phone vs door; reply vs ignore; behavior-based transitions (3 conditions); 5 alternative endings |
| **Emotional Intelligence** | Scenario 1, 2, 3 | Stress/happiness/loneliness affect behavior; NPC faces redraw per emotion; chain reactions; Mom advice |
| **Learning** | Scenario 1, 2 | `agent.memory[]` stores patterns; avoids NPCs after conflict; Mom advice given once; returning visit dialogue |
| **NL Communication** | Scenario 2 | Speech bubbles with emotion-colored borders and tails; NPCs call out when in hearing range; context-aware dialogue |
| **Pathfinding** | Scenario 1, 2 | Agent walks to phone/door; NPCs wander autonomously; NPCs seek Kai via steering; rain sends NPCs to bench |

---

## 📊 Agent Variables

| Variable | Range | Effect |
|---|---|---|
| `addictionLevel` | 0–100 | Drives hunch, auto-scroll, transitions |
| `awareness` | 0–100 | Shrinks vision cone when low |
| `relationshipLevel` | 0–100 | Affects NPC dialogue and endings |
| `emotions.stress` | 0–100 | Drives FSM transitions, HUD bar |
| `emotions.happiness` | 0–100 | Affects expression, HUD bar |
| `emotions.loneliness` | 0–100 | Increases when messages ignored |
| `hunchLevel` | 0–4 | Visual posture based on addiction |
| `memory[]` | Array | Stores learned behavioral patterns |
| `ignoredMessages` | Counter | Triggers social neglect learning |
| `scrollCount` | Counter | Triggers compulsive scrolling learning |
