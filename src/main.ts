'use strict'
import './style.css'
// import { Engine } from "@babylonjs/core/Engines/engine";
// import { World } from "./world";
// Required for EnvironmentHelper
import('@babylonjs/core/Materials/Textures/Loaders')
// Enable GLTF/GLB loader for loading controller models from WebXR Input registry
import('@babylonjs/loaders/glTF')
// Without this next import, an error message like this occurs loading controller models:
//  Build of NodeMaterial failed" error when loading controller model
//  Uncaught (in promise) Build of NodeMaterial failed: input rgba from block
//  FragmentOutput[FragmentOutputBlock] is not connected and is not optional.
import('@babylonjs/core/Materials/Node/Blocks')

void (async () => {
    const canvas = document.getElementById('app') as HTMLCanvasElement

    // Load the 3D engine
    const engines = await import('@babylonjs/core/Engines/engine')
    const engine = new engines.Engine(canvas, true)

    //Create the scene
    const world = await import('./world')
    const scene = await new world.World().createScene(engine, canvas, true)
    //DEBUG
    engine.runRenderLoop(() => scene.render())

    // Resize the engine to fit the scene
    window.addEventListener('resize', () => engine.resize())
})()
