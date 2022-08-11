'use strict';
import { Colony } from "./colony";
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { NearMenu } from "@babylonjs/gui/3D/controls/nearMenu";
import { Scene } from "@babylonjs/core/scene";
import { TouchHolographicButton } from "@babylonjs/gui/3D/controls/touchHolographicButton";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRFeatureName } from "@babylonjs/core/XR/webXRFeaturesManager";

export function create_menu(scene: Scene, xr: WebXRDefaultExperience, colony: Colony) {

    try {
        xr.baseExperience.featuresManager.enableFeature(WebXRFeatureName.HAND_TRACKING, "latest", { xrInput: xr.input });
    } catch (err) {
        console.log("Articulated hand tracking not supported in this browser.");
    }

    const manager = new GUI3DManager(scene);
    manager.useRealisticScaling = true;
    const menu = new NearMenu("NearMenu");
    menu.rows = 3;
    manager.addControl(menu);
    menu.isPinned = false;
    menu.position.y = 1.61;

    const reset_apply = new TouchHolographicButton();
    reset_apply.onPointerClickObservable.add(() => {
        colony.setQuantity(colony.sps.nbParticles);
    });
    reset_apply.text = "Refresh";
    reset_apply.imageUrl = "https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconRefresh.png"
    menu.addButton(reset_apply);

    const debug = new TouchHolographicButton();
    debug.onPointerClickObservable.add(async () => {
        menu.removeControl(debug);
        debug.dispose()
        await import('@babylonjs/core/Debug/debugLayer'); // Augments the scene with the debug methods
        await import('@babylonjs/inspector'); // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version
        scene.debugLayer.show()
    });
    debug.text = "Debug";
    menu.addButton(debug);
}
