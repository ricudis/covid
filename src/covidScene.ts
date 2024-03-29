import * as Phaser from 'phaser';
import { Maze } from './maze';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'covidScene',
};

const GRIDSIZE:number = 50;

// NETI
const INFINITY:number = 0xDEADBEEF;

class LeSprite extends Phaser.Physics.Arcade.Sprite {
  public current_direction:number;
  public next_direction:number;
  public is_turnable:boolean;
  public le_speed:number = 0; 
  public le_timer:Phaser.Time.TimerEvent;
  public le_target:Phaser.Math.Vector2;
  public last_tile:Phaser.Tilemaps.Tile;

  constructor(scene:Phaser.Scene, pos:Phaser.Math.Vector2, texture:string, is_turnable:boolean, le_speed:number) {
    super(scene, pos.x * GRIDSIZE + (GRIDSIZE / 2), pos.y * GRIDSIZE + (GRIDSIZE / 2), texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.is_turnable = is_turnable;
    this.current_direction = 0;
    this.next_direction = 0;
    this.le_speed = le_speed;
    this.le_target = new Phaser.Math.Vector2(0,0);
    this.last_tile = null;
  }

  public reposition(pos:Phaser.Math.Vector2) {
    this.setX(pos.x * GRIDSIZE + (GRIDSIZE / 2));
    this.setY(pos.y * GRIDSIZE + (GRIDSIZE / 2));
    this.current_direction = 0;
    this.next_direction = 0;
    this.setVisible(true);
  }

  public m_ares_na_knieme_knieme() {
    if (this.current_direction == this.next_direction) {
      return;
    }
    if (this.next_direction == Phaser.UP) {
      if (this.is_turnable) {
        this.setAngle(270);
        this.setFlipX(false);
      }
      this.setVelocity(0, -this.le_speed);
    } else if (this.next_direction == Phaser.DOWN) {
      if (this.is_turnable) {
        this.setAngle(90);
        this.setFlipX(false);
      }
      this.setVelocity(0, this.le_speed);
    } else if (this.next_direction == Phaser.LEFT) {
      if (this.is_turnable) {
        this.setAngle(0);
        this.setFlipX(true);
      }
      this.setVelocity(-this.le_speed, 0);
    } else if (this.next_direction == Phaser.RIGHT) {
      if (this.is_turnable) {
        this.setAngle(0);
        this.setFlipX(false);
      }
      this.setVelocity(this.le_speed, 0);
    }
    
    this.current_direction = this.next_direction;
  }

}

export class CovidScene extends Phaser.Scene {
  rexUI: any;
  private speed: number = 200;
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
  private tmp_map:Phaser.Physics.Arcade.Sprite[][] = [];

  constructor() {
    super(sceneConfig);
  }

  public init(data) {
    this.score = data.score;
    this.covids = data.covids;
    this.level = data.level;
  }
  
  public preload() {
    this.load.spritesheet('covid', 'assets/virus.png', { frameWidth: GRIDSIZE, frameHeight: GRIDSIZE });
    this.load.spritesheet('innocent_victim', 'assets/victim.png', { frameWidth: GRIDSIZE, frameHeight:GRIDSIZE});
    this.load.spritesheet('greg', 'assets/gh.png', { frameWidth: GRIDSIZE, frameHeight: GRIDSIZE });
    this.load.spritesheet('aunt_society', 'assets/koutala.png', { frameWidth: GRIDSIZE, frameHeight: GRIDSIZE });
    this.load.spritesheet('europe', 'assets/eu-flag.png', { frameWidth: GRIDSIZE, frameHeight:GRIDSIZE});
    this.load.image('maptileset','assets/mazetiles.png');
  }

  private rand_dir():number {
    return this.directions[Math.floor(Math.random() * this.directions.length)];
  }

