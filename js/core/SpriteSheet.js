export class SpriteSheet {
  constructor(src, frameW, frameH) {
    this.src = src;
    this.frameW = frameW;
    this.frameH = frameH;
    this.image = null;
    this.loaded = false;
    this.cols = 0;
    this.rows = 0;
    this.totalFrames = 0;
  }

  load() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.cols = Math.floor(img.width / this.frameW);
        this.rows = Math.floor(img.height / this.frameH);
        this.totalFrames = this.cols * this.rows;
        this.loaded = true;
        resolve(this);
      };
      img.onerror = () => resolve(null);
      img.src = this.src;
    });
  }

  draw(ctx, index, dx, dy, dw, dh) {
    if (!this.loaded) return false;
    const col = index % this.cols;
    const row = Math.floor(index / this.cols);
    ctx.drawImage(
      this.image,
      col * this.frameW, row * this.frameH, this.frameW, this.frameH,
      dx, dy, dw || this.frameW, dh || this.frameH
    );
    return true;
  }
}
