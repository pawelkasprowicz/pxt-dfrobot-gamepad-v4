/**
 * DFRobot GamePad V4.0
 * Bidirectional radio communication
 * Version 0.4.0
 *
 * English / Polish localization
 */

namespace dfGamepad {

    export enum RadioRole {
        //% block="controller"
        //% block.loc.pl="gamepad"
        Controller = 0,

        //% block="robot"
        //% block.loc.pl="robot"
        Robot = 1
    }

    // Radio message types
    const RADIO_DATA = "GPD"
    const RADIO_ACK = "GPA"
    const RADIO_VIBRATION = "GPV"

    const RADIO_CONNECTED_EVENT = 8950
    const RADIO_DISCONNECTED_EVENT = 8951
    const RADIO_DATA_EVENT = 8952
    const RADIO_VIBRATION_EVENT = 8953

    let radioRole = RadioRole.Controller
    let radioInitialized = false

    let radioConnected = false
    let radioLastReceived = 0

    let radioTimeout = 500
    let radioInterval = 50

    let radioAutoSend = false
    let radioOnlyChanges = false

    let radioX = 0
    let radioY = 0
    let radioM1 = 0
    let radioM2 = 0
    let radioButtons = 0

    let radioVibrationDuration = 0
    let radioVibrationStrength = 100

    let lastSentPacket = ""
    let radioSequence = 0

    function radioSetConnected(connected: boolean): void {

        if (radioConnected == connected) {
            return
        }

        radioConnected = connected

        if (!connected) {
            radioX = 0
            radioY = 0
            radioM1 = 0
            radioM2 = 0
            radioButtons = 0

            control.raiseEvent(
                RADIO_DISCONNECTED_EVENT,
                1
            )
        } else {
            control.raiseEvent(
                RADIO_CONNECTED_EVENT,
                1
            )
        }
    }

    function radioReadButtons(): number {

        let result = 0

        for (let i = 0; i < 7; i++) {

            if (isPressed(i)) {
                result |= (1 << i)
            }
        }

        return result
    }

    function radioSendState(): void {

        update()

        let x = joystickX()
        let y = joystickY()

        let m1 = motorM1()
        let m2 = motorM2()

        let buttons = radioReadButtons()

        let payload =
            x + "," +
            y + "," +
            m1 + "," +
            m2 + "," +
            buttons

        if (radioOnlyChanges && payload == lastSentPacket) {
            return
        }

        lastSentPacket = payload

        radioSequence++

        radio.sendString(
            RADIO_DATA + "," +
            radioSequence + "," +
            payload
        )
    }

    function radioProcessData(message: string): void {

        let parts = message.split(",")

        if (parts.length != 7) {
            return
        }

        let x = parseFloat(parts[2])
        let y = parseFloat(parts[3])
        let m1 = parseFloat(parts[4])
        let m2 = parseFloat(parts[5])
        let buttons = parseFloat(parts[6])

        if (
            isNaN(x) ||
            isNaN(y) ||
            isNaN(m1) ||
            isNaN(m2) ||
            isNaN(buttons)
        ) {
            return
        }

        radioX = Math.constrain(x, -100, 100)
        radioY = Math.constrain(y, -100, 100)

        radioM1 = Math.constrain(m1, -100, 100)
        radioM2 = Math.constrain(m2, -100, 100)

        radioButtons = Math.constrain(
            Math.round(buttons),
            0,
            127
        )

        radioLastReceived = input.runningTime()
        radioSetConnected(true)

        radio.sendString(RADIO_ACK)

        control.raiseEvent(
            RADIO_DATA_EVENT,
            1
        )
    }

    function radioProcessVibration(message: string): void {

        let parts = message.split(",")

        if (parts.length != 3) {
            return
        }

        let duration = parseFloat(parts[1])
        let strength = parseFloat(parts[2])

        if (isNaN(duration) || isNaN(strength)) {
            return
        }

        radioVibrationDuration = Math.constrain(
            Math.round(duration),
            0,
            5000
        )

        radioVibrationStrength = Math.constrain(
            Math.round(strength),
            0,
            100
        )

        control.raiseEvent(
            RADIO_VIBRATION_EVENT,
            1
        )
    }

    /**
     * Initialize radio communication.
     */
    //% block="initialize gamepad radio as %role group %group"
    //% block.loc.pl="inicjalizuj radio jako %role grupa %group"
    //% group.min=0 group.max=255
    //% weight=59
    export function initRadio(
        role: RadioRole,
        group: number
    ): void {

        radioRole = role

        radio.setGroup(
            Math.constrain(group, 0, 255)
        )

        radioConnected = false
        radioLastReceived = input.runningTime()

        if (radioInitialized) {
            return
        }

        radioInitialized = true

        radio.onReceivedString(function (message: string) {

            if (radioRole == RadioRole.Robot) {

                if (message.indexOf(RADIO_DATA + ",") == 0) {
                    radioProcessData(message)
                }

            } else {

                if (message == RADIO_ACK) {

                    radioLastReceived = input.runningTime()
                    radioSetConnected(true)

                } else if (
                    message.indexOf(RADIO_VIBRATION + ",") == 0
                ) {

                    radioProcessVibration(message)
                }
            }
        })

        control.inBackground(function () {

            while (true) {

                if (radioConnected) {

                    if (
                        input.runningTime() -
                        radioLastReceived > radioTimeout
                    ) {
                        radioSetConnected(false)
                    }
                }

                basic.pause(20)
            }
        })

        control.inBackground(function () {

            while (true) {

                if (
                    radioRole == RadioRole.Controller &&
                    radioAutoSend
                ) {
                    radioSendState()
                }

                basic.pause(radioInterval)
            }
        })
    }

