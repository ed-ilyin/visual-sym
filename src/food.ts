import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { float } from '@babylonjs/core/types'
// import { World } from './world'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { SixDofDragBehavior } from '@babylonjs/core'

export class Food {
    mesh: Mesh
    volume: number
    original_volume: number

    constructor(volume: float) {
        this.volume = volume
        this.original_volume = volume

        const object = MeshBuilder.CreateCapsule(
            `food${i}`,
            { height: food_amount / 50, radius: food_amount / 200 },
            this.scene
        )
        const food = new Food(object, food_amount)
        food.mesh.position = position
        food.mesh.material = this.glassMaterial
        const sixDofDragBehavior = new SixDofDragBehavior()
        food.mesh.addBehavior(sixDofDragBehavior)
        this.mesh = mesh
        this.volume = amount_food
        this.original_volume = amount_food
    }
}
