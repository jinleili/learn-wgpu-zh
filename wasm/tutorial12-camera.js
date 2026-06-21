function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Window_65ef42d29dc8174d: function(arg0) {
            const ret = getObject(arg0).Window;
            return addHeapObject(ret);
        },
        __wbg_Window_9c802677b175d849: function(arg0) {
            const ret = getObject(arg0).Window;
            return addHeapObject(ret);
        },
        __wbg_WorkerGlobalScope_d272430d4a323303: function(arg0) {
            const ret = getObject(arg0).WorkerGlobalScope;
            return addHeapObject(ret);
        },
        __wbg___wbindgen_boolean_get_b131b2f36d6b2f55: function(arg0) {
            const v = getObject(arg0);
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_56c147eb1a51f0c4: function(arg0, arg1) {
            const ret = debugString(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_function_147961669f068cd4: function(arg0) {
            const ret = typeof(getObject(arg0)) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_null_ced4761460071341: function(arg0) {
            const ret = getObject(arg0) === null;
            return ret;
        },
        __wbg___wbindgen_is_object_3a2c414391dbf751: function(arg0) {
            const val = getObject(arg0);
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_4410e3c20a99fa97: function(arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        },
        __wbg___wbindgen_number_get_588ed6b97f0d7e14: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_fa2687d531ed17a5: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_bbadd78c1bac3a77: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__wbg_cb_unref_c2301a3c9b78104b: function(arg0) {
            getObject(arg0)._wbg_cb_unref();
        },
        __wbg_abort_f2416f4a9852003e: function(arg0) {
            getObject(arg0).abort();
        },
        __wbg_activeElement_47d7625bb1c33c30: function(arg0) {
            const ret = getObject(arg0).activeElement;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_activeTexture_15a70bef1036ce53: function(arg0, arg1) {
            getObject(arg0).activeTexture(arg1 >>> 0);
        },
        __wbg_activeTexture_51dd9740bba533be: function(arg0, arg1) {
            getObject(arg0).activeTexture(arg1 >>> 0);
        },
        __wbg_addEventListener_767c2a31836a5d6b: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
        }, arguments); },
        __wbg_addListener_532195f4690552cf: function() { return handleError(function (arg0, arg1) {
            getObject(arg0).addListener(getObject(arg1));
        }, arguments); },
        __wbg_altKey_a2fd34442087f3f3: function(arg0) {
            const ret = getObject(arg0).altKey;
            return ret;
        },
        __wbg_altKey_c6b9f35a9722c3ee: function(arg0) {
            const ret = getObject(arg0).altKey;
            return ret;
        },
        __wbg_animate_03b22d32796c74f4: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).animate(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        },
        __wbg_appendChild_5d12592005fe7b6f: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).appendChild(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_append_c5a0c94a6a73b22e: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_arrayBuffer_cc7704fa158b907a: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).arrayBuffer();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_attachShader_48ba0270304eee26: function(arg0, arg1, arg2) {
            getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
        },
        __wbg_attachShader_ab7291d0f9ee5d8e: function(arg0, arg1, arg2) {
            getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
        },
        __wbg_beginQuery_5330e1db2afe57d1: function(arg0, arg1, arg2) {
            getObject(arg0).beginQuery(arg1 >>> 0, getObject(arg2));
        },
        __wbg_beginRenderPass_865cbdfaecf89f93: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).beginRenderPass(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_bindAttribLocation_47408feee4a087ab: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).bindAttribLocation(getObject(arg1), arg2 >>> 0, getStringFromWasm0(arg3, arg4));
        },
        __wbg_bindAttribLocation_d745862b4543392c: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).bindAttribLocation(getObject(arg1), arg2 >>> 0, getStringFromWasm0(arg3, arg4));
        },
        __wbg_bindBufferRange_0e7257839b254053: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).bindBufferRange(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
        },
        __wbg_bindBuffer_5dc789a1e68bc21c: function(arg0, arg1, arg2) {
            getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindBuffer_dfde53745eda44ea: function(arg0, arg1, arg2) {
            getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindFramebuffer_2fdf6633b08d43bf: function(arg0, arg1, arg2) {
            getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindFramebuffer_c7ea64daccb05d7b: function(arg0, arg1, arg2) {
            getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindRenderbuffer_8fbfd296c87b7a4f: function(arg0, arg1, arg2) {
            getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindRenderbuffer_ffa1251aca1246bf: function(arg0, arg1, arg2) {
            getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindSampler_4d8cc2aa2f70ab6e: function(arg0, arg1, arg2) {
            getObject(arg0).bindSampler(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindTexture_3be817b1679620ad: function(arg0, arg1, arg2) {
            getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindTexture_c04307052b3a8aa1: function(arg0, arg1, arg2) {
            getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
        },
        __wbg_bindVertexArrayOES_fdf048ec490980ba: function(arg0, arg1) {
            getObject(arg0).bindVertexArrayOES(getObject(arg1));
        },
        __wbg_bindVertexArray_c88467187a93d0de: function(arg0, arg1) {
            getObject(arg0).bindVertexArray(getObject(arg1));
        },
        __wbg_blendColor_16ac697b00f986d5: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
        },
        __wbg_blendColor_e8e2099c425681e0: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
        },
        __wbg_blendEquationSeparate_7673b66e73645b0b: function(arg0, arg1, arg2) {
            getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_blendEquationSeparate_ab5b7fd745db553f: function(arg0, arg1, arg2) {
            getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_blendEquation_7ae6a18ccee7fb5d: function(arg0, arg1) {
            getObject(arg0).blendEquation(arg1 >>> 0);
        },
        __wbg_blendEquation_e81c83c7b2b6a82d: function(arg0, arg1) {
            getObject(arg0).blendEquation(arg1 >>> 0);
        },
        __wbg_blendFuncSeparate_d8d62651e23b03d5: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_blendFuncSeparate_f230caab488bd795: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_blendFunc_41f2f6e58912faa3: function(arg0, arg1, arg2) {
            getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_blendFunc_a66de875da55572b: function(arg0, arg1, arg2) {
            getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_blitFramebuffer_a3819cea8c07978e: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).blitFramebuffer(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0);
        },
        __wbg_blockSize_06320ccd095fc4b0: function(arg0) {
            const ret = getObject(arg0).blockSize;
            return ret;
        },
        __wbg_body_f995b59cdb3c2948: function(arg0) {
            const ret = getObject(arg0).body;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_brand_97b90b433957d06e: function(arg0, arg1) {
            const ret = getObject(arg1).brand;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_brands_b4631490bad049a7: function(arg0) {
            const ret = getObject(arg0).brands;
            return addHeapObject(ret);
        },
        __wbg_bufferData_2d6bae8abc15a466: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
        },
        __wbg_bufferData_4f42107735b9ea7f: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
        },
        __wbg_bufferData_a0954d82f2ba8e06: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
        },
        __wbg_bufferData_ebb8d7e5930d9913: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
        },
        __wbg_bufferSubData_a3bf192e99e074ca: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
        },
        __wbg_bufferSubData_c75c0d8260a4882c: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
        },
        __wbg_button_c86c1be29591299b: function(arg0) {
            const ret = getObject(arg0).button;
            return ret;
        },
        __wbg_buttons_a6fccd7debb39a44: function(arg0) {
            const ret = getObject(arg0).buttons;
            return ret;
        },
        __wbg_call_91f00ddc43e01490: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).call(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_cancelAnimationFrame_039d1eb41af00736: function() { return handleError(function (arg0, arg1) {
            getObject(arg0).cancelAnimationFrame(arg1);
        }, arguments); },
        __wbg_cancelIdleCallback_f8cf4cdb966cb98a: function(arg0, arg1) {
            getObject(arg0).cancelIdleCallback(arg1 >>> 0);
        },
        __wbg_cancel_1fb7c9c8bf62dd33: function(arg0) {
            getObject(arg0).cancel();
        },
        __wbg_catch_66060324c27be6f7: function(arg0, arg1) {
            const ret = getObject(arg0).catch(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_clearBufferfv_6e2b01297c4b61d0: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).clearBufferfv(arg1 >>> 0, arg2, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_clearBufferiv_da890b1b3bf2184f: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).clearBufferiv(arg1 >>> 0, arg2, getArrayI32FromWasm0(arg3, arg4));
        },
        __wbg_clearBufferuiv_82a2d3a5240cba6d: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).clearBufferuiv(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4));
        },
        __wbg_clearDepth_388bac5c08443f76: function(arg0, arg1) {
            getObject(arg0).clearDepth(arg1);
        },
        __wbg_clearDepth_b159bca38476ba58: function(arg0, arg1) {
            getObject(arg0).clearDepth(arg1);
        },
        __wbg_clearStencil_62bad9b307f1ada7: function(arg0, arg1) {
            getObject(arg0).clearStencil(arg1);
        },
        __wbg_clearStencil_b6bf4c91925c8af4: function(arg0, arg1) {
            getObject(arg0).clearStencil(arg1);
        },
        __wbg_clearTimeout_57fc4c7dc824b3c0: function(arg0, arg1) {
            getObject(arg0).clearTimeout(arg1);
        },
        __wbg_clear_633f3d74dbb63ab2: function(arg0, arg1) {
            getObject(arg0).clear(arg1 >>> 0);
        },
        __wbg_clear_a555f947eaf303c8: function(arg0, arg1) {
            getObject(arg0).clear(arg1 >>> 0);
        },
        __wbg_clientWaitSync_ffacbe4d8f58cba2: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).clientWaitSync(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
            return ret;
        },
        __wbg_close_4e83639d314a2d14: function(arg0) {
            getObject(arg0).close();
        },
        __wbg_code_97e07fcf8e7a0526: function(arg0, arg1) {
            const ret = getObject(arg1).code;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_colorMask_9f2782fbb99e8ae0: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
        },
        __wbg_colorMask_b5338bd8918624df: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
        },
        __wbg_compileShader_026e8726c5b3b52c: function(arg0, arg1) {
            getObject(arg0).compileShader(getObject(arg1));
        },
        __wbg_compileShader_c3ac43642f1ad1db: function(arg0, arg1) {
            getObject(arg0).compileShader(getObject(arg1));
        },
        __wbg_compressedTexSubImage2D_0041c504b2cc7acc: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
            getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
        },
        __wbg_compressedTexSubImage2D_44275a9384dc595c: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
            getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
        },
        __wbg_compressedTexSubImage2D_c3fde4c15d31b6b9: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8, arg9);
        },
        __wbg_compressedTexSubImage3D_80e9ba270ca89e31: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, getObject(arg10));
        },
        __wbg_compressedTexSubImage3D_db571eec67071092: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10, arg11);
        },
        __wbg_configure_c0a3d80e97c0e7b1: function() { return handleError(function (arg0, arg1) {
            getObject(arg0).configure(getObject(arg1));
        }, arguments); },
        __wbg_contains_301d38bed4d11243: function(arg0, arg1) {
            const ret = getObject(arg0).contains(getObject(arg1));
            return ret;
        },
        __wbg_contentRect_74f058108858fa57: function(arg0) {
            const ret = getObject(arg0).contentRect;
            return addHeapObject(ret);
        },
        __wbg_copyBufferSubData_4787ad01c3cf6d36: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).copyBufferSubData(arg1 >>> 0, arg2 >>> 0, arg3, arg4, arg5);
        },
        __wbg_copyTexSubImage2D_1688d246a3d2c477: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
            getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
        },
        __wbg_copyTexSubImage2D_3f2fbd9f3baf06d0: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
            getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
        },
        __wbg_copyTexSubImage3D_d30fb4b1b51f8852: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).copyTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
        },
        __wbg_createBindGroupLayout_59891d473ac8665d: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createBindGroupLayout(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createBindGroup_4cb86ff853df5c69: function(arg0, arg1) {
            const ret = getObject(arg0).createBindGroup(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createBuffer_3eee22ef467812a5: function(arg0) {
            const ret = getObject(arg0).createBuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createBuffer_3fa0256cba655273: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createBuffer(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createBuffer_e400b511fb3baf60: function(arg0) {
            const ret = getObject(arg0).createBuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createCommandEncoder_98e3b731629054b4: function(arg0, arg1) {
            const ret = getObject(arg0).createCommandEncoder(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createElement_a068abd1135f508c: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createFramebuffer_9fd9ffe883d5f4f9: function(arg0) {
            const ret = getObject(arg0).createFramebuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createFramebuffer_d65f221322124a8b: function(arg0) {
            const ret = getObject(arg0).createFramebuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createObjectURL_cdc6fc3e90ad7c7c: function() { return handleError(function (arg0, arg1) {
            const ret = URL.createObjectURL(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_createPipelineLayout_270b4fd0b4230373: function(arg0, arg1) {
            const ret = getObject(arg0).createPipelineLayout(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createProgram_744ae1ca637b4df8: function(arg0) {
            const ret = getObject(arg0).createProgram();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createProgram_74f7cf220dd318c5: function(arg0) {
            const ret = getObject(arg0).createProgram();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createQuery_814abb3e344c2082: function(arg0) {
            const ret = getObject(arg0).createQuery();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createRenderPipeline_4c120add6a62a442: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createRenderPipeline(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createRenderbuffer_ad33f9f6add5c283: function(arg0) {
            const ret = getObject(arg0).createRenderbuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createRenderbuffer_cb42e19f86db5567: function(arg0) {
            const ret = getObject(arg0).createRenderbuffer();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createSampler_7b996de5c3607ccf: function(arg0) {
            const ret = getObject(arg0).createSampler();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createSampler_95bff4f5405a3dd1: function(arg0, arg1) {
            const ret = getObject(arg0).createSampler(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createShaderModule_f0aa469466c7bdaa: function(arg0, arg1) {
            const ret = getObject(arg0).createShaderModule(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_createShader_28d1f39aed6f6ea7: function(arg0, arg1) {
            const ret = getObject(arg0).createShader(arg1 >>> 0);
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createShader_308de86f5111f1e0: function(arg0, arg1) {
            const ret = getObject(arg0).createShader(arg1 >>> 0);
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createTexture_120f922c8079b560: function(arg0) {
            const ret = getObject(arg0).createTexture();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createTexture_28341edbcc7d129e: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createTexture(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_createTexture_9af3549d74c1efe7: function(arg0) {
            const ret = getObject(arg0).createTexture();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createVertexArrayOES_41fe83624f671d25: function(arg0) {
            const ret = getObject(arg0).createVertexArrayOES();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createVertexArray_fab57ac9edb32df2: function(arg0) {
            const ret = getObject(arg0).createVertexArray();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_createView_d04a0f9bdd723238: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).createView(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_ctrlKey_363420cb66040148: function(arg0) {
            const ret = getObject(arg0).ctrlKey;
            return ret;
        },
        __wbg_ctrlKey_6f55f5fdf677d46d: function(arg0) {
            const ret = getObject(arg0).ctrlKey;
            return ret;
        },
        __wbg_cullFace_3afaf79153d46dd7: function(arg0, arg1) {
            getObject(arg0).cullFace(arg1 >>> 0);
        },
        __wbg_cullFace_cf9f2fea99f87be4: function(arg0, arg1) {
            getObject(arg0).cullFace(arg1 >>> 0);
        },
        __wbg_debug_de823612d4d12f74: function(arg0) {
            console.debug(getObject(arg0));
        },
        __wbg_deleteBuffer_27f774025b5a3387: function(arg0, arg1) {
            getObject(arg0).deleteBuffer(getObject(arg1));
        },
        __wbg_deleteBuffer_e001e8a2e4c8e235: function(arg0, arg1) {
            getObject(arg0).deleteBuffer(getObject(arg1));
        },
        __wbg_deleteFramebuffer_46625f9b0a98757e: function(arg0, arg1) {
            getObject(arg0).deleteFramebuffer(getObject(arg1));
        },
        __wbg_deleteFramebuffer_98bf0f1d31b4e143: function(arg0, arg1) {
            getObject(arg0).deleteFramebuffer(getObject(arg1));
        },
        __wbg_deleteProgram_16997527c4be9894: function(arg0, arg1) {
            getObject(arg0).deleteProgram(getObject(arg1));
        },
        __wbg_deleteProgram_f110b5c99821b4b9: function(arg0, arg1) {
            getObject(arg0).deleteProgram(getObject(arg1));
        },
        __wbg_deleteQuery_8c44c36146aa04d9: function(arg0, arg1) {
            getObject(arg0).deleteQuery(getObject(arg1));
        },
        __wbg_deleteRenderbuffer_02bb06f8bb6f19bb: function(arg0, arg1) {
            getObject(arg0).deleteRenderbuffer(getObject(arg1));
        },
        __wbg_deleteRenderbuffer_ca5c2e97f32fc33f: function(arg0, arg1) {
            getObject(arg0).deleteRenderbuffer(getObject(arg1));
        },
        __wbg_deleteSampler_3949766ebf85b35d: function(arg0, arg1) {
            getObject(arg0).deleteSampler(getObject(arg1));
        },
        __wbg_deleteShader_5d08481a80da0905: function(arg0, arg1) {
            getObject(arg0).deleteShader(getObject(arg1));
        },
        __wbg_deleteShader_7519d8c01ef1ba2f: function(arg0, arg1) {
            getObject(arg0).deleteShader(getObject(arg1));
        },
        __wbg_deleteSync_f6b56883ecd76d78: function(arg0, arg1) {
            getObject(arg0).deleteSync(getObject(arg1));
        },
        __wbg_deleteTexture_12dd3b4843826a2a: function(arg0, arg1) {
            getObject(arg0).deleteTexture(getObject(arg1));
        },
        __wbg_deleteTexture_a901f8f2ae7dc7b7: function(arg0, arg1) {
            getObject(arg0).deleteTexture(getObject(arg1));
        },
        __wbg_deleteVertexArrayOES_4020f3cd56383037: function(arg0, arg1) {
            getObject(arg0).deleteVertexArrayOES(getObject(arg1));
        },
        __wbg_deleteVertexArray_7fa0e2a8d64ca1f7: function(arg0, arg1) {
            getObject(arg0).deleteVertexArray(getObject(arg1));
        },
        __wbg_deltaMode_2aecfdef5e66c8ca: function(arg0) {
            const ret = getObject(arg0).deltaMode;
            return ret;
        },
        __wbg_deltaX_301120873537a7bb: function(arg0) {
            const ret = getObject(arg0).deltaX;
            return ret;
        },
        __wbg_deltaY_1b20b57c0cdc82eb: function(arg0) {
            const ret = getObject(arg0).deltaY;
            return ret;
        },
        __wbg_depthFunc_c4e828baa1ce03ad: function(arg0, arg1) {
            getObject(arg0).depthFunc(arg1 >>> 0);
        },
        __wbg_depthFunc_f13ebb3c70c956a4: function(arg0, arg1) {
            getObject(arg0).depthFunc(arg1 >>> 0);
        },
        __wbg_depthMask_2fa06fd002d2901a: function(arg0, arg1) {
            getObject(arg0).depthMask(arg1 !== 0);
        },
        __wbg_depthMask_543637467f96f7d6: function(arg0, arg1) {
            getObject(arg0).depthMask(arg1 !== 0);
        },
        __wbg_depthRange_5563ceb9946b4ff8: function(arg0, arg1, arg2) {
            getObject(arg0).depthRange(arg1, arg2);
        },
        __wbg_depthRange_e4338437c9f76987: function(arg0, arg1, arg2) {
            getObject(arg0).depthRange(arg1, arg2);
        },
        __wbg_description_f6ebcdce701b056b: function(arg0, arg1) {
            const ret = getObject(arg1).description;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_devicePixelContentBoxSize_dc5acb9a3cb7ac6f: function(arg0) {
            const ret = getObject(arg0).devicePixelContentBoxSize;
            return addHeapObject(ret);
        },
        __wbg_devicePixelRatio_ac49e2c3ee11d0ae: function(arg0) {
            const ret = getObject(arg0).devicePixelRatio;
            return ret;
        },
        __wbg_disableVertexAttribArray_332d6d793c9ec549: function(arg0, arg1) {
            getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_disableVertexAttribArray_a34601ffd5864b57: function(arg0, arg1) {
            getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_disable_0558cf9a0c1c04d1: function(arg0, arg1) {
            getObject(arg0).disable(arg1 >>> 0);
        },
        __wbg_disable_c1771c9224e184ca: function(arg0, arg1) {
            getObject(arg0).disable(arg1 >>> 0);
        },
        __wbg_disconnect_790577b2d7a9db03: function(arg0) {
            getObject(arg0).disconnect();
        },
        __wbg_disconnect_c1ccacf88149b67b: function(arg0) {
            getObject(arg0).disconnect();
        },
        __wbg_document_d55773b5c3ef918f: function(arg0) {
            const ret = getObject(arg0).document;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_done_6a8439e544ec6206: function(arg0) {
            const ret = getObject(arg0).done;
            return ret;
        },
        __wbg_drawArraysInstancedANGLE_3d144ac86d881fe1: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).drawArraysInstancedANGLE(arg1 >>> 0, arg2, arg3, arg4);
        },
        __wbg_drawArraysInstanced_9f1a40cb75be3d03: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4);
        },
        __wbg_drawArrays_7515bf5f4ddfeab6: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
        },
        __wbg_drawArrays_a9f65a7f51717dcb: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
        },
        __wbg_drawBuffersWEBGL_d872709057d09966: function(arg0, arg1) {
            getObject(arg0).drawBuffersWEBGL(getObject(arg1));
        },
        __wbg_drawBuffers_118ca97912d36616: function(arg0, arg1) {
            getObject(arg0).drawBuffers(getObject(arg1));
        },
        __wbg_drawElementsInstancedANGLE_bf2de4763c02aa38: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).drawElementsInstancedANGLE(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_drawElementsInstanced_f8787035894b4837: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).drawElementsInstanced(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_drawIndexed_cc7c04c1088cafad: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).drawIndexed(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4, arg5 >>> 0);
        },
        __wbg_enableVertexAttribArray_c4918036bc4d203c: function(arg0, arg1) {
            getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_enableVertexAttribArray_fbb90cc4a851b9fa: function(arg0, arg1) {
            getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
        },
        __wbg_enable_567958f55a1969f0: function(arg0, arg1) {
            getObject(arg0).enable(arg1 >>> 0);
        },
        __wbg_enable_b9c75f135f35c140: function(arg0, arg1) {
            getObject(arg0).enable(arg1 >>> 0);
        },
        __wbg_endQuery_95a9c38e57fa6cdb: function(arg0, arg1) {
            getObject(arg0).endQuery(arg1 >>> 0);
        },
        __wbg_end_d49513b309f4ca43: function(arg0) {
            getObject(arg0).end();
        },
        __wbg_error_6651fee1c71e5da9: function(arg0) {
            console.error(getObject(arg0));
        },
        __wbg_error_9a99766f65a03031: function(arg0, arg1) {
            console.error(getObject(arg0), getObject(arg1));
        },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_export4(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_features_6906f30d3b243f58: function(arg0) {
            const ret = getObject(arg0).features;
            return addHeapObject(ret);
        },
        __wbg_fenceSync_3a87752588c96cfd: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).fenceSync(arg1 >>> 0, arg2 >>> 0);
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_fetch_22858a12fcf93152: function(arg0, arg1) {
            const ret = getObject(arg0).fetch(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_fetch_fda7bc27c982b1f3: function(arg0) {
            const ret = fetch(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_finish_6c7bba424ffe1bbc: function(arg0, arg1) {
            const ret = getObject(arg0).finish(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_finish_c40b67ff2af88e0c: function(arg0) {
            const ret = getObject(arg0).finish();
            return addHeapObject(ret);
        },
        __wbg_flush_be10c320fb9d105e: function(arg0) {
            getObject(arg0).flush();
        },
        __wbg_flush_f684b8e11c5c8e00: function(arg0) {
            getObject(arg0).flush();
        },
        __wbg_focus_a1edac02309458d7: function() { return handleError(function (arg0) {
            getObject(arg0).focus();
        }, arguments); },
        __wbg_framebufferRenderbuffer_3e865f788203300b: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
        },
        __wbg_framebufferRenderbuffer_455cfd3dfb0ed574: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
        },
        __wbg_framebufferTexture2D_100308e19a34d196: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
        },
        __wbg_framebufferTexture2D_68e724d71dfebb63: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
        },
        __wbg_framebufferTextureLayer_1722784447323b96: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).framebufferTextureLayer(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
        },
        __wbg_framebufferTextureMultiviewOVR_c04dc9526eaa9735: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).framebufferTextureMultiviewOVR(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5, arg6);
        },
        __wbg_frontFace_5fe25e1a2fa1db8f: function(arg0, arg1) {
            getObject(arg0).frontFace(arg1 >>> 0);
        },
        __wbg_frontFace_bf186340dad6d1d1: function(arg0, arg1) {
            getObject(arg0).frontFace(arg1 >>> 0);
        },
        __wbg_fullscreenElement_d94f484a0afb7d04: function(arg0) {
            const ret = getObject(arg0).fullscreenElement;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_getBufferSubData_c8cdd8cc740f3f8d: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).getBufferSubData(arg1 >>> 0, arg2, getObject(arg3));
        },
        __wbg_getCoalescedEvents_c899c5928697ea79: function(arg0) {
            const ret = getObject(arg0).getCoalescedEvents;
            return addHeapObject(ret);
        },
        __wbg_getCoalescedEvents_e4e8bf52b423d2fe: function(arg0) {
            const ret = getObject(arg0).getCoalescedEvents();
            return addHeapObject(ret);
        },
        __wbg_getComputedStyle_724fc09a74766a0a: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).getComputedStyle(getObject(arg1));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getContext_72f90d218519cc6f: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getContext_7992302f330ef3cd: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getContext_d94b1167343dea18: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getContext_db5f8ccb275883ba: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getCurrentTexture_274b67f871b2dea5: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).getCurrentTexture();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getElementById_4d387870cd6176ee: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getElementById(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_getExtension_1db27d470ae8103f: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_getIndexedParameter_ab64f267b238dd95: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getIndexedParameter(arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getMappedRange_59829576da3edd39: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).getMappedRange(arg1, arg2);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getOwnPropertyDescriptor_97664030ca4278df: function(arg0, arg1) {
            const ret = Object.getOwnPropertyDescriptor(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_getParameter_751c8e1dc3e5bba5: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).getParameter(arg1 >>> 0);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getParameter_e7234edd66ee1573: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).getParameter(arg1 >>> 0);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getPreferredCanvasFormat_6f629398d892f0c9: function(arg0) {
            const ret = getObject(arg0).getPreferredCanvasFormat();
            return (__wbindgen_enum_GpuTextureFormat.indexOf(ret) + 1 || 96) - 1;
        },
        __wbg_getProgramInfoLog_6239b67f01a5bccd: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getProgramInfoLog_d62fcc48f92f5e9f: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getProgramParameter_9f628958e92d89b6: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getProgramParameter_ae3b8bc3cd665250: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getPropertyValue_5e1e02e003b445e8: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg1).getPropertyValue(getStringFromWasm0(arg2, arg3));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_getQueryParameter_de2356f272ece6a0: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getQueryParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getRandomValues_6f269dae5feacb57: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_getShaderInfoLog_2dbb69acdd9fd6f7: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getShaderInfoLog_ebc18e20cbeaabc7: function(arg0, arg1, arg2) {
            const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_getShaderParameter_adafcf4481d705b9: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getShaderParameter_d696375a64186e76: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getSupportedExtensions_85fc998eea04438f: function(arg0) {
            const ret = getObject(arg0).getSupportedExtensions();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_getSupportedProfiles_0592cdc48e91db2e: function(arg0) {
            const ret = getObject(arg0).getSupportedProfiles();
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_getSyncParameter_a9d515e006d4e525: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).getSyncParameter(getObject(arg1), arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_getUniformBlockIndex_75435d088d5f8986: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getUniformBlockIndex(getObject(arg1), getStringFromWasm0(arg2, arg3));
            return ret;
        },
        __wbg_getUniformLocation_26d9ffb74889272a: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_getUniformLocation_cf90723039c34106: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_get_44e98e27bda25b5b: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_get_4b90d6d8c5deb5d5: function(arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return addHeapObject(ret);
        },
        __wbg_get_52a8a619f7b88df6: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_get_eea7f83fe704ff33: function(arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_get_unchecked_46e778e3cec74b5e: function(arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return addHeapObject(ret);
        },
        __wbg_gpu_cbd27ad0589bc0b3: function(arg0) {
            const ret = getObject(arg0).gpu;
            return addHeapObject(ret);
        },
        __wbg_has_14676d88c1340d2c: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.has(getObject(arg0), getObject(arg1));
            return ret;
        }, arguments); },
        __wbg_has_dbcaf77712624019: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).has(getStringFromWasm0(arg1, arg2));
            return ret;
        },
        __wbg_headers_5b19cf40627ae54d: function(arg0) {
            const ret = getObject(arg0).headers;
            return addHeapObject(ret);
        },
        __wbg_height_ed760e69ef147210: function(arg0) {
            const ret = getObject(arg0).height;
            return ret;
        },
        __wbg_includes_50f6164d20ad5880: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).includes(getObject(arg1), arg2);
            return ret;
        },
        __wbg_info_91a8fcd51fd17fff: function(arg0) {
            const ret = getObject(arg0).info;
            return addHeapObject(ret);
        },
        __wbg_info_a2b5f8a5dae8b26c: function(arg0) {
            console.info(getObject(arg0));
        },
        __wbg_inlineSize_d5346be3bfe33dbd: function(arg0) {
            const ret = getObject(arg0).inlineSize;
            return ret;
        },
        __wbg_instanceof_GpuAdapter_1297a3a5ce0db3ff: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof GPUAdapter;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_GpuCanvasContext_13613277d7bf3768: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof GPUCanvasContext;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_HtmlCanvasElement_089857e172ddb0f6: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof HTMLCanvasElement;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Response_36a65a969abaa7c6: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Response;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_WebGl2RenderingContext_1cfc6500e39107b3: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof WebGL2RenderingContext;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Window_9e0fe7d3d1ff4342: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Window;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_invalidateFramebuffer_fe60e5ec3ba6fc19: function() { return handleError(function (arg0, arg1, arg2) {
            getObject(arg0).invalidateFramebuffer(arg1 >>> 0, getObject(arg2));
        }, arguments); },
        __wbg_isIntersecting_de6d5f80b1cab4b5: function(arg0) {
            const ret = getObject(arg0).isIntersecting;
            return ret;
        },
        __wbg_is_edd40bac2fc20257: function(arg0, arg1) {
            const ret = Object.is(getObject(arg0), getObject(arg1));
            return ret;
        },
        __wbg_iterator_9b36cebf3be7b7cd: function() {
            const ret = Symbol.iterator;
            return addHeapObject(ret);
        },
        __wbg_key_e8b7dc679c6f4230: function(arg0, arg1) {
            const ret = getObject(arg1).key;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_label_9a8583e3a20fafc7: function(arg0, arg1) {
            const ret = getObject(arg1).label;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_length_68a9d5278d084f4f: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_length_fb04d16d7bdf6d4c: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_limits_25f7265ea0cad6c5: function(arg0) {
            const ret = getObject(arg0).limits;
            return addHeapObject(ret);
        },
        __wbg_linkProgram_2d8e6a45b85f995e: function(arg0, arg1) {
            getObject(arg0).linkProgram(getObject(arg1));
        },
        __wbg_linkProgram_eaa776d135e872d2: function(arg0, arg1) {
            getObject(arg0).linkProgram(getObject(arg1));
        },
        __wbg_location_4328ac1e8cc7a9f4: function(arg0) {
            const ret = getObject(arg0).location;
            return addHeapObject(ret);
        },
        __wbg_location_ef0c1ba11ab127c5: function(arg0) {
            const ret = getObject(arg0).location;
            return ret;
        },
        __wbg_log_6614a4effdb4e983: function(arg0) {
            console.log(getObject(arg0));
        },
        __wbg_mapAsync_e3cfbd141919d03c: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).mapAsync(arg1 >>> 0, arg2, arg3);
            return addHeapObject(ret);
        },
        __wbg_matchMedia_c1e53cebdfcbacbe: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_matches_530db209566ac149: function(arg0) {
            const ret = getObject(arg0).matches;
            return ret;
        },
        __wbg_maxBindGroups_7e4965b5daa53b23: function(arg0) {
            const ret = getObject(arg0).maxBindGroups;
            return ret;
        },
        __wbg_maxBindingsPerBindGroup_5d11588150650215: function(arg0) {
            const ret = getObject(arg0).maxBindingsPerBindGroup;
            return ret;
        },
        __wbg_maxBufferSize_b59f147488bf047a: function(arg0) {
            const ret = getObject(arg0).maxBufferSize;
            return ret;
        },
        __wbg_maxColorAttachmentBytesPerSample_726ea37aedfb839a: function(arg0) {
            const ret = getObject(arg0).maxColorAttachmentBytesPerSample;
            return ret;
        },
        __wbg_maxColorAttachments_62ecca7ef94d78e4: function(arg0) {
            const ret = getObject(arg0).maxColorAttachments;
            return ret;
        },
        __wbg_maxComputeInvocationsPerWorkgroup_a14458d75e0b90ac: function(arg0) {
            const ret = getObject(arg0).maxComputeInvocationsPerWorkgroup;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeX_6b8c17d5e4738e77: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupSizeX;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeY_13b5de41c6e0bc2a: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupSizeY;
            return ret;
        },
        __wbg_maxComputeWorkgroupSizeZ_b12d7f3e670aa0a2: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupSizeZ;
            return ret;
        },
        __wbg_maxComputeWorkgroupStorageSize_886498bc3b0baa23: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupStorageSize;
            return ret;
        },
        __wbg_maxComputeWorkgroupsPerDimension_144b6bbf6ac24451: function(arg0) {
            const ret = getObject(arg0).maxComputeWorkgroupsPerDimension;
            return ret;
        },
        __wbg_maxDynamicStorageBuffersPerPipelineLayout_d81239ef90f4f920: function(arg0) {
            const ret = getObject(arg0).maxDynamicStorageBuffersPerPipelineLayout;
            return ret;
        },
        __wbg_maxDynamicUniformBuffersPerPipelineLayout_0cca7d1cb9e5adf7: function(arg0) {
            const ret = getObject(arg0).maxDynamicUniformBuffersPerPipelineLayout;
            return ret;
        },
        __wbg_maxInterStageShaderVariables_4504147f810dd43d: function(arg0) {
            const ret = getObject(arg0).maxInterStageShaderVariables;
            return ret;
        },
        __wbg_maxSampledTexturesPerShaderStage_54e5ed0537676c83: function(arg0) {
            const ret = getObject(arg0).maxSampledTexturesPerShaderStage;
            return ret;
        },
        __wbg_maxSamplersPerShaderStage_71315fab0d7f34b1: function(arg0) {
            const ret = getObject(arg0).maxSamplersPerShaderStage;
            return ret;
        },
        __wbg_maxStorageBufferBindingSize_779fd522aaaa6f90: function(arg0) {
            const ret = getObject(arg0).maxStorageBufferBindingSize;
            return ret;
        },
        __wbg_maxStorageBuffersPerShaderStage_c99b4f72aaf19e34: function(arg0) {
            const ret = getObject(arg0).maxStorageBuffersPerShaderStage;
            return ret;
        },
        __wbg_maxStorageTexturesPerShaderStage_5403c17d11da5280: function(arg0) {
            const ret = getObject(arg0).maxStorageTexturesPerShaderStage;
            return ret;
        },
        __wbg_maxTextureArrayLayers_eca9fa36b3d46099: function(arg0) {
            const ret = getObject(arg0).maxTextureArrayLayers;
            return ret;
        },
        __wbg_maxTextureDimension1D_a7d9d7ecd19aae9b: function(arg0) {
            const ret = getObject(arg0).maxTextureDimension1D;
            return ret;
        },
        __wbg_maxTextureDimension2D_c6a3937eb3ab18df: function(arg0) {
            const ret = getObject(arg0).maxTextureDimension2D;
            return ret;
        },
        __wbg_maxTextureDimension3D_d941aa547d9e0801: function(arg0) {
            const ret = getObject(arg0).maxTextureDimension3D;
            return ret;
        },
        __wbg_maxUniformBufferBindingSize_1e8c92a2094b7ce7: function(arg0) {
            const ret = getObject(arg0).maxUniformBufferBindingSize;
            return ret;
        },
        __wbg_maxUniformBuffersPerShaderStage_83cde6650612f178: function(arg0) {
            const ret = getObject(arg0).maxUniformBuffersPerShaderStage;
            return ret;
        },
        __wbg_maxVertexAttributes_dd313a3540d56e88: function(arg0) {
            const ret = getObject(arg0).maxVertexAttributes;
            return ret;
        },
        __wbg_maxVertexBufferArrayStride_6fd082d9954d1f4a: function(arg0) {
            const ret = getObject(arg0).maxVertexBufferArrayStride;
            return ret;
        },
        __wbg_maxVertexBuffers_bbd14712ac158c6f: function(arg0) {
            const ret = getObject(arg0).maxVertexBuffers;
            return ret;
        },
        __wbg_metaKey_7ba420410fbe0029: function(arg0) {
            const ret = getObject(arg0).metaKey;
            return ret;
        },
        __wbg_metaKey_80dabb1751285aaf: function(arg0) {
            const ret = getObject(arg0).metaKey;
            return ret;
        },
        __wbg_minStorageBufferOffsetAlignment_726c386298254510: function(arg0) {
            const ret = getObject(arg0).minStorageBufferOffsetAlignment;
            return ret;
        },
        __wbg_minUniformBufferOffsetAlignment_6df1f95f5974788e: function(arg0) {
            const ret = getObject(arg0).minUniformBufferOffsetAlignment;
            return ret;
        },
        __wbg_movementX_9fcb6700b1fcecd2: function(arg0) {
            const ret = getObject(arg0).movementX;
            return ret;
        },
        __wbg_movementY_46e3112a7b24bd5c: function(arg0) {
            const ret = getObject(arg0).movementY;
            return ret;
        },
        __wbg_navigator_ae969bd3f24874ad: function(arg0) {
            const ret = getObject(arg0).navigator;
            return addHeapObject(ret);
        },
        __wbg_navigator_e8073f0771c8d619: function(arg0) {
            const ret = getObject(arg0).navigator;
            return addHeapObject(ret);
        },
        __wbg_new_0b303268aa395a38: function() {
            const ret = new Array();
            return addHeapObject(ret);
        },
        __wbg_new_0c89781c6976cbad: function() { return handleError(function () {
            const ret = new MessageChannel();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_189262ff31890c23: function() { return handleError(function () {
            const ret = new Headers();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_20b778a4c5c691c3: function() {
            const ret = new Object();
            return addHeapObject(ret);
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return addHeapObject(ret);
        },
        __wbg_new_24739629d416f982: function() { return handleError(function () {
            const ret = new AbortController();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_3250b39a83ceee43: function() { return handleError(function (arg0) {
            const ret = new ResizeObserver(getObject(arg0));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_5cda6f0df30df939: function() { return handleError(function (arg0, arg1) {
            const ret = new Worker(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_b06772b280cc6e52: function(arg0) {
            const ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_new_eb55b00114137580: function() { return handleError(function (arg0) {
            const ret = new IntersectionObserver(getObject(arg0));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_from_slice_bb2d1778c0b87eb1: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_new_with_byte_offset_and_length_9e1e664fe1a5d385: function(arg0, arg1, arg2) {
            const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
            return addHeapObject(ret);
        },
        __wbg_new_with_str_and_init_df876572184fe639: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_with_str_sequence_and_options_028ac118a53ac584: function() { return handleError(function (arg0, arg1) {
            const ret = new Blob(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_next_8cb028b6ba50743f: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).next();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_next_cfd0b146c9538df8: function(arg0) {
            const ret = getObject(arg0).next;
            return addHeapObject(ret);
        },
        __wbg_now_ca637c227626a93d: function(arg0) {
            const ret = getObject(arg0).now();
            return ret;
        },
        __wbg_now_e7c6795a7f81e10f: function(arg0) {
            const ret = getObject(arg0).now();
            return ret;
        },
        __wbg_observe_2b3dc9f689d3e95c: function(arg0, arg1) {
            getObject(arg0).observe(getObject(arg1));
        },
        __wbg_observe_9486ccd538d1388b: function(arg0, arg1, arg2) {
            getObject(arg0).observe(getObject(arg1), getObject(arg2));
        },
        __wbg_observe_d3d76de1a2633595: function(arg0, arg1) {
            getObject(arg0).observe(getObject(arg1));
        },
        __wbg_of_472cbb5aebb61f18: function(arg0, arg1) {
            const ret = Array.of(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_of_5188689822ff45d7: function(arg0) {
            const ret = Array.of(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_offsetX_2568738a047ccf26: function(arg0) {
            const ret = getObject(arg0).offsetX;
            return ret;
        },
        __wbg_offsetY_424e2b3a186cc4dc: function(arg0) {
            const ret = getObject(arg0).offsetY;
            return ret;
        },
        __wbg_onSubmittedWorkDone_5f36409816d68e04: function(arg0) {
            const ret = getObject(arg0).onSubmittedWorkDone();
            return addHeapObject(ret);
        },
        __wbg_origin_b5445a524d0b5b7d: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg1).origin;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_performance_3fcf6e32a7e1ed0a: function(arg0) {
            const ret = getObject(arg0).performance;
            return addHeapObject(ret);
        },
        __wbg_persisted_d5e8453dbb6bccc9: function(arg0) {
            const ret = getObject(arg0).persisted;
            return ret;
        },
        __wbg_pixelStorei_0f8b203cc0e11658: function(arg0, arg1, arg2) {
            getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
        },
        __wbg_pixelStorei_ba4a6fbc2db4412a: function(arg0, arg1, arg2) {
            getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
        },
        __wbg_play_316c4cc8eacd5080: function(arg0) {
            getObject(arg0).play();
        },
        __wbg_pointerId_4b1e6e847e71fc9b: function(arg0) {
            const ret = getObject(arg0).pointerId;
            return ret;
        },
        __wbg_pointerType_1e31eb76803e9132: function(arg0, arg1) {
            const ret = getObject(arg1).pointerType;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_polygonOffset_5b52dcbb400074c1: function(arg0, arg1, arg2) {
            getObject(arg0).polygonOffset(arg1, arg2);
        },
        __wbg_polygonOffset_8946fa0d1627adaf: function(arg0, arg1, arg2) {
            getObject(arg0).polygonOffset(arg1, arg2);
        },
        __wbg_port1_858012edc4156184: function(arg0) {
            const ret = getObject(arg0).port1;
            return addHeapObject(ret);
        },
        __wbg_port2_6702054a0779ba52: function(arg0) {
            const ret = getObject(arg0).port2;
            return addHeapObject(ret);
        },
        __wbg_postMessage_21fb282d714ee279: function() { return handleError(function (arg0, arg1, arg2) {
            getObject(arg0).postMessage(getObject(arg1), getObject(arg2));
        }, arguments); },
        __wbg_postMessage_baa87c96ec8a2c44: function() { return handleError(function (arg0, arg1) {
            getObject(arg0).postMessage(getObject(arg1));
        }, arguments); },
        __wbg_postTask_8160dabdf67696f2: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).postTask(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        },
        __wbg_pressure_f383ce66288222fe: function(arg0) {
            const ret = getObject(arg0).pressure;
            return ret;
        },
        __wbg_preventDefault_527d6b8fa0ada113: function(arg0) {
            getObject(arg0).preventDefault();
        },
        __wbg_prototype_046c529fe134ac0f: function() {
            const ret = ResizeObserverEntry.prototype;
            return addHeapObject(ret);
        },
        __wbg_prototypesetcall_956c7493c68e29b4: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
        },
        __wbg_push_ceb8ef046afb2041: function(arg0, arg1) {
            const ret = getObject(arg0).push(getObject(arg1));
            return ret;
        },
        __wbg_queryCounterEXT_c7fc83a7f9f535bc: function(arg0, arg1, arg2) {
            getObject(arg0).queryCounterEXT(getObject(arg1), arg2 >>> 0);
        },
        __wbg_querySelectorAll_655c745bb393d7a8: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).querySelectorAll(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_querySelector_c793f4a366b2df9e: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).querySelector(getStringFromWasm0(arg1, arg2));
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        }, arguments); },
        __wbg_queueMicrotask_4698f900840e3286: function(arg0) {
            queueMicrotask(getObject(arg0));
        },
        __wbg_queueMicrotask_477a5533c7100338: function(arg0) {
            const ret = getObject(arg0).queueMicrotask;
            return addHeapObject(ret);
        },
        __wbg_queueMicrotask_d1889cf890509373: function(arg0, arg1) {
            getObject(arg0).queueMicrotask(getObject(arg1));
        },
        __wbg_queue_7bbf92178b06da19: function(arg0) {
            const ret = getObject(arg0).queue;
            return addHeapObject(ret);
        },
        __wbg_readBuffer_fe780eeb3d98a77a: function(arg0, arg1) {
            getObject(arg0).readBuffer(arg1 >>> 0);
        },
        __wbg_readPixels_2f074a34c10edf35: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7);
        }, arguments); },
        __wbg_readPixels_6a9da58f021535b1: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
        }, arguments); },
        __wbg_readPixels_d961289eace37b34: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
        }, arguments); },
        __wbg_removeEventListener_50cdd1c1ebf3473c: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
        }, arguments); },
        __wbg_removeListener_1fa86a79067ced36: function() { return handleError(function (arg0, arg1) {
            getObject(arg0).removeListener(getObject(arg1));
        }, arguments); },
        __wbg_removeProperty_878a94a14168ea6d: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg1).removeProperty(getStringFromWasm0(arg2, arg3));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_renderbufferStorageMultisample_ee94f1104bbb5049: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).renderbufferStorageMultisample(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_renderbufferStorage_4ee62ad08f09d32e: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
        },
        __wbg_renderbufferStorage_55c5450114b7e467: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
        },
        __wbg_repeat_07c7e0a532abf9bf: function(arg0) {
            const ret = getObject(arg0).repeat;
            return ret;
        },
        __wbg_requestAdapter_0049683abd339828: function(arg0, arg1) {
            const ret = getObject(arg0).requestAdapter(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_requestAnimationFrame_f6b46542f80cd632: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
            return ret;
        }, arguments); },
        __wbg_requestDevice_921f0a221b4492fa: function(arg0, arg1) {
            const ret = getObject(arg0).requestDevice(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_requestFullscreen_4cb8a9d1259e6f49: function(arg0) {
            const ret = getObject(arg0).requestFullscreen();
            return addHeapObject(ret);
        },
        __wbg_requestFullscreen_ef29f84f835e139d: function(arg0) {
            const ret = getObject(arg0).requestFullscreen;
            return addHeapObject(ret);
        },
        __wbg_requestIdleCallback_07025870c54aad96: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).requestIdleCallback(getObject(arg1));
            return ret;
        }, arguments); },
        __wbg_requestIdleCallback_f82216c5083f2d51: function(arg0) {
            const ret = getObject(arg0).requestIdleCallback;
            return addHeapObject(ret);
        },
        __wbg_resolve_0183de2e8c6b1d54: function(arg0) {
            const ret = Promise.resolve(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_revokeObjectURL_96e760616976ebe5: function() { return handleError(function (arg0, arg1) {
            URL.revokeObjectURL(getStringFromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_samplerParameterf_d6cc053b72eaf516: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).samplerParameterf(getObject(arg1), arg2 >>> 0, arg3);
        },
        __wbg_samplerParameteri_ffed0cdfba7a7d89: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).samplerParameteri(getObject(arg1), arg2 >>> 0, arg3);
        },
        __wbg_scheduler_2c8a0cf402872076: function(arg0) {
            const ret = getObject(arg0).scheduler;
            return addHeapObject(ret);
        },
        __wbg_scheduler_49c6dc78d3b07157: function(arg0) {
            const ret = getObject(arg0).scheduler;
            return addHeapObject(ret);
        },
        __wbg_scissor_9c1228fc24687f84: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).scissor(arg1, arg2, arg3, arg4);
        },
        __wbg_scissor_cbf75d28fdc87e8c: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).scissor(arg1, arg2, arg3, arg4);
        },
        __wbg_search_6dd659452c59d41e: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg1).search;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_setAttribute_68c00da2a51113e3: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_setBindGroup_851043cf286f55f2: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2), getArrayU32FromWasm0(arg3, arg4), arg5, arg6 >>> 0);
        }, arguments); },
        __wbg_setBindGroup_b546d112a2d27da3: function(arg0, arg1, arg2) {
            getObject(arg0).setBindGroup(arg1 >>> 0, getObject(arg2));
        },
        __wbg_setIndexBuffer_994771910f4a92bf: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).setIndexBuffer(getObject(arg1), __wbindgen_enum_GpuIndexFormat[arg2], arg3);
        },
        __wbg_setIndexBuffer_f0aa83f423c3ea49: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).setIndexBuffer(getObject(arg1), __wbindgen_enum_GpuIndexFormat[arg2], arg3, arg4);
        },
        __wbg_setPipeline_b0ecc74bdf8be629: function(arg0, arg1) {
            getObject(arg0).setPipeline(getObject(arg1));
        },
        __wbg_setPointerCapture_e0ba6580c51653b5: function() { return handleError(function (arg0, arg1) {
            getObject(arg0).setPointerCapture(arg1);
        }, arguments); },
        __wbg_setProperty_104b9a3bfd0f103f: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_setTimeout_0fa379e1cf0e30c4: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
            return ret;
        }, arguments); },
        __wbg_setTimeout_22ea9e31c3380793: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).setTimeout(getObject(arg1));
            return ret;
        }, arguments); },
        __wbg_setVertexBuffer_1d85cc2da6e137a7: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3, arg4);
        },
        __wbg_setVertexBuffer_7f434cea2ca9b640: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).setVertexBuffer(arg1 >>> 0, getObject(arg2), arg3);
        },
        __wbg_set_67722109853a4daf: function(arg0, arg1, arg2) {
            getObject(arg0).set(getObject(arg1), arg2 >>> 0);
        },
        __wbg_set_a6ba3ac0e634b822: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
            return ret;
        }, arguments); },
        __wbg_set_a_66601ffa2f4cbde8: function(arg0, arg1) {
            getObject(arg0).a = arg1;
        },
        __wbg_set_access_08d6bdbda9aaa266: function(arg0, arg1) {
            getObject(arg0).access = __wbindgen_enum_GpuStorageTextureAccess[arg1];
        },
        __wbg_set_address_mode_u_f80c73fc36e83289: function(arg0, arg1) {
            getObject(arg0).addressModeU = __wbindgen_enum_GpuAddressMode[arg1];
        },
        __wbg_set_address_mode_v_3dee7a0095c326a6: function(arg0, arg1) {
            getObject(arg0).addressModeV = __wbindgen_enum_GpuAddressMode[arg1];
        },
        __wbg_set_address_mode_w_e2be52f6efa2d9c7: function(arg0, arg1) {
            getObject(arg0).addressModeW = __wbindgen_enum_GpuAddressMode[arg1];
        },
        __wbg_set_alpha_bb6680aaf01cdc62: function(arg0, arg1) {
            getObject(arg0).alpha = getObject(arg1);
        },
        __wbg_set_alpha_mode_84140629c3b15c51: function(arg0, arg1) {
            getObject(arg0).alphaMode = __wbindgen_enum_GpuCanvasAlphaMode[arg1];
        },
        __wbg_set_alpha_to_coverage_enabled_cac9212446be9cab: function(arg0, arg1) {
            getObject(arg0).alphaToCoverageEnabled = arg1 !== 0;
        },
        __wbg_set_array_layer_count_01e36293bee85e02: function(arg0, arg1) {
            getObject(arg0).arrayLayerCount = arg1 >>> 0;
        },
        __wbg_set_array_stride_34f4a147a16bff79: function(arg0, arg1) {
            getObject(arg0).arrayStride = arg1;
        },
        __wbg_set_aspect_0675b2844dd12eb1: function(arg0, arg1) {
            getObject(arg0).aspect = __wbindgen_enum_GpuTextureAspect[arg1];
        },
        __wbg_set_aspect_e09cb246c2df6f46: function(arg0, arg1) {
            getObject(arg0).aspect = __wbindgen_enum_GpuTextureAspect[arg1];
        },
        __wbg_set_attributes_7ee8e82215809bfa: function(arg0, arg1) {
            getObject(arg0).attributes = getObject(arg1);
        },
        __wbg_set_b_103abfb3e69345a3: function(arg0, arg1) {
            getObject(arg0).b = arg1;
        },
        __wbg_set_base_array_layer_ff3450be9aa7d232: function(arg0, arg1) {
            getObject(arg0).baseArrayLayer = arg1 >>> 0;
        },
        __wbg_set_base_mip_level_43e77e5d237ede24: function(arg0, arg1) {
            getObject(arg0).baseMipLevel = arg1 >>> 0;
        },
        __wbg_set_beginning_of_pass_write_index_abea1e4e6c6095e1: function(arg0, arg1) {
            getObject(arg0).beginningOfPassWriteIndex = arg1 >>> 0;
        },
        __wbg_set_bind_group_layouts_078241cf2822c39e: function(arg0, arg1) {
            getObject(arg0).bindGroupLayouts = getObject(arg1);
        },
        __wbg_set_binding_d683cd9c1d4bcfed: function(arg0, arg1) {
            getObject(arg0).binding = arg1 >>> 0;
        },
        __wbg_set_binding_e9ba14423117de0a: function(arg0, arg1) {
            getObject(arg0).binding = arg1 >>> 0;
        },
        __wbg_set_blend_9eab91d6edf500f9: function(arg0, arg1) {
            getObject(arg0).blend = getObject(arg1);
        },
        __wbg_set_body_d1153b16a2b95ca1: function(arg0, arg1) {
            getObject(arg0).body = getObject(arg1);
        },
        __wbg_set_box_0fc5193d2e1f2640: function(arg0, arg1) {
            getObject(arg0).box = __wbindgen_enum_ResizeObserverBoxOptions[arg1];
        },
        __wbg_set_buffer_598ab98a251b8f91: function(arg0, arg1) {
            getObject(arg0).buffer = getObject(arg1);
        },
        __wbg_set_buffer_73d9f6fea9c41867: function(arg0, arg1) {
            getObject(arg0).buffer = getObject(arg1);
        },
        __wbg_set_buffers_93f3f75d7338864f: function(arg0, arg1) {
            getObject(arg0).buffers = getObject(arg1);
        },
        __wbg_set_bytes_per_row_0bdd54b7fc03c765: function(arg0, arg1) {
            getObject(arg0).bytesPerRow = arg1 >>> 0;
        },
        __wbg_set_clear_value_c1a82bbe9a80b6ab: function(arg0, arg1) {
            getObject(arg0).clearValue = getObject(arg1);
        },
        __wbg_set_code_6a0d763da082dcfb: function(arg0, arg1, arg2) {
            getObject(arg0).code = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_color_495aa415ae5a39c9: function(arg0, arg1) {
            getObject(arg0).color = getObject(arg1);
        },
        __wbg_set_color_attachments_6705c6b1e98a3040: function(arg0, arg1) {
            getObject(arg0).colorAttachments = getObject(arg1);
        },
        __wbg_set_compare_8aedfdbdc96ff4d7: function(arg0, arg1) {
            getObject(arg0).compare = __wbindgen_enum_GpuCompareFunction[arg1];
        },
        __wbg_set_compare_a9a06469832600ec: function(arg0, arg1) {
            getObject(arg0).compare = __wbindgen_enum_GpuCompareFunction[arg1];
        },
        __wbg_set_count_34ecf81b3ad7e448: function(arg0, arg1) {
            getObject(arg0).count = arg1 >>> 0;
        },
        __wbg_set_credentials_e9120ed88b1fc0b8: function(arg0, arg1) {
            getObject(arg0).credentials = __wbindgen_enum_RequestCredentials[arg1];
        },
        __wbg_set_cull_mode_8e533f32672a379b: function(arg0, arg1) {
            getObject(arg0).cullMode = __wbindgen_enum_GpuCullMode[arg1];
        },
        __wbg_set_depth_bias_07f95aa380a3e46e: function(arg0, arg1) {
            getObject(arg0).depthBias = arg1;
        },
        __wbg_set_depth_bias_clamp_968b03f74984c77b: function(arg0, arg1) {
            getObject(arg0).depthBiasClamp = arg1;
        },
        __wbg_set_depth_bias_slope_scale_478b204b4910400f: function(arg0, arg1) {
            getObject(arg0).depthBiasSlopeScale = arg1;
        },
        __wbg_set_depth_clear_value_25268aa6b7cae2e0: function(arg0, arg1) {
            getObject(arg0).depthClearValue = arg1;
        },
        __wbg_set_depth_compare_c017fcac5327dfbb: function(arg0, arg1) {
            getObject(arg0).depthCompare = __wbindgen_enum_GpuCompareFunction[arg1];
        },
        __wbg_set_depth_fail_op_8484012cd5e4987c: function(arg0, arg1) {
            getObject(arg0).depthFailOp = __wbindgen_enum_GpuStencilOperation[arg1];
        },
        __wbg_set_depth_load_op_ed90e4eaf314a16c: function(arg0, arg1) {
            getObject(arg0).depthLoadOp = __wbindgen_enum_GpuLoadOp[arg1];
        },
        __wbg_set_depth_or_array_layers_f8981011496f12e7: function(arg0, arg1) {
            getObject(arg0).depthOrArrayLayers = arg1 >>> 0;
        },
        __wbg_set_depth_read_only_90cca09674f446be: function(arg0, arg1) {
            getObject(arg0).depthReadOnly = arg1 !== 0;
        },
        __wbg_set_depth_stencil_attachment_be8301fa499cd3db: function(arg0, arg1) {
            getObject(arg0).depthStencilAttachment = getObject(arg1);
        },
        __wbg_set_depth_stencil_d536398c1b29bb38: function(arg0, arg1) {
            getObject(arg0).depthStencil = getObject(arg1);
        },
        __wbg_set_depth_store_op_8e9b1d0e47077643: function(arg0, arg1) {
            getObject(arg0).depthStoreOp = __wbindgen_enum_GpuStoreOp[arg1];
        },
        __wbg_set_depth_write_enabled_adc2094871d66639: function(arg0, arg1) {
            getObject(arg0).depthWriteEnabled = arg1 !== 0;
        },
        __wbg_set_device_47147a331245777f: function(arg0, arg1) {
            getObject(arg0).device = getObject(arg1);
        },
        __wbg_set_dimension_b4da3979dc699ef8: function(arg0, arg1) {
            getObject(arg0).dimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
        },
        __wbg_set_dimension_d4f0c50e75083b7f: function(arg0, arg1) {
            getObject(arg0).dimension = __wbindgen_enum_GpuTextureDimension[arg1];
        },
        __wbg_set_dst_factor_e44fc612d5e5bff4: function(arg0, arg1) {
            getObject(arg0).dstFactor = __wbindgen_enum_GpuBlendFactor[arg1];
        },
        __wbg_set_end_of_pass_write_index_1cd39b9bafe090cc: function(arg0, arg1) {
            getObject(arg0).endOfPassWriteIndex = arg1 >>> 0;
        },
        __wbg_set_entries_070b048e4bea0c29: function(arg0, arg1) {
            getObject(arg0).entries = getObject(arg1);
        },
        __wbg_set_entries_f9b7f3d4e9faccf4: function(arg0, arg1) {
            getObject(arg0).entries = getObject(arg1);
        },
        __wbg_set_entry_point_0116a9f5d58cf0aa: function(arg0, arg1, arg2) {
            getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_entry_point_f04e91eced449196: function(arg0, arg1, arg2) {
            getObject(arg0).entryPoint = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_external_texture_cf122b1392d58f37: function(arg0, arg1) {
            getObject(arg0).externalTexture = getObject(arg1);
        },
        __wbg_set_fail_op_e7eb17ed0228b457: function(arg0, arg1) {
            getObject(arg0).failOp = __wbindgen_enum_GpuStencilOperation[arg1];
        },
        __wbg_set_format_119bda0a3d0b3f47: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_27c63de9b0ec1cb3: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_75eb905a003c2f61: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_8b8359f261ea64b9: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuVertexFormat[arg1];
        },
        __wbg_set_format_a5d373801c562623: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_b08d87d5f33bcd89: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_format_c1a342a37ced3e12: function(arg0, arg1) {
            getObject(arg0).format = __wbindgen_enum_GpuTextureFormat[arg1];
        },
        __wbg_set_fragment_41044c9110c69c90: function(arg0, arg1) {
            getObject(arg0).fragment = getObject(arg1);
        },
        __wbg_set_front_face_9c9f0518a3109d98: function(arg0, arg1) {
            getObject(arg0).frontFace = __wbindgen_enum_GpuFrontFace[arg1];
        },
        __wbg_set_g_a39877021b450e75: function(arg0, arg1) {
            getObject(arg0).g = arg1;
        },
        __wbg_set_has_dynamic_offset_69725fed837748fe: function(arg0, arg1) {
            getObject(arg0).hasDynamicOffset = arg1 !== 0;
        },
        __wbg_set_headers_877ed41890d28af2: function(arg0, arg1) {
            getObject(arg0).headers = getObject(arg1);
        },
        __wbg_set_height_490773009db619eb: function(arg0, arg1) {
            getObject(arg0).height = arg1 >>> 0;
        },
        __wbg_set_height_7492d7d81050874c: function(arg0, arg1) {
            getObject(arg0).height = arg1 >>> 0;
        },
        __wbg_set_height_975770494a218d52: function(arg0, arg1) {
            getObject(arg0).height = arg1 >>> 0;
        },
        __wbg_set_label_26577513096f145b: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_2816ddca7866dcfa: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_2a41a6f671383447: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_325c5e4b70c1568f: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_37d0faa0c9b7dee4: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_3e306b2e8f9db666: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_5514e44725004e89: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_570d3dee0e80279e: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_58fbc9fcc6363f16: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_5c952448f9d59f36: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_782e33de78d86641: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_837a3b8ff99c2db3: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_label_8df6673e1e141fcc: function(arg0, arg1, arg2) {
            getObject(arg0).label = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_layout_a6ee8e74696bc0c8: function(arg0, arg1) {
            getObject(arg0).layout = getObject(arg1);
        },
        __wbg_set_layout_d701bf37a1e489c6: function(arg0, arg1) {
            getObject(arg0).layout = getObject(arg1);
        },
        __wbg_set_load_op_e8ff3e1c81f7398d: function(arg0, arg1) {
            getObject(arg0).loadOp = __wbindgen_enum_GpuLoadOp[arg1];
        },
        __wbg_set_lod_max_clamp_a9f93b2e2ae9023d: function(arg0, arg1) {
            getObject(arg0).lodMaxClamp = arg1;
        },
        __wbg_set_lod_min_clamp_342b47161f1fa002: function(arg0, arg1) {
            getObject(arg0).lodMinClamp = arg1;
        },
        __wbg_set_mag_filter_28e863ff1a386f86: function(arg0, arg1) {
            getObject(arg0).magFilter = __wbindgen_enum_GpuFilterMode[arg1];
        },
        __wbg_set_mapped_at_creation_7f0aad21612f3e22: function(arg0, arg1) {
            getObject(arg0).mappedAtCreation = arg1 !== 0;
        },
        __wbg_set_mask_a18cbdfc03a4cbd9: function(arg0, arg1) {
            getObject(arg0).mask = arg1 >>> 0;
        },
        __wbg_set_max_anisotropy_19e574a7e9cb009a: function(arg0, arg1) {
            getObject(arg0).maxAnisotropy = arg1;
        },
        __wbg_set_method_b4ede299b2064f37: function(arg0, arg1, arg2) {
            getObject(arg0).method = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_min_binding_size_d70e460d165d9144: function(arg0, arg1) {
            getObject(arg0).minBindingSize = arg1;
        },
        __wbg_set_min_filter_5275c8a3815f9f0c: function(arg0, arg1) {
            getObject(arg0).minFilter = __wbindgen_enum_GpuFilterMode[arg1];
        },
        __wbg_set_mip_level_8d4dfc5d506cb37f: function(arg0, arg1) {
            getObject(arg0).mipLevel = arg1 >>> 0;
        },
        __wbg_set_mip_level_count_04af0d33c4905fac: function(arg0, arg1) {
            getObject(arg0).mipLevelCount = arg1 >>> 0;
        },
        __wbg_set_mip_level_count_dcb2ad32716506a5: function(arg0, arg1) {
            getObject(arg0).mipLevelCount = arg1 >>> 0;
        },
        __wbg_set_mipmap_filter_ae5e0e814693019b: function(arg0, arg1) {
            getObject(arg0).mipmapFilter = __wbindgen_enum_GpuMipmapFilterMode[arg1];
        },
        __wbg_set_mode_d6c2e1991aa963c6: function(arg0, arg1) {
            getObject(arg0).mode = __wbindgen_enum_RequestMode[arg1];
        },
        __wbg_set_module_0933874708065f3b: function(arg0, arg1) {
            getObject(arg0).module = getObject(arg1);
        },
        __wbg_set_module_a7a131494850e5f7: function(arg0, arg1) {
            getObject(arg0).module = getObject(arg1);
        },
        __wbg_set_multisample_e857cbfca335c7f1: function(arg0, arg1) {
            getObject(arg0).multisample = getObject(arg1);
        },
        __wbg_set_multisampled_4ce4c32144215354: function(arg0, arg1) {
            getObject(arg0).multisampled = arg1 !== 0;
        },
        __wbg_set_offset_baf6780761c43b24: function(arg0, arg1) {
            getObject(arg0).offset = arg1;
        },
        __wbg_set_offset_e316586bb85f0bd6: function(arg0, arg1) {
            getObject(arg0).offset = arg1;
        },
        __wbg_set_offset_eabaf12fe1c98ce7: function(arg0, arg1) {
            getObject(arg0).offset = arg1;
        },
        __wbg_set_onmessage_cbad797593d8fbf7: function(arg0, arg1) {
            getObject(arg0).onmessage = getObject(arg1);
        },
        __wbg_set_operation_a91e5763a8313c6b: function(arg0, arg1) {
            getObject(arg0).operation = __wbindgen_enum_GpuBlendOperation[arg1];
        },
        __wbg_set_origin_24a61b4427e330e9: function(arg0, arg1) {
            getObject(arg0).origin = getObject(arg1);
        },
        __wbg_set_pass_op_eef0c5885ae707c3: function(arg0, arg1) {
            getObject(arg0).passOp = __wbindgen_enum_GpuStencilOperation[arg1];
        },
        __wbg_set_power_preference_7d669fb9b41f7bf2: function(arg0, arg1) {
            getObject(arg0).powerPreference = __wbindgen_enum_GpuPowerPreference[arg1];
        },
        __wbg_set_primitive_3462e090c7a78969: function(arg0, arg1) {
            getObject(arg0).primitive = getObject(arg1);
        },
        __wbg_set_query_set_62d86bdf10d64d37: function(arg0, arg1) {
            getObject(arg0).querySet = getObject(arg1);
        },
        __wbg_set_r_40fe44b2d9a401f4: function(arg0, arg1) {
            getObject(arg0).r = arg1;
        },
        __wbg_set_required_features_3d00070d09235d7d: function(arg0, arg1) {
            getObject(arg0).requiredFeatures = getObject(arg1);
        },
        __wbg_set_required_limits_e0de55a49a48e3dc: function(arg0, arg1) {
            getObject(arg0).requiredLimits = getObject(arg1);
        },
        __wbg_set_resolve_target_6e7eda03a6886624: function(arg0, arg1) {
            getObject(arg0).resolveTarget = getObject(arg1);
        },
        __wbg_set_resource_fe1f979fce4afee2: function(arg0, arg1) {
            getObject(arg0).resource = getObject(arg1);
        },
        __wbg_set_rows_per_image_c616c70e60a35618: function(arg0, arg1) {
            getObject(arg0).rowsPerImage = arg1 >>> 0;
        },
        __wbg_set_sample_count_2b8ac49e1626ac13: function(arg0, arg1) {
            getObject(arg0).sampleCount = arg1 >>> 0;
        },
        __wbg_set_sample_type_3cecbd4699e2e5fb: function(arg0, arg1) {
            getObject(arg0).sampleType = __wbindgen_enum_GpuTextureSampleType[arg1];
        },
        __wbg_set_sampler_12544c21977075c1: function(arg0, arg1) {
            getObject(arg0).sampler = getObject(arg1);
        },
        __wbg_set_shader_location_03356bf6a6da4332: function(arg0, arg1) {
            getObject(arg0).shaderLocation = arg1 >>> 0;
        },
        __wbg_set_signal_9022b5aa06a6ce5b: function(arg0, arg1) {
            getObject(arg0).signal = getObject(arg1);
        },
        __wbg_set_size_0c20f73abce8f1ce: function(arg0, arg1) {
            getObject(arg0).size = arg1;
        },
        __wbg_set_size_cf04b4174c30722b: function(arg0, arg1) {
            getObject(arg0).size = getObject(arg1);
        },
        __wbg_set_size_f1207de283144c72: function(arg0, arg1) {
            getObject(arg0).size = arg1;
        },
        __wbg_set_src_factor_c3668d4122497276: function(arg0, arg1) {
            getObject(arg0).srcFactor = __wbindgen_enum_GpuBlendFactor[arg1];
        },
        __wbg_set_stencil_back_8d01a6c0477059b0: function(arg0, arg1) {
            getObject(arg0).stencilBack = getObject(arg1);
        },
        __wbg_set_stencil_clear_value_1f380af0bd0d9255: function(arg0, arg1) {
            getObject(arg0).stencilClearValue = arg1 >>> 0;
        },
        __wbg_set_stencil_front_f881c15b2d170653: function(arg0, arg1) {
            getObject(arg0).stencilFront = getObject(arg1);
        },
        __wbg_set_stencil_load_op_5cde31e71a964b58: function(arg0, arg1) {
            getObject(arg0).stencilLoadOp = __wbindgen_enum_GpuLoadOp[arg1];
        },
        __wbg_set_stencil_read_mask_d79993adcfc418ab: function(arg0, arg1) {
            getObject(arg0).stencilReadMask = arg1 >>> 0;
        },
        __wbg_set_stencil_read_only_ac984029b821315e: function(arg0, arg1) {
            getObject(arg0).stencilReadOnly = arg1 !== 0;
        },
        __wbg_set_stencil_store_op_262e1df7b92404d3: function(arg0, arg1) {
            getObject(arg0).stencilStoreOp = __wbindgen_enum_GpuStoreOp[arg1];
        },
        __wbg_set_stencil_write_mask_94ec6249877e083e: function(arg0, arg1) {
            getObject(arg0).stencilWriteMask = arg1 >>> 0;
        },
        __wbg_set_step_mode_241a8d5515fa964b: function(arg0, arg1) {
            getObject(arg0).stepMode = __wbindgen_enum_GpuVertexStepMode[arg1];
        },
        __wbg_set_storage_texture_36be4834c501acab: function(arg0, arg1) {
            getObject(arg0).storageTexture = getObject(arg1);
        },
        __wbg_set_store_op_a95e8da4555c6010: function(arg0, arg1) {
            getObject(arg0).storeOp = __wbindgen_enum_GpuStoreOp[arg1];
        },
        __wbg_set_strip_index_format_62c417aa65a4d277: function(arg0, arg1) {
            getObject(arg0).stripIndexFormat = __wbindgen_enum_GpuIndexFormat[arg1];
        },
        __wbg_set_tabIndex_3a12797081e4321a: function(arg0, arg1) {
            getObject(arg0).tabIndex = arg1;
        },
        __wbg_set_targets_6664b7e6ec5da9d3: function(arg0, arg1) {
            getObject(arg0).targets = getObject(arg1);
        },
        __wbg_set_texture_64823aa8aca790b5: function(arg0, arg1) {
            getObject(arg0).texture = getObject(arg1);
        },
        __wbg_set_texture_738e6f6215515de3: function(arg0, arg1) {
            getObject(arg0).texture = getObject(arg1);
        },
        __wbg_set_timestamp_writes_3854a564715b0ac7: function(arg0, arg1) {
            getObject(arg0).timestampWrites = getObject(arg1);
        },
        __wbg_set_topology_914716698f5868bb: function(arg0, arg1) {
            getObject(arg0).topology = __wbindgen_enum_GpuPrimitiveTopology[arg1];
        },
        __wbg_set_type_17a1387b620bc902: function(arg0, arg1) {
            getObject(arg0).type = __wbindgen_enum_GpuBufferBindingType[arg1];
        },
        __wbg_set_type_38a356c417e6662e: function(arg0, arg1, arg2) {
            getObject(arg0).type = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_type_d4edb621ec2051e0: function(arg0, arg1) {
            getObject(arg0).type = __wbindgen_enum_GpuSamplerBindingType[arg1];
        },
        __wbg_set_unclipped_depth_e23e3091db2ac351: function(arg0, arg1) {
            getObject(arg0).unclippedDepth = arg1 !== 0;
        },
        __wbg_set_usage_41b7d18f3f220e6c: function(arg0, arg1) {
            getObject(arg0).usage = arg1 >>> 0;
        },
        __wbg_set_usage_6ae4d85589906117: function(arg0, arg1) {
            getObject(arg0).usage = arg1 >>> 0;
        },
        __wbg_set_usage_e167dd772123f679: function(arg0, arg1) {
            getObject(arg0).usage = arg1 >>> 0;
        },
        __wbg_set_usage_f084cd416060ceee: function(arg0, arg1) {
            getObject(arg0).usage = arg1 >>> 0;
        },
        __wbg_set_vertex_29812f650590fa45: function(arg0, arg1) {
            getObject(arg0).vertex = getObject(arg1);
        },
        __wbg_set_view_32a8132aec6de194: function(arg0, arg1) {
            getObject(arg0).view = getObject(arg1);
        },
        __wbg_set_view_506e5beadab34e99: function(arg0, arg1) {
            getObject(arg0).view = getObject(arg1);
        },
        __wbg_set_view_dimension_4a840560a13b4860: function(arg0, arg1) {
            getObject(arg0).viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
        },
        __wbg_set_view_dimension_9ae69db849267b1a: function(arg0, arg1) {
            getObject(arg0).viewDimension = __wbindgen_enum_GpuTextureViewDimension[arg1];
        },
        __wbg_set_view_formats_4d0b943f593dd219: function(arg0, arg1) {
            getObject(arg0).viewFormats = getObject(arg1);
        },
        __wbg_set_view_formats_cba8520bf0d83d62: function(arg0, arg1) {
            getObject(arg0).viewFormats = getObject(arg1);
        },
        __wbg_set_visibility_bbbf3d2b70571950: function(arg0, arg1) {
            getObject(arg0).visibility = arg1 >>> 0;
        },
        __wbg_set_width_0f26635b289b3c67: function(arg0, arg1) {
            getObject(arg0).width = arg1 >>> 0;
        },
        __wbg_set_width_5e8d872fae03f8b5: function(arg0, arg1) {
            getObject(arg0).width = arg1 >>> 0;
        },
        __wbg_set_width_74c20ff78cccba07: function(arg0, arg1) {
            getObject(arg0).width = arg1 >>> 0;
        },
        __wbg_set_write_mask_949f521dcf3da2b5: function(arg0, arg1) {
            getObject(arg0).writeMask = arg1 >>> 0;
        },
        __wbg_set_x_15a4c893b3366fab: function(arg0, arg1) {
            getObject(arg0).x = arg1 >>> 0;
        },
        __wbg_set_y_c631920a1c51a694: function(arg0, arg1) {
            getObject(arg0).y = arg1 >>> 0;
        },
        __wbg_set_z_7c526101c55ea2ae: function(arg0, arg1) {
            getObject(arg0).z = arg1 >>> 0;
        },
        __wbg_shaderSource_9ec8bb6355f3fb83: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
        },
        __wbg_shaderSource_d01f3003544bc127: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
        },
        __wbg_shiftKey_47af14c72a6647a5: function(arg0) {
            const ret = getObject(arg0).shiftKey;
            return ret;
        },
        __wbg_shiftKey_b0e1eba807c36234: function(arg0) {
            const ret = getObject(arg0).shiftKey;
            return ret;
        },
        __wbg_signal_41dd1a8913cd0b7d: function(arg0) {
            const ret = getObject(arg0).signal;
            return addHeapObject(ret);
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = getObject(arg1).stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_start_bf2692edaa97053d: function(arg0) {
            getObject(arg0).start();
        },
        __wbg_static_accessor_GLOBAL_60a4124bab7dcc9a: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_95ca6460658b5d13: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_SELF_4c95f759a91e9aae: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_WINDOW_44b435597f9e9ee7: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_status_9e6505cfa3e73a7c: function(arg0) {
            const ret = getObject(arg0).status;
            return ret;
        },
        __wbg_stencilFuncSeparate_03c6bf2d966f583e: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
        },
        __wbg_stencilFuncSeparate_4bcfdce2f5bd313d: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
        },
        __wbg_stencilMaskSeparate_e3fa6ae1fa34922d: function(arg0, arg1, arg2) {
            getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_stencilMaskSeparate_e8e2b2342e98bc4b: function(arg0, arg1, arg2) {
            getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_stencilMask_4c2b4cfa1347441b: function(arg0, arg1) {
            getObject(arg0).stencilMask(arg1 >>> 0);
        },
        __wbg_stencilMask_7e1bd1709129209f: function(arg0, arg1) {
            getObject(arg0).stencilMask(arg1 >>> 0);
        },
        __wbg_stencilOpSeparate_b886cfa931729794: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_stencilOpSeparate_babe941834ee6195: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
        },
        __wbg_stringify_a42c95ea9a7591c9: function() { return handleError(function (arg0) {
            const ret = JSON.stringify(getObject(arg0));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_style_f016e4015b8e4b4d: function(arg0) {
            const ret = getObject(arg0).style;
            return addHeapObject(ret);
        },
        __wbg_submit_b3bbead76cbf7627: function(arg0, arg1) {
            getObject(arg0).submit(getObject(arg1));
        },
        __wbg_texImage2D_2661abc74abd1a42: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texImage2D_51050688e27cf90c: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texImage2D_7032ff9441fb991b: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
        }, arguments); },
        __wbg_texImage3D_3020bdaf08ecce3a: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).texImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8 >>> 0, arg9 >>> 0, getObject(arg10));
        }, arguments); },
        __wbg_texImage3D_ce59ef633c02bb59: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            getObject(arg0).texImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8 >>> 0, arg9 >>> 0, arg10);
        }, arguments); },
        __wbg_texParameteri_af4404771fdf8ff0: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
        },
        __wbg_texParameteri_c27d4121af7b04c5: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
        },
        __wbg_texStorage2D_39a0974e9998d587: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).texStorage2D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_texStorage3D_64f4511cd0f9b02a: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).texStorage3D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5, arg6);
        },
        __wbg_texSubImage2D_580ce5ffdd2860cb: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_58d91301124193c9: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_675db51d9210ef18: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
        }, arguments); },
        __wbg_texSubImage2D_742bf9286afd8a6a: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_7dd81316e2c5646d: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_88ca900cc86c5825: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_a0c0bc9db4ce6a7c: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage2D_a870a92b8dec5be4: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
        }, arguments); },
        __wbg_texSubImage3D_0cbc9ec5b6af2282: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_26a6500a33d1c269: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
        }, arguments); },
        __wbg_texSubImage3D_35f20f087965afe2: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_465f1abcbdf5be00: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_5ef360b22e29abce: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_6a1e21d8014664e8: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_texSubImage3D_ff904ac2998d6548: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
        }, arguments); },
        __wbg_text_d0039cf442b19ec4: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).text();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_then_254bab9b266a77a5: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        },
        __wbg_then_3ea18602c6a5123b: function(arg0, arg1) {
            const ret = getObject(arg0).then(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_then_512b7e52c6d0a050: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        },
        __wbg_uniform1f_086fe42001d466eb: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1f(getObject(arg1), arg2);
        },
        __wbg_uniform1f_632ef56807f464a5: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1f(getObject(arg1), arg2);
        },
        __wbg_uniform1i_ae9bb48ed7439f2c: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1i(getObject(arg1), arg2);
        },
        __wbg_uniform1i_dbddbbfe71b1bb7f: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1i(getObject(arg1), arg2);
        },
        __wbg_uniform1ui_82c0068dbf21b011: function(arg0, arg1, arg2) {
            getObject(arg0).uniform1ui(getObject(arg1), arg2 >>> 0);
        },
        __wbg_uniform2fv_3efda3b60d2b1b71: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform2fv_bbe63ae535d639bf: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform2iv_15188158574d61b6: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform2iv_ec938f897219e205: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform2uiv_1fa8f1367c9d79dc: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform2uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3fv_3eb9ab86c23e4a03: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3fv_6793434bb2d05de8: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3iv_533e422009f22456: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3iv_d78e0145a3ac2377: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform3uiv_112667c502e72ba5: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform3uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4f_76ca4b099f739e54: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
        },
        __wbg_uniform4f_cbcfca855c8a9cba: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
        },
        __wbg_uniform4fv_b95bcf701650cea8: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4fv_e95114c5e7182c2d: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4iv_7a6129f901817528: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4iv_da15f3d4cf266cbb: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
        },
        __wbg_uniform4uiv_90e095e3812814cc: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniform4uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
        },
        __wbg_uniformBlockBinding_9b65fcd9d7a8c2bd: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).uniformBlockBinding(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
        },
        __wbg_uniformMatrix2fv_baf32d57b23626f8: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix2fv_c11cdeadf9ca6f33: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix2x3fv_b79d7c64becdfb3a: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix2x3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix2x4fv_19c92767e25f145d: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix2x4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix3fv_a5cba32bcbcd0a42: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix3fv_e1e1815c93749cb7: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix3x2fv_2de24b38a50b8660: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix3x2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix3x4fv_aade075069c19068: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix3x4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix4fv_918426d2c0b31ac2: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix4fv_c88d55645194f17f: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix4x2fv_6b0a50ec2b1e2c05: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix4x2fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_uniformMatrix4x3fv_1c24b280951301ac: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).uniformMatrix4x3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
        },
        __wbg_unmap_817a2e3248a553fb: function(arg0) {
            getObject(arg0).unmap();
        },
        __wbg_unobserve_8cf2e1d8678b2149: function(arg0, arg1) {
            getObject(arg0).unobserve(getObject(arg1));
        },
        __wbg_url_72c67c175685a054: function(arg0, arg1) {
            const ret = getObject(arg1).url;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_useProgram_52771949c03e5936: function(arg0, arg1) {
            getObject(arg0).useProgram(getObject(arg1));
        },
        __wbg_useProgram_6a654af397623049: function(arg0, arg1) {
            getObject(arg0).useProgram(getObject(arg1));
        },
        __wbg_userAgentData_5138f83d5fd40949: function(arg0) {
            const ret = getObject(arg0).userAgentData;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_userAgent_20439a4e2e0bd71f: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg1).userAgent;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_value_3d3defe09fb1ffca: function(arg0) {
            const ret = getObject(arg0).value;
            return addHeapObject(ret);
        },
        __wbg_vertexAttribDivisorANGLE_3460a5c685d92353: function(arg0, arg1, arg2) {
            getObject(arg0).vertexAttribDivisorANGLE(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_vertexAttribDivisor_b9ce3fd4c0dc795e: function(arg0, arg1, arg2) {
            getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
        },
        __wbg_vertexAttribIPointer_3712ac454c8572d3: function(arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).vertexAttribIPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
        },
        __wbg_vertexAttribPointer_66206a5fa6b401f0: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
        },
        __wbg_vertexAttribPointer_b81cd8464c44bfc7: function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
        },
        __wbg_viewport_357a29f80f8d01f0: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).viewport(arg1, arg2, arg3, arg4);
        },
        __wbg_viewport_c070c694d6b08e84: function(arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).viewport(arg1, arg2, arg3, arg4);
        },
        __wbg_visibilityState_22b18b44df831d60: function(arg0) {
            const ret = getObject(arg0).visibilityState;
            return (__wbindgen_enum_VisibilityState.indexOf(ret) + 1 || 3) - 1;
        },
        __wbg_warn_633bacc13ba7e6c3: function(arg0) {
            console.warn(getObject(arg0));
        },
        __wbg_webkitFullscreenElement_feaaee67c8ef364f: function(arg0) {
            const ret = getObject(arg0).webkitFullscreenElement;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_webkitRequestFullscreen_63ae30e637ef66d2: function(arg0) {
            getObject(arg0).webkitRequestFullscreen();
        },
        __wbg_width_b0387ffff26abd57: function(arg0) {
            const ret = getObject(arg0).width;
            return ret;
        },
        __wbg_writeBuffer_24a10bfd5a8a57f7: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
            getObject(arg0).writeBuffer(getObject(arg1), arg2, getArrayU8FromWasm0(arg3, arg4), arg5, arg6);
        }, arguments); },
        __wbg_writeTexture_acb28796746826c8: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            getObject(arg0).writeTexture(getObject(arg1), getArrayU8FromWasm0(arg2, arg3), getObject(arg4), getObject(arg5));
        }, arguments); },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 682, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_5520);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 72, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_1891);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("Array<any>"), NamedExternref("ResizeObserver")], shim_idx: 381, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_2213);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000004: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("Array<any>")], shim_idx: 682, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_5520_3);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000005: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("Event")], shim_idx: 682, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_5520_4);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000006: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("FocusEvent")], shim_idx: 682, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_5520_5);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000007: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("KeyboardEvent")], shim_idx: 682, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_5520_6);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000008: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("PageTransitionEvent")], shim_idx: 682, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_5520_7);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000009: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("PointerEvent")], shim_idx: 682, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_5520_8);
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000a: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [NamedExternref("WheelEvent")], shim_idx: 682, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_5520_9);
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000b: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [], shim_idx: 1036, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_7456);
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000c: function(arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000d: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(F32)) -> NamedExternref("Float32Array")`.
            const ret = getArrayF32FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000e: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(I16)) -> NamedExternref("Int16Array")`.
            const ret = getArrayI16FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_000000000000000f: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(I32)) -> NamedExternref("Int32Array")`.
            const ret = getArrayI32FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000010: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(I8)) -> NamedExternref("Int8Array")`.
            const ret = getArrayI8FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000011: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U16)) -> NamedExternref("Uint16Array")`.
            const ret = getArrayU16FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000012: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U32)) -> NamedExternref("Uint32Array")`.
            const ret = getArrayU32FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000013: function(arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
            const ret = getArrayU8FromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000014: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_object_clone_ref: function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./tutorial12-camera_bg.js": import0,
    };
}

