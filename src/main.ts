
import * as Phaser from 'phaser';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import IntroScene from './introScene'; 
import CovidScene from './covidScene';

// Our game scene
var covidScene = new CovidScene();
var introScene = new IntroScene();

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Covid19',
  type: Phaser.AUTO,
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  parent: 'game',
  backgroundColor: '#000000',
  scene: [introScene, covidScene],
  plugins: {
    scene: [{
        key: 'rexUI',
        plugin: UIPlugin,
        mapping: 'rexUI'
    },
    // ...
    ]
  },
};

export const game = new Phaser.Game(gameConfig);

// start title
game.scene.start('introScene');


