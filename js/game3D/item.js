export class Item {
  
  /**
   * Create an item
   * @constructor
   * @param {Object} params - Property of the block
   * @param {string} id - ID of the item
   * @param {string} name - Name of the item
   */
  constructor( { id, name, blockID = -1, canUse = false } ) {
    this.id = id;
    this.name = name;
    this.blockID = blockID;
    this.canUse = canUse;
  }

  /**
   * Trigger item event (Abstract)
   */
  onUse() {}

  /**
   * Check whether the item is placeable
   * @return {boolean} Is placeable
   */
  isPlaceable() {
    return false;
  }

}
