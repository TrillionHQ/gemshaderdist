import { C as Color, D as DoubleSide, G as GUI, T as THREE, c as TextureLoader, d as CubeTextureLoader, E as EXRLoader, e as DRACOLoader, f as GLTFLoader, S as Stats, g as Scene, P as PerspectiveCamera, W as WebGLRenderer, A as ACESFilmicToneMapping, h as SRGBColorSpace, O as OrbitControls, i as PMREMGenerator, j as EquirectangularReflectionMapping, k as WebGLCubeRenderTarget, H as HalfFloatType, q as CubeCamera, a as Vector3, r as MeshBVHUniformStruct, s as SAH, V as Vector2, F as FrontSide } from "./MeshRefractionMaterial-BmDKIvBb.js";
import { a as MeshBVH, M as MeshGemMaterial } from "./MeshGemMaterial-BVgjUQvY.js";
const GEM_ENVMAP_RT_SIZE = 256;
let scene, camera, renderer, stats;
let controls;
let loadedGlbs = [];
let physicalMaterials = {};
let pmremGenerator = void 0;
window.physicalMaterials = physicalMaterials;
const materialsToUpdate = {};
window.materialsToUpdate = materialsToUpdate;
const refractionMaterialProps = {
  diamond: {
    bounces: 3,
    ior: 2,
    // fresnel: 4.5,
    fresnel: 1.34,
    aberrationStrength: 0,
    //.005,
    color: new Color("white"),
    fastChroma: true
  }
};
({
  emerald: {
    transmission: 1,
    // thickness: 35,
    thickness: 0,
    ior: 1.56,
    iridescence: 0,
    iridescenceIOR: 2,
    reflectivity: 0.5,
    // roughness: .25,
    roughness: 0,
    side: DoubleSide,
    // color: new THREE.Color(0x0dbf6c)
    color: new Color(0.050980392156862744, 0.7490196078431373, 0.4235294117647059)
  },
  diamond: {
    transmission: 1,
    thickness: 3,
    ior: 2.75,
    iridescence: 0,
    iridescenceIOR: 2,
    reflectivity: 0.5,
    roughness: 0.105,
    side: DoubleSide,
    // color: new THREE.Color(0x0dbf6c)
    color: new Color(1, 1, 1)
  },
  diamondLarge: {
    transmission: 1,
    thickness: 35,
    ior: 2.75,
    iridescence: 0,
    iridescenceIOR: 2,
    reflectivity: 0.5,
    roughness: 0.105,
    side: DoubleSide,
    // color: new THREE.Color(0x0dbf6c)
    color: new Color(1, 1, 1)
  }
});
const gui = new GUI({ width: 400 });
window.loadedGlbs = loadedGlbs;
window.THREE = THREE;
const textureLoader = new TextureLoader();
const cubeTextureLoader = new CubeTextureLoader();
const exrLoader = new EXRLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
const modelAssets = [
  // "models/2a2dcde6-1ced-4119-b76c-7412a451e998.glb",
  "models/diamond.glb"
];
let environments = {};
function loadTextureAssets() {
  textureLoader.load("./maps/spec19.png");
  textureLoader.load("./maps/diamond_NormalSpheremap.png");
  textureLoader.load("./maps/em_static.png");
  environments.main = cubeTextureLoader.load([
    "./maps/3/px.jpg",
    "./maps/3/nx.jpg",
    "./maps/3/py.jpg",
    "./maps/3/ny.jpg",
    "./maps/3/pz.jpg",
    "./maps/3/nz.jpg"
  ]);
}
async function loadEXRAssets() {
  let resolve;
  let resolve2;
  const p = new Promise((res, rej) => {
    resolve = res;
  });
  exrLoader.load("./maps/env-gem-4.exr", function(texture) {
    texture.mapping = EquirectangularReflectionMapping;
    environments.mainEXR = texture;
    window.environments = environments;
    resolve(true);
  });
  const p2 = new Promise((res, rej) => {
    resolve2 = res;
  });
  exrLoader.load("./maps/env-metal-14.exr", function(texture) {
    texture.mapping = EquirectangularReflectionMapping;
    const exrCubeRT = pmremGenerator.fromEquirectangular(texture);
    const cubeRT = new WebGLCubeRenderTarget(texture.image.width);
    environments.metalEXRCube = cubeRT.fromEquirectangularTexture(renderer, exrCubeRT.texture);
    environments.metalEXR = texture;
    window.environments = environments;
    resolve2(true);
  });
  return Promise.all([p, p2]);
}
function loadModelAssets() {
  const loadingPromises = [];
  const loadModel = (i) => {
    let resolver;
    const p = new Promise((res, rej) => {
      resolver = res;
    });
    loadingPromises[i] = p;
    gltfLoader.load(modelAssets[i], (glbModel) => {
      loadedGlbs[i] = glbModel;
      resolver();
    });
  };
  for (let i = 0; i < modelAssets.length; i++) {
    loadModel(i);
  }
  return loadingPromises;
}
function setupGemMaterial(gemMaterial, envMap) {
  var _a;
  const defines = {};
  const isCubeMap = envMap.isCubeTexture;
  (isCubeMap ? (_a = envMap.image[0]) == null ? void 0 : _a.width : envMap.image.width) ?? 1024;
  if (isCubeMap) {
    defines.ENVMAP_TYPE_CUBEM = "";
  }
  if (refractionMaterialProps.diamond.aberrationStrength > 0) {
    defines.CHROMATIC_ABERRATIONS = "";
  }
  if (refractionMaterialProps.diamond.fastChroma) {
    defines.FAST_CHROMA = "";
  }
  gemMaterial.defines = Object.assign(gemMaterial.defines, defines);
  gemMaterial.envMapD = envMap;
}
function createGemMaterial() {
  const gemMaterial = Object.assign(new MeshGemMaterial(), refractionMaterialProps.diamond);
  const r = new Vector2();
  renderer.getSize(r);
  gemMaterial.resolution = r;
  gemMaterial.side = FrontSide;
  gemMaterial.reflectivity = 1;
  gemMaterial.roughness = 7e-3;
  gemMaterial.metalness = 0;
  gemMaterial.color = new Color("#ffffff");
  gemMaterial.transmission = 0;
  gemMaterial.ior = 2.44;
  gemMaterial.thickness = 1.3;
  setupGemMaterial(gemMaterial, environments.mainEXR);
  return gemMaterial;
}
function setupScene() {
  scene.background = environments.mainEXR;
  scene.environment = environments.mainEXR;
}
function addMeshesToScene() {
  window.scene = scene;
  for (let i = 0; i < loadedGlbs.length; i++) {
    console.log(loadedGlbs[i].scene);
    scene.add(loadedGlbs[i].scene);
  }
}
function renderEnvMapForMesh(mesh) {
  const cubeRT = new WebGLCubeRenderTarget(GEM_ENVMAP_RT_SIZE, {
    type: HalfFloatType
  });
  const cubeCamera = new CubeCamera(0.1, 100, cubeRT);
  const p = new Vector3();
  mesh.getWorldPosition(p);
  const dir = p.clone().normalize();
  p.addScaledVector(dir, 0.1);
  cubeCamera.position.copy(p);
  cubeCamera.update(renderer, scene);
  return cubeRT.texture;
}
function generateCubeMapsForGems() {
  const tex = [];
  const ringMesh = loadedGlbs[0].scene;
  let children = ringMesh.children;
  if (children[0].children && children[0].children.length > 0) {
    children = children[0].children;
  }
  let t = performance.now();
  for (let i = 0; i < children.length; i++) {
    const lcName = children[i].name.toLowerCase();
    if (lcName.indexOf("diamond") > -1 || lcName.indexOf("trillion") > -1) {
      const cubeTexture = renderEnvMapForMesh(children[i]);
      setupGemMaterial(physicalMaterials.gemMaterial, cubeTexture);
      tex.push(cubeTexture);
    }
  }
  window.cubetex = tex;
  console.log("cube maps generation took", performance.now() - t);
}
window.generateCubeMapsForGems = generateCubeMapsForGems;
let diamondMeshes = [];
function processModelAssets() {
  const ringMesh = loadedGlbs[0].scene;
  ringMesh.traverse((child) => {
    const lcName = child.name.toLowerCase();
    if (lcName.indexOf("diamond") > -1) {
      child.material.dispose();
      child.material = createGemMaterial();
      child.material.bounces = 3;
      child.material.ior = 2.44;
      const bvh = new MeshBVHUniformStruct();
      bvh.updateFrom(
        new MeshBVH(child.geometry.clone().toNonIndexed(), { strategy: SAH })
      );
      child.material.bvh = bvh;
      diamondMeshes.push(child);
    }
  });
}
function update() {
  controls.update();
  for (let i = 0; i < diamondMeshes.length; i++) {
    diamondMeshes[i].material.uniforms.viewMatrixInverse.value = camera.matrixWorld;
    diamondMeshes[i].material.uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
  }
}
function animate() {
  stats.begin();
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
  stats.end();
}
async function onload() {
  stats = new Stats();
  document.body.appendChild(stats.dom);
  loadTextureAssets();
  await Promise.all(loadModelAssets());
  scene = new Scene();
  camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1e3
  );
  renderer = new WebGLRenderer({
    canvas: document.querySelector("canvas"),
    preserveDrawingBuffer: true,
    antialias: true
  });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.renderer = renderer;
  camera.position.set(0, 0, 1.5);
  window.camera = camera;
  const f = gui.addFolder("camera");
  f.add(camera.position, "x", -5, 5);
  f.add(camera.position, "y", -5, 5);
  f.add(camera.position, "z", -5, 5);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  window.controls = controls;
  pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  await loadEXRAssets();
  setupScene();
  processModelAssets();
  addMeshesToScene();
  gui.close();
  setTimeout(() => {
    var img = new Image();
    img.src = renderer.domElement.toDataURL();
    window.document.body.appendChild(img);
    renderer.preserveDrawingBuffer = false;
    console.log("screenshot appended");
  }, 1500);
  animate();
}
window.onload = onload;
//# sourceMappingURL=diamondonly-Bb2j-_Et.js.map
