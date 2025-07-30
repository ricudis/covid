import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'levelCompleteScene',
};

export class LevelCompleteScene extends Phaser.Scene {
  rexUI: any;
  private covid: Phaser.GameObjects.Sprite;
  private congratulationsText: Phaser.GameObjects.Text;
  private nextLevelData: any;
  private skullEmojis: Phaser.GameObjects.Text[] = [];
  private skullTimer: Phaser.Time.TimerEvent;

  constructor() {
    super(sceneConfig);
  }

  public init(data) {
    this.nextLevelData = data;
  }

  public preload() {
    this.load.spritesheet('covid', 'assets/virus.png', { frameWidth: 50, frameHeight: 50 });
  }

  public create() {
    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Set background color to dark green (Matrix-like)
    this.cameras.main.setBackgroundColor('#001100');

    // Start Matrix-like skull emoji animation
    this.startSkullAnimation();

    // Create congratulations text - first line
    this.add.text(
      windowWidth / 2, 
      windowHeight / 2 - 120, 
      "Congratulations, COVID!", 
      { 
        fontSize: '32px', 
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    // Create congratulations text - second line
    this.congratulationsText = this.add.text(
      windowWidth / 2, 
      windowHeight / 2 - 80, 
      "You eliminated the whole population!", 
      { 
        fontSize: '32px', 
        fill: '#00ff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    // Create big covid sprite
    this.covid = this.add.sprite(
      windowWidth / 2, 
      windowHeight / 2 + 50, 
      'covid'
    ).setScale(3);

    // Create eating animation for covid
    this.anims.create({
      key: 'eating',
      frames: this.anims.generateFrameNumbers('covid', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    // Play the eating animation
    this.covid.anims.play('eating');

    // Create tween animation for covid
    const timeline = this.tweens.createTimeline();

    // Bounce and rotate animation
    timeline.add({
      targets: this.covid,
      scaleX: { value: 4, duration: 1000, ease: 'Power2' },
      scaleY: { value: 4, duration: 1000, ease: 'Power2' },
      angle: { value: 360, duration: 2000, ease: 'Power2' },
      yoyo: true,
      repeat: 1
    });

    // Bounce up and down
    timeline.add({
      targets: this.covid,
      y: { value: windowHeight / 2 - 50, duration: 500, ease: 'Bounce' },
      yoyo: true,
      repeat: 1,
      offset: 0
    });

    // Start the timeline
    timeline.play();

    // Auto-proceed to next level after 5 seconds
    this.time.delayedCall(5000, () => {
      this.scene.start('covidScene', this.nextLevelData);
    });
  }

  private startSkullAnimation() {
    // Create timer to spawn skull emojis periodically
    this.skullTimer = this.time.addEvent({
      delay: 200, // Spawn every 200ms
      callback: this.spawnSkullEmoji,
      callbackScope: this,
      loop: true
    });
  }

  private spawnSkullEmoji() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Random position at top of screen
    const x = Math.random() * windowWidth;
    const y = -50; // Start above the screen
    
    // Create skull emoji with random properties
    const skull = this.add.text(x, y, '💀', {
      fontSize: Math.random() * 20 + 20 + 'px', // Random size between 20-40px
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Add to tracking array
    this.skullEmojis.push(skull);
    
    // Create falling animation
    this.tweens.add({
      targets: skull,
      y: windowHeight + 50, // Fall below the screen
      duration: Math.random() * 3000 + 2000, // Random duration between 2-5 seconds
      ease: 'Linear',
      onComplete: () => {
        // Remove from array and destroy when animation completes
        const index = this.skullEmojis.indexOf(skull);
        if (index > -1) {
          this.skullEmojis.splice(index, 1);
        }
        skull.destroy();
      }
    });
    
    // Add slight rotation for more dynamic effect
    this.tweens.add({
      targets: skull,
      angle: Math.random() * 360 - 180, // Random rotation between -180 and 180 degrees
      duration: Math.random() * 2000 + 1000,
      ease: 'Linear'
    });
  }
}

export default LevelCompleteScene; 