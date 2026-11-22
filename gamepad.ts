/**
 * DFRobot GamePad V4.0
 * MakeCode extension for micro:bit V2
 * Version 0.3
 */
//% color="#00897B" icon="\uf11b" block="DFRobot GamePad"
namespace dfGamepad {

    export enum ResponseMode {
        //% block="linear"
        Linear = 0,
        //% block="smooth"
        Smooth = 1,
        //% block="dynamic"
        Dynamic = 2
    }

    export enum GamepadButton {
        //% block="A"
        A = 0,
        //% block="B"
        B = 1,
        //% block="C"
        C = 2,
        //% block="D"
        D = 3,
        //% block="E"
        E = 4,
        //% block="F"
        F = 5,
        //% block="Z"
        Z = 6
    }

    export enum ButtonEvent {
        //% block="pressed"
        Pressed = 0,
        //% block="held"
        Held = 1,
        //% block="released"
        Released = 2
    }

    // =====================================
    // JOYSTICK
    // =====================================

    let centerX = 512
    let centerY = 512

    let deadZone = 10
    let maxSpeed = 100

    let invertX = false
    let invertY = false

    let responseMode = ResponseMode.Linear

    let currentX = 0
    let currentY = 0

    let currentM1 = 0
    let currentM2 = 0

    let currentRawX = 512
    let currentRawY = 512

    /**
     * Calibrate joystick center.
     * Keep joystick released.
     */
    //% block="calibrate joystick"
    //% weight=100
    export function calibrate(): void {

        let sumX = 0
        let sumY = 0

        for (let i = 0; i < 20; i++) {
            sumX += pins.analogReadPin(AnalogPin.P1)
            sumY += pins.analogReadPin(AnalogPin.P2)
            basic.pause(10)
        }

        centerX = Math.round(sumX / 20)
        centerY = Math.round(sumY / 20)

        update()
    }

    /**
     * Set joystick dead zone.
     */
    //% block="set dead zone %value %%"
    //% value.min=0 value.max=30
    //% weight=95
    export function setDeadZone(value: number): void {
        deadZone = Math.constrain(value, 0, 30)
    }

    /**
     * Set maximum motor speed.
     */
    //% block="set maximum motor speed %speed %%"
    //% speed.min=0 speed.max=100
    //% weight=94
    export function setMaxSpeed(speed: number): void {
        maxSpeed = Math.constrain(speed, 0, 100)
    }

    /**
     * Set joystick response characteristic.
     */
    //% block="set joystick response %mode"
    //% weight=93
    export function setResponse(mode: ResponseMode): void {
        responseMode = mode
    }

    /**
     * Invert X axis.
     */
    //% block="invert X %enabled"
    //% weight=92
    export function invertXAxis(enabled: boolean): void {
        invertX = enabled
    }

    /**
     * Invert Y axis.
     */
    //% block="invert Y %enabled"
    //% weight=91
    export function invertYAxis(enabled: boolean): void {
        invertY = enabled
    }

    function convertAxis(value: number, center: number): number {

        let result = 0

        if (value >= center) {
            result = (value - center) * 100 / (1023 - center)
        } else {
            result = (value - center) * 100 / center
        }

        result = Math.constrain(result, -100, 100)

        if (Math.abs(result) <= deadZone) {
            return 0
        }

        if (result > 0) {
            result = (result - deadZone) * 100 / (100 - deadZone)
        } else {
            result = (result + deadZone) * 100 / (100 - deadZone)
        }

        return Math.constrain(result, -100, 100)
    }

    function applyResponse(value: number): number {

        let sign = value < 0 ? -1 : 1
        let magnitude = Math.abs(value) / 100

        if (responseMode == ResponseMode.Smooth) {
            magnitude = magnitude * magnitude
        } else if (responseMode == ResponseMode.Dynamic) {
            magnitude = Math.sqrt(magnitude)
        }

        return Math.round(sign * magnitude * 100)
    }

    /**
     * Update joystick and motor calculations.
     */
    //% block="update joystick"
    //% weight=90
    export function update(): void {

        currentRawX = pins.analogReadPin(AnalogPin.P1)
        currentRawY = pins.analogReadPin(AnalogPin.P2)

        let x = convertAxis(currentRawX, centerX)
        let y = convertAxis(currentRawY, centerY)

        if (invertX) x = -x
        if (invertY) y = -y

        currentX = applyResponse(x)
        currentY = applyResponse(y)

        let m1 = currentY + currentX
        let m2 = currentY - currentX

        let maximum = Math.max(Math.abs(m1), Math.abs(m2))

        if (maximum > 100) {
            m1 = m1 * 100 / maximum
            m2 = m2 * 100 / maximum
        }

        currentM1 = Math.round(m1 * maxSpeed / 100)
        currentM2 = Math.round(m2 * maxSpeed / 100)
    }

    /**
     * Last raw X reading.
     */
    //% block="joystick X raw"
    //% weight=85
    export function rawX(): number {
        return currentRawX
    }

