'use strict';
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Colony } from "./colony";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { Engine } from "@babylonjs/core/Engines/engine";
import { float, int } from "@babylonjs/core/types";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { randomToCartesian } from "./polar"
import { Scene } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { create_menu } from "./nearmenu";
import environment from './environment.dds?url';

const worldRadius = 2; // в метрах
const worldCenter = new Vector3(0, worldRadius, 0)
const colonyPosition = randomToCartesian(worldRadius, worldRadius).addInPlace(worldCenter)
const antPopulation = 600
const foodPosition: Vector3[] =
    [...Array(3)].map(() =>
        randomToCartesian(worldRadius, worldRadius).addInPlace(worldCenter))
// console.log(foodPosition)

export class World {
    radius: float = worldRadius // в метрах
    center = worldCenter
    objectsSize: float = 0.2 // в метрах
    scene!: Scene;
    foodMesh: Mesh[] = []
    objectsMaterial!: PBRMaterial;
    antPolyhedronType: int = 0
    antSize: float = 0.01 // в метрах
    speed: float = 0.005 // в метрах

    async createScene(engine: Engine, canvas: HTMLCanvasElement) {
        // создаём сцену
        this.scene = new Scene(engine);
        // Fog
        // scene.clearColor = Color3.Black().toColor4();
        this.scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(environment, this.scene);
        // const gl = new GlowLayer("glow", this.scene);
        this.scene.createDefaultSkybox(this.scene.environmentTexture);
        // создаём освещение
        new HemisphericLight("light", new Vector3(worldRadius, worldRadius, -worldRadius), this.scene);
        // создаём камеру
    
        const camera = new ArcRotateCamera(
            "camera",
            -(Math.PI / 3),
            Math.PI / 5 * 2,
            worldRadius * 2,
            worldCenter,
            this.scene);
        
        camera.minZ = 0.01;
        camera.wheelDeltaPercentage = 0.01;
        camera.attachControl(canvas, true);

        // создаём текстуру для дома и еды
        this.objectsMaterial = new PBRMaterial("this.objectsMaterial", this.scene);
        this.objectsMaterial.metallic = 0.0;
        this.objectsMaterial.roughness = 0;
        this.objectsMaterial.subSurface.isRefractionEnabled = true;
        // создаём еду

        this.foodMesh = foodPosition.map((position) => {
            const food = MeshBuilder.CreateCapsule(
                `food${position}`,
                { height: this.objectsSize, radius: this.objectsSize / 4 },
                this.scene)
            food.position = position
            food.material = this.objectsMaterial
            return food
        });
        new Colony(this, colonyPosition, antPopulation);

        // here we add XR support

        const ground = MeshBuilder.CreateGround("ground",
            { width: worldRadius * 8, height: worldRadius * 8 },
            this.scene);

        ground.material = this.objectsMaterial;

        const xr = await this.scene.createDefaultXRExperienceAsync({
            floorMeshes: [ground]
        });
        //const sessionManager = await xr.baseExperience.enterXRAsync("immersive-vr", "local-floor" /*, optionalRenderTarget */ );

        create_menu(this.scene, xr);
        

        return this.scene;
    };


}
