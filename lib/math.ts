// export type Vec4 = [number, number, number, number]

import { mat4 } from "gl-matrix";

// export type Vec3 = [number, number, number]

// export type Vec2 = [number, number]

// export type Mat4 = [
//     number, number, number, number,
//     number, number, number, number,
//     number, number, number, number,
//     number, number, number, number,
// ]

export function rotateZ(matrix : mat4, angle : number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    var mv0 = matrix[0], mv4 = matrix[4], mv8 = matrix[8];

    matrix[0] = c*matrix[0]-s*matrix[1];
    matrix[4] = c*matrix[4]-s*matrix[5];
    matrix[8] = c*matrix[8]-s*matrix[9];

    matrix[1]=c*matrix[1]+s*mv0;
    matrix[5]=c*matrix[5]+s*mv4;
    matrix[9]=c*matrix[9]+s*mv8;
}

export function rotateX(matrix : mat4, angle : number) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = matrix[1], mv5 = matrix[5], mv9 = matrix[9];

    matrix[1] = matrix[1]*c-matrix[2]*s;
    matrix[5] = matrix[5]*c-matrix[6]*s;
    matrix[9] = matrix[9]*c-matrix[10]*s;

    matrix[2] = matrix[2]*c+mv1*s;
    matrix[6] = matrix[6]*c+mv5*s;
    matrix[10] = matrix[10]*c+mv9*s;
}

export function rotateY(matrix : mat4, angle : number) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = matrix[0], mv4 = matrix[4], mv8 = matrix[8];

    matrix[0] = c*matrix[0]+s*matrix[2];
    matrix[4] = c*matrix[4]+s*matrix[6];
    matrix[8] = c*matrix[8]+s*matrix[10];

    matrix[2] = c*matrix[2]-s*mv0;
    matrix[6] = c*matrix[6]-s*mv4;
    matrix[10] = c*matrix[10]-s*mv8;
}

export const getProjectionMatrix = (angle: number, aspectRatio: number, zMin: number, zMax: number) : mat4 => {
    let ang = Math.tan((angle*.5)*Math.PI/180);
    
    return [
        0.5/ang, 0 , 0, 0,
        0, 0.5 * aspectRatio/ang, 0, 0,
        0, 0, -(zMax+zMin)/(zMax-zMin), -1,
        0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
    ];
}