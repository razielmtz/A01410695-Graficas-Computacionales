let renderer = null, 
scene = null, 
camera = null,
cube = null,
sphere = null,
cone = null,
sphereGroup = null;

// Material to be used
let textureUrl = "../images/ash_uvgrid01.jpg";
let texture = new THREE.TextureLoader().load(textureUrl);
let material = new THREE.MeshPhongMaterial({ map: texture });

//Geometries to be selected
let geometry1 = new THREE.CubeGeometry(0.8, 0.8, 1);
let geometry2 = new THREE.SphereGeometry(0.6, 20, 20);
let geometry3 = new THREE.CylinderGeometry(0, 0.7, 0.9, 20, 20);
let geometry4 = new THREE.CylinderBufferGeometry(0.4, 0.4, 0.8, 20);
let geometry5 = new THREE.TorusKnotBufferGeometry(0.32, 0.12, 80, 10, 2, 3);
let geometry6 = new THREE.CubeGeometry(0.25, 0.25, 0.4);
let geometry7 = new THREE.SphereGeometry(0.20, 20, 20);
let geometry8 = new THREE.CylinderGeometry(0, 0.20, 0.25, 20, 20);
let geometry9 = new THREE.CylinderBufferGeometry(0.17, 0.17, 0.35, 20);
let geometry10 = new THREE.TorusKnotBufferGeometry(0.08, 0.06, 80, 10, 2, 3);
let elementOptions = [geometry1, geometry2, geometry3, geometry4, geometry5];
let satelliteOptions = [geometry6, geometry7, geometry8, geometry9, geometry10];

// Planets reference
let planetList = [];
let pivotList = [];
let satelliteList = [];


let duration = 5000; // ms
let currentTime = Date.now();

function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    // Add rotation to satellites
    pivotList.forEach(pivot => {
        pivot.rotation.y += angle;
    })

    // Rotate the planet about its Y axis
    planetList.forEach(planet => {
        planet.rotation.y += angle/6;
    })

    // Rotate the satellite about its X axis
    satelliteList.forEach(satellite => {
        satellite.rotation.x += angle * 5;
    })
}

function run() {
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Spin the cube for next frame
    animate();
}

function createScene(canvas)
{    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Set the background color 
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );
    // scene.background = new THREE.Color( "rgb(100, 100, 100)" );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 10;
    scene.add(camera);

    // Create a group to hold all the objects
    let cubeGroup = new THREE.Object3D;
    
    // Add a directional light to show off the objects
    let light = new THREE.DirectionalLight( 0xffffff, 1.0);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

}

function addPlanet() {

    // Select a random planet geometry
    let geometry = elementOptions[Math.floor(Math.random()*5)];
    let newElement = new THREE.Mesh(geometry, material);

    // Create random position for the new planet
    newElement.position.set((Math.random() * 9) - 4.5, (Math.random() * 7) - 3.5, -0.5);
    
    // Add element to the scene
    scene.add( newElement );

    //Crate a pivot to rotate satellites
    let pivotPoint = new THREE.Object3D();
    newElement.add(pivotPoint);

    // Save reference to the new planet and pivot in arrays
    planetList.push(newElement);
    pivotList.push(pivotPoint);
}

function addSatellite() {

    // Select a random satellite geometry
    let geometry = satelliteOptions[Math.floor(Math.random()*5)];
    let newSatellite = new THREE.Mesh(geometry, material);

    // Create random position for the new satellite
    let randomx = 0;
    while(randomx < 0.5 && randomx > -0.5) {
        randomx = (Math.random() * 3) - 1.5;
    }
    randomz = (Math.random() * 2) - 1;
    newSatellite.position.set(randomx,0,randomz);

    // Add it to the scene (pivot)
    pivotList[pivotList.length-1].add(newSatellite);

    satelliteList.push(newSatellite);

}

function resetScene() {

    // Delete each of the planets
    for(let i = planetList.length-1; i>=0; i--){
        scene.remove(planetList[i]);
        scene.remove(pivotList[i]);
        planetList.pop();
        pivotList.pop();
    }

     // Delete each of the planets
     for(let i = satelliteList.length-1; i>=0; i--){
        scene.remove(satelliteList[i]);
        pivotList.pop();
    }

}