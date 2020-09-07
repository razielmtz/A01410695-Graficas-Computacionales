let mat4 = glMatrix.mat4;

let projectionMatrix;

let shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

let duration = 10000; // ms

let moveOctahedronUp = true;

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
let vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +

    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +

    "    varying vec4 vColor;\n" +

    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor * 0.8;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
let fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    let gl = null;
    let msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix, Math.PI / 2, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// Create the vertex, color and index data for a multi-colored cube
function createCube(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // Front face
       -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
       -1.0,  1.0,  1.0,

       // Back face
       -1.0, -1.0, -1.0,
       -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,

       // Top face
       -1.0,  1.0, -1.0,
       -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,

       // Bottom face
       -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
       -1.0, -1.0,  1.0,

       // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

       // Left face
       -1.0, -1.0, -1.0,
       -1.0, -1.0,  1.0,
       -1.0,  1.0,  1.0,
       -1.0,  1.0, -1.0
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [0.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 0.0, 1.0, 1.0], // Top face
        [1.0, 1.0, 0.0, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 1.0, 1.0, 1.0]  // Left face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 4; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    let cubeIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
    
    let cube = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices:36,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return cube;
}

// Create the vertex, color and index data for a multi-colored cube
function createPentagonalPyramid(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [

        // Bottom face
       -1.0, 0.0, 0.0,
        0.0, 0.0, -1.0,
       -0.5, 0.0, 1.0,
        0.5, 0.0, 1.0,
        1.0, 0.0, 0.0,

       // SIDES

       //1
       -1.0, 0.0, 0.0,
        0.0, 5.0, 0.0,
       -0.5, 0.0, 1.0,

        //2
       -0.5, 0.0, 1.0,
        0.0, 5.0, 0.0,
        0.5, 0.0, 1.0,

        //3
        0.5, 0.0, 1.0,
        0.0, 5.0, 0.0,
        1.0, 0.0, 0.0,

        //4
        1.0, 0.0, 0.0,
        0.0, 5.0, 0.0,
        0.0, 0.0, -1.0,

        //5
        0.0, 0.0, -1.0,
        0.0, 5.0, 0.0,
       -1.0, 0.0, 0.0

       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // Bottom face
        [0.0, 1.0, 0.0, 1.0], // 1
        [0.0, 0.0, 1.0, 1.0], // 2
        [1.0, 1.0, 0.0, 1.0], // 3
        [1.0, 0.0, 1.0, 1.0], // 4
        [0.0, 1.0, 1.0, 1.0]  // 5
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach((color, index) =>{
        let times = 3;
        if(index == 0){
            times = 5;
        }
        for (let j=0; j < times; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let  ppyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ppyramidIndexBuffer);

    let ppyramidIndices = [
        0, 1, 2,      2, 1, 3,      3, 1, 4, // Bottom face
        5, 6, 7,      // 1
        8, 9, 10,     // 2
        11, 12, 13,   // 3
        14, 15, 16,   // 4
        17, 18, 19,   // 5
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ppyramidIndices), gl.STATIC_DRAW);
    
    let ppyramid = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices: ppyramidIndexBuffer,
            vertSize:3, nVerts:20, colorSize:4, nColors: 20, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(ppyramid.modelViewMatrix, ppyramid.modelViewMatrix, translation);

    ppyramid.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return ppyramid;
}

// Create the vertex, color and index data for a multi-colored cube
function createDodecahedron(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
        //1
        -1.0,  1.0,  1.0,
	     0.0,  0.618034,  1.618034,
	     1.0,  1.0,  1.0,
	   
	    -1.0,  1.0,  1.0,	   
	     1.0,  1.0,  1.0,
	     0.618034,  1.618034,  0.0,
	    
	    -1.0,  1.0,  1.0,
	     0.618034,  1.618034,  0.0,   
	    -0.618034,  1.618034,  0.0,
		 
		 //2
	     1.0,  1.0,  1.0,   
	     1.618034,  0.0,  0.618034, 
	     1.618034,  0.0, -0.618034,
   
	     1.0,  1.0,  1.0,   
	     1.618034,  0.0, -0.618034,
	     1.0,  1.0, -1.0,
		 
	     1.0,  1.0,  1.0,   
	     1.0,  1.0,  -1.0,   
     	 0.618034,  1.618034,  0.0,
     	    
     	  //3       
	     1.618034,  0.0, -0.618034,
	     1.0, -1.0, -1.0,
	     0.0, -0.618034, -1.618034,
	    
	    1.618034,  0.0, -0.618034,
	    0.0, -0.618034, -1.618034,
        0.0,  0.618034, -1.618034,

        1.618034,  0.0, -0.618034,
        0.0,  0.618034, -1.618034,
        1.0,  1.0, -1.0,
        
        //4
        0.0, -0.618034, -1.618034,
        -1.0, -1.0, -1.0,
        -1.618034,  0.0, -0.618034,
        
        0.0, -0.618034, -1.618034,
        -1.618034,  0.0, -0.618034,
        -1.0,  1.0, -1.0,
                    
        0.0, -0.618034, -1.618034,
        -1.0,  1.0, -1.0,
        0.0,  0.618034, -1.618034,
        
        //5
        -1.0, -1.0, -1.0,
        -0.618034, -1.618034,  0.0,
        -1.0, -1.0,  1.0,    
        
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0, 
        -1.618034,  0.0,  0.618034,      
        
        -1.0, -1.0, -1.0,       
        -1.618034,  0.0,  0.618034,       
        -1.618034,  0.0, -0.618034,
        
        //6
        -1.0,  1.0, -1.0,
        -1.618034,  0.0, -0.618034,
        -1.618034,  0.0,  0.618034,
        
        -1.0,  1.0, -1.0,
        -1.618034,  0.0,  0.618034,
        -1.0,  1.0,  1.0,

        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        -0.618034,  1.618034,  0.0,

        //7
        -1.618034,  0.0,  0.618034,
        -1.0, -1.0,  1.0, 
        0.0, -0.618034,  1.618034,

        -1.618034,  0.0,  0.618034,
        0.0, -0.618034,  1.618034,
        0.0,  0.618034,  1.618034,

        -1.618034,  0.0,  0.618034,
        0.0,  0.618034,  1.618034,
        -1.0,  1.0,  1.0,

        //8
        1.0, -1.0, -1.0,
        0.618034, -1.618034,  0.0,
        -0.618034, -1.618034,  0.0,

        1.0, -1.0, -1.0,
        -0.618034, -1.618034,  0.0,
        -1.0, -1.0, -1.0,

        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        0.0, -0.618034, -1.618034,

        //9
        0.0,  0.618034,  1.618034,
        0.0, -0.618034,  1.618034,
        1.0, -1.0,  1.0,

        0.0,  0.618034,  1.618034,
        1.0, -1.0,  1.0,
        1.618034,  0.0,  0.618034,

        0.0,  0.618034,  1.618034,
        1.618034,  0.0,  0.618034,
        1.0,  1.0,  1.0,
        
        //10
        1.618034,  0.0,  0.618034,       
        1.0, -1.0,  1.0,   
        0.618034, -1.618034,  0.0,
            
	    1.618034,  0.0,  0.618034,
	    0.618034, -1.618034,  0.0,
	    1.0, -1.0, -1.0,       
            
 	    1.618034,  0.0,  0.618034,
        1.0, -1.0, -1.0,
        1.618034,  0.0, -0.618034,
        
        //11
        1.0,  1.0, -1.0,
        0.0,  0.618034, -1.618034,
        -1.0,  1.0, -1.0,
        
         1.0,  1.0, -1.0,
        -1.0,  1.0, -1.0,
        -0.618034,  1.618034,  0.0,

         1.0,  1.0, -1.0,
        -0.618034,  1.618034,  0.0,
         0.618034,  1.618034,  0.0,
        
        //12
        -1.0, -1.0,  1.0, 
        -0.618034, -1.618034,  0.0,
         0.618034, -1.618034,  0.0, 

        -1.0, -1.0,  1.0, 
  	     0.618034, -1.618034,  0.0,
         1.0, -1.0,  1.0,

        -1.0, -1.0,  1.0,          
         1.0, -1.0,  1.0,
         0.0, -0.618034,  1.618034
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // 1
        [0.0, 1.0, 0.0, 1.0], // 2
        [0.0, 0.0, 1.0, 1.0], // 3
        [1.0, 1.0, 0.0, 1.0], // 4
        [1.0, 0.0, 1.0, 1.0], // 5
        [0.0, 1.0, 1.0, 1.0],  // 6
        [1.0, 0.0, 0.0, 0.5], // 7
        [0.0, 1.0, 0.0, 0.5], // 8
        [0.0, 0.0, 1.0, 0.5], // 9
        [1.0, 1.0, 0.0, 0.5], // 10
        [1.0, 0.0, 1.0, 0.5], // 11
        [0.0, 1.0, 1.0, 0.5]  // 12
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 9; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);

    let dodecahedronIndices = [
        0,  1,  2,     3,  4,  5,    6,  7,  8, 
        9, 10, 11,    12, 13, 14,   15, 16, 17, 
       18, 19, 20,    21, 22, 23,   24, 25, 26, 
       27, 28, 29,    30, 31, 32,   33, 34, 35,
       36, 37, 38,    39, 40, 41,   42, 43, 44,
       45, 46, 47,    48, 49, 50,   51, 52, 53,
       54, 55, 56,    57, 58, 59,   60, 61, 62,
       63, 64, 65,    66, 67, 68,   69, 70, 71,
       72, 73, 74,    75, 76, 77,   78, 79, 80,
       81, 82, 83,    84, 85, 86,   87, 88, 89,
       90, 91, 92,    93, 94, 95,   96, 97, 98,
       99,100,101,   102,103,104,  105,106,107
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);
    
    let dodecahedron = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:dodecahedronIndexBuffer,
            vertSize:3, nVerts:108, colorSize:4, nColors: 108, nIndices:108,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

    dodecahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodecahedron;
}

// Create the vertex, color and index data for a multi-colored cube
function createOctahedron(gl, translation, rotationAxis)
{    
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [
       // TOP

       // front
       -1.0,  0.0,  1.0,
        0.0,  1.0,  0.0,
        1.0,  0.0,  1.0,

       // right
        1.0,  0.0,  1.0,
        0.0,  1.0,  0.0,
        1.0,  0.0, -1.0,

       // left
       -1.0,  0.0, -1.0,
        0.0,  1.0,  0.0,
       -1.0,  0.0,  1.0,

       // back
       -1.0,  0.0, -1.0,
        0.0,  1.0,  0.0,
        1.0,  0.0, -1.0,

       // BOTTOM

       // front
       -1.0,  0.0,  1.0,
        0.0, -1.0,  0.0,
        1.0,  0.0,  1.0,

       // right
        1.0,  0.0,  1.0,
        0.0, -1.0,  0.0,
        1.0,  0.0, -1.0,

       // left
       -1.0,  0.0, -1.0,
        0.0, -1.0,  0.0,
       -1.0,  0.0,  1.0,

       // back
       -1.0,  0.0, -1.0,
        0.0, -1.0,  0.0,
        1.0,  0.0, -1.0,
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
        [1.0, 0.0, 0.0, 1.0], // 1
        [0.0, 1.0, 0.0, 1.0], // 2
        [0.0, 0.0, 1.0, 1.0], // 3
        [1.0, 1.0, 0.0, 1.0], // 4
        [1.0, 0.0, 1.0, 1.0], // 5
        [0.0, 1.0, 1.0, 1.0], // 6
        [0.0, 0.0, 0.0, 1.0], // 7
        [1.0, 1.0, 1.0, 1.0]  // 8
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors) 
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);

    let octahedronIndices = [
        0, 1, 2,      // 1
        3, 4, 5,      // 2
        6, 7, 8,      // 3
        9, 10, 11,    // 4
        12, 13, 14,   // 5
        15, 16, 17,   // 6
        18, 19, 20,   // 7
        21, 22, 23,   // 8
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);
    
    let octahedron = {
            buffer: vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
            vertSize:3, nVerts:24, colorSize:4, nColors: 24, nIndices: 24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        };

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    octahedron.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        // console.log(this.shaderVertexPositionAttribute);
        console.log(this.modelViewMatrix[13])
        if(this.modelViewMatrix[13] >= 6 ){
            moveOctahedronUp = false;
        } else if (this.modelViewMatrix[13] <= -6 ) {
            moveOctahedronUp = true;
        } 

        console.log(moveOctahedronUp);

        if(moveOctahedronUp){
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, .01, 0])
        } else {
            mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, -.01, 0])
        }
        
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return octahedron;
}

function createShader(gl, str, type)
{
    let shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    let fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    let vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i< objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}


function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });

    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}