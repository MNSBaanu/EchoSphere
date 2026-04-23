# 03 — Flow with Screenshots: How the Artifact Works

---

## 3.1 Overall Application Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION START                             │
│                     npm run dev → localhost:5173                     │
└──────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          BOOT SCENE                                  │
│  • Title: "EchoSphere — The World You Shape"                        │
│  • Animated ambient orbs (purple/indigo gradient)                   │
│  • Pulsing "▶ Click anywhere to begin" prompt                       │
│  • [?] Help button → info panel (tech stack + how it works)         │
│  • Credits: "Implemented by Baanu & Irfa"                           │
└──────────────────────────────┬──────────────────────────────────────┘
                                │  click anywhere
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ATTRACTION SCENE                               │
│  • Bedroom environment (warm tones, desk, bed, window, bookshelf)   │
│  • Kai spawns centre-left, WASD/arrow key movement                  │
│  • Phone on desk glows after 2 seconds                              │
│  • Door on left wall with "Go Outside" label                        │
│  • Top bar: "SCENARIO 1 — THE ATTRACTION"                           │
└──────────────┬──────────────────────────────┬───────────────────────┘
               │                              │
        Walk to Phone                   Walk to Door
               │                              │
               ▼                              ▼
┌──────────────────────────┐    ┌─────────────────────────────────────┐
│   MOBILE SCREEN OPENS    │    │          REAL WORLD SCENE            │
│  • Full-screen phone UI  │    │  • Outdoor park environment          │
│  • Scrollable feed       │    │  • 3 NPCs: Mom, Alex, Sam            │
│  • Addiction bar (green  │    │  • Vision cone (90°, yellow)         │
│    → yellow → red)       │    │  • Hearing ring (blue dashed)        │
│  • Emotion bars:         │    │  • [T] to talk when near NPC         │
│    👁 Awareness           │    │  • HUD: Awareness, Addiction,        │
│    😰 Stress              │    │    Relationship bars                 │
│    💬 Relationship        │    │  • Random events: dusk, rain, wind  │
│  • Mouse wheel scrolling │    └──────────────┬──────────────────────┘
└──────────────┬───────────┘                   │
               │                               │ feeds back to
               │ Decision Node fires           ▼
               │ (study reminder)    ┌─────────────────────────┐
               │                     │      LEARNING SCENE      │
               ▼                     │  • Study room environment│
    ┌──────────────────────┐         │  • 5 task cards          │
    │  DECISION NODE UI    │         │  • SPACE to fill bar     │
    │  "Keep Scrolling" or │         │  • XP system             │
    │  "Go Study"          │         │  • Distraction possible  │
    └──────┬───────────────┘         └──────────────────────────┘
           │              │
    Keep Scrolling    Go Study
           │              │
           ▼              └──────────────────────────────────────┐
    Addiction ↑↑                                                  │
    Auto-scroll                                                   │
    activates                                                     │
           │                                                      │
           ▼                                                      │
    Bad Grades card                                               │
    [Learning fires]                                              │
           │                                                      │
           └──────────────────────────────────────────────────────┘
                                    ▼
                             Good Grades card
