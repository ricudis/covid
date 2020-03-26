import * as Phaser from 'phaser';


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'pauseScene',
};

export class PauseScene extends Phaser.Scene {
  rexUI: any;
  constructor() {
    super(sceneConfig);
  }

  private createLabel(text) {
    return this.rexUI.add.label({
        width: 40, // Minimum width of round-rectangle
        height: 40, // Minimum height of round-rectangle
        background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x5e92f3),
        text: this.add.text(0, 0, text, { fontSize: '24px' }),
        space: { left: 10, right: 10, top: 10, bottom: 10 }
    });
  }

  public create() {
    var dialog = this.rexUI.add.dialog({
      x: window.innerWidth/2,
      y: window.innerHeight/2,
      width: 300,
      background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),
      choices: [
          this.createLabel('Game paused. Press ESC to resume'),
      ],
      space: { left: 20, right: 20, top: 20, bottom: 20, choices: 25 },
      align: { choices: 'center' },
      click: { mode: 'release' }
    })
    .layout()
    .popUp(1000);

    this.input.keyboard.on('keydown-' + 'ESC', function (event) {
      this.scene.resume("covidScene");
      this.scene.stop();
    }, this);
  } 
}

export default PauseScene;
