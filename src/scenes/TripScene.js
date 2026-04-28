import Phaser from "phaser";
import { gsap } from "gsap";

const FONT = "Inter, sans-serif";

/**
 * TripScene — Driving simulation (top-down view)
 * Features:
 * - Car driving with acceleration/deceleration
 * - Pick up friend along the way
 * - Reach destination to complete the trip
 * - Simple road with scenery
 */
export default class TripScene extends Phaser.Scene {
  constructor() {
    super({ key: "TripScene" });
    this._ended = false;
    this._carSpeed = 0;
    this._maxSpeed = 5;
    this._acceleration = 0.15;
    this._deceleration = 0.08;
    this._turnSpeed = 0.05;
    this._roadScroll = 0;
    this._distanceTraveled = 0;
    this._destinationLocation = 1200; // Distance to destination
    
    // Friend houses along the route
    this._friendHouses = [
      { name: "Jordan", location: 250, pickedUp: false, emoji: "👤", color: 0xfbbf24 },
      { name: "Taylor", location: 500, pickedUp: false, emoji: "👥", color: 0xa78bfa },
      { name: "Casey", location: 750, pickedUp: false, emoji: "🙋", color: 0xf472b6 }
    ];
    
    this._passengers = [];
    this._currentHousePrompt = null;
  }

  init(data) {
    this._addictionLevel = data.addictionLevel ?? 0;
    this._awareness = data.awareness ?? 70;
    this._relationshipLevel = data.relationshipLevel ?? 50;
  }

