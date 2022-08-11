'use strict';
import './style.css'
import "@babylonjs/loaders/glTF";
import { Engine } from "@babylonjs/core/Engines/engine";
import { World } from "./world";

const canvas = document.getElementById("app") as HTMLCanvasElement;

const createDefaultEngine = () =>
  new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

// Load the 3D engine
var engine: Engine

// Create a default engine to load the scene
try { engine = createDefaultEngine(); } catch (e) {
  console.log(
    "the available createEngine function failed. Creating the default engine instead"
  );

  engine = createDefaultEngine();
}

if (!engine) throw "engine should not be null.";

//Create the scene
new World().createScene(engine, canvas).then(sceneToRender => {
  engine.runRenderLoop(() => sceneToRender.render());
});

// Resize the engine to fit the scene
window.addEventListener("resize", () => engine.resize());

