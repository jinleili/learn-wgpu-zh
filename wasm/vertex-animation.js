let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => {
    wasm.__wbindgen_export_3.get(state.dtor)(state.a, state.b)
});

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_3.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_32(arg0, arg1, arg2) {
    wasm.closure107_externref_shim(arg0, arg1, arg2);
}

function __wbg_adapter_39(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h30991b7d858facc4(arg0, arg1);
}

function __wbg_adapter_56(arg0, arg1, arg2, arg3) {
    wasm.closure140_externref_shim(arg0, arg1, arg2, arg3);
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}
/**
 * Chroma subsampling format
 */
export const ChromaSampling = Object.freeze({
/**
 * Both vertically and horizontally subsampled.
 */
Cs420:0,"0":"Cs420",
/**
 * Horizontally subsampled.
 */
Cs422:1,"1":"Cs422",
/**
 * Not subsampled.
 */
Cs444:2,"2":"Cs444",
/**
 * Monochrome.
 */
Cs400:3,"3":"Cs400", });

const __wbindgen_enum_AudioContextState = ["suspended", "running", "closed"];

const __wbindgen_enum_GpuAddressMode = ["clamp-to-edge", "repeat", "mirror-repeat"];

const __wbindgen_enum_GpuAutoLayoutMode = ["auto"];

const __wbindgen_enum_GpuBlendFactor = ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant"];

const __wbindgen_enum_GpuBlendOperation = ["add", "subtract", "reverse-subtract", "min", "max"];

const __wbindgen_enum_GpuBufferBindingType = ["uniform", "storage", "read-only-storage"];

const __wbindgen_enum_GpuBufferMapState = ["unmapped", "pending", "mapped"];

const __wbindgen_enum_GpuCanvasAlphaMode = ["opaque", "premultiplied"];

const __wbindgen_enum_GpuCompareFunction = ["never", "less", "equal", "less-equal", "greater", "not-equal", "greater-equal", "always"];

const __wbindgen_enum_GpuCompilationMessageType = ["error", "warning", "info"];

const __wbindgen_enum_GpuCullMode = ["none", "front", "back"];

const __wbindgen_enum_GpuDeviceLostReason = ["unknown", "destroyed"];

const __wbindgen_enum_GpuErrorFilter = ["validation", "out-of-memory", "internal"];

const __wbindgen_enum_GpuFeatureName = ["depth-clip-control", "depth32float-stencil8", "texture-compression-bc", "texture-compression-bc-sliced-3d", "texture-compression-etc2", "texture-compression-astc", "timestamp-query", "indirect-first-instance", "shader-f16", "rg11b10ufloat-renderable", "bgra8unorm-storage", "float32-filterable"];

const __wbindgen_enum_GpuFilterMode = ["nearest", "linear"];

const __wbindgen_enum_GpuFrontFace = ["ccw", "cw"];

const __wbindgen_enum_GpuIndexFormat = ["uint16", "uint32"];

const __wbindgen_enum_GpuLoadOp = ["load", "clear"];

const __wbindgen_enum_GpuMipmapFilterMode = ["nearest", "linear"];

const __wbindgen_enum_GpuPowerPreference = ["low-power", "high-performance"];

const __wbindgen_enum_GpuPrimitiveTopology = ["point-list", "line-list", "line-strip", "triangle-list", "triangle-strip"];

const __wbindgen_enum_GpuQueryType = ["occlusion", "timestamp"];

const __wbindgen_enum_GpuSamplerBindingType = ["filtering", "non-filtering", "comparison"];

const __wbindgen_enum_GpuStencilOperation = ["keep", "zero", "replace", "invert", "increment-clamp", "decrement-clamp", "increment-wrap", "decrement-wrap"];

const __wbindgen_enum_GpuStorageTextureAccess = ["write-only", "read-only", "read-write"];

const __wbindgen_enum_GpuStoreOp = ["store", "discard"];

const __wbindgen_enum_GpuTextureAspect = ["all", "stencil-only", "depth-only"];

const __wbindgen_enum_GpuTextureDimension = ["1d", "2d", "3d"];

