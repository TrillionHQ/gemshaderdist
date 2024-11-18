import { D as DataTextureLoader, H as HalfFloatType, F as FloatType, a as DataUtils, L as LinearSRGBColorSpace, b as LinearFilter, M as MeshPhysicalMaterial, C as Color, V as Vector2, c as Vector3, d as Vector4, e as FrontSide, B as BackSide, f as DoubleSide, G as GUI, T as THREE, g as TextureLoader, h as CubeTextureLoader, E as EXRLoader, i as DRACOLoader, j as GLTFLoader, S as Stats, k as Scene, P as PerspectiveCamera, W as WebGLRenderer, A as ACESFilmicToneMapping, l as SRGBColorSpace, O as OrbitControls, m as PMREMGenerator, n as EquirectangularReflectionMapping, o as LinearMipmapLinearFilter, p as ShaderMaterial, q as MeshRefractionMaterial, r as BoxGeometry, I as IcosahedronGeometry, s as OctahedronGeometry, t as Mesh, u as WebGLCubeRenderTarget, v as CubeCamera, w as MeshBVHUniformStruct, x as SAH } from "./stats.module-CbaJtRkl.js";
import { M as MeshGemMaterial, a as MeshBVH } from "./MeshGemMaterial-CnfxExSR.js";
class RGBELoader extends DataTextureLoader {
  constructor(manager) {
    super(manager);
    this.type = HalfFloatType;
  }
  // adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html
  parse(buffer) {
    const rgbe_read_error = 1, rgbe_write_error = 2, rgbe_format_error = 3, rgbe_memory_error = 4, rgbe_error = function(rgbe_error_code, msg) {
      switch (rgbe_error_code) {
        case rgbe_read_error:
          throw new Error("THREE.RGBELoader: Read Error: " + (msg || ""));
        case rgbe_write_error:
          throw new Error("THREE.RGBELoader: Write Error: " + (msg || ""));
        case rgbe_format_error:
          throw new Error("THREE.RGBELoader: Bad File Format: " + (msg || ""));
        default:
        case rgbe_memory_error:
          throw new Error("THREE.RGBELoader: Memory Error: " + (msg || ""));
      }
    }, RGBE_VALID_PROGRAMTYPE = 1, RGBE_VALID_FORMAT = 2, RGBE_VALID_DIMENSIONS = 4, NEWLINE = "\n", fgets = function(buffer2, lineLimit, consume) {
      const chunkSize = 128;
      lineLimit = !lineLimit ? 1024 : lineLimit;
      let p = buffer2.pos, i = -1, len = 0, s = "", chunk = String.fromCharCode.apply(null, new Uint16Array(buffer2.subarray(p, p + chunkSize)));
      while (0 > (i = chunk.indexOf(NEWLINE)) && len < lineLimit && p < buffer2.byteLength) {
        s += chunk;
        len += chunk.length;
        p += chunkSize;
        chunk += String.fromCharCode.apply(null, new Uint16Array(buffer2.subarray(p, p + chunkSize)));
      }
      if (-1 < i) {
        buffer2.pos += len + i + 1;
        return s + chunk.slice(0, i);
      }
      return false;
    }, RGBE_ReadHeader = function(buffer2) {
      const magic_token_re = /^#\?(\S+)/, gamma_re = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/, exposure_re = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/, format_re = /^\s*FORMAT=(\S+)\s*$/, dimensions_re = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/, header = {
        valid: 0,
        /* indicate which fields are valid */
        string: "",
        /* the actual header string */
        comments: "",
        /* comments found in header */
        programtype: "RGBE",
        /* listed at beginning of file to identify it after "#?". defaults to "RGBE" */
        format: "",
        /* RGBE format, default 32-bit_rle_rgbe */
        gamma: 1,
        /* image has already been gamma corrected with given gamma. defaults to 1.0 (no correction) */
        exposure: 1,
        /* a value of 1.0 in an image corresponds to <exposure> watts/steradian/m^2. defaults to 1.0 */
        width: 0,
        height: 0
        /* image dimensions, width/height */
      };
      let line, match;
      if (buffer2.pos >= buffer2.byteLength || !(line = fgets(buffer2))) {
        rgbe_error(rgbe_read_error, "no header found");
      }
      if (!(match = line.match(magic_token_re))) {
        rgbe_error(rgbe_format_error, "bad initial token");
      }
      header.valid |= RGBE_VALID_PROGRAMTYPE;
      header.programtype = match[1];
      header.string += line + "\n";
      while (true) {
        line = fgets(buffer2);
        if (false === line) break;
        header.string += line + "\n";
        if ("#" === line.charAt(0)) {
          header.comments += line + "\n";
          continue;
        }
        if (match = line.match(gamma_re)) {
          header.gamma = parseFloat(match[1]);
        }
        if (match = line.match(exposure_re)) {
          header.exposure = parseFloat(match[1]);
        }
        if (match = line.match(format_re)) {
          header.valid |= RGBE_VALID_FORMAT;
          header.format = match[1];
        }
        if (match = line.match(dimensions_re)) {
          header.valid |= RGBE_VALID_DIMENSIONS;
          header.height = parseInt(match[1], 10);
          header.width = parseInt(match[2], 10);
        }
        if (header.valid & RGBE_VALID_FORMAT && header.valid & RGBE_VALID_DIMENSIONS) break;
      }
      if (!(header.valid & RGBE_VALID_FORMAT)) {
        rgbe_error(rgbe_format_error, "missing format specifier");
      }
      if (!(header.valid & RGBE_VALID_DIMENSIONS)) {
        rgbe_error(rgbe_format_error, "missing image size specifier");
      }
      return header;
    }, RGBE_ReadPixels_RLE = function(buffer2, w2, h2) {
      const scanline_width = w2;
      if (
        // run length encoding is not allowed so read flat
        scanline_width < 8 || scanline_width > 32767 || // this file is not run length encoded
        (2 !== buffer2[0] || 2 !== buffer2[1] || buffer2[2] & 128)
      ) {
        return new Uint8Array(buffer2);
      }
      if (scanline_width !== (buffer2[2] << 8 | buffer2[3])) {
        rgbe_error(rgbe_format_error, "wrong scanline width");
      }
      const data_rgba = new Uint8Array(4 * w2 * h2);
      if (!data_rgba.length) {
        rgbe_error(rgbe_memory_error, "unable to allocate buffer space");
      }
      let offset = 0, pos = 0;
      const ptr_end = 4 * scanline_width;
      const rgbeStart = new Uint8Array(4);
      const scanline_buffer = new Uint8Array(ptr_end);
      let num_scanlines = h2;
      while (num_scanlines > 0 && pos < buffer2.byteLength) {
        if (pos + 4 > buffer2.byteLength) {
          rgbe_error(rgbe_read_error);
        }
        rgbeStart[0] = buffer2[pos++];
        rgbeStart[1] = buffer2[pos++];
        rgbeStart[2] = buffer2[pos++];
        rgbeStart[3] = buffer2[pos++];
        if (2 != rgbeStart[0] || 2 != rgbeStart[1] || (rgbeStart[2] << 8 | rgbeStart[3]) != scanline_width) {
          rgbe_error(rgbe_format_error, "bad rgbe scanline format");
        }
        let ptr = 0, count;
        while (ptr < ptr_end && pos < buffer2.byteLength) {
          count = buffer2[pos++];
          const isEncodedRun = count > 128;
          if (isEncodedRun) count -= 128;
          if (0 === count || ptr + count > ptr_end) {
            rgbe_error(rgbe_format_error, "bad scanline data");
          }
          if (isEncodedRun) {
            const byteValue = buffer2[pos++];
            for (let i = 0; i < count; i++) {
              scanline_buffer[ptr++] = byteValue;
            }
          } else {
            scanline_buffer.set(buffer2.subarray(pos, pos + count), ptr);
            ptr += count;
            pos += count;
          }
        }
        const l = scanline_width;
        for (let i = 0; i < l; i++) {
          let off = 0;
          data_rgba[offset] = scanline_buffer[i + off];
          off += scanline_width;
          data_rgba[offset + 1] = scanline_buffer[i + off];
          off += scanline_width;
          data_rgba[offset + 2] = scanline_buffer[i + off];
          off += scanline_width;
          data_rgba[offset + 3] = scanline_buffer[i + off];
          offset += 4;
        }
        num_scanlines--;
      }
      return data_rgba;
    };
    const RGBEByteToRGBFloat = function(sourceArray, sourceOffset, destArray, destOffset) {
      const e = sourceArray[sourceOffset + 3];
      const scale = Math.pow(2, e - 128) / 255;
      destArray[destOffset + 0] = sourceArray[sourceOffset + 0] * scale;
      destArray[destOffset + 1] = sourceArray[sourceOffset + 1] * scale;
      destArray[destOffset + 2] = sourceArray[sourceOffset + 2] * scale;
      destArray[destOffset + 3] = 1;
    };
    const RGBEByteToRGBHalf = function(sourceArray, sourceOffset, destArray, destOffset) {
      const e = sourceArray[sourceOffset + 3];
      const scale = Math.pow(2, e - 128) / 255;
      destArray[destOffset + 0] = DataUtils.toHalfFloat(Math.min(sourceArray[sourceOffset + 0] * scale, 65504));
      destArray[destOffset + 1] = DataUtils.toHalfFloat(Math.min(sourceArray[sourceOffset + 1] * scale, 65504));
      destArray[destOffset + 2] = DataUtils.toHalfFloat(Math.min(sourceArray[sourceOffset + 2] * scale, 65504));
      destArray[destOffset + 3] = DataUtils.toHalfFloat(1);
    };
    const byteArray = new Uint8Array(buffer);
    byteArray.pos = 0;
    const rgbe_header_info = RGBE_ReadHeader(byteArray);
    const w = rgbe_header_info.width, h = rgbe_header_info.height, image_rgba_data = RGBE_ReadPixels_RLE(byteArray.subarray(byteArray.pos), w, h);
    let data, type;
    let numElements;
    switch (this.type) {
      case FloatType:
        numElements = image_rgba_data.length / 4;
        const floatArray = new Float32Array(numElements * 4);
        for (let j = 0; j < numElements; j++) {
          RGBEByteToRGBFloat(image_rgba_data, j * 4, floatArray, j * 4);
        }
        data = floatArray;
        type = FloatType;
        break;
      case HalfFloatType:
        numElements = image_rgba_data.length / 4;
        const halfArray = new Uint16Array(numElements * 4);
        for (let j = 0; j < numElements; j++) {
          RGBEByteToRGBHalf(image_rgba_data, j * 4, halfArray, j * 4);
        }
        data = halfArray;
        type = HalfFloatType;
        break;
      default:
        throw new Error("THREE.RGBELoader: Unsupported type: " + this.type);
    }
    return {
      width: w,
      height: h,
      data,
      header: rgbe_header_info.string,
      gamma: rgbe_header_info.gamma,
      exposure: rgbe_header_info.exposure,
      type
    };
  }
  setDataType(value) {
    this.type = value;
    return this;
  }
  load(url, onLoad, onProgress, onError) {
    function onLoadCallback(texture, texData) {
      switch (texture.type) {
        case FloatType:
        case HalfFloatType:
          texture.colorSpace = LinearSRGBColorSpace;
          texture.minFilter = LinearFilter;
          texture.magFilter = LinearFilter;
          texture.generateMipmaps = false;
          texture.flipY = true;
          break;
      }
      if (onLoad) onLoad(texture, texData);
    }
    return super.load(url, onLoadCallback, onProgress, onError);
  }
}
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
let renderer2;
let controls;
let loadedGlbs = [];
let physicalMaterials = {};
let pmremGenerator, pmremGenerator2 = void 0;
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
new EXRLoader();
const rgbeLoader = new RGBELoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
const modelAssets = [
  // "models/2a2dcde6-1ced-4119-b76c-7412a451e998.glb",
  // "models/aliel_demo_4.glb"
  "models/demo-ring.gltf"
  // "models/demo_ring.glb"
  // "models/cocktail-ring.glb"
  // "models/swar_neck.glb"
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
async function loadHDRAssets() {
  const assets = [
    "./maps/brown_photostudio_02_4k.hdr",
    "./maps/bethnal_green_entrance_4k.hdr"
  ];
  const loadingPromises = [];
  for (let i = 0; i < assets.length; i++) {
    const p = rgbeLoader.loadAsync(assets[i]);
    p.then(function(texture) {
      texture.mapping = EquirectangularReflectionMapping;
      texture.generateMipmaps = true;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.magFilter = LinearFilter;
      const pmrem = pmremGenerator.fromEquirectangular(texture);
      environments[`asset${i}`] = { texture, pmrem: pmrem.texture };
      const pmrem2 = pmremGenerator2.fromEquirectangular(texture);
      environments[`asset_pm2${i}`] = { texture, pmrem: pmrem2.texture };
    });
    loadingPromises.push(p);
  }
  return Promise.all(loadingPromises);
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
  return gemMaterial;
}
function setupPhysicalMaterials() {
  var _a;
  const diamond = new MeshPhysicalMaterial();
  const emerald = new MeshPhysicalMaterial();
  const diamondLarge = new MeshPhysicalMaterial();
  const defines = {};
  const envMap = environments.mainEXR || environments.mainHDR;
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
}
function setupScene() {
  scene.background = environments.mainEXR || environments.mainHDR;
  scene.environment = environments["asset0"].texture;
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
  mesh.position.set(-1, 0, 0);
  mesh2.position.set(3, 0, 0);
  window.scene = scene;
  for (let i = 0; i < loadedGlbs.length; i++) {
    console.log(loadedGlbs[i].scene);
    scene.add(loadedGlbs[i].scene);
  }
}
function addObjectPositionAndRotationControls() {
  const f = gui.addFolder("object controls");
  f.add(scene.rotation, "x", -Math.PI, Math.PI);
  f.add(scene.rotation, "y", -Math.PI, Math.PI);
  f.add(scene.rotation, "z", -Math.PI, Math.PI);
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
function analyzeGeometry() {
  const ringMesh = loadedGlbs[0].scene;
  let ringMetalMesh = void 0;
  ringMesh.updateWorldMatrix();
  ringMesh.traverse((c) => {
    const lcName = c.name.toLowerCase();
    if (lcName.indexOf("base") > -1) {
      ringMetalMesh = c;
    }
  });
  if (ringMetalMesh) {
    ringMetalMesh.updateWorldMatrix();
  }
}
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
    if (lcName.indexOf("diamond") > -1 || lcName.indexOf("trillion") > -1 || lcName.indexOf("mesh_1") > -1 || lcName.indexOf("mesh_2") > -1 || lcName.indexOf("marquise") > -1) {
      const mesh = children[i];
      mesh.material.dispose();
      mesh.material = createGemMaterial();
      mesh.material.bounces = 4;
      mesh.material.ior = 2.33;
      const bvh = new MeshBVHUniformStruct();
      bvh.updateFrom(
        new MeshBVH(mesh.geometry.clone().toNonIndexed(), { lazyGeneration: false, strategy: SAH })
      );
      mesh.material.bvh = bvh;
      materialsToUpdate[mesh.name] = mesh.material;
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
      addUniformsToGui(emeraldMesh2.material.uniforms, gui);
      addPhysicalMaterialToGUI(emeraldMesh2.material, gui);
    } else if (lcName.indexOf("occlud") > -1 || lcName.indexOf("shadow") > -1) {
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
    type: HalfFloatType,
    antialias: true
  });
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer2 = new WebGLRenderer({
    canvas: document.querySelector("canvas"),
    type: HalfFloatType,
    antialias: true
  });
  renderer2.toneMapping = ACESFilmicToneMapping;
  renderer2.outputColorSpace = SRGBColorSpace;
  renderer2.setSize(window.innerWidth, window.innerHeight);
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
  pmremGenerator2 = new PMREMGenerator(renderer2);
  pmremGenerator2.compileEquirectangularShader();
  await loadHDRAssets();
  environments.mainHDR = environments["asset0"].pmrem;
  window.environments = environments;
  setupScene();
  setupShaderMaterials();
  setupPhysicalMaterials();
  analyzeGeometry();
  processModelAssets();
  addMeshesToScene();
  scene.traverse((c) => {
    if (c.name.toLowerCase() === "diamond054") {
      addPhysicalMaterialToGUI(c.material, gui);
    }
  });
  addObjectPositionAndRotationControls();
  gui.close();
  animate();
}
window.onload = onload;
//# sourceMappingURL=main-COj9CRpu.js.map
