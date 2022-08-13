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
import environment from './textures/environment.dds?url';
import { woodFloor } from "./wood-plank";

const worldRadius = 2; // в метрах
const worldCenter = new Vector3(0, worldRadius, 0)
const colonyPosition = randomToCartesian(worldRadius, worldRadius).addInPlace(worldCenter)
const colonySpeed = 0.005
const antPopulation = 500
const foodPosition: Vector3[] =
    [...Array(3)].map(() =>
        randomToCartesian(worldRadius, worldRadius).addInPlace(worldCenter))

export class World {
    radius: float = worldRadius // в метрах
    center = worldCenter
    objectsSize: float = 0.2 // в метрах
    scene!: Scene;
    foodMesh: Mesh[] = []
    glassMaterial!: PBRMaterial;
    antPolyhedronType: int = 0
    antSize: float = 0.01 // в метрах
    speed: float = colonySpeed // в метрах
    attraction: float = Math.sqrt(colonySpeed) / 10000
    acrCamera!: ArcRotateCamera

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

        this.acrCamera = new ArcRotateCamera(
            "arc",
            (Math.PI / 5 * 6),
            Math.PI / 2,
            worldRadius * 3,
            worldCenter,
            this.scene);

        this.acrCamera.minZ = 0.01;
        this.acrCamera.wheelDeltaPercentage = 0.01;
        this.acrCamera.attachControl(canvas, true);
        // this.acrCamera.useAutoRotationBehavior = true;

        // создаём текстуру для дома и еды
        this.glassMaterial = new PBRMaterial("glass", this.scene);
        this.glassMaterial.metallic = 0.0;
        this.glassMaterial.roughness = 0;
        this.glassMaterial.subSurface.isRefractionEnabled = true;
        // создаём еду

        this.foodMesh = foodPosition.map((position, i) => {
            const food = MeshBuilder.CreateCapsule(
                `food${i}`,
                { height: this.objectsSize, radius: this.objectsSize / 4 },
                this.scene)
            food.position = position
            food.material = this.glassMaterial
            return food
        });

        const colony = new Colony(this, colonyPosition, antPopulation);

        // here we add XR support

        let ground = woodFloor(this.scene, worldRadius * 4, this.scene.environmentTexture)

        await this.scene.createDefaultXRExperienceAsync({
            floorMeshes: [ground]
        });

        //const sessionManager = await xr.baseExperience.enterXRAsync("immersive-vr", "local-floor" /*, optionalRenderTarget */ );

        create_menu(this.scene, colony);

        return this.scene;
    };


}
