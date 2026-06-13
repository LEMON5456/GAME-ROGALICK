import { TILE_SIZE } from '../constants.js';

export class OreNode {
  constructor(tx, ty, type) {
    this.tx = tx;
    this.ty = ty;
    this.type = type;
    this.mined = false;
  }

  get x() {
    return this.tx * TILE_SIZE;
  }

  get y() {
    return this.ty * TILE_SIZE;
  }
}
