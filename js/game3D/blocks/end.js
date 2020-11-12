import { Block } from "../block.js"

export class Block_End extends Block {

  constructor( geometry, material ) {
    super({
      id: "end",
      name: "Destination",
      type: "plane",
      geometry: geometry,
      material: material
    });
  }

  onCollision() {
    app.game.isWon = true;
  }

}