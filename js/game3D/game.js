import { Inventory } from "./inventory.js";
import { Map } from "./map.js";
import { Robot } from "./robot.js";
import { UI } from "./ui.js";

export class Game {

  /**
   * Create a game
   * @constructor
   */
  constructor() {
    // Set game logic (Map, Robot, Inventory)
    this.map = new Map();
    this.robot = new Robot();
    this.inventory = new Inventory();
    this.ui = new UI();

    this.levelID = null;
    this.lastLevelID = Object.keys( app.data.levels ).length;
    this.levelData = null;
    this.isWon = false;
    this.isRobotRunning = false;
    this.currItem = null;
    this.usedItems = null;
    this.xrMode = false;

    // Set game animation
    this.animate = this.animate.bind( this );
    this.currTick = 0;
    this.lastTick = 0;
  }

  /**
   * Initialize the game to specific level
   * @param {number} - Level number
   */
  init( id ) {
    // Load level data
    this.levelID = id;
    this.levelData = JSON.parse( JSON.stringify( app.data.levels[ id ] ) );
    this.map.setMap( this.levelData.map );
    this.robot.setRobot( this.levelData.robot );
    this.inventory.setInventory( this.levelData.inv );
    this.usedItems = [];

    // Clear scene meshes
    app.levelObjects.map( object => {
      app.sceneLocHelper.remove( object );
    } );
    app.levelObjects = [];

    // (Re)set game logic, interface of inventory and robot health
    this.isWon = false;
    this.isRobotRunning = false;
    this.currItem = null;

    this.ui.updateInventoryUI();
    this.ui.updateLevelUI();
    this.map.drawScene();
  }

  /**
   * Select item and set the button to active mode
   * @param {string} id - ID of the item 
   */
  selectItem( id ) {
    // Remove previous item class
    var a = document.getElementById( `item_${this.currItem}` );
    if ( a ) { a.removeAttribute( "class" ); }

    // Select instant use item
    var item = app.data.items[ id ];
    if ( item.canUse ) {
      this.usedItems.push( id );
      item.onUse();
      this.inventory.removeItem( id );
      this.ui.updateInventoryUI();
      this.ui.updateHealthUI();
      return;
    }

    // Select the same item
    if ( this.currItem === id ) {
      this.currItem = null;
    } else { // Select other item
      this.currItem = id;
      a = document.getElementById( `item_${id}` );
      a.setAttribute( "class", "active" );
    }
  }

  /**
   * Place item (block) at specific tile
   * @param {number} x - x-coordinate of the map
   * @param {number} z - z-coordinate of the map
   * @param {string} id - ID of the item
   */
  placeItemAtTile( x, z, id ) {
    if ( this.inventory.hasItem( id ) && app.data.items[ id ].isPlaceable() ) { // Have enough item
      var block = this.map.getBlockAtTile( x, z );
      var isAir = ( block == null );

      if ( this.isRobotRunning ) {
        this.ui.showMessage( "You must stop the robot first" );
        return;
      }

      if ( isAir || block.isReplaceable ) { // Can place at tile
        if ( !isAir ) { this.inventory.addItem( block.id ); }
        if ( this.inventory.removeItem( id ) ) { this.currItem = undefined; }

        this.map.setTile( x, z, app.data.items[ id ].blockID );
        this.ui.updateInventoryUI();
      } else { // Cannot place at tile
        this.ui.showMessage( "You cannot place item at here" );
      }
    } else { // Do not have enough item
      this.ui.showMessage( "You dont have enough " + app.data.items[ id ].name );
    }
  }

  /**
   * Remove item (block) at specific tile
   * @param {number} x - x-coordinate of the map
   * @param {number} z - z-coordinate of the map 
   */
  removeItemAtTile( x, z ) {
    var block = this.map.getBlockAtTile( x, z );

    if ( block && block.isReplaceable ) {
      if ( this.isRobotRunning ) {
        this.ui.showMessage( "You must stop the robot first" );
      } else {
        this.inventory.addItem( block.id );
        this.map.setTile( x, z, 0 );
        this.map.removeMeshAtTile( x, z );
        this.ui.updateInventoryUI();
      }
    }
  }

  /**
   * Start the game
   */
  startGame() {
    this.ui.changeTriggerButtonMode( "stop" );
    this.isRobotRunning = true;
    this.animate();
  }

  /**
   * Stop the game
   */
  stopGame() {
    this.ui.changeTriggerButtonMode( "start" );
    this.isRobotRunning = false;
    this.stopAnimate();
    this.robot.respawn();

    // Add back used items
    this.usedItems.map( item => {
      this.inventory.addItem( item, 1 );
    } );
    this.usedItems = [];
    this.ui.updateInventoryUI();
  }

  /**
   * Restart the game: Reset the robot status without remove item(s) on map
   */
  restartGame() {
    this.robot.respawn();
    this.ui.changeTriggerButtonMode( "start" );
  }

  /**
   * Reset the level: Reset the robot status and the map
   */
  resetLevel() {
    this.ui.changeTriggerButtonMode( "start" );
    this.stopAnimate();
    this.init( this.levelID );
  }

  /**
   * Init the game for next level
   */
  nextLevel() {
    if ( this.levelID < this.lastLevelID ) {
      this.init( this.levelID + 1 );
      this.ui.changeTriggerButtonMode( "start" );
    } else {
      this.ui.showMessage( "No more levels" );
    }
  }

  /**
   * Start the animation (frame rate: 2 frames per second)
   */
  animate() {
    this.animateReq = window.requestAnimationFrame( this.animate );
  
    // Update tick
    this.currTick = Date.now();
    this.currMoveTick = Date.now();

    if ( this.currTick - this.lastTick > 500 ) {
      this.lastTick = this.currTick;
      this.robot.walk();

      if ( this.isWon ) {
        this.isRobotRunning = false;
        this.stopAnimate();
        this.ui.showMessage( "You Win!🎉" );
        this.ui.changeTriggerButtonMode( "next" );
      } else if ( !this.robot.isAlive() ) {
        this.isRobotRunning = false;
        this.stopAnimate();
        this.ui.showMessage( "Robot Destroyed💀" );
        this.ui.changeTriggerButtonMode( "restart" );
      }
    }
  }

  /**
   * Stop the animation
   */
  stopAnimate() {
    window.cancelAnimationFrame( this.animateReq );
  }

}
