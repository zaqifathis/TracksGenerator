/*
based on: 
https://bricks.stackexchange.com/questions/9539/what-is-the-length-of-a-duplo-train-bridge
https://www.cailliau.org/en/Alphabetical/L/Lego/Duplo/Train/Rails/Dimensions/
*/

export const LDU = 0.4;             // mm
export const STUD = 20 * LDU;       // 8mm
export const DUPLO_STUD = 2 * STUD; // 16mm

// Straights are 8 studs long (effective length)
export const STRAIGHT_LENGTH = 8 * DUPLO_STUD; // 127.800mm length

// TODO: fix the radius
export const CURVE_RADIUS = 16.165 * DUPLO_STUD;    // 127.980mm length

// 30 degrees (3 pieces = 90 degrees)
export const CURVE_ANGLE = Math.PI / 6;



