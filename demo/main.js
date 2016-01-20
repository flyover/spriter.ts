System.register(['../spriter.ts', './atlas.ts', './render-ctx2d.ts', './render-webgl.ts', './xml2json.ts'], function(exports_1) {
    "use strict";
    var spriter, atlas, render_ctx2d_ts_1, render_webgl_ts_1, render_webgl_ts_2, xml2json_ts_1;
    function start() {
        document.body.style.margin = '0px';
        document.body.style.border = '0px';
        document.body.style.padding = '0px';
        document.body.style.overflow = 'hidden';
        document.body.style.fontFamily = '"PT Sans",Arial,"Helvetica Neue",Helvetica,Tahoma,sans-serif';
        var controls = document.createElement('div');
        controls.style.position = 'absolute';
        document.body.appendChild(controls);
        var add_checkbox_control = function (text, checked, callback) {
            var control = document.createElement('div');
            var input = document.createElement('input');
            var label = document.createElement('label');
            input.type = 'checkbox';
            input.checked = checked;
            input.addEventListener('click', function () { callback(this.checked); });
            control.appendChild(input);
            label.innerHTML = text;
            control.appendChild(label);
            controls.appendChild(control);
        };
        var add_range_control = function (text, init, min, max, step, callback) {
            var control = document.createElement('div');
            var input = document.createElement('input');
            var label = document.createElement('label');
            input.type = 'range';
            input.value = init.toString();
            input.min = min.toString();
            input.max = max.toString();
            input.step = step.toString();
            input.addEventListener('input', function () { callback(this.value); label.innerHTML = text + " : " + this.value; });
            control.appendChild(input);
            label.innerHTML = text + " : " + init;
            control.appendChild(label);
            controls.appendChild(control);
        };
        var messages = document.createElement('div');
        messages.style.position = 'absolute';
        messages.style.left = '0px';
        messages.style.right = '0px';
        messages.style.bottom = '0px';
        messages.style.textAlign = 'center';
        messages.style.zIndex = '-1';
        document.body.appendChild(messages);
        var canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'absolute';
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        canvas.style.zIndex = '-1';
        document.body.appendChild(canvas);
        var ctx = (canvas.getContext('2d'));
        window.addEventListener('resize', function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.width = canvas.width + 'px';
            canvas.style.height = canvas.height + 'px';
        });
        var render_ctx2d = new render_ctx2d_ts_1.RenderCtx2D(ctx);
        var canvas_gl = document.createElement('canvas');
        canvas_gl.width = window.innerWidth;
        canvas_gl.height = window.innerHeight;
        canvas_gl.style.position = 'absolute';
        canvas_gl.style.width = canvas_gl.width + 'px';
        canvas_gl.style.height = canvas_gl.height + 'px';
        canvas_gl.style.zIndex = '-2';
        document.body.appendChild(canvas_gl);
        var gl = (canvas_gl.getContext('webgl') || canvas_gl.getContext('experimental-webgl'));
        window.addEventListener('resize', function () {
            canvas_gl.width = window.innerWidth;
            canvas_gl.height = window.innerHeight;
            canvas_gl.style.width = canvas_gl.width + 'px';
            canvas_gl.style.height = canvas_gl.height + 'px';
        });
        var render_webgl = new render_webgl_ts_1.RenderWebGL(gl);
        var camera_x = 0;
        var camera_y = 0;
        var camera_zoom = 1;
        var enable_render_webgl = !!gl;
        var enable_render_ctx2d = !!ctx && !enable_render_webgl;
        add_checkbox_control("GL", enable_render_webgl, function (checked) { enable_render_webgl = checked; });
        add_checkbox_control("2D", enable_render_ctx2d, function (checked) { enable_render_ctx2d = checked; });
        var enable_render_debug_pose = false;
        add_checkbox_control("2D Debug Pose", enable_render_debug_pose, function (checked) { enable_render_debug_pose = checked; });
        var player_web = {};
        player_web.ctx = AudioContext && new AudioContext();
        player_web.mute = true;
        player_web.sounds = {};
        add_checkbox_control("Mute", player_web.mute, function (checked) { player_web.mute = checked; });
        var spriter_data = null;
        var spriter_pose = null;
        var spriter_pose_next = null;
        var atlas_data = null;
        var anim_time = 0;
        var anim_length = 0;
        var anim_length_next = 0;
        var anim_rate = 1;
        var anim_repeat = 2;
        var anim_blend = 0.0;
        add_range_control("Anim Rate", anim_rate, -2.0, 2.0, 0.1, function (value) { anim_rate = value; });
        add_range_control("Anim Blend", anim_blend, 0.0, 1.0, 0.01, function (value) { anim_blend = value; });
        var alpha = 1.0;
        add_range_control("Alpha", alpha, 0.0, 1.0, 0.01, function (value) { alpha = value; });
        var loadFile = function (file, callback) {
            render_ctx2d.dropData(spriter_data, atlas_data);
            render_webgl.dropData(spriter_data, atlas_data);
            spriter_pose = null;
            spriter_pose_next = null;
            atlas_data = null;
            var file_path = file.path;
            var file_spriter_url = file_path + file.spriter_url;
            var file_atlas_url = file.atlas_url ? file_path + file.atlas_url : "";
            loadText(file_spriter_url, function (err, text) {
                if (err) {
                    callback();
                    return;
                }
                var match = file.spriter_url.match(/\.scml$/i);
                if (match) {
                    var parser = new DOMParser();
                    var xml_text = text.replace(/&quot;/g, "\"");
                    var xml = parser.parseFromString(xml_text, 'text/xml');
                    var json_text = xml2json_ts_1.xml2json(xml, '\t');
                    json_text = json_text.replace(/"@(.*)":/g, "\"$1\":");
                    var json = JSON.parse(json_text);
                    var spriter_json = json.spriter_data;
                    spriter_data = new spriter.Data().load(spriter_json);
                }
                else {
                    spriter_data = new spriter.Data().load(JSON.parse(text));
                }
                spriter_pose = new spriter.Pose(spriter_data);
                spriter_pose_next = new spriter.Pose(spriter_data);
                loadText(file_atlas_url, function (err, atlas_text) {
                    var images = {};
                    var counter = 0;
                    var counter_inc = function () { counter++; };
                    var counter_dec = function () {
                        if (--counter === 0) {
                            render_ctx2d.loadData(spriter_data, atlas_data, images);
                            render_webgl.loadData(spriter_data, atlas_data, images);
                            callback();
                        }
                    };
                    counter_inc();
                    if (!err && atlas_text) {
                        atlas_data = new atlas.Data().importTpsText(atlas_text);
                        var dir_path = file_atlas_url.slice(0, file_atlas_url.lastIndexOf('/'));
                        atlas_data.pages.forEach(function (page) {
                            var image_key = page.name;
                            var image_url = dir_path + "/" + image_key;
                            counter_inc();
                            var image = images[image_key] = loadImage(image_url, (function (page) {
                                return function (err, image) {
                                    if (err) {
                                        console.log("error loading:", image && image.src || page.name);
                                    }
                                    page.w = page.w || image.width;
                                    page.h = page.h || image.height;
                                    counter_dec();
                                };
                            })(page));
                        });
                    }
                    else {
                        spriter_data.folder_array.forEach(function (folder) {
                            folder.file_array.forEach(function (file) {
                                switch (file.type) {
                                    case 'image':
                                        var image_key = file.name;
                                        counter_inc();
                                        var image = images[image_key] = loadImage(file_path + file.name, (function (file) {
                                            return function (err, image) {
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
                    spriter_data.folder_array.forEach(function (folder) {
                        folder.file_array.forEach(function (file) {
                            switch (file.type) {
                                case 'sound':
                                    if (player_web.ctx) {
                                        counter_inc();
                                        loadSound(file_path + file.name, (function (file) {
                                            return function (err, buffer) {
                                                if (err) {
                                                    console.log("error loading sound", file.name);
                                                }
                                                player_web.ctx.decodeAudioData(buffer, function (buffer) {
                                                    player_web.sounds[file.name] = buffer;
                                                }, function (err) {
                                                    console.log("error decoding sound", file.name);
                                                });
                                                counter_dec();
                                            };
                                        })(file));
                                    }
                                    else {
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
        var files = [];
        var add_file = function (path, spriter_url, atlas_url) {
            if (atlas_url === void 0) { atlas_url = ""; }
            var file = {};
            file.path = path;
            file.spriter_url = spriter_url;
            file.atlas_url = atlas_url;
            files.push(file);
        };
        add_file("GreyGuy/", "player.scon", "player.tps.json");
        add_file("GreyGuyPlus/", "player_006.scon", "player_006.tps.json");
        var file_index = 0;
        var entity_index = 0;
        var anim_index = 0;
        var loading = false;
        var file = files[file_index];
        messages.innerHTML = "loading";
        loading = true;
        loadFile(file, function () {
            loading = false;
            var entity_keys = spriter_data.getEntityKeys();
            var entity_key = entity_keys[entity_index = 0];
            spriter_pose.setEntity(entity_key);
            spriter_pose_next.setEntity(entity_key);
            var anim_keys = spriter_data.getAnimKeys(entity_key);
            var anim_key = anim_keys[anim_index = 0];
            spriter_pose.setAnim(anim_key);
            var anim_key_next = anim_keys[(anim_index + 1) % anim_keys.length];
            spriter_pose_next.setAnim(anim_key_next);
            spriter_pose.setTime(anim_time = 0);
            spriter_pose_next.setTime(anim_time);
            anim_length = spriter_pose.curAnimLength() || 1000;
            anim_length_next = spriter_pose_next.curAnimLength() || 1000;
        });
        var prev_time = 0;
        var loop = function (time) {
            requestAnimationFrame(loop);
            var entity_keys;
            var entity_key;
            var anim_keys;
            var anim_key;
            var anim_key_next;
            var dt = time - (prev_time || time);
            prev_time = time;
            if (!loading) {
                spriter_pose.update(dt * anim_rate);
                var anim_rate_next = anim_rate * anim_length_next / anim_length;
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
                                loading = true;
                                loadFile(file, function () {
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
                var var_map_keys = Object.keys(spriter_pose.var_map);
                if (var_map_keys.length > 0) {
                    messages.innerHTML += "<br>vars: ";
                    var_map_keys.forEach(function (key) {
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
            if (loading) {
                return;
            }
            spriter_pose.strike();
            spriter_pose_next.strike();
            spriter_pose.sound_array.forEach(function (sound) {
                if (!player_web.mute) {
                    if (player_web.ctx) {
                        var source = player_web.ctx.createBufferSource();
                        source.buffer = player_web.sounds[sound.name];
                        var gain = player_web.ctx.createGain();
                        gain.gain = sound.volume;
                        var stereo_panner = player_web.ctx.createStereoPanner();
                        stereo_panner.pan.value = sound.panning;
                        source.connect(gain);
                        gain.connect(stereo_panner);
                        stereo_panner.connect(player_web.ctx.destination);
                        source.start(0);
                    }
                    else {
                        console.log("TODO: play sound", sound.name, sound.volume, sound.panning);
                    }
                }
            });
            var spin = 1;
            spriter_pose.bone_array.forEach(function (bone, bone_index) {
                var bone_next = spriter_pose_next.bone_array[bone_index];
                if (!bone_next) {
                    return;
                }
                spriter.Space.tween(bone.local_space, bone_next.local_space, anim_blend, spin, bone.local_space);
            });
            spriter_pose.object_array.forEach(function (object, object_index) {
                var object_next = spriter_pose_next.object_array[object_index];
                if (!object_next) {
                    return;
                }
                switch (object.type) {
                    case 'sprite':
                        var sprite_object = object;
                        var sprite_object_next = object_next;
                        spriter.Space.tween(sprite_object.local_space, sprite_object_next.local_space, anim_blend, spin, sprite_object.local_space);
                        if (anim_blend >= 0.5) {
                            sprite_object.folder_index = sprite_object_next.folder_index;
                            sprite_object.file_index = sprite_object_next.file_index;
                            sprite_object.pivot.copy(sprite_object_next.pivot);
                        }
                        sprite_object.alpha = spriter.tween(sprite_object.alpha, sprite_object_next.alpha, anim_blend);
                        break;
                    case 'bone':
                        var bone_object = object;
                        var bone_object_next = object_next;
                        spriter.Space.tween(bone_object.local_space, bone_object_next.local_space, anim_blend, spin, bone_object.local_space);
                        break;
                    case 'box':
                        var box_object = object;
                        var box_object_next = object_next;
                        spriter.Space.tween(box_object.local_space, box_object_next.local_space, anim_blend, spin, box_object.local_space);
                        if (anim_blend >= 0.5) {
                            box_object.pivot.copy(box_object_next.pivot);
                        }
                        break;
                    case 'point':
                        var point_object = object;
                        var point_object_next = object_next;
                        spriter.Space.tween(point_object.local_space, point_object_next.local_space, anim_blend, spin, point_object.local_space);
                        break;
                    case 'sound':
                        var sound_object = object;
                        var sound_object_next = object_next;
                        if (anim_blend >= 0.5) {
                            sound_object.name = sound_object_next.name;
                        }
                        sound_object.volume = spriter.tween(sound_object.volume, sound_object_next.volume, anim_blend);
                        sound_object.panning = spriter.tween(sound_object.panning, sound_object_next.panning, anim_blend);
                        break;
                    case 'entity':
                        var entity_object = object;
                        var entity_object_next = object_next;
                        spriter.Space.tween(entity_object.local_space, entity_object_next.local_space, anim_blend, spin, entity_object.local_space);
                        break;
                    case 'variable':
                        break;
                    default:
                        throw new Error(object.type);
                }
            });
            spriter_pose.bone_array.forEach(function (bone, bone_index) {
                var parent_bone = spriter_pose.bone_array[bone.parent_index];
                if (parent_bone) {
                    spriter.Space.combine(parent_bone.world_space, bone.local_space, bone.world_space);
                }
                else {
                    bone.world_space.copy(bone.local_space);
                }
            });
            spriter_pose.object_array.forEach(function (object) {
                switch (object.type) {
                    case 'sprite': {
                        var sprite_object = object;
                        var bone = spriter_pose.bone_array[sprite_object.parent_index];
                        if (bone) {
                            spriter.Space.combine(bone.world_space, sprite_object.local_space, sprite_object.world_space);
                        }
                        else {
                            sprite_object.world_space.copy(sprite_object.local_space);
                        }
                        var folder = spriter_data.folder_array[sprite_object.folder_index];
                        var image_file = (folder && folder.file_array[sprite_object.file_index]);
                        if (image_file) {
                            var offset_x = (0.5 - sprite_object.pivot.x) * image_file.width;
                            var offset_y = (0.5 - sprite_object.pivot.y) * image_file.height;
                            spriter.Space.translate(sprite_object.world_space, offset_x, offset_y);
                        }
                        break;
                    }
                    case 'bone': {
                        var bone_object = object;
                        var bone = spriter_pose.bone_array[bone_object.parent_index];
                        if (bone) {
                            spriter.Space.combine(bone.world_space, bone_object.local_space, bone_object.world_space);
                        }
                        else {
                            bone_object.world_space.copy(bone_object.local_space);
                        }
                        break;
                    }
                    case 'box': {
                        var box_object = object;
                        var bone = spriter_pose.bone_array[box_object.parent_index];
                        if (bone) {
                            spriter.Space.combine(bone.world_space, box_object.local_space, box_object.world_space);
                        }
                        else {
                            box_object.world_space.copy(box_object.local_space);
                        }
                        var entity = spriter_pose.curEntity();
                        var box_info = (entity.obj_info_map[box_object.name]);
                        if (box_info) {
                            var offset_x = (0.5 - box_object.pivot.x) * box_info.w;
                            var offset_y = (0.5 - box_object.pivot.y) * box_info.h;
                            spriter.Space.translate(box_object.world_space, offset_x, offset_y);
                        }
                        break;
                    }
                    case 'point': {
                        var point_object = object;
                        var bone = spriter_pose.bone_array[point_object.parent_index];
                        if (bone) {
                            spriter.Space.combine(bone.world_space, point_object.local_space, point_object.world_space);
                        }
                        else {
                            point_object.world_space.copy(point_object.local_space);
                        }
                        break;
                    }
                    case 'sound':
                        break;
                    case 'entity': {
                        var entity_object = object;
                        var bone = spriter_pose.bone_array[entity_object.parent_index];
                        if (bone) {
                            spriter.Space.combine(bone.world_space, entity_object.local_space, entity_object.world_space);
                        }
                        else {
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
                ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
                ctx.scale(1, -1);
                if (enable_render_ctx2d && enable_render_webgl) {
                    ctx.translate(-ctx.canvas.width / 4, 0);
                }
                ctx.translate(-camera_x, -camera_y);
                ctx.scale(camera_zoom, camera_zoom);
                ctx.lineWidth = 1 / camera_zoom;
                if (enable_render_ctx2d) {
                    render_ctx2d.drawPose(spriter_pose, atlas_data);
                }
                if (enable_render_debug_pose) {
                    render_ctx2d.drawDebugPose(spriter_pose, atlas_data);
                }
            }
            if (gl) {
                var gl_color = render_webgl.gl_color;
                gl_color[3] = alpha;
                var gl_projection = render_webgl.gl_projection;
                render_webgl_ts_2.mat4x4Identity(gl_projection);
                render_webgl_ts_2.mat4x4Ortho(gl_projection, -gl.canvas.width / 2, gl.canvas.width / 2, -gl.canvas.height / 2, gl.canvas.height / 2, -1, 1);
                if (enable_render_ctx2d && enable_render_webgl) {
                    render_webgl_ts_2.mat4x4Translate(gl_projection, gl.canvas.width / 4, 0, 0);
                }
                render_webgl_ts_2.mat4x4Translate(gl_projection, -camera_x, -camera_y, 0);
                render_webgl_ts_2.mat4x4Scale(gl_projection, camera_zoom, camera_zoom, camera_zoom);
                if (enable_render_webgl) {
                    render_webgl.drawPose(spriter_pose, atlas_data);
                }
            }
        };
        requestAnimationFrame(loop);
    }
    exports_1("start", start);
    function loadText(url, callback) {
        var req = new XMLHttpRequest();
        if (url) {
            req.open("GET", url, true);
            req.responseType = 'text';
            req.addEventListener('error', function () { callback("error", null); });
            req.addEventListener('abort', function () { callback("abort", null); });
            req.addEventListener('load', function () {
                if (req.status === 200) {
                    callback(null, req.response);
                }
                else {
                    callback(req.response, null);
                }
            });
            req.send();
        }
        else {
            callback("error", null);
        }
        return req;
    }
    function loadImage(url, callback) {
        var image = new Image();
        image.crossOrigin = "Anonymous";
        image.addEventListener('error', function () { callback("error", null); });
        image.addEventListener('abort', function () { callback("abort", null); });
        image.addEventListener('load', function () { callback(null, image); });
        image.src = url;
        return image;
    }
    function loadSound(url, callback) {
        var req = new XMLHttpRequest();
        if (url) {
            req.open("GET", url, true);
            req.responseType = 'arraybuffer';
            req.addEventListener('error', function (event) { callback("error", null); });
            req.addEventListener('abort', function (event) { callback("abort", null); });
            req.addEventListener('load', function (event) {
                if (req.status === 200) {
                    callback(null, req.response);
                }
                else {
                    callback(req.response, null);
                }
            });
            req.send();
        }
        else {
            callback("error", null);
        }
        return req;
    }
    return {
        setters:[
            function (spriter_1) {
                spriter = spriter_1;
            },
            function (atlas_1) {
                atlas = atlas_1;
            },
            function (render_ctx2d_ts_1_1) {
                render_ctx2d_ts_1 = render_ctx2d_ts_1_1;
            },
            function (render_webgl_ts_1_1) {
                render_webgl_ts_1 = render_webgl_ts_1_1;
                render_webgl_ts_2 = render_webgl_ts_1_1;
            },
            function (xml2json_ts_1_1) {
                xml2json_ts_1 = xml2json_ts_1_1;
            }],
        execute: function() {
        }
    }
});
