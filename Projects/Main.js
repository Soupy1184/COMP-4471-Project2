// RotatingTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Colour;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform vec3 u_LightDirection;\n' +
  'varying vec4 v_Colour;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec4 normal = u_NormalMatrix * a_Normal;\n' +
  '  float nDotL = max(dot(u_LightDirection, normalize(normal.xyz)), 0.0);\n' +
  '  v_Colour = vec4(a_Colour.xyz * nDotL, a_Colour.a);\n' + 
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

function main() {

  

  // Retrieve <canvas> element
  var canvas = document.querySelector('#webgl');

  //rotate left
  
  //hide restart button
  document.getElementById("restartBtn").style.display = "none";

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  var object = CreateSphere(gl, 1, 1, 0.1);
  if (!object) {
    console.log('Failed to set the vertex information');
    return;
  }

  var object2 = CreateSphere(gl, 1.01, 1.01, 0.9);
  if (!object2) {
    console.log('Failed to set the vertex information');
    return;
  }

  object2test = [];
  for (i = 0; i < 1344 ; i++){
    object2test.push(object2.indices[i]);
  }

  var timeLoc = gl.getUniformLocation(gl.program, 'time');

  // Get the storage locations of uniform variables and so on
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightDirection) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the eye point and the viewing volume
  var vpMatrix = new Matrix4();   // View projection matrix
  // Calculate the view projection matrix
  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  vpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.5, 3.0, 4.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);
  
  var currentAngle = 0.0;  // Current rotation angle
  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

  // var positionBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  

  //create a limit for new bacteria
  var bacteriaCap = 5; 

  var bacteria = []; //stores current bacteria on the board;

  var el = 0; //stores time since last rendered frame

  var scoreText = document.getElementById('score');

  //LOOP
  function render(time) {
    
    //   // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Calculate the model matrix
    document.addEventListener('keydown', function (evt) {
      if (evt.keyCode == 37) {//rotate left
        modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate around the y-axis
        ANGLE_STEP = -50.0;
      }
      else if (evt.keyCode == 39) {//rotate right
        modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate around the y-axis
        ANGLE_STEP = 50.0;
      }
      else if (evt.keyCode == 38) {//rotate up
        modelMatrix.setRotate(currentAngle, 1, 0, 0); // Rotate around the y-axis
        ANGLE_STEP = -50.0;
      }
      else if (evt.keyCode == 40) { //rotate down
        modelMatrix.setRotate(currentAngle, 1, 0, 0); // Rotate around the y-axis
        ANGLE_STEP = 50.0;
      }
    });
    
    document.addEventListener('keyup', function (evt) {
      if (evt.keyCode == 37 || evt.keyCode == 39 || evt.keyCode == 38 || evt.keyCode == 40) {
        ANGLE_STEP = 0.0;
      }
    });

    currentAngle = animate(currentAngle);


    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    time *= 0.001;  // convert to seconds
    Time();

    canvas.onmousedown = function(ev) { click(ev, canvas, bacteria); };

    
    

    //draw objects
    draw(gl, object.vertices, object.colours, object.indices, object.normals);
    draw(gl, object2.vertices, object2.colours, object2test, object2.normals);
    
    // tell the shader the time
    gl.uniform1f(timeLoc, time);
  //   console.log("here");
  //   // //create new starting bacteria
  //   // if((elapsed + 1) % 4 == 0) {
  //   //   //try 10 times to create a bacteria not within other bacteria
  //   //   //if one is not found, give up
  //   //   var insideBac = true;
  //   //   for(i = 0; i < 10 && insideBac; i++) {
  //   //     insideBac = false;
  //   //     var angle = Math.floor(Math.random() * 2 * Math.PI);
  //   //     for(j = 0; j < bacteria.length; j++) {
  //   //       if(bacteria[j].isWithin(angle)) {
  //   //         insideBac = true;
  //   //       }
  //   //     }
  //   //   }
  //   //   if(!insideBac) {
  //   //     bacteria.push(new Bacteria(angle, [Math.random(), Math.random(), Math.random(), (Math.random()*0.5)+0.5], 0.03));
  //   //   }
  //   //   console.log(bacteria); 
  //   // }

    
  //   // // grow the bacteria using the time passed as a parameter for how much to grow on that frame
  //   // for(i = 0; i < bacteria.length; i++){
  //   //   bacteria[i].growthFunction(time - el);
  //   // }

  //   // //update score display
  //   // scoreText.innerHTML = "Score: " + Math.floor(score * 10);
    

  //   // //check for bacteria collision
  //   // for (i = 0; i < bacteria.length - 1; i++){
  //   //   for(j = i + 1; j < bacteria.length; j++) {
  //   //     if(bacteria[j].isWithin(bacteria[i].minAngle)) {  //bac[i] is inside bac[j]
  //   //       if(bacteria[j].getSize() > bacteria[i].getSize()) { // if bac[j] > bac[i]
  //   //         //subtract from score according to the smaller bacteria's size
  //   //         score -= (bacteria[i].getSize() / 2);
  //   //         bacteria[j].growTo(bacteria[i].getSize());
  //   //         bacteria.splice(i, 1); //remove bac[i]
  //   //       } else {
  //   //         //subtract from score according to the smaller bacteria's size
  //   //         score -= (bacteria[j].getSize() / 2);
  //   //         bacteria[i].growTo(bacteria[j].getSize());
  //   //         bacteria.splice(j, 1); //remove bac[j]
  //   //       }
  //   //       console.log(bacteria);
  //   //     } else if(bacteria[j].isWithin(bacteria[i].maxAngle)) {
  //   //       if(bacteria[j].getSize() > bacteria[i].getSize()) { // if bac[j] > bac[i]
  //   //         //subtract from score according to the smaller bacteria's size
  //   //         score -= (bacteria[i].getSize() / 2);
  //   //         bacteria[j].growTo(bacteria[i].getSize());
  //   //         bacteria.splice(i, 1); //remove bac[i]
  //   //       } else {
  //   //         //subtract from score according to the smaller bacteria's size
  //   //         score -= (bacteria[j].getSize() / 2);
  //   //         bacteria[i].growTo(bacteria[j].getSize());
  //   //         bacteria.splice(j, 1); //remove bac[j]
  //   //       }
  //   //       console.log(bacteria);
  //   //     }
  //   //   }
  //   // }



  //   //draw all bacteria
  //   // for (i = 0; i < bacteria.length; i++){
  //   //   //draw edge circles
  //   //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bacteria[i].edges[0]), gl.STATIC_DRAW);
  //   //   gl.uniform4f(u_FragColor, bacteria[i].r, bacteria[i].g, bacteria[i].b, bacteria[i].a);
  //   //   gl.drawArrays(gl.TRIANGLE_FAN, 0, 12);

  //   //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bacteria[i].edges[1]), gl.STATIC_DRAW);
  //   //   gl.drawArrays(gl.TRIANGLE_FAN, 0, 12);

  //   //   //draw middle growth verts
  //   //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bacteria[i].growthVerts), gl.STATIC_DRAW);
  //   //   gl.drawArrays(gl.TRIANGLE_STRIP, 0, Math.floor(bacteria[i].growthVerts.length / 2.0));
  //   // }
    


  //   //END GAME CRITERIA
  //   //bacteria is too large or too many bacteria
  //   // for (i = 0; i < bacteria.length; i++){
  //   //   if (bacteria[i].getSize() > Math.PI) {
  //   //     scoreText.innerHTML = "Now that\'s one huge bacteria! They\'re beyond your control<br>Final Score: " + Math.floor(score * 10);
  //   //     console.log("bacteria[i].getSize() > Math.PI");
  //   //     gameIsActive = false;
  //   //   }
  //   // }
  //   // if(bacteria.length > bacteriaCap) {
  //   //   scoreText.innerHTML = "There are too many bacteria! They\'re beyond your control<br>Final Score: " + Math.floor(score * 10);
  //   //   console.log("bacteria.length > " + bacteriaCap);
  //   //   gameIsActive = false;
  //   // }

  //   // el = time;
    
  //   // if (gameIsActive){
    requestAnimationFrame(render);
  //   // } else {
  //   //   document.getElementById("restartBtn").style.display = "inline-block";
  //   // }
  }
  requestAnimationFrame(render);
}



