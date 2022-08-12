'use strict';
import { Colony } from "./colony";
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { NearMenu } from "@babylonjs/gui/3D/controls/nearMenu";
import { Scene } from "@babylonjs/core/scene";
import { TouchHolographicButton } from "@babylonjs/gui/3D/controls/touchHolographicButton";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRFeatureName } from "@babylonjs/core/XR/webXRFeaturesManager";
import {Slider3D, StackPanel3D} from "@babylonjs/gui";
import { Vector3 } from "@babylonjs/core";


export function create_menu(scene: Scene, xr: WebXRDefaultExperience, colony: Colony) {

    try {
        xr.baseExperience.featuresManager.enableFeature(WebXRFeatureName.HAND_TRACKING, "latest", { xrInput: xr.input });
    } catch (err) {
        console.log("Articulated hand tracking not supported in this browser.");
    }

    var manager = new GUI3DManager(scene);


    manager.useRealisticScaling=true;

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
        await Promise.all([
         import('@babylonjs/core/Debug/debugLayer'), // Augments the scene with the debug methods
         import('@babylonjs/inspector') // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version
        ]);
        scene.debugLayer.show()
    });
    debug.text = "Debug";
    menu.addButton(debug);


    // Create a horizontal stack panel
    var panel = new StackPanel3D();
    panel.margin = 0.05;
    panel.isVertical = false;
    panel.position.x=10;
    panel.position.y=10;
    panel.position.z=10;
  
    manager.addControl(panel);
    panel.position.z = -1.5;

    
   


    var slider4 = new Slider3D("slider4", true);
  //  menu.addControl(slider4);// tak ne rabotaet
  panel.addControl(slider4); // tak rabotaet
    slider4.maximum =  2 * Math.PI;
    slider4.scaling.x = 20;
    slider4.scaling.y = 20;
    slider4.scaling.z = 20;

    slider4.position.x = 15;
    slider4.position.y = 50;
    //slider4.node.addRotation(0, 0, -Math.PI / 2);
    slider4.onValueChangedObservable.add(function () {
        //sphere.rotation.x = value;
        //sphere.rotation.y = value;
    });

    scene.onAfterRenderObservable.add(() => {
        if (slider4.mesh && !slider4.mesh.behaviors[0].dragging) {
            slider4.value = (slider4.value + 0.01) % slider4.maximum;

            // workaround for position visual update bug, copied straight from slider3D.ts:
            const position = ((slider4.value - slider4.minimum) / (slider4.maximum - slider4.minimum)) * (slider4.end - slider4.start) + slider4.start;
            slider4.mesh.position.x = Math.min(Math.max(position, slider4.start), slider4.end);
        }
    });
    menu.addControl(panel);
    return scene;
};

