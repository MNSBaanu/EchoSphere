# 04 — PEAS for All Characters

PEAS = **P**erformance Measure · **E**nvironment · **A**ctuators · **S**ensors

---

## 4.1 Kai (Main Agent)

| PEAS Component | Description |
|---|---|
| **Performance Measure** | Academic results (Good Grades / Bad Grades / Partial); Relationship level with NPCs; Addiction level at end of simulation; Awareness level maintained; Number of study tasks completed; Number of messages replied vs ignored |
| **Environment** | Bedroom (phone, door, desk, bed); Social feed (notifications, likes, messages, infinite scroll); Study room (desk, laptop, task cards); Outdoor park (NPCs, bench, trees, path); Partially observable (vision cone limits what Kai can see); Stochastic (random events fire unpredictably); Sequential (past decisions affect future states); Dynamic (environment changes while Kai deliberates) |
| **Actuators** | Move (WASD / arrow keys); Pick up phone (E key / click); Scroll social feed (mouse wheel); Reply to message (button click); Ignore message (button click / timeout); Study (SPACE key); Talk to NPC (T key); Sit/stand at desk (C key); Walk to door |
| **Sensors** | Proximity detector (distance to phone, door, NPCs); Notification perception (within 90px radius); Vision cone (90° field of view, range varies by state); Hearing range (150px radius, omnidirectional); Keyboard input (player-controlled movement); Internal state monitors (addiction, awareness, stress, happiness, loneliness, relationship level) |

---

## 4.2 Mom (NPC)

| PEAS Component | Description |
|---|---|
| **Performance Measure** | Successfully communicates concern to Kai; Delivers advice when addiction is high (once only); Relationship with Kai maintained or improved; Emotional state reflects Kai's behavior accurately |
| **Environment** | Outdoor park (home position: 72% width, 62% height); Wander zone (±60px from home position); Bench area (shelter during rain); Partially observable (does not know Kai's internal addiction level directly — reacts to phone visibility) |
| **Actuators** | Wander (autonomous movement within zone); Approach Kai (pathfinding seek behavior when ignored); Speak (speech bubble with dialogue lines); Change emotion (happy → sad → angry based on Kai's phone use); Seek shelter (move to bench during rain) |
| **Sensors** | Proximity to Kai (triggers interact prompt at < 90px); Kai's phone visibility (`_phoneVisible` flag); Kai's addiction level (determines which dialogue set to use); Wander timer (picks new target every ~4 seconds); Random event signals (rain → seek shelter) |

**Dialogue Sets:**
- Normal (phone away): "Hey! You actually came outside! 😊", "I made your favourite snack!", "Want to take a walk together?"
- Angry (phone out, addiction > 75%): "You are always on that phone!", "Can you please just be present?"
- Sad (phone out, addiction 50–75%): "I miss spending time with you."
- Advice (addiction > 60%, once only): "Put the phone down. Real moments matter more. 💚"

---

## 4.3 Alex / Friend (NPC)

| PEAS Component | Description |
|---|---|
| **Performance Measure** | Engages Kai in real-world conversation; Expresses frustration when ignored; Contributes to Kai's relationship level recovery |
| **Environment** | Outdoor park (home position: 55% width, 65% height); Wander zone (±60px from home); Bench area during rain |
| **Actuators** | Wander; Approach Kai (if ignored too long); Speak (casual dialogue); Change emotion (neutral → angry/sad); Seek shelter |
| **Sensors** | Proximity to Kai; Kai's phone visibility; Wander timer; Random event signals |

**Dialogue Sets:**
- Normal: "Yo! Finally offline? 😄", "We were about to start without you!", "Real life hits different, right?"
- Angry: "Seriously? You are checking your phone again?", "We are right here talking to you!"

---

## 4.4 Sam / Sibling (NPC)

| PEAS Component | Description |
|---|---|
| **Performance Measure** | Seeks attention from Kai; Reacts emotionally to being ignored; Represents the cost of neglecting family |
| **Environment** | Outdoor park (home position: 38% width, 68% height); Wander zone (±60px from home) |
| **Actuators** | Wander; Approach Kai; Speak; Change emotion |
| **Sensors** | Proximity to Kai; Kai's phone visibility; Wander timer |

**Dialogue Sets:**
- Normal: "Can we play something together?", "You promised you would help me today!", "I saved your spot at the table!"
- Angry: "You always ignore me for that phone!", "I do not matter to you anymore?"

---

## 4.5 Social Media Feed (Adversarial Environment Agent)

The social feed is not a character but acts as an **adversarial agent** — its goal is to keep Kai engaged.

| PEAS Component | Description |
|---|---|
| **Performance Measure** | Maximize Kai's time on phone; Increase addiction level; Trigger auto-scroll; Prevent transition to study/real world |
| **Environment** | Mobile screen overlay; Kai's attention and scroll behavior |
| **Actuators** | Spawn notifications (random frequency, increasing over time); Display feed cards (likes, comments, trending, badges); Auto-scroll (activates at addiction > 50%); Conflict messages (fires at addiction > 70%, 30% chance every 3s) |
| **Sensors** | Kai's addiction level (determines notification frequency); Kai's scroll actions (reinforces engagement); Time on phone (escalates content urgency) |

---

## 4.6 PEAS Summary Table

| Character | Goal | Key Sensor | Key Actuator | Performance Metric |
|---|---|---|---|---|
| **Kai** | Balance digital use with real-world responsibilities | Vision cone + proximity | Move + scroll + study | Good Grades + Relationship level |
| **Mom** | Guide Kai back to real world | Phone visibility + proximity | Speak + approach + emotion change | Advice delivered, relationship maintained |
| **Alex** | Engage Kai socially | Proximity + phone visibility | Speak + approach | Kai's relationship level |
| **Sam** | Get Kai's attention | Proximity | Speak + approach + emotion | Kai acknowledges sibling |
| **Social Feed** | Keep Kai on phone | Addiction level + scroll count | Notifications + auto-scroll | Addiction level maximized |