function CreateSphere(gl, x, y, colour) {
  var SPHERE_DIV = 32;
  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;
  var vertices = [], indices = [];
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 10; i <= SPHERE_DIV +10; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);
      vertices.push(si * sj * x);  // X
      vertices.push(cj * y);       // Y
      vertices.push(ci * sj);  // Z
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
  

  
  //use only the first 1344 indices of testIndices
  //1344 = 192 * 7
  // var test = [];
  // for (i = 0; i < 1344; i++){
  //   test.push(testIndices[i]);
  // }


  var colours = [];
  for (i = 0; i < vertices.length; i++){
    colours.push((Math.random() * (colour +0.1)) + (colour - 0.1));
  }

  
  // var testColours = [];
  // for (i = 0; i < testVertices.length; i++){
  //   colours.push(0.0);
  // }

  
  var normals = [];
  for (i = 0; i < vertices.length; i++){
    normals.push(Math.random());
  }

  // for(i = 0; i < testVertices.length; i++){
  //   normals.push(Math.random());
  // }

  // vertices = vertices.concat(testVertices);
  // colours = colours.concat(testColours);
  // indices = indices.concat(test);
  return {vertices, indices, colours, normals};

  

  
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

function click(ev, canvas, bacteria){
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  var target = 0;
  for (i = 0; i < bacteria.length; i++){
    var clickAngle = Math.atan(y / x);
    if(x > 0) {
      if(y < 0) {
        clickAngle = (2 * Math.PI) + clickAngle;
      }
    } else {
      clickAngle = Math.PI + clickAngle;
    }
    for(i = 0; i < bacteria.length; i++) {
      if(bacteria[i].isWithin(clickAngle)) {
        score += bacteria[i].getSize();
        bacteria.splice(i, 1);
        console.log(bacteria);
      }
    }
  }
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


function draw(gl, vertices, colours, indices, normals){
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(vertices), 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Colour', new Float32Array(colours), 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(normals), 3, gl.FLOAT)) return -1;


  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  //play surface - change to sphere
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

// function CreateCircle(gl, x, y, r, n){
  //   var circle = {x: x, y:y, r: r};
  //   var degreePerFan = (2 * Math.PI) / (n - 2);
  //   var vertexData = [x, y]; //origin
  
  //   for(var i = 1; i < n; i++) {
  //     var angle = degreePerFan * (i+1);
  //     vertexData[i*2] =  circle.x + Math.cos(angle) * circle.r;
  //     vertexData[(i*2) + 1] = circle.y + Math.sin(angle) * circle.r;
  //   }
  
  //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
  // }
  
  // function StoreCircle(x, y, r, n){
  //   var circle = {x: x, y:y, r: r};
  //   var degreePerFan = (2 * Math.PI) / (n - 2);
  //   var vertexData = [x, y]; //origin
  
  //   for(var i = 1; i < n; i++) {
  //     var angle = degreePerFan * (i+1);
  //     vertexData[i*2] =  circle.x + Math.cos(angle) * circle.r;
  //     vertexData[(i*2) + 1] = circle.y + Math.sin(angle) * circle.r;
  //   }
  
  //   return vertexData;
  // }
//NOTES:
  //create a new point
  //var testPoint = StorePoint(0.9, 0.9);
  //console.log(testPoint[1]);
  //gl.vertexAttrib3f(a_Position, testPoint[0], testPoint[1], 0.0);
  //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(testPoint), gl.STATIC_DRAW);
  //gl.drawArrays(gl.POINTS, 0, 1);