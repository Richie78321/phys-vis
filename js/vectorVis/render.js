var START_OFFSET = 25;
var BACKGROUND_COLOR = 0xEDF5E1;
var AXIS_COLORS = [0xff0000, 0x00ff00, 0x0000ff];
var AXIS_LENGTH = 100;

var ORIGINAL_WARN = console.warn;
console.warn = function() {};

var CANVAS_HEIGHT_DIVISOR = 1.75;

var X = 0,
  Y = 0,
  Z = 0;
var COMPONENT_CHANGE_EVENT = new Event('vector-component-change');

function UpdateVectorComponents(Xnew, Ynew, Znew) {
  X = Xnew;
  Y = Ynew;
  Z = Znew;
  document.dispatchEvent(COMPONENT_CHANGE_EVENT);
}

function CreateVectorRenderer(parentElement, backColor) {
  var scene, camera, renderer;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / (window.innerHeight / 2), 0.1, 1000);
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setClearColor(backColor, 1);
  renderer.setSize(window.innerWidth, window.innerHeight / CANVAS_HEIGHT_DIVISOR);
  parentElement.appendChild(renderer.domElement);

  var renderObject = {
    animateEvent: new Event('animate'),
    parentElement: parentElement,
    scene: scene,
    camera: camera,
    renderer: renderer,
    animate: function() {
      requestAnimationFrame(this.animate.bind(this));
      this.parentElement.dispatchEvent(this.animateEvent);
      this.renderer.render(this.scene, this.camera);
    },
    resize: function() {
      this.camera.aspect = window.innerWidth / (window.innerHeight / CANVAS_HEIGHT_DIVISOR);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight / CANVAS_HEIGHT_DIVISOR);
    },
    addAnimationCall: function(animationCall) {
      parentElement.addEventListener('animate', animationCall);
    }
  }
  renderObject.animate();
  $(window).resize(renderObject.resize.bind(renderObject));

  return renderObject;
}

function RunVectorDraw() {
  var renderObject = CreateVectorRenderer(document.getElementById("vector-draw"), BACKGROUND_COLOR);
  renderObject.camera.position.z = START_OFFSET;
  var control = new THREE.OrbitControls(renderObject.camera, renderObject.parentElement);
  renderObject.addAnimationCall(control.update.bind(control));
  SetAxes(renderObject);

  var vectorDrawObj = {
    renderObject: renderObject,
    vectorArrows: null,
    control: control,
    updateVectorArrows: function() {
      if (this.vectorArrows != null) {
        for (var i = 0; i < this.vectorArrows.length; i++) {
          this.renderObject.scene.remove(this.vectorArrows[i]);
        }
      }
      this.vectorArrows = CreateVectorArrows();
      for (var i = 0; i < this.vectorArrows.length; i++) {
        this.renderObject.scene.add(this.vectorArrows[i]);
      }
    },
    setPlaneView: function(XY, ZY, ZX) {
      if (XY) {
        //Complete (rotate orbit control)
      }
    }
  }
  document.addEventListener('vector-component-change', vectorDrawObj.updateVectorArrows.bind(vectorDrawObj));
  $(window).resize(vectorDrawObj.updateVectorArrows.bind(vectorDrawObj));

  //View listeners
  //document.getElementById("xy-plane-button").addEventListener('click', function() { vectorDrawObj.setPlaneView(true, false, false); });
  //document.getElementById("zy-plane-button").addEventListener('click', function() { vectorDrawObj.setPlaneView(false, true, false); });
  //document.getElementById("zx-plane-button").addEventListener('click', function() { vectorDrawObj.setPlaneView(false, false, true); });
}

function SetAxes(renderObject) {
  var lineMaterial = new THREE.LineDashedMaterial({
    color: 0x379683,
    linewidth: 10,
    scale: 1,
    dashSize: 1,
    gapSize: .2
  })

  var axisVertices = [
    [new THREE.Vector3(-AXIS_LENGTH, 0, 0), new THREE.Vector3(AXIS_LENGTH, 0, 0)],
    [new THREE.Vector3(0, -AXIS_LENGTH, 0), new THREE.Vector3(0, AXIS_LENGTH, 0)],
    [new THREE.Vector3(0, 0, -AXIS_LENGTH), new THREE.Vector3(0, 0, AXIS_LENGTH)]
  ];

  for (var i = 0; i < axisVertices.length; i++) {
    var lineGeom = new THREE.Geometry();
    lineGeom.vertices.push(axisVertices[i][0], axisVertices[i][1]);
    var line = new THREE.Line(lineGeom, lineMaterial);
    line.computeLineDistances();
    renderObject.scene.add(line);
  }
}

var MESH_LINE_SIZE = .8;
var MESH_LINE_THICKNESS = .15;

function CreateVectorArrows() {
  var arrows = [];
  var origin = new THREE.Vector3(0, 0, 0);

  arrows.push(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, X, AXIS_COLORS[0]));
  arrows.push(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, Y, AXIS_COLORS[1]));
  arrows.push(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, Z, AXIS_COLORS[2]));
  var dir = new THREE.Vector3(X, Y, Z);
  var length = dir.length();
  dir.normalize();
  arrows.push(new THREE.ArrowHelper(dir, origin, length, 0x05386B));

  var lineVerts = [new THREE.Vector3(X * MESH_LINE_SIZE, 0, 0), new THREE.Vector3(0, Y * MESH_LINE_SIZE, 0), new THREE.Vector3(0, 0, Z * MESH_LINE_SIZE)];
  var meshLineGeoms = [new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry()];
  for (var i = 0; i < meshLineGeoms.length; i++) {
    meshLineGeoms[i].vertices.push(origin);
    meshLineGeoms[i].vertices.push(lineVerts[i]);
    var line = new MeshLine();
    line.setGeometry(meshLineGeoms[i]);
    var material = new MeshLineMaterial({
      color: AXIS_COLORS[i],
      lineWidth: MESH_LINE_THICKNESS,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight / CANVAS_HEIGHT_DIVISOR)
    });
    var mesh = new THREE.Mesh(line.geometry, material);
    arrows.push(mesh);
  }

  return arrows;
}
