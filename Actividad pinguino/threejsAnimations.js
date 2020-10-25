// 1. Enable shadow mapping in the renderer. 
// 2. Enable shadows and set shadow parameters for the lights that cast shadows. 
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows. 
// 3. Indicate which geometry objects cast and receive shadows.

let renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
objectList = [],
orbitControls = null;

let objLoader = null, jsonLoader = null;

var duration = 15; // ms
let currentTime = Date.now();

let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let pointLight = null;
let mapUrl = "../images/snow.jpg";

let penguinAnimator = null,
loopAnimation = false;

let SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;

let objModelUrl = {obj:'../models/obj/Penguin_obj/penguin.obj', map:'../models/obj/Penguin_obj/peng_texture.jpg'};
//let objModelUrl = {obj:'../models/obj/cerberus/Cerberus.obj', map:'../models/obj/cerberus/Cerberus_A.jpg', normalMap:'../models/obj/cerberus/Cerberus_N.jpg', specularMap: '../models/obj/cerberus/Cerberus_M.jpg'};

// let jsonModelUrl = { url:'../models/json/teapot-claraio.json' };

function promisifyLoader ( loader, onProgress ) 
{
    function promiseLoader ( url ) {
  
      return new Promise( ( resolve, reject ) => {
  
        loader.load( url, resolve, onProgress, reject );
  
      } );
    }
  
    return {
      originalLoader: loader,
      load: promiseLoader,
    };
}

const onError = ( ( err ) => { console.error( err ); } );

async function loadObj(objModelUrl, objectList)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        const object = await objPromiseLoader.load(objModelUrl.obj);
        
        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
        let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;

        console.log(object);
        
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.specularMap = specularMap;
            }
        });

        object.scale.set(0.1, 0.1, 0.1);
        object.position.z = 0;
        object.position.x = 0;
        object.position.y = 0.1;
        object.name = "objObject";
        objectList.push(object);
        group.add(object);
        // scene.add(object);

    }
    catch (err) {
        return onError(err);
    }
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );


    KF.update();

    // Update the camera controller
    orbitControls.update();
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;
    
    light.color.setRGB(r, g, b);
}

function createScene(canvas) 
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 8, 22);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xaaaaaa, 1);

    // Create and add all the lights
    directionalLight.position.set(.5, 1, -3);
    directionalLight.target.position.set(0,0,0);
    // directionalLight.castShadow = true;
    root.add(directionalLight);

    spotLight = new THREE.SpotLight (0xaaaaaa);
    spotLight.position.set(2, 8, 15);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;
    
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x444444, 0.8);
    root.add(ambientLight);

    // loadJson(jsonModelUrl.url, objectList);

    // Create a group to hold the objects
    group = new THREE.Object3D;

    // Create the objects
    loadObj(objModelUrl, objectList);

    // Create a texture map
    let map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let color = 0xffffff;

    // let asteroid = new THREE.Object3D();
    // Put in a ground plane to show off the lighting
    let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    // mesh.position.y = -4.02;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    scene.add( mesh );

    root.add(group);
    
    scene.add( root );

    addMouseHandler(canvas, root);
}

function initAnimations() 
{
    penguinAnimator = new KF.KeyFrameAnimator;
    penguinAnimator.init({ 
        interps:
            [
                { 
                    keys:[0, 0.0415, .083, .125, .166, .205, .25, .2915, .33, .375, .41, .455, .5, .541, .583, .625, .66, .7083, .75, .7916, .83, .875, .91, .95, 1], 
                    // keys:[0, 0.0415, .083, .125, .166, .205, .25, .2915, .33, .375, .41, .455, .5, .541, .583, .625, .66, .7083, .75, .7916, .83, .875, .91, .95, 1], 
                    values:[
                            { y : -Math.PI/2},
                            { y : -3*Math.PI/4.5},
                            { y : -2*Math.PI/3},
                            { y : -Math.PI/2},
                            { y : -Math.PI/3},
                            { y : -Math.PI/4},
                            { y : 0},
                            { y : Math.PI/4},
                            { y : Math.PI/3},
                            { y : Math.PI/2},
                            { y : 2*Math.PI/3},
                            { y : 3*Math.PI/4},
                            { y : 3*Math.PI/4},
                            { y : 3*Math.PI/4},
                            { y : 2*Math.PI/3},
                            { y : Math.PI/2},
                            { y : Math.PI/3},
                            { y : Math.PI/4},
                            { y : 0},
                            { y : -Math.PI/4},
                            { y : -Math.PI/3},
                            { y : -Math.PI/2},
                            { y : -2*Math.PI/3},
                            { y : -3*Math.PI/4.5},
                            { y : 0},
                            ],
                    target:group.rotation
                },
                { 
                    keys:[0, 0.01, 0.02, 0.03, 0.04, 0.05, .06, 0.07, .08, 0.09, .1, .11 , .12, .13, .14, .15, .16, .17, .18, .19, .2, .21, .22, .23, .24, .25, .26, .27, .28, .29, .30, .31, .32, .33, .34, .35, .36, .37, .38, .39, .4, .41, .42, .43, .44, .45, .46, .47, .48, .49, .5, .51, .52, .53, .54, .55, .56, .57, .58, .59, .6, .61, .62, .63, .64, .65, .66, .67, .68, .69, .7, .71, .72, .73, .74, .75, .76, .77, .78, .79, .8, .81, .82, .83, .84, .85, .86, .87, .88, .89, .9, .91, .92, .93, .94, .95, .96, .97, .98, .99, 1], 
                    // keys:[0, 0.0415, .083, .125, .166, .205, .25, .2915, .33, .375, .41, .455, .5, .541, .583, .625, .66, .7083, .75, .7916, .83, .875, .91, .95, 1], 
                    values:[
                            { z: 0},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.3},
                            { z: -0.3},
                            { z: 0.0},
                            ],
                    target:group.rotation
                },
                { 
                    keys:[0, 0.0415, .083, .125, .166, .205, .25, .2915, .33, .375, .41, .455, .5, .541, .583, .625, .66, .7083, .75, .7916, .83, .875, .91, .95, 1], 
                    values:[
                            { x: 0, z : 0 }, 
                            { x: -2, z : -2 }, 
                            { x: -4, z : -4 }, 
                            { x: -6, z : -5 },
                            { x: -8, z : -4 },
                            { x: -9, z : -2 },
                            { x: -10, z : 0 },
                            { x: -9, z : 2}, 
                            { x: -8, z : 4 }, 
                            { x: -6, z : 5 }, 
                            { x: -4, z : 4 }, 
                            { x: -2, z : 2 },
                            { x: 0, z : 0 },
                            { x: 2, z : -2 }, 
                            { x: 4, z : -4 }, 
                            { x: 6, z : -5 },
                            { x: 8, z : -4 },
                            { x: 9, z : -2 },
                            { x: 10, z : 0 },
                            { x: 9, z : 2}, 
                            { x: 8, z : 4 }, 
                            { x: 6, z : 5 }, 
                            { x: 4, z : 4 }, 
                            { x: 2, z : 2 },
                            { x: 0, z : 0 },
                            ],
                    target:group.position
                },
            ],
        loop: loopAnimation,
        duration: duration * 1000,
    });
}

function playAnimations()
{
    penguinAnimator.start();
}

function modifyDuration(new_duration) {
    duration = new_duration;
    $("#duration").html("Duration: " + new_duration + ' seconds');
    initAnimations();
}