import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Checkbox } from "@babylonjs/gui/2D/controls/checkbox";
import { Colony } from "./colony";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { Engine } from "@babylonjs/core/Engines/engine";
import { float, int } from "@babylonjs/core/types";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { randomToCartesian } from "./polar"
import { Scene, WebXRExperienceHelper, WebXRFeatureName } from "@babylonjs/core";
import { Slider } from "@babylonjs/gui/2D/controls/sliders/slider";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Button3D, Control3D, GUI3DManager, HandMenu, MeshButton3D, NearMenu, Slider3D, StackPanel3D, TouchHolographicButton, VolumeBasedPanel } from "@babylonjs/gui";
//import "@babylonjs/loaders"
const worldRadius = 2; // в метрах
const worldCenter = new Vector3(0, worldRadius, 0)
const colonyPosition = randomToCartesian(worldRadius / 2, worldRadius).addInPlace(worldCenter)
const antPopulation = 600
const foodPosition = randomToCartesian(worldRadius / 2, worldRadius).addInPlace(worldCenter)

export class World {
    radius: float = worldRadius // в метрах
    center = worldCenter
    objectsSize: float = 0.2 // в метрах
    scene: Scene
    foodMesh: Mesh
    objectsMaterial: PBRMaterial
    antPolyhedronType: int = 0
    antSize: float = 0.01 // в метрах
    speed: float = 0.002 // в метрах

    async createScene(engine: Engine, canvas: HTMLCanvasElement) {
        // создаём сцену
        this.scene = new Scene(engine);
        var manager = new GUI3DManager(this.scene);
    
        // Fog
        // scene.clearColor = Color3.Black().toColor4();
        this.scene.environmentTexture = CubeTexture.CreateFromPrefilteredData("assets/environment.dds", this.scene);
        // var gl = new GlowLayer("glow", this.scene);
        this.scene.createDefaultSkybox(this.scene.environmentTexture);

        // создаём освещение
        const light = new HemisphericLight("light", new Vector3(worldRadius, worldRadius, -worldRadius), this.scene);

        // создаём камеру
        // const camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(0, 0, 0), this.scene);
        const camera = new ArcRotateCamera(
            "camera",
            -(Math.PI / 3),
            Math.PI / 5 * 2,
            worldRadius * 2,
            worldCenter,
            this.scene);

        camera.attachControl(canvas, true);

        // создаём текстуру для дома и еды
        this.objectsMaterial = new PBRMaterial("this.objectsMaterial", this.scene);
        this.objectsMaterial.metallic = 0.0;
        this.objectsMaterial.roughness = 0;
        this.objectsMaterial.subSurface.isRefractionEnabled = true;

        // создаём еду
        this.foodMesh = MeshBuilder.CreateCapsule(
            "food",
            { height: this.objectsSize, radius: this.objectsSize / 4 },
            this.scene);

        this.foodMesh.material = this.objectsMaterial;
        this.foodMesh.position = foodPosition

        // создаём муравьёв
        const colony = new Colony(this, colonyPosition, antPopulation);
    

        // UI
        

        var manager = new GUI3DManager(this.scene);

        // Let's add a slate
        var near = new  NearMenu("near");
        manager.addControl(near);
        
        var button0 = new TouchHolographicButton("button0");
        button0.imageUrl = "https://ichef.bbci.co.uk/news/976/cpsprodpb/1374A/production/_124309697_djigettyimages-1353421153.jpg";
        button0.text = "Button 0";
        near.addButton(button0);
        
        var button1 = new TouchHolographicButton("button1");
        button1.imageUrl = "https://ichef.bbci.co.uk/news/976/cpsprodpb/1374A/production/_124309697_djigettyimages-1353421153.jpg";
        button1.text = "Button 1";
        near.addButton(button1);
        
        var button2 = new TouchHolographicButton("button2");
        button2.imageUrl = "https://ichef.bbci.co.uk/news/976/cpsprodpb/1374A/production/_124309697_djigettyimages-1353421153.jpg";
        button2.text = "Button 2";
        near.addButton(button2);

 
      
        return this.scene;

    }
}
