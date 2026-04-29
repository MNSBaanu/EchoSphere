# 10. Test Plans & Test Data

## 10.1 Test Plan Overview

| Test ID | Category | Feature Under Test | Expected Result | Pass/Fail |
|---------|----------|--------------------|-----------------|-----------|
| T01 | FSM | IDLE → ATTRACTED transition | Notification fires, FSM moves to ATTRACTED | ✅ Pass |
| T02 | FSM | ATTRACTED → LOOPING (engage count) | After 5 engagements, FSM moves to LOOPING | ✅ Pass |
| T03 | FSM | LOOPING → DISTORTED (stress threshold) | When stress ≥ 65, FSM moves to DISTORTED | ✅ Pass |
| T04 | FSM | DISTORTED → BREAKING_POINT | When stress ≥ 85, FSM moves to BREAKING_POINT | ✅ Pass |
| T05 | FSM | BREAKING_POINT → RECOVERED | resistCount ≥ engageCount AND happiness > 45 | ✅ Pass |
| T06 | FSM | BREAKING_POINT → LOST | ignoredFriends ≥ 3 OR loneliness > 70 | ✅ Pass |
| T07 | Emotion | Stress drift to baseline | Stress returns to 10 when no events fire | ✅ Pass |
| T08 | Emotion | Happiness drift to baseline | Happiness returns to 60 when no events fire | ✅ Pass |
| T09 | Learning | Memory stores high_addiction | When addiction > 80, 'high_addiction' in memory | ✅ Pass |
| T10 | Learning | Mom's advice stored once | 'mom_advice' added to memory, not repeated | ✅ Pass |
| T11 | Learning | NPC avoidance after 2 bad interactions | _avoidedNPC set, _npcSpeak returns early | ✅ Pass |
| T12 | Perception | Vision cone detection | NPC within 200px and ±45° is perceived | ✅ Pass |
| T13 | Perception | Hearing range detection | NPC within 150px (any direction) is perceived | ✅ Pass |
| T14 | Perception | Dusk reduces vision | Vision range × 0.55 during dusk event | ✅ Pass |
| T15 | Perception | Phone distraction reduces vision | Vision range × 0.6 when phone visible | ✅ Pass |
| T16 | Addiction | Progress bar at 70% | Decision popup appears, progress pauses | ✅ Pass |
| T17 | Addiction | Progress bar at 100% | Fail notification appears | ✅ Pass |
| T18 | Addiction | Auto-scroll at 50% | Auto-scroll enables when addiction > 50 | ✅ Pass |
| T19 | Navigation | Door → RealWorldScene | Walking to door transitions to RealWorldScene | ✅ Pass |
| T20 | Navigation | Accept learning → LearningScene | Clicking Accept in popup goes to LearningScene | ✅ Pass |
| T21 | Navigation | Learning complete → AttractionScene | Clicking card after tasks returns to Scenario 1 | ✅ Pass |
| T22 | Navigation | RealWorld end → EndScene | After walk sequence, EndScene loads | ✅ Pass |
| T23 | NPC | Wander behaviour | NPCs pick new target every ~4 seconds | ✅ Pass |
| T24 | NPC | Approach behaviour | NPC walks toward Steve when triggered | ✅ Pass |
| T25 | NPC | Emotional contagion | Happy NPC makes others happy | ✅ Pass |
| T26 | Conversation | T key advances messages | Each T press shows next message | ✅ Pass |
| T27 | Conversation | Previous bubble cleared | Old bubble destroyed before new one appears | ✅ Pass |
| T28 | Conversation | Walk triggered after last message | _agentWalkToRoad called after message 7 | ✅ Pass |
| T29 | Hunch | Posture changes with addiction | hunchLevel 0-4 maps to addiction 0-100 | ✅ Pass |
| T30 | State Reset | Scene restart resets all state | Returning from LearningScene resets all flags | ✅ Pass |

---

## 10.2 Detailed Test Cases

### T01 — FSM IDLE to ATTRACTED Transition

**Preconditions:** Scene loaded, agent in IDLE state  
**Test Steps:**
1. Load AttractionScene
2. Wait 300ms for notification to fire
3. Observe FSM state

**Expected:** FSM transitions from IDLE to ATTRACTED  
**Actual:** Console logs `[FSM] IDLE → ATTRACTED (first notification caught attention)`  
**Test Data:** `agent.fsm.state === 'ATTRACTED'` after notification  
**Result:** ✅ Pass

