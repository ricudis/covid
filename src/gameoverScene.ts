import * as Phaser from 'phaser';


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'gameoverScene',
};

export class GameoverScene extends Phaser.Scene {
  rexUI: any;
  private party;
  private gameover;
  private leui;

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

  private createDialog() {
    var dialog = this.rexUI.add.dialog({
                x: window.innerWidth/2,
                y: window.innerHeight - 70,
                width: 300,
                background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),
                choices: [
                    this.createLabel('Play again'),
                ],
                space: { left: 20, right: 20, top: 20, bottom: 20,
                    choices: 25,
                    toolbarItem: 5,
                    choice: 15,
                    action: 15,
                },
                align: { 
                  choices: 'center' 
                },
                click: { mode: 'release' }
            })
            .setDraggable('background')   // Draggable-background
            .layout()
            .popUp(1000);

      
      dialog
        .on('button.over', function (button, groupName, index, pointer, event) {
          button.getElement('background').setStrokeStyle(1, 0xffffff); 
        })
        .on('button.out', function (button, groupName, index, pointer, event) {
          button.getElement('background').setStrokeStyle();
        })
        .on('button.click', function (button, groupName, index, pointer, event) {
            this.scene.active = false;
            this.scene.visible = false;
            this.scene.start("introScene");
            this.scene.stop();
        }, this);

      return dialog;
  }

  public preload() {
    this.load.video('party', 'assets/legiatroi.mp4', 'loadeddata', false, true);
    this.load.image('gameover', 'assets/gameover.png');
  }

  public create() {
    this.party = this.add.video(window.innerWidth/2, window.innerHeight/2, 'party');
    this.gameover = this.add.image(window.innerWidth/2, -100, 'gameover');
    this.party.setMute(true);
    this.leui = this.createDialog();

    var timeline = this.tweens.createTimeline();
    this.party.play(true);

    timeline.add({
      targets: this.gameover,
      y: { value: window.innerHeight-200, duration:10000, ease: 'Elastic' },
    });

    timeline.add({
      targets: this.party,
      alpha: { value: 1, duration: 10000, offset: 0 },
    });

    timeline.add({
      targets: this.leui,
      delay: 10000,
      alpha: { value: 1, duration: 2000 },
    });

    timeline.play();
  }
}

export default GameoverScene;
