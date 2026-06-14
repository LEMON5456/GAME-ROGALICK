export class HUD {
  constructor() {
    this.el = document.getElementById('hud');
    this.hpBar = document.getElementById('hp-bar');
    this.hpText = document.getElementById('hp-text');
    this.oreDisplay = document.getElementById('ore-display');
    this.timer = document.getElementById('planet-timer');
    this.miningWrap = document.getElementById('mining-progress');
    this.miningBar = document.getElementById('mining-bar');
    this.buffsEl = document.getElementById('buffs');
    this.ultimateEl = document.getElementById('ultimate-charge');
    this._waveWarningTimer = 0;
  }

  show() {
    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }

  update(player, run, planetTimer, miningProgress, showTimer, waveManager, dt) {
    const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
    this.hpBar.style.width = `${hpPct}%`;
    this.hpText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;

    const sessionIron = run.sessionOre.iron;
    const sessionCrystal = run.sessionOre.crystal;
    this.oreDisplay.textContent = `Fe: ${run.oreBank.iron + sessionIron} | Cr: ${run.oreBank.crystal + sessionCrystal}`;

    if (showTimer) {
      this.timer.classList.remove('hidden');
      this.timer.textContent = planetTimer.format();
      this.timer.classList.toggle('warning', planetTimer.remaining <= 30);
    } else {
      this.timer.classList.add('hidden');
    }

    if (miningProgress > 0) {
      this.miningWrap.classList.remove('hidden');
      this.miningBar.style.width = `${miningProgress * 100}%`;
    } else {
      this.miningWrap.classList.add('hidden');
    }

    let buffHtml = '';
    if (player.shield > 0) {
      buffHtml += `<span class="buff buff-shield">[ЩИТ ${player.shield.toFixed(1)}s]</span>`;
    }
    if (player.speedBoost > 0) {
      buffHtml += `<span class="buff buff-speed">[УСКОР ${player.speedBoost.toFixed(1)}s]</span>`;
    }
    this.buffsEl.innerHTML = buffHtml;

    const ultPct = player.ultimateCharge;
    if (player.ultimateActive > 0) {
      this.ultimateEl.textContent = `УЛЬТА ${player.ultimateActive.toFixed(1)}s`;
      this.ultimateEl.className = 'active';
    } else if (ultPct >= 100) {
      this.ultimateEl.textContent = 'УЛЬТА [K] ГОТОВА';
      this.ultimateEl.className = 'ready';
    } else {
      this.ultimateEl.textContent = `УЛЬТА [K] ${Math.floor(ultPct)}%`;
      this.ultimateEl.className = '';
    }

    if (waveManager && waveManager.warningActive) {
      this._waveWarningTimer = 2;
    }
    if (this._waveWarningTimer > 0) {
      this._waveWarningTimer -= dt || 1 / 60;
      const el = document.getElementById('wave-warning');
      if (el) el.classList.remove('hidden');
    } else {
      const el = document.getElementById('wave-warning');
      if (el) el.classList.add('hidden');
    }
  }
}
