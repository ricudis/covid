import * as Phaser from 'phaser';


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'introScene',
};

export class IntroScene extends Phaser.Scene {
  rexUI: any;
  constructor() {
    super(sceneConfig);
  }
  
  public preload() {
    this.load.image('intro','assets/cover.jpg');
    this.load.image('intro_title', 'assets/covertitle.png');
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
                x: 200,
                y: 300,
                width: 300,
                background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),
                choices: [
                    this.createLabel('Play'),
                    this.createLabel('Github'),
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
          console.log("click ", groupName, " index ", index, " text ", button.text);
          if (index == 1) {
            window.open('https://github.com/ricudis/covid/');
          } else if (index == 0) {
            this.scene.active = false;
            this.scene.visible = false;
            this.scene.start("covidScene", {level: 1, lives: 8});
            this.scene.stop();
          }
      }, this);

      return dialog;
  }

  public create() {
    this.cameras.main.setBounds(0, 0, window.innerWidth, window.innerHeight);  
    const intro = this.add.image(0, 0, 'intro').setOrigin(0,0);
    const lescaleintro:number = window.innerHeight / intro.height;
    intro.setScale(lescaleintro, lescaleintro);

    const intro_title = this.add.image(0, 0, 'intro_title').setOrigin(0,0);
    const lescaleintrotitle:number = window.innerHeight / intro_title.height;
    intro_title.setScale(lescaleintrotitle, lescaleintrotitle);

    const overlay = this.add.container(0, 0, intro_title).setDepth(Number.MAX_VALUE);
    overlay.alpha = 0; 
    
    this.cameras.main.setZoom(0.05);
    this.cameras.main.centerOn(0, 0);
 
    var timeline = this.tweens.createTimeline();
    var dialog = this.createDialog();
    dialog.alpha = 0;
    
    timeline.add({
      targets: this.cameras.main,
      zoom: { value: 1, duration: 4000, ease: 'Elastic'},
      scrollX: { value: window.innerHeight/2, duration:3000, ease: 'Power2' },
      scrollY: { value: window.innerWidth/2, duration:3000, ease: 'Power2' },
    });
    
    timeline.add({
      targets: overlay,
      alpha: { value: 1, duration: 3000 }
    });

    timeline.add({
      targets: dialog,
      alpha: {value: 1, duration: 1000 }
    });
    timeline.play();
  }
}

export default IntroScene;
