export class Map {
  
  /**
   * Create a map
   * @constructor
   */
  constructor() {}

  /**
   * Set the map with given data
   * @param {number} row - Row (x) of the map
   * @param {number} col - Col (z) of the map
   * @param {number[]} layer - Map structure
   */
  setMap( { row, col, layer } ) {
    this.row = row;
    this.col = col;
    this.logicMap = Array.from( Array( row ), () => new Array( col ) );

    for ( var x = 0; x < this.row; x++ ) {
      for ( var z = 0; z < this.col; z++ ) {
        this.logicMap[ x ][ z ] = {
          id: layer[ Math.abs( this.col - 1 - x ) * this.row + z ],
          mesh: null,
        };
      }
    }
  }

  /**
   * Set block at specific tile
   * @param {number} x - x-coordinate of the map
   * @param {number} z - z-coordinate of the map
   * @param {number} id - Numeric ID of the block
   */
  setTile( x, z, id ) {
    this.logicMap[ x ][ z ].id = id;

    if ( id !== 0 ) {
      this.setMeshAtTile( x, z, this.getBlockAtTile( x, z ) );
    }
  }

  /**
   * Get object Block at specific tile
   * @param {number} x - x-coordinate of the map
   * @param {number} z - z-coordinate of the map
   * @return {Block} A Block object
   */
  getBlockAtTile( x, z ) {
    var id = this.logicMap[ x ][ z ].id;
    return ( id === 0 ) ? null : app.data.blocks[ id ];
  }

  /**
   * Add mesh at specific tile
   * @param {number} x - x-coordinate of the map
   * @param {number} z - z-coordinate of the map
   * @param {Block} block - a Block object
   */
  setMeshAtTile( x, z, block ) {
    // Remove old mesh if exists
    this.removeMeshAtTile( x, z );

    // Create new mesh
    var newMesh = block.createMesh();
    switch ( block.type ) {
      case "plane":
        newMesh.position.set( x + 0.5, 0.001, z + 0.5 );
        newMesh.rotateX( -Math.PI / 2 );
        break;
      
      case "block":
        newMesh.position.set( x + 0.5, 0.5, z + 0.5 );
        break;

      default:
        newMesh.position.x = x + 0.5;
        newMesh.position.z = z + 0.5;
        break;
    }
    app.sceneLocHelper.add( newMesh );
    app.levelObjects.push( newMesh );
    this.logicMap[ x ][ z ].mesh = newMesh;
  }

  removeMeshAtTile( x, z ) {
    var mesh = this.logicMap[ x ][ z ].mesh;
    if ( mesh ) {
      app.sceneLocHelper.remove( mesh );
      mesh = undefined;
    }
  }

  /**
   * Draw the scene using loaded assets
   */
  drawScene() {
    for ( var x = 0; x < this.row; x++ ) {
      for ( var z = 0; z < this.col; z++ ) {
        var block = this.getBlockAtTile( x, z );
        if ( block ) { this.setMeshAtTile( x, z, block ); }
      }
    }
    app.game.robot.updateMeshPosition();
  }

}
