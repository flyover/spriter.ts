System.register([], function(exports_1) {
    var glShader, glVertex, RenderWebGL;
    function repeat(format, count) {
        var array = [];
        for (var index = 0; index < count; ++index) {
            array.push(format.replace(/{index}/g, index.toString()));
        }
        return array;
    }
    function flatten(array, out) {
        if (out === void 0) { out = []; }
        array.forEach(function (value) {
            if (Array.isArray(value)) {
                flatten(value, out);
            }
            else {
                out.push(value);
            }
        });
        return out;
    }
    function vec4Identity(v) {
        v[0] = v[1] = v[2] = v[3] = 1.0;
        return v;
    }
    exports_1("vec4Identity", vec4Identity);
    function vec4CopyColor(v, color) {
        v[0] = color.r;
        v[1] = color.g;
        v[2] = color.b;
        v[3] = color.a;
        return v;
    }
    exports_1("vec4CopyColor", vec4CopyColor);
    function vec4ApplyColor(v, color) {
        v[0] *= color.r;
        v[1] *= color.g;
        v[2] *= color.b;
        v[3] *= color.a;
        return v;
    }
    exports_1("vec4ApplyColor", vec4ApplyColor);
    function mat3x3Identity(m) {
        m[1] = m[2] = m[3] =
            m[5] = m[6] = m[7] = 0.0;
        m[0] = m[4] = m[8] = 1.0;
        return m;
    }
    exports_1("mat3x3Identity", mat3x3Identity);
    function mat3x3Copy(m, other) {
        m.set(other);
        return m;
    }
    exports_1("mat3x3Copy", mat3x3Copy);
    function mat3x3Ortho(m, l, r, b, t) {
        var lr = 1 / (l - r);
        var bt = 1 / (b - t);
        m[0] *= -2 * lr;
        m[4] *= -2 * bt;
        m[6] += (l + r) * lr;
        m[7] += (t + b) * bt;
        return m;
    }
    exports_1("mat3x3Ortho", mat3x3Ortho);
    function mat3x3Translate(m, x, y) {
        m[6] += m[0] * x + m[3] * y;
        m[7] += m[1] * x + m[4] * y;
        return m;
    }
    exports_1("mat3x3Translate", mat3x3Translate);
    function mat3x3RotateCosSin(m, c, s) {
        var m0 = m[0];
        var m1 = m[1];
        var m3 = m[3];
        var m4 = m[4];
        m[0] = m0 * c + m3 * s;
        m[1] = m1 * c + m4 * s;
        m[3] = m3 * c - m0 * s;
        m[4] = m4 * c - m1 * s;
        return m;
    }
    exports_1("mat3x3RotateCosSin", mat3x3RotateCosSin);
    function mat3x3Rotate(m, angle) {
        return mat3x3RotateCosSin(m, Math.cos(angle), Math.sin(angle));
    }
    exports_1("mat3x3Rotate", mat3x3Rotate);
    function mat3x3Scale(m, x, y) {
        m[0] *= x;
        m[1] *= x;
        m[2] *= x;
        m[3] *= y;
        m[4] *= y;
        m[5] *= y;
        return m;
    }
    exports_1("mat3x3Scale", mat3x3Scale);
    function mat3x3Transform(m, v, out) {
        var x = m[0] * v[0] + m[3] * v[1] + m[6];
        var y = m[1] * v[0] + m[4] * v[1] + m[7];
        var w = m[2] * v[0] + m[5] * v[1] + m[8];
        var iw = (w) ? (1 / w) : (1);
        out[0] = x * iw;
        out[1] = y * iw;
        return out;
    }
    exports_1("mat3x3Transform", mat3x3Transform);
    function mat3x3ApplySpace(m, space) {
        if (space) {
            mat3x3Translate(m, space.position.x, space.position.y);
            mat3x3Rotate(m, space.rotation.rad);
            mat3x3Scale(m, space.scale.x, space.scale.y);
        }
        return m;
    }
    exports_1("mat3x3ApplySpace", mat3x3ApplySpace);
    function mat3x3ApplyAtlasPageTexcoord(m, page) {
        if (page) {
            mat3x3Scale(m, 1 / page.w, 1 / page.h);
        }
        return m;
    }
    exports_1("mat3x3ApplyAtlasPageTexcoord", mat3x3ApplyAtlasPageTexcoord);
    function mat3x3ApplyAtlasSiteTexcoord(m, site) {
        if (site) {
            mat3x3Translate(m, site.x, site.y);
            if (site.rotate === -1) {
                mat3x3Translate(m, 0, site.w); // bottom-left corner
                mat3x3RotateCosSin(m, 0, -1); // -90 degrees
            }
            else if (site.rotate === 1) {
                mat3x3Translate(m, site.h, 0); // top-right corner
                mat3x3RotateCosSin(m, 0, 1); // 90 degrees
            }
            mat3x3Scale(m, site.w, site.h);
        }
        return m;
    }
    exports_1("mat3x3ApplyAtlasSiteTexcoord", mat3x3ApplyAtlasSiteTexcoord);
    function mat3x3ApplyAtlasSitePosition(m, site) {
        if (site) {
            mat3x3Scale(m, 1 / site.original_w, 1 / site.original_h);
            mat3x3Translate(m, 2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
            mat3x3Scale(m, site.w, site.h);
        }
        return m;
    }
    exports_1("mat3x3ApplyAtlasSitePosition", mat3x3ApplyAtlasSitePosition);
    function mat4x4Identity(m) {
        m[1] = m[2] = m[3] = m[4] =
            m[6] = m[7] = m[8] = m[9] =
                m[11] = m[12] = m[13] = m[14] = 0.0;
        m[0] = m[5] = m[10] = m[15] = 1.0;
        return m;
    }
    exports_1("mat4x4Identity", mat4x4Identity);
    function mat4x4Copy(m, other) {
        m.set(other);
        return m;
    }
    exports_1("mat4x4Copy", mat4x4Copy);
    function mat4x4Ortho(m, l, r, b, t, n, f) {
        var lr = 1 / (l - r);
        var bt = 1 / (b - t);
        var nf = 1 / (n - f);
        m[0] = -2 * lr;
        m[5] = -2 * bt;
        m[10] = 2 * nf;
        m[12] = (l + r) * lr;
        m[13] = (t + b) * bt;
        m[14] = (f + n) * nf;
        return m;
    }
    exports_1("mat4x4Ortho", mat4x4Ortho);
    function mat4x4Translate(m, x, y, z) {
        if (z === void 0) { z = 0; }
        m[12] += m[0] * x + m[4] * y + m[8] * z;
        m[13] += m[1] * x + m[5] * y + m[9] * z;
        m[14] += m[2] * x + m[6] * y + m[10] * z;
        m[15] += m[3] * x + m[7] * y + m[11] * z;
        return m;
    }
    exports_1("mat4x4Translate", mat4x4Translate);
    function mat4x4RotateCosSinZ(m, c, s) {
        var a_x = m[0];
        var a_y = m[1];
        var a_z = m[2];
        var a_w = m[3];
        var b_x = m[4];
        var b_y = m[5];
        var b_z = m[6];
        var b_w = m[7];
        m[0] = a_x * c + b_x * s;
        m[1] = a_y * c + b_y * s;
        m[2] = a_z * c + b_z * s;
        m[3] = a_w * c + b_w * s;
        m[4] = b_x * c - a_x * s;
        m[5] = b_y * c - a_y * s;
        m[6] = b_z * c - a_z * s;
        m[7] = b_w * c - a_w * s;
        return m;
    }
    exports_1("mat4x4RotateCosSinZ", mat4x4RotateCosSinZ);
    function mat4x4RotateZ(m, angle) {
        return mat4x4RotateCosSinZ(m, Math.cos(angle), Math.sin(angle));
    }
    exports_1("mat4x4RotateZ", mat4x4RotateZ);
    function mat4x4Scale(m, x, y, z) {
        if (z === void 0) { z = 1; }
        m[0] *= x;
        m[1] *= x;
        m[2] *= x;
        m[3] *= x;
        m[4] *= y;
        m[5] *= y;
        m[6] *= y;
        m[7] *= y;
        m[8] *= z;
        m[9] *= z;
        m[10] *= z;
        m[11] *= z;
        return m;
    }
    exports_1("mat4x4Scale", mat4x4Scale);
    function glCompileShader(gl, src, type) {
        src = flatten(src);
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src.join('\n'));
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            src.forEach(function (line, index) { console.log(index + 1, line); });
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            shader = null;
        }
        return shader;
    }
    exports_1("glCompileShader", glCompileShader);
    function glLinkProgram(gl, vs, fs) {
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log("could not link shader program");
            gl.detachShader(program, vs);
            gl.detachShader(program, fs);
            gl.deleteProgram(program);
            program = null;
        }
        return program;
    }
    exports_1("glLinkProgram", glLinkProgram);
    function glGetUniforms(gl, program, uniforms) {
        var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var index = 0; index < count; ++index) {
            var uniform = gl.getActiveUniform(program, index);
            uniforms[uniform.name] = gl.getUniformLocation(program, uniform.name);
        }
        return uniforms;
    }
    exports_1("glGetUniforms", glGetUniforms);
    function glGetAttribs(gl, program, attribs) {
        var count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var index = 0; index < count; ++index) {
            var attrib = gl.getActiveAttrib(program, index);
            attribs[attrib.name] = gl.getAttribLocation(program, attrib.name);
        }
        return attribs;
    }
    exports_1("glGetAttribs", glGetAttribs);
    function glMakeShader(gl, vs_src, fs_src) {
        var shader = new glShader();
        shader.vs_src = vs_src;
        shader.fs_src = fs_src;
        shader.vs = glCompileShader(gl, shader.vs_src, gl.VERTEX_SHADER);
        shader.fs = glCompileShader(gl, shader.fs_src, gl.FRAGMENT_SHADER);
        shader.program = glLinkProgram(gl, shader.vs, shader.fs);
        shader.uniforms = glGetUniforms(gl, shader.program, {});
        shader.attribs = glGetAttribs(gl, shader.program, {});
        return shader;
    }
    exports_1("glMakeShader", glMakeShader);
    function glMakeVertex(gl, type_array, size, buffer_type, buffer_draw) {
        var vertex = new glVertex();
        if (type_array instanceof Float32Array) {
            vertex.type = gl.FLOAT;
        }
        else if (type_array instanceof Int8Array) {
            vertex.type = gl.BYTE;
        }
        else if (type_array instanceof Uint8Array) {
            vertex.type = gl.UNSIGNED_BYTE;
        }
        else if (type_array instanceof Int16Array) {
            vertex.type = gl.SHORT;
        }
        else if (type_array instanceof Uint16Array) {
            vertex.type = gl.UNSIGNED_SHORT;
        }
        else if (type_array instanceof Int32Array) {
            vertex.type = gl.INT;
        }
        else if (type_array instanceof Uint32Array) {
            vertex.type = gl.UNSIGNED_INT;
        }
        else {
            vertex.type = gl.NONE;
            throw new Error();
        }
        vertex.size = size;
        vertex.count = type_array.length / vertex.size;
        vertex.type_array = type_array;
        vertex.buffer = gl.createBuffer();
        vertex.buffer_type = buffer_type;
        vertex.buffer_draw = buffer_draw;
        gl.bindBuffer(vertex.buffer_type, vertex.buffer);
        gl.bufferData(vertex.buffer_type, vertex.type_array, vertex.buffer_draw);
        return vertex;
    }
    exports_1("glMakeVertex", glMakeVertex);
    function glSetupAttribute(gl, shader, format, vertex, count) {
        if (count === void 0) { count = 0; }
        gl.bindBuffer(vertex.buffer_type, vertex.buffer);
        if (count > 0) {
            var sizeof_vertex = vertex.type_array.BYTES_PER_ELEMENT * vertex.size; // in bytes
            var stride = sizeof_vertex * count;
            for (var index = 0; index < count; ++index) {
                var offset = sizeof_vertex * index;
                var attrib = shader.attribs[format.replace(/{index}/g, index.toString())];
                gl.vertexAttribPointer(attrib, vertex.size, vertex.type, false, stride, offset);
                gl.enableVertexAttribArray(attrib);
            }
        }
        else {
            var attrib = shader.attribs[format];
            gl.vertexAttribPointer(attrib, vertex.size, vertex.type, false, 0, 0);
            gl.enableVertexAttribArray(attrib);
        }
    }
    exports_1("glSetupAttribute", glSetupAttribute);
    function glResetAttribute(gl, shader, format, vertex, count) {
        if (count === void 0) { count = 0; }
        if (count > 0) {
            for (var index = 0; index < count; ++index) {
                var attrib = shader.attribs[format.replace(/{index}/g, index.toString())];
                gl.disableVertexAttribArray(attrib);
            }
        }
        else {
            var attrib = shader.attribs[format];
            gl.disableVertexAttribArray(attrib);
        }
    }
    exports_1("glResetAttribute", glResetAttribute);
    return {
        setters:[],
        execute: function() {
            glShader = (function () {
                function glShader() {
                }
                return glShader;
            })();
            glVertex = (function () {
                function glVertex() {
                }
                return glVertex;
            })();
            RenderWebGL = (function () {
                function RenderWebGL(gl) {
                    this.gl_textures = {};
                    this.gl_projection = mat4x4Identity(new Float32Array(16));
                    this.gl_modelview = mat3x3Identity(new Float32Array(9));
                    this.gl_modelview_stack = [];
                    this.gl_tex_matrix = mat3x3Identity(new Float32Array(9));
                    this.gl_color = vec4Identity(new Float32Array(4));
                    this.gl = gl;
                    var gl_mesh_shader_vs_src = [
                        "precision mediump int;",
                        "precision mediump float;",
                        "uniform mat4 uProjection;",
                        "uniform mat3 uModelview;",
                        "uniform mat3 uTexMatrix;",
                        "attribute vec2 aVertexPosition;",
                        "attribute vec2 aVertexTexCoord;",
                        "varying vec3 vTexCoord;",
                        "void main(void) {",
                        " vTexCoord = uTexMatrix * vec3(aVertexTexCoord, 1.0);",
                        " gl_Position = uProjection * vec4(uModelview * vec3(aVertexPosition, 1.0), 1.0);",
                        "}"
                    ];
                    var gl_mesh_shader_fs_src = [
                        "precision mediump int;",
                        "precision mediump float;",
                        "uniform sampler2D uSampler;",
                        "uniform vec4 uColor;",
                        "varying vec3 vTexCoord;",
                        "void main(void) {",
                        " gl_FragColor = uColor * texture2D(uSampler, vTexCoord.st);",
                        "}"
                    ];
                    this.gl_mesh_shader = glMakeShader(gl, gl_mesh_shader_vs_src, gl_mesh_shader_fs_src);
                    this.gl_region_vertex_position = glMakeVertex(gl, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ x, y ]
                    this.gl_region_vertex_texcoord = glMakeVertex(gl, new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ u, v ]
                }
                RenderWebGL.prototype.dropData = function (spriter_data, atlas_data) {
                    var render = this;
                    var gl = render.gl;
                    if (!gl) {
                        return;
                    }
                    for (var image_key in render.gl_textures) {
                        var gl_texture = render.gl_textures[image_key];
                        gl.deleteTexture(gl_texture);
                        gl_texture = null;
                        delete render.gl_textures[image_key];
                    }
                    render.gl_textures = {};
                };
                RenderWebGL.prototype.loadData = function (spriter_data, atlas_data, images) {
                    var render = this;
                    var gl = render.gl;
                    if (!gl) {
                        return;
                    }
                    if (atlas_data) {
                        // load atlas page images
                        atlas_data.pages.forEach(function (page) {
                            if (page.format !== 'RGBA8888') {
                                throw new Error(page.format);
                            }
                            var gl_min_filter = gl.NONE;
                            switch (page.min_filter) {
                                case 'Nearest':
                                    gl_min_filter = gl.NEAREST;
                                    break;
                                default:
                                case 'Linear':
                                    gl_min_filter = gl.LINEAR;
                                    break;
                                case 'MipMapNearestNearest':
                                    gl_min_filter = gl.NEAREST_MIPMAP_NEAREST;
                                    break;
                                case 'MipMapLinearNearest':
                                    gl_min_filter = gl.LINEAR_MIPMAP_NEAREST;
                                    break;
                                case 'MipMapNearestLinear':
                                    gl_min_filter = gl.NEAREST_MIPMAP_LINEAR;
                                    break;
                                case 'MipMapLinearLinear':
                                    gl_min_filter = gl.LINEAR_MIPMAP_LINEAR;
                                    break;
                            }
                            var gl_mag_filter = gl.NONE;
                            switch (page.mag_filter) {
                                case 'Nearest':
                                    gl_mag_filter = gl.NEAREST;
                                    break;
                                default:
                                case 'Linear':
                                    gl_mag_filter = gl.LINEAR;
                                    break;
                            }
                            var gl_wrap_s = gl.NONE;
                            switch (page.wrap_s) {
                                case 'Repeat':
                                    gl_wrap_s = gl.REPEAT;
                                    break;
                                default:
                                case 'ClampToEdge':
                                    gl_wrap_s = gl.CLAMP_TO_EDGE;
                                    break;
                                case 'MirroredRepeat':
                                    gl_wrap_s = gl.MIRRORED_REPEAT;
                                    break;
                            }
                            var gl_wrap_t = gl.NONE;
                            switch (page.wrap_t) {
                                case 'Repeat':
                                    gl_wrap_t = gl.REPEAT;
                                    break;
                                default:
                                case 'ClampToEdge':
                                    gl_wrap_t = gl.CLAMP_TO_EDGE;
                                    break;
                                case 'MirroredRepeat':
                                    gl_wrap_t = gl.MIRRORED_REPEAT;
                                    break;
                            }
                            var image_key = page.name;
                            var image = images[image_key];
                            var gl_texture = render.gl_textures[image_key] = gl.createTexture();
                            gl.bindTexture(gl.TEXTURE_2D, gl_texture);
                            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
                            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_min_filter);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_mag_filter);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl_wrap_s);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl_wrap_t);
                        });
                    }
                    else {
                        spriter_data.folder_array.forEach(function (folder) {
                            folder.file_array.forEach(function (file) {
                                switch (file.type) {
                                    case 'image':
                                        var image_key = file.name;
                                        var image = images[image_key];
                                        var gl_texture = render.gl_textures[image_key] = gl.createTexture();
                                        gl.bindTexture(gl.TEXTURE_2D, gl_texture);
                                        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
                                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                        break;
                                }
                            });
                        });
                    }
                };
                RenderWebGL.prototype.drawPose = function (spriter_pose, atlas_data) {
                    var render = this;
                    var gl = render.gl;
                    if (!gl) {
                        return;
                    }
                    var gl_projection = render.gl_projection;
                    var gl_modelview = render.gl_modelview;
                    var gl_modelview_stack = render.gl_modelview_stack;
                    var gl_tex_matrix = render.gl_tex_matrix;
                    var gl_color = render.gl_color;
                    var alpha = gl_color[3];
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                    var gl_textures = render.gl_textures;
                    var gl_shader = render.gl_mesh_shader;
                    var gl_vertex_position = render.gl_region_vertex_position;
                    var gl_vertex_texcoord = render.gl_region_vertex_texcoord;
                    spriter_pose.object_array.forEach(function (object) {
                        switch (object.type) {
                            case 'sprite':
                                var sprite_object = object;
                                var folder = spriter_pose.data.folder_array[sprite_object.folder_index];
                                if (!folder) {
                                    return;
                                }
                                var file = folder.file_array[sprite_object.file_index];
                                if (!file) {
                                    return;
                                }
                                var site = atlas_data && atlas_data.sites[file.name];
                                var page = site && site.page;
                                var image_key = (page && page.name) || file.name;
                                var gl_texture = gl_textures[image_key];
                                if (gl_texture) {
                                    gl_modelview_stack.push(mat3x3Copy(new Float32Array(9), gl_modelview));
                                    mat3x3ApplySpace(gl_modelview, sprite_object.world_space);
                                    mat3x3Scale(gl_modelview, file.width / 2, file.height / 2);
                                    mat3x3ApplyAtlasSitePosition(gl_modelview, site);
                                    mat3x3Identity(gl_tex_matrix);
                                    mat3x3ApplyAtlasPageTexcoord(gl_tex_matrix, page);
                                    mat3x3ApplyAtlasSiteTexcoord(gl_tex_matrix, site);
                                    gl_color[3] = alpha * sprite_object.alpha;
                                    gl.useProgram(gl_shader.program);
                                    gl.uniformMatrix4fv(gl_shader.uniforms['uProjection'], false, gl_projection);
                                    gl.uniformMatrix3fv(gl_shader.uniforms['uModelview'], false, gl_modelview);
                                    gl.uniformMatrix3fv(gl_shader.uniforms['uTexMatrix'], false, gl_tex_matrix);
                                    gl.uniform4fv(gl_shader.uniforms['uColor'], gl_color);
                                    gl.activeTexture(gl.TEXTURE0);
                                    gl.bindTexture(gl.TEXTURE_2D, gl_texture);
                                    gl.uniform1i(gl_shader.uniforms['uSampler'], 0);
                                    glSetupAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
                                    glSetupAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
                                    gl.drawArrays(gl.TRIANGLE_FAN, 0, gl_vertex_position.count);
                                    glResetAttribute(gl, gl_shader, 'aVertexPosition', gl_vertex_position);
                                    glResetAttribute(gl, gl_shader, 'aVertexTexCoord', gl_vertex_texcoord);
                                    mat3x3Copy(gl_modelview, gl_modelview_stack.pop());
                                }
                                break;
                            case 'entity':
                                var entity_object = object;
                                gl_modelview_stack.push(mat3x3Copy(new Float32Array(9), gl_modelview));
                                mat3x3ApplySpace(gl_modelview, entity_object.world_space);
                                render.drawPose(entity_object.pose, atlas_data); // recursive
                                mat3x3Copy(gl_modelview, gl_modelview_stack.pop());
                                break;
                        }
                    });
                    gl_color[3] = alpha;
                };
                return RenderWebGL;
            })();
            exports_1("RenderWebGL", RenderWebGL);
        }
    }
});
