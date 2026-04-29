# 10. Test Plans & Test Data

---

## 10.1 Test Overview

| Item | Detail |
|---|---|
| **System Under Test** | EchoSphere v1.0 — Intelligent Agent Simulation |
| **Test Type** | Functional, Behavioral, AI Logic, UI/UX, Integration |
| **Environment** | Browser (Chrome/Firefox), localhost:5173 via `npm run dev` |
| **Tester** | Development Team |
| **Total Test Cases** | 25 |
| **Test Categories** | Boot & Navigation, Agent Behavior, Addiction System, Learning System, NPC Interactions, Audio/Visual, FSM States, Cross-Scene Data |

---

## 10.2 Boot & Navigation Tests

### Test Case 01 — Boot Screen Launch

| Field | Detail |
|---|---|
| **Test ID** | TC-01 |
| **Module** | BootScene |
| **Objective** | Verify the boot screen loads correctly and transitions to AttractionScene on click |
| **Precondition** | Application running at localhost:5173 |
| **Test Steps** | 1. Open browser and navigate to localhost:5173 <br> 2. Observe boot screen elements <br> 3. Click anywhere on screen |
| **Test Data** | No input data required |
| **Expected Result** | Title "EchoSphere" visible; subtitle visible; pulsing "Click anywhere to begin" prompt; click triggers fade-out and loads AttractionScene |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 02 — Scene Skip Keys

| Field | Detail |
|---|---|
| **Test ID** | TC-02 |
| **Module** | AttractionScene |
| **Objective** | Verify N and F keys skip to RealWorldScene |
| **Precondition** | AttractionScene loaded |
| **Test Steps** | 1. Press N key <br> 2. Verify scene transition <br> 3. Restart and press F key |
| **Test Data** | Skip keys: N, F |
| **Expected Result** | Both keys immediately transition to RealWorldScene with default stats |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 10.3 Agent Behavior & Movement Tests

### Test Case 03 — Agent Movement Controls

| Field | Detail |
|---|---|
| **Test ID** | TC-03 |
| **Module** | Agent.js |
| **Objective** | Verify Steve moves correctly with keyboard input |
| **Precondition** | AttractionScene loaded; Steve spawned at center-left |
| **Test Steps** | 1. Test WASD keys <br> 2. Test arrow keys <br> 3. Test diagonal movement <br> 4. Test movement speed |
| **Test Data** | Speed: 10 px/frame in AttractionScene; Keys: WASD, Arrow keys |
| **Expected Result** | Steve moves smoothly in all directions; diagonal movement works; speed is consistent |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 04 — Eye Movement Response

| Field | Detail |
|---|---|
| **Test ID** | TC-04 |
| **Module** | Agent.js (lookAtDirection) |
| **Objective** | Verify Steve's eyes respond to audio notifications |
| **Precondition** | AttractionScene loaded; notification about to fire |
| **Test Steps** | 1. Wait for notification (300ms after scene start) <br> 2. Observe eye movement <br> 3. Time the eye return to center |
| **Test Data** | Eye offset: ±2 pixels; Hold time: 800ms; Direction: right (toward phone) |
| **Expected Result** | Eyes snap right when notification plays; hold for 800ms; smoothly return to center |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 05 — Agent Visual State Changes

| Field | Detail |
|---|---|
| **Test ID** | TC-05 |
| **Module** | Agent.js (_drawCharacter) |
| **Objective** | Verify Steve's appearance changes with FSM states |
| **Precondition** | Console access to force FSM states |
| **Test Steps** | 1. Force IDLE state <br> 2. Force ATTRACTED state <br> 3. Force LOOPING state <br> 4. Force DISTORTED state <br> 5. Force BREAKING_POINT state |
| **Test Data** | IDLE: 0xf5c5a3 skin, blue shirt; LOOPING: 0xedb48a skin, dark blue; DISTORTED: 0xd4956e, navy; BREAKING_POINT: 0xb87a55, dark navy |
| **Expected Result** | Skin color darkens progressively; shirt color changes; hunch level increases; expression changes |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 10.4 Phone & Addiction System Tests

### Test Case 06 — Phone Pickup Proximity

