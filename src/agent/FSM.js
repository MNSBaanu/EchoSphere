/**
 * Finite State Machine for the EchoSphere agent.
 * States: IDLE → ATTRACTED → LOOPING → DISTORTED → BREAKING_POINT → RECOVERED | PARTIAL | LOST
 */
export default class FSM {
  constructor(agent) {
    this.agent = agent;
    this.state = 'IDLE';
    this._timer = 0;
  }

  update() {
    this._timer++;
    const e = this.agent.emotions;

    switch (this.state) {
      case 'IDLE':
        // Transition after a short delay — agent gets attracted
        if (this._timer > 180) this.transition('ATTRACTED');
        break;

      case 'ATTRACTED':
        e.happiness = Math.min(100, e.happiness + 0.05);
        if (e.happiness > 80) this.transition('LOOPING');
        break;

      case 'LOOPING':
        e.stress = Math.min(100, e.stress + 0.03);
        e.loneliness = Math.min(100, e.loneliness + 0.02);
        if (e.stress > 60) this.transition('DISTORTED');
        break;

      case 'DISTORTED':
        e.stress = Math.min(100, e.stress + 0.05);
        e.happiness = Math.max(0, e.happiness - 0.04);
        if (e.stress > 85) this.transition('BREAKING_POINT');
        break;

      case 'BREAKING_POINT':
        // Outcome determined by emotion balance
        if (this._timer > 300) {
          if (e.happiness > 50) this.transition('RECOVERED');
          else if (e.loneliness > 70) this.transition('LOST');
          else this.transition('PARTIAL');
        }
        break;

      case 'RECOVERED':
      case 'PARTIAL':
      case 'LOST':
        // Terminal states — no further transitions
        break;
    }
  }

  transition(newState) {
    console.log(`[FSM] ${this.state} → ${newState}`);
    this.state = newState;
    this._timer = 0;
  }
}
