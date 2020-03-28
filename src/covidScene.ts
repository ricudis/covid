import * as Phaser from 'phaser';
import { Maze } from './maze';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'covidScene',
};


class LeSprite extends Phaser.Physics.Arcade.Sprite {
  public current_direction:number;
  public next_direction:number;
  public is_turnable:boolean;
  public le_speed:number = 0; 
  public le_timer:Phaser.Time.TimerEvent;

  constructor(scene:Phaser.Scene, x:number, y:number, texture:string, is_turnable:boolean, le_speed:number) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.is_turnable = is_turnable;
    this.current_direction = 0;
    this.next_direction = 0;
    this.le_speed = le_speed;
  }
}

export class CovidScene extends Phaser.Scene {
  rexUI: any;
  private speed: number = 200;
  private gridsize: number = 50;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private covid: LeSprite;
  private innocent_victims: Phaser.Physics.Arcade.StaticGroup;
  private gregs: Phaser.Physics.Arcade.Group
  private aunt_societies: Phaser.Physics.Arcade.Group;
  private europes: Phaser.Physics.Arcade.Group;
  private population: number = 0;
  // This is not used in the game
  // It's just a matter of principle
  private property: boolean = false; 
  private mazemap: Maze;
  private tilemap:Phaser.Tilemaps.Tilemap;
  private directions:number[] = [Phaser.LEFT, Phaser.RIGHT, Phaser.UP, Phaser.DOWN];
  private minimap:Phaser.Cameras.Scene2D.BaseCamera;
  private score:number = 0;
  private covids:number = 8;
  private info:Phaser.GameObjects.Text;
  private level:number = 1; 
  private hunt:boolean = false;
  private reposition_covid:boolean = false;

  constructor() {
    super(sceneConfig);
  }

  public init(data) {
    this.score = data.score;
    this.covids = data.covids;
    this.level = data.level;
  }
  
  public preload() {
    this.load.spritesheet('covid', 'assets/virus.png', { frameWidth: this.gridsize, frameHeight: this.gridsize });
    this.load.spritesheet('innocent_victim', 'assets/victim.png', { frameWidth: this.gridsize, frameHeight:this.gridsize});
    this.load.spritesheet('greg', 'assets/gh.png', { frameWidth: this.gridsize, frameHeight: this.gridsize });
    this.load.spritesheet('aunt_society', 'assets/koutala.png', { frameWidth: this.gridsize, frameHeight: this.gridsize });
    this.load.spritesheet('europe', 'assets/eu-flag.png', { frameWidth: this.gridsize, frameHeight:this.gridsize});
    this.load.image('maptileset','assets/mazetiles.png');
  }

  private rand_dir():number {
    return this.directions[Math.floor(Math.random() * this.directions.length)];
  }

  private reposition_sprite(thing:LeSprite) {
    var x:number;
    var y:number;
    do {
      x = this.mazemap.get_rand_x();
      y = this.mazemap.get_rand_y();
    } while (this.mazemap.get_tile(this.mazemap.get_tilemap(), x, y) != 0);
    thing.setX(x * this.gridsize + (this.gridsize / 2));
    thing.setY(y * this.gridsize + (this.gridsize / 2));
    thing.setVisible(true);
    thing.current_direction = 0;
    thing.next_direction = 0;
  }

  private scene_resume() {
    if (this.reposition_covid == false) {
      return;
    }
    this.reposition_covid = false;
    this.reposition_sprite(this.covid);
  }

  private boss_mode() {
    this.scene.run("pauseScene");
    window.open('https://www.youporn.com/');
    this.scene.pause();
  }

  private covid_psof(covid:LeSprite) {
    this.covids--;
    this.reposition_covid = true;
    // Play a dramatic death scene for the poor deceased covid
    covid.setVisible(false);
    this.scene.run("deathScene", {covid_x: covid.x, covid_y: covid.y, covids: this.covids});
    this.scene.pause();
    // on resume, the event callback handler resuscitates the psofed covid
  }

  // EU functionality 
  private sustained_recession() {
    this.hunt = false;
    this.gregs.children.iterate(function(child:Phaser.Physics.Arcade.Sprite) {
      child.setFrame(0);
    });
  }

