import { V as Vector2, a as Vector3, b as Vector4, M as MeshPhysicalMaterial, C as Color, F as FrontSide, B as BackSide, D as DoubleSide, G as GUI, T as THREE, c as TextureLoader, d as CubeTextureLoader, E as EXRLoader, e as DRACOLoader, f as GLTFLoader, S as Stats, g as Scene, P as PerspectiveCamera, W as WebGLRenderer, A as ACESFilmicToneMapping, h as SRGBColorSpace, O as OrbitControls, i as PMREMGenerator, j as EquirectangularReflectionMapping, k as WebGLCubeRenderTarget, l as ShaderMaterial, m as MeshRefractionMaterial, n as BoxGeometry, I as IcosahedronGeometry, o as OctahedronGeometry, p as Mesh, H as HalfFloatType, q as CubeCamera, r as MeshBVHUniformStruct, s as SAH } from "./MeshRefractionMaterial-BmDKIvBb.js";
import { M as MeshGemMaterial, a as MeshBVH } from "./MeshGemMaterial-BVgjUQvY.js";
const physicalMaterialPropsExceptions = {
  "version": true,
  "defines": true,
  "userData": true,
  "isMaterial": true,
  "isMeshStandardMaterial": true,
  "isMeshPhysicalMaterial": true,
  "type": true,
  "name": true,
  "uuid": true
};
const physicalMaterialCustomSetups = {
  "bounces": {
    min: 1,
    max: 16,
    step: 1
  },
  "roughness": {
    min: 0,
    max: 1,
    step: 1e-3
  },
  "thickness": {
    min: 0,
    max: 1e3,
    step: 0.1
  },
  "specularIntensity": {
    min: 0,
    max: 1,
    step: 0.01
  },
  "ior": {
    min: 1,
    max: 3.33,
    step: 1e-3
  },
  "iridescenceIOR": {
    min: 1,
    max: 2.33,
    step: 1e-3
  },
  "metalness": {
    min: 0,
    max: 1,
    step: 1e-3
  },
  "clearcoatRoughness": {
    min: 0,
    max: 1,
    step: 1e-3
  },
  "side": {
    front: FrontSide,
    back: BackSide,
    double: DoubleSide
  }
};
function addUniformsToGui(uniforms, gui2) {
  const f = gui2.addFolder("uniforms");
  const keys = Object.keys(uniforms);
  let i, j;
  for (j = 0; j < keys.length; j++) {
    i = keys[j];
    if (uniforms[i].value instanceof Vector2 || uniforms[i].value instanceof Vector3 || uniforms[i].value instanceof Vector4) {
      const vectorFolder = f.addFolder(i);
      for (let j2 in uniforms[i].value) {
        if (j2.indexOf("isVector") !== -1) {
          continue;
        }
        vectorFolder.add(uniforms[i].value, j2, -10, 10, 1e-3);
      }
    } else if (uniforms[i].value instanceof Array) {
      const arrayFolder = f.addFolder(i);
      for (let k = 0; k < uniforms[i].value.length; k++) {
        arrayFolder.add(uniforms[i].value, `${k}`, uniforms[i].value[k]);
      }
    } else if (uniforms[i].value === null) {
      continue;
    } else if (typeof uniforms[i].value === "number") {
      if (physicalMaterialCustomSetups[i]) {
        if (physicalMaterialCustomSetups[i].min === void 0) {
          f.add(uniforms[i], "value", physicalMaterialCustomSetups[i]).name(i);
        } else {
          f.add(
            uniforms[i],
            "value",
            physicalMaterialCustomSetups[i].min,
            physicalMaterialCustomSetups[i].max,
            physicalMaterialCustomSetups[i].step
          ).name(i);
        }
      } else {
        f.add(uniforms[i], "value", -10, 10, 0.01).name(i);
      }
    } else if (typeof uniforms[i].value === "boolean" || typeof uniforms[i].value === "string") {
      f.add(uniforms[i], "value").name(i);
    } else if (i.indexOf("Map") !== -1) {
      f.add(uniforms, i, {
        NONE: null
      });
    } else {
      console.log("not added field", i, uniforms[i].value);
    }
  }
}
function addPhysicalMaterialToGUI(material, gui2) {
  if (!(material instanceof MeshPhysicalMaterial)) {
    return;
  }
  const f = gui2.addFolder(material.name);
  f.add(material, "clearcoat", 0, 1, 1e-3);
  f.add(material, "reflectivity", 0, 1, 1e-3);
  f.add(material, "iridescence", 0, 1, 1e-3);
  f.add(material, "transmission", 0, 1, 1e-3);
  f.add(material, "anisotropy", 0, 1, 1e-3);
  f.add(material, "dispersion", 0, 1, 1e-3);
  const materialKeys = Object.keys(material);
  materialKeys.sort((a, b) => a > b ? 1 : -1);
  let i, j;
  for (j = 0; j < materialKeys.length; j++) {
    i = materialKeys[j];
    if (physicalMaterialPropsExceptions[i]) {
      continue;
    }
    if (i[0] === "_") {
      continue;
    }
    if (material[i] instanceof Color) {
      f.addColor(material, i);
    } else if (material[i] instanceof Vector2 || material[i] instanceof Vector3 || material[i] instanceof Vector4) {
      const vectorFolder = f.addFolder(i);
      for (let j2 in material[i]) {
        if (j2.indexOf("isVector") !== -1) {
          continue;
        }
        vectorFolder.add(material[i], j2, -10, 10, 1e-3);
      }
    } else if (material[i] instanceof Array) {
      const arrayFolder = f.addFolder(i);
      for (let j2 = 0; j2 < material[i].length; j2++) {
        arrayFolder.add(material[i], `${j2}`, material[i][j2]);
      }
    } else if (material[i] === null) {
      continue;
    } else if (typeof material[i] === "number") {
      if (physicalMaterialCustomSetups[i]) {
        if (physicalMaterialCustomSetups[i].min === void 0) {
          f.add(material, i, physicalMaterialCustomSetups[i]);
        } else {
          f.add(
            material,
            i,
            physicalMaterialCustomSetups[i].min,
            physicalMaterialCustomSetups[i].max,
            physicalMaterialCustomSetups[i].step
          );
        }
      } else {
        f.add(material, i, -10, 10, 0.01);
      }
    } else if (typeof material[i] === "boolean" || typeof material[i] === "string") {
      f.add(material, i);
    } else if (i.indexOf("Map") !== -1) {
      f.add(material, i, {
        NONE: null
      });
    } else {
      console.log("not added field", i, material[i]);
    }
  }
}
var emeraldVert_default = "precision mediump float;\r\nprecision mediump int;\n\nvarying vec2 vUv;\r\nvarying vec3 vNormal;\n\nvoid main()\r\n{\r\n	vec4 modelPosition = modelMatrix * vec4(position, 1.0f);\r\n	vec4 viewPosition = viewMatrix * modelPosition;\r\n	vec4 projectedPosition = projectionMatrix * viewPosition;\n\n	vUv = uv;\r\n	vNormal = normal;\n\n	gl_Position = projectedPosition;\r\n}";
var emeraldFrag_default = "precision mediump float;\r\nprecision mediump int;\n\nuniform sampler2D uEnvMap;\n\nvarying vec2 vUv;\r\nvarying vec3 vNormal;\n\nvoid main()\r\n{\r\n	vec4 t = texture2D(uEnvMap, vUv);\n\n	\n	vec4 c = vec4(t.xyz, 1.0);\r\n	\n	gl_FragColor = c;\r\n}";
const GEM_ENVMAP_RT_SIZE = 256;
let scene, camera, renderer, stats;
let controls;
let loadedGlbs = [];
let physicalMaterials = {};
let pmremGenerator = void 0;
window.physicalMaterials = physicalMaterials;
const materialsToUpdate = {};
window.materialsToUpdate = materialsToUpdate;
const shaders = {
  emerald: {
    vertexShader: emeraldVert_default,
    fragmentShader: emeraldFrag_default
  }
};
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
const physicalMaterialProps = {
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
};
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
  "models/2a2dcde6-1ced-4119-b76c-7412a451e998.glb"
  // "models/aliel_demo_4.glb"
];
let textures = {};
let environments = {};
function loadTextureAssets() {
  textures.diamondSpecular = textureLoader.load("./maps/spec19.png");
  textures.diamondNormal = textureLoader.load("./maps/diamond_NormalSpheremap.png");
  textures.emstatic = textureLoader.load("./maps/em_static.png");
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
function setupShaderMaterials() {
  new ShaderMaterial({
    vertexShader: shaders.emerald.vertexShader,
    fragmentShader: shaders.emerald.fragmentShader,
    // side: THREE.DoubleSide,
    uniforms: {
      uEnvMap: {
        value: textures.emstatic
      }
    }
    // uniforms: Object.assign({}, THREE.UniformsUtils.clone(THREE.ShaderLib.phong.uniforms),
    // {
    // }),
  });
}
function applyPhysicalMaterialProps(material, props) {
  for (let i in props) {
    if (props[i] instanceof Color) {
      material[i].set(props[i]);
    } else {
      material[i] = props[i];
    }
  }
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
function setupPhysicalMaterials() {
  var _a;
  const diamond = new MeshPhysicalMaterial();
  const emerald = new MeshPhysicalMaterial();
  const diamondLarge = new MeshPhysicalMaterial();
  const defines = {};
  const envMap = environments.mainEXR;
  const isCubeMap = envMap.isCubeTexture;
  const w = (isCubeMap ? (_a = envMap.image[0]) == null ? void 0 : _a.width : envMap.image.width) ?? 1024;
  const cubeSize = w / 4;
  const _lodMax = Math.floor(Math.log2(cubeSize));
  const _cubeSize = Math.pow(2, _lodMax);
  const width = 3 * Math.max(_cubeSize, 16 * 7);
  const height = 4 * _cubeSize;
  if (isCubeMap) {
    defines.ENVMAP_TYPE_CUBEM = "";
    defines.ENVMAP_TYPE_CUBE = "";
  }
  defines.CUBEUV_TEXEL_WIDTH = `${1 / width}`;
  defines.CUBEUV_TEXEL_HEIGHT = `${1 / height}`;
  defines.CUBEUV_MAX_MIP = `${_lodMax}.0`;
  if (refractionMaterialProps.diamond.aberrationStrength > 0) {
    defines.CHROMATIC_ABERRATIONS = "";
  }
  if (refractionMaterialProps.diamond.fastChroma) {
    defines.FAST_CHROMA = "";
  }
  const refractionMaterial = Object.assign(new MeshRefractionMaterial(), refractionMaterialProps.diamond);
  renderer.getSize(refractionMaterial.resolution);
  refractionMaterial.side = FrontSide;
  refractionMaterial.defines = defines;
  refractionMaterial.envMap = envMap;
  applyPhysicalMaterialProps(emerald, physicalMaterialProps.emerald);
  applyPhysicalMaterialProps(diamond, physicalMaterialProps.diamond);
  applyPhysicalMaterialProps(diamondLarge, physicalMaterialProps.diamondLarge);
  physicalMaterials["emerald"] = { front: emerald, back: emerald.clone() };
  physicalMaterials["diamond"] = { front: diamond, back: diamond.clone() };
  physicalMaterials["diamondLarge"] = { front: diamondLarge, back: diamondLarge.clone() };
  physicalMaterials.emerald.back.side = BackSide;
  physicalMaterials.diamond.front.side = FrontSide;
  physicalMaterials.diamond.back.side = BackSide;
  physicalMaterials.diamondLarge.front.side = FrontSide;
  physicalMaterials.diamondLarge.back.side = BackSide;
  physicalMaterials.refractionMaterial = refractionMaterial;
  physicalMaterials.default = new MeshPhysicalMaterial();
  const gemMaterial = Object.assign(new MeshGemMaterial(), refractionMaterialProps.diamond);
  const r = new Vector2();
  renderer.getSize(r);
  gemMaterial.resolution = r;
  gemMaterial.side = FrontSide;
  gemMaterial.defines = Object.assign(gemMaterial.defines, defines);
  gemMaterial.envMapD = envMap;
  gemMaterial.reflectivity = 1;
  gemMaterial.roughness = 7e-3;
  gemMaterial.metalness = 0;
  gemMaterial.color = new Color("#ffffff");
  gemMaterial.transmission = 0.032;
  gemMaterial.ior = 2.44;
  gemMaterial.thickness = 1.3;
  console.log(gemMaterial.defines);
  physicalMaterials.gemMaterial = gemMaterial;
  addUniformsToGui(gemMaterial.uniforms, gui);
  addPhysicalMaterialToGUI(physicalMaterials.gemMaterial, gui);
}
function setupScene() {
  scene.background = environments.mainEXR;
  scene.environment = environments.mainEXR;
}
function addMeshesToScene() {
  new BoxGeometry(1, 1, 1);
  const ig = new IcosahedronGeometry(2, 0);
  new OctahedronGeometry(1, 0);
  const material = new MeshPhysicalMaterial();
  material.metalness = 0.5;
  material.roughness = 0;
  const mesh = new Mesh(ig, material);
  const mesh2 = new Mesh(ig, physicalMaterials.gemMaterial);
  addPhysicalMaterialToGUI(material, gui);
  mesh.position.set(-1, 0, 0);
  mesh2.position.set(3, 0, 0);
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
function processModelAssets() {
  const ringMesh = loadedGlbs[0].scene;
  const additionalMeshes = [];
  let children = ringMesh.children;
  if (children[0].children && children[0].children.length > 0) {
    children = children[0].children;
  }
  console.log(children);
  for (let i = 0; i < children.length; i++) {
    const lcName = children[i].name.toLowerCase();
    if (lcName.indexOf("diamond") > -1 || lcName.indexOf("trillion") > -1 || lcName.indexOf("mesh_1") > -1 || lcName.indexOf("mesh_2") > -1) {
      const mesh = children[i];
      mesh.material.dispose();
      mesh.material = createGemMaterial();
      mesh.material.bounces = 4;
      mesh.material.ior = 2.3;
      const bvh = new MeshBVHUniformStruct();
      bvh.updateFrom(
        new MeshBVH(mesh.geometry.clone().toNonIndexed(), { lazyGeneration: false, strategy: SAH })
      );
      mesh.material.bvh = bvh;
      materialsToUpdate[mesh.name] = mesh.material;
      if (lcName.indexOf("diamond") > -1) {
        const s = lcName.substring("diamond".length);
        if (s.length >= 3) {
          if (parseInt(s) < 192) {
            mesh.material.color.set(0, 0.255, 0.05);
            mesh.material.specularColor.set(0, 0.255, 0.05);
          }
          mesh.material.bounces = 1;
        }
      }
      if (lcName.indexOf("mesh_2") > -1) {
        mesh.material.bounces = 3;
        mesh.material.color.set(0, 0.255, 0.05);
        mesh.material.specularColor.set(0, 0.255, 0.05);
        mesh.material.ior = 1.87;
      }
    } else if (lcName.indexOf("emerald") > -1) {
      const emeraldMesh2 = children[i];
      emeraldMesh2.material.dispose();
      window.emeraldMesh = emeraldMesh2;
      emeraldMesh2.material = createGemMaterial();
      emeraldMesh2.material.bounces = 4;
      emeraldMesh2.material.ior = 2.3;
      const bvh = new MeshBVHUniformStruct();
      bvh.updateFrom(
        new MeshBVH(emeraldMesh2.geometry.clone().toNonIndexed(), { lazyGeneration: false, strategy: SAH })
      );
      emeraldMesh2.material.bvh = bvh;
    } else if (lcName.indexOf("occlud") > -1) {
      children[i].visible = false;
    }
  }
  children.push(...additionalMeshes);
  console.log(materialsToUpdate);
}
function update() {
  controls.update();
  physicalMaterials.refractionMaterial.viewMatrixInverse = camera.matrixWorld;
  physicalMaterials.refractionMaterial.projectionMatrixInverse = camera.projectionMatrixInverse;
  physicalMaterials.gemMaterial.uniforms.viewMatrixInverse.value = camera.matrixWorld;
  physicalMaterials.gemMaterial.uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
  if (window.emeraldMesh) {
    emeraldMesh.material.uniforms.viewMatrixInverse.value = camera.matrixWorld;
    emeraldMesh.material.uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
  }
  for (let i in materialsToUpdate) {
    materialsToUpdate[i].uniforms.viewMatrixInverse.value = camera.matrixWorld;
    materialsToUpdate[i].uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
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
    antialias: true
  });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.render = renderer;
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
  setupShaderMaterials();
  setupPhysicalMaterials();
  processModelAssets();
  addMeshesToScene();
  gui.close();
  animate();
}
window.onload = onload;
//# sourceMappingURL=main-DlCJ9FA1.js.map