```

---

## 3.2 Scene-by-Scene Walkthrough

### Scene 0 — Boot Screen

**What the player sees:**
- Dark indigo gradient background
- Three floating ambient orbs (purple, violet, blue) with breathing animation
- "EchoSphere" title in white with indigo stroke and glow shadow
- Subtitle: "The World You Shape" in lavender
- Pulsing "▶ Click anywhere to begin" button
- `?` help button (top right) — opens info panel
- Credits at bottom

**What happens technically:**
- `BootScene.create()` draws all elements with Phaser Graphics
- Ambient orbs use `this.tweens.add` with `yoyo: true, repeat: -1`
- `this.input.once('pointerdown')` listens for click → `cameras.main.fadeOut(400)` → `scene.start('AttractionScene')`

---

### Scene 1 — The Attraction (Bedroom)

**What the player sees:**
- Warm bedroom: cream walls, wood floor, bed (right), desk (centre), bookshelf, window with sunlight rays, poster, rug
- Kai character (teen boy, blue shirt) with name tag and state badge
- Phone on desk — dark, inactive
- Door on left wall — brown wood with gold knob, "Go Outside" label
- Top bar: EchoSphere logo | "SCENARIO 1 — THE ATTRACTION" | "Real World · [N] skip"
- Emotion meters (top left HUD): Stress, Happiness, Loneliness
- State badge (top right): "STATE: IDLE"

**After 2 seconds:**
- Phone screen lights up (purple glow)
- Notification bubble appears above phone: "🔔 New notification!"
- Phone glow ring pulses outward
- Decision node appears: "Kai notices the phone glowing..." with two buttons

**If player walks Kai to phone (proximity < 60px):**
- Pickup prompt appears: "📱 Pick Up Phone — Press [E]"
- Press E or click phone → mobile screen opens

**Mobile screen contents:**
- Phone frame with status bar (9:41, signal, battery)
- EchoSphere app header (purple)
- Addiction progress bar (green → yellow → red as addiction rises)
- Three emotion bars: 👁 Awareness (blue), 😰 Stress (red), 💬 Relationship (green)
- Scrollable feed with notification cards (likes, comments, trending posts)
- Mouse wheel scrolls the feed
- Close button (red) at bottom

**AI behavior visible to player:**
- Addiction bar fills as Kai uses phone
- At 50% addiction: "🤖 AI: Agent losing control - auto-scroll enabled" appears in event log
- Feed begins scrolling automatically
- At 70% addiction: conflict message popup fires (Reply / Ignore choice)
- At 85%+ with 2+ ignored messages: transition triggers

---

### Scene 2 — Learning (Study Room)

**What the player sees:**
- Warm study room: cream walls, wood floor, large window with sunlight, bookshelf, motivational poster, clock, certificates, plants
- Kai at desk with laptop, notebook, pencil
- XP bar at top (green, "⭐ XP: 0 / 130 XP")
- Task card appears in centre: subject name, task description, progress bar, XP reward
- "Click [SPACE] to finish task" hint

**Interaction:**
- Hold SPACE → progress bar fills
- On completion: particle burst (⭐✨📚💡🎉), XP updates, next task card slides in
- 5 tasks total: Mathematics, Science, Literature, Coding, Geography
- [C] key: Kai sits/stands at chair
- [N] key: skip to end

**Distraction mechanic:**
- If addiction level is elevated when entering this scene, notifications can fire
- Notification pulls Kai back toward the Addiction path

---

### Scene 3 — Real World (Outdoor Park)

**What the player sees:**
- Sunny park: sky gradient, sun with glow, clouds, grass, path, trees, bench, flowers
- Three NPCs with name tags and emotion emoji badges:
  - Mom (pink) — happy expression
  - Alex (blue) — neutral expression
  - Sam (green) — neutral expression
- Yellow vision cone extending from Kai in facing direction
- Blue dashed hearing ring around Kai
- HUD (top right): Awareness, Addiction, Relationship bars
- Top bar: "REAL WORLD — OUTSIDE" in green

**Interaction:**
- Move Kai near an NPC (within 90px AND within vision/hearing range)
- "Press [T] to talk" prompt appears
- Press T → speech bubble with NPC dialogue
- NPCs react emotionally if Kai has phone out (angry/sad expressions)
- Mom gives advice once if addiction > 60%

**Random events (every 8 seconds):**
- 🌅 Dusk: orange overlay, vision range narrows
- 💨 Wind: horizontal streaks, NPC comments
- 🌧 Rain: rain drops, NPCs move to bench
- NPC approaches Kai autonomously if ignored
- Kai hears NPC calling (awareness increases)

---

## 3.3 Key UI Components

| Component | Location | Purpose |
|---|---|---|
| Emotion meters | Top left (all scenes) | Shows stress, happiness, loneliness in real time |
| State badge | Top right | Shows current FSM state |
| Addiction bar | Mobile screen | Shows addiction level with color coding |
| Awareness bar | Mobile screen + HUD | Shows how present/aware Kai is |
| Event log | Bottom left | Shows AI decisions and state changes |
| Decision panel | Centre overlay | Player choice nodes |
| Dialogue box | Bottom centre | NPC speech |
| Notification popup | Bottom right | Social media notifications |

---

## 3.4 How the Artifact Demonstrates AI

| AI Behavior | Where Visible |
|---|---|
| Agent loses control (auto-scroll) | Mobile screen at 50% addiction |
| Hunch posture changes | Kai's body tilts forward as addiction rises |
| Learning patterns logged | Browser console: "🧠 Agent learned: social_neglect" |
| NPC emotional reactions | NPCs switch to angry/sad when phone is out |
| Vision cone perception | Yellow cone visible in Real World scene |
| Behavior-based transition | Multiple conditions must be met — not just a timer |
| Memory persistence | Mom's advice not repeated; avoided NPCs remembered |
