# 8. Algorithms — Flowcharts and Pseudocode

## 8.1 Main Game Loop Algorithm

```
ALGORITHM: EchoSphere Main Loop
─────────────────────────────────────────────────────────────────
BEGIN
  INITIALISE Phaser game engine
  LOAD scenes: [Boot, Attraction, RealWorld, Learning, Trip, End]
  START BootScene

  LOOP (every frame ~16.67ms):
    IF current scene is AttractionScene:
      CALL AttractionScene.update()
    ELSE IF current scene is RealWorldScene:
      CALL RealWorldScene.update()
    ELSE IF current scene is LearningScene:
      CALL LearningScene.update()
    END IF
  END LOOP
END
```

---

## 8.2 Agent Update Algorithm

```
ALGORITHM: Agent.update()
─────────────────────────────────────────────────────────────────
BEGIN
  CALL fsm.update()           // FSM timer-based transitions
  CALL emotions.update()      // Drift emotions toward baseline
  CALL _handleInput()         // Process keyboard input
  CALL _perceive()            // Check notification proximity
  CALL _updateVisuals()       // Redraw character for current state
  CALL _syncHUD()             // Update HTML HUD elements
  CALL _updateAIVariables()   // Update addiction, hunch, memory
  
  IF perceptionCooldown > 0:
    DECREMENT perceptionCooldown
  END IF
END
```

---

## 8.3 FSM Transition Algorithm

```
ALGORITHM: FSM.handleEvent(eventName)
─────────────────────────────────────────────────────────────────
BEGIN
  SWITCH currentState:
    
    CASE 'IDLE':
      IF eventName = 'NOTIFICATION_SEEN':
        emotions.happiness += 8
        emotions.stress += 2
        engageCount++
        TRANSITION to 'ATTRACTED'
      END IF
    
    CASE 'ATTRACTED':
      IF eventName = 'NOTIFICATION_SEEN':
        emotions.happiness += 6
        engageCount++
        IF engageCount >= 5:
          TRANSITION to 'LOOPING'
        END IF
      END IF
      IF eventName = 'PLAYER_RESIST':
        resistCount++
        IF resistCount >= 3:
          TRANSITION to 'LOOPING'
        END IF
      END IF
    
    CASE 'LOOPING':
      emotions.stress += 0.02 per frame
      emotions.loneliness += 0.015 per frame
      IF emotions.stress >= 65:
        TRANSITION to 'DISTORTED'
      END IF
    
    CASE 'DISTORTED':
      emotions.stress += 0.04 per frame
      emotions.happiness -= 0.03 per frame
      IF emotions.stress >= 85:
        TRANSITION to 'BREAKING_POINT'
      END IF
    
    CASE 'BREAKING_POINT':
      IF timer > 180 frames:
        CALL _resolveOutcome()
      END IF
  
  END SWITCH
END

ALGORITHM: FSM._resolveOutcome()
─────────────────────────────────────────────────────────────────
BEGIN
  recovered = (resistCount >= engageCount) AND (happiness > 45)
  lost = (ignoredFriends >= 3) OR (loneliness > 70)
  
  IF recovered:
    TRANSITION to 'RECOVERED'
  ELSE IF lost:
    TRANSITION to 'LOST'
  ELSE:
    TRANSITION to 'PARTIAL'
  END IF
END
```

---

## 8.4 Addiction Progression Algorithm

```
ALGORITHM: AttractionScene — Phone Usage Loop
─────────────────────────────────────────────────────────────────
BEGIN
  WHILE mobileScreenOpen AND NOT ended AND NOT decisionPending:
    
    // Phone usage effects
    agent.addictionLevel += 0.15
    agent.awareness      -= 0.12
    agent.emotions.stress += 0.08
    agent.timeOnPhone++
    
    // Update progress bar
    progress = agent.addictionLevel
    barWidth = (progress / 100) × maxBarWidth
    IF progress < 33: barColour = GREEN
    ELSE IF progress < 66: barColour = YELLOW
    ELSE: barColour = RED
    
    // Auto-scroll activation
    IF addictionLevel > 50 AND NOT autoScrollEnabled:
      autoScrollEnabled = TRUE
    END IF
    
    IF autoScrollEnabled AND NOT continuousScrollMode:
      scrollSpeed = (addictionLevel - 50) / 50 × 2
      scrollOffset += scrollSpeed
      scrollOffset = CLAMP(scrollOffset, 0, maxScrollOffset)
      scrollContent.y = contentStartY - scrollOffset
    END IF
    
    // Decision triggers
    IF addictionLevel >= 70 AND NOT decisionShown:
      decisionShown = TRUE
      decisionPending = TRUE
      SHOW educational notification popup
      PAUSE loop (decisionPending = TRUE)
    END IF
    
    IF addictionLevel >= 100 AND NOT failShown:
      failShown = TRUE
      SHOW fail notification
    END IF
  
  END WHILE
END
```

---

## 8.5 Perception Algorithm (Vision Cone)

