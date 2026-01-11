/*
based on: 
https://bricks.stackexchange.com/questions/9539/what-is-the-length-of-a-duplo-train-bridge
https://www.cailliau.org/en/Alphabetical/L/Lego/Duplo/Train/Rails/Dimensions/
*/

export const LDU = 0.4;
export const STUD = 20 * LDU;       // 8mm
export const DUPLO_STUD = 2 * STUD; // 16mm

// As you noted: Straights are 8 studs long (effective length)
export const STRAIGHT_LENGTH = 8 * DUPLO_STUD; // 128mm

// Based on the 18x18 quarter-circle (minus 2 studs for centerline)
export const CURVE_RADIUS = 16 * DUPLO_STUD;    // 256mm

// 30 degrees (3 pieces = 90 degrees)
export const CURVE_ANGLE = Math.PI / 6;