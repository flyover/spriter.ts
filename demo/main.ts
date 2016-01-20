/// <reference path="../../node_modules/typescript/lib/lib.d.ts"/>

import * as spriter from '../spriter.ts';
import * as atlas from './atlas.ts';
import { RenderCtx2D } from './render-ctx2d.ts';
import { RenderWebGL } from './render-webgl.ts';
import { mat4x4Identity, mat4x4Ortho, mat4x4Translate, mat4x4Scale } from './render-webgl.ts';
import { xml2json } from './xml2json.ts';

export function start(): void {
  document.body.style.margin = '0px';
  document.body.style.border = '0px';
  document.body.style.padding = '0px';
  document.body.style.overflow = 'hidden';
  document.body.style.fontFamily = '"PT Sans",Arial,"Helvetica Neue",Helvetica,Tahoma,sans-serif';

  const controls: HTMLDivElement = document.createElement('div');
  controls.style.position = 'absolute';
  document.body.appendChild(controls);

  const add_checkbox_control = function(text: string, checked: boolean, callback: (checked: boolean) => void): void {
    const control: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');
    const label: HTMLLabelElement = document.createElement('label');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('click', function(): void { callback(this.checked); });
    control.appendChild(input);
    label.innerHTML = text;
    control.appendChild(label);
    controls.appendChild(control);
  };

  const add_range_control = function(text: string, init: number, min: number, max: number, step: number, callback: (value: number) => void): void {
    const control: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');
    const label: HTMLLabelElement = document.createElement('label');
    input.type = 'range';
    input.value = init.toString();
    input.min = min.toString();
    input.max = max.toString();
    input.step = step.toString();
    input.addEventListener('input', function(): void { callback(this.value); label.innerHTML = text + " : " + this.value; });
    control.appendChild(input);
    label.innerHTML = text + " : " + init;
    control.appendChild(label);
    controls.appendChild(control);
  };

  const messages: HTMLDivElement = document.createElement('div');
  messages.style.position = 'absolute';
  messages.style.left = '0px';
  messages.style.right = '0px';
  messages.style.bottom = '0px';
  messages.style.textAlign = 'center';
  messages.style.zIndex = '-1'; // behind controls
  document.body.appendChild(messages);

  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'absolute';
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  canvas.style.zIndex = '-1'; // behind controls

  document.body.appendChild(canvas);

  const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>(canvas.getContext('2d'));

  window.addEventListener('resize', function (): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
  });

  const render_ctx2d: RenderCtx2D = new RenderCtx2D(ctx);

  const canvas_gl: HTMLCanvasElement = document.createElement('canvas');
  canvas_gl.width = window.innerWidth;
  canvas_gl.height = window.innerHeight;
  canvas_gl.style.position = 'absolute';
  canvas_gl.style.width = canvas_gl.width + 'px';
  canvas_gl.style.height = canvas_gl.height + 'px';
  canvas_gl.style.zIndex = '-2'; // behind 2D context canvas

  document.body.appendChild(canvas_gl);

  const gl: WebGLRenderingContext = <WebGLRenderingContext>(canvas_gl.getContext('webgl') || canvas_gl.getContext('experimental-webgl'));

  window.addEventListener('resize', function (): void {
    canvas_gl.width = window.innerWidth;
    canvas_gl.height = window.innerHeight;
    canvas_gl.style.width = canvas_gl.width + 'px';
    canvas_gl.style.height = canvas_gl.height + 'px';
  });

  const render_webgl: RenderWebGL = new RenderWebGL(gl);

  let camera_x: number = 0;
  let camera_y: number = 0;
  let camera_zoom: number = 1;

  let enable_render_webgl: boolean = !!gl;
  let enable_render_ctx2d: boolean = !!ctx && !enable_render_webgl;

  add_checkbox_control("GL", enable_render_webgl, function (checked: boolean): void { enable_render_webgl = checked; });
  add_checkbox_control("2D", enable_render_ctx2d, function (checked: boolean): void { enable_render_ctx2d = checked; });

  let enable_render_debug_pose: boolean = false;

  add_checkbox_control("2D Debug Pose", enable_render_debug_pose, function (checked: boolean): void { enable_render_debug_pose = checked; });

  // sound player (Web Audio Context)
  const player_web: any = {};
  player_web.ctx = AudioContext && new AudioContext();
  player_web.mute = true;
  player_web.sounds = {};

  add_checkbox_control("Mute", player_web.mute, function (checked: boolean): void { player_web.mute = checked; });

  let spriter_data: spriter.Data = null;
  let spriter_pose: spriter.Pose = null;
  let spriter_pose_next: spriter.Pose = null;
  let atlas_data: atlas.Data = null;

  let anim_time: number = 0;
  let anim_length: number = 0;
  let anim_length_next: number = 0;
  let anim_rate: number = 1;
  let anim_repeat: number = 2;

  let anim_blend: number = 0.0;

  add_range_control("Anim Rate", anim_rate, -2.0, 2.0, 0.1, function (value: number): void { anim_rate = value; });

  add_range_control("Anim Blend", anim_blend, 0.0, 1.0, 0.01, function (value: number): void { anim_blend = value; });

  let alpha: number = 1.0;

  add_range_control("Alpha", alpha, 0.0, 1.0, 0.01, function (value: number): void { alpha = value; });

  const loadFile = function (file: any, callback: () => void) {
    render_ctx2d.dropData(spriter_data, atlas_data);
    render_webgl.dropData(spriter_data, atlas_data);

    spriter_pose = null;
    spriter_pose_next = null;
    atlas_data = null;

    const file_path: string = file.path;
    const file_spriter_url: string = file_path + file.spriter_url;
    const file_atlas_url: string = file.atlas_url ? file_path + file.atlas_url : "";

    loadText(file_spriter_url, function (err: string, text: string): void {
      if (err) {
        callback();
        return;
      }

      const match: RegExpMatchArray = file.spriter_url.match(/\.scml$/i);
      if (match) {
        const parser: DOMParser = new DOMParser();
        // replace &quot; with \"
        const xml_text: string = text.replace(/&quot;/g, "\"");
        const xml: any = parser.parseFromString(xml_text, 'text/xml');
        let json_text: string = xml2json(xml, '\t');
        // attributes marked with @, replace "@(.*)": with "\1":
        json_text = json_text.replace(/"@(.*)":/g, "\"$1\":");
        const json: any = JSON.parse(json_text);
        const spriter_json: any = json.spriter_data;
        spriter_data = new spriter.Data().load(spriter_json);
      } else {
        spriter_data = new spriter.Data().load(JSON.parse(text));
      }

      spriter_pose = new spriter.Pose(spriter_data);
      spriter_pose_next = new spriter.Pose(spriter_data);

      loadText(file_atlas_url, function (err: string, atlas_text: string): void {
        const images: {[key: string]: HTMLImageElement} = {};

        let counter: number = 0;
        const counter_inc = function(): void { counter++; };
        const counter_dec = function(): void {
          if (--counter === 0) {
            render_ctx2d.loadData(spriter_data, atlas_data, images);
            render_webgl.loadData(spriter_data, atlas_data, images);
            callback();
          }
        };

        counter_inc();

        if (!err && atlas_text) {
          atlas_data = new atlas.Data().importTpsText(atlas_text);

          // load atlas page images
          const dir_path: string = file_atlas_url.slice(0, file_atlas_url.lastIndexOf('/'));
          atlas_data.pages.forEach(function (page: atlas.Page): void {
            const image_key: string = page.name;
            const image_url: string = dir_path + "/" + image_key;
            counter_inc();
            const image: HTMLImageElement = images[image_key] = loadImage(image_url, (function(page: atlas.Page) {
              return function(err: string, image: HTMLImageElement): void {
                if (err) {
                  console.log("error loading:", image && image.src || page.name);
                }
                page.w = page.w || image.width;
                page.h = page.h || image.height;
                counter_dec();
              };
            })(page));
          });
        } else {
          spriter_data.folder_array.forEach(function (folder: spriter.Folder): void {
            folder.file_array.forEach(function (file: spriter.File): void {
              switch (file.type) {
              case 'image':
                const image_key: string = file.name;
                counter_inc();
                const image: HTMLImageElement = images[image_key] = loadImage(file_path + file.name, (function (file: spriter.File) {
                  return function(err: string, image: HTMLImageElement) {
                    if (err) {
                      console.log("error loading:", image && image.src || file.name);
                    }
                    counter_dec();
                  };
                })(file));
                break;
              case 'sound':
                break;
              default:
                console.log("TODO: load", file.type, file.name);
                break;
              }
            });
          });
        }

        // with an atlas, still need to load the sound files
        spriter_data.folder_array.forEach(function (folder: spriter.Folder): void {
          folder.file_array.forEach(function (file: spriter.File): void {
            switch (file.type) {
            case 'sound':
              if (player_web.ctx) {
                counter_inc();
                loadSound(file_path + file.name, (function (file) {
                  return function(err: string, buffer) {
                    if (err) {
                      console.log("error loading sound", file.name);
                    }
                    player_web.ctx.decodeAudioData(buffer, function(buffer) {
                      player_web.sounds[file.name] = buffer;
                    },
                      function(err) {
                        console.log("error decoding sound", file.name);
                      });
                    counter_dec();
                  };
                })(file));
              } else {
                console.log("TODO: load", file.type, file.name);
              }
              break;
            }
          });
        });

        counter_dec();
      });
    });
  };

  const files: any[] = [];

  const add_file = function (path: string, spriter_url: string, atlas_url: string = "") {
    const file: any = {};
    file.path = path;
    file.spriter_url = spriter_url;
    file.atlas_url = atlas_url;
    files.push(file);
  };

  add_file("GreyGuy/", "player.scon", "player.tps.json");
  add_file("GreyGuyPlus/", "player_006.scon", "player_006.tps.json");

  // add_file("SpriterExamples/BoxTagVariable/", "player.scon");
  // add_file("SpriterExamples/GreyGuyCharMaps/", "player_001.scon");
  // add_file("SpriterExamples/GreyGuyPlusSoundAndSubEntity/", "player_006.scon");
  // add_file("SpriterExamples/PointsTriggers/", "gunner_player_smaller_head.scon");
  // add_file("SpriterExamples/Variable/", "LetterBot.scon");

  // add_file("https://raw.githubusercontent.com/treefortress/SpriterAS/master/demo/src/assets/spriter/brawler/", "brawler.scml");
  // add_file("https://raw.githubusercontent.com/treefortress/SpriterAS/master/demo/src/assets/spriter/imp/", "imp.scml");
  // add_file("https://raw.githubusercontent.com/treefortress/SpriterAS/master/demo/src/assets/spriter/mage/", "mage.scml");
  // add_file("https://raw.githubusercontent.com/treefortress/SpriterAS/master/demo/src/assets/spriter/orc/", "orc.scml");

  // add_file("https://raw.githubusercontent.com/Malhavok/Spriter2Unity/master/examples/Crabby/Spriter/", "Crabby.scml");

  // add_file("https://raw.githubusercontent.com/loodakrawa/SpriterDotNet/master/SpriterDotNet.Unity/Assets/SpriterDotNetExamples/Scml/GreyGuy/", "player.scml");
  // add_file("https://raw.githubusercontent.com/loodakrawa/SpriterDotNet/master/SpriterDotNet.Unity/Assets/SpriterDotNetExamples/Scml/GreyGuyPlus/", "player_006.scml");
  // add_file("https://raw.githubusercontent.com/loodakrawa/SpriterDotNet/master/SpriterDotNet.Unity/Assets/SpriterDotNetExamples/Scml/TestSquares/", "squares.scml");

  let file_index: number = 0;
  let entity_index: number = 0;
  let anim_index: number = 0;

  let loading: boolean = false;

  let file: any = files[file_index];
  messages.innerHTML = "loading";
  loading = true; loadFile(file, function (): void {
    loading = false;
    const entity_keys: string[] = spriter_data.getEntityKeys();
    const entity_key: string = entity_keys[entity_index = 0];
    spriter_pose.setEntity(entity_key);
    spriter_pose_next.setEntity(entity_key);
    // const entity: spriter.Entity = spriter_pose.curEntity();
    // console.log(entity.character_map_keys);
    // spriter_pose.character_map_key_array = entity.character_map_keys;
    // spriter_pose.character_map_key_array = [ 'glasses', 'blue gloves', 'black gloves', 'look ma no hands' ];
    // spriter_pose.character_map_key_array = [ 'glasses', 'blue gloves' ];
    const anim_keys: string[] = spriter_data.getAnimKeys(entity_key);
    const anim_key: string = anim_keys[anim_index = 0];
    spriter_pose.setAnim(anim_key);
    const anim_key_next: string = anim_keys[(anim_index + 1) % anim_keys.length];
    spriter_pose_next.setAnim(anim_key_next);
    spriter_pose.setTime(anim_time = 0);
    spriter_pose_next.setTime(anim_time);
    anim_length = spriter_pose.curAnimLength() || 1000;
    anim_length_next = spriter_pose_next.curAnimLength() || 1000;
  });

  let prev_time: number = 0;

  const loop = function(time) {
    requestAnimationFrame(loop);

    let entity_keys: string[];
    let entity_key: string;
    let anim_keys: string[];
    let anim_key: string;
    let anim_key_next: string;

    const dt: number = time - (prev_time || time); prev_time = time; // ms

    if (!loading) {
      spriter_pose.update(dt * anim_rate);
      const anim_rate_next: number = anim_rate * anim_length_next / anim_length;
      spriter_pose_next.update(dt * anim_rate_next);

      anim_time += dt * anim_rate;

      if (anim_time >= (anim_length * anim_repeat)) {
        entity_keys = spriter_data.getEntityKeys();
        entity_key = entity_keys[entity_index];
        anim_keys = spriter_data.getAnimKeys(entity_key);
        if (++anim_index >= anim_keys.length) {
          anim_index = 0;
          if (++entity_index >= entity_keys.length) {
            entity_index = 0;
            if (files.length > 1) {
              if (++file_index >= files.length) {
                file_index = 0;
              }
              file = files[file_index];
              messages.innerHTML = "loading";
              loading = true; loadFile(file, function() {
                loading = false;
                entity_keys = spriter_data.getEntityKeys();
                entity_key = entity_keys[entity_index = 0];
                spriter_pose.setEntity(entity_key);
                spriter_pose_next.setEntity(entity_key);
                anim_keys = spriter_data.getAnimKeys(entity_key);
                anim_key = anim_keys[anim_index = 0];
                spriter_pose.setAnim(anim_key);
                anim_key_next = anim_keys[(anim_index + 1) % anim_keys.length];
                spriter_pose_next.setAnim(anim_key_next);
                spriter_pose.setTime(anim_time = 0);
                spriter_pose_next.setTime(anim_time);
                anim_length = spriter_pose.curAnimLength() || 1000;
                anim_length_next = spriter_pose_next.curAnimLength() || 1000;
              });
              return;
            }
          }
          entity_keys = spriter_data.getEntityKeys();
          entity_key = entity_keys[entity_index];
          spriter_pose.setEntity(entity_key);
          spriter_pose_next.setEntity(entity_key);
        }
        entity_keys = spriter_data.getEntityKeys();
        entity_key = entity_keys[entity_index];
        anim_keys = spriter_data.getAnimKeys(entity_key);
        anim_key = anim_keys[anim_index];
        spriter_pose.setAnim(anim_key);
        anim_key_next = anim_keys[(anim_index + 1) % anim_keys.length];
        spriter_pose_next.setAnim(anim_key_next);
        spriter_pose.setTime(anim_time = 0);
        spriter_pose_next.setTime(anim_time);
        anim_length = spriter_pose.curAnimLength() || 1000;
        anim_length_next = spriter_pose_next.curAnimLength() || 1000;
      }

      entity_keys = spriter_data.getEntityKeys();
      entity_key = entity_keys[entity_index];
      anim_keys = spriter_data.getAnimKeys(entity_key);
      anim_key = anim_keys[anim_index];
      anim_key_next = anim_keys[(anim_index + 1) % anim_keys.length];
      messages.innerHTML = "entity: " + entity_key + ", anim: " + anim_key + ", next anim: " + anim_key_next + "<br>" + file.path + file.spriter_url;
      if (spriter_pose.event_array.length > 0) {
        messages.innerHTML += "<br>events: " + spriter_pose.event_array;
      }
      if (spriter_pose.sound_array.length > 0) {
        messages.innerHTML += "<br>sounds: " + spriter_pose.sound_array;
      }
      if (spriter_pose.tag_array.length > 0) {
        messages.innerHTML += "<br>tags: " + spriter_pose.tag_array;
      }
      const var_map_keys: string[] = Object.keys(spriter_pose.var_map);
      if (var_map_keys.length > 0) {
        messages.innerHTML += "<br>vars: ";
        var_map_keys.forEach((key: string): void => {
          messages.innerHTML += "<br>" + key + " : " + spriter_pose.var_map[key];
        });
      }
    }

    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    if (gl) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    if (loading) { return; }

    spriter_pose.strike();
    spriter_pose_next.strike();

    spriter_pose.sound_array.forEach(function(sound) {
      if (!player_web.mute) {
        if (player_web.ctx) {
          const source: AudioBufferSourceNode = player_web.ctx.createBufferSource();
          source.buffer = player_web.sounds[sound.name];
          const gain: GainNode = player_web.ctx.createGain();
          gain.gain = sound.volume;
          const stereo_panner: StereoPannerNode = player_web.ctx.createStereoPanner();
          stereo_panner.pan.value = sound.panning;
          source.connect(gain);
          gain.connect(stereo_panner);
          stereo_panner.connect(player_web.ctx.destination);
          source.start(0);
        } else {
          console.log("TODO: play sound", sound.name, sound.volume, sound.panning);
        }
      }
    });

    const spin: number = 1;

    // blend next pose bone into pose bone
    spriter_pose.bone_array.forEach(function(bone: spriter.Bone, bone_index: number): void {
      const bone_next: spriter.Bone = spriter_pose_next.bone_array[bone_index];
      if (!bone_next) { return; }
      spriter.Space.tween(bone.local_space, bone_next.local_space, anim_blend, spin, bone.local_space);
    });

    // blend next pose object into pose object
    spriter_pose.object_array.forEach(function(object: spriter.BaseObject, object_index: number): void {
      const object_next: spriter.BaseObject = spriter_pose_next.object_array[object_index];
      if (!object_next) { return; }
      switch (object.type) {
        case 'sprite':
          const sprite_object: spriter.SpriteObject = <spriter.SpriteObject>object;
          const sprite_object_next: spriter.SpriteObject = <spriter.SpriteObject>object_next;
          spriter.Space.tween(sprite_object.local_space, sprite_object_next.local_space, anim_blend, spin, sprite_object.local_space);
          if (anim_blend >= 0.5) {
            sprite_object.folder_index = sprite_object_next.folder_index;
            sprite_object.file_index = sprite_object_next.file_index;
            sprite_object.pivot.copy(sprite_object_next.pivot);
          }
          sprite_object.alpha = spriter.tween(sprite_object.alpha, sprite_object_next.alpha, anim_blend);
          break;
        case 'bone':
          const bone_object: spriter.Bone = <spriter.Bone>object;
          const bone_object_next: spriter.Bone = <spriter.Bone>object_next;
          spriter.Space.tween(bone_object.local_space, bone_object_next.local_space, anim_blend, spin, bone_object.local_space);
          break;
        case 'box':
          const box_object: spriter.BoxObject = <spriter.BoxObject>object;
          const box_object_next: spriter.BoxObject = <spriter.BoxObject>object_next;
          spriter.Space.tween(box_object.local_space, box_object_next.local_space, anim_blend, spin, box_object.local_space);
          if (anim_blend >= 0.5) {
            box_object.pivot.copy(box_object_next.pivot);
          }
          break;
        case 'point':
          const point_object: spriter.PointObject = <spriter.PointObject>object;
          const point_object_next: spriter.PointObject = <spriter.PointObject>object_next;
          spriter.Space.tween(point_object.local_space, point_object_next.local_space, anim_blend, spin, point_object.local_space);
          break;
        case 'sound':
          const sound_object: spriter.SoundObject = <spriter.SoundObject>object;
          const sound_object_next: spriter.SoundObject = <spriter.SoundObject>object_next;
          if (anim_blend >= 0.5) {
            sound_object.name = sound_object_next.name;
          }
          sound_object.volume = spriter.tween(sound_object.volume, sound_object_next.volume, anim_blend);
          sound_object.panning = spriter.tween(sound_object.panning, sound_object_next.panning, anim_blend);
          break;
        case 'entity':
          const entity_object: spriter.EntityObject = <spriter.EntityObject>object;
          const entity_object_next: spriter.EntityObject = <spriter.EntityObject>object_next;
          spriter.Space.tween(entity_object.local_space, entity_object_next.local_space, anim_blend, spin, entity_object.local_space);
          break;
        case 'variable':
          break;
        default:
          throw new Error(object.type);
      }
    });

    // compute bone world space
    spriter_pose.bone_array.forEach(function(bone, bone_index) {
      const parent_bone: spriter.Bone = spriter_pose.bone_array[bone.parent_index];
      if (parent_bone) {
        spriter.Space.combine(parent_bone.world_space, bone.local_space, bone.world_space);
      } else {
        bone.world_space.copy(bone.local_space);
      }
    });

    // compute object world space
    spriter_pose.object_array.forEach(function(object) {
      switch (object.type) {
        case 'sprite': {
          const sprite_object: spriter.SpriteObject = <spriter.SpriteObject>object;
          const bone: spriter.Bone = spriter_pose.bone_array[sprite_object.parent_index];
          if (bone) {
            spriter.Space.combine(bone.world_space, sprite_object.local_space, sprite_object.world_space);
          } else {
            sprite_object.world_space.copy(sprite_object.local_space);
          }
          const folder: spriter.Folder = spriter_data.folder_array[sprite_object.folder_index];
          const image_file: spriter.ImageFile = <spriter.ImageFile>(folder && folder.file_array[sprite_object.file_index]);
          if (image_file) {
            const offset_x: number = (0.5 - sprite_object.pivot.x) * image_file.width;
            const offset_y: number = (0.5 - sprite_object.pivot.y) * image_file.height;
            spriter.Space.translate(sprite_object.world_space, offset_x, offset_y);
          }
          break;
        }
        case 'bone': {
          const bone_object: spriter.Bone = <spriter.Bone>object;
          const bone: spriter.Bone = spriter_pose.bone_array[bone_object.parent_index];
          if (bone) {
            spriter.Space.combine(bone.world_space, bone_object.local_space, bone_object.world_space);
          } else {
            bone_object.world_space.copy(bone_object.local_space);
          }
          break;
        }
        case 'box': {
          const box_object: spriter.BoxObject = <spriter.BoxObject>object;
          const bone: spriter.Bone = spriter_pose.bone_array[box_object.parent_index];
          if (bone) {
            spriter.Space.combine(bone.world_space, box_object.local_space, box_object.world_space);
          } else {
            box_object.world_space.copy(box_object.local_space);
          }
          const entity: spriter.Entity = spriter_pose.curEntity();
          const box_info: spriter.BoxObjInfo = <spriter.BoxObjInfo>(entity.obj_info_map[box_object.name]);
          if (box_info) {
            const offset_x: number = (0.5 - box_object.pivot.x) * box_info.w;
            const offset_y: number = (0.5 - box_object.pivot.y) * box_info.h;
            spriter.Space.translate(box_object.world_space, offset_x, offset_y);
          }
          break;
        }
        case 'point': {
          const point_object: spriter.PointObject = <spriter.PointObject>object;
          const bone: spriter.Bone = spriter_pose.bone_array[point_object.parent_index];
          if (bone) {
            spriter.Space.combine(bone.world_space, point_object.local_space, point_object.world_space);
          } else {
            point_object.world_space.copy(point_object.local_space);
          }
          break;
        }
        case 'sound':
          break;
        case 'entity': {
          const entity_object: spriter.EntityObject = <spriter.EntityObject>object;
          const bone: spriter.Bone = spriter_pose.bone_array[entity_object.parent_index];
          if (bone) {
            spriter.Space.combine(bone.world_space, entity_object.local_space, entity_object.world_space);
          } else {
            entity_object.world_space.copy(entity_object.local_space);
          }
          break;
        }
        case 'variable':
          break;
        default:
          throw new Error(object.type);
      }
    });

    if (ctx) {
      ctx.globalAlpha = alpha;

      // origin at center, x right, y up
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2); ctx.scale(1, -1);

      if (enable_render_ctx2d && enable_render_webgl) {
        ctx.translate(-ctx.canvas.width / 4, 0);
      }

      ctx.translate(-camera_x, -camera_y);
      ctx.scale(camera_zoom, camera_zoom);
      ctx.lineWidth = 1 / camera_zoom;

      if (enable_render_ctx2d) {
        render_ctx2d.drawPose(spriter_pose, atlas_data);
        // ctx.translate(0, -10);
        // render_ctx2d.drawPose(spriter_pose_next, atlas_data);
      }

      if (enable_render_debug_pose) {
        render_ctx2d.drawDebugPose(spriter_pose, atlas_data);
        // ctx.translate(0, -10);
        // render_ctx2d.drawDebugPose(spriter_pose_next, atlas_data);
      }
    }

    if (gl) {
      const gl_color: Float32Array = render_webgl.gl_color;
      gl_color[3] = alpha;

      const gl_projection: Float32Array = render_webgl.gl_projection;
      mat4x4Identity(gl_projection);
      mat4x4Ortho(gl_projection, -gl.canvas.width / 2, gl.canvas.width / 2, -gl.canvas.height / 2, gl.canvas.height / 2, -1, 1);

      if (enable_render_ctx2d && enable_render_webgl) {
        mat4x4Translate(gl_projection, gl.canvas.width / 4, 0, 0);
      }

      mat4x4Translate(gl_projection, -camera_x, -camera_y, 0);
      mat4x4Scale(gl_projection, camera_zoom, camera_zoom, camera_zoom);

      if (enable_render_webgl) {
        render_webgl.drawPose(spriter_pose, atlas_data);
        // mat4x4Translate(gl_projection, 0, -10, 0);
        // render_webgl.drawPose(spriter_pose_next, atlas_data);
      }
    }
  };

  requestAnimationFrame(loop);
}

