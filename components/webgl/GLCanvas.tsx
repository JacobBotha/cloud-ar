import { useState, useRef, useEffect } from 'react'
import { Model } from '../../lib/model'
import { Scene, drawScene } from '../../lib/renderer'
import { loadTextureUrl, createTextureVideo, updateTexture } from '../../lib/texture'
import { vec4, mat4 } from 'gl-matrix'
import { getFontOverrideCss } from 'next/dist/server/font-utils'

import gridImg from '../../public/firefox.png';

const CONTEXT_ATTRIBUTES = { 
    antialias: false, //Will improve performance, could be a user setting
    stencil: true 
}

const VERTICES : number[] = [
    -1,-1,-1, 1,-1,-1, 1, 1,-1, -1, 1,-1,
    -1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
    -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
    1,-1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1,
    -1,-1,-1, -1,-1, 1, 1,-1, 1, 1,-1,-1,
    -1, 1,-1, -1, 1, 1, 1, 1, 1, 1, 1,-1, 
];

const INDICES: number[] = [
    0,1,2, 0,2,3, 4,5,6, 4,6,7,
    8,9,10, 8,10,11, 12,13,14, 12,14,15,
    16,17,18, 16,18,19, 20,21,22, 20,22,23 
];

const VERTEX_COLORS : number[] = [
    5,3,7, 5,3,7, 5,3,7, 5,3,7,
    1,1,3, 1,1,3, 1,1,3, 1,1,3,
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    1,1,0, 1,1,0, 1,1,0, 1,1,0,
    0,1,0, 0,1,0, 0,1,0, 0,1,0
];

const TEXTURE_COORD = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
];

//Default as identity matrix
const MODEL_MATRIX : mat4 = mat4.create();

const MESH : Model = {vertices: VERTICES, indices: INDICES, colors: VERTEX_COLORS, matrix: MODEL_MATRIX, texture: undefined, texCoords: TEXTURE_COORD} ;

const SCENE : Scene = {
    model: MESH,
    viewMat: mat4.create(),
    projMat: mat4.create(),
}

export type CanvasProps = {
    width: number,
    height: number,
    background: HTMLVideoElement | null
}

export default function GLCanvas(props: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null) 
    const [context, setContext] = useState<WebGLRenderingContext | null>(null)
    const [scene, setScene] = useState<Scene>(SCENE);
    const projectionMatrix = mat4.create();

    const setPerspective = () => {
        const fieldOfView = (45 * Math.PI) / 180; // in radians
        mat4.perspective(projectionMatrix, fieldOfView, props.width/props.height, 0.1, 100.0);
    }

    useEffect(() => {
        if (canvasRef.current && !context) {
            console.log("Setting current context")
            setContext(canvasRef.current.getContext("webgl", {antialias: true, stencil: true}))
            setPerspective();
            mat4.translate(MESH.matrix, MESH.matrix, [-0.0, 0.0, -6.0]);
            setScene({model: MESH, viewMat: mat4.create(), projMat: projectionMatrix})
        }
    }, [canvasRef])

    useEffect(() => {
        if (context) {
            MESH.texture = loadTextureUrl(context, gridImg.src) ?? undefined;
        }
    }, [context]);

    const effect = () => {
        mat4.rotate(scene.model.matrix, scene.model.matrix, 0.1, [0, 0, 1]);
        mat4.rotate(scene.model.matrix, scene.model.matrix, 0.1, [0, 1, 0]); // axis to rotate around (Y)
        mat4.rotate(scene.model.matrix, scene.model.matrix, 0.1, [1, 0, 0]);
        if (context && MESH.texture && props.background) updateTexture(context, MESH.texture, props.background);
        if (context) {
            drawScene(context, [0, 0, props.width, props.height], scene);
        }
    }

    return (
        <div style={{height: '100%'}}>
            <button onClick={effect}>Button</button>
            <canvas ref={canvasRef} width={props.width} height={props.height}></canvas>
        </div>
    )
}

