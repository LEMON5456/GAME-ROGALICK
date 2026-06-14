import { Game } from './core/Game.js';
import { sprites } from './core/Sprites.js';
import { planetIcons } from './core/PlanetIcons.js';
import { effectSheets } from './core/EffectSheets.js';
import { fxSheets } from './core/FXSheets.js';

const canvas = document.getElementById('game-canvas');

const FIXED_DT = 1 / 60;
let accumulator = 0;
let lastTime = performance.now();
let game = null;

function loop(now) {
  if (!game) return;
  const frameTime = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  accumulator += frameTime;

  while (accumulator >= FIXED_DT) {
    game.update(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  game.render(FIXED_DT);
  requestAnimationFrame(loop);
}

Promise.all([sprites.load(), planetIcons.load(), effectSheets.load(), fxSheets.load()]).catch(() => {}).then(() => {
  game = new Game(canvas);
  window.addEventListener('resize', () => game?.resize());
  requestAnimationFrame(loop);
});
