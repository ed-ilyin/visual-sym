import { Color3, Mesh, Vector3, WebXRFeatureName } from "@babylonjs/core";
import { GUI3DManager, HandMenu, NearMenu, TouchHolographicButton } from "@babylonjs/gui";

export var create_menu = function (scene: { createDefaultXRExperienceAsync: () => Promise<any>; },home: Mesh) {
    var manager = new GUI3DManager();

    scene.createDefaultXRExperienceAsync().then((xr) => {
        xr.baseExperience.camera.position = new Vector3(0, 0, -0.3);
        try {
            xr.baseExperience.featuresManager.enableFeature(WebXRFeatureName.HAND_TRACKING, "latest", {xrInput: xr.input});
        } catch (err) {
            console.log("Articulated hand tracking not supported in this browser.");
        }

        manager.useRealisticScaling = true;

        // Create buttons
        // Text and Icon button
        var touchHoloButton = new TouchHolographicButton("TouchHoloButton");
        manager.addControl(touchHoloButton);
        touchHoloButton.position = new Vector3(0.1, 1.8, 0);
        touchHoloButton.text = "Alert Me";
        touchHoloButton.imageUrl = "https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconStar.png";
        touchHoloButton.onPointerDownObservable.add(()=>{
            alert("You've got mail")
        });

        // Text only button
        var touchHoloTextButton = new TouchHolographicButton("TouchHoloTextButton");
        manager.addControl(touchHoloTextButton);
        touchHoloTextButton.position = new Vector3(0.05, 1.8, 0);
        touchHoloTextButton.text = "Text Me";
        touchHoloTextButton.onPointerDownObservable.add(()=>{
            alert("I display texts")
        });
        // Create Near Menu with Touch Holographic Buttons + behaviour
        var nearMenu = new NearMenu("NearMenu");
        nearMenu.rows = 3;
        manager.addControl(nearMenu);
        nearMenu.isPinned = true;
        nearMenu.position.y = 1.61;
        
        addNearMenuButtons(nearMenu);

        // Create Hand Menu with Touch Holographic Buttons + behaviour
        var handMenu = new HandMenu(xr.baseExperience, "HandMenu");
        manager.addControl(handMenu);
        
        addHandMenuButtons(handMenu);

    });

    return scene;
};

var addNearMenuButtons = function(menu: NearMenu) {
    var button1 = new TouchHolographicButton();
    var button2 = new TouchHolographicButton();
    var button3 = new TouchHolographicButton();
    var button4 = new TouchHolographicButton();
    var button5 = new TouchHolographicButton();
    var button6 = new TouchHolographicButton();

    menu.addButton(button1);
    menu.addButton(button2);
    menu.addButton(button3);
    menu.addButton(button4);
    menu.addButton(button5);
    menu.addButton(button6);

    button1.text = "Blue";
    button2.text = "Red";
    button3.text = "Green";
    button4.text = "Purple";
    button5.text = "Yellow";
    button6.text = "Teal";

    button1.onPointerDownObservable.add(()=>{alert("work")});
    button2.onPointerDownObservable.add(()=>{alert("work")});
    button3.onPointerDownObservable.add(()=>{alert("work")});
    button4.onPointerDownObservable.add(()=>{alert("work")});
    button5.onPointerDownObservable.add(()=>{alert("work")});
    button6.onPointerDownObservable.add(()=>{alert("work")});
};

var addHandMenuButtons = function (menu: HandMenu){
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

