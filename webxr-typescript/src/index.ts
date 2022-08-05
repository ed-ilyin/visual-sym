import {
  ArcRotateCamera,
  CloudPoint,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointLight,
  PointsCloudSystem,
  Scalar,
  Scene,
  Vector3
} from "babylonjs";

const daudzums = 1000
const objectSize = 0.1; // в метрах
const skudraSize = 4; // в пикселях
const atrums = 0.01; // в метрах
const dzirde = 0.1; // в метрах
// const home = new Vector3(0, 0, 0)
const home = new Vector3(0, 0.5, 5)
const foodDistance = randomPolarToCartesian(0.5, 1.5)
const outerSphere = 2
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

  // Create camera and light
  const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);

  // const light = new PointLight("Point", new Vector3(5, 10, 5), scene);
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // создаём дом и еду
  const maja = MeshBuilder.CreateSphere("maja", { diameter: objectSize }, scene);
  maja.position = home
  const bariba = MeshBuilder.CreateBox("box", { size: objectSize }, scene);
  bariba.position = maja.position.add(foodDistance)

  //Create a manager for the player's sprite animation
  const pcs = new PointsCloudSystem("pcs", skudraSize, scene);
  pcs.computeBoundingBox = true;
  const skudras: Skudra[] = [];

  const spawn = function (particle: CloudPoint, i: number) {
    particle.color = new Color4(Math.random(), Math.random(), Math.random(), 1);
    const virziens = randomPolarToCartesian(atrums, atrums)
    skudras[i] = new Skudra(virziens)

    // particle.position = virziens
    //   .normalizeToNew()
    //   .scaleInPlace(objectSize / 2)
    //   .addInPlace(maja.position)
    particle.position = skudra()
  }

  pcs.addPoints(daudzums, spawn);
  pcs.buildMeshAsync();

  pcs.updateParticle = function (particle) {
    const skudra = skudras[particle.idx]

    // букаха походила
    particle.position.addInPlace(skudra.virziens);

    // букаха увеличила все счётчики на велечину своей скорости
    skudra.lidzMajai += skudra.atrums
    skudra.lidzBaribai += skudra.atrums
    // skudra.lidzMajai += 1
    // skudra.lidzBaribai += 1

    // проверить не уткнулись ли в еду или дом
    // обнулить сообтветсвующий счётчик
    // поменять skudra.mekle на противоположный
    if (particle.intersectsMesh(bariba, false)) {
      skudra.lidzBaribai = 0

      if (skudra.mekle == Vieta.Bariba) {
        // console.log('нашёл еду!')
        skudra.mekle = Vieta.Maja
        particle.color = new Color4(1, 0, 0, 1)
        // разворот на 180 градусов
        skudra.virziens.scaleInPlace(-1)
      }
    }

    if (particle.intersectsMesh(maja, true)) {
      skudra.lidzMajai = 0

      if (skudra.mekle == Vieta.Maja) {
        // console.log('нашёл дом!')
        skudra.mekle = Vieta.Bariba
        particle.color = new Color4(0, 0, 1, 1)
        // разворот на 180 градусов
        skudra.virziens.scaleInPlace(-1)
      }
    }

    // букаха кричит одно из пройденных путей
    // Ищем кто услышал,
    // чтобы два раза не прогонять по массиву сразу меняемся данными в обе
    // стороны и прогоняем только оставшихся (такая вот оптимизация)
    for (var p = particle.idx + 1; p < pcs.nbParticles; p++) {
      const citaSkudra = skudras[p]
      const citasSkudrasVieta = pcs.particles[p].position
      const distance = Vector3.Distance(particle.position, citasSkudrasVieta);
      // if (distance <= dzirde) console.log('кто-то рядом')
      kliedz(skudra, particle.position, distance, citaSkudra, citasSkudrasVieta)
      kliedz(citaSkudra, citasSkudrasVieta, distance, skudra, particle.position)
    }

    // отражаем вектор от внешней сферы
    if (home.subtract(particle.position).length() >= outerSphere) {
      skudra.virziens.scaleInPlace(-1)
    }

    return particle
  }

  scene.registerAfterRender(() => pcs.setParticles())
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
