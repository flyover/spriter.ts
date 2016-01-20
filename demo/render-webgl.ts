import * as spriter from '../spriter.ts';
import * as atlas from './atlas.ts';

function repeat(format: string, count: number): string[] {
  const array: string[] = [];
  for (let index = 0; index < count; ++index) {
    array.push(format.replace(/{index}/g, index.toString()));
  }
  return array;
}

function flatten(array: any[], out: any[] = []): any[] {
  array.forEach(function(value: any): void {
    if (Array.isArray(value)) { flatten(value, out); } else { out.push(value); }
  });
  return out;
}

class glShader {
  public vs_src: string[];
  public fs_src: string[];
  public vs: WebGLShader;
  public fs: WebGLShader;
  public program: WebGLProgram;
  public uniforms: {[key: string]: WebGLUniformLocation};
  public attribs: {[key: string]: number};
}

class glVertex {
  public type: number; // FLOAT, BYTE, UNSIGNED_BYTE, SHORT, UNSIGNED_SHORT, INT, UNSIGNED_INT
  public size: number; // size in elements per vertex
  public count: number; // number of vertices
  public type_array: any; // Float32Array, Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array
  public buffer: WebGLBuffer;
  public buffer_type: number; // ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER
  public buffer_draw: number; // STREAM_DRAW, STATIC_DRAW or DYNAMIC_DRAW
}

