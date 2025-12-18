let wasm;

let heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
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
    if (builtInMatches && builtInMatches.length > 1) {
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

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

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
        const ret = cachedTextEncoder.encodeInto(arg, view);

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

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

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

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

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
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
/**
 * canvas size 改变
 * @param {bigint} ptr
 * @param {number} width
 * @param {number} height
 */
export function resize_app(ptr, width, height) {
    wasm.resize_app(ptr, width, height);
}

/**
 * @param {string} canvas_id
 * @param {number} handle
 * @returns {Promise<bigint>}
 */
export function create_wgpu_app(canvas_id, handle) {
    const ptr0 = passStringToWasm0(canvas_id, wasm.__wbindgen_export, wasm.__wbindgen_export2);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.create_wgpu_app(ptr0, len0, handle);
    return takeObject(ret);
}

/**
 * 帧绘制
 * @param {bigint} ptr
 */
export function enter_frame(ptr) {
    wasm.enter_frame(ptr);
}

/**
 * 销毁 WgpuApp 实例
 * @param {bigint} ptr
 */
export function drop_wgpu_app(ptr) {
    wasm.drop_wgpu_app(ptr);
}

/**
 * 鼠标移动
 * @param {bigint} ptr
 * @param {number} x
 * @param {number} y
 */
export function on_mouse_move(ptr, x, y) {
    wasm.on_mouse_move(ptr, x, y);
}

function __wasm_bindgen_func_elem_1639(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_1639(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_965(arg0, arg1, arg2, arg3) {
    wasm.__wasm_bindgen_func_elem_965(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

const __wbindgen_enum_GpuAddressMode = ["clamp-to-edge", "repeat", "mirror-repeat"];

const __wbindgen_enum_GpuBlendFactor = ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant", "src1", "one-minus-src1", "src1-alpha", "one-minus-src1-alpha"];

const __wbindgen_enum_GpuBlendOperation = ["add", "subtract", "reverse-subtract", "min", "max"];

const __wbindgen_enum_GpuBufferBindingType = ["uniform", "storage", "read-only-storage"];

const __wbindgen_enum_GpuCanvasAlphaMode = ["opaque", "premultiplied"];

const __wbindgen_enum_GpuCompareFunction = ["never", "less", "equal", "less-equal", "greater", "not-equal", "greater-equal", "always"];

const __wbindgen_enum_GpuCullMode = ["none", "front", "back"];

const __wbindgen_enum_GpuFilterMode = ["nearest", "linear"];

const __wbindgen_enum_GpuFrontFace = ["ccw", "cw"];

const __wbindgen_enum_GpuIndexFormat = ["uint16", "uint32"];

const __wbindgen_enum_GpuLoadOp = ["load", "clear"];

const __wbindgen_enum_GpuMipmapFilterMode = ["nearest", "linear"];

const __wbindgen_enum_GpuPowerPreference = ["low-power", "high-performance"];

const __wbindgen_enum_GpuPrimitiveTopology = ["point-list", "line-list", "line-strip", "triangle-list", "triangle-strip"];

const __wbindgen_enum_GpuSamplerBindingType = ["filtering", "non-filtering", "comparison"];

const __wbindgen_enum_GpuStencilOperation = ["keep", "zero", "replace", "invert", "increment-clamp", "decrement-clamp", "increment-wrap", "decrement-wrap"];

const __wbindgen_enum_GpuStorageTextureAccess = ["write-only", "read-only", "read-write"];

const __wbindgen_enum_GpuStoreOp = ["store", "discard"];

const __wbindgen_enum_GpuTextureAspect = ["all", "stencil-only", "depth-only"];

const __wbindgen_enum_GpuTextureDimension = ["1d", "2d", "3d"];

const __wbindgen_enum_GpuTextureFormat = ["r8unorm", "r8snorm", "r8uint", "r8sint", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32uint", "r32sint", "r32float", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb9e5ufloat", "rgb10a2uint", "rgb10a2unorm", "rg11b10ufloat", "rg32uint", "rg32sint", "rg32float", "rgba16uint", "rgba16sint", "rgba16float", "rgba32uint", "rgba32sint", "rgba32float", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"];

const __wbindgen_enum_GpuTextureSampleType = ["float", "unfilterable-float", "depth", "sint", "uint"];

const __wbindgen_enum_GpuTextureViewDimension = ["1d", "2d", "2d-array", "cube", "cube-array", "3d"];

const __wbindgen_enum_GpuVertexFormat = ["uint8", "uint8x2", "uint8x4", "sint8", "sint8x2", "sint8x4", "unorm8", "unorm8x2", "unorm8x4", "snorm8", "snorm8x2", "snorm8x4", "uint16", "uint16x2", "uint16x4", "sint16", "sint16x2", "sint16x4", "unorm16", "unorm16x2", "unorm16x4", "snorm16", "snorm16x2", "snorm16x4", "float16", "float16x2", "float16x4", "float32", "float32x2", "float32x3", "float32x4", "uint32", "uint32x2", "uint32x3", "uint32x4", "sint32", "sint32x2", "sint32x3", "sint32x4", "unorm10-10-10-2", "unorm8x4-bgra"];

const __wbindgen_enum_GpuVertexStepMode = ["vertex", "instance"];

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
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
    imports.wbg.__wbg_Window_7b2011a6368164ef = function(arg0) {
        const ret = getObject(arg0).Window;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_WorkerGlobalScope_4bddbcb12b3f5a28 = function(arg0) {
        const ret = getObject(arg0).WorkerGlobalScope;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg___wbindgen_debug_string_df47ffb5e35e6763 = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_is_function_ee8a6c5833c90377 = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_null_5e69f72e906cc57c = function(arg0) {
        const ret = getObject(arg0) === null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_object_c818261d21f283a4 = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_string_fbb76cb2940daafd = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_2d472862bd29a478 = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_string_get_e4f06c90489ad01b = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_throw_b855445ff6a94295 = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg__wbg_cb_unref_2454a539ea5790d9 = function(arg0) {
        getObject(arg0)._wbg_cb_unref();
    };
    imports.wbg.__wbg_abort_e7eb059f72f9ed0c = function(arg0) {
        getObject(arg0).abort();
    };
    imports.wbg.__wbg_append_b577eb3a177bc0fa = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_arrayBuffer_b375eccb84b4ddf3 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_beginComputePass_8971ad8382254094 = function(arg0, arg1) {
        const ret = getObject(arg0).beginComputePass(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_beginRenderPass_599b98d9a6ba5692 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).beginRenderPass(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_buffer_ccc4520b36d3ccf4 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_525440f72fbfc0ea = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_e762c39fa8ea36bf = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_configure_bee5e0250d8526d5 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).configure(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_copyBufferToBuffer_3e2b8d1e524281f5 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).copyBufferToBuffer(getObject(arg1), arg2, getObject(arg3), arg4, arg5);
    }, arguments) };
    imports.wbg.__wbg_createBindGroupLayout_f543b79f894eed2e = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).createBindGroupLayout(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createBindGroup_06db01d96df151a7 = function(arg0, arg1) {
        const ret = getObject(arg0).createBindGroup(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createBuffer_6e69283608e8f98f = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).createBuffer(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createCommandEncoder_88e8ef64b19cdb2c = function(arg0, arg1) {
        const ret = getObject(arg0).createCommandEncoder(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createComputePipeline_d24ca7b211444394 = function(arg0, arg1) {
        const ret = getObject(arg0).createComputePipeline(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createPipelineLayout_0f960a922b66be56 = function(arg0, arg1) {
        const ret = getObject(arg0).createPipelineLayout(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createRenderPipeline_725209221f17f288 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).createRenderPipeline(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createSampler_36aca895fb724d8b = function(arg0, arg1) {
        const ret = getObject(arg0).createSampler(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createShaderModule_714b17aece65828e = function(arg0, arg1) {
        const ret = getObject(arg0).createShaderModule(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_63195fd0d63c3a24 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).createTexture(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createView_79f49fbd3fb5f94f = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).createView(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_574e78ad8b13b65f = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_debug_f4b0c59db649db48 = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_destroy_7602e890b930bb90 = function(arg0) {
        getObject(arg0).destroy();
    };
    imports.wbg.__wbg_devicePixelRatio_495c092455fdf6b1 = function(arg0) {
        const ret = getObject(arg0).devicePixelRatio;
        return ret;
    };
    imports.wbg.__wbg_dispatchWorkgroups_d63caaf66ad5bbb0 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).dispatchWorkgroups(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_document_725ae06eb442a6db = function(arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_done_2042aa2670fb1db1 = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_drawIndexed_c47b56e3bafadecb = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
    };
    imports.wbg.__wbg_end_8bb194afb9988691 = function(arg0) {
        getObject(arg0).end();
    };
    imports.wbg.__wbg_end_ae98f313507234ce = function(arg0) {
        getObject(arg0).end();
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_export4(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_error_a7f8fbb0523dae15 = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_features_5d2c2677affa352d = function(arg0) {
        const ret = getObject(arg0).features;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_f1856afdb49415d1 = function(arg0) {
        const ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_f8ba0e29a9d6de0d = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_finish_08e2d7b08c066b25 = function(arg0, arg1) {
        const ret = getObject(arg0).finish(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_finish_5ebfba3167b3092c = function(arg0) {
        const ret = getObject(arg0).finish();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getBindGroupLayout_2ffe3757a423ea39 = function(arg0, arg1) {
        const ret = getObject(arg0).getBindGroupLayout(arg1 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getContext_0b80ccb9547db509 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getContext_d1c8d1b1701886ce = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getCurrentTexture_6dc4d0ea8555e374 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).getCurrentTexture();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getElementById_c365dd703c4a88c3 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getMappedRange_3cb6354f7963e27e = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getMappedRange(arg1, arg2);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getPreferredCanvasFormat_06854455b835cf40 = function(arg0) {
        const ret = getObject(arg0).getPreferredCanvasFormat();
        return (__wbindgen_enum_GpuTextureFormat.indexOf(ret) + 1 || 96) - 1;
    };
    imports.wbg.__wbg_getRandomValues_b8f5dbd5f3995a9e = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_get_efcb449f58ec27c2 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_gpu_653e59c6ae8028a8 = function(arg0) {
        const ret = getObject(arg0).gpu;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_has_787fafc980c3ccdb = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_has_f1efef5b257eade8 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).has(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_headers_b87d7eaba61c3278 = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_height_119077665279308c = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_height_67375c629f709b75 = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_host_42828f818b9dc26c = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).host;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_href_6d02c53ff820b6ae = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).href;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_info_e674a11f4f50cc0c = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_instanceof_GpuAdapter_b2c1300e425af95c = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof GPUAdapter;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_GpuCanvasContext_c9b75b4b7dc7555e = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof GPUCanvasContext;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_HtmlCanvasElement_3e2e95b109dae976 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof HTMLCanvasElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Response_f4f3e87e07f3135c = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Response;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Window_4846dbb3de56c84c = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_iterator_e5822695327a3c39 = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_label_f279af9fe090b53f = function(arg0, arg1) {
        const ret = getObject(arg1).label;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_length_69bca3cb64fc8748 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_limits_486026e4aa69b9b2 = function(arg0) {
        const ret = getObject(arg0).limits;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_location_ef1665506d996dd9 = function(arg0) {
        const ret = getObject(arg0).location;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_log_8cec76766b8c0e33 = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_mapAsync_e89ffbd0722e6025 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).mapAsync(arg1 >>> 0, arg2, arg3);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_maxBindGroups_52e3144d1d4f3951 = function(arg0) {
        const ret = getObject(arg0).maxBindGroups;
        return ret;
    };
    imports.wbg.__wbg_maxBindingsPerBindGroup_8e383157db4cfd9d = function(arg0) {
        const ret = getObject(arg0).maxBindingsPerBindGroup;
        return ret;
    };
    imports.wbg.__wbg_maxBufferSize_4bed0deb2b5570bc = function(arg0) {
        const ret = getObject(arg0).maxBufferSize;
        return ret;
    };
    imports.wbg.__wbg_maxColorAttachmentBytesPerSample_2ded1d176129b49e = function(arg0) {
        const ret = getObject(arg0).maxColorAttachmentBytesPerSample;
        return ret;
    };
    imports.wbg.__wbg_maxColorAttachments_a363e1f84136b445 = function(arg0) {
        const ret = getObject(arg0).maxColorAttachments;
        return ret;
    };
    imports.wbg.__wbg_maxComputeInvocationsPerWorkgroup_8c8259a34a467300 = function(arg0) {
        const ret = getObject(arg0).maxComputeInvocationsPerWorkgroup;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeX_6a123a5258a37c70 = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupSizeX;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeY_212a6e863b315f06 = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupSizeY;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeZ_53a8c06a42e0daa4 = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupSizeZ;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupStorageSize_0940bd6b70d5ee03 = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupStorageSize;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupsPerDimension_155968404880d2bc = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupsPerDimension;
        return ret;
    };
    imports.wbg.__wbg_maxDynamicStorageBuffersPerPipelineLayout_7d88fb9026cd8af3 = function(arg0) {
        const ret = getObject(arg0).maxDynamicStorageBuffersPerPipelineLayout;
        return ret;
    };
    imports.wbg.__wbg_maxDynamicUniformBuffersPerPipelineLayout_146ac1a721fbca9b = function(arg0) {
        const ret = getObject(arg0).maxDynamicUniformBuffersPerPipelineLayout;
        return ret;
    };
    imports.wbg.__wbg_maxSampledTexturesPerShaderStage_10ee96b97a701e05 = function(arg0) {
        const ret = getObject(arg0).maxSampledTexturesPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxSamplersPerShaderStage_7546a712e69839d0 = function(arg0) {
        const ret = getObject(arg0).maxSamplersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxStorageBufferBindingSize_6f36ebfc9d4874d1 = function(arg0) {
        const ret = getObject(arg0).maxStorageBufferBindingSize;
        return ret;
    };
    imports.wbg.__wbg_maxStorageBuffersPerShaderStage_ad3988a66894ccd8 = function(arg0) {
        const ret = getObject(arg0).maxStorageBuffersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxStorageTexturesPerShaderStage_3c4b0fd6cdb25d2f = function(arg0) {
        const ret = getObject(arg0).maxStorageTexturesPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxTextureArrayLayers_596c959454186b7e = function(arg0) {
        const ret = getObject(arg0).maxTextureArrayLayers;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension1D_395c7225194787e6 = function(arg0) {
        const ret = getObject(arg0).maxTextureDimension1D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension2D_1c70c07372595733 = function(arg0) {
        const ret = getObject(arg0).maxTextureDimension2D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension3D_c2c0b973db2f7087 = function(arg0) {
        const ret = getObject(arg0).maxTextureDimension3D;
        return ret;
    };
    imports.wbg.__wbg_maxUniformBufferBindingSize_18e95cb371149021 = function(arg0) {
        const ret = getObject(arg0).maxUniformBufferBindingSize;
        return ret;
    };
    imports.wbg.__wbg_maxUniformBuffersPerShaderStage_e21721df6407d356 = function(arg0) {
        const ret = getObject(arg0).maxUniformBuffersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxVertexAttributes_3685d049fb4b9557 = function(arg0) {
        const ret = getObject(arg0).maxVertexAttributes;
        return ret;
    };
    imports.wbg.__wbg_maxVertexBufferArrayStride_799ce7d416969442 = function(arg0) {
        const ret = getObject(arg0).maxVertexBufferArrayStride;
        return ret;
    };
    imports.wbg.__wbg_maxVertexBuffers_9e36c1cf99fac3d6 = function(arg0) {
        const ret = getObject(arg0).maxVertexBuffers;
        return ret;
    };
    imports.wbg.__wbg_minStorageBufferOffsetAlignment_04598b6c2361de5d = function(arg0) {
        const ret = getObject(arg0).minStorageBufferOffsetAlignment;
        return ret;
    };
    imports.wbg.__wbg_minUniformBufferOffsetAlignment_0743900952f2cbce = function(arg0) {
        const ret = getObject(arg0).minUniformBufferOffsetAlignment;
        return ret;
    };
    imports.wbg.__wbg_msCrypto_a61aeb35a24c1329 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_navigator_971384882e8ea23a = function(arg0) {
        const ret = getObject(arg0).navigator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_navigator_ae06f1666ea7c968 = function(arg0) {
        const ret = getObject(arg0).navigator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_1acc0b6eea89d040 = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_2531773dac38ebb3 = function() { return handleError(function () {
        const ret = new AbortController();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_3c3d849046688a66 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wasm_bindgen_func_elem_965(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_new_5a79be3ab53b8aa5 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_9edf9838a2def39c = function() { return handleError(function () {
        const ret = new Headers();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_e17d9f43105b08be = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_from_slice_92f4d78ca282a2d2 = function(arg0, arg1) {
        const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_no_args_ee98eee5275000a4 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_byte_offset_and_length_46e3e6a5e9f9e89b = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_length_01aa0dc35aa13543 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_with_str_and_init_0ae7728b6ec367b1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_next_020810e0ae8ebcb0 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_next_2c826fe5dfec6b6a = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_905d3e251edff8a2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_onSubmittedWorkDone_babe5ab237e856ff = function(arg0) {
        const ret = getObject(arg0).onSubmittedWorkDone();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_dc0fbacc7c1c06f7 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_prototypesetcall_2a6620b6922694b2 = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
    };
    imports.wbg.__wbg_push_df81a39d04db858c = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_34d692c25c47d05b = function(arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_queueMicrotask_9d76cacb20c84d58 = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_queue_13a5c48e3c54a28c = function(arg0) {
        const ret = getObject(arg0).queue;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_ac0988aba3254290 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_requestAdapter_cc9a9924f72519ab = function(arg0, arg1) {
        const ret = getObject(arg0).requestAdapter(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestDevice_295504649d1da14c = function(arg0, arg1) {
        const ret = getObject(arg0).requestDevice(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_60cc747a6bc5215a = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_resolve_caf97c30b83f7053 = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_search_86f864580e97479d = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).search;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_setAttribute_9bad76f39609daac = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setBindGroup_9eb2f378626e78b7 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_setBindGroup_ae93a2ba8c665826 = function(arg0, arg1, arg2) {
        getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_setBindGroup_bf7233e51ee0fd56 = function(arg0, arg1, arg2) {
        getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_setIndexBuffer_d6851b016152211a = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setIndexBuffer(getObject(arg1), __wbindgen_enum_GpuIndexFormat[arg2], arg3, arg4);
    };
    imports.wbg.__wbg_setPipeline_6d9bb386aa5ee85f = function(arg0, arg1) {
        getObject(arg0).setPipeline(getObject(arg1));
    };
    imports.wbg.__wbg_setPipeline_b632e313f54b1cb1 = function(arg0, arg1) {
        getObject(arg0).setPipeline(getObject(arg1));
    };
    imports.wbg.__wbg_setVertexBuffer_c8234139ead62a61 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3, arg4);
    };
    imports.wbg.__wbg_setViewport_b25340c5cfc5e64f = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).setViewport(arg1, arg2, arg3, arg4, arg5, arg6);
    };
    imports.wbg.__wbg_set_46a5ad2992412cb5 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_set_a_e87a2053d5fccb4c = function(arg0, arg1) {
        getObject(arg0).a = arg1;
    };
    imports.wbg.__wbg_set_access_69d91e9d4e4ceac2 = function(arg0, arg1) {
        getObject(arg0).access = __wbindgen_enum_GpuStorageTextureAccess[arg1];
    };
    imports.wbg.__wbg_set_address_mode_u_17e91ba6701d7cdf = function(arg0, arg1) {
        getObject(arg0).addressModeU = __wbindgen_enum_GpuAddressMode[arg1];
    };
    imports.wbg.__wbg_set_address_mode_v_83cff33885b49fd0 = function(arg0, arg1) {
        getObject(arg0).addressModeV = __wbindgen_enum_GpuAddressMode[arg1];
    };
    imports.wbg.__wbg_set_address_mode_w_2445963d0feae757 = function(arg0, arg1) {
        getObject(arg0).addressModeW = __wbindgen_enum_GpuAddressMode[arg1];
    };
    imports.wbg.__wbg_set_alpha_a7a68e5ec04efe77 = function(arg0, arg1) {
        getObject(arg0).alpha = getObject(arg1);
    };
    imports.wbg.__wbg_set_alpha_mode_60f87267fa3d95d0 = function(arg0, arg1) {
        getObject(arg0).alphaMode = __wbindgen_enum_GpuCanvasAlphaMode[arg1];
    };
    imports.wbg.__wbg_set_alpha_to_coverage_enabled_67782b8fff854d06 = function(arg0, arg1) {
        getObject(arg0).alphaToCoverageEnabled = arg1 !== 0;
    };
    imports.wbg.__wbg_set_array_layer_count_2bd74e56899b603a = function(arg0, arg1) {
        getObject(arg0).arrayLayerCount = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_array_stride_acb85bd3848529a6 = function(arg0, arg1) {
        getObject(arg0).arrayStride = arg1;
    };
    imports.wbg.__wbg_set_aspect_82ca9caa27a4c533 = function(arg0, arg1) {
        getObject(arg0).aspect = __wbindgen_enum_GpuTextureAspect[arg1];
    };
    imports.wbg.__wbg_set_aspect_b78bd0b34ebfe19b = function(arg0, arg1) {
        getObject(arg0).aspect = __wbindgen_enum_GpuTextureAspect[arg1];
    };
    imports.wbg.__wbg_set_attributes_4d5de6c80e3a7e73 = function(arg0, arg1) {
        getObject(arg0).attributes = getObject(arg1);
    };
    imports.wbg.__wbg_set_b_87725d82ac69a631 = function(arg0, arg1) {
        getObject(arg0).b = arg1;
    };
    imports.wbg.__wbg_set_base_array_layer_064977086530f2e7 = function(arg0, arg1) {
        getObject(arg0).baseArrayLayer = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_base_mip_level_845abe28a57bd901 = function(arg0, arg1) {
        getObject(arg0).baseMipLevel = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_beginning_of_pass_write_index_1d1dcdf984952e54 = function(arg0, arg1) {
        getObject(arg0).beginningOfPassWriteIndex = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_bind_group_layouts_db65f9787380e242 = function(arg0, arg1) {
        getObject(arg0).bindGroupLayouts = getObject(arg1);
    };
    imports.wbg.__wbg_set_binding_35fa28beda49ff83 = function(arg0, arg1) {
        getObject(arg0).binding = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_binding_3b4abee15b11f6ec = function(arg0, arg1) {
        getObject(arg0).binding = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_blend_21337ec514ad2280 = function(arg0, arg1) {
        getObject(arg0).blend = getObject(arg1);
    };
    imports.wbg.__wbg_set_body_3c365989753d61f4 = function(arg0, arg1) {
        getObject(arg0).body = getObject(arg1);
    };
    imports.wbg.__wbg_set_buffer_a9223dfcc0e34853 = function(arg0, arg1) {
        getObject(arg0).buffer = getObject(arg1);
    };
    imports.wbg.__wbg_set_buffer_d49e95bb5349d827 = function(arg0, arg1) {
        getObject(arg0).buffer = getObject(arg1);
    };
    imports.wbg.__wbg_set_buffers_68609a5d48c31b27 = function(arg0, arg1) {
        getObject(arg0).buffers = getObject(arg1);
    };
    imports.wbg.__wbg_set_bytes_per_row_4a52bbf4cdbfe78b = function(arg0, arg1) {
        getObject(arg0).bytesPerRow = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_c2abbebe8b9ebee1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_clear_value_8fc3623594df71b2 = function(arg0, arg1) {
        getObject(arg0).clearValue = getObject(arg1);
    };
    imports.wbg.__wbg_set_code_20093e29960281f8 = function(arg0, arg1, arg2) {
        getObject(arg0).code = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_color_64a633bf7b4cf6fe = function(arg0, arg1) {
        getObject(arg0).color = getObject(arg1);
    };
    imports.wbg.__wbg_set_color_attachments_4d4c71d7eeba8e2f = function(arg0, arg1) {
        getObject(arg0).colorAttachments = getObject(arg1);
    };
    imports.wbg.__wbg_set_compare_f3fb77a9bf3f0f7e = function(arg0, arg1) {
        getObject(arg0).compare = __wbindgen_enum_GpuCompareFunction[arg1];
    };
    imports.wbg.__wbg_set_compute_937f4ee700e465ff = function(arg0, arg1) {
        getObject(arg0).compute = getObject(arg1);
    };
    imports.wbg.__wbg_set_count_8cf9a3dd1ffc7b7d = function(arg0, arg1) {
        getObject(arg0).count = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_credentials_f621cd2d85c0c228 = function(arg0, arg1) {
        getObject(arg0).credentials = __wbindgen_enum_RequestCredentials[arg1];
    };
    imports.wbg.__wbg_set_cull_mode_41c12526410d3e05 = function(arg0, arg1) {
        getObject(arg0).cullMode = __wbindgen_enum_GpuCullMode[arg1];
    };
    imports.wbg.__wbg_set_depth_bias_31554aeaaa675954 = function(arg0, arg1) {
        getObject(arg0).depthBias = arg1;
    };
    imports.wbg.__wbg_set_depth_bias_clamp_8cf5f4f0d80e8cba = function(arg0, arg1) {
        getObject(arg0).depthBiasClamp = arg1;
    };
    imports.wbg.__wbg_set_depth_bias_slope_scale_310ae406f2d3a055 = function(arg0, arg1) {
        getObject(arg0).depthBiasSlopeScale = arg1;
    };
    imports.wbg.__wbg_set_depth_clear_value_8760aafb583d5312 = function(arg0, arg1) {
        getObject(arg0).depthClearValue = arg1;
    };
    imports.wbg.__wbg_set_depth_compare_8831904ce3173063 = function(arg0, arg1) {
        getObject(arg0).depthCompare = __wbindgen_enum_GpuCompareFunction[arg1];
    };
    imports.wbg.__wbg_set_depth_fail_op_62ec602580477afc = function(arg0, arg1) {
        getObject(arg0).depthFailOp = __wbindgen_enum_GpuStencilOperation[arg1];
    };
    imports.wbg.__wbg_set_depth_load_op_102d57f3ddf95461 = function(arg0, arg1) {
        getObject(arg0).depthLoadOp = __wbindgen_enum_GpuLoadOp[arg1];
    };
    imports.wbg.__wbg_set_depth_or_array_layers_d7b93db07c5da69d = function(arg0, arg1) {
        getObject(arg0).depthOrArrayLayers = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_depth_read_only_aebc24a542debafd = function(arg0, arg1) {
        getObject(arg0).depthReadOnly = arg1 !== 0;
    };
    imports.wbg.__wbg_set_depth_stencil_5627e73aaf33912c = function(arg0, arg1) {
        getObject(arg0).depthStencil = getObject(arg1);
    };
    imports.wbg.__wbg_set_depth_stencil_attachment_04b936535778e362 = function(arg0, arg1) {
        getObject(arg0).depthStencilAttachment = getObject(arg1);
    };
    imports.wbg.__wbg_set_depth_store_op_610b0a50dbb00eb8 = function(arg0, arg1) {
        getObject(arg0).depthStoreOp = __wbindgen_enum_GpuStoreOp[arg1];
    };
    imports.wbg.__wbg_set_depth_write_enabled_f94217df9ff2d60c = function(arg0, arg1) {
        getObject(arg0).depthWriteEnabled = arg1 !== 0;
    };
    imports.wbg.__wbg_set_device_dab18ead7bfc077b = function(arg0, arg1) {
        getObject(arg0).device = getObject(arg1);
    };
    imports.wbg.__wbg_set_dimension_2a75a794a0bfcc94 = function(arg0, arg1) {
        getObject(arg0).dimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
    };
    imports.wbg.__wbg_set_dimension_a3c50fb6d43f6cec = function(arg0, arg1) {
        getObject(arg0).dimension = __wbindgen_enum_GpuTextureDimension[arg1];
    };
    imports.wbg.__wbg_set_dst_factor_cf872fec841747ac = function(arg0, arg1) {
        getObject(arg0).dstFactor = __wbindgen_enum_GpuBlendFactor[arg1];
    };
    imports.wbg.__wbg_set_end_of_pass_write_index_12c25e0a48d5aa5c = function(arg0, arg1) {
        getObject(arg0).endOfPassWriteIndex = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_entries_1472deaee7053fb7 = function(arg0, arg1) {
        getObject(arg0).entries = getObject(arg1);
    };
    imports.wbg.__wbg_set_entries_b2258b5ef29810b0 = function(arg0, arg1) {
        getObject(arg0).entries = getObject(arg1);
    };
    imports.wbg.__wbg_set_entry_point_11f912102ade99b1 = function(arg0, arg1, arg2) {
        getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_entry_point_7f546bbf1e63e58d = function(arg0, arg1, arg2) {
        getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_entry_point_f9224cdb29cbe5df = function(arg0, arg1, arg2) {
        getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_external_texture_613e4434100d63ee = function(arg0, arg1) {
        getObject(arg0).externalTexture = getObject(arg1);
    };
    imports.wbg.__wbg_set_fail_op_73a4e194f4bc914a = function(arg0, arg1) {
        getObject(arg0).failOp = __wbindgen_enum_GpuStencilOperation[arg1];
    };
    imports.wbg.__wbg_set_format_1670e760e18ac001 = function(arg0, arg1) {
        getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_2141a8a1fd36fb9c = function(arg0, arg1) {
        getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_25e4aacc74949e38 = function(arg0, arg1) {
        getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_3f7008e9e568f0fc = function(arg0, arg1) {
        getObject(arg0).format = __wbindgen_enum_GpuVertexFormat[arg1];
    };
    imports.wbg.__wbg_set_format_4a4fccdfc45bc409 = function(arg0, arg1) {
        getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_7696f8290da8a36b = function(arg0, arg1) {
        getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_format_974a01725f579c5d = function(arg0, arg1) {
        getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
    };
    imports.wbg.__wbg_set_fragment_f7ce64feaf1cd7dc = function(arg0, arg1) {
        getObject(arg0).fragment = getObject(arg1);
    };
    imports.wbg.__wbg_set_front_face_09e32557f8852301 = function(arg0, arg1) {
        getObject(arg0).frontFace = __wbindgen_enum_GpuFrontFace[arg1];
    };
    imports.wbg.__wbg_set_g_c31c959457596456 = function(arg0, arg1) {
        getObject(arg0).g = arg1;
    };
    imports.wbg.__wbg_set_has_dynamic_offset_fbc1bb343939ed0b = function(arg0, arg1) {
        getObject(arg0).hasDynamicOffset = arg1 !== 0;
    };
    imports.wbg.__wbg_set_headers_6926da238cd32ee4 = function(arg0, arg1) {
        getObject(arg0).headers = getObject(arg1);
    };
    imports.wbg.__wbg_set_height_05e78c661a8e6366 = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_height_710b87344b3d6748 = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_height_89110f48f7fd0817 = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_label_3b658d9ce970552c = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_48883f5f49e4ec47 = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_4bbbc289ddddebd7 = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_4f4264b0041180e2 = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_5b46e419b9e88c5e = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_95423cd2e1f4b5dd = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_c3fc0a66f4ecc82b = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_d0fd4d4810525bf2 = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_dc8df9969898889c = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_e3709fe3e82429b5 = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_label_fb5d28b3ba7af11f = function(arg0, arg1, arg2) {
        getObject(arg0).label = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_layout_170ec6b8aa37178f = function(arg0, arg1) {
        getObject(arg0).layout = getObject(arg1);
    };
    imports.wbg.__wbg_set_layout_7f76289be3294b4a = function(arg0, arg1) {
        getObject(arg0).layout = getObject(arg1);
    };
    imports.wbg.__wbg_set_layout_c20d48b352b24c1b = function(arg0, arg1) {
        getObject(arg0).layout = getObject(arg1);
    };
    imports.wbg.__wbg_set_load_op_c71d200e998908b0 = function(arg0, arg1) {
        getObject(arg0).loadOp = __wbindgen_enum_GpuLoadOp[arg1];
    };
    imports.wbg.__wbg_set_lod_max_clamp_aaac5daaecca96d4 = function(arg0, arg1) {
        getObject(arg0).lodMaxClamp = arg1;
    };
    imports.wbg.__wbg_set_lod_min_clamp_ed2162d4b198abba = function(arg0, arg1) {
        getObject(arg0).lodMinClamp = arg1;
    };
    imports.wbg.__wbg_set_mag_filter_c8a8c1218cd38da6 = function(arg0, arg1) {
        getObject(arg0).magFilter = __wbindgen_enum_GpuFilterMode[arg1];
    };
    imports.wbg.__wbg_set_mapped_at_creation_2d003ce549611385 = function(arg0, arg1) {
        getObject(arg0).mappedAtCreation = arg1 !== 0;
    };
    imports.wbg.__wbg_set_mask_a933ba2e61c7610a = function(arg0, arg1) {
        getObject(arg0).mask = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_max_anisotropy_fb4bae64cb5acf57 = function(arg0, arg1) {
        getObject(arg0).maxAnisotropy = arg1;
    };
    imports.wbg.__wbg_set_method_c02d8cbbe204ac2d = function(arg0, arg1, arg2) {
        getObject(arg0).method = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_min_binding_size_308360802ae7a9ba = function(arg0, arg1) {
        getObject(arg0).minBindingSize = arg1;
    };
    imports.wbg.__wbg_set_min_filter_2dafbdeb188fd817 = function(arg0, arg1) {
        getObject(arg0).minFilter = __wbindgen_enum_GpuFilterMode[arg1];
    };
    imports.wbg.__wbg_set_mip_level_babe1ff64201f0ea = function(arg0, arg1) {
        getObject(arg0).mipLevel = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_mip_level_count_cd3197411f4f2432 = function(arg0, arg1) {
        getObject(arg0).mipLevelCount = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_mip_level_count_fdc72450a94244ef = function(arg0, arg1) {
        getObject(arg0).mipLevelCount = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_mipmap_filter_79f552c459e63aa6 = function(arg0, arg1) {
        getObject(arg0).mipmapFilter = __wbindgen_enum_GpuMipmapFilterMode[arg1];
    };
    imports.wbg.__wbg_set_mode_52ef73cfa79639cb = function(arg0, arg1) {
        getObject(arg0).mode = __wbindgen_enum_RequestMode[arg1];
    };
    imports.wbg.__wbg_set_module_18d541838665d831 = function(arg0, arg1) {
        getObject(arg0).module = getObject(arg1);
    };
    imports.wbg.__wbg_set_module_20641353ebb28712 = function(arg0, arg1) {
        getObject(arg0).module = getObject(arg1);
    };
    imports.wbg.__wbg_set_module_6ece909be28666dd = function(arg0, arg1) {
        getObject(arg0).module = getObject(arg1);
    };
    imports.wbg.__wbg_set_multisample_e0f310ea9e40c2d9 = function(arg0, arg1) {
        getObject(arg0).multisample = getObject(arg1);
    };
    imports.wbg.__wbg_set_multisampled_cd50d8f6709cea1a = function(arg0, arg1) {
        getObject(arg0).multisampled = arg1 !== 0;
    };
    imports.wbg.__wbg_set_offset_2e78915f5d65d704 = function(arg0, arg1) {
        getObject(arg0).offset = arg1;
    };
    imports.wbg.__wbg_set_offset_405017033a936d89 = function(arg0, arg1) {
        getObject(arg0).offset = arg1;
    };
    imports.wbg.__wbg_set_offset_e7ce8b8eaaf46b95 = function(arg0, arg1) {
        getObject(arg0).offset = arg1;
    };
    imports.wbg.__wbg_set_operation_b96fabca3716aaa3 = function(arg0, arg1) {
        getObject(arg0).operation = __wbindgen_enum_GpuBlendOperation[arg1];
    };
    imports.wbg.__wbg_set_origin_c5f017d3f09ad7ff = function(arg0, arg1) {
        getObject(arg0).origin = getObject(arg1);
    };
    imports.wbg.__wbg_set_pass_op_765be90bb2f27220 = function(arg0, arg1) {
        getObject(arg0).passOp = __wbindgen_enum_GpuStencilOperation[arg1];
    };
    imports.wbg.__wbg_set_power_preference_39b347bf0d236ce6 = function(arg0, arg1) {
        getObject(arg0).powerPreference = __wbindgen_enum_GpuPowerPreference[arg1];
    };
    imports.wbg.__wbg_set_primitive_d6456d7efe6b4fe5 = function(arg0, arg1) {
        getObject(arg0).primitive = getObject(arg1);
    };
    imports.wbg.__wbg_set_query_set_3afc955600bc819a = function(arg0, arg1) {
        getObject(arg0).querySet = getObject(arg1);
    };
    imports.wbg.__wbg_set_r_07bd987697069496 = function(arg0, arg1) {
        getObject(arg0).r = arg1;
    };
    imports.wbg.__wbg_set_required_features_650c9e5dafbaa395 = function(arg0, arg1) {
        getObject(arg0).requiredFeatures = getObject(arg1);
    };
    imports.wbg.__wbg_set_resource_8cea0fe2c8745c3e = function(arg0, arg1) {
        getObject(arg0).resource = getObject(arg1);
    };
    imports.wbg.__wbg_set_rows_per_image_2f7969031c71f0d8 = function(arg0, arg1) {
        getObject(arg0).rowsPerImage = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_sample_count_07aedd28692aeae8 = function(arg0, arg1) {
        getObject(arg0).sampleCount = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_sample_type_601a744a4bd6ea07 = function(arg0, arg1) {
        getObject(arg0).sampleType = __wbindgen_enum_GpuTextureSampleType[arg1];
    };
    imports.wbg.__wbg_set_sampler_1a2729c0aa194081 = function(arg0, arg1) {
        getObject(arg0).sampler = getObject(arg1);
    };
    imports.wbg.__wbg_set_shader_location_bdcfdc1009d351b1 = function(arg0, arg1) {
        getObject(arg0).shaderLocation = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_signal_dda2cf7ccb6bee0f = function(arg0, arg1) {
        getObject(arg0).signal = getObject(arg1);
    };
    imports.wbg.__wbg_set_size_7a392ee585f87da8 = function(arg0, arg1) {
        getObject(arg0).size = arg1;
    };
    imports.wbg.__wbg_set_size_c6bf409f70f4420f = function(arg0, arg1) {
        getObject(arg0).size = getObject(arg1);
    };
    imports.wbg.__wbg_set_size_f902b266d636bf6e = function(arg0, arg1) {
        getObject(arg0).size = arg1;
    };
    imports.wbg.__wbg_set_src_factor_50cef27aa8aece91 = function(arg0, arg1) {
        getObject(arg0).srcFactor = __wbindgen_enum_GpuBlendFactor[arg1];
    };
    imports.wbg.__wbg_set_stencil_back_e740415a5c0b637a = function(arg0, arg1) {
        getObject(arg0).stencilBack = getObject(arg1);
    };
    imports.wbg.__wbg_set_stencil_front_03185e1c3bafa411 = function(arg0, arg1) {
        getObject(arg0).stencilFront = getObject(arg1);
    };
    imports.wbg.__wbg_set_stencil_read_mask_e2736fc4af9399e4 = function(arg0, arg1) {
        getObject(arg0).stencilReadMask = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_stencil_read_only_31f3d99299373c12 = function(arg0, arg1) {
        getObject(arg0).stencilReadOnly = arg1 !== 0;
    };
    imports.wbg.__wbg_set_stencil_write_mask_b1d3e1655305a187 = function(arg0, arg1) {
        getObject(arg0).stencilWriteMask = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_step_mode_98e49f7877daf1c5 = function(arg0, arg1) {
        getObject(arg0).stepMode = __wbindgen_enum_GpuVertexStepMode[arg1];
    };
    imports.wbg.__wbg_set_storage_texture_6ee0cbeb50698110 = function(arg0, arg1) {
        getObject(arg0).storageTexture = getObject(arg1);
    };
    imports.wbg.__wbg_set_store_op_e761080d541a10cc = function(arg0, arg1) {
        getObject(arg0).storeOp = __wbindgen_enum_GpuStoreOp[arg1];
    };
    imports.wbg.__wbg_set_strip_index_format_16df9e33c7aa97e6 = function(arg0, arg1) {
        getObject(arg0).stripIndexFormat = __wbindgen_enum_GpuIndexFormat[arg1];
    };
    imports.wbg.__wbg_set_targets_9fd1ec0b8edc895c = function(arg0, arg1) {
        getObject(arg0).targets = getObject(arg1);
    };
    imports.wbg.__wbg_set_texture_f03807916f70dcc6 = function(arg0, arg1) {
        getObject(arg0).texture = getObject(arg1);
    };
    imports.wbg.__wbg_set_texture_f8ae0bb4bb159354 = function(arg0, arg1) {
        getObject(arg0).texture = getObject(arg1);
    };
    imports.wbg.__wbg_set_timestamp_writes_de925214f236e575 = function(arg0, arg1) {
        getObject(arg0).timestampWrites = getObject(arg1);
    };
    imports.wbg.__wbg_set_topology_036632318a24227d = function(arg0, arg1) {
        getObject(arg0).topology = __wbindgen_enum_GpuPrimitiveTopology[arg1];
    };
    imports.wbg.__wbg_set_type_0cb4cdb5eff87f31 = function(arg0, arg1) {
        getObject(arg0).type = __wbindgen_enum_GpuBufferBindingType[arg1];
    };
    imports.wbg.__wbg_set_type_d05fa8415ad0761f = function(arg0, arg1) {
        getObject(arg0).type = __wbindgen_enum_GpuSamplerBindingType[arg1];
    };
    imports.wbg.__wbg_set_unclipped_depth_17a5ab83d4e7cadc = function(arg0, arg1) {
        getObject(arg0).unclippedDepth = arg1 !== 0;
    };
    imports.wbg.__wbg_set_usage_3d569e7b02227032 = function(arg0, arg1) {
        getObject(arg0).usage = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_usage_ac222ece73f994b7 = function(arg0, arg1) {
        getObject(arg0).usage = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_usage_ca00520767c8a475 = function(arg0, arg1) {
        getObject(arg0).usage = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_usage_fe13088353b65bee = function(arg0, arg1) {
        getObject(arg0).usage = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_vertex_76b7ac4bdfbb06f4 = function(arg0, arg1) {
        getObject(arg0).vertex = getObject(arg1);
    };
    imports.wbg.__wbg_set_view_1ef41eeb26eaf718 = function(arg0, arg1) {
        getObject(arg0).view = getObject(arg1);
    };
    imports.wbg.__wbg_set_view_46b654a12649c6f6 = function(arg0, arg1) {
        getObject(arg0).view = getObject(arg1);
    };
    imports.wbg.__wbg_set_view_dimension_12c332494a2697dc = function(arg0, arg1) {
        getObject(arg0).viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
    };
    imports.wbg.__wbg_set_view_dimension_31b9fd7126132e82 = function(arg0, arg1) {
        getObject(arg0).viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
    };
    imports.wbg.__wbg_set_view_formats_152cb995add2ee4e = function(arg0, arg1) {
        getObject(arg0).viewFormats = getObject(arg1);
    };
    imports.wbg.__wbg_set_view_formats_cc77650da6c3b25b = function(arg0, arg1) {
        getObject(arg0).viewFormats = getObject(arg1);
    };
    imports.wbg.__wbg_set_visibility_6d1fc94552f22ac3 = function(arg0, arg1) {
        getObject(arg0).visibility = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_width_39f67bbfbb9437ba = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_width_5ee1e2d4a0fd929b = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_width_dcc02c61dd01cff6 = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_write_mask_c92743022356850e = function(arg0, arg1) {
        getObject(arg0).writeMask = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_x_0771b0f86d56cdf9 = function(arg0, arg1) {
        getObject(arg0).x = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_y_668d1578881576dd = function(arg0, arg1) {
        getObject(arg0).y = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_z_3e24a918a76c816d = function(arg0, arg1) {
        getObject(arg0).z = arg1 >>> 0;
    };
    imports.wbg.__wbg_signal_4db5aa055bf9eb9a = function(arg0) {
        const ret = getObject(arg0).signal;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_89e1d9ac6a1b250e = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_8b530f326a9e48ac = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_6fdf4b64710cc91b = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_b45bfc5a37f6cfa2 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_status_de7eed5a7a5bfd5d = function(arg0) {
        const ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_stringify_b5fb28f6465d9c3e = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_subarray_480600f3d6a9f26c = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_submit_a1850a1cb6baf64a = function(arg0, arg1) {
        getObject(arg0).submit(getObject(arg1));
    };
    imports.wbg.__wbg_then_4f46f6544e6b4a28 = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_70d05cf780a18d77 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_unmap_ab94ab04cfb14bee = function(arg0) {
        getObject(arg0).unmap();
    };
    imports.wbg.__wbg_url_b36d2a5008eb056f = function(arg0, arg1) {
        const ret = getObject(arg1).url;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_value_692627309814bb8c = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c01dfd4722a88165 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_warn_1d74dddbe2fd1dbb = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_width_090e6b3d1ff9ccc4 = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_width_9ea2df52b5d2c909 = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_writeBuffer_b203cf79b98d6dd8 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).writeBuffer(getObject(arg1), arg2, getObject(arg3), arg4, arg5);
    }, arguments) };
    imports.wbg.__wbg_writeTexture_0466bf7d7d35e04e = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).writeTexture(getObject(arg1), getObject(arg2), getObject(arg3), getObject(arg4));
    }, arguments) };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_4625c577ab2ec9ee = function(arg0) {
        // Cast intrinsic for `U64 -> Externref`.
        const ret = BigInt.asUintN(64, arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_5f9a13552260be22 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 112, function: Function { arguments: [Externref], shim_idx: 113, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.__wasm_bindgen_func_elem_1638, __wasm_bindgen_func_elem_1639);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_cb9088102bce6b30 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
        const ret = getArrayU8FromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
        // Cast intrinsic for `F64 -> Externref`.
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };

    return imports;
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
        module_or_path = new URL('wgpu-in-web_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
