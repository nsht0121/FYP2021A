// Import modules
import { Block_Start } from "./blocks/start.js";
import { Block_End } from "./blocks/end.js";
import { Block_Wall } from "./blocks/wall.js";
import { Block_Spike } from "./blocks/spike.js";
import { Block_AntiClockWise } from "./blocks/anticlockwise.js";
import { Block_ClockWise } from "./blocks/clockwise.js";

import { Item_AntiClockWise } from "./items/anticlockwise.js";
import { Item_Battery } from "./items/battery.js";
import { Item_ClockWise } from "./items/clockwise.js";

import { Level1 } from "./levels/1.js";
import { Level2 } from "./levels/2.js";
import { Level3 } from "./levels/3.js";

export class Data {

  /**
   * Create a data set
   * @constructor
   */
  constructor() {
    // THREE Meshes and Materials
    const planeGeometry = new THREE.PlaneBufferGeometry();
    const boxGeometry = new THREE.BoxBufferGeometry();

    const startMaterial = new THREE.MeshLambertMaterial({ map: app.textures["start"].texture, side: THREE.FrontSide });
    const endMaterial = new THREE.MeshLambertMaterial({ map: app.textures["end"].texture, side: THREE.FrontSide });
    const wallMaterial = new THREE.MeshLambertMaterial({ map: app.textures["wall"].texture, side: THREE.FrontSide });
    // const spikeMaterial = new THREE.MeshLambertMaterial({ map: app.textures["spike"].texture, side: THREE.FrontSide });
    const anticlockwiseMaterial = new THREE.MeshLambertMaterial({ map: app.textures["anticlockwise"].texture, side: THREE.FrontSide });
    const clockwiseMaterial = new THREE.MeshLambertMaterial({ map: app.textures["clockwise"].texture, side: THREE.FrontSide });

    // Const variables
    const block_Start = new Block_Start( planeGeometry, startMaterial );
    const block_End = new Block_End( planeGeometry, endMaterial );
    const block_Wall = new Block_Wall( boxGeometry, wallMaterial );
    const block_Spike = new Block_Spike();
    const block_AntiClockWise = new Block_AntiClockWise( planeGeometry, anticlockwiseMaterial );
    const block_ClockWise = new Block_ClockWise( planeGeometry, clockwiseMaterial );

    const item_AntiClockWise = new Item_AntiClockWise;
    const item_Battery = new Item_Battery;
    const item_ClockWise = new Item_ClockWise;

    // Const bundles
    this.blocks = {
      1: block_Start,
      2: block_End,
      3: block_Wall,
      4: block_Spike,
      5: block_AntiClockWise,
      6: block_ClockWise
    }

    this.items = {
      anticlockwise: item_AntiClockWise,
      clockwise: item_ClockWise,
      battery: item_Battery,
    }

    this.levels = {
      1: Level1,
      2: Level2,
      3: Level3,
    }

    // Robot direction
    this.direction = {
      left: { x: 0, z: -1 },
      right: { x: 0, z: 1 },
      up: { x: 1, z: 0 },
      down: { x: -1, z: 0 },
    }

    this.getItemName = function( id ) {
      return this.items[ id ].name;
    }
  }

}