function loadText(url: string, callback: (error: string, text: string) => void): XMLHttpRequest {
  const req: XMLHttpRequest = new XMLHttpRequest();
  if (url) {
    req.open("GET", url, true);
    req.responseType = 'text';
    req.addEventListener('error', function(): void { callback("error", null); });
    req.addEventListener('abort', function(): void { callback("abort", null); });
    req.addEventListener('load', function(): void {
      if (req.status === 200) {
        callback(null, req.response);
      } else {
        callback(req.response, null);
      }
    });
    req.send();
  } else {
    callback("error", null);
  }
  return req;
}

function loadImage(url: string, callback: (error: string, image: HTMLImageElement) => void): HTMLImageElement {
  const image: HTMLImageElement = new Image();
  image.crossOrigin = "Anonymous";
  image.addEventListener('error', function(): void { callback("error", null); });
  image.addEventListener('abort', function(): void { callback("abort", null); });
  image.addEventListener('load', function(): void { callback(null, image); });
  image.src = url;
  return image;
}

function loadSound(url: string, callback: (error: string, buffer: ArrayBuffer) => void): XMLHttpRequest {
  const req = new XMLHttpRequest();
  if (url) {
    req.open("GET", url, true);
    req.responseType = 'arraybuffer';
    req.addEventListener('error', function (event) { callback("error", null); });
    req.addEventListener('abort', function (event) { callback("abort", null); });
    req.addEventListener('load', function (event) {
      if (req.status === 200) {
        callback(null, req.response);
      } else {
        callback(req.response, null);
      }
    });
    req.send();
  } else {
    callback("error", null);
  }
  return req;
}
