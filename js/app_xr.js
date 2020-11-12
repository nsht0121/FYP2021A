import { OrbitControls } from "./modules/OrbitControls.js";
import { GLTFLoader } from "./modules/GLTFLoader.js";
import { Game } from "./game3D/game.js";
import { Data } from "./game3D/data.js";
import Stats from "./modules/stats.js";
import { PlaneBufferGeometry } from "../build/three.module.js";

const isMobile = ( /Android|webOS|iPhone|iPad|iPod/i.test( navigator.userAgent ) );
const loadingScreen = document.getElementById( "loadingScreen" );
const topBar = document.getElementById( "topBar" );
const xrButton = document.createElement( "button" );
const resetOrbitButton = document.getElementById( "btnResetOrbit" );
const resetXRsceneButton = document.getElementById( "btnResetXRscene" );
const fpsStats = document.getElementById( "stats" );
const mapSize = { x: 9, z: 9 };
const xrScaler = 0.03;

class App {

  constructor() {
    // Textures and Meshes
    this.textures = {
      wall: { url: 'assets/textures/wall.png' },
      floor: { url: 'assets/textures/floor.png' },
      start: { url: 'assets/textures/start.png' },
      end: { url: 'assets/textures/end.png' },
      robot: { url: 'assets/textures/robot.png' },
      robotback: { url: 'assets/textures/robotback.png' },
      spike: { url: 'assets/textures/spike.png' },
      anticlockwise: { url: 'assets/textures/anticlockwise.png' },
      clockwise: { url: 'assets/textures/clockwise.png' },
    };
    this.models = {
      turnArrow: { url: 'assets/models/turnArrow.gltf' },
    }
    
    // Game Components
    this.game = null;
    this.data = null;

    this.sceneLocHelper = new THREE.Object3D();
    this.scene = new THREE.Scene();
    this.levelObjects = [];

    this.camera = null;
    this.renderer = null;
    this.stats = null;
    this.isStatsEnabled = true;

    this.orbitControls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.hintMesh = null;
    this.groundMesh = null;
    this.gridLocHelper = new THREE.Object3D();

    // XR Components
    this.controller = null;
    this.reticle = new THREE.Object3D();
    this.dottedArea = null;

    this.currentXRSession = null;
    this.isXRsceneInit = false;

    this.hitTestSource = null;
    this.hitTestSourceRequested = false;

    this.loadAssets();
  }

  loadAssets() {
    this.showInitMessage( "Loading Assets..." );

    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      this.init();
    }

    const progressBar = document.getElementById("progressbar");
    manager.onProgress = ( url, loaded, total ) => {
      progressBar.style.width = `${loaded / total * 100 | 0}%`;
    }

    const textureLoader = new THREE.TextureLoader( manager );
    for ( const texture of Object.values( this.textures ) ) {
      textureLoader.load( texture.url, ( t ) => {
        t.encoding = THREE.sRGBEncoding;
        texture.texture = t;
        this.showInitMessage(`Texture '${texture.url}' loaded`);
      });
    }