  private sustained_development(covid:LeSprite, europe:LeSprite) {
    if (!Phaser.Math.Fuzzy.Equal(covid.x, europe.x, 10) && !Phaser.Math.Fuzzy.Equal(covid.y, europe.y, 10)) {
      return;
    }
   
    europe.disableBody(true, true);
    this.hunt = true;
    this.time.delayedCall(10000, this.sustained_recession, null, this);
    this.gregs.children.iterate(function(child:Phaser.Physics.Arcade.Sprite) {
      child.setFrame(1);
    });
  }

  private miracle(covid:LeSprite, aunt_society:LeSprite) {
    if (!Phaser.Math.Fuzzy.Equal(covid.x, aunt_society.x, 10) && !Phaser.Math.Fuzzy.Equal(covid.y, aunt_society.y, 10)) {
      return;
    }
    aunt_society.disableBody(true, true);
    this.covid_psof(covid);
  }

  private reincarnate_greg(greg:LeSprite) {
    // reposition the reincarnated greg on a random map location
    this.reposition_sprite(greg);
    this.greg_hit_a_wall(greg, null);
  }
 
  private hit_a_greg(covid:LeSprite, greg:LeSprite) {
    if (!Phaser.Math.Fuzzy.Equal(covid.x, greg.x, 10) && !Phaser.Math.Fuzzy.Equal(covid.y, greg.y, 10)) {
      return;
    }

    if (greg.visible == false) {
      return;
    }

    if (this.hunt == false) {
      this.covid_psof(covid);
    } else {
      this.score += 100;
      greg.setVisible(false);
      greg.le_timer = this.time.delayedCall(5000, this.reincarnate_greg, [greg], this);
    }
  }

  private tragedy(covid:LeSprite, innocent_victim:Phaser.Physics.Arcade.Sprite) {
    if (!Phaser.Math.Fuzzy.Equal(covid.x, innocent_victim.x, 10) && !Phaser.Math.Fuzzy.Equal(covid.y, innocent_victim.y, 10)) {
      return;
    }
    // Death: It's just a statistic
    this.population--;
    this.score++;

    // Other innocent victims are saddened by the tragedy of their friend dying, but only 
    // so much as they're near the coronavirus and can sense that they're next.
    //
    // Otherwise, on their orchids. 

    var cameraview = this.cameras.main.worldView;

    // OMG THE INNOCENT VICTIMS HAVE CHILDREN TOO!
    this.innocent_victims.children.iterate(function(child:Phaser.Physics.Arcade.Sprite) {
      if (cameraview.contains(child.x, child.y)) {  
        // Any distance metric would work, but we prefer this one because it has a cool Russian name
        let distance:number = Phaser.Math.Distance.Chebyshev(innocent_victim.x, innocent_victim.y, child.x, child.y);
        if (distance < 50 * 3) { 
           child.setTexture('innocent_victim', 3);
        } else if (distance < 50 * 5) {
           child.setTexture('innocent_victim', 2);
        } else if (distance < 50 * 7) {
           child.setTexture('innocent_victim', 1);
        } else {
           child.setTexture('innocent_victim', 0);
        }
      }
    });

    innocent_victim.disableBody(true, true);

    if (this.population == 0) {
      // nextlevel;  
    }
  }

