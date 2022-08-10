import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { SolidParticle } from "@babylonjs/core/Particles/solidParticle";
import { SolidParticleSystem } from "@babylonjs/core/Particles/solidParticleSystem";
import { Scene } from "@babylonjs/core/scene";
import { float, int } from "@babylonjs/core/types";
import { Ant } from "./ant";
import { randomToCartesian } from "./polar";

export class Colony {
  ants: Ant[] = []
  home: Mesh
  tooFarFromHome = 2.0
  food: Mesh
  bboxesComputed = false
  colorFull = new Color4(1, 0, 0, 1)
  colorEmpty = new Color4(0, 0, 1, 1)
  sps: SolidParticleSystem
  polyhedronType = 0
  skudraSize = 0.01; // в метрах
  atrums = 0.01; // в метрах
  scene: Scene
  radius = 2
  // position = Vector3.Zero()
  velocity = 0.01
  // shared variables
  tmpPos = Vector3.Zero();          // current particle world position
  tmpNormal = Vector3.Zero();       // current sphere normal on intersection point
  tmpDot = 0.0;                             // current dot product

  constructor(scene: Scene, home: Mesh, food: Mesh, quantity: int, radius: float) {
    this.scene = scene
    this.home = home;
    this.food = food;
    this.radius = this.radius
    this.createSPS(quantity)
  }

  update(particle: SolidParticle) {
    const ant = this.ants[particle.id]
    this.ants[particle.idx].update(particle)
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
      ant.kliedz(particle.position, distance, citaSkudra, citasSkudrasVieta)
      citaSkudra.kliedz(citasSkudrasVieta, distance, ant, particle.position)
      particle.rotation = ant.velocity
      citasSkudrasParicle.rotation = citaSkudra.velocity
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
    // this.sps.mesh.position = this.home.position
    // this.sps.billboard = true;
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
        const velocity = randomToCartesian(this.atrums, this.atrums)
        this.ants[p] = new Ant(this, velocity)
        particle.position = randomToCartesian(0, this.radius).addInPlace(this.home.position)
        // particle.rotation = new Vector3(Scalar.RandomRange(0, Scalar.TwoPi), Scalar.RandomRange(0, Scalar.TwoPi), Scalar.RandomRange(0, Scalar.TwoPi))

        particle.rotationQuaternion =
          new Quaternion(Math.random(), Math.random(), Math.random(), Math.random())
      }
    }

    this.sps.initParticles();
    this.sps.updateParticle = (particle) => this.update(particle)

    this.sps.afterUpdateParticles = () => {
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