  private rand_pos(empty_pos:boolean):Phaser.Math.Vector2 {
    var ret:Phaser.Math.Vector2 = new Phaser.Math.Vector2();
    do {
      ret.x = this.mazemap.get_rand_x();
      ret.y = this.mazemap.get_rand_y();
    } while ((!empty_pos && (this.mazemap.get_tile(this.mazemap.get_tilemap(), ret.x, ret.y) != 0)) || (empty_pos && this.tmp_map[ret.y][ret.x] == null));
    
    return ret;
  }

  private scene_resume() {
    if (this.reposition_covid == false) {
      return;
    }
    this.reposition_covid = false;
    this.covid.reposition(this.rand_pos(false));
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
    // on resume, the scene event callback handler reincarnates the psofed covid
  }

  // EU logic
  private sustained_recession() {
    this.hunt = false;
    this.gregs.children.iterate(function(child:Phaser.Physics.Arcade.Sprite) {
      child.setFrame(0);
    });
  }

  private sustained_development(covid:LeSprite, europe:LeSprite) {
    if (!Phaser.Math.Fuzzy.Equal(covid.x, europe.x, 3) && !Phaser.Math.Fuzzy.Equal(covid.y, europe.y, 3)) {
      return;
    }
   
    europe.disableBody(true, true);
    this.hunt = true;
    this.time.delayedCall(10000, this.sustained_recession, null, this);
    this.gregs.children.iterate(function(child:Phaser.Physics.Arcade.Sprite) {
      child.setFrame(1);
    });
  }

  private reincarnate_greg(greg:LeSprite) {
    // reposition the reincarnated greg on a random map location
    greg.reposition(this.rand_pos(false));
  }

  private over(x:number, y:number, x1:number, y1:number) {
    return (Phaser.Math.Fuzzy.Equal(x, x1, 4) && Phaser.Math.Fuzzy.Equal(y, y1, 4));
  }
 
  private close_encounter_of_the_third_type(covid:LeSprite, greg:LeSprite) {
    if (!this.over(covid.x, covid.y, greg.x, greg.y)) {
      return;
    }

    if (greg.visible == false) {
      return;
    }

    if (this.hunt == false) {
      this.covid_psof(covid);
      return;
    }

    this.score += 100;
    greg.setVisible(false);
    greg.le_timer = this.time.delayedCall(5000, this.reincarnate_greg, [greg], this);

  }

  // Aunt Society logic
  private miracle(covid:LeSprite, aunt_society:LeSprite) {
    if (!this.over(covid.x, covid.y, aunt_society.x, aunt_society.y)) {
      return;
    }
    aunt_society.disableBody(true, true);
    this.covid_psof(covid);
  }

