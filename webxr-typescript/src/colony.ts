import { Color4, Mesh, SolidParticle, SolidParticleSystem, Vector3, Scene,
  MeshBuilder, float, Quaternion, int } from "babylonjs";
import { Ant } from "./ant";
import { Vieta } from "./vieta";
import { randomToCartesian } from "./polar";

function set_speed(colony:any,slider:any){
  colony.ants.forEach(function (value: Ant) {
      value.atrums=slider.value;
  });
}

export class Colony {
  ants: Ant[] = []
  home: Mesh
  tooFarFromHome = 10.0
  food: Mesh
  bboxesComputed = false
  colorFull = new Color4(1, 0, 0, 1)
  colorEmpty = new Color4(0, 0, 1, 1)
  sps: SolidParticleSystem
  polyhedronType = 0
  skudraSize = 0.02; // в метрах
  atrums = 0.002; // в метрах
  scene: Scene
  colonyRadius = 5
  // shared variables
  tmpPos = Vector3.Zero();          // current particle world position
  tmpNormal = Vector3.Zero();       // current sphere normal on intersection point
  tmpDot = 0.0;                             // current dot product

  constructor(scene: Scene, home: Mesh, food: Mesh, quantity: int, colonyRadius: float) {
    this.scene = scene
    this.home = home;
    this.food = food;
    this.colonyRadius = this.colonyRadius
    
    this.createSPS(quantity)
    // SPS.billboard = true;
  }

  update(particle: SolidParticle) {
    const skudra = this.ants[particle.idx]

    // букаха походила
    particle.position.addInPlace(skudra.virziens);

    // букаха увеличила все счётчики на велечину своей скорости
    skudra.lidzMajai += skudra.atrums
    skudra.lidzBaribai += skudra.atrums

    // отражаем вектор от внешней сферы
    if (this.home.position.subtract(particle.position).length() >= this.tooFarFromHome) {
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
    //console.log(particle.intersectsMesh(bariba))
    if (this.bboxesComputed && particle.intersectsMesh(this.food)) {
      skudra.lidzBaribai = 0

      if (skudra.mekle == Vieta.Bariba) {
        // console.log('нашёл еду!')
        skudra.mekle = Vieta.Maja
        particle.color = this.colorFull
        skudra.virziens.scaleInPlace(-1) // разворот на 180 градусов
      }
    }

    if (this.bboxesComputed && particle.intersectsMesh(this.home)) {
      skudra.lidzMajai = 0

      if (skudra.mekle == Vieta.Maja) {
        // console.log('нашёл дом!')
        skudra.mekle = Vieta.Bariba
        particle.color = this.colorEmpty
        skudra.virziens.scaleInPlace(-1) // разворот на 180 градусов
      }
    }

    // букаха кричит одно из пройденных путей
    // Ищем кто услышал,
    // чтобы два раза не прогонять по массиву сразу меняемся данными в обе
    // стороны и прогоняем только оставшихся (такая вот оптимизация)
    for (var p = particle.idx + 1; p < this.sps.nbParticles; p++) {
      const citaSkudra = this.ants[p]
      const citasSkudrasParicle = this.sps.particles[p]
      const citasSkudrasVieta = citasSkudrasParicle.position
      const distance = Vector3.Distance(particle.position, citasSkudrasVieta);
      // if (distance <= dzirde) console.log('кто-то рядом')
      skudra.kliedz(particle.position, distance, citaSkudra, citasSkudrasVieta)
      citaSkudra.kliedz(citasSkudrasVieta, distance, skudra, particle.position)
      particle.rotation = skudra.virziens
      citasSkudrasParicle.rotation = citaSkudra.virziens
    }

    return particle
  }

  createSPS(quantity: int) {
    //Create a manager for the player's sprite animation
    this.sps = new SolidParticleSystem("sps", this.scene, {
      particleIntersection: true,
      boundingSphereOnly: true,
      bSphereRadiusFactor: 1.0 / Math.sqrt(3.0)
    });

    this.sps.computeBoundingBox = true;
    // const poly = MeshBuilder.CreatePlane("p", {size: skudraSize }, scene);
    const poly = MeshBuilder.CreatePolyhedron("p", { type: this.polyhedronType, size: this.skudraSize }, this.scene);
    // const poly = MeshBuilder.CreateBox("p", {size: skudraSize }, scene);
    // const poly = MeshBuilder.CreateIcoSphere("p", {radius: skudraSize }, scene);
    this.sps.addShape(poly, quantity)
    poly.dispose();
    const mesh = this.sps.buildMesh();

    // initiate particles function
    this.sps.initParticles = () => {
      for (let p = 0; p < this.sps.nbParticles; p++) {
        const particle = this.sps.particles[p];
        particle.color = new Color4(Math.random(), Math.random(), Math.random(), Math.random());
        const virziens = randomToCartesian(this.atrums, this.atrums)
        this.ants[p] = new Ant(virziens)
        particle.position = randomToCartesian(0, this.colonyRadius).addInPlace(this.home.position)
        // particle.rotation = new Vector3(Scalar.RandomRange(0, Scalar.TwoPi), Scalar.RandomRange(0, Scalar.TwoPi), Scalar.RandomRange(0, Scalar.TwoPi))

        particle.rotationQuaternion =
          new Quaternion(Math.random(), Math.random(), Math.random(), Math.random())
      }
    }

    this.sps.initParticles();
    this.sps.updateParticle = (particle) => this.update(particle)

    this.sps.afterUpdateParticles = function () {
      this.bboxesComputed = true;
      //console.log(calculated_first_time)
    };
    
    this.scene.onBeforeRenderObservable.add(() => this.sps.setParticles())
  }

  setQuantity(quantity: int) {
    this.sps.dispose()
    this.createSPS(quantity)
  }
}