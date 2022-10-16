import { rotateX, rotateY, rotateZ } from './math'
import { vec4, mat4 } from "gl-matrix";
import { Model } from './model';

const POSITION_ATTR = 'coordinates';
const VERTEX_SIZE = 3;

const COLOR_ATTR = 'color';
const COLOR_SIZE = 3;

const TEXCOORD_ATTR = 'TexCoord';
const TEXCOORD_SIZE = 2;

const UNIFORMS_ATTR = {
    model: 'Model',
    view: 'View',
    projection: 'Projection',
    texture: 'uTexture',
}

export type Scene = {
    model: Model,
    viewMat: mat4,
    projMat: mat4,
}

const vertCode = `
    attribute vec3 ${POSITION_ATTR};
    attribute vec3 ${COLOR_ATTR};
    attribute vec2 ${TEXCOORD_ATTR};

    uniform mat4 ${UNIFORMS_ATTR.model};
    uniform mat4 ${UNIFORMS_ATTR.view};
    uniform mat4 ${UNIFORMS_ATTR.projection};

    varying vec3 vColor;
    varying vec2 vTexCoord;

    void main(void) {
        gl_Position = ${UNIFORMS_ATTR.projection} * ${UNIFORMS_ATTR.view} * ${UNIFORMS_ATTR.model} * vec4(${POSITION_ATTR}, 1.);
        vColor = ${COLOR_ATTR};
        vTexCoord = ${TEXCOORD_ATTR};
    }`;

const fragCode = `
    precision mediump float;
    varying vec2 vTexCoord;
    varying vec3 vColor;

    uniform sampler2D uTexture;

    void main(void) {
        // gl_FragColor = texture2D(uTexture, vTexCoord) * vec4(vColor, 1.);
        gl_FragColor = texture2D(uTexture, vTexCoord);
    }`;

   
export const clear = (context : WebGLRenderingContext, color : vec4) => {
    context.enable(context.DEPTH_TEST);
    context.depthFunc(context.LEQUAL);

    context.clearColor(color[0], color[1], color[2], color[3]);
    context.clearDepth(1.0);

    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
}

const bindBuffer = (context: WebGLRenderingContext, type : number, source : BufferSource, buffer : WebGLBuffer) => {
    context.bindBuffer(type, buffer);
    context.bufferData(type, source, context.STATIC_DRAW);
    context.bindBuffer(type, null);
}

const bindVertices = (context: WebGLRenderingContext, vertices : Float32Array) : WebGLBuffer | null => {
    const bufferType = context.ARRAY_BUFFER;
    const vertexBuffer = context.createBuffer();
    
    if (vertexBuffer) {
        console.log("Binding Vertices");
        bindBuffer(context, bufferType, vertices, vertexBuffer);
    }

    return vertexBuffer;
}

const bindIndices = (context: WebGLRenderingContext, indices : Uint16Array) : WebGLBuffer | null => { 
    const bufferType = context.ELEMENT_ARRAY_BUFFER;
    const indexBuffer = context.createBuffer();

    if (indexBuffer) {
        console.log("Binding Indices");
        bindBuffer(context, bufferType, indices, indexBuffer);
    }

    return indexBuffer;
}

const bindColors = (context: WebGLRenderingContext, colors: Float32Array) : WebGLBuffer | null => {
    const bufferType = context.ARRAY_BUFFER;
    const colorBuffer = context.createBuffer();

    if (colorBuffer) {
        console.log("Binding Colors")
        bindBuffer(context, bufferType, colors, colorBuffer);
    }

    return colorBuffer;
}

const bindTexCoords = (context: WebGLRenderingContext, texCoords: Float32Array) : WebGLBuffer | null => {
    const bufferType = context.ARRAY_BUFFER;
    const texBuffer = context.createBuffer();

    if (texBuffer) {
        console.log("Binding Colors")
        bindBuffer(context, bufferType, texCoords, texBuffer);
    }

    return texBuffer;
}
    
const createShader = (context: WebGLRenderingContext, type: number, shaderSource : string) : WebGLShader | null => {
    const vertShader = context.createShader(type);

    if (vertShader) {
        context.shaderSource(vertShader, shaderSource);
        context.compileShader(vertShader);
    }

    return vertShader;
}

const createVertexShader = (context: WebGLRenderingContext) : WebGLShader | null => {
    return createShader(context, context.VERTEX_SHADER, vertCode);
}

