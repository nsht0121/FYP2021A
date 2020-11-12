export class Robot {

  /**
   * Create a robot
   * @constructor
   */
  constructor() {
    this.defaultOptions = null;
    this.x = null;
    this.z = null;
    this.health = null;
    this.dir = null;

    // Robot Mesh
    var geometry = new THREE.PlaneGeometry();

    for ( var i = 0, len = geometry.faces.length; i < len; i++ ) {
      var face = geometry.faces[ i ].clone();
      face.materialIndex = 1;
      geometry.faces.push( face );
      geometry.faceVertexUvs[ 0 ].push( geometry.faceVertexUvs[ 0 ][ i ].slice( 0 ) );
    }

    this.mesh = new THREE.Mesh( geometry.rotateY( Math.PI / 2 ), [
      new THREE.MeshLambertMaterial( { map: app.textures['robot'].texture, side: THREE.FrontSide, transparent: true } ),
      new THREE.MeshLambertMaterial( { map: app.textures['robotback'].texture, side: THREE.BackSide, transparent: true } ),
    ] );
    this.mesh.renderOrder = 1;
    this.mesh.name = "Robot";
  }

  /**
   * Set the map with given data
   * @param {number} x - x-coordinate of the map
   * @param {number} z - z-coordinate of the map
   * @param {number} health - Health of the robot
   * @param {string} dir - Facing direction at the beginning of the robot
   */
  setRobot( { x, z, health, dir } ) {
    this.defaultOptions = { x, z, health, dir };
    app.sceneLocHelper.add( this.mesh );
    this.respawn();
  }

  /**
   * Respawn the robot at specific tile
   */
  respawn() {
    this.x = this.defaultOptions.x;
    this.z = this.defaultOptions.z;
    this.health = this.defaultOptions.health;
    this.dir = app.data.direction[ this.defaultOptions.dir ];

    switch ( this.dir ) {
      case app.data.direction.left:
        this.mesh.rotation.y = Math.PI / 2;
        break;
      case app.data.direction.up:
        this.mesh.rotation.y = 0;
        break;
      case app.data.direction.right:
        this.mesh.rotation.y = -Math.PI / 2;
        break;
      case app.data.direction.down:
        this.mesh.rotation.y = -Math.PI;
        break;
    }

    this.updateMeshPosition();
    app.game.ui.updateHealthUI();
  }

  /**
   * Walk event
   */
  walk() {
    // Get block at next tile
    var block = app.game.map.getBlockAtTile( this.x + this.dir.x, this.z + this.dir.z );
    if ( ( block == null ) || !block.isSolid ) {
      this.x += this.dir.x;
      this.z += this.dir.z;
    }

    this.health -= 1;
    this.updateMeshPosition();

    // Get block at current tile (after moved)
    block = app.game.map.getBlockAtTile( this.x, this.z );
    if ( block != null ) { block.onCollision(); }

    app.game.ui.updateHealthUI();
  }

  /**
   * Turn clockwise event
   */
  turnClockwise() {
    switch ( this.dir ) {
      case app.data.direction.left:
        this.dir = app.data.direction.up;
        break;
      case app.data.direction.up:
        this.dir = app.data.direction.right;
        break;
      case app.data.direction.right:
        this.dir = app.data.direction.down;
        break;
      case app.data.direction.down:
        this.dir = app.data.direction.left;
        break;
    }
    this.mesh.rotation.y -= Math.PI / 2;
  }

  /**
   * Turn anticlockwise event
   */
  turnAntiClockwise() {
    switch ( this.dir ) {
      case app.data.direction.left:
        this.dir = app.data.direction.down;
        break;
      case app.data.direction.up:
        this.dir = app.data.direction.left;
        break;
      case app.data.direction.right:
        this.dir = app.data.direction.up;
        break;
      case app.data.direction.down:
        this.dir = app.data.direction.right;
        break;
    }
    this.mesh.rotation.y += Math.PI / 2;
  }

  /**
   * Check whether robot still alive
   * @return {boolean} Is robot alive
   */
  isAlive() {
    return this.health > 0;
  }

  /**
   * Update robot mesh position
   */
  updateMeshPosition() {
    this.mesh.position.set( this.x + 0.5, 0.5, this.z + 0.5 );
  }

}
