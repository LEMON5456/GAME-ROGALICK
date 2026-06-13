import { META_UPGRADES } from '../data/metaUpgrades.js';
import { SaveManager } from '../core/SaveManager.js';

export class MetaShopUI {
  constructor(onClose) {
    this.overlay = document.getElementById('meta-shop-overlay');
    this.serumEl = document.getElementById('meta-serum');
    this.itemsEl = document.getElementById('meta-items');
    this.btnClose = document.getElementById('btn-meta-close');
    this.btnOpen = document.getElementById('btn-meta');
    this.onClose = onClose;
    this.meta = null;

    this.btnClose.addEventListener('click', () => {
      this.hide();
      if (this.onClose) this.onClose();
    });

    this.btnOpen.addEventListener('click', () => {
      this.meta = SaveManager.load();
      this.show(this.meta);
    });
  }

  show(meta) {
    this.meta = meta;
    this.overlay.classList.remove('hidden');
    this.render();
  }

  hide() {
    this.overlay.classList.add('hidden');
  }

  render() {
    const meta = this.meta;
    this.serumEl.textContent = `Сыворотка эфира: ${meta.etherSerum}`;
    this.itemsEl.innerHTML = '';

    for (const upg of META_UPGRADES) {
      const level = SaveManager.getMetaUpgradeLevel(meta, upg.id);
      const info = SaveManager.getMetaUpgradeCost(upg.id, level);
      const maxed = level >= upg.maxLevel;
      const canAfford = info && meta.etherSerum >= info.cost;

      const div = document.createElement('div');
      div.className = 'shop-item' + (maxed ? ' owned maxed' : '');

      div.innerHTML = `
        <div class="shop-item-info">
          <div class="shop-item-name">${upg.name} <span class="shop-level">${level}/${upg.maxLevel}</span></div>
          <div class="shop-item-desc">${upg.description}</div>
          ${!maxed ? `<div class="shop-item-next">${info.effect}</div>` : ''}
        </div>
        <span class="shop-item-price">${maxed ? 'MAX' : (info ? info.cost + ' ES' : '')}</span>
      `;

      const btn = document.createElement('button');
      btn.textContent = maxed ? 'Макс.' : level > 0 ? 'Улучшить' : 'Купить';
      btn.disabled = maxed || !canAfford;
      btn.addEventListener('click', () => {
        if (SaveManager.purchaseMetaUpgrade(meta, upg.id)) {
          this.meta = SaveManager.load();
          this.render();
        }
      });
      div.appendChild(btn);
      this.itemsEl.appendChild(div);
    }
  }
}
