'use strict'
import { Ant } from './ant'
import { BoundingInfo } from '@babylonjs/core/Culling/boundingInfo'
import { Color4 } from '@babylonjs/core/Maths/math.color'
import { float, int } from '@babylonjs/core/types'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { randomToCartesian } from './polar'
import { Scalar } from '@babylonjs/core/Maths/math.scalar'
import { SixDofDragBehavior } from '@babylonjs/core/Behaviors/Meshes/sixDofDragBehavior'
import { SolidParticle } from '@babylonjs/core/Particles/solidParticle'
import { SolidParticleSystem } from '@babylonjs/core/Particles/solidParticleSystem'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { World } from './world'
import { LinesMesh } from '@babylonjs/core/Meshes/linesMesh'
import { Engine } from '@babylonjs/core/Engines'

class Home {
    mesh: Mesh
    original_size: number
    size: number
    constructor(mesh: Mesh, original_size: number, size: number) {
        this.mesh = mesh
        this.original_size = original_size
        this.size = size
    }
}

export class Colony {
    ants: Ant[] = []
    home: Home
    bboxesComputed = false
    sps!: SolidParticleSystem
    world: World
    colorFull = new Color4(1, 0, 0, 1)
    colorEmpty = new Color4(0, 0, 1, 1)
    loudness: float = 0.5
    lines: [Vector3, Vector3][] = []
    lineSystem: LinesMesh | undefined

    constructor(world: World, position: Vector3, population: int) {
        this.world = world

        // создаём дом
        const home_mesh = MeshBuilder.CreateSphere(
            'home',
            { diameter: world.objectsSize },
            world.scene
        )
        this.home = new Home(home_mesh, 100, 100)
        this.home.mesh.material = this.world.glassMaterial
        this.home.mesh.position = position
        const h = this.world.objectsSize / Math.PI
        this.home.mesh.setBoundingInfo(
            new BoundingInfo(new Vector3(-h, -h, -h), new Vector3(h, h, h))
        )
        // это чтобы контроллером дергать
        const sixDofDragBehavior = new SixDofDragBehavior()
        this.home.mesh.addBehavior(sixDofDragBehavior)
        this.createSPS(population)
    }

    createSPS(quantity: int) {
        //Create a manager for the player's sprite animation
        this.sps = new SolidParticleSystem('swarm', this.world.scene, {
            particleIntersection: true,
            boundingSphereOnly: true,
            bSphereRadiusFactor: 1.0 / Math.sqrt(3.0)
        })
        //Это обход баги когда все букахи в начале находили еду не прикоснувшесь ее
        this.sps.computeBoundingBox = true
        //Создаем буках
        const poly = MeshBuilder.CreatePolyhedron(
            'p',
            { type: this.world.antPolyhedronType, size: this.world.antSize },
            this.world.scene
        )
        this.sps.addShape(poly, quantity)
        poly.dispose()
        const mesh = this.sps.buildMesh()
        mesh.position = this.world.center
        // initiate particles function
        this.sps.initParticles = () => {
            for (let p = 0; p < this.sps.nbParticles; p++) {
                const particle = this.sps.particles[p]
                //раскрашиваем буках
                particle.color = new Color4(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random()
                )
                //даем им скорости
                const velocity = randomToCartesian(
                    this.world.speed,
                    this.world.speed
                )
                //поворачеваем и добовляем объект букахи в массив
                this.ants[p] = new Ant(this, velocity)
                particle.position = randomToCartesian(0, this.world.radius)
                particle.rotation = new Vector3(
                    Scalar.RandomRange(0, Scalar.TwoPi),
                    Scalar.RandomRange(0, Scalar.TwoPi),
                    Scalar.RandomRange(0, Scalar.TwoPi)
                )
            }
        }

        this.sps.initParticles()
        this.sps.beforeUpdateParticles = () => (this.lines = []) //[[new Vector3(0, 0, 0), new Vector3(1, 1, 1)]]

        this.sps.updateParticle = particle => this.update(particle)
        this.sps.afterUpdateParticles = () => {
            this.bboxesComputed = true
            this.lineSystem?.dispose()

            if (this.lines.length > 0) {
                this.lineSystem = MeshBuilder.CreateLineSystem(
                    'lines',
                    { lines: this.lines },
                    this.world.scene
                )
                this.lineSystem.position = this.world.center
            }
        }
        this.world.scene.onBeforeRenderObservable.add(() => {
            this.sps.setParticles()
        })
    }

    dispose(allow: boolean) {
        if (allow) {
            this.sps.dispose()
            const canvas = document.getElementById('app') as HTMLCanvasElement

            // Load the 3D engine

            const engine = new Engine(canvas, true)
            const scene_Promise = this.world.createScene(engine, canvas, false)
            scene_Promise
                .then(value => {
                    console.log(value) // 👉️ "Hello world"
                    this.world.scene = value
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    update(particle: SolidParticle) {
        const ant = this.ants[particle.id]

        // букаха кричит одно из пройденных путей
        // Ищем кто услышал,
        // чтобы два раза не прогонять по массиву сразу меняемся данными в обе
        // стороны и прогоняем только оставшихся (такая вот оптимизация)
        for (let p = particle.idx + 1; p < this.sps.nbParticles; p++) {
            const citaSkudra = this.ants[p]
            const citasSkudrasParicle = this.sps.particles[p]
            const citasSkudrasVieta = citasSkudrasParicle.position
            const distance = Vector3.Distance(
                particle.position,
                citasSkudrasVieta
            )
            ant.kliedz(
                particle.position,
                distance,
                citaSkudra,
                citasSkudrasVieta
            )
            citaSkudra.kliedz(
                citasSkudrasVieta,
                distance,
                ant,
                particle.position
            )
        }

        this.ants[particle.idx].update(particle)
        return particle
    }

    setQuantity(quantity: int) {
        this.sps.dispose()
        this.createSPS(quantity)
    }
}
