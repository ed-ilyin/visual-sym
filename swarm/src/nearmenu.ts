'use strict';
import { Colony } from "./colony";
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { Scene } from "@babylonjs/core/scene";
import { TouchHolographicButton } from "@babylonjs/gui/3D/controls/touchHolographicButton";
import { HolographicSlate } from "@babylonjs/gui/3D/controls/holographicSlate";
import { CheckboxGroup, SelectionPanel, SliderGroup } from "@babylonjs/gui/2D/controls";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";

export function create_menu(scene: Scene, colony: Colony) {

    // Manager
    const manager = new GUI3DManager(scene);
    manager.useRealisticScaling = true;

    // Holographic Slate
    const slate = new HolographicSlate()
    slate.title = "Colony";
    slate.dimensions = new Vector2(16, 18);
    slate.titleBarHeight = 1.5
    manager.addControl(slate);

    // Selection Panel
    const selector = new SelectionPanel("selector");
    selector.color = "#123e"
    selector.background = "#edce"
    selector.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    selector.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    selector.height = "100%";

    slate.content = selector
    // selector.height = 10
    var toSize = function (isChecked: boolean) {
        if (isChecked) {
        }
        else {
        }
    }
    const transformGroup = new CheckboxGroup("Поотмечаем");
    transformGroup.addCheckbox("Small", toSize);
    transformGroup.addCheckbox("High", console.log);

    const sliderGroup = new SliderGroup("Подвигаем");
    sliderGroup.addSlider("Скорость", (value) => colony.world.speed = value, "м/с", 0, 0.1, 0.005)
    sliderGroup.addSlider("Популяция", console.log, "штук", 0, 2000, 500);

    selector.addGroup(transformGroup);
    selector.addGroup(sliderGroup);

    // Reset button
    const reset_apply = new TouchHolographicButton();
    // menu.addButton(reset_apply);
    // sphere.addControl(reset_apply);
    // stack.addControl(reset_apply);
    reset_apply.onPointerClickObservable.add(() => {
        colony.setQuantity(colony.sps.nbParticles);
    });
    reset_apply.text = "Refresh";
    reset_apply.imageUrl = "https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconRefresh.png"

    // Debug button
    const debug = new TouchHolographicButton();
    // menu.addButton(debug);
    // sphere.addControl(debug);
    debug.onPointerClickObservable.add(async () => {
        debug.dispose()
        await Promise.all([
            import('@babylonjs/core/Debug/debugLayer'), // Augments the scene with the debug methods
            import('@babylonjs/inspector') // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version
        ]);
        scene.debugLayer.show()
    });
    debug.text = "Debug";

    return scene;
};

