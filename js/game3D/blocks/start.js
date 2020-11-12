import { Block } from "../block.js"

export class Block_Start extends Block {

  constructor( geometry, material ) {
    super({
      id: "start",
      name: "Start Point",
      type: "plane",
      geometry: geometry,
      material: material
    });
  }

}