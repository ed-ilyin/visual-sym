'use strict';
import { Colony } from "./colony";
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { NearMenu } from "@babylonjs/gui/3D/controls/nearMenu";
import { Scene } from "@babylonjs/core/scene";
import { Slider3D } from "@babylonjs/gui/3D/controls/slider3D";
import { StackPanel3D } from "@babylonjs/gui/3D/controls/stackPanel3D";
import { TouchHolographicButton } from "@babylonjs/gui/3D/controls/touchHolographicButton";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRFeatureName } from "@babylonjs/core/XR/webXRFeaturesManager";

export function create_menu(scene: Scene, xr: WebXRDefaultExperience, colony: Colony) {

    try {
        xr.baseExperience.featuresManager.enableFeature(WebXRFeatureName.HAND_TRACKING, "latest", { xrInput: xr.input });
    } catch (err) {
        console.log("Articulated hand tracking not supported in this browser.");
    }

    // Manager
    const manager = new GUI3DManager(scene);
    manager.useRealisticScaling = true;

    // Near Menu
    const menu = new NearMenu("NearMenu");
    manager.addControl(menu);
    menu.rows = 3;
    menu.isPinned = false;
    menu.position.y = 1.61;

    // Reset button
    const reset_apply = new TouchHolographicButton();
    menu.addButton(reset_apply);
    reset_apply.onPointerClickObservable.add(() => {
        colony.setQuantity(colony.sps.nbParticles);
    });
    reset_apply.text = "Refresh";
    reset_apply.imageUrl = "https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconRefresh.png"

    // Debug button
    const debug = new TouchHolographicButton();
    menu.addButton(debug);
    debug.onPointerClickObservable.add(async () => {
        debug.dispose()
        await Promise.all([
            import('@babylonjs/core/Debug/debugLayer'), // Augments the scene with the debug methods
            import('@babylonjs/inspector') // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version
        ]);
        scene.debugLayer.show()
    });
    debug.text = "Debug";
    
    // Stack Panel 3D
    const panel = new StackPanel3D();
    menu.addControl(panel);
    manager.addControl(panel);
    panel.position.y = 1
    
    // Slider 3D
    const slider3d = new Slider3D("slider3d", true);
    panel.addControl(slider3d);
    slider3d.scaling.scaleInPlace(20)
    slider3d.minimum = 0
    slider3d.maximum = colony.sps.nbParticles * 2
    slider3d.value = colony.sps.nbParticles
    slider3d.step = 100

    return scene;
};

