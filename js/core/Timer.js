export class Timer {
  constructor(seconds) {
    this.max = seconds;
    this.remaining = seconds;
    this.elapsed = 0;
    this.active = false;
  }

  start(seconds) {
    this.max = seconds;
    this.remaining = seconds;
    this.elapsed = 0;
    this.active = true;
  }

  stop() {
    this.active = false;
  }

  update(dt) {
    if (!this.active) return false;
    this.remaining -= dt;
    this.elapsed += dt;
    if (this.remaining <= 0) {
      this.remaining = 0;
      return true;
    }
    return false;
  }

  addTime(seconds) {
    this.remaining = Math.min(this.remaining + seconds, this.max);
  }

  format() {
    const s = Math.ceil(this.remaining);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  fraction() {
    return this.max > 0 ? this.remaining / this.max : 0;
  }
}
