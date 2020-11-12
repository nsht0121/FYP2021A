import { Item } from "../item.js"

export class Item_ClockWise extends Item {

  constructor() {
    super({
      id: "clockwise",
      name: "Turn Right",
      blockID: 6,
    });
  }

  isPlaceable() {
    return true;
  }

}