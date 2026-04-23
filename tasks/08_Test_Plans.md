# 08 — Test Plans & Test Data

---

## 8.1 Test Overview

| Item | Detail |
|---|---|
| **System Under Test** | EchoSphere v1.0 — Intelligent Agent Simulation |
| **Test Type** | Functional, Behavioral, AI Logic, UI/UX |
| **Environment** | Browser (Chrome/Firefox), localhost:5173 via `npm run dev` |
| **Tester** | Baanu & Irfa |
| **Total Test Cases** | 10 |

---

## 8.2 Test Case 01 — Boot Screen Launch

| Field | Detail |
|---|---|
| **Test ID** | TC-01 |
| **Module** | BootScene |
| **Objective** | Verify the boot screen loads correctly and transitions to AttractionScene on click |
| **Precondition** | Application running at localhost:5173 |
| **Test Steps** | 1. Open browser and navigate to localhost:5173 <br> 2. Observe boot screen elements <br> 3. Click anywhere on screen |
| **Test Data** | No input data required |
| **Expected Result** | Title "EchoSphere" visible; subtitle "The World You Shape" visible; pulsing "▶ Click anywhere to begin" prompt visible; click triggers fade-out and loads AttractionScene |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.3 Test Case 02 — Phone Pickup and Mobile Screen

| Field | Detail |
|---|---|
| **Test ID** | TC-02 |
| **Module** | AttractionScene |
| **Objective** | Verify Kai can pick up the phone and the mobile screen opens with correct UI elements |
| **Precondition** | AttractionScene loaded; Kai spawned at centre-left |
| **Test Steps** | 1. Move Kai toward phone using arrow keys / WASD <br> 2. Observe pickup prompt when within 60px <br> 3. Press [E] key <br> 4. Observe mobile screen |
| **Test Data** | Kai position: (width×0.35, height×0.62); Phone position: (width×0.58, height×0.555) |
| **Expected Result** | Pickup prompt "📱 Pick Up Phone — Press [E]" appears; pressing E opens full-screen mobile UI with addiction bar, emotion bars (👁 😰 💬), scrollable feed, and close button |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.4 Test Case 03 — Addiction Variable Increases on Scroll

| Field | Detail |
|---|---|
| **Test ID** | TC-03 |
| **Module** | AttractionScene + Agent.js |
| **Objective** | Verify addiction level increases and awareness decreases when scrolling the feed |
| **Precondition** | Mobile screen open; addiction bar visible |
| **Test Steps** | 1. Open mobile screen <br> 2. Note initial addiction bar width (should be near 0%) <br> 3. Scroll mouse wheel downward 10 times <br> 4. Observe addiction bar and awareness bar |
| **Test Data** | Initial: addictionLevel=0, awareness=70; Per scroll: addiction+0.3, awareness-0.2 |
| **Expected Result** | After 10 scrolls: addictionLevel ≈ 3%, awareness ≈ 68%; addiction bar visibly wider; awareness bar visibly shorter |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.5 Test Case 04 — Auto-Scroll Activates at 50% Addiction

| Field | Detail |
|---|---|
| **Test ID** | TC-04 |
| **Module** | AttractionScene (update loop) |
| **Objective** | Verify auto-scroll activates when addiction exceeds 50% and feed moves without user input |
| **Precondition** | Mobile screen open; addiction level below 50% |
| **Test Steps** | 1. Keep mobile screen open without scrolling (let addiction rise passively) <br> 2. Alternatively scroll rapidly to reach 50% faster <br> 3. Stop scrolling and observe feed |
| **Test Data** | Threshold: addictionLevel > 50; Auto-scroll speed = ((addiction-50)/50) × 2 |
| **Expected Result** | Event log shows "🤖 AI: Agent losing control - auto-scroll enabled"; feed begins scrolling automatically without user input; speed increases as addiction rises |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.6 Test Case 05 — Conflict Message and Reply/Ignore Decision

| Field | Detail |
|---|---|
| **Test ID** | TC-05 |
| **Module** | AttractionScene (_triggerConflict) |
| **Objective** | Verify conflict message fires at 70%+ addiction and that Reply/Ignore choices affect relationship level |
| **Precondition** | Mobile screen open; addiction level above 70% |
| **Test Steps** | 1. Reach 70%+ addiction (scroll or wait) <br> 2. Wait for conflict popup to appear (30% chance every 3s) <br> 3. Click "Reply" <br> 4. Repeat test and click "Ignore" instead |
| **Test Data** | Reply: relationshipLevel+10, awareness+5, happiness+5, loneliness-5 <br> Ignore: ignoredMessages++, relationshipLevel-5, addictionLevel+2, loneliness+3 |
| **Expected Result** | Reply: relationship bar increases, event log shows "💬 Choice: Replied to message - relationship improved" <br> Ignore: relationship bar decreases, event log shows "🚫 Agent ignored message - relationship damaged" |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.7 Test Case 06 — Learning System Pattern Storage

