import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { float } from '@babylonjs/core/types'
// import { World } from './world'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { PBRMaterial, Scene, SixDofDragBehavior } from '@babylonjs/core'
import { randomToCartesian } from './polar'
import { World } from './world'

export class Food {
    mesh: Mesh
    volume: number
    original_volume: number

    constructor(volume: float, scene: Scene) {
        this.volume = volume
        this.original_volume = volume

        const object = MeshBuilder.CreateCapsule(
            `food${Math.random()}}`,
            { height: volume / 50, radius: volume / 200 },
            scene
        )
        this.mesh = object
        this.mesh.position = randomToCartesian(
            World.worldRadius(),
            World.worldRadius()
        ).addInPlace(World.worldCenter())
        // создаём текстуру для дома и еды
        const glassMaterial = new PBRMaterial('glass', scene)
        glassMaterial.metallic = 0.0
        glassMaterial.roughness = 0
        glassMaterial.subSurface.isRefractionEnabled = true
        this.mesh.material = glassMaterial
        const sixDofDragBehavior = new SixDofDragBehavior()
        this.mesh.addBehavior(sixDofDragBehavior)
    }
}