| Field | Detail |
|---|---|
| **Test ID** | TC-06 |
| **Module** | AttractionScene |
| **Objective** | Verify phone pickup prompt appears at correct proximity |
| **Precondition** | AttractionScene loaded; Steve spawned |
| **Test Steps** | 1. Move Steve toward phone <br> 2. Note when prompt appears <br> 3. Move away and verify prompt disappears <br> 4. Press E when prompt visible |
| **Test Data** | Phone position: (width×0.58, height×0.555); Proximity: 40px X-axis |
| **Expected Result** | Prompt appears at 40px X-axis distance; disappears when moving away; E key opens mobile screen |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 07 — Notification Audio System

| Field | Detail |
|---|---|
| **Test ID** | TC-07 |
| **Module** | AttractionScene (_firePhoneNotification) |
| **Objective** | Verify notification sound plays correctly |
| **Precondition** | AttractionScene loaded; audio enabled |
| **Test Steps** | 1. Wait for notification (300ms) <br> 2. Count audio plays <br> 3. Measure timing between plays |
| **Test Data** | Sound file: noti.wav; Plays: 3 times; Gap: 600ms; Volume: 0.8 |
| **Expected Result** | noti.wav plays exactly 3 times with 600ms gaps; volume audible |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 08 — Mobile Screen UI Elements

| Field | Detail |
|---|---|
| **Test ID** | TC-08 |
| **Module** | AttractionScene (_showMobileScreen) |
| **Objective** | Verify mobile screen displays all UI elements correctly |
| **Precondition** | Phone picked up; mobile screen open |
| **Test Steps** | 1. Verify phone frame and screen <br> 2. Check status bar (9:41, battery, signal) <br> 3. Check app header (EchoSphere) <br> 4. Verify progress bar and label <br> 5. Check scrollable content <br> 6. Verify close button |
| **Test Data** | Screen size: 340×620px; Progress bar width: screenW-30; Feed items: 12+ notifications |
| **Expected Result** | All UI elements visible and properly positioned; progress bar shows "Addiction: 0%" |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 09 — Addiction Progression Rates

| Field | Detail |
|---|---|
| **Test ID** | TC-09 |
| **Module** | Agent.js (usePhone) |
| **Objective** | Verify addiction increases at correct rate during phone use |
| **Precondition** | Mobile screen open; console access |
| **Test Steps** | 1. Note initial addiction level <br> 2. Keep mobile screen open for 100 frames <br> 3. Calculate addiction increase <br> 4. Verify awareness decrease |
| **Test Data** | Rate: +0.15 addiction, -0.12 awareness, +0.08 stress per frame |
| **Expected Result** | After 100 frames: +15 addiction, -12 awareness, +8 stress (approximately) |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 10 — Auto-Scroll Activation

| Field | Detail |
|---|---|
| **Test ID** | TC-10 |
| **Module** | AttractionScene (update loop) |
| **Objective** | Verify auto-scroll activates at 50% addiction |
| **Precondition** | Mobile screen open; addiction below 50% |
| **Test Steps** | 1. Monitor addiction level <br> 2. Wait for 50% threshold <br> 3. Verify auto-scroll activation <br> 4. Test speed formula |
| **Test Data** | Threshold: >50%; Speed formula: ((addiction-50)/50)×2 |
| **Expected Result** | Auto-scroll enables at 50%; speed increases with addiction; console logs activation |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 11 — Educational Popup at 70%

| Field | Detail |
|---|---|
| **Test ID** | TC-11 |
| **Module** | AttractionScene (_showEducationalNotification) |
| **Objective** | Verify educational popup appears at 70% addiction |
| **Precondition** | Mobile screen open; addiction approaching 70% |
| **Test Steps** | 1. Reach 70% addiction <br> 2. Verify popup appearance <br> 3. Test "Accept" button <br> 4. Restart and test "Later" button |
| **Test Data** | Threshold: ≥70%; Buttons: Accept→LearningScene, Later→continuous scroll |
| **Expected Result** | Popup appears at exactly 70%; Accept transitions to LearningScene; Later enables continuous scroll |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 12 — Failure System at 100%