| Field | Detail |
|---|---|
| **Test ID** | TC-06 |
| **Module** | Agent.js (_updateAIVariables) |
| **Objective** | Verify learning patterns are stored in agent.memory[] when thresholds are crossed |
| **Precondition** | Browser developer console open; AttractionScene running |
| **Test Steps** | 1. Open browser console (F12) <br> 2. Scroll until addiction > 80% <br> 3. Ignore 2+ conflict messages <br> 4. Scroll more than 50 times |
| **Test Data** | Thresholds: addiction>80 → 'high_addiction'; ignoredMessages≥2 → 'social_neglect'; scrollCount>50 → 'compulsive_scrolling' |
| **Expected Result** | Console shows: "🧠 Agent learned: high_addiction pattern", "🧠 Agent learned: social_neglect pattern", "🧠 Agent learned: compulsive_scrolling pattern" — each logged exactly once |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.8 Test Case 07 — Door Path Leads to Real World Scene

| Field | Detail |
|---|---|
| **Test ID** | TC-07 |
| **Module** | AttractionScene → RealWorldScene |
| **Objective** | Verify walking Kai to the door triggers the Real World transition |
| **Precondition** | AttractionScene loaded; Kai spawned |
| **Test Steps** | 1. Move Kai left toward the door using arrow keys <br> 2. Observe door prompt when within 70px <br> 3. Continue moving toward door until transition triggers |
| **Test Data** | Door position: x=55+35=90, y=height×0.35+height×0.37×0.7; Threshold: 60px |
| **Expected Result** | "Go Outside" label visible on door; proximity triggers walk animation; scene transitions with warm flash (sunlight effect) to RealWorldScene; outdoor park environment loads with 3 NPCs |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.9 Test Case 08 — NPC Vision Cone Perception

| Field | Detail |
|---|---|
| **Test ID** | TC-08 |
| **Module** | RealWorldScene (_updateVisionCone, _updatePerception) |
| **Objective** | Verify NPCs are only perceived when within Kai's vision cone or hearing range |
| **Precondition** | RealWorldScene loaded; Kai spawned at centre |
| **Test Steps** | 1. Face Kai away from all NPCs (move left, NPCs are right-centre) <br> 2. Approach an NPC from behind (outside vision cone) <br> 3. Observe whether interact prompt appears <br> 4. Turn Kai to face the NPC <br> 5. Observe interact prompt |
| **Test Data** | Vision range: 200px; Vision angle: 90° (±45°); Hearing range: 150px |
| **Expected Result** | When NPC is behind Kai and beyond 150px: no interact prompt; when NPC is within hearing range (150px) OR within vision cone: "Press [T] to talk" prompt appears |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.10 Test Case 09 — Study Task Completion and XP

| Field | Detail |
|---|---|
| **Test ID** | TC-09 |
| **Module** | LearningScene (_fillTaskProgress, _completeTask) |
| **Objective** | Verify study tasks complete correctly and XP accumulates |
| **Precondition** | LearningScene loaded (via door path or [N] skip in AttractionScene) |
| **Test Steps** | 1. Observe first task card: "📐 Mathematics — Solving quadratic equations (+30 XP)" <br> 2. Hold SPACE key until progress bar fills <br> 3. Observe completion animation and XP update <br> 4. Repeat for all 5 tasks |
| **Test Data** | Task XP: Math=30, Science=25, Literature=20, Coding=35, Geography=22; Total=132 XP |
| **Expected Result** | Each task: progress bar fills on SPACE hold; particle burst on completion (⭐✨📚💡); XP bar updates; after all 5 tasks: "✅ Kai chose to learn! He earned 132 XP" card appears |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.11 Test Case 10 — Mom's Advice (One-Time Learning)

| Field | Detail |
|---|---|
| **Test ID** | TC-10 |
| **Module** | RealWorldScene (_giveAdvice, _npcSpeak) |
| **Objective** | Verify Mom gives advice only once when addiction > 60%, and that it reduces addiction and increases awareness |
| **Precondition** | RealWorldScene loaded with addictionLevel > 60 (enter via phone path with high addiction) |
| **Test Steps** | 1. Enter RealWorldScene with addiction > 60% <br> 2. Move Kai near Mom (within 90px) <br> 3. Press [T] to talk <br> 4. Observe advice bubble <br> 5. Move away and return to Mom <br> 6. Press [T] again |
| **Test Data** | Advice trigger: npc.id=='mom' AND addictionLevel>60 AND adviceGiven==false; Effect: addictionLevel-=20, awareness+=15 |
| **Expected Result** | First interaction: "Put the phone down. Real moments matter more. 💚" bubble appears; addiction bar decreases; awareness bar increases; console shows "🧠 Kai learned: mom_advice"; Second interaction: normal dialogue line shown (advice not repeated) |
| **Actual Result** | *(to be filled during testing)* |
| **Status** | PASS / FAIL |

---

## 8.12 Test Summary Table

| TC | Module | Test Focus | Expected Outcome |
|---|---|---|---|
| TC-01 | BootScene | Launch & transition | Scene loads, click starts game |
| TC-02 | AttractionScene | Phone pickup | Mobile screen opens with all UI |
| TC-03 | Agent.js | Addiction on scroll | Variables update correctly |
| TC-04 | AttractionScene | Auto-scroll at 50% | Feed moves without user input |
| TC-05 | AttractionScene | Reply/Ignore decision | Relationship level changes correctly |
| TC-06 | Agent.js | Learning patterns | Memory array populated once per pattern |
| TC-07 | AttractionScene | Door path | Transitions to RealWorldScene |
| TC-08 | RealWorldScene | Vision cone perception | NPCs only perceived in range/cone |
| TC-09 | LearningScene | Study task + XP | All 5 tasks completable, 132 XP total |
| TC-10 | RealWorldScene | Mom's advice (learning) | Advice given once, variables updated |
