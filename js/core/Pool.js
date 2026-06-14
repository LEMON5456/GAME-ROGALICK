export class Pool {
  constructor(factory, resetFn, initialSize = 0) {
    this._factory = factory;
    this._reset = resetFn;
    this._pool = [];
    this._active = [];
    for (let i = 0; i < initialSize; i++) {
      this._pool.push(factory());
    }
  }

  active() {
    return this._active;
  }

  get(...args) {
    let obj = this._pool.pop();
    if (!obj) {
      obj = this._factory();
    }
    this._reset(obj, ...args);
    obj._poolIndex = this._active.length;
    this._active.push(obj);
    return obj;
  }

  release(obj) {
    obj.dead = true;
    obj._poolActive = false;
  }

  updateActive() {
    let writeIdx = 0;
    for (let i = 0; i < this._active.length; i++) {
      const obj = this._active[i];
      if (!obj.dead) {
        this._active[writeIdx] = obj;
        obj._poolIndex = writeIdx;
        writeIdx++;
      } else {
        this._pool.push(obj);
      }
    }
    this._active.length = writeIdx;
  }

  clear() {
    this._pool.push(...this._active);
    this._active.length = 0;
  }
}