  private tragedy(covid:LeSprite, innocent_victim:Phaser.Physics.Arcade.Sprite) {
    if (!this.over(covid.x, covid.y, innocent_victim.x, innocent_victim.y)) {
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
    var n_aunt_societies:number = 1;
    
    this.mazemap = new Maze(7, 7);
    this.tilemap = this.make.tilemap({
        data: this.mazemap.get_tilemap(),
        tileWidth: GRIDSIZE,
        tileHeight: GRIDSIZE
    });
    
    const tiles = this.tilemap.addTilesetImage('maptileset');
    const layer = this.tilemap.createStaticLayer(0, tiles, 0, 0);
    layer.setCollisionByExclusion([0], true);
    this.physics.world.setBounds(0, 0, this.mazemap.get_dim_x() * GRIDSIZE, this.mazemap.get_dim_y() * GRIDSIZE);
    this.cameras.main.setBounds(0, 0, this.mazemap.get_dim_x() * GRIDSIZE, this.mazemap.get_dim_y() * GRIDSIZE).setName('main');
    
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

    for (var y:number = 0; y < this.mazemap.get_dim_y(); y++) {
      this.tmp_map[y] = [];
      for (var x:number = 0; x < this.mazemap.get_dim_x(); x++) {
        switch(this.mazemap.get_tile(this.mazemap.get_tilemap(), x,y)) {
          case 0:
            this.population++;
            this.tmp_map[y][x] = this.innocent_victims.create(x * GRIDSIZE + (GRIDSIZE / 2), y * GRIDSIZE + (GRIDSIZE / 2), 'innocent_victim').setScale(0.7);
            break;
          default:
            this.tmp_map[y][x] = null;
            break;
        }
      }
    }

    this.covid = new LeSprite(this, this.rand_pos(false), 'covid', true, this.speed);
    this.physics.add.existing(this.covid);

    for (var i:number = 0; i < n_gregs; i++) { 
      const greg = new LeSprite(this, this.rand_pos(false), 'greg', false, this.speed/4);
      this.gregs.add(greg);
    }
    
    for (var i:number = 0; i < n_aunt_societies; i++) {
      var pos:Phaser.Math.Vector2 = this.rand_pos(true);
      var tmp_sprite = this.tmp_map[pos.y][pos.x];
      tmp_sprite.disableBody(true, true);
      this.tmp_map[pos.y][pos.x] = new LeSprite(this, pos, 'aunt_society', false, 0).setScale(0.5);
      this.aunt_societies.add(this.tmp_map[pos.y][pos.x]);
    }

    for (var i:number = 0; i < n_europes; i++) {
      var pos:Phaser.Math.Vector2 = this.rand_pos(true);
      var tmp_sprite = this.tmp_map[pos.y][pos.x];
      tmp_sprite.disableBody(true, true);
      this.tmp_map[pos.y][pos.x] = new LeSprite(this, pos, 'europe', false, 0).setScale(0.5);
      this.europes.add(this.tmp_map[pos.y][pos.x]);
    }

    this.anims.create({
      key: 'eating',
      frames: this.anims.generateFrameNumbers('covid', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.info = this.add.text(0, 0, "Score : " + this.score.toString() + "  Covids : " + this.covids.toString() + "   Press M to toggle map", { fontSize: '24px', fill: '#00ff00' });
    this.info.setScrollFactor(0, 0);
    
    // We use this to place the reincarnated covid in a new place if it was killed
    this.events.on('resume', this.scene_resume, this);
    
    this.physics.add.overlap(this.covid, this.innocent_victims, this.tragedy, null, this);
    this.physics.add.overlap(this.covid, this.gregs, this.close_encounter_of_the_third_type, null, this);
    this.physics.add.overlap(this.covid, this.aunt_societies, this.miracle, null, this);
    this.physics.add.overlap(this.covid, this.europes, this.sustained_development, null, this);
    this.physics.add.collider(this.covid, layer);
    this.physics.add.collider(this.gregs, layer);
    
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.covid.anims.play('eating');

    this.cameras.main.startFollow(this.covid, true, 0.05, 0.05);
  }

  private getneightiles(thing:LeSprite):Phaser.Tilemaps.Tile[] {
    const thingtile = this.tilemap.getTileAtWorldXY(thing.x, thing.y);
    var neigh:Phaser.Tilemaps.Tile[] = [null, null, null, null, null, null, null, null, null, null];
    neigh[Phaser.LEFT] = this.tilemap.getTileAt(thingtile.x - 1, thingtile.y);
    neigh[Phaser.RIGHT] = this.tilemap.getTileAt(thingtile.x + 1, thingtile.y);
    neigh[Phaser.UP] = this.tilemap.getTileAt(thingtile.x, thingtile.y - 1);
    neigh[Phaser.DOWN] = this.tilemap.getTileAt(thingtile.x, thingtile.y + 1)
    return(neigh);
  }

  private calcdirection(thing:LeSprite):void {
    if (thing.current_direction == thing.next_direction) {
      return;
    }

    const thingtile:Phaser.Tilemaps.Tile = this.tilemap.getTileAtWorldXY(thing.x, thing.y);
    const nexttile:Phaser.Tilemaps.Tile = this.getneightiles(thing)[thing.next_direction];
    
    if (nexttile == null || nexttile.index != 0) {
      return;
    }

    if (!this.over(thing.x, thing.y, thingtile.getCenterX(), thingtile.getCenterY())) {
      return;
    }

    thing.body.reset(thingtile.getCenterX(),thingtile.getCenterY());
    thing.m_ares_na_knieme_knieme();
  }

  private randdirection(thing:LeSprite):void {
    const thingtile:Phaser.Tilemaps.Tile = this.tilemap.getTileAtWorldXY(thing.x, thing.y);

    if (thingtile == thing.last_tile) {
      return;
    }

    if (!this.over(thing.x, thing.y, thingtile.getCenterX(), thingtile.getCenterY())) {
      return;
    }

    thing.last_tile = thingtile;

    const neightiles:Phaser.Tilemaps.Tile[] = this.getneightiles(thing);
    var neighcost:number[] = [];

    neighcost[Phaser.UP] = (GRIDSIZE - GRIDSIZE * 2 * Math.random()) + Phaser.Math.Distance.Snake(thing.x, thing.y - GRIDSIZE, thing.le_target.x, thing.le_target.y);
    neighcost[Phaser.DOWN] = (GRIDSIZE - GRIDSIZE * 2 * Math.random()) + Phaser.Math.Distance.Snake(thing.x, thing.y + GRIDSIZE, thing.le_target.x, thing.le_target.y);
    neighcost[Phaser.LEFT] = (GRIDSIZE - GRIDSIZE * 2 * Math.random()) + Phaser.Math.Distance.Snake(thing.x - GRIDSIZE, thing.y, thing.le_target.x, thing.le_target.y);
    neighcost[Phaser.RIGHT] = (GRIDSIZE - GRIDSIZE * 2 * Math.random()) + Phaser.Math.Distance.Snake(thing.x + GRIDSIZE, thing.y, thing.le_target.x, thing.le_target.y);

    if (thing.current_direction == Phaser.UP) { neighcost[Phaser.DOWN] = INFINITY; }
    if (thing.current_direction == Phaser.DOWN) { neighcost[Phaser.UP] = INFINITY; }
    if (thing.current_direction == Phaser.LEFT) { neighcost[Phaser.RIGHT] = INFINITY; }
    if (thing.current_direction == Phaser.RIGHT) { neighcost[Phaser.LEFT] = INFINITY; }

    if (neightiles[Phaser.DOWN].index != 0) { neighcost[Phaser.DOWN] = INFINITY; }
    if (neightiles[Phaser.UP].index != 0) { neighcost[Phaser.UP] = INFINITY; }
    if (neightiles[Phaser.RIGHT].index != 0) { neighcost[Phaser.RIGHT] = INFINITY; }
    if (neightiles[Phaser.LEFT].index != 0) { neighcost[Phaser.LEFT] = INFINITY; }
    
    var mincostdir = Phaser.UP;
    
    if (neighcost[Phaser.RIGHT] < neighcost[mincostdir]) { mincostdir = Phaser.RIGHT; }
    if (neighcost[Phaser.DOWN] < neighcost[mincostdir]) { mincostdir = Phaser.DOWN; }
    if (neighcost[Phaser.LEFT] < neighcost[mincostdir]) { mincostdir = Phaser.LEFT; }
    
    thing.next_direction = mincostdir;
    
    this.calcdirection(thing);
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
    this.gregs.children.iterate(function gumucha(greg:LeSprite) {
      greg.le_target.x = this.covid.x;
      greg.le_target.y = this.covid.y;
      this.randdirection(greg);
    }, this);

    // Info 
    this.info.setText("Level : " + this.level.toString() + "  Score : " + this.score.toString() + "  Covids : " + this.covids.toString() + "   Press M to toggle map");

  }
}

export default CovidScene;