import {
  ArcRotateCamera,
  CloudPoint,
  Color3,
  Color4,
  CubeTexture,
  DeviceOrientationCamera,
  Engine,
  GlowLayer,
  HemisphericLight,
  MeshBuilder,
  PBRMaterial,
  PointLight,
  PointsCloudSystem,
  Scalar,
  Scene,
  SolidParticleSystem,
  Texture,
  Vector3
} from "babylonjs";

const daudzums = 500
const objectSize = 1; // в метрах
const skudraSize = 0.02; // в пикселях
const atrums = 0.05; // в метрах
const dzirde = 0.4; // в метрах
const home = new Vector3(0, 1, 2)
const outerSphere = 10
const foodDistance = randomPolarToCartesian(outerSphere / 2, outerSphere - objectSize)
function skudra() { return randomPolarToCartesian(0, outerSphere).addInPlace(home) }

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

// Load the 3D engine
var engine: Engine = null;
const sceneToRender = null;

const createDefaultEngine = function () {
  return new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
};

enum Vieta { Bariba, Maja }

class Skudra {
  virziens = Vector3.Zero()
  atrums = atrums
  mekle = Vieta.Bariba
  kliegs = Vieta.Maja
  lidzMajai = 0
  lidzBaribai = 0

  constructor(virziens: Vector3) {
    this.virziens = virziens;
    this.atrums = virziens.length();
  }
}

function line(from: Vector3, to: Vector3) {
  const line = MeshBuilder.CreateLines("lines", {
    points: [from, to],
    updatable: true
  });
  setTimeout(() => line.dispose(), 20)
}

function dzird(
  kliedzosasSkudrasVieta: Vector3,
  sadzirdetaVieta: Vieta, sadzirdetsAttalums: number,
  skudraKasDzird: Skudra, skudrasKasDzirdVieta: Vector3) {

  if (sadzirdetaVieta == Vieta.Maja &&
    sadzirdetsAttalums < skudraKasDzird.lidzMajai) {

    skudraKasDzird.lidzMajai = sadzirdetsAttalums

    if (sadzirdetaVieta == skudraKasDzird.mekle) {
      // меняем направление на кричащую букаху
      // зная где кричащая букаха, нужно посчитать вектор в направлении кричащей букахи,
      // но динной в скорость слышащей букахи
      skudraKasDzird.virziens =
        kliedzosasSkudrasVieta
          .subtract(skudrasKasDzirdVieta)
          .normalize()
          .scaleInPlace(skudraKasDzird.atrums)
      // console.log(`дом ${skudraKasDzird.virziens.length()}`)
      
      line(kliedzosasSkudrasVieta, skudrasKasDzirdVieta)
    }
  }

  if (sadzirdetaVieta == Vieta.Bariba &&
    sadzirdetsAttalums < skudraKasDzird.lidzBaribai) {

    skudraKasDzird.lidzBaribai = sadzirdetsAttalums

    if (sadzirdetaVieta == skudraKasDzird.mekle) {
      // меняем направление на кричащую букаху
      // зная где кричащая букаха, нужно посчитать вектор в направлении кричащей букахи,
      // но динной в скорость слышащей букахи
      skudraKasDzird.virziens =
        kliedzosasSkudrasVieta
          .subtract(skudrasKasDzirdVieta)
          .normalize()
          .scaleInPlace(skudraKasDzird.atrums)
      // console.log(`хавка ${skudraKasDzird.virziens.length()}`)
      line(kliedzosasSkudrasVieta, skudrasKasDzirdVieta)
    }
  }
}

function kliedz(
  skudra: Skudra, skudrasVieta: Vector3,
  distance: number,
  citaSkudra: Skudra, citasSkudrasVieta: Vector3) {

  // что в этот раз надо кричать?
  switch (skudra.kliegs) {
    case Vieta.Maja: {
      skudra.kliegs = Vieta.Bariba

      if (distance <= dzirde) dzird(
        skudrasVieta,
        Vieta.Maja, skudra.lidzMajai + dzirde,
        citaSkudra, citasSkudrasVieta)
    }
    case Vieta.Bariba: {
      skudra.kliegs = Vieta.Maja

      if (distance <= dzirde) dzird(
        skudrasVieta,
        Vieta.Bariba, skudra.lidzBaribai + dzirde,
        citaSkudra, citasSkudrasVieta)
    }
  }
}

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

