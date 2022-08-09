import { Vector3 } from "babylonjs"
import { Vieta } from "./vieta"

export class Ant {
  virziens = Vector3.Zero()
  atrums: number
  mekle = Vieta.Bariba
  kliegs = Vieta.Maja
  lidzMajai = 0
  lidzBaribai = 0
  dzirde = 2

  constructor(virziens: Vector3) {
    this.virziens = virziens;
    this.atrums = virziens.length();
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
        this.virziens =
          kliedzosasSkudrasVieta
            .subtract(skudrasKasDzirdVieta)
            .normalize()
            .scaleInPlace(this.atrums)
        // console.log(`дом ${this.virziens.length()}`)

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
        this.virziens =
          kliedzosasSkudrasVieta
            .subtract(skudrasKasDzirdVieta)
            .normalize()
            .scaleInPlace(this.atrums)
        // console.log(`хавка ${this.virziens.length()}`)
        this.line(kliedzosasSkudrasVieta, skudrasKasDzirdVieta)
      }
    }
  }
}