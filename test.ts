/**
 * ==========================================
 * 
 * BUTTON A
 * 
 * ==========================================
 */
/**
 * ==========================================
 * 
 * BUTTON B
 * 
 * ==========================================
 */
/**
 * ==========================================
 * 
 * BUTTON C
 * 
 * ==========================================
 */
/**
 * ==========================================
 * 
 * BUTTON D
 * 
 * ==========================================
 */
/**
 * ==========================================
 * 
 * BUTTON E
 * 
 * ==========================================
 */
/**
 * ==========================================
 * 
 * BUTTON F
 * 
 * ==========================================
 */
/**
 * ==========================================
 * 
 * BUTTON Z (JOYSTICK)
 * 
 * ==========================================
 */
/**
 * ==========================================
 * 
 * MAIN LOOP
 * 
 * ==========================================
 */
/**
 * ==========================================
 * 
 * DFRobot GamePad V4.0
 * 
 * BUTTON TEST v0.3
 * 
 * micro:bit V2
 * 
 * ==========================================
 */
dfGamepad.onButton(dfGamepad.GamepadButton.B, dfGamepad.ButtonEvent.Pressed, function () {
    serial.writeLine("B: NACISNIETO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.C, dfGamepad.ButtonEvent.Released, function () {
    serial.writeLine("C: ZWOLNIONO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.E, dfGamepad.ButtonEvent.Pressed, function () {
    serial.writeLine("E: NACISNIETO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.A, dfGamepad.ButtonEvent.Pressed, function () {
    serial.writeLine("A: NACISNIETO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.F, dfGamepad.ButtonEvent.Held, function () {
    serial.writeLine("F: PRZYTRZYMANO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.B, dfGamepad.ButtonEvent.Held, function () {
    serial.writeLine("B: PRZYTRZYMANO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.A, dfGamepad.ButtonEvent.Released, function () {
    serial.writeLine("A: ZWOLNIONO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.B, dfGamepad.ButtonEvent.Released, function () {
    serial.writeLine("B: ZWOLNIONO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.E, dfGamepad.ButtonEvent.Released, function () {
    serial.writeLine("E: ZWOLNIONO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.D, dfGamepad.ButtonEvent.Held, function () {
    serial.writeLine("D: PRZYTRZYMANO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.D, dfGamepad.ButtonEvent.Pressed, function () {
    serial.writeLine("D: NACISNIETO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.A, dfGamepad.ButtonEvent.Held, function () {
    serial.writeLine("A: PRZYTRZYMANO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.Z, dfGamepad.ButtonEvent.Released, function () {
    serial.writeLine("Z: ZWOLNIONO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.E, dfGamepad.ButtonEvent.Held, function () {
    serial.writeLine("E: PRZYTRZYMANO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.Z, dfGamepad.ButtonEvent.Held, function () {
    serial.writeLine("Z: PRZYTRZYMANO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.F, dfGamepad.ButtonEvent.Released, function () {
    serial.writeLine("F: ZWOLNIONO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.C, dfGamepad.ButtonEvent.Pressed, function () {
    serial.writeLine("C: NACISNIETO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.Z, dfGamepad.ButtonEvent.Pressed, function () {
    serial.writeLine("Z: NACISNIETO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.D, dfGamepad.ButtonEvent.Released, function () {
    serial.writeLine("D: ZWOLNIONO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.C, dfGamepad.ButtonEvent.Held, function () {
    serial.writeLine("C: PRZYTRZYMANO")
})
dfGamepad.onButton(dfGamepad.GamepadButton.F, dfGamepad.ButtonEvent.Pressed, function () {
    serial.writeLine("F: NACISNIETO")
})
led.enable(false)
serial.redirectToUSB()
serial.writeLine("==========================")
serial.writeLine("DFROBOT GAMEPAD V4.0")
serial.writeLine("BUTTON TEST v0.3")
serial.writeLine("==========================")
// Konfiguracja
dfGamepad.setHoldTime(1000)
dfGamepad.setDebounce(30)
// Inicjalizacja przyciskow
dfGamepad.initButtons()
serial.writeLine("PRZYCISKI: A B C D E F Z")
serial.writeLine("PRZYTRZYMANIE: 1000 ms")
serial.writeLine("DEBOUNCE: 30 ms")
serial.writeLine("==========================")
basic.forever(function () {
    basic.pause(1000)
})
