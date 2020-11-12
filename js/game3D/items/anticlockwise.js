import { Item } from "../item.js"

export class Item_AntiClockWise extends Item {

  constructor() {
    super({
      id: "anticlockwise",
      name: "Turn Left",
      blockID: 5,
    });
  }

  isPlaceable() {
    return true;
  }

}