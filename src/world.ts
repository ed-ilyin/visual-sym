'use strict'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { Colony } from './colony'
import { create_menu } from './nearmenu'
import { CubeTexture } from '@babylonjs/core/Materials/Textures/cubeTexture'
import { Engine } from '@babylonjs/core/Engines/engine'
import { float, int } from '@babylonjs/core/types'
import { Food } from './food'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { randomToCartesian } from './polar'
import { Scene } from '@babylonjs/core'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { woodFloor } from './wood-plank'
import environment from './textures/environment.dds?url'

const worldRadius = 2 // в метрах
const worldCenter = new Vector3(0, worldRadius, 0)
const colonyPosition = randomToCartesian(worldRadius, worldRadius).addInPlace(
    worldCenter
)
const colonySpeed = 0.01
const antPopulation = 500

export class World {
    radius: float = worldRadius // в метрах
    center = worldCenter
    objectsSize: float = 0.2 // в метрах
    scene!: Scene
    foods: Food[] = []
    glassMaterial!: PBRMaterial
    antPolyhedronType: int = 0
    antSize: float = 0.01 // в метрах
    speed: float = colonySpeed // в метрах
    attraction: float = Math.pow(colonySpeed, 2) / 2
    acrCamera!: ArcRotateCamera

    static worldRadius() {
        return worldRadius
    }
    static worldCenter() {
        return worldCenter
    }

    async createScene(
        engine: Engine,
        canvas: HTMLCanvasElement,
        create_ant: boolean
    ) {
        // создаём сцену
        this.scene = new Scene(engine)

        this.foods = [
            new Food(10, this.scene),
            new Food(10, this.scene),
            new Food(10, this.scene)
        ]
        this.scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
            environment,
            this.scene
        )
        this.scene.createDefaultSkybox(this.scene.environmentTexture)
        // создаём освещение
        new HemisphericLight(
            'light',
            new Vector3(worldRadius, worldRadius, -worldRadius),
            this.scene
        )
        // создаём камеру
        this.acrCamera = new ArcRotateCamera(
            'arc',
            (Math.PI / 3) * 5,
            Math.PI / 2,
            worldRadius * 3,
            worldCenter,
            this.scene
        )

        if (create_ant) {
            this.acrCamera.minZ = 0.01
            this.acrCamera.wheelDeltaPercentage = 0.01
            this.acrCamera.attachControl(canvas, true)

            // создаём текстуру для дома и еды
            this.glassMaterial = new PBRMaterial('glass', this.scene)
            this.glassMaterial.metallic = 0.0
            this.glassMaterial.roughness = 0
            this.glassMaterial.subSurface.isRefractionEnabled = true
            // создаём еду

            const colony = new Colony(this, colonyPosition, antPopulation)
            create_menu(this.scene, colony)
        }

        // here we add XR support

        const ground = woodFloor(
            this.scene,
            worldRadius * 4,
            this.scene.environmentTexture
        )

        await this.scene.createDefaultXRExperienceAsync({
            floorMeshes: [ground]
        })

        return this.scene
    }
}
