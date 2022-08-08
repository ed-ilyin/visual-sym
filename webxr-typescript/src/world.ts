import {
    Scene, Engine, CubeTexture, PBRMaterial, MeshBuilder, ArcRotateCamera,
    HemisphericLight, Vector3, SolidParticleSystem, BoundingInfo, Color4,
    Scalar, Quaternion
} from "babylonjs";
import { Ant } from "./ant";
import { Colony } from "./colony";

const daudzums = 500
const objectsSize = 1; // в метрах
const skudraSize = 0.02; // в метрах
const atrums = 0.01; // в метрах
const home = new Vector3(0, 1, 1)
const outerSphere = 10
const foodDistance = randomPolarToCartesian(outerSphere / 2, outerSphere - objectsSize)
function skudra() { return randomPolarToCartesian(0, outerSphere).addInPlace(home) }
const polyhedronType = 0
const showBoundingBoxes = false

function polarToCartesian(radius: number, phi: number, theta: number) {
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return new Vector3(x, y, z);
}

function randomPolarToCartesian(radiusMin: number, radiusMax: number) {
    return polarToCartesian(
        Scalar.RandomRange(radiusMin, radiusMax),
        Scalar.RandomRange(0, Math.PI),
        Scalar.RandomRange(0, Scalar.TwoPi))
}

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
    const light = new HemisphericLight("light", new Vector3(2, 2, -1), scene);

    // создаём камеру
    // scene.createDefaultCamera(true, true, true);
    // const camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(0, 0, 0), scene);
    const camera = new ArcRotateCamera("camera", -(Math.PI / 3), Math.PI / 5 * 2, outerSphere, home, scene);
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
    const bariba = MeshBuilder.CreatePolyhedron(
        "box",
        { type: 2, size: objectsSize / 2 },
        scene
        );
        
    const bs = objectsSize / 3
    const bi = new BoundingInfo(
        new Vector3(-bs, -bs, -bs),
        new Vector3(bs, bs, bs)
    )

    // bi.boundingSphere = new BoundingSphere(-bs, bs)
    bariba.setBoundingInfo(bi)
    // bariba.setBoundingInfo(new Bp new BoundingSphere(new Vector3(0, 0, 0), objectsSize))
    bariba.showBoundingBox = showBoundingBoxes;
    // const bariba = MeshBuilder.CreateBox("box", { size: objectsSize }, scene);
    bariba.material = pbr;
    bariba.position = home.add(foodDistance)

    // создаём муравьёв
    //Create a manager for the player's sprite animation
    const SPS = new SolidParticleSystem("sps", scene, {
        particleIntersection: true,
        boundingSphereOnly: true,
        bSphereRadiusFactor: 1.0 / Math.sqrt(3.0)
    });

    // SPS.billboard = true;
    SPS.computeBoundingBox = true;
    const colony = new Colony()
    colony.food = bariba;
    colony.home = maja;
    colony.sps = SPS;

    // const poly = MeshBuilder.CreatePlane("p", {size: skudraSize }, scene);
    const poly = MeshBuilder.CreatePolyhedron("p", { type: polyhedronType, size: skudraSize }, scene);
    // const poly = MeshBuilder.CreateBox("p", {size: skudraSize }, scene);
    // const poly = MeshBuilder.CreateIcoSphere("p", {radius: skudraSize }, scene);
    SPS.addShape(poly, daudzums)
    poly.dispose();
    const mesh = SPS.buildMesh();

    // initiate particles function
    SPS.initParticles = () => {
        for (let p = 0; p < SPS.nbParticles; p++) {
            const particle = SPS.particles[p];
            particle.color = new Color4(Math.random(), Math.random(), Math.random(), Math.random());
            const virziens = randomPolarToCartesian(atrums, atrums)
            colony.ants[p] = new Ant(virziens)
            particle.position = skudra()
            // particle.rotation = new Vector3(Scalar.RandomRange(0, Scalar.TwoPi), Scalar.RandomRange(0, Scalar.TwoPi), Scalar.RandomRange(0, Scalar.TwoPi))

            particle.rotationQuaternion =
                new Quaternion(Math.random(), Math.random(), Math.random(), Math.random())
        }
    }

    SPS.initParticles();
    SPS.updateParticle = (particle) => colony.update(particle)

    SPS.afterUpdateParticles = function () {
        colony.bboxesComputed = true;
        //console.log(calculated_first_time)
    };

    scene.onBeforeRenderObservable.add(() => SPS.setParticles())
    // const env = scene.createDefaultEnvironment();

    // initialize XR
    const xr = await scene.createDefaultXRExperienceAsync({
        // floorMeshes: [env.ground]
    });

    return scene;
}