  public create() { 
    var n_gregs:number = 4;
    var n_europes:number = 2;
    var n_aunt_societies:number = 2;
    var x:number = 0;
    var y:number = 0;
    
    this.mazemap = new Maze(7, 7);
    this.tilemap = this.make.tilemap({
        data: this.mazemap.get_tilemap(),
        tileWidth: this.gridsize,
        tileHeight: this.gridsize
    });
    
    const tiles = this.tilemap.addTilesetImage('maptileset');
    const layer = this.tilemap.createStaticLayer(0, tiles, 0, 0);
    layer.setCollisionByExclusion([0], true);
    this.physics.world.setBounds(0, 0, this.mazemap.get_dim_x() * this.gridsize, this.mazemap.get_dim_y() * this.gridsize);
    this.cameras.main.setBounds(0, 0, this.mazemap.get_dim_x() * this.gridsize, this.mazemap.get_dim_y() * this.gridsize).setName('main');
    
    this.minimap = this.cameras.add(0, 0, this.mazemap.get_dim_x() * 10, this.mazemap.get_dim_y() * 10).setZoom(0.2).setName('mini');
    this.minimap.setBackgroundColor(0x002244).setOrigin(0,0).centerToBounds();
    this.minimap.visible = false;

    // Toggle map with M key
    this.input.keyboard.on('keydown-' + 'M', function (event) { 
      this.minimap.visible = !this.minimap.visible;
    }, this);

    // Boss mode with ESC
    this.input.keyboard.on('keydown-' + 'ESC', function (event) {
      this.boss_mode();
    }, this);

    this.innocent_victims = this.physics.add.staticGroup();
    this.gregs = this.physics.add.group();
    this.aunt_societies = this.physics.add.group();
    this.europes = this.physics.add.group();

    var tmp_map:Phaser.Physics.Arcade.Sprite[][] = [];
    
    for (y = 0; y < this.mazemap.get_dim_y(); y++) {
      tmp_map[y] = [];
      for (x = 0; x < this.mazemap.get_dim_x(); x++) {
        switch(this.mazemap.get_tile(this.mazemap.get_tilemap(), x,y)) {
          case 0:
            this.population++;
            tmp_map[y][x] = this.innocent_victims.create(x * this.gridsize + (this.gridsize / 2), y * this.gridsize + (this.gridsize / 2), 'innocent_victim').setScale(0.7);
            break;
          default:
            tmp_map[y][x] = null;
            break;
        }
      }
    }

    for (var i:number = 0; i < n_gregs; i++) { 
      do {
        x = this.mazemap.get_rand_x();
        y = this.mazemap.get_rand_y();
      } while (this.mazemap.get_tile(this.mazemap.get_tilemap(), x, y) != 0);
      const greg = new LeSprite(this, x * this.gridsize + (this.gridsize / 2), y * this.gridsize + (this.gridsize / 2), 'greg', false, this.speed/4);
      this.gregs.add(greg);
      this.greg_hit_a_wall(greg, null);
    }
  
    do {
      x = this.mazemap.get_rand_x();
      y = this.mazemap.get_rand_y();
    } while (this.mazemap.get_tile(this.mazemap.get_tilemap(), x, y) != 0);
    this.covid = new LeSprite(this, x * this.gridsize + (this.gridsize / 2), y * this.gridsize + (this.gridsize / 2), 'covid', true, this.speed);
    this.physics.add.existing(this.covid);
    
    for (var i:number = 0; i < n_aunt_societies; i++) {
      do {
        x = this.mazemap.get_rand_x();
        y = this.mazemap.get_rand_y();
      } while (tmp_map[y][x] == null);
      var tmp_sprite = tmp_map[y][x];
      tmp_sprite.disableBody(true, true);
      tmp_map[y][x] = new LeSprite(this, x * this.gridsize + (this.gridsize / 2), y * this.gridsize + (this.gridsize / 2), 'aunt_society', false, 0).setScale(0.7);
      this.aunt_societies.add(tmp_map[y][x]);
    }

    for (var i:number = 0; i < n_europes; i++) {
      do {
        x = this.mazemap.get_rand_x();
        y = this.mazemap.get_rand_y();
      } while (tmp_map[y][x] == null);
      var tmp_sprite = tmp_map[y][x];
      tmp_sprite.disableBody(true, true);
      tmp_map[y][x] = new LeSprite(this, x * this.gridsize + (this.gridsize / 2), y * this.gridsize + (this.gridsize / 2), 'europe', false, 0).setScale(0.7);
      this.europes.add(tmp_map[y][x]);
    }

    this.anims.create({
      key: 'eating',
      frames: this.anims.generateFrameNumbers('covid', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.info = this.add.text(0, 0, "Score : " + this.score.toString() + "  Covids : " + this.covids.toString() + "   Press M to toggle map", { fontSize: '24px', fill: '#00ff00' });
    this.info.setScrollFactor(0, 0);
    
    // We use this to place the resuscitated covid in a new place if it was killed
    this.events.on('resume', this.scene_resume, this);
    
    this.physics.add.overlap(this.covid, this.innocent_victims, this.tragedy, null, this);
    this.physics.add.overlap(this.covid, this.gregs, this.hit_a_greg, null, this);
    this.physics.add.overlap(this.covid, this.aunt_societies, this.miracle, null, this);
    this.physics.add.overlap(this.covid, this.europes, this.sustained_development, null, this);

    this.physics.add.collider(this.covid, layer);
    this.physics.add.collider(this.gregs, layer, this.greg_hit_a_wall, null, this);

    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.covid.anims.play('eating');

    this.cameras.main.startFollow(this.covid, true, 0.05, 0.05);
  }

  private getneightiles(thing:LeSprite):Phaser.Tilemaps.Tile[] {
    const thingtile = this.tilemap.getTileAtWorldXY(thing.x, thing.y);
    
    if (!thingtile) {
      return([null, null, null, null]);
    }

    return([this.tilemap.getTileAt(thingtile.x - 1, thingtile.y),
            this.tilemap.getTileAt(thingtile.x + 1, thingtile.y),
            this.tilemap.getTileAt(thingtile.x, thingtile.y - 1),
            this.tilemap.getTileAt(thingtile.x, thingtile.y + 1)]);
  }

  private tileatdirection(direction:number, neightiles:Phaser.Tilemaps.Tile[]):Phaser.Tilemaps.Tile {
    return (direction == Phaser.UP ? neightiles[2] : 
            direction == Phaser.DOWN ? neightiles[3] : 
            direction == Phaser.LEFT ? neightiles[0] : 
            direction == Phaser.RIGHT ? neightiles[1] : 
            null);
  }

  private calcdirection(thing:LeSprite):void {
    if (thing.next_direction == thing.current_direction) {
      return;
    }
    
    var nexttile:Phaser.Tilemaps.Tile = this.tileatdirection(thing.next_direction, this.getneightiles(thing));
    
    if (nexttile == null || nexttile.index != 0) {
      return;
    }

    var ntx:number = nexttile.getCenterX();
    var nty:number = nexttile.getCenterY();

    // Only move if we are halfway inside target tile
    // On second thought, the above comment sounds a bit kinky.
    if (!Phaser.Math.Fuzzy.Equal(thing.x, ntx, 10) && !Phaser.Math.Fuzzy.Equal(thing.y, nty, 10)) {
      return;
    }

    const thingtile = this.tilemap.getTileAtWorldXY(thing.x, thing.y);
    thing.body.reset(thingtile.getCenterX(),thingtile.getCenterY());

    if (thing.next_direction == Phaser.UP) {
      if (thing.is_turnable) {
        thing.setAngle(270);
        thing.setFlipX(false);
      }
      thing.setVelocity(0, -thing.le_speed);
    } else if (thing.next_direction == Phaser.DOWN) {
      if (thing.is_turnable) {
        thing.setAngle(90);
        thing.setFlipX(false);
      }
      thing.setVelocity(0, thing.le_speed);
    } else if (thing.next_direction == Phaser.LEFT) {
      if (thing.is_turnable) {
        thing.setAngle(0);
        thing.setFlipX(true);
      }
      thing.setVelocity(-thing.le_speed, 0);
    } else if (thing.next_direction == Phaser.RIGHT) {
      if (thing.is_turnable) {
        thing.setAngle(0);
        thing.setFlipX(false);
      }
      thing.setVelocity(thing.le_speed, 0);
    }
    thing.current_direction = thing.next_direction;
  }

  private greg_hit_a_wall(greg:LeSprite, wall) {    
    var nexttile:Phaser.Tilemaps.Tile;
    if (greg.current_direction == 0) {
      greg.current_direction = this.rand_dir();
    }

    do {
      greg.next_direction = this.rand_dir();
      nexttile = this.tileatdirection(greg.next_direction, this.getneightiles(greg));
    } while (nexttile == null || nexttile.index != 0 || greg.current_direction == greg.next_direction);

    this.calcdirection(greg);
  }

  public update() {
    if (this.cursorKeys.left.isDown) {
      this.covid.next_direction = Phaser.LEFT;
    } else if (this.cursorKeys.right.isDown) {
      this.covid.next_direction = Phaser.RIGHT;
    } else if (this.cursorKeys.up.isDown) {
      this.covid.next_direction = Phaser.UP;
    } else if (this.cursorKeys.down.isDown) {
      this.covid.next_direction = Phaser.DOWN;
    } 

    this.calcdirection(this.covid);

    // Move around gregs randomly
    this.gregs.children.iterate(this.calcdirection, this);

    // Info 
    this.info.setText("Level : " + this.level.toString() + "  Score : " + this.score.toString() + "  Covids : " + this.covids.toString() + "   Press M to toggle map");

  }
}


export default CovidScene;