export class RenderWebGL {
  gl: WebGLRenderingContext;
  gl_textures: {[key: string]: WebGLTexture} = {};
  gl_projection: Float32Array = mat4x4Identity(new Float32Array(16));
  gl_modelview: Float32Array = mat3x3Identity(new Float32Array(9));
  gl_modelview_stack: Float32Array[] = [];
  gl_tex_matrix: Float32Array = mat3x3Identity(new Float32Array(9));
  gl_color: Float32Array = vec4Identity(new Float32Array(4));
  gl_mesh_shader: glShader;
  gl_region_vertex_position: glVertex;
  gl_region_vertex_texcoord: glVertex;
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    const gl_mesh_shader_vs_src: string[] = [
      "precision mediump int;",
      "precision mediump float;",
      "uniform mat4 uProjection;",
      "uniform mat3 uModelview;",
      "uniform mat3 uTexMatrix;",
      "attribute vec2 aVertexPosition;", // [ x, y ]
      "attribute vec2 aVertexTexCoord;", // [ u, v ]
      "varying vec3 vTexCoord;",
      "void main(void) {",
      " vTexCoord = uTexMatrix * vec3(aVertexTexCoord, 1.0);",
      " gl_Position = uProjection * vec4(uModelview * vec3(aVertexPosition, 1.0), 1.0);",
      "}"
    ];
    const gl_mesh_shader_fs_src: string[] = [
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
    this.gl_region_vertex_position = glMakeVertex(gl, new Float32Array([ -1, -1,  1, -1,  1,  1, -1,  1 ]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ x, y ]
    this.gl_region_vertex_texcoord = glMakeVertex(gl, new Float32Array([  0,  1,  1,  1,  1,  0,  0,  0 ]), 2, gl.ARRAY_BUFFER, gl.STATIC_DRAW); // [ u, v ]
  }
  dropData(spriter_data: spriter.Data, atlas_data: atlas.Data): void {
    const render: RenderWebGL = this;
    const gl: WebGLRenderingContext = render.gl;
    if (!gl) { return; }
    Object.keys(render.gl_textures).forEach((image_key: string): void => {
      let gl_texture: WebGLTexture = render.gl_textures[image_key];
      gl.deleteTexture(gl_texture); gl_texture = null;
      delete render.gl_textures[image_key];
    });
    render.gl_textures = {};
  }
  loadData(spriter_data: spriter.Data, atlas_data: atlas.Data, images: {[key: string]: HTMLImageElement}) {
    const render: RenderWebGL = this;
    const gl: WebGLRenderingContext = render.gl;
    if (!gl) { return; }

    if (atlas_data) {
      // load atlas page images
      atlas_data.pages.forEach(function (page) {
        if (page.format !== 'RGBA8888') {
          throw new Error(page.format);
        }

        let gl_min_filter: number = gl.NONE;
        switch (page.min_filter) {
          case 'Nearest': gl_min_filter = gl.NEAREST; break;
          default: case 'Linear': gl_min_filter = gl.LINEAR; break;
          case 'MipMapNearestNearest': gl_min_filter = gl.NEAREST_MIPMAP_NEAREST; break;
          case 'MipMapLinearNearest': gl_min_filter = gl.LINEAR_MIPMAP_NEAREST; break;
          case 'MipMapNearestLinear': gl_min_filter = gl.NEAREST_MIPMAP_LINEAR; break;
          case 'MipMapLinearLinear': gl_min_filter = gl.LINEAR_MIPMAP_LINEAR; break;
        }

        let gl_mag_filter: number = gl.NONE;
        switch (page.mag_filter) {
          case 'Nearest': gl_mag_filter = gl.NEAREST; break;
          default: case 'Linear': gl_mag_filter = gl.LINEAR; break;
        }

        let gl_wrap_s: number = gl.NONE;
        switch (page.wrap_s) {
          case 'Repeat': gl_wrap_s = gl.REPEAT; break;
          default: case 'ClampToEdge': gl_wrap_s = gl.CLAMP_TO_EDGE; break;
          case 'MirroredRepeat': gl_wrap_s = gl.MIRRORED_REPEAT; break;
        }

        let gl_wrap_t: number = gl.NONE;
        switch (page.wrap_t) {
          case 'Repeat': gl_wrap_t = gl.REPEAT; break;
          default: case 'ClampToEdge': gl_wrap_t = gl.CLAMP_TO_EDGE; break;
          case 'MirroredRepeat': gl_wrap_t = gl.MIRRORED_REPEAT; break;
        }

        const image_key: string = page.name;
        const image: HTMLImageElement = images[image_key];
        const gl_texture: WebGLTexture = render.gl_textures[image_key] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, gl_texture);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl_min_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl_mag_filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl_wrap_s);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl_wrap_t);
      });
    } else {
      spriter_data.folder_array.forEach(function (folder: spriter.Folder): void {
        folder.file_array.forEach(function (file: spriter.File): void {
          switch (file.type) {
          case 'image':
            const image_key: string = file.name;
            const image: HTMLImageElement = images[image_key];
            const gl_texture: WebGLTexture = render.gl_textures[image_key] = gl.createTexture();
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
  }
  drawPose(spriter_pose, atlas_data) {
    const render: RenderWebGL = this;
    const gl: WebGLRenderingContext = render.gl;
    if (!gl) { return; }

    const gl_projection: Float32Array = render.gl_projection;
    const gl_modelview: Float32Array = render.gl_modelview;
    const gl_modelview_stack: Float32Array[] = render.gl_modelview_stack;
    const gl_tex_matrix: Float32Array = render.gl_tex_matrix;
    const gl_color: Float32Array = render.gl_color;

    const alpha: number = gl_color[3];

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const gl_textures: {[key: string]: WebGLTexture} = render.gl_textures;

    const gl_shader: glShader = render.gl_mesh_shader;
    const gl_vertex_position: glVertex = render.gl_region_vertex_position;
    const gl_vertex_texcoord: glVertex = render.gl_region_vertex_texcoord;

    spriter_pose.object_array.forEach(function (object: spriter.BaseObject): void {
      switch (object.type) {
      case 'sprite':
        const sprite_object: spriter.SpriteObject = <spriter.SpriteObject>object;
        const folder: spriter.Folder = spriter_pose.data.folder_array[sprite_object.folder_index];
        if (!folder) { return; }
        const file: spriter.ImageFile = <spriter.ImageFile>folder.file_array[sprite_object.file_index];
        if (!file) { return; }
        const site: atlas.Site = atlas_data && atlas_data.sites[file.name];
        const page: atlas.Page = site && site.page;
        const image_key: string = (page && page.name) || file.name;
        const gl_texture: WebGLTexture = gl_textures[image_key];
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
        const entity_object: spriter.EntityObject = <spriter.EntityObject>object;
        gl_modelview_stack.push(mat3x3Copy(new Float32Array(9), gl_modelview));
        mat3x3ApplySpace(gl_modelview, entity_object.world_space);
        render.drawPose(entity_object.pose, atlas_data); // recursive
        mat3x3Copy(gl_modelview, gl_modelview_stack.pop());
        break;
      }
    });

    gl_color[3] = alpha;
  }
}

export function vec4Identity(v: Float32Array): Float32Array {
  v[0] = v[1] = v[2] = v[3] = 1.0;
  return v;
}

export function vec4CopyColor(v: Float32Array, color: any): Float32Array {
  v[0] = color.r;
  v[1] = color.g;
  v[2] = color.b;
  v[3] = color.a;
  return v;
}

export function vec4ApplyColor(v: Float32Array, color: any): Float32Array {
  v[0] *= color.r;
  v[1] *= color.g;
  v[2] *= color.b;
  v[3] *= color.a;
  return v;
}

export function mat3x3Identity(m: Float32Array): Float32Array {
  m[1] = m[2] = m[3] =
  m[5] = m[6] = m[7] = 0.0;
  m[0] = m[4] = m[8] = 1.0;
  return m;
}

export function mat3x3Copy(m: Float32Array, other: Float32Array): Float32Array {
  m.set(other);
  return m;
}

export function mat3x3Ortho(m: Float32Array, l: number, r: number, b: number, t: number): Float32Array {
  const lr: number = 1 / (l - r);
  const bt: number = 1 / (b - t);
  m[0] *= -2 * lr;
  m[4] *= -2 * bt;
  m[6] += (l + r) * lr;
  m[7] += (t + b) * bt;
  return m;
}

export function mat3x3Translate(m: Float32Array, x: number, y: number): Float32Array {
  m[6] += m[0] * x + m[3] * y;
  m[7] += m[1] * x + m[4] * y;
  return m;
}

export function mat3x3RotateCosSin(m: Float32Array, c: number, s: number): Float32Array {
  const m0: number = m[0]; const m1: number = m[1];
  const m3: number = m[3]; const m4: number = m[4];
  m[0] = m0 * c + m3 * s;
  m[1] = m1 * c + m4 * s;
  m[3] = m3 * c - m0 * s;
  m[4] = m4 * c - m1 * s;
  return m;
}

export function mat3x3Rotate(m: Float32Array, angle: number): Float32Array {
  return mat3x3RotateCosSin(m, Math.cos(angle), Math.sin(angle));
}

export function mat3x3Scale(m: Float32Array, x: number, y: number): Float32Array {
  m[0] *= x; m[1] *= x; m[2] *= x;
  m[3] *= y; m[4] *= y; m[5] *= y;
  return m;
}

export function mat3x3Transform(m: Float32Array, v: Float32Array, out: Float32Array): Float32Array {
  const x: number = m[0] * v[0] + m[3] * v[1] + m[6];
  const y: number = m[1] * v[0] + m[4] * v[1] + m[7];
  const w: number = m[2] * v[0] + m[5] * v[1] + m[8];
  const iw: number = (w) ? (1 / w) : (1);
  out[0] = x * iw;
  out[1] = y * iw;
  return out;
}

export function mat3x3ApplySpace(m: Float32Array, space: spriter.Space): Float32Array {
  if (space) {
    mat3x3Translate(m, space.position.x, space.position.y);
    mat3x3Rotate(m, space.rotation.rad);
    mat3x3Scale(m, space.scale.x, space.scale.y);
  }
  return m;
}

export function mat3x3ApplyAtlasPageTexcoord(m: Float32Array, page: atlas.Page): Float32Array {
  if (page) {
    mat3x3Scale(m, 1 / page.w, 1 / page.h);
  }
  return m;
}

export function mat3x3ApplyAtlasSiteTexcoord(m: Float32Array, site: atlas.Site): Float32Array {
  if (site) {
    mat3x3Translate(m, site.x, site.y);
    if (site.rotate === -1) {
      mat3x3Translate(m, 0, site.w); // bottom-left corner
      mat3x3RotateCosSin(m, 0, -1); // -90 degrees
    } else if (site.rotate === 1) {
      mat3x3Translate(m, site.h, 0); // top-right corner
      mat3x3RotateCosSin(m, 0, 1); // 90 degrees
    }
    mat3x3Scale(m, site.w, site.h);
  }
  return m;
}

export function mat3x3ApplyAtlasSitePosition(m: Float32Array, site: atlas.Site): Float32Array {
  if (site) {
    mat3x3Scale(m, 1 / site.original_w, 1 / site.original_h);
    mat3x3Translate(m, 2 * site.offset_x - (site.original_w - site.w), (site.original_h - site.h) - 2 * site.offset_y);
    mat3x3Scale(m, site.w, site.h);
  }
  return m;
}

export function mat4x4Identity(m: Float32Array): Float32Array {
  m[1] = m[2] = m[3] = m[4] =
  m[6] = m[7] = m[8] = m[9] =
  m[11] = m[12] = m[13] = m[14] = 0.0;
  m[0] = m[5] = m[10] = m[15] = 1.0;
  return m;
}

export function mat4x4Copy(m: Float32Array, other: Float32Array): Float32Array {
  m.set(other);
  return m;
}

export function mat4x4Ortho(m: Float32Array, l: number, r: number, b: number, t: number, n: number, f: number): Float32Array {
  const lr: number = 1 / (l - r);
  const bt: number = 1 / (b - t);
  const nf: number = 1 / (n - f);
  m[0] = -2 * lr;
  m[5] = -2 * bt;
  m[10] = 2 * nf;
  m[12] = (l + r) * lr;
  m[13] = (t + b) * bt;
  m[14] = (f + n) * nf;
  return m;
}

export function mat4x4Translate(m: Float32Array, x: number, y: number, z: number = 0): Float32Array {
  m[12] += m[0] * x + m[4] * y + m[8] * z;
  m[13] += m[1] * x + m[5] * y + m[9] * z;
  m[14] += m[2] * x + m[6] * y + m[10] * z;
  m[15] += m[3] * x + m[7] * y + m[11] * z;
  return m;
}

export function mat4x4RotateCosSinZ(m: Float32Array, c: number, s: number): Float32Array {
  const a_x: number = m[0]; const a_y: number = m[1]; const a_z: number = m[2]; const a_w: number = m[3];
  const b_x: number = m[4]; const b_y: number = m[5]; const b_z: number = m[6]; const b_w: number = m[7];
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

export function mat4x4RotateZ(m: Float32Array, angle: number): Float32Array {
  return mat4x4RotateCosSinZ(m, Math.cos(angle), Math.sin(angle));
}

export function mat4x4Scale(m: Float32Array, x: number, y: number, z: number = 1): Float32Array {
  m[0] *= x; m[1] *= x; m[2] *= x; m[3] *= x;
  m[4] *= y; m[5] *= y; m[6] *= y; m[7] *= y;
  m[8] *= z; m[9] *= z; m[10] *= z; m[11] *= z;
  return m;
}

export function glCompileShader(gl: WebGLRenderingContext, src: string[], type: number): WebGLShader {
  src = flatten(src);
  let shader: WebGLShader = gl.createShader(type);
  gl.shaderSource(shader, src.join('\n'));
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    src.forEach(function(line: string, index: number): void { console.log(index + 1, line); });
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    shader = null;
  }
  return shader;
}

export function glLinkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  let program: WebGLProgram = gl.createProgram();
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

export function glGetUniforms(gl: WebGLRenderingContext, program: WebGLProgram, uniforms: {[key: string]: WebGLUniformLocation}): {[key: string]: WebGLUniformLocation} {
  const count: number = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let index = 0; index < count; ++index) {
    const uniform: WebGLActiveInfo = gl.getActiveUniform(program, index);
    uniforms[uniform.name] = gl.getUniformLocation(program, uniform.name);
  }
  return uniforms;
}

export function glGetAttribs(gl: WebGLRenderingContext, program: WebGLProgram, attribs: {[key: string]: number}): {[key: string]: number} {
  const count: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let index = 0; index < count; ++index) {
    const attrib: WebGLActiveInfo = gl.getActiveAttrib(program, index);
    attribs[attrib.name] = gl.getAttribLocation(program, attrib.name);
  }
  return attribs;
}

export function glMakeShader(gl: WebGLRenderingContext, vs_src: string[], fs_src: string[]): glShader {
  const shader: glShader = new glShader();
  shader.vs_src = vs_src;
  shader.fs_src = fs_src;
  shader.vs = glCompileShader(gl, shader.vs_src, gl.VERTEX_SHADER);
  shader.fs = glCompileShader(gl, shader.fs_src, gl.FRAGMENT_SHADER);
  shader.program = glLinkProgram(gl, shader.vs, shader.fs);
  shader.uniforms = glGetUniforms(gl, shader.program, {});
  shader.attribs = glGetAttribs(gl, shader.program, {});
  return shader;
}

export function glMakeVertex(gl: WebGLRenderingContext, type_array: any, size: number, buffer_type: number, buffer_draw: number): glVertex {
  const vertex: glVertex = new glVertex();
  if (type_array instanceof Float32Array) { vertex.type = gl.FLOAT; }
  else if (type_array instanceof Int8Array) { vertex.type = gl.BYTE; }
  else if (type_array instanceof Uint8Array) { vertex.type = gl.UNSIGNED_BYTE; }
  else if (type_array instanceof Int16Array) { vertex.type = gl.SHORT; }
  else if (type_array instanceof Uint16Array) { vertex.type = gl.UNSIGNED_SHORT; }
  else if (type_array instanceof Int32Array) { vertex.type = gl.INT; }
  else if (type_array instanceof Uint32Array) { vertex.type = gl.UNSIGNED_INT; }
  else { vertex.type = gl.NONE; throw new Error(); }
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

export function glSetupAttribute(gl: WebGLRenderingContext, shader: glShader, format: string, vertex: glVertex, count: number = 0): void {
  gl.bindBuffer(vertex.buffer_type, vertex.buffer);
  if (count > 0) {
    const sizeof_vertex: number = vertex.type_array.BYTES_PER_ELEMENT * vertex.size; // in bytes
    const stride: number = sizeof_vertex * count;
    for (let index = 0; index < count; ++index) {
      const offset: number = sizeof_vertex * index;
      const attrib: number = shader.attribs[format.replace(/{index}/g, index.toString())];
      gl.vertexAttribPointer(attrib, vertex.size, vertex.type, false, stride, offset);
      gl.enableVertexAttribArray(attrib);
    }
  } else {
    const attrib: number = shader.attribs[format];
    gl.vertexAttribPointer(attrib, vertex.size, vertex.type, false, 0, 0);
    gl.enableVertexAttribArray(attrib);
  }
}

export function glResetAttribute(gl: WebGLRenderingContext, shader: glShader, format: string, vertex: glVertex, count: number = 0): void {
  if (count > 0) {
    for (let index = 0; index < count; ++index) {
      const attrib: number = shader.attribs[format.replace(/{index}/g, index.toString())];
      gl.disableVertexAttribArray(attrib);
    }
  } else {
    const attrib: number = shader.attribs[format];
    gl.disableVertexAttribArray(attrib);
  }
}
