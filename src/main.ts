
import * as Phaser from 'phaser';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import IntroScene from './introScene'; 
import CovidScene from './covidScene';
import PauseScene from './pauseScene';
import DeathScene from './deathScene';
import GameoverScene from './gameoverScene';
import LevelCompleteScene from './levelCompleteScene';

// Our game scene
var covidScene = new CovidScene();
var introScene = new IntroScene();
var pauseScene = new PauseScene();
var deathScene = new DeathScene();
var gameoverScene = new GameoverScene();
var levelCompleteScene = new LevelCompleteScene();

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Covid19',
  type: Phaser.AUTO,
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  parent: 'game',
  backgroundColor: '#000000',
  scene: [introScene, covidScene, pauseScene, deathScene, gameoverScene, levelCompleteScene],
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
//game.scene.start('Scene');


