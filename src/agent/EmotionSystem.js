/**
 * EmotionSystem — tracks stress, happiness, loneliness (0–100)
 * Active in Scenario 1: Emotional Intelligence trait
 */
export default class EmotionSystem {
  constructor() {
    this.stress    = 10;
    this.happiness = 60;
    this.loneliness = 20;
  }

  // Called every frame — values drift back toward baseline slowly
  update() {
    this.stress     = this._drift(this.stress,     10,  0.008);
    this.happiness  = this._drift(this.happiness,  60,  0.005);
    this.loneliness = this._drift(this.loneliness, 20,  0.005);
  }

  _drift(current, baseline, rate) {
    if (current > baseline) return Math.max(baseline, current - rate);
    if (current < baseline) return Math.min(baseline, current + rate);
    return current;
  }

  // Apply an emotion delta event e.g. { happiness: +15, stress: +5 }
  applyEvent(delta) {
    if (delta.stress     !== undefined) this.stress     = Math.min(100, Math.max(0, this.stress     + delta.stress));
    if (delta.happiness  !== undefined) this.happiness  = Math.min(100, Math.max(0, this.happiness  + delta.happiness));
    if (delta.loneliness !== undefined) this.loneliness = Math.min(100, Math.max(0, this.loneliness + delta.loneliness));
  }
}
