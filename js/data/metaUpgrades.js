export const META_UPGRADES = [
  {
    id: 'startingHp',
    name: 'Укреплённый организм',
    description: 'Каждый уровень даёт +10 к стартовому HP',
    maxLevel: 3,
    baseCost: 10,
    costScale: 1.6,
  },
  {
    id: 'miningEfficiency',
    name: 'Эффективная добыча',
    description: '+5% к скорости добычи за уровень',
    maxLevel: 5,
    baseCost: 12,
    costScale: 1.5,
  },
  {
    id: 'combatBoost',
    name: 'Боевой модуль',
    description: '+5% к урону за уровень',
    maxLevel: 5,
    baseCost: 12,
    costScale: 1.5,
  },
  {
    id: 'timeExtension',
    name: 'Хроно-стабилизатор',
    description: '+15 секунд к таймеру планеты за уровень',
    maxLevel: 3,
    baseCost: 15,
    costScale: 1.6,
  },
  {
    id: 'shopDiscount',
    name: 'Торговые связи',
    description: '-10% к ценам в магазине за уровень',
    maxLevel: 2,
    baseCost: 20,
    costScale: 1.7,
  },
  {
    id: 'multiMine',
    name: 'Мульти-добыча',
    description: 'Позволяет добывать до 2 руд одновременно (ур.2 — до 3)',
    maxLevel: 2,
    baseCost: 25,
    costScale: 1.8,
  },
];

export function getMetaUpgradeInfo(id, level) {
  const upg = META_UPGRADES.find(u => u.id === id);
  if (!upg || level >= upg.maxLevel) return null;
  return {
    name: upg.name,
    description: upg.description,
    cost: Math.ceil(upg.baseCost * Math.pow(upg.costScale, level)),
    maxLevel: upg.maxLevel,
    level: level,
  };
}
