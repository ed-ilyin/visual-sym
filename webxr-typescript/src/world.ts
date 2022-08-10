import { Scene } from "@babylonjs/core";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Checkbox } from "@babylonjs/gui/2D/controls/checkbox";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Slider } from "@babylonjs/gui/2D/controls/sliders/slider";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { Colony } from "./colony";
import { randomToCartesian } from "./polar"

const daudzums = 600
const objectsSize = 0.2; // в метрах
const outerSphere = 2; // в метрах
const home = new Vector3(0, outerSphere, 0)
const foodPosition = randomToCartesian(outerSphere / 2, outerSphere - objectsSize).addInPlace(home)
const showBoundingBoxes = false

export async function createWorld(
    engine: Engine,
    canvas: HTMLCanvasElement
) {
    // создаём сцену
    const scene = new Scene(engine);
    // Fog
    // scene.fogMode = Scene.FOGMODE_EXP;
    // scene.fogDensity = 0.05;
    // scene.clearColor = Color3.Black().toColor4();
    scene.environmentTexture = CubeTexture.CreateFromPrefilteredData("assets/environment.dds", scene);
    // var gl = new GlowLayer("glow", scene);
    scene.createDefaultSkybox(scene.environmentTexture);

    // создаём освещение
    const light = new HemisphericLight("light", new Vector3(outerSphere, outerSphere, -1), scene);

    // создаём камеру
    // scene.createDefaultCamera(true, true, true);
    // const camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(0, 0, 0), scene);
    const camera = new ArcRotateCamera("camera", -(Math.PI / 3), Math.PI / 5 * 2, outerSphere * 2, home, scene);
    // camera.setTarget(home);
    camera.attachControl(canvas, true);

    // создаём текстуру для дома и еды
    const pbr = new PBRMaterial("pbr", scene);
    pbr.metallic = 0.0;
    pbr.roughness = 0;
    pbr.subSurface.isRefractionEnabled = true;

    // создаём дом
    const maja = MeshBuilder.CreateSphere("maja", { diameter: objectsSize }, scene);
    // const maja = MeshBuilder.CreateBox("maja", { size: objectsSize }, scene);
    maja.material = pbr;
    maja.position = home
    const h = objectsSize / Math.PI
    maja.setBoundingInfo(new BoundingInfo(new Vector3(-h, -h, -h), new Vector3(h, h, h)))
    maja.showBoundingBox = showBoundingBoxes

    // создаём еду
    // const bariba = MeshBuilder.CreatePolyhedron(
    //     "box",
    //     { type: 2, size: objectsSize / 2 },
    //     scene
    // );
    // const bariba = MeshBuilder.CreateBox("box", { size: objectsSize }, scene);
    const bariba = MeshBuilder.CreateCapsule("food", { height: objectsSize, radius: objectsSize / 4 }, scene);

    // const bs = objectsSize / 3

    // const bi =
    //     new BoundingInfo(new Vector3(-bs, -bs, -bs), new Vector3(bs, bs, bs))

    // bi.boundingSphere = new BoundingSphere(-bs, bs)
    // bariba.setBoundingInfo(bi)
    bariba.showBoundingBox = showBoundingBoxes;
    bariba.material = pbr;
    bariba.position = foodPosition

    // создаём муравьёв
    const colony = new Colony(scene, maja, bariba, daudzums, outerSphere);

    var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("myUI");
    var panel = new StackPanel();
    panel.width = "200px";
    panel.isVertical = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.paddingRightInPixels = 100;
    advancedTexture.addControl(panel);
    var checkbox = new Checkbox();
    checkbox.width = "20px";
    checkbox.height = "20px";
    checkbox.isChecked = false;
    checkbox.color = "green";
    checkbox.onIsCheckedChangedObservable.add(function () {
        maja.showBoundingBox = !maja.showBoundingBox;
        bariba.showBoundingBox = !bariba.showBoundingBox;
    });

    var slider = new Slider();
    slider.width = "250px";
    slider.height = "15px";
    slider.color = 'orange';
    slider.minimum = 0.0001;
    slider.maximum = 0.2;
    slider.value = daudzums;
    slider.maximum = daudzums * 2

    var button = Button.CreateSimpleButton("showHistory_button", "Apply/Reset");
    button.widthInPixels = 200;
    button.heightInPixels = 105;
    button.onPointerClickObservable.add(function () {
        colony.setQuantity(slider.value);
    });

    panel.addControl(slider);
    panel.addControl(checkbox);
    panel.addControl(button);

    // const env = scene.createDefaultEnvironment();

    // initialize XR
    const ground = MeshBuilder.CreateGround("ground", { width: outerSphere * 3, height: outerSphere * 3 }, scene);
    ground.material = pbr;

    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [ground]
    });

    // const menu = new HandMenu(xr., "handMenu")

    return scene;
}

