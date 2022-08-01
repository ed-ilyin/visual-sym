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
  Tools,
} from "babylonjs";
import * as cannon from "cannon";
import { WoodProceduralTexture } from "babylonjs-procedural-textures";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

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
  var camera = new ArcRotateCamera("cam", -Math.PI / 2, Math.PI / 2, 10, new Vector3(0, -2, 3), scene);
  camera.wheelDeltaPercentage = 0.01;
  camera.attachControl(canvas, true);

  // Create a basic hemispheric light source and add it to the scene
  var light = new HemisphericLight(
    "light1",
    new Vector3(0, 1, 0),
    scene
  );
  var sphere = Mesh.CreateSphere("sphere", 10.0, 10.0,  scene, false, BABYLON.Mesh.DEFAULTSIDE);

  // Reduce the light intensity to 70%
  light.intensity = 0.7;

  // Create the physics engine
  var cannonPlugin = new CannonJSPlugin(true, 10, cannon);

  //enable physics and set gravity force.
  scene.enablePhysics(new Vector3(0, -3, 0), cannonPlugin);

  // Create the default environment
  const env = scene.createDefaultEnvironment();


  var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  var panel = new GUI.StackPanel();
  panel.width = "220px";
  panel.horizontalAlignment =GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  advancedTexture.addControl(panel);

  var header = new GUI.TextBlock();
  header.text = "Y-rotation: 0 deg";
  header.height = "30px";
  header.color = "white";
  panel.addControl(header); 

  var slider = new GUI.Slider();
  slider.minimum = 0;
  slider.maximum = 2 * Math.PI;
  slider.value = 0;
  slider.isVertical = true;
  slider.height = "200px";
  slider.width = "20px";
  slider.onValueChangedObservable.add(function(value) {
      header.text = "Y-rotation: " + (BABYLON.Tools.ToDegrees(value) | 0) + " deg";
      if (skull) {
          skull.rotation.y = value;
      }
  });
  panel.addControl(slider);    


  // Create a floor in the scene and position it to the center
  //var gymFloor = MeshBuilder.CreateGround("ground", { width: 60, height: 60 }, scene);
  //ymFloor.position = new Vector3(0, -3.5, 0);

  // Create wood materials and texture in the scene
  //var woodMaterial = new StandardMaterial("woodMaterial", scene);
  //var woodTexture = new WoodProceduralTexture("text", 1024, scene);

  // Adjust the texture to look more realistic 
  //woodTexture.ampScale = 80.0;

  // Apply the texture to the material
 // woodMaterial.diffuseTexture = woodTexture;

  // Apply the material to the gym floor mesh object
  //gymFloor.material = woodMaterial;

  // Add physics that simulates the ground
 // gymFloor.physicsImpostor = new PhysicsImpostor(gymFloor, PhysicsImpostor.PlaneImpostor, { mass: 0, restitution: 1 }, scene);

  // Create PhotoDome with a .png image and add it to the scene

  
  // Create the default XR experience
  
  const xr = await scene.createDefaultXRExperienceAsync({
    
  });
  

  // Return the completed scene with camera, lights, an environment, and a Mixed Reality experience
  return scene;
};


//const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", options, scene); 
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