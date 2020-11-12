export class Block {

  /**
   * Create a block
   * @constructor
   * @param {!string} id - ID of the block
   * @param {string} name - Name of the block
   * @param {?boolean} isSolid - Whether the block is solid
   * @param {?boolean} isReplaceable - Whether the block is replaceable
   */
  constructor( { id, name, isSolid, isReplaceable, type, geometry, material } ) {
    this.id = id || null;
    this.name = name || null;
    this.isSolid = isSolid || false;
    this.isReplaceable = isReplaceable || false;
    this.type = type || "";
    this.geometry = geometry || null;
    this.material = material || null;
  }

  /**
   * Trigger block event (Abstract)
   */
  onCollision() {}

  /**
   * Create mesh
   * @return {THREE.Mesh} Mesh of the block
   */
  createMesh() {
    var mesh = null;
    if ( this.geometry && this.material ) {
      mesh = new THREE.Mesh(
        this.geometry,
        this.material
      );
    }
    return mesh;
  }
  
}