import { Block } from "../block.js"

export class Block_AntiClockWise extends Block {

  constructor( geometry, material ) {
    super({
      id: "anticlockwise",
      name: "Turn Left",
      isReplaceable: true,
      geometry: geometry,
      material: material
    });
  }

  createMesh() {
    var object = new THREE.Object3D();
    object.add( app.models["turnArrow"].gltf.scene.clone() );
    object.rotation.z = Math.PI;
    object.position.y += 0.02;
    return object;
  }

  onCollision() {
    app.game.robot.turnAntiClockwise();
  }

}