| Field | Detail |
|---|---|
| **Test ID** | TC-12 |
| **Module** | AttractionScene (_showFailNotification, _showLearningKey) |
| **Objective** | Verify failure notification and learning key system |
| **Precondition** | Mobile screen open; addiction approaching 100% |
| **Test Steps** | 1. Reach 100% addiction <br> 2. Verify failure popup <br> 3. Click OK button <br> 4. Verify learning key appears <br> 5. Click learning key |
| **Test Data** | Threshold: ≥100%; Sequence: Failure popup → OK → Learning key → LearningScene |
| **Expected Result** | Failure popup shows "Results Failed"; OK shows learning key; key transitions to LearningScene |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 10.5 Learning System Tests

### Test Case 13 — LearningScene Task Mechanics

| Field | Detail |
|---|---|
| **Test ID** | TC-13 |
| **Module** | LearningScene (_completeTask) |
| **Objective** | Verify task completion using SPACE key |
| **Precondition** | LearningScene loaded; first task active |
| **Test Steps** | 1. Press SPACE key repeatedly <br> 2. Monitor progress bar <br> 3. Verify task completion <br> 4. Check second task activation |
| **Test Data** | Progress increment: +8 per SPACE press; Tasks: 2 total; Completion: progress ≥ 100% |
| **Expected Result** | Progress bar fills with SPACE presses; task completes at 100%; second task activates |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 14 — Learning Benefits Application

| Field | Detail |
|---|---|
| **Test ID** | TC-14 |
| **Module** | LearningScene (_endScene) |
| **Objective** | Verify learning reduces addiction and increases awareness |
| **Precondition** | Both tasks completed; success card shown |
| **Test Steps** | 1. Note addiction/awareness before completion <br> 2. Complete all tasks <br> 3. Click success card <br> 4. Verify stat changes in AttractionScene |
| **Test Data** | Reduction: -30 to -40 addiction; Increase: +25 to +35 awareness |
| **Expected Result** | Addiction decreases by 30-40; awareness increases by 25-35; memory includes 'educational_completion' |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 15 — Memory Pattern Storage

| Field | Detail |
|---|---|
| **Test ID** | TC-15 |
| **Module** | Agent.js (_updateAIVariables) |
| **Objective** | Verify learning patterns are stored correctly |
| **Precondition** | Console access; various addiction levels |
| **Test Steps** | 1. Reach addiction >80 <br> 2. Ignore 2+ messages <br> 3. Scroll 50+ times <br> 4. Check console logs <br> 5. Verify memory array |
| **Test Data** | Patterns: 'high_addiction', 'social_neglect', 'compulsive_scrolling' |
| **Expected Result** | Each pattern logged once; memory array contains patterns; no duplicates |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 10.6 NPC Interaction Tests

### Test Case 16 — Door Proximity and Transition

| Field | Detail |
|---|---|
| **Test ID** | TC-16 |
| **Module** | AttractionScene (door interaction) |
| **Objective** | Verify door prompt and transition to RealWorldScene |
| **Precondition** | AttractionScene loaded; Steve spawned |
| **Test Steps** | 1. Move Steve toward door <br> 2. Verify prompt at 70px <br> 3. Press F key <br> 4. Verify scene transition |
| **Test Data** | Door position: (90, height×0.35+height×0.37×0.7); Proximity: 70px; Key: F |
| **Expected Result** | "Press [F]" prompt at 70px; F key transitions to RealWorldScene with data transfer |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 17 — NPC Vision Cone Perception

| Field | Detail |
|---|---|
| **Test ID** | TC-17 |
| **Module** | RealWorldScene (_updatePerception) |
| **Objective** | Verify NPCs are perceived within vision cone and hearing range |
| **Precondition** | RealWorldScene loaded; Steve and NPCs spawned |
| **Test Steps** | 1. Position Steve facing away from NPCs <br> 2. Approach NPC from behind <br> 3. Turn to face NPC <br> 4. Test hearing range |
| **Test Data** | Vision: 200px ±45°; Hearing: 150px omnidirectional; Dusk modifier: ×0.55 |
| **Expected Result** | NPCs perceived in vision cone OR hearing range; console logs perception events |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 18 — NPC Dialogue System

