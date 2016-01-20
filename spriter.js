System.register([], function(exports_1) {
    "use strict";
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var Angle, Vector, Position, Rotation, Scale, Pivot, Space, Element, File, ImageFile, SoundFile, Folder, BaseObject, SpriteObject, Bone, BoxObject, PointObject, SoundObject, EntityObject, VariableObject, Ref, BoneRef, ObjectRef, Keyframe, Curve, MainlineKeyframe, Mainline, TimelineKeyframe, SpriteTimelineKeyframe, BoneTimelineKeyframe, BoxTimelineKeyframe, PointTimelineKeyframe, SoundTimelineKeyframe, EntityTimelineKeyframe, VariableTimelineKeyframe, TagDef, Tag, TaglineKeyframe, Tagline, VarlineKeyframe, Varline, Meta, Timeline, SoundlineKeyframe, Soundline, EventlineKeyframe, Eventline, MapInstruction, CharacterMap, VarDef, VarDefs, ObjInfo, SpriteFrame, SpriteObjInfo, BoneObjInfo, BoxObjInfo, Animation, Entity, Data, Pose;
    function loadBool(json, key, def) {
        var value = json[key];
        switch (typeof (value)) {
            case "string": return (value === "true") ? true : false;
            case "boolean": return value;
            default: return def || false;
        }
    }
    exports_1("loadBool", loadBool);
    function saveBool(json, key, value, def) {
        if ((typeof (def) !== "boolean") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveBool", saveBool);
    function loadFloat(json, key, def) {
        var value = json[key];
        switch (typeof (value)) {
            case "string": return parseFloat(value);
            case "number": return value;
            default: return def || 0;
        }
    }
    exports_1("loadFloat", loadFloat);
    function saveFloat(json, key, value, def) {
        if ((typeof (def) !== "number") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveFloat", saveFloat);
    function loadInt(json, key, def) {
        var value = json[key];
        switch (typeof (value)) {
            case "string": return parseInt(value, 10);
            case "number": return 0 | value;
            default: return def || 0;
        }
    }
    exports_1("loadInt", loadInt);
    function saveInt(json, key, value, def) {
        if ((typeof (def) !== "number") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveInt", saveInt);
    function loadString(json, key, def) {
        var value = json[key];
        switch (typeof (value)) {
            case "string": return value;
            default: return def || "";
        }
    }
    exports_1("loadString", loadString);
    function saveString(json, key, value, def) {
        if ((typeof (def) !== "string") || (value !== def)) {
            json[key] = value;
        }
    }
    exports_1("saveString", saveString);
    function makeArray(value) {
        if ((typeof (value) === 'object') && (typeof (value.length) === 'number')) {
            return value;
        }
        if (typeof (value) !== 'undefined') {
            return [value];
        }
        return [];
    }
    function wrap(num, min, max) {
        if (min < max) {
            if (num < min) {
                return max - ((min - num) % (max - min));
            }
            else {
                return min + ((num - min) % (max - min));
            }
        }
        else if (min === max) {
            return min;
        }
        else {
            return num;
        }
    }
    exports_1("wrap", wrap);
    function interpolateLinear(a, b, t) {
        return a + ((b - a) * t);
    }
    function interpolateQuadratic(a, b, c, t) {
        return interpolateLinear(interpolateLinear(a, b, t), interpolateLinear(b, c, t), t);
    }
    function interpolateCubic(a, b, c, d, t) {
        return interpolateLinear(interpolateQuadratic(a, b, c, t), interpolateQuadratic(b, c, d, t), t);
    }
    function interpolateQuartic(a, b, c, d, e, t) {
        return interpolateLinear(interpolateCubic(a, b, c, d, t), interpolateCubic(b, c, d, e, t), t);
    }
    function interpolateQuintic(a, b, c, d, e, f, t) {
        return interpolateLinear(interpolateQuartic(a, b, c, d, e, t), interpolateQuartic(b, c, d, e, f, t), t);
    }
    function interpolateBezier(x1, y1, x2, y2, t) {
        function SampleCurve(a, b, c, t) {
            return ((a * t + b) * t + c) * t;
        }
        function SampleCurveDerivativeX(ax, bx, cx, t) {
            return (3.0 * ax * t + 2.0 * bx) * t + cx;
        }
        function SolveEpsilon(duration) {
            return 1.0 / (200.0 * duration);
        }
        function Solve(ax, bx, cx, ay, by, cy, x, epsilon) {
            return SampleCurve(ay, by, cy, SolveCurveX(ax, bx, cx, x, epsilon));
        }
        function SolveCurveX(ax, bx, cx, x, epsilon) {
            var t0;
            var t1;
            var t2;
            var x2;
            var d2;
            var i;
            for (t2 = x, i = 0; i < 8; i++) {
                x2 = SampleCurve(ax, bx, cx, t2) - x;
                if (Math.abs(x2) < epsilon)
                    return t2;
                d2 = SampleCurveDerivativeX(ax, bx, cx, t2);
                if (Math.abs(d2) < epsilon)
                    break;
                t2 = t2 - x2 / d2;
            }
            t0 = 0.0;
            t1 = 1.0;
            t2 = x;
            if (t2 < t0)
                return t0;
            if (t2 > t1)
                return t1;
            while (t0 < t1) {
                x2 = SampleCurve(ax, bx, cx, t2);
                if (Math.abs(x2 - x) < epsilon)
                    return t2;
                if (x > x2)
                    t0 = t2;
                else
                    t1 = t2;
                t2 = (t1 - t0) * 0.5 + t0;
            }
            return t2;
        }
        var duration = 1;
        var cx = 3.0 * x1;
        var bx = 3.0 * (x2 - x1) - cx;
        var ax = 1.0 - cx - bx;
        var cy = 3.0 * y1;
        var by = 3.0 * (y2 - y1) - cy;
        var ay = 1.0 - cy - by;
        return Solve(ax, bx, cx, ay, by, cy, t, SolveEpsilon(duration));
    }
    function tween(a, b, t) {
        return a + ((b - a) * t);
    }
    exports_1("tween", tween);
    function wrapAngleRadians(angle) {
        if (angle <= 0.0) {
            return ((angle - Math.PI) % (2.0 * Math.PI)) + Math.PI;
        }
        else {
            return ((angle + Math.PI) % (2.0 * Math.PI)) - Math.PI;
        }
    }
    exports_1("wrapAngleRadians", wrapAngleRadians);
    function tweenAngleRadians(a, b, t, spin) {
        if (spin === 0) {
            return a;
        }
        else if (spin > 0) {
            if ((b - a) < 0.0) {
                b += 2.0 * Math.PI;
            }
        }
        else if (spin < 0) {
            if ((b - a) > 0.0) {
                b -= 2.0 * Math.PI;
            }
        }
        return wrapAngleRadians(a + (wrapAngleRadians(b - a) * t));
    }
    exports_1("tweenAngleRadians", tweenAngleRadians);
    return {
        setters:[],
        execute: function() {
            Angle = (function () {
                function Angle(rad) {
                    if (rad === void 0) { rad = 0; }
                    this.rad = 0;
                    this.rad = rad;
                }
                Object.defineProperty(Angle.prototype, "deg", {
                    get: function () { return this.rad * 180 / Math.PI; },
                    set: function (value) { this.rad = value * Math.PI / 180; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Angle.prototype, "cos", {
                    get: function () { return Math.cos(this.rad); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Angle.prototype, "sin", {
                    get: function () { return Math.sin(this.rad); },
                    enumerable: true,
                    configurable: true
                });
                Angle.prototype.selfIdentity = function () { this.rad = 0; return this; };
                Angle.prototype.copy = function (other) { this.rad = other.rad; return this; };
                Angle.add = function (a, b, out) {
                    if (out === void 0) { out = new Angle(); }
                    out.rad = wrapAngleRadians(a.rad + b.rad);
                    return out;
                };
                Angle.prototype.add = function (other, out) {
                    if (out === void 0) { out = new Angle(); }
                    return Angle.add(this, other, out);
                };
                Angle.prototype.selfAdd = function (other) { return Angle.add(this, other, this); };
                Angle.tween = function (a, b, pct, spin, out) {
                    if (out === void 0) { out = new Angle(); }
                    out.rad = tweenAngleRadians(a.rad, b.rad, pct, spin);
                    return out;
                };
                Angle.prototype.tween = function (other, pct, spin, out) {
                    if (out === void 0) { out = new Angle(); }
                    return Angle.tween(this, other, pct, spin, out);
                };
                Angle.prototype.selfTween = function (other, pct, spin) {
                    return Angle.tween(this, other, pct, spin, this);
                };
                return Angle;
            }());
            exports_1("Angle", Angle);
            Vector = (function () {
                function Vector(x, y) {
                    if (x === void 0) { x = 0.0; }
                    if (y === void 0) { y = 0.0; }
                    this.x = 0.0;
                    this.y = 0.0;
                    this.x = x;
                    this.y = y;
                }
                Vector.prototype.copy = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    return this;
                };
                Vector.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = 1e-6; }
                    if (Math.abs(a.x - b.x) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.y - b.y) > epsilon) {
                        return false;
                    }
                    return true;
                };
                Vector.add = function (a, b, out) {
                    if (out === void 0) { out = new Vector(); }
                    out.x = a.x + b.x;
                    out.y = a.y + b.y;
                    return out;
                };
                Vector.prototype.add = function (other, out) {
                    if (out === void 0) { out = new Vector(); }
                    return Vector.add(this, other, out);
                };
                Vector.prototype.selfAdd = function (other) {
                    this.x += other.x;
                    this.y += other.y;
                    return this;
                };
                Vector.tween = function (a, b, pct, out) {
                    if (out === void 0) { out = new Vector(); }
                    out.x = tween(a.x, b.x, pct);
                    out.y = tween(a.y, b.y, pct);
                    return out;
                };
                Vector.prototype.tween = function (other, pct, out) {
                    if (out === void 0) { out = new Vector(); }
                    return Vector.tween(this, other, pct, out);
                };
                Vector.prototype.selfTween = function (other, pct) {
                    return Vector.tween(this, other, pct, this);
                };
                return Vector;
            }());
            exports_1("Vector", Vector);
            Position = (function (_super) {
                __extends(Position, _super);
                function Position() {
                    _super.call(this, 0.0, 0.0);
                }
                return Position;
            }(Vector));
            exports_1("Position", Position);
            Rotation = (function (_super) {
                __extends(Rotation, _super);
                function Rotation() {
                    _super.call(this, 0.0);
                }
                return Rotation;
            }(Angle));
            exports_1("Rotation", Rotation);
            Scale = (function (_super) {
                __extends(Scale, _super);
                function Scale() {
                    _super.call(this, 1.0, 1.0);
                }
                Scale.prototype.selfIdentity = function () {
                    this.x = 1.0;
                    this.y = 1.0;
                    return this;
                };
                return Scale;
            }(Vector));
            exports_1("Scale", Scale);
            Pivot = (function (_super) {
                __extends(Pivot, _super);
                function Pivot() {
                    _super.call(this, 0.0, 1.0);
                }
                Pivot.prototype.selfIdentity = function () {
                    this.x = 0.0;
                    this.y = 1.0;
                    return this;
                };
                return Pivot;
            }(Vector));
            exports_1("Pivot", Pivot);
            Space = (function () {
                function Space() {
                    this.position = new Position();
                    this.rotation = new Rotation();
                    this.scale = new Scale();
                }
                Space.prototype.copy = function (other) {
                    var space = this;
                    space.position.copy(other.position);
                    space.rotation.copy(other.rotation);
                    space.scale.copy(other.scale);
                    return space;
                };
                Space.prototype.load = function (json) {
                    var space = this;
                    space.position.x = loadFloat(json, 'x', 0.0);
                    space.position.y = loadFloat(json, 'y', 0.0);
                    space.rotation.deg = loadFloat(json, 'angle', 0.0);
                    space.scale.x = loadFloat(json, 'scale_x', 1.0);
                    space.scale.y = loadFloat(json, 'scale_y', 1.0);
                    return space;
                };
                Space.equal = function (a, b, epsilon) {
                    if (epsilon === void 0) { epsilon = 1e-6; }
                    if (Math.abs(a.position.x - b.position.x) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.position.y - b.position.y) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.rotation.rad - b.rotation.rad) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.scale.x - b.scale.x) > epsilon) {
                        return false;
                    }
                    if (Math.abs(a.scale.y - b.scale.y) > epsilon) {
                        return false;
                    }
                    return true;
                };
                Space.identity = function (out) {
                    if (out === void 0) { out = new Space(); }
                    out.position.x = 0.0;
                    out.position.y = 0.0;
                    out.rotation.rad = 0.0;
                    out.scale.x = 1.0;
                    out.scale.y = 1.0;
                    return out;
                };
                Space.translate = function (space, x, y) {
                    x *= space.scale.x;
                    y *= space.scale.y;
                    var rad = space.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    space.position.x += tx;
                    space.position.y += ty;
                    return space;
                };
                Space.rotate = function (space, rad) {
                    space.rotation.rad = wrapAngleRadians(space.rotation.rad + rad);
                    return space;
                };
                Space.scale = function (space, x, y) {
                    space.scale.x *= x;
                    space.scale.y *= y;
                    return space;
                };
                Space.invert = function (space, out) {
                    out = out || new Space();
                    var inv_scale_x = 1.0 / space.scale.x;
                    var inv_scale_y = 1.0 / space.scale.y;
                    var inv_rotation = -space.rotation.rad;
                    var inv_x = -space.position.x;
                    var inv_y = -space.position.y;
                    out.scale.x = inv_scale_x;
                    out.scale.y = inv_scale_y;
                    out.rotation.rad = inv_rotation;
                    var x = inv_x;
                    var y = inv_y;
                    var rad = inv_rotation;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.position.x = tx * inv_scale_x;
                    out.position.y = ty * inv_scale_y;
                    return out;
                };
                Space.combine = function (a, b, out) {
                    out = out || new Space();
                    var x = b.position.x * a.scale.x;
                    var y = b.position.y * a.scale.y;
                    var rad = a.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.position.x = tx + a.position.x;
                    out.position.y = ty + a.position.y;
                    if ((a.scale.x * a.scale.y) < 0.0) {
                        out.rotation.rad = wrapAngleRadians(a.rotation.rad - b.rotation.rad);
                    }
                    else {
                        out.rotation.rad = wrapAngleRadians(b.rotation.rad + a.rotation.rad);
                    }
                    out.scale.x = b.scale.x * a.scale.x;
                    out.scale.y = b.scale.y * a.scale.y;
                    return out;
                };
                Space.extract = function (ab, a, out) {
                    out = out || new Space();
                    out.scale.x = ab.scale.x / a.scale.x;
                    out.scale.y = ab.scale.y / a.scale.y;
                    if ((a.scale.x * a.scale.y) < 0.0) {
                        out.rotation.rad = wrapAngleRadians(a.rotation.rad + ab.rotation.rad);
                    }
                    else {
                        out.rotation.rad = wrapAngleRadians(ab.rotation.rad - a.rotation.rad);
                    }
                    var x = ab.position.x - a.position.x;
                    var y = ab.position.y - a.position.y;
                    var rad = -a.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.position.x = tx / a.scale.x;
                    out.position.y = ty / a.scale.y;
                    return out;
                };
                Space.transform = function (space, v, out) {
                    out = out || new Vector();
                    var x = v.x * space.scale.x;
                    var y = v.y * space.scale.y;
                    var rad = space.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.x = tx + space.position.x;
                    out.y = ty + space.position.y;
                    return out;
                };
                Space.untransform = function (space, v, out) {
                    out = out || new Vector();
                    var x = v.x - space.position.x;
                    var y = v.y - space.position.y;
                    var rad = -space.rotation.rad;
                    var c = Math.cos(rad);
                    var s = Math.sin(rad);
                    var tx = c * x - s * y;
                    var ty = s * x + c * y;
                    out.x = tx / space.scale.x;
                    out.y = ty / space.scale.y;
                    return out;
                };
                Space.tween = function (a, b, pct, spin, out) {
                    out.position.x = tween(a.position.x, b.position.x, pct);
                    out.position.y = tween(a.position.y, b.position.y, pct);
                    out.rotation.rad = tweenAngleRadians(a.rotation.rad, b.rotation.rad, pct, spin);
                    out.scale.x = tween(a.scale.x, b.scale.x, pct);
                    out.scale.y = tween(a.scale.y, b.scale.y, pct);
                    return out;
                };
                return Space;
            }());
            exports_1("Space", Space);
            Element = (function () {
                function Element() {
                    this.id = -1;
                    this.name = "";
                }
                Element.prototype.load = function (json) {
                    this.id = loadInt(json, 'id', -1);
                    this.name = loadString(json, 'name', "");
                    return this;
                };
                return Element;
            }());
            exports_1("Element", Element);
            File = (function (_super) {
                __extends(File, _super);
                function File(type) {
                    _super.call(this);
                    this.type = "unknown";
                    this.type = type;
                }
                File.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var type = loadString(json, 'type', "image");
                    if (this.type !== type)
                        throw new Error();
                    return this;
                };
                return File;
            }(Element));
            exports_1("File", File);
            ImageFile = (function (_super) {
                __extends(ImageFile, _super);
                function ImageFile() {
                    _super.call(this, 'image');
                    this.width = 0;
                    this.height = 0;
                    this.pivot = new Pivot();
                }
                ImageFile.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.width = loadInt(json, 'width', 0);
                    this.height = loadInt(json, 'height', 0);
                    this.pivot.x = loadFloat(json, 'pivot_x', 0.0);
                    this.pivot.y = loadFloat(json, 'pivot_y', 1.0);
                    return this;
                };
                return ImageFile;
            }(File));
            exports_1("ImageFile", ImageFile);
            SoundFile = (function (_super) {
                __extends(SoundFile, _super);
                function SoundFile() {
                    _super.call(this, 'sound');
                }
                SoundFile.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    return this;
                };
                return SoundFile;
            }(File));
            exports_1("SoundFile", SoundFile);
            Folder = (function (_super) {
                __extends(Folder, _super);
                function Folder() {
                    _super.apply(this, arguments);
                    this.file_array = [];
                }
                Folder.prototype.load = function (json) {
                    var _this = this;
                    _super.prototype.load.call(this, json);
                    this.file_array = [];
                    json.file = makeArray(json.file);
                    json.file.forEach(function (file_json) {
                        switch (file_json.type) {
                            case 'image':
                            default:
                                _this.file_array.push(new ImageFile().load(file_json));
                                break;
                            case 'sound':
                                _this.file_array.push(new SoundFile().load(file_json));
                                break;
                        }
                    });
                    return this;
                };
                return Folder;
            }(Element));
            exports_1("Folder", Folder);
            BaseObject = (function () {
                function BaseObject(type) {
                    this.type = "unknown";
                    this.name = "";
                    this.type = type;
                }
                BaseObject.prototype.load = function (json) {
                    var type = loadString(json, 'type', "sprite");
                    if (this.type !== type)
                        throw new Error();
                    return this;
                };
                return BaseObject;
            }());
            exports_1("BaseObject", BaseObject);
            SpriteObject = (function (_super) {
                __extends(SpriteObject, _super);
                function SpriteObject() {
                    _super.call(this, 'sprite');
                    this.parent_index = -1;
                    this.folder_index = -1;
                    this.file_index = -1;
                    this.local_space = new Space();
                    this.world_space = new Space();
                    this.default_pivot = false;
                    this.pivot = new Pivot();
                    this.z_index = 0;
                    this.alpha = 1.0;
                }
                SpriteObject.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.parent_index = loadInt(json, 'parent', -1);
                    this.folder_index = loadInt(json, 'folder', -1);
                    this.file_index = loadInt(json, 'file', -1);
                    this.local_space.load(json);
                    this.world_space.copy(this.local_space);
                    if ((typeof (json['pivot_x']) !== 'undefined') || (typeof (json['pivot_y']) !== 'undefined')) {
                        this.pivot.x = loadFloat(json, 'pivot_x', 0.0);
                        this.pivot.y = loadFloat(json, 'pivot_y', 1.0);
                    }
                    else {
                        this.default_pivot = true;
                    }
                    this.z_index = loadInt(json, 'z_index', 0);
                    this.alpha = loadFloat(json, 'a', 1.0);
                    return this;
                };
                SpriteObject.prototype.copy = function (other) {
                    this.parent_index = other.parent_index;
                    this.folder_index = other.folder_index;
                    this.file_index = other.file_index;
                    this.local_space.copy(other.local_space);
                    this.world_space.copy(other.world_space);
                    this.default_pivot = other.default_pivot;
                    this.pivot.copy(other.pivot);
                    this.z_index = other.z_index;
                    this.alpha = other.alpha;
                    return this;
                };
                SpriteObject.prototype.tween = function (other, pct, spin) {
                    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
                    this.alpha = tween(this.alpha, other.alpha, pct);
                };
                return SpriteObject;
            }(BaseObject));
            exports_1("SpriteObject", SpriteObject);
            Bone = (function (_super) {
                __extends(Bone, _super);
                function Bone() {
                    _super.call(this, 'bone');
                    this.parent_index = -1;
                    this.local_space = new Space();
                    this.world_space = new Space();
                }
                Bone.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.parent_index = loadInt(json, 'parent', -1);
                    this.local_space.load(json);
                    this.world_space.copy(this.local_space);
                    return this;
                };
                Bone.prototype.copy = function (other) {
                    this.parent_index = other.parent_index;
                    this.local_space.copy(other.local_space);
                    this.world_space.copy(other.world_space);
                    return this;
                };
                Bone.prototype.tween = function (other, pct, spin) {
                    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
                };
                return Bone;
            }(BaseObject));
            exports_1("Bone", Bone);
            BoxObject = (function (_super) {
                __extends(BoxObject, _super);
                function BoxObject() {
                    _super.call(this, 'box');
                    this.parent_index = -1;
                    this.local_space = new Space();
                    this.world_space = new Space();
                    this.pivot = new Pivot();
                }
                BoxObject.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.parent_index = loadInt(json, 'parent', -1);
                    this.local_space.load(json);
                    this.world_space.copy(this.local_space);
                    this.pivot.x = loadFloat(json, 'pivot_x', 0.0);
                    this.pivot.y = loadFloat(json, 'pivot_y', 1.0);
                    return this;
                };
                BoxObject.prototype.copy = function (other) {
                    this.parent_index = other.parent_index;
                    this.local_space.copy(other.local_space);
                    this.world_space.copy(other.world_space);
                    this.pivot.copy(other.pivot);
                    return this;
                };
                BoxObject.prototype.tween = function (other, pct, spin) {
                    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
                };
                return BoxObject;
            }(BaseObject));
            exports_1("BoxObject", BoxObject);
            PointObject = (function (_super) {
                __extends(PointObject, _super);
                function PointObject() {
                    _super.call(this, 'point');
                    this.parent_index = -1;
                    this.local_space = new Space();
                    this.world_space = new Space();
                }
                PointObject.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.parent_index = loadInt(json, 'parent', -1);
                    this.local_space.load(json);
                    this.world_space.copy(this.local_space);
                    return this;
                };
                PointObject.prototype.copy = function (other) {
                    this.parent_index = other.parent_index;
                    this.local_space.copy(other.local_space);
                    this.world_space.copy(other.world_space);
                    return this;
                };
                PointObject.prototype.tween = function (other, pct, spin) {
                    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
                };
                return PointObject;
            }(BaseObject));
            exports_1("PointObject", PointObject);
            SoundObject = (function (_super) {
                __extends(SoundObject, _super);
                function SoundObject() {
                    _super.call(this, 'sound');
                    this.folder_index = -1;
                    this.file_index = -1;
                    this.trigger = false;
                    this.volume = 1.0;
                    this.panning = 0.0;
                }
                SoundObject.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.folder_index = loadInt(json, 'folder', -1);
                    this.file_index = loadInt(json, 'file', -1);
                    this.trigger = loadBool(json, 'trigger', false);
                    this.volume = loadFloat(json, 'volume', 1.0);
                    this.panning = loadFloat(json, 'panning', 0.0);
                    return this;
                };
                SoundObject.prototype.copy = function (other) {
                    this.folder_index = other.folder_index;
                    this.file_index = other.file_index;
                    this.trigger = other.trigger;
                    this.volume = other.volume;
                    this.panning = other.panning;
                    return this;
                };
                SoundObject.prototype.tween = function (other, pct, spin) {
                    this.volume = tween(this.volume, other.volume, pct);
                    this.panning = tween(this.panning, other.panning, pct);
                };
                return SoundObject;
            }(BaseObject));
            exports_1("SoundObject", SoundObject);
            EntityObject = (function (_super) {
                __extends(EntityObject, _super);
                function EntityObject() {
                    _super.call(this, 'entity');
                    this.parent_index = -1;
                    this.local_space = new Space();
                    this.world_space = new Space();
                    this.entity_index = -1;
                    this.animation_index = -1;
                    this.animation_time = 0.0;
                }
                EntityObject.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.parent_index = loadInt(json, 'parent', -1);
                    this.local_space.load(json);
                    this.world_space.copy(this.local_space);
                    this.entity_index = loadInt(json, 'entity', -1);
                    this.animation_index = loadInt(json, 'animation', -1);
                    this.animation_time = loadFloat(json, 't', 0.0);
                    return this;
                };
                EntityObject.prototype.copy = function (other) {
                    this.parent_index = other.parent_index;
                    this.local_space.copy(other.local_space);
                    this.world_space.copy(other.world_space);
                    this.entity_index = other.entity_index;
                    this.animation_index = other.animation_index;
                    this.animation_time = other.animation_time;
                    return this;
                };
                EntityObject.prototype.tween = function (other, pct, spin) {
                    Space.tween(this.local_space, other.local_space, pct, spin, this.local_space);
                    this.animation_time = tween(this.animation_time, other.animation_time, pct);
                };
                return EntityObject;
            }(BaseObject));
            exports_1("EntityObject", EntityObject);
            VariableObject = (function (_super) {
                __extends(VariableObject, _super);
                function VariableObject() {
                    _super.call(this, 'variable');
                }
                VariableObject.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    return this;
                };
                VariableObject.prototype.copy = function (other) {
                    return this;
                };
                VariableObject.prototype.tween = function (other, pct, spin) {
                };
                return VariableObject;
            }(BaseObject));
            exports_1("VariableObject", VariableObject);
            Ref = (function (_super) {
                __extends(Ref, _super);
                function Ref() {
                    _super.apply(this, arguments);
                    this.parent_index = -1;
                    this.timeline_index = -1;
                    this.keyframe_index = -1;
                }
                Ref.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.parent_index = loadInt(json, 'parent', -1);
                    this.timeline_index = loadInt(json, 'timeline', -1);
                    this.keyframe_index = loadInt(json, 'key', -1);
                    return this;
                };
                return Ref;
            }(Element));
            exports_1("Ref", Ref);
            BoneRef = (function (_super) {
                __extends(BoneRef, _super);
                function BoneRef() {
                    _super.apply(this, arguments);
                }
                return BoneRef;
            }(Ref));
            exports_1("BoneRef", BoneRef);
            ObjectRef = (function (_super) {
                __extends(ObjectRef, _super);
                function ObjectRef() {
                    _super.apply(this, arguments);
                    this.z_index = 0;
                }
                ObjectRef.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.z_index = loadInt(json, 'z_index', 0);
                    return this;
                };
                return ObjectRef;
            }(Ref));
            exports_1("ObjectRef", ObjectRef);
            Keyframe = (function (_super) {
                __extends(Keyframe, _super);
                function Keyframe() {
                    _super.apply(this, arguments);
                    this.time = 0;
                }
                Keyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.time = loadInt(json, 'time', 0);
                    return this;
                };
                Keyframe.find = function (array, time) {
                    if (array.length <= 0) {
                        return -1;
                    }
                    if (time < array[0].time) {
                        return -1;
                    }
                    var last = array.length - 1;
                    if (time >= array[last].time) {
                        return last;
                    }
                    var lo = 0;
                    var hi = last;
                    if (hi === 0) {
                        return 0;
                    }
                    var current = hi >> 1;
                    while (true) {
                        if (array[current + 1].time <= time) {
                            lo = current + 1;
                        }
                        else {
                            hi = current;
                        }
                        if (lo === hi) {
                            return lo;
                        }
                        current = (lo + hi) >> 1;
                    }
                };
                Keyframe.compare = function (a, b) {
                    return a.time - b.time;
                };
                return Keyframe;
            }(Element));
            exports_1("Keyframe", Keyframe);
            Curve = (function () {
                function Curve() {
                    this.type = "linear";
                    this.c1 = 0.0;
                    this.c2 = 0.0;
                    this.c3 = 0.0;
                    this.c4 = 0.0;
                }
                Curve.prototype.load = function (json) {
                    this.type = loadString(json, 'curve_type', "linear");
                    this.c1 = loadFloat(json, 'c1', 0.0);
                    this.c2 = loadFloat(json, 'c2', 0.0);
                    this.c3 = loadFloat(json, 'c3', 0.0);
                    this.c4 = loadFloat(json, 'c4', 0.0);
                    return this;
                };
                Curve.prototype.evaluate = function (t) {
                    switch (this.type) {
                        case "instant": return 0.0;
                        case "linear": return t;
                        case "quadratic": return interpolateQuadratic(0.0, this.c1, 1.0, t);
                        case "cubic": return interpolateCubic(0.0, this.c1, this.c2, 1.0, t);
                        case "quartic": return interpolateQuartic(0.0, this.c1, this.c2, this.c3, 1.0, t);
                        case "quintic": return interpolateQuintic(0.0, this.c1, this.c2, this.c3, this.c4, 1.0, t);
                        case "bezier": return interpolateBezier(this.c1, this.c2, this.c3, this.c4, t);
                    }
                    return 0.0;
                };
                return Curve;
            }());
            exports_1("Curve", Curve);
            MainlineKeyframe = (function (_super) {
                __extends(MainlineKeyframe, _super);
                function MainlineKeyframe() {
                    _super.apply(this, arguments);
                    this.curve = new Curve();
                }
                MainlineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var mainline_keyframe = this;
                    mainline_keyframe.curve.load(json);
                    mainline_keyframe.bone_ref_array = [];
                    json.bone_ref = makeArray(json.bone_ref);
                    json.bone_ref.forEach(function (bone_ref_json) {
                        mainline_keyframe.bone_ref_array.push(new BoneRef().load(bone_ref_json));
                    });
                    mainline_keyframe.bone_ref_array = mainline_keyframe.bone_ref_array.sort(function (a, b) { return a.id - b.id; });
                    mainline_keyframe.object_ref_array = [];
                    json.object_ref = makeArray(json.object_ref);
                    json.object_ref.forEach(function (object_ref_json) {
                        mainline_keyframe.object_ref_array.push(new ObjectRef().load(object_ref_json));
                    });
                    mainline_keyframe.object_ref_array = mainline_keyframe.object_ref_array.sort(function (a, b) { return a.id - b.id; });
                    return mainline_keyframe;
                };
                return MainlineKeyframe;
            }(Keyframe));
            exports_1("MainlineKeyframe", MainlineKeyframe);
            Mainline = (function () {
                function Mainline() {
                }
                Mainline.prototype.load = function (json) {
                    var mainline = this;
                    mainline.keyframe_array = [];
                    json.key = makeArray(json.key);
                    json.key.forEach(function (key_json) {
                        mainline.keyframe_array.push(new MainlineKeyframe().load(key_json));
                    });
                    mainline.keyframe_array = mainline.keyframe_array.sort(Keyframe.compare);
                    return mainline;
                };
                return Mainline;
            }());
            exports_1("Mainline", Mainline);
            TimelineKeyframe = (function (_super) {
                __extends(TimelineKeyframe, _super);
                function TimelineKeyframe(type) {
                    _super.call(this);
                    this.type = "unknown";
                    this.spin = 1;
                    this.curve = new Curve();
                    this.type = type;
                }
                TimelineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.spin = loadInt(json, 'spin', 1);
                    this.curve.load(json);
                    return this;
                };
                return TimelineKeyframe;
            }(Keyframe));
            exports_1("TimelineKeyframe", TimelineKeyframe);
            SpriteTimelineKeyframe = (function (_super) {
                __extends(SpriteTimelineKeyframe, _super);
                function SpriteTimelineKeyframe() {
                    _super.call(this, 'sprite');
                }
                SpriteTimelineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.sprite = new SpriteObject().load(json.object);
                    return this;
                };
                return SpriteTimelineKeyframe;
            }(TimelineKeyframe));
            exports_1("SpriteTimelineKeyframe", SpriteTimelineKeyframe);
            BoneTimelineKeyframe = (function (_super) {
                __extends(BoneTimelineKeyframe, _super);
                function BoneTimelineKeyframe() {
                    _super.call(this, 'bone');
                }
                BoneTimelineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    json.bone.type = json.bone.type || 'bone';
                    this.bone = new Bone().load(json.bone);
                    return this;
                };
                return BoneTimelineKeyframe;
            }(TimelineKeyframe));
            exports_1("BoneTimelineKeyframe", BoneTimelineKeyframe);
            BoxTimelineKeyframe = (function (_super) {
                __extends(BoxTimelineKeyframe, _super);
                function BoxTimelineKeyframe() {
                    _super.call(this, 'box');
                }
                BoxTimelineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    json.object.type = json.object.type || 'box';
                    this.box = new BoxObject().load(json.object);
                    return this;
                };
                return BoxTimelineKeyframe;
            }(TimelineKeyframe));
            exports_1("BoxTimelineKeyframe", BoxTimelineKeyframe);
            PointTimelineKeyframe = (function (_super) {
                __extends(PointTimelineKeyframe, _super);
                function PointTimelineKeyframe() {
                    _super.call(this, 'point');
                }
                PointTimelineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    json.object.type = json.object.type || 'point';
                    this.point = new PointObject().load(json.object);
                    return this;
                };
                return PointTimelineKeyframe;
            }(TimelineKeyframe));
            exports_1("PointTimelineKeyframe", PointTimelineKeyframe);
            SoundTimelineKeyframe = (function (_super) {
                __extends(SoundTimelineKeyframe, _super);
                function SoundTimelineKeyframe() {
                    _super.call(this, 'sound');
                }
                SoundTimelineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    json.object.type = json.object.type || 'sound';
                    this.sound = new SoundObject().load(json.object);
                    return this;
                };
                return SoundTimelineKeyframe;
            }(TimelineKeyframe));
            exports_1("SoundTimelineKeyframe", SoundTimelineKeyframe);
            EntityTimelineKeyframe = (function (_super) {
                __extends(EntityTimelineKeyframe, _super);
                function EntityTimelineKeyframe() {
                    _super.call(this, 'entity');
                }
                EntityTimelineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    json.object.type = json.object.type || 'entity';
                    this.entity = new EntityObject().load(json.object);
                    return this;
                };
                return EntityTimelineKeyframe;
            }(TimelineKeyframe));
            exports_1("EntityTimelineKeyframe", EntityTimelineKeyframe);
            VariableTimelineKeyframe = (function (_super) {
                __extends(VariableTimelineKeyframe, _super);
                function VariableTimelineKeyframe() {
                    _super.call(this, 'variable');
                }
                VariableTimelineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    json.object.type = json.object.type || 'variable';
                    this.variable = new VariableObject().load(json.object);
                    return this;
                };
                return VariableTimelineKeyframe;
            }(TimelineKeyframe));
            exports_1("VariableTimelineKeyframe", VariableTimelineKeyframe);
            TagDef = (function (_super) {
                __extends(TagDef, _super);
                function TagDef() {
                    _super.apply(this, arguments);
                    this.tag_index = -1;
                }
                TagDef.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    return this;
                };
                return TagDef;
            }(Element));
            exports_1("TagDef", TagDef);
            Tag = (function (_super) {
                __extends(Tag, _super);
                function Tag() {
                    _super.apply(this, arguments);
                    this.tag_def_index = -1;
                }
                Tag.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.tag_def_index = loadInt(json, 't', -1);
                    return this;
                };
                return Tag;
            }(Element));
            exports_1("Tag", Tag);
            TaglineKeyframe = (function (_super) {
                __extends(TaglineKeyframe, _super);
                function TaglineKeyframe() {
                    _super.apply(this, arguments);
                }
                TaglineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var tagline_keyframe = this;
                    tagline_keyframe.tag_array = [];
                    json.tag = makeArray(json.tag);
                    json.tag.forEach(function (tag_json) {
                        tagline_keyframe.tag_array.push(new Tag().load(tag_json));
                    });
                    return this;
                };
                return TaglineKeyframe;
            }(Keyframe));
            exports_1("TaglineKeyframe", TaglineKeyframe);
            Tagline = (function (_super) {
                __extends(Tagline, _super);
                function Tagline() {
                    _super.apply(this, arguments);
                    this.keyframe_array = [];
                }
                Tagline.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var tagline = this;
                    tagline.keyframe_array = [];
                    json.key = makeArray(json.key);
                    json.key.forEach(function (key_json) {
                        tagline.keyframe_array.push(new TaglineKeyframe().load(key_json));
                    });
                    return this;
                };
                return Tagline;
            }(Element));
            exports_1("Tagline", Tagline);
            VarlineKeyframe = (function (_super) {
                __extends(VarlineKeyframe, _super);
                function VarlineKeyframe() {
                    _super.apply(this, arguments);
                }
                VarlineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var varline_keyframe = this;
                    switch (typeof (json.val)) {
                        case 'number':
                            varline_keyframe.val = loadFloat(json, 'val', 0.0);
                            break;
                        case 'string':
                            varline_keyframe.val = loadString(json, 'val', "");
                            break;
                    }
                    return this;
                };
                return VarlineKeyframe;
            }(Keyframe));
            exports_1("VarlineKeyframe", VarlineKeyframe);
            Varline = (function (_super) {
                __extends(Varline, _super);
                function Varline() {
                    _super.apply(this, arguments);
                    this.var_def_index = -1;
                }
                Varline.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var varline = this;
                    varline.var_def_index = loadInt(json, 'def', -1);
                    varline.keyframe_array = [];
                    json.key = makeArray(json.key);
                    json.key.forEach(function (key_json) {
                        varline.keyframe_array.push(new VarlineKeyframe().load(key_json));
                    });
                    return this;
                };
                return Varline;
            }(Element));
            exports_1("Varline", Varline);
            Meta = (function (_super) {
                __extends(Meta, _super);
                function Meta() {
                    _super.apply(this, arguments);
                }
                Meta.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var meta = this;
                    meta.tagline = new Tagline();
                    if (json.tagline) {
                        meta.tagline.load(json.tagline);
                    }
                    meta.varline_array = [];
                    json.valline = json.valline || null;
                    json.varline = json.varline || json.valline;
                    if (json.varline) {
                        json.varline = makeArray(json.varline);
                        json.varline.forEach(function (varline_json) {
                            meta.varline_array.push(new Varline().load(varline_json));
                        });
                    }
                    return this;
                };
                return Meta;
            }(Element));
            exports_1("Meta", Meta);
            Timeline = (function (_super) {
                __extends(Timeline, _super);
                function Timeline() {
                    _super.apply(this, arguments);
                    this.type = "sprite";
                    this.object_index = -1;
                }
                Timeline.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var timeline = this;
                    timeline.type = loadString(json, 'object_type', "sprite");
                    timeline.object_index = loadInt(json, 'obj', -1);
                    timeline.keyframe_array = [];
                    json.key = makeArray(json.key);
                    switch (timeline.type) {
                        case 'sprite':
                            json.key.forEach(function (key_json) {
                                timeline.keyframe_array.push(new SpriteTimelineKeyframe().load(key_json));
                            });
                            break;
                        case 'bone':
                            json.key.forEach(function (key_json) {
                                timeline.keyframe_array.push(new BoneTimelineKeyframe().load(key_json));
                            });
                            break;
                        case 'box':
                            json.key.forEach(function (key_json) {
                                timeline.keyframe_array.push(new BoxTimelineKeyframe().load(key_json));
                            });
                            break;
                        case 'point':
                            json.key.forEach(function (key_json) {
                                timeline.keyframe_array.push(new PointTimelineKeyframe().load(key_json));
                            });
                            break;
                        case 'sound':
                            json.key.forEach(function (key_json) {
                                timeline.keyframe_array.push(new SoundTimelineKeyframe().load(key_json));
                            });
                            break;
                        case 'entity':
                            json.key.forEach(function (key_json) {
                                timeline.keyframe_array.push(new EntityTimelineKeyframe().load(key_json));
                            });
                            break;
                        case 'variable':
                            json.key.forEach(function (key_json) {
                                timeline.keyframe_array.push(new VariableTimelineKeyframe().load(key_json));
                            });
                            break;
                        default:
                            console.log("TODO: Timeline::load", timeline.type, json.key);
                            break;
                    }
                    timeline.keyframe_array = timeline.keyframe_array.sort(Keyframe.compare);
                    if (json.meta) {
                        timeline.meta = new Meta().load(json.meta);
                    }
                    return timeline;
                };
                return Timeline;
            }(Element));
            exports_1("Timeline", Timeline);
            SoundlineKeyframe = (function (_super) {
                __extends(SoundlineKeyframe, _super);
                function SoundlineKeyframe() {
                    _super.apply(this, arguments);
                }
                SoundlineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    json.object.type = json.object.type || 'sound';
                    this.sound = new SoundObject().load(json.object);
                    return this;
                };
                return SoundlineKeyframe;
            }(Keyframe));
            exports_1("SoundlineKeyframe", SoundlineKeyframe);
            Soundline = (function (_super) {
                __extends(Soundline, _super);
                function Soundline() {
                    _super.apply(this, arguments);
                }
                Soundline.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var soundline = this;
                    soundline.keyframe_array = [];
                    json.key = makeArray(json.key);
                    json.key.forEach(function (key_json) {
                        soundline.keyframe_array.push(new SoundlineKeyframe().load(key_json));
                    });
                    soundline.keyframe_array = soundline.keyframe_array.sort(Keyframe.compare);
                    return this;
                };
                return Soundline;
            }(Element));
            exports_1("Soundline", Soundline);
            EventlineKeyframe = (function (_super) {
                __extends(EventlineKeyframe, _super);
                function EventlineKeyframe() {
                    _super.apply(this, arguments);
                }
                EventlineKeyframe.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    return this;
                };
                return EventlineKeyframe;
            }(Keyframe));
            exports_1("EventlineKeyframe", EventlineKeyframe);
            Eventline = (function (_super) {
                __extends(Eventline, _super);
                function Eventline() {
                    _super.apply(this, arguments);
                }
                Eventline.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var eventline = this;
                    eventline.keyframe_array = [];
                    json.key = makeArray(json.key);
                    json.key.forEach(function (key_json) {
                        eventline.keyframe_array.push(new EventlineKeyframe().load(key_json));
                    });
                    eventline.keyframe_array = eventline.keyframe_array.sort(Keyframe.compare);
                    return this;
                };
                return Eventline;
            }(Element));
            exports_1("Eventline", Eventline);
            MapInstruction = (function () {
                function MapInstruction() {
                    this.folder_index = -1;
                    this.file_index = -1;
                    this.target_folder_index = -1;
                    this.target_file_index = -1;
                }
                MapInstruction.prototype.load = function (json) {
                    var map_instruction = this;
                    map_instruction.folder_index = loadInt(json, 'folder', -1);
                    map_instruction.file_index = loadInt(json, 'file', -1);
                    map_instruction.target_folder_index = loadInt(json, 'target_folder', -1);
                    map_instruction.target_file_index = loadInt(json, 'target_file', -1);
                    return this;
                };
                return MapInstruction;
            }());
            exports_1("MapInstruction", MapInstruction);
            CharacterMap = (function (_super) {
                __extends(CharacterMap, _super);
                function CharacterMap() {
                    _super.apply(this, arguments);
                    this.map_instruction_array = [];
                }
                CharacterMap.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var character_map = this;
                    character_map.map_instruction_array = [];
                    json.map = makeArray(json.map);
                    json.map.forEach(function (map_json) {
                        var map_instruction = new MapInstruction().load(map_json);
                        character_map.map_instruction_array.push(map_instruction);
                    });
                    return this;
                };
                return CharacterMap;
            }(Element));
            exports_1("CharacterMap", CharacterMap);
            VarDef = (function (_super) {
                __extends(VarDef, _super);
                function VarDef() {
                    _super.apply(this, arguments);
                }
                VarDef.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.type = this.default_value = loadString(json, 'type', "");
                    switch (this.type) {
                        case 'int':
                            this.value = this.default_value = loadInt(json, 'default_value', 0);
                            break;
                        case 'float':
                            this.value = this.default_value = loadFloat(json, 'default_value', 0.0);
                            break;
                        case 'string':
                            this.value = this.default_value = loadString(json, 'default_value', "");
                            break;
                    }
                    return this;
                };
                return VarDef;
            }(Element));
            exports_1("VarDef", VarDef);
            VarDefs = (function (_super) {
                __extends(VarDefs, _super);
                function VarDefs() {
                    _super.apply(this, arguments);
                }
                VarDefs.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var var_defs = this;
                    this.var_def_array = [];
                    var json_var_def_array = [];
                    if (typeof (json.i) === 'object') {
                        json_var_def_array = makeArray(json.i);
                    }
                    else if ((typeof (json) === 'object') && (typeof (json.length) === 'number')) {
                        json_var_def_array = makeArray(json);
                    }
                    json_var_def_array.forEach(function (var_def_json) {
                        var_defs.var_def_array.push(new VarDef().load(var_def_json));
                    });
                    return this;
                };
                return VarDefs;
            }(Element));
            exports_1("VarDefs", VarDefs);
            ObjInfo = (function (_super) {
                __extends(ObjInfo, _super);
                function ObjInfo(type) {
                    _super.call(this);
                    this.type = "unknown";
                    this.type = type;
                }
                ObjInfo.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.var_defs = new VarDefs().load(json.var_defs || {});
                    return this;
                };
                return ObjInfo;
            }(Element));
            exports_1("ObjInfo", ObjInfo);
            SpriteFrame = (function () {
                function SpriteFrame() {
                    this.folder_index = -1;
                    this.file_index = -1;
                }
                SpriteFrame.prototype.load = function (json) {
                    this.folder_index = loadInt(json, 'folder', -1);
                    this.file_index = loadInt(json, 'file', -1);
                    return this;
                };
                return SpriteFrame;
            }());
            exports_1("SpriteFrame", SpriteFrame);
            SpriteObjInfo = (function (_super) {
                __extends(SpriteObjInfo, _super);
                function SpriteObjInfo() {
                    _super.call(this, 'sprite');
                }
                SpriteObjInfo.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var obj_info = this;
                    obj_info.sprite_frame_array = [];
                    json.frames = makeArray(json.frames);
                    json.frames.forEach(function (frames_json) {
                        obj_info.sprite_frame_array.push(new SpriteFrame().load(frames_json));
                    });
                    return this;
                };
                return SpriteObjInfo;
            }(ObjInfo));
            exports_1("SpriteObjInfo", SpriteObjInfo);
            BoneObjInfo = (function (_super) {
                __extends(BoneObjInfo, _super);
                function BoneObjInfo() {
                    _super.call(this, 'bone');
                    this.w = 0;
                    this.h = 0;
                }
                BoneObjInfo.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.w = loadInt(json, 'w', 0);
                    this.h = loadInt(json, 'h', 0);
                    return this;
                };
                return BoneObjInfo;
            }(ObjInfo));
            exports_1("BoneObjInfo", BoneObjInfo);
            BoxObjInfo = (function (_super) {
                __extends(BoxObjInfo, _super);
                function BoxObjInfo() {
                    _super.call(this, 'box');
                    this.w = 0;
                    this.h = 0;
                }
                BoxObjInfo.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    this.w = loadInt(json, 'w', 0);
                    this.h = loadInt(json, 'h', 0);
                    return this;
                };
                return BoxObjInfo;
            }(ObjInfo));
            exports_1("BoxObjInfo", BoxObjInfo);
            Animation = (function (_super) {
                __extends(Animation, _super);
                function Animation() {
                    _super.apply(this, arguments);
                    this.length = 0;
                    this.looping = "true";
                    this.loop_to = 0;
                    this.min_time = 0;
                    this.max_time = 0;
                }
                Animation.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var anim = this;
                    anim.length = loadInt(json, 'length', 0);
                    anim.looping = loadString(json, 'looping', "true");
                    anim.loop_to = loadInt(json, 'loop_to', 0);
                    anim.mainline = new Mainline().load(json.mainline || {});
                    anim.timeline_array = [];
                    json.timeline = makeArray(json.timeline);
                    json.timeline.forEach(function (timeline_json) {
                        anim.timeline_array.push(new Timeline().load(timeline_json));
                    });
                    anim.soundline_array = [];
                    json.soundline = makeArray(json.soundline);
                    json.soundline.forEach(function (soundline_json) {
                        anim.soundline_array.push(new Soundline().load(soundline_json));
                    });
                    anim.eventline_array = [];
                    json.eventline = makeArray(json.eventline);
                    json.eventline.forEach(function (eventline_json) {
                        anim.eventline_array.push(new Eventline().load(eventline_json));
                    });
                    if (json.meta) {
                        anim.meta = new Meta().load(json.meta);
                    }
                    anim.min_time = 0;
                    anim.max_time = anim.length;
                    return this;
                };
                return Animation;
            }(Element));
            exports_1("Animation", Animation);
            Entity = (function (_super) {
                __extends(Entity, _super);
                function Entity() {
                    _super.apply(this, arguments);
                }
                Entity.prototype.load = function (json) {
                    _super.prototype.load.call(this, json);
                    var entity = this;
                    entity.character_map_map = {};
                    entity.character_map_keys = [];
                    json.character_map = makeArray(json.character_map);
                    json.character_map.forEach(function (character_map_json) {
                        var character_map = new CharacterMap().load(character_map_json);
                        entity.character_map_map[character_map.name] = character_map;
                        entity.character_map_keys.push(character_map.name);
                    });
                    this.var_defs = new VarDefs().load(json.var_defs || {});
                    entity.obj_info_map = {};
                    entity.obj_info_keys = [];
                    json.obj_info = makeArray(json.obj_info);
                    json.obj_info.forEach(function (obj_info_json) {
                        var obj_info;
                        switch (obj_info_json.type) {
                            case 'sprite':
                                obj_info = new SpriteObjInfo().load(obj_info_json);
                                break;
                            case 'bone':
                                obj_info = new BoneObjInfo().load(obj_info_json);
                                break;
                            case 'box':
                                obj_info = new BoxObjInfo().load(obj_info_json);
                                break;
                            case 'point':
                            case 'sound':
                            case 'entity':
                            case 'variable':
                            default:
                                console.log("TODO: Entity.load", obj_info_json.type, obj_info_json);
                                obj_info = new ObjInfo(obj_info_json.type).load(obj_info_json);
                                break;
                        }
                        entity.obj_info_map[obj_info.name] = obj_info;
                        entity.obj_info_keys.push(obj_info.name);
                    });
                    entity.animation_map = {};
                    entity.animation_keys = [];
                    json.animation = makeArray(json.animation);
                    json.animation.forEach(function (animation_json) {
                        var animation = new Animation().load(animation_json);
                        entity.animation_map[animation.name] = animation;
                        entity.animation_keys.push(animation.name);
                    });
                    return this;
                };
                return Entity;
            }(Element));
            exports_1("Entity", Entity);
            Data = (function () {
                function Data() {
                    this.folder_array = [];
                    this.tag_def_array = [];
                    this.entity_map = {};
                    this.entity_keys = [];
                }
                Data.prototype.load = function (json) {
                    var data = this;
                    var scon_version = loadString(json, 'scon_version', "");
                    var generator = loadString(json, 'generator', "");
                    var generator_version = loadString(json, 'generator_version', "");
                    data.folder_array = [];
                    json.folder = makeArray(json.folder);
                    json.folder.forEach(function (folder_json) {
                        data.folder_array.push(new Folder().load(folder_json));
                    });
                    data.tag_def_array = [];
                    json.tag_list = makeArray(json.tag_list);
                    json.tag_list.forEach(function (tag_list_json) {
                        data.tag_def_array.push(new TagDef().load(tag_list_json));
                    });
                    data.entity_map = {};
                    data.entity_keys = [];
                    json.entity = makeArray(json.entity);
                    json.entity.forEach(function (entity_json) {
                        var entity = new Entity().load(entity_json);
                        data.entity_map[entity.name] = entity;
                        data.entity_keys.push(entity.name);
                    });
                    data.entity_keys.forEach(function (entity_key) {
                        var entity = data.entity_map[entity_key];
                        entity.animation_keys.forEach(function (animation_key) {
                            var animation = entity.animation_map[animation_key];
                            animation.timeline_array.forEach(function (timeline) {
                                timeline.keyframe_array.forEach(function (timeline_keyframe) {
                                    if (timeline_keyframe instanceof SpriteTimelineKeyframe) {
                                        var sprite = timeline_keyframe.sprite;
                                        if (sprite.default_pivot) {
                                            var folder = data.folder_array[sprite.folder_index];
                                            var file = folder && folder.file_array[sprite.file_index];
                                            if (file) {
                                                sprite.pivot.copy(file.pivot);
                                            }
                                        }
                                    }
                                });
                            });
                        });
                    });
                    return this;
                };
                Data.prototype.getEntities = function () { return this.entity_map; };
                Data.prototype.getEntityKeys = function () { return this.entity_keys; };
                Data.prototype.getAnims = function (entity_key) {
                    var entity = this.entity_map && this.entity_map[entity_key];
                    if (entity) {
                        return entity.animation_map;
                    }
                    return {};
                };
                Data.prototype.getAnimKeys = function (entity_key) {
                    var entity = this.entity_map && this.entity_map[entity_key];
                    if (entity) {
                        return entity.animation_keys;
                    }
                    return [];
                };
                return Data;
            }());
            exports_1("Data", Data);
            Pose = (function () {
                function Pose(data) {
                    this.entity_key = "";
                    this.character_map_key_array = [];
                    this.anim_key = "";
                    this.time = 0;
                    this.elapsed_time = 0;
                    this.dirty = true;
                    this.bone_array = [];
                    this.object_array = [];
                    this.sound_array = [];
                    this.event_array = [];
                    this.tag_array = [];
                    this.var_map = {};
                    this.data = data;
                }
                Pose.prototype.getEntities = function () {
                    if (this.data) {
                        return this.data.getEntities();
                    }
                    return null;
                };
                Pose.prototype.getEntityKeys = function () {
                    if (this.data) {
                        return this.data.getEntityKeys();
                    }
                    return null;
                };
                Pose.prototype.curEntity = function () {
                    var entity_map = this.data.entity_map;
                    return entity_map && entity_map[this.entity_key];
                };
                Pose.prototype.getEntity = function () {
                    return this.entity_key;
                };
                Pose.prototype.setEntity = function (entity_key) {
                    if (this.entity_key !== entity_key) {
                        this.entity_key = entity_key;
                        this.anim_key = "";
                        this.time = 0;
                        this.dirty = true;
                        this.bone_array = [];
                        this.object_array = [];
                    }
                };
                Pose.prototype.getAnims = function () {
                    if (this.data) {
                        return this.data.getAnims(this.entity_key);
                    }
                    return null;
                };
                Pose.prototype.getAnimKeys = function () {
                    if (this.data) {
                        return this.data.getAnimKeys(this.entity_key);
                    }
                    return null;
                };
                Pose.prototype.curAnim = function () {
                    var anims = this.getAnims();
                    return anims && anims[this.anim_key];
                };
                Pose.prototype.curAnimLength = function () {
                    var pose = this;
                    var data = pose.data;
                    var entity = data && data.entity_map[pose.entity_key];
                    var anim = entity && entity.animation_map[pose.anim_key];
                    return (anim && anim.length) || 0;
                };
                Pose.prototype.getAnim = function () {
                    return this.anim_key;
                };
                Pose.prototype.setAnim = function (anim_key) {
                    if (this.anim_key !== anim_key) {
                        this.anim_key = anim_key;
                        var anim = this.curAnim();
                        if (anim) {
                            this.time = wrap(this.time, anim.min_time, anim.max_time);
                        }
                        this.elapsed_time = 0;
                        this.dirty = true;
                    }
                };
                Pose.prototype.getTime = function () {
                    return this.time;
                };
                Pose.prototype.setTime = function (time) {
                    var anim = this.curAnim();
                    if (anim) {
                        time = wrap(time, anim.min_time, anim.max_time);
                    }
                    if (this.time !== time) {
                        this.time = time;
                        this.elapsed_time = 0;
                        this.dirty = true;
                    }
                };
                Pose.prototype.update = function (elapsed_time) {
                    var pose = this;
                    pose.elapsed_time += elapsed_time;
                    pose.dirty = true;
                };
                Pose.prototype.strike = function () {
                    var pose = this;
                    if (!pose.dirty) {
                        return;
                    }
                    pose.dirty = false;
                    var entity = pose.curEntity();
                    pose.var_map = pose.var_map || {};
                    entity.var_defs.var_def_array.forEach(function (var_def) {
                        if (!(var_def.name in pose.var_map)) {
                            pose.var_map[var_def.name] = var_def.default_value;
                        }
                    });
                    var anim = pose.curAnim();
                    var prev_time = pose.time;
                    var elapsed_time = pose.elapsed_time;
                    pose.time = pose.time + pose.elapsed_time;
                    pose.elapsed_time = 0;
                    var wrapped_min = false;
                    var wrapped_max = false;
                    if (anim) {
                        wrapped_min = (elapsed_time < 0) && (pose.time <= anim.min_time);
                        wrapped_max = (elapsed_time > 0) && (pose.time >= anim.max_time);
                        pose.time = wrap(pose.time, anim.min_time, anim.max_time);
                    }
                    var time = pose.time;
                    if (anim) {
                        var mainline_keyframe_array = anim.mainline.keyframe_array;
                        var mainline_keyframe_index1 = Keyframe.find(mainline_keyframe_array, time);
                        var mainline_keyframe_index2 = (mainline_keyframe_index1 + 1) % mainline_keyframe_array.length;
                        var mainline_keyframe1 = mainline_keyframe_array[mainline_keyframe_index1];
                        var mainline_keyframe2 = mainline_keyframe_array[mainline_keyframe_index2];
                        var mainline_time1 = mainline_keyframe1.time;
                        var mainline_time2 = mainline_keyframe2.time;
                        if (mainline_time2 < mainline_time1) {
                            mainline_time2 = anim.length;
                        }
                        var mainline_time = time;
                        if (mainline_time1 !== mainline_time2) {
                            var mainline_tween = (time - mainline_time1) / (mainline_time2 - mainline_time1);
                            mainline_tween = mainline_keyframe1.curve.evaluate(mainline_tween);
                            mainline_time = tween(mainline_time1, mainline_time2, mainline_tween);
                        }
                        var timeline_array = anim.timeline_array;
                        var data_bone_array = mainline_keyframe1.bone_ref_array;
                        var pose_bone_array = pose.bone_array;
                        data_bone_array.forEach(function (data_bone, bone_index) {
                            var timeline_index = data_bone.timeline_index;
                            var timeline = timeline_array[timeline_index];
                            var timeline_keyframe_array = timeline.keyframe_array;
                            var keyframe_index1 = data_bone.keyframe_index;
                            var keyframe_index2 = (keyframe_index1 + 1) % timeline_keyframe_array.length;
                            var timeline_keyframe1 = timeline_keyframe_array[keyframe_index1];
                            var timeline_keyframe2 = timeline_keyframe_array[keyframe_index2];
                            var time1 = timeline_keyframe1.time;
                            var time2 = timeline_keyframe2.time;
                            if (time2 < time1) {
                                time2 = anim.length;
                            }
                            var pct = 0.0;
                            if (time1 !== time2) {
                                pct = (mainline_time - time1) / (time2 - time1);
                                pct = timeline_keyframe1.curve.evaluate(pct);
                            }
                            var pose_bone = (pose_bone_array[bone_index] = (pose_bone_array[bone_index] || new Bone()));
                            var bone_timeline_keyframe1 = timeline_keyframe1;
                            var bone_timeline_keyframe2 = timeline_keyframe2;
                            pose_bone.copy(bone_timeline_keyframe1.bone).tween(bone_timeline_keyframe2.bone, pct, timeline_keyframe1.spin);
                            pose_bone.name = timeline.name;
                            pose_bone.parent_index = data_bone.parent_index;
                        });
                        pose_bone_array.length = data_bone_array.length;
                        pose_bone_array.forEach(function (bone) {
                            var parent_bone = pose_bone_array[bone.parent_index];
                            if (parent_bone) {
                                Space.combine(parent_bone.world_space, bone.local_space, bone.world_space);
                            }
                            else {
                                bone.world_space.copy(bone.local_space);
                            }
                        });
                        var data_object_array = mainline_keyframe1.object_ref_array;
                        var pose_object_array = pose.object_array;
                        data_object_array.forEach(function (data_object, object_index) {
                            var timeline_index = data_object.timeline_index;
                            var timeline = timeline_array[timeline_index];
                            var timeline_keyframe_array = timeline.keyframe_array;
                            var keyframe_index1 = data_object.keyframe_index;
                            var keyframe_index2 = (keyframe_index1 + 1) % timeline_keyframe_array.length;
                            var timeline_keyframe1 = timeline_keyframe_array[keyframe_index1];
                            var timeline_keyframe2 = timeline_keyframe_array[keyframe_index2];
                            var time1 = timeline_keyframe1.time;
                            var time2 = timeline_keyframe2.time;
                            if (time2 < time1) {
                                time2 = anim.length;
                            }
                            var pct = 0.0;
                            if (time1 !== time2) {
                                pct = (mainline_time - time1) / (time2 - time1);
                                pct = timeline_keyframe1.curve.evaluate(pct);
                            }
                            switch (timeline.type) {
                                case 'sprite':
                                    var pose_sprite = (pose_object_array[object_index] = (pose_object_array[object_index] || new SpriteObject()));
                                    var sprite_timeline_keyframe1 = timeline_keyframe1;
                                    var sprite_timeline_keyframe2 = timeline_keyframe2;
                                    pose_sprite.copy(sprite_timeline_keyframe1.sprite).tween(sprite_timeline_keyframe2.sprite, pct, timeline_keyframe1.spin);
                                    pose_sprite.name = timeline.name;
                                    pose_sprite.parent_index = data_object.parent_index;
                                    break;
                                case 'bone':
                                    var pose_bone = (pose_object_array[object_index] = (pose_object_array[object_index] || new Bone()));
                                    var bone_timeline_keyframe1 = timeline_keyframe1;
                                    var bone_timeline_keyframe2 = timeline_keyframe2;
                                    pose_bone.copy(bone_timeline_keyframe1.bone).tween(bone_timeline_keyframe2.bone, pct, timeline_keyframe1.spin);
                                    pose_bone.name = timeline.name;
                                    pose_bone.parent_index = data_object.parent_index;
                                    break;
                                case 'box':
                                    var pose_box = (pose_object_array[object_index] = (pose_object_array[object_index] || new BoxObject()));
                                    var box_timeline_keyframe1 = timeline_keyframe1;
                                    var box_timeline_keyframe2 = timeline_keyframe2;
                                    pose_box.copy(box_timeline_keyframe1.box).tween(box_timeline_keyframe2.box, pct, timeline_keyframe1.spin);
                                    pose_box.name = timeline.name;
                                    pose_box.parent_index = data_object.parent_index;
                                    break;
                                case 'point':
                                    var pose_point = (pose_object_array[object_index] = (pose_object_array[object_index] || new PointObject()));
                                    var point_timeline_keyframe1 = timeline_keyframe1;
                                    var point_timeline_keyframe2 = timeline_keyframe2;
                                    pose_point.copy(point_timeline_keyframe1.point).tween(point_timeline_keyframe2.point, pct, timeline_keyframe1.spin);
                                    pose_point.name = timeline.name;
                                    pose_point.parent_index = data_object.parent_index;
                                    break;
                                case 'sound':
                                    var pose_sound = (pose_object_array[object_index] = (pose_object_array[object_index] || new SoundObject()));
                                    var sound_timeline_keyframe1 = timeline_keyframe1;
                                    var sound_timeline_keyframe2 = timeline_keyframe2;
                                    pose_sound.copy(sound_timeline_keyframe1.sound).tween(sound_timeline_keyframe2.sound, pct, timeline_keyframe1.spin);
                                    pose_sound.name = timeline.name;
                                    break;
                                case 'entity':
                                    var pose_entity = (pose_object_array[object_index] = (pose_object_array[object_index] || new EntityObject()));
                                    var entity_timeline_keyframe1 = timeline_keyframe1;
                                    var entity_timeline_keyframe2 = timeline_keyframe2;
                                    pose_entity.copy(entity_timeline_keyframe1.entity).tween(entity_timeline_keyframe2.entity, pct, timeline_keyframe1.spin);
                                    pose_entity.name = timeline.name;
                                    pose_entity.parent_index = data_object.parent_index;
                                    break;
                                case 'variable':
                                    var pose_variable = (pose_object_array[object_index] = (pose_object_array[object_index] || new VariableObject()));
                                    var variable_timeline_keyframe1 = timeline_keyframe1;
                                    var variable_timeline_keyframe2 = timeline_keyframe2;
                                    pose_variable.name = timeline.name;
                                    pose_variable.copy(variable_timeline_keyframe1.variable).tween(variable_timeline_keyframe2.variable, pct, timeline_keyframe1.spin);
                                    break;
                                default:
                                    throw new Error(timeline.type);
                            }
                        });
                        pose_object_array.length = data_object_array.length;
                        pose.character_map_key_array.forEach(function (character_map_key) {
                            var character_map = entity.character_map_map[character_map_key];
                            if (character_map) {
                                character_map.map_instruction_array.forEach(function (map_instruction) {
                                    pose_object_array.forEach(function (object) {
                                        switch (object.type) {
                                            case 'sprite':
                                                var sprite_object = object;
                                                if ((sprite_object.folder_index === map_instruction.folder_index) &&
                                                    (sprite_object.file_index === map_instruction.file_index)) {
                                                    sprite_object.folder_index = map_instruction.target_folder_index;
                                                    sprite_object.file_index = map_instruction.target_file_index;
                                                }
                                                break;
                                            case 'bone':
                                            case 'box':
                                            case 'sound':
                                            case 'event':
                                            case 'entity':
                                            case 'variable':
                                                break;
                                            default:
                                                throw new Error(object.type);
                                        }
                                    });
                                });
                            }
                        });
                        pose_object_array.forEach(function (object) {
                            switch (object.type) {
                                case 'sprite':
                                    var sprite_object = object;
                                    var bone = pose_bone_array[sprite_object.parent_index];
                                    if (bone) {
                                        Space.combine(bone.world_space, sprite_object.local_space, sprite_object.world_space);
                                    }
                                    else {
                                        sprite_object.world_space.copy(sprite_object.local_space);
                                    }
                                    var folder = pose.data.folder_array[sprite_object.folder_index];
                                    var file = folder && folder.file_array[sprite_object.file_index];
                                    if (file) {
                                        var image_file = file;
                                        var offset_x = (0.5 - sprite_object.pivot.x) * image_file.width;
                                        var offset_y = (0.5 - sprite_object.pivot.y) * image_file.height;
                                        Space.translate(sprite_object.world_space, offset_x, offset_y);
                                    }
                                    break;
                                case 'bone': {
                                    var bone_object = object;
                                    var bone_1 = pose_bone_array[bone_object.parent_index];
                                    if (bone_1) {
                                        Space.combine(bone_1.world_space, bone_object.local_space, bone_object.world_space);
                                    }
                                    else {
                                        bone_object.world_space.copy(bone_object.local_space);
                                    }
                                    break;
                                }
                                case 'box': {
                                    var box_object = object;
                                    var bone_2 = pose_bone_array[box_object.parent_index];
                                    if (bone_2) {
                                        Space.combine(bone_2.world_space, box_object.local_space, box_object.world_space);
                                    }
                                    else {
                                        box_object.world_space.copy(box_object.local_space);
                                    }
                                    var obj_info = entity.obj_info_map[object.name];
                                    if (obj_info) {
                                        var box_obj_info = obj_info;
                                        var offset_x = (0.5 - box_object.pivot.x) * box_obj_info.w;
                                        var offset_y = (0.5 - box_object.pivot.y) * box_obj_info.h;
                                        Space.translate(box_object.world_space, offset_x, offset_y);
                                    }
                                    break;
                                }
                                case 'point': {
                                    var point_object = object;
                                    var bone_3 = pose_bone_array[point_object.parent_index];
                                    if (bone_3) {
                                        Space.combine(bone_3.world_space, point_object.local_space, point_object.world_space);
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
                                    var bone_4 = pose_bone_array[entity_object.parent_index];
                                    if (bone_4) {
                                        Space.combine(bone_4.world_space, entity_object.local_space, entity_object.world_space);
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
                        pose_object_array.forEach(function (object) {
                            switch (object.type) {
                                case 'entity':
                                    var entity_object = object;
                                    var sub_pose = entity_object.pose = entity_object.pose || new Pose(pose.data);
                                    var sub_entity_key = sub_pose.data.entity_keys[entity_object.entity_index];
                                    if (sub_entity_key !== sub_pose.getEntity()) {
                                        sub_pose.setEntity(sub_entity_key);
                                    }
                                    var sub_entity = sub_pose.curEntity();
                                    var sub_anim_key = sub_entity.animation_keys[entity_object.animation_index];
                                    if (sub_anim_key !== sub_pose.getAnim()) {
                                        sub_pose.setAnim(sub_anim_key);
                                        var anim_length = sub_pose.curAnimLength();
                                        var sub_time = entity_object.animation_time * anim_length;
                                        sub_pose.setTime(sub_time);
                                    }
                                    else {
                                        var anim_length = sub_pose.curAnimLength();
                                        var sub_time = entity_object.animation_time * anim_length;
                                        var sub_dt = sub_time - sub_pose.getTime();
                                        sub_pose.update(sub_dt);
                                    }
                                    sub_pose.strike();
                                    break;
                            }
                        });
                        pose.sound_array = [];
                        anim.soundline_array.forEach(function (soundline) {
                            function add_sound(sound_keyframe) {
                                var folder = pose.data.folder_array[sound_keyframe.sound.folder_index];
                                var file = folder && folder.file_array[sound_keyframe.sound.file_index];
                                pose.sound_array.push({ name: file.name, volume: sound_keyframe.sound.volume, panning: sound_keyframe.sound.panning });
                            }
                            if (elapsed_time < 0) {
                                if (wrapped_min) {
                                    soundline.keyframe_array.forEach(function (sound_keyframe) {
                                        if (((anim.min_time <= sound_keyframe.time) && (sound_keyframe.time < prev_time)) ||
                                            ((time <= sound_keyframe.time) && (sound_keyframe.time <= anim.max_time))) {
                                            add_sound(sound_keyframe);
                                        }
                                    });
                                }
                                else {
                                    soundline.keyframe_array.forEach(function (sound_keyframe) {
                                        if ((time <= sound_keyframe.time) && (sound_keyframe.time < prev_time)) {
                                            add_sound(sound_keyframe);
                                        }
                                    });
                                }
                            }
                            else {
                                if (wrapped_max) {
                                    soundline.keyframe_array.forEach(function (sound_keyframe) {
                                        if (((anim.min_time <= sound_keyframe.time) && (sound_keyframe.time <= time)) ||
                                            ((prev_time < sound_keyframe.time) && (sound_keyframe.time <= anim.max_time))) {
                                            add_sound(sound_keyframe);
                                        }
                                    });
                                }
                                else {
                                    soundline.keyframe_array.forEach(function (sound_keyframe) {
                                        if ((prev_time < sound_keyframe.time) && (sound_keyframe.time <= time)) {
                                            add_sound(sound_keyframe);
                                        }
                                    });
                                }
                            }
                        });
                        pose.event_array = [];
                        anim.eventline_array.forEach(function (eventline) {
                            function add_event(event_keyframe) {
                                pose.event_array.push(eventline.name);
                            }
                            if (elapsed_time < 0) {
                                if (wrapped_min) {
                                    eventline.keyframe_array.forEach(function (event_keyframe) {
                                        if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time < prev_time)) ||
                                            ((time <= event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                            add_event(event_keyframe);
                                        }
                                    });
                                }
                                else {
                                    eventline.keyframe_array.forEach(function (event_keyframe) {
                                        if ((time <= event_keyframe.time) && (event_keyframe.time < prev_time)) {
                                            add_event(event_keyframe);
                                        }
                                    });
                                }
                            }
                            else {
                                if (wrapped_max) {
                                    eventline.keyframe_array.forEach(function (event_keyframe) {
                                        if (((anim.min_time <= event_keyframe.time) && (event_keyframe.time <= time)) ||
                                            ((prev_time < event_keyframe.time) && (event_keyframe.time <= anim.max_time))) {
                                            add_event(event_keyframe);
                                        }
                                    });
                                }
                                else {
                                    eventline.keyframe_array.forEach(function (event_keyframe) {
                                        if ((prev_time < event_keyframe.time) && (event_keyframe.time <= time)) {
                                            add_event(event_keyframe);
                                        }
                                    });
                                }
                            }
                        });
                        if (anim.meta) {
                            if (anim.meta.tagline) {
                                var add_tag = function (tag_keyframe) {
                                    pose.tag_array = [];
                                    tag_keyframe.tag_array.forEach(function (tag) {
                                        var tag_def = pose.data.tag_def_array[tag.tag_def_index];
                                        pose.tag_array.push(tag_def.name);
                                    });
                                    pose.tag_array = pose.tag_array.sort();
                                };
                                if (elapsed_time < 0) {
                                    if (wrapped_min) {
                                        anim.meta.tagline.keyframe_array.forEach(function (tag_keyframe) {
                                            if (((anim.min_time <= tag_keyframe.time) && (tag_keyframe.time < prev_time)) ||
                                                ((time <= tag_keyframe.time) && (tag_keyframe.time <= anim.max_time))) {
                                                add_tag(tag_keyframe);
                                            }
                                        });
                                    }
                                    else {
                                        anim.meta.tagline.keyframe_array.forEach(function (tag_keyframe) {
                                            if ((time <= tag_keyframe.time) && (tag_keyframe.time < prev_time)) {
                                                add_tag(tag_keyframe);
                                            }
                                        });
                                    }
                                }
                                else {
                                    if (wrapped_max) {
                                        anim.meta.tagline.keyframe_array.forEach(function (tag_keyframe) {
                                            if (((anim.min_time <= tag_keyframe.time) && (tag_keyframe.time <= time)) ||
                                                ((prev_time < tag_keyframe.time) && (tag_keyframe.time <= anim.max_time))) {
                                                add_tag(tag_keyframe);
                                            }
                                        });
                                    }
                                    else {
                                        anim.meta.tagline.keyframe_array.forEach(function (tag_keyframe) {
                                            if ((prev_time < tag_keyframe.time) && (tag_keyframe.time <= time)) {
                                                add_tag(tag_keyframe);
                                            }
                                        });
                                    }
                                }
                            }
                            pose.var_map = pose.var_map || {};
                            anim.meta.varline_array.forEach(function (varline) {
                                var keyframe_array = varline.keyframe_array;
                                var keyframe_index1 = Keyframe.find(keyframe_array, time);
                                if (keyframe_index1 !== -1) {
                                    var keyframe_index2 = (keyframe_index1 + 1) % keyframe_array.length;
                                    var keyframe1 = keyframe_array[keyframe_index1];
                                    var keyframe2 = keyframe_array[keyframe_index2];
                                    var time1 = keyframe1.time;
                                    var time2 = keyframe2.time;
                                    if (time2 < time1) {
                                        time2 = anim.length;
                                    }
                                    var pct = 0.0;
                                    if (time1 !== time2) {
                                        pct = (time - time1) / (time2 - time1);
                                    }
                                    var var_def = entity.var_defs.var_def_array[varline.var_def_index];
                                    var val = 0;
                                    switch (var_def.type) {
                                        case 'int':
                                            val = 0 | tween(+keyframe1.val, +keyframe2.val, pct);
                                            break;
                                        case 'float':
                                            val = tween(+keyframe1.val, +keyframe2.val, pct);
                                            break;
                                        case 'string':
                                            val = keyframe1.val;
                                    }
                                    pose.var_map[var_def.name] = val;
                                }
                            });
                        }
                    }
                };
                return Pose;
            }());
            exports_1("Pose", Pose);
        }
    }
});
