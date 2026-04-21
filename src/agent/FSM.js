/**
 * FSM — Finite State Machine for the EchoSphere agent
 *
 * States:
 *   IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT → RECOVERED | PARTIAL | LOST
 *
 * Transitions are driven by EVENTS fired into the FSM, not timers alone.
 * Each state reacts differently to the same event — that's what makes it state-based.
 *
 * Events:
 *   'NOTIFICATION_SEEN'   — agent perceived a notification
 *   'NOTIFICATION_IGNORED'— notification expired without agent engaging
 *   'FRIEND_MESSAGE'      — friend sent a message
 *   'FRIEND_IGNORED'      — friend message expired without response
 *   'RANDOM_GOOD'         — positive random event (battery dies, outdoor trigger)
 *   'RANDOM_BAD'          — negative random event (viral spike, platform surge)
 *   'PLAYER_ENGAGE'       — player clicked "Engage" at a decision node
 *   'PLAYER_RESIST'       — player clicked "Resist" at a decision node
 */
export default class FSM {
  constructor(agent) {
    this.agent = agent;
    this.state = 'IDLE';
    this._timer = 0;

    // Counters that accumulate across events — drive alternative endings
    this.engageCount  = 0;  // how many times agent engaged with digital content
    this.resistCount  = 0;  // how many times agent resisted
    this.ignoredFriends = 0; // how many friend messages went unanswered

    this._listeners = []; // transition callbacks
  }

  onTransition(fn) {
    this._listeners.push(fn);
  }

  // Main per-frame tick — only handles timeout-based fallbacks
  update() {
    this._timer++;
    const e = this.agent.emotions;

    switch (this.state) {
      case 'IDLE':
        // If nothing happens for too long, agent gets curious and approaches on their own
        if (this._timer > 200) this._transition('ATTRACTED', 'timeout — curiosity');
        break;

      case 'ATTRACTED':
        // Passive happiness rise while attracted
        e.applyEvent({ happiness: 0.03 });
        // If agent has been attracted a long time with no resistance → loop forms
        if (this._timer > 600 && this.resistCount === 0) {
          this._transition('LOOPING', 'no resistance — habit forming');
        }
        break;

      case 'LOOPING':
        e.applyEvent({ stress: 0.02, loneliness: 0.015 });
        if (e.stress >= 65) this._transition('DISTORTED', 'stress threshold');
        break;

      case 'DISTORTED':
        e.applyEvent({ stress: 0.04, happiness: -0.03 });
        if (e.stress >= 85) this._transition('BREAKING_POINT', 'stress critical');
        break;

      case 'BREAKING_POINT':
        if (this._timer > 180) this._resolveOutcome();
        break;
    }
  }