    /**
     * Last raw Y reading.
     */
    //% block="joystick Y raw"
    //% weight=84
    export function rawY(): number {
        return currentRawY
    }

    /**
     * Last joystick X (-100 to 100).
     */
    //% block="joystick X %%"
    //% weight=83
    export function joystickX(): number {
        return currentX
    }

    /**
     * Last joystick Y (-100 to 100).
     */
    //% block="joystick Y %%"
    //% weight=82
    export function joystickY(): number {
        return currentY
    }

    /**
     * Left motor speed.
     */
    //% block="motor M1 speed"
    //% weight=81
    export function motorM1(): number {
        return currentM1
    }

    /**
     * Right motor speed.
     */
    //% block="motor M2 speed"
    //% weight=80
    export function motorM2(): number {
        return currentM2
    }

    // =====================================
    // BUTTONS
    // =====================================

    const BUTTON_EVENT_ID = 8900

    let buttonsInitialized = false

    let holdTime = 1000
    let debounceTime = 30

    let buttonPins: DigitalPin[] = [
        DigitalPin.P5,
        DigitalPin.P11,
        DigitalPin.P13,
        DigitalPin.P14,
        DigitalPin.P15,
        DigitalPin.P16,
        DigitalPin.P8
    ]

    let stableState: boolean[] = [
        false, false, false, false,
        false, false, false
    ]

    let lastRawState: boolean[] = [
        false, false, false, false,
        false, false, false
    ]

    let changeTime: number[] = [
        0, 0, 0, 0, 0, 0, 0
    ]

    let pressTime: number[] = [
        0, 0, 0, 0, 0, 0, 0
    ]

    let holdReported: boolean[] = [
        false, false, false, false,
        false, false, false
    ]

    function eventValue(
        button: GamepadButton,
        event: ButtonEvent
    ): number {
        return button * 3 + event + 1
    }

    function readButton(index: number): boolean {
        return pins.digitalReadPin(buttonPins[index]) == 0
    }

    /**
     * Initialize gamepad buttons.
     */
    //% block="initialize buttons"
    //% weight=70
    export function initButtons(): void {

        if (buttonsInitialized) {
            return
        }

        // P5 and P11 share connections with LED matrix
        led.enable(false)

        for (let i = 0; i < 7; i++) {
            pins.setPull(buttonPins[i], PinPullMode.PullUp)

            let state = readButton(i)

            stableState[i] = state
            lastRawState[i] = state

            changeTime[i] = input.runningTime()
            pressTime[i] = input.runningTime()

            holdReported[i] = false
        }

        buttonsInitialized = true

        control.inBackground(function () {

            while (true) {

                let now = input.runningTime()

                for (let i = 0; i < 7; i++) {

                    let raw = readButton(i)

                    if (raw != lastRawState[i]) {
                        lastRawState[i] = raw
                        changeTime[i] = now
                    }

                    if (
                        raw != stableState[i] &&
                        now - changeTime[i] >= debounceTime
                    ) {

                        stableState[i] = raw

                        if (raw) {

                            pressTime[i] = now
                            holdReported[i] = false

                            control.raiseEvent(
                                BUTTON_EVENT_ID,
                                eventValue(i, ButtonEvent.Pressed)
                            )

                        } else {

                            control.raiseEvent(
                                BUTTON_EVENT_ID,
                                eventValue(i, ButtonEvent.Released)
                            )
                        }
                    }

                    if (
                        stableState[i] &&
                        !holdReported[i] &&
                        now - pressTime[i] >= holdTime
                    ) {

                        holdReported[i] = true

                        control.raiseEvent(
                            BUTTON_EVENT_ID,
                            eventValue(i, ButtonEvent.Held)
                        )
                    }
                }

                basic.pause(10)
            }
        })
    }

    /**
     * Check whether a gamepad button is pressed.
     */
    //% block="button %button is pressed"
    //% weight=65
    export function isPressed(button: GamepadButton): boolean {

        initButtons()

        return stableState[button]
    }

    /**
     * Set button hold time in milliseconds.
     */
    //% block="set button hold time %milliseconds ms"
    //% milliseconds.min=100 milliseconds.max=5000
    //% weight=64
    export function setHoldTime(milliseconds: number): void {

        holdTime = Math.constrain(milliseconds, 100, 5000)
    }

    /**
     * Set button debounce time in milliseconds.
     */
    //% block="set button debounce %milliseconds ms"
    //% milliseconds.min=0 milliseconds.max=100
    //% weight=63
    export function setDebounce(milliseconds: number): void {

        debounceTime = Math.constrain(milliseconds, 0, 100)
    }

    /**
     * Run code when a button is pressed, held or released.
     */
    //% block="on button %button %event"
    //% weight=60
    export function onButton(
        button: GamepadButton,
        event: ButtonEvent,
        handler: () => void
    ): void {

        initButtons()

        control.onEvent(
            BUTTON_EVENT_ID,
            eventValue(button, event),
            handler
        )
    }
}