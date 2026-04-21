/**
 * Tracks the agent's three core emotional dimensions.
 * Values range 0–100.
 */
export default class EmotionSystem {
  constructor() {
    this.stress = 20;
    this.happiness = 70;
    this.loneliness = 30;
  }

  update() {
    // Natural decay / drift toward baseline over time
    this.stress = this._drift(this.stress, 20, 0.01);
    this.happiness = this._drift(this.happiness, 50, 0.005);
    this.loneliness = this._drift(this.loneliness, 30, 0.005);
  }

  _drift(current, baseline, rate) {
    if (current > baseline) return Math.max(baseline, current - rate);
    if (current < baseline) return Math.min(baseline, current + rate);
    return current;
  }

  applyEvent(delta) {
    // delta: { stress, happiness, loneliness } — positive or negative
    if (delta.stress !== undefined)
      this.stress = Math.min(100, Math.max(0, this.stress + delta.stress));
    if (delta.happiness !== undefined)
      this.happiness = Math.min(100, Math.max(0, this.happiness + delta.happiness));
    if (delta.loneliness !== undefined)
      this.loneliness = Math.min(100, Math.max(0, this.loneliness + delta.loneliness));
  }
}