    const gltfLoader = new GLTFLoader( manager );
    for ( const model of Object.values( this.models ) ) {
      gltfLoader.load( model.url, ( gltf ) => {
        model.gltf = gltf;
        this.showInitMessage(`Texture '${model.url}' loaded`);
      });
    }
  }

  showInitMessage( text ) {
    var p = document.createElement("p");
    p.innerHTML = text;
    loadingScreen.appendChild(p);
  }

  initScene() {
    // Scene
    this.scene.name = "Scene";
    this.scene.background = new THREE.Color( 0x2f2f2f );
    this.scene.add( this.sceneLocHelper );

    // Light
    const light = new THREE.AmbientLight( 0xffffff );
    this.scene.add( light );

    // Meshes: Helper
    var gridHelper = new THREE.GridHelper( mapSize.x, mapSize.x, 0xffffff, 0x2f2f2f );
    gridHelper.position.set( mapSize.x / 2, 0, mapSize.z / 2 );
    this.sceneLocHelper.add( gridHelper );

    var axesHelper = new THREE.AxesHelper( 10 );
    this.sceneLocHelper.add( axesHelper );

    // Meshes: Ground Plane
    var groundTexture = this.textures[ "floor" ].texture;
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( mapSize.x, mapSize.z );

    this.groundMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( mapSize.x, mapSize.z ),
      new THREE.MeshLambertMaterial( { map: groundTexture, side: THREE.FrontSide } )
    );
    this.groundMesh.position.set( mapSize.x / 2, 0, mapSize.z / 2 );
    this.groundMesh.rotation.x = - Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    this.sceneLocHelper.add( this.groundMesh );

    // Meshes: Skybox
    // var skyBoxMesh = new THREE.Mesh(
    //   new THREE.BoxGeometry(50, 50, 50),
    //   [
    //     // Front, Back, Up, Down, Right, Back
    //     new THREE.MeshBasicMaterial( { map: this.textures[ "end" ].texture, side: THREE.BackSide } ),
    //     new THREE.MeshBasicMaterial( { map: this.textures[ "end" ].texture, side: THREE.BackSide } ),
    //     undefined,
    //     new THREE.MeshBasicMaterial( { map: this.textures[ "start" ].texture, side: THREE.BackSide } ),
    //     new THREE.MeshBasicMaterial( { map: this.textures[ "end" ].texture, side: THREE.BackSide } ),
    //     new THREE.MeshBasicMaterial( { map: this.textures[ "end" ].texture, side: THREE.BackSide } ),
    //   ]
    // );
    // skyBoxMesh.position.set( mapSize.x / 2, 0, mapSize.z / 2 );
    // this.scene.add( skyBoxMesh );

    // Meshes: Red Hint Box
    this.hintMesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(),
      new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.4, transparent: true } )
    );
    this.hintMesh.renderOrder = 2;
    this.hintMesh.visible = false;
    this.sceneLocHelper.add( this.hintMesh );

    // Meshes: Reticle for Locating (AR mode)
    this.reticle.add( new THREE.Mesh( // Inner Circle
      new THREE.CircleBufferGeometry( 0.15 * xrScaler, 24 ).rotateX( -Math.PI / 2 ),
      new THREE.MeshBasicMaterial()
    ) );
    this.reticle.add( new THREE.Mesh( // Outer Ring
      new THREE.RingBufferGeometry( 0.3 * xrScaler, 0.4 * xrScaler, 24 ).rotateX( -Math.PI / 2 ),
      new THREE.MeshBasicMaterial()
    ) );

    var triangle = new THREE.Geometry(); // North Point Arrow
    triangle.vertices.push( new THREE.Vector3( 0, 0, -0.15 * xrScaler ) );
    triangle.vertices.push( new THREE.Vector3( 0, 0, 0.15 * xrScaler ) );
    triangle.vertices.push( new THREE.Vector3( 0.25 * xrScaler, 0, 0 ) );
    triangle.faces.push( new THREE.Face3( 0, 1, 2 ) );
    triangle.computeFaceNormals();
    var triangleMesh = new THREE.Mesh(
      triangle,
      new THREE.MeshBasicMaterial()
    )
    triangleMesh.position.set( 0.3 * xrScaler, 0, 0 );
    this.reticle.add( triangleMesh );

    var dashPlane = new THREE.Geometry(); // Dotted Area
    dashPlane.vertices.push( new THREE.Vector3( -4.5 * xrScaler, 0, -4.5 * xrScaler ) );
    dashPlane.vertices.push( new THREE.Vector3( -4.5 * xrScaler, 0, 4.5 * xrScaler ) );
    dashPlane.vertices.push( new THREE.Vector3( 4.5 * xrScaler, 0, 4.5 * xrScaler ) );
    dashPlane.vertices.push( new THREE.Vector3( 4.5 * xrScaler, 0, -4.5 * xrScaler ) );
    dashPlane.vertices.push( new THREE.Vector3( -4.5 * xrScaler, 0, -4.5 * xrScaler ) );
    this.dottedArea = new THREE.Line(
      dashPlane,
      new THREE.LineDashedMaterial( { color: 0xffaa00, dashSize: 1.2 * xrScaler, gapSize: 0.5 * xrScaler } )
    )
    //this.dottedArea.position.set( 4.5, 0, 4.5 );
    this.dottedArea.computeLineDistances();
    this.reticle.add( this.dottedArea );

    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add( this.reticle );

    // Meshes: Invisible Grid Location Helper
    for ( var x = 0; x < mapSize.x; x++ ) {
      for ( var z = 0; z < mapSize.z; z++ ) {
        var plane = new THREE.Mesh(
          new THREE.PlaneBufferGeometry(),
          new THREE.MeshBasicMaterial( { opacity: 0, transparent: true } ) // color: Math.random() * 0xffffff, side: THREE.FrontSide
        );
        plane.position.set( x + 0.5, 0.002, z + 0.5 );
        plane.rotateX( -Math.PI / 2 );
        plane.name = `X${x}Z${z}`;
        this.gridLocHelper.add( plane );
      }
    }
    this.sceneLocHelper.add( this.gridLocHelper );
  }

  initCameraAndRenderer() {
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 ); // FOV, Ratio, Near, Far
    this.camera.position.set( -( mapSize.x / 2.0 ), 15, mapSize.z / 2.0 );
    this.camera.lookAt( this.groundMesh.position );

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.gammaFactor = 2.2;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.xr.enabled = true;
    document.body.appendChild( this.renderer.domElement );
  }

  initXR() {
    // Insert XR button
    if ( navigator.xr ) { // Enter or Exit AR
      navigator.xr.isSessionSupported( "immersive-ar" )
      .then( supported => {
        if ( supported ) {
          xrButton.className = "XRbutton";
          xrButton.innerHTML = "Start AR";
          xrButton.onmouseenter = () => xrButton.style.opacity = "1.0";
          xrButton.onmouseleave = () => xrButton.style.opacity = "0.5";
          xrButton.addEventListener( 'click', () => this.onXRbuttonClick() );
        } else {
          xrButton.className = "XRbutton disabled";
          xrButton.innerHTML = "AR Not Supported";
          xrButton.onmouseenter = null;
          xrButton.onmouseleave = null;
          xrButton.onclick = null;
        }

        topBar.appendChild( xrButton );
      });
    } else { // HTTPS redirect
      const httpsButton = document.createElement( "a" );
      
      if ( window.isSecureContext === false ) {
        httpsButton.className = "XRbutton";
        httpsButton.href = document.location.href.replace( /^http:/, 'https:' );
        httpsButton.innerHTML = "WebXR requires HTTPS";
      } else {
        httpsButton.className = "XRbutton disabled";
        httpsButton.innerHTML = "WebXR not available";
      }

      topBar.appendChild( httpsButton );
    }

    // Event Listener
    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener( "select", e => this.onXRselect( e ) );
    this.scene.add( this.controller );
  }

  animate() {
    this.renderer.setAnimationLoop( ( timestamp, frame ) => {
      var isStatsStarted = false;

      // Start FPS stats
      if ( this.isStatsEnabled ) {
        isStatsStarted = true;
        this.stats.begin();
      }

      this.orbitControls.update();

      // Event under XR mode
      if ( frame ) {
        this.XRhitTest( frame );
        //this.onXRmove();
      }
      
      // Render frame
      this.renderer.render( this.scene, this.camera );

      // End FPS stats
      if ( isStatsStarted ) {
        this.stats.end();
      }
    });
  }

  XRhitTest( frame ) {
    const session = this.renderer.xr.getSession();
    const referenceSpace = this.renderer.xr.getReferenceSpace();

    // Request ReferenceSpace and HitTestSource
    if ( this.hitTestSourceRequested === false ) {
      session.requestReferenceSpace( "viewer" ).then( referenceSpace => {
        session.requestHitTestSource( { space: referenceSpace } ).then( source => {
          this.hitTestSource = source;
        });
      });

      // Clear hitTest on session ends
      session.addEventListener( "end", () => {
        this.hitTestSourceRequested = false;
        this.hitTestSource = null;
      });

      this.hitTestSourceRequested = true;
    }

    // Get hitTest result
    if ( this.hitTestSource ) {
      var hitTestResults = frame.getHitTestResults( this.hitTestSource );

      if ( hitTestResults.length ) {
        var hit = hitTestResults[0];
        this.reticle.visible = true;
        this.reticle.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );
      } else {
        this.reticle.visible = false;
      }
    }

    // Print message for scene locating
    if ( !this.isXRsceneInit ) {
      if ( this.reticle.visible ) {
        this.game.ui.clearPinMessage();
      } else {
        this.game.ui.pinMessage( "Please scan around the plane until reticle appears..." );
      }
    }
  }

  onWindowResize() {
    if ( this.renderer && !this.renderer.xr.isPresenting ) {
      this.camera.aspect = window.innerWidth / ( window.innerHeight );
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
  }

  onMouseMove( event ) {
    this.mouse.set( ( event.offsetX / window.innerWidth ) * 2 - 1, -( event.offsetY / window.innerHeight ) * 2 + 1);
    this.raycaster.setFromCamera( this.mouse, this.camera );

    var intersects = this.raycaster.intersectObject( this.groundMesh );
    if (intersects.length > 0) {
      var intersect = intersects[0];
      this.hintMesh.visible = true;
      this.hintMesh.position.copy( intersect.point )
                      .floor()
                      .add( new THREE.Vector3( 0.5, 0, 0.5 ) );
      this.hintMesh.position.y = 0.5;
    } else {
      this.hintMesh.visible = false;
    }
  }

  onMouseDown( event ) {
    this.mouse.set( ( event.offsetX / window.innerWidth ) * 2 - 1, -( event.offsetY / window.innerHeight ) * 2 + 1);
    this.raycaster.setFromCamera( this.mouse, this.camera );

    var intersects = this.raycaster.intersectObject( this.groundMesh );
    if ( this.hintMesh.visible ) {
      if ( intersects.length > 0 ) {
        var x = this.hintMesh.position.x;
        var z = this.hintMesh.position.z;

        if ( this.game.currItem )
          this.game.placeItemAtTile( x - 0.5, z - 0.5, this.game.currItem );
        else
          this.game.removeItemAtTile( x - 0.5, z - 0.5 );
      }
    }
  }

  onPointerDown( event ) {
    this.mouse.set( ( event.offsetX / window.innerWidth ) * 2 - 1, -( event.offsetY / window.innerHeight ) * 2 + 1);
    this.raycaster.setFromCamera( this.mouse, this.camera );

    var intersects = this.raycaster.intersectObject( this.groundMesh );
    if ( intersects.length > 0 ) {
      var p = intersects[0].point.floor();
      if ( this.game.currItem )
        this.game.placeItemAtTile( p.x, p.z, this.game.currItem );
      else
        this.game.removeItemAtTile( p.x, p.z );
    }
  }

  onXRbuttonClick() {
    if ( this.currentXRSession ) {
      this.currentXRSession.end();
    } else {
      navigator.xr.requestSession( "immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.getElementById( "overlay" ) }
      })
      .then( session => {
        this.toggleOrbitControls( false );
        this.renderer.xr.setReferenceSpaceType( "local" );
        this.renderer.xr.setSession( session );
        xrButton.innerHTML = "Stop AR";
        this.currentXRSession = session;

        // Game Components
        this.scene.background = null;
        this.sceneLocHelper.visible = false;

        session.addEventListener( "end", () => {
          this.toggleOrbitControls( true );
          this.toggleXRsceneButton( false );
          this.currentXRSession = null;
          this.reticle.visible = false;
          xrButton.innerHTML = "Start AR";

          // Game Components
          this.resetXRscene();
          this.scene.background = new THREE.Color( 0x2f2f2f ); // Reset background color
          this.sceneLocHelper.visible = true;
          this.game.ui.clearPinMessage();
        });
      });
    }
  }

  onXRmove() {
    if ( this.isXRsceneInit ) {
      this.raycaster.setFromCamera( { x: 0, y: 0 }, this.camera );
      
      var intersects = this.raycaster.intersectObjects( this.gridLocHelper.children );
      if ( intersects.length > 0 ) console.log( intersects[0].object.position );

      var intersects2 = this.raycaster.intersectObject( this.groundMesh );
      if ( intersects2.length > 0 ) console.log( intersects2[0].object.position );
    }
  }

  onXRselect( event ) {
    if ( !this.isXRsceneInit ) {
      if ( this.reticle.visible ) {
        this.toggleXRsceneButton( true );

        // Init XR scene
        this.sceneLocHelper.setRotationFromMatrix( this.reticle.matrix );
        this.sceneLocHelper.position.copy( new THREE.Vector3().setFromMatrixPosition( this.reticle.matrix ) );
        this.sceneLocHelper.scale.multiplyScalar( xrScaler );
        this.sceneLocHelper.position.sub( new THREE.Vector3(
          ( mapSize.x / 2.0 ) * xrScaler,
          0,
          ( mapSize.z / 2.0 ) * xrScaler,
        ) );
        this.sceneLocHelper.visible = true;
        this.isXRsceneInit = true;

        this.reticle.remove( this.dottedArea );
      } else {
        this.game.ui.showMessage( "You cannot place the scene here." );
      }
    } else {
      if ( this.isXRsceneInit ) {
        var axes = event.data.gamepad.axes;
        this.raycaster.setFromCamera( { x: axes[0], y: -axes[1] }, this.camera );
        /**
         * Inverse control, inacc position
         */
        var intersects = this.raycaster.intersectObjects( this.gridLocHelper.children );

        if ( intersects.length > 0 ) {
          var p = intersects[0].object.position;
          if ( this.game.currItem )
            this.game.placeItemAtTile( p.x - 0.5, p.z - 0.5, this.game.currItem );
          else
            this.game.removeItemAtTile( p.x - 0.5, p.z - 0.5 );
        }
      }
    }
  }

  init() {
    this.data = new Data();

    // Scene
    this.showInitMessage( "Loading Scene..." );
    this.initScene();

    // Camera and Renderer
    this.showInitMessage( "Loading Renderer..." );
    this.initCameraAndRenderer();

    // FPS stats
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.getElementById( "stats" ).appendChild( this.stats.dom );

    // Orbit Camera
    this.orbitControls = new OrbitControls( this.camera, this.renderer.domElement );
    this.orbitControls.target.set( mapSize.x / 2, 0, mapSize.z / 2 );
    this.orbitControls.enablePan = true;
    this.orbitControls.minDistance = 8;
    this.orbitControls.maxDistance = 20;
    this.orbitControls.maxPolarAngle = Math.PI / 2;
    this.orbitControls.saveState();

    // Game Logic
    this.showInitMessage( "Loading Game..." );
    this.game = new Game();
    this.game.init( 1 );

    // Event listener
    window.onresize = () => this.onWindowResize();
    if ( isMobile ) {
      this.renderer.domElement.addEventListener( "pointerdown", e => this.onPointerDown( e ), false );
      topBar.addEventListener( "beforexrselect", ( e ) => e.preventDefault() );
      document.getElementById( "bottomBar" ).addEventListener( "beforexrselect", ( e ) => e.preventDefault() );
    } else {
      this.renderer.domElement.addEventListener( "mousemove", e => this.onMouseMove( e ), false );
      this.renderer.domElement.addEventListener( "pointerdown", e => this.onMouseDown( e ), false );
    }

    // XR and Animation
    this.showInitMessage( "Loading XR..." );
    this.initXR();

    this.showInitMessage( "Loading Complete." );
    setTimeout( () => {
      loadingScreen.className = "fadeout";
      this.animate();
    }, 1000 );
  }

  /**
   * Toggle orbitControls function
   * @param {boolean} bool - true = enable, false = disable
   */
  toggleOrbitControls( bool = false ) {
    if ( bool ) {
      this.orbitControls.enabled = true;
      resetOrbitButton.className = "";
    } else {
      this.orbitControls.enabled = false;
      resetOrbitButton.className = "hidden";
    }
  }
  
  /**
   * Toggle reset scene in XR mode function
   * @param {boolean} bool - true = enable, false = disable
   */
  toggleXRsceneButton( bool = false ) {
    if ( bool ) {
      resetXRsceneButton.className = "";
    } else {
      resetXRsceneButton.className = "hidden";
    }
  }

  /**
   * Toggle FPS stats screen
   * @param {boolean} bool - true = enable, false = disable
   */
  toggleFPSstats( bool = false ) {
    if ( bool ) {
      fpsStats.className = "";
    } else {
      fpsStats.className = "hidden";
    }
  }

  resetXRscene() {
    if ( this.isXRsceneInit ) {
      this.sceneLocHelper.scale.set( 1, 1, 1 );    // Reset scene scale
      this.sceneLocHelper.position.set( 0, 0, 0 ); // Reset scene position
      this.sceneLocHelper.visible = false;
      this.reticle.add( this.dottedArea );
      this.isXRsceneInit = false;
      this.toggleXRsceneButton( false );
    }
  }
}

window.app = new App();