---

### T12 — Vision Cone Detection

**Preconditions:** RealWorldScene loaded, agent facing right  
**Test Steps:**
1. Position agent at (400, 400)
2. Place NPC at (550, 400) — within 200px, directly ahead (0°)
3. Check `npc._perceived`

**Expected:** NPC is perceived (canSee = true)  
**Test Data:**
```
dist = 150px < 200px (visionRange) ✓
angleDiff = 0° < 45° (halfCone) ✓
canSee = true ✓
```
**Result:** ✅ Pass

**Edge Case — NPC behind agent:**
```
NPC at (250, 400) — behind agent (180°)
angleDiff = 180° > 45° → canSee = false
dist = 150px < 150px (hearingRange) → canHear = true
npc._perceived = true (via hearing)
```
**Result:** ✅ Pass (heard but not seen)

---

### T16 — Progress Bar Pauses at 70%

**Preconditions:** Mobile screen open, addiction level approaching 70  
**Test Steps:**
1. Open phone screen
2. Scroll until addiction reaches 70%
3. Observe popup and progress bar

**Expected:** Decision popup appears, `_decisionPending = true`, progress bar stops filling  
**Test Data:**
```javascript
// Before: addictionLevel = 69.8, _decisionShown = false
// After one frame: addictionLevel = 69.95
// Trigger: addictionLevel >= 70
// Result: _decisionShown = true, _decisionPending = true
// Progress bar: frozen at 70%
```
**Result:** ✅ Pass

---

### T26 — Conversation T Key Advancement

**Preconditions:** RealWorldScene loaded, 3 seconds elapsed  
**Test Steps:**
1. Press T — first message appears (Mom, index 0)
2. Press T — second message appears (Sibling, index 1), first cleared
3. Press T 5 more times — all 7 messages cycle through
4. Press T on last message — walk sequence triggers

**Expected:** One message visible at a time, previous cleared before next shown  
**Test Data:**
```
Press 1: Mom bubble visible, hint "Press [T] for next (1/7)"
Press 2: Sibling bubble visible, Mom bubble destroyed, hint "(2/7)"
...
Press 7: Mom bubble visible, hint "(7/7)"
Press 8: All bubbles cleared, _agentWalkToRoad() called
```
**Result:** ✅ Pass

---

### T30 — State Reset on Scene Restart

**Preconditions:** AttractionScene completed, returning from LearningScene  
**Test Steps:**
1. Complete LearningScene
2. Click to return to AttractionScene
3. Verify all state flags are reset

**Expected:** All flags reset, notification fires again at 300ms  
**Test Data:**
```javascript
// Verified reset values:
_notificationFired = false  ✓
_decisionShown     = false  ✓
_failShown         = false  ✓
_mobileScreenOpen  = false  ✓
_phonePickedUp     = false  ✓
agent.addictionLevel = 0    ✓
// Notification fires at 300ms ✓
```
**Result:** ✅ Pass

---

## 10.3 Edge Cases Tested

| Edge Case | Test | Result |
|-----------|------|--------|
| Agent at exact 70% addiction boundary | Decision popup fires exactly once | ✅ Pass |
| T key pressed rapidly during conversation | Only one message advances per press | ✅ Pass |
| NPC at exact 90° from facing direction | Boundary case: not in cone, may be heard | ✅ Pass |
| Memory array with duplicate entries | `!memory.includes()` guard prevents duplicates | ✅ Pass |
| Mom's advice triggered twice | `_adviceGiven` flag prevents repetition | ✅ Pass |
| Phone notification fired twice | `_notificationFired` flag prevents repetition | ✅ Pass |
| NPC walk to off-screen position | `Phaser.Math.Clamp` keeps NPCs within bounds | ✅ Pass |
| Dusk + phone distraction stacked | Vision = 200 × 0.55 × 0.6 = 66px | ✅ Pass |

---

## 10.4 Known Limitations

| Limitation | Description | Impact |
|------------|-------------|--------|
| No persistent save | Game state resets on page refresh | Low — by design |
| NPC pathfinding | Simple seek steering, no obstacle avoidance | Low — open environment |
| Mobile screen | Not responsive on very small screens | Low — desktop-focused |
| FSM outcomes | RECOVERED/LOST/PARTIAL not visually distinct in all scenes | Medium — FSM state shown in console |
