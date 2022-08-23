'use strict'
import { Colony } from './colony'
import { SolidParticle } from '@babylonjs/core/Particles/solidParticle'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Vieta } from './vieta'
import { Food } from './food'
import { randomToCartesian } from './polar'
import { World } from './world'

const scalingEmpty = new Vector3(1, 1, 1)
const scalingFull = new Vector3(2, 2, 2)

export class Ant {
    colony: Colony
    velocity = Vector3.Zero()
    mekle = Vieta.Bariba
    kliegs = Vieta.Maja
    lidzMajai = 0
    lidzBaribai = 0
    acceleration = Vector3.Zero()
    tmpVelocity = Vector3.Zero()
    relativeWorldCenter = Vector3.Zero()
    static OneBiteSize = 0.0002

    constructor(colony: Colony, velocity: Vector3) {
        this.colony = colony
        this.velocity = velocity
    }

    update(particle: SolidParticle) {
        // букаха походила
        this.relativeWorldCenter.subtractToRef(
            particle.position,
            this.acceleration
        )
        this.acceleration.normalize().scaleInPlace(this.colony.world.attraction)
        this.velocity
            .addInPlace(this.acceleration)
            .normalizeToRef(this.tmpVelocity)
            .scaleInPlace(this.colony.world.speed)
        particle.position.addInPlace(this.tmpVelocity)

        // букаха увеличила все счётчики на велечину своей скорости
        this.lidzMajai += this.colony.world.speed
        this.lidzBaribai += this.colony.world.speed

        // проверить не уткнулись ли в еду или дом
        // обнулить сообтветсвующий счётчик
        // поменять skudra.mekle на противоположный
        if (this.colony.bboxesComputed) {
            for (const food of this.colony.world.foods) {
                if (particle.intersectsMesh(food.mesh)) {
                    this.lidzBaribai = 0
                    if (this.mekle == Vieta.Bariba && food.volume > 0) {
                        this.mekle = Vieta.Maja
                        this.eats(food)
                        particle.scaling = scalingFull
                        this.velocity.scaleInPlace(-1) // разворот на 180 градусов
                    }
                }
            }
            //проверка пересечения с домом
            if (particle.intersectsMesh(this.colony.home.mesh)) {
                this.lidzMajai = 0

                if (this.mekle == Vieta.Maja) {
                    this.takenFoodAtHome()
                    this.mekle = Vieta.Bariba
                    particle.scaling = scalingEmpty
                    this.velocity.scaleInPlace(-1) // разворот на 180 градусов
                }
            }
        }
    }

    kliedz(
        skudrasVieta: Vector3,
        distance: number,
        citaSkudra: Ant,
        citasSkudrasVieta: Vector3
    ) {
        // что в этот раз надо кричать?
        switch (this.kliegs) {
            case Vieta.Maja:
                this.kliegs = Vieta.Bariba

                if (distance <= this.colony.loudness)
                    citaSkudra.dzird(
                        skudrasVieta,
                        Vieta.Maja,
                        this.lidzMajai + this.colony.loudness,
                        citasSkudrasVieta
                    )
                break
            case Vieta.Bariba:
                this.kliegs = Vieta.Maja
                if (distance <= this.colony.loudness)
                    citaSkudra.dzird(
                        skudrasVieta,
                        Vieta.Bariba,
                        this.lidzBaribai + this.colony.loudness,
                        citasSkudrasVieta
                    )
        }
    }

    dzird(
        kliedzosasSkudrasVieta: Vector3,
        sadzirdetaVieta: Vieta,
        sadzirdetsAttalums: number,
        skudrasKasDzirdVieta: Vector3
    ) {
        const pivot = () => {
            if (sadzirdetaVieta == this.mekle) {
                this.colony.lines.push([
                    kliedzosasSkudrasVieta,
                    skudrasKasDzirdVieta
                ])

                // меняем направление на кричащую букаху
                // зная где кричащая букаха, нужно посчитать вектор в направлении кричащей букахи,
                // но динной в скорость слышащей букахи
                kliedzosasSkudrasVieta.subtractToRef(
                    skudrasKasDzirdVieta,
                    this.velocity
                )

                this.velocity.normalize().scaleInPlace(this.colony.world.speed)
            }
        }

        if (
            sadzirdetaVieta == Vieta.Maja &&
            sadzirdetsAttalums < this.lidzMajai
        ) {
            this.lidzMajai = sadzirdetsAttalums
            pivot()
        }

        if (
            sadzirdetaVieta == Vieta.Bariba &&
            sadzirdetsAttalums < this.lidzBaribai
        ) {
            this.lidzBaribai = sadzirdetsAttalums
            pivot()
        }
    }

    oneBiteSize = new Vector3(0.001, 0.001, 0.001)
    oneBiteSizeSphere = new Vector3(0.0001, 0.0001, 0.0001)
    takenFoodAtHome() {
        // Элегантно изменяем дом на размер укуса в большую сторону
        // console.log(this.colony.home.mesh.scaling)
        this.colony.home.mesh.scaling.addInPlace(this.oneBiteSizeSphere)
    }

    eats(food: Food) {
        food.mesh.scaling.subtractInPlace(this.oneBiteSize)
        if (food.mesh.scaling._x < 0.1) {
            food.mesh.position = randomToCartesian(
                World.worldRadius(),
                World.worldRadius()
            ).addInPlace(World.worldCenter())
            food.mesh.scaling = new Vector3(1, 1, 1)
            food.volume = 100
        }
    }
}
