import {
  Scene,
  HemisphericLight,
  Vector3,
  Engine,
  ArcRotateCamera,
  CannonJSPlugin,
  MeshBuilder,
  StandardMaterial,
  PhotoDome,
  PhysicsImpostor,
  Mesh,
  Vector2,
  ParticleSystem,
  Texture
} from "babylonjs";
import * as cannon from "cannon";
import { WoodProceduralTexture } from "babylonjs-procedural-textures";
import { GridMaterial } from "babylonjs-materials";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

export interface Skudra  {
  sphere:Mesh,
  message:Vector2
};


// Load the 3D engine
var engine: Engine = null;
var sceneToRender = null;
var createDefaultEngine = function () {
  return new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
};

// Function to create a scene with camera, lights, an environment, and a Mixed Reality experience
var createScene = async function () {
  // Create the scene and the camera
  var scene = new Scene(engine);
  var camera = new ArcRotateCamera("cam", -Math.PI, Math.PI, 10, new Vector3(0, -2, 3), scene);
  camera.wheelDeltaPercentage = 0.01;
  camera.attachControl(canvas, true);

  // Create a basic hemispheric light source and add it to the scene
  var light = new HemisphericLight(
    "light1",
    new Vector3(0, 1, 0),
    scene
  );

  // Reduce the light intensity to 70%
  //light.intensity = 0.5;

  // Create the physics engine
  var cannonPlugin = new CannonJSPlugin(true, 10, cannon);

  //enable physics and set gravity force.
  //scene.enablePhysics(new Vector3(0, -3, 0), cannonPlugin);

  // Create the default environment
  const env = scene.createDefaultEnvironment();




  
  



  


  // Create a floor in the scene and position it to the center
  //var gymFloor = MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
  //ymFloor.position = new Vector3(0, -3.5, 0);

  // Create wood materials and texture in the scene
  var woodMaterial = new StandardMaterial("woodMaterial", scene);
  var woodTexture = new WoodProceduralTexture("text", 1024, scene);


  
  const xr = await scene.createDefaultXRExperienceAsync({
    
  });

  const ground = MeshBuilder.CreateGround("ground", {width: 25, height: 25});

       // Ground for positional reference
       //const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 25, height: 25});
       ground.material = new GridMaterial("groundMat",scene);
       ground.material.backFaceCulling = false;
       const myParticleSystem = new ParticleSystem("particles", 2000, scene); 
       myParticleSystem.particleTexture = new Texture("https://upload.wikimedia.org/wikipedia/commons/c/c2/Deus_drone.png", scene);
        // Position where the particles are emiited from
        myParticleSystem.emitter = new Vector3(0, 0.5, 0);

        myParticleSystem.start();
  // Return the completed scene with camera, lights, an environment, and a Mixed Reality experience
  return scene;
}






//
// Create a default engine to load the scene
try {
  engine = createDefaultEngine();
} catch (e) {
  console.log(
    "the available createEngine function failed. Creating the default engine instead"
  );
  engine = createDefaultEngine();
}
if (!engine) throw "engine should not be null.";

// Create the scene
createScene().then((returnedScene) => {
  sceneToRender = returnedScene;
});

// Render the scene by using the engine
engine.runRenderLoop(function () {
  if (sceneToRender) {
    sceneToRender.render();
  }
});

// Resize the engine to fit the scene
window.addEventListener("resize", function () {
  engine.resize();
});


function do_step(value) {
  let random_direction=getRandomInt(3);
  console.log(random_direction);
  if (random_direction == 1 ){
    let x=value.sphere.position.x+0.05;
    let y=value.sphere.position.y;
    let z=value.sphere.position.z;
    value.sphere.position=new Vector3(x,y,z);

  }
  if (random_direction == 2 ){
    let x=value.sphere.position.x;
    let y=value.sphere.position.y+0.05;
   
    let z=value.sphere.position.z;
    value.sphere.position=new Vector3(x,y,z);
  }
  if (random_direction == 3){
    let x=value.sphere.position.x;
    let y=value.sphere.position.y;
    let z=value.sphere.position.z+0.05;
    value.sphere.position=new Vector3(x,y,z);
  }

 
  
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