| Field | Detail |
|---|---|
| **Test ID** | TC-18 |
| **Module** | RealWorldScene (_npcSpeak) |
| **Objective** | Verify NPCs speak appropriate dialogue based on Steve's state |
| **Precondition** | RealWorldScene loaded; various addiction levels |
| **Test Steps** | 1. Interact with NPC (low addiction) <br> 2. Interact with NPC (high addiction, phone visible) <br> 3. Test Mom's advice trigger <br> 4. Test learned avoidance |
| **Test Data** | Happy lines: addiction <50; Angry lines: addiction ≥50 + phone visible; Advice: Mom + addiction >60 |
| **Expected Result** | Appropriate dialogue based on state; Mom gives advice once; avoidance after 2 bad interactions |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 19 — Group Conversation System

| Field | Detail |
|---|---|
| **Test ID** | TC-19 |
| **Module** | RealWorldScene (_startGreetings) |
| **Objective** | Verify 7-line group conversation advances correctly |
| **Precondition** | RealWorldScene loaded; 3-second delay passed |
| **Test Steps** | 1. Wait for conversation start <br> 2. Press T to advance each line <br> 3. Count total lines <br> 4. Verify final transition |
| **Test Data** | Lines: 7 total; Key: T advances; Delay: 3 seconds; End: group walk + EndScene |
| **Expected Result** | Conversation starts after 3s; T advances through 7 lines; ends with group walk to EndScene |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 20 — NPC Pathfinding Behavior

| Field | Detail |
|---|---|
| **Test ID** | TC-20 |
| **Module** | RealWorldScene (_updateNPCWander, _steerNPCToward) |
| **Objective** | Verify NPC autonomous movement and seek behavior |
| **Precondition** | RealWorldScene loaded; NPCs spawned |
| **Test Steps** | 1. Observe NPC wander behavior <br> 2. Trigger NPC approach event <br> 3. Verify seek steering <br> 4. Test rain shelter pathfinding |
| **Test Data** | Wander: 240 frames per target; Seek speed: 0.6 px/frame; Approach distance: 80px |
| **Expected Result** | NPCs wander randomly; seek Steve when triggered; pathfind to shelter in rain |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 10.7 FSM & Emotion System Tests

### Test Case 21 — FSM State Transitions

| Field | Detail |
|---|---|
| **Test ID** | TC-21 |
| **Module** | FSM.js |
| **Objective** | Verify FSM transitions occur at correct thresholds |
| **Precondition** | Console access to monitor FSM state |
| **Test Steps** | 1. Trigger NOTIFICATION_SEEN event <br> 2. Monitor stress levels <br> 3. Verify LOOPING→DISTORTED at stress ≥65 <br> 4. Verify DISTORTED→BREAKING_POINT at stress ≥85 |
| **Test Data** | Transitions: stress ≥65, stress ≥85; Timer: 200 frames idle, 600 frames attracted |
| **Expected Result** | State transitions at exact thresholds; console logs transitions with reasons |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 22 — Emotion Baseline Drift

| Field | Detail |
|---|---|
| **Test ID** | TC-22 |
| **Module** | EmotionSystem.js |
| **Objective** | Verify emotions drift toward baseline values |
| **Precondition** | Emotions modified from baseline |
| **Test Steps** | 1. Modify emotions via events <br> 2. Stop triggering events <br> 3. Monitor drift over time <br> 4. Verify baseline approach |
| **Test Data** | Baselines: stress=10, happiness=60, loneliness=20; Rates: 0.008, 0.005, 0.005 |
| **Expected Result** | Emotions gradually return to baseline at specified rates |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 23 — FSM Outcome Resolution

| Field | Detail |
|---|---|
| **Test ID** | TC-23 |
| **Module** | FSM.js (_resolveOutcome) |
| **Objective** | Verify correct outcome based on behavior counters |
| **Precondition** | BREAKING_POINT state reached |
| **Test Steps** | 1. Reach BREAKING_POINT with high resist count <br> 2. Reach BREAKING_POINT with high ignore count <br> 3. Reach BREAKING_POINT with mixed behavior |
| **Test Data** | RECOVERED: resistCount ≥ engageCount + happiness >45; LOST: ignoredFriends ≥3 OR loneliness >70 |
| **Expected Result** | Correct outcome based on accumulated behavior; visual state changes accordingly |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 10.8 Cross-Scene Data Transfer Tests

### Test Case 24 — Scene Data Persistence

