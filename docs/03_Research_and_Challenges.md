# 3. Research & Challenges

## Research Areas

### 3.1 Finite State Machines in Game AI
FSMs are a foundational AI technique in game development. Research into FSM design patterns informed the architecture of EchoSphere's agent behaviour system. Key references include:

- **Millington & Funge (2009)** — *Artificial Intelligence for Games* — provided the theoretical basis for state-based agent design
- **Buckland (2004)** — *Programming Game AI by Example* — informed the event-driven FSM implementation
- The EchoSphere FSM uses **event-driven transitions** rather than purely timer-based ones, making behaviour more responsive and realistic

### 3.2 Emotional AI Systems
The EmotionSystem was inspired by research into affective computing:

- **Ortony, Clore & Collins (1988)** — OCC model of emotions — provided a framework for modelling stress, happiness, and loneliness as quantifiable variables
- **Picard (1997)** — *Affective Computing* — informed the concept of emotion-driven behaviour modification
- The drift-back-to-baseline mechanism models emotional homeostasis — the natural tendency of emotions to return to a resting state

### 3.3 Digital Addiction Psychology
Understanding the mechanics of digital addiction was essential for authentic simulation:

- **Twenge (2017)** — Research on smartphone use and teenage mental health
- **Alter (2017)** — *Irresistible: The Rise of Addictive Technology* — described the variable reward schedule used by social platforms
- **Dopamine feedback loops** — The addiction level mechanic models how each scroll/notification provides a small dopamine hit, reinforcing the behaviour

### 3.4 Perception Systems in AI
The vision cone and hearing range systems were informed by:

- **Reynolds (1987)** — Boids algorithm — autonomous agent perception
- **Phaser.js documentation** — Implementation of geometric perception using `Phaser.Math.Angle.Wrap` and `Phaser.Math.DegToRad`

---

## Challenges Faced

### Challenge 1: FSM State Persistence Across Scenes
**Problem:** Phaser.js only calls the constructor once per scene class. When returning to `AttractionScene` from `LearningScene`, all state flags from the previous run persisted, causing the notification to not fire again and the phone to remain in a picked-up state.

**Solution:** A comprehensive state reset block was added at the top of `create()`, explicitly resetting all 25+ state variables including `_notificationFired`, `_decisionShown`, `_failShown`, and all agent references.

```javascript
create() {
  // Reset all state on every scene start
  this._notificationFired = false;
  this._decisionShown     = false;
  this._failShown         = false;
  this.agent              = null;
  // ... 20+ more resets
}
```

### Challenge 2: NPC Graphics Not Moving During Walk Animation
**Problem:** NPC characters were drawn using Phaser Graphics with coordinates captured in a closure at spawn time. When `npc.x` and `npc.y` were tweened, the graphics still drew at the original position.

**Solution:** Replaced the closed-over `const x, y` with a mutable `pos = { x, y }` object. JavaScript getters/setters on the `npc` object ensure that `npc.x = value` updates `pos.x`, which `drawNPC()` reads at draw time.

```javascript
const pos = { x: width * data.x, y: height * data.y };
const npc = {
  get x() { return pos.x; },
  set x(v) { pos.x = v; },
  get y() { return pos.y; },
  set y(v) { pos.y = v; },
  drawNPC  // reads pos.x/pos.y at draw time
};
```

### Challenge 3: Multiple T Key Listeners Causing Stacked Bubbles
**Problem:** Both the greeting conversation system and the NPC proximity system registered `keydown-T` listeners. When T was pressed, both fired simultaneously, causing multiple speech bubbles to appear at once.

**Solution:** Introduced a `_convActive` flag that blocks `_npcSpeak()` and `_showInteractPrompt()` during the greeting conversation. The conversation handler stores a reference (`_convTHandler`) and clears it when the conversation ends.

### Challenge 4: Progress Bar Continuing During Decision Popup
**Problem:** When the 70% addiction decision popup appeared, `agent.usePhone()` continued running every frame, causing the progress bar to keep filling while the user was reading the popup.

**Solution:** Added a `_decisionPending` flag that gates the entire phone usage block in `update()`.

```javascript
if (this._mobileScreenOpen && !this._ended && this.agent && !this._decisionPending) {
  this.agent.usePhone();
  this._updateProgressBar();
  // ...
}
```

### Challenge 5: Learning Key Not Appearing After Fail Notification
**Problem:** `_showLearningKey()` had a guard `if (!this._mobileScreen || !this._mobileScreenOpen) return`. The fail notification's OK button destroyed the popup but did not close the mobile screen, yet by the time `_showLearningKey` was called, the screen state was inconsistent.

**Solution:** Removed the guard entirely and redesigned `_showLearningKey()` as a full-screen overlay independent of the mobile screen state.

### Challenge 6: Syntax Errors from Extra Closing Braces
**Problem:** During iterative development, an extra `}` was accidentally inserted inside `_updateHUD()`, closing the class prematurely. This caused 13 TypeScript diagnostic errors across all subsequent method definitions.

**Solution:** Identified the orphaned brace using line number diagnostics and removed it with a targeted string replacement.

### Challenge 7: Yellow Flash on Scene Transition
**Problem:** The `cameras.main.flash(200, 255, 220, 150)` call before transitioning to RealWorldScene caused a jarring yellow flash effect.

**Solution:** Removed all coloured flash and fade effects, replacing them with direct `scene.start()` calls for instant transitions.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Procedural graphics (no image assets) | Ensures the application runs without external dependencies |
| Player-controlled movement with AI-driven emotions | Balances interactivity with authentic AI demonstration |
| Three separate scenes | Clearly delineates the three AI scenarios for assessment |
| Addiction level as primary driver | Single quantifiable metric that drives multiple AI behaviours |
| Memory array for learning | Simple but demonstrable learning system that persists across scenes |
