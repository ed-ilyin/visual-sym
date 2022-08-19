'use strict'
import { Colony } from './colony'
import { GUI3DManager } from '@babylonjs/gui/3D/gui3DManager'
import { Scene } from '@babylonjs/core/scene'
import { TouchHolographicButton } from '@babylonjs/gui/3D/controls/touchHolographicButton'
import { HolographicSlate } from '@babylonjs/gui/3D/controls/holographicSlate'
import {
    CheckboxGroup,
    SelectionPanel,
    SliderGroup
} from '@babylonjs/gui/2D/controls'
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector'

export function create_menu(scene: Scene, colony: Colony) {
    // Manager
    const manager = new GUI3DManager(scene)
    manager.useRealisticScaling = true
    // Holographic Slate
    const slate = new HolographicSlate()
    manager.addControl(slate)
    slate.title = 'Swarm'
    slate.minDimensions = new Vector2(2, 3)
    slate.dimensions = new Vector2(9, 10)
    slate.position = new Vector3(-2, 7, 7)
    const scale = 10
    slate.scaling.scaleInPlace(scale)
    slate._followButton.onToggleObservable.add(v => {
        if (v) {
            slate.scaling.scaleInPlace(1 / scale)
        } else {
            slate.position = new Vector3(-2, 7, 7)
            slate.scaling.scaleInPlace(scale)
        }
    })

    // Selection Panel
    const selector = new SelectionPanel('selector')
    selector.background = '#edce'
    slate.content = selector
    const transformGroup = new CheckboxGroup('Поотмечаем')
    transformGroup.addCheckbox(
        'Auto Rotation (wait)',
        v => (colony.world.acrCamera.useAutoRotationBehavior = v)
    )

    transformGroup.addCheckbox(
        'Debug',
        void (async (v: boolean) => {
            if (v) {
                await Promise.all([
                    import('@babylonjs/core/Debug/debugLayer'), // Augments the scene with the debug methods
                    import('@babylonjs/inspector') // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version
                ])
                await scene.debugLayer.show()
            } else {
                scene.debugLayer.hide()
            }
        })
    )

    const sliderGroup = new SliderGroup('Подвигаем')
    sliderGroup.addSlider(
        'Скорость',
        v => (colony.world.speed = v),
        'км/ч',
        0,
        0.05,
        colony.world.speed,
        v => Math.round(v * 1000)
    )

    sliderGroup.addSlider(
        'Gravity',
        v => (colony.world.attraction = v),
        'м/с²',
        0,
        0.001,
        colony.world.attraction,
        v => Math.round(v * 1000000)
    )

    sliderGroup.addSlider(
        'Громкость',
        v => (colony.loudness = v),
        'см',
        0,
        3,
        colony.loudness,
        v => Math.round(v * 100)
    )

    sliderGroup.addSlider(
        'Популяция',
        v => console.log(Math.round(v)),
        'штук',
        0,
        2000,
        colony.sps.nbParticles
    )

    selector.addGroup(transformGroup)
    selector.addGroup(sliderGroup)

    const reset_apply = new TouchHolographicButton()

    reset_apply.onPointerClickObservable.add(() => {
        colony.setQuantity(colony.sps.nbParticles)
    })

    reset_apply.text = 'Refresh'

    reset_apply.imageUrl =
        'https://raw.githubusercontent.com/microsoft/MixedRealityToolkit-Unity/main/Assets/MRTK/SDK/StandardAssets/Textures/IconRefresh.png'

    const debug = new TouchHolographicButton()

    debug.onPointerClickObservable.add(() => async () => {
        debug.dispose()
        await Promise.all([
            import('@babylonjs/core/Debug/debugLayer'), // Augments the scene with the debug methods
            import('@babylonjs/inspector') // Injects a local ES6 version of the inspector to prevent automatically relying on the none compatible version
        ])
        await scene.debugLayer.show()
    })

    debug.text = 'Debug'
    return scene
}
