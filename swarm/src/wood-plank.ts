import { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { float } from "@babylonjs/core/types";
import reflectivity from './textures/reflectivity.png';
import albedo from './textures/albedo.png';

export function woodFloor(scene: Scene, size: float, eqTexture: BaseTexture) {

    const wood = new PBRMaterial("wood", scene);
    wood.reflectionTexture = eqTexture;
    wood.environmentIntensity = 1;
    wood.specularIntensity = 0.3;

    wood.reflectivityTexture = new Texture(reflectivity, scene);
    wood.useMicroSurfaceFromReflectivityMapAlpha = true;

    wood.albedoColor = Color3.White();
    wood.albedoTexture = new Texture(albedo, scene);

    const woodPlank =
        MeshBuilder.CreateBox("plane", { width: size, height: 0.1, depth: size }, scene);

    woodPlank.material = wood;

    // const ground = MeshBuilder.CreateGround(
    //     "ground",
    //     { width: size, height: size },
    //     scene
    // );

    // ground.material = this.objectsMaterial;
    return woodPlank
}