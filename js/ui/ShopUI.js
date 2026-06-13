import {
  UPGRADES,
  getUpgradeLevel,
  getUpgradeCost,
  canAfford,
  purchaseUpgrade,
  formatCost,
  getUpgradeSummary,
  isMaxLevel,
} from '../data/upgrades.js';
import { audio } from '../core/Audio.js';

export class ShopUI {
  constructor(onContinue) {
    this.overlay = document.getElementById('shop-overlay');
    this.oreEl = document.getElementById('shop-ore');
    this.itemsEl = document.getElementById('shop-items');
    this.btnContinue = document.getElementById('btn-continue');
    this.onContinue = onContinue;
    this.run = null;

    this.btnContinue.addEventListener('click', () => {
      this.hide();
      this.onContinue();
    });
  }

  show(run) {
    this.run = run;
    this.overlay.classList.remove('hidden');
    this.render();
  }

  hide() {
    this.overlay.classList.add('hidden');
  }

  render() {
    const run = this.run;
    this.oreEl.textContent = `Руда: Fe: ${run.oreBank.iron} | Cr: ${run.oreBank.crystal}`;
    this.itemsEl.innerHTML = '';

    for (const upgrade of UPGRADES) {
      const level = getUpgradeLevel(run, upgrade.id);
      const maxed = isMaxLevel(run, upgrade);
      const cost = getUpgradeCost(upgrade, level);
      const discount = run.shopDiscount || 0;
      const discountedCost = {
        iron: Math.ceil(cost.iron * (1 - discount)),
        crystal: Math.ceil(cost.crystal * (1 - discount)),
      };
      const affordable = canAfford(run, discountedCost);

      const div = document.createElement('div');
      div.className = 'shop-item' + (maxed ? ' owned maxed' : '');

      const costStr = discount > 0
        ? `${formatCost(discountedCost)} (скидка ${Math.round(discount * 100)}%)`
        : formatCost(discountedCost);

      div.innerHTML = `
        <div class="shop-item-info">
          <div class="shop-item-name">${upgrade.name} <span class="shop-level">${level}/${upgrade.maxLevel}</span></div>
          <div class="shop-item-desc">${getUpgradeSummary(run, upgrade)}</div>
          ${!maxed ? `<div class="shop-item-next">${upgrade.effectText}</div>` : ''}
        </div>
        <span class="shop-item-price">${maxed ? 'MAX' : costStr}</span>
      `;

      const btn = document.createElement('button');
      btn.textContent = maxed ? 'Макс.' : level > 0 ? 'Улучшить' : 'Купить';
      btn.disabled = maxed || !affordable;
      btn.addEventListener('click', () => {
        if (purchaseUpgrade(run, { ...upgrade, _cost: discountedCost })) {
          audio.sfxBuy();
          this.render();
        }
      });
      div.appendChild(btn);
      this.itemsEl.appendChild(div);
    }
  }
}