const createFragmentShader = (context: WebGLRenderingContext) : WebGLShader | null => {
    return createShader(context, context.FRAGMENT_SHADER, fragCode);
}

const startProgram = (context: WebGLRenderingContext) : WebGLProgram | null => {
    const vertShader = createVertexShader(context);
    const fragShader = createFragmentShader(context);

    if (!vertShader || !fragShader) {
        return null;
    }

    const shaderProgram = context.createProgram();
    
    if (!shaderProgram) {
        return null;
    }

    context.attachShader(shaderProgram, vertShader);
    context.attachShader(shaderProgram, fragShader);
    context.linkProgram(shaderProgram);
    context.useProgram(shaderProgram); 

    return shaderProgram;
}

const enableVertexAttributes = (context: WebGLRenderingContext, 
        shaderProgram: WebGLProgram, 
        vertexBuffer: WebGLBuffer, 
        indexBuffer: WebGLBuffer, 
        colorBuffer?: WebGLBuffer, 
        texCoordBuffer?: WebGLBuffer) => {
    context.bindBuffer(context.ARRAY_BUFFER, vertexBuffer);
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var coord = context.getAttribLocation(shaderProgram, POSITION_ATTR);
    context.vertexAttribPointer(coord, VERTEX_SIZE, context.FLOAT, false, 0, 0);
    context.enableVertexAttribArray(coord);

    const color = context.getAttribLocation(shaderProgram, COLOR_ATTR);
    if (colorBuffer) {
        context.bindBuffer(context.ARRAY_BUFFER, colorBuffer);
        context.vertexAttribPointer(color, COLOR_SIZE, context.FLOAT, false,0,0);
        context.enableVertexAttribArray(color);
    } else {
        context.disableVertexAttribArray(color);
    }

    const texCoord = context.getAttribLocation(shaderProgram, TEXCOORD_ATTR)
    if (texCoordBuffer) {
        context.bindBuffer(context.ARRAY_BUFFER, texCoordBuffer);
        context.vertexAttribPointer(texCoord, TEXCOORD_SIZE, context.FLOAT, false, 0, 0);
        context.enableVertexAttribArray(texCoord);
    } else {
        context.disableVertexAttribArray(texCoord);
    }
} 

const setUniforms = (context: WebGLRenderingContext, program: WebGLProgram, proj: mat4, view: mat4, model: Model) => {
    const projUniform = context.getUniformLocation(program, UNIFORMS_ATTR.projection);
    const viewUniform = context.getUniformLocation(program, UNIFORMS_ATTR.view);
    const modelUniform = context.getUniformLocation(program, UNIFORMS_ATTR.model);

    context.uniformMatrix4fv(projUniform, false, proj);
    context.uniformMatrix4fv(viewUniform, false, view);
    context.uniformMatrix4fv(modelUniform, false, model.matrix);

    if (model.texture) {
        const texUniform = context.getUniformLocation(program, UNIFORMS_ATTR.texture)
        console.log(texUniform);
        context.activeTexture(context.TEXTURE0);
        context.bindTexture(context.TEXTURE_2D, model.texture);
        context.uniform1i(texUniform, 0);
    }
}

export const drawScene = (gl: WebGLRenderingContext, viewport: vec4, scene: Scene) : boolean => {
    let model = scene.model;

    const vertexBuffer = bindVertices(gl, new Float32Array(model.vertices));
    const indexBuffer = bindIndices(gl, new Uint16Array(model.indices));
    if (!vertexBuffer || ! indexBuffer) {
        console.log("ERROR: Could not create buffers!")
        return false;
    }

    let texBuffer = undefined;
    let colorBuffer = undefined;
    if (model.texture && model.texCoords) {
        texBuffer = bindTexCoords(gl, new Float32Array(model.texCoords)) ?? undefined;
    } else {
        colorBuffer = bindColors(gl, new Float32Array(model.colors)) ?? undefined;
    }

    const shaderProgram = startProgram(gl);
    if (!shaderProgram) {
        console.log("ERROR: Could not start shader program!");
        return false;
    }

    enableVertexAttributes(gl, shaderProgram, vertexBuffer, indexBuffer, colorBuffer, texBuffer);

    gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);

    clear(gl, [0.5, 0.5, 0.5, 0.9]);

    setUniforms(gl, shaderProgram, scene.projMat, scene.viewMat, model);

    // Draw the model
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT,0);
    return true;
}