| Field | Detail |
|---|---|
| **Test ID** | TC-24 |
| **Module** | Scene transitions |
| **Objective** | Verify data transfers correctly between scenes |
| **Precondition** | High addiction in AttractionScene |
| **Test Steps** | 1. Build up addiction/awareness/memory in AttractionScene <br> 2. Transition to RealWorldScene <br> 3. Verify data transfer <br> 4. Test LearningScene→AttractionScene transfer |
| **Test Data** | Transfer: addictionLevel, awareness, relationshipLevel, hasPhone, memory[] |
| **Expected Result** | All data transfers correctly; NPCs respond to transferred addiction level |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

### Test Case 25 — End-to-End Journey

| Field | Detail |
|---|---|
| **Test ID** | TC-25 |
| **Module** | Complete system |
| **Objective** | Verify complete user journey from boot to end |
| **Precondition** | Fresh application start |
| **Test Steps** | 1. Complete boot sequence <br> 2. Choose phone path with high addiction <br> 3. Accept learning at 70% <br> 4. Complete learning tasks <br> 5. Return to AttractionScene <br> 6. Go to RealWorldScene <br> 7. Complete conversation <br> 8. Reach EndScene |
| **Test Data** | Full journey: Boot→Attraction→Learning→Attraction→RealWorld→End |
| **Expected Result** | Smooth transitions; data persistence; appropriate NPC responses; successful completion |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 10.9 Test Summary Table

| TC | Module | Test Focus | Priority | Expected Outcome |
|---|---|---|---|---|
| TC-01 | BootScene | Launch & transition | High | Scene loads, click starts game |
| TC-02 | AttractionScene | Skip keys | Medium | N/F keys transition to RealWorld |
| TC-03 | Agent.js | Movement controls | High | WASD/arrows move Steve correctly |
| TC-04 | Agent.js | Eye movement | Medium | Eyes respond to audio notifications |
| TC-05 | Agent.js | Visual states | Medium | Appearance changes with FSM states |
| TC-06 | AttractionScene | Phone proximity | High | Pickup prompt at correct distance |
| TC-07 | AttractionScene | Notification audio | Medium | 3x audio plays with correct timing |
| TC-08 | AttractionScene | Mobile UI | High | All UI elements display correctly |
| TC-09 | Agent.js | Addiction rates | High | Correct progression rates |
| TC-10 | AttractionScene | Auto-scroll | High | Activates at 50% with correct speed |
| TC-11 | AttractionScene | Educational popup | High | Appears at 70% with correct options |
| TC-12 | AttractionScene | Failure system | High | 100% triggers failure→learning key |
| TC-13 | LearningScene | Task mechanics | High | SPACE key completes tasks |
| TC-14 | LearningScene | Learning benefits | High | Stats improve correctly |
| TC-15 | Agent.js | Memory patterns | Medium | Patterns stored without duplicates |
| TC-16 | AttractionScene | Door transition | High | F key transitions to RealWorld |
| TC-17 | RealWorldScene | Vision cone | Medium | NPCs perceived in correct ranges |
| TC-18 | RealWorldScene | NPC dialogue | High | Appropriate dialogue based on state |
| TC-19 | RealWorldScene | Group conversation | High | 7-line conversation advances correctly |
| TC-20 | RealWorldScene | NPC pathfinding | Medium | Autonomous movement and seeking |
| TC-21 | FSM.js | State transitions | High | Transitions at correct thresholds |
| TC-22 | EmotionSystem.js | Baseline drift | Medium | Emotions return to baseline |
| TC-23 | FSM.js | Outcome resolution | High | Correct outcomes based on behavior |
| TC-24 | Scene transitions | Data persistence | High | Data transfers correctly |
| TC-25 | Complete system | End-to-end | Critical | Full journey works smoothly |

---

## 10.10 Test Environment Setup

### Prerequisites
- Node.js installed
- npm dependencies installed (`npm install`)
- Development server running (`npm run dev`)
- Browser with developer console access
- Audio enabled for notification testing

### Test Data Files
- `public/noti.wav` - Notification sound file
- Console access for FSM state monitoring
- Browser performance tools for timing verification

### Success Criteria
- All High priority tests must PASS
- At least 90% of Medium priority tests must PASS
- Critical end-to-end test must PASS
- No console errors during normal operation
- Smooth performance (>30 FPS) throughout

### Known Limitations
- Audio testing requires manual verification
- Timing tests may vary based on system performance
- Visual state changes require manual observation
- Cross-browser compatibility should be verified separately