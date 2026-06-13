const SAVE_KEY = 'mouldog_meta';

function defaultMeta() {
  return {
    etherSerum: 0,
    metaUpgradeLevels: {
      startingHp: 0,
      miningEfficiency: 0,
      combatBoost: 0,
      timeExtension: 0,
      shopDiscount: 0,
      multiMine: 0,
    },
    stats: {
      runs: 0,
      wins: 0,
      planetsCleared: 0,
      totalOreMined: 0,
      bossDefeated: false,
      sector2Unlocked: false,
    },
    settings: {
      musicVolume: 0.3,
      sfxVolume: 0.5,
    },
  };
}

export class SaveManager {
  static load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultMeta();
      const parsed = JSON.parse(raw);
      const def = defaultMeta();
      return {
        ...def,
        ...parsed,
        metaUpgradeLevels: { ...def.metaUpgradeLevels, ...parsed.metaUpgradeLevels },
        stats: { ...def.stats, ...parsed.stats },
        settings: { ...def.settings, ...parsed.settings },
      };
    } catch {
      return defaultMeta();
    }
  }

  static save(meta) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(meta));
    } catch { /* quota exceeded, ignore */ }
  }

  static reset() {
    localStorage.removeItem(SAVE_KEY);
  }

  static getMetaUpgradeLevel(meta, id) {
    return meta.metaUpgradeLevels[id] || 0;
  }

  static getMetaUpgradeCost(id, level) {
    const costs = {
      startingHp: { base: 10, scale: 1.6, maxLevel: 3, effect: '+10 HP' },
      miningEfficiency: { base: 12, scale: 1.5, maxLevel: 5, effect: '+5% добычи' },
      combatBoost: { base: 12, scale: 1.5, maxLevel: 5, effect: '+5% урона' },
      timeExtension: { base: 15, scale: 1.6, maxLevel: 3, effect: '+15 сек к таймеру' },
      shopDiscount: { base: 20, scale: 1.7, maxLevel: 2, effect: '-10% цена в магазине' },
      multiMine: { base: 25, scale: 1.8, maxLevel: 2, effect: '+1 руда одновременно' },
    };
    const c = costs[id];
    if (!c || level >= c.maxLevel) return null;
    return {
      cost: Math.ceil(c.base * Math.pow(c.scale, level)),
      maxLevel: c.maxLevel,
      effect: c.effect,
    };
  }

  static purchaseMetaUpgrade(meta, id) {
    const info = SaveManager.getMetaUpgradeCost(id, meta.metaUpgradeLevels[id] || 0);
    if (!info) return false;
    if (meta.etherSerum < info.cost) return false;
    meta.etherSerum -= info.cost;
    meta.metaUpgradeLevels[id] = (meta.metaUpgradeLevels[id] || 0) + 1;
    SaveManager.save(meta);
    return true;
  }

  static applyMetaUpgrades(run, meta) {
    const lv = meta.metaUpgradeLevels;
    run.maxHp += (lv.startingHp || 0) * 10;
    run.hp = run.maxHp;
    run.damageMult = (run.damageMult || 1) + (lv.combatBoost || 0) * 0.05;
    run.miningSpeedMult = (run.miningSpeedMult || 1) + (lv.miningEfficiency || 0) * 0.05;
    run.timerBonus = (run.timerBonus || 0) + (lv.timeExtension || 0) * 15;
    run.shopDiscount = (lv.shopDiscount || 0) * 0.1;
    run.multiMineCount = 1 + (lv.multiMine || 0);
    return run;
  }

  static recordRunEnd(meta, result, oreMined) {
    meta.stats.runs++;
    if (result === 'win') {
      meta.stats.wins++;
      meta.stats.bossDefeated = true;
    }
    meta.stats.totalOreMined += oreMined || 0;
    if (result === 'evacuate') meta.stats.planetsCleared++;
    SaveManager.save(meta);
  }

  static awardEtherSerum(meta, amount) {
    meta.etherSerum += amount;
    if (meta.stats.bossDefeated && !meta.stats.sector2Unlocked) {
      meta.stats.sector2Unlocked = true;
    }
    SaveManager.save(meta);
  }
}