const __wbindgen_enum_GpuTextureFormat = ["r8unorm", "r8snorm", "r8uint", "r8sint", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32uint", "r32sint", "r32float", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb9e5ufloat", "rgb10a2uint", "rgb10a2unorm", "rg11b10ufloat", "rg32uint", "rg32sint", "rg32float", "rgba16uint", "rgba16sint", "rgba16float", "rgba32uint", "rgba32sint", "rgba32float", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"];

const __wbindgen_enum_GpuTextureSampleType = ["float", "unfilterable-float", "depth", "sint", "uint"];

const __wbindgen_enum_GpuTextureViewDimension = ["1d", "2d", "2d-array", "cube", "cube-array", "3d"];

const __wbindgen_enum_GpuVertexFormat = ["uint8x2", "uint8x4", "sint8x2", "sint8x4", "unorm8x2", "unorm8x4", "snorm8x2", "snorm8x4", "uint16x2", "uint16x4", "sint16x2", "sint16x4", "unorm16x2", "unorm16x4", "snorm16x2", "snorm16x4", "float16x2", "float16x4", "float32", "float32x2", "float32x3", "float32x4", "uint32", "uint32x2", "uint32x3", "uint32x4", "sint32", "sint32x2", "sint32x3", "sint32x4", "unorm10-10-10-2"];

const __wbindgen_enum_GpuVertexStepMode = ["vertex", "instance"];

const __wbindgen_enum_PremultiplyAlpha = ["none", "premultiply", "default"];

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const __wbindgen_enum_ResizeObserverBoxOptions = ["border-box", "content-box", "device-pixel-content-box"];

const __wbindgen_enum_VisibilityState = ["hidden", "visible"];

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_devicePixelRatio_5d0556383aa83231 = function(arg0) {
        const ret = arg0.devicePixelRatio;
        return ret;
    };
    imports.wbg.__wbg_removeEventListener_4c13d11156153514 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        arg0.removeEventListener(getStringFromWasm0(arg1, arg2), arg3);
    }, arguments) };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_error_e297661c1014a1cc = typeof console.error == 'function' ? console.error : notDefined('console.error');
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = arg0.original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbg_revokeObjectURL_8e72bad4541bdca0 = function() { return handleError(function (arg0, arg1) {
        URL.revokeObjectURL(getStringFromWasm0(arg0, arg1));
    }, arguments) };
    imports.wbg.__wbg_disconnect_91f6e3e629264c78 = function(arg0) {
        arg0.disconnect();
    };
    imports.wbg.__wbg_disconnect_8d41ebc92b193580 = function(arg0) {
        arg0.disconnect();
    };
    imports.wbg.__wbg_cancelAnimationFrame_f802bc3f3a9b2e5c = function() { return handleError(function (arg0, arg1) {
        arg0.cancelAnimationFrame(arg1);
    }, arguments) };
    imports.wbg.__wbg_cancel_cba86749f45f30ae = function(arg0) {
        arg0.cancel();
    };
    imports.wbg.__wbg_instanceof_Window_6575cd7f1322f82f = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_document_d7fa2c739c2b191a = function(arg0) {
        const ret = arg0.document;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_setAttribute_2a8f647a8d92c712 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_getElementById_734c4eac4fec5911 = function(arg0, arg1, arg2) {
        const ret = arg0.getElementById(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_createElement_e4523490bd0ae51d = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.createElement(getStringFromWasm0(arg1, arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_appendChild_bc4a0deae90a5164 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.appendChild(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_body_8e909b791b1745d3 = function(arg0) {
        const ret = arg0.body;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_settabIndex_a11c34f55118ce28 = function(arg0, arg1) {
        arg0.tabIndex = arg1;
    };
    imports.wbg.__wbg_style_04eb1488bc2ceffc = function(arg0) {
        const ret = arg0.style;
        return ret;
    };
    imports.wbg.__wbg_setProperty_b9a2384cbfb499fb = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_focus_6b6181f7644f6dbc = function() { return handleError(function (arg0) {
        arg0.focus();
    }, arguments) };
    imports.wbg.__wbg_location_72721055fbff81f2 = function(arg0) {
        const ret = arg0.location;
        return ret;
    };
    imports.wbg.__wbg_search_aaeccdb8c45f3efa = function() { return handleError(function (arg0, arg1) {
        const ret = arg1.search;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_crypto_1d1f22824a6a080c = function(arg0) {
        const ret = arg0.crypto;
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_process_4a72847cc503995b = function(arg0) {
        const ret = arg0.process;
        return ret;
    };
    imports.wbg.__wbg_versions_f686565e586dd935 = function(arg0) {
        const ret = arg0.versions;
        return ret;
    };
    imports.wbg.__wbg_node_104a2ff8d6ea03a2 = function(arg0) {
        const ret = arg0.node;
        return ret;
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbg_require_cca90b1a94a0255b = function() { return handleError(function () {
        const ret = module.require;
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbg_msCrypto_eb05e62b530a1508 = function(arg0) {
        const ret = arg0.msCrypto;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_76462a666eca145f = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_get_ef828680c64da212 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_now_d3cbc9581625f686 = function(arg0) {
        const ret = arg0.now();
        return ret;
    };
    imports.wbg.__wbg_self_bf91bf94d9e04084 = function() { return handleError(function () {
        const ret = self.self;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_window_52dd9f07d03fd5f8 = function() { return handleError(function () {
        const ret = window.window;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_globalThis_05c129bf37fcf1be = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_global_3eca19bb09e9c484 = function() { return handleError(function () {
        const ret = global.global;
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbg_newnoargs_1ede4bf2ebbaaf43 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_call_a9ef466721e824f2 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_3bfa248576352471 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbg_buffer_ccaed51a635d8a2d = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_new_fec2611eb9180f95 = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_set_ec2fcf81bc573fd9 = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_7e3eb787208af730 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function() { return handleError(function (arg0, arg1) {
        arg0.randomFillSync(arg1);
    }, arguments) };
    imports.wbg.__wbg_subarray_975a06f9dbd16995 = function(arg0, arg1, arg2) {
        const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function() { return handleError(function (arg0, arg1) {
        arg0.getRandomValues(arg1);
    }, arguments) };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_then_4866a7d9f55d8f3e = function(arg0, arg1, arg2) {
        const ret = arg0.then(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_848aa4969108a57e = function(arg0) {
        const ret = arg0.queueMicrotask;
        return ret;
    };
    imports.wbg.__wbg_resolve_0aad7c1484731c99 = function(arg0) {
        const ret = Promise.resolve(arg0);
        return ret;
    };
    imports.wbg.__wbg_then_748f75edfb032440 = function(arg0, arg1) {
        const ret = arg0.then(arg1);
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_c5419c06eab41e73 = typeof queueMicrotask == 'function' ? queueMicrotask : notDefined('queueMicrotask');
    imports.wbg.__wbg_removeProperty_5acbca68235d0706 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg1.removeProperty(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_debug_69675dd374e2c249 = typeof console.debug == 'function' ? console.debug : notDefined('console.debug');
    imports.wbg.__wbg_error_53abcd6a461f73d8 = typeof console.error == 'function' ? console.error : notDefined('console.error');
    imports.wbg.__wbg_info_f073b719c8035bbf = typeof console.info == 'function' ? console.info : notDefined('console.info');
    imports.wbg.__wbg_log_f740dc2253ea759b = typeof console.log == 'function' ? console.log : notDefined('console.log');
    imports.wbg.__wbg_warn_41503a1c2194de89 = typeof console.warn == 'function' ? console.warn : notDefined('console.warn');
    imports.wbg.__wbg_performance_a1b8bde2ee512264 = function(arg0) {
        const ret = arg0.performance;
        return ret;
    };
    imports.wbg.__wbg_Window_5218851f504502e0 = function(arg0) {
        const ret = arg0.Window;
        return ret;
    };
    imports.wbg.__wbg_WorkerGlobalScope_d5db9a438aec6722 = function(arg0) {
        const ret = arg0.WorkerGlobalScope;
        return ret;
    };
    imports.wbg.__wbg_navigator_3d3836196a5d8e62 = function(arg0) {
        const ret = arg0.navigator;
        return ret;
    };
    imports.wbg.__wbg_gpu_bd990a3d2b27943b = function(arg0) {
        const ret = arg0.gpu;
        return ret;
    };
    imports.wbg.__wbg_navigator_4093e51a109a906e = function(arg0) {
        const ret = arg0.navigator;
        return ret;
    };
    imports.wbg.__wbindgen_is_null = function(arg0) {
        const ret = arg0 === null;
        return ret;
    };
    imports.wbg.__wbg_getContext_211e7f0e615215a4 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_querySelectorAll_28e417f74795a70f = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.querySelectorAll(getStringFromWasm0(arg1, arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_602f2a39a831c929 = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_getContext_bf8985355a4d22ca = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_new_e69b5f66fda8f13c = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_requestAdapter_0e755ec16adfeaef = function(arg0, arg1) {
        const ret = arg0.requestAdapter(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbg_set_e864d25d9b399c9f = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_034f913e7636e987 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_push_36cf4d81d7da33d1 = function(arg0, arg1) {
        const ret = arg0.push(arg1);
        return ret;
    };
    imports.wbg.__wbg_requestDevice_eba3ff45d2dc6b81 = function(arg0, arg1) {
        const ret = arg0.requestDevice(arg1);
        return ret;
    };
    imports.wbg.__wbg_features_9424a9acd57806c3 = function(arg0) {
        const ret = arg0.features;
        return ret;
    };
    imports.wbg.__wbg_limits_26190d8f1cda84fc = function(arg0) {
        const ret = arg0.limits;
        return ret;
    };
    imports.wbg.__wbg_getPreferredCanvasFormat_2aa46519bfbb53cb = function(arg0) {
        const ret = arg0.getPreferredCanvasFormat();
        return (__wbindgen_enum_GpuTextureFormat.indexOf(ret) + 1 || 96) - 1;
    };
    imports.wbg.__wbg_setwidth_23bf2deedd907275 = function(arg0, arg1) {
        arg0.width = arg1 >>> 0;
    };
    imports.wbg.__wbg_setheight_239dc283bbe50da4 = function(arg0, arg1) {
        arg0.height = arg1 >>> 0;
    };
    imports.wbg.__wbg_setwidth_e02ce7ae3e45c1b6 = function(arg0, arg1) {
        arg0.width = arg1 >>> 0;
    };
    imports.wbg.__wbg_setheight_45e518143d1ca78f = function(arg0, arg1) {
        arg0.height = arg1 >>> 0;
    };
    imports.wbg.__wbg_configure_976757a80d302cfd = function(arg0, arg1) {
        arg0.configure(arg1);
    };
    imports.wbg.__wbg_getCurrentTexture_420338538b7ba985 = function(arg0) {
        const ret = arg0.getCurrentTexture();
        return ret;
    };
    imports.wbg.__wbg_features_25609cb5b26e1fd0 = function(arg0) {
        const ret = arg0.features;
        return ret;
    };
    imports.wbg.__wbg_limits_d36e71d6d7040d86 = function(arg0) {
        const ret = arg0.limits;
        return ret;
    };
    imports.wbg.__wbg_createShaderModule_cdb96ffd7bfd5a7e = function(arg0, arg1) {
        const ret = arg0.createShaderModule(arg1);
        return ret;
    };
    imports.wbg.__wbg_createBindGroupLayout_df383f8bf0b92d07 = function(arg0, arg1) {
        const ret = arg0.createBindGroupLayout(arg1);
        return ret;
    };
    imports.wbg.__wbg_createBindGroup_e4b09a8d973011fc = function(arg0, arg1) {
        const ret = arg0.createBindGroup(arg1);
        return ret;
    };
    imports.wbg.__wbg_createPipelineLayout_85c441e2e9178d3a = function(arg0, arg1) {
        const ret = arg0.createPipelineLayout(arg1);
        return ret;
    };
    imports.wbg.__wbg_createComputePipeline_ea9e27db9e0d8cd0 = function(arg0, arg1) {
        const ret = arg0.createComputePipeline(arg1);
        return ret;
    };
    imports.wbg.__wbg_createBuffer_b1bc31416c42f297 = function(arg0, arg1) {
        const ret = arg0.createBuffer(arg1);
        return ret;
    };
    imports.wbg.__wbg_createTexture_37bc5632c49e0300 = function(arg0, arg1) {
        const ret = arg0.createTexture(arg1);
        return ret;
    };
    imports.wbg.__wbg_createSampler_1f071ec702ef29a1 = function(arg0, arg1) {
        const ret = arg0.createSampler(arg1);
        return ret;
    };
    imports.wbg.__wbg_createQuerySet_a05d99f32d2ea788 = function(arg0, arg1) {
        const ret = arg0.createQuerySet(arg1);
        return ret;
    };
    imports.wbg.__wbg_createCommandEncoder_33558979c5d6bc2c = function(arg0, arg1) {
        const ret = arg0.createCommandEncoder(arg1);
        return ret;
    };
    imports.wbg.__wbg_createRenderBundleEncoder_72b42576dd655e11 = function(arg0, arg1) {
        const ret = arg0.createRenderBundleEncoder(arg1);
        return ret;
    };
    imports.wbg.__wbg_lost_2ab73d2899cf37ae = function(arg0) {
        const ret = arg0.lost;
        return ret;
    };
    imports.wbg.__wbg_destroy_05b9c94f09626d87 = function(arg0) {
        arg0.destroy();
    };
    imports.wbg.__wbg_setonuncapturederror_4985951b1d7410d2 = function(arg0, arg1) {
        arg0.onuncapturederror = arg1;
    };
    imports.wbg.__wbg_pushErrorScope_ea13ac1917404b6b = function(arg0, arg1) {
        arg0.pushErrorScope(__wbindgen_enum_GpuErrorFilter[arg1]);
    };
    imports.wbg.__wbg_popErrorScope_b18c32a5b029034a = function(arg0) {
        const ret = arg0.popErrorScope();
        return ret;
    };
    imports.wbg.__wbg_mapAsync_2871e35eccd9c638 = function(arg0, arg1, arg2, arg3) {
        const ret = arg0.mapAsync(arg1 >>> 0, arg2, arg3);
        return ret;
    };
    imports.wbg.__wbg_getMappedRange_c5df829b44191b60 = function(arg0, arg1, arg2) {
        const ret = arg0.getMappedRange(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_length_9254c4bd3b9f23c4 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_unmap_d6ae7bed8545c9c3 = function(arg0) {
        arg0.unmap();
    };
    imports.wbg.__wbg_getCompilationInfo_f08dbc26bdf70876 = function(arg0) {
        const ret = arg0.getCompilationInfo();
        return ret;
    };
    imports.wbg.__wbg_createView_0de22df992b9a18e = function(arg0, arg1) {
        const ret = arg0.createView(arg1);
        return ret;
    };
    imports.wbg.__wbg_destroy_5ec9bba627335ed6 = function(arg0) {
        arg0.destroy();
    };
    imports.wbg.__wbg_destroy_d04a61262a16f9c0 = function(arg0) {
        arg0.destroy();
    };
    imports.wbg.__wbg_getBindGroupLayout_8e5043f942e08ea3 = function(arg0, arg1) {
        const ret = arg0.getBindGroupLayout(arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_getBindGroupLayout_2a903c8c2763beda = function(arg0, arg1) {
        const ret = arg0.getBindGroupLayout(arg1 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_copyBufferToBuffer_da8918f17714be10 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        arg0.copyBufferToBuffer(arg1, arg2, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_copyBufferToTexture_9bcb8a8c9942c679 = function(arg0, arg1, arg2, arg3) {
        arg0.copyBufferToTexture(arg1, arg2, arg3);
    };
    imports.wbg.__wbg_copyTextureToBuffer_6c3caf51a11ebf7e = function(arg0, arg1, arg2, arg3) {
        arg0.copyTextureToBuffer(arg1, arg2, arg3);
    };
    imports.wbg.__wbg_copyTextureToTexture_3388bf3120de4459 = function(arg0, arg1, arg2, arg3) {
        arg0.copyTextureToTexture(arg1, arg2, arg3);
    };
    imports.wbg.__wbg_beginComputePass_1f918279b0916561 = function(arg0, arg1) {
        const ret = arg0.beginComputePass(arg1);
        return ret;
    };
    imports.wbg.__wbg_beginRenderPass_994bb5571da69860 = function(arg0, arg1) {
        const ret = arg0.beginRenderPass(arg1);
        return ret;
    };
    imports.wbg.__wbg_label_8ccf50234e7473f1 = function(arg0, arg1) {
        const ret = arg1.label;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_finish_01606e2e87f5db65 = function(arg0) {
        const ret = arg0.finish();
        return ret;
    };
    imports.wbg.__wbg_finish_b6efa0956f569b51 = function(arg0, arg1) {
        const ret = arg0.finish(arg1);
        return ret;
    };
    imports.wbg.__wbg_clearBuffer_b17657c2f424ab7c = function(arg0, arg1, arg2) {
        arg0.clearBuffer(arg1, arg2);
    };
    imports.wbg.__wbg_clearBuffer_dfa40698c0ae3159 = function(arg0, arg1, arg2, arg3) {
        arg0.clearBuffer(arg1, arg2, arg3);
    };
    imports.wbg.__wbg_resolveQuerySet_77fba260382a69bb = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        arg0.resolveQuerySet(arg1, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
    };
    imports.wbg.__wbg_finish_ba5339911e834d90 = function(arg0) {
        const ret = arg0.finish();
        return ret;
    };
    imports.wbg.__wbg_finish_fac6541f20015daa = function(arg0, arg1) {
        const ret = arg0.finish(arg1);
        return ret;
    };
    imports.wbg.__wbg_usage_6241854043909e78 = function(arg0) {
        const ret = arg0.usage;
        return ret;
    };
    imports.wbg.__wbg_size_f7a907982b8d3923 = function(arg0) {
        const ret = arg0.size;
        return ret;
    };
    imports.wbg.__wbg_buffer_95102df5554646dc = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_writeTexture_4169ceaca5e8175a = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.writeTexture(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_copyExternalImageToTexture_bc2817a25f93a147 = function(arg0, arg1, arg2, arg3) {
        arg0.copyExternalImageToTexture(arg1, arg2, arg3);
    };
    imports.wbg.__wbg_submit_fce1c38557836c6c = function(arg0, arg1) {
        arg0.submit(arg1);
    };
    imports.wbg.__wbg_setPipeline_2bf8b9c49a14c6b1 = function(arg0, arg1) {
        arg0.setPipeline(arg1);
    };
    imports.wbg.__wbg_setBindGroup_55fc30bfc85bfed5 = function(arg0, arg1, arg2) {
        arg0.setBindGroup(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_setBindGroup_fc44dbd1b3de302b = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
    };
    imports.wbg.__wbg_dispatchWorkgroups_c81d0f657b22ad07 = function(arg0, arg1, arg2, arg3) {
        arg0.dispatchWorkgroups(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_dispatchWorkgroupsIndirect_60aed932f169c64a = function(arg0, arg1, arg2) {
        arg0.dispatchWorkgroupsIndirect(arg1, arg2);
    };
    imports.wbg.__wbg_end_1910c08a8b7611fd = function(arg0) {
        arg0.end();
    };
    imports.wbg.__wbg_setPipeline_ff7f1e88b8b347d4 = function(arg0, arg1) {
        arg0.setPipeline(arg1);
    };
    imports.wbg.__wbg_setBindGroup_c9d85c4405625b15 = function(arg0, arg1, arg2) {
        arg0.setBindGroup(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_setBindGroup_bb8377df5847a439 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
    };
    imports.wbg.__wbg_setIndexBuffer_3106c3f8eaf9463f = function(arg0, arg1, arg2, arg3) {
        arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3);
    };
    imports.wbg.__wbg_setIndexBuffer_80c98d6a3f8d63a8 = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3, arg4);
    };
    imports.wbg.__wbg_setVertexBuffer_adedf8ced203322c = function(arg0, arg1, arg2, arg3) {
        arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_setVertexBuffer_1c9a823b0dc529c4 = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_draw_09103e787224c7bb = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_drawIndexed_a73cc9f9d7fd3199 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        arg0.drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
    };
    imports.wbg.__wbg_drawIndirect_e20449dbb9a76b56 = function(arg0, arg1, arg2) {
        arg0.drawIndirect(arg1, arg2);
    };
    imports.wbg.__wbg_drawIndexedIndirect_525f4c59111f3ca4 = function(arg0, arg1, arg2) {
        arg0.drawIndexedIndirect(arg1, arg2);
    };
    imports.wbg.__wbg_setPipeline_abff4492c059e8bc = function(arg0, arg1) {
        arg0.setPipeline(arg1);
    };
    imports.wbg.__wbg_setBindGroup_4f728282101654ea = function(arg0, arg1, arg2) {
        arg0.setBindGroup(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_setBindGroup_957d97d5d74f2495 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        arg0.setBindGroup(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
    };
    imports.wbg.__wbg_setIndexBuffer_9d2960b6ddcb8da5 = function(arg0, arg1, arg2, arg3) {
        arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3);
    };
    imports.wbg.__wbg_setIndexBuffer_14953d5e5868b711 = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.setIndexBuffer(arg1, __wbindgen_enum_GpuIndexFormat[arg2], arg3, arg4);
    };
    imports.wbg.__wbg_setVertexBuffer_b81d5f5cdcb9d231 = function(arg0, arg1, arg2, arg3) {
        arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_setVertexBuffer_3e5c21164c51a5eb = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.setVertexBuffer(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_draw_648a7e9b9782bb7e = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_drawIndexed_27c45c01331a599c = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        arg0.drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
    };
    imports.wbg.__wbg_drawIndirect_2693c246e524ac64 = function(arg0, arg1, arg2) {
        arg0.drawIndirect(arg1, arg2);
    };
    imports.wbg.__wbg_drawIndexedIndirect_6168495207760cf6 = function(arg0, arg1, arg2) {
        arg0.drawIndexedIndirect(arg1, arg2);
    };
    imports.wbg.__wbg_setBlendConstant_61a55530d4da890f = function(arg0, arg1) {
        arg0.setBlendConstant(arg1);
    };
    imports.wbg.__wbg_setScissorRect_b1384bdd48a8198e = function(arg0, arg1, arg2, arg3, arg4) {
        arg0.setScissorRect(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_setViewport_0a7994521fb619c2 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        arg0.setViewport(arg1, arg2, arg3, arg4, arg5, arg6);
    };
    imports.wbg.__wbg_setStencilReference_b88790f7471faa50 = function(arg0, arg1) {
        arg0.setStencilReference(arg1 >>> 0);
    };
    imports.wbg.__wbg_executeBundles_0224159bfd92604f = function(arg0, arg1) {
        arg0.executeBundles(arg1);
    };
    imports.wbg.__wbg_end_4aff02a93037feb4 = function(arg0) {
        arg0.end();
    };
    imports.wbg.__wbg_writeBuffer_d590978cde5aa5b5 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        arg0.writeBuffer(arg1, arg2, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_messages_1eec5fe818d17b6b = function(arg0) {
        const ret = arg0.messages;
        return ret;
    };
    imports.wbg.__wbg_length_f217bbbf7e8e4df4 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_get_5419cf6b954aa11d = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_type_aa4599218a4504a9 = function(arg0) {
        const ret = arg0.type;
        return (__wbindgen_enum_GpuCompilationMessageType.indexOf(ret) + 1 || 4) - 1;
    };
    imports.wbg.__wbg_offset_d6f534a7d1b7dfb7 = function(arg0) {
        const ret = arg0.offset;
        return ret;
    };
    imports.wbg.__wbg_length_b93be778d569f6d1 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_lineNum_88fdd333d4441e7b = function(arg0) {
        const ret = arg0.lineNum;
        return ret;
    };
    imports.wbg.__wbg_message_7fa4c77784458a7b = function(arg0, arg1) {
        const ret = arg1.message;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_instanceof_Object_4bbac482eda9b711 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Object;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_GpuValidationError_7003dd8a13defedd = function(arg0) {
        let result;
        try {
            result = arg0 instanceof GPUValidationError;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_message_a1b6d4a58706fce1 = function(arg0, arg1) {
        const ret = arg1.message;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_instanceof_GpuOutOfMemoryError_7cc2a1bc9e21af9f = function(arg0) {
        let result;
        try {
            result = arg0 instanceof GPUOutOfMemoryError;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_error_6e98b2c536866396 = function(arg0) {
        const ret = arg0.error;
        return ret;
    };
    imports.wbg.__wbg_valueOf_caadbb280a0b350a = function(arg0) {
        const ret = arg0.valueOf();
        return ret;
    };
    imports.wbg.__wbg_instanceof_GpuDeviceLostInfo_41477e03ab828a57 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof GPUDeviceLostInfo;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_reason_dae22a3bfa9841bc = function(arg0) {
        const ret = arg0.reason;
        return (__wbindgen_enum_GpuDeviceLostReason.indexOf(ret) + 1 || 3) - 1;
    };
    imports.wbg.__wbg_message_f1550ccb6b4cd501 = function(arg0, arg1) {
        const ret = arg1.message;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_createRenderPipeline_19b6f05f57979c41 = function(arg0, arg1) {
        const ret = arg0.createRenderPipeline(arg1);
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension1D_39a585636aa1f887 = function(arg0) {
        const ret = arg0.maxTextureDimension1D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension2D_ad386ba70b28add7 = function(arg0) {
        const ret = arg0.maxTextureDimension2D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension3D_fa439f57569983e8 = function(arg0) {
        const ret = arg0.maxTextureDimension3D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureArrayLayers_6f2126c6a6b5cd3a = function(arg0) {
        const ret = arg0.maxTextureArrayLayers;
        return ret;
    };
    imports.wbg.__wbg_maxBindGroups_387af0e2df7a0899 = function(arg0) {
        const ret = arg0.maxBindGroups;
        return ret;
    };
    imports.wbg.__wbg_maxBindingsPerBindGroup_0573ee7383e3de0f = function(arg0) {
        const ret = arg0.maxBindingsPerBindGroup;
        return ret;
    };
    imports.wbg.__wbg_maxDynamicUniformBuffersPerPipelineLayout_54f7227735b1a1c8 = function(arg0) {
        const ret = arg0.maxDynamicUniformBuffersPerPipelineLayout;
        return ret;
    };
    imports.wbg.__wbg_maxDynamicStorageBuffersPerPipelineLayout_bcba2879b0a68934 = function(arg0) {
        const ret = arg0.maxDynamicStorageBuffersPerPipelineLayout;
        return ret;
    };
    imports.wbg.__wbg_maxSampledTexturesPerShaderStage_aaaa29142184370e = function(arg0) {
        const ret = arg0.maxSampledTexturesPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxSamplersPerShaderStage_d4a512e5c2e75750 = function(arg0) {
        const ret = arg0.maxSamplersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxStorageBuffersPerShaderStage_06cf7b6bb9efed5b = function(arg0) {
        const ret = arg0.maxStorageBuffersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxStorageTexturesPerShaderStage_5ddfc8c3c6a7407c = function(arg0) {
        const ret = arg0.maxStorageTexturesPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxUniformBuffersPerShaderStage_0f230b1ff21ad339 = function(arg0) {
        const ret = arg0.maxUniformBuffersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxUniformBufferBindingSize_d46972129f70db3c = function(arg0) {
        const ret = arg0.maxUniformBufferBindingSize;
        return ret;
    };
    imports.wbg.__wbg_maxStorageBufferBindingSize_6cbb30305855d1aa = function(arg0) {
        const ret = arg0.maxStorageBufferBindingSize;
        return ret;
    };
    imports.wbg.__wbg_maxVertexBuffers_21f3262fe209faa7 = function(arg0) {
        const ret = arg0.maxVertexBuffers;
        return ret;
    };
    imports.wbg.__wbg_maxBufferSize_015ab0aabd1b8b0c = function(arg0) {
        const ret = arg0.maxBufferSize;
        return ret;
    };
    imports.wbg.__wbg_maxVertexAttributes_1b5a9857411b5de4 = function(arg0) {
        const ret = arg0.maxVertexAttributes;
        return ret;
    };
    imports.wbg.__wbg_maxVertexBufferArrayStride_ff07dd39a2f4873e = function(arg0) {
        const ret = arg0.maxVertexBufferArrayStride;
        return ret;
    };
    imports.wbg.__wbg_minUniformBufferOffsetAlignment_602c6fb6e1ffbfec = function(arg0) {
        const ret = arg0.minUniformBufferOffsetAlignment;
        return ret;
    };
    imports.wbg.__wbg_minStorageBufferOffsetAlignment_e00936b91385cbea = function(arg0) {
        const ret = arg0.minStorageBufferOffsetAlignment;
        return ret;
    };
    imports.wbg.__wbg_maxColorAttachments_449c99990b4160fc = function(arg0) {
        const ret = arg0.maxColorAttachments;
        return ret;
    };
    imports.wbg.__wbg_maxColorAttachmentBytesPerSample_6923be774ed637a0 = function(arg0) {
        const ret = arg0.maxColorAttachmentBytesPerSample;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupStorageSize_9d4fdde1e82b289a = function(arg0) {
        const ret = arg0.maxComputeWorkgroupStorageSize;
        return ret;
    };
    imports.wbg.__wbg_maxComputeInvocationsPerWorkgroup_d4007fc417128249 = function(arg0) {
        const ret = arg0.maxComputeInvocationsPerWorkgroup;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeX_e66acc451c1e3c0e = function(arg0) {
        const ret = arg0.maxComputeWorkgroupSizeX;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeY_1eb81e9b6186d667 = function(arg0) {
        const ret = arg0.maxComputeWorkgroupSizeY;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeZ_c888e5f09da8121d = function(arg0) {
        const ret = arg0.maxComputeWorkgroupSizeZ;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupsPerDimension_ebb12adf1265964c = function(arg0) {
        const ret = arg0.maxComputeWorkgroupsPerDimension;
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_has_6e4fe17357847090 = function(arg0, arg1, arg2) {
        const ret = arg0.has(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_queue_6ef67d5d8110c3f5 = function(arg0) {
        const ret = arg0.queue;
        return ret;
    };
    imports.wbg.__wbg_instanceof_GpuAdapter_2255bf01fe346ea6 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof GPUAdapter;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_GpuCanvasContext_c1c662346b1c4c0f = function(arg0) {
        let result;
        try {
            result = arg0 instanceof GPUCanvasContext;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_Window_bd9ec3fee5f673ee = function(arg0) {
        const ret = arg0.Window;
        return ret;
    };
    imports.wbg.__wbg_play_5896e5851ba90aa2 = function(arg0) {
        arg0.play();
    };
    imports.wbg.__wbg_animate_b321da85ed3f2b4a = function(arg0, arg1, arg2) {
        const ret = arg0.animate(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_693514e3dcae83e6 = typeof queueMicrotask == 'function' ? queueMicrotask : notDefined('queueMicrotask');
    imports.wbg.__wbg_abort_c57daab47a6c1215 = function(arg0) {
        arg0.abort();
    };
    imports.wbg.__wbg_cancelIdleCallback_7e85ac94feec1b33 = function(arg0, arg1) {
        arg0.cancelIdleCallback(arg1 >>> 0);
    };
    imports.wbg.__wbg_clearTimeout_8567b0ecb6ec5d60 = function(arg0, arg1) {
        arg0.clearTimeout(arg1);
    };
    imports.wbg.__wbg_close_8356c7a6c6893135 = function(arg0) {
        arg0.close();
    };
    imports.wbg.__wbg_setonmessage_81b2f44fc2b4b0a4 = function(arg0, arg1) {
        arg0.onmessage = arg1;
    };
    imports.wbg.__wbg_removeListener_0e5684bf9a4fe773 = function() { return handleError(function (arg0, arg1) {
        arg0.removeListener(arg1);
    }, arguments) };
    imports.wbg.__wbg_scheduler_7ccf2d3b362018c4 = function(arg0) {
        const ret = arg0.scheduler;
        return ret;
    };
    imports.wbg.__wbg_new_75169ae5a9683c55 = function() { return handleError(function () {
        const ret = new AbortController();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_signal_9acfcec9e7dffc22 = function(arg0) {
        const ret = arg0.signal;
        return ret;
    };
    imports.wbg.__wbg_postTask_99464245f349be5a = function(arg0, arg1, arg2) {
        const ret = arg0.postTask(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_catch_8097da4375a5dd1b = function(arg0, arg1) {
        const ret = arg0.catch(arg1);
        return ret;
    };
    imports.wbg.__wbg_new_e207405ddca58ee2 = function() { return handleError(function () {
        const ret = new MessageChannel();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_port1_a6e649ef4f3886f3 = function(arg0) {
        const ret = arg0.port1;
        return ret;
    };
    imports.wbg.__wbg_start_818baa7ac87fe59f = function(arg0) {
        arg0.start();
    };
    imports.wbg.__wbg_port2_6fdacea6fa8e446e = function(arg0) {
        const ret = arg0.port2;
        return ret;
    };
    imports.wbg.__wbg_setTimeout_c9db6bce0a6bb71c = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.setTimeout(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_now_abd80e969af37148 = function(arg0) {
        const ret = arg0.now();
        return ret;
    };
    imports.wbg.__wbg_of_7e03bb557d6a64cc = function(arg0, arg1) {
        const ret = Array.of(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_of_064d1507296514c2 = function(arg0) {
        const ret = Array.of(arg0);
        return ret;
    };
    imports.wbg.__wbg_postMessage_857ce8a4ab57c841 = function() { return handleError(function (arg0, arg1, arg2) {
        arg0.postMessage(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_setTimeout_e5d5b865335ce177 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.setTimeout(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_requestIdleCallback_effe682e9df1695f = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.requestIdleCallback(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_scheduler_f38a681d98b5a776 = function(arg0) {
        const ret = arg0.scheduler;
        return ret;
    };
    imports.wbg.__wbg_requestIdleCallback_86b728660e0547ef = function(arg0) {
        const ret = arg0.requestIdleCallback;
        return ret;
    };
    imports.wbg.__wbg_new_00d033f8a8736a28 = function() { return handleError(function (arg0, arg1) {
        const ret = new Worker(getStringFromWasm0(arg0, arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_settype_623d2ee701e6310a = function(arg0, arg1, arg2) {
        arg0.type = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_newwithstrsequenceandoptions_3d581ce16ca52c44 = function() { return handleError(function (arg0, arg1) {
        const ret = new Blob(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createObjectURL_11804d71ac214694 = function() { return handleError(function (arg0, arg1) {
        const ret = URL.createObjectURL(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_postMessage_5109299871335137 = function() { return handleError(function (arg0, arg1) {
        arg0.postMessage(arg1);
    }, arguments) };
    imports.wbg.__wbg_contains_a28a8f7c01e4c130 = function(arg0, arg1) {
        const ret = arg0.contains(arg1);
        return ret;
    };
    imports.wbg.__wbg_getPropertyValue_b199c95cfeadebdf = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg1.getPropertyValue(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_unobserve_79fd6473e7891735 = function(arg0, arg1) {
        arg0.unobserve(arg1);
    };
    imports.wbg.__wbg_observe_51c387de0413edcf = function(arg0, arg1) {
        arg0.observe(arg1);
    };
    imports.wbg.__wbg_prototype_d33365945f23f380 = function() {
        const ret = ResizeObserverEntry.prototype;
        return ret;
    };
    imports.wbg.__wbg_getOwnPropertyDescriptor_419345cdc0d1ec14 = function(arg0, arg1) {
        const ret = Object.getOwnPropertyDescriptor(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_addEventListener_4357f9b7b3826784 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        arg0.addEventListener(getStringFromWasm0(arg1, arg2), arg3);
    }, arguments) };
    imports.wbg.__wbg_visibilityState_5e9ade0fb5df3c9c = function(arg0) {
        const ret = arg0.visibilityState;
        return (__wbindgen_enum_VisibilityState.indexOf(ret) + 1 || 3) - 1;
    };
    imports.wbg.__wbg_code_bec0d5222298000e = function(arg0, arg1) {
        const ret = arg1.code;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_button_d8226b772c8cf494 = function(arg0) {
        const ret = arg0.button;
        return ret;
    };
    imports.wbg.__wbg_pointerId_93f7e5e10bb641ad = function(arg0) {
        const ret = arg0.pointerId;
        return ret;
    };
    imports.wbg.__wbg_deltaX_10154f810008c0a0 = function(arg0) {
        const ret = arg0.deltaX;
        return ret;
    };
    imports.wbg.__wbg_deltaY_afd77a1b9e0d9ccd = function(arg0) {
        const ret = arg0.deltaY;
        return ret;
    };
    imports.wbg.__wbg_deltaMode_f31810d86a9defec = function(arg0) {
        const ret = arg0.deltaMode;
        return ret;
    };
    imports.wbg.__wbg_buttons_2cb9e49b40e20105 = function(arg0) {
        const ret = arg0.buttons;
        return ret;
    };
    imports.wbg.__wbg_offsetX_294898d040917c6b = function(arg0) {
        const ret = arg0.offsetX;
        return ret;
    };
    imports.wbg.__wbg_offsetY_f484804b7b03dd86 = function(arg0) {
        const ret = arg0.offsetY;
        return ret;
    };
    imports.wbg.__wbg_movementX_468fdc7a7281744b = function(arg0) {
        const ret = arg0.movementX;
        return ret;
    };
    imports.wbg.__wbg_movementY_8bbbf8c3bffd1fce = function(arg0) {
        const ret = arg0.movementY;
        return ret;
    };
    imports.wbg.__wbg_getCoalescedEvents_8f8920b382098ac5 = function(arg0) {
        const ret = arg0.getCoalescedEvents();
        return ret;
    };
    imports.wbg.__wbg_getCoalescedEvents_85701851c470c4e6 = function(arg0) {
        const ret = arg0.getCoalescedEvents;
        return ret;
    };
    imports.wbg.__wbg_userAgentData_85a8393570ab7dee = function(arg0) {
        const ret = arg0.userAgentData;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_brands_982de08b35281a98 = function(arg0) {
        const ret = arg0.brands;
        return ret;
    };
    imports.wbg.__wbg_brand_cdcf0249d44027a8 = function(arg0, arg1) {
        const ret = arg1.brand;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_userAgent_b433f0f22dfedec5 = function() { return handleError(function (arg0, arg1) {
        const ret = arg1.userAgent;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_persisted_af13b0ad7952721a = function(arg0) {
        const ret = arg0.persisted;
        return ret;
    };
    imports.wbg.__wbg_webkitFullscreenElement_a02341d57a641b43 = function(arg0) {
        const ret = arg0.webkitFullscreenElement;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_fullscreenElement_d39685ee9d78d455 = function(arg0) {
        const ret = arg0.fullscreenElement;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_is_4b64bc96710d6a0f = function(arg0, arg1) {
        const ret = Object.is(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_requestFullscreen_8a94df4e7f757077 = function(arg0) {
        const ret = arg0.requestFullscreen;
        return ret;
    };
    imports.wbg.__wbg_getComputedStyle_ec7e113b79b74e98 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.getComputedStyle(arg1);
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_webkitRequestFullscreen_42ba1c34171febc6 = function(arg0) {
        arg0.webkitRequestFullscreen();
    };
    imports.wbg.__wbg_requestFullscreen_24891df6120b675d = function(arg0) {
        const ret = arg0.requestFullscreen();
        return ret;
    };
    imports.wbg.__wbg_activeElement_4ab2bc6dcf8da330 = function(arg0) {
        const ret = arg0.activeElement;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_matchMedia_2c5a513148e49e4a = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.matchMedia(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_addListener_503d439bc3f84ff3 = function() { return handleError(function (arg0, arg1) {
        arg0.addListener(arg1);
    }, arguments) };
    imports.wbg.__wbg_new_bc395d17a25f9f2f = function() { return handleError(function (arg0) {
        const ret = new ResizeObserver(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setbox_0540f4f0ed4733b6 = function(arg0, arg1) {
        arg0.box = __wbindgen_enum_ResizeObserverBoxOptions[arg1];
    };
    imports.wbg.__wbg_observe_e05a589c42476328 = function(arg0, arg1, arg2) {
        arg0.observe(arg1, arg2);
    };
    imports.wbg.__wbg_new_4422dda84db10905 = function() { return handleError(function (arg0) {
        const ret = new IntersectionObserver(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_observe_6f2910a25347a592 = function(arg0, arg1) {
        arg0.observe(arg1);
    };
    imports.wbg.__wbg_preventDefault_eecc4a63e64c4526 = function(arg0) {
        arg0.preventDefault();
    };
    imports.wbg.__wbg_isIntersecting_57d03835f2fb0c18 = function(arg0) {
        const ret = arg0.isIntersecting;
        return ret;
    };
    imports.wbg.__wbg_requestAnimationFrame_8c3436f4ac89bc48 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.requestAnimationFrame(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_contentRect_0ff902e25b5b4c7a = function(arg0) {
        const ret = arg0.contentRect;
        return ret;
    };
    imports.wbg.__wbg_width_45de62653cf1c40c = function(arg0) {
        const ret = arg0.width;
        return ret;
    };
    imports.wbg.__wbg_height_333816c9b207333d = function(arg0) {
        const ret = arg0.height;
        return ret;
    };
    imports.wbg.__wbg_devicePixelContentBoxSize_67d2874a12290f0b = function(arg0) {
        const ret = arg0.devicePixelContentBoxSize;
        return ret;
    };
    imports.wbg.__wbg_inlineSize_bdd9c1683673d79e = function(arg0) {
        const ret = arg0.inlineSize;
        return ret;
    };
    imports.wbg.__wbg_blockSize_5d28da4852a3728e = function(arg0) {
        const ret = arg0.blockSize;
        return ret;
    };
    imports.wbg.__wbg_matches_7df350fbe7beb09f = function(arg0) {
        const ret = arg0.matches;
        return ret;
    };
    imports.wbg.__wbg_pointerType_6d91ef0da43639d3 = function(arg0, arg1) {
        const ret = arg1.pointerType;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_pressure_ad8dacbd14c9076f = function(arg0) {
        const ret = arg0.pressure;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_6d843f3032fd0366 = function(arg0) {
        const ret = arg0.shiftKey;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_4015247a39aa9410 = function(arg0) {
        const ret = arg0.ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_altKey_c9401b041949ea90 = function(arg0) {
        const ret = arg0.altKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_5d680933661ea1ea = function(arg0) {
        const ret = arg0.metaKey;
        return ret;
    };
    imports.wbg.__wbg_setPointerCapture_739b13a4c8b0c2b0 = function() { return handleError(function (arg0, arg1) {
        arg0.setPointerCapture(arg1);
    }, arguments) };
    imports.wbg.__wbg_key_001eb20ba3b3d2fd = function(arg0, arg1) {
        const ret = arg1.key;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_shiftKey_cb120edc9c25950d = function(arg0) {
        const ret = arg0.shiftKey;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_f592192d87040d94 = function(arg0) {
        const ret = arg0.ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_altKey_ebf03e2308f51c08 = function(arg0) {
        const ret = arg0.altKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_0735ca81e2ec6c72 = function(arg0) {
        const ret = arg0.metaKey;
        return ret;
    };
    imports.wbg.__wbg_location_a7e2614c5720fcd7 = function(arg0) {
        const ret = arg0.location;
        return ret;
    };
    imports.wbg.__wbg_repeat_1f81f308f5d8d519 = function(arg0) {
        const ret = arg0.repeat;
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper1377 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper2762 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper2768 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3251 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_39);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3296 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3315 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3316 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3317 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3318 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3319 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3363 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3364 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_56);
        return ret;
    };
    imports.wbg.__wbindgen_closure_wrapper3365 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 108, __wbg_adapter_32);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_2;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('vertex-animation_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
