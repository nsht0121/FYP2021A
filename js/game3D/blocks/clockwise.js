import { Block } from "../block.js"

export class Block_ClockWise extends Block {

  constructor( geometry, material ) {
    super({
      id: "clockwise",
      name: "Turn Right",
      isReplaceable: true,
      geometry: geometry,
      material: material
    });
  }

  createMesh() {
    var object = new THREE.Object3D();
    object.add( app.models["turnArrow"].gltf.scene.clone() );
    object.position.y += 0.02;
    return object;
  }

  onCollision() {
    app.game.robot.turnClockwise();
  }

}