```
ALGORITHM: RealWorldScene._updatePerception()
─────────────────────────────────────────────────────────────────
BEGIN
  facingAngle = IF agent._facingRight THEN 0 ELSE π
  halfCone = DegToRad(45)  // ±45° = 90° total cone
  
  visionRange = 200  // base range in pixels
  IF timeOfDay = 'dusk':
    visionRange = visionRange × 0.55
  END IF
  IF phoneVisible AND addictionLevel > 40:
    visionRange = visionRange × 0.6
  END IF
  
  FOR EACH npc IN npcs:
    dx = npc.x - agent.x
    dy = npc.y - agent.y
    dist = SQRT(dx² + dy²)
    angleToNPC = ATAN2(dy, dx)
    angleDiff = ABS(Wrap(angleToNPC - facingAngle))
    
    canSee  = (dist < visionRange) AND (angleDiff < halfCone)
    canHear = (dist < 150)  // hearing range, omnidirectional
    
    IF (canSee OR canHear) AND NOT npc.perceived:
      npc.perceived = TRUE
      IF npc.id NOT IN learnedNPCs:
        LOG "Steve noticed [npc.name]"
      END IF
    ELSE IF NOT canSee AND NOT canHear:
      npc.perceived = FALSE
    END IF
  END FOR
END
```

---

## 8.6 NPC Seek Steering Algorithm

```
ALGORITHM: RealWorldScene._steerNPCToward(npc, targetX, targetY)
─────────────────────────────────────────────────────────────────
BEGIN
  dx = targetX - npc.x
  dy = targetY - npc.y
  dist = SQRT(dx² + dy²)
  
  IF dist < 5: RETURN  // already at target
  
  speed = NPC_WANDER_SPEED  // 0.6 px/frame
  
  // Normalise direction vector and scale by speed
  npc.x += (dx / dist) × speed
  npc.y += (dy / dist) × speed
  
  // Redraw NPC at new position
  npc.drawNPC(npc.emotion)
END

ALGORITHM: RealWorldScene._npcDecideToApproach(npc)
─────────────────────────────────────────────────────────────────
BEGIN
  IF npc.seekingPlayer OR npc.bubble: RETURN
  
  npc.seekingPlayer = TRUE
  
  REPEAT every 50ms:
    dist = Distance(agent.x, agent.y, npc.x, npc.y)
    IF dist < 80:
      STOP repeat
      npc.seekingPlayer = FALSE
      CALL _npcSpeak(npc)  // arrived — speak
    ELSE:
      CALL _steerNPCToward(npc, agent.x, agent.y)
    END IF
  END REPEAT
END
```

---

## 8.7 Learning System Algorithm

```
ALGORITHM: Agent._updateAIVariables()
─────────────────────────────────────────────────────────────────
BEGIN
  // Addiction decay when not using phone
  IF NOT hasPhone OR NOT scene.mobileScreenOpen:
    addictionLevel = MAX(0, addictionLevel - 0.02)
  END IF
  
  // Awareness recovery when not distracted
  IF NOT scene.mobileScreenOpen:
    awareness = MIN(100, awareness + 0.05)
  END IF
  
  // Hunch level based on addiction
  IF addictionLevel > 80: hunchLevel = 4
  ELSE IF addictionLevel > 60: hunchLevel = 3
  ELSE IF addictionLevel > 40: hunchLevel = 2
  ELSE IF addictionLevel > 20: hunchLevel = 1
  ELSE: hunchLevel = 0
  
  // Learning: store patterns (each stored only once)
  IF addictionLevel > 80 AND 'high_addiction' NOT IN memory:
    memory.PUSH('high_addiction')
    LOG "Agent learned: high_addiction pattern"
  END IF
  
  IF ignoredMessages >= 2 AND 'social_neglect' NOT IN memory:
    memory.PUSH('social_neglect')
    LOG "Agent learned: social_neglect pattern"
  END IF
  
  IF scrollCount > 50 AND 'compulsive_scrolling' NOT IN memory:
    memory.PUSH('compulsive_scrolling')
    LOG "Agent learned: compulsive_scrolling pattern"
  END IF
END
```

---

## 8.8 Emotion Drift Algorithm

```
ALGORITHM: EmotionSystem.update()
─────────────────────────────────────────────────────────────────
BEGIN
  // Each emotion drifts toward its baseline at a fixed rate
  stress     = DRIFT(stress,     baseline=10,  rate=0.008)
  happiness  = DRIFT(happiness,  baseline=60,  rate=0.005)
  loneliness = DRIFT(loneliness, baseline=20,  rate=0.005)
END

FUNCTION DRIFT(current, baseline, rate):
  IF current > baseline:
    RETURN MAX(baseline, current - rate)
  ELSE IF current < baseline:
    RETURN MIN(baseline, current + rate)
  ELSE:
    RETURN current
  END IF
END FUNCTION
```

---

## 8.9 Greeting Conversation Algorithm

```
ALGORITHM: RealWorldScene._startGreetings()
─────────────────────────────────────────────────────────────────
BEGIN
  conversation = [7 dialogue entries with npc, text, emotion]
  index = 0
  waiting = FALSE
  _convActive = TRUE  // block all other NPC speech
  
  SHOW hint text: "Press [T] to start conversation (0/7)"
  
  REGISTER T key handler:
    ON T pressed:
      IF ended: RETURN
      
      IF NOT waiting AND index = 0:
        CALL showMessage(0)
        index = 1
        RETURN
      END IF
      
      IF waiting:
        IF index < 7:
          CALL showMessage(index)
          index++
        ELSE:
          // All done
          waiting = FALSE
          _convActive = FALSE
          CLEAR all bubbles
          REMOVE T key handler
          AFTER 400ms: CALL _agentWalkToRoad()
        END IF
      END IF
  END REGISTER

  FUNCTION showMessage(i):
    CLEAR all NPC bubbles
    npc = FIND npc with id = conversation[i].npc
    bubble = CREATE speech bubble at (npc.x, npc.y - 110)
    npc.bubble = bubble
    npc.emotion = conversation[i].emotion
    REDRAW npc face
    UPDATE hint text: "Press [T] for next (i+1/7)"
    waiting = TRUE
  END FUNCTION
END
```