function __wasm_bindgen_func_elem_7456(arg0, arg1) {
    wasm.__wasm_bindgen_func_elem_7456(arg0, arg1);
}

function __wasm_bindgen_func_elem_5520(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_5520(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_5520_3(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_5520_3(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_5520_4(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_5520_4(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_5520_5(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_5520_5(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_5520_6(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_5520_6(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_5520_7(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_5520_7(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_5520_8(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_5520_8(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_5520_9(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_5520_9(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_1891(arg0, arg1, arg2) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.__wasm_bindgen_func_elem_1891(retptr, arg0, arg1, addHeapObject(arg2));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wasm_bindgen_func_elem_2213(arg0, arg1, arg2, arg3) {
    wasm.__wasm_bindgen_func_elem_2213(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
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


const __wbindgen_enum_ResizeObserverBoxOptions = ["border-box", "content-box", "device-pixel-content-box"];


const __wbindgen_enum_VisibilityState = ["hidden", "visible"];

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => wasm.__wbindgen_export5(state.a, state.b));

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

function dropObject(idx) {
    if (idx < 1028) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayI16FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt16ArrayMemory0().subarray(ptr / 2, ptr / 2 + len);
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayI8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

function getArrayU16FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint16ArrayMemory0().subarray(ptr / 2, ptr / 2 + len);
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

let cachedFloat32ArrayMemory0 = null;
function getFloat32ArrayMemory0() {
    if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
        cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32ArrayMemory0;
}

let cachedInt16ArrayMemory0 = null;
function getInt16ArrayMemory0() {
    if (cachedInt16ArrayMemory0 === null || cachedInt16ArrayMemory0.byteLength === 0) {
        cachedInt16ArrayMemory0 = new Int16Array(wasm.memory.buffer);
    }
    return cachedInt16ArrayMemory0;
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
    if (cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0) {
        cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32ArrayMemory0;
}

let cachedInt8ArrayMemory0 = null;
function getInt8ArrayMemory0() {
    if (cachedInt8ArrayMemory0 === null || cachedInt8ArrayMemory0.byteLength === 0) {
        cachedInt8ArrayMemory0 = new Int8Array(wasm.memory.buffer);
    }
    return cachedInt8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint16ArrayMemory0 = null;
function getUint16ArrayMemory0() {
    if (cachedUint16ArrayMemory0 === null || cachedUint16ArrayMemory0.byteLength === 0) {
        cachedUint16ArrayMemory0 = new Uint16Array(wasm.memory.buffer);
    }
    return cachedUint16ArrayMemory0;
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

let heap = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
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
            wasm.__wbindgen_export5(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
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

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
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

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedFloat32ArrayMemory0 = null;
    cachedInt16ArrayMemory0 = null;
    cachedInt32ArrayMemory0 = null;
    cachedInt8ArrayMemory0 = null;
    cachedUint16ArrayMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
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

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
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


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('tutorial12-camera_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
