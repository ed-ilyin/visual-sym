import { Scalar, Vector3 } from 'babylonjs'

function toCartesian(radius: number, phi: number, theta: number) {
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return new Vector3(x, y, z);
}

export function randomToCartesian(radiusMin: number, radiusMax: number) {
    return toCartesian(
        Scalar.RandomRange(radiusMin, radiusMax),
        Scalar.RandomRange(0, Math.PI),
        Scalar.RandomRange(0, Scalar.TwoPi))
}
