export class PauseUI {
  constructor(onResume, onQuit) {
    this.overlay = document.getElementById('pause-overlay');
    this.settingsPanel = document.getElementById('pause-settings-panel');
    this.slider = document.getElementById('pause-volume-slider');

    document.getElementById('btn-resume').onclick = () => onResume();
    document.getElementById('btn-pause-quit').onclick = () => onQuit();
    document.getElementById('btn-pause-settings').onclick = () => {
      this.settingsPanel.classList.toggle('hidden');
    };
  }

  show() {
    this.overlay.classList.remove('hidden');
    this.settingsPanel.classList.add('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
  }
}
