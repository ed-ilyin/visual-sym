import {
  Scene,
  HemisphericLight,
  Vector3,
  Engine,
  ArcRotateCamera,
  CannonJSPlugin,
  MeshBuilder,
  StandardMaterial,
  PhotoDome,
  PhysicsImpostor,
  Mesh,
  Vector2,
  ParticleSystem,
  Texture,
  Color3,
  PointLight,
  Axis,
  Color4,
  SolidParticleSystem,
  SolidParticle,
  KeyboardEventTypes,
  Animation
} from "babylonjs";
import * as cannon from "cannon";
import { WoodProceduralTexture } from "babylonjs-procedural-textures";
import { GridMaterial } from "babylonjs-materials";

var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;




// Load the 3D engine
var engine: Engine = null;
var sceneToRender = null;
var createDefaultEngine = function () {
  return new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  });
};







  /*
  var createScene = function() {
    var scene = new Scene(engine);
    var camera = new ArcRotateCamera("camera1",  0, 0, 0, new Vector3(0, 0, -0), scene);
    camera.setPosition(new Vector3(0, 50, -100));
    camera.attachControl(canvas, true);
    var light = new HemisphericLight("light1", new Vector3(1, 0, 0), scene);
    light.intensity = 0.75;
    light.specular = new Color3(0.95, 0.95, 0.81);
    var pl = new PointLight("pl", new Vector3(0, 0, 0), scene);
    pl.diffuse = new Color3(1, 1, 1);
    pl.specular = new Color3(0.1, 0.1, 0.12);
    pl.intensity = 0.75;
  
    var mat = new StandardMaterial("mat1", scene);
    mat.backFaceCulling = false;
  
  
    // Particle system creation
  
    var SPS = new SolidParticleSystem('SPS', scene);
    var model = MeshBuilder.CreateSphere("m", {segments: 1, diameter: 0.8}, scene);
    SPS.addShape(model, 1000);
    var mesh = SPS.buildMesh();
    mesh.material = mat;
    // dispose the model
    model.dispose();
  
  
    // Define a custom SPS behavior
    
    var k;
    var p;
    // this function will morph the particles
    var myVertexFunction = function (particle, vertex, i) {
      p = i + k + particle.idx / 200;
      if (i < 45) {
        vertex.position.x += Math.sin(p / 100);
        vertex.position.y += Math.cos(p / 200);
        vertex.position.z += Math.sin(p / 300);
      } else {
        vertex.position.x += Math.cos(p / 100);
        vertex.position.y += Math.sin(p / 300);
        vertex.position.z += Math.cos(p / 200);		  
      }
        vertex.color.r = Math.abs(Math.tan(vertex.position.y * 0.2));
    };
  
    SPS.initParticles = function() {
      var fact = 90;   // density
    
      for (var p = 0; p < this.nbParticles; p++) {
        this.particles[p].position.x = (Math.random() - 0.5) * fact;
        this.particles[p].position.y = (Math.random() - 0.5) * fact;
        this.particles[p].position.z = (Math.random() - 0.5) * fact;
        this.particles[p].rotation.x = Math.random() * 3.2;
        this.particles[p].rotation.y = Math.random() * 3.2;
        this.particles[p].rotation.z = Math.random() * 3.2;
        this.particles[p].color = new BABYLON.Color4(Math.random(), Math.random(), Math.random(), 1);
      }
    };
  
    /*
    SPS.updateParticle = function (particle, i, si) {
      particle.rotation.x += particle.idx / 5000;
      particle.rotation.z += (SPS.nbParticles - particle.idx)  / 1000;
    
  
    // this will be called by SPS.setParticles()
    //SPS.updateParticleVertex = myVertexFunction;
    // init all particle values
    SPS.initParticles();
  
    // then set them all
    SPS.computeParticleVertex = true; 
  
  
    //scene.debugLayer.show();
    // SPS mesh animation
    var d0 = Date.now();
  
    scene.registerBeforeRender(function () {
      k = Date.now() - d0;
      pl.position = camera.position;
      SPS.mesh.rotation.y += 0.01;
    SPS.setParticles();
    });
  
    return scene;
  };

*/
interface Skudra extends SolidParticle {
  difference_to_point:Vector3;
  data_transmit:Vector3;

}
var createScene = function () {
  var scene = new Scene(engine);
  //scene.clearColor = Color3.Black;
  var camera = new ArcRotateCamera("camera1", 0, 0, 0, new Vector3(0, 0, -0), scene);
  camera.setPosition(new Vector3(0, 10, -400));
  camera.attachControl(canvas, true);
  const environment = scene.createDefaultEnvironment();

  

  var pl = new PointLight("pl", new Vector3(0, 0, 0), scene);
  pl.diffuse = new Color3(1, 1, 1);
  pl.intensity = 1.0;

  var nb = 1000;    		    // nb of particles
  var size = 5;				// particle size
  var fact = 1500; 			// cube size
  var distance = 1;		// neighbor distance
  var aw = 0.5;				// association weight
  var cw = 0.5;				// cohesion weight
  var sw = 0.5;				// separation weight
  var pool = 1;			// nb of particles computed at once
  var delay = 1;			// delay for flocking computation
  var speed = 1;            // particle speed

  var limit = fact / 2;
  var distance2 = distance * distance;
  var p;					            // current particle pointer (particles loop)
  var part;								// current particle pointer (flocking loop)
  var start = 0;						// start index
  var end = start + pool - 1;			// end index
  end = (end >= nb - 1) ? nb - 1 : end;
  var X = Axis.X;
  var Y = Axis.Y;
  var Z = Axis.Z;

  var box = MeshBuilder.CreateBox("b", { size: fact + 2 * size, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene);

  // position function 
  var myPositionFunction = function (particle: any, i: number, s: number) {
    
      particle.position.x = (Math.random() - 0.5) * fact;
      particle.position.y = (Math.random() - 0.5) * fact;
      particle.position.z = (Math.random() - 0.5) * fact;
      particle.velocity.x = (Math.random() - 0.5) * fact * speed;
      particle.velocity.y = (Math.random() - 0.5) * fact * speed;
      particle.velocity.z = (Math.random() - 0.5) * fact * speed;
      //particle.rotation.x = Math.random() * 3.15;
      //particle.rotation.y = Math.random() * 3.15;
      //particle.rotation.z = Math.random() * 1.5;
      particle.color = new BABYLON.Color4(particle.position.x / fact + 0.5, particle.position.y / fact + 0.5, particle.position.z / fact + 0.5, 1.0);
      particle.difference_to_point;
    };

  // model 
  var model = MeshBuilder.CreatePolyhedron("m", { type: 4, size: size, sizeY: size * 2 }, scene);
  var point_a=MeshBuilder.CreateSphere("a",{segments:64,diameter:80});
  var point_b=MeshBuilder.CreateBox("a",{size:100});
  point_a.position=new Vector3(0,-10,-10);
  point_b.position=new Vector3(500,0,10);
  var material = new StandardMaterial("potato",scene);
  material.alpha = 1;
  material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);
  point_b.material = material; 

  var new_material = new StandardMaterial("varienik",scene);
  new_material.alpha = 1;
  new_material.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.7);
  point_a.material = new_material; 
  // SPS creation
  var SPS = new SolidParticleSystem('SPS', scene);
  SPS.addShape(model, nb);
  var mesh = SPS.buildMesh();
  // dispose the model
  model.dispose();

  // SPS init
  SPS.initParticles = function () {
      for (var p = 0; p < SPS.nbParticles; p++) {
          myPositionFunction(SPS.particles[p],0,0);
      }
  }

  SPS.initParticles();		// compute particle initial status
  SPS.setParticles();		// updates the SPS mesh and draws it


  // tmp internal storing variables
  SPS.vars.v = Vector3.Zero();	// velocity result
  SPS.vars.a = Vector3.Zero();	// alignement result
  SPS.vars.c = Vector3.Zero();	// cohesion result
  SPS.vars.sep = Vector3.Zero();	// separation result
  SPS.vars.n = 0;							// neighbor counter
  SPS.vars.rot =Vector3.Zero();	// particle rotation
  SPS.vars.axis1 = Vector3.Zero();
  SPS.vars.axis3 = Vector3.Zero();


  var computeFlocking = function (particle) {

      for (var i = 0; i < SPS.nbParticles; i++) {

          p = SPS.particles[i];
          // reset tmp vectors
          (SPS.vars.v).scaleInPlace(0);
          (SPS.vars.a).scaleInPlace(0);
          (SPS.vars.c).scaleInPlace(0);
          (SPS.vars.sep).scaleInPlace(0);
          SPS.vars.n = 0;

          if (i != particle.idx) {
              if (BABYLON.Vector3.DistanceSquared(p.position, particle.position) < distance2) {
                  // Alignement
                  (SPS.vars.a).addInPlace(p.velocity);
                  // Cohesion
                  (SPS.vars.c).addInPlace(p.position);
                  // Separation
                  (SPS.vars.sep).addInPlace(p.position);
                  (SPS.vars.sep).subtractInPlace(particle.position);
                  // neighbor count
                  SPS.vars.n++;
              }
          }
      }
      if (SPS.vars.n == 0) { return SPS.vars.v; }

      SPS.vars.n = 1 / SPS.vars.n;

      (SPS.vars.a).scaleInPlace(SPS.vars.n);
      (SPS.vars.a).normalize();
      (SPS.vars.a).scaleInPlace(aw);

      (SPS.vars.c).scaleInPlace(SPS.vars.n);
      (SPS.vars.c).subtractInPlace(particle.position);
      (SPS.vars.c).normalize();
      (SPS.vars.c).scaleInPlace(cw);

      (SPS.vars.sep).scaleInPlace(-1 * SPS.vars.n);
      (SPS.vars.sep).normalize();
      (SPS.vars.sep).scaleInPlace(sw);

      (SPS.vars.v).addInPlace(SPS.vars.a);
      (SPS.vars.v).addInPlace(SPS.vars.c);
      (SPS.vars.v).addInPlace(SPS.vars.sep);

      return SPS.vars.v;
  }

  var flocking = function () {
      for (var i = start; i <= end; i++) {
          part = SPS.particles[i];
          part.velocity.addInPlace(computeFlocking(part));

          // rotation : steer like velocity vector
          // get axis1 orthogonal to velocity
          if (part.velocity.x != 0 || part.velocity.z != 0) {
              // velocity not collinear with Y
              Vector3.CrossToRef(part.velocity, Y, SPS.vars.axis1);
          } else
              if (part.velocity.y != 0 || part.velocity.z != 0) {
                  // velocity not collinear with X
                  Vector3.CrossToRef(part.velocity, X, SPS.vars.axis1);
              } else
                  if (part.velocity.x != 0 || part.velocity.y != 0) {
                      // velocity not collinear with Z
                      Vector3.CrossToRef(part.velocity, Z, SPS.vars.axis1);
                  }
          // get axis3 orthogonal to axis1 and velocity
          Vector3.CrossToRef(SPS.vars.axis1, part.velocity, SPS.vars.axis3);
          Vector3.RotationFromAxisToRef(SPS.vars.axis1, part.velocity, SPS.vars.axis3, SPS.vars.rot);
          part.rotation.x = SPS.vars.rot.x;
          part.rotation.y = SPS.vars.rot.y;
          part.rotation.z = SPS.vars.rot.z;
      }

      start += pool;
      start = (start >= SPS.nbParticles - 1) ? 0 : start;
      end = start + pool - 1;
      end = (end >= SPS.nbParticles - 1) ? SPS.nbParticles - 1 : end;
  }

  // flocking
  setInterval(function () { flocking(); }, delay);

  
  SPS.updateParticle = function (particle:Skudra) {
      // keep in the cube
      if (Math.abs(particle.position.x) > limit) { particle.velocity.x *= -1 }
      if (Math.abs(particle.position.y) > limit) { particle.velocity.y *= -1 }
      if (Math.abs(particle.position.z) > limit) { particle.velocity.z *= -1 }

      particle.velocity.normalize();
      particle.velocity.scaleInPlace(speed);
      particle.difference_to_point=get_difference(point_a,particle);
      particle.position.x  += particle.velocity.x;
      particle.position.y += particle.velocity.y;
      particle.position.z += particle.velocity.z;
      

          var diff=get_difference(point_a,particle);
          if (diff.x < 10 &&  diff.x > -10 && diff.y < 10 && diff.y > -10  && diff.z < 10 && diff.z > -10) {
            particle.velocity.x *= -1 
            particle.velocity.y *= -1 
            particle.velocity.z *= -1 
            particle.difference_to_point=get_difference(point_b,particle);
    
          }
         
          //particle.position.x  += particle.velocity.x;
          //particle.position.y += particle.velocity.y;
          //particle.position.z += particle.velocity.z;
      


      

      //particle.position.x += particle.velocity.x;
     // particle.position.y += particle.velocity.y;
     // particle.position.z += particle.velocity.z;
      return particle;
  }

 

  // Optimizers after first setParticles() call
  // This will be used only for the next setParticles() calls
  // Here, colors and textures never change once they are set
  SPS.computeParticleColor = false;
  SPS.computeParticleTexture = false;

  // SPS mesh animation
  scene.registerBeforeRender(function () {
      SPS.setParticles();
      for (var i = 0; i < SPS.nbParticles; i++) {

        p = SPS.particles[i];
        //console.log(p.difference_to_point);
  
      }
      pl.position = camera.position;
  });

  

  //var camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(-90), BABYLON.Tools.ToRadians(65), 20, sphere.position, scene);

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  scene.onKeyboardObservable.add(function(kbinfo){
          if(kbinfo.event.key == " "){

              Animation.CreateAndStartAnimation("moveTarget", camera, "target", 30, 30, camera.target, box.position, 0);
              Animation.CreateAndStartAnimation("moveAlpha", camera, "alpha", 30, 30, camera.alpha, BABYLON.Tools.ToRadians(-90), 0);
              Animation.CreateAndStartAnimation("moveBeta", camera, "beta", 30, 30, camera.beta, BABYLON.Tools.ToRadians(90), 0);
          };
      }, KeyboardEventTypes.KEYDOWN);


      const xrHelper =  scene.createDefaultXRExperienceAsync({
        floorMeshes: [environment.ground]
    });
  return scene;
};



  






//
// Create a default engine to load the scene
try {
  engine = createDefaultEngine();
} catch (e) {
  console.log(
    "the available createEngine function failed. Creating the default engine instead"
  );
  engine = createDefaultEngine();
}
if (!engine) throw "engine should not be null.";

//Create the scene
sceneToRender=createScene();

// Render the scene by using the engine
engine.runRenderLoop(function () {
  if (sceneToRender) {
    sceneToRender.render();
  }
});

// Resize the engine to fit the scene
window.addEventListener("resize", function () {
  engine.resize();
});



function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}


function get_difference(object,particle)  {
  var object_x=object.position.x;
  var object_y=object.position.y;
  var object_z=object.position.z;
  var particle_x=particle.position.x;
  var particle_y=particle.position.y;
  var particle_z=particle.position.z;
  var diff_x=particle_x-object_x;
  var diff_y=particle_y-object_y;
  var diff_z=particle_z-object_z;
  return new Vector3(diff_x,diff_y,diff_z);

}
