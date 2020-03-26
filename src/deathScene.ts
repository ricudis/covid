import * as Phaser from 'phaser';


const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'deathScene',
};

export class DeathScene extends Phaser.Scene {
  rexUI: any;
  private covid_x:number = 0;
  private covid_y:number = 0;
  private covid_size:number = 200;
  private sprite_size:number = 50;

  constructor() {
    super(sceneConfig);
  }

  public init(data) {
    this.covid_x = data.covid_x;
    this.covid_y = data.covid_y;
  }

  public preload() {
    this.load.image('covid-big','assets/covid-frame1.png');
    this.load.image('bukurash','assets/buku.png');
  }

  public create() { 
    var covid:Phaser.GameObjects.Image = this.add.image(this.covid_x, this.covid_y, 'covid-big').setAlpha(0).setDisplaySize(this.sprite_size, this.sprite_size);
    var buku:Phaser.GameObjects.Image = this.add.image(window.innerWidth/2, window.innerHeight/2, 'bukurash').setAlpha(0);
    var timeline = this.tweens.createTimeline();

    timeline.add({
      targets: covid,
      alpha: { value: 1, duration: 1 },
      displayHeight: { value: this.covid_size, duration: 3000, ease: 'Power2' },
      displayWidth: { value: this.covid_size, duration: 3000, ease: 'Power2' },
      x: { value: window.innerWidth/2, duration:3000, ease: 'Power2' },
      y: { value: window.innerHeight/2, duration:3000, ease: 'Power2' },
    });

    timeline.add({
      targets: covid,
      rotation: { value: Phaser.Math.DegToRad(-180), duration: 1000 }  
    });
    timeline.add({
      targets: covid,
      alpha: { value : 0, duration: 1000 }
    });
    timeline.add({
      targets: buku,
      alpha: { value : 1, duration: 3000 }
    });
    timeline.add({
      targets: buku,
      x: { value : -200, duration: 5000 }
    })
    
    
    timeline.play();
  }
}

export default DeathScene;