  // ── Event handler — called by scene when something happens ───────────────
  handleEvent(eventName) {
    const e = this.agent.emotions;
    console.log(`[FSM:${this.state}] event → ${eventName}`);

    switch (this.state) {

      // ── IDLE: agent hasn't engaged yet ──────────────────────────────────
      case 'IDLE':
        if (eventName === 'NOTIFICATION_SEEN') {
          e.applyEvent({ happiness: 8, stress: 2 });
          this.engageCount++;
          this._transition('ATTRACTED', 'first notification caught attention');
        }
        if (eventName === 'RANDOM_GOOD') {
          // Good random event while idle — agent stays grounded longer
          e.applyEvent({ happiness: 5, loneliness: -5 });
          this._timer = 0; // reset idle timer
        }
        break;

      // ── ATTRACTED: agent is engaged, happy, exploring ───────────────────
      case 'ATTRACTED':
        if (eventName === 'NOTIFICATION_SEEN') {
          e.applyEvent({ happiness: 6, stress: 1 });
          this.engageCount++;
          // Too many engagements in a row → loop starts forming
          if (this.engageCount >= 5) {
            this._transition('LOOPING', 'repeated engagement — habit forming');
          }
        }
        if (eventName === 'NOTIFICATION_IGNORED') {
          // Agent walked past a notification — slight resistance
          this.resistCount++;
          e.applyEvent({ happiness: -2 });
        }
        if (eventName === 'FRIEND_MESSAGE') {
          // Friend message while attracted — positive, keeps agent social
          e.applyEvent({ happiness: 10, loneliness: -8 });
          this.resistCount++; // social interaction counts as resisting pure digital pull
        }
        if (eventName === 'PLAYER_RESIST') {
          e.applyEvent({ happiness: -5, loneliness: 3 });
          this.resistCount++;
          if (this.resistCount >= 3) {
            // Player actively resisting — agent snaps out early (alternative path)
            this._transition('LOOPING', 'player resisted — but loop already forming');
          }
        }
        if (eventName === 'PLAYER_ENGAGE') {
          e.applyEvent({ happiness: 8, stress: 3 });
          this.engageCount++;
          if (this.engageCount >= 4) {
            this._transition('LOOPING', 'player kept engaging — deep in loop');
          }
        }
        if (eventName === 'RANDOM_GOOD') {
          // e.g. phone battery dies — forces a break
          e.applyEvent({ stress: -5, loneliness: -5, happiness: 3 });
          this.resistCount++;
          this._timer = Math.max(0, this._timer - 150); // slow down loop formation
        }
        if (eventName === 'RANDOM_BAD') {
          // e.g. viral post — spikes engagement hard
          e.applyEvent({ happiness: 15, stress: 8 });
          this.engageCount += 2;
          if (this.engageCount >= 5) {
            this._transition('LOOPING', 'viral spike — instant loop');
          }
        }
        break;

      // ── LOOPING: habit formed, agent stuck in cycle ──────────────────────
      case 'LOOPING':
        if (eventName === 'FRIEND_MESSAGE') {
          e.applyEvent({ loneliness: -10, happiness: 5 });
          // Friend message can slow the loop if agent has been resisting
          if (this.resistCount > this.engageCount) {
            this._timer = Math.max(0, this._timer - 100);
          }
        }
        if (eventName === 'FRIEND_IGNORED') {
          this.ignoredFriends++;
          e.applyEvent({ loneliness: 12, stress: 5 });
        }
        if (eventName === 'RANDOM_GOOD') {
          e.applyEvent({ stress: -10, happiness: 5 });
          this._timer = Math.max(0, this._timer - 80);
        }
        if (eventName === 'RANDOM_BAD') {
          e.applyEvent({ stress: 15, loneliness: 8 });
        }
        if (eventName === 'PLAYER_RESIST') {
          e.applyEvent({ stress: -8, happiness: -3 });
          this.resistCount++;
        }
        break;

      // ── DISTORTED / BREAKING_POINT: handled by timer in update() ─────────
      case 'DISTORTED':
        if (eventName === 'FRIEND_MESSAGE') {
          e.applyEvent({ loneliness: -15, happiness: 8, stress: -5 });
        }
        if (eventName === 'FRIEND_IGNORED') {
          this.ignoredFriends++;
          e.applyEvent({ loneliness: 15, stress: 10 });
        }
        if (eventName === 'PLAYER_RESIST') {
          e.applyEvent({ stress: -12, happiness: 5 });
          this.resistCount++;
        }
        break;

      case 'BREAKING_POINT':
        if (eventName === 'PLAYER_RESIST') {
          e.applyEvent({ stress: -15, happiness: 10 });
          this.resistCount++;
        }
        if (eventName === 'PLAYER_ENGAGE') {
          e.applyEvent({ stress: 10, loneliness: 10 });
          this.engageCount++;
        }
        break;
    }
  }

  // ── Outcome resolution — called from BREAKING_POINT ──────────────────────
  _resolveOutcome() {
    const e = this.agent.emotions;

    // Three possible endings based on accumulated behaviour
    if (this.resistCount >= this.engageCount && e.happiness > 45) {
      this._transition('RECOVERED', 'resisted more than engaged — recovered');
    } else if (this.ignoredFriends >= 3 || e.loneliness > 70) {
      this._transition('LOST', 'too isolated — lost in the loop');
    } else {
      this._transition('PARTIAL', 'mixed behaviour — partial recovery');
    }
  }

  _transition(newState, reason = '') {
    console.log(`[FSM] ${this.state} → ${newState}${reason ? ' (' + reason + ')' : ''}`);
    this.state = newState;
    this._timer = 0;
    this._listeners.forEach(fn => fn(newState, reason));
  }
}
