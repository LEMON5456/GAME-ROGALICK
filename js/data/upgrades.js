export const UPGRADES = [
  {
    id: 'blaster',
    name: 'Усиленный бластер',
    maxLevel: 5,
    baseCost: { iron: 8, crystal: 0 },
    costScale: { iron: 1.4, crystal: 1 },
    effectText: '+15% урона за уровень',
    apply(run) {
      run.damageMult = (run.damageMult || 1) + 0.15;
    },
  },
  {
    id: 'drill',
    name: 'Расширенный бур',
    maxLevel: 5,
    baseCost: { iron: 6, crystal: 0 },
    costScale: { iron: 1.35, crystal: 1 },
    effectText: '+12% скорость добычи за уровень',
    apply(run) {
      run.miningSpeedMult = (run.miningSpeedMult || 1) + 0.12;
    },
  },
  {
    id: 'suit',
    name: 'Усиленный скафандр',
    maxLevel: 5,
    baseCost: { iron: 0, crystal: 12 },
    costScale: { iron: 1, crystal: 1.45 },
    effectText: '+20 max HP за уровень',
    apply(run) {
      run.maxHp += 20;
      run.hp = Math.min(run.hp + 20, run.maxHp);
    },
  },
  {
    id: 'stabilizer',
    name: 'Стабилизатор',
    maxLevel: 4,
    baseCost: { iron: 0, crystal: 14 },
    costScale: { iron: 1, crystal: 1.5 },
    effectText: '+20 сек к таймеру за уровень',
    apply(run) {
      run.timerBonus = (run.timerBonus || 0) + 20;
    },
  },
  {
    id: 'multiShot',
    name: 'Дробовик',
    maxLevel: 3,
    baseCost: { iron: 10, crystal: 5 },
    costScale: { iron: 1.5, crystal: 1.4 },
    effectText: '+1 снаряд за выстрел (веер)',
    apply(run) {
      run.multiShot = (run.multiShot || 1) + 1;
    },
  },
  {
    id: 'fireRate',
    name: 'Скорострельность',
    maxLevel: 4,
    baseCost: { iron: 8, crystal: 4 },
    costScale: { iron: 1.5, crystal: 1.4 },
    effectText: '-12% к перезарядке за уровень',
    apply(run) {
      run.fireRateMult = (run.fireRateMult || 1) * 0.88;
    },
  },
  {
    id: 'homing',
    name: 'Самонаведение',
    maxLevel: 2,
    baseCost: { iron: 12, crystal: 8 },
    costScale: { iron: 1.5, crystal: 1.5 },
    effectText: 'Снаряды следуют за врагами',
    apply(run) {
      run.homing = (run.homing || 0) + 1;
    },
  },
  {
    id: 'jump',
    name: 'Реактивный ранец',
    maxLevel: 3,
    baseCost: { iron: 6, crystal: 6 },
    costScale: { iron: 1.5, crystal: 1.5 },
    effectText: '+15% к высоте прыжка за уровень',
    apply(run) {
      run.jumpMult = (run.jumpMult || 1) * 1.15;
    },
  },
];

export function getUpgradeLevel(run, id) {
  return run.upgradeLevels[id] || 0;
}

export function getUpgradeCost(upgrade, currentLevel) {
  const iron = Math.ceil(upgrade.baseCost.iron * Math.pow(upgrade.costScale.iron, currentLevel));
  const crystal = Math.ceil(upgrade.baseCost.crystal * Math.pow(upgrade.costScale.crystal, currentLevel));
  return { iron, crystal };
}

export function canAfford(run, cost) {
  return run.oreBank.iron >= cost.iron && run.oreBank.crystal >= cost.crystal;
}

export function isMaxLevel(run, upgrade) {
  return getUpgradeLevel(run, upgrade.id) >= upgrade.maxLevel;
}

export function purchaseUpgrade(run, upgrade) {
  const level = getUpgradeLevel(run, upgrade.id);
  if (level >= upgrade.maxLevel) return false;

  const cost = upgrade._cost || getUpgradeCost(upgrade, level);
  if (!canAfford(run, cost)) return false;

  run.oreBank.iron -= cost.iron;
  run.oreBank.crystal -= cost.crystal;
  upgrade.apply(run);
  run.upgradeLevels[upgrade.id] = level + 1;
  return true;
}

export function formatCost(cost) {
  const parts = [];
  if (cost.iron > 0) parts.push(`${cost.iron} Fe`);
  if (cost.crystal > 0) parts.push(`${cost.crystal} Cr`);
  return parts.join(' + ') || 'Бесплатно';
}

export function getUpgradeSummary(run, upgrade) {
  const level = getUpgradeLevel(run, upgrade.id);
  if (level === 0) return upgrade.effectText;

  switch (upgrade.id) {
    case 'blaster':
      return `Урон ×${(run.damageMult || 1).toFixed(2)} (ур. ${level}/${upgrade.maxLevel})`;
    case 'drill':
      return `Добыча ×${(run.miningSpeedMult || 1).toFixed(2)} (ур. ${level}/${upgrade.maxLevel})`;
    case 'suit':
      return `HP ${run.maxHp} (ур. ${level}/${upgrade.maxLevel})`;
    case 'stabilizer':
      return `+${run.timerBonus || 0} сек (ур. ${level}/${upgrade.maxLevel})`;
    case 'multiShot':
      return `${run.multiShot || 1} снарядов за выстрел (ур. ${level}/${upgrade.maxLevel})`;
    case 'fireRate':
      return `Перезарядка ×${(run.fireRateMult || 1).toFixed(2)} (ур. ${level}/${upgrade.maxLevel})`;
    case 'homing':
      return `Самонаведение ур. ${level}/${upgrade.maxLevel}`;
    case 'jump':
      return `Прыжок ×${(run.jumpMult || 1).toFixed(2)} (ур. ${level}/${upgrade.maxLevel})`;
    default:
      return `ур. ${level}/${upgrade.maxLevel}`;
  }
}
