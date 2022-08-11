'use strict';
import { Vector3, WebXRDefaultExperience, WebXRFeatureName } from "@babylonjs/core";
import { Scene } from "@babylonjs/core/scene";
import { GUI3DManager, HandMenu, NearMenu, TouchHolographicButton, TouchHolographicMenu } from "@babylonjs/gui";

export var create_menu = function (scene: Scene, xr: WebXRDefaultExperience) {
    // xr.baseExperience.camera.position = new Vector3(0, 0, -0.3);
    try {
        xr.baseExperience.featuresManager.enableFeature(WebXRFeatureName.HAND_TRACKING, "latest", { xrInput: xr.input });
    } catch (err) {
        console.log("Articulated hand tracking not supported in this browser.");
    }

    var manager = new GUI3DManager(scene);
    manager.useRealisticScaling = true;

    // Create buttons
    // Text and Icon button
    var touchHoloButton = new TouchHolographicButton("TouchHoloButton");
    manager.addControl(touchHoloButton);
    touchHoloButton.position = new Vector3(0.1, 1.8, 0);
    touchHoloButton.text = "Alert Me";
    touchHoloButton.imageUrl = "https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconStar.png";
    touchHoloButton.onPointerDownObservable.add(() => {
        alert("You've got mail")
    });

    // Text only button
    var touchHoloTextButton = new TouchHolographicButton("TouchHoloTextButton");
    manager.addControl(touchHoloTextButton);
    touchHoloTextButton.position = new Vector3(0.05, 1.8, 0);
    touchHoloTextButton.text = "Text Me";
    touchHoloTextButton.onPointerDownObservable.add(() => {
        alert("I display texts")
    });
    // Create Near Menu with Touch Holographic Buttons + behaviour
    var nearMenu = new NearMenu("NearMenu");
    nearMenu.rows = 3;
    manager.addControl(nearMenu);
    nearMenu.isPinned = true;
    nearMenu.position.y = 1.61;

    addMenuButtons(nearMenu);

    // Create Hand Menu with Touch Holographic Buttons + behaviour
    var handMenu = new HandMenu(xr.baseExperience, "HandMenu");
    manager.addControl(handMenu);

    addMenuButtons(handMenu);

    return scene;
};

var addMenuButtons = function (menu: TouchHolographicMenu) {
    var button1 = new TouchHolographicButton();
    var button2 = new TouchHolographicButton();
    var button3 = new TouchHolographicButton();

    menu.addButton(button1);
    menu.addButton(button2);
    menu.addButton(button3);

    button1.text = "Refresh";
    button1.imageUrl = "https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconRefresh.png"
    button2.text = "Message";
    button2.imageUrl = "https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconMessage.png"
    button3.text = "Close";
    button3.imageUrl = "https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconClose.png"
}

