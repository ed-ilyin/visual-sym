import { Mesh } from "@babylonjs/core/Meshes/mesh";

export class Food {
    mesh: Mesh;
    amout_food: number;
    original_size: number;

    constructor(mesh: Mesh, amount_food: number, original_size: number) {
        this.mesh = mesh;
        this.amout_food = amount_food;
        this.original_size = original_size;
    }
}
