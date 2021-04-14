// RotatingTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Colour;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Colour;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Colour = a_Colour;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Colour;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Colour;\n' +
  '}\n';

//GLOBALS
var timer = Date.now();
var gameIsActive = true;
var score = 0; //player score
var ANGLE_STEP = 0.0;
var growth_rate = 1; //seconds

//constants
const purple = {r: 1.0, g: 1.0, b: 0.7}; // <- yellowish
const cyan = {r: 0.0, g: 0.4, b: 1.0}; // <- blueish
const black = {r: 0.0, g: 0.0, b: 0.0};
const playfieldSize = {x: 1.5, y: 1.5, z: 1.5};
const bacteriaSize = {x: 1.52, y: 1.52, z: 1.52};
const SPHERE_DIV = 128;


function main() {
  // Retrieve <canvas> element
  var canvas = document.querySelector('#webgl');
  
  //hide restart button
  document.getElementById("restartBtn").style.display = "none";

  // Get the rendering context for WebGL
  //var gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer:true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }



  //Event listeners

  window.addEventListener("keydown", function (event) {
      if(event.key == "ArrowLeft") {
        modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate around the y-axis
        ANGLE_STEP = -70.0;
      } else if(event.key == "ArrowRight") {
        modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate around the y-axis
        ANGLE_STEP = 70.0;
      }
    
  });

  window.addEventListener('keyup', function (evt) {
    if (evt.key == "ArrowLeft" || evt.key == "ArrowRight") {
      ANGLE_STEP = 0.0;
    }
  });
  /*
  window.addEventListener('mousedown', function (ev){
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    var x_canvas = x - rect.left;
    var y_canvas = rect.bottom - y;
    console.log(x_canvas + " and " + y_canvas);
    var color = checkPointColor(gl, Math.round(x_canvas), Math.round(y_canvas));
    console.log("color: " + color.r + ", " + color.g + ", " + color.b + ", " + color.a);
  })
*/


  //initilize spheres

  var playfield = CreateSphere(playfieldSize, black);
  if (!playfield) {
    console.log('Failed to set the vertex information');
    return;
  }

  // initilize bacteria

  var bacteria = []; //stores current bacteria on the board;
  bacteria.push(new Bacteria(bacteriaSize, SPHERE_DIV));
  bacteria.push(new Bacteria(bacteriaSize, SPHERE_DIV));
  bacteria.push(new Bacteria(bacteriaSize, SPHERE_DIV));

//  TEST EVENT TRIGGER
  /*window.addEventListener("keydown", function (event) {
    if(event.key == "a") {
      for(var b = 0; b < bacteria.length; b++) {
        bacteria[b].grow();
      }
    }
  });*/

  //END SPHERES

  var timeLoc = gl.getUniformLocation(gl.program, 'time');

  // Get the storage locations of uniform variables and so on
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location');
    return;
  }

  // Set the eye point and the viewing volume
  var vpMatrix = new Matrix4();   // View projection matrix
  // Calculate the view projection matrix
  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  vpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  
  var currentAngle = 0.0;  // Current rotation angle
  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix

  //time counter
  var counter = 0;


  
  /*
  * Render Loop
  */

  function render(time) {
    
    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //animate the angle
    currentAngle = animate(currentAngle);


    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    time *= 0.001;  // convert to seconds
    Time();
    //every few seconds
    if(Math.floor(time / growth_rate) > counter) {
      counter++;
      for(var b = 0; b < bacteria.length; b++) {
        bacteria[b].grow();
      }
    }

    //draw objects
    //playsurface
    draw(gl, playfield.vertices, playfield.colours, playfield.indices, playfield.normals);

    //bacteria
    for(i = 0; i < bacteria.length; i++) {
      bacteria[i].bactDraw(mvpMatrix, u_MvpMatrix, gl);
    }

    // tell the shader the time
    gl.uniform1f(timeLoc, time);



    document.body.onmousedown = function(ev) { onClick(ev, gl, bacteria) };
    //checkPointColor(gl, 300, 300);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function CreateSphere(size, colour) {
  //resource: https://stackoverflow.com/questions/47756053/webgl-try-draw-sphere
  var ai, si, ci;
  var aj, sj, cj;
  var p1, p2;
  var vertices = [], indices = [];
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);
      vertices.push(si * sj * size.x);  // X
      vertices.push(cj * size.y);       // Y
      vertices.push(ci * sj * size.z);  // Z
    }
  }

  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV + 1) + i;
      p2 = p1 + (SPHERE_DIV + 1);
      indices.push(p1);
      indices.push(p2);
      indices.push(p1 + 1);
      indices.push(p1 + 1);
      indices.push(p2);
      indices.push(p2 + 1);
    }
  }
  //end resource

  var colours = [];
  for (i = 0; i < vertices.length; i++){
    colours.push(colour.r);
    colours.push(colour.g);
    colours.push(colour.b);
  }

  return {vertices, indices, colours};
}

function initArrayBuffer(gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}

var elapsed;
function Time() {
  // Calculate the elapsed time
  var now = Date.now();
  elapsed = now - timer;
  elapsed = Math.floor(elapsed*0.001);
  if (elapsed > 2){
    timer = Date.now();
  }
}

function onClickRestart() {
  location.reload();
}


// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function draw(gl, vertices, colours, indices){
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(vertices), 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Colour', new Float32Array(colours), 3, gl.FLOAT)) return -1;

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  //play surface - change to sphere
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function checkPointColor(gl, x, y) {
  //https://stackoverflow.com/questions/44070167/get-color-at-position-webgl/44070611
  var pixels = new Uint8Array(
    4 * gl.drawingBufferWidth * gl.drawingBufferHeight
  );
  gl.readPixels(
      0,
      0,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels
  );
  // And here's components of a pixel on (x, y):
  var pixelR = pixels[4 * (y * gl.drawingBufferWidth + x)];
  var pixelG = pixels[4 * (y * gl.drawingBufferWidth + x) + 1];
  var pixelB = pixels[4 * (y * gl.drawingBufferWidth + x) + 2];
  var pixelA = pixels[4 * (y * gl.drawingBufferWidth + x) + 3];
    return {r:pixelR, g:pixelG, b:pixelB, a:pixelA};
}

function onClick(ev, gl, bacteria){
  //get canvas x and y position
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();
  var x_canvas = x - rect.left;
  var y_canvas = rect.bottom - y;

  //get color at mouse position
  var color = checkPointColor(gl, Math.round(x_canvas), Math.round(y_canvas));
  console.log("color: " + color.r + ", " + color.g + ", " + color.b);

  //delete bacteria with the same color
  for(i = 0; i < bacteria.length; i++) {
    bColor = bacteria[i].getColor();
    console.log("comparing: " + bColor.r +", " + bColor.g + ", " + bColor.b + "\tto:" + color.r + ", " + color.g + ", " + color.b)
    if(bColor.r == color.r && bColor.g == color.g && bColor.b == color.b) {
      bacteria.splice(i, 1);
      break;
    }
  }

}