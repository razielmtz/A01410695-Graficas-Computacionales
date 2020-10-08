let renderer = null, 
scene = null, 
camera = null,
cube = null,
sphere = null,
cone = null,
sphereGroup = null;

// Materials to be used
let sunMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("./textures/sun_texture.jpg") });
let mercuryMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/8k_mercury.jpg"),
                                                    bumpMap: new THREE.TextureLoader().load("./textures/mercurybump.jpg"),
                                                    bumpScale: 0.02,
                                                    });
let venusMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/4k_venus_atmosphere.jpg"),
                                                  bumpMap: new THREE.TextureLoader().load("./textures/venusbump.jpg"),
                                                  bumpScale: 0.02,
                                                });
let earthMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/8k_earth_daymap.jpg"),
                                                  bumpMap: new THREE.TextureLoader().load("./textures/earthbump1k.jpg"),
                                                  bumpScale: 0.02,
                                                  normalMap: new THREE.TextureLoader().load("./textures/earthnormal.jpg")
                                                });
let marsMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/8k_mars.jpg"),
                                                 bumpMap: new THREE.TextureLoader().load("./textures/marsbump1k.jpg"),
                                                 bumpScale: 0.3,
                                                 normalMap: new THREE.TextureLoader().load("./textures/mars_1k_normal.jpg")
                                              });
let jupiterMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/8k_jupiter.jpg") });
let saturnMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/8k_saturn.jpg") });
let uranusMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/2k_uranus.jpg") });
let neptuneMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/2k_neptune.jpg") });
let plutoMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/pluto.jpg"),
                                                  bumpMap: new THREE.TextureLoader().load("./textures/plutobump1k.jpg"),
                                                  bumpScale: 0.02,
                                                });

let moonMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/moon_1024.jpg") });
let asteroidMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/asteroid.jpg") });
let orbitMaterial = new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load("./textures/orbit.png") });

let celestialBodiesMaterials = [sunMaterial, mercuryMaterial, venusMaterial, earthMaterial, marsMaterial, jupiterMaterial, saturnMaterial, uranusMaterial, neptuneMaterial, plutoMaterial];

//Geometries to be selected
let sun = new THREE.SphereGeometry(0.3, 20, 20);
let satellite = new THREE.SphereGeometry(0.03, 20, 20);
let asteroid = new THREE.SphereGeometry(0.015, 20, 20);
let planetsSize = [0.04, 0.12, 0.125, 0.06, .16, .15, .148, .145, 0.05];

// Planets reference
let celestialBodiesList = [];
let celestialBodiesPivotList = [];
let satelliteList = [];
let satellitesPivotList = [];
let asteroidsList = [];
let asteroidPivotsList = [];

let duration = 5000; // ms
let currentTime = Date.now();

function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    let decreasePlanetSpeed = angle;

    // Add rotation to planets around the sun
    celestialBodiesPivotList.forEach(pivot => {
        pivot.rotation.z += decreasePlanetSpeed;
        decreasePlanetSpeed /= 1.5;
    })

    // Add rotation to satellites around their planet
    satellitesPivotList.forEach(sPivot => {
        sPivot.pivotPoint.rotation.z += (angle *  sPivot.speed * 1.5);
    })

    // Add rotation to satellites around the sun
    asteroidPivotsList.forEach(aPivot => {
        aPivot.pivotPoint.rotation.z += (angle *  aPivot.speed);
    })

    // Rotate the planets around their Z axis
    celestialBodiesList.forEach((celestialBody, index) => {
        if(index == 0){
            celestialBody.rotation.z += angle/3;
        } else {
            celestialBody.rotation.z += angle;
        } 
    })

    // Rotate the satellites around their Z axis
    satelliteList.forEach((satellite, index) => {
         satellite.rotation.z += angle;
    
    })

    controls.update();
    renderer.render(scene, camera);
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

    // Set the background
    let backgroundImage = new THREE.TextureLoader();
    let backgroundTexture = backgroundImage.load("./textures/space.jpg")
    scene.background = backgroundTexture;

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 10;
    scene.add(camera);

    let controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.update();

    // Create a group to hold all the objects
    let cubeGroup = new THREE.Object3D;
    
    // Add a point light to show off the objects
    let light = new THREE.PointLight( 0xffffff, 1.0);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(0, 0, 0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

}

