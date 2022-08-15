'use strict';
import { Ant } from "./ant";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { float, int } from "@babylonjs/core/types";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { randomToCartesian } from "./polar";
import { SolidParticle } from "@babylonjs/core/Particles/solidParticle";
import { SolidParticleSystem } from "@babylonjs/core/Particles/solidParticleSystem";
import {PointerDragBehavior} from "@babylonjs/core";
import { World } from "./world";

export class Colony {
  ants: Ant[] = []
  home: Mesh
  bboxesComputed = false
  sps!: SolidParticleSystem;
  world: World
  colorFull = new Color4(1, 0, 0, 1)
  colorEmpty = new Color4(0, 0, 1, 1)
  loudness: float = 1

  constructor(world: World, position: Vector3, population: int) {
    this.world = world

    // создаём дом
    this.home = MeshBuilder.CreateSphere("home", { diameter: world.objectsSize }, world.scene);
    this.home.material = this.world.glassMaterial;
    this.home.position = position
    const h = this.world.objectsSize / Math.PI
    this.home.setBoundingInfo(new BoundingInfo(new Vector3(-h, -h, -h), new Vector3(h, h, h)))
    var pointerDragBehavior = new PointerDragBehavior();
    pointerDragBehavior.useObjectOrientationForDragging = false;
    this.home.addBehavior(pointerDragBehavior);
    this.createSPS(population)
  }

  createSPS(quantity: int) {
    //Create a manager for the player's sprite animation
    this.sps = new SolidParticleSystem("swarm", this.world.scene, {
      particleIntersection: true,
      boundingSphereOnly: true,
      bSphereRadiusFactor: 1.0 / Math.sqrt(3.0)
    });
    // this.sps.billboard = true;
    this.sps.computeBoundingBox = true;
    // const poly = MeshBuilder.CreatePlane("p", {size: skudraSize }, scene);
    const poly = MeshBuilder.CreatePolyhedron("p", { type: this.world.antPolyhedronType, size: this.world.antSize }, this.world.scene);
    // const poly = MeshBuilder.CreateBox("p", {size: skudraSize }, scene);
    // const poly = MeshBuilder.CreateIcoSphere("p", {radius: skudraSize }, scene);
    this.sps.addShape(poly, quantity)
    poly.dispose();
    const mesh = this.sps.buildMesh();
    mesh.position = this.world.center

    // initiate particles function
    this.sps.initParticles = () => {
      for (let p = 0; p < this.sps.nbParticles; p++) {
        const particle = this.sps.particles[p];
        particle.color = new Color4(Math.random(), Math.random(), Math.random(), Math.random());
        const velocity = randomToCartesian(this.world.speed, this.world.speed)
        this.ants[p] = new Ant(this, velocity)
        particle.position = randomToCartesian(0, this.world.radius)
        // particle.rotation = new Vector3(Scalar.RandomRange(0, Scalar.TwoPi), Scalar.RandomRange(0, Scalar.TwoPi), Scalar.RandomRange(0, Scalar.TwoPi))

        particle.rotationQuaternion =
          new Quaternion(Math.random(), Math.random(), Math.random(), Math.random())
      }
    }

    this.sps.initParticles();
    this.sps.updateParticle = (particle) => this.update(particle)

    this.sps.afterUpdateParticles = () => this.bboxesComputed = true;

    this.world.scene.onBeforeRenderObservable.add(() => this.sps.setParticles())
  }

  update(particle: SolidParticle) {
    const ant = this.ants[particle.id]
    // букаха кричит одно из пройденных путей
    // Ищем кто услышал,
    // чтобы два раза не прогонять по массиву сразу меняемся данными в обе
    // стороны и прогоняем только оставшихся (такая вот оптимизация)
    for (var p = particle.idx + 1; p < this.sps.nbParticles; p++) {
      const citaSkudra = this.ants[p]
      const citasSkudrasParicle = this.sps.particles[p]
      const citasSkudrasVieta = citasSkudrasParicle.position
      const distance = Vector3.Distance(particle.position, citasSkudrasVieta);
      ant.kliedz(particle.position, distance, citaSkudra, citasSkudrasVieta)
      citaSkudra.kliedz(citasSkudrasVieta, distance, ant, particle.position)
    }

    this.ants[particle.idx].update(particle)
    return particle
  }

  setQuantity(quantity: int) {
    this.sps.dispose()
    this.createSPS(quantity)
  }
}
