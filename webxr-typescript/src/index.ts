import {
  ArcRotateCamera,
  CloudPoint,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PointsCloudSystem,
  Scalar,
  Scene,
  Vector3
} from "babylonjs";

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

const dzirde = 50;
enum Vieta { Bariba, Maja }

class Skudra {
  virziens = Vector3.Zero()
  atrums = 0
  mekle = Vieta.Bariba
  kliegs = Vieta.Maja
  lidzMajai = 0
  lidzBaribai = 0
  constructor(virziens: Vector3, atrums: number) {
    this.virziens = virziens;
    this.atrums = atrums;
  }
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
      skudraKasDzird.virziens = kliedzosasSkudrasVieta.subtract(skudrasKasDzirdVieta)
      skudraKasDzird.virziens.normalizeFromLength(skudraKasDzird.atrums)
      console.log(skudraKasDzird.virziens)
    }
  }

  if (sadzirdetaVieta == Vieta.Bariba &&
    sadzirdetsAttalums < skudraKasDzird.lidzBaribai) {

    skudraKasDzird.lidzBaribai = sadzirdetsAttalums

    if (sadzirdetaVieta == skudraKasDzird.mekle) {
      // меняем направление на кричащую букаху
      // зная где кричащая букаха, нужно посчитать вектор в направлении кричащей букахи,
      // но динной в скорость слышащей букахи
      skudraKasDzird.virziens = kliedzosasSkudrasVieta.subtract(skudrasKasDzirdVieta)
      skudraKasDzird.virziens.normalizeFromLength(skudraKasDzird.atrums)
      console.log(skudraKasDzird.virziens)
    }
  }
}

function kliedz(distance: number,
  skudra: Skudra, skudrasVieta: Vector3,
  citaSkudra: Skudra, citasSkudrasVieta: Vector3) {

  // выясняем что кричали в прошлый раз и кричим другое
  switch (skudra.kliegs) {
    case Vieta.Maja: {
      if (distance <= dzirde) dzird(
        skudrasVieta,
        Vieta.Maja, skudra.lidzMajai + dzirde,
        citaSkudra, citasSkudrasVieta)
      skudra.kliegs = Vieta.Bariba
    }
    case Vieta.Bariba: {
      if (distance <= dzirde) dzird(
        skudrasVieta,
        Vieta.Bariba, skudra.lidzBaribai + dzirde,
        citaSkudra, citasSkudrasVieta)
      skudra.kliegs = Vieta.Maja
    }
  }
}

function rnd() { return Math.random() - 0.5 }

const createScene = async function () {
  const scene = new Scene(engine);

  // Create camera and light
  // const light = new PointLight("Point", new Vector3(5, 10, 5), scene);
  const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // создаём еду
  const bariba = MeshBuilder.CreateBox("box", { size: 0.1 }, scene);
  bariba.position = new Vector3(rnd(), rnd(), rnd());

  //Create a manager for the player's sprite animation
  const pcs = new PointsCloudSystem("pcs", 2, scene);
  pcs.computeBoundingBox = true;
  const skudras: Skudra[] = [];

  const spawn = function (particle: CloudPoint, i: number) {
    particle.position = new Vector3(0, 1, 1)
    particle.color = new Color4(Math.random(), Math.random(), Math.random(), Math.random());
    // const r = Math.random() / 100;
    const r = Scalar.RandomRange(0, 0.01)
    const phi = Scalar.RandomRange(0, Math.PI)
    const theta = Scalar.RandomRange(0, Scalar.TwoPi)
    const x = r * Math.cos(phi) * Math.sin(theta)
    const y = r * Math.sin(phi) * Math.sin(theta)
    const z = r * Math.cos(theta)
    const virziens = new Vector3(x, y, z)
    skudras[i] = new Skudra(virziens, virziens.length())
  }

  pcs.addPoints(1000, spawn);
  pcs.buildMeshAsync();

  pcs.updateParticle = function (particle) {
    // букаха походила
    particle.position.addInPlace(skudras[particle.idx].virziens);

    // букаха увеличила все счётчики на велечину скорости
    const skudra = skudras[particle.idx]
    skudra.lidzMajai += skudra.atrums
    skudra.lidzBaribai += skudra.atrums

    // букаха кричит одно из пройденных путей
    // Ищем кто услышал,
    //      чтобы два раза не прогонять по массиву сразу меняемся данными в обе стороны
    //      и проганяем только оставшихся (такая вот оптимизация)
    for (var p = particle.idx + 1; p < pcs.nbParticles; p++) {
      const citaSkudra = skudras[p]
      const citasSkudrasVieta = pcs.particles[p].position
      const distance = Vector3.Distance(particle.position, citasSkudrasVieta);
      kliedz(distance, skudra, particle.position, citaSkudra, citasSkudrasVieta)
      kliedz(distance, citaSkudra, citasSkudrasVieta, skudra, particle.position)

    }

    // TODO: проверить не уткнулись ли в еду или дом
    //      обнулить сообтветсвующий счётчик
    //      поменять skudra.mekle на противоположный
    if (particle.intersectsMesh(bariba, false)) { 
      console.log('мы уперлись во что-то!')
    }

    return particle
  }

  scene.registerAfterRender(() => pcs.setParticles())
  const env = scene.createDefaultEnvironment();

  // initialize XR
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [env.ground]
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
