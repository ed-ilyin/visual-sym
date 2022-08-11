import { WebXRDefaultExperience, WebXRFeatureName } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { GUI3DManager, NearMenu, TouchHolographicButton, TouchHolographicMenu } from "@babylonjs/gui";
import { Colony } from "./colony";
export var create_menu = function (scene: Scene, xr: WebXRDefaultExperience, colony: Colony) {
    // xr.baseExperience.camera.position = new Vector3(0, 0, -0.3);
    try {
        xr.baseExperience.featuresManager.enableFeature(WebXRFeatureName.HAND_TRACKING, "latest", { xrInput: xr.input });
    } catch (err) {
        console.log("Articulated hand tracking not supported in this browser.");
    }
    var manager = new GUI3DManager(scene);
    manager.useRealisticScaling = true;
    var nearMenu = new NearMenu("NearMenu");
    nearMenu.rows = 3;
    manager.addControl(nearMenu);
    nearMenu.isPinned = false;
    nearMenu.position.y = 1.61;
    addMenuButtons(nearMenu, colony);
    return scene;
};
var addMenuButtons = function (menu: TouchHolographicMenu, colony: Colony) {
    var reset_apply = new TouchHolographicButton();
    reset_apply.onPointerClickObservable.add(() => {
        colony.createSPS(Math.random() * 1000);
        alert("vot i gadai");
    });
    menu.addButton(reset_apply);
    reset_apply.text = "Refresh";
    reset_apply.imageUrl = "https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconRefresh.png"
}

