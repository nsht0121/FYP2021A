import { Block } from "../block.js"

export class Block_Spike extends Block {

  constructor() {
    super({
      id: "spike",
      name: "Spike",
    });

    this.geometry = new THREE.ConeGeometry( 0.1, 0.4, 4 );
    this.material = new THREE.MeshLambertMaterial( { color: 0x080808 } );
    this.points = [
      [ -0.3, 0.3 ],
      [ 0.3, 0.3 ],
      [ 0.0, 0.0 ],
      [ -0.3, -0.3 ],
      [ 0.3, -0.3 ],
    ]
  }

  onCollision() {
    app.game.robot.health -= 5;
  }

  createMesh() {
    var object = new THREE.Object3D();
    object.name = "Spike"

    this.points.map( point => {
      var mesh = new THREE.Mesh(
        this.geometry,
        this.material
      );
      
      mesh.position.set( point[0], 0.2, point[1] );
      object.add( mesh );
    } );

    return object;
  }

}