// RotatingTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform float time;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '   gl_PointSize = 20.0;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

//GLOBALS
var timer = Date.now();
var gameIsActive = true;
var score = 0; //player score

function main() {
  // Retrieve <canvas> element
  var canvas = document.querySelector('#webgl');

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

  //Get the storage location of a_Position 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0){
      console.log('Fail to get the storage location of a_Position');
      return;
  }

  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor){
    console.log('Failed to get the storage location');
    return
  }

  
  var n = CreateSphere(gl);


  var timeLoc = gl.getUniformLocation(gl.program, 'time');

  // var positionBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.enable( gl.DEPTH_TEST );
  
  

 
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  

  //create a limit for new bacteria
  var bacteriaCap = 5; 

  var bacteria = []; //stores current bacteria on the board;

  var el = 0; //stores time since last rendered frame

  var scoreText = document.getElementById('score');

  //LOOP
  function render(time) {
    // Specify the color for clearing <canvas>
    gl.clearColor(1, 1, 1, 1);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    time *= 0.001;  // convert to seconds
    Time();

    canvas.onmousedown = function(ev){ click(ev, canvas, bacteria); };

    //play surface - change to sphere
    gl.uniform4f(u_FragColor, 0, 0, 0, 1);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
    console.log(n);
    
    
    // tell the shader the time
    gl.uniform1f(timeLoc, time);
    console.log("here");
    // //create new starting bacteria
    // if((elapsed + 1) % 4 == 0) {
    //   //try 10 times to create a bacteria not within other bacteria
    //   //if one is not found, give up
    //   var insideBac = true;
    //   for(i = 0; i < 10 && insideBac; i++) {
    //     insideBac = false;
    //     var angle = Math.floor(Math.random() * 2 * Math.PI);
    //     for(j = 0; j < bacteria.length; j++) {
    //       if(bacteria[j].isWithin(angle)) {
    //         insideBac = true;
    //       }
    //     }
    //   }
    //   if(!insideBac) {
    //     bacteria.push(new Bacteria(angle, [Math.random(), Math.random(), Math.random(), (Math.random()*0.5)+0.5], 0.03));
    //   }
    //   console.log(bacteria); 
    // }

    
    // // grow the bacteria using the time passed as a parameter for how much to grow on that frame
    // for(i = 0; i < bacteria.length; i++){
    //   bacteria[i].growthFunction(time - el);
    // }

    // //update score display
    // scoreText.innerHTML = "Score: " + Math.floor(score * 10);
    

    // //check for bacteria collision
    // for (i = 0; i < bacteria.length - 1; i++){
    //   for(j = i + 1; j < bacteria.length; j++) {
    //     if(bacteria[j].isWithin(bacteria[i].minAngle)) {  //bac[i] is inside bac[j]
    //       if(bacteria[j].getSize() > bacteria[i].getSize()) { // if bac[j] > bac[i]
    //         //subtract from score according to the smaller bacteria's size
    //         score -= (bacteria[i].getSize() / 2);
    //         bacteria[j].growTo(bacteria[i].getSize());
    //         bacteria.splice(i, 1); //remove bac[i]
    //       } else {
    //         //subtract from score according to the smaller bacteria's size
    //         score -= (bacteria[j].getSize() / 2);
    //         bacteria[i].growTo(bacteria[j].getSize());
    //         bacteria.splice(j, 1); //remove bac[j]
    //       }
    //       console.log(bacteria);
    //     } else if(bacteria[j].isWithin(bacteria[i].maxAngle)) {
    //       if(bacteria[j].getSize() > bacteria[i].getSize()) { // if bac[j] > bac[i]
    //         //subtract from score according to the smaller bacteria's size
    //         score -= (bacteria[i].getSize() / 2);
    //         bacteria[j].growTo(bacteria[i].getSize());
    //         bacteria.splice(i, 1); //remove bac[i]
    //       } else {
    //         //subtract from score according to the smaller bacteria's size
    //         score -= (bacteria[j].getSize() / 2);
    //         bacteria[i].growTo(bacteria[j].getSize());
    //         bacteria.splice(j, 1); //remove bac[j]
    //       }
    //       console.log(bacteria);
    //     }
    //   }
    // }



    //draw all bacteria
    // for (i = 0; i < bacteria.length; i++){
    //   //draw edge circles
    //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bacteria[i].edges[0]), gl.STATIC_DRAW);
    //   gl.uniform4f(u_FragColor, bacteria[i].r, bacteria[i].g, bacteria[i].b, bacteria[i].a);
    //   gl.drawArrays(gl.TRIANGLE_FAN, 0, 12);

    //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bacteria[i].edges[1]), gl.STATIC_DRAW);
    //   gl.drawArrays(gl.TRIANGLE_FAN, 0, 12);

    //   //draw middle growth verts
    //   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bacteria[i].growthVerts), gl.STATIC_DRAW);
    //   gl.drawArrays(gl.TRIANGLE_STRIP, 0, Math.floor(bacteria[i].growthVerts.length / 2.0));
    // }
    


    //END GAME CRITERIA
    //bacteria is too large or too many bacteria
    // for (i = 0; i < bacteria.length; i++){
    //   if (bacteria[i].getSize() > Math.PI) {
    //     scoreText.innerHTML = "Now that\'s one huge bacteria! They\'re beyond your control<br>Final Score: " + Math.floor(score * 10);
    //     console.log("bacteria[i].getSize() > Math.PI");
    //     gameIsActive = false;
    //   }
    // }
    // if(bacteria.length > bacteriaCap) {
    //   scoreText.innerHTML = "There are too many bacteria! They\'re beyond your control<br>Final Score: " + Math.floor(score * 10);
    //   console.log("bacteria.length > " + bacteriaCap);
    //   gameIsActive = false;
    // }

    // el = time;
    
    // if (gameIsActive){
    // requestAnimationFrame(render);
    // } else {
    //   document.getElementById("restartBtn").style.display = "inline-block";
    // }
  }
  requestAnimationFrame(render);
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

function CreateSphere(gl) {

  var SPHERE_DIV = 6;
  var i, ai, si, ci;
  var j, aj, sj, cj;
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
      vertices.push(si * sj);  // X
      vertices.push(cj);       // Y
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
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}

function CreateCircle(gl, x, y, r, n){
  var circle = {x: x, y:y, r: r};
  var degreePerFan = (2 * Math.PI) / (n - 2);
  var vertexData = [x, y]; //origin

  for(var i = 1; i < n; i++) {
    var angle = degreePerFan * (i+1);
    vertexData[i*2] =  circle.x + Math.cos(angle) * circle.r;
    vertexData[(i*2) + 1] = circle.y + Math.sin(angle) * circle.r;
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
}

function StoreCircle(x, y, r, n){
  var circle = {x: x, y:y, r: r};
  var degreePerFan = (2 * Math.PI) / (n - 2);
  var vertexData = [x, y]; //origin

  for(var i = 1; i < n; i++) {
    var angle = degreePerFan * (i+1);
    vertexData[i*2] =  circle.x + Math.cos(angle) * circle.r;
    vertexData[(i*2) + 1] = circle.y + Math.sin(angle) * circle.r;
  }

  return vertexData;
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

//NOTES:
  //create a new point
  //var testPoint = StorePoint(0.9, 0.9);
  //console.log(testPoint[1]);
  //gl.vertexAttrib3f(a_Position, testPoint[0], testPoint[1], 0.0);
  //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(testPoint), gl.STATIC_DRAW);
  //gl.drawArrays(gl.POINTS, 0, 1);