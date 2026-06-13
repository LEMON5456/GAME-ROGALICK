export class HUD {
  constructor() {
    this.el = document.getElementById('hud');
    this.hpBar = document.getElementById('hp-bar');
    this.hpText = document.getElementById('hp-text');
    this.oreDisplay = document.getElementById('ore-display');
    this.timer = document.getElementById('planet-timer');
    this.miningWrap = document.getElementById('mining-progress');
    this.miningBar = document.getElementById('mining-bar');
  }

  show() {
    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }

  update(player, run, planetTimer, miningProgress, showTimer) {
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
  }
}
