import { Colony } from "./colony"
import { float } from "@babylonjs/core/types";
import { SolidParticle } from "@babylonjs/core/Particles/solidParticle";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Vieta } from "./vieta"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

const dzirde = 0.6

export class Ant {
  colony: Colony
  velocity = Vector3.Zero()
  mekle = Vieta.Bariba
  kliegs = Vieta.Maja
  lidzMajai = 0
  lidzBaribai = 0
  acceleration = Vector3.Zero()
  attraction: float = 0
  tmpVelocity = Vector3.Zero()
  relativeWorldCenter = Vector3.Zero()

  constructor(colony: Colony, velocity: Vector3) {
    this.colony = colony
    this.velocity = velocity;
    this.attraction = colony.world.speed / 400
  }

  update(particle: SolidParticle) {
    // букаха походила
    this.relativeWorldCenter
      .subtractToRef(particle.position, this.acceleration)
    this.acceleration.normalize().scaleInPlace(this.attraction)
    this.velocity
      .addInPlace(this.acceleration)
      .normalizeToRef(this.tmpVelocity)
      .scaleInPlace(this.colony.world.speed)
    particle.position.addInPlace(this.tmpVelocity);

    // букаха увеличила все счётчики на велечину своей скорости
    this.lidzMajai += this.colony.world.speed
    this.lidzBaribai += this.colony.world.speed

    // проверить не уткнулись ли в еду или дом
    // обнулить сообтветсвующий счётчик
    // поменять skudra.mekle на противоположный
    // console.log(particle.intersectsMesh(this.colony.food))
    // console.log(this.colony.bboxesComputed)
    for (let mesh of this.colony.world.foodMesh) {
      if (this.colony.bboxesComputed && particle.intersectsMesh(mesh)) {
        this.lidzBaribai = 0

        if (this.mekle == Vieta.Bariba) {
          // console.log('нашёл еду!')
          this.mekle = Vieta.Maja
          particle.color = this.colony.colorFull
          this.velocity.scaleInPlace(-1) // разворот на 180 градусов
        }
      }
    }

    if (this.colony.bboxesComputed && particle.intersectsMesh(this.colony.home)) {
      this.lidzMajai = 0

      if (this.mekle == Vieta.Maja) {
        // console.log('нашёл дом!')
        this.mekle = Vieta.Bariba
        particle.color = this.colony.colorEmpty
        this.velocity.scaleInPlace(-1) // разворот на 180 градусов
      }
    }
  }

  kliedz(
    skudrasVieta: Vector3,
    distance: number,
    citaSkudra: Ant, citasSkudrasVieta: Vector3) {

    // что в этот раз надо кричать?
    switch (this.kliegs) {
      case Vieta.Maja: {
        this.kliegs = Vieta.Bariba

        if (distance <= dzirde) citaSkudra.dzird(
          skudrasVieta,
          Vieta.Maja, this.lidzMajai + dzirde,
          citasSkudrasVieta)
      }
      case Vieta.Bariba: {
        this.kliegs = Vieta.Maja

        if (distance <= dzirde) citaSkudra.dzird(
          skudrasVieta,
          Vieta.Bariba, this.lidzBaribai + dzirde,
          citasSkudrasVieta)
      }
    }
  }

  line(from: Vector3, to: Vector3) {
    // const line = MeshBuilder.CreateLines("lines", {
    //   points: [from, to],
    //   updatable: false
    // });
    // setTimeout(() => line.dispose(), 20)
  }



  dzird(
    kliedzosasSkudrasVieta: Vector3,
    sadzirdetaVieta: Vieta, sadzirdetsAttalums: number,
    skudrasKasDzirdVieta: Vector3) {

    const pivot = () => {
      if (sadzirdetaVieta == this.mekle) {
        // меняем направление на кричащую букаху
        // зная где кричащая букаха, нужно посчитать вектор в направлении кричащей букахи,
        // но динной в скорость слышащей букахи
        kliedzosasSkudrasVieta.subtractToRef(skudrasKasDzirdVieta, this.velocity)
        this.velocity.normalize().scaleInPlace(this.colony.world.speed)
      }
    }

    if (sadzirdetaVieta == Vieta.Maja && sadzirdetsAttalums < this.lidzMajai) {
      this.lidzMajai = sadzirdetsAttalums
      pivot()
    }

    if (sadzirdetaVieta == Vieta.Bariba && sadzirdetsAttalums < this.lidzBaribai) {
      this.lidzBaribai = sadzirdetsAttalums
      pivot()
    }
  }
}