    /**
     * Start automatic transmission.
     */
    //% block="start automatic gamepad transmission"
    //% block.loc.pl="rozpocznij automatyczne nadawanie gamepada"
    //% weight=58
    export function startRadioTransmission(): void {

        initButtons()
        radioAutoSend = true
    }

    /**
     * Stop automatic transmission.
     */
    //% block="stop automatic gamepad transmission"
    //% block.loc.pl="zatrzymaj automatyczne nadawanie gamepada"
    //% weight=57
    export function stopRadioTransmission(): void {
        radioAutoSend = false
    }

    /**
     * Send current gamepad state once.
     */
    //% block="send gamepad state"
    //% block.loc.pl="wyślij stan gamepada"
    //% weight=56
    export function sendGamepadState(): void {
        radioSendState()
    }

    /**
     * Set automatic transmission interval.
     */
    //% block="set radio interval %milliseconds ms"
    //% block.loc.pl="ustaw interwał nadawania %milliseconds ms"
    //% milliseconds.min=20 milliseconds.max=1000
    //% weight=55
    export function setRadioInterval(milliseconds: number): void {

        radioInterval = Math.constrain(
            milliseconds,
            20,
            1000
        )
    }

    /**
     * Transmit only when values change.
     */
    //% block="radio send only on change %enabled"
    //% block.loc.pl="radio wysyłaj tylko przy zmianie %enabled"
    //% weight=54
    export function radioSendOnlyOnChange(enabled: boolean): void {
        radioOnlyChanges = enabled
    }

    /**
     * Set connection timeout.
     */
    //% block="set radio timeout %milliseconds ms"
    //% block.loc.pl="ustaw czas utraty połączenia %milliseconds ms"
    //% milliseconds.min=100 milliseconds.max=5000
    //% weight=53
    export function setRadioTimeout(milliseconds: number): void {

        radioTimeout = Math.constrain(
            milliseconds,
            100,
            5000
        )
    }

    /**
     * Check radio connection.
     */
    //% block="radio connected"
    //% block.loc.pl="radio połączone"
    //% weight=52
    export function isRadioConnected(): boolean {
        return radioConnected
    }

    /**
     * Connection established event.
     */
    //% block="on radio connected"
    //% block.loc.pl="po nawiązaniu połączenia radiowego"
    //% weight=51
    export function onRadioConnected(handler: () => void): void {

        control.onEvent(
            RADIO_CONNECTED_EVENT,
            1,
            handler
        )
    }

    /**
     * Connection lost event.
     */
    //% block="on radio disconnected"
    //% block.loc.pl="po utracie połączenia radiowego"
    //% weight=50
    export function onRadioDisconnected(handler: () => void): void {

        control.onEvent(
            RADIO_DISCONNECTED_EVENT,
            1,
            handler
        )
    }

    /**
     * New gamepad data received.
     */
    //% block="on gamepad data received"
    //% block.loc.pl="po odebraniu danych gamepada"
    //% weight=49
    export function onGamepadData(handler: () => void): void {

        control.onEvent(
            RADIO_DATA_EVENT,
            1,
            handler
        )
    }

    /**
     * Received joystick X.
     */
    //% block="received joystick X"
    //% block.loc.pl="odebrany joystick X"
    //% weight=48
    export function receivedX(): number {
        return radioX
    }

    /**
     * Received joystick Y.
     */
    //% block="received joystick Y"
    //% block.loc.pl="odebrany joystick Y"
    //% weight=47
    export function receivedY(): number {
        return radioY
    }

    /**
     * Received motor M1 speed.
     */
    //% block="received motor M1"
    //% block.loc.pl="odebrana prędkość M1"
    //% weight=46
    export function receivedM1(): number {
        return radioM1
    }

    /**
     * Received motor M2 speed.
     */
    //% block="received motor M2"
    //% block.loc.pl="odebrana prędkość M2"
    //% weight=45
    export function receivedM2(): number {
        return radioM2
    }

    /**
     * Check received button state.
     */
    //% block="received button %button pressed"
    //% block.loc.pl="odebrany przycisk %button naciśnięty"
    //% weight=44
    export function receivedButtonPressed(
        button: GamepadButton
    ): boolean {

        if (!radioConnected) {
            return false
        }

        return (radioButtons & (1 << button)) != 0
    }

    /**
     * Send vibration command to controller.
     */
    //% block="send vibration %duration ms strength %strength %%"
    //% block.loc.pl="wyślij wibrację %duration ms siła %strength %%"
    //% duration.min=0 duration.max=5000
    //% strength.min=0 strength.max=100
    //% weight=43
    export function sendRadioVibration(
        duration: number,
        strength: number
    ): void {

        if (radioRole != RadioRole.Robot) {
            return
        }

        radio.sendString(
            RADIO_VIBRATION + "," +
            Math.constrain(duration, 0, 5000) + "," +
            Math.constrain(strength, 0, 100)
        )
    }

    /**
     * Vibration command received event.
     */
    //% block="on vibration command received"
    //% block.loc.pl="po odebraniu polecenia wibracji"
    //% weight=42
    export function onRadioVibration(
        handler: () => void
    ): void {

        control.onEvent(
            RADIO_VIBRATION_EVENT,
            1,
            handler
        )
    }

    /**
     * Received vibration duration.
     */
    //% block="received vibration duration"
    //% block.loc.pl="odebrany czas wibracji"
    //% weight=41
    export function receivedVibrationDuration(): number {
        return radioVibrationDuration
    }

    /**
     * Received vibration strength.
     */
    //% block="received vibration strength"
    //% block.loc.pl="odebrana siła wibracji"
    //% weight=40
    export function receivedVibrationStrength(): number {
        return radioVibrationStrength
    }
}