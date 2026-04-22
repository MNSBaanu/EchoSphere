import Phaser from 'phaser';
import Agent from '../agent/Agent.js';
import { gsap } from 'gsap';

const FONT      = 'Sora, Inter, sans-serif';
const FONT_BODY = 'Inter, sans-serif';

const FRIEND_MESSAGES = [
  { speaker: 'Mia', text: 'omg did you see that new trend?? 😭' },
  { speaker: 'Mia', text: 'you HAVE to check this out lol' },
  { speaker: 'Kai', text: 'bro this video is everything 🔥' },
  { speaker: 'Mia', text: 'reply!! i sent you something funny' },
  { speaker: 'Mia', text: 'hellooo?? you there?' },
];

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

const PARTICLE_EMOJIS = ['❤️', '⭐', '✨', '💛', '🎉', '💖', '🌟'];

export default class AttractionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AttractionScene' });
    this._msgIndex        = 0;
    this._pendingFriendMsg = false;
    this._decisionPending  = false;
    this._ended            = false;
    this._logLines         = [];
    this._engageStreak     = 0;
    this._phonePickedUp    = false;
    this._doorReached      = false;
    this._pickupPromptShown = false;
    this._mobileScreenOpen  = false;
    this._phoneProgress    = 0;
    this._scrollOffset     = 0;
  }

  create() {
    const { width, height } = this.scale;

    // ── Room environment (side view) ─────────────────────────────────────
    this._drawRoom(width, height);

    // ── Top bar ───────────────────────────────────────────────────────────
    const topBar = this.add.graphics().setDepth(20);
    topBar.fillStyle(0x1e1b4b, 1);
    topBar.fillRect(0, 0, width, 52);
    this.add.text(24, 14, '🌐  EchoSphere', {
      fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: '#ffffff'
    }).setDepth(21);
    this.add.text(width / 2, 14, 'SCENARIO 1 — THE ATTRACTION', {
      fontFamily: FONT, fontSize: '14px', color: '#a5b4fc', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(21);
    this.add.text(width - 24, 14, 'Real World  ·  [N] skip', {
      fontFamily: FONT, fontSize: '13px', color: '#818cf8'
    }).setOrigin(1, 0).setDepth(21);

    // ── Phone on table ────────────────────────────────────────────────────
    this._spawnPhoneOnTable(width, height);

    // ── Door on left ──────────────────────────────────────────────────────
    this._spawnDoor(height);

    // ── Agent starts centre-left ──────────────────────────────────────────
    this.agent = new Agent(this, width * 0.35, height * 0.62);
    // Keyboard locked until decision is made
    this._lockAgentKeys(true);

    this.agent.fsm.onTransition((newState, reason) => {
      this._onStateChange(newState, reason);
    });

    // ── Notification fires after 2s ───────────────────────────────────────
    this.time.delayedCall(2000, () => this._firePhoneNotification());

    // ── Friend messages ───────────────────────────────────────────────────
    this._scheduleNextFriendMessage();

    // ── UI ────────────────────────────────────────────────────────────────
    this._buildChoiceButtons();
    this._logContainer = this.add.container(16, height - 16).setDepth(25);

    // ── Skip key ──────────────────────────────────────────────────────────
    this.input.keyboard.once('keydown-N', () => {
      if (!this._ended) this._transitionToLoop();
    });
  }

  update() {
    if (this._ended) return;
    if (this.agent) this.agent.update();

    // Check proximity to phone and show pickup option
    if (!this._phonePickedUp && this._phonePos && this.agent) {
      const dx = this._phonePos.x - this.agent.x;
      const dy = this._phonePos.y - this.agent.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 60 && !this._pickupPromptShown) {
        this._showPickupPrompt();
      } else if (dist >= 60 && this._pickupPromptShown) {
        this._hidePickupPrompt();
      }
    }

    // Update phone progress when mobile screen is open
    if (this._mobileScreenOpen && !this._ended) {
      this._phoneProgress += 0.15; // Increase progress (adjust speed here)
      
      if (this._phoneProgress >= 100) {
        this._phoneProgress = 100;
        this._updateProgressBar();
        
        // Redirect to Scenario 2 after a short delay
        this.time.delayedCall(500, () => {
          this._transitionToDistortion();
        });
      } else {
        this._updateProgressBar();
      }
    }

    // Auto-walk to phone if agent chose phone path
    if (this._walkingToPhone && !this._phonePickedUp && this._phonePos) {
      this._walkAgentToTarget(this._phonePos.x, this._phonePos.y, 55, () => this._pickUpPhone());
    }

    // Auto-walk to door if agent chose door path
    if (this._walkingToDoor && !this._doorReached && this._doorPos) {
      this._walkAgentToTarget(this._doorPos.x, this._doorPos.y, 60, () => this._reachDoor());
    }
  }

  // ── ROOM DRAWING ─────────────────────────────────────────────────────────
  _drawRoom(width, height) {
    const g = this.add.graphics().setDepth(0);

    // Sky/ceiling — warm cream
    g.fillStyle(0xfff8f0, 1);
    g.fillRect(0, 0, width, height);

    // Back wall — soft warm white
    g.fillStyle(0xfef9f4, 1);
    g.fillRect(0, 52, width, height * 0.55);

    // Floor — warm wood tone
    g.fillStyle(0xd4a96a, 1);
    g.fillRect(0, height * 0.72, width, height - height * 0.72);

    // Floor highlight strip
    g.fillStyle(0xe8c08a, 1);
    g.fillRect(0, height * 0.72, width, 8);

    // Floor planks (subtle lines)
    g.lineStyle(1, 0xc49050, 0.3);
    for (let x = 0; x < width; x += 80) {
      g.lineBetween(x, height * 0.72, x, height);
    }

    // Wall baseboard
    g.fillStyle(0xf0e0c8, 1);
    g.fillRect(0, height * 0.72 - 12, width, 12);

    // Ceiling line
    g.lineStyle(2, 0xe8d8c0, 1);
    g.lineBetween(0, 52, width, 52);

    // ── Wallpaper pattern (subtle dots) ──────────────────────────────────
    g.fillStyle(0xf0e8e0, 0.5);
    for (let wx = 40; wx < width; wx += 60) {
      for (let wy = 80; wy < height * 0.72; wy += 50) {
        g.fillCircle(wx, wy, 2);
      }
    }

    // ── Bed (right side) ─────────────────────────────────────────────────
    const bedX = width * 0.72;
    const bedY = height * 0.52;
    // Bed frame
    g.fillStyle(0x8b6914, 1);
    g.fillRoundedRect(bedX, bedY, width * 0.26, height * 0.22, 6);
    // Mattress
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(bedX + 6, bedY + 6, width * 0.26 - 12, height * 0.22 - 12, 4);
    // Pillow
    g.fillStyle(0xe8f4ff, 1);
    g.fillRoundedRect(bedX + 12, bedY + 10, width * 0.1, height * 0.07, 8);
    // Blanket
    g.fillStyle(0x6366f1, 0.7);
    g.fillRoundedRect(bedX + 6, bedY + height * 0.1, width * 0.26 - 12, height * 0.1, 4);
    // Blanket stripes
    g.lineStyle(2, 0x4f46e5, 0.4);
    for (let s = 0; s < 4; s++) {
      g.lineBetween(bedX + 6, bedY + height * 0.1 + s * 10, bedX + width * 0.26 - 6, bedY + height * 0.1 + s * 10);
    }

    // ── Desk / table (centre-right) ───────────────────────────────────────
    const deskX = width * 0.5;
    const deskY = height * 0.58;
    const deskW = width * 0.22;
    const deskH = 14;
    // Desk surface
    g.fillStyle(0xa0522d, 1);
    g.fillRoundedRect(deskX, deskY, deskW, deskH, 3);
    // Desk top highlight
    g.fillStyle(0xc8783c, 1);
    g.fillRoundedRect(deskX + 2, deskY + 2, deskW - 4, 4, 2);
    // Desk legs
    g.fillStyle(0x8b4513, 1);
    g.fillRect(deskX + 8, deskY + deskH, 10, height * 0.14);
    g.fillRect(deskX + deskW - 18, deskY + deskH, 10, height * 0.14);

    // ── Lamp on desk ──────────────────────────────────────────────────────
    const lampX = deskX + deskW - 30;
    const lampY = deskY - 60;
    // Lamp base
    g.fillStyle(0x888888, 1);
    g.fillRect(lampX - 4, deskY, 8, deskH);
    // Lamp pole
    g.fillStyle(0xaaaaaa, 1);
    g.fillRect(lampX - 2, lampY, 4, 60);
    // Lamp shade
    g.fillStyle(0xffd700, 0.9);
    g.fillTriangle(lampX - 20, lampY, lampX + 20, lampY, lampX, lampY - 30);
    // Lamp glow
    g.fillStyle(0xfffacd, 0.25);
    g.fillCircle(lampX, lampY + 10, 45);

    // ── Bookshelf (back wall, left-centre) ────────────────────────────────
    const shelfX = width * 0.28;
    const shelfY = height * 0.2;
    g.fillStyle(0x8b6914, 1);
    g.fillRect(shelfX, shelfY, width * 0.18, 10);
    g.fillRect(shelfX, shelfY + 50, width * 0.18, 10);
    // Books
    const bookColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22];
    bookColors.forEach((col, i) => {
      g.fillStyle(col, 1);
      g.fillRect(shelfX + 4 + i * 18, shelfY - 38, 14, 38);
    });

    // ── Window (back wall, right of shelf) ────────────────────────────────
    const winX = width * 0.5;
    const winY = height * 0.12;
    const winW = width * 0.14;
    const winH = height * 0.22;
    // Window frame
    g.fillStyle(0xffffff, 1);
    g.fillRect(winX, winY, winW, winH);
    // Sky outside
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(winX + 6, winY + 6, winW - 12, winH - 12);
    // Clouds
    g.fillStyle(0xffffff, 0.9);
    g.fillEllipse(winX + 20, winY + 20, 30, 14);
    g.fillEllipse(winX + 35, winY + 16, 24, 12);
    // Window cross
    g.lineStyle(3, 0xcccccc, 1);
    g.lineBetween(winX + winW / 2, winY + 6, winX + winW / 2, winY + winH - 6);
    g.lineBetween(winX + 6, winY + winH / 2, winX + winW - 6, winY + winH / 2);
    // Window sill
    g.fillStyle(0xdddddd, 1);
    g.fillRect(winX - 4, winY + winH, winW + 8, 8);
    // Light rays from window
    g.fillStyle(0xfffde7, 0.12);
    g.fillTriangle(winX + 6, winY + winH, winX + winW - 6, winY + winH, winX + winW * 1.5, height * 0.72);

    // ── Poster on wall ────────────────────────────────────────────────────
    g.fillStyle(0xffffff, 1);
    g.fillRect(width * 0.15, height * 0.15, 70, 90);
    g.fillStyle(0x6366f1, 1);
    g.fillRect(width * 0.15 + 4, height * 0.15 + 4, 62, 82);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(width * 0.15 + 35, height * 0.15 + 35, 20);
    g.fillStyle(0xa5b4fc, 1);
    g.fillRect(width * 0.15 + 10, height * 0.15 + 62, 50, 6);
    g.fillRect(width * 0.15 + 18, height * 0.15 + 72, 34, 6);

    // ── Rug on floor ──────────────────────────────────────────────────────
    g.fillStyle(0x7c3aed, 0.25);
    g.fillEllipse(width * 0.45, height * 0.8, width * 0.35, height * 0.1);
    g.lineStyle(2, 0x6d28d9, 0.3);
    g.strokeEllipse(width * 0.45, height * 0.8, width * 0.35, height * 0.1);
  }

  // ── Phone on table ────────────────────────────────────────────────────────
  _spawnPhoneOnTable(width, height) {
    const px = width * 0.58;
    const py = height * 0.555;

    this._phonePos = { x: px, y: py };

    // Glow ring (OFF initially)
    this._phoneGlow = this.add.circle(px, py, 28, 0xfbbf24, 0).setDepth(6);

    const phone = this.add.container(px, py).setDepth(7);
    const body   = this.add.rectangle(0, 0, 22, 38, 0x1e1b4b, 1);
    body.setStrokeStyle(2, 0x4b5563, 1);
    const screen = this.add.rectangle(0, -2, 16, 28, 0x374151, 1);
    const btn    = this.add.circle(0, 16, 3, 0x6b7280, 1);
    phone.add([body, screen, btn]);

    // Make phone clickable
    body.setInteractive({ useHandCursor: true });
    body.on('pointerdown', () => {
      if (!this._phonePickedUp && !this._mobileScreenOpen) {
        this._pickUpPhone();
      }
    });

    this._phone    = phone;
    this._phoneOn  = false;

    // Label
    this.add.text(px, py + 30, 'Phone', {
      fontFamily: FONT_BODY, fontSize: '10px', color: '#94a3b8'
    }).setOrigin(0.5).setDepth(7);
  }

  // ── Door on left ──────────────────────────────────────────────────────────
  _spawnDoor(height) {
    const dx = 55;
    const dy = height * 0.35;
    const dw = 70;
    const dh = height * 0.37;

    this._doorPos = { x: dx + dw / 2, y: dy + dh * 0.7 };

    const g = this.add.graphics().setDepth(3);

    // Door frame
    g.fillStyle(0x8b6914, 1);
    g.fillRect(dx - 6, dy - 6, dw + 12, dh + 12);

    // Door surface
    g.fillStyle(0xd4a96a, 1);
    g.fillRect(dx, dy, dw, dh);

    // Door panels
    g.fillStyle(0xc49050, 1);
    g.fillRoundedRect(dx + 8, dy + 10, dw - 16, dh * 0.35, 3);
    g.fillRoundedRect(dx + 8, dy + dh * 0.45, dw - 16, dh * 0.45, 3);

    // Door knob
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(dx + dw - 14, dy + dh * 0.5, 6);

    // Light coming through (warm glow at bottom of door)
    g.fillStyle(0xfef9c3, 0.35);
    g.fillRect(dx, dy + dh - 4, dw, 4);

    // Label
    this.add.text(dx + dw / 2, dy + dh + 14, 'Go Outside', {
      fontFamily: FONT_BODY, fontSize: '11px', color: '#78716c'
    }).setOrigin(0.5).setDepth(4);

    // Subtle glow around door
    this._doorGlow = this.add.rectangle(dx + dw / 2, dy + dh / 2, dw + 20, dh + 20)
      .setStrokeStyle(2, 0xfbbf24, 0.3)
      .setFillStyle(0x000000, 0)
      .setDepth(3);
  }

  // ── Phone notification fires ──────────────────────────────────────────────
  _firePhoneNotification() {
    if (this._ended) return;

    this._phoneOn = true;

    // Screen lights up
    const screen = this._phone.list[1];
    if (screen) {
      this.tweens.add({ targets: screen, fillColor: 0x6366f1, duration: 300 });
    }

    // Glow ring pulses
    this._phoneGlow.setAlpha(0.4);
    this.tweens.add({
      targets: this._phoneGlow,
      scaleX: 1.8, scaleY: 1.8, alpha: 0,
      duration: 900, repeat: -1, ease: 'Sine.easeOut'
    });

    // Notification bubble above phone
    const bx = this._phonePos.x;
    const by = this._phonePos.y - 55;
    const bubble = this.add.container(bx, by).setDepth(8).setAlpha(0);
    const bg = this.add.rectangle(0, 0, 160, 36, 0xffffff, 0.97);
    bg.setStrokeStyle(2, 0x6366f1, 1);
    const strip = this.add.rectangle(-78, 0, 4, 36, 0x6366f1, 1);
    const txt = this.add.text(6, 0, '🔔 New notification!', {
      fontFamily: FONT_BODY, fontSize: '11px', color: '#1e1b4b'
    }).setOrigin(0, 0.5);
    bubble.add([bg, strip, txt]);

    gsap.fromTo(bubble, { alpha: 0, y: by + 10 }, { alpha: 1, y: by, duration: 0.4, ease: 'back.out(1.5)' });

    // Agent perceives it — FSM: IDLE → ATTRACTED
    this.agent.fsm.handleEvent('NOTIFICATION_SEEN');
    this._log('🔔 Phone', 'notification received!');

    // Show decision node: phone or door?
    this.time.delayedCall(1200, () => {
      this._showDecisionNode(
        'Kai notices the phone glowing...',
        '📱 Check Phone',
        '🚪 Go Outside'
      );
    });

    // Auto-destroy bubble after 6s
    this.time.delayedCall(6000, () => {
      if (bubble.active) {
        gsap.to(bubble, { alpha: 0, duration: 0.3, onComplete: () => bubble.destroy() });
      }
    });
  }

  // ── Placeholder methods (to be implemented) ──────────────────────────────
  _showDecisionNode(message, option1, option2) {
    // TODO: Implement decision node UI
    console.log('Decision:', message, option1, option2);
  }

  _scheduleNextFriendMessage() {
    // TODO: Implement friend message scheduling
  }

  _buildChoiceButtons() {
    // TODO: Implement choice buttons UI
  }

  _log(category, message) {
    console.log(`[${category}]`, message);
    this._logLines.push({ category, message });
  }

  _onStateChange(newState, reason) {
    this._log('FSM', `State: ${newState} (${reason})`);
  }

  _lockAgentKeys(locked) {
    if (this.agent) {
      this.agent.keysLocked = locked;
    }
  }

  _walkAgentToTarget(targetX, targetY, threshold, callback) {
    if (!this.agent) return;
    
    const dx = targetX - this.agent.x;
    const dy = targetY - this.agent.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < threshold) {
      if (callback) callback();
    } else {
      // Move agent towards target
      const speed = 2;
      this.agent.x += (dx / dist) * speed;
      this.agent.y += (dy / dist) * speed;
    }
  }

  _pickUpPhone() {
    this._phonePickedUp = true;
    this._hidePickupPrompt();
    this._log('📱 Phone', 'picked up!');
    
    // Show large mobile screen
    this._showMobileScreen();
  }

  _showPickupPrompt() {
    if (this._pickupPromptShown) return;
    this._pickupPromptShown = true;

    const { width, height } = this.scale;
    
    // Create pickup prompt container
    this._pickupPrompt = this.add.container(this._phonePos.x, this._phonePos.y - 50).setDepth(30);
    
    // Background
    const bg = this.add.rectangle(0, 0, 140, 40, 0x1e1b4b, 0.95);
    bg.setStrokeStyle(2, 0x6366f1, 1);
    
    // Text
    const txt = this.add.text(0, 0, '📱 Pick Up Phone', {
      fontFamily: FONT, fontSize: '13px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Hint text
    const hint = this.add.text(0, 16, 'Press [E]', {
      fontFamily: FONT_BODY, fontSize: '10px', color: '#a5b4fc'
    }).setOrigin(0.5);
    
    this._pickupPrompt.add([bg, txt, hint]);
    
    // Animate in
    gsap.fromTo(this._pickupPrompt, 
      { alpha: 0, y: this._phonePos.y - 40 }, 
      { alpha: 1, y: this._phonePos.y - 50, duration: 0.3, ease: 'back.out(1.5)' }
    );
    
    // Add keyboard listener for E key
    this._pickupKey = this.input.keyboard.once('keydown-E', () => {
      this._pickUpPhone();
    });
  }

  _hidePickupPrompt() {
    if (!this._pickupPromptShown) return;
    this._pickupPromptShown = false;
    
    if (this._pickupPrompt) {
      gsap.to(this._pickupPrompt, {
        alpha: 0,
        duration: 0.2,
        onComplete: () => {
          if (this._pickupPrompt) {
            this._pickupPrompt.destroy();
            this._pickupPrompt = null;
          }
        }
      });
    }
    
    // Remove keyboard listener
    if (this._pickupKey) {
      this.input.keyboard.off('keydown-E', this._pickupKey);
      this._pickupKey = null;
    }
  }

  _showMobileScreen() {
    if (this._mobileScreenOpen) return;
    this._mobileScreenOpen = true;
    this._phoneProgress = 0;
    this._scrollOffset = 0;

    const { width, height } = this.scale;
    
    // Create mobile screen container
    this._mobileScreen = this.add.container(width / 2, height / 2).setDepth(100).setAlpha(0);
    
    // Dark overlay background
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    overlay.setInteractive();
    
    // Phone device frame
    const phoneW = 340;
    const phoneH = 620;
    const phoneFrame = this.add.rectangle(0, 0, phoneW, phoneH, 0x1e1b4b, 1);
    phoneFrame.setStrokeStyle(8, 0x0f172a, 1);
    
    // Phone screen
    const screenW = phoneW - 20;
    const screenH = phoneH - 20;
    const screen = this.add.rectangle(0, 0, screenW, screenH, 0x0f172a, 1);
    
    // Status bar
    const statusBar = this.add.rectangle(0, -screenH / 2 + 20, screenW, 40, 0x1e1b4b, 1);
    const statusTime = this.add.text(-screenW / 2 + 15, -screenH / 2 + 20, '9:41', {
      fontFamily: FONT, fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    const statusIcons = this.add.text(screenW / 2 - 15, -screenH / 2 + 20, '📶 🔋', {
      fontFamily: FONT, fontSize: '14px', color: '#ffffff'
    }).setOrigin(1, 0.5);
    
    // App header
    const appHeader = this.add.rectangle(0, -screenH / 2 + 60, screenW, 50, 0x6366f1, 1);
    const appTitle = this.add.text(0, -screenH / 2 + 60, '🌐 EchoSphere', {
      fontFamily: FONT, fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Progress bar container (below header)
    const progressY = -screenH / 2 + 90;
    const progressBg = this.add.rectangle(0, progressY, screenW - 30, 8, 0x1e293b, 1);
    progressBg.setStrokeStyle(1, 0x334155, 1);
    
    this._progressBar = this.add.rectangle(-screenW / 2 + 15, progressY, 0, 6, 0xfbbf24, 1);
    this._progressBar.setOrigin(0, 0.5);
    this._progressBarMaxWidth = screenW - 30;
    
    const progressLabel = this.add.text(0, progressY - 15, 'Time Spent', {
      fontFamily: FONT_BODY, fontSize: '10px', color: '#64748b'
    }).setOrigin(0.5);
    
    // Create scrollable content container
    const contentY = -screenH / 2 + 130;
    const contentHeight = screenH - 260; // Space for header, progress, and close button
    
    // Mask for scrollable area
    const maskShape = this.make.graphics();
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(
      width / 2 - screenW / 2,
      height / 2 + contentY,
      screenW,
      contentHeight
    );
    const mask = maskShape.createGeometryMask();
    
    // Scrollable content container
    this._scrollContent = this.add.container(0, contentY);
    this._scrollContent.setMask(mask);
    
    // Generate more content items for scrolling
    const allFeedItems = [
      ...FEED_ITEMS,
      { icon: '💬', text: 'Mia commented: "This is amazing!"' },
      { icon: '❤️', text: 'Kai liked your story' },
      { icon: '🎊', text: 'You have 25 new followers!' },
      { icon: '⚡', text: 'Your post got 500 views!' },
      { icon: '🌟', text: 'Featured in trending!' },
      { icon: '💝', text: 'Someone sent you a gift' },
      { icon: '🔔', text: 'New message from Alex' },
      { icon: '🎯', text: 'You completed a challenge!' },
      { icon: '🏆', text: 'Achievement unlocked!' },
      { icon: '💫', text: 'Your story reached 1K views' },
      { icon: '🎨', text: 'New filter available!' },
      { icon: '📸', text: 'Mia tagged you in a photo' },
    ];
    
    const notifications = [];
    allFeedItems.forEach((item, i) => {
      const notifY = i * 80;
      
      // Notification card
      const card = this.add.rectangle(0, notifY, screenW - 30, 70, 0x1e1b4b, 1);
      card.setStrokeStyle(1, 0x4b5563, 0.5);
      
      // Icon
      const icon = this.add.text(-screenW / 2 + 35, notifY, item.icon, {
        fontSize: '24px'
      }).setOrigin(0.5);
      
      // Text
      const text = this.add.text(-screenW / 2 + 60, notifY, item.text, {
        fontFamily: FONT_BODY, fontSize: '13px', color: '#e2e8f0',
        wordWrap: { width: screenW - 100 }
      }).setOrigin(0, 0.5);
      
      // Time
      const timeTexts = ['now', '2m ago', '5m ago', '10m ago', '15m ago', '30m ago', '1h ago'];
      const time = this.add.text(screenW / 2 - 25, notifY - 20, timeTexts[i % timeTexts.length], {
        fontFamily: FONT_BODY, fontSize: '10px', color: '#64748b'
      }).setOrigin(1, 0.5);
      
      notifications.push(card, icon, text, time);
    });
    
    this._scrollContent.add(notifications);
    this._maxScrollOffset = Math.max(0, allFeedItems.length * 80 - contentHeight);
    
    // Scroll indicators
    const scrollHint = this.add.text(0, contentY + contentHeight / 2 + 20, '↕ Scroll with Mouse Wheel', {
      fontFamily: FONT_BODY, fontSize: '11px', color: '#475569'
    }).setOrigin(0.5);
    
    // Enable mouse wheel scrolling
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (this._mobileScreenOpen) {
        this._scrollOffset += deltaY * 0.3;
        this._scrollOffset = Phaser.Math.Clamp(this._scrollOffset, 0, this._maxScrollOffset);
        this._scrollContent.y = contentY - this._scrollOffset;
      }
    });
    
    // Close button
    const closeBtn = this.add.rectangle(0, screenH / 2 - 40, screenW - 30, 50, 0xef4444, 1);
    closeBtn.setStrokeStyle(2, 0xdc2626, 1);
    closeBtn.setInteractive({ useHandCursor: true });
    
    const closeTxt = this.add.text(0, screenH / 2 - 40, '✕ Close Phone', {
      fontFamily: FONT, fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    
    closeBtn.on('pointerdown', () => {
      this._closeMobileScreen();
    });
    
    closeBtn.on('pointerover', () => {
      closeBtn.setFillStyle(0xdc2626);
    });
    
    closeBtn.on('pointerout', () => {
      closeBtn.setFillStyle(0xef4444);
    });
    
    // Add all elements to container
    this._mobileScreen.add([
      overlay,
      phoneFrame,
      screen,
      statusBar,
      statusTime,
      statusIcons,
      appHeader,
      appTitle,
      progressBg,
      this._progressBar,
      progressLabel,
      maskShape,
      this._scrollContent,
      scrollHint,
      closeBtn,
      closeTxt
    ]);
    
    // Animate in
    gsap.to(this._mobileScreen, {
      alpha: 1,
      duration: 0.4,
      ease: 'power2.out'
    });
    
    // Scale animation
    this._mobileScreen.setScale(0.8);
    gsap.to(this._mobileScreen, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.4,
      ease: 'back.out(1.5)'
    });
    
    // Add ESC key to close
    this._closeKey = this.input.keyboard.once('keydown-ESC', () => {
      this._closeMobileScreen();
    });
    
    this._log('📱 Phone', 'screen opened - time tracking started');
  }

  _updateProgressBar() {
    if (!this._progressBar || !this._progressBarMaxWidth) return;
    
    const newWidth = (this._phoneProgress / 100) * this._progressBarMaxWidth;
    this._progressBar.width = newWidth;
    
    // Change color as progress increases
    if (this._phoneProgress < 33) {
      this._progressBar.setFillStyle(0x10b981); // Green
    } else if (this._phoneProgress < 66) {
      this._progressBar.setFillStyle(0xfbbf24); // Yellow
    } else {
      this._progressBar.setFillStyle(0xef4444); // Red
    }
  }

  _closeMobileScreen() {
    if (!this._mobileScreenOpen) return;
    
    this._log('📱 Phone', `closed at ${this._phoneProgress.toFixed(0)}% progress`);
    
    gsap.to(this._mobileScreen, {
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        if (this._mobileScreen) {
          this._mobileScreen.destroy();
          this._mobileScreen = null;
        }
        this._mobileScreenOpen = false;
        this._scrollContent = null;
        this._progressBar = null;
      }
    });
    
    // Remove ESC key listener
    if (this._closeKey) {
      this.input.keyboard.off('keydown-ESC', this._closeKey);
      this._closeKey = null;
    }
    
    // Remove wheel listener
    this.input.off('wheel');
  }

  _transitionToDistortion() {
    if (this._ended) return;
    this._ended = true;
    
    this._log('🌀 Transition', 'Moving to Scenario 2 - Distortion');
    
    // Fade out
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('DistortionScene');
    });
  }

  _reachDoor() {
    this._doorReached = true;
    this._log('🚪 Door', 'reached!');
    // TODO: Implement door reach logic
  }

  _transitionToLoop() {
    this._ended = true;
    this.scene.start('TheLoopScene');
  }
}
