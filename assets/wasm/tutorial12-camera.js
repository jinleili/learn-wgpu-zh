let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

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

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

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
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

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
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
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
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_32(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h2314aacd36b40afc(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_37(arg0, arg1, arg2, arg3) {
    wasm._dyn_core__ops__function__FnMut__A_B___Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7cb4ef7188c5240d(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

function __wbg_adapter_40(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hc9b6a8454d92c480(arg0, arg1);
}

function __wbg_adapter_49(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures__invoke0_mut__h015cc250d60b4f94(arg0, arg1);
}

function __wbg_adapter_52(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h0323ec2069092e26(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_65(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h0e1202d4b6149428(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_70(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h03d948732fc33d60(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedFloat32Memory0 = null;

function getFloat32Memory0() {
    if (cachedFloat32Memory0 === null || cachedFloat32Memory0.byteLength === 0) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

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
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_prototypecallcall_88f23b562aa53af9 = function() { return handleError(function (arg0) {
        Function.prototype.call.call(getObject(arg0));
    }, arguments) };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_crypto_d05b68a3572bb8ca = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_process_b02b3570280d0366 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_c1cb42213cedf0f5 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_43b1089f407e4ec2 = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_msCrypto_10fc94afee92bd76 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_9a7e0f667ead4995 = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_randomFillSync_b70ccbdf4926a99d = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_7e42b4fb8779dc6d = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_fetch_6a2624d7f767e331 = function(arg0) {
        const ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
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
    imports.wbg.__wbg_offsetX_2a15015b9df991ec = function(arg0) {
        const ret = getObject(arg0).offsetX;
        return ret;
    };
    imports.wbg.__wbg_offsetY_f4992c922228f662 = function(arg0) {
        const ret = getObject(arg0).offsetY;
        return ret;
    };
    imports.wbg.__wbg_webkitRequestFullscreen_db1af6d8d06ed38d = function(arg0) {
        getObject(arg0).webkitRequestFullscreen();
    };
    imports.wbg.__wbg_getCoalescedEvents_806e5358e1f3130b = function(arg0) {
        const ret = getObject(arg0).getCoalescedEvents;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_onpointerrawupdate_2641d497db2638e4 = function(arg0) {
        const ret = getObject(arg0).onpointerrawupdate;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestFullscreen_7a35806115b07885 = function(arg0) {
        const ret = getObject(arg0).requestFullscreen();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestFullscreen_5a116c6464189b61 = function(arg0) {
        const ret = getObject(arg0).requestFullscreen;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestIdleCallback_f8f727e4ca7842d0 = function(arg0) {
        const ret = getObject(arg0).requestIdleCallback;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_scheduler_c3c850461f2d7b5f = function(arg0) {
        const ret = getObject(arg0).scheduler;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_scheduler_181be421fd0b2855 = function(arg0) {
        const ret = getObject(arg0).scheduler;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_postTask_319d3986858dc461 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).postTask(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_prototype_d761fd8c272c3aee = function() {
        const ret = ResizeObserverEntry.prototype;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_webkitFullscreenElement_3a363126a251fcd9 = function(arg0) {
        const ret = getObject(arg0).webkitFullscreenElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_Window_c0d141cc7e9b1f6d = function(arg0) {
        const ret = getObject(arg0).Window;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_performance_eeefc685c9bc38b4 = function(arg0) {
        const ret = getObject(arg0).performance;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_e0d8ec93dd25766a = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_Window_d68c5e018b0c315e = function(arg0) {
        const ret = getObject(arg0).Window;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_WorkerGlobalScope_5126972547810178 = function(arg0) {
        const ret = getObject(arg0).WorkerGlobalScope;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_queueMicrotask_118eeb525d584d9a = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_queueMicrotask_26a89c14c53809c0 = function(arg0) {
        const ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_instanceof_WebGl2RenderingContext_92adf5bbd2568b71 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WebGL2RenderingContext;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_beginQuery_ad59d7ffda61cf9e = function(arg0, arg1, arg2) {
        getObject(arg0).beginQuery(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindBufferRange_bfdd227c2d5515af = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).bindBufferRange(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
    };
    imports.wbg.__wbg_bindSampler_12a1965a2db071ed = function(arg0, arg1, arg2) {
        getObject(arg0).bindSampler(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindVertexArray_2a70aed123353597 = function(arg0, arg1) {
        getObject(arg0).bindVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_blitFramebuffer_8ca764978b2e3b3f = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        getObject(arg0).blitFramebuffer(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0);
    };
    imports.wbg.__wbg_bufferData_6c5edae24f952d4d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferData_eab63186e3e72d98 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferSubData_3b75566851019327 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
    };
    imports.wbg.__wbg_clearBufferiv_07046f3c028ef141 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearBufferiv(arg1 >>> 0, arg2, getArrayI32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_clearBufferuiv_d0ebea28b39eb980 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearBufferuiv(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_clientWaitSync_b3f79a980d4d9498 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).clientWaitSync(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_compressedTexSubImage2D_1194f18adf8859b9 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8, arg9);
    };
    imports.wbg.__wbg_compressedTexSubImage2D_41270fc03b157293 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
    };
    imports.wbg.__wbg_compressedTexSubImage3D_34cd53cffc6add9c = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10, arg11);
    };
    imports.wbg.__wbg_compressedTexSubImage3D_f0da020d6e3e3791 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, getObject(arg10));
    };
    imports.wbg.__wbg_copyBufferSubData_70becf455ca484cd = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).copyBufferSubData(arg1 >>> 0, arg2 >>> 0, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_copyTexSubImage3D_f385cc4e05c95e64 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).copyTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
    };
    imports.wbg.__wbg_createQuery_dca7163929abd29d = function(arg0) {
        const ret = getObject(arg0).createQuery();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createSampler_e2bcf2bc717a1cad = function(arg0) {
        const ret = getObject(arg0).createSampler();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createVertexArray_761ba22fc5da3ad7 = function(arg0) {
        const ret = getObject(arg0).createVertexArray();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteQuery_3524b489c741d48f = function(arg0, arg1) {
        getObject(arg0).deleteQuery(getObject(arg1));
    };
    imports.wbg.__wbg_deleteSampler_f760c2bdc7a3d881 = function(arg0, arg1) {
        getObject(arg0).deleteSampler(getObject(arg1));
    };
    imports.wbg.__wbg_deleteSync_6bff1584a3aae6a1 = function(arg0, arg1) {
        getObject(arg0).deleteSync(getObject(arg1));
    };
    imports.wbg.__wbg_deleteVertexArray_26631f33de66bdfd = function(arg0, arg1) {
        getObject(arg0).deleteVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_drawArraysInstanced_b0963fae97f2f14e = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_drawBuffers_117fa4691357b53d = function(arg0, arg1) {
        getObject(arg0).drawBuffers(getObject(arg1));
    };
    imports.wbg.__wbg_drawElementsInstanced_19c02c2c6c7ebdd5 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawElementsInstanced(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_endQuery_feb28d278e32cfae = function(arg0, arg1) {
        getObject(arg0).endQuery(arg1 >>> 0);
    };
    imports.wbg.__wbg_fenceSync_452ae6f3789bdc77 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).fenceSync(arg1 >>> 0, arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_framebufferTextureLayer_5fdc631245f13684 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTextureLayer(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
    };
    imports.wbg.__wbg_getBufferSubData_42fbdf01d4c31560 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).getBufferSubData(arg1 >>> 0, arg2, getObject(arg3));
    };
    imports.wbg.__wbg_getIndexedParameter_69fe97ab84f9db9b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getIndexedParameter(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getQueryParameter_112c9a3c8a8dd0da = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getQueryParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getSyncParameter_0c83093c52867612 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getSyncParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformBlockIndex_b9628e75250e866c = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformBlockIndex(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return ret;
    };
    imports.wbg.__wbg_invalidateFramebuffer_2d3e8a1b99fd845c = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).invalidateFramebuffer(arg1 >>> 0, getObject(arg2));
    }, arguments) };
    imports.wbg.__wbg_readBuffer_4c16fe804e5fd30c = function(arg0, arg1) {
        getObject(arg0).readBuffer(arg1 >>> 0);
    };
    imports.wbg.__wbg_readPixels_c1a5f8a1344005bd = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    }, arguments) };
    imports.wbg.__wbg_readPixels_8260b74d4439418e = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7);
    }, arguments) };
    imports.wbg.__wbg_renderbufferStorageMultisample_c5f884a4faf6330a = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).renderbufferStorageMultisample(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_samplerParameterf_a15f79d315dcfc5d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).samplerParameterf(getObject(arg1), arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_samplerParameteri_6f5c08b9c98433e9 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).samplerParameteri(getObject(arg1), arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_texImage2D_1159b898accc2807 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texImage3D_8387d089d2edabd3 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        getObject(arg0).texImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8 >>> 0, arg9 >>> 0, getObject(arg10));
    }, arguments) };
    imports.wbg.__wbg_texStorage2D_b46c4dcaa6dc9638 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).texStorage2D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_texStorage3D_521eded8d8da33a6 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).texStorage3D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5, arg6);
    };
    imports.wbg.__wbg_texSubImage2D_33018bcf2de70890 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_b97aa5ddc0162314 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_cbc346dc5a210f5d = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_ad0af504139d876c = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_4d372d780fc0e4a7 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage3D_5884c8e282839ff9 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
    }, arguments) };
    imports.wbg.__wbg_texSubImage3D_d98b6d6d4c3f3d01 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
    }, arguments) };
    imports.wbg.__wbg_texSubImage3D_a8f081c484f78039 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
    }, arguments) };
    imports.wbg.__wbg_texSubImage3D_e36d3c30ac0d0749 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
    }, arguments) };
    imports.wbg.__wbg_texSubImage3D_2742ec6099cae3fc = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
    }, arguments) };
    imports.wbg.__wbg_uniform1ui_c80628cb3caeb621 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1ui(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_uniform2fv_a079de4d57adc89f = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform2iv_fcef57681e7795f1 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform2uiv_71554e4167cdd33e = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform3fv_0211c4807ed5b6bb = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform3iv_da537ca1568e83fe = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform3iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform3uiv_428937cb43fae771 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform3uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform4fv_5134ae6d977cd056 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform4iv_eaebe8f50f18f893 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform4iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform4uiv_16e6176d8af58a26 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform4uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniformBlockBinding_bcbb7fbc2fe88b8d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniformBlockBinding(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_uniformMatrix2fv_1c4f6d47a69eddf2 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix2x3fv_b020ec69dab7967a = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix2x3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix2x4fv_95bdc38e1581b61c = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix2x4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix3fv_5b337adcad4a038d = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix3x2fv_9fb4b6d3e6773824 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix3x2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix3x4fv_0fa64821be97c8f2 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix3x4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix4fv_10075e61e88aea3b = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix4x2fv_b40bad492503453e = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix4x2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix4x3fv_2571917be5ea974c = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix4x3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_vertexAttribDivisor_aad38a21841ace46 = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_vertexAttribIPointer_24c9254053dd8ab4 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).vertexAttribIPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_activeTexture_02d56293bce2f613 = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_attachShader_70c3f88b777a0a54 = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_bindAttribLocation_ff0dc5b546d9c8b0 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).bindAttribLocation(getObject(arg1), arg2 >>> 0, getStringFromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_bindBuffer_ac939bcab5249160 = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindFramebuffer_0b8b88d70f0b876e = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindRenderbuffer_f06f73fc0b43967e = function(arg0, arg1, arg2) {
        getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindTexture_e28115f3ea3da6d2 = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_blendColor_4416443539cdef95 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_blendEquation_1c7272d8e9e0ce11 = function(arg0, arg1) {
        getObject(arg0).blendEquation(arg1 >>> 0);
    };
    imports.wbg.__wbg_blendEquationSeparate_457e81472270e23c = function(arg0, arg1, arg2) {
        getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFunc_ac53b0d3a97b7f7f = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFuncSeparate_b6a96b8e26e75171 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_clear_40335e7899ec7759 = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__wbg_clearColor_b48ee3ca810de959 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_clearDepth_3777869cc4be970c = function(arg0, arg1) {
        getObject(arg0).clearDepth(arg1);
    };
    imports.wbg.__wbg_clearStencil_49cd65640cc9d1d9 = function(arg0, arg1) {
        getObject(arg0).clearStencil(arg1);
    };
    imports.wbg.__wbg_colorMask_743f2bbb6e3fb4e5 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_compileShader_bdfb3d5a3ad59498 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_copyTexSubImage2D_6e2fe88bb9fa3ffd = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
    };
    imports.wbg.__wbg_createBuffer_a95c59cc2c1750e7 = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createFramebuffer_52e5d7327d5afba3 = function(arg0) {
        const ret = getObject(arg0).createFramebuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_0a7670ed33f06d97 = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createRenderbuffer_881be806709189a9 = function(arg0) {
        const ret = getObject(arg0).createRenderbuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_119ffcdb1667f405 = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_4f0c3c77df4bde11 = function(arg0) {
        const ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_cullFace_68b06ff8967b93f3 = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_deleteBuffer_b8aaa61f9bb13617 = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteFramebuffer_d6907809466bdbdb = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteProgram_d90e44574acb8018 = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_deleteRenderbuffer_1c4b186beb91d4a5 = function(arg0, arg1) {
        getObject(arg0).deleteRenderbuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteShader_5ec1e25476df2da0 = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_554c30847d340929 = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_depthFunc_e49f522acf6c6c2d = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__wbg_depthMask_052a5e3afe45b590 = function(arg0, arg1) {
        getObject(arg0).depthMask(arg1 !== 0);
    };
    imports.wbg.__wbg_depthRange_8309e031492fd023 = function(arg0, arg1, arg2) {
        getObject(arg0).depthRange(arg1, arg2);
    };
    imports.wbg.__wbg_disable_f68719f70ddfb5b8 = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__wbg_disableVertexAttribArray_557393d91e187e24 = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_drawArrays_2f37c32534dffd91 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_enable_6dab9d5278ba15e2 = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_c2bfb733e87824c8 = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_framebufferRenderbuffer_564b54a213de82b7 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
    };
    imports.wbg.__wbg_framebufferTexture2D_e7783c0015d1135a = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__wbg_frontFace_271693c85383f2e8 = function(arg0, arg1) {
        getObject(arg0).frontFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_getExtension_25430e0ed157fcf8 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getParameter_b282105ca8420119 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getParameter(arg1 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getProgramInfoLog_110f43b4125782e9 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_getProgramParameter_22b3f1c8d913cd2c = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_562b1447e7c24866 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_getShaderParameter_58d3b34afa9db13b = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getSupportedExtensions_1a007030d26efba5 = function(arg0) {
        const ret = getObject(arg0).getSupportedExtensions();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_7b435a76db4f3128 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_linkProgram_e170ffe0b8242136 = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_pixelStorei_6be3fc7114b690b8 = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_polygonOffset_0f2730043ba169b2 = function(arg0, arg1, arg2) {
        getObject(arg0).polygonOffset(arg1, arg2);
    };
    imports.wbg.__wbg_renderbufferStorage_5a63960c0bb41916 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
    };
    imports.wbg.__wbg_scissor_27cb154cc9864444 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_shaderSource_e12efd3a2bf3413d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_stencilFuncSeparate_e6b4c784aa470ba1 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_4093c371489c5e3e = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilMaskSeparate_6a90a6801f96c33e = function(arg0, arg1, arg2) {
        getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_stencilOpSeparate_f98bb31212170061 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_texParameteri_f5c0d085b77931dd = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_uniform1f_b13c736354a10aa7 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1f(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform1i_1fd90743f7b78faa = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform4f_5b57101145ac6da8 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_useProgram_53de6b084c4780ce = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_vertexAttribPointer_3133080603a92d4c = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_viewport_afd5166081d009b2 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_instanceof_Window_99dc9805eaa2614b = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_document_5257b70811e953c0 = function(arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_location_0f233324e8e8c699 = function(arg0) {
        const ret = getObject(arg0).location;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_navigator_910cca0226b70083 = function(arg0) {
        const ret = getObject(arg0).navigator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_devicePixelRatio_93bac98af723c7ba = function(arg0) {
        const ret = getObject(arg0).devicePixelRatio;
        return ret;
    };
    imports.wbg.__wbg_cancelIdleCallback_997859437f81670c = function(arg0, arg1) {
        getObject(arg0).cancelIdleCallback(arg1 >>> 0);
    };
    imports.wbg.__wbg_getComputedStyle_6c29e44f9905911b = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getComputedStyle(getObject(arg1));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_matchMedia_fed5c8e73cf148cf = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_requestIdleCallback_fb28f525ab20b96a = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).requestIdleCallback(getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_cancelAnimationFrame_2635bb6bdb94eb3f = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).cancelAnimationFrame(arg1);
    }, arguments) };
    imports.wbg.__wbg_requestAnimationFrame_1820a8e6b645ec5a = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_clearTimeout_cf250b4eed087f7b = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbg_setTimeout_022e0626b26fb37c = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).setTimeout(getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_bd20251bb242e262 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_clientWidth_63a18f3f1c0d50b9 = function(arg0) {
        const ret = getObject(arg0).clientWidth;
        return ret;
    };
    imports.wbg.__wbg_setAttribute_0918ea45d5a1c663 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setPointerCapture_02adb3c41a2a5367 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).setPointerCapture(arg1);
    }, arguments) };
    imports.wbg.__wbg_body_3eb73da919b867a1 = function(arg0) {
        const ret = getObject(arg0).body;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_visibilityState_acae3352a32a6e08 = function(arg0) {
        const ret = getObject(arg0).visibilityState;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_activeElement_552aa1722725dcf5 = function(arg0) {
        const ret = getObject(arg0).activeElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_fullscreenElement_8ebe202aecd8ae3c = function(arg0) {
        const ret = getObject(arg0).fullscreenElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createElement_1a136faad4101f43 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getElementById_00904c7c4a32c23b = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_querySelector_d86f889797c65e88 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).querySelector(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_querySelectorAll_33a699392b92fa52 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).querySelectorAll(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_label_62fc8b2640e76288 = function(arg0, arg1) {
        const ret = getObject(arg1).label;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_beginComputePass_c3ab9edae2d2f5cb = function(arg0, arg1) {
        const ret = getObject(arg0).beginComputePass(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_beginRenderPass_4b510467cc2bed1e = function(arg0, arg1) {
        const ret = getObject(arg0).beginRenderPass(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_clearBuffer_45931d7b3606b414 = function(arg0, arg1, arg2) {
        getObject(arg0).clearBuffer(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_clearBuffer_d3b550e6f5021d56 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).clearBuffer(getObject(arg1), arg2, arg3);
    };
    imports.wbg.__wbg_copyBufferToBuffer_70c47f4a52b20eb2 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).copyBufferToBuffer(getObject(arg1), arg2, getObject(arg3), arg4, arg5);
    };
    imports.wbg.__wbg_copyBufferToTexture_35a1789183ba6e31 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).copyBufferToTexture(getObject(arg1), getObject(arg2), getObject(arg3));
    };
    imports.wbg.__wbg_copyTextureToBuffer_6c285ef0d703a212 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).copyTextureToBuffer(getObject(arg1), getObject(arg2), getObject(arg3));
    };
    imports.wbg.__wbg_copyTextureToTexture_3e6f420850ed0927 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).copyTextureToTexture(getObject(arg1), getObject(arg2), getObject(arg3));
    };
    imports.wbg.__wbg_finish_781798a8b816da67 = function(arg0) {
        const ret = getObject(arg0).finish();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_finish_b2a319f5baa28b8c = function(arg0, arg1) {
        const ret = getObject(arg0).finish(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_resolveQuerySet_408873f60f6db21b = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).resolveQuerySet(getObject(arg1), arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5 >>> 0);
    };
    imports.wbg.__wbg_writeTimestamp_a36ba108891c9491 = function(arg0, arg1, arg2) {
        getObject(arg0).writeTimestamp(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_width_05e7fce75535d85f = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_height_51b9308e888df865 = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_getPreferredCanvasFormat_9a0ed03609985baf = function(arg0) {
        const ret = getObject(arg0).getPreferredCanvasFormat();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestAdapter_3148ca06e5f49220 = function(arg0, arg1) {
        const ret = getObject(arg0).requestAdapter(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_message_82afe03eb0727f72 = function(arg0, arg1) {
        const ret = getObject(arg1).message;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_finish_2801faabbdf2b58e = function(arg0) {
        const ret = getObject(arg0).finish();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_finish_23538fe2e3c33735 = function(arg0, arg1) {
        const ret = getObject(arg0).finish(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setBindGroup_84204517309a90c1 = function(arg0, arg1, arg2) {
        getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_setBindGroup_b6175d3dfd53c33e = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
    };
    imports.wbg.__wbg_draw_83dd69ea6985925d = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_drawIndexed_f83aee37f0a56275 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
    };
    imports.wbg.__wbg_drawIndexedIndirect_8202886191987d03 = function(arg0, arg1, arg2) {
        getObject(arg0).drawIndexedIndirect(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_drawIndirect_83f751db9b4c3432 = function(arg0, arg1, arg2) {
        getObject(arg0).drawIndirect(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_setIndexBuffer_90dff62f91a7d920 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).setIndexBuffer(getObject(arg1), takeObject(arg2), arg3);
    };
    imports.wbg.__wbg_setIndexBuffer_ff247870d20e1e85 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setIndexBuffer(getObject(arg1), takeObject(arg2), arg3, arg4);
    };
    imports.wbg.__wbg_setPipeline_75eae611ba07586e = function(arg0, arg1) {
        getObject(arg0).setPipeline(getObject(arg1));
    };
    imports.wbg.__wbg_setVertexBuffer_7520714946954a0d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3);
    };
    imports.wbg.__wbg_setVertexBuffer_59cec08455e3ed32 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3, arg4);
    };
    imports.wbg.__wbg_new_a979e9eedc5e81a3 = function() { return handleError(function () {
        const ret = new Headers();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_append_047382169b61373d = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_contentRect_486b07f866c91a66 = function(arg0) {
        const ret = getObject(arg0).contentRect;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_devicePixelContentBoxSize_5f65d6c2bd58062b = function(arg0) {
        const ret = getObject(arg0).devicePixelContentBoxSize;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_size_46ceb9880b256326 = function(arg0) {
        const ret = getObject(arg0).size;
        return ret;
    };
    imports.wbg.__wbg_usage_ae2c303ddc8ee565 = function(arg0) {
        const ret = getObject(arg0).usage;
        return ret;
    };
    imports.wbg.__wbg_destroy_dd1ba40668e0b672 = function(arg0) {
        getObject(arg0).destroy();
    };
    imports.wbg.__wbg_getMappedRange_8e8ec4cef9c36ace = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getMappedRange(arg1, arg2);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_mapAsync_4a67e0da78869272 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).mapAsync(arg1 >>> 0, arg2, arg3);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_unmap_950f4eeb07607956 = function(arg0) {
        getObject(arg0).unmap();
    };
    imports.wbg.__wbg_new_6617e215130d0025 = function() { return handleError(function (arg0) {
        const ret = new IntersectionObserver(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_disconnect_d70bd32b9cb4687c = function(arg0) {
        getObject(arg0).disconnect();
    };
    imports.wbg.__wbg_observe_9b6f7f1aa30c2fe0 = function(arg0, arg1) {
        getObject(arg0).observe(getObject(arg1));
    };
    imports.wbg.__wbg_appendChild_bd383ec5356c0bdb = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).appendChild(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_contains_a94dd6fc112ea617 = function(arg0, arg1) {
        const ret = getObject(arg0).contains(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_get_de3ed10a49ff9959 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_bindVertexArrayOES_e95cf32f50e47240 = function(arg0, arg1) {
        getObject(arg0).bindVertexArrayOES(getObject(arg1));
    };
    imports.wbg.__wbg_createVertexArrayOES_96ccfea00081dcf3 = function(arg0) {
        const ret = getObject(arg0).createVertexArrayOES();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteVertexArrayOES_657b2572282b9dff = function(arg0, arg1) {
        getObject(arg0).deleteVertexArrayOES(getObject(arg1));
    };
    imports.wbg.__wbg_persisted_032c13ba4aa8c6eb = function(arg0) {
        const ret = getObject(arg0).persisted;
        return ret;
    };
    imports.wbg.__wbg_pointerId_288a7753a42433eb = function(arg0) {
        const ret = getObject(arg0).pointerId;
        return ret;
    };
    imports.wbg.__wbg_pressure_ef807a4027b5b179 = function(arg0) {
        const ret = getObject(arg0).pressure;
        return ret;
    };
    imports.wbg.__wbg_pointerType_6421ba54876364b9 = function(arg0, arg1) {
        const ret = getObject(arg1).pointerType;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_getCoalescedEvents_727ac35c45831392 = function(arg0) {
        const ret = getObject(arg0).getCoalescedEvents();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_cssText_a2f5bf6f7980f42b = function(arg0, arg1) {
        const ret = getObject(arg1).cssText;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_setcssText_f5866e21f6183e85 = function(arg0, arg1, arg2) {
        getObject(arg0).cssText = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_getPropertyValue_9f0d67e1a114f89a = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1).getPropertyValue(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_removeProperty_569b8c8469084b23 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg1).removeProperty(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_setProperty_a763529f4ef8ac76 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_getBindGroupLayout_09f7f078ba3dc867 = function(arg0, arg1) {
        const ret = getObject(arg0).getBindGroupLayout(arg1 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_GpuValidationError_6c1acc2e7d99e115 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof GPUValidationError;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_HtmlCanvasElement_a6076360513b6876 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof HTMLCanvasElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_width_9d9d26b087c6ad54 = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_setwidth_05075fb6b4cc720e = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_height_770da314320603d8 = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_setheight_7e0e88a922100d8c = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_getContext_39cdfeffd658feb7 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getContext_1daf9aba3e114993 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_gpu_c5e8cf7bf128f424 = function(arg0) {
        const ret = getObject(arg0).gpu;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_width_193b434156effb1d = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_setwidth_62ca8c8f2794be77 = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_height_84d4ae4d422188a3 = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_setheight_34b71cfdf6095cbd = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_getContext_3edcf332b89d4b97 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getContext_f183e180a122d091 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_deltaX_de18e6f358ab88cf = function(arg0) {
        const ret = getObject(arg0).deltaX;
        return ret;
    };
    imports.wbg.__wbg_deltaY_50a026b7421f883d = function(arg0) {
        const ret = getObject(arg0).deltaY;
        return ret;
    };
    imports.wbg.__wbg_deltaMode_b8290e36698673d0 = function(arg0) {
        const ret = getObject(arg0).deltaMode;
        return ret;
    };
    imports.wbg.__wbg_close_04d3a9914c09e2f8 = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_postMessage_e200ca4f0ead7ec7 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).postMessage(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_start_ab1a682cca472112 = function(arg0) {
        getObject(arg0).start();
    };
    imports.wbg.__wbg_now_65ff8ec2b863300c = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_debug_81bf1b6b83cc1a06 = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_1f4e3e298a7c97f6 = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_error_0f3a2d4325dee96a = function(arg0, arg1) {
        console.error(getObject(arg0), getObject(arg1));
    };
    imports.wbg.__wbg_info_24b7c0f9d7eb6623 = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_9dfb3879776dd797 = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_0e0204547af47087 = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_signal_7876560d9d0f914c = function(arg0) {
        const ret = getObject(arg0).signal;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_fa36281638875de8 = function() { return handleError(function () {
        const ret = new AbortController();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_abort_7792bf3f664d7bb3 = function(arg0) {
        getObject(arg0).abort();
    };
    imports.wbg.__wbg_new_862901d928bf4337 = function() { return handleError(function (arg0) {
        const ret = new ResizeObserver(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_disconnect_4c8e1494cd215540 = function(arg0) {
        getObject(arg0).disconnect();
    };
    imports.wbg.__wbg_observe_6cc6ed5bd384e675 = function(arg0, arg1) {
        getObject(arg0).observe(getObject(arg1));
    };
    imports.wbg.__wbg_observe_daa84e012177febe = function(arg0, arg1, arg2) {
        getObject(arg0).observe(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_unobserve_6e4cf206c219430c = function(arg0, arg1) {
        getObject(arg0).unobserve(getObject(arg1));
    };
    imports.wbg.__wbg_navigator_fbab58a088920616 = function(arg0) {
        const ret = getObject(arg0).navigator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_06d656a1b748ac0d = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_width_7cfb8b6f2a8cc639 = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_height_6930ed73b88da306 = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_preventDefault_d2c7416966cb0632 = function(arg0) {
        getObject(arg0).preventDefault();
    };
    imports.wbg.__wbg_dispatchWorkgroups_f29ef2c52160935b = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).dispatchWorkgroups(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_dispatchWorkgroupsIndirect_546c01d0f367062c = function(arg0, arg1, arg2) {
        getObject(arg0).dispatchWorkgroupsIndirect(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_end_68f8e129afb32190 = function(arg0) {
        getObject(arg0).end();
    };
    imports.wbg.__wbg_setPipeline_3e40157eba345dea = function(arg0, arg1) {
        getObject(arg0).setPipeline(getObject(arg1));
    };
    imports.wbg.__wbg_setBindGroup_101c91dae759a939 = function(arg0, arg1, arg2) {
        getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_setBindGroup_a1d4681aa6c61a1e = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
    };
    imports.wbg.__wbg_videoWidth_024256de61021e4a = function(arg0) {
        const ret = getObject(arg0).videoWidth;
        return ret;
    };
    imports.wbg.__wbg_videoHeight_2c601663d2d0211a = function(arg0) {
        const ret = getObject(arg0).videoHeight;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_0d75e0e9028bd999 = function(arg0) {
        const ret = getObject(arg0).ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_12353f0e19b21d6a = function(arg0) {
        const ret = getObject(arg0).shiftKey;
        return ret;
    };
    imports.wbg.__wbg_altKey_a076f8612103d7e8 = function(arg0) {
        const ret = getObject(arg0).altKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_4e3f6e986f2802b1 = function(arg0) {
        const ret = getObject(arg0).metaKey;
        return ret;
    };
    imports.wbg.__wbg_button_8a97c55db17c7314 = function(arg0) {
        const ret = getObject(arg0).button;
        return ret;
    };
    imports.wbg.__wbg_buttons_d516d4a6ffb63df2 = function(arg0) {
        const ret = getObject(arg0).buttons;
        return ret;
    };
    imports.wbg.__wbg_movementX_7ed3fefa16dfa971 = function(arg0) {
        const ret = getObject(arg0).movementX;
        return ret;
    };
    imports.wbg.__wbg_movementY_a0be141073121d2c = function(arg0) {
        const ret = getObject(arg0).movementY;
        return ret;
    };
    imports.wbg.__wbg_gpu_03b962c104b840fb = function(arg0) {
        const ret = getObject(arg0).gpu;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_GpuCanvasContext_15a09368cfe47ea8 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof GPUCanvasContext;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_configure_e226c3745a43426f = function(arg0, arg1) {
        getObject(arg0).configure(getObject(arg1));
    };
    imports.wbg.__wbg_getCurrentTexture_c18952d00d5ca291 = function(arg0) {
        const ret = getObject(arg0).getCurrentTexture();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_features_593bd7f9458a6231 = function(arg0) {
        const ret = getObject(arg0).features;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_limits_3ac6801e513040da = function(arg0) {
        const ret = getObject(arg0).limits;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_queue_ddb36024901f05e0 = function(arg0) {
        const ret = getObject(arg0).queue;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setonuncapturederror_e0130729a9d60230 = function(arg0, arg1) {
        getObject(arg0).onuncapturederror = getObject(arg1);
    };
    imports.wbg.__wbg_createBindGroup_ac7f0d5a39576d75 = function(arg0, arg1) {
        const ret = getObject(arg0).createBindGroup(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createBindGroupLayout_59c27eb322de416d = function(arg0, arg1) {
        const ret = getObject(arg0).createBindGroupLayout(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createBuffer_04daf0bfc4769a62 = function(arg0, arg1) {
        const ret = getObject(arg0).createBuffer(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createCommandEncoder_7526df7b47716ae6 = function(arg0, arg1) {
        const ret = getObject(arg0).createCommandEncoder(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createComputePipeline_24a6804b4dd04900 = function(arg0, arg1) {
        const ret = getObject(arg0).createComputePipeline(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createPipelineLayout_49819de7bd0136fb = function(arg0, arg1) {
        const ret = getObject(arg0).createPipelineLayout(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createQuerySet_98180d67f5f8f9f9 = function(arg0, arg1) {
        const ret = getObject(arg0).createQuerySet(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createRenderBundleEncoder_88351250d58c601d = function(arg0, arg1) {
        const ret = getObject(arg0).createRenderBundleEncoder(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createRenderPipeline_f76085dec605d890 = function(arg0, arg1) {
        const ret = getObject(arg0).createRenderPipeline(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createSampler_d4ed3fa605e5fcf9 = function(arg0, arg1) {
        const ret = getObject(arg0).createSampler(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createShaderModule_c7568f7418866e9f = function(arg0, arg1) {
        const ret = getObject(arg0).createShaderModule(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_82a70b14851e2a17 = function(arg0, arg1) {
        const ret = getObject(arg0).createTexture(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_destroy_920a1dd066def2d5 = function(arg0) {
        getObject(arg0).destroy();
    };
    imports.wbg.__wbg_popErrorScope_4c40ac0e02a984ee = function(arg0) {
        const ret = getObject(arg0).popErrorScope();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_pushErrorScope_e9750171bac7bece = function(arg0, arg1) {
        getObject(arg0).pushErrorScope(takeObject(arg1));
    };
    imports.wbg.__wbg_end_b69b164a93d57165 = function(arg0) {
        getObject(arg0).end();
    };
    imports.wbg.__wbg_executeBundles_f798318792c088c6 = function(arg0, arg1) {
        getObject(arg0).executeBundles(getObject(arg1));
    };
    imports.wbg.__wbg_setBlendConstant_af49117f4f95a62b = function(arg0, arg1) {
        getObject(arg0).setBlendConstant(getObject(arg1));
    };
    imports.wbg.__wbg_setScissorRect_ed6fb5aad3213d90 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setScissorRect(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_setStencilReference_1ff0cc7e8fb11c99 = function(arg0, arg1) {
        getObject(arg0).setStencilReference(arg1 >>> 0);
    };
    imports.wbg.__wbg_setViewport_7ed089e0c8c26606 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).setViewport(arg1, arg2, arg3, arg4, arg5, arg6);
    };
    imports.wbg.__wbg_setBindGroup_15cf0778bb5e7d05 = function(arg0, arg1, arg2) {
        getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_setBindGroup_ea7ccade02af2501 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
    };
    imports.wbg.__wbg_draw_1204f2d6f9149dc6 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).draw(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_drawIndexed_99f3e00d5b13d102 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
    };
    imports.wbg.__wbg_drawIndexedIndirect_8af3625442a3dc97 = function(arg0, arg1, arg2) {
        getObject(arg0).drawIndexedIndirect(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_drawIndirect_6242853cc58f9c59 = function(arg0, arg1, arg2) {
        getObject(arg0).drawIndirect(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_setIndexBuffer_c522aa3f0daf9c65 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).setIndexBuffer(getObject(arg1), takeObject(arg2), arg3);
    };
    imports.wbg.__wbg_setIndexBuffer_71feee22f3f24385 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setIndexBuffer(getObject(arg1), takeObject(arg2), arg3, arg4);
    };
    imports.wbg.__wbg_setPipeline_14908d662a4b47bb = function(arg0, arg1) {
        getObject(arg0).setPipeline(getObject(arg1));
    };
    imports.wbg.__wbg_setVertexBuffer_0ccef4c07f934109 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3);
    };
    imports.wbg.__wbg_setVertexBuffer_90ae08082f1d8529 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3, arg4);
    };
    imports.wbg.__wbg_media_3b4b8723e3ef28e6 = function(arg0, arg1) {
        const ret = getObject(arg1).media;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_matches_68b7ad47c1091323 = function(arg0) {
        const ret = getObject(arg0).matches;
        return ret;
    };
    imports.wbg.__wbg_addListener_0bbd0358c52d8a0e = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).addListener(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_removeListener_b8fc928c2300e3c6 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).removeListener(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_drawArraysInstancedANGLE_4ba856b2c59d84b8 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawArraysInstancedANGLE(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_drawElementsInstancedANGLE_fdf5cd2eb03dd141 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawElementsInstancedANGLE(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_vertexAttribDivisorANGLE_51dd5c906f4912a2 = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttribDivisorANGLE(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_addEventListener_2f891d22985fd3c8 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_removeEventListener_07715e6f464823fc = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_copyExternalImageToTexture_5f04667a427c98f6 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).copyExternalImageToTexture(getObject(arg1), getObject(arg2), getObject(arg3));
    };
    imports.wbg.__wbg_submit_150869043788b15f = function(arg0, arg1) {
        getObject(arg0).submit(getObject(arg1));
    };
    imports.wbg.__wbg_writeBuffer_1bda4c86fda1c6ef = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).writeBuffer(getObject(arg1), arg2, getObject(arg3), arg4, arg5);
    };
    imports.wbg.__wbg_writeTexture_f44f4ca6949d9703 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).writeTexture(getObject(arg1), getObject(arg2), getObject(arg3), getObject(arg4));
    };
    imports.wbg.__wbg_getBindGroupLayout_4493a09dd3332cc7 = function(arg0, arg1) {
        const ret = getObject(arg0).getBindGroupLayout(arg1 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_has_231530d4f9bd3c99 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).has(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension1D_7775176d6f628f03 = function(arg0) {
        const ret = getObject(arg0).maxTextureDimension1D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension2D_a4b91c6288dc2779 = function(arg0) {
        const ret = getObject(arg0).maxTextureDimension2D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureDimension3D_96cadefa72b14a3d = function(arg0) {
        const ret = getObject(arg0).maxTextureDimension3D;
        return ret;
    };
    imports.wbg.__wbg_maxTextureArrayLayers_9065694a65cb1672 = function(arg0) {
        const ret = getObject(arg0).maxTextureArrayLayers;
        return ret;
    };
    imports.wbg.__wbg_maxBindGroups_c7a9b7159bcd78aa = function(arg0) {
        const ret = getObject(arg0).maxBindGroups;
        return ret;
    };
    imports.wbg.__wbg_maxBindingsPerBindGroup_b246d013d202dbee = function(arg0) {
        const ret = getObject(arg0).maxBindingsPerBindGroup;
        return ret;
    };
    imports.wbg.__wbg_maxDynamicUniformBuffersPerPipelineLayout_6c67f1f5588b262f = function(arg0) {
        const ret = getObject(arg0).maxDynamicUniformBuffersPerPipelineLayout;
        return ret;
    };
    imports.wbg.__wbg_maxDynamicStorageBuffersPerPipelineLayout_9e4f0bae9d7633d6 = function(arg0) {
        const ret = getObject(arg0).maxDynamicStorageBuffersPerPipelineLayout;
        return ret;
    };
    imports.wbg.__wbg_maxSampledTexturesPerShaderStage_68b34e288c3fe72d = function(arg0) {
        const ret = getObject(arg0).maxSampledTexturesPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxSamplersPerShaderStage_e387dc924e0a9fdb = function(arg0) {
        const ret = getObject(arg0).maxSamplersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxStorageBuffersPerShaderStage_b2acde127f9ea89c = function(arg0) {
        const ret = getObject(arg0).maxStorageBuffersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxStorageTexturesPerShaderStage_554cadd37b3fac07 = function(arg0) {
        const ret = getObject(arg0).maxStorageTexturesPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxUniformBuffersPerShaderStage_1731b4db40554c4e = function(arg0) {
        const ret = getObject(arg0).maxUniformBuffersPerShaderStage;
        return ret;
    };
    imports.wbg.__wbg_maxUniformBufferBindingSize_6da089f8603138e4 = function(arg0) {
        const ret = getObject(arg0).maxUniformBufferBindingSize;
        return ret;
    };
    imports.wbg.__wbg_maxStorageBufferBindingSize_ac3460dddc8dc9b5 = function(arg0) {
        const ret = getObject(arg0).maxStorageBufferBindingSize;
        return ret;
    };
    imports.wbg.__wbg_minUniformBufferOffsetAlignment_02e13b244fc8f003 = function(arg0) {
        const ret = getObject(arg0).minUniformBufferOffsetAlignment;
        return ret;
    };
    imports.wbg.__wbg_minStorageBufferOffsetAlignment_f66d5aec00f8e522 = function(arg0) {
        const ret = getObject(arg0).minStorageBufferOffsetAlignment;
        return ret;
    };
    imports.wbg.__wbg_maxVertexBuffers_08134f7c49962fa3 = function(arg0) {
        const ret = getObject(arg0).maxVertexBuffers;
        return ret;
    };
    imports.wbg.__wbg_maxBufferSize_032652f619dfa1cb = function(arg0) {
        const ret = getObject(arg0).maxBufferSize;
        return ret;
    };
    imports.wbg.__wbg_maxVertexAttributes_c30ba4b69eafc565 = function(arg0) {
        const ret = getObject(arg0).maxVertexAttributes;
        return ret;
    };
    imports.wbg.__wbg_maxVertexBufferArrayStride_0d30e0cbdd343d04 = function(arg0) {
        const ret = getObject(arg0).maxVertexBufferArrayStride;
        return ret;
    };
    imports.wbg.__wbg_maxInterStageShaderComponents_1260a9d8a88b447f = function(arg0) {
        const ret = getObject(arg0).maxInterStageShaderComponents;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupStorageSize_13e1084b2659929f = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupStorageSize;
        return ret;
    };
    imports.wbg.__wbg_maxComputeInvocationsPerWorkgroup_08f528e6ade0ecaf = function(arg0) {
        const ret = getObject(arg0).maxComputeInvocationsPerWorkgroup;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeX_c86414b754152065 = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupSizeX;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeY_fa8703d9e6ef5b1f = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupSizeY;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupSizeZ_c09064b6325d3048 = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupSizeZ;
        return ret;
    };
    imports.wbg.__wbg_maxComputeWorkgroupsPerDimension_29648c496bd862d3 = function(arg0) {
        const ret = getObject(arg0).maxComputeWorkgroupsPerDimension;
        return ret;
    };
    imports.wbg.__wbg_error_a305d541d1c1980f = function(arg0) {
        const ret = getObject(arg0).error;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_altKey_c3c61dc3af936846 = function(arg0) {
        const ret = getObject(arg0).altKey;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_e7fc1575581bc431 = function(arg0) {
        const ret = getObject(arg0).ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_0a061aeba25dbd63 = function(arg0) {
        const ret = getObject(arg0).shiftKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_b879a69fa9f3f7af = function(arg0) {
        const ret = getObject(arg0).metaKey;
        return ret;
    };
    imports.wbg.__wbg_location_3d1aba6d141f01fb = function(arg0) {
        const ret = getObject(arg0).location;
        return ret;
    };
    imports.wbg.__wbg_repeat_8514eb33e8553b6b = function(arg0) {
        const ret = getObject(arg0).repeat;
        return ret;
    };
    imports.wbg.__wbg_key_9a2550983fbad1d0 = function(arg0, arg1) {
        const ret = getObject(arg1).key;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_code_3b51bddc7419ef7d = function(arg0, arg1) {
        const ret = getObject(arg1).code;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_origin_a66ff95a994d7e40 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg1).origin;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments) };
    imports.wbg.__wbg_instanceof_GpuAdapter_ad0d9f5440c19fb7 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof GPUAdapter;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_features_08ac295660efa467 = function(arg0) {
        const ret = getObject(arg0).features;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_limits_f6be77af2469ed8d = function(arg0) {
        const ret = getObject(arg0).limits;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_requestDevice_c9a68988651df548 = function(arg0, arg1) {
        const ret = getObject(arg0).requestDevice(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_GpuOutOfMemoryError_a3acf03f788132d8 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof GPUOutOfMemoryError;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isIntersecting_108350bd17ad1d04 = function(arg0) {
        const ret = getObject(arg0).isIntersecting;
        return ret;
    };
    imports.wbg.__wbg_framebufferTextureMultiviewOVR_b4f234dba08738d7 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).framebufferTextureMultiviewOVR(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5, arg6);
    };
    imports.wbg.__wbg_bufferData_9566a2faddca5792 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferData_b2e68fdc1fd1e94b = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferSubData_7d216abec8307331 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
    };
    imports.wbg.__wbg_compressedTexSubImage2D_5666e0146e152b7d = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
    };
    imports.wbg.__wbg_readPixels_32bab95664f5bcdf = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    }, arguments) };
    imports.wbg.__wbg_texImage2D_9cd1931c442b03ad = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_d23a3ec1fa60bdaf = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_uniform2fv_d375e6a7b2f1e575 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform2iv_5ba0883cf01ae09d = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform2iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform3fv_ce5f4b99b178dd74 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform3iv_f297f19f134ad0c2 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform3iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform4fv_f7afb7d09ee03175 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniform4iv_2dbb8a34d36a28c3 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniform4iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_uniformMatrix2fv_9e0249ce783ce2be = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix3fv_2a9524cf34ecbd62 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_uniformMatrix4fv_4c466deaf158ed5b = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_activeTexture_3748123e1becf07d = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_attachShader_cfbbdefc08a0422f = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_bindAttribLocation_1d7075153fbbd1e4 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).bindAttribLocation(getObject(arg1), arg2 >>> 0, getStringFromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_bindBuffer_3f166cc2f502fc09 = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindFramebuffer_28e8c0c3f76447af = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindRenderbuffer_2fe89083883b96e7 = function(arg0, arg1, arg2) {
        getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindTexture_be92cdd3f162b4f9 = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_blendColor_71d54d4dad7a369a = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_blendEquation_b1df5434f3ad5aac = function(arg0, arg1) {
        getObject(arg0).blendEquation(arg1 >>> 0);
    };
    imports.wbg.__wbg_blendEquationSeparate_33f23a57d77e8079 = function(arg0, arg1, arg2) {
        getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFunc_5adf0a3a9f164e6e = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFuncSeparate_52fdb0f1fbf57928 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_clear_af4278a00382d3ce = function(arg0, arg1) {
        getObject(arg0).clear(arg1 >>> 0);
    };
    imports.wbg.__wbg_clearColor_9a45e2200c61a8f2 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_clearDepth_a40e7b975ebc5c14 = function(arg0, arg1) {
        getObject(arg0).clearDepth(arg1);
    };
    imports.wbg.__wbg_clearStencil_62277af75c0a3558 = function(arg0, arg1) {
        getObject(arg0).clearStencil(arg1);
    };
    imports.wbg.__wbg_colorMask_57603facaeb6e2e3 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_compileShader_be824cfad43331b8 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_copyTexSubImage2D_6ce49c4a307e877d = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
    };
    imports.wbg.__wbg_createBuffer_90bf79c414ad4956 = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createFramebuffer_f8c26154f8992bfa = function(arg0) {
        const ret = getObject(arg0).createFramebuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_983b87cad6d06768 = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createRenderbuffer_e2d77844fbdcc842 = function(arg0) {
        const ret = getObject(arg0).createRenderbuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_896229165c5a11d4 = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_b77eefdce0bb2c55 = function(arg0) {
        const ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_cullFace_a65f5d17b1ff5686 = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_deleteBuffer_d70596808095dac2 = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteFramebuffer_23c9c7c8176aa9b8 = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteProgram_8447c337271aa934 = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_deleteRenderbuffer_7bb3c4c79eac08ff = function(arg0, arg1) {
        getObject(arg0).deleteRenderbuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteShader_322b059ad560664a = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_bbda7cb554bc12b9 = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_depthFunc_b78eec6735fd7a0a = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__wbg_depthMask_d2c08d83ea550563 = function(arg0, arg1) {
        getObject(arg0).depthMask(arg1 !== 0);
    };
    imports.wbg.__wbg_depthRange_c4d7339e2f6b2e4a = function(arg0, arg1, arg2) {
        getObject(arg0).depthRange(arg1, arg2);
    };
    imports.wbg.__wbg_disable_57e8624c865bd654 = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__wbg_disableVertexAttribArray_fb822948cb54eec9 = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_drawArrays_d48ee5c0a02be869 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_enable_54d01bacc240df3e = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_c971ef03599058ec = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_framebufferRenderbuffer_27bc520ea685b484 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
    };
    imports.wbg.__wbg_framebufferTexture2D_c61bc6c888f33a52 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__wbg_frontFace_e13136966c974dd8 = function(arg0, arg1) {
        getObject(arg0).frontFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_getParameter_798cbb8ff20c7af0 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getParameter(arg1 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getProgramInfoLog_3ff10ea818ab6ce4 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_getProgramParameter_35800b92324ff726 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_3e435d2b50e0ecf0 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_getShaderParameter_a9315ba73ab18731 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_f161344f25983444 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_linkProgram_caeab1eb0c0246be = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_pixelStorei_ac98844c2d6d1937 = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_polygonOffset_442517f9de53e3de = function(arg0, arg1, arg2) {
        getObject(arg0).polygonOffset(arg1, arg2);
    };
    imports.wbg.__wbg_renderbufferStorage_982fcb5577f764ca = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
    };
    imports.wbg.__wbg_scissor_7206bcd2a5540aa3 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_shaderSource_04af20ecb1962b3b = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_stencilFuncSeparate_89563ca030dab790 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_76ea69a0c4738423 = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilMaskSeparate_1303b1855315b85a = function(arg0, arg1, arg2) {
        getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_stencilOpSeparate_fef362ec0f1539d1 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_texParameteri_dd08984388e62491 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_uniform1f_5c36f8a2cf1d8cd7 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1f(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform1i_5a5f1f9d5828e6c6 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform4f_93ef17b7172e8ad2 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_useProgram_229c8fa8394b4c26 = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_vertexAttribPointer_e9c4ff85658b9ad2 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_viewport_0ca27d1d6ac8424c = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_getSupportedProfiles_a3af04122b4f2f30 = function(arg0) {
        const ret = getObject(arg0).getSupportedProfiles();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_drawBuffersWEBGL_533ee2b72ddb728a = function(arg0, arg1) {
        getObject(arg0).drawBuffersWEBGL(getObject(arg1));
    };
    imports.wbg.__wbg_createView_238c196d0cfdd954 = function(arg0, arg1) {
        const ret = getObject(arg0).createView(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_destroy_1d01724a4f355cb9 = function(arg0) {
        getObject(arg0).destroy();
    };
    imports.wbg.__wbg_port1_55b3ea63b5d29a4d = function(arg0) {
        const ret = getObject(arg0).port1;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_port2_78f5a59a4effe9f7 = function(arg0) {
        const ret = getObject(arg0).port2;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_b7e038999edffb16 = function() { return handleError(function () {
        const ret = new MessageChannel();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithstrandinit_9fd2fc855c6327eb = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Response_0d25bb8436a9cefe = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Response;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_url_47f8307501523859 = function(arg0, arg1) {
        const ret = getObject(arg1).url;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_status_351700a30c61ba61 = function(arg0) {
        const ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_headers_e38c00d713e8888c = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_arrayBuffer_ec4617b29bb0f61c = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_text_10c88c5e55f873c7 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).text();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_style_b32d5cb9a6bd4720 = function(arg0) {
        const ret = getObject(arg0).style;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_focus_623326ec4eefd224 = function() { return handleError(function (arg0) {
        getObject(arg0).focus();
    }, arguments) };
    imports.wbg.__wbg_inlineSize_61a4e582b0d875c2 = function(arg0) {
        const ret = getObject(arg0).inlineSize;
        return ret;
    };
    imports.wbg.__wbg_blockSize_ad207c0d03bd1782 = function(arg0) {
        const ret = getObject(arg0).blockSize;
        return ret;
    };
    imports.wbg.__wbg_get_c43534c00f382c8a = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_d99b680fd68bf71b = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_34c624469fb1d4fd = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_5859b6d41c6fe9f7 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_1938cf110c9491d4 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_267398d0e0761bf9 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_506b44765ba84b9c = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_31485d8770eb06ab = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_364187e1ee96b750 = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_5027b32da70f39b1 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_a79f1973a4f07d5e = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_87d841e70661f6e9 = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_086b5302bcafb962 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_132fa5d7546f1de5 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_e5f801a37ad7d07b = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_f9a61fce4af6b7c1 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_includes_b0feae2b4a1ae514 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).includes(getObject(arg1), arg2);
        return ret;
    };
    imports.wbg.__wbg_of_3d7aa62bb0ab56ee = function(arg0) {
        const ret = Array.of(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_906164999551d793 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_instanceof_Error_f5ae6a28929a8190 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Error;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_message_5dbdf59ed61bbc49 = function(arg0) {
        const ret = getObject(arg0).message;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_f6a2bc58c19c53c6 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Object_06e0ec0f1056bcd5 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Object;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_getOwnPropertyDescriptor_49a7876ddfa10ccf = function(arg0, arg1) {
        const ret = Object.getOwnPropertyDescriptor(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_is_a5728dbfb61c82cd = function(arg0, arg1) {
        const ret = Object.is(getObject(arg0), getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_valueOf_c47fee3d56593d7a = function(arg0) {
        const ret = getObject(arg0).valueOf();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_includes_5b08597e421552b1 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).includes(getStringFromWasm0(arg1, arg2), arg3);
        return ret;
    };
    imports.wbg.__wbg_resolve_97ecd55ee839391b = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_catch_9aeb46e888e3b0d6 = function(arg0, arg1) {
        const ret = getObject(arg0).catch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_7aeb7c5f1536640f = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_5842e4e97f7beace = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_5d1b598a01b41a42 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_54c7b98977affdec = function(arg0, arg1, arg2) {
        const ret = new Int8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_16ba6d10861ea013 = function(arg0, arg1, arg2) {
        const ret = new Int16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_821c7736f0d22b04 = function(arg0, arg1, arg2) {
        const ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_d695c7957788f922 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_ace717933ad7117f = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_74906aa30864df5a = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_f0764416ba5bb237 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_2412e38a0385bbe2 = function(arg0, arg1, arg2) {
        const ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_aeed38cac7555df7 = function(arg0, arg1, arg2) {
        const ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_21163b4dfcbc673c = function(arg0, arg1, arg2) {
        const ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_728575f3bba9959b = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_3da2aecfd9814cd8 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_7f7a652672800851 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stringify_daa6661e90c04140 = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_has_a2919659b7b645b3 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_37a50e901587b477 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper653 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 52, __wbg_adapter_32);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper654 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 52, __wbg_adapter_32);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper655 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 52, __wbg_adapter_37);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper656 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 52, __wbg_adapter_40);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper657 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 52, __wbg_adapter_32);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper658 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 52, __wbg_adapter_32);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper659 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 52, __wbg_adapter_32);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3151 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1138, __wbg_adapter_49);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3152 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1138, __wbg_adapter_52);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3153 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1138, __wbg_adapter_52);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3154 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1138, __wbg_adapter_52);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3155 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1138, __wbg_adapter_52);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3156 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1138, __wbg_adapter_52);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper3157 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1138, __wbg_adapter_52);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper4664 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 2048, __wbg_adapter_65);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper4666 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 2048, __wbg_adapter_65);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper5241 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 2232, __wbg_adapter_70);
        return addHeapObject(ret);
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedFloat32Memory0 = null;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('tutorial12-camera_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
