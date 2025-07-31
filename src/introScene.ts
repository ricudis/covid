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
    this.load.image('intro', 'assets/cover.jpg');
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
      y: window.innerHeight / 2,
      width: 300,
      background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),
      choices: [
        this.createLabel('Play'),
        this.createLabel('Github'),
      ],
      space: {
        left: 20, right: 20, top: 20, bottom: 20,
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
        if (index == 1) {
          window.open('https://github.com/ricudis/covid/');
        } else if (index == 0) {
          this.scene.active = false;
          this.scene.visible = false;
          this.scene.start("covidScene", { score: 0, level: 1, covids: 8 });
          this.scene.stop();
        }
      }, this);

    return dialog;
  }

  public create() {
    // Get current window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Set camera bounds to match window size
    this.cameras.main.setBounds(0, 0, windowWidth, windowHeight);

    // Create intro background image
    const intro = this.add.image(0, 0, 'intro').setOrigin(0, 0);

    // Calculate scale to fit intro image within window bounds
    const introScaleX = windowWidth / intro.width;
    const introScaleY = windowHeight / intro.height;
    const introScale = Math.max(introScaleX, introScaleY); // Use max to ensure full coverage
    intro.setScale(introScale, introScale);

    // Center the intro image
    intro.setPosition(
      (windowWidth - intro.width * introScale) / 2,
      (windowHeight - intro.height * introScale) / 2
    );

    // Create title overlay
    const intro_title = this.add.image(0, 0, 'intro_title').setOrigin(0, 0);

    // Calculate scale for title to fit within window (with some padding)
    const titleMaxWidth = windowWidth * 0.9; // 80% of window width
    const titleMaxHeight = windowHeight * 0.9; // 30% of window height
    const titleScaleX = titleMaxWidth / intro_title.width;
    const titleScaleY = titleMaxHeight / intro_title.height;
    const titleScale = Math.min(titleScaleX, titleScaleY); // Use min to ensure it fits
    intro_title.setScale(titleScale, titleScale);

    // Center the title
    intro_title.setPosition(
      (windowWidth - intro_title.width * titleScale) / 2,
      (windowHeight - intro_title.height * titleScale) / 2
    );

    const overlay = this.add.container(0, 0, intro_title).setDepth(Number.MAX_VALUE);
    overlay.alpha = 0;

    this.cameras.main.setZoom(0.05);
    this.cameras.main.centerOn(0, 0);

    var timeline = this.tweens.createTimeline();
    var dialog = this.createDialog();
    dialog.alpha = 0;

    timeline.add({
      targets: this.cameras.main,
      zoom: { value: 1, duration: 4000, ease: 'Elastic' },
      scrollX: { value: windowHeight / 2, duration: 3000, ease: 'Power2' },
      scrollY: { value: windowWidth / 2, duration: 3000, ease: 'Power2' },
    });

    timeline.add({
      targets: overlay,
      alpha: { value: 1, duration: 3000 }
    });

    timeline.add({
      targets: dialog,
      alpha: { value: 1, duration: 1000 }
    });
    timeline.play();
  }
}

export default IntroScene;
