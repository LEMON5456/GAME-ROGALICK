export const PERKS = [
  {
    id: 'vampire',
    name: 'Вампиризм',
    desc: '+10% восстановления HP за убийство',
    apply(run) { run.vampirism = 0.1; },
  },
  {
    id: 'miner',
    name: 'Шахтёр',
    desc: '+50% к скорости добычи',
    apply(run) { run.miningSpeedMult = 1.5; },
  },
  {
    id: 'tank',
    name: 'Танк',
    desc: '+30 HP и +5% защиты',
    apply(run) { run.maxHp += 30; run.hp += 30; run.defense = 0.05; },
  },
  {
    id: 'greed',
    name: 'Жадность',
    desc: '+20% руды с каждой жилы',
    apply(run) { run.oreBonus = 0.2; },
  },
  {
    id: 'swift',
    name: 'Скорость',
    desc: '+15% к скорости передвижения',
    apply(run) { run.speedMult = 1.15; },
  },
  {
    id: 'lucky',
    name: 'Удача',
    desc: '+20% эфирной сыворотки',
    apply(run) { run.etherMult = 1.2; },
  },
];

export function getPerk(id) {
  return PERKS.find(p => p.id === id);
}
