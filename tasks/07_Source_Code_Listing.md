# 07 — Source Code Listing & Dummy DB

---

## 7.1 Project Structure

```
EchoSphere/
├── index.html                    # HTML shell, HUD overlay, decision panel
├── package.json                  # Dependencies: phaser, gsap, vite, tailwind
├── vite.config.js                # Build configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── src/
│   ├── main.js                   # Phaser game config, scene registration
│   ├── agent/
│   │   ├── Agent.js              # Core agent: AI variables, drawing, input
│   │   ├── FSM.js                # Finite State Machine: states & transitions
│   │   └── EmotionSystem.js      # Emotion tracking: stress, happiness, loneliness
│   ├── scenes/
│   │   ├── BootScene.js          # Title screen
│   │   ├── AttractionScene.js    # Bedroom: phone/door fork, mobile screen
│   │   ├── LearningScene.js      # Study room: tasks, XP, distraction
│   │   └── RealWorldScene.js     # Outdoor park: NPCs, vision cone, balancing
│   └── styles/
│       └── main.css              # Tailwind + custom styles
└── Tasks/                        # Documentation (this folder)
```

---

## 7.2 main.js — Scene Registration

```javascript
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import AttractionScene from './scenes/AttractionScene.js';
import LearningScene from './scenes/LearningScene.js';
import RealWorldScene from './scenes/RealWorldScene.js';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#f0f4ff',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, AttractionScene, LearningScene, RealWorldScene]
};

const game = new Phaser.Game(config);
export default game;
```

---

## 7.3 Dummy Database (Static Data Structures)

EchoSphere uses in-memory static data arrays as its "database." There is no backend — all data is defined as JavaScript constants within each scene file.

### Friend Messages (AttractionScene.js)
```javascript
const FRIEND_MESSAGES = [
  { speaker: 'Mia', text: 'omg did you see that new trend?? 😭' },
  { speaker: 'Mia', text: 'you HAVE to check this out lol' },
  { speaker: 'Kai', text: 'bro this video is everything 🔥' },
  { speaker: 'Mia', text: 'reply!! i sent you something funny' },
  { speaker: 'Mia', text: 'hellooo?? you there?' },
];
```

### Social Feed Items (AttractionScene.js)
```javascript
const FEED_ITEMS = [
  { icon: '❤️', text: 'Mia liked your photo!' },
  { icon: '🔥', text: 'Kai: bro this is fire!!' },
  { icon: '😍', text: '47 people loved your post' },
  { icon: '⭐', text: 'You earned a new badge!' },
  { icon: '🎉', text: 'Mia: omg you are so funny' },
  { icon: '💬', text: '12 new comments on your post' },
  { icon: '🚀', text: 'Your post is trending!' },
  { icon: '💖', text: '100 likes in 10 minutes!' },
];
```

### Study Tasks (LearningScene.js)
```javascript
const STUDY_TASKS = [
  { subject: '📐 Mathematics',  task: 'Solving quadratic equations',   xp: 30 },
  { subject: '🔬 Science',      task: 'Reading about photosynthesis',  xp: 25 },
  { subject: '📖 Literature',   task: 'Analysing a poem',              xp: 20 },
  { subject: '💻 Coding',       task: 'Writing a Python function',     xp: 35 },
  { subject: '🌍 Geography',    task: 'Studying climate zones',        xp: 22 },
];
// Total XP available: 132
```

### NPC Data (RealWorldScene.js)
```javascript
const NPC_DATA = [
  {
    id: 'mom', name: 'Mom', color: 0xe879a0,
    x: 0.72, y: 0.62, emotion: 'happy',
    lines: [
      'Hey! You actually came outside! 😊',
      'I made your favourite snack!',
      'It is so nice to see you without that phone.',
      'Want to take a walk together?',
    ],
    angryLines: [
      'You are always on that phone!',
      'Can you please just be present?',
      'I miss spending time with you.',
    ],
  },
  {
    id: 'friend', name: 'Alex', color: 0x38bdf8,
    x: 0.55, y: 0.65, emotion: 'neutral',
    lines: [
      'Yo! Finally offline? 😄',
      'We were about to start without you!',
      'Bro put the phone down, we are here!',
      'Real life hits different, right?',
    ],
    angryLines: [
      'Seriously? You are checking your phone again?',
      'We are right here talking to you!',
      'Do you even care about us anymore?',
    ],
  },
  {
    id: 'sibling', name: 'Sam', color: 0x4ade80,
    x: 0.38, y: 0.68, emotion: 'neutral',
    lines: [
      'Can we play something together?',
      'You promised you would help me today!',
      'I saved your spot at the table!',
    ],
    angryLines: [
      'You always ignore me for that phone!',
      'I do not matter to you anymore?',
    ],
  },
];
```

