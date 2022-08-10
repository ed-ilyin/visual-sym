import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Checkbox } from "@babylonjs/gui/2D/controls/checkbox";
import { Colony } from "./colony";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { Engine } from "@babylonjs/core/Engines/engine";
import { float, int } from "@babylonjs/core/types";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { randomToCartesian } from "./polar"
import { Scene } from "@babylonjs/core";
import { Slider } from "@babylonjs/gui/2D/controls/sliders/slider";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

const worldRadius = 2; // в метрах
const worldCenter = new Vector3(0, worldRadius, 0)
const colonyPosition = randomToCartesian(worldRadius / 2, worldRadius).addInPlace(worldCenter)
const antPopulation = 600
const foodPosition: Vector3[] =
    [...Array(2)].map(() => randomToCartesian(worldRadius / 2, worldRadius).addInPlace(worldCenter))
console.log(foodPosition)

export class World {
    radius: float = worldRadius // в метрах
    center = worldCenter
    objectsSize: float = 0.2 // в метрах
    scene: Scene
    foodMesh: Mesh[] = []
    objectsMaterial: PBRMaterial
    antPolyhedronType: int = 0
    antSize: float = 0.01 // в метрах
    speed: float = 0.02 // в метрах

    async createScene(engine: Engine, canvas: HTMLCanvasElement) {
        // создаём сцену
        this.scene = new Scene(engine);
        // Fog
        // scene.clearColor = Color3.Black().toColor4();
        this.scene.environmentTexture = CubeTexture.CreateFromPrefilteredData("assets/environment.dds", this.scene);
        // var gl = new GlowLayer("glow", this.scene);
        this.scene.createDefaultSkybox(this.scene.environmentTexture);

        // создаём освещение
        const light = new HemisphericLight("light", new Vector3(worldRadius, worldRadius, -worldRadius), this.scene);

        // создаём камеру
        // const camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(0, 0, 0), this.scene);
        const camera = new ArcRotateCamera(
            "camera",
            -(Math.PI / 3),
            Math.PI / 5 * 2,
            worldRadius * 2,
            worldCenter,
            this.scene);

        camera.attachControl(canvas, true);

        // создаём текстуру для дома и еды
        this.objectsMaterial = new PBRMaterial("this.objectsMaterial", this.scene);
        this.objectsMaterial.metallic = 0.0;
        this.objectsMaterial.roughness = 0;
        this.objectsMaterial.subSurface.isRefractionEnabled = true;

        // создаём еду
        this.foodMesh = foodPosition.map((position) => {
            const food = MeshBuilder.CreateCapsule(
                `food${position}`,
                { height: this.objectsSize, radius: this.objectsSize / 4 },
                this.scene)
            food.position = position
            food.material = this.objectsMaterial
            return food
        });
        console.log(this.foodMesh)

        // создаём муравьёв
        const colony = new Colony(this, colonyPosition, antPopulation);

        // UI
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
            colony.home.showBoundingBox = !colony.home.showBoundingBox;
            this.foodMesh.showBoundingBox = !this.foodMesh.showBoundingBox;
        });

        var slider = new Slider();
        slider.width = "250px";
        slider.height = "15px";
        slider.color = 'orange';
        slider.minimum = 0.0001;
        slider.maximum = 0.2;
        slider.value = antPopulation
        slider.maximum = antPopulation * 2

        var button = Button.CreateSimpleButton("showHistory_button", "Apply/Reset");
        button.widthInPixels = 200;
        button.heightInPixels = 105;
        button.onPointerClickObservable.add(function () {
            colony.setQuantity(slider.value);
        });

        panel.addControl(slider);
        panel.addControl(checkbox);
        panel.addControl(button);

        // const env = this.scene.createDefaultEnvironment();

        // initialize XR
        const ground = MeshBuilder.CreateGround("ground", { width: worldRadius * 4, height: worldRadius * 4 }, this.scene);
        ground.material = this.objectsMaterial;

        const xr = await this.scene.createDefaultXRExperienceAsync({
            floorMeshes: [ground]
        });

        // const menu = new HandMenu(xr., "handMenu")

        return this.scene;
    }
}
