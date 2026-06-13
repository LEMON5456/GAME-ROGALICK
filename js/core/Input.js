export class Input {
  constructor(canvas) {
    this.keys = {};
    this._prevKeyJ = false;
    this.mouse = { x: 0, y: 0, down: false, clicked: false };
    this.canvas = canvas;

    const onKeyDown = (e) => {
      this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };

    const onKeyUp = (e) => {
      this.keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const releaseMouse = () => {
      this.mouse.down = false;
    };

    const resetAll = () => {
      this.keys = {};
      releaseMouse();
    };

    window.addEventListener('mouseup', releaseMouse);
    window.addEventListener('pointerup', releaseMouse);
    window.addEventListener('pointercancel', releaseMouse);
    window.addEventListener('blur', resetAll);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) resetAll();
    });

    canvas.setAttribute('tabindex', '0');
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        canvas.focus();
        this.mouse.down = true;
        this.mouse.clicked = true;
      }
    });
    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) releaseMouse();
    });
    canvas.addEventListener('mouseleave', releaseMouse);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      this.mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    });
  }

  isDown(code) {
    return !!this.keys[code];
  }

  escapePressed() {
    return this.isDown('Escape');
  }

  left() {
    return this.isDown('KeyA') || this.isDown('ArrowLeft');
  }

  right() {
    return this.isDown('KeyD') || this.isDown('ArrowRight');
  }

  jump() {
    return this.isDown('Space') || this.isDown('ArrowUp') || this.isDown('KeyW');
  }

  action() {
    return this.isDown('KeyE') || this.isDown('KeyU') || this.isDown('KeyF');
  }

  /** Зажатая кнопка стрельбы (ЛКМ или J) */
  fireHeld() {
    return this.isDown('KeyJ') || this.mouse.down;
  }

  /** Один выстрел за нажатие — для клавиши J / клика */
  firePressed() {
    return (this.isDown('KeyJ') && !this._prevKeyJ) || this.mouse.clicked;
  }

  endFrame() {
    this._prevKeyJ = this.isDown('KeyJ');
    this.mouse.clicked = false;
  }
}
