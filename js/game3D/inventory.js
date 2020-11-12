export class Inventory {

  /**
   * Create an inventory
   * @constructor
   */
  constructor() {
    this.items = [];
  }

  /**
   * Set the inventory with given items
   * @param {Object[]} items - Object list of the item
   * @param {string} items[].id - ID of the item
   * @param {number} items[].amount - Amount of the item
   */
  setInventory( items ) {
    this.items = items;
  }

  /**
   * Add item(s) to the inventory
   * @param {string} id - ID of the item
   * @param {number} amount - Amount of the item
   */
  addItem( id, amount = 1 ) {
    for ( var i = 0; i < this.items.length; i++ ) {
      if ( this.items[i].id === id ) {
        this.items[i].amount += amount;
        return;
      }
    }
    this.items.push( { id: id, amount: amount } );
  }

  /**
   * Remove item(s) from the inventory
   * @param {string} id - ID of the item
   * @param {number} amount - Amount of the item
   * @return {boolean} Whether the amount of item is 0
   */
  removeItem( id, amount = 1 ) {
    for ( var i = 0; i < this.items.length; i++ ) {
      if ( this.items[i].id === id ) {
        this.items[i].amount -= amount;
        if ( this.items[i].amount <= 0 ) {
          this.items.splice( i, 1 );
          return true;
        }
        return false;
      }
    }
    return false;
  }

  /**
   * Find item from the inventory
   * @param {string} id - ID of the item
   * @return {boolean} Item found
   */
  hasItem( id ) {
    for ( var i = 0; i < this.items.length; i++ ) {
      if ( this.items[i].id === id ) { return true; }
    }
    return false;
  }
  
}
