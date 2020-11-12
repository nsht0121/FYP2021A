import { Block } from "../block.js"

export class Block_Wall extends Block {

  constructor( geometry, material ) {
    super({
      id: "wall",
      name: "Wall",
      isSolid: true,
      type: "block",
      geometry: geometry,
      material: material
    });
  }

}