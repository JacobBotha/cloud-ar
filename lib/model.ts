import { mat4 } from "gl-matrix";

export type Model = {
    vertices : number[],
    indices : number[],
    colors : number[],
    matrix : mat4,
    texture : WebGLTexture | undefined,
    texCoords? : number[],
}

//TODO: generate model object from raw data
export const loadModel = () : Model => {
    return {vertices: [], indices: [], colors: [], matrix: mat4.create(), texture: undefined};
}

//TODO: save model to database
export const saveModel = () : void => {}