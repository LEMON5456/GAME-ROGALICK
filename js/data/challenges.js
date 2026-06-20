const MUTATORS = [
  {
    id: 'glass_cannon',
    name: 'Стеклянная пушка',
    desc: '×2 урон, но HP = 50',
    apply(run) { run.damageMult = 2; run.maxHp = 50; run.hp = 50; },
  },
  {
    id: 'poor',
    name: 'Бедняк',
    desc: 'Руда даёт вдвое меньше, но +3 эфира за планету',
    apply(run) { run.orePenalty = 0.5; run.etherPerPlanet = 8; },
  },
  {
    id: 'swarm',
    name: 'Рой',
    desc: 'Враги быстрее, но меньше HP',
    apply(run) { run.enemySpeedMult = 1.3; run.enemyHpMult = 0.7; },
  },
  {
    id: 'time_crisis',
    name: 'Цейтнот',
    desc: 'Таймер планет сокращён вдвое',
    apply(run) { run.timerPenalty = 0.5; },
  },
  {
    id: 'darkness',
    name: 'Тьма',
    desc: 'Освещение ослаблено, но эфира больше',
    apply(run) { run.darknessMult = 0.5; run.etherMult = 1.5; },
  },
];

export function getDailyChallenge() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const idx = seed % MUTATORS.length;
  return MUTATORS[idx];
}

export function applyMutator(run, mutator) {
  if (mutator) mutator.apply(run);
}
