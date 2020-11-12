import { Item } from "../item.js"

export class Item_Battery extends Item {

  constructor() {
    super({
      id: "battery",
      name: "Battery",
      canUse: true,
    });
  }

  onUse() {
    app.game.robot.health += 5;
  }

}