export class Animation {
  constructor(frames, frameDuration = 0.15, loop = true) {
    this.frames = frames;
    this.frameDuration = frameDuration;
    this.loop = loop;
    this.time = 0;
    this.done = false;
  }

  reset() {
    this.time = 0;
    this.done = false;
  }

  update(dt) {
    if (this.done) return;
    this.time += dt;
    if (this.time >= this.frames.length * this.frameDuration) {
      if (this.loop) {
        this.time -= this.frames.length * this.frameDuration;
      } else {
        this.time = this.frames.length * this.frameDuration - 0.001;
        this.done = true;
      }
    }
  }

  getFrame() {
    const idx = Math.min(Math.floor(this.time / this.frameDuration), this.frames.length - 1);
    return this.frames[idx];
  }

}

export function getWalkFrames(spriteX, spriteY, stride = 17, count = 2) {
  const frames = [];
  for (let i = 0; i < count; i++) {
    frames.push({ x: spriteX + i * stride, y: spriteY });
  }
  return frames;
}