  create() {
    const { width, height } = this.scale;
    this._w = width;
    this._h = height;

    this.cameras.main.fadeIn(800, 135, 206, 235);

    // ── Background (sky) ──────────────────────────────────────────────────
    this._drawBackground(width, height);

    // ── Road ──────────────────────────────────────────────────────────────
    this._roadGraphics = this.add.graphics().setDepth(1);
    this._drawRoad();

    // ── Scenery (trees, buildings) ────────────────────────────────────────
    this._sceneryContainer = this.add.container(0, 0).setDepth(2);
    this._createScenery();

    // ── Car (player's vehicle) ────────────────────────────────────────────
    this._carX = width / 2;
    this._carY = height * 0.7;
    this._carAngle = 0;
    this._carGraphics = this.add.graphics().setDepth(10);
    this._drawCar();

    // ── Mini-map ──────────────────────────────────────────────────────────
    this._createMiniMap();

    // ── Passengers container ──────────────────────────────────────────────
    this._createInitialPassengers();

    // ── Friend houses along the route ─────────────────────────────────────
    this._houseMarkers = [];
    this._createHouseMarkers();

    // ── Destination marker ────────────────────────────────────────────────
    this._destinationMarker = null;
    this._createDestinationMarker();

    // ── Top bar ───────────────────────────────────────────────────────────
    const topBar = this.add.graphics().setDepth(20);
    topBar.fillStyle(0x14532d, 1);
    topBar.fillRect(0, 0, width, 52);

    this.add.text(24, 14, "🚗  Road Trip", {
      fontFamily: FONT, fontSize: "22px", fontStyle: "bold", color: "#ffffff"
    }).setDepth(21);

    this.add.text(width / 2, 14, "DRIVING TO THE LAKE", {
      fontFamily: FONT, fontSize: "16px", color: "#86efac", fontStyle: "bold"
    }).setOrigin(0.5, 0).setDepth(21);

    // ── HUD ───────────────────────────────────────────────────────────────
    this._speedText = this.add.text(width - 24, 70, "Speed: 0 mph", {
      fontFamily: FONT, fontSize: "14px", color: "#ffffff",
      backgroundColor: "#00000099", padding: { x: 8, y: 4 }
    }).setOrigin(1, 0).setDepth(21);

    this._distanceText = this.add.text(width - 24, 95, "Distance: 0 mi", {
      fontFamily: FONT, fontSize: "14px", color: "#ffffff",
      backgroundColor: "#00000099", padding: { x: 8, y: 4 }
    }).setOrigin(1, 0).setDepth(21);

    this._statusText = this.add.text(width / 2, 70, "", {
      fontFamily: FONT, fontSize: "16px", color: "#4ade80",
      backgroundColor: "#00000099", padding: { x: 12, y: 6 }
    }).setOrigin(0.5, 0).setDepth(21).setVisible(false);

    // ── Controls hint ─────────────────────────────────────────────────────
    this._controlsHint = this.add.text(width / 2, height - 40, "↑ Accelerate  |  ↓ Brake  |  ← → Steer  |  [SPACE] Stop at house", {
      fontFamily: FONT, fontSize: "14px", color: "#ffffff",
      backgroundColor: "#00000099", padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setDepth(21);

    this.tweens.add({
      targets: this._controlsHint,
      alpha: 0,
      delay: 6000,
      duration: 1000
    });

    // ── Keyboard input ────────────────────────────────────────────────────
    this._keys = this.input.keyboard.createCursorKeys();
    this._spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // ── Welcome message ───────────────────────────────────────────────────
    this._showMessage("Let's hit the road! 🚗💨", 3000);
  }

  update() {
    if (this._ended) return;

    this._handleCarControls();
    this._updateRoad();
    this._updateScenery();
    this._updateCar();
    this._updateMarkers();
    this._updateMiniMapCar();
    this._updateHUD();
    this._checkHouseProximity();
    this._checkDestination();
  }

  // ── Background ────────────────────────────────────────────────────────────
  _drawBackground(width, height) {
    const g = this.add.graphics().setDepth(0);
    
    // Sky gradient
    g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xe0f2fe, 0xe0f2fe, 1);
    g.fillRect(0, 0, width, height);

    // Clouds
    [[0.2, 0.15], [0.5, 0.1], [0.8, 0.18]].forEach(([cx, cy]) => {
      g.fillStyle(0xffffff, 0.8);
      g.fillEllipse(width * cx, height * cy, 100, 40);
      g.fillEllipse(width * cx + 30, height * cy - 8, 70, 30);
    });

    // Sun
    g.fillStyle(0xffd700, 1);
    g.fillCircle(width * 0.85, height * 0.12, 35);
    g.fillStyle(0xffd700, 0.3);
    g.fillCircle(width * 0.85, height * 0.12, 45);
  }

  // ── Road ──────────────────────────────────────────────────────────────────
  _drawRoad() {
    const g = this._roadGraphics;
    g.clear();

    const { _w: W, _h: H } = this;
    const roadWidth = 280;
    const roadX = W / 2 - roadWidth / 2;

    // Road surface
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(roadX, 0, roadWidth, H);

    // Road edges
    g.fillStyle(0xffffff, 1);
    g.fillRect(roadX - 4, 0, 4, H);
    g.fillRect(roadX + roadWidth, 0, 4, H);

    // Center dashed line
    g.fillStyle(0xffff00, 1);
    const dashHeight = 30;
    const dashGap = 20;
    for (let y = this._roadScroll % (dashHeight + dashGap); y < H; y += dashHeight + dashGap) {
      g.fillRect(W / 2 - 2, y, 4, dashHeight);
    }

    // Grass on sides
    g.fillStyle(0x4ade80, 1);
    g.fillRect(0, 0, roadX - 4, H);
    g.fillRect(roadX + roadWidth + 4, 0, W - (roadX + roadWidth + 4), H);
  }

  // ── Scenery (trees, buildings) ────────────────────────────────────────────
  _createScenery() {
    // Trees and buildings will scroll past
    this._sceneryItems = [];
    
    for (let i = 0; i < 15; i++) {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      const type = Math.random() > 0.7 ? 'building' : 'tree';
      const y = i * 120 - 200;
      
      const item = {
        type,
        side,
        y,
        graphics: this.add.graphics().setDepth(2)
      };
      
      this._drawSceneryItem(item);
      this._sceneryItems.push(item);
      this._sceneryContainer.add(item.graphics);
    }
  }

  _drawSceneryItem(item) {
    const g = item.graphics;
    g.clear();

    const { _w: W } = this;
    const roadWidth = 280;
    const roadX = W / 2 - roadWidth / 2;
    
    const x = item.side === 'left' ? roadX - 60 : roadX + roadWidth + 60;

    if (item.type === 'tree') {
      // Tree trunk
      g.fillStyle(0x6b4226, 1);
      g.fillRect(x - 6, item.y, 12, 30);
      // Tree foliage
      g.fillStyle(0x16a34a, 1);
      g.fillCircle(x, item.y - 10, 25);
      g.fillCircle(x - 12, item.y + 5, 18);
      g.fillCircle(x + 12, item.y + 5, 18);
    } else {
      // Building
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(x - 20, item.y - 40, 40, 60);
      // Windows
      g.fillStyle(0x60a5fa, 0.8);
      g.fillRect(x - 12, item.y - 30, 8, 10);
      g.fillRect(x + 4, item.y - 30, 8, 10);
      g.fillRect(x - 12, item.y - 15, 8, 10);
      g.fillRect(x + 4, item.y - 15, 8, 10);
      // Door
      g.fillStyle(0x8b4513, 1);
      g.fillRect(x - 6, item.y + 5, 12, 15);
    }
  }

  _updateScenery() {
    this._sceneryItems.forEach(item => {
      item.y += this._carSpeed;
      
      // Recycle scenery items
      if (item.y > this._h + 100) {
        item.y = -100;
        item.side = Math.random() > 0.5 ? 'left' : 'right';
        item.type = Math.random() > 0.7 ? 'building' : 'tree';
      }
      
      this._drawSceneryItem(item);
    });
  }

  // ── Car controls ──────────────────────────────────────────────────────────
  _handleCarControls() {
    const k = this._keys;

    // Acceleration
    if (k.up.isDown) {
      this._carSpeed = Math.min(this._maxSpeed, this._carSpeed + this._acceleration);
    } else if (k.down.isDown) {
      // Braking
      this._carSpeed = Math.max(0, this._carSpeed - this._deceleration * 2);
    } else {
      // Natural deceleration
      this._carSpeed = Math.max(0, this._carSpeed - this._deceleration * 0.3);
    }

    // Steering (only when moving)
    if (this._carSpeed > 0.5) {
      const roadWidth = 280;
      const roadX = this._w / 2 - roadWidth / 2;
      const minX = roadX + 40;
      const maxX = roadX + roadWidth - 40;

      if (k.left.isDown) {
        this._carX = Math.max(minX, this._carX - 3);
        this._carAngle = -0.1;
      } else if (k.right.isDown) {
        this._carX = Math.min(maxX, this._carX + 3);
        this._carAngle = 0.1;
      } else {
        this._carAngle = 0;
      }
    }

    // Update distance traveled
    this._distanceTraveled += this._carSpeed * 0.1;
  }

  // ── Car drawing ───────────────────────────────────────────────────────────
  _drawCar() {
    const g = this._carGraphics;
    g.clear();

    const x = this._carX;
    const y = this._carY;

    // Shadow
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(x, y + 35, 40, 15);

    // ── PROPER CAR SHAPE (top-down view) ──────────────────────────────────
    
    // Car body (main rectangle)
    g.fillStyle(0x3b82f6, 1);
    g.fillRoundedRect(x - 25, y - 30, 50, 60, 8);

    // Car roof/windshield (darker blue, smaller)
    g.fillStyle(0x1e40af, 1);
    g.fillRoundedRect(x - 20, y - 20, 40, 20, 6);

    // Windshield glass (light blue, transparent)
    g.fillStyle(0x93c5fd, 0.6);
    g.fillRoundedRect(x - 16, y - 18, 32, 16, 4);

    // Rear window
    g.fillStyle(0x93c5fd, 0.6);
    g.fillRoundedRect(x - 16, y + 5, 32, 12, 4);

    // Wheels (4 corners)
    g.fillStyle(0x1e293b, 1);
    g.fillCircle(x - 20, y - 18, 7);
    g.fillCircle(x + 20, y - 18, 7);
    g.fillCircle(x - 20, y + 18, 7);
    g.fillCircle(x + 20, y + 18, 7);

    // Wheel rims (lighter gray)
    g.fillStyle(0x64748b, 1);
    g.fillCircle(x - 20, y - 18, 4);
    g.fillCircle(x + 20, y - 18, 4);
    g.fillCircle(x - 20, y + 18, 4);
    g.fillCircle(x + 20, y + 18, 4);

    // Headlights (front of car - top)
    g.fillStyle(0xfef08a, 1);
    g.fillCircle(x - 12, y - 32, 4);
    g.fillCircle(x + 12, y - 32, 4);

    // Tail lights (back of car - bottom)
    g.fillStyle(0xef4444, 1);
    g.fillCircle(x - 12, y + 32, 3);
    g.fillCircle(x + 12, y + 32, 3);

    // Side mirrors
    g.fillStyle(0x1e40af, 1);
    g.fillRect(x - 28, y - 5, 6, 10);
    g.fillRect(x + 22, y - 5, 6, 10);

    // Hood detail (racing stripe)
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(x - 3, y - 30, 6, 25);

    // Apply rotation (for steering effect)
    this._carGraphics.setRotation(this._carAngle);
    this._carGraphics.setPosition(x, y);
  }

  _updateCar() {
    this._drawCar();
  }

  // ── Road scrolling ────────────────────────────────────────────────────────
  _updateRoad() {
    this._roadScroll += this._carSpeed;
    this._drawRoad();
  }

  // ── Initial passengers (family members) ───────────────────────────────────
  _createInitialPassengers() {
    const passengers = [
      { name: "Mom", emoji: "👩", color: 0xe879a0 },
      { name: "Sam", emoji: "🧒", color: 0x4ade80 },
      { name: "Alex", emoji: "👦", color: 0x38bdf8 }
    ];

    passengers.forEach((p, i) => {
      this._passengers.push(p);
    });
  }

  // ── House markers with friends ────────────────────────────────────────────
  _createHouseMarkers() {
    const { _w: W } = this;
    const roadWidth = 280;
    const roadX = W / 2 - roadWidth / 2;

    this._friendHouses.forEach((friend, index) => {
      const side = index % 2 === 0 ? 'left' : 'right';
      const houseX = side === 'left' ? roadX - 70 : roadX + roadWidth + 70;
      
      const marker = this.add.container(houseX, -200).setDepth(5);
      
      // House
      const g = this.add.graphics();
      
      // House body
      g.fillStyle(0xfbbf24, 1);
      g.fillRect(-30, -40, 60, 60);
      
      // Roof
      g.fillStyle(0xdc2626, 1);
      g.beginPath();
      g.moveTo(-35, -40);
      g.lineTo(0, -65);
      g.lineTo(35, -40);
      g.closePath();
      g.fillPath();
      
      // Door
      g.fillStyle(0x8b4513, 1);
      g.fillRect(-10, -5, 20, 25);
      
      // Windows
      g.fillStyle(0x60a5fa, 0.8);
      g.fillRect(-22, -30, 12, 12);
      g.fillRect(10, -30, 12, 12);
      
      // Friend waving at window
      const friendText = this.add.text(0, -24, friend.emoji, {
        fontSize: "20px"
      }).setOrigin(0.5);
      
      // Name sign
      const nameSign = this.add.text(0, 30, friend.name, {
        fontFamily: FONT, fontSize: "12px", color: "#ffffff",
        backgroundColor: "#00000099", padding: { x: 6, y: 3 }
      }).setOrigin(0.5);
      
      marker.add([g, friendText, nameSign]);
      marker.friendData = friend;
      marker.side = side;
      
      this._houseMarkers.push(marker);
    });
  }

  _updateMarkers() {
    // Update house markers
    this._houseMarkers.forEach(marker => {
      if (!marker.friendData.pickedUp) {
        const houseY = this._h * 0.5 - (this._distanceTraveled - marker.friendData.location) * 2;
        marker.setY(houseY);
        marker.setVisible(houseY > -100 && houseY < this._h + 100);
      } else {
        marker.setVisible(false);
      }
    });

    // Update destination marker
    if (this._destinationMarker) {
      const destY = this._h * 0.3 - (this._distanceTraveled - this._destinationLocation) * 2;
      this._destinationMarker.setY(destY);
      this._destinationMarker.setVisible(destY > -100 && destY < this._h + 100);
    }
  }

  // ── Mini-map ──────────────────────────────────────────────────────────────
  _createMiniMap() {
    const { _w: W } = this;
    const mapWidth = 200;
    const mapHeight = 300;
    const mapX = W - mapWidth - 20;
    const mapY = 120;

    // Container for mini-map
    this._miniMapContainer = this.add.container(mapX, mapY).setDepth(22);

    // Background
    const bg = this.add.rectangle(0, 0, mapWidth, mapHeight, 0x000000, 0.7);
    bg.setStrokeStyle(3, 0x4ade80, 1);

    // Title
    const title = this.add.text(0, -mapHeight / 2 + 15, "📍 ROUTE MAP", {
      fontFamily: FONT, fontSize: "14px", color: "#4ade80", fontStyle: "bold"
    }).setOrigin(0.5);

    // Road line (vertical)
    const roadLine = this.add.graphics();
    roadLine.lineStyle(8, 0x94a3b8, 1);
    roadLine.lineBetween(0, -mapHeight / 2 + 40, 0, mapHeight / 2 - 20);

    // Road center dashes
    const dashes = this.add.graphics();
    dashes.lineStyle(2, 0xfbbf24, 1);
    for (let i = -mapHeight / 2 + 40; i < mapHeight / 2 - 20; i += 20) {
      dashes.lineBetween(0, i, 0, i + 10);
    }

    this._miniMapContainer.add([bg, title, roadLine, dashes]);

    // Calculate scale for map (total distance to pixels)
    const totalDistance = this._destinationLocation;
    const mapRoadHeight = mapHeight - 60; // Available height for road
    this._mapScale = mapRoadHeight / totalDistance;

    // Add friend house markers on map
    this._miniMapFriendMarkers = [];
    this._friendHouses.forEach((friend, index) => {
      const markerY = -mapHeight / 2 + 40 + (friend.location * this._mapScale);
      
      const marker = this.add.container(0, markerY);
      
      // House icon
      const houseIcon = this.add.graphics();
      houseIcon.fillStyle(friend.color, 1);
      houseIcon.fillRect(-8, -8, 16, 16);
      houseIcon.fillStyle(0xdc2626, 1);
      houseIcon.beginPath();
      houseIcon.moveTo(-10, -8);
      houseIcon.lineTo(0, -14);
      houseIcon.lineTo(10, -8);
      houseIcon.closePath();
      houseIcon.fillPath();

      // Friend emoji
      const emoji = this.add.text(0, -6, friend.emoji, {
        fontSize: "10px"
      }).setOrigin(0.5);

      // Name label
      const nameLabel = this.add.text(20, 0, friend.name, {
        fontFamily: FONT, fontSize: "10px", color: "#ffffff",
        backgroundColor: "#00000099", padding: { x: 4, y: 2 }
      }).setOrigin(0, 0.5);

      marker.add([houseIcon, emoji, nameLabel]);
      marker.friendData = friend;
      
      this._miniMapContainer.add(marker);
      this._miniMapFriendMarkers.push(marker);
    });

    // Destination marker on map
    const destY = -mapHeight / 2 + 40 + (this._destinationLocation * this._mapScale);
    const destMarker = this.add.container(0, destY);
    
    const destIcon = this.add.graphics();
    destIcon.fillStyle(0x60a5fa, 1);
    destIcon.fillCircle(0, 0, 10);
    destIcon.fillStyle(0x16a34a, 1);
    destIcon.fillCircle(-3, -2, 3);
    destIcon.fillCircle(3, 1, 3);
    
    const destLabel = this.add.text(20, 0, "🏞️ Lake", {
      fontFamily: FONT, fontSize: "10px", color: "#4ade80",
      backgroundColor: "#00000099", padding: { x: 4, y: 2 }
    }).setOrigin(0, 0.5);
    
    destMarker.add([destIcon, destLabel]);
    this._miniMapContainer.add(destMarker);

    // Car position indicator (moves with progress)
    this._miniMapCar = this.add.graphics();
    this._miniMapCar.fillStyle(0x3b82f6, 1);
    this._miniMapCar.fillCircle(0, 0, 6);
    this._miniMapCar.fillStyle(0xfef08a, 1);
    this._miniMapCar.fillCircle(0, -3, 2);
    
    this._miniMapContainer.add(this._miniMapCar);

    // Update car position on map
    this._updateMiniMapCar();
  }

  _updateMiniMapCar() {
    if (!this._miniMapCar) return;
    
    const mapHeight = 300;
    const progress = this._distanceTraveled / this._destinationLocation;
    const carY = -mapHeight / 2 + 40 + (this._distanceTraveled * this._mapScale);
    
    // Clamp to map bounds
    const minY = -mapHeight / 2 + 40;
    const maxY = mapHeight / 2 - 20;
    const clampedY = Phaser.Math.Clamp(carY, minY, maxY);
    
    this._miniMapCar.setPosition(0, clampedY);

    // Update friend markers (gray out if picked up)
    this._miniMapFriendMarkers.forEach(marker => {
      if (marker.friendData.pickedUp) {
        marker.setAlpha(0.3);
        // Add checkmark
        if (!marker._checkmark) {
          marker._checkmark = this.add.text(0, 0, "✓", {
            fontSize: "16px", color: "#4ade80", fontStyle: "bold"
          }).setOrigin(0.5);
          marker.add(marker._checkmark);
        }
      }
    });
  }

  // ── Destination marker ────────────────────────────────────────────────────
  _createDestinationMarker() {
    const { _w: W } = this;

    this._destinationMarker = this.add.container(W / 2, -200).setDepth(5);

    // Lake/destination visual
    const g = this.add.graphics();
    g.fillStyle(0x60a5fa, 1);
    g.fillCircle(0, 0, 40); // Lake
    g.fillStyle(0x93c5fd, 0.5);
    g.fillCircle(-10, -5, 15);
    g.fillCircle(10, 5, 12);

    // Trees around lake
    g.fillStyle(0x16a34a, 1);
    g.fillCircle(-35, -10, 12);
    g.fillCircle(35, -10, 12);
    g.fillCircle(-30, 15, 10);
    g.fillCircle(30, 15, 10);

    const signText = this.add.text(0, -70, "🏞️ Lake Destination", {
      fontFamily: FONT, fontSize: "16px", color: "#ffffff",
      backgroundColor: "#16a34a", padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    this._destinationMarker.add([g, signText]);
  }

  // ── Check house proximity and handle stopping ────────────────────────────
  _checkHouseProximity() {
    this._friendHouses.forEach((friend, index) => {
      if (friend.pickedUp) return;

      const distanceToHouse = Math.abs(this._distanceTraveled - friend.location);

      // Show prompt when near house
      if (distanceToHouse < 15 && distanceToHouse > 5) {
        if (!this._currentHousePrompt || this._currentHousePrompt.friendIndex !== index) {
          this._showHousePrompt(friend, index);
        }
      } else if (distanceToHouse >= 15 || distanceToHouse <= 5) {
        if (this._currentHousePrompt && this._currentHousePrompt.friendIndex === index) {
          this._hideHousePrompt();
        }
      }

      // Check if stopped at house (speed is 0 and very close)
      if (distanceToHouse < 8 && this._carSpeed < 0.5 && Phaser.Input.Keyboard.JustDown(this._spaceKey)) {
        this._pickupFriend(friend, index);
      }

      // Missed the house
      if (this._distanceTraveled > friend.location + 20 && !friend.pickedUp) {
        friend.missed = true;
        if (this._currentHousePrompt && this._currentHousePrompt.friendIndex === index) {
          this._hideHousePrompt();
        }
      }
    });
  }

  _showHousePrompt(friend, index) {
    this._hideHousePrompt(); // Clear any existing prompt

    const { _w: W, _h: H } = this;
    
    this._currentHousePrompt = this.add.container(W / 2, H / 2 - 100).setDepth(25);
    this._currentHousePrompt.friendIndex = index;

    const bg = this.add.rectangle(0, 0, 400, 80, 0x000000, 0.9);
    bg.setStrokeStyle(3, 0xfbbf24, 1);

    const text = this.add.text(0, -15, `${friend.emoji} ${friend.name}'s house ahead!`, {
      fontFamily: FONT, fontSize: "18px", color: "#ffffff", fontStyle: "bold"
    }).setOrigin(0.5);

    const instruction = this.add.text(0, 15, "Press [SPACE] to stop and pick them up!", {
      fontFamily: FONT, fontSize: "14px", color: "#fbbf24"
    }).setOrigin(0.5);

    this._currentHousePrompt.add([bg, text, instruction]);

    // Pulse animation
    this.tweens.add({
      targets: this._currentHousePrompt,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  _hideHousePrompt() {
    if (this._currentHousePrompt) {
      this._currentHousePrompt.destroy();
      this._currentHousePrompt = null;
    }
  }

  _pickupFriend(friend, index) {
    friend.pickedUp = true;
    this._passengers.push({ name: friend.name, emoji: friend.emoji, color: friend.color });

    // Hide prompt
    this._hideHousePrompt();

    // Hide house marker
    const marker = this._houseMarkers[index];
    if (marker) {
      gsap.to(marker, {
        alpha: 0,
        duration: 0.5,
        onComplete: () => marker.setVisible(false)
      });
    }

    // Show pickup message
    this._showMessage(`🎉 ${friend.name} joined the trip!`, 3000);

    // Brief pause (car stopped)
    const originalSpeed = this._carSpeed;
    this._carSpeed = 0;
    
    this.time.delayedCall(1500, () => {
      // Resume driving
      this._carSpeed = originalSpeed * 0.5; // Start slower
    });
  }

  // ── Check destination ─────────────────────────────────────────────────────
  _checkDestination() {
    const distanceToDestination = Math.abs(this._distanceTraveled - this._destinationLocation);

    if (distanceToDestination < 5 && !this._reachedDestination) {
      this._reachedDestination = true;
      this._endTrip();
    }
  }

  // ── HUD update ────────────────────────────────────────────────────────────
  _updateHUD() {
    const speedMph = Math.round(this._carSpeed * 15);
    this._speedText.setText(`Speed: ${speedMph} mph`);

    const distanceMi = Math.round(this._distanceTraveled / 10);
    this._distanceText.setText(`Distance: ${distanceMi} mi`);
  }

  // ── Show message ──────────────────────────────────────────────────────────
  _showMessage(text, duration) {
    this._statusText.setText(text);
    this._statusText.setVisible(true);
    this._statusText.setAlpha(1);

    this.tweens.add({
      targets: this._statusText,
      alpha: 0,
      delay: duration - 500,
      duration: 500,
      onComplete: () => this._statusText.setVisible(false)
    });
  }

  // ── End trip ──────────────────────────────────────────────────────────────
  _endTrip() {
    if (this._ended) return;
    this._ended = true;

    // Hide any prompts
    this._hideHousePrompt();

    // Slow down car
    this.tweens.add({
      targets: this,
      _carSpeed: 0,
      duration: 2000,
      ease: "Power2"
    });

    const { _w: W, _h: H } = this;

    // Calculate how many friends joined
    const pickedUpCount = this._friendHouses.filter(f => f.pickedUp).length;
    const totalFriends = this._friendHouses.length;
    const missedCount = totalFriends - pickedUpCount;

    // Show completion card
    this.time.delayedCall(1000, () => {
      const card = this.add.container(W / 2, H / 2).setDepth(50);
      const bg = this.add.rectangle(0, 0, 560, 280, 0x000000, 0.92);
      bg.setStrokeStyle(3, 0x4ade80, 1);

      const title = this.add.text(0, -100, "🏞️ We Made It to the Lake!", {
        fontFamily: FONT, fontSize: "32px", fontStyle: "bold", color: "#4ade80"
      }).setOrigin(0.5);

      const sub = this.add.text(0, -50, "The road trip is complete!", {
        fontFamily: FONT, fontSize: "16px", color: "#e2e8f0",
        wordWrap: { width: 520 }, align: "center"
      }).setOrigin(0.5);

      // Passenger list
      const passengerNames = this._passengers.map(p => p.emoji + " " + p.name).join(", ");
      const passengers = this.add.text(0, -10, 
        `Passengers: ${passengerNames}`, {
        fontFamily: FONT, fontSize: "14px", color: "#86efac",
        wordWrap: { width: 520 }, align: "center"
      }).setOrigin(0.5);

      // Trip stats
      const stats = this.add.text(0, 30, 
        `Distance: ${Math.round(this._distanceTraveled / 10)} miles`, {
        fontFamily: FONT, fontSize: "12px", color: "#94a3b8"
      }).setOrigin(0.5);

      // Friends picked up / missed
      let friendStatus = "";
      if (pickedUpCount === totalFriends) {
        friendStatus = "🌟 Everyone joined! Perfect trip!";
      } else if (pickedUpCount > 0) {
        friendStatus = `✅ Picked up ${pickedUpCount} friend${pickedUpCount > 1 ? 's' : ''} | ❌ Missed ${missedCount}`;
      } else {
        friendStatus = "😔 No friends picked up along the way...";
      }

      const friendText = this.add.text(0, 60, friendStatus, {
        fontFamily: FONT, fontSize: "14px", color: pickedUpCount === totalFriends ? "#fbbf24" : "#94a3b8",
        fontStyle: pickedUpCount === totalFriends ? "bold" : "normal"
      }).setOrigin(0.5);

      const conclusion = this.add.text(0, 95, 
        "Time well spent together! 💚", {
        fontFamily: FONT, fontSize: "14px", color: "#4ade80", fontStyle: "italic"
      }).setOrigin(0.5);

      card.add([bg, title, sub, passengers, stats, friendText, conclusion]);

      gsap.fromTo(card, 
        { alpha: 0, scale: 0.8 }, 
        { alpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)" }
      );

      // End scene after showing results
      this.time.delayedCall(6000, () => {
        this.cameras.main.fadeOut(1000, 135, 206, 235);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          // Trip complete - show final message
          this._showFinalScreen();
        });
      });
    });
  }

  // ── Final completion screen ──────────────────────────────────────────────
  _showFinalScreen() {
    // Create a simple completion scene
    const { width, height } = this.scale;
    
    this.cameras.main.setBackgroundColor(0x87ceeb);
    
    const finalText = this.add.text(width / 2, height / 2 - 50, "🎉 Trip Complete! 🎉", {
      fontFamily: FONT, fontSize: "48px", fontStyle: "bold", color: "#ffffff",
      stroke: "#000000", strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);

    const subText = this.add.text(width / 2, height / 2 + 20, "Thanks for playing EchoSphere!", {
      fontFamily: FONT, fontSize: "24px", color: "#ffffff"
    }).setOrigin(0.5).setDepth(100);

    const restartText = this.add.text(width / 2, height / 2 + 80, "Press [R] to restart or close the window", {
      fontFamily: FONT, fontSize: "16px", color: "#e2e8f0",
      backgroundColor: "#00000099", padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setDepth(100);

    // Fade in
    this.cameras.main.fadeIn(1000, 135, 206, 235);

    // Restart option
    this.input.keyboard.once("keydown-R", () => {
      this.scene.start("BootScene");
    });
  }
}
