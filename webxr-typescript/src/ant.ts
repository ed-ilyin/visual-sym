import { Colony } from "./colony"
import { float } from "@babylonjs/core/types";
import { SolidParticle } from "@babylonjs/core/Particles/solidParticle";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Vieta } from "./vieta"

export class Ant {
  colony: Colony
  velocity = Vector3.Zero()
  speed = 0
  mekle = Vieta.Bariba
  kliegs = Vieta.Maja
  lidzMajai = 0
  lidzBaribai = 0
  dzirde = 0.3

  constructor(colony: Colony, velocity: Vector3) {
    this.colony = colony
    this.velocity = velocity;
    this.speed = velocity.length();
  }

  setSpeed(speed: float) {
    this.velocity.scaleInPlace(speed / this.speed)
    this.speed = speed
  }

  update(particle: SolidParticle) {
    // букаха походила
    particle.position.addInPlace(this.velocity);

    // букаха увеличила все счётчики на велечину своей скорости
    this.lidzMajai += this.speed
    this.lidzBaribai += this.speed

    // отражаем вектор от внешней сферы
    if (this.colony.world.center.subtract(particle.position).length() >= this.colony.world.radius) {
      this.velocity.scaleInPlace(-1)
      // particle.position.addToRef(mesh.position, tmpPos); // particle World position
      // home.subtractToRef(tmpPos, tmpNormal);             // normal to the sphere
      // // tmpNormal.normalize();                             // normalize the sphere normal
      // tmpDot = Vector3.Dot(tmpNormal, skudra.velocity);  // dot product (velocity, normal)
      // // bounce result computation
      // skudra.velocity.x = -skudra.velocity.x + 2.0 * tmpDot * tmpNormal.x;
      // skudra.velocity.y = -skudra.velocity.y + 2.0 * tmpDot * tmpNormal.y;
      // skudra.velocity.z = -skudra.velocity.z + 2.0 * tmpDot * tmpNormal.z;
      // skudra.velocity.scaleInPlace(skudra.atrums);                      // aply restitution
    }

    // проверить не уткнулись ли в еду или дом
    // обнулить сообтветсвующий счётчик
    // поменять skudra.mekle на противоположный
    // console.log(particle.intersectsMesh(this.colony.food))
    // console.log(this.colony.bboxesComputed)
    if (this.colony.bboxesComputed && particle.intersectsMesh(this.colony.world.foodMesh)) {
      this.lidzBaribai = 0

      if (this.mekle == Vieta.Bariba) {
        // console.log('нашёл еду!')
        this.mekle = Vieta.Maja
        particle.color = this.colony.colorFull
        this.velocity.scaleInPlace(-1) // разворот на 180 градусов
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

        if (distance <= this.dzirde) citaSkudra.dzird(
          skudrasVieta,
          Vieta.Maja, this.lidzMajai + this.dzirde,
          citasSkudrasVieta)
      }
      case Vieta.Bariba: {
        this.kliegs = Vieta.Maja

        if (distance <= this.dzirde) citaSkudra.dzird(
          skudrasVieta,
          Vieta.Bariba, this.lidzBaribai + this.dzirde,
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

    if (sadzirdetaVieta == Vieta.Maja &&
      sadzirdetsAttalums < this.lidzMajai) {

      this.lidzMajai = sadzirdetsAttalums

      if (sadzirdetaVieta == this.mekle) {
        // меняем направление на кричащую букаху
        // зная где кричащая букаха, нужно посчитать вектор в направлении кричащей букахи,
        // но динной в скорость слышащей букахи
        this.velocity =
          kliedzosasSkudrasVieta
            .subtract(skudrasKasDzirdVieta)
            .normalize()
            .scaleInPlace(this.speed)
        // console.log(`дом ${this.velocity.length()}`)

        this.line(kliedzosasSkudrasVieta, skudrasKasDzirdVieta)
      }
    }

    if (sadzirdetaVieta == Vieta.Bariba &&
      sadzirdetsAttalums < this.lidzBaribai) {

      this.lidzBaribai = sadzirdetsAttalums

      if (sadzirdetaVieta == this.mekle) {
        // меняем направление на кричащую букаху
        // зная где кричащая букаха, нужно посчитать вектор в направлении кричащей букахи,
        // но динной в скорость слышащей букахи
        this.velocity =
          kliedzosasSkudrasVieta
            .subtract(skudrasKasDzirdVieta)
            .normalize()
            .scaleInPlace(this.speed)
        // console.log(`хавка ${this.velocity.length()}`)
        this.line(kliedzosasSkudrasVieta, skudrasKasDzirdVieta)
      }
    }
  }
}