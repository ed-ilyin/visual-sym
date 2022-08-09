import {
    Scene, Engine, CubeTexture, PBRMaterial, MeshBuilder, ArcRotateCamera,
    HemisphericLight, Vector3, SolidParticleSystem, BoundingInfo, Color4,
    Scalar, Quaternion, Mesh, AbstractMesh
} from "babylonjs";
import { AdvancedDynamicTexture, Button, Checkbox, Control, Slider, StackPanel, TextBlock } from "babylonjs-gui";
import { Ant } from "./ant";
import { Colony } from "./colony";
import { randomToCartesian } from "./polar"

const daudzums = 600
const objectsSize = 1; // в метрах
const home = new Vector3(0, 1, 1)
const outerSphere = 5
const foodDistance = randomToCartesian(outerSphere / 2, outerSphere - objectsSize)
const showBoundingBoxes = false

export async function createWorld(
    engine: Engine,
    canvas: HTMLCanvasElement
) {
    // создаём сцену
    const scene = new Scene(engine);
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
    const bariba = MeshBuilder.CreateCapsule("food");

    // const bs = objectsSize / 3
    
    // const bi =
    //     new BoundingInfo(new Vector3(-bs, -bs, -bs), new Vector3(bs, bs, bs))
    
    // bi.boundingSphere = new BoundingSphere(-bs, bs)
    // bariba.setBoundingInfo(bi)
    bariba.showBoundingBox = showBoundingBoxes;
    bariba.material = pbr;
    bariba.position = home.add(foodDistance)
    
    // создаём муравьёв
    const colony = new Colony(scene, maja, bariba, daudzums, outerSphere);
    
    var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI(
        "myUI"
      );
    var panel = new StackPanel();
    panel.width = "200px";
    panel.isVertical = true;
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.paddingRightInPixels=100;
    advancedTexture.addControl(panel);
    var checkbox = new Checkbox();
    checkbox.width = "20px";
    checkbox.height = "20px";
    checkbox.isChecked = false;
    checkbox.color = "green";
    checkbox.onIsCheckedChangedObservable.add(function(value) {
            maja.showBoundingBox=!maja.showBoundingBox;
            bariba.showBoundingBox=!bariba.showBoundingBox;
    });

    var slider=new Slider();
    slider.width="250px";
    slider.height="15px";
    slider.color='orange';

    var button=Button.CreateSimpleButton("showHistory_button", "Apply/Reset" );
    button.widthInPixels=200;
    button.heightInPixels=105;
    button.onPointerClickObservable.add(function(){
        colony.setQuantity(slider.value);
    });

    panel.addControl(slider);
    panel.addControl(checkbox); 
    panel.addControl(button);  


    // const env = scene.createDefaultEnvironment();

    // initialize XR
    const xr = await scene.createDefaultXRExperienceAsync({
        // floorMeshes: [env.ground]
    });

    return scene;
}