const createScene = async function () {
  const scene = new Scene(engine);
  // scene.clearColor = Color3.Black().toColor4();
  scene.environmentTexture = CubeTexture.CreateFromPrefilteredData("assets/environment.dds", scene);
  const pbr = new PBRMaterial("pbr", scene);

  // создаём дом и еду
  const maja = MeshBuilder.CreateSphere("maja", { diameter: objectSize }, scene);
  // const maja = MeshBuilder.CreateBox("maja", { size: objectSize }, scene);
  // var gl = new GlowLayer("glow", scene);
  maja.material = pbr;

  pbr.metallic = 0.0;
  pbr.roughness = 0;    
    
  pbr.subSurface.isRefractionEnabled = true;
  // scene.createDefaultCamera(true, true, true);
  // const camera = new DeviceOrientationCamera("DevOr_camera", new Vector3(0, 0, 0), scene);
  const camera = new ArcRotateCamera("camera", -(Math.PI / 3), Math.PI / 5 * 2, 10, home, scene);
  scene.createDefaultSkybox(scene.environmentTexture);

  // Create camera and light
  camera.setTarget(home);
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("light", new Vector3(2, 2, -1), scene);

  maja.position = home
  const bariba = MeshBuilder.CreateBox("box", { size: objectSize }, scene);
  // bariba.material = pbr;
  bariba.position = maja.position.add(foodDistance)

  //Create a manager for the player's sprite animation
  const SPS = new SolidParticleSystem("sps", scene, {
    particleIntersection: true,
    boundingSphereOnly: true,
    bSphereRadiusFactor: 1.0 / Math.sqrt(3.0)});

  SPS._bSphereOnly = true;
  // SPS.billboard = true;
  SPS.computeBoundingBox = false;
  const skudras: Skudra[] = [];

  // const poly = MeshBuilder.CreatePlane("p", {size: skudraSize }, scene);
  const poly = MeshBuilder.CreatePolyhedron("p", {size: skudraSize }, scene);
  // const poly = MeshBuilder.CreateIcoSphere("p", {radius: skudraSize }, scene);
  SPS.addShape(poly, daudzums); // 120 polyhedrons
  poly.dispose();
  const mesh = SPS.buildMesh();

  // initiate particles function
  SPS.initParticles = () => {
    for (let p = 0; p < SPS.nbParticles; p++) {
      const particle = SPS.particles[p];
      particle.color = new Color4(Math.random(), Math.random(), Math.random(), Math.random());
      const virziens = randomPolarToCartesian(atrums, atrums)
      particle.rotation = virziens
      skudras[p] = new Skudra(virziens)
      particle.position = skudra()
    }
  }
  SPS.initParticles();

  // shared variables
  const tmpPos = Vector3.Zero();          // current particle world position
  const tmpNormal = Vector3.Zero();       // current sphere normal on intersection point
  var tmpDot = 0.0;                             // current dot product
  const red = new Color4(1, 0, 0, 1);
  const blue = new Color4(0, 0, 1, 1);

  SPS.updateParticle = function (particle) {
    const skudra = skudras[particle.idx]

    // букаха походила
    particle.position.addInPlace(skudra.virziens);

    // букаха увеличила все счётчики на велечину своей скорости
    skudra.lidzMajai += skudra.atrums
    skudra.lidzBaribai += skudra.atrums

    // отражаем вектор от внешней сферы
    if (home.subtract(particle.position).length() >= outerSphere) {
      skudra.virziens.scaleInPlace(-1)
      // particle.position.addToRef(mesh.position, tmpPos); // particle World position
      // home.subtractToRef(tmpPos, tmpNormal);             // normal to the sphere
      // // tmpNormal.normalize();                             // normalize the sphere normal
      // tmpDot = Vector3.Dot(tmpNormal, skudra.virziens);  // dot product (velocity, normal)
      // // bounce result computation
      // skudra.virziens.x = -skudra.virziens.x + 2.0 * tmpDot * tmpNormal.x;
      // skudra.virziens.y = -skudra.virziens.y + 2.0 * tmpDot * tmpNormal.y;
      // skudra.virziens.z = -skudra.virziens.z + 2.0 * tmpDot * tmpNormal.z;
      // skudra.virziens.scaleInPlace(skudra.atrums);                      // aply restitution
    }

    // проверить не уткнулись ли в еду или дом
    // обнулить сообтветсвующий счётчик
    // поменять skudra.mekle на противоположный
    if (particle.intersectsMesh(bariba)) {
      skudra.lidzBaribai = 0

      if (skudra.mekle == Vieta.Bariba) {
        // console.log('нашёл еду!')
        skudra.mekle = Vieta.Maja
        particle.color = red
        // разворот на 180 градусов
        skudra.virziens.scaleInPlace(-1)
      }
    }

    if (particle.intersectsMesh(maja)) {
      skudra.lidzMajai = 0

      if (skudra.mekle == Vieta.Maja) {
        // console.log('нашёл дом!')
        skudra.mekle = Vieta.Bariba
        particle.color = blue
        // разворот на 180 градусов
        skudra.virziens.scaleInPlace(-1)
      }
    }

    // букаха кричит одно из пройденных путей
    // Ищем кто услышал,
    // чтобы два раза не прогонять по массиву сразу меняемся данными в обе
    // стороны и прогоняем только оставшихся (такая вот оптимизация)
    for (var p = particle.idx + 1; p < SPS.nbParticles; p++) {
      const citaSkudra = skudras[p]
      const citasSkudrasParicle = SPS.particles[p]
      const citasSkudrasVieta = citasSkudrasParicle.position
      const distance = Vector3.Distance(particle.position, citasSkudrasVieta);
      // if (distance <= dzirde) console.log('кто-то рядом')
      kliedz(skudra, particle.position, distance, citaSkudra, citasSkudrasVieta)
      kliedz(citaSkudra, citasSkudrasVieta, distance, skudra, particle.position)
      particle.rotation = skudra.virziens
      citasSkudrasParicle.rotation = citaSkudra.virziens
    }

    return particle
  }

  scene.onBeforeRenderObservable.add(() => SPS.setParticles())
  // const env = scene.createDefaultEnvironment();

  // initialize XR
  const xr = await scene.createDefaultXRExperienceAsync({
    // floorMeshes: [env.ground]
  });

  return scene;
}

// Create a default engine to load the scene
try {
  engine = createDefaultEngine();
} catch (e) {
  console.log(
    "the available createEngine function failed. Creating the default engine instead"
  );
  engine = createDefaultEngine();
}
if (!engine) throw "engine should not be null.";

//Create the scene
createScene().then(sceneToRender => {
  engine.runRenderLoop(() => sceneToRender.render());
});

// Render the scene by using the engine
engine.runRenderLoop(function () {
  if (sceneToRender) {
    sceneToRender.render();
  }
});

// Resize the engine to fit the scene
window.addEventListener("resize", function () {
  engine.resize();
});