function addCelestialBodies() {

    // Select a random planet geometry
    let geometry = sun;
    let theSun = new THREE.Mesh(geometry, celestialBodiesMaterials[0]);

    // Create random position for the new planet
    theSun.position.set(0, 0, 0);
    
    // Add element to the scene
    scene.add( theSun );

    //Crate a pivot to rotate satellites
    let pivotPoint = new THREE.Object3D();
    pivotPoint.position.set(0,0,0);
    scene.add( pivotPoint );

    // Save reference to the new planet and pivot in arrays
    celestialBodiesList.push(theSun);
    celestialBodiesPivotList.push(pivotPoint);

    let newPlanetPosition = 0.5;

    for(let i = 0; i < 9; i ++){

        let geometry = new THREE.SphereGeometry(planetsSize[i], 20, 20);;
        let newPlanet = new THREE.Mesh(geometry, celestialBodiesMaterials[i+1]);

        newPlanet.position.set(newPlanetPosition,0, 0);

        let pivotPoint = new THREE.Object3D();
        pivotPoint.position.set(0,0,0);
        scene.add( pivotPoint );
        celestialBodiesPivotList.push(pivotPoint);

        pivotPoint.add(newPlanet);

        celestialBodiesList.push(newPlanet);

        if( i == 5){ //Saturn Ring
            let ringGeometry = new THREE.RingGeometry( 0.2, 0.30, 32 );
            let ringMaterial = new THREE.MeshPhongMaterial( { map: new THREE.TextureLoader().load("./textures/saturnRings.png"), side: THREE.DoubleSide } );
            let ringMesh = new THREE.Mesh( ringGeometry, ringMaterial );
            ringMesh.rotation.y -= .50;
            ringMesh.position.set(newPlanetPosition, 0, 0);
            pivotPoint.add( ringMesh );
            celestialBodiesList.push(ringMesh);
        } else if ( i == 6){
            let ringGeometry = new THREE.RingGeometry( 0.2, 0.22, 32 );
            let ringMaterial = new THREE.MeshPhongMaterial( { map: new THREE.TextureLoader().load("./textures/uranusRings.png"), side: THREE.DoubleSide } );
            let ringMesh = new THREE.Mesh( ringGeometry, ringMaterial );
            ringMesh.rotation.y -= 1;
            ringMesh.position.set(newPlanetPosition, 0, 0);
            pivotPoint.add( ringMesh );
            celestialBodiesList.push(ringMesh);
        }

        //Add moons
        if(i == 2){ //Earth 
            addMoons(1, newPlanetPosition, pivotPoint, 'medium');
        } else if (i == 3){ //Mars
            addMoons(2, newPlanetPosition, pivotPoint, 'small');
        } else if (i == 4){ //Jupiter
            addMoons(20, newPlanetPosition, pivotPoint, 'big');
        } else if (i == 5){ //Saturn
            addMoons(24, newPlanetPosition, pivotPoint, 'big');
        } else if (i == 6){ //Uranus
            addMoons(2, newPlanetPosition, pivotPoint, 'big');
        } else if (i == 7){ //Neptune
            addMoons(14, newPlanetPosition, pivotPoint, 'big');
        } else if (i == 8){ //Pluto
            addMoons(5, newPlanetPosition, pivotPoint, 'small');
        }

        if(i == 0){
            newPlanetPosition += .25;
        } else if(i == 1 || i == 2) {
            newPlanetPosition += .30;
        } else if (i == 3){
            newPlanetPosition += .59;
        } else {
            newPlanetPosition += 0.48;
        }

    }

    addAsteroidBelt();

    
}

function addMoons(quantity, planetPosition, planetSourcePivot, planetSize){

    for(let i = 0; i<quantity; i++){
        
        let geometry = satellite;
        let newSatellite = new THREE.Mesh(geometry, moonMaterial);

        let angle = Math.random()*Math.PI*2;
        if(planetSize === 'small'){
            randomx = Math.cos(angle)*0.08;
            randomy = Math.sin(angle)*0.08;
        } else if (planetSize === 'medium') {
            randomx = Math.cos(angle)*0.15;
            randomy = Math.sin(angle)*0.15;
        } else {    
            randomx = Math.cos(angle)*0.2;
            randomy = Math.sin(angle)*0.2;
        }

        newSatellite.position.set(randomx,randomy, 0);
       
        let satellitePivotPoint = new THREE.Object3D();
        satellitePivotPoint.position.set(planetPosition, 0, 0);

        pivotSpeed = (Math.random() * 0.25) + 0.1;

        satellitePivot = {pivotPoint: satellitePivotPoint, speed: pivotSpeed};

        satellitesPivotList.push(satellitePivot);
        scene.add(satellitePivotPoint);
        satellitePivotPoint.add(newSatellite);
        planetSourcePivot.add(satellitePivotPoint);

        satelliteList.push(newSatellite);
    }

}

function addAsteroidBelt() {

    for(let i = 0; i< 400; i++){
        let geometry = asteroid;
        let newAsteroid = new THREE.Mesh(geometry, asteroidMaterial);

        let angle = Math.random()*Math.PI*2;
  
        randomx = Math.cos(angle)*((Math.random() * 0.25) + 1.45);
        randomy = Math.sin(angle)*((Math.random() * 0.25) + 1.45);
        randomz = (Math.random() * 1.15) + 1.25

        newAsteroid.position.set(randomx,randomy, 0);
       
        let asteroidPivotPoint = new THREE.Object3D();
        asteroidPivotPoint.position.set(0, 0, 0);

        pivotSpeed = (Math.random() * 0.15) + 0.05;
        asteroidPivot = {pivotPoint: asteroidPivotPoint, speed: pivotSpeed};

        asteroidPivotsList.push(asteroidPivot);
        scene.add(asteroidPivotPoint);
        asteroidPivotPoint.add(newAsteroid);

        asteroidsList.push(newAsteroid);
    }

}

function addOrbits(){

    let orbitRadius = 0.5;

    for(let i = 0; i < 9; i++){

        let new_orbit = new THREE.TorusBufferGeometry(orbitRadius, 0.01, 40, 100);

        let newElement = new THREE.Mesh(new_orbit, orbitMaterial);

        newElement.position.set(0, 0, 0);
        
        scene.add( newElement );
        
        if(i == 0){
            orbitRadius += .25;
        } else if (i == 1 || i == 2){
            orbitRadius += .30;
        } else if (i == 3) {
            orbitRadius += .59;
        }else {
            orbitRadius += .48;
        }  
    }
}