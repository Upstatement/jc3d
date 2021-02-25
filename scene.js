import * as THREE from "three";
import { throttle } from "lodash";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const colors = {
  "teal": 0xBBCACB,
  "peach": 0xFEBA85,
}

const Scene = {
  /**
   * Setup
   */
  defaultMaterial: new THREE.MeshStandardMaterial({
    color: colors.teal,
    // roughness: 1,
    // metalness: 0,
    // map: Texture | null,
    // lightMap: Texture | null,
    // lightMapIntensity: number,
    // aoMap: Texture | null,
    // aoMapIntensity: number,
    // emissive: Color | string | number,
    // emissiveIntensity: number,
    // emissiveMap: Texture | null,
    // bumpMap: Texture | null,
    // bumpScale: number,
    // normalMap: Texture | null,
    // normalMapType: NormalMapTypes,
    // normalScale: Vector2,
    // displacementMap: Texture | null,
    // displacementScale: number,
    // displacementBias: number,
    // roughnessMap: Texture | null,
    // metalnessMap: Texture | null,
    // alphaMap: Texture | null,
    // envMap: Texture | null,
    // envMapIntensity: number,
    // refractionRatio: number,
    // wireframe: boolean,
    // wireframeLinewidth: number,
    // skinning: boolean,
    // vertexTangents: boolean,
    // morphTargets: boolean,
    // morphNormals: boolean,
  }),
  camera: new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight),
  scene: new THREE.Scene(),
  renderer: new THREE.WebGLRenderer( { antialias: true } ),

  get wrapperEl () {
    const el = document.getElementById("scene");

    if (!el) {
      console.error("No wrapper element found. Scene not mounted. Exiting.")
      return false;
    } else {
      return el;
    }
  },

  /**
   * Loader
   */
  loader: new GLTFLoader(),
  loadMesh (path, materialOverride = this.defaultMaterial) {
    this.loader.load(
      path,

      // onLoad callback
      (gltf) => {
        if (gltf.scene) {
          // set materials
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.material = materialOverride;
            };
          });

          // add to scene
          this.scene.add(gltf.scene);
        };

        // not needed when running an animation loop
        // this.render();
        console.log(`${path} loaded.`);
      },

      // onLoading callback
      (xhr) => {
        console.log(`Loading ${path}...` );
      },

      // onError callback
      (error) => {
        console.log(`Failed to load ${path}: ${error}`);
      }
    )
  },

  /**
   * Orbit controls
   *
   * compatible with mousemove animation, optional
   */
  setUpOrbitControls () {
    const controls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = false;
    controls.target.set(0, 0, 0);
    controls.update();
  },

  /**
   * Mousemove animation
   */
  get windowHalfX () { return window.innerWidth / 2 },
  get windowHalfY () { return window.innerHeight / 2 },
  movementScale: 3, // greater = larger range of movement
  movementDamper: 0.1, // greater = faster transition to apex of movement
  mouseX: 0,
  mouseY: 0,
  updateCameraPosition () {
    this.camera.position.x += ((this.mouseX * this.movementScale) - this.camera.position.x) * this.movementDamper;
    this.camera.position.y += (- (this.mouseY * this.movementScale) - this.camera.position.y) * this.movementDamper;
    this.camera.lookAt(this.scene.position);
  },
  onMouseMove (e) {
    const mouseVector = new THREE.Vector2(
      (e.clientX - this.windowHalfX),
      (e.clientY - this.windowHalfY)
    ).normalize();
    this.mouseX = mouseVector.x;
    this.mouseY = mouseVector.y;
  },

  /**
   * Render
   */
  render () {
    this.updateCameraPosition();
    this.renderer.render(this.scene, this.camera);
  },

  animate () {
    requestAnimationFrame(() => this.animate());
    this.render();
  },

  onWindowResize () {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // not needed when running an animation loop
    // this.render();
  },

  init () {
    if (!this.wrapperEl) return;

    this.scene.background = new THREE.Color(colors.teal);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.loadMesh(`/resources/meshes/pill.gltf`);

    this.camera.position.z = 50;

    const ambientLight = new THREE.AmbientLight(colors.teal, 0.4);
    this.scene.add(ambientLight);
    const camLight = new THREE.DirectionalLight(colors.teal, 1.2, 1000);
    camLight.position.set(100, 120, -20);
    this.camera.add(camLight);
    this.scene.add(this.camera);

    this.wrapperEl.appendChild(this.renderer.domElement);

    document.addEventListener('mousemove', throttle((e) => this.onMouseMove(e), (1000 / 60)));
    window.addEventListener('resize', throttle(() => this.onWindowResize(), (1000 / 60)));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Scene.init();
  Scene.animate();
});
