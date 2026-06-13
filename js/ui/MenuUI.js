export class MenuUI {
  constructor(callbacks) {
    this.menu = document.getElementById('menu-overlay');
    this.hub = document.getElementById('hub-overlay');
    this.gameover = document.getElementById('gameover-overlay');
    this.win = document.getElementById('win-overlay');
    this.hubMessage = document.getElementById('hub-message');
    this.hubOre = document.getElementById('hub-ore');
    this.sectorLabel = document.getElementById('hub-sector');
    this.winText = document.getElementById('win-text');
    this.btnSector2 = document.getElementById('btn-sector2');

    this._retryCb = callbacks.onRetry;
    document.getElementById('btn-start').addEventListener('click', callbacks.onStart);
    document.getElementById('btn-deploy').addEventListener('click', callbacks.onDeploy);
    document.getElementById('btn-retry').addEventListener('click', callbacks.onRetry);
    document.getElementById('btn-win-retry').addEventListener('click', callbacks.onRetry);

    if (this.btnSector2 && callbacks.onSector2) {
      this.btnSector2.addEventListener('click', callbacks.onSector2);
    }
  }

  showMenu() {
    this.hideAll();
    this.menu.classList.remove('hidden');
  }

  showHub(run, message, sectorName = 'Сектор 1') {
    this.hideAll();
    this.hubMessage.textContent = message;
    this.hubOre.textContent = `Руда: Fe: ${run.oreBank.iron} | Cr: ${run.oreBank.crystal}`;
    if (this.sectorLabel) {
      this.sectorLabel.textContent = sectorName;
    }
    this.hub.classList.remove('hidden');
  }

  showGameOver(stats = {}) {
    this.hideAll();
    let html = '<p>Разлом поглощает галактику...</p>';
    if (stats.sector) html += `<p class="stat-line">Сектор: ${stats.sector}</p>`;
    html += '<div class="run-stats">';
    html += `<div class="stat-row"><span>Добыто Fe:</span><span>${stats.oreIron || 0}</span></div>`;
    html += `<div class="stat-row"><span>Добыто Cr:</span><span>${stats.oreCrystal || 0}</span></div>`;
    html += `<div class="stat-row"><span>Врагов убито:</span><span>${stats.kills || 0}</span></div>`;
    html += `<div class="stat-row"><span>Время:</span><span>${stats.time || '00:00'}</span></div>`;
    html += '</div>';
    this.gameover.querySelector('.panel').innerHTML = html + '<button id="btn-retry">Попробовать снова</button>';
    document.getElementById('btn-retry').addEventListener('click', this._retryCb);
    this.gameover.classList.remove('hidden');
  }

  showWin(sector2Unlocked = false) {
    this.hideAll();
    if (this.winText) {
      this.winText.textContent = sector2Unlocked
        ? 'Вы спасли сектор 1. Сектор 2 открыт для исследования!'
        : 'Вы спасли сектор 1. Галактика в безопасности.';
    }
    if (this.btnSector2) {
      this.btnSector2.style.display = sector2Unlocked ? 'inline-block' : 'none';
    }
    this.win.classList.remove('hidden');
  }

  hideAll() {
    this.menu.classList.add('hidden');
    this.hub.classList.add('hidden');
    this.gameover.classList.add('hidden');
    this.win.classList.add('hidden');
  }
}
