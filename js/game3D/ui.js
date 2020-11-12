export class UI {

  /**
   * Set game interface (Inventory, Health, Message Board)
   * @constructor
   */
  constructor() {
    this.inventoryUI = document.getElementById( "inventory" );
    this.levelUI = document.getElementById( "level" );
    this.healthUI = document.getElementById( "health" );
    this.messageUI = document.getElementById( "messageBox" );
    this.triggerButton = document.getElementById( "btnTrigger" );
    this.pinnedMsg = null;
    this.triggerButton.onclick = () => app.game.startGame();
  }

  /**
   * Update inventory UI
   */
  updateInventoryUI() {
    this.inventoryUI.innerHTML = "";
    app.game.inventory.items.forEach( ( item ) => {
      // Create elements
      var button = document.createElement( "button" );
      var text = document.createTextNode( `${app.data.getItemName(item.id)}: ${item.amount}` );

      // Set button attributes
      button.onclick = () => app.game.selectItem( item.id );
      button.setAttribute( "id", `item_${item.id}` );
      if ( item.id === app.game.currItem ) { button.setAttribute( "class", "active" ); }

      // Append
      button.appendChild( text );
      this.inventoryUI.appendChild( button );
    } );
  }

  /**
   * Update the interface of robot health
   */
  updateHealthUI() {
    this.healthUI.innerHTML = "❤️: " + app.game.robot.health;
  }

  /**
   * Update the interface of current level
   */
  updateLevelUI() {
    this.levelUI.innerHTML = "Level " + app.game.levelID;
  }

  /**
   * Update the message in message box
   */
  showMessage( msg ) {
    var p = document.createElement( "p" );
    p.innerHTML = msg;
    this.messageUI.appendChild( p );
    
    setTimeout( () => {
      this.messageUI.removeChild( p );
    }, 3000);
  }

  /**
   * Pin a message in message box
   */
  pinMessage( msg ) {
    if ( !app.game.ui.pinnedMsg ) {
      this.pinnedMsg = document.createElement( "p" );
      this.pinnedMsg.innerHTML = msg;
      this.pinnedMsg.className = "pinned";
      this.messageUI.appendChild( this.pinnedMsg );
    }
  }

  /**
   * Clear the pinned message in message box
   */
  clearPinMessage() {
    if ( this.pinnedMsg ) {
      this.messageUI.removeChild( this.pinnedMsg );
      this.pinnedMsg = null;
    }
  }

  /**
   * Toggle start button function
   * @param {string} mode - start / stop / restart
   */
  changeTriggerButtonMode( mode ) {
    switch ( mode ) {
      case "start":
        this.triggerButton.innerText = "Start";
        this.triggerButton.onclick = () => app.game.startGame();
        break;

      case "stop":
        this.triggerButton.innerText = "Stop";
        this.triggerButton.onclick = () => app.game.stopGame();
        break;

      case "restart":
        this.triggerButton.innerText = "Restart";
        this.triggerButton.onclick = () => app.game.restartGame();
        break;

      case "next":
        this.triggerButton.innerText = "Next Level";
        this.triggerButton.onclick = () => app.game.nextLevel();
        break;

      default:
        this.triggerButton.innerText = "N/A";
        this.triggerButton.onclick = null;
        break;
    }
  }
}