### Agent State Palette (Agent.js)
```javascript
// Visual palette per FSM state — maps state to colors
const PALETTE = {
  IDLE:           { shirt: 0x2563eb, pants: 0x1e3a5f, eye: 0x1e3a5f, glow: 0x000000, glowA: 0 },
  ATTRACTED:      { shirt: 0x2563eb, pants: 0x1e3a5f, eye: 0x7c3aed, glow: 0x7c3aed, glowA: 0.12 },
  LOOPING:        { shirt: 0x1d4ed8, pants: 0x172554, eye: 0xea580c, glow: 0xea580c, glowA: 0.18 },
  DISTORTED:      { shirt: 0x1e40af, pants: 0x0f1f3d, eye: 0xdc2626, glow: 0xdc2626, glowA: 0.25 },
  BREAKING_POINT: { shirt: 0x1e3a8a, pants: 0x0a1628, eye: 0x7f1d1d, glow: 0x7f1d1d, glowA: 0.30 },
  RECOVERED:      { shirt: 0x16a34a, pants: 0x14532d, eye: 0x16a34a, glow: 0x16a34a, glowA: 0.15 },
  PARTIAL:        { shirt: 0xca8a04, pants: 0x3f2d00, eye: 0xca8a04, glow: 0xca8a04, glowA: 0.12 },
  LOST:           { shirt: 0x1f2937, pants: 0x111827, eye: 0x374151, glow: 0x000000, glowA: 0 },
};
```

### Conflict Messages (AttractionScene.js)
```javascript
const CONFLICT_MESSAGES = [
  { sender: 'Mom 📞',         text: 'Where are you? We need you at dinner.' },
  { sender: 'Best Friend 💬', text: 'Hey, you okay? You\'ve been quiet...' },
  { sender: 'Dad 📞',         text: 'Can you help me with something?' },
  { sender: 'Mia 💬',         text: 'Are you ignoring me? 😢' },
];
```

### Loop Notifications (TheLoopScene — reference only)
```javascript
const LOOP_NOTIFICATIONS = [
  '🔔  You have 47 new notifications',
  '🔥  Your streak is on fire!',
  '💬  Mia posted again — don\'t miss it',
  '📣  Trending now: check it out',
  '⭐  New content just for you',
  '🎯  You\'re in the top 10% today!',
  '🔁  Kai, you haven\'t scrolled in 2 mins',
  '💡  Recommended: 12 new posts',
  '🚨  Breaking: everyone is talking about this',
  '🎰  Spin your daily reward!',
];
```

---

## 7.4 Agent State Object (Runtime "DB")

At runtime, the Agent instance acts as a live state record passed between scenes:

```javascript
// Passed from AttractionScene → RealWorldScene via scene.start(key, data)
{
  addictionLevel:    number,   // 0-100
  awareness:         number,   // 0-100
  relationshipLevel: number,   // 0-100
  hasPhone:          boolean,
  memory:            string[]  // ['high_addiction', 'social_neglect', ...]
}
```

```javascript
// Agent.memory[] — possible values
[
  'high_addiction',       // addiction exceeded 80%
  'social_neglect',       // 2+ messages ignored
  'compulsive_scrolling', // scroll count > 50
  'mom_advice'            // received Mom's advice (not repeated)
]
```

---

## 7.5 Key Constants Reference

| Constant | Value | Purpose |
|---|---|---|
| `VISION_RANGE` | 200px | Default NPC perception distance |
| `HEARING_RANGE` | 150px | Omnidirectional NPC hearing |
| `VISION_ANGLE` | 90° | Field of view cone width |
| `NPC_WANDER_SPEED` | 0.6 px/frame | NPC autonomous movement speed |
| `addictionLevel` decay | -0.02/frame | Natural recovery when off phone |
| `awareness` recovery | +0.05/frame | Natural recovery when off phone |
| `addictionLevel` per frame | +0.15 | Rate of addiction increase on phone |
| `addictionLevel` per scroll | +0.3 | Scroll action impact |
| Auto-scroll threshold | 50% | Addiction level that triggers auto-scroll |
| Conflict trigger threshold | 70% | Addiction level for conflict messages |
| Transition threshold | 85% + 2 ignored | Behavior-based scene transition |
| Total study XP | 132 | Sum of all 5 task XP values |
