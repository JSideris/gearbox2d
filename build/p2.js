!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.p2=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var AABB = /** @class */ (function () {
    /**
     * Axis aligned bounding box class.
     * @class AABB
     * @constructor
     * @param {Object}  [options]
     * @param {Array}   [options.upperBound]
     * @param {Array}   [options.lowerBound]
     * @example
     *     var aabb = new AABB({
     *         upperBound: [1, 1],
     *         lowerBound: [-1, -1]
     *     });
     */
    function AABB(options) {
        this.tmp = vec2_1.default.create();
        options = options !== null && options !== void 0 ? options : {};
        /**
         * The lower bound of the bounding box.
         * @property lowerBound
         * @type {Array}
         */
        this.lowerBound = options.lowerBound ? vec2_1.default.clone(options.lowerBound) : vec2_1.default.create();
        /**
         * The upper bound of the bounding box.
         * @property upperBound
         * @type {Array}
         */
        this.upperBound = options.upperBound ? vec2_1.default.clone(options.upperBound) : vec2_1.default.create();
    }
    /**
     * Set the AABB bounds from a set of points, transformed by the given position and angle.
     * @method setFromPoints
     * @param {Array} points An array of vec2's.
     * @param {Array} position
     * @param {number} [angle=0]
     * @param {number} [skinSize=0] Some margin to be added to the AABB.
     */
    AABB.prototype.setFromPoints = function (points, position, angle, skinSize) {
        if (skinSize === void 0) { skinSize = 0; }
        var l = this.lowerBound, u = this.upperBound;
        angle = angle || 0;
        // Set to the first point
        if (angle !== 0) {
            vec2_1.default.rotate(l, points[0], angle);
        }
        else {
            vec2_1.default.copy(l, points[0]);
        }
        vec2_1.default.copy(u, l);
        // Compute cosines and sines just once
        var cosAngle = Math.cos(angle), sinAngle = Math.sin(angle);
        for (var i = 1; i < points.length; i++) {
            var p = points[i];
            if (angle !== 0) {
                var x = p[0], y = p[1];
                this.tmp[0] = cosAngle * x - sinAngle * y;
                this.tmp[1] = sinAngle * x + cosAngle * y;
                p = this.tmp;
            }
            for (var j = 0; j < 2; j++) {
                if (p[j] > u[j]) {
                    u[j] = p[j];
                }
                if (p[j] < l[j]) {
                    l[j] = p[j];
                }
            }
        }
        // Add offset
        if (position) {
            vec2_1.default.add(l, l, position);
            vec2_1.default.add(u, u, position);
        }
        if (skinSize) {
            l[0] -= skinSize;
            l[1] -= skinSize;
            u[0] += skinSize;
            u[1] += skinSize;
        }
    };
    /**
     * Copy bounds from an AABB to this AABB
     * @method copy
     * @param  {AABB} aabb
     */
    AABB.prototype.copy = function (aabb) {
        vec2_1.default.copy(this.lowerBound, aabb.lowerBound);
        vec2_1.default.copy(this.upperBound, aabb.upperBound);
    };
    /**
     * Extend this AABB so that it covers the given AABB too.
     * @method extend
     * @param  {AABB} aabb
     */
    AABB.prototype.extend = function (aabb) {
        var lower = this.lowerBound, upper = this.upperBound;
        // Loop over x and y
        var i = 2;
        while (i--) {
            // Extend lower bound
            var l = aabb.lowerBound[i];
            if (lower[i] > l) {
                lower[i] = l;
            }
            // Upper
            var u = aabb.upperBound[i];
            if (upper[i] < u) {
                upper[i] = u;
            }
        }
    };
    /**
     * Returns true if the given AABB overlaps this AABB.
     * @method overlaps
     * @param  {AABB} aabb
     * @return {Boolean}
     */
    AABB.prototype.overlaps = function (aabb) {
        var l1 = this.lowerBound, u1 = this.upperBound, l2 = aabb.lowerBound, u2 = aabb.upperBound;
        //      l2        u2
        //      |---------|
        // |--------|
        // l1       u1
        return ((l2[0] <= u1[0] && u1[0] <= u2[0]) || (l1[0] <= u2[0] && u2[0] <= u1[0])) &&
            ((l2[1] <= u1[1] && u1[1] <= u2[1]) || (l1[1] <= u2[1] && u2[1] <= u1[1]));
    };
    ;
    /**
     * @method containsPoint
     * @param  {Array} point
     * @return {boolean}
     */
    AABB.prototype.containsPoint = function (point) {
        var l = this.lowerBound, u = this.upperBound;
        return l[0] <= point[0] && point[0] <= u[0] && l[1] <= point[1] && point[1] <= u[1];
    };
    /**
     * Check if the AABB is hit by a ray.
     * @method overlapsRay
     * @param  {Ray} ray
     * @return {number} -1 if no hit, a number between 0 and 1 if hit, indicating the position between the "from" and "to" points.
     * @example
     *     var aabb = new AABB({
     *         upperBound: [1, 1],
     *         lowerBound: [-1, -1]
     *     });
     *     var ray = new Ray({
     *         from: [-2, 0],
     *         to: [0, 0]
     *     });
     *     var fraction = aabb.overlapsRay(ray); // fraction == 0.5
     */
    AABB.prototype.overlapsRay = function (ray) {
        // ray.direction is unit direction vector of ray
        var dirFracX = 1 / ray.direction[0];
        var dirFracY = 1 / ray.direction[1];
        // this.lowerBound is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
        var from = ray.from;
        var lowerBound = this.lowerBound;
        var upperBound = this.upperBound;
        var t1 = (lowerBound[0] - from[0]) * dirFracX;
        var t2 = (upperBound[0] - from[0]) * dirFracX;
        var t3 = (lowerBound[1] - from[1]) * dirFracY;
        var t4 = (upperBound[1] - from[1]) * dirFracY;
        var tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
        var tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
        // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
        if (tmax < 0) {
            //t = tmax;
            return -1;
        }
        // if tmin > tmax, ray doesn't intersect AABB
        if (tmin > tmax) {
            //t = tmax;
            return -1;
        }
        return tmin / ray.length;
    };
    return AABB;
}());
exports.default = AABB;

},{"../math/vec2":28}],2:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var Body_1 = __importDefault(_dereq_("../objects/Body"));
// TODO: I think this is supposed to be abstract.
var Broadphase = /** @class */ (function () {
    /**
     * Base class for broadphase implementations. Don't use this class directly.
     * @class Broadphase
     * @constructor
     */
    function Broadphase(type) {
        /**
         * The resulting overlapping pairs. Will be filled with results during .getCollisionPairs().
         * @property result
         * @type {Array}
         */
        this.result = [];
        /**
         * The world to search for collision pairs in. To change it, use .setWorld()
         * @property world
         * @type {World}
         * @readOnly
         */
        this.world = null;
        /**
         * The bounding volume type to use in the broadphase algorithms. Should be set to Broadphase.AABB or Broadphase.BOUNDING_CIRCLE.
         * @property {Number} boundingVolumeType
         */
        this.boundingVolumeType = Broadphase.AABB;
        this.type = type || 1;
    }
    /**
     * Set the world that we are searching for collision pairs in.
     * @method setWorld
     * @param  {World} world
     */
    // TODO: move to constructor!
    Broadphase.prototype.setWorld = function (world) {
        this.world = world;
    };
    ;
    /*
     * Get all potential intersecting body pairs.
     * @method getCollisionPairs
     * @param  {World} world The world to search in.
     * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
     */
    Broadphase.prototype.getCollisionPairs = function (world) {
        // I guess this should be overridden?
        // TODO: possible abstract method.
        return [];
    };
    ;
    /**
     * Check whether the bounding radius of two bodies overlap.
     * @method  boundingRadiusCheck
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Broadphase.boundingRadiusCheck = function (bodyA, bodyB) {
        var d2 = vec2_1.default.squaredDistance(bodyA.position, bodyB.position), r = bodyA.boundingRadius + bodyB.boundingRadius;
        return d2 <= r * r;
    };
    ;
    /**
     * Check whether the AABB of two bodies overlap.
     * @method  aabbCheck
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Broadphase.aabbCheck = function (bodyA, bodyB) {
        return bodyA.getAABB().overlaps(bodyB.getAABB());
    };
    ;
    /**
     * Check whether the bounding volumes of two bodies overlap.
     * @method  boundingVolumeCheck
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Broadphase.prototype.boundingVolumeCheck = function (bodyA, bodyB) {
        var result;
        switch (this.boundingVolumeType) {
            case Broadphase.BOUNDING_CIRCLE:
                result = Broadphase.boundingRadiusCheck(bodyA, bodyB);
                break;
            case Broadphase.AABB:
                result = Broadphase.aabbCheck(bodyA, bodyB);
                break;
            default:
                throw new Error('Bounding volume type not recognized: ' + this.boundingVolumeType);
        }
        return result;
    };
    ;
    /**
     * Check whether two bodies are allowed to collide at all.
     * @method  canCollide
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Broadphase.canCollide = function (bodyA, bodyB) {
        var KINEMATIC = Body_1.default.KINEMATIC;
        var STATIC = Body_1.default.STATIC;
        var typeA = bodyA.type;
        var typeB = bodyB.type;
        // Cannot collide static bodies
        if (typeA === STATIC && typeB === STATIC) {
            return false;
        }
        // Cannot collide static vs kinematic bodies
        if ((typeA === KINEMATIC && typeB === STATIC) ||
            (typeA === STATIC && typeB === KINEMATIC)) {
            return false;
        }
        // Cannot collide kinematic vs kinematic
        if (typeA === KINEMATIC && typeB === KINEMATIC) {
            return false;
        }
        // Cannot collide both sleeping bodies
        if (bodyA.sleepState === Body_1.default.SLEEPING && bodyB.sleepState === Body_1.default.SLEEPING) {
            return false;
        }
        // Cannot collide if one is static and the other is sleeping
        if ((bodyA.sleepState === Body_1.default.SLEEPING && typeB === STATIC) ||
            (bodyB.sleepState === Body_1.default.SLEEPING && typeA === STATIC)) {
            return false;
        }
        return true;
    };
    ;
    /**
     * Returns all the bodies within an AABB.
     * @method aabbQuery
     * @param  {World} world
     * @param  {AABB} aabb
     * @param {array} result An array to store resulting bodies in.
     * @return {array}
     */
    Broadphase.prototype.aabbQuery = function (world, aabb, result) {
        // To be implemented in subclasses
    };
    ;
    // Mode:
    Broadphase.NAIVE = 1;
    Broadphase.SAP = 2;
    // Bounding box:
    /**
     * Axis aligned bounding box type.
     * @static
     * @property {Number} AABB
     */
    Broadphase.AABB = 1;
    /**
     * Bounding circle type.
     * @static
     * @property {Number} BOUNDING_CIRCLE
     */
    Broadphase.BOUNDING_CIRCLE = 2;
    return Broadphase;
}());
exports.default = Broadphase;

},{"../math/vec2":28,"../objects/Body":29}],3:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var broadphase_1 = __importDefault(_dereq_("./broadphase"));
var NaiveBroadphase = /** @class */ (function (_super) {
    __extends(NaiveBroadphase, _super);
    /**
     * Naive broadphase implementation. Does N^2 tests.
     *
     * @class NaiveBroadphase
     * @constructor
     * @extends Broadphase
     */
    function NaiveBroadphase() {
        return _super.call(this, broadphase_1.default.NAIVE) || this;
    }
    /**
     * Get the colliding pairs
     * @method getCollisionPairs
     * @param  {World} world
     * @return {Array}
     */
    NaiveBroadphase.prototype.getCollisionPairs = function (world) {
        var bodies = world.bodies, result = this.result;
        result.length = 0;
        for (var i = 0, Ncolliding = bodies.length; i !== Ncolliding; i++) {
            var bi = bodies[i];
            for (var j = 0; j < i; j++) {
                var bj = bodies[j];
                if (broadphase_1.default.canCollide(bi, bj) && this.boundingVolumeCheck(bi, bj)) {
                    result.push(bi);
                    result.push(bj);
                }
            }
        }
        return result;
    };
    ;
    /**
     * Returns all the bodies within an AABB.
     * @method aabbQuery
     * @param  {World} world
     * @param  {AABB} aabb
     * @param {array} result An array to store resulting bodies in.
     * @return {array}
     */
    NaiveBroadphase.prototype.aabbQuery = function (world, aabb, result) {
        result = result || [];
        var bodies = world.bodies;
        for (var i = 0; i < bodies.length; i++) {
            var b = bodies[i];
            if (b.aabbNeedsUpdate) {
                b.updateAABB();
            }
            if (b.aabb.overlaps(aabb)) {
                result.push(b);
            }
        }
        return result;
    };
    ;
    return NaiveBroadphase;
}(broadphase_1.default));
exports.default = NaiveBroadphase;

},{"./broadphase":2}],4:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var sub = vec2_1.default.subtract, add = vec2_1.default.add, dot = vec2_1.default.dot, rotate = vec2_1.default.rotate, normalize = vec2_1.default.normalize, copy = vec2_1.default.copy, scale = vec2_1.default.scale, squaredLength = vec2_1.default.squaredLength, createVec2 = vec2_1.default.create;
var Circle_1 = __importDefault(_dereq_("../shapes/Circle"));
var Convex_1 = __importDefault(_dereq_("../shapes/Convex"));
var Box_1 = __importDefault(_dereq_("../shapes/Box"));
var contact_equation_pool_1 = __importDefault(_dereq_("../utils/contact-equation-pool"));
var friction_equation_pool_1 = __importDefault(_dereq_("../utils/friction-equation-pool"));
var tuple_dictionary_1 = __importDefault(_dereq_("../utils/tuple-dictionary"));
var yAxis = vec2_1.default.fromValues(0, 1);
var tmp1 = createVec2(), tmp2 = createVec2(), tmp3 = createVec2(), tmp4 = createVec2(), tmp5 = createVec2(), tmp6 = createVec2(), tmp7 = createVec2(), tmp8 = createVec2(), tmp9 = createVec2(), tmp10 = createVec2(), tmp11 = createVec2(), tmp12 = createVec2(), tmp13 = createVec2(), tmp14 = createVec2(), tmp15 = createVec2(), tmpArray = [];
var findMaxSeparation_n = vec2_1.default.create();
var findMaxSeparation_v1 = vec2_1.default.create();
var findMaxSeparation_tmp = vec2_1.default.create();
var findMaxSeparation_tmp2 = vec2_1.default.create();
var findIncidentEdge_normal1 = vec2_1.default.create();
var collidePolygons_tempVec = vec2_1.default.create();
var collidePolygons_tmpVec = vec2_1.default.create();
var collidePolygons_localTangent = vec2_1.default.create();
var collidePolygons_localNormal = vec2_1.default.create();
var collidePolygons_planePoint = vec2_1.default.create();
var collidePolygons_tangent = vec2_1.default.create();
var collidePolygons_normal = vec2_1.default.create();
var collidePolygons_negativeTangent = vec2_1.default.create();
var collidePolygons_v11 = vec2_1.default.create();
var collidePolygons_v12 = vec2_1.default.create();
var collidePolygons_dist = vec2_1.default.create();
var collidePolygons_clipPoints1 = [vec2_1.default.create(), vec2_1.default.create()];
var collidePolygons_clipPoints2 = [vec2_1.default.create(), vec2_1.default.create()];
var collidePolygons_incidentEdge = [vec2_1.default.create(), vec2_1.default.create()];
var pic_localPoint = createVec2(), pic_r0 = createVec2(), pic_r1 = createVec2();
var bodiesOverlap_shapePositionA = createVec2(), bodiesOverlap_shapePositionB = createVec2();
var capsuleCapsule_tempVec1 = createVec2(), capsuleCapsule_tempVec2 = createVec2();
var convexCapsule_tempVec = createVec2();
var planeCapsule_tmp1 = createVec2(), planeCapsule_tmp2 = createVec2();
var circleHeightfield_candidate = createVec2(), circleHeightfield_dist = createVec2(), circleHeightfield_v0 = createVec2(), circleHeightfield_v1 = createVec2(), circleHeightfield_minCandidate = createVec2(), circleHeightfield_worldNormal = createVec2(), circleHeightfield_minCandidateNormal = createVec2();
var convexHeightfield_v0 = createVec2(), convexHeightfield_v1 = createVec2(), convexHeightfield_tilePos = createVec2(), convexHeightfield_tempConvexShape = new Convex_1.default(undefined, [createVec2(), createVec2(), createVec2(), createVec2()]);
function setConvexToCapsuleShapeMiddle(convexShape, capsuleShape) {
    var capsuleRadius = capsuleShape.radius;
    var halfCapsuleLength = capsuleShape.length * 0.5;
    var verts = convexShape.vertices;
    vec2_1.default.set(verts[0], -halfCapsuleLength, -capsuleRadius);
    vec2_1.default.set(verts[1], halfCapsuleLength, -capsuleRadius);
    vec2_1.default.set(verts[2], halfCapsuleLength, capsuleRadius);
    vec2_1.default.set(verts[3], -halfCapsuleLength, capsuleRadius);
}
/*
* Check if a point is in a polygon
*/
function pointInConvex(worldPoint, convexShape, convexOffset, convexAngle) {
    var localPoint = pic_localPoint, r0 = pic_r0, r1 = pic_r1, verts = convexShape.vertices, lastCross = null;
    vec2_1.default.toLocalFrame(localPoint, worldPoint, convexOffset, convexAngle);
    for (var i = 0, numVerts = verts.length; i !== numVerts + 1; i++) {
        var v0 = verts[i % numVerts], v1 = verts[(i + 1) % numVerts];
        sub(r0, v0, localPoint);
        sub(r1, v1, localPoint);
        var cross = vec2_1.default.crossLength(r0, r1);
        if (lastCross === null) {
            lastCross = cross;
        }
        // If we got a different sign of the distance vector, the point is out of the polygon
        if (cross * lastCross < 0) {
            return false;
        }
        lastCross = cross;
    }
    return true;
}
/*
* Check if a point is in a polygon
*/
function pointInConvexLocal(localPoint, convexShape) {
    var r0 = pic_r0, r1 = pic_r1, verts = convexShape.vertices, lastCross = null, numVerts = verts.length;
    for (var i = 0; i < numVerts + 1; i++) {
        var v0 = verts[i % numVerts], v1 = verts[(i + 1) % numVerts];
        sub(r0, v0, localPoint);
        sub(r1, v1, localPoint);
        var cross = vec2_1.default.crossLength(r0, r1);
        if (lastCross === null) {
            lastCross = cross;
        }
        // If we got a different sign of the distance vector, the point is out of the polygon
        if (cross * lastCross < 0) {
            return false;
        }
        lastCross = cross;
    }
    return true;
}
function addSub(out, a, b, c) {
    out[0] = a[0] + b[0] - c[0];
    out[1] = a[1] + b[1] - c[1];
}
function findMaxSeparation(maxSeparationOut, poly1, position1, angle1, poly2, position2, angle2) {
    // Find the max separation between poly1 and poly2 using edge normals from poly1.
    var count1 = poly1.vertices.length;
    var count2 = poly2.vertices.length;
    var n1s = poly1.normals;
    var v1s = poly1.vertices;
    var v2s = poly2.vertices;
    var n = findMaxSeparation_n;
    var v1 = findMaxSeparation_v1;
    var tmp = findMaxSeparation_tmp;
    var tmp2 = findMaxSeparation_tmp2;
    var angle = angle1 - angle2;
    var bestIndex = 0;
    var maxSeparation = -Infinity;
    for (var i = 0; i < count1; ++i) {
        // Get poly1 normal in frame2.
        vec2_1.default.rotate(n, n1s[i], angle);
        // Get poly1 vertex in frame2
        vec2_1.default.toGlobalFrame(tmp2, v1s[i], position1, angle1);
        vec2_1.default.toLocalFrame(v1, tmp2, position2, angle2);
        // Find deepest point for normal i.
        var si = Infinity;
        for (var j = 0; j < count2; ++j) {
            vec2_1.default.subtract(tmp, v2s[j], v1);
            var sij = vec2_1.default.dot(n, tmp);
            if (sij < si) {
                si = sij;
            }
        }
        if (si > maxSeparation) {
            maxSeparation = si;
            bestIndex = i;
        }
    }
    // Use a vec2 for storing the float value and always return int, for perf
    maxSeparationOut[0] = maxSeparation;
    return bestIndex;
}
function findIncidentEdge(clipVerticesOut, poly1, position1, angle1, edge1, poly2, position2, angle2) {
    var normals1 = poly1.normals;
    var count2 = poly2.vertices.length;
    var vertices2 = poly2.vertices;
    var normals2 = poly2.normals;
    // Get the normal of the reference edge in poly2's frame.
    var normal1 = findIncidentEdge_normal1;
    vec2_1.default.rotate(normal1, normals1[edge1], angle1 - angle2);
    // Find the incident edge on poly2.
    var index = 0;
    var minDot = Infinity;
    for (var i = 0; i < count2; ++i) {
        var dot_1 = vec2_1.default.dot(normal1, normals2[i]);
        if (dot_1 < minDot) {
            minDot = dot_1;
            index = i;
        }
    }
    // Build the clip vertices for the incident edge.
    var i1 = index;
    var i2 = i1 + 1 < count2 ? i1 + 1 : 0;
    vec2_1.default.toGlobalFrame(clipVerticesOut[0], vertices2[i1], position2, angle2);
    vec2_1.default.toGlobalFrame(clipVerticesOut[1], vertices2[i2], position2, angle2);
}
function clipSegmentToLine(vOut, vIn, normal, offset) {
    // Start with no output points
    var numOut = 0;
    // Calculate the distance of end points to the line
    var distance0 = vec2_1.default.dot(normal, vIn[0]) - offset;
    var distance1 = vec2_1.default.dot(normal, vIn[1]) - offset;
    // If the points are behind the plane
    if (distance0 <= 0.0) {
        vec2_1.default.copy(vOut[numOut++], vIn[0]);
    }
    if (distance1 <= 0.0) {
        vec2_1.default.copy(vOut[numOut++], vIn[1]);
    }
    // If the points are on different sides of the plane
    if (distance0 * distance1 < 0.0) {
        // Find intersection point of edge and plane
        var interp = distance0 / (distance0 - distance1);
        var v = vOut[numOut];
        vec2_1.default.subtract(v, vIn[1], vIn[0]);
        vec2_1.default.scale(v, v, interp);
        vec2_1.default.add(v, v, vIn[0]);
        ++numOut;
    }
    return numOut;
}
var Narrowphase = /** @class */ (function () {
    /**
     * Narrowphase. Creates contacts and friction given shapes and transforms.
     * @class Narrowphase
     * @constructor
     */
    function Narrowphase() {
        /**
         * @property contactEquations
         * @type {Array}
         */
        this.contactEquations = [];
        /**
         * @property frictionEquations
         * @type {Array}
         */
        this.frictionEquations = [];
        /**
         * Whether to make friction equations in the upcoming contacts.
         * @property enableFriction
         * @type {Boolean}
         */
        this.enableFriction = true;
        /**
         * Whether to make equations enabled in upcoming contacts.
         * @property enabledEquations
         * @type {Boolean}
         */
        this.enabledEquations = true;
        /**
         * The friction slip force to use when creating friction equations.
         * @property slipForce
         * @type {Number}
         */
        this.slipForce = 10.0;
        /**
         * Keeps track of the allocated ContactEquations.
         * @property {ContactEquationPool} contactEquationPool
         *
         * @example
         *
         *     // Allocate a few equations before starting the simulation.
         *     // This way, no contact objects need to be created on the fly in the game loop.
         *     world.narrowphase.contactEquationPool.resize(1024);
         *     world.narrowphase.frictionEquationPool.resize(1024);
         */
        this.contactEquationPool = new contact_equation_pool_1.default({ size: 32 });
        /**
         * Keeps track of the allocated ContactEquations.
         * @property {FrictionEquationPool} frictionEquationPool
         */
        this.frictionEquationPool = new friction_equation_pool_1.default({ size: 64 });
        /**
         * Enable reduction of friction equations. If disabled, a box on a plane will generate 2 contact equations and 2 friction equations. If enabled, there will be only one friction equation. Same kind of simplifications are made  for all collision types.
         * @property enableFrictionReduction
         * @type {Boolean}
         * @deprecated This flag will be removed when the feature is stable enough.
         * @default true
         */
        this.enableFrictionReduction = true;
        /**
         * Keeps track of the colliding bodies last step.
         * @private
         * @property collidingBodiesLastStep
         * @type {TupleDictionary}
         */
        this.collidingBodiesLastStep = new tuple_dictionary_1.default();
        /**
         * @property currentContactMaterial
         * @type {ContactMaterial}
         */
        this.currentContactMaterial = null;
    }
    /**
     * @method bodiesOverlap
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @param  {boolean} [checkCollisionMasks=false]
     * @return {Boolean}
     */
    Narrowphase.prototype.bodiesOverlap = function (bodyA, bodyB, checkCollisionMasks) {
        if (checkCollisionMasks === void 0) { checkCollisionMasks = false; }
        var shapePositionA = bodiesOverlap_shapePositionA;
        var shapePositionB = bodiesOverlap_shapePositionB;
        // Loop over all shapes of bodyA
        for (var k = 0, Nshapesi = bodyA.shapes.length; k !== Nshapesi; k++) {
            var shapeA = bodyA.shapes[k];
            // All shapes of body j
            for (var l = 0, Nshapesj = bodyB.shapes.length; l !== Nshapesj; l++) {
                var shapeB = bodyB.shapes[l];
                // Check collision groups and masks
                if (checkCollisionMasks && !((shapeA.collisionGroup & shapeB.collisionMask) !== 0 && (shapeB.collisionGroup & shapeA.collisionMask) !== 0)) {
                    return false;
                }
                bodyA.toWorldFrame(shapePositionA, shapeA.position);
                bodyB.toWorldFrame(shapePositionB, shapeB.position);
                var result = this.testContact(bodyA, shapeA, shapePositionA, bodyB, shapeB, shapePositionB, true);
                if (result)
                    return true;
            }
        }
        return false;
    };
    ;
    /**
     * Check if the bodies were in contact since the last reset().
     * @method collidedLastStep
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Narrowphase.prototype.collidedLastStep = function (bodyA, bodyB) {
        var id1 = bodyA.id | 0, id2 = bodyB.id | 0;
        return !!this.collidingBodiesLastStep.get(id1, id2);
    };
    ;
    /**
     * Throws away the old equations and gets ready to create new
     * @method reset
     */
    Narrowphase.prototype.reset = function () {
        this.collidingBodiesLastStep.reset();
        var eqs = this.contactEquations;
        var l = eqs.length;
        while (l--) {
            var eq = eqs[l], id1 = eq.bodyA.id, id2 = eq.bodyB.id;
            this.collidingBodiesLastStep.set(id1, id2, 1);
        }
        var ce = this.contactEquations, fe = this.frictionEquations;
        for (var i = 0; i < ce.length; i++) {
            this.contactEquationPool.release(ce[i]);
        }
        for (var i = 0; i < fe.length; i++) {
            this.frictionEquationPool.release(fe[i]);
        }
        // Reset
        this.contactEquations.length = this.frictionEquations.length = 0;
    };
    ;
    /**
     * Creates a ContactEquation, either by reusing an existing object or creating a new one.
     * @method createContactEquation
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {ContactEquation}
     */
    Narrowphase.prototype.createContactEquation = function (bodyA, bodyB, shapeA, shapeB) {
        var c = this.contactEquationPool.get();
        var currentContactMaterial = this.currentContactMaterial;
        c.bodyA = bodyA;
        c.bodyB = bodyB;
        c.shapeA = shapeA;
        c.shapeB = shapeB;
        c.enabled = this.enabledEquations;
        c.firstImpact = !this.collidedLastStep(bodyA, bodyB);
        c.restitution = currentContactMaterial.restitution;
        c.stiffness = currentContactMaterial.stiffness;
        c.relaxation = currentContactMaterial.relaxation;
        c.offset = currentContactMaterial.contactSkinSize;
        c.needsUpdate = true;
        return c;
    };
    ;
    /**
     * Creates a FrictionEquation, either by reusing an existing object or creating a new one.
     * @method createFrictionEquation
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {FrictionEquation}
     */
    Narrowphase.prototype.createFrictionEquation = function (bodyA, bodyB, shapeA, shapeB) {
        var c = this.frictionEquationPool.get();
        var currentContactMaterial = this.currentContactMaterial;
        c.bodyA = bodyA;
        c.bodyB = bodyB;
        c.shapeA = shapeA;
        c.shapeB = shapeB;
        c.setSlipForce(this.slipForce);
        c.enabled = this.enabledEquations;
        c.frictionCoefficient = currentContactMaterial.friction;
        c.relativeVelocity = currentContactMaterial.surfaceVelocity;
        c.stiffness = currentContactMaterial.frictionStiffness;
        c.relaxation = currentContactMaterial.frictionRelaxation;
        c.needsUpdate = true;
        c.contactEquations.length = 0;
        return c;
    };
    ;
    /**
     * Creates a FrictionEquation given the data in the ContactEquation. Uses same offset vectors ri and rj, but the tangent vector will be constructed from the collision normal.
     * @method createFrictionFromContact
     * @param  {ContactEquation} contactEquation
     * @return {FrictionEquation}
     */
    Narrowphase.prototype.createFrictionFromContact = function (c) {
        var eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
        copy(eq.contactPointA, c.contactPointA);
        copy(eq.contactPointB, c.contactPointB);
        vec2_1.default.rotate90cw(eq.t, c.normalA);
        eq.contactEquations.push(c);
        return eq;
    };
    ;
    // Take the average N latest contact point on the plane.
    Narrowphase.prototype.createFrictionFromAverage = function (numContacts) {
        var c = this.contactEquations[this.contactEquations.length - 1];
        var eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
        var bodyA = c.bodyA;
        vec2_1.default.set(eq.contactPointA, 0, 0);
        vec2_1.default.set(eq.contactPointB, 0, 0);
        vec2_1.default.set(eq.t, 0, 0);
        for (var i = 0; i < numContacts; i++) {
            c = this.contactEquations[this.contactEquations.length - 1 - i];
            if (c.bodyA === bodyA) {
                add(eq.t, eq.t, c.normalA);
                add(eq.contactPointA, eq.contactPointA, c.contactPointA);
                add(eq.contactPointB, eq.contactPointB, c.contactPointB);
            }
            else {
                sub(eq.t, eq.t, c.normalA);
                add(eq.contactPointA, eq.contactPointA, c.contactPointB);
                add(eq.contactPointB, eq.contactPointB, c.contactPointA);
            }
            eq.contactEquations.push(c);
        }
        var invNumContacts = 1 / numContacts;
        scale(eq.contactPointA, eq.contactPointA, invNumContacts);
        scale(eq.contactPointB, eq.contactPointB, invNumContacts);
        normalize(eq.t, eq.t);
        vec2_1.default.rotate90cw(eq.t, eq.t);
        return eq;
    };
    ;
    Narrowphase.prototype.testContact = function (bodyA, shapeA, offsetA, bodyB, shapeB, offsetB, justTest
    // meta?: {
    // 	radiusA?: f32,
    // 	radiusB?: f32
    // }
    ) {
        var result = 0;
        if (shapeA.type > shapeB.type) {
            var bTmp = bodyB;
            bodyB = bodyA;
            bodyA = bTmp;
            var sTmp = shapeB;
            shapeB = shapeA;
            shapeA = sTmp;
            var pTmp = offsetB;
            offsetB = offsetA;
            offsetA = pTmp;
        }
        switch (shapeA.type | shapeB.type) {
            case 1: { // Circle/circle
                var sa = shapeA;
                var sb = shapeB;
                result = this.circleCircle(bodyA, sa, offsetA, bodyB, sb, offsetB, justTest, sa.radius, sb.radius);
                break;
            }
            case 3: { // Particle/circle.
                var sa = shapeA;
                var sb = shapeB;
                result = this.circleParticle(bodyA, sa, offsetA, bodyB, sb, offsetB, justTest);
                break;
            }
            case 5: { // Plane/circle.
                var sa = shapeA;
                var sb = shapeB;
                result = this.circlePlane(bodyA, sa, offsetA, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 33: // Box/circle.
            case 9: { // Convex/circle.
                var sa = shapeA;
                var sb = shapeB;
                result = this.circleConvex(bodyA, sa, offsetA, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest, sa.radius);
                break;
            }
            case 17: { // Line/circle.
                var sa = shapeA;
                var sb = shapeB;
                result = this.circleLine(bodyA, sa, offsetA, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest, 0, sa.radius);
                break;
            }
            case 65: { // Capsule/circle.
                var sa = shapeA;
                var sb = shapeB;
                result = this.circleCapsule(bodyA, sa, offsetA, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 129: { // Heightfield/circle.
                var sa = shapeA;
                var sb = shapeB;
                result = this.circleHeightfield(bodyA, sa, offsetA, bodyB, sb, offsetB, justTest, sa.radius);
                break;
            }
            case 6: { // Plane/particle.
                var sa = shapeA;
                var sb = shapeB;
                result = this.particlePlane(bodyA, sa, offsetA, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 34: // Box/particle.
            case 10: { // Convex/particle.
                var sa = shapeA;
                var sb = shapeB;
                result = this.particleConvex(bodyA, sa, offsetA, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 10: { // Capsule/particle.
                var sa = shapeA;
                var sb = shapeB;
                result = this.particleCapsule(bodyA, sa, offsetA, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 36: // Box/plane.
            case 12: { // Convex/plane.
                var sa = shapeA;
                var sb = shapeB;
                result = this.planeConvex(bodyA, sa, offsetA, bodyA.angle + sa.angle, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 20: { // Line/plane.
                var sa = shapeA;
                var sb = shapeB;
                result = this.planeLine(bodyA, sa, offsetA, bodyA.angle + sa.angle, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 68: { // Capsule/plane.
                var sa = shapeA;
                var sb = shapeB;
                result = this.planeCapsule(bodyA, sa, offsetA, bodyA.angle + sa.angle, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 40: // Box/convex.
            case 8: { // Convex/convex.
                var sa = shapeA;
                var sb = shapeB;
                result = this.convexConvex(bodyA, sa, offsetA, bodyA.angle + sa.angle, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 24: { // Line/convex.
                var sa = shapeA;
                var sb = shapeB;
                // NOT SUPPORTED!
                // result = this.convexLine(bodyA, sa, offsetA, bodyA.angle + sa.angle,
                // 	bodyB, sb, offsetB, bodyB.angle + sb.angle, 
                // 	justTest);
                break;
            }
            case 72: { // Capsule/convex.
                var sa = shapeA;
                var sb = shapeB;
                result = this.convexCapsule(bodyA, sa, offsetA, bodyA.angle + sa.angle, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
            case 136: { // Heightfield/convex.
                var sa = shapeA;
                var sb = shapeB;
                result = this.convexHeightfield(bodyA, sa, offsetA, bodyA.angle + sa.angle, bodyB, sb, offsetB, justTest);
                break;
            }
            case 16: { // Line/line.
                var sa = shapeA;
                var sb = shapeB;
                // NOT SUPPORTED!
                // result = this.lineLine(bodyA, sa, shapePositionA, bodyA.angle + sa.angle,
                // 	bodyB, sb, offsetB, bodyB.angle + sb.angle,
                // 	justTest);
                break;
            }
            case 48: { // Box/line.
                var sa = shapeA;
                var sb = shapeB;
                // NOT SUPPORTED!
                // result = this.lineBox(bodyA, sa, shapePositionA, bodyA.angle + sa.angle,
                // 	bodyB, sb, offsetB, bodyB.angle + sb.angle,
                // 	justTest);
                break;
            }
            case 80: { // Capsule/line.
                var sa = shapeA;
                var sb = shapeB;
                // NOT SUPPORTED!
                // result = this.lineCapsule(bodyA, sa, shapePositionA, bodyA.angle + sa.angle,
                // 	bodyB, sb, offsetB, bodyB.angle + sb.angle,
                // 	justTest);
                break;
            }
            case 64: { // Capsule/capsule.
                var sa = shapeA;
                var sb = shapeB;
                result = this.capsuleCapsule(bodyA, sa, offsetA, bodyA.angle + sa.angle, bodyB, sb, offsetB, bodyB.angle + sb.angle, justTest);
                break;
            }
        }
        return result;
    };
    /**
     * Convex/line narrowphase
     * @method convexLine
     * @param  {Body}       convexBody
     * @param  {Convex}     convexShape
     * @param  {Array}      convexOffset
     * @param  {Number}     convexAngle
     * @param  {Body}       lineBody
     * @param  {Line}       lineShape
     * @param  {Array}      lineOffset
     * @param  {Number}     lineAngle
     * @param {boolean}     justTest
     * @return {number}
     * @todo Implement me!
     */
    //Narrowphase.prototype[Shape.CONVEX | Shape.LINE] =
    Narrowphase.prototype.convexLine = function (
    /*
    convexBody,
    convexShape,
    convexOffset,
    convexAngle,
    lineBody,
    lineShape,
    lineOffset,
    lineAngle,
    justTest
    */
    ) {
        // TODO
        return 0;
    };
    ;
    /**
     * Line/box narrowphase
     * @method lineBox
     * @param  {Body}       lineBody
     * @param  {Line}       lineShape
     * @param  {Array}      lineOffset
     * @param  {Number}     lineAngle
     * @param  {Body}       boxBody
     * @param  {Box}  boxShape
     * @param  {Array}      boxOffset
     * @param  {Number}     boxAngle
     * @param  {Boolean}    justTest
     * @return {number}
     * @todo Implement me!
     */
    //Narrowphase.prototype[Shape.LINE | Shape.BOX] =
    Narrowphase.prototype.lineBox = function (
    /*
    lineBody,
    lineShape,
    lineOffset,
    lineAngle,
    boxBody,
    boxShape,
    boxOffset,
    boxAngle,
    justTest
    */
    ) {
        // TODO
        return 0;
    };
    ;
    /**
     * Convex/capsule narrowphase
     * @method convexCapsule
     * @param  {Body}       convexBody
     * @param  {Convex}     convexShape
     * @param  {Array}      convexPosition
     * @param  {Number}     convexAngle
     * @param  {Body}       capsuleBody
     * @param  {Capsule}    capsuleShape
     * @param  {Array}      capsulePosition
     * @param  {Number}     capsuleAngle
     * @return {number}
     */
    //Narrowphase.prototype[Shape.CONVEX | Shape.CAPSULE] =
    //Narrowphase.prototype[Shape.BOX | Shape.CAPSULE] =
    Narrowphase.prototype.convexCapsule = function (convexBody, convexShape, convexPosition, convexAngle, capsuleBody, capsuleShape, capsulePosition, capsuleAngle, justTest) {
        var convexCapsule_tempRect = new Box_1.default({ width: 1, height: 1 });
        // Check the circles
        // Add offsets!
        var circlePos = convexCapsule_tempVec;
        var halfLength = capsuleShape.length / 2;
        vec2_1.default.set(circlePos, halfLength, 0);
        vec2_1.default.toGlobalFrame(circlePos, circlePos, capsulePosition, capsuleAngle);
        var result1 = this.circleConvex(capsuleBody, capsuleShape, circlePos, convexBody, convexShape, convexPosition, convexAngle, justTest, capsuleShape.radius);
        vec2_1.default.set(circlePos, -halfLength, 0);
        vec2_1.default.toGlobalFrame(circlePos, circlePos, capsulePosition, capsuleAngle);
        var result2 = this.circleConvex(capsuleBody, capsuleShape, circlePos, convexBody, convexShape, convexPosition, convexAngle, justTest, capsuleShape.radius);
        if (justTest && (result1 + result2) !== 0) {
            return 1;
        }
        // Check center rect
        var r = convexCapsule_tempRect;
        setConvexToCapsuleShapeMiddle(r, capsuleShape);
        var result = this.convexConvex(convexBody, convexShape, convexPosition, convexAngle, capsuleBody, r, capsulePosition, capsuleAngle, justTest);
        return result + result1 + result2;
    };
    ;
    /**
     * Capsule/line narrowphase
     * @method lineCapsule
     * @param  {Body}       lineBody
     * @param  {Line}       lineShape
     * @param  {Array}      linePosition
     * @param  {Number}     lineAngle
     * @param  {Body}       capsuleBody
     * @param  {Capsule}    capsuleShape
     * @param  {Array}      capsulePosition
     * @param  {Number}     capsuleAngle
     * @return {number}
     * @todo Implement me!
     */
    //Narrowphase.prototype[Shape.LINE | Shape.CAPSULE] =
    Narrowphase.prototype.lineCapsule = function (
    /*
    lineBody,
    lineShape,
    linePosition,
    lineAngle,
    capsuleBody,
    capsuleShape,
    capsulePosition,
    capsuleAngle,
    justTest
    */
    ) {
        // TODO
        return 0;
    };
    ;
    /**
     * Capsule/capsule narrowphase
     * @method capsuleCapsule
     * @param  {Body}       bi
     * @param  {Capsule}    si
     * @param  {Array}      xi
     * @param  {Number}     ai
     * @param  {Body}       bj
     * @param  {Capsule}    sj
     * @param  {Array}      xj
     * @param  {Number}     aj
     */
    //Narrowphase.prototype[Shape.CAPSULE] =
    Narrowphase.prototype.capsuleCapsule = function (bi, si, xi, ai, bj, sj, xj, aj, justTest) {
        throw "Capsule-capsule collisions are not currently supported.";
        return 0;
        // let capsuleCapsule_tempRect1 = new Box({ width: 1, height: 1 });
        // let enableFrictionBefore: boolean = false;
        // // Check the circles
        // // Add offsets!
        // let circlePosi = capsuleCapsule_tempVec1,
        // 	circlePosj = capsuleCapsule_tempVec2;
        // let numContacts = 0;
        // // Need 4 circle checks, between all
        // for(let i=0; i<2; i++){
        // 	vec2.set(circlePosi,(i===0?-1:1)*si.length/2,0);
        // 	vec2.toGlobalFrame(circlePosi, circlePosi, xi, ai);
        // 	for(let j=0; j<2; j++){
        // 		vec2.set(circlePosj,(j===0?-1:1)*sj.length/2, 0);
        // 		vec2.toGlobalFrame(circlePosj, circlePosj, xj, aj);
        // 		// Temporarily turn off friction
        // 		if(this.enableFrictionReduction){
        // 			enableFrictionBefore = this.enableFriction;
        // 			this.enableFriction = false;
        // 		}
        // 		let result = this.circleCircle(bi,si,circlePosi, bj,sj,circlePosj, justTest, si.radius, sj.radius);
        // 		if(this.enableFrictionReduction){
        // 			this.enableFriction = enableFrictionBefore;
        // 		}
        // 		if(justTest && result !== 0){
        // 			return 1;
        // 		}
        // 		numContacts += result;
        // 	}
        // }
        // if(this.enableFrictionReduction){
        // 	// Temporarily turn off friction
        // 	enableFrictionBefore = this.enableFriction;
        // 	this.enableFriction = false;
        // }
        // // Check circles against the center boxs
        // let rect = capsuleCapsule_tempRect1;
        // setConvexToCapsuleShapeMiddle(rect,si);
        // let result1 = this.convexCapsule(bi,rect,xi,ai, bj,sj,xj,aj, justTest);
        // if(this.enableFrictionReduction){
        // 	this.enableFriction = enableFrictionBefore;
        // }
        // if(justTest && result1 !== 0){
        // 	return 1;
        // }
        // numContacts += result1;
        // if(this.enableFrictionReduction){
        // 	// Temporarily turn off friction
        // 	let enableFrictionBefore = this.enableFriction;
        // 	this.enableFriction = false;
        // }
        // setConvexToCapsuleShapeMiddle(rect,sj);
        // let result2 = this.convexCapsule(bj,rect,xj,aj, bi,si,xi,ai, justTest);
        // if(this.enableFrictionReduction){
        // 	this.enableFriction = enableFrictionBefore;
        // }
        // if(justTest && result2 !== 0){
        // 	return 1;
        // }
        // numContacts += result2;
        // if(this.enableFrictionReduction){
        // 	if(numContacts && this.enableFriction){
        // 		this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
        // 	}
        // }
        // return numContacts;
    };
    ;
    /**
     * Line/line narrowphase
     * @method lineLine
     * @param  {Body}       bodyA
     * @param  {Line}       shapeA
     * @param  {Array}      positionA
     * @param  {Number}     angleA
     * @param  {Body}       bodyB
     * @param  {Line}       shapeB
     * @param  {Array}      positionB
     * @param  {Number}     angleB
     * @return {number}
     * @todo Implement me!
     */
    //Narrowphase.prototype[Shape.LINE] =
    Narrowphase.prototype.lineLine = function (
    /* bodyA,
        shapeA,
        positionA,
        angleA,
        bodyB,
        shapeB,
        positionB,
        angleB,
        justTest*/
    ) {
        // TODO
        return 0;
    };
    ;
    /**
     * Plane/line Narrowphase
     * @method planeLine
     * @param  {Body}   planeBody
     * @param  {Plane}  planeShape
     * @param  {Array}  planeOffset
     * @param  {Number} planeAngle
     * @param  {Body}   lineBody
     * @param  {Line}   lineShape
     * @param  {Array}  lineOffset
     * @param  {Number} lineAngle
     */
    //Narrowphase.prototype[Shape.PLANE | Shape.LINE] =
    Narrowphase.prototype.planeLine = function (planeBody, planeShape, planeOffset, planeAngle, lineBody, lineShape, lineOffset, lineAngle, justTest) {
        var worldVertex0 = tmp1, worldVertex1 = tmp2, worldVertex01 = tmp3, worldVertex11 = tmp4, worldEdge = tmp5, worldEdgeUnit = tmp6, dist = tmp7, worldNormal = tmp8, worldTangent = tmp9, verts = tmpArray, numContacts = 0;
        // Get start and end points
        vec2_1.default.set(worldVertex0, -lineShape.length / 2, 0);
        vec2_1.default.set(worldVertex1, lineShape.length / 2, 0);
        // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
        vec2_1.default.toGlobalFrame(worldVertex01, worldVertex0, lineOffset, lineAngle);
        vec2_1.default.toGlobalFrame(worldVertex11, worldVertex1, lineOffset, lineAngle);
        copy(worldVertex0, worldVertex01);
        copy(worldVertex1, worldVertex11);
        // Get vector along the line
        sub(worldEdge, worldVertex1, worldVertex0);
        normalize(worldEdgeUnit, worldEdge);
        // Get tangent to the edge.
        vec2_1.default.rotate90cw(worldTangent, worldEdgeUnit);
        rotate(worldNormal, yAxis, planeAngle);
        // Check line ends
        verts[0] = worldVertex0;
        verts[1] = worldVertex1;
        for (var i = 0; i < verts.length; i++) {
            var v = verts[i];
            sub(dist, v, planeOffset);
            var d = dot(dist, worldNormal);
            if (d < 0) {
                if (justTest) {
                    return 1;
                }
                var c = this.createContactEquation(planeBody, lineBody, planeShape, lineShape);
                numContacts++;
                copy(c.normalA, worldNormal);
                normalize(c.normalA, c.normalA);
                // distance vector along plane normal
                scale(dist, worldNormal, d);
                // Vector from plane center to contact
                sub(c.contactPointA, v, dist);
                sub(c.contactPointA, c.contactPointA, planeBody.position);
                // From line center to contact
                sub(c.contactPointB, v, lineOffset);
                add(c.contactPointB, c.contactPointB, lineOffset);
                sub(c.contactPointB, c.contactPointB, lineBody.position);
                this.contactEquations.push(c);
                if (!this.enableFrictionReduction) {
                    if (this.enableFriction) {
                        this.frictionEquations.push(this.createFrictionFromContact(c));
                    }
                }
            }
        }
        if (justTest) {
            return 0;
        }
        if (!this.enableFrictionReduction) {
            if (numContacts && this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
            }
        }
        return numContacts;
    };
    ;
    //Narrowphase.prototype[Shape.PARTICLE | Shape.CAPSULE] =
    Narrowphase.prototype.particleCapsule = function (particleBody, particleShape, particlePosition, capsuleBody, capsuleShape, capsulePosition, capsuleAngle, justTest) {
        return this.circleLine(particleBody, particleShape, particlePosition, capsuleBody, capsuleShape, capsulePosition, capsuleAngle, justTest, capsuleShape.radius, 0);
    };
    ;
    /**
     * Circle/line Narrowphase
     * @method circleLine
     * @param  {Body} circleBody
     * @param  {Circle} circleShape
     * @param  {Array} circleOffset
     * @param  {Body} lineBody
     * @param  {Line} lineShape
     * @param  {Array} lineOffset
     * @param  {Number} lineAngle
     * @param {Boolean} justTest If set to true, this function will return the result (intersection or not) without adding equations.
     * @param {Number} lineRadius Radius to add to the line. Can be used to test Capsules.
     * @param {Number} circleRadius If set, this value overrides the circle shape radius.
     * @return {number}
     */
    //Narrowphase.prototype[Shape.CIRCLE | Shape.LINE] =
    Narrowphase.prototype.circleLine = function (circleBody, circleShape, circleOffset, 
    //circleAngle: f32,
    lineBody, lineShape, lineOffset, lineAngle, justTest, lineRadius, circleRadius) {
        lineRadius = lineRadius !== null && lineRadius !== void 0 ? lineRadius : 0;
        var orthoDist = tmp1;
        var lineToCircleOrthoUnit = tmp2;
        var projectedPoint = tmp3;
        var centerDist = tmp4;
        var worldTangent = tmp5;
        var worldEdge = tmp6;
        var worldEdgeUnit = tmp7;
        var worldVertex0 = tmp8;
        var worldVertex1 = tmp9;
        var worldVertex01 = tmp10;
        var worldVertex11 = tmp11;
        var dist = tmp12;
        var lineToCircle = tmp13;
        var lineEndToLineRadius = tmp14;
        var verts = tmpArray;
        var halfLineLength = lineShape.length / 2;
        // Get start and end points
        vec2_1.default.set(worldVertex0, -halfLineLength, 0);
        vec2_1.default.set(worldVertex1, halfLineLength, 0);
        // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
        vec2_1.default.toGlobalFrame(worldVertex01, worldVertex0, lineOffset, lineAngle);
        vec2_1.default.toGlobalFrame(worldVertex11, worldVertex1, lineOffset, lineAngle);
        copy(worldVertex0, worldVertex01);
        copy(worldVertex1, worldVertex11);
        // Get vector along the line
        sub(worldEdge, worldVertex1, worldVertex0);
        normalize(worldEdgeUnit, worldEdge);
        // Get tangent to the edge.
        vec2_1.default.rotate90cw(worldTangent, worldEdgeUnit);
        // Check distance from the plane spanned by the edge vs the circle
        sub(dist, circleOffset, worldVertex0);
        var d = dot(dist, worldTangent); // Distance from center of line to circle center
        sub(centerDist, worldVertex0, lineOffset);
        sub(lineToCircle, circleOffset, lineOffset);
        var radiusSum = circleRadius + lineRadius;
        if (Math.abs(d) < radiusSum) {
            // Now project the circle onto the edge
            scale(orthoDist, worldTangent, d);
            sub(projectedPoint, circleOffset, orthoDist);
            // Add the missing line radius
            scale(lineToCircleOrthoUnit, worldTangent, dot(worldTangent, lineToCircle));
            normalize(lineToCircleOrthoUnit, lineToCircleOrthoUnit);
            scale(lineToCircleOrthoUnit, lineToCircleOrthoUnit, lineRadius);
            add(projectedPoint, projectedPoint, lineToCircleOrthoUnit);
            // Check if the point is within the edge span
            var pos = dot(worldEdgeUnit, projectedPoint);
            var pos0 = dot(worldEdgeUnit, worldVertex0);
            var pos1 = dot(worldEdgeUnit, worldVertex1);
            if (pos > pos0 && pos < pos1) {
                // We got contact!
                if (justTest) {
                    return 1;
                }
                var c = this.createContactEquation(circleBody, lineBody, circleShape, lineShape);
                scale(c.normalA, orthoDist, -1);
                normalize(c.normalA, c.normalA);
                scale(c.contactPointA, c.normalA, circleRadius);
                add(c.contactPointA, c.contactPointA, circleOffset);
                sub(c.contactPointA, c.contactPointA, circleBody.position);
                sub(c.contactPointB, projectedPoint, lineOffset);
                add(c.contactPointB, c.contactPointB, lineOffset);
                sub(c.contactPointB, c.contactPointB, lineBody.position);
                this.contactEquations.push(c);
                if (this.enableFriction) {
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
                return 1;
            }
        }
        // Add corner
        verts[0] = worldVertex0;
        verts[1] = worldVertex1;
        for (var i = 0; i < verts.length; i++) {
            var v = verts[i];
            sub(dist, v, circleOffset);
            if (squaredLength(dist) < Math.pow(radiusSum, 2)) {
                if (justTest) {
                    return 1;
                }
                var c = this.createContactEquation(circleBody, lineBody, circleShape, lineShape);
                copy(c.normalA, dist);
                normalize(c.normalA, c.normalA);
                // Vector from circle to contact point is the normal times the circle radius
                scale(c.contactPointA, c.normalA, circleRadius);
                add(c.contactPointA, c.contactPointA, circleOffset);
                sub(c.contactPointA, c.contactPointA, circleBody.position);
                sub(c.contactPointB, v, lineOffset);
                scale(lineEndToLineRadius, c.normalA, -lineRadius);
                add(c.contactPointB, c.contactPointB, lineEndToLineRadius);
                add(c.contactPointB, c.contactPointB, lineOffset);
                sub(c.contactPointB, c.contactPointB, lineBody.position);
                this.contactEquations.push(c);
                if (this.enableFriction) {
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
                return 1;
            }
        }
        return 0;
    };
    ;
    /**
     * Circle/capsule Narrowphase
     * @method circleCapsule
     * @param  {Body}   bi
     * @param  {Circle} si
     * @param  {Array}  xi
     * @param  {Body}   bj
     * @param  {Line}   sj
     * @param  {Array}  xj
     * @param  {Number} aj
     */
    //Narrowphase.prototype[Shape.CIRCLE | Shape.CAPSULE] =
    Narrowphase.prototype.circleCapsule = function (bi, si, xi, bj, sj, xj, aj, justTest) {
        return this.circleLine(bi, si, xi, bj, sj, xj, aj, justTest, 0, si.radius);
    };
    ;
    /**
     * Circle/convex Narrowphase.
     * @method circleConvex
     * @param  {Body} circleBody
     * @param  {Circle} circleShape
     * @param  {Array} circleOffset
     * @param  {Body} convexBody
     * @param  {Convex} convexShape
     * @param  {Array} convexOffset
     * @param  {Number} convexAngle
     * @param  {Boolean} justTest
     * @param  {Number} circleRadius
     * @return {number}
     * @todo Should probably do a separating axis test like https://github.com/erincatto/Box2D/blob/master/Box2D/Box2D/Collision/b2CollideCircle.cpp#L62
     */
    //Narrowphase.prototype[Shape.CIRCLE | Shape.CONVEX] =
    //Narrowphase.prototype[Shape.CIRCLE | Shape.BOX] =
    Narrowphase.prototype.circleConvex = function (circleBody, circleShape, circleOffset, convexBody, convexShape, convexOffset, convexAngle, justTest, circleRadius) {
        var worldVertex0 = tmp1, worldVertex1 = tmp2, edge = tmp3, edgeUnit = tmp4, normal = tmp5, zero = tmp6, localCirclePosition = tmp7, r = tmp8, dist = tmp10, worldVertex = tmp11, closestEdgeProjectedPoint = tmp13, candidate = tmp14, candidateDist = tmp15, found = -1, minCandidateDistance = Infinity;
        vec2_1.default.set(zero, 0, 0);
        // New algorithm:
        // 1. Check so center of circle is not inside the polygon. If it is, this wont work...
        // 2. For each edge
        // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
        // 2. 2. Check if point is inside.
        vec2_1.default.toLocalFrame(localCirclePosition, circleOffset, convexOffset, convexAngle);
        var vertices = convexShape.vertices;
        var normals = convexShape.normals;
        var numVertices = vertices.length;
        var normalIndex = -1;
        // Find the min separating edge.
        var separation = -Infinity;
        var radius = convexShape.boundingRadius + circleRadius;
        for (var i = 0; i < numVertices; i++) {
            sub(r, localCirclePosition, vertices[i]);
            var s = dot(normals[i], r);
            if (s > radius) {
                // Early out.
                return 0;
            }
            if (s > separation) {
                separation = s;
                normalIndex = i;
            }
        }
        // Check edges first
        for (var i = normalIndex + numVertices - 1; i < normalIndex + numVertices + 2; i++) {
            var v0 = vertices[i % numVertices], n = normals[i % numVertices];
            // Get point on circle, closest to the convex
            scale(candidate, n, -circleRadius);
            add(candidate, candidate, localCirclePosition);
            if (pointInConvexLocal(candidate, convexShape)) {
                sub(candidateDist, v0, candidate);
                var candidateDistance = Math.abs(dot(candidateDist, n));
                if (candidateDistance < minCandidateDistance) {
                    minCandidateDistance = candidateDistance;
                    found = i;
                }
            }
        }
        if (found !== -1) {
            if (justTest) {
                return 1;
            }
            var v0 = vertices[found % numVertices], v1 = vertices[(found + 1) % numVertices];
            vec2_1.default.toGlobalFrame(worldVertex0, v0, convexOffset, convexAngle);
            vec2_1.default.toGlobalFrame(worldVertex1, v1, convexOffset, convexAngle);
            sub(edge, worldVertex1, worldVertex0);
            normalize(edgeUnit, edge);
            // Get tangent to the edge. Points out of the Convex
            vec2_1.default.rotate90cw(normal, edgeUnit);
            // Get point on circle, closest to the convex
            scale(candidate, normal, -circleRadius);
            add(candidate, candidate, circleOffset);
            scale(closestEdgeProjectedPoint, normal, minCandidateDistance);
            add(closestEdgeProjectedPoint, closestEdgeProjectedPoint, candidate);
            var c = this.createContactEquation(circleBody, convexBody, circleShape, convexShape);
            sub(c.normalA, candidate, circleOffset);
            normalize(c.normalA, c.normalA);
            scale(c.contactPointA, c.normalA, circleRadius);
            add(c.contactPointA, c.contactPointA, circleOffset);
            sub(c.contactPointA, c.contactPointA, circleBody.position);
            sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
            add(c.contactPointB, c.contactPointB, convexOffset);
            sub(c.contactPointB, c.contactPointB, convexBody.position);
            this.contactEquations.push(c);
            if (this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }
            return 1;
        }
        // Check closest vertices
        if (circleRadius > 0 && normalIndex !== -1) {
            for (var i = normalIndex + numVertices; i < normalIndex + numVertices + 2; i++) {
                var localVertex = vertices[i % numVertices];
                sub(dist, localVertex, localCirclePosition);
                if (squaredLength(dist) < circleRadius * circleRadius) {
                    if (justTest) {
                        return 1;
                    }
                    vec2_1.default.toGlobalFrame(worldVertex, localVertex, convexOffset, convexAngle);
                    sub(dist, worldVertex, circleOffset);
                    var c = this.createContactEquation(circleBody, convexBody, circleShape, convexShape);
                    copy(c.normalA, dist);
                    normalize(c.normalA, c.normalA);
                    // Vector from circle to contact point is the normal times the circle radius
                    scale(c.contactPointA, c.normalA, circleRadius);
                    add(c.contactPointA, c.contactPointA, circleOffset);
                    sub(c.contactPointA, c.contactPointA, circleBody.position);
                    sub(c.contactPointB, worldVertex, convexOffset);
                    add(c.contactPointB, c.contactPointB, convexOffset);
                    sub(c.contactPointB, c.contactPointB, convexBody.position);
                    this.contactEquations.push(c);
                    if (this.enableFriction) {
                        this.frictionEquations.push(this.createFrictionFromContact(c));
                    }
                    return 1;
                }
            }
        }
        return 0;
    };
    ;
    /**
     * Particle/convex Narrowphase
     * @method particleConvex
     * @param  {Body} particleBody
     * @param  {Particle} particleShape
     * @param  {Array} particleOffset
     * @param  {Number} particleAngle
     * @param  {Body} convexBody
     * @param  {Convex} convexShape
     * @param  {Array} convexOffset
     * @param  {Number} convexAngle
     * @param {Boolean} justTest
     * @return {number}
     * @todo use pointInConvex and code more similar to circleConvex
     * @todo don't transform each vertex, but transform the particle position to convex-local instead
     */
    //Narrowphase.prototype[Shape.PARTICLE | Shape.CONVEX] =
    //Narrowphase.prototype[Shape.PARTICLE | Shape.BOX] =
    Narrowphase.prototype.particleConvex = function (particleBody, particleShape, particleOffset, convexBody, convexShape, convexOffset, convexAngle, justTest) {
        var worldVertex0 = tmp1, worldVertex1 = tmp2, worldEdge = tmp3, worldEdgeUnit = tmp4, worldTangent = tmp5, centerDist = tmp6, convexToparticle = tmp7, closestEdgeProjectedPoint = tmp13, candidateDist = tmp14, minEdgeNormal = tmp15, minCandidateDistance = Infinity, found = false, verts = convexShape.vertices;
        // Check if the particle is in the polygon at all
        if (!pointInConvex(particleOffset, convexShape, convexOffset, convexAngle)) {
            return 0;
        }
        if (justTest) {
            return 1;
        }
        // Check edges first
        for (var i = 0, numVerts = verts.length; i !== numVerts + 1; i++) {
            var v0 = verts[i % numVerts], v1 = verts[(i + 1) % numVerts];
            // Transform vertices to world
            // @todo transform point to local space instead
            rotate(worldVertex0, v0, convexAngle);
            rotate(worldVertex1, v1, convexAngle);
            add(worldVertex0, worldVertex0, convexOffset);
            add(worldVertex1, worldVertex1, convexOffset);
            // Get world edge
            sub(worldEdge, worldVertex1, worldVertex0);
            normalize(worldEdgeUnit, worldEdge);
            // Get tangent to the edge. Points out of the Convex
            vec2_1.default.rotate90cw(worldTangent, worldEdgeUnit);
            // Check distance from the infinite line (spanned by the edge) to the particle
            //sub(dist, particleOffset, worldVertex0);
            //let d = dot(dist, worldTangent);
            sub(centerDist, worldVertex0, convexOffset);
            sub(convexToparticle, particleOffset, convexOffset);
            sub(candidateDist, worldVertex0, particleOffset);
            var candidateDistance = Math.abs(dot(candidateDist, worldTangent));
            if (candidateDistance < minCandidateDistance) {
                minCandidateDistance = candidateDistance;
                scale(closestEdgeProjectedPoint, worldTangent, candidateDistance);
                add(closestEdgeProjectedPoint, closestEdgeProjectedPoint, particleOffset);
                copy(minEdgeNormal, worldTangent);
                found = true;
            }
        }
        if (found) {
            var c = this.createContactEquation(particleBody, convexBody, particleShape, convexShape);
            scale(c.normalA, minEdgeNormal, -1);
            normalize(c.normalA, c.normalA);
            // Particle has no extent to the contact point
            vec2_1.default.set(c.contactPointA, 0, 0);
            add(c.contactPointA, c.contactPointA, particleOffset);
            sub(c.contactPointA, c.contactPointA, particleBody.position);
            // From convex center to point
            sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
            add(c.contactPointB, c.contactPointB, convexOffset);
            sub(c.contactPointB, c.contactPointB, convexBody.position);
            this.contactEquations.push(c);
            if (this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }
            return 1;
        }
        return 0;
    };
    ;
    /**
     * Circle/circle Narrowphase
     * @method circleCircle
     * @param  {Body} bodyA
     * @param  {Circle} shapeA
     * @param  {Array} offsetA
     * @param  {Body} bodyB
     * @param  {Circle} shapeB
     * @param  {Array} offsetB
     * @param {Boolean} justTest
     * @param {Number} [radiusA] Optional radius to use for shapeA
     * @param {Number} [radiusB] Optional radius to use for shapeB
     * @return {number}
     */
    //Narrowphase.prototype[Shape.CIRCLE] =
    Narrowphase.prototype.circleCircle = function (bodyA, shapeA, offsetA, bodyB, shapeB, offsetB, justTest, radiusA, radiusB) {
        var dist = tmp1;
        sub(dist, offsetA, offsetB);
        var r = radiusA + radiusB;
        if (squaredLength(dist) > r * r) {
            return 0;
        }
        if (justTest) {
            return 1;
        }
        var c = this.createContactEquation(bodyA, bodyB, shapeA, shapeB);
        var cpA = c.contactPointA;
        var cpB = c.contactPointB;
        var normalA = c.normalA;
        sub(normalA, offsetB, offsetA);
        normalize(normalA, normalA);
        scale(cpA, normalA, radiusA);
        scale(cpB, normalA, -radiusB);
        addSub(cpA, cpA, offsetA, bodyA.position);
        addSub(cpB, cpB, offsetB, bodyB.position);
        this.contactEquations.push(c);
        if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(c));
        }
        return 1;
    };
    ;
    /**
     * Plane/Convex Narrowphase
     * @method planeConvex
     * @param  {Body} planeBody
     * @param  {Plane} planeShape
     * @param  {Array} planeOffset
     * @param  {Number} planeAngle
     * @param  {Body} convexBody
     * @param  {Convex} convexShape
     * @param  {Array} convexOffset
     * @param  {Number} convexAngle
     * @param {Boolean} justTest
     * @return {number}
     * @todo only use the deepest contact point + the contact point furthest away from it
     */
    //Narrowphase.prototype[Shape.PLANE | Shape.CONVEX] =
    //Narrowphase.prototype[Shape.PLANE | Shape.BOX] =
    Narrowphase.prototype.planeConvex = function (planeBody, planeShape, planeOffset, planeAngle, convexBody, convexShape, convexOffset, convexAngle, justTest) {
        var worldVertex = tmp1, worldNormal = tmp2, dist = tmp3, localPlaneOffset = tmp4, localPlaneNormal = tmp5, localDist = tmp6;
        var numReported = 0;
        rotate(worldNormal, yAxis, planeAngle);
        // Get convex-local plane offset and normal
        vec2_1.default.vectorToLocalFrame(localPlaneNormal, worldNormal, convexAngle);
        vec2_1.default.toLocalFrame(localPlaneOffset, planeOffset, convexOffset, convexAngle);
        var vertices = convexShape.vertices;
        for (var i = 0, numVerts = vertices.length; i !== numVerts; i++) {
            var v = vertices[i];
            sub(localDist, v, localPlaneOffset);
            if (dot(localDist, localPlaneNormal) <= 0) {
                if (justTest) {
                    return 1;
                }
                vec2_1.default.toGlobalFrame(worldVertex, v, convexOffset, convexAngle);
                sub(dist, worldVertex, planeOffset);
                // Found vertex
                numReported++;
                var c = this.createContactEquation(planeBody, convexBody, planeShape, convexShape);
                sub(dist, worldVertex, planeOffset);
                copy(c.normalA, worldNormal);
                var d = dot(dist, c.normalA);
                scale(dist, c.normalA, d);
                // rj is from convex center to contact
                sub(c.contactPointB, worldVertex, convexBody.position);
                // ri is from plane center to contact
                sub(c.contactPointA, worldVertex, dist);
                sub(c.contactPointA, c.contactPointA, planeBody.position);
                this.contactEquations.push(c);
                if (!this.enableFrictionReduction) {
                    if (this.enableFriction) {
                        this.frictionEquations.push(this.createFrictionFromContact(c));
                    }
                }
            }
        }
        if (this.enableFrictionReduction) {
            if (this.enableFriction && numReported) {
                this.frictionEquations.push(this.createFrictionFromAverage(numReported));
            }
        }
        return numReported;
    };
    ;
    /**
     * Narrowphase for particle vs plane
     * @method particlePlane
     * @param  {Body}       particleBody
     * @param  {Particle}   particleShape
     * @param  {Array}      particleOffset
     * @param  {Body}       planeBody
     * @param  {Plane}      planeShape
     * @param  {Array}      planeOffset
     * @param  {Number}     planeAngle
     * @param {Boolean}     justTest
     * @return {number}
     */
    //Narrowphase.prototype[Shape.PARTICLE | Shape.PLANE] =
    Narrowphase.prototype.particlePlane = function (particleBody, particleShape, particleOffset, planeBody, planeShape, planeOffset, planeAngle, justTest) {
        var dist = tmp1, worldNormal = tmp2;
        planeAngle = planeAngle || 0;
        sub(dist, particleOffset, planeOffset);
        rotate(worldNormal, yAxis, planeAngle);
        var d = dot(dist, worldNormal);
        if (d > 0) {
            return 0;
        }
        if (justTest) {
            return 1;
        }
        var c = this.createContactEquation(planeBody, particleBody, planeShape, particleShape);
        copy(c.normalA, worldNormal);
        scale(dist, c.normalA, d);
        // dist is now the distance vector in the normal direction
        // ri is the particle position projected down onto the plane, from the plane center
        sub(c.contactPointA, particleOffset, dist);
        sub(c.contactPointA, c.contactPointA, planeBody.position);
        // rj is from the body center to the particle center
        sub(c.contactPointB, particleOffset, particleBody.position);
        this.contactEquations.push(c);
        if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(c));
        }
        return 1;
    };
    ;
    /**
     * Circle/Particle Narrowphase
     * @method circleParticle
     * @param  {Body} circleBody
     * @param  {Circle} circleShape
     * @param  {Array} circleOffset
     * @param  {Body} particleBody
     * @param  {Particle} particleShape
     * @param  {Array} particleOffset
     * @param  {Boolean} justTest
     * @return {number}
     */
    //Narrowphase.prototype[Shape.CIRCLE | Shape.PARTICLE] =
    Narrowphase.prototype.circleParticle = function (circleBody, circleShape, circleOffset, particleBody, particleShape, particleOffset, justTest) {
        var dist = tmp1;
        var circleRadius = circleShape.radius;
        sub(dist, particleOffset, circleOffset);
        if (squaredLength(dist) > circleRadius * circleRadius) {
            return 0;
        }
        if (justTest) {
            return 1;
        }
        var c = this.createContactEquation(circleBody, particleBody, circleShape, particleShape);
        var normalA = c.normalA;
        var contactPointA = c.contactPointA;
        var contactPointB = c.contactPointB;
        copy(normalA, dist);
        normalize(normalA, normalA);
        // Vector from circle to contact point is the normal times the circle radius
        scale(contactPointA, normalA, circleRadius);
        add(contactPointA, contactPointA, circleOffset);
        sub(contactPointA, contactPointA, circleBody.position);
        // Vector from particle center to contact point is zero
        sub(contactPointB, particleOffset, particleBody.position);
        this.contactEquations.push(c);
        if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(c));
        }
        return 1;
    };
    ;
    /**
     * @method planeCapsule
     * @param  {Body} planeBody
     * @param  {Circle} planeShape
     * @param  {Array} planeOffset
     * @param  {Number} planeAngle
     * @param  {Body} capsuleBody
     * @param  {Particle} capsuleShape
     * @param  {Array} capsuleOffset
     * @param  {Number} capsuleAngle
     * @param {Boolean} justTest
     * @return {number}
     */
    //Narrowphase.prototype[Shape.PLANE | Shape.CAPSULE] =
    Narrowphase.prototype.planeCapsule = function (planeBody, planeShape, planeOffset, planeAngle, capsuleBody, capsuleShape, capsuleOffset, capsuleAngle, justTest) {
        var planeCapsule_tmpCircle = new Circle_1.default({ radius: 1 });
        var end1 = planeCapsule_tmp1, end2 = planeCapsule_tmp2, circle = planeCapsule_tmpCircle, halfLength = capsuleShape.length / 2;
        // Compute world end positions
        vec2_1.default.set(end1, -halfLength, 0);
        vec2_1.default.set(end2, halfLength, 0);
        vec2_1.default.toGlobalFrame(end1, end1, capsuleOffset, capsuleAngle);
        vec2_1.default.toGlobalFrame(end2, end2, capsuleOffset, capsuleAngle);
        circle.radius = capsuleShape.radius;
        var enableFrictionBefore = this.enableFriction;
        // Temporarily turn off friction
        if (this.enableFrictionReduction) {
            this.enableFriction = false;
        }
        // Do Narrowphase as two circles
        var numContacts1 = this.circlePlane(capsuleBody, circle, end1, planeBody, planeShape, planeOffset, planeAngle, justTest), numContacts2 = this.circlePlane(capsuleBody, circle, end2, planeBody, planeShape, planeOffset, planeAngle, justTest);
        // Restore friction
        if (this.enableFrictionReduction) {
            this.enableFriction = enableFrictionBefore;
        }
        if (justTest) {
            return numContacts1 + numContacts2;
        }
        else {
            var numTotal = numContacts1 + numContacts2;
            if (this.enableFrictionReduction) {
                if (numTotal) {
                    this.frictionEquations.push(this.createFrictionFromAverage(numTotal));
                }
            }
            return numTotal;
        }
    };
    ;
    /**
     * @method circlePlane
     * @param  {Body}    circleBody
     * @param  {Circle}  circleShape
     * @param  {Array}   circleOffset
     * @param  {Body}    planeBody
     * @param  {Plane}   planeShape
     * @param  {Array}   planeOffset
     * @param  {Number}  planeAngle
     * @param  {Boolean} justTest
     * @return {number}
     */
    //Narrowphase.prototype[Shape.CIRCLE | Shape.PLANE] =
    Narrowphase.prototype.circlePlane = function (circleBody, circleShape, circleOffset, planeBody, planeShape, planeOffset, planeAngle, justTest) {
        var circleRadius = circleShape.radius;
        // Vector from plane to circle
        var planeToCircle = tmp1, worldNormal = tmp2, temp = tmp3;
        sub(planeToCircle, circleOffset, planeOffset);
        // World plane normal
        rotate(worldNormal, yAxis, planeAngle);
        // Normal direction distance
        var d = dot(worldNormal, planeToCircle);
        if (d > circleRadius) {
            return 0; // No overlap. Abort.
        }
        if (justTest) {
            return 1;
        }
        // Create contact
        var contact = this.createContactEquation(planeBody, circleBody, planeShape, circleShape);
        // ni is the plane world normal
        copy(contact.normalA, worldNormal);
        // rj is the vector from circle center to the contact point
        var cpB = contact.contactPointB;
        scale(cpB, contact.normalA, -circleRadius);
        add(cpB, cpB, circleOffset);
        sub(cpB, cpB, circleBody.position);
        // ri is the distance from plane center to contact.
        var cpA = contact.contactPointA;
        scale(temp, contact.normalA, d);
        sub(cpA, planeToCircle, temp); // Subtract normal distance vector from the distance vector
        add(cpA, cpA, planeOffset);
        sub(cpA, cpA, planeBody.position);
        this.contactEquations.push(contact);
        if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(contact));
        }
        return 1;
    };
    ;
    // Find edge normal of max separation on A - return if separating axis is found
    // Find edge normal of max separation on B - return if separation axis is found
    // Choose reference edge as min(minA, minB)
    // Find incident edge
    // Clip
    // The normal points from 1 to 2
    /*function collidePolygons(
        manifold,
        polyA, positionA, angleA,
        polyB, positionB, angleB,
        incidentEdge
    ) {*/
    /**
     * Convex/convex Narrowphase.See <a href="http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/">this article</a> for more info.
     * @method convexConvex
     * @param  {Body} bi
     * @param  {Convex} si
     * @param  {Array} xi
     * @param  {Number} ai
     * @param  {Body} bj
     * @param  {Convex} sj
     * @param  {Array} xj
     * @param  {Number} aj
     * @param  {Boolean} justTest
     * @return {number}
     */
    //Narrowphase.prototype[Shape.CONVEX] =
    //Narrowphase.prototype[Shape.CONVEX | Shape.BOX] =
    //Narrowphase.prototype[Shape.BOX] =
    Narrowphase.prototype.convexConvex = function (bodyA, polyA, positionA, angleA, bodyB, polyB, positionB, angleB, justTest) {
        var maxManifoldPoints = 2;
        var totalRadius = 0;
        var dist = collidePolygons_dist;
        var tempVec = collidePolygons_tempVec;
        var tmpVec = collidePolygons_tmpVec;
        var edgeA = findMaxSeparation(tempVec, polyA, positionA, angleA, polyB, positionB, angleB);
        var separationA = tempVec[0];
        if (separationA > totalRadius) {
            return 0;
        }
        var edgeB = findMaxSeparation(tmpVec, polyB, positionB, angleB, polyA, positionA, angleA);
        var separationB = tmpVec[0];
        if (separationB > totalRadius) {
            return 0;
        }
        var poly1; // reference polygon
        var poly2; // incident polygon
        var position1;
        var position2;
        var angle1;
        var angle2;
        var body1;
        var body2;
        var edge1; // reference edge
        var type;
        if (separationB > separationA) {
            poly1 = polyB;
            poly2 = polyA;
            body1 = bodyB;
            body2 = bodyA;
            position1 = positionB;
            angle1 = angleB;
            position2 = positionA;
            angle2 = angleA;
            edge1 = edgeB;
            type = 1; // faceB
        }
        else {
            poly1 = polyA;
            poly2 = polyB;
            body1 = bodyA;
            body2 = bodyB;
            position1 = positionA;
            angle1 = angleA;
            position2 = positionB;
            angle2 = angleB;
            edge1 = edgeA;
            type = 0; // faceA
        }
        var incidentEdge = collidePolygons_incidentEdge;
        findIncidentEdge(incidentEdge, poly1, position1, angle1, edge1, poly2, position2, angle2);
        var count1 = poly1.vertices.length;
        var vertices1 = poly1.vertices;
        var iv1 = edge1;
        var iv2 = edge1 + 1 < count1 ? edge1 + 1 : 0;
        var v11 = collidePolygons_v11;
        var v12 = collidePolygons_v12;
        vec2_1.default.copy(v11, vertices1[iv1]);
        vec2_1.default.copy(v12, vertices1[iv2]);
        var localTangent = collidePolygons_localTangent;
        vec2_1.default.subtract(localTangent, v12, v11);
        vec2_1.default.normalize(localTangent, localTangent);
        var localNormal = collidePolygons_localNormal;
        vec2_1.default.crossVZ(localNormal, localTangent, 1.0);
        var planePoint = collidePolygons_planePoint;
        vec2_1.default.add(planePoint, v11, v12);
        vec2_1.default.scale(planePoint, planePoint, 0.5);
        var tangent = collidePolygons_tangent; // tangent in world space
        vec2_1.default.rotate(tangent, localTangent, angle1);
        var normal = collidePolygons_normal; // normal in world space
        vec2_1.default.crossVZ(normal, tangent, 1.0);
        vec2_1.default.toGlobalFrame(v11, v11, position1, angle1);
        vec2_1.default.toGlobalFrame(v12, v12, position1, angle1);
        // Face offset.
        var frontOffset = vec2_1.default.dot(normal, v11);
        // Side offsets, extended by polytope skin thickness.
        var sideOffset1 = -vec2_1.default.dot(tangent, v11) + totalRadius;
        var sideOffset2 = vec2_1.default.dot(tangent, v12) + totalRadius;
        // Clip incident edge against extruded edge1 side edges.
        var clipPoints1 = collidePolygons_clipPoints1;
        var clipPoints2 = collidePolygons_clipPoints2;
        var np = 0;
        // Clip to box side 1
        var negativeTangent = collidePolygons_negativeTangent;
        vec2_1.default.scale(negativeTangent, tangent, -1);
        np = clipSegmentToLine(clipPoints1, incidentEdge, negativeTangent, sideOffset1 /*, iv1*/);
        if (np < 2) {
            return 0;
        }
        // Clip to negative box side 1
        np = clipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2 /*, iv2*/);
        if (np < 2) {
            return 0;
        }
        var pointCount = 0;
        for (var i = 0; i < maxManifoldPoints; ++i) {
            var separation = vec2_1.default.dot(normal, clipPoints2[i]) - frontOffset;
            if (separation <= totalRadius) {
                if (justTest) {
                    return 1;
                }
                ++pointCount;
                var c = this.createContactEquation(body1, body2, poly1, poly2);
                vec2_1.default.copy(c.normalA, normal);
                vec2_1.default.copy(c.contactPointB, clipPoints2[i]);
                sub(c.contactPointB, c.contactPointB, body2.position);
                vec2_1.default.scale(dist, normal, -separation);
                vec2_1.default.add(c.contactPointA, clipPoints2[i], dist);
                sub(c.contactPointA, c.contactPointA, body1.position);
                this.contactEquations.push(c);
                if (this.enableFriction && !this.enableFrictionReduction) {
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
        }
        if (pointCount && this.enableFrictionReduction && this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromAverage(pointCount));
        }
        return pointCount;
    };
    ;
    //Narrowphase.prototype[Shape.CIRCLE | Shape.HEIGHTFIELD] =
    Narrowphase.prototype.circleHeightfield = function (circleBody, circleShape, circlePos, hfBody, hfShape, hfPos, justTest, radius) {
        var data = hfShape.heights, w = hfShape.elementWidth, dist = circleHeightfield_dist, candidate = circleHeightfield_candidate, minCandidate = circleHeightfield_minCandidate, minCandidateNormal = circleHeightfield_minCandidateNormal, worldNormal = circleHeightfield_worldNormal, v0 = circleHeightfield_v0, v1 = circleHeightfield_v1;
        // Get the index of the points to test against
        var idxA = Math.floor((circlePos[0] - radius - hfPos[0]) / w), idxB = Math.ceil((circlePos[0] + radius - hfPos[0]) / w);
        /*if(idxB < 0 || idxA >= data.length)
            return justTest ? false : 0;*/
        if (idxA < 0) {
            idxA = 0;
        }
        if (idxB >= data.length) {
            idxB = data.length - 1;
        }
        // Get max and min
        var max = data[idxA], min = data[idxB];
        for (var i = idxA; i < idxB; i++) {
            if (data[i] < min) {
                min = data[i];
            }
            if (data[i] > max) {
                max = data[i];
            }
        }
        if (circlePos[1] - radius > max) {
            return 0;
        }
        /*
        if(circlePos[1]+radius < min){
            // Below the minimum point... We can just guess.
            // TODO
        }
        */
        // 1. Check so center of circle is not inside the field. If it is, this wont work...
        // 2. For each edge
        // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
        // 2. 2. Check if point is inside.
        var found = false;
        // Check all edges first
        for (var i = idxA; i < idxB; i++) {
            // Get points
            vec2_1.default.set(v0, i * w, data[i]);
            vec2_1.default.set(v1, (i + 1) * w, data[i + 1]);
            add(v0, v0, hfPos); // @todo transform circle to local heightfield space instead
            add(v1, v1, hfPos);
            // Get normal
            sub(worldNormal, v1, v0);
            rotate(worldNormal, worldNormal, Math.PI / 2);
            normalize(worldNormal, worldNormal);
            // Get point on circle, closest to the edge
            scale(candidate, worldNormal, -radius);
            add(candidate, candidate, circlePos);
            // Distance from v0 to the candidate point
            sub(dist, candidate, v0);
            // Check if it is in the element "stick"
            var d = dot(dist, worldNormal);
            if (candidate[0] >= v0[0] && candidate[0] < v1[0] && d <= 0) {
                if (justTest) {
                    return 1;
                }
                found = true;
                // Store the candidate point, projected to the edge
                scale(dist, worldNormal, -d);
                add(minCandidate, candidate, dist);
                copy(minCandidateNormal, worldNormal);
                var c = this.createContactEquation(hfBody, circleBody, hfShape, circleShape);
                // Normal is out of the heightfield
                copy(c.normalA, minCandidateNormal);
                // Vector from circle to heightfield
                scale(c.contactPointB, c.normalA, -radius);
                add(c.contactPointB, c.contactPointB, circlePos);
                sub(c.contactPointB, c.contactPointB, circleBody.position);
                copy(c.contactPointA, minCandidate);
                sub(c.contactPointA, c.contactPointA, hfBody.position);
                this.contactEquations.push(c);
                if (this.enableFriction) {
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
        }
        // Check all vertices
        found = false;
        if (radius > 0) {
            for (var i = idxA; i <= idxB; i++) {
                // Get point
                vec2_1.default.set(v0, i * w, data[i]);
                add(v0, v0, hfPos);
                sub(dist, circlePos, v0);
                if (squaredLength(dist) < Math.pow(radius, 2)) {
                    if (justTest) {
                        return 1;
                    }
                    found = true;
                    var c = this.createContactEquation(hfBody, circleBody, hfShape, circleShape);
                    // Construct normal - out of heightfield
                    copy(c.normalA, dist);
                    normalize(c.normalA, c.normalA);
                    scale(c.contactPointB, c.normalA, -radius);
                    add(c.contactPointB, c.contactPointB, circlePos);
                    sub(c.contactPointB, c.contactPointB, circleBody.position);
                    sub(c.contactPointA, v0, hfPos);
                    add(c.contactPointA, c.contactPointA, hfPos);
                    sub(c.contactPointA, c.contactPointA, hfBody.position);
                    this.contactEquations.push(c);
                    if (this.enableFriction) {
                        this.frictionEquations.push(this.createFrictionFromContact(c));
                    }
                }
            }
        }
        if (found) {
            return 1;
        }
        return 0;
    };
    //Narrowphase.prototype[Shape.BOX | Shape.HEIGHTFIELD] =
    //Narrowphase.prototype[Shape.CONVEX | Shape.HEIGHTFIELD] =
    Narrowphase.prototype.convexHeightfield = function (convexBody, convexShape, convexPos, convexAngle, hfBody, hfShape, hfPos, justTest) {
        var data = hfShape.heights, w = hfShape.elementWidth, v0 = convexHeightfield_v0, v1 = convexHeightfield_v1, tilePos = convexHeightfield_tilePos, tileConvex = convexHeightfield_tempConvexShape;
        // Get the index of the points to test against
        var idxA = Math.floor((convexBody.aabb.lowerBound[0] - hfPos[0]) / w), idxB = Math.ceil((convexBody.aabb.upperBound[0] - hfPos[0]) / w);
        if (idxA < 0) {
            idxA = 0;
        }
        if (idxB >= data.length) {
            idxB = data.length - 1;
        }
        // Get max and min
        var max = data[idxA], min = data[idxB];
        for (var i = idxA; i < idxB; i++) {
            if (data[i] < min) {
                min = data[i];
            }
            if (data[i] > max) {
                max = data[i];
            }
        }
        if (convexBody.aabb.lowerBound[1] > max) {
            return 0;
        }
        var numContacts = 0;
        // Loop over all edges
        // @todo If possible, construct a convex from several data points (need o check if the points make a convex shape)
        // @todo transform convex to local heightfield space.
        // @todo bail out if the heightfield tile is not tall enough.
        for (var i = idxA; i < idxB; i++) {
            // Get points
            vec2_1.default.set(v0, i * w, data[i]);
            vec2_1.default.set(v1, (i + 1) * w, data[i + 1]);
            add(v0, v0, hfPos);
            add(v1, v1, hfPos);
            // Construct a convex
            var tileHeight = 100; // todo
            vec2_1.default.set(tilePos, (v1[0] + v0[0]) * 0.5, (v1[1] + v0[1] - tileHeight) * 0.5);
            sub(tileConvex.vertices[0], v1, tilePos);
            sub(tileConvex.vertices[1], v0, tilePos);
            copy(tileConvex.vertices[2], tileConvex.vertices[1]);
            copy(tileConvex.vertices[3], tileConvex.vertices[0]);
            tileConvex.vertices[2][1] -= tileHeight;
            tileConvex.vertices[3][1] -= tileHeight;
            tileConvex.updateNormals();
            // Do convex collision
            numContacts += this.convexConvex(convexBody, convexShape, convexPos, convexAngle, hfBody, tileConvex, tilePos, 0, justTest);
        }
        return numContacts;
    };
    return Narrowphase;
}());
exports.default = Narrowphase;

},{"../math/vec2":28,"../shapes/Box":35,"../shapes/Circle":36,"../shapes/Convex":37,"../utils/contact-equation-pool":49,"../utils/friction-equation-pool":50,"../utils/tuple-dictionary":55}],5:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var intersectBody_worldPosition = vec2_1.default.create();
var v0 = vec2_1.default.create(), intersect = vec2_1.default.create();
var Ray = /** @class */ (function () {
    /**
     * A line with a start and end point that is used to intersect shapes. For an example, see {{#crossLink "World/raycast:method"}}World.raycast{{/crossLink}}
     * @class Ray
     * @constructor
     * @param {object} [options]
     * @param {array} [options.from]
     * @param {array} [options.to]
     * @param {boolean} [options.checkCollisionResponse=true]
     * @param {boolean} [options.skipBackfaces=false]
     * @param {number} [options.collisionMask=-1]
     * @param {number} [options.collisionGroup=-1]
     * @param {number} [options.mode=Ray.ANY]
     * @param {Function} [options.callback]
     */
    function Ray(options) {
        /**
         * @readOnly
         * @property {array} direction
         */
        this.direction = vec2_1.default.create();
        /**
         * Length of the ray
         * @readOnly
         * @property {number} length
         */
        this.length = 1;
        options = options !== null && options !== void 0 ? options : {};
        this.from = options.from ? vec2_1.default.clone(options.from) : vec2_1.default.create();
        this.to = options.to ? vec2_1.default.clone(options.to) : vec2_1.default.create();
        this.checkCollisionResponse = options.checkCollisionResponse !== undefined ? options.checkCollisionResponse : true;
        this.skipBackfaces = !!options.skipBackfaces;
        this.collisionMask = options.collisionMask !== undefined ? options.collisionMask : -1;
        this.collisionGroup = options.collisionGroup !== undefined ? options.collisionGroup : -1;
        this.mode = options.mode !== undefined ? options.mode : Ray.ANY;
        this.callback = options.callback || function ( /*result*/) { };
        this.update();
    }
    /**
     * Should be called if you change the from or to point.
     * @method update
     */
    Ray.prototype.update = function () {
        // Update .direction and .length
        var d = this.direction;
        vec2_1.default.subtract(d, this.to, this.from);
        this.length = vec2_1.default.length(d);
        vec2_1.default.normalize(d, d);
    };
    ;
    /**
     * @method intersectBodies
     * @param {Array} bodies An array of Body objects.
     */
    Ray.prototype.intersectBodies = function (result, bodies) {
        for (var i = 0, l = bodies.length; !result.shouldStop(this) && i < l; i++) {
            var body = bodies[i];
            var aabb = body.getAABB();
            if (aabb.overlapsRay(this) >= 0 || aabb.containsPoint(this.from)) {
                this.intersectBody(result, body);
            }
        }
    };
    ;
    /**
     * Shoot a ray at a body, get back information about the hit.
     * @method intersectBody
     * @private
     * @param {Body} body
     */
    Ray.prototype.intersectBody = function (result, body) {
        var checkCollisionResponse = this.checkCollisionResponse;
        if (checkCollisionResponse && !body.collisionResponse) {
            return;
        }
        var worldPosition = intersectBody_worldPosition;
        for (var i = 0, N = body.shapes.length; i < N; i++) {
            var shape = body.shapes[i];
            if (checkCollisionResponse && !shape.collisionResponse) {
                continue; // Skip
            }
            if ((this.collisionGroup & shape.collisionMask) === 0 || (shape.collisionGroup & this.collisionMask) === 0) {
                continue;
            }
            // Get world angle and position of the shape
            vec2_1.default.rotate(worldPosition, shape.position, body.angle);
            vec2_1.default.add(worldPosition, worldPosition, body.position);
            var worldAngle = shape.angle + body.angle;
            this.intersectShape(result, shape, worldAngle, worldPosition, body);
            if (result.shouldStop(this)) {
                break;
            }
        }
    };
    ;
    /**
     * @method intersectShape
     * @private
     * @param {Shape} shape
     * @param {number} angle
     * @param {array} position
     * @param {Body} body
     */
    Ray.prototype.intersectShape = function (result, shape, angle, position, body) {
        var from = this.from;
        // Checking radius
        var distance = distanceFromIntersectionSquared(from, this.direction, position);
        if (distance > shape.boundingRadius * shape.boundingRadius) {
            return;
        }
        this._currentBody = body;
        this._currentShape = shape;
        shape.raycast(result, this, position, angle);
        this._currentBody = undefined;
        this._currentShape = undefined;
    };
    ;
    /**
     * Get the AABB of the ray.
     * @method getAABB
     * @param  {AABB} aabb
     */
    Ray.prototype.getAABB = function (result) {
        var to = this.to;
        var from = this.from;
        vec2_1.default.set(result.lowerBound, Math.min(to[0], from[0]), Math.min(to[1], from[1]));
        vec2_1.default.set(result.upperBound, Math.max(to[0], from[0]), Math.max(to[1], from[1]));
    };
    ;
    /**
     * @method reportIntersection
     * @private
     * @param  {number} fraction
     * @param  {array} normal
     * @param  {number} [faceIndex=-1]
     * @return {boolean} True if the intersections should continue // This never returned anything.
     */
    Ray.prototype.reportIntersection = function (result, fraction, normal, faceIndex) {
        var shape = this._currentShape;
        var body = this._currentBody;
        // Skip back faces?
        if (this.skipBackfaces && vec2_1.default.dot(normal, this.direction) > 0) {
            return;
        }
        switch (this.mode) {
            case Ray.ALL:
                result.set(normal, shape, body, fraction, faceIndex);
                this.callback(result);
                break;
            case Ray.CLOSEST:
                // Store if closer than current closest
                if (fraction < result.fraction || !result.hasHit()) {
                    result.set(normal, shape, body, fraction, faceIndex);
                }
                break;
            case Ray.ANY:
                // Report and stop.
                result.set(normal, shape, body, fraction, faceIndex);
                break;
        }
    };
    ;
    /**
     * This raycasting mode will make the Ray traverse through all intersection points and only return the closest one.
     * @static
     * @property {Number} CLOSEST
     */
    Ray.CLOSEST = 1;
    /**
     * This raycasting mode will make the Ray stop when it finds the first intersection point.
     * @static
     * @property {Number} ANY
     */
    Ray.ANY = 2;
    /**
     * This raycasting mode will traverse all intersection points and executes a callback for each one.
     * @static
     * @property {Number} ALL
     */
    Ray.ALL = 4;
    return Ray;
}());
exports.default = Ray;
function distanceFromIntersectionSquared(from, direction, position) {
    // v0 is vector from from to position
    vec2_1.default.subtract(v0, position, from);
    var dot = vec2_1.default.dot(v0, direction);
    // intersect = direction * dot + from
    vec2_1.default.scale(intersect, direction, dot);
    vec2_1.default.add(intersect, intersect, from);
    return vec2_1.default.squaredDistance(position, intersect);
}

},{"../math/vec2":28}],6:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var ray_1 = __importDefault(_dereq_("./ray"));
var RaycastResult = /** @class */ (function () {
    /**
     * Storage for Ray casting hit data.
     * @class RaycastResult
     * @constructor
     */
    function RaycastResult() {
        /**
         * The normal of the hit, oriented in world space.
         * @property {array} normal
         */
        this.normal = vec2_1.default.create();
        /**
         * The index of the hit triangle, if the hit shape was indexable.
         * @property {number} faceIndex
         * @default -1
         */
        this.faceIndex = -1;
        /**
         * Distance to the hit, as a fraction. 0 is at the "from" point, 1 is at the "to" point. Will be set to -1 if there was no hit yet.
         * @property {number} fraction
         * @default -1
         */
        this.fraction = -1;
        /**
         * If the ray should stop traversing.
         * @readonly
         * @property {Boolean} isStopped
         */
        this.isStopped = false;
    }
    /**
     * Reset all result data. Must be done before re-using the result object.
     * @method reset
     */
    RaycastResult.prototype.reset = function () {
        vec2_1.default.set(this.normal, 0, 0);
        this.shape = undefined;
        this.body = undefined;
        this.faceIndex = -1;
        this.fraction = -1;
        this.isStopped = false;
    };
    /**
     * Get the distance to the hit point.
     * @method getHitDistance
     * @param {Ray} ray
     * @return {number}
     */
    RaycastResult.prototype.getHitDistance = function (ray) {
        return vec2_1.default.distance(ray.from, ray.to) * this.fraction;
    };
    /**
     * Returns true if the ray hit something since the last reset().
     * @method hasHit
     * @®eturn {boolean}
     */
    RaycastResult.prototype.hasHit = function () {
        return this.fraction !== -1;
    };
    /**
     * Get world hit point.
     * @method getHitPoint
     * @param {array} out
     * @param {Ray} ray
     */
    RaycastResult.prototype.getHitPoint = function (out, ray) {
        vec2_1.default.lerp(out, ray.from, ray.to, this.fraction);
    };
    /**
     * Can be called while iterating over hits to stop searching for hit points.
     * @method stop
     */
    RaycastResult.prototype.stop = function () {
        this.isStopped = true;
    };
    /**
     * @method shouldStop
     * @private
     * @param {Ray} ray
     * @return {boolean}
     */
    RaycastResult.prototype.shouldStop = function (ray) {
        return this.isStopped || (this.fraction !== -1 && ray.mode === ray_1.default.ANY);
    };
    /**
     * @method set
     * @private
     * @param {array} normal
     * @param {Shape} shape
     * @param {Body} body
     * @param {number} fraction
     * @param {number} faceIndex
     */
    RaycastResult.prototype.set = function (normal, shape, body, fraction, faceIndex) {
        vec2_1.default.copy(this.normal, normal);
        this.shape = shape;
        this.body = body;
        this.fraction = fraction;
        this.faceIndex = faceIndex;
    };
    return RaycastResult;
}());
exports.default = RaycastResult;

},{"../math/vec2":28,"./ray":5}],7:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var broadphase_1 = __importDefault(_dereq_("./broadphase"));
var utils_1 = __importDefault(_dereq_("../utils/utils"));
// TODO: this appears to be a bubble sort. We could probably do better.
function sortAxisList(a, axisIndex) {
    for (var i = 1, l = a.length; i < l; i++) { // Why not i=0?
        var v = a[i];
        for (var j = i - 1; j >= 0; j--) {
            if (a[j].aabb.lowerBound[axisIndex] <= v.aabb.lowerBound[axisIndex]) {
                break;
            }
            a[j + 1] = a[j];
        }
        a[j + 1] = v;
    }
    return a;
}
var SAPBroadphase = /** @class */ (function (_super) {
    __extends(SAPBroadphase, _super);
    /**
     * Sweep and prune broadphase along one axis.
     *
     * @class SAPBroadphase
     * @constructor
     * @extends Broadphase
     */
    function SAPBroadphase() {
        var _this = _super.call(this, broadphase_1.default.SAP) || this;
        _this.axisList = [];
        _this.axisIndex = 0;
        _this._addBodyHandler = function (e) {
            _this.axisList.push(e.body);
        };
        _this._removeBodyHandler = function (e) {
            // Remove from list
            var idx = _this.axisList.indexOf(e.body);
            if (idx !== -1) {
                _this.axisList.splice(idx, 1);
            }
        };
        return _this;
    }
    /**
     * Change the world
     * @method setWorld
     * @param {World} world
     */
    SAPBroadphase.prototype.setWorld = function (world) {
        // Clear the old axis array
        this.axisList.length = 0;
        // Add all bodies from the new world
        utils_1.default.appendArray(this.axisList, world.bodies);
        // Remove old handlers, if any
        world
            .off("addBody", this._addBodyHandler)
            .off("removeBody", this._removeBodyHandler);
        // Add handlers to update the list of bodies.
        // TODO: now that I've added context, we can test moving those inline functions to proper private methods.
        world.on("addBody", this._addBodyHandler, this)
            .on("removeBody", this._removeBodyHandler, this);
        this.world = world;
    };
    ;
    SAPBroadphase.prototype.sortList = function () {
        var bodies = this.axisList, axisIndex = this.axisIndex;
        // Sort the lists
        sortAxisList(bodies, axisIndex);
    };
    ;
    /**
     * Get the colliding pairs
     * @method getCollisionPairs
     * @param  {World} world
     * @return {Array}
     */
    SAPBroadphase.prototype.getCollisionPairs = function ( /*world*/) {
        var bodies = this.axisList, result = this.result, axisIndex = this.axisIndex;
        result.length = 0;
        // Update all AABBs if needed
        var l = bodies.length;
        while (l--) {
            var b = bodies[l];
            if (b.aabbNeedsUpdate) {
                b.updateAABB();
            }
        }
        // Sort the lists
        this.sortList();
        // Look through the X list
        for (var i = 0, N = bodies.length | 0; i !== N; i++) {
            var bi = bodies[i];
            for (var j = i + 1; j < N; j++) {
                var bj = bodies[j];
                // Bounds overlap?
                var overlaps = (bj.aabb.lowerBound[axisIndex] <= bi.aabb.upperBound[axisIndex]);
                if (!overlaps) {
                    break;
                }
                if (broadphase_1.default.canCollide(bi, bj) && this.boundingVolumeCheck(bi, bj)) {
                    result.push(bi);
                    result.push(bj);
                }
            }
        }
        return result;
    };
    ;
    /**
     * Returns all the bodies within an AABB.
     * @method aabbQuery
     * @param  {World} world
     * @param  {AABB} aabb
     * @param {array} result An array to store resulting bodies in.
     * @return {array}
     * @todo since the list is sorted, optimization can be done
     */
    SAPBroadphase.prototype.aabbQuery = function (world, aabb, result) {
        result = result || [];
        this.sortList();
        var axisList = this.axisList;
        for (var i = 0; i < axisList.length; i++) {
            var b = axisList[i];
            if (b.aabbNeedsUpdate) {
                b.updateAABB();
            }
            if (b.aabb.overlaps(aabb)) {
                result.push(b);
            }
        }
        return result;
    };
    ;
    return SAPBroadphase;
}(broadphase_1.default));
exports.default = SAPBroadphase;

},{"../utils/utils":56,"./broadphase":2}],8:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Constraint = /** @class */ (function () {
    /**
     * Base constraint class.
     *
     * @class Constraint
     * @constructor
     * @author schteppe
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Number} type
     * @param {Object} [options]
     * @param {Object} [options.collideConnected=true]
     */
    function Constraint(bodyA, bodyB, type, options) {
        var _a, _b;
        this.type = type;
        this.equations = [];
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.collideConnected = (_a = options === null || options === void 0 ? void 0 : options.collideConnected) !== null && _a !== void 0 ? _a : true;
        // Wake up bodies when connected
        if (((_b = options === null || options === void 0 ? void 0 : options.wakeUpBodies) !== null && _b !== void 0 ? _b : false) !== false) {
            if (bodyA) {
                bodyA.wakeUp();
            }
            if (bodyB) {
                bodyB.wakeUp();
            }
        }
    }
    /**
     * Updates the internal constraint parameters before solve.
     * @method update
     */
    Constraint.prototype.update = function () {
        throw new Error("method update() not implmemented in this Constraint subclass!");
    };
    ;
    /**
     * Set stiffness for this constraint.
     * @method setStiffness
     * @param {Number} stiffness
     */
    Constraint.prototype.setStiffness = function (stiffness) {
        var eqs = this.equations;
        for (var i = 0; i !== eqs.length; i++) {
            var eq = eqs[i];
            eq.stiffness = stiffness;
            eq.needsUpdate = true;
        }
    };
    ;
    /**
     * Set relaxation for this constraint.
     * @method setRelaxation
     * @param {Number} relaxation
     */
    Constraint.prototype.setRelaxation = function (relaxation) {
        var eqs = this.equations;
        for (var i = 0; i !== eqs.length; i++) {
            var eq = eqs[i];
            eq.relaxation = relaxation;
            eq.needsUpdate = true;
        }
    };
    ;
    /**
     * @method setMaxBias
     * @param {Number} maxBias
     */
    Constraint.prototype.setMaxBias = function (maxBias) {
        var eqs = this.equations;
        for (var i = 0; i !== eqs.length; i++) {
            var eq = eqs[i];
            eq.maxBias = maxBias;
        }
    };
    ;
    /**
     * @static
     * @property {number} DISTANCE
     */
    Constraint.DISTANCE = 1;
    /**
     * @static
     * @property {number} GEAR
     */
    Constraint.GEAR = 2;
    /**
     * @static
     * @property {number} LOCK
     */
    Constraint.LOCK = 3;
    /**
     * @static
     * @property {number} PRISMATIC
     */
    Constraint.PRISMATIC = 4;
    /**
     * @static
     * @property {number} REVOLUTE
     */
    Constraint.REVOLUTE = 5;
    return Constraint;
}());
exports.default = Constraint;

},{}],9:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var constraint_1 = __importDefault(_dereq_("./constraint"));
var Equation_1 = __importDefault(_dereq_("../equations/Equation"));
var n = vec2_1.default.create();
var ri = vec2_1.default.create(); // worldAnchorA
var rj = vec2_1.default.create(); // worldAnchorB
var DistanceConstraint = /** @class */ (function (_super) {
    __extends(DistanceConstraint, _super);
    // this.upperLimitEnabled = false;
    // this.upperLimit = 1;
    // this.lowerLimitEnabled = false;
    // this.lowerLimit = 0;
    // this.position = 0;
    /**
     * Constraint that tries to keep the distance between two bodies constant.
     *
     * @class DistanceConstraint
     * @constructor
     * @author schteppe
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {object} [options]
     * @param {number} [options.distance] The distance to keep between the anchor points. Defaults to the current distance between the bodies.
     * @param {Array} [options.localAnchorA] The anchor point for bodyA, defined locally in bodyA frame. Defaults to [0,0].
     * @param {Array} [options.localAnchorB] The anchor point for bodyB, defined locally in bodyB frame. Defaults to [0,0].
     * @param {object} [options.maxForce=Number.MAX_VALUE] Maximum force to apply.
     * @extends Constraint
     *
     * @example
     *     // If distance is not given as an option, then the current distance between the bodies is used.
     *     // In this example, the bodies will be constrained to have a distance of 2 between their centers.
     *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
     *     var bodyB = new Body({ mass: 1, position: [1, 0] });
     *     var constraint = new DistanceConstraint(bodyA, bodyB);
     *     world.addConstraint(constraint);
     *
     * @example
     *     // Manually set the distance and anchors
     *     var constraint = new DistanceConstraint(bodyA, bodyB, {
     *         distance: 1,          // Distance to keep between the points
     *         localAnchorA: [1, 0], // Point on bodyA
     *         localAnchorB: [-1, 0] // Point on bodyB
     *     });
     *     world.addConstraint(constraint);
     */
    function DistanceConstraint(bodyA, bodyB, options) {
        var _a;
        var _this = _super.call(this, bodyA, bodyB, constraint_1.default.DISTANCE, options) || this;
        /**
         * The distance to keep.
         * @property distance
         * @type {Number}
         */
        _this.distance = 0;
        /**
         * Max force to apply.
         * @property {number} maxForce
         */
        _this.maxForce = Infinity;
        /**
         * If the upper limit is enabled or not.
         * @property {Boolean} upperLimitEnabled
         */
        _this.upperLimitEnabled = false;
        /**
         * The upper constraint limit.
         * @property {number} upperLimit
         */
        _this.upperLimit = 1;
        /**
         * If the lower limit is enabled or not.
         * @property {Boolean} lowerLimitEnabled
         */
        _this.lowerLimitEnabled = false;
        /**
         * The lower constraint limit.
         * @property {number} lowerLimit
         */
        _this.lowerLimit = 0;
        /**
         * Current constraint position. This is equal to the current distance between the world anchor points.
         * @property {number} position
         */
        _this.position = 0;
        _this.localAnchorA = (options === null || options === void 0 ? void 0 : options.localAnchorA) ? vec2_1.default.clone(options.localAnchorA) : vec2_1.default.create();
        _this.localAnchorB = (options === null || options === void 0 ? void 0 : options.localAnchorB) ? vec2_1.default.clone(options.localAnchorB) : vec2_1.default.create();
        var localAnchorA = _this.localAnchorA;
        var localAnchorB = _this.localAnchorB;
        _this.distance = 0;
        if ((options === null || options === void 0 ? void 0 : options.distance) !== undefined) {
            _this.distance = options.distance;
        }
        else {
            // Use the current world distance between the world anchor points.
            var worldAnchorA = vec2_1.default.create(), worldAnchorB = vec2_1.default.create(), r = vec2_1.default.create();
            // Transform local anchors to world
            vec2_1.default.rotate(worldAnchorA, localAnchorA, bodyA.angle);
            vec2_1.default.rotate(worldAnchorB, localAnchorB, bodyB.angle);
            vec2_1.default.add(r, bodyB.position, worldAnchorB);
            vec2_1.default.subtract(r, r, worldAnchorA);
            vec2_1.default.subtract(r, r, bodyA.position);
            _this.distance = vec2_1.default.length(r);
        }
        var maxForce = (_a = options === null || options === void 0 ? void 0 : options.maxForce) !== null && _a !== void 0 ? _a : Infinity;
        var normal = new Equation_1.default(bodyA, bodyB, -maxForce, maxForce); // Just in the normal direction
        _this.equations = [normal];
        _this.maxForce = maxForce;
        // g = (xi - xj).dot(n)
        // dg/dt = (vi - vj).dot(n) = G*W = [n 0 -n 0] * [vi wi vj wj]'
        // ...and if we were to include offset points:
        // g =
        //      (xj + rj - xi - ri).dot(n) - distance
        // dg/dt =
        //      (vj + wj x rj - vi - wi x ri).dot(n) =
        //      { term 2 is near zero } =
        //      [-n   -ri x n   n   rj x n] * [vi wi vj wj]' =
        //      G * W
        // => G = [-n -rixn n rjxn]
        var r = vec2_1.default.create();
        var ri = vec2_1.default.create(); // worldAnchorA
        var rj = vec2_1.default.create(); // worldAnchorB
        var that = _this;
        normal.computeGq = function () {
            var bodyA = this.bodyA, bodyB = this.bodyB, xi = bodyA.position, xj = bodyB.position;
            // Transform local anchors to world
            vec2_1.default.rotate(ri, localAnchorA, bodyA.angle);
            vec2_1.default.rotate(rj, localAnchorB, bodyB.angle);
            vec2_1.default.add(r, xj, rj);
            vec2_1.default.subtract(r, r, ri);
            vec2_1.default.subtract(r, r, xi);
            //vec2.subtract(r, bodyB.position, bodyA.position);
            return vec2_1.default.length(r) - that.distance;
        };
        // Make the contact constraint bilateral
        _this.setMaxForce(maxForce);
        return _this;
    }
    /**
     * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
     * @method update
     */
    DistanceConstraint.prototype.update = function () {
        var normal = this.equations[0], bodyA = this.bodyA, bodyB = this.bodyB, xi = bodyA.position, xj = bodyB.position, normalEquation = this.equations[0], G = normal.G;
        // Transform local anchors to world
        vec2_1.default.rotate(ri, this.localAnchorA, bodyA.angle);
        vec2_1.default.rotate(rj, this.localAnchorB, bodyB.angle);
        // Get world anchor points and normal
        vec2_1.default.add(n, xj, rj);
        vec2_1.default.subtract(n, n, ri);
        vec2_1.default.subtract(n, n, xi);
        this.position = vec2_1.default.length(n);
        var violating = false;
        if (this.upperLimitEnabled) {
            if (this.position > this.upperLimit) {
                normalEquation.maxForce = 0;
                normalEquation.minForce = -this.maxForce;
                this.distance = this.upperLimit;
                violating = true;
            }
        }
        if (this.lowerLimitEnabled) {
            if (this.position < this.lowerLimit) {
                normalEquation.maxForce = this.maxForce;
                normalEquation.minForce = 0;
                this.distance = this.lowerLimit;
                violating = true;
            }
        }
        if ((this.lowerLimitEnabled || this.upperLimitEnabled) && !violating) {
            // No constraint needed.
            normalEquation.enabled = false;
            return;
        }
        normalEquation.enabled = true;
        vec2_1.default.normalize(n, n);
        // Caluclate cross products
        var rixn = vec2_1.default.crossLength(ri, n), rjxn = vec2_1.default.crossLength(rj, n);
        // G = [-n -rixn n rjxn]
        G[0] = -n[0];
        G[1] = -n[1];
        G[2] = -rixn;
        G[3] = n[0];
        G[4] = n[1];
        G[5] = rjxn;
    };
    /**
     * Set the max force to be used
     * @method setMaxForce
     * @param {Number} maxForce
     */
    DistanceConstraint.prototype.setMaxForce = function (maxForce) {
        var normal = this.equations[0];
        normal.minForce = -maxForce;
        normal.maxForce = maxForce;
    };
    /**
     * Get the max force
     * @method getMaxForce
     * @return {Number}
     */
    DistanceConstraint.prototype.getMaxForce = function () {
        var normal = this.equations[0];
        return normal.maxForce;
    };
    return DistanceConstraint;
}(constraint_1.default));
exports.default = DistanceConstraint;

},{"../equations/Equation":14,"../math/vec2":28,"./constraint":8}],10:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var angle_lock_equation_1 = __importDefault(_dereq_("../equations/angle-lock-equation"));
var constraint_1 = __importDefault(_dereq_("./constraint"));
var GearConstraint = /** @class */ (function (_super) {
    __extends(GearConstraint, _super);
    /**
     * Constrains the angle of two bodies to each other to be equal. If a gear ratio is not one, the angle of bodyA must be a multiple of the angle of bodyB.
     * @class GearConstraint
     * @constructor
     * @author schteppe
     * @param {Body}            bodyA
     * @param {Body}            bodyB
     * @param {Object}          [options]
     * @param {Number}          [options.angle=0] Relative angle between the bodies. Will be set to the current angle between the bodies (the gear ratio is accounted for).
     * @param {Number}          [options.ratio=1] Gear ratio.
     * @param {Number}          [options.maxTorque] Maximum torque to apply.
     * @extends Constraint
     *
     * @example
     *     var constraint = new GearConstraint(bodyA, bodyB);
     *     world.addConstraint(constraint);
     *
     * @example
     *     var constraint = new GearConstraint(bodyA, bodyB, {
     *         ratio: 2,
     *         maxTorque: 1000
     *     });
     *     world.addConstraint(constraint);
     */
    function GearConstraint(bodyA, bodyB, options) {
        var _a;
        var _this = this;
        options = options || {};
        _this = _super.call(this, bodyA, bodyB, constraint_1.default.GEAR, options) || this;
        /**
         * The gear ratio.
         * @property ratio
         * @type {Number}
         */
        _this.ratio = (_a = options === null || options === void 0 ? void 0 : options.ratio) !== null && _a !== void 0 ? _a : 1;
        /**
         * The relative angle
         * @property angle
         * @type {Number}
         */
        _this.angle = options.angle !== undefined ? options.angle : bodyB.angle - _this.ratio * bodyA.angle;
        // Send same parameters to the equation
        _this.equations = [
            new angle_lock_equation_1.default(bodyA, bodyB, {
                ratio: _this.ratio,
                angle: _this.angle
            }),
        ];
        // Set max torque
        if (options.maxTorque !== undefined) {
            _this.setMaxTorque(options.maxTorque);
        }
        return _this;
    }
    GearConstraint.prototype.update = function () {
        var eq = this.equations[0];
        var ratio = this.ratio;
        if (eq.ratio !== ratio) {
            eq.setRatio(ratio);
        }
        eq.angle = this.angle;
    };
    /**
     * Set the max torque for the constraint.
     * @method setMaxTorque
     * @param {Number} torque
     */
    GearConstraint.prototype.setMaxTorque = function (torque) {
        this.equations[0].setMaxTorque(torque);
    };
    /**
     * Get the max torque for the constraint.
     * @method getMaxTorque
     * @return {Number}
     */
    GearConstraint.prototype.getMaxTorque = function () {
        return this.equations[0].maxForce;
    };
    return GearConstraint;
}(constraint_1.default));
exports.default = GearConstraint;

},{"../equations/angle-lock-equation":15,"./constraint":8}],11:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var constraint_1 = __importDefault(_dereq_("./constraint"));
var Equation_1 = __importDefault(_dereq_("../equations/Equation"));
var l = vec2_1.default.create();
var r = vec2_1.default.create();
var t = vec2_1.default.create();
var xAxis = vec2_1.default.fromValues(1, 0);
var yAxis = vec2_1.default.fromValues(0, 1);
var LockConstraint = /** @class */ (function (_super) {
    __extends(LockConstraint, _super);
    /**
     * Locks the relative position and rotation between two bodies.
     *
     * @class LockConstraint
     * @constructor
     * @author schteppe
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {Array}  [options.localOffsetB] The offset of bodyB in bodyA's frame. If not given the offset is computed from current positions.
     * @param {number} [options.localAngleB] The angle of bodyB in bodyA's frame. If not given, the angle is computed from current angles.
     * @param {number} [options.maxForce]
     * @extends Constraint
     *
     * @example
     *     // Locks the relative position and rotation between bodyA and bodyB
     *     var constraint = new LockConstraint(bodyA, bodyB);
     *     world.addConstraint(constraint);
     */
    function LockConstraint(bodyA, bodyB, options) {
        //options = options || {};
        var _a, _b;
        var _this = _super.call(this, bodyA, bodyB, constraint_1.default.LOCK, options) || this;
        var maxForce = (_a = options === null || options === void 0 ? void 0 : options.maxForce) !== null && _a !== void 0 ? _a : Infinity;
        // Use 3 equations:
        // gx =   (xj - xi - l) * xhat = 0
        // gy =   (xj - xi - l) * yhat = 0
        // gr =   (xi - xj + r) * that = 0
        //
        // ...where:
        //   l is the localOffsetB vector rotated to world in bodyA frame
        //   r is the same vector but reversed and rotated from bodyB frame
        //   xhat, yhat are world axis vectors
        //   that is the tangent of r
        //
        // For the first two constraints, we get
        // G*W = (vj - vi - ldot  ) * xhat
        //     = (vj - vi - wi x l) * xhat
        //
        // Since (wi x l) * xhat = (l x xhat) * wi, we get
        // G*W = [ -1   0   (-l x xhat)  1   0   0] * [vi wi vj wj]
        //
        // The last constraint gives
        // GW = (vi - vj + wj x r) * that
        //    = [  that   0  -that  (r x t) ]
        var x = new Equation_1.default(bodyA, bodyB, -maxForce, maxForce), y = new Equation_1.default(bodyA, bodyB, -maxForce, maxForce), rot = new Equation_1.default(bodyA, bodyB, -maxForce, maxForce);
        var l = vec2_1.default.create(), g = vec2_1.default.create(), that = _this;
        x.computeGq = function () {
            vec2_1.default.rotate(l, that.localOffsetB, bodyA.angle);
            vec2_1.default.subtract(g, bodyB.position, bodyA.position);
            vec2_1.default.subtract(g, g, l);
            return g[0];
        };
        y.computeGq = function () {
            vec2_1.default.rotate(l, that.localOffsetB, bodyA.angle);
            vec2_1.default.subtract(g, bodyB.position, bodyA.position);
            vec2_1.default.subtract(g, g, l);
            return g[1];
        };
        var r = vec2_1.default.create(), t = vec2_1.default.create();
        rot.computeGq = function () {
            vec2_1.default.rotate(r, that.localOffsetB, bodyB.angle - that.localAngleB);
            vec2_1.default.scale(r, r, -1);
            vec2_1.default.subtract(g, bodyA.position, bodyB.position);
            vec2_1.default.add(g, g, r);
            vec2_1.default.rotate(t, r, -Math.PI / 2);
            vec2_1.default.normalize(t, t);
            return vec2_1.default.dot(g, t);
        };
        /**
         * The offset of bodyB in bodyA's frame.
         * @property {Array} localOffsetB
         */
        _this.localOffsetB = vec2_1.default.create();
        if (options === null || options === void 0 ? void 0 : options.localOffsetB) {
            vec2_1.default.copy(_this.localOffsetB, options.localOffsetB);
        }
        else {
            // Construct from current positions
            vec2_1.default.subtract(_this.localOffsetB, bodyB.position, bodyA.position);
            vec2_1.default.rotate(_this.localOffsetB, _this.localOffsetB, -bodyA.angle);
        }
        /**
         * The offset angle of bodyB in bodyA's frame.
         * @property {Number} localAngleB
         */
        _this.localAngleB = (_b = options === null || options === void 0 ? void 0 : options.localAngleB) !== null && _b !== void 0 ? _b : bodyB.angle - bodyA.angle;
        _this.equations.push(x);
        _this.equations.push(y);
        _this.equations.push(rot);
        _this.setMaxForce(maxForce);
        return _this;
    }
    /**
     * Set the maximum force to be applied.
     * @method setMaxForce
     * @param {Number} force
     */
    LockConstraint.prototype.setMaxForce = function (force) {
        var eqs = this.equations;
        for (var i = 0; i < this.equations.length; i++) {
            eqs[i].maxForce = force;
            eqs[i].minForce = -force;
        }
    };
    /**
     * Get the max force.
     * @method getMaxForce
     * @return {Number}
     */
    LockConstraint.prototype.getMaxForce = function () {
        return this.equations[0].maxForce;
    };
    LockConstraint.prototype.update = function () {
        var x = this.equations[0], y = this.equations[1], rot = this.equations[2], bodyA = this.bodyA, bodyB = this.bodyB;
        vec2_1.default.rotate(l, this.localOffsetB, bodyA.angle);
        vec2_1.default.rotate(r, this.localOffsetB, bodyB.angle - this.localAngleB);
        vec2_1.default.scale(r, r, -1);
        vec2_1.default.rotate(t, r, Math.PI / 2);
        vec2_1.default.normalize(t, t);
        x.G[0] = -1;
        x.G[1] = 0;
        x.G[2] = -vec2_1.default.crossLength(l, xAxis);
        x.G[3] = 1;
        y.G[0] = 0;
        y.G[1] = -1;
        y.G[2] = -vec2_1.default.crossLength(l, yAxis);
        y.G[4] = 1;
        rot.G[0] = -t[0];
        rot.G[1] = -t[1];
        rot.G[3] = t[0];
        rot.G[4] = t[1];
        rot.G[5] = vec2_1.default.crossLength(r, t);
    };
    return LockConstraint;
}(constraint_1.default));
exports.default = LockConstraint;

},{"../equations/Equation":14,"../math/vec2":28,"./constraint":8}],12:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var constraint_1 = __importDefault(_dereq_("./constraint"));
var contact_equation_1 = __importDefault(_dereq_("../equations/contact-equation"));
var Equation_1 = __importDefault(_dereq_("../equations/Equation"));
var rotational_lock_equation_1 = __importDefault(_dereq_("../equations/rotational-lock-equation"));
var worldAxisA = vec2_1.default.create(), worldAnchorA = vec2_1.default.create(), worldAnchorB = vec2_1.default.create(), orientedAnchorA = vec2_1.default.create(), orientedAnchorB = vec2_1.default.create(), tmp = vec2_1.default.create();
var PrismaticConstraint = /** @class */ (function (_super) {
    __extends(PrismaticConstraint, _super);
    /**
     * Constraint that only allows bodies to move along a line, relative to each other. See <a href="http://www.iforce2d.net/b2dtut/joints-prismatic">this tutorial</a>. Also called "slider constraint".
     *
     * @class PrismaticConstraint
     * @constructor
     * @extends Constraint
     * @author schteppe
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {Number} [options.maxForce] Max force to be applied by the constraint
     * @param {Array} [options.localAnchorA] Body A's anchor point, defined in its own local frame.
     * @param {Array} [options.localAnchorB] Body B's anchor point, defined in its own local frame.
     * @param {Array} [options.localAxisA] An axis, defined in body A frame, that body B's anchor point may slide along.
     * @param {Boolean} [options.disableRotationalLock] If set to true, bodyB will be free to rotate around its anchor point.
     * @param {Number} [options.upperLimit]
     * @param {Number} [options.lowerLimit]
     * @todo Ability to create using only a point and a worldAxis
     * @example
     *     var constraint = new PrismaticConstraint(bodyA, bodyB, {
     *         localAxisA: [0, 1]
     *     });
     *     world.addConstraint(constraint);
     */
    function PrismaticConstraint(bodyA, bodyB, options) {
        var _a, _b, _c;
        var _this = _super.call(this, bodyA, bodyB, constraint_1.default.PRISMATIC, options) || this;
        // Get anchors
        var localAnchorA = vec2_1.default.create(), localAxisA = vec2_1.default.fromValues(1, 0), localAnchorB = vec2_1.default.create();
        if (options === null || options === void 0 ? void 0 : options.localAnchorA) {
            vec2_1.default.copy(localAnchorA, options.localAnchorA);
        }
        if (options === null || options === void 0 ? void 0 : options.localAxisA) {
            vec2_1.default.copy(localAxisA, options.localAxisA);
        }
        if (options === null || options === void 0 ? void 0 : options.localAnchorB) {
            vec2_1.default.copy(localAnchorB, options.localAnchorB);
        }
        _this.localAnchorA = localAnchorA;
        _this.localAnchorB = localAnchorB;
        _this.localAxisA = localAxisA;
        /*

        The constraint violation for the common axis point is

            g = ( xj + rj - xi - ri ) * t   :=  gg*t

        where r are body-local anchor points, and t is a tangent to the constraint axis defined in body i frame.

            gdot =  ( vj + wj x rj - vi - wi x ri ) * t + ( xj + rj - xi - ri ) * ( wi x t )

        Note the use of the chain rule. Now we identify the jacobian

            G*W = [ -t      -ri x t + t x gg     t    rj x t ] * [vi wi vj wj]

        The rotational part is just a rotation lock.

        */
        var maxForce = _this.maxForce = (_a = options === null || options === void 0 ? void 0 : options.maxForce) !== null && _a !== void 0 ? _a : Infinity;
        // Translational part
        var trans = new Equation_1.default(bodyA, bodyB, -maxForce, maxForce);
        var ri = vec2_1.default.create(), rj = vec2_1.default.create(), gg = vec2_1.default.create(), t = vec2_1.default.create();
        // TODO: This is a bad practice.
        trans.computeGq = function () {
            // g = ( xj + rj - xi - ri ) * t
            return vec2_1.default.dot(gg, t);
        };
        // TODO: This is a bad practice.
        trans.updateJacobian = function () {
            var G = this.G, xi = bodyA.position, xj = bodyB.position;
            vec2_1.default.rotate(ri, localAnchorA, bodyA.angle);
            vec2_1.default.rotate(rj, localAnchorB, bodyB.angle);
            vec2_1.default.add(gg, xj, rj);
            vec2_1.default.subtract(gg, gg, xi);
            vec2_1.default.subtract(gg, gg, ri);
            vec2_1.default.rotate(t, localAxisA, bodyA.angle + Math.PI / 2);
            G[0] = -t[0];
            G[1] = -t[1];
            G[2] = -vec2_1.default.crossLength(ri, t) + vec2_1.default.crossLength(t, gg);
            G[3] = t[0];
            G[4] = t[1];
            G[5] = vec2_1.default.crossLength(rj, t);
        };
        _this.equations.push(trans);
        // Rotational part
        if (!(options === null || options === void 0 ? void 0 : options.disableRotationalLock)) {
            var rot = new rotational_lock_equation_1.default(bodyA, bodyB);
            _this.equations.push(rot);
        }
        /**
         * The position of anchor A relative to anchor B, along the constraint axis.
         * @property position
         * @type {Number}
         */
        _this.position = 0;
        // Is this one used at all?
        _this.velocity = 0;
        /**
         * Set to true to enable lower limit.
         * @property lowerLimitEnabled
         * @type {Boolean}
         */
        _this.lowerLimitEnabled = (options === null || options === void 0 ? void 0 : options.lowerLimit) !== undefined ? true : false;
        /**
         * Set to true to enable upper limit.
         * @property upperLimitEnabled
         * @type {Boolean}
         */
        _this.upperLimitEnabled = (options === null || options === void 0 ? void 0 : options.upperLimit) !== undefined ? true : false;
        /**
         * Lower constraint limit. The constraint position is forced to be larger than this value.
         * @property lowerLimit
         * @type {Number}
         */
        _this.lowerLimit = (_b = options === null || options === void 0 ? void 0 : options.lowerLimit) !== null && _b !== void 0 ? _b : 0;
        /**
         * Upper constraint limit. The constraint position is forced to be smaller than this value.
         * @property upperLimit
         * @type {Number}
         */
        _this.upperLimit = (_c = options === null || options === void 0 ? void 0 : options.upperLimit) !== null && _c !== void 0 ? _c : 1;
        // Equations used for limits
        _this.upperLimitEquation = new contact_equation_1.default(bodyA, bodyB);
        _this.lowerLimitEquation = new contact_equation_1.default(bodyA, bodyB);
        // Set max/min forces
        _this.upperLimitEquation.minForce = _this.lowerLimitEquation.minForce = 0;
        _this.upperLimitEquation.maxForce = _this.lowerLimitEquation.maxForce = maxForce;
        /**
         * Equation used for the motor.
         * @property motorEquation
         * @type {Equation}
         */
        _this.motorEquation = new Equation_1.default(bodyA, bodyB);
        /**
         * The current motor state. Enable or disable the motor using .enableMotor
         * @property motorEnabled
         * @type {Boolean}
         */
        _this.motorEnabled = false;
        /**
         * Set the target speed for the motor.
         * @property motorSpeed
         * @type {Number}
         */
        _this.motorSpeed = 0;
        var that = _this;
        var motorEquation = _this.motorEquation;
        motorEquation.computeGq = function () { return 0; };
        motorEquation.computeGW = function () {
            var G = this.G, bi = this.bodyA, bj = this.bodyB, vi = bi.velocity, vj = bj.velocity, wi = bi.angularVelocity, wj = bj.angularVelocity;
            return this.gmult(G, vi, wi, vj, wj) + that.motorSpeed;
        };
        return _this;
    }
    /**
     * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
     * @method update
     */
    PrismaticConstraint.prototype.update = function () {
        var eqs = this.equations, trans = eqs[0], upperLimit = this.upperLimit, lowerLimit = this.lowerLimit, upperLimitEquation = this.upperLimitEquation, lowerLimitEquation = this.lowerLimitEquation, bodyA = this.bodyA, bodyB = this.bodyB, localAxisA = this.localAxisA, localAnchorA = this.localAnchorA, localAnchorB = this.localAnchorB;
        trans.updateJacobian();
        // Transform local things to world
        vec2_1.default.rotate(worldAxisA, localAxisA, bodyA.angle);
        vec2_1.default.rotate(orientedAnchorA, localAnchorA, bodyA.angle);
        vec2_1.default.add(worldAnchorA, orientedAnchorA, bodyA.position);
        vec2_1.default.rotate(orientedAnchorB, localAnchorB, bodyB.angle);
        vec2_1.default.add(worldAnchorB, orientedAnchorB, bodyB.position);
        var relPosition = this.position = vec2_1.default.dot(worldAnchorB, worldAxisA) - vec2_1.default.dot(worldAnchorA, worldAxisA);
        // Motor
        if (this.motorEnabled) {
            // G = [ a     a x ri   -a   -a x rj ]
            var G = this.motorEquation.G;
            G[0] = worldAxisA[0];
            G[1] = worldAxisA[1];
            G[2] = vec2_1.default.crossLength(worldAxisA, orientedAnchorB);
            G[3] = -worldAxisA[0];
            G[4] = -worldAxisA[1];
            G[5] = -vec2_1.default.crossLength(worldAxisA, orientedAnchorA);
        }
        /*
            Limits strategy:
            Add contact equation, with normal along the constraint axis.
            min/maxForce is set so the constraint is repulsive in the correct direction.
            Some offset is added to either equation.contactPointA or .contactPointB to get the correct upper/lower limit.

                    ^
                    |
        upperLimit x
                    |    ------
            anchorB x<---|  B |
                    |    |    |
            ------   |    ------
            |    |   |
            |  A |-->x anchorA
            ------   |
                    x lowerLimit
                    |
                    axis
        */
        if (this.upperLimitEnabled && relPosition > upperLimit) {
            // Update contact constraint normal, etc
            vec2_1.default.scale(upperLimitEquation.normalA, worldAxisA, -1);
            vec2_1.default.subtract(upperLimitEquation.contactPointA, worldAnchorA, bodyA.position);
            vec2_1.default.subtract(upperLimitEquation.contactPointB, worldAnchorB, bodyB.position);
            vec2_1.default.scale(tmp, worldAxisA, upperLimit);
            vec2_1.default.add(upperLimitEquation.contactPointA, upperLimitEquation.contactPointA, tmp);
            if (eqs.indexOf(upperLimitEquation) === -1) {
                eqs.push(upperLimitEquation);
            }
        }
        else {
            var idx = eqs.indexOf(upperLimitEquation);
            if (idx !== -1) {
                eqs.splice(idx, 1);
            }
        }
        if (this.lowerLimitEnabled && relPosition < lowerLimit) {
            // Update contact constraint normal, etc
            vec2_1.default.scale(lowerLimitEquation.normalA, worldAxisA, 1);
            vec2_1.default.subtract(lowerLimitEquation.contactPointA, worldAnchorA, bodyA.position);
            vec2_1.default.subtract(lowerLimitEquation.contactPointB, worldAnchorB, bodyB.position);
            vec2_1.default.scale(tmp, worldAxisA, lowerLimit);
            vec2_1.default.subtract(lowerLimitEquation.contactPointB, lowerLimitEquation.contactPointB, tmp);
            if (eqs.indexOf(lowerLimitEquation) === -1) {
                eqs.push(lowerLimitEquation);
            }
        }
        else {
            var idx = eqs.indexOf(lowerLimitEquation);
            if (idx !== -1) {
                eqs.splice(idx, 1);
            }
        }
    };
    /**
     * Enable the motor
     * @method enableMotor
     */
    PrismaticConstraint.prototype.enableMotor = function () {
        if (this.motorEnabled) {
            return;
        }
        this.equations.push(this.motorEquation);
        this.motorEnabled = true;
    };
    /**
     * Disable the rotational motor
     * @method disableMotor
     */
    PrismaticConstraint.prototype.disableMotor = function () {
        if (!this.motorEnabled) {
            return;
        }
        var i = this.equations.indexOf(this.motorEquation);
        this.equations.splice(i, 1);
        this.motorEnabled = false;
    };
    /**
     * Set the constraint limits.
     * @method setLimits
     * @param {number} lower Lower limit.
     * @param {number} upper Upper limit.
     */
    PrismaticConstraint.prototype.setLimits = function (lower, upper) {
        if (typeof (lower) === 'number') {
            this.lowerLimit = lower;
            this.lowerLimitEnabled = true;
        }
        else {
            this.lowerLimit = lower;
            this.lowerLimitEnabled = false;
        }
        if (typeof (upper) === 'number') {
            this.upperLimit = upper;
            this.upperLimitEnabled = true;
        }
        else {
            this.upperLimit = upper;
            this.upperLimitEnabled = false;
        }
    };
    return PrismaticConstraint;
}(constraint_1.default));
exports.default = PrismaticConstraint;

},{"../equations/Equation":14,"../equations/contact-equation":16,"../equations/rotational-lock-equation":19,"../math/vec2":28,"./constraint":8}],13:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var constraint_1 = __importDefault(_dereq_("./constraint"));
var Equation_1 = __importDefault(_dereq_("../equations/Equation"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var rotational_velocity_equation_1 = __importDefault(_dereq_("../equations/rotational-velocity-equation"));
var rotational_lock_equation_1 = __importDefault(_dereq_("../equations/rotational-lock-equation"));
var sub = vec2_1.default.subtract;
var add = vec2_1.default.add;
var dot = vec2_1.default.dot;
var rotate = vec2_1.default.rotate;
var copy = vec2_1.default.copy;
var crossLength = vec2_1.default.crossLength;
var worldPivotA = vec2_1.default.create(), worldPivotB = vec2_1.default.create(), xAxis = vec2_1.default.fromValues(1, 0), yAxis = vec2_1.default.fromValues(0, 1), g = vec2_1.default.create();
var RevoluteConstraint = /** @class */ (function (_super) {
    __extends(RevoluteConstraint, _super);
    /**
     * Connects two bodies at given offset points, letting them rotate relative to each other around this point.
     * @class RevoluteConstraint
     * @constructor
     * @author schteppe
     * @param {Body}    bodyA
     * @param {Body}    bodyB
     * @param {Object}  [options]
     * @param {Array}   [options.worldPivot] A pivot point given in world coordinates. If specified, localPivotA and localPivotB are automatically computed from this value.
     * @param {Array}   [options.localPivotA] The point relative to the center of mass of bodyA which bodyA is constrained to.
     * @param {Array}   [options.localPivotB] See localPivotA.
     * @param {Number}  [options.maxForce] The maximum force that should be applied to constrain the bodies.
     * @extends Constraint
     *
     * @example
     *     // This will create a revolute constraint between two bodies with pivot point in between them.
     *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
     *     world.addBody(bodyA);
     *
     *     var bodyB = new Body({ mass: 1, position: [1, 0] });
     *     world.addBody(bodyB);
     *
     *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
     *         worldPivot: [0, 0]
     *     });
     *     world.addConstraint(constraint);
     *
     *     // Using body-local pivot points, the constraint could have been constructed like this:
     *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
     *         localPivotA: [1, 0],
     *         localPivotB: [-1, 0]
     *     });
     */
    function RevoluteConstraint(bodyA, bodyB, options) {
        var _a;
        var _this = _super.call(this, bodyA, bodyB, constraint_1.default.REVOLUTE, options) || this;
        var maxForce = _this.maxForce = (_a = options === null || options === void 0 ? void 0 : options.maxForce) !== null && _a !== void 0 ? _a : Infinity;
        var pivotA = _this.pivotA = vec2_1.default.create();
        var pivotB = _this.pivotB = vec2_1.default.create();
        if (options === null || options === void 0 ? void 0 : options.worldPivot) {
            // Compute pivotA and pivotB
            sub(pivotA, options.worldPivot, bodyA.position);
            sub(pivotB, options.worldPivot, bodyB.position);
            // Rotate to local coordinate system
            rotate(pivotA, pivotA, -bodyA.angle);
            rotate(pivotB, pivotB, -bodyB.angle);
        }
        else {
            // Get pivotA and pivotB
            if (options === null || options === void 0 ? void 0 : options.localPivotA) {
                copy(pivotA, options.localPivotA);
            }
            if (options === null || options === void 0 ? void 0 : options.localPivotB) {
                copy(pivotB, options.localPivotB);
            }
        }
        var motorEquation = _this.motorEquation = new rotational_velocity_equation_1.default(bodyA, bodyB);
        motorEquation.enabled = false;
        var upperLimitEquation = _this.upperLimitEquation = new rotational_lock_equation_1.default(bodyA, bodyB);
        var lowerLimitEquation = _this.lowerLimitEquation = new rotational_lock_equation_1.default(bodyA, bodyB);
        upperLimitEquation.minForce = lowerLimitEquation.maxForce = 0;
        // Equations to be fed to the solver
        var eqs = _this.equations = [
            new Equation_1.default(bodyA, bodyB, -maxForce, maxForce),
            new Equation_1.default(bodyA, bodyB, -maxForce, maxForce),
            motorEquation,
            upperLimitEquation,
            lowerLimitEquation
        ];
        var x = eqs[0];
        var y = eqs[1];
        // TODO: bad practice.
        x.computeGq = function () {
            rotate(worldPivotA, pivotA, bodyA.angle);
            rotate(worldPivotB, pivotB, bodyB.angle);
            add(g, bodyB.position, worldPivotB);
            sub(g, g, bodyA.position);
            sub(g, g, worldPivotA);
            return dot(g, xAxis);
        };
        y.computeGq = function () {
            rotate(worldPivotA, pivotA, bodyA.angle);
            rotate(worldPivotB, pivotB, bodyB.angle);
            add(g, bodyB.position, worldPivotB);
            sub(g, g, bodyA.position);
            sub(g, g, worldPivotA);
            return dot(g, yAxis);
        };
        y.minForce = x.minForce = -maxForce;
        y.maxForce = x.maxForce = maxForce;
        // These never change but the angular parts do
        x.G[0] = -1;
        x.G[1] = 0;
        x.G[3] = 1;
        x.G[4] = 0;
        y.G[0] = 0;
        y.G[1] = -1;
        y.G[3] = 0;
        y.G[4] = 1;
        _this.angle = 0;
        _this.lowerLimitEnabled = false;
        _this.upperLimitEnabled = false;
        _this.lowerLimit = 0;
        _this.upperLimit = 0;
        return _this;
    }
    /**
     * Set the constraint angle limits, and enable them.
     * @method setLimits
     * @param {number} lower Lower angle limit.
     * @param {number} upper Upper angle limit.
     */
    RevoluteConstraint.prototype.setLimits = function (lower, upper) {
        this.lowerLimit = lower;
        this.upperLimit = upper;
        this.lowerLimitEnabled = this.upperLimitEnabled = true;
    };
    RevoluteConstraint.prototype.update = function () {
        var bodyA = this.bodyA, bodyB = this.bodyB, pivotA = this.pivotA, pivotB = this.pivotB, eqs = this.equations, x = eqs[0], y = eqs[1], upperLimit = this.upperLimit, lowerLimit = this.lowerLimit, upperLimitEquation = this.upperLimitEquation, lowerLimitEquation = this.lowerLimitEquation;
        var relAngle = this.angle = bodyB.angle - bodyA.angle;
        upperLimitEquation.angle = upperLimit;
        upperLimitEquation.enabled = this.upperLimitEnabled && relAngle > upperLimit;
        lowerLimitEquation.angle = lowerLimit;
        lowerLimitEquation.enabled = this.lowerLimitEnabled && relAngle < lowerLimit;
        /*

        The constraint violation is

            g = xj + rj - xi - ri

        ...where xi and xj are the body positions and ri and rj world-oriented offset vectors. Differentiate:

            gdot = vj + wj x rj - vi - wi x ri

        We split this into x and y directions. (let x and y be unit vectors along the respective axes)

            gdot * x = ( vj + wj x rj - vi - wi x ri ) * x
                    = ( vj*x + (wj x rj)*x -vi*x -(wi x ri)*x
                    = ( vj*x + (rj x x)*wj -vi*x -(ri x x)*wi
                    = [ -x   -(ri x x)   x   (rj x x)] * [vi wi vj wj]
                    = G*W

        ...and similar for y. We have then identified the jacobian entries for x and y directions:

            Gx = [ x   (rj x x)   -x   -(ri x x)]
            Gy = [ y   (rj x y)   -y   -(ri x y)]

        So for example, in the X direction we would get in 2 dimensions

            G = [ [1   0   (rj x [1,0])   -1   0   -(ri x [1,0])]
                [0   1   (rj x [0,1])    0  -1   -(ri x [0,1])]
        */
        rotate(worldPivotA, pivotA, bodyA.angle);
        rotate(worldPivotB, pivotB, bodyB.angle);
        // @todo: these are a bit sparse. We could save some computations on making custom eq.computeGW functions, etc
        var xG = x.G;
        xG[2] = -crossLength(worldPivotA, xAxis);
        xG[5] = crossLength(worldPivotB, xAxis);
        var yG = y.G;
        yG[2] = -crossLength(worldPivotA, yAxis);
        yG[5] = crossLength(worldPivotB, yAxis);
    };
    Object.defineProperty(RevoluteConstraint.prototype, "motorEnabled", {
        /**
         * @property {boolean} motorEnabled
         */
        get: function () {
            return this.motorEquation.enabled;
        },
        set: function (value) {
            this.motorEquation.enabled = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RevoluteConstraint.prototype, "motorSpeed", {
        /**
         * @property {number} motorSpeed
         */
        get: function () {
            return this.motorEquation.relativeVelocity;
        },
        set: function (value) {
            this.motorEquation.relativeVelocity = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RevoluteConstraint.prototype, "motorMaxForce", {
        /**
         * @property {number} motorMaxForce
         */
        get: function () {
            return this.motorEquation.maxForce;
        },
        set: function (value) {
            var eq = this.motorEquation;
            eq.maxForce = value;
            eq.minForce = -value;
        },
        enumerable: false,
        configurable: true
    });
    return RevoluteConstraint;
}(constraint_1.default));
exports.default = RevoluteConstraint;

},{"../equations/Equation":14,"../equations/rotational-lock-equation":19,"../equations/rotational-velocity-equation":20,"../math/vec2":28,"./constraint":8}],14:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
// Shortcuts.
var scale = vec2_1.default.scale, multiply = vec2_1.default.multiply, createVec2 = vec2_1.default.create;
var Equation = /** @class */ (function () {
    /**
     * Base class for constraint equations.
     * @class Equation
     * @constructor
     * @param {Body} bodyA First body participating in the equation
     * @param {Body} bodyB Second body participating in the equation
     * @param {number} minForce Minimum force to apply. Default: -Infinity
     * @param {number} maxForce Maximum force to apply. Default: Infinity
     */
    function Equation(bodyA, bodyB, minForce, maxForce) {
        /**
         * Cap the constraint violation (G*q) to this value.
         * @property maxBias
         * @type {Number}
         */
        this.maxBias = Infinity;
        /**
         * The stiffness of this equation. Typically chosen to a large number (~1e7), but can be chosen somewhat freely to get a stable simulation.
         * @property stiffness
         * @type {Number}
         */
        this.stiffness = Equation.DEFAULT_STIFFNESS;
        /**
         * The number of time steps needed to stabilize the constraint equation. Typically between 3 and 5 time steps.
         * @property relaxation
         * @type {Number}
         */
        this.relaxation = Equation.DEFAULT_RELAXATION;
        this.offset = 0;
        this.a = 0;
        this.b = 0;
        this.epsilon = 0;
        this.timeStep = 1 / 60;
        /**
         * Indicates if stiffness or relaxation was changed.
         * @property {Boolean} needsUpdate
         */
        this.needsUpdate = true;
        /**
         * The resulting constraint multiplier from the last solve. This is mostly equivalent to the force produced by the constraint.
         * @property multiplier
         * @type {Number}
         */
        this.multiplier = 0;
        /**
         * Relative velocity.
         * @property {Number} relativeVelocity
         */
        this.relativeVelocity = 0;
        /**
         * Whether this equation is enabled or not. If true, it will be added to the solver.
         * @property {Boolean} enabled
         */
        this.enabled = true;
        // Temp stuff
        this.maxForceDt = 0;
        this.minForceDt = 0;
        this.invC = 0;
        this.B = 0;
        this.lambda = 0;
        this.index = -1;
        this.minForce = minForce !== null && minForce !== void 0 ? minForce : -Infinity;
        this.maxForce = maxForce !== null && maxForce !== void 0 ? maxForce : Infinity;
        this.maxBias = Infinity;
        this.bodyA = bodyA !== null && bodyA !== void 0 ? bodyA : null;
        this.bodyB = bodyB !== null && bodyB !== void 0 ? bodyB : null;
        this.stiffness = Equation.DEFAULT_STIFFNESS;
        this.relaxation = Equation.DEFAULT_RELAXATION;
        this.G = new Float32Array(6);
        for (var i = 0; i < 6; i++) {
            this.G[i] = 0;
        }
    }
    /**
     * Compute SPOOK parameters .a, .b and .epsilon according to the current parameters. See equations 9, 10 and 11 in the <a href="http://www8.cs.umu.se/kurser/5DV058/VT09/lectures/spooknotes.pdf">SPOOK notes</a>.
     * @method update
     */
    Equation.prototype.update = function () {
        var k = this.stiffness, d = this.relaxation, h = this.timeStep;
        this.a = 4 / (h * (1 + 4 * d));
        this.b = (4 * d) / (1 + 4 * d);
        this.epsilon = 4 / (h * h * k * (1 + 4 * d));
        this.needsUpdate = false;
    };
    /**
     * Multiply a jacobian entry with corresponding positions or velocities
     * @method gmult
     * @return {Number}
     */
    Equation.prototype.gmult = function (G, vi, wi, vj, wj) {
        return G[0] * vi[0] +
            G[1] * vi[1] +
            G[2] * wi +
            G[3] * vj[0] +
            G[4] * vj[1] +
            G[5] * wj;
    };
    /**
     * Computes the RHS of the SPOOK equation
     * @method computeB
     * @return {Number}
     */
    Equation.prototype.computeB = function (a, b, h) {
        var GW = this.computeGW();
        var Gq = this.computeGq();
        var maxBias = this.maxBias;
        if (Math.abs(Gq) > maxBias) {
            Gq = Gq > 0 ? maxBias : -maxBias;
        }
        var GiMf = this.computeGiMf();
        var B = -Gq * a - GW * b - GiMf * h;
        return B;
    };
    /**
     * Computes G\*q, where q are the generalized body coordinates
     * @method computeGq
     * @return {Number}
     */
    Equation.prototype.computeGq = function () {
        var G = this.G, bi = this.bodyA, bj = this.bodyB;
        if (!bi || !bj)
            return 0;
        var ai = bi.angle, aj = bj.angle;
        var qi = createVec2(), qj = createVec2();
        return this.gmult(G, qi, ai, qj, aj) + this.offset;
    };
    /**
     * Computes G\*W, where W are the body velocities
     * @method computeGW
     * @return {Number}
     */
    Equation.prototype.computeGW = function () {
        var G = this.G, bi = this.bodyA, bj = this.bodyB;
        if (!bi || !bj)
            return 0;
        var vi = bi.velocity, vj = bj.velocity, wi = bi.angularVelocity, wj = bj.angularVelocity;
        return this.gmult(G, vi, wi, vj, wj) + this.relativeVelocity;
    };
    /**
     * Computes G\*Wlambda, where W are the body velocities
     * @method computeGWlambda
     * @return {Number}
     */
    Equation.prototype.computeGWlambda = function () {
        var G = this.G, bi = this.bodyA, bj = this.bodyB;
        if (!bi || !bj)
            return 0;
        var vi = bi.vlambda, vj = bj.vlambda, wi = bi.wlambda, wj = bj.wlambda;
        return this.gmult(G, vi, wi, vj, wj);
    };
    /**
     * Computes G\*inv(M)\*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
     * @method computeGiMf
     * @return {Number}
     */
    Equation.prototype.computeGiMf = function () {
        var bi = this.bodyA, bj = this.bodyB;
        if (!bi || !bj)
            return 0;
        var fi = bi.force, ti = bi.angularForce, fj = bj.force, tj = bj.angularForce, invMassi = bi.invMassSolve, invMassj = bj.invMassSolve, invIi = bi.invInertiaSolve, invIj = bj.invInertiaSolve, G = this.G;
        var iMfi = createVec2(), iMfj = createVec2();
        scale(iMfi, fi, invMassi);
        multiply(iMfi, bi.massMultiplier, iMfi);
        scale(iMfj, fj, invMassj);
        multiply(iMfj, bj.massMultiplier, iMfj);
        return this.gmult(G, iMfi, ti * invIi, iMfj, tj * invIj);
    };
    /**
     * Computes G\*inv(M)\*G'
     * @method computeGiMGt
     * @return {Number}
     */
    Equation.prototype.computeGiMGt = function () {
        var bi = this.bodyA, bj = this.bodyB;
        if (!bi || !bj)
            return 0;
        var invMassi = bi.invMassSolve, invMassj = bj.invMassSolve, invIi = bi.invInertiaSolve, invIj = bj.invInertiaSolve, G = this.G;
        return G[0] * G[0] * invMassi * bi.massMultiplier[0] +
            G[1] * G[1] * invMassi * bi.massMultiplier[1] +
            G[2] * G[2] * invIi +
            G[3] * G[3] * invMassj * bj.massMultiplier[0] +
            G[4] * G[4] * invMassj * bj.massMultiplier[1] +
            G[5] * G[5] * invIj;
    };
    Equation.prototype.updateJacobian = function () { };
    ;
    /**
     * Add constraint velocity to the bodies.
     * @method addToWlambda
     * @param {Number} deltalambda
     */
    Equation.prototype.addToWlambda = function (deltalambda) {
        var bi = this.bodyA, bj = this.bodyB;
        if (!bi || !bj)
            return;
        var invMassi = bi.invMassSolve, invMassj = bj.invMassSolve, invIi = bi.invInertiaSolve, invIj = bj.invInertiaSolve, G = this.G;
        // v_lambda = G * inv(M) * delta_lambda
        addToVLambda(bi.vlambda, G[0], G[1], invMassi, deltalambda, bi.massMultiplier);
        bi.wlambda += invIi * G[2] * deltalambda;
        addToVLambda(bj.vlambda, G[3], G[4], invMassj, deltalambda, bj.massMultiplier);
        bj.wlambda += invIj * G[5] * deltalambda;
    };
    /**
     * Compute the denominator part of the SPOOK equation: C = G\*inv(M)\*G' + eps
     * @method computeInvC
     * @param  {Number} eps
     * @return {Number}
     */
    Equation.prototype.computeInvC = function (eps) {
        var invC = 1 / (this.computeGiMGt() + eps);
        return invC;
    };
    /**
     * The default stiffness when creating a new Equation.
     * @static
     * @property {Number} DEFAULT_STIFFNESS
     * @default 1e6
     */
    Equation.DEFAULT_STIFFNESS = 1e6;
    /**
     * The default relaxation when creating a new Equation.
     * @static
     * @property {Number} DEFAULT_RELAXATION
     * @default 4
     */
    Equation.DEFAULT_RELAXATION = 4;
    return Equation;
}());
exports.default = Equation;
function addToVLambda(vlambda, Gx, Gy, invMass, deltalambda, massMultiplier) {
    vlambda[0] += Gx * invMass * deltalambda * massMultiplier[0];
    vlambda[1] += Gy * invMass * deltalambda * massMultiplier[1];
}

},{"../math/vec2":28}],15:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Equation_1 = __importDefault(_dereq_("./Equation"));
var AngleLockEquation = /** @class */ (function (_super) {
    __extends(AngleLockEquation, _super);
    /**
     * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
     *
     * @class AngleLockEquation
     * @constructor
     * @extends Equation
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {Number} [options.angle] Angle to add to the local vector in body A.
     * @param {Number} [options.ratio] Gear ratio
     */
    function AngleLockEquation(bodyA, bodyB, options) {
        var _a, _b;
        var _this = _super.call(this, bodyA, bodyB, -Infinity, Infinity) || this;
        _this.angle = (_a = options === null || options === void 0 ? void 0 : options.angle) !== null && _a !== void 0 ? _a : 0;
        _this.ratio = (_b = options === null || options === void 0 ? void 0 : options.ratio) !== null && _b !== void 0 ? _b : 1;
        _this.setRatio(_this.ratio);
        return _this;
    }
    AngleLockEquation.prototype.computeGq = function () {
        return this.ratio * this.bodyA.angle - this.bodyB.angle + this.angle;
    };
    /**
     * Set the gear ratio for this equation
     * @method setRatio
     * @param {Number} ratio
     */
    AngleLockEquation.prototype.setRatio = function (ratio) {
        var G = this.G;
        G[2] = ratio;
        G[5] = -1;
        this.ratio = ratio;
    };
    /**
     * Set the max force for the equation.
     * @method setMaxTorque
     * @param {Number} torque
     */
    AngleLockEquation.prototype.setMaxTorque = function (torque) {
        this.maxForce = torque;
        this.minForce = -torque;
    };
    return AngleLockEquation;
}(Equation_1.default));
exports.default = AngleLockEquation;

},{"./Equation":14}],16:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Equation_1 = __importDefault(_dereq_("./Equation"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
function addSubSub(out, a, b, c, d) {
    out[0] = a[0] + b[0] - c[0] - d[0];
    out[1] = a[1] + b[1] - c[1] - d[1];
}
var vi = vec2_1.default.create();
var vj = vec2_1.default.create();
var relVel = vec2_1.default.create();
var ContactEquation = /** @class */ (function (_super) {
    __extends(ContactEquation, _super);
    /**
     * Non-penetration constraint equation. Tries to make the contactPointA and contactPointB vectors coincide, while keeping the applied force repulsive.
     *
     * @class ContactEquation
     * @constructor
     * @extends Equation
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    function ContactEquation(bodyA, bodyB) {
        var _this = _super.call(this, bodyA, bodyB, 0, Infinity) || this;
        /**
         * Vector from body i center of mass to the contact point.
         * @property contactPointA
         * @type {Array}
         */
        _this.contactPointA = vec2_1.default.create();
        _this.penetrationVec = vec2_1.default.create();
        /**
         * World-oriented vector from body A center of mass to the contact point.
         * @property contactPointB
         * @type {Array}
         */
        _this.contactPointB = vec2_1.default.create();
        /**
         * The normal vector, pointing out of body i
         * @property normalA
         * @type {Array}
         */
        _this.normalA = vec2_1.default.create();
        /**
         * The restitution to use (0=no bounciness, 1=max bounciness).
         * @property restitution
         * @type {Number}
         */
        _this.restitution = 0;
        /**
         * This property is set to true if this is the first impact between the bodies (not persistant contact).
         * @property firstImpact
         * @type {Boolean}
         * @readOnly
         */
        _this.firstImpact = false;
        /**
         * The shape in body i that triggered this contact.
         * @property shapeA
         * @type {Shape}
         */
        _this.shapeA = null;
        /**
         * The shape in body j that triggered this contact.
         * @property shapeB
         * @type {Shape}
         */
        _this.shapeB = null;
        return _this;
    }
    ContactEquation.prototype.computeB = function (a, b, h) {
        var _a, _b;
        var bi = this.bodyA, bj = this.bodyB, ri = this.contactPointA, rj = this.contactPointB, xi = (_a = bi === null || bi === void 0 ? void 0 : bi.position) !== null && _a !== void 0 ? _a : new Float32Array(2), xj = (_b = bj === null || bj === void 0 ? void 0 : bj.position) !== null && _b !== void 0 ? _b : new Float32Array(2);
        var n = this.normalA, G = this.G;
        // Caluclate cross products
        var rixn = vec2_1.default.crossLength(ri, n), rjxn = vec2_1.default.crossLength(rj, n);
        // G = [-n -rixn n rjxn]
        G[0] = -n[0];
        G[1] = -n[1];
        G[2] = -rixn;
        G[3] = n[0];
        G[4] = n[1];
        G[5] = rjxn;
        // Compute iteration
        var GW, Gq;
        if (this.firstImpact && this.restitution !== 0) {
            Gq = 0;
            GW = (1 / b) * (1 + this.restitution) * this.computeGW();
        }
        else {
            // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
            var penetrationVec = this.penetrationVec;
            addSubSub(penetrationVec, xj, rj, xi, ri);
            Gq = vec2_1.default.dot(n, penetrationVec) + this.offset;
            GW = this.computeGW();
        }
        var GiMf = this.computeGiMf();
        var B = -Gq * a - GW * b - h * GiMf;
        return B;
    };
    ;
    /**
     * Get the relative velocity along the normal vector.
     * @method getVelocityAlongNormal
     * @return {number}
     */
    ContactEquation.prototype.getVelocityAlongNormal = function () {
        this.bodyA && this.bodyA.getVelocityAtPoint(vi, this.contactPointA);
        this.bodyB && this.bodyB.getVelocityAtPoint(vj, this.contactPointB);
        vec2_1.default.subtract(relVel, vi, vj);
        return vec2_1.default.dot(this.normalA, relVel);
    };
    ;
    return ContactEquation;
}(Equation_1.default));
exports.default = ContactEquation;

},{"../math/vec2":28,"./Equation":14}],17:[function(_dereq_,module,exports){
module.exports=_dereq_(14)
},{"../math/vec2":28}],18:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var Equation_1 = __importDefault(_dereq_("./Equation"));
var FrictionEquation = /** @class */ (function (_super) {
    __extends(FrictionEquation, _super);
    /**
     * Constrains the slipping in a contact along a tangent
     *
     * @class FrictionEquation
     * @constructor
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Number} slipForce
     * @extends Equation
     */
    function FrictionEquation(bodyA, bodyB, slipForce) {
        if (slipForce === void 0) { slipForce = Infinity; }
        var _this = _super.call(this, bodyA, bodyB, -slipForce, slipForce) || this;
        /**
         * Relative vector from center of body A to the contact point, world oriented.
         * @property contactPointA
         * @type {Array}
         */
        _this.contactPointA = vec2_1.default.create();
        /**
         * Relative vector from center of body B to the contact point, world oriented.
         * @property contactPointB
         * @type {Array}
         */
        _this.contactPointB = vec2_1.default.create();
        /**
         * Tangent vector that the friction force will act along. World oriented.
         * @property t
         * @type {Array}
         */
        _this.t = vec2_1.default.create();
        /**
         * ContactEquations connected to this friction equation. The contact equations can be used to rescale the max force for the friction. If more than one contact equation is given, then the max force can be set to the average.
         * @property contactEquations
         * @type {ContactEquation[]}
         */
        _this.contactEquations = [];
        /**
         * The shape in body i that triggered this friction.
         * @property shapeA
         * @type {Shape}
         * @todo Needed? The shape can be looked up via contactEquation.shapeA...
         */
        _this.shapeA = null;
        /**
         * The shape in body j that triggered this friction.
         * @property shapeB
         * @type {Shape}
         * @todo Needed? The shape can be looked up via contactEquation.shapeB...
         */
        _this.shapeB = null;
        /**
         * The friction coefficient to use.
         * @property frictionCoefficient
         * @type {Number}
         */
        _this.frictionCoefficient = 0.3;
        return _this;
    }
    /**
     * Set the slipping condition for the constraint. The friction force cannot be
     * larger than this value.
     * @method setSlipForce
     * @param  {Number} slipForce
     */
    FrictionEquation.prototype.setSlipForce = function (slipForce) {
        this.maxForce = slipForce;
        this.minForce = -slipForce;
    };
    ;
    /**
     * Get the max force for the constraint.
     * @method getSlipForce
     * @return {Number}
     */
    FrictionEquation.prototype.getSlipForce = function () {
        return this.maxForce;
    };
    ;
    FrictionEquation.prototype.computeB = function (a, b, h) {
        var ri = this.contactPointA, rj = this.contactPointB, t = this.t, G = this.G;
        // G = [-t -rixt t rjxt]
        // And remember, this is a pure velocity constraint, g is always zero!
        G[0] = -t[0];
        G[1] = -t[1];
        G[2] = -vec2_1.default.crossLength(ri, t);
        G[3] = t[0];
        G[4] = t[1];
        G[5] = vec2_1.default.crossLength(rj, t);
        var GW = this.computeGW(), GiMf = this.computeGiMf();
        var B = /* - g * a  */ -GW * b - h * GiMf;
        return B;
    };
    ;
    return FrictionEquation;
}(Equation_1.default));
exports.default = FrictionEquation;

},{"../math/vec2":28,"./Equation":14}],19:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Equation_1 = __importDefault(_dereq_("./Equation"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var worldVectorA = vec2_1.default.create(), worldVectorB = vec2_1.default.create(), xAxis = vec2_1.default.fromValues(1, 0), yAxis = vec2_1.default.fromValues(0, 1);
var RotationalLockEquation = /** @class */ (function (_super) {
    __extends(RotationalLockEquation, _super);
    /**
     * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
     *
     * @class RotationalLockEquation
     * @constructor
     * @extends Equation
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {Number} [options.angle] Angle to add to the local vector in bodyA.
     */
    function RotationalLockEquation(bodyA, bodyB, options) {
        var _a;
        var _this = _super.call(this, bodyA, bodyB, -Infinity, Infinity) || this;
        _this.angle = (_a = options === null || options === void 0 ? void 0 : options.angle) !== null && _a !== void 0 ? _a : 0;
        var G = _this.G;
        G[2] = 1;
        G[5] = -1;
        return _this;
    }
    RotationalLockEquation.prototype.computeGq = function () {
        vec2_1.default.rotate(worldVectorA, xAxis, this.bodyA.angle + this.angle);
        vec2_1.default.rotate(worldVectorB, yAxis, this.bodyB.angle);
        return vec2_1.default.dot(worldVectorA, worldVectorB);
    };
    ;
    return RotationalLockEquation;
}(Equation_1.default));
exports.default = RotationalLockEquation;

},{"../math/vec2":28,"./Equation":14}],20:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Equation_1 = __importDefault(_dereq_("./Equation"));
var RotationalVelocityEquation = /** @class */ (function (_super) {
    __extends(RotationalVelocityEquation, _super);
    /**
     * Syncs rotational velocity of two bodies, or sets a relative velocity (motor).
     *
     * @class RotationalVelocityEquation
     * @constructor
     * @extends Equation
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    function RotationalVelocityEquation(bodyA, bodyB) {
        var _this = _super.call(this, bodyA, bodyB, -Infinity, Infinity) || this;
        _this.relativeVelocity = 1;
        _this.ratio = 1;
        return _this;
    }
    RotationalVelocityEquation.prototype.computeB = function (a, b, h) {
        var G = this.G;
        G[2] = -1;
        G[5] = this.ratio;
        var GiMf = this.computeGiMf();
        var GW = this.computeGW();
        var B = -GW * b - h * GiMf;
        return B;
    };
    return RotationalVelocityEquation;
}(Equation_1.default));
exports.default = RotationalVelocityEquation;

},{"./Equation":14}],21:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base class for objects that dispatches events.
 * @class EventEmitter
 * @example
 *     var emitter = new EventEmitter();
 *     emitter.on('myEvent', function(evt){
 *         console.log(evt.message);
 *     });
 *     emitter.emit({
 *         type: 'myEvent',
 *         message: 'Hello world!'
 *     });
 */
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this._listeners = {};
        this._contexts = {};
    }
    /**
     * Add an event listener
     * @method on
     * @param  {String} type
     * @param  {Function} listener
     * @return {EventEmitter} The self object, for chainability.
     * @example
     *     emitter.on('myEvent', function(evt){
     *         console.log('myEvt was triggered!');
     *     });
     */
    EventEmitter.prototype.on = function (type, listener, context) {
        if (this._listeners[type] === undefined) {
            this._listeners[type] = [];
            this._contexts[type] = [];
        }
        if (this._listeners[type].indexOf(listener) === -1) {
            this._listeners[type].push(listener);
            this._contexts[type].push(context);
        }
        return this;
    };
    /**
     * Remove an event listener
     * @method off
     * @param  {String} type
     * @param  {Function} listener
     * @return {EventEmitter} The self object, for chainability.
     * @example
     *     emitter.on('myEvent', handler); // Add handler
     *     emitter.off('myEvent', handler); // Remove handler
     */
    EventEmitter.prototype.off = function (type, listener) {
        if (!this._listeners || !this._listeners[type]) {
            return this;
        }
        var index = this._listeners[type].indexOf(listener);
        if (index !== -1) {
            this._listeners[type].splice(index, 1);
            this._contexts[type].splice(index, 1);
        }
        return this;
    };
    /**
     * Check if an event listener is added
     * @method has
     * @param  {String} type
     * @param  {Function} listener
     * @return {Boolean}
     */
    EventEmitter.prototype.has = function (type, listener) {
        if (this._listeners === undefined) {
            return false;
        }
        var listeners = this._listeners;
        if (listener) {
            if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
                return true;
            }
        }
        else {
            if (listeners[type] !== undefined) {
                return true;
            }
        }
        return false;
    };
    /**
     * Emit an event.
     * @method emit
     * @param  {Object} event
     * @param  {String} event.type
     * @return {EventEmitter} The self object, for chainability.
     * @example
     *     emitter.emit({
     *         type: 'myEvent',
     *         customData: 123
     *     });
     */
    // TODO: the unknown type here is disturbing.
    EventEmitter.prototype.emit = function (event) {
        if (this._listeners === undefined) {
            return this;
        }
        var listenerArray = this._listeners[event.type];
        var contextArray = this._contexts[event.type];
        if (listenerArray !== undefined) {
            event.target = this;
            // Need to copy the listener array, in case some listener was added/removed inside a listener
            var tmpListenerArray = [];
            var tmpContextArray = [];
            for (var i = 0, l = listenerArray.length; i < l; i++) {
                tmpListenerArray.push(listenerArray[i]);
                tmpContextArray.push(contextArray[i]);
            }
            for (var i = 0, l = listenerArray.length; i < l; i++) {
                var listener = listenerArray[i];
                var context = contextArray[i];
                listener.call(context, event);
            }
        }
        return this;
    };
    return EventEmitter;
}());
exports.default = EventEmitter;

},{}],22:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.vec2 = exports.World = exports.Utils = exports.RotationalSpring = exports.LinearSpring = exports.TopDownVehicle = exports.Spring = exports.Solver = exports.Shape = exports.SAPBroadphase = exports.RotationalVelocityEquation = exports.Box = exports.RaycastResult = exports.Ray = exports.PrismaticConstraint = exports.RevoluteConstraint = exports.Pool = exports.Plane = exports.Particle = exports.NaiveBroadphase = exports.Narrowphase = exports.Material = exports.LockConstraint = exports.Line = exports.Heightfield = exports.GSSolver = exports.GearConstraint = exports.FrictionEquationPool = exports.FrictionEquation = exports.EventEmitter = exports.Equation = exports.DistanceConstraint = exports.Convex = exports.ContactMaterial = exports.ContactEquationPool = exports.ContactEquation = exports.Constraint = exports.Circle = exports.Capsule = exports.Broadphase = exports.Body = exports.AngleLockEquation = exports.AABB = void 0;
var aabb_1 = __importDefault(_dereq_("./collision/aabb"));
exports.AABB = aabb_1.default;
var angle_lock_equation_1 = __importDefault(_dereq_("./equations/angle-lock-equation"));
exports.AngleLockEquation = angle_lock_equation_1.default;
var body_1 = __importDefault(_dereq_("./objects/body"));
exports.Body = body_1.default;
var broadphase_1 = __importDefault(_dereq_("./collision/broadphase"));
exports.Broadphase = broadphase_1.default;
var capsule_1 = __importDefault(_dereq_("./shapes/capsule"));
exports.Capsule = capsule_1.default;
var circle_1 = __importDefault(_dereq_("./shapes/circle"));
exports.Circle = circle_1.default;
var constraint_1 = __importDefault(_dereq_("./constraints/constraint"));
exports.Constraint = constraint_1.default;
var contact_equation_1 = __importDefault(_dereq_("./equations/contact-equation"));
exports.ContactEquation = contact_equation_1.default;
var contact_equation_pool_1 = __importDefault(_dereq_("./utils/contact-equation-pool"));
exports.ContactEquationPool = contact_equation_pool_1.default;
var contact_material_1 = __importDefault(_dereq_("./material/contact-material"));
exports.ContactMaterial = contact_material_1.default;
var convex_1 = __importDefault(_dereq_("./shapes/convex"));
exports.Convex = convex_1.default;
var distance_constraint_1 = __importDefault(_dereq_("./constraints/distance-constraint"));
exports.DistanceConstraint = distance_constraint_1.default;
var equation_1 = __importDefault(_dereq_("./equations/equation"));
exports.Equation = equation_1.default;
var event_emitter_1 = __importDefault(_dereq_("./events/event-emitter"));
exports.EventEmitter = event_emitter_1.default;
var friction_equation_1 = __importDefault(_dereq_("./equations/friction-equation"));
exports.FrictionEquation = friction_equation_1.default;
var friction_equation_pool_1 = __importDefault(_dereq_("./utils/friction-equation-pool"));
exports.FrictionEquationPool = friction_equation_pool_1.default;
var gear_constraint_1 = __importDefault(_dereq_("./constraints/gear-constraint"));
exports.GearConstraint = gear_constraint_1.default;
var gs_solver_1 = __importDefault(_dereq_("./solver/gs-solver"));
exports.GSSolver = gs_solver_1.default;
var heightfield_1 = __importDefault(_dereq_("./shapes/heightfield"));
exports.Heightfield = heightfield_1.default;
var line_1 = __importDefault(_dereq_("./shapes/line"));
exports.Line = line_1.default;
var lock_constraint_1 = __importDefault(_dereq_("./constraints/lock-constraint"));
exports.LockConstraint = lock_constraint_1.default;
var material_1 = __importDefault(_dereq_("./material/material"));
exports.Material = material_1.default;
var narrowphase_1 = __importDefault(_dereq_("./collision/narrowphase"));
exports.Narrowphase = narrowphase_1.default;
var naive_broadphase_1 = __importDefault(_dereq_("./collision/naive-broadphase"));
exports.NaiveBroadphase = naive_broadphase_1.default;
var particle_1 = __importDefault(_dereq_("./shapes/particle"));
exports.Particle = particle_1.default;
var plane_1 = __importDefault(_dereq_("./shapes/plane"));
exports.Plane = plane_1.default;
var pool_1 = __importDefault(_dereq_("./utils/pool"));
exports.Pool = pool_1.default;
var revolute_constraint_1 = __importDefault(_dereq_("./constraints/revolute-constraint"));
exports.RevoluteConstraint = revolute_constraint_1.default;
var prismatic_constraint_1 = __importDefault(_dereq_("./constraints/prismatic-constraint"));
exports.PrismaticConstraint = prismatic_constraint_1.default;
var ray_1 = __importDefault(_dereq_("./collision/ray"));
exports.Ray = ray_1.default;
var raycast_result_1 = __importDefault(_dereq_("./collision/raycast-result"));
exports.RaycastResult = raycast_result_1.default;
var Box_1 = __importDefault(_dereq_("./shapes/Box"));
exports.Box = Box_1.default;
var rotational_velocity_equation_1 = __importDefault(_dereq_("./equations/rotational-velocity-equation"));
exports.RotationalVelocityEquation = rotational_velocity_equation_1.default;
var sap_broadphase_1 = __importDefault(_dereq_("./collision/sap-broadphase"));
exports.SAPBroadphase = sap_broadphase_1.default;
var shape_1 = __importDefault(_dereq_("./shapes/shape"));
exports.Shape = shape_1.default;
var solver_1 = __importDefault(_dereq_("./solver/solver"));
exports.Solver = solver_1.default;
var spring_1 = __importDefault(_dereq_("./objects/spring"));
exports.Spring = spring_1.default;
var top_down_vehicle_1 = __importDefault(_dereq_("./objects/top-down-vehicle"));
exports.TopDownVehicle = top_down_vehicle_1.default;
var linear_spring_1 = __importDefault(_dereq_("./objects/linear-spring"));
exports.LinearSpring = linear_spring_1.default;
var rotational_spring_1 = __importDefault(_dereq_("./objects/rotational-spring"));
exports.RotationalSpring = rotational_spring_1.default;
var utils_1 = __importDefault(_dereq_("./utils/utils"));
exports.Utils = utils_1.default;
var world_1 = __importDefault(_dereq_("./world/world"));
exports.World = world_1.default;
var vec2_1 = __importDefault(_dereq_("./math/vec2"));
exports.vec2 = vec2_1.default;
var version = "0.0.1";
exports.version = version;

},{"./collision/aabb":1,"./collision/broadphase":2,"./collision/naive-broadphase":3,"./collision/narrowphase":4,"./collision/ray":5,"./collision/raycast-result":6,"./collision/sap-broadphase":7,"./constraints/constraint":8,"./constraints/distance-constraint":9,"./constraints/gear-constraint":10,"./constraints/lock-constraint":11,"./constraints/prismatic-constraint":12,"./constraints/revolute-constraint":13,"./equations/angle-lock-equation":15,"./equations/contact-equation":16,"./equations/equation":17,"./equations/friction-equation":18,"./equations/rotational-velocity-equation":20,"./events/event-emitter":21,"./material/contact-material":24,"./material/material":25,"./math/vec2":28,"./objects/body":30,"./objects/linear-spring":31,"./objects/rotational-spring":32,"./objects/spring":33,"./objects/top-down-vehicle":34,"./shapes/Box":35,"./shapes/capsule":39,"./shapes/circle":40,"./shapes/convex":41,"./shapes/heightfield":42,"./shapes/line":43,"./shapes/particle":44,"./shapes/plane":45,"./shapes/shape":46,"./solver/gs-solver":47,"./solver/solver":48,"./utils/contact-equation-pool":49,"./utils/friction-equation-pool":50,"./utils/pool":54,"./utils/utils":56,"./world/world":58}],23:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Material = /** @class */ (function () {
    /**
     * Defines a physics material. To be used with {{#crossLink "ContactMaterial"}}{{/crossLink}}.
     * @class Material
     * @constructor
     * @author schteppe
     * @example
     *     // Create a wooden box
     *     var woodMaterial = new Material();
     *     var boxShape = new Box({
     *         material: woodMaterial
     *     });
     *     body.addShape(boxShape);
     */
    function Material() {
        /**
         * The material identifier. Read only.
         * @readonly
         * @property id
         * @type {Number}
         */
        this.id = ++Material.idCounter;
    }
    Material.idCounter = 0;
    return Material;
}());
exports.default = Material;

},{}],24:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Material_1 = __importDefault(_dereq_("./Material"));
var Equation_1 = __importDefault(_dereq_("../equations/Equation"));
var ContactMaterial = /** @class */ (function () {
    /**
     * Defines what happens when two materials meet, such as what friction coefficient to use. You can also set other things such as restitution, surface velocity and constraint parameters. Also see {{#crossLink "Material"}}{{/crossLink}}.
     * @class ContactMaterial
     * @constructor
     * @param {Material} materialA
     * @param {Material} materialB
     * @param {Object}   [options]
     * @param {Number}   [options.friction=0.3]       Friction coefficient.
     * @param {Number}   [options.frictionRelaxation] FrictionEquation relaxation.
     * @param {Number}   [options.frictionStiffness]  FrictionEquation stiffness.
     * @param {Number}   [options.relaxation]         ContactEquation relaxation.
     * @param {Number}   [options.restitution=0]      Restitution coefficient aka "bounciness".
     * @param {Number}   [options.stiffness]          ContactEquation stiffness.
     * @param {Number}   [options.surfaceVelocity=0]  Surface velocity.
     * @author schteppe
     * @example
     *     var ice = new Material();
     *     var wood = new Material();
     *     var iceWoodContactMaterial = new ContactMaterial(ice, wood, {
     *         friction: 0.2,
     *         restitution: 0.3
     *     });
     *     world.addContactMaterial(iceWoodContactMaterial);
     */
    function ContactMaterial(materialA, materialB, options) {
        var _a, _b, _c, _d, _e, _f, _g;
        /**
         * Friction coefficient to use in the contact of these two materials. Friction = 0 will make the involved objects super slippery, and friction = 1 will make it much less slippery. A friction coefficient larger than 1 will allow for very large friction forces, which can be convenient for preventing car tires not slip on the ground.
         * @property friction
         * @type {Number}
         * @default 0.3
         */
        this.friction = 0.3;
        /**
         * Restitution, or "bounciness" to use in the contact of these two materials. A restitution of 0 will make no bounce, while restitution=1 will approximately bounce back with the same velocity the object came with.
         * @property restitution
         * @type {Number}
         * @default 0
         */
        this.restitution = 0;
        /**
         * Hardness of the contact. Less stiffness will make the objects penetrate more, and will make the contact act more like a spring than a contact force. Default value is {{#crossLink "Equation/DEFAULT_STIFFNESS:property"}}Equation.DEFAULT_STIFFNESS{{/crossLink}}.
         * @property stiffness
         * @type {Number}
         */
        this.stiffness = Equation_1.default.DEFAULT_STIFFNESS;
        /**
         * Relaxation of the resulting ContactEquation that this ContactMaterial generate. Default value is {{#crossLink "Equation/DEFAULT_RELAXATION:property"}}Equation.DEFAULT_RELAXATION{{/crossLink}}.
         * @property relaxation
         * @type {Number}
         */
        this.relaxation = Equation_1.default.DEFAULT_RELAXATION;
        /**
         * Stiffness of the resulting friction force. For most cases, the value of this property should be a large number. I cannot think of any case where you would want less frictionStiffness. Default value is {{#crossLink "Equation/DEFAULT_STIFFNESS:property"}}Equation.DEFAULT_STIFFNESS{{/crossLink}}.
         * @property frictionStiffness
         * @type {Number}
         */
        this.frictionStiffness = Equation_1.default.DEFAULT_STIFFNESS;
        /**
         * Relaxation of the resulting friction force. The default value should be good for most simulations. Default value is {{#crossLink "Equation/DEFAULT_RELAXATION:property"}}Equation.DEFAULT_RELAXATION{{/crossLink}}.
         * @property frictionRelaxation
         * @type {Number}
         */
        this.frictionRelaxation = Equation_1.default.DEFAULT_RELAXATION;
        /**
         * Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.
         * @property {Number} surfaceVelocity
         * @default 0
         */
        this.surfaceVelocity = 0;
        /**
         * Offset to be set on ContactEquations. A positive value will make the bodies penetrate more into each other. Can be useful in scenes where contacts need to be more persistent, for example when stacking. Aka "cure for nervous contacts".
         * @property contactSkinSize
         * @type {Number}
         */
        this.contactSkinSize = 0.005;
        if (!(materialA instanceof Material_1.default) || !(materialB instanceof Material_1.default)) {
            throw new Error("First two arguments must be Material instances.");
        }
        this.id = ++ContactMaterial.idCounter;
        this.materialA = materialA;
        this.materialB = materialB;
        this.friction = (_a = options === null || options === void 0 ? void 0 : options.friction) !== null && _a !== void 0 ? _a : 0.3;
        this.restitution = (_b = options === null || options === void 0 ? void 0 : options.restitution) !== null && _b !== void 0 ? _b : 0;
        this.stiffness = (_c = options === null || options === void 0 ? void 0 : options.stiffness) !== null && _c !== void 0 ? _c : Equation_1.default.DEFAULT_STIFFNESS;
        this.relaxation = (_d = options === null || options === void 0 ? void 0 : options.relaxation) !== null && _d !== void 0 ? _d : Equation_1.default.DEFAULT_RELAXATION;
        this.frictionStiffness = (_e = options === null || options === void 0 ? void 0 : options.frictionStiffness) !== null && _e !== void 0 ? _e : Equation_1.default.DEFAULT_STIFFNESS;
        this.frictionRelaxation = (_f = options === null || options === void 0 ? void 0 : options.frictionRelaxation) !== null && _f !== void 0 ? _f : Equation_1.default.DEFAULT_RELAXATION;
        this.surfaceVelocity = (_g = options === null || options === void 0 ? void 0 : options.surfaceVelocity) !== null && _g !== void 0 ? _g : 0;
        this.contactSkinSize = 0.005;
    }
    ContactMaterial.idCounter = 0;
    return ContactMaterial;
}());
exports.default = ContactMaterial;

},{"../equations/Equation":14,"./Material":23}],25:[function(_dereq_,module,exports){
module.exports=_dereq_(23)
},{}],26:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Compute the intersection between two lines.
 * @static
 * @method lineInt
 * @param  {Array}  l1          Line vector 1
 * @param  {Array}  l2          Line vector 2
 * @param  {Number} precision   Precision to use when checking if the lines are parallel
 * @return {Array}              The intersection point.
 */
function lineInt(l1, l2, precision) {
    if (precision === void 0) { precision = 0; }
    var i = new Float32Array(2); // point
    var a1, b1, c1, a2, b2, c2, det; // scalars
    a1 = l1[1][1] - l1[0][1];
    b1 = l1[0][0] - l1[1][0];
    c1 = a1 * l1[0][0] + b1 * l1[0][1];
    a2 = l2[1][1] - l2[0][1];
    b2 = l2[0][0] - l2[1][0];
    c2 = a2 * l2[0][0] + b2 * l2[0][1];
    det = a1 * b2 - a2 * b1;
    if (!scalar_eq(det, 0, precision)) { // lines are not parallel
        i[0] = (b2 * c1 - b1 * c2) / det;
        i[1] = (a1 * c2 - a2 * c1) / det;
    }
    return i;
}
/**
 * Checks if two line segments intersects.
 * @method segmentsIntersect
 * @param {Array} p1 The start vertex of the first line segment.
 * @param {Array} p2 The end vertex of the first line segment.
 * @param {Array} q1 The start vertex of the second line segment.
 * @param {Array} q2 The end vertex of the second line segment.
 * @return {Boolean} True if the two line segments intersect
 */
function lineSegmentsIntersect(p1, p2, q1, q2) {
    var dx = p2[0] - p1[0];
    var dy = p2[1] - p1[1];
    var da = q2[0] - q1[0];
    var db = q2[1] - q1[1];
    // segments are parallel
    if ((da * dy - db * dx) === 0) {
        return false;
    }
    var s = (dx * (q1[1] - p1[1]) + dy * (p1[0] - q1[0])) / (da * dy - db * dx);
    var t = (da * (p1[1] - q1[1]) + db * (q1[0] - p1[0])) / (db * dx - da * dy);
    return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
}
/**
 * Get the area of a triangle spanned by the three given points. Note that the area will be negative if the points are not given in counter-clockwise order.
 * @static
 * @method area
 * @param  {Array} a
 * @param  {Array} b
 * @param  {Array} c
 * @return {Number}
 */
function triangleArea(a, b, c) {
    return (((b[0] - a[0]) * (c[1] - a[1])) - ((c[0] - a[0]) * (b[1] - a[1])));
}
function isLeft(a, b, c) {
    return triangleArea(a, b, c) > 0;
}
function isLeftOn(a, b, c) {
    return triangleArea(a, b, c) >= 0;
}
function isRight(a, b, c) {
    return triangleArea(a, b, c) < 0;
}
function isRightOn(a, b, c) {
    return triangleArea(a, b, c) <= 0;
}
var tmpPoint1 = new Float32Array(2), tmpPoint2 = new Float32Array(2);
/**
 * Check if three points are collinear
 * @method collinear
 * @param  {Array} a
 * @param  {Array} b
 * @param  {Array} c
 * @param  {Number} [thresholdAngle=0] Threshold angle to use when comparing the vectors. The function will return true if the angle between the resulting vectors is less than this value. Use zero for max precision.
 * @return {Boolean}
 */
function collinear(a, b, c, thresholdAngle) {
    if (!thresholdAngle) {
        return triangleArea(a, b, c) === 0;
    }
    else {
        var ab = tmpPoint1, bc = tmpPoint2;
        ab[0] = b[0] - a[0];
        ab[1] = b[1] - a[1];
        bc[0] = c[0] - b[0];
        bc[1] = c[1] - b[1];
        var dot = ab[0] * bc[0] + ab[1] * bc[1], magA = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1]), magB = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]), angle = Math.acos(dot / (magA * magB));
        return angle < thresholdAngle;
    }
}
function sqdist(a, b) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    return dx * dx + dy * dy;
}
/**
 * Get a vertex at position i. It does not matter if i is out of bounds, this function will just cycle.
 * @method at
 * @param  {Number} i
 * @return {Array}
 */
function polygonAt(polygon, i) {
    var s = polygon.length;
    return polygon[i < 0 ? i % s + s : i % s];
}
/**
 * Clear the polygon data
 * @method clear
 * @return {Array}
 */
function polygonClear(polygon) {
    polygon.length = 0;
}
/**
 * Append points "from" to "to"-1 from an other polygon "poly" onto this one.
 * @method append
 * @param {Polygon} poly The polygon to get points from.
 * @param {Number}  from The vertex index in "poly".
 * @param {Number}  to The end vertex index in "poly". Note that this vertex is NOT included when appending.
 * @return {Array}
 */
function polygonAppend(polygon, poly, from, to) {
    for (var i = from; i < to; i++) {
        polygon.push(poly[i]);
    }
}
/**
 * Make sure that the polygon vertices are ordered counter-clockwise.
 * @method makeCCW
 */
function polygonMakeCCW(polygon) {
    var br = 0, v = polygon;
    // find bottom right point
    for (var i = 1; i < polygon.length; ++i) {
        if (v[i][1] < v[br][1] || (v[i][1] === v[br][1] && v[i][0] > v[br][0])) {
            br = i;
        }
    }
    // reverse poly if clockwise
    if (!isLeft(polygonAt(polygon, br - 1), polygonAt(polygon, br), polygonAt(polygon, br + 1))) {
        polygonReverse(polygon);
        return true;
    }
    else {
        return false;
    }
}
/**
 * Reverse the vertices in the polygon
 * @method reverse
 */
function polygonReverse(polygon) {
    var tmp = [];
    var N = polygon.length;
    for (var i = 0; i !== N; i++) {
        var p = polygon.pop();
        tmp.push(p);
    }
    for (var i = 0; i !== N; i++) {
        polygon[i] = tmp[i];
    }
}
/**
 * Check if a point in the polygon is a reflex point
 * @method isReflex
 * @param  {Number}  i
 * @return {Boolean}
 */
function polygonIsReflex(polygon, i) {
    return isRight(polygonAt(polygon, i - 1), polygonAt(polygon, i), polygonAt(polygon, i + 1));
}
var tmpLine1 = [], tmpLine2 = [];
/**
 * Check if two vertices in the polygon can see each other
 * @method canSee
 * @param  {Number} a Vertex index 1
 * @param  {Number} b Vertex index 2
 * @return {Boolean}
 */
function polygonCanSee(polygon, a, b) {
    var p, dist, l1 = tmpLine1, l2 = tmpLine2;
    if (isLeftOn(polygonAt(polygon, a + 1), polygonAt(polygon, a), polygonAt(polygon, b)) && isRightOn(polygonAt(polygon, a - 1), polygonAt(polygon, a), polygonAt(polygon, b))) {
        return false;
    }
    dist = sqdist(polygonAt(polygon, a), polygonAt(polygon, b));
    for (var i = 0; i !== polygon.length; ++i) { // for each edge
        if ((i + 1) % polygon.length === a || i === a) { // ignore incident edges
            continue;
        }
        if (isLeftOn(polygonAt(polygon, a), polygonAt(polygon, b), polygonAt(polygon, i + 1)) && isRightOn(polygonAt(polygon, a), polygonAt(polygon, b), polygonAt(polygon, i))) { // if diag intersects an edge
            l1[0] = polygonAt(polygon, a);
            l1[1] = polygonAt(polygon, b);
            l2[0] = polygonAt(polygon, i);
            l2[1] = polygonAt(polygon, i + 1);
            p = lineInt(l1, l2);
            if (sqdist(polygonAt(polygon, a), p) < dist) { // if edge is blocking visibility to b
                return false;
            }
        }
    }
    return true;
}
/**
 * Check if two vertices in the polygon can see each other
 * @method canSee2
 * @param  {Number} a Vertex index 1
 * @param  {Number} b Vertex index 2
 * @return {Boolean}
 */
function polygonCanSee2(polygon, a, b) {
    // for each edge
    for (var i = 0; i !== polygon.length; ++i) {
        // ignore incident edges
        if (i === a || i === b || (i + 1) % polygon.length === a || (i + 1) % polygon.length === b) {
            continue;
        }
        if (lineSegmentsIntersect(polygonAt(polygon, a), polygonAt(polygon, b), polygonAt(polygon, i), polygonAt(polygon, i + 1))) {
            return false;
        }
    }
    return true;
}
/**
 * Copy the polygon from vertex i to vertex j.
 * @method copy
 * @param  {Number} i
 * @param  {Number} j
 * @param  {Polygon} [targetPoly]   Optional target polygon to save in.
 * @return {Polygon}                The resulting copy.
 */
function polygonCopy(polygon, i, j, targetPoly) {
    var p = targetPoly !== null && targetPoly !== void 0 ? targetPoly : [];
    polygonClear(p);
    if (i < j) {
        // Insert all vertices from i to j
        for (var k = i; k <= j; k++) {
            p.push(polygon[k]);
        }
    }
    else {
        // Insert vertices 0 to j
        for (var k = 0; k <= j; k++) {
            p.push(polygon[k]);
        }
        // Insert vertices i to end
        for (var k = i; k < polygon.length; k++) {
            p.push(polygon[k]);
        }
    }
    return p;
}
/**
 * Decomposes the polygon into convex pieces. Returns a list of edges [[p1,p2],[p2,p3],...] that cuts the polygon.
 * Note that this algorithm has complexity O(N^4) and will be very slow for polygons with many vertices.
 * @method getCutEdges
 * @return {Array}
 */
function polygonGetCutEdges(polygon) {
    var min = [], tmp1 = [], tmp2 = [], tmpPoly = [];
    var nDiags = Infinity;
    for (var i = 0; i < polygon.length; ++i) {
        if (polygonIsReflex(polygon, i)) {
            for (var j = 0; j < polygon.length; ++j) {
                if (polygonCanSee(polygon, i, j)) {
                    tmp1 = polygonGetCutEdges(polygonCopy(polygon, i, j, tmpPoly));
                    tmp2 = polygonGetCutEdges(polygonCopy(polygon, j, i, tmpPoly));
                    for (var k = 0; k < tmp2.length; k++) {
                        tmp1.push(tmp2[k]);
                    }
                    if (tmp1.length < nDiags) {
                        min = tmp1;
                        nDiags = tmp1.length;
                        var p = [polygonAt(polygon, i), polygonAt(polygon, j)];
                        min.push(p);
                    }
                }
            }
        }
    }
    return min;
}
/**
 * Decomposes the polygon into one or more convex sub-Polygons.
 * @method decomp
 * @return {Array} An array or Polygon objects.
 */
function polygonDecomp(polygon) {
    var edges = polygonGetCutEdges(polygon);
    if (edges.length > 0) {
        return polygonSlice(polygon, edges);
    }
    else {
        return [polygon];
    }
}
/**
 * Slices the polygon given one or more cut edges. If given one, this function will return two polygons (false on failure). If many, an array of polygons.
 * @warning The inner workings of this function was massively modified when switching to typescript. Needs thorough testing.
 * @method slice
 * @param {Array} cutEdges A list of edges, as returned by .getCutEdges()
 * @return {Array}
 */
function polygonSlice(polygon, cutEdges) {
    if (cutEdges.length === 0) {
        return [polygon];
    }
    if (cutEdges[0].length === 2) {
        var polys = [polygon];
        for (var i = 0; i < cutEdges.length; i++) {
            var cutEdge = [cutEdges[i]];
            // Cut all polys
            for (var j = 0; j < polys.length; j++) {
                var poly = polys[j];
                var result = polygonSlice(poly, cutEdge);
                if (result) {
                    // Found poly! Cut and quit
                    polys.splice(j, 1);
                    polys.push(result[0]);
                    polys.push(result[1]);
                    break;
                }
            }
        }
        return polys;
    }
    else {
        // Was given one edge
        var cutEdge = cutEdges;
        var i = polygon.indexOf(cutEdge[0][0]);
        var j = polygon.indexOf(cutEdge[0][1]);
        if (i !== -1 && j !== -1) {
            return [polygonCopy(polygon, i, j),
                polygonCopy(polygon, j, i)];
        }
        else {
            return new Array();
        }
    }
}
/**
 * Checks that the line segments of this polygon do not intersect each other.
 * @method isSimple
 * @param  {Array} path An array of vertices e.g. [[0,0],[0,1],...]
 * @return {Boolean}
 * @todo Should it check all segments with all others?
 */
function polygonIsSimple(polygon) {
    var path = polygon, i;
    // Check
    for (i = 0; i < path.length - 1; i++) {
        for (var j = 0; j < i - 1; j++) {
            if (lineSegmentsIntersect(path[i], path[i + 1], path[j], path[j + 1])) {
                return false;
            }
        }
    }
    // Check the segment between the last and the first point to all others
    for (i = 1; i < path.length - 2; i++) {
        if (lineSegmentsIntersect(path[0], path[path.length - 1], path[i], path[i + 1])) {
            return false;
        }
    }
    return true;
}
function getIntersectionPoint(p1, p2, q1, q2, delta) {
    if (delta === void 0) { delta = 0; }
    var a1 = p2[1] - p1[1];
    var b1 = p1[0] - p2[0];
    var c1 = (a1 * p1[0]) + (b1 * p1[1]);
    var a2 = q2[1] - q1[1];
    var b2 = q1[0] - q2[0];
    var c2 = (a2 * q1[0]) + (b2 * q1[1]);
    var det = (a1 * b2) - (a2 * b1);
    var pt = new Float32Array(2);
    if (!scalar_eq(det, 0, delta)) {
        pt[0] = ((b2 * c1) - (b1 * c2)) / det;
        pt[1] = ((a1 * c2) - (a2 * c1)) / det;
        return pt;
    }
    else {
        pt[0] = 0;
        pt[1] = 0;
        return pt;
    }
}
/**
 * Quickly decompose the Polygon into convex sub-polygons.
 * @method quickDecomp
 * @param  {Array} result
 * @param  {Array} [reflexVertices]
 * @param  {Array} [steinerPoints]
 * @param  {Number} [delta]
 * @param  {Number} [maxlevel]
 * @param  {Number} [level]
 * @return {Array}
 */
function polygonQuickDecomp(polygon, result, reflexVertices, steinerPoints, delta, maxlevel, level) {
    if (result === void 0) { result = new Array(); }
    if (reflexVertices === void 0) { reflexVertices = []; }
    if (steinerPoints === void 0) { steinerPoints = []; }
    if (delta === void 0) { delta = 25; }
    if (maxlevel === void 0) { maxlevel = 100; }
    if (level === void 0) { level = 0; }
    // TODO: should upperInt really be initialized here? It looks like it's overwritten.
    var upperInt = new Float32Array(2), lowerInt = new Float32Array(2), p = new Float32Array(2); // Points
    upperInt[0] = 0;
    upperInt[1] = 0;
    lowerInt[0] = 0;
    lowerInt[1] = 0;
    p[0] = 0;
    p[1] = 0;
    var upperDist = 0, lowerDist = 0, d = 0, closestDist = 0; // scalars
    var upperIndex = 0, lowerIndex = 0, closestIndex = 0; // Integers
    var lowerPoly = new Array(), upperPoly = new Array(); // polygons
    var poly = polygon, v = polygon;
    if (v.length < 3) {
        return result;
    }
    level++;
    if (level > maxlevel) {
        //console.warn("quickDecomp: max level ("+maxlevel+") reached.");
        return result;
    }
    for (var i = 0; i < polygon.length; ++i) {
        if (polygonIsReflex(poly, i)) {
            reflexVertices.push(poly[i]);
            upperDist = lowerDist = Infinity;
            for (var j = 0; j < polygon.length; ++j) {
                if (isLeft(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j)) && isRightOn(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j - 1))) { // if line intersects with an edge
                    p = getIntersectionPoint(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j), polygonAt(poly, j - 1)); // find the point of intersection
                    if (isRight(polygonAt(poly, i + 1), polygonAt(poly, i), p)) { // make sure it's inside the poly
                        d = sqdist(poly[i], p);
                        if (d < lowerDist) { // keep only the closest intersection
                            lowerDist = d;
                            lowerInt = p;
                            lowerIndex = j;
                        }
                    }
                }
                if (isLeft(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j + 1)) && isRightOn(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j))) {
                    p = getIntersectionPoint(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j), polygonAt(poly, j + 1));
                    if (isLeft(polygonAt(poly, i - 1), polygonAt(poly, i), p)) {
                        d = sqdist(poly[i], p);
                        if (d < upperDist) {
                            upperDist = d;
                            upperInt = p;
                            upperIndex = j;
                        }
                    }
                }
            }
            // if there are no vertices to connect to, choose a point in the middle
            if (lowerIndex === (upperIndex + 1) % polygon.length) {
                //console.log("Case 1: Vertex("+i+"), lowerIndex("+lowerIndex+"), upperIndex("+upperIndex+"), poly.size("+polygon.length+")");
                p[0] = (lowerInt[0] + upperInt[0]) / 2;
                p[1] = (lowerInt[1] + upperInt[1]) / 2;
                steinerPoints.push(p);
                if (i < upperIndex) {
                    //lowerPoly.insert(lowerPoly.end(), poly.begin() + i, poly.begin() + upperIndex + 1);
                    polygonAppend(lowerPoly, poly, i, upperIndex + 1);
                    lowerPoly.push(p);
                    upperPoly.push(p);
                    if (lowerIndex !== 0) {
                        //upperPoly.insert(upperPoly.end(), poly.begin() + lowerIndex, poly.end());
                        polygonAppend(upperPoly, poly, lowerIndex, poly.length);
                    }
                    //upperPoly.insert(upperPoly.end(), poly.begin(), poly.begin() + i + 1);
                    polygonAppend(upperPoly, poly, 0, i + 1);
                }
                else {
                    if (i !== 0) {
                        //lowerPoly.insert(lowerPoly.end(), poly.begin() + i, poly.end());
                        polygonAppend(lowerPoly, poly, i, poly.length);
                    }
                    //lowerPoly.insert(lowerPoly.end(), poly.begin(), poly.begin() + upperIndex + 1);
                    polygonAppend(lowerPoly, poly, 0, upperIndex + 1);
                    lowerPoly.push(p);
                    upperPoly.push(p);
                    //upperPoly.insert(upperPoly.end(), poly.begin() + lowerIndex, poly.begin() + i + 1);
                    polygonAppend(upperPoly, poly, lowerIndex, i + 1);
                }
            }
            else {
                // connect to the closest point within the triangle
                //console.log("Case 2: Vertex("+i+"), closestIndex("+closestIndex+"), poly.size("+polygon.length+")\n");
                if (lowerIndex > upperIndex) {
                    upperIndex += polygon.length;
                }
                closestDist = Infinity;
                if (upperIndex < lowerIndex) {
                    return result;
                }
                for (var j = lowerIndex; j <= upperIndex; ++j) {
                    if (isLeftOn(polygonAt(poly, i - 1), polygonAt(poly, i), polygonAt(poly, j)) &&
                        isRightOn(polygonAt(poly, i + 1), polygonAt(poly, i), polygonAt(poly, j))) {
                        d = sqdist(polygonAt(poly, i), polygonAt(poly, j));
                        if (d < closestDist && polygonCanSee2(poly, i, j)) {
                            closestDist = d;
                            closestIndex = j % polygon.length;
                        }
                    }
                }
                if (i < closestIndex) {
                    polygonAppend(lowerPoly, poly, i, closestIndex + 1);
                    if (closestIndex !== 0) {
                        polygonAppend(upperPoly, poly, closestIndex, v.length);
                    }
                    polygonAppend(upperPoly, poly, 0, i + 1);
                }
                else {
                    if (i !== 0) {
                        polygonAppend(lowerPoly, poly, i, v.length);
                    }
                    polygonAppend(lowerPoly, poly, 0, closestIndex + 1);
                    polygonAppend(upperPoly, poly, closestIndex, i + 1);
                }
            }
            // solve smallest poly first
            if (lowerPoly.length < upperPoly.length) {
                polygonQuickDecomp(lowerPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level);
                polygonQuickDecomp(upperPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level);
            }
            else {
                polygonQuickDecomp(upperPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level);
                polygonQuickDecomp(lowerPoly, result, reflexVertices, steinerPoints, delta, maxlevel, level);
            }
            return result;
        }
    }
    result.push(polygon);
    return result;
}
/**
 * Remove collinear points in the polygon.
 * @method removeCollinearPoints
 * @param  {Number} [precision] The threshold angle to use when determining whether two edges are collinear. Use zero for finest precision.
 * @return {Number}           The number of points removed
 */
function polygonRemoveCollinearPoints(polygon, precision) {
    var num = 0;
    for (var i = polygon.length - 1; polygon.length > 3 && i >= 0; --i) {
        if (collinear(polygonAt(polygon, i - 1), polygonAt(polygon, i), polygonAt(polygon, i + 1), precision)) {
            // Remove the middle point
            polygon.splice(i % polygon.length, 1);
            num++;
        }
    }
    return num;
}
/**
 * Remove duplicate points in the polygon.
 * @method removeDuplicatePoints
 * @param  {Number} [precision] The threshold to use when determining whether two points are the same. Use zero for best precision.
 */
function polygonRemoveDuplicatePoints(polygon, precision) {
    for (var i = polygon.length - 1; i >= 1; --i) {
        var pi = polygon[i];
        for (var j = i - 1; j >= 0; --j) {
            if (points_eq(pi, polygon[j], precision)) {
                polygon.splice(i, 1);
                continue;
            }
        }
    }
}
/**
 * Check if two scalars are equal
 * @static
 * @method eq
 * @param  {Number} a
 * @param  {Number} b
 * @param  {Number} [precision]
 * @return {Boolean}
 */
function scalar_eq(a, b, precision) {
    precision = precision || 0;
    return Math.abs(a - b) <= precision;
}
/**
 * Check if two points are equal
 * @static
 * @method points_eq
 * @param  {Array} a
 * @param  {Array} b
 * @param  {Number} [precision]
 * @return {Boolean}
 */
function points_eq(a, b, precision) {
    return scalar_eq(a[0], b[0], precision) && scalar_eq(a[1], b[1], precision);
}
exports.default = {
    decomp: polygonDecomp,
    quickDecomp: polygonQuickDecomp,
    isSimple: polygonIsSimple,
    removeCollinearPoints: polygonRemoveCollinearPoints,
    removeDuplicatePoints: polygonRemoveDuplicatePoints,
    makeCCW: polygonMakeCCW
};

},{}],27:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
    PolyK library
    url: http://polyk.ivank.net
    Released under MIT licence.

    Copyright (c) 2012 Ivan Kuckir

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/
var PolyK = /** @class */ (function () {
    function PolyK() {
    }
    /*
        Is Polygon self-intersecting?

        O(n^2)
    */
    /*
    IsSimple(p)
    {
        var n = p.length>>1;
        if(n<4) return true;
        var a1 = new this._P(), a2 = new this._P();
        var b1 = new this._P(), b2 = new this._P();
        var c = new this._P();

        for(var i=0; i<n; i++)
        {
            a1.x = p[2*i  ];
            a1.y = p[2*i+1];
            if(i==n-1)  { a2.x = p[0    ];  a2.y = p[1    ]; }
            else        { a2.x = p[2*i+2];  a2.y = p[2*i+3]; }

            for(var j=0; j<n; j++)
            {
                if(Math.abs(i-j) < 2) continue;
                if(j==n-1 && i==0) continue;
                if(i==n-1 && j==0) continue;

                b1.x = p[2*j  ];
                b1.y = p[2*j+1];
                if(j==n-1)  { b2.x = p[0    ];  b2.y = p[1    ]; }
                else        { b2.x = p[2*j+2];  b2.y = p[2*j+3]; }

                if(this._GetLineIntersection(a1,a2,b1,b2,c) != null) return false;
            }
        }
        return true;
    }

    IsConvex(p)
    {
        if(p.length<6) return true;
        var l = p.length - 4;
        for(var i=0; i<l; i+=2)
            if(!this._convex(p[i], p[i+1], p[i+2], p[i+3], p[i+4], p[i+5])) return false;
        if(!this._convex(p[l  ], p[l+1], p[l+2], p[l+3], p[0], p[1])) return false;
        if(!this._convex(p[l+2], p[l+3], p[0  ], p[1  ], p[2], p[3])) return false;
        return true;
    }
    */
    PolyK.prototype.GetArea = function (p) {
        if (p.length < 6)
            return 0;
        var l = p.length - 2;
        var sum = 0;
        for (var i = 0; i < l; i += 2)
            sum += (p[i + 2] - p[i]) * (p[i + 1] + p[i + 3]);
        sum += (p[0] - p[l]) * (p[l + 1] + p[1]);
        return -sum * 0.5;
    };
    /*
    GetAABB(p)
    {
        var minx = Infinity;
        var miny = Infinity;
        var maxx = -minx;
        var maxy = -miny;
        for(var i=0; i<p.length; i+=2)
        {
            minx = Math.min(minx, p[i  ]);
            maxx = Math.max(maxx, p[i  ]);
            miny = Math.min(miny, p[i+1]);
            maxy = Math.max(maxy, p[i+1]);
        }
        return {x:minx, y:miny, width:maxx-minx, height:maxy-miny};
    }
    */
    PolyK.prototype.Triangulate = function (p) {
        var n = p.length >> 1;
        if (n < 3)
            return [];
        var tgs = [];
        var avl = [];
        for (var i = 0; i < n; i++)
            avl.push(i);
        var i = 0;
        var al = n;
        while (al > 3) {
            var i0 = avl[(i + 0) % al];
            var i1 = avl[(i + 1) % al];
            var i2 = avl[(i + 2) % al];
            var ax = p[2 * i0], ay = p[2 * i0 + 1];
            var bx = p[2 * i1], by = p[2 * i1 + 1];
            var cx = p[2 * i2], cy = p[2 * i2 + 1];
            var earFound = false;
            if (this._convex(ax, ay, bx, by, cx, cy)) {
                earFound = true;
                for (var j = 0; j < al; j++) {
                    var vi = avl[j];
                    if (vi == i0 || vi == i1 || vi == i2)
                        continue;
                    if (this._PointInTriangle(p[2 * vi], p[2 * vi + 1], ax, ay, bx, by, cx, cy)) {
                        earFound = false;
                        break;
                    }
                }
            }
            if (earFound) {
                tgs.push(i0);
                tgs.push(i1);
                tgs.push(i2);
                avl.splice((i + 1) % al, 1);
                al--;
                i = 0;
            }
            else if (i++ > 3 * al)
                break; // no convex angles :(
        }
        tgs.push(avl[0]);
        tgs.push(avl[1]);
        tgs.push(avl[2]);
        return tgs;
    };
    /*
    ContainsPoint(p, px, py)
    {
        var n = p.length>>1;
        var ax, ay, bx = p[2*n-2]-px, by = p[2*n-1]-py;
        var depth = 0;
        for(var i=0; i<n; i++)
        {
            ax = bx;  ay = by;
            bx = p[2*i  ] - px;
            by = p[2*i+1] - py;
            if(ay< 0 && by< 0) continue;    // both "up" or both "donw"
            if(ay>=0 && by>=0) continue;    // both "up" or both "donw"
            if(ax< 0 && bx< 0) continue;

            var lx = ax + (bx-ax)*(-ay)/(by-ay);
            if(lx>0) depth++;
        }
        return (depth & 1) == 1;
    }

    Slice(p, ax, ay, bx, by)
    {
        if(this.ContainsPoint(p, ax, ay) || this.ContainsPoint(p, bx, by)) return [p.slice(0)];

        var a = new this._P(ax, ay);
        var b = new this._P(bx, by);
        var iscs = [];  // intersections
        var ps = [];    // points
        for(var i=0; i<p.length; i+=2) ps.push(new this._P(p[i], p[i+1]));

        for(var i=0; i<ps.length; i++)
        {
            var isc = new this._P(0,0);
            isc = this._GetLineIntersection(a, b, ps[i], ps[(i+1)%ps.length], isc);

            if(isc)
            {
                isc.flag = true;
                iscs.push(isc);
                ps.splice(i+1,0,isc);
                i++;
            }
        }
        if(iscs.length == 0) return [p.slice(0)];
        var comp(u,v) {return this._P.dist(a,u) - this._P.dist(a,v); }
        iscs.sort(comp);

        var pgs = [];
        var dir = 0;
        while(iscs.length > 0)
        {
            var n = ps.length;
            var i0 = iscs[0];
            var i1 = iscs[1];
            var ind0 = ps.indexOf(i0);
            var ind1 = ps.indexOf(i1);
            var solved = false;

            if(this._firstWithFlag(ps, ind0) == ind1) solved = true;
            else
            {
                i0 = iscs[1];
                i1 = iscs[0];
                ind0 = ps.indexOf(i0);
                ind1 = ps.indexOf(i1);
                if(this._firstWithFlag(ps, ind0) == ind1) solved = true;
            }
            if(solved)
            {
                dir--;
                var pgn = this._getPoints(ps, ind0, ind1);
                pgs.push(pgn);
                ps = this._getPoints(ps, ind1, ind0);
                i0.flag = i1.flag = false;
                iscs.splice(0,2);
                if(iscs.length == 0) pgs.push(ps);
            }
            else { dir++; iscs.reverse(); }
            if(dir>1) break;
        }
        var result = [];
        for(var i=0; i<pgs.length; i++)
        {
            var pg = pgs[i];
            var npg = [];
            for(var j=0; j<pg.length; j++) npg.push(pg[j].x, pg[j].y);
            result.push(npg);
        }
        return result;
    }

    Raycast(p, x, y, dx, dy, isc)
    {
        var l = p.length - 2;
        var tp = this._tp;
        var a1 = tp[0], a2 = tp[1],
        b1 = tp[2], b2 = tp[3], c = tp[4];
        a1.x = x; a1.y = y;
        a2.x = x+dx; a2.y = y+dy;

        if(isc==null) isc = {dist:0, edge:0, norm:{x:0, y:0}, refl:{x:0, y:0}};
        isc.dist = Infinity;

        for(var i=0; i<l; i+=2)
        {
            b1.x = p[i  ];  b1.y = p[i+1];
            b2.x = p[i+2];  b2.y = p[i+3];
            var nisc = this._RayLineIntersection(a1, a2, b1, b2, c);
            if(nisc) this._updateISC(dx, dy, a1, b1, b2, c, i/2, isc);
        }
        b1.x = b2.x;  b1.y = b2.y;
        b2.x = p[0];  b2.y = p[1];
        var nisc = this._RayLineIntersection(a1, a2, b1, b2, c);
        if(nisc) this._updateISC(dx, dy, a1, b1, b2, c, p.length/2, isc);

        return (isc.dist != Infinity) ? isc : null;
    }

    ClosestEdge(p, x, y, isc)
    {
        var l = p.length - 2;
        var tp = this._tp;
        var a1 = tp[0],
        b1 = tp[2], b2 = tp[3], c = tp[4];
        a1.x = x; a1.y = y;

        if(isc==null) isc = {dist:0, edge:0, point:{x:0, y:0}, norm:{x:0, y:0}};
        isc.dist = Infinity;

        for(var i=0; i<l; i+=2)
        {
            b1.x = p[i  ];  b1.y = p[i+1];
            b2.x = p[i+2];  b2.y = p[i+3];
            this._pointLineDist(a1, b1, b2, i>>1, isc);
        }
        b1.x = b2.x;  b1.y = b2.y;
        b2.x = p[0];  b2.y = p[1];
        this._pointLineDist(a1, b1, b2, l>>1, isc);

        var idst = 1/isc.dist;
        isc.norm.x = (x-isc.point.x)*idst;
        isc.norm.y = (y-isc.point.y)*idst;
        return isc;
    }

    _pointLineDist(p, a, b, edge, isc)
    {
        var x = p.x, y = p.y, x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;

        var A = x - x1;
        var B = y - y1;
        var C = x2 - x1;
        var D = y2 - y1;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = dot / len_sq;

        var xx, yy;

        if (param < 0 || (x1 == x2 && y1 == y2)) {
            xx = x1;
            yy = y1;
        }
        else if (param > 1) {
            xx = x2;
            yy = y2;
        }
        else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        var dx = x - xx;
        var dy = y - yy;
        var dst = Math.sqrt(dx * dx + dy * dy);
        if(dst<isc.dist)
        {
            isc.dist = dst;
            isc.edge = edge;
            isc.point.x = xx;
            isc.point.y = yy;
        }
    }

    _updateISC(dx, dy, a1, b1, b2, c, edge, isc)
    {
        var nrl = this._P.dist(a1, c);
        if(nrl<isc.dist)
        {
            var ibl = 1/this._P.dist(b1, b2);
            var nx = -(b2.y-b1.y)*ibl;
            var ny =  (b2.x-b1.x)*ibl;
            var ddot = 2*(dx*nx+dy*ny);
            isc.dist = nrl;
            isc.norm.x = nx;
            isc.norm.y = ny;
            isc.refl.x = -ddot*nx+dx;
            isc.refl.y = -ddot*ny+dy;
            isc.edge = edge;
        }
    }

    _getPoints(ps, ind0, ind1)
    {
        var n = ps.length;
        var nps = [];
        if(ind1<ind0) ind1 += n;
        for(var i=ind0; i<= ind1; i++) nps.push(ps[i%n]);
        return nps;
    }

    _firstWithFlag(ps, ind)
    {
        var n = ps.length;
        while(true)
        {
            ind = (ind+1)%n;
            if(ps[ind].flag) return ind;
        }
    }
    */
    PolyK.prototype._PointInTriangle = function (px, py, ax, ay, bx, by, cx, cy) {
        var v0x = cx - ax;
        var v0y = cy - ay;
        var v1x = bx - ax;
        var v1y = by - ay;
        var v2x = px - ax;
        var v2y = py - ay;
        var dot00 = v0x * v0x + v0y * v0y;
        var dot01 = v0x * v1x + v0y * v1y;
        var dot02 = v0x * v2x + v0y * v2y;
        var dot11 = v1x * v1x + v1y * v1y;
        var dot12 = v1x * v2x + v1y * v2y;
        var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        // Check if point is in triangle
        return (u >= 0) && (v >= 0) && (u + v < 1);
    };
    /*
    _RayLineIntersection(a1, a2, b1, b2, c)
    {
        var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
        var day = (a1.y-a2.y), dby = (b1.y-b2.y);

        var Den = dax*dby - day*dbx;
        if (Den == 0) return null;  // parallel

        var A = (a1.x * a2.y - a1.y * a2.x);
        var B = (b1.x * b2.y - b1.y * b2.x);

        var I = c;
        var iDen = 1/Den;
        I.x = ( A*dbx - dax*B ) * iDen;
        I.y = ( A*dby - day*B ) * iDen;

        if(!this._InRect(I, b1, b2)) return null;
        if((day>0 && I.y>a1.y) || (day<0 && I.y<a1.y)) return null;
        if((dax>0 && I.x>a1.x) || (dax<0 && I.x<a1.x)) return null;
        return I;
    }

    _GetLineIntersection(a1, a2, b1, b2, c)
    {
        var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
        var day = (a1.y-a2.y), dby = (b1.y-b2.y);

        var Den = dax*dby - day*dbx;
        if (Den == 0) return null;  // parallel

        var A = (a1.x * a2.y - a1.y * a2.x);
        var B = (b1.x * b2.y - b1.y * b2.x);

        var I = c;
        I.x = ( A*dbx - dax*B ) / Den;
        I.y = ( A*dby - day*B ) / Den;

        if(this._InRect(I, a1, a2) && this._InRect(I, b1, b2)) return I;
        return null;
    }

    _InRect(a, b, c)
    {
        if  (b.x == c.x) return (a.y>=Math.min(b.y, c.y) && a.y<=Math.max(b.y, c.y));
        if  (b.y == c.y) return (a.x>=Math.min(b.x, c.x) && a.x<=Math.max(b.x, c.x));

        if(a.x >= Math.min(b.x, c.x) && a.x <= Math.max(b.x, c.x)
        && a.y >= Math.min(b.y, c.y) && a.y <= Math.max(b.y, c.y))
        return true;
        return false;
    }
    */
    PolyK.prototype._convex = function (ax, ay, bx, by, cx, cy) {
        return (ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0;
    };
    return PolyK;
}());
exports.default = new PolyK();

},{}],28:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */
/**
 * The vec2 object from glMatrix, with some extensions and some removed methods. See http://glmatrix.net.
 * @class vec2
 */
var Vec2 = /** @class */ (function () {
    function Vec2() {
    }
    /**
     * Make a cross product and only return the z component
     * @method crossLength
     * @static
     * @param  {Array} a
     * @param  {Array} b
     * @return {Number}
     */
    Vec2.prototype.crossLength = function (a, b) {
        return a[0] * b[1] - a[1] * b[0];
    };
    ;
    /**
     * Cross product between a vector and the Z component of a vector
     * @method crossVZ
     * @static
     * @param  {Array} out
     * @param  {Array} vec
     * @param  {Number} zcomp
     * @return {Array}
     */
    Vec2.prototype.crossVZ = function (out, vec, zcomp) {
        this.rotate(out, vec, -Math.PI / 2); // Rotate according to the right hand rule
        this.scale(out, out, zcomp); // Scale with z
        return out;
    };
    ;
    /**
     * Cross product between a vector and the Z component of a vector
     * @method crossZV
     * @static
     * @param  {Array} out
     * @param  {Number} zcomp
     * @param  {Array} vec
     * @return {Array}
     */
    Vec2.prototype.crossZV = function (out, zcomp, vec) {
        this.rotate(out, vec, Math.PI / 2); // Rotate according to the right hand rule
        this.scale(out, out, zcomp); // Scale with z
        return out;
    };
    ;
    /**
     * Rotate a vector by an angle
     * @method rotate
     * @static
     * @param  {Array} out
     * @param  {Array} a
     * @param  {Number} angle
     * @return {Array}
     */
    Vec2.prototype.rotate = function (out, a, angle) {
        if (angle !== 0) {
            var c = Math.cos(angle), s = Math.sin(angle), x = a[0], y = a[1];
            out[0] = c * x - s * y;
            out[1] = s * x + c * y;
        }
        else {
            out[0] = a[0];
            out[1] = a[1];
        }
        return out;
    };
    ;
    /**
     * Rotate a vector 90 degrees clockwise
     * @method rotate90cw
     * @static
     * @param  {Array} out
     * @param  {Array} a
     * @return {Array}
     */
    Vec2.prototype.rotate90cw = function (out, a) {
        var x = a[0];
        var y = a[1];
        out[0] = y;
        out[1] = -x;
        return out;
    };
    ;
    /**
     * Transform a point position to local frame.
     * @method toLocalFrame
     * @param  {Array} out
     * @param  {Array} worldPoint
     * @param  {Array} framePosition
     * @param  {Number} frameAngle
     * @return {Array}
     */
    Vec2.prototype.toLocalFrame = function (out, worldPoint, framePosition, frameAngle) {
        var c = Math.cos(-frameAngle), s = Math.sin(-frameAngle), x = worldPoint[0] - framePosition[0], y = worldPoint[1] - framePosition[1];
        out[0] = c * x - s * y;
        out[1] = s * x + c * y;
        return out;
    };
    ;
    /**
     * Transform a point position to global frame.
     * @method toGlobalFrame
     * @param  {Array} out
     * @param  {Array} localPoint
     * @param  {Array} framePosition
     * @param  {Number} frameAngle
     */
    Vec2.prototype.toGlobalFrame = function (out, localPoint, framePosition, frameAngle) {
        var c = Math.cos(frameAngle), s = Math.sin(frameAngle), x = localPoint[0], y = localPoint[1], addX = framePosition[0], addY = framePosition[1];
        out[0] = c * x - s * y + addX;
        out[1] = s * x + c * y + addY;
    };
    ;
    /**
     * Transform a vector to local frame.
     * @method vectorToLocalFrame
     * @param  {Array} out
     * @param  {Array} worldVector
     * @param  {Number} frameAngle
     * @return {Array}
     */
    Vec2.prototype.vectorToLocalFrame = function (out, worldVector, frameAngle) {
        var c = Math.cos(-frameAngle), s = Math.sin(-frameAngle), x = worldVector[0], y = worldVector[1];
        out[0] = c * x - s * y;
        out[1] = s * x + c * y;
        return out;
    };
    ;
    /*
     * Transform a vector to global frame.
     * @method vectorToGlobalFrame
     * @param  {Array} out
     * @param  {Array} localVector
     * @param  {Number} frameAngle
     */
    //vectorToGlobalFrame = vec2.rotate;
    /**
     * Compute centroid of a triangle spanned by vectors a,b,c. See http://easycalculation.com/analytical/learn-centroid.php
     * @method centroid
     * @static
     * @param  {Array} out
     * @param  {Array} a
     * @param  {Array} b
     * @param  {Array} c
     * @return  {Array} The "out" vector.
     */
    Vec2.prototype.centroid = function (out, a, b, c) {
        this.add(out, a, b);
        this.add(out, out, c);
        this.scale(out, out, 1 / 3);
        return out;
    };
    ;
    /**
     * Creates a new, empty vec2
     * @static
     * @method create
     * @return {Array} a new 2D vector
     */
    Vec2.prototype.create = function () {
        var out = new Float32Array(2);
        out[0] = 0;
        out[1] = 0;
        return out;
    };
    ;
    /**
     * Creates a new vec2 initialized with values from an existing vector
     * @static
     * @method clone
     * @param {Array} a vector to clone
     * @return {Array} a new 2D vector
     */
    Vec2.prototype.clone = function (a) {
        var out = new Float32Array(2);
        out[0] = a[0];
        out[1] = a[1];
        return out;
    };
    ;
    /**
     * Creates a new vec2 initialized with the given values
     * @static
     * @method fromValues
     * @param {Number} x X component
     * @param {Number} y Y component
     * @return {Array} a new 2D vector
     */
    Vec2.prototype.fromValues = function (x, y) {
        var out = new Float32Array(2);
        out[0] = x;
        out[1] = y;
        return out;
    };
    ;
    /**
     * Copy the values from one vec2 to another
     * @static
     * @method copy
     * @param {Array} out the receiving vector
     * @param {Array} a the source vector
     * @return {Array} out
     */
    Vec2.prototype.copy = function (out, a) {
        out[0] = a[0];
        out[1] = a[1];
        return out;
    };
    ;
    /**
     * Set the components of a vec2 to the given values
     * @static
     * @method set
     * @param {Array} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @return {Array} out
     */
    Vec2.prototype.set = function (out, x, y) {
        out[0] = x;
        out[1] = y;
        return out;
    };
    ;
    /**
     * Adds two vec2's
     * @static
     * @method add
     * @param {Array} out the receiving vector
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Array} out
     */
    Vec2.prototype.add = function (out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    };
    ;
    /**
     * Subtracts two vec2's
     * @static
     * @method subtract
     * @param {Array} out the receiving vector
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Array} out
     */
    Vec2.prototype.subtract = function (out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        return out;
    };
    ;
    /**
     * Multiplies two vec2's
     * @static
     * @method multiply
     * @param {Array} out the receiving vector
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Array} out
     */
    Vec2.prototype.multiply = function (out, a, b) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        return out;
    };
    ;
    /**
     * Divides two vec2's
     * @static
     * @method divide
     * @param {Array} out the receiving vector
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Array} out
     */
    Vec2.prototype.divide = function (out, a, b) {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        return out;
    };
    ;
    /**
     * Scales a vec2 by a scalar number
     * @static
     * @method scale
     * @param {Array} out the receiving vector
     * @param {Array} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @return {Array} out
     */
    Vec2.prototype.scale = function (out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        return out;
    };
    ;
    /**
     * Calculates the euclidian distance between two vec2's
     * @static
     * @method distance
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Number} distance between a and b
     */
    Vec2.prototype.distance = function (a, b) {
        var x = b[0] - a[0], y = b[1] - a[1];
        return Math.sqrt(x * x + y * y);
    };
    ;
    /**
     * Calculates the squared euclidian distance between two vec2's
     * @static
     * @method squaredDistance
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Number} squared distance between a and b
     */
    Vec2.prototype.squaredDistance = function (a, b) {
        var x = b[0] - a[0], y = b[1] - a[1];
        return x * x + y * y;
    };
    ;
    /**
     * Calculates the length of a vec2
     * @static
     * @method length
     * @param {Array} a vector to calculate length of
     * @return {Number} length of a
     */
    Vec2.prototype.length = function (a) {
        var x = a[0], y = a[1];
        return Math.sqrt(x * x + y * y);
    };
    ;
    /**
     * Calculates the squared length of a vec2
     * @static
     * @method squaredLength
     * @param {Array} a vector to calculate squared length of
     * @return {Number} squared length of a
     */
    Vec2.prototype.squaredLength = function (a) {
        var x = a[0], y = a[1];
        return x * x + y * y;
    };
    ;
    /**
     * Negates the components of a vec2
     * @static
     * @method negate
     * @param {Array} out the receiving vector
     * @param {Array} a vector to negate
     * @return {Array} out
     */
    Vec2.prototype.negate = function (out, a) {
        out[0] = -a[0];
        out[1] = -a[1];
        return out;
    };
    ;
    /**
     * Normalize a vec2
     * @static
     * @method normalize
     * @param {Array} out the receiving vector
     * @param {Array} a vector to normalize
     * @return {Array} out
     */
    Vec2.prototype.normalize = function (out, a) {
        var x = a[0], y = a[1];
        var len = x * x + y * y;
        if (len > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len = 1 / Math.sqrt(len);
            out[0] = a[0] * len;
            out[1] = a[1] * len;
        }
        return out;
    };
    ;
    /**
     * Calculates the dot product of two vec2's
     * @static
     * @method dot
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Number} dot product of a and b
     */
    Vec2.prototype.dot = function (a, b) {
        return a[0] * b[0] + a[1] * b[1];
    };
    ;
    /**
     * Returns a string representation of a vector
     * @static
     * @method str
     * @param {Array} vec vector to represent as a string
     * @return {String} string representation of the vector
     */
    Vec2.prototype.str = function (a) {
        throw "vec2.str is not supported in the typescript version of p2.";
        return 'vec2(' + a[0] + ', ' + a[1] + ')';
    };
    ;
    /**
     * Linearly interpolate/mix two vectors.
     * @static
     * @method lerp
     * @param {Array} out
     * @param {Array} a First vector
     * @param {Array} b Second vector
     * @param {number} t Lerp factor
     * @return {array}
     */
    Vec2.prototype.lerp = function (out, a, b, t) {
        var ax = a[0], ay = a[1];
        out[0] = ax + t * (b[0] - ax);
        out[1] = ay + t * (b[1] - ay);
        return out;
    };
    ;
    /**
     * Reflect a vector along a normal.
     * @static
     * @method reflect
     * @param {Array} out
     * @param {Array} vector
     * @param {Array} normal
     */
    Vec2.prototype.reflect = function (out, vector, normal) {
        var dot = vector[0] * normal[0] + vector[1] * normal[1];
        out[0] = vector[0] - 2 * normal[0] * dot;
        out[1] = vector[1] - 2 * normal[1] * dot;
    };
    ;
    /**
     * Get the intersection point between two line segments.
     * @static
     * @method getLineSegmentsIntersection
     * @param  {Array} out
     * @param  {Array} p0
     * @param  {Array} p1
     * @param  {Array} p2
     * @param  {Array} p3
     * @return {boolean} True if there was an intersection, otherwise false.
     */
    Vec2.prototype.getLineSegmentsIntersection = function (out, p0, p1, p2, p3) {
        var t = vec2.getLineSegmentsIntersectionFraction(p0, p1, p2, p3);
        if (t < 0) {
            return false;
        }
        else {
            out[0] = p0[0] + (t * (p1[0] - p0[0]));
            out[1] = p0[1] + (t * (p1[1] - p0[1]));
            return true;
        }
    };
    ;
    /**
     * Get the intersection fraction between two line segments. If successful, the intersection is at p0 + t * (p1 - p0)
     * @static
     * @method getLineSegmentsIntersectionFraction
     * @param  {Array} p0
     * @param  {Array} p1
     * @param  {Array} p2
     * @param  {Array} p3
     * @return {number} A number between 0 and 1 if there was an intersection, otherwise -1.
     */
    Vec2.prototype.getLineSegmentsIntersectionFraction = function (p0, p1, p2, p3) {
        var s1_x = p1[0] - p0[0];
        var s1_y = p1[1] - p0[1];
        var s2_x = p3[0] - p2[0];
        var s2_y = p3[1] - p2[1];
        var s, t;
        s = (-s1_y * (p0[0] - p2[0]) + s1_x * (p0[1] - p2[1])) / (-s2_x * s1_y + s1_x * s2_y);
        t = (s2_x * (p0[1] - p2[1]) - s2_y * (p0[0] - p2[0])) / (-s2_x * s1_y + s1_x * s2_y);
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) { // Collision detected
            return t;
        }
        return -1; // No collision
    };
    ;
    return Vec2;
}());
var vec2 = new Vec2();
exports.default = vec2;

},{}],29:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var add = vec2_1.default.add, sub = vec2_1.default.subtract, vec2create = vec2_1.default.create;
var aabb_1 = __importDefault(_dereq_("../collision/aabb"));
var poly_decomp_1 = __importDefault(_dereq_("../math/poly-decomp"));
var Convex_1 = __importDefault(_dereq_("../shapes/Convex"));
var ray_1 = __importDefault(_dereq_("../collision/ray"));
var raycast_result_1 = __importDefault(_dereq_("../collision/raycast-result"));
var event_emitter_1 = __importDefault(_dereq_("../events/event-emitter"));
//decomp = require('poly-decomp')
var integrate_fhMinv = vec2create();
var integrate_velodt = vec2create();
var _tmp = vec2create();
var _idCounter = 0;
var Body = /** @class */ (function (_super) {
    __extends(Body, _super);
    /**
     * A rigid body. Has got a center of mass, position, velocity and a number of
     * shapes that are used for collisions.
     *
     * @class Body
     * @constructor
     * @extends EventEmitter
     * @param {Object} [options]
     * @param {Boolean} [options.allowSleep=true]
     * @param {Number} [options.angle=0]
     * @param {Number} [options.angularDamping=0.1]
     * @param {Number} [options.angularForce=0]
     * @param {Number} [options.angularVelocity=0]
     * @param {Number} [options.ccdIterations=10]
     * @param {Number} [options.ccdSpeedThreshold=-1]
     * @param {Boolean} [options.collisionResponse]
     * @param {Number} [options.damping=0.1]
     * @param {Boolean} [options.fixedRotation=false]
     * @param {Boolean} [options.fixedX=false]
     * @param {Boolean} [options.fixedY=false]
     * @param {Array} [options.force]
     * @param {Number} [options.gravityScale=1]
     * @param {Number} [options.mass=0] A number >= 0. If zero, the .type will be set to Body.STATIC.
     * @param {Array} [options.position]
     * @param {Number} [options.sleepSpeedLimit]
     * @param {Number} [options.sleepTimeLimit]
     * @param {Number} [options.type] See {{#crossLink "Body/type:property"}}{{/crossLink}}
     * @param {Array} [options.velocity]
     *
     * @example
     *
     *     // Create a typical dynamic body
     *     var body = new Body({
     *         mass: 1, // non-zero mass will set type to Body.DYNAMIC
     *         position: [0, 5],
     *         angle: 0,
     *         velocity: [0, 0],
     *         angularVelocity: 0
     *     });
     *
     *     // Add a circular shape to the body
     *     var circleShape = new Circle({ radius: 0.5 });
     *     body.addShape(circleShape);
     *
     *     // Add the body to the world
     *     world.addBody(body);
     *
     * @example
     *
     *     // Create a static plane body
     *     var planeBody = new Body({
     *         mass: 0, // zero mass will set type to Body.STATIC
     *         position: [0, 0]
     *     });
     *     var planeShape = new Plane();
     *     planeBody.addShape(planeShape);
     *     world.addBody(planeBody);
     *
     * @example
     *
     *     // Create a moving kinematic box body
     *     var platformBody = new Body({
     *         type: Body.KINEMATIC,
     *         position: [0, 3],
     *         velocity: [1, 0]
     *     });
     *     var boxShape = new Box({ width: 2, height: 0.5 });
     *     platformBody.addShape(boxShape);
     *     world.addBody(platformBody);
     */
    function Body(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        var _this = _super.call(this) || this;
        /**
         * The body identifier. Read only!
         * @readonly
         * @property id
         * @type {Number}
        */
        _this.id = -1;
        /**
         * Index of the body in the World .bodies array. Is set to -1 if the body isn't added to a World.
         * @readonly
         * @property index
         * @type {Number}
         */
        _this.index = 0;
        /**
         * The world that this body is added to (read only). This property is set to NULL if the body is not added to any world.
         * @readonly
         * @property world
         * @type {World}
         */
        _this.world = null;
        /**
         * The shapes of the body.
         *
         * @property shapes
         * @type {Array}
         */
        _this.shapes = [];
        /**
         * The mass of the body. If you change this number, you should call {{#crossLink "Body/updateMassProperties:method"}}{{/crossLink}}.
         *
         * @property mass
         * @type {number}
         *
         * @example
         *     body.mass = 1;
         *     body.updateMassProperties();
         */
        _this.mass = 0;
        /**
         * The inverse mass of the body.
         *
         * @readonly
         * @property invMass
         * @type {number}
         */
        _this.invMass = 0;
        /**
         * The inertia of the body around the Z axis.
         * @readonly
         * @property inertia
         * @type {number}
         */
        _this.inertia = 0;
        /**
         * The inverse inertia of the body.
         * @readonly
         * @property invInertia
         * @type {number}
         */
        _this.invInertia = 0;
        _this.invMassSolve = 0;
        _this.invInertiaSolve = 0;
        /**
         * Set to true if you want to fix the rotation of the body.
         *
         * @property fixedRotation
         * @type {Boolean}
         *
         * @example
         *     // Fix rotation during runtime
         *     body.fixedRotation = true;
         *     body.updateMassProperties();
         */
        _this.fixedRotation = true;
        /**
         * Set to true if you want to fix the body movement along the X axis. The body will still be able to move along Y.
         * @property {Boolean} fixedX
         *
         * @example
         *     // Fix X movement on body creation
         *     var body = new Body({ mass: 1, fixedX: true });
         *
         * @example
         *     // Fix X movement during runtime
         *     body.fixedX = true;
         *     body.updateMassProperties();
         */
        _this.fixedX = false;
        /**
         * Set to true if you want to fix the body movement along the Y axis. The body will still be able to move along X. See .fixedX
         * @property {Boolean} fixedY
         */
        _this.fixedY = false;
        /**
         * Angular constraint velocity that was added to the body during last step.
         * @readonly
         * @property wlambda
         * @type {Array} // This was array before the port, but hte assignment was always 0.
         */
        _this.wlambda = 0;
        /**
         * The angle of the body, in radians.
         * @property angle
         * @type {number}
         * @example
         *     // The angle property is not normalized to the interval 0 to 2*pi, it can be any value.
         *     // If you need a value between 0 and 2*pi, use the following function to normalize it.
         *     function normalizeAngle(angle){
         *         angle = angle % (2*Math.PI);
         *         if(angle < 0){
         *             angle += (2*Math.PI);
         *         }
         *         return angle;
         *     }
         */
        _this.angle = 0;
        /**
         * The previous angle of the body.
         * @readonly
         * @property previousAngle
         * @type {Number}
         */
        _this.previousAngle = 0;
        /**
         * The interpolated angle of the body. Use this for rendering.
         * @readonly
         * @property interpolatedAngle
         * @type {Number}
         */
        _this.interpolatedAngle = 0;
        /**
         * The angular velocity of the body, in radians per second.
         * @property angularVelocity
         * @type {number}
         */
        _this.angularVelocity = 0;
        /**
         * The angular force acting on the body. See {{#crossLink "Body/force:property"}}{{/crossLink}}.
         * @property angularForce
         * @type {number}
         */
        _this.angularForce = 0;
        /**
         * The angular force acting on the body. Should be a value between 0 and 1.
         * @property angularDamping
         * @type {Number}
         * @default 0.1
         */
        _this.angularDamping = 0.1;
        /**
         * The type of motion this body has. Should be one of: {{#crossLink "Body/STATIC:property"}}Body.STATIC{{/crossLink}}, {{#crossLink "Body/DYNAMIC:property"}}Body.DYNAMIC{{/crossLink}} and {{#crossLink "Body/KINEMATIC:property"}}Body.KINEMATIC{{/crossLink}}.
         *
         * * Static bodies do not move, and they do not respond to forces or collision.
         * * Dynamic bodies body can move and respond to collisions and forces.
         * * Kinematic bodies only moves according to its .velocity, and does not respond to collisions or force.
         *
         * @property type
         * @type {number}
         *
         * @example
         *     // Bodies are static by default. Static bodies will never move.
         *     var body = new Body();
         *     console.log(body.type == Body.STATIC); // true
         *
         * @example
         *     // By setting the mass of a body to a nonzero number, the body
         *     // will become dynamic and will move and interact with other bodies.
         *     var dynamicBody = new Body({
         *         mass : 1
         *     });
         *     console.log(dynamicBody.type == Body.DYNAMIC); // true
         *
         * @example
         *     // Kinematic bodies will only move if you change their velocity.
         *     var kinematicBody = new Body({
         *         type: Body.KINEMATIC // Type can be set via the options object.
         *     });
         */
        _this.type = Body.STATIC;
        /**
         * Bounding circle radius. Update with {{#crossLink "Body/updateBoundingRadius:method"}}{{/crossLink}}.
         * @readonly
         * @property boundingRadius
         * @type {Number}
         */
        _this.boundingRadius = 0;
        /**
         * Indicates if the AABB needs update. Update it with {{#crossLink "Body/updateAABB:method"}}{{/crossLink}}.
         * @property aabbNeedsUpdate
         * @type {Boolean}
         * @see updateAABB
         *
         * @example
         *     // Force update the AABB
         *     body.aabbNeedsUpdate = true;
         *     body.updateAABB();
         *     console.log(body.aabbNeedsUpdate); // false
         */
        _this.aabbNeedsUpdate = true;
        /**
         * If true, the body will automatically fall to sleep. Note that you need to enable sleeping in the {{#crossLink "World"}}{{/crossLink}} before anything will happen.
         * @property allowSleep
         * @type {Boolean}
         * @default true
         */
        _this.allowSleep = true;
        _this.wantsToSleep = false;
        /**
         * One of {{#crossLink "Body/AWAKE:property"}}Body.AWAKE{{/crossLink}}, {{#crossLink "Body/SLEEPY:property"}}Body.SLEEPY{{/crossLink}} and {{#crossLink "Body/SLEEPING:property"}}Body.SLEEPING{{/crossLink}}.
         *
         * The body is initially Body.AWAKE. If its velocity norm is below .sleepSpeedLimit, the sleepState will become Body.SLEEPY. If the body continues to be Body.SLEEPY for .sleepTimeLimit seconds, it will fall asleep (Body.SLEEPY).
         *
         * @property sleepState
         * @type {Number}
         * @default Body.AWAKE
         */
        _this.sleepState = Body.AWAKE;
        /**
         * If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
         * @property sleepSpeedLimit
         * @type {Number}
         * @default 0.2
         */
        _this.sleepSpeedLimit = 0.2;
        /**
         * If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
         * @property sleepTimeLimit
         * @type {Number}
         * @default 1
         */
        _this.sleepTimeLimit = 1;
        /**
         * Gravity scaling factor. If you want the body to ignore gravity, set this to zero. If you want to reverse gravity, set it to -1.
         * @property {Number} gravityScale
         * @default 1
         */
        _this.gravityScale = 1;
        /**
         * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled. That means that this body will move through other bodies, but it will still trigger contact events, etc.
         * @property {Boolean} collisionResponse
         */
        _this.collisionResponse = true;
        /**
         * How long the body has been sleeping.
         * @readonly
         * @property {Number} idleTime
         */
        _this.idleTime = 0;
        /**
         * The last time when the body went to SLEEPY state.
         * @readonly
         * @property {Number} timeLastSleepy
         * @private
         */
        _this.timeLastSleepy = 0;
        /**
         * If the body speed exceeds this threshold, CCD (continuous collision detection) will be enabled. Set it to a negative number to disable CCD completely for this body.
         * @property {number} ccdSpeedThreshold
         * @default -1
         */
        _this.ccdSpeedThreshold = -1;
        /**
         * The number of iterations that should be used when searching for the time of impact during CCD. A larger number will assure that there's a small penetration on CCD collision, but a small number will give more performance.
         * @property {number} ccdIterations
         * @default 10
         */
        _this.ccdIterations = 10;
        /**
         * @property {number} islandId
         */
        _this.islandId = -1;
        _this.concavePath = [];
        // Should be private, but used by world.
        _this._wakeUpAfterNarrowphase = false;
        _this._shapeAABB = new aabb_1.default();
        _this.id = (_a = options === null || options === void 0 ? void 0 : options.id) !== null && _a !== void 0 ? _a : ++_idCounter;
        _this.mass = (_b = options === null || options === void 0 ? void 0 : options.mass) !== null && _b !== void 0 ? _b : 0;
        _this.fixedRotation = (_c = options === null || options === void 0 ? void 0 : options.fixedRotation) !== null && _c !== void 0 ? _c : false;
        _this.fixedX = (_d = options === null || options === void 0 ? void 0 : options.fixedX) !== null && _d !== void 0 ? _d : false;
        _this.fixedY = (_e = options === null || options === void 0 ? void 0 : options.fixedY) !== null && _e !== void 0 ? _e : false;
        _this.massMultiplier = vec2create();
        _this.position = (options === null || options === void 0 ? void 0 : options.position) ? vec2_1.default.clone(options.position) : vec2create();
        _this.interpolatedPosition = vec2_1.default.clone(_this.position);
        _this.previousPosition = vec2_1.default.clone(_this.position);
        _this.velocity = (options === null || options === void 0 ? void 0 : options.velocity) ? vec2_1.default.clone(options.velocity) : vec2create();
        _this.vlambda = vec2create();
        _this.angle = (_f = options === null || options === void 0 ? void 0 : options.angle) !== null && _f !== void 0 ? _f : 0;
        _this.previousAngle = _this.angle;
        _this.interpolatedAngle = _this.angle;
        _this.angularVelocity = (_g = options === null || options === void 0 ? void 0 : options.angularVelocity) !== null && _g !== void 0 ? _g : 0;
        _this.force = (options === null || options === void 0 ? void 0 : options.force) ? vec2_1.default.clone(options.force) : vec2create();
        _this.angularForce = (_h = options === null || options === void 0 ? void 0 : options.angularForce) !== null && _h !== void 0 ? _h : 0;
        _this.damping = (_j = options === null || options === void 0 ? void 0 : options.damping) !== null && _j !== void 0 ? _j : 0.1;
        _this.angularDamping = (_k = options === null || options === void 0 ? void 0 : options.angularDamping) !== null && _k !== void 0 ? _k : 0.1;
        _this.sleepTimeLimit = (_l = options === null || options === void 0 ? void 0 : options.sleepTimeLimit) !== null && _l !== void 0 ? _l : 1;
        if ((options === null || options === void 0 ? void 0 : options.type) !== undefined) {
            _this.type = options.type;
        }
        else if (!(options === null || options === void 0 ? void 0 : options.mass)) {
            _this.type = Body.STATIC;
        }
        else {
            _this.type = Body.DYNAMIC;
        }
        _this.aabb = new aabb_1.default();
        _this.allowSleep = (_m = options === null || options === void 0 ? void 0 : options.allowSleep) !== null && _m !== void 0 ? _m : true;
        _this.sleepSpeedLimit = (_o = options === null || options === void 0 ? void 0 : options.sleepSpeedLimit) !== null && _o !== void 0 ? _o : 0.2;
        _this.gravityScale = (_p = options === null || options === void 0 ? void 0 : options.gravityScale) !== null && _p !== void 0 ? _p : 1;
        _this.collisionResponse = (_q = options === null || options === void 0 ? void 0 : options.collisionResponse) !== null && _q !== void 0 ? _q : true;
        _this.ccdSpeedThreshold = (_r = options === null || options === void 0 ? void 0 : options.ccdSpeedThreshold) !== null && _r !== void 0 ? _r : -1;
        _this.ccdIterations = (_s = options === null || options === void 0 ? void 0 : options.ccdIterations) !== null && _s !== void 0 ? _s : 10;
        _this.updateMassProperties();
        return _this;
    }
    /**
     * @private
     * @method updateSolveMassProperties
     */
    Body.prototype.updateSolveMassProperties = function () {
        if (this.sleepState === Body.SLEEPING || this.type === Body.KINEMATIC) {
            this.invMassSolve = 0;
            this.invInertiaSolve = 0;
        }
        else {
            this.invMassSolve = this.invMass;
            this.invInertiaSolve = this.invInertia;
        }
    };
    ;
    /**
     * Set the total density of the body
     * @method setDensity
     * @param {number} density
     */
    Body.prototype.setDensity = function (density) {
        var totalArea = this.getArea();
        this.mass = totalArea * density;
        this.updateMassProperties();
    };
    ;
    /**
     * Get the total area of all shapes in the body
     * @method getArea
     * @return {Number}
     */
    Body.prototype.getArea = function () {
        var totalArea = 0;
        for (var i = 0; i < this.shapes.length; i++) {
            totalArea += this.shapes[i].area;
        }
        return totalArea;
    };
    ;
    /**
     * Get the AABB from the body. The AABB is updated if necessary.
     * @method getAABB
     * @return {AABB} The AABB instance from the body.
     */
    Body.prototype.getAABB = function () {
        if (this.aabbNeedsUpdate) {
            this.updateAABB();
        }
        return this.aabb;
    };
    ;
    /**
     * Updates the AABB of the Body, and set .aabbNeedsUpdate = false.
     * @method updateAABB
     */
    Body.prototype.updateAABB = function () {
        var shapes = this.shapes, N = shapes.length, offset = _tmp, bodyAngle = this.angle;
        for (var i = 0; i !== N; i++) {
            var shape = shapes[i], angle = shape.angle + bodyAngle;
            // Get shape world offset
            vec2_1.default.toGlobalFrame(offset, shape.position, this.position, bodyAngle);
            // Get shape AABB
            shape.computeAABB(this._shapeAABB, offset, angle);
            if (i === 0) {
                this.aabb.copy(this._shapeAABB);
            }
            else {
                this.aabb.extend(this._shapeAABB);
            }
        }
        this.aabbNeedsUpdate = false;
    };
    ;
    /**
     * Update the bounding radius of the body (this.boundingRadius). Should be done if any of the shape dimensions or positions are changed.
     * @method updateBoundingRadius
     */
    Body.prototype.updateBoundingRadius = function () {
        var shapes = this.shapes, N = shapes.length, radius = 0;
        for (var i = 0; i !== N; i++) {
            var shape = shapes[i], offset = vec2_1.default.length(shape.position), r = shape.boundingRadius;
            if (offset + r > radius) {
                radius = offset + r;
            }
        }
        this.boundingRadius = radius;
    };
    ;
    /**
     * Add a shape to the body. You can pass a local transform when adding a shape,
     * so that the shape gets an offset and angle relative to the body center of mass.
     * Will automatically update the mass properties and bounding radius.
     *
     * @method addShape
     * @param  {Shape}              shape
     * @param  {Array} [offset] Local body offset of the shape.
     * @param  {Number}             [angle]  Local body angle.
     *
     * @example
     *     var body = new Body(),
     *         shape = new Circle({ radius: 1 });
     *
     *     // Add the shape to the body, positioned in the center
     *     body.addShape(shape);
     *
     *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local x-axis.
     *     body.addShape(shape,[1,0]);
     *
     *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local y-axis, and rotated 90 degrees CCW.
     *     body.addShape(shape,[0,1],Math.PI/2);
     */
    Body.prototype.addShape = function (shape, offset, angle) {
        if (angle === void 0) { angle = 0; }
        if (shape.body) {
            throw new Error('A shape can only be added to one body.');
        }
        var world = this.world;
        if (world && world.stepping) {
            throw new Error('A shape cannot be added during step.');
        }
        shape.body = this;
        // Copy the offset vector
        if (offset) {
            vec2_1.default.copy(shape.position, offset);
        }
        else {
            vec2_1.default.set(shape.position, 0, 0);
        }
        shape.angle = angle || 0;
        this.shapes.push(shape);
        this.updateMassProperties();
        this.updateBoundingRadius();
        this.aabbNeedsUpdate = true;
    };
    ;
    /**
     * Remove a shape.
     * @method removeShape
     * @param  {Shape} shape
     * @return {Boolean} True if the shape was found and removed, else false.
     */
    Body.prototype.removeShape = function (shape) {
        var world = this.world;
        if (world && world.stepping) {
            throw new Error('A shape cannot be removed during step.');
        }
        var idx = this.shapes.indexOf(shape);
        if (idx !== -1) {
            this.shapes.splice(idx, 1);
            this.aabbNeedsUpdate = true;
            shape.body = undefined;
            return true;
        }
        else {
            return false;
        }
    };
    ;
    /**
     * Updates .inertia, .invMass, .invInertia for this Body. Should be called when changing the structure or mass of the Body.
     *
     * @method updateMassProperties
     *
     * @example
     *     body.mass += 1;
     *     body.updateMassProperties();
     */
    Body.prototype.updateMassProperties = function () {
        if (this.type === Body.STATIC || this.type === Body.KINEMATIC) {
            // Consider making it infinity.
            this.mass = Infinity;
            this.invMass = 0;
            this.inertia = Infinity;
            this.invInertia = 0;
        }
        else {
            var shapes = this.shapes, N = shapes.length, I = 0;
            if (!this.fixedRotation) {
                for (var i = 0; i < N; i++) {
                    var shape = shapes[i], r2 = vec2_1.default.squaredLength(shape.position), Icm = shape.computeMomentOfInertia();
                    I += Icm + r2;
                }
                this.inertia = this.mass * I;
                this.invInertia = I > 0 ? 1 / I : 0;
            }
            else {
                this.inertia = Infinity;
                this.invInertia = 0;
            }
            // Inverse mass properties are easy
            this.invMass = 1 / this.mass;
            vec2_1.default.set(this.massMultiplier, this.fixedX ? 0 : 1, this.fixedY ? 0 : 1);
        }
    };
    ;
    /**
     * Apply force to a point relative to the center of mass of the body. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.angularForce.
     * @method applyForce
     * @param  {Array} force The force vector to add, oriented in world space.
     * @param  {Array} [relativePoint] A point relative to the body in world space. If not given, it is set to zero and all of the force will be exerted on the center of mass.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var relativePoint = [1, 0]; // Will apply the force at [body.position[0] + 1, body.position[1]]
     *     var force = [0, 1]; // up
     *     body.applyForce(force, relativePoint);
     *     console.log(body.force); // [0, 1]
     *     console.log(body.angularForce); // 1
     */
    Body.prototype.applyForce = function (force, relativePoint) {
        // Add linear force
        add(this.force, this.force, force);
        if (relativePoint) {
            // Compute produced rotational force
            var rotForce = vec2_1.default.crossLength(relativePoint, force);
            // Add rotational force
            this.angularForce += rotForce;
        }
    };
    ;
    /**
     * Apply force to a point relative to the center of mass of the body. This could for example be a point on the Body surface. Applying force this way will add to Body.force and Body.angularForce.
     * @method applyForceLocal
     * @param  {Array} localForce The force vector to add, oriented in local body space.
     * @param  {Array} [localPoint] A point relative to the body in local body space. If not given, it is set to zero and all of the force will be exerted on the center of mass.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var localPoint = [1, 0]; // x=1 locally in the body
     *     var localForce = [0, 1]; // up, locally in the body
     *     body.applyForceLocal(localForce, localPoint);
     *     console.log(body.force); // [0, 1]
     *     console.log(body.angularForce); // 1
     */
    Body.prototype.applyForceLocal = function (localForce, localPoint) {
        // These 3 lines were originally outside of this function. Not sure why.
        var Body_applyForce_forceWorld = vec2create();
        var Body_applyForce_pointWorld = vec2create();
        var Body_applyForce_pointLocal = vec2create();
        localPoint = localPoint || Body_applyForce_pointLocal;
        var worldForce = Body_applyForce_forceWorld;
        var worldPoint = Body_applyForce_pointWorld;
        this.vectorToWorldFrame(worldForce, localForce);
        this.vectorToWorldFrame(worldPoint, localPoint);
        this.applyForce(worldForce, worldPoint);
    };
    ;
    /**
     * Apply impulse to a point relative to the body. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
     * @method applyImpulse
     * @param  {Array} impulseVector The impulse vector to add, oriented in world space.
     * @param  {Array} [relativePoint] A point relative to the body in world space. If not given, it is set to zero and all of the impulse will be exerted on the center of mass.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var relativePoint = [0, 0]; // center of the body
     *     var impulseVector = [0, 1]; // world up
     *     body.applyImpulse(impulseVector, relativePoint);
     */
    Body.prototype.applyImpulse = function (impulseVector, relativePoint) {
        var Body_applyImpulse_velo = vec2create(); // Was originally outside of this function. 
        if (this.type !== Body.DYNAMIC) {
            return;
        }
        // Compute produced central impulse velocity
        var velo = Body_applyImpulse_velo;
        vec2_1.default.scale(velo, impulseVector, this.invMass);
        vec2_1.default.multiply(velo, this.massMultiplier, velo);
        // Add linear impulse
        add(this.velocity, velo, this.velocity);
        if (relativePoint) {
            // Compute produced rotational impulse velocity
            var rotVelo = vec2_1.default.crossLength(relativePoint, impulseVector);
            rotVelo *= this.invInertia;
            // Add rotational Impulse
            this.angularVelocity += rotVelo;
        }
    };
    ;
    /**
     * Apply impulse to a point relative to the body. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
     * @method applyImpulseLocal
     * @param  {Array} localImpulse The impulse vector to add, oriented in local body space.
     * @param  {Array} [localPoint] A point relative to the body in local body space. If not given, it is set to zero and all of the impulse will be exerted on the center of mass.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var localPoint = [1, 0]; // x=1, locally in the body
     *     var localImpulse = [0, 1]; // up, locally in the body
     *     body.applyImpulseLocal(localImpulse, localPoint);
     *     console.log(body.velocity); // [1, 0]
     *     console.log(body.angularVelocity); // 1
     */
    Body.prototype.applyImpulseLocal = function (localImpulse, localPoint) {
        // Originally outside of this function.
        var Body_applyImpulse_impulseWorld = vec2create();
        var Body_applyImpulse_pointWorld = vec2create();
        var Body_applyImpulse_pointLocal = vec2create();
        localPoint = localPoint || Body_applyImpulse_pointLocal;
        var worldImpulse = Body_applyImpulse_impulseWorld;
        var worldPoint = Body_applyImpulse_pointWorld;
        this.vectorToWorldFrame(worldImpulse, localImpulse);
        this.vectorToWorldFrame(worldPoint, localPoint);
        this.applyImpulse(worldImpulse, worldPoint);
    };
    ;
    /**
     * Transform a world point to local body frame.
     * @method toLocalFrame
     * @param  {Array} out          The point to store the result in
     * @param  {Array} worldPoint   The input world point
     */
    Body.prototype.toLocalFrame = function (out, worldPoint) {
        vec2_1.default.toLocalFrame(out, worldPoint, this.position, this.angle);
    };
    ;
    /**
     * Transform a local point to world frame.
     * @method toWorldFrame
     * @param  {Array} out          The point to store the result in
     * @param  {Array} localPoint   The input local point
     */
    Body.prototype.toWorldFrame = function (out, localPoint) {
        vec2_1.default.toGlobalFrame(out, localPoint, this.position, this.angle);
    };
    ;
    /**
     * Transform a world vector to local body frame.
     * @method vectorToLocalFrame
     * @param  {Array} out          The vector to store the result in
     * @param  {Array} worldVector  The input world vector
     */
    Body.prototype.vectorToLocalFrame = function (out, worldVector) {
        vec2_1.default.vectorToLocalFrame(out, worldVector, this.angle);
    };
    ;
    /**
     * Transform a local vector to world frame.
     * @method vectorToWorldFrame
     * @param  {Array} out          The vector to store the result in
     * @param  {Array} localVector  The input local vector
     */
    Body.prototype.vectorToWorldFrame = function (out, localVector) {
        vec2_1.default.rotate(out, localVector, this.angle);
    };
    ;
    /**
     * Reads a polygon shape path, and assembles convex shapes from that and puts them at proper offset points.
     * @method fromPolygon
     * @param {Array} path An array of 2d vectors, e.g. [[0,0],[0,1],...] that resembles a concave or convex polygon. The shape must be simple and without holes.
     * @param {Object} [options]
     * @param {Boolean} [options.optimalDecomp=false]   Set to true if you need optimal decomposition. Warning: very slow for polygons with more than 10 vertices.
     * @param {Boolean} [options.skipSimpleCheck=false] Set to true if you already know that the path is not intersecting itself.
     * @param {Number} [options.removeCollinearPoints=0] Set to a number (angle threshold value) to remove collinear points, or 0 to keep all points.
     * @return {Boolean} True on success, else false.
     * @example
     *     var body = new Body();
     *     var path = [
     *         [-1, 1],
     *         [-1, 0],
     *         [1, 0],
     *         [1, 1],
     *         [0.5, 0.5]
     *     ];
     *     body.fromPolygon(path);
     *     console.log(body.shapes); // [Convex, Convex, ...]
     */
    Body.prototype.fromPolygon = function (path, options) {
        var _a, _b, _c;
        // Remove all shapes
        for (var i = this.shapes.length; i >= 0; --i) {
            this.removeShape(this.shapes[i]);
        }
        // Copy the path
        var p = [];
        for (var i = 0; i < path.length; i++) {
            p[i] = vec2_1.default.clone(path[i]);
        }
        // Make it counter-clockwise
        poly_decomp_1.default.makeCCW(p);
        if ((options === null || options === void 0 ? void 0 : options.removeCollinearPoints) != 0) {
            poly_decomp_1.default.removeCollinearPoints(p, (_a = options === null || options === void 0 ? void 0 : options.removeCollinearPoints) !== null && _a !== void 0 ? _a : 0);
        }
        // Check if any line segment intersects the path itself
        if (!(options === null || options === void 0 ? void 0 : options.skipSimpleCheck)) {
            if (!poly_decomp_1.default.isSimple(p)) {
                return false;
            }
        }
        // Save this path for later
        this.concavePath = [];
        for (var i = 0; i < p.length; i++) {
            this.concavePath[i] = vec2_1.default.clone(p[i]);
        }
        // Slow or fast decomp?
        var convexes;
        if (options === null || options === void 0 ? void 0 : options.optimalDecomp) {
            convexes = (_b = poly_decomp_1.default.decomp(p)) !== null && _b !== void 0 ? _b : new Array();
        }
        else {
            convexes = (_c = poly_decomp_1.default.quickDecomp(p)) !== null && _c !== void 0 ? _c : new Array();
        }
        var cm = vec2create();
        // Add convexes
        for (var i = 0; i !== convexes.length; i++) {
            // Create convex
            var c = new Convex_1.default(undefined, convexes[i]);
            // Move all vertices so its center of mass is in the local center of the convex
            for (var j = 0; j !== c.vertices.length; j++) {
                var v = c.vertices[j];
                sub(v, v, c.centerOfMass);
            }
            vec2_1.default.copy(cm, c.centerOfMass);
            c = new Convex_1.default(undefined, c.vertices);
            // Add the shape
            this.addShape(c, cm);
        }
        this.adjustCenterOfMass();
        this.aabbNeedsUpdate = true;
        return true;
    };
    /**
     * Moves the shape offsets so their center of mass becomes the body center of mass.
     * @method adjustCenterOfMass
     * @example
     *     var body = new Body({ position: [0, 0] });
     *     var shape = new Circle({ radius: 1 });
     *     body.addShape(shape, [1, 0], 0);
     *     body.adjustCenterOfMass();
     *     console.log(body.position); // [1, 0]
     *     console.log(shape.position); // [0, 0]
     */
    Body.prototype.adjustCenterOfMass = function () {
        var adjustCenterOfMass_tmp2 = vec2create(), adjustCenterOfMass_tmp3 = vec2create(), adjustCenterOfMass_tmp4 = vec2create();
        var offset_times_area = adjustCenterOfMass_tmp2, sum = adjustCenterOfMass_tmp3, cm = adjustCenterOfMass_tmp4, totalArea = 0;
        vec2_1.default.set(sum, 0, 0);
        for (var i = 0; i !== this.shapes.length; i++) {
            var s = this.shapes[i];
            vec2_1.default.scale(offset_times_area, s.position, s.area);
            add(sum, sum, offset_times_area);
            totalArea += s.area;
        }
        vec2_1.default.scale(cm, sum, 1 / totalArea);
        // Now move all shapes
        for (var i = 0; i !== this.shapes.length; i++) {
            var s = this.shapes[i];
            sub(s.position, s.position, cm);
        }
        // Move the body position too
        add(this.position, this.position, cm);
        // And concave path
        for (var i = 0; this.concavePath && i < this.concavePath.length; i++) {
            sub(this.concavePath[i], this.concavePath[i], cm);
        }
        this.updateMassProperties();
        this.updateBoundingRadius();
    };
    /**
     * Sets the force on the body to zero.
     * @method setZeroForce
     */
    Body.prototype.setZeroForce = function () {
        var f = this.force;
        f[0] = f[1] = this.angularForce = 0;
    };
    Body.prototype.resetConstraintVelocity = function () {
        var b = this, vlambda = b.vlambda;
        vec2_1.default.set(vlambda, 0, 0);
        b.wlambda = 0;
    };
    Body.prototype.addConstraintVelocity = function () {
        var b = this, v = b.velocity;
        add(v, v, b.vlambda);
        b.angularVelocity += b.wlambda;
    };
    /**
     * Apply damping, see <a href="http://code.google.com/p/bullet/issues/detail?id=74">this</a> for details.
     * @method applyDamping
     * @param  {number} dt Current time step
     */
    Body.prototype.applyDamping = function (dt) {
        if (this.type === Body.DYNAMIC) { // Only for dynamic bodies
            var v = this.velocity;
            vec2_1.default.scale(v, v, Math.pow(1 - this.damping, dt));
            this.angularVelocity *= Math.pow(1 - this.angularDamping, dt);
        }
    };
    /**
     * Wake the body up. Normally you should not need this, as the body is automatically awoken at events such as collisions.
     * Sets the sleepState to {{#crossLink "Body/AWAKE:property"}}Body.AWAKE{{/crossLink}} and emits the wakeUp event if the body wasn't awake before.
     * @method wakeUp
     */
    Body.prototype.wakeUp = function () {
        var s = this.sleepState;
        this.sleepState = Body.AWAKE;
        this.idleTime = 0;
        if (s !== Body.AWAKE) {
            _super.prototype.emit.call(this, wakeUpEvent);
        }
    };
    /**
     * Force body sleep
     * @method sleep
     */
    Body.prototype.sleep = function () {
        this.sleepState = Body.SLEEPING;
        this.angularVelocity = this.angularForce = 0;
        vec2_1.default.set(this.velocity, 0, 0);
        vec2_1.default.set(this.force, 0, 0);
        _super.prototype.emit.call(this, sleepEvent);
    };
    /**
     * Called every timestep to update internal sleep timer and change sleep state if needed.
     * @method sleepTick
     * @param {number} time The world time in seconds
     * @param {boolean} dontSleep
     * @param {number} dt
     */
    Body.prototype.sleepTick = function (time, dontSleep, dt) {
        if (!this.allowSleep || this.type === Body.SLEEPING) {
            return;
        }
        this.wantsToSleep = false;
        var speedSquared = vec2_1.default.squaredLength(this.velocity) + Math.pow(this.angularVelocity, 2), speedLimitSquared = Math.pow(this.sleepSpeedLimit, 2);
        // Add to idle time
        if (speedSquared >= speedLimitSquared) {
            this.idleTime = 0;
            this.sleepState = Body.AWAKE;
        }
        else {
            this.idleTime += dt;
            if (this.sleepState !== Body.SLEEPY) {
                this.sleepState = Body.SLEEPY;
                _super.prototype.emit.call(this, sleepyEvent);
            }
        }
        if (this.idleTime > this.sleepTimeLimit) {
            if (!dontSleep) {
                this.sleep();
            }
            else {
                this.wantsToSleep = true;
            }
        }
    };
    /**
     * Check if the body is overlapping another body. Note that this method only works if the body was added to a World and if at least one step was taken.
     * @method overlaps
     * @param  {Body} body
     * @return {boolean}
     */
    Body.prototype.overlaps = function (body) {
        if (!this.world)
            return false;
        return this.world.overlapKeeper.bodiesAreOverlapping(this, body);
    };
    /**
     * Move the body forward in time given its current velocity.
     * @method integrate
     * @param  {Number} dt
     */
    Body.prototype.integrate = function (dt) {
        var minv = this.invMass, f = this.force, pos = this.position, velo = this.velocity;
        // Save old position
        vec2_1.default.copy(this.previousPosition, this.position);
        this.previousAngle = this.angle;
        // Velocity update
        if (!this.fixedRotation) {
            this.angularVelocity += this.angularForce * this.invInertia * dt;
        }
        vec2_1.default.scale(integrate_fhMinv, f, dt * minv);
        vec2_1.default.multiply(integrate_fhMinv, this.massMultiplier, integrate_fhMinv);
        add(velo, integrate_fhMinv, velo);
        // CCD
        if (!this.integrateToTimeOfImpact(dt)) {
            // Regular position update
            vec2_1.default.scale(integrate_velodt, velo, dt);
            add(pos, pos, integrate_velodt);
            if (!this.fixedRotation) {
                this.angle += this.angularVelocity * dt;
            }
        }
        this.aabbNeedsUpdate = true;
    };
    Body.prototype.integrateToTimeOfImpact = function (dt) {
        var _a;
        if (!this.world)
            return false;
        var result = new raycast_result_1.default();
        var ray = new ray_1.default({
            mode: ray_1.default.CLOSEST,
            skipBackfaces: true
        });
        var direction = vec2create();
        var end = vec2create();
        var startToEnd = vec2create();
        var rememberPosition = vec2create();
        if (this.ccdSpeedThreshold < 0 || vec2_1.default.squaredLength(this.velocity) < Math.pow(this.ccdSpeedThreshold, 2)) {
            return false;
        }
        // Ignore all the ignored body pairs
        // This should probably be done somewhere else for optimization
        var ignoreBodies = [];
        var disabledPairs = this.world.disabledBodyCollisionPairs;
        for (var i = 0; i < disabledPairs.length; i += 2) {
            var bodyA = disabledPairs[i];
            var bodyB = disabledPairs[i + 1];
            if (bodyA === this) {
                ignoreBodies.push(bodyB);
            }
            else if (bodyB === this) {
                ignoreBodies.push(bodyA);
            }
        }
        vec2_1.default.normalize(direction, this.velocity);
        vec2_1.default.scale(end, this.velocity, dt);
        add(end, end, this.position);
        sub(startToEnd, end, this.position);
        var startToEndAngle = this.angularVelocity * dt;
        var len = vec2_1.default.length(startToEnd);
        var timeOfImpact = 1;
        var hitBody = null;
        vec2_1.default.copy(ray.from, this.position);
        vec2_1.default.copy(ray.to, end);
        ray.update();
        for (var i = 0; i < this.shapes.length; i++) {
            var shape = this.shapes[i];
            result.reset();
            ray.collisionGroup = shape.collisionGroup;
            ray.collisionMask = shape.collisionMask;
            this.world.raycast(result, ray);
            hitBody = (_a = result.body) !== null && _a !== void 0 ? _a : null;
            if (!hitBody)
                continue;
            if (hitBody === this || ignoreBodies.indexOf(hitBody) !== -1) {
                hitBody = null;
            }
            if (hitBody) {
                break;
            }
        }
        if (!hitBody || !timeOfImpact) {
            return false;
        }
        result.getHitPoint(end, ray);
        sub(startToEnd, end, this.position);
        timeOfImpact = vec2_1.default.distance(end, this.position) / len; // guess
        var rememberAngle = this.angle;
        vec2_1.default.copy(rememberPosition, this.position);
        // Got a start and end point. Approximate time of impact using binary search
        var iter = 0;
        var tmin = 0;
        var tmid = timeOfImpact;
        var tmax = 1;
        while (tmax >= tmin && iter < this.ccdIterations) {
            iter++;
            // calculate the midpoint
            tmid = (tmax + tmin) / 2;
            // Move the body to that point
            vec2_1.default.scale(integrate_velodt, startToEnd, tmid);
            add(this.position, rememberPosition, integrate_velodt);
            this.angle = rememberAngle + startToEndAngle * tmid;
            this.updateAABB();
            // check overlap
            var overlaps = this.aabb.overlaps(hitBody.aabb) && this.world.narrowphase.bodiesOverlap(this, hitBody, true);
            if (overlaps) {
                // change max to search lower interval
                tmax = tmid;
            }
            else {
                // change min to search upper interval
                tmin = tmid;
            }
        }
        timeOfImpact = tmax; // Need to guarantee overlap to resolve collisions
        vec2_1.default.copy(this.position, rememberPosition);
        this.angle = rememberAngle;
        // move to TOI
        vec2_1.default.scale(integrate_velodt, startToEnd, timeOfImpact);
        add(this.position, this.position, integrate_velodt);
        if (!this.fixedRotation) {
            this.angle += startToEndAngle * timeOfImpact;
        }
        return true;
    };
    /**
     * Get velocity of a point in the body.
     * @method getVelocityAtPoint
     * @param  {Array} result A vector to store the result in
     * @param  {Array} relativePoint A world oriented vector, indicating the position of the point to get the velocity from
     * @return {Array} The result vector
     * @example
     *     var body = new Body({
     *         mass: 1,
     *         velocity: [1, 0],
     *         angularVelocity: 1
     *     });
     *     var result = [];
     *     var point = [1, 0];
     *     body.getVelocityAtPoint(result, point);
     *     console.log(result); // [1, 1]
     */
    Body.prototype.getVelocityAtPoint = function (result, relativePoint) {
        vec2_1.default.crossVZ(result, relativePoint, this.angularVelocity);
        vec2_1.default.subtract(result, this.velocity, result);
        return result;
    };
    /**
     * Dynamic body.
     * @property DYNAMIC
     * @type {Number}
     * @static
     */
    Body.DYNAMIC = 1;
    /**
     * Static body.
     * @property STATIC
     * @type {Number}
     * @static
     */
    Body.STATIC = 2;
    /**
     * Kinematic body.
     * @property KINEMATIC
     * @type {Number}
     * @static
     */
    Body.KINEMATIC = 4;
    /**
     * @property AWAKE
     * @type {Number}
     * @static
     */
    Body.AWAKE = 0;
    /**
     * @property SLEEPY
     * @type {Number}
     * @static
     */
    Body.SLEEPY = 1;
    /**
     * @property SLEEPING
     * @type {Number}
     * @static
     */
    Body.SLEEPING = 2;
    return Body;
}(event_emitter_1.default));
exports.default = Body;
/**
 * @event sleepy
 */
var sleepyEvent = {
    type: "sleepy"
};
/**
 * @event sleep
 */
var sleepEvent = {
    type: "sleep"
};
/**
 * @event wakeup
 */
var wakeUpEvent = {
    type: "wakeup"
};

},{"../collision/aabb":1,"../collision/ray":5,"../collision/raycast-result":6,"../events/event-emitter":21,"../math/poly-decomp":26,"../math/vec2":28,"../shapes/Convex":37}],30:[function(_dereq_,module,exports){
module.exports=_dereq_(29)
},{"../collision/aabb":1,"../collision/ray":5,"../collision/raycast-result":6,"../events/event-emitter":21,"../math/poly-decomp":26,"../math/vec2":28,"../shapes/Convex":37}],31:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var spring_1 = __importDefault(_dereq_("./spring"));
var applyForce_r = vec2_1.default.create(), applyForce_r_unit = vec2_1.default.create(), applyForce_u = vec2_1.default.create(), applyForce_f = vec2_1.default.create(), applyForce_worldAnchorA = vec2_1.default.create(), applyForce_worldAnchorB = vec2_1.default.create(), applyForce_ri = vec2_1.default.create(), applyForce_rj = vec2_1.default.create(), applyForce_tmp = vec2_1.default.create();
var LinearSpring = /** @class */ (function (_super) {
    __extends(LinearSpring, _super);
    /**
     * A spring, connecting two bodies.
     *
     * The Spring explicitly adds force and angularForce to the bodies.
     *
     * @class LinearSpring
     * @extends Spring
     * @constructor
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {number} [options.restLength]   A number > 0. Default is the current distance between the world anchor points.
     * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
     * @param {number} [options.damping=1]      A number >= 0. Default: 1
     * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
     * @param {Array}  [options.worldAnchorB]
     * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
     * @param {Array}  [options.localAnchorB]
     *
     * @example
     *     var spring = new LinearSpring(bodyA, bodyB, {
     *         stiffness: 100,
     *         damping: 1,
     *         localAnchorA: [0,0], // center of bodyA
     *         localAnchorB: [0,0] // center of bodyB
     *     });
     *     world.addSpring(spring);
     */
    function LinearSpring(bodyA, bodyB, options) {
        var _a;
        var _this = _super.call(this, bodyA, bodyB, options) || this;
        _this.localAnchorA = vec2_1.default.create();
        _this.localAnchorB = vec2_1.default.create();
        if (options === null || options === void 0 ? void 0 : options.localAnchorA) {
            vec2_1.default.copy(_this.localAnchorA, options.localAnchorA);
        }
        if (options === null || options === void 0 ? void 0 : options.localAnchorB) {
            vec2_1.default.copy(_this.localAnchorB, options.localAnchorB);
        }
        if (options === null || options === void 0 ? void 0 : options.worldAnchorA) {
            _this.setWorldAnchorA(options.worldAnchorA);
        }
        if (options === null || options === void 0 ? void 0 : options.worldAnchorB) {
            _this.setWorldAnchorB(options.worldAnchorB);
        }
        var worldAnchorA = vec2_1.default.create();
        var worldAnchorB = vec2_1.default.create();
        _this.getWorldAnchorA(worldAnchorA);
        _this.getWorldAnchorB(worldAnchorB);
        var worldDistance = vec2_1.default.distance(worldAnchorA, worldAnchorB);
        _this.restLength = (_a = options === null || options === void 0 ? void 0 : options.restLength) !== null && _a !== void 0 ? _a : worldDistance;
        return _this;
    }
    /**
     * Set the anchor point on body A, using world coordinates.
     * @method setWorldAnchorA
     * @param {Array} worldAnchorA
     */
    LinearSpring.prototype.setWorldAnchorA = function (worldAnchorA) {
        this.bodyA.toLocalFrame(this.localAnchorA, worldAnchorA);
    };
    /**
     * Set the anchor point on body B, using world coordinates.
     * @method setWorldAnchorB
     * @param {Array} worldAnchorB
     */
    LinearSpring.prototype.setWorldAnchorB = function (worldAnchorB) {
        this.bodyB.toLocalFrame(this.localAnchorB, worldAnchorB);
    };
    /**
     * Get the anchor point on body A, in world coordinates.
     * @method getWorldAnchorA
     * @param {Array} result The vector to store the result in.
     */
    LinearSpring.prototype.getWorldAnchorA = function (result) {
        this.bodyA.toWorldFrame(result, this.localAnchorA);
    };
    /**
     * Get the anchor point on body B, in world coordinates.
     * @method getWorldAnchorB
     * @param {Array} result The vector to store the result in.
     */
    LinearSpring.prototype.getWorldAnchorB = function (result) {
        this.bodyB.toWorldFrame(result, this.localAnchorB);
    };
    /**
     * Apply the spring force to the connected bodies.
     * @private
     * @method applyForce
     */
    LinearSpring.prototype.applyForce = function () {
        var k = this.stiffness, d = this.damping, l = this.restLength, bodyA = this.bodyA, bodyB = this.bodyB, r = applyForce_r, r_unit = applyForce_r_unit, u = applyForce_u, f = applyForce_f, tmp = applyForce_tmp;
        var worldAnchorA = applyForce_worldAnchorA, worldAnchorB = applyForce_worldAnchorB, ri = applyForce_ri, rj = applyForce_rj;
        // Get world anchors
        this.getWorldAnchorA(worldAnchorA);
        this.getWorldAnchorB(worldAnchorB);
        // Get offset points
        vec2_1.default.subtract(ri, worldAnchorA, bodyA.position);
        vec2_1.default.subtract(rj, worldAnchorB, bodyB.position);
        // Compute distance vector between world anchor points
        vec2_1.default.subtract(r, worldAnchorB, worldAnchorA);
        var rlen = vec2_1.default.length(r);
        vec2_1.default.normalize(r_unit, r);
        // Compute relative velocity of the anchor points, u
        vec2_1.default.subtract(u, bodyB.velocity, bodyA.velocity);
        vec2_1.default.crossZV(tmp, bodyB.angularVelocity, rj);
        vec2_1.default.add(u, u, tmp);
        vec2_1.default.crossZV(tmp, bodyA.angularVelocity, ri);
        vec2_1.default.subtract(u, u, tmp);
        // F = - k * ( x - L ) - D * ( u )
        vec2_1.default.scale(f, r_unit, -k * (rlen - l) - d * vec2_1.default.dot(u, r_unit));
        // Add forces to bodies
        vec2_1.default.subtract(bodyA.force, bodyA.force, f);
        vec2_1.default.add(bodyB.force, bodyB.force, f);
        // Angular force
        var ri_x_f = vec2_1.default.crossLength(ri, f);
        var rj_x_f = vec2_1.default.crossLength(rj, f);
        bodyA.angularForce -= ri_x_f;
        bodyB.angularForce += rj_x_f;
    };
    return LinearSpring;
}(spring_1.default));
exports.default = LinearSpring;

},{"../math/vec2":28,"./spring":33}],32:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var spring_1 = __importDefault(_dereq_("./spring"));
var RotationalSpring = /** @class */ (function (_super) {
    __extends(RotationalSpring, _super);
    /**
     * A rotational spring, connecting two bodies rotation. This spring explicitly adds angularForce (torque) to the bodies.
     *
     * The spring can be combined with a {{#crossLink "RevoluteConstraint"}}{{/crossLink}} to make, for example, a mouse trap.
     *
     * @class RotationalSpring
     * @extends Spring
     * @constructor
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {number} [options.restAngle] The relative angle of bodies at which the spring is at rest. If not given, it's set to the current relative angle between the bodies.
     * @param {number} [options.stiffness=100] Spring constant (see Hookes Law). A number >= 0.
     * @param {number} [options.damping=1] A number >= 0.
     *
     * @example
     *     var spring = new RotationalSpring(bodyA, bodyB, {
     *         stiffness: 100,
     *         damping: 1
     *     });
     *     world.addSpring(spring);
     */
    function RotationalSpring(bodyA, bodyB, options) {
        var _a;
        var _this = _super.call(this, bodyA, bodyB, options) || this;
        /**
         * Rest angle of the spring.
         * @property restAngle
         * @type {number}
         */
        _this.restAngle = (_a = options === null || options === void 0 ? void 0 : options.restAngle) !== null && _a !== void 0 ? _a : bodyB.angle - bodyA.angle;
        return _this;
    }
    /**
     * Apply the spring force to the connected bodies.
     * @method applyForce
     */
    RotationalSpring.prototype.applyForce = function () {
        var k = this.stiffness, d = this.damping, l = this.restAngle, bodyA = this.bodyA, bodyB = this.bodyB, x = bodyB.angle - bodyA.angle, u = bodyB.angularVelocity - bodyA.angularVelocity;
        var torque = -k * (x - l) - d * u;
        bodyA.angularForce -= torque;
        bodyB.angularForce += torque;
    };
    ;
    return RotationalSpring;
}(spring_1.default));
exports.default = RotationalSpring;

},{"./spring":33}],33:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Spring = /** @class */ (function () {
    /**
     * Base class for {{#crossLink "LinearSpring"}}{{/crossLink}} and {{#crossLink "RotationalSpring"}}{{/crossLink}}. Not supposed to be used directly.
     *
     * @class Spring
     * @constructor
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
     * @param {number} [options.damping=1]      A number >= 0. Default: 1
     * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
     * @param {Array}  [options.localAnchorB]
     * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
     * @param {Array}  [options.worldAnchorB]
     */
    function Spring(bodyA, bodyB, options) {
        var _a, _b;
        this.stiffness = (_a = options === null || options === void 0 ? void 0 : options.stiffness) !== null && _a !== void 0 ? _a : 100;
        this.damping = (_b = options === null || options === void 0 ? void 0 : options.damping) !== null && _b !== void 0 ? _b : 1;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
    }
    return Spring;
}());
exports.default = Spring;

},{}],34:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var body_1 = __importDefault(_dereq_("./body"));
var constraint_1 = __importDefault(_dereq_("../constraints/constraint"));
var friction_equation_1 = __importDefault(_dereq_("../equations/friction-equation"));
var worldVelocity = vec2_1.default.create();
var relativePoint = vec2_1.default.create();
var tmpVec = vec2_1.default.create();
var TopDownVehicle = /** @class */ (function () {
    /**
     * @class TopDownVehicle
     * @constructor
     *
     * @deprecated This class will be moved out of the core library in future versions.
     *
     * @param {Body} chassisBody A dynamic body, already added to the world.
     * @param {Object} [options]
     *
     * @example
     *
     *     // Create a dynamic body for the chassis
     *     var chassisBody = new Body({
     *         mass: 1
     *     });
     *     var boxShape = new Box({ width: 0.5, height: 1 });
     *     chassisBody.addShape(boxShape);
     *     world.addBody(chassisBody);
     *
     *     // Create the vehicle
     *     var vehicle = new TopDownVehicle(chassisBody);
     *
     *     // Add one front wheel and one back wheel - we don't actually need four :)
     *     var frontWheel = vehicle.addWheel({
     *         localPosition: [0, 0.5] // front
     *     });
     *     frontWheel.setSideFriction(4);
     *
     *     // Back wheel
     *     var backWheel = vehicle.addWheel({
     *         localPosition: [0, -0.5] // back
     *     });
     *     backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift
     *     vehicle.addToWorld(world);
     *
     *     // Steer value zero means straight forward. Positive is left and negative right.
     *     frontWheel.steerValue = Math.PI / 16;
     *
     *     // Engine force forward
     *     backWheel.engineForce = 10;
     *     backWheel.setBrakeForce(0);
     */
    function TopDownVehicle(chassisBody, options) {
        var _this = this;
        // A dummy body to constrain the chassis to
        this.groundBody = new body_1.default({ mass: 0 });
        this.wheels = [];
        this.chassisBody = chassisBody;
        this.preStepCallback = function () {
            _this.update();
        };
    }
    /**
     * @method addToWorld
     * @param {World} world
     */
    TopDownVehicle.prototype.addToWorld = function (world) {
        this.world = world;
        world.addBody(this.groundBody);
        world.on("preStep", this.preStepCallback, this);
        for (var i = 0; i < this.wheels.length; i++) {
            var wheel = this.wheels[i];
            world.addConstraint(wheel);
        }
    };
    ;
    /**
     * @method removeFromWorld
     * @param {World} world
     */
    TopDownVehicle.prototype.removeFromWorld = function () {
        var world = this.world;
        if (world) {
            world.removeBody(this.groundBody);
            world.off('preStep', this.preStepCallback);
            for (var i = 0; i < this.wheels.length; i++) {
                var wheel = this.wheels[i];
                world.removeConstraint(wheel);
            }
            this.world = undefined;
        }
    };
    ;
    /**
     * @method addWheel
     * @param {object} [wheelOptions]
     * @return {WheelConstraint}
     */
    TopDownVehicle.prototype.addWheel = function (wheelOptions) {
        var wheel = new WheelConstraint(this, wheelOptions);
        this.wheels.push(wheel);
        return wheel;
    };
    ;
    /**
     * @method update
     */
    TopDownVehicle.prototype.update = function () {
        for (var i = 0; i < this.wheels.length; i++) {
            this.wheels[i].update();
        }
    };
    ;
    return TopDownVehicle;
}());
exports.default = TopDownVehicle;
var WheelConstraint = /** @class */ (function (_super) {
    __extends(WheelConstraint, _super);
    /**
     * @class WheelConstraint
     * @constructor
     * @extends {Constraint}
     * @param {Vehicle} vehicle
     * @param {object} [options]
     * @param {Array} [options.localForwardVector] The local wheel forward vector in local body space. Default is zero.
     * @param {Array} [options.localPosition] The local position of the wheen in the chassis body. Default is zero - the center of the body.
     * @param {Array} [options.sideFriction=5] The max friction force in the sideways direction.
     */
    function WheelConstraint(vehicle, options) {
        var _a;
        var _this = 
        // TODO: I have no idea what kind of constraint this is supposed to be. It seems this was undefined in the original code.
        _super.call(this, vehicle.chassisBody, vehicle.groundBody, 0) || this;
        _this.steerValue = 0;
        /**
         * @property {number} engineForce
         */
        _this.engineForce = 0;
        _this.vehicle = vehicle;
        _this.forwardEquation = new friction_equation_1.default(vehicle.chassisBody, vehicle.groundBody);
        _this.sideEquation = new friction_equation_1.default(vehicle.chassisBody, vehicle.groundBody);
        _this.setSideFriction((_a = options === null || options === void 0 ? void 0 : options.sideFriction) !== null && _a !== void 0 ? _a : 5);
        /**
         * @property {Array} localForwardVector
         */
        _this.localForwardVector = vec2_1.default.fromValues(0, 1);
        if (options === null || options === void 0 ? void 0 : options.localForwardVector) {
            vec2_1.default.copy(_this.localForwardVector, options.localForwardVector);
        }
        /**
         * @property {Array} localPosition
         */
        _this.localPosition = vec2_1.default.create();
        if (options === null || options === void 0 ? void 0 : options.localPosition) {
            vec2_1.default.copy(_this.localPosition, options.localPosition);
        }
        _this.equations.push(_this.forwardEquation);
        _this.equations.push(_this.sideEquation);
        _this.setBrakeForce(0);
        return _this;
    }
    /**
     * @method setBrakeForce
     */
    WheelConstraint.prototype.setBrakeForce = function (force) {
        this.forwardEquation.setSlipForce(force);
    };
    /**
     * @method setSideFriction
     */
    WheelConstraint.prototype.setSideFriction = function (force) {
        this.sideEquation.setSlipForce(force);
    };
    /**
     * @method getSpeed
     */
    WheelConstraint.prototype.getSpeed = function () {
        var body = this.vehicle.chassisBody;
        body.vectorToWorldFrame(relativePoint, this.localForwardVector);
        body.getVelocityAtPoint(worldVelocity, relativePoint);
        return vec2_1.default.dot(worldVelocity, relativePoint);
    };
    /**
     * @method update
     */
    WheelConstraint.prototype.update = function () {
        var body = this.vehicle.chassisBody;
        var forwardEquation = this.forwardEquation;
        var sideEquation = this.sideEquation;
        var steerValue = this.steerValue;
        // Directional
        body.vectorToWorldFrame(forwardEquation.t, this.localForwardVector);
        vec2_1.default.rotate(sideEquation.t, this.localForwardVector, Math.PI / 2);
        body.vectorToWorldFrame(sideEquation.t, sideEquation.t);
        vec2_1.default.rotate(forwardEquation.t, forwardEquation.t, steerValue);
        vec2_1.default.rotate(sideEquation.t, sideEquation.t, steerValue);
        // Attachment point
        body.toWorldFrame(forwardEquation.contactPointB, this.localPosition);
        vec2_1.default.copy(sideEquation.contactPointB, forwardEquation.contactPointB);
        body.vectorToWorldFrame(forwardEquation.contactPointA, this.localPosition);
        vec2_1.default.copy(sideEquation.contactPointA, forwardEquation.contactPointA);
        // Add engine force
        vec2_1.default.normalize(tmpVec, forwardEquation.t);
        vec2_1.default.scale(tmpVec, tmpVec, this.engineForce);
        this.vehicle.chassisBody.applyForce(tmpVec, forwardEquation.contactPointA);
    };
    return WheelConstraint;
}(constraint_1.default));

},{"../constraints/constraint":8,"../equations/friction-equation":18,"../math/vec2":28,"./body":30}],35:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// var vec2 = require('../math/vec2')
// ,   Shape = require('./Shape')
// ,   shallowClone = require('../utils/Utils').shallowClone
// ,   Convex = require('./Convex');
var Convex_1 = __importDefault(_dereq_("./Convex"));
var shape_1 = __importDefault(_dereq_("./shape"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var Box = /** @class */ (function (_super) {
    __extends(Box, _super);
    /**
     * Box shape class.
     * @class Box
     * @constructor
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {Number} [options.width=1] Total width of the box
     * @param {Number} [options.height=1] Total height of the box
     * @extends Convex
     * @example
     *     var body = new Body({ mass: 1 });
     *     var boxShape = new Box({
     *         width: 2,
     *         height: 1
     *     });
     *     body.addShape(boxShape);
     */
    function Box(options) {
        var _a, _b;
        var _this = this;
        var width = (_a = options === null || options === void 0 ? void 0 : options.width) !== null && _a !== void 0 ? _a : 1;
        var height = (_b = options === null || options === void 0 ? void 0 : options.height) !== null && _b !== void 0 ? _b : 1;
        var hw = width / 2;
        var hh = height / 2;
        _this = _super.call(this, shape_1.default.BOX, [
            vec2_1.default.fromValues(-hw, -hh),
            vec2_1.default.fromValues(hw, -hh),
            vec2_1.default.fromValues(hw, hh),
            vec2_1.default.fromValues(-hw, hh)
        ], options) || this;
        _this.height = height;
        _this.width = width;
        return _this;
    }
    /**
     * Compute moment of inertia
     * @method computeMomentOfInertia
     * @return {Number}
     */
    Box.prototype.computeMomentOfInertia = function () {
        var w = this.width, h = this.height;
        return (h * h + w * w) / 12;
    };
    ;
    /**
     * Update the bounding radius
     * @method updateBoundingRadius
     */
    Box.prototype.updateBoundingRadius = function () {
        var w = this.width, h = this.height;
        this.boundingRadius = Math.sqrt(w * w + h * h) / 2;
        return this.boundingRadius;
    };
    ;
    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Box.prototype.computeAABB = function (out, position, angle) {
        var c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle)), w = this.width, h = this.height;
        var height = (w * s + h * c) * 0.5;
        var width = (h * s + w * c) * 0.5;
        var l = out.lowerBound;
        var u = out.upperBound;
        var px = position[0];
        var py = position[1];
        l[0] = px - width;
        l[1] = py - height;
        u[0] = px + width;
        u[1] = py + height;
    };
    ;
    Box.prototype.updateArea = function () {
        this.area = this.width * this.height;
        return this.area;
    };
    ;
    Box.prototype.pointTest = function (localPoint) {
        return Math.abs(localPoint[0]) <= this.width * 0.5 && Math.abs(localPoint[1]) <= this.height * 0.5;
    };
    ;
    return Box;
}(Convex_1.default));
exports.default = Box;

},{"../math/vec2":28,"./Convex":37,"./shape":46}],36:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// var Shape = require('./Shape')
// ,    vec2 = require('../math/vec2')
// ,    shallowClone = require('../utils/Utils').shallowClone;
var Shape_1 = __importDefault(_dereq_("./Shape"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var Ray_intersectSphere_intersectionPoint = vec2_1.default.create();
var Ray_intersectSphere_normal = vec2_1.default.create();
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    /**
     * Circle shape class.
     * @class Circle
     * @extends Shape
     * @constructor
     * @param {options} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {number} [options.radius=1] The radius of this circle
     *
     * @example
     *     var body = new Body({ mass: 1 });
     *     var circleShape = new Circle({
     *         radius: 1
     *     });
     *     body.addShape(circleShape);
     */
    function Circle(options) {
        var _a;
        var _this = _super.call(this, Shape_1.default.CIRCLE, options) || this;
        /**
         * The radius of the circle.
         * @property radius
         * @type {number}
         */
        _this.radius = (_a = options === null || options === void 0 ? void 0 : options.radius) !== null && _a !== void 0 ? _a : 1;
        return _this;
    }
    /**
     * @method computeMomentOfInertia
     * @return {Number}
     */
    Circle.prototype.computeMomentOfInertia = function () {
        var r = this.radius;
        return r * r / 2;
    };
    /**
     * @method updateBoundingRadius
     * @return {Number}
     */
    Circle.prototype.updateBoundingRadius = function () {
        this.boundingRadius = this.radius;
        return this.boundingRadius;
    };
    /**
     * @method updateArea
     * @return {Number}
     */
    Circle.prototype.updateArea = function () {
        this.area = Math.PI * this.radius * this.radius;
        return this.area;
    };
    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Circle.prototype.computeAABB = function (out, position /*, angle: f32*/) {
        var r = this.radius;
        vec2_1.default.set(out.upperBound, r, r);
        vec2_1.default.set(out.lowerBound, -r, -r);
        if (position) {
            vec2_1.default.add(out.lowerBound, out.lowerBound, position);
            vec2_1.default.add(out.upperBound, out.upperBound, position);
        }
    };
    /**
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Circle.prototype.raycast = function (result, ray, position /*, angle: f32*/) {
        var from = ray.from, to = ray.to, r = this.radius;
        var a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
        var b = 2 * ((to[0] - from[0]) * (from[0] - position[0]) + (to[1] - from[1]) * (from[1] - position[1]));
        var c = Math.pow(from[0] - position[0], 2) + Math.pow(from[1] - position[1], 2) - Math.pow(r, 2);
        var delta = Math.pow(b, 2) - 4 * a * c;
        var intersectionPoint = Ray_intersectSphere_intersectionPoint;
        var normal = Ray_intersectSphere_normal;
        if (delta < 0) {
            // No intersection
            return;
        }
        else if (delta === 0) {
            // single intersection point
            vec2_1.default.lerp(intersectionPoint, from, to, delta);
            vec2_1.default.subtract(normal, intersectionPoint, position);
            vec2_1.default.normalize(normal, normal);
            ray.reportIntersection(result, delta, normal, -1);
        }
        else {
            var sqrtDelta = Math.sqrt(delta);
            var inv2a = 1 / (2 * a);
            var d1 = (-b - sqrtDelta) * inv2a;
            var d2 = (-b + sqrtDelta) * inv2a;
            if (d1 >= 0 && d1 <= 1) {
                vec2_1.default.lerp(intersectionPoint, from, to, d1);
                vec2_1.default.subtract(normal, intersectionPoint, position);
                vec2_1.default.normalize(normal, normal);
                ray.reportIntersection(result, d1, normal, -1);
                if (result.shouldStop(ray)) {
                    return;
                }
            }
            if (d2 >= 0 && d2 <= 1) {
                vec2_1.default.lerp(intersectionPoint, from, to, d2);
                vec2_1.default.subtract(normal, intersectionPoint, position);
                vec2_1.default.normalize(normal, normal);
                ray.reportIntersection(result, d2, normal, -1);
            }
        }
    };
    Circle.prototype.pointTest = function (localPoint) {
        var radius = this.radius;
        return vec2_1.default.squaredLength(localPoint) <= radius * radius;
    };
    return Circle;
}(Shape_1.default));
exports.default = Circle;

},{"../math/vec2":28,"./Shape":38}],37:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Shape_1 = __importDefault(_dereq_("./Shape"));
var polyk_1 = __importDefault(_dereq_("../math/polyk"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var dot = vec2_1.default.dot;
var updateCenterOfMass_centroid = vec2_1.default.create(), updateCenterOfMass_centroid_times_mass = vec2_1.default.create(), updateCenterOfMass_a = vec2_1.default.create(), updateCenterOfMass_b = vec2_1.default.create(), updateCenterOfMass_c = vec2_1.default.create();
var tmpVec1 = vec2_1.default.create();
var intersectConvex_rayStart = vec2_1.default.create();
var intersectConvex_rayEnd = vec2_1.default.create();
var intersectConvex_normal = vec2_1.default.create();
var pic_r0 = vec2_1.default.create();
var pic_r1 = vec2_1.default.create();
var tmpVec2 = vec2_1.default.create();
var worldAxis = tmpVec2;
var Convex = /** @class */ (function (_super) {
    __extends(Convex, _super);
    /**
     * Convex shape class.
     * @class Convex
     * @constructor
     * @extends Shape
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {Array} [options.vertices] An array of vertices that span this shape. Vertices are given in counter-clockwise (CCW) direction.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var vertices = [[-1,-1], [1,-1], [1,1], [-1,1]];
     *     var convexShape = new Convex({
     *         vertices: vertices
     *     });
     *     body.addShape(convexShape);
     */
    function Convex(type, vertices, options) {
        var _this = _super.call(this, type !== null && type !== void 0 ? type : Shape_1.default.CONVEX, options) || this;
        // Copy the verts
        _this.vertices = [];
        var newVertices = vertices !== null && vertices !== void 0 ? vertices : [];
        _this.vertices = [];
        _this.normals = [];
        for (var i = 0; i < newVertices.length; i++) {
            _this.vertices.push(vec2_1.default.clone(newVertices[i]));
            _this.normals.push(vec2_1.default.create());
        }
        _this.updateNormals();
        _this.centerOfMass = vec2_1.default.create();
        _this.triangles = [];
        if (_this.vertices.length) {
            _this.updateTriangles();
            _this.updateCenterOfMass();
        }
        /**
         * The bounding radius of the convex
         * @property boundingRadius
         * @type {Number}
         */
        _this.boundingRadius = 0;
        _this.updateBoundingRadius();
        _this.updateArea();
        if (_this.area < 0) {
            throw new Error("Convex vertices must be given in counter-clockwise winding.");
        }
        return _this;
    }
    Convex.prototype.updateNormals = function () {
        var vertices = this.vertices;
        var normals = this.normals;
        for (var i = 0; i < vertices.length; i++) {
            var worldPoint0 = vertices[i];
            var worldPoint1 = vertices[(i + 1) % vertices.length];
            var normal = normals[i];
            vec2_1.default.subtract(normal, worldPoint1, worldPoint0);
            // Get normal - just rotate 90 degrees since vertices are given in CCW
            vec2_1.default.rotate90cw(normal, normal);
            vec2_1.default.normalize(normal, normal);
        }
    };
    /**
     * Project a Convex onto a world-oriented axis
     * @method projectOntoAxis
     * @static
     * @param  {Array} offset
     * @param  {Array} localAxis
     * @param  {Array} result
     */
    Convex.prototype.projectOntoLocalAxis = function (localAxis, result) {
        var max = -Infinity, min = Infinity, v, value, localAxis = tmpVec1;
        // Get projected position of all vertices
        for (var i = 0; i < this.vertices.length; i++) {
            v = this.vertices[i];
            value = dot(v, localAxis);
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
        }
        if (min > max) {
            var t = min;
            min = max;
            max = t;
        }
        vec2_1.default.set(result, min, max);
    };
    Convex.prototype.ConvexprojectOntoWorldAxis = function (localAxis, shapeOffset, shapeAngle, result) {
        this.projectOntoLocalAxis(localAxis, result);
        // Project the position of the body onto the axis - need to add this to the result
        if (shapeAngle !== 0) {
            vec2_1.default.rotate(worldAxis, localAxis, shapeAngle);
        }
        else {
            worldAxis = localAxis;
        }
        var offset = dot(shapeOffset, worldAxis);
        vec2_1.default.set(result, result[0] + offset, result[1] + offset);
    };
    /**
     * Update the .triangles property
     * @method updateTriangles
     */
    Convex.prototype.updateTriangles = function () {
        this.triangles.length = 0;
        // Rewrite on polyk notation, array of numbers
        var polykVerts = [];
        for (var i = 0; i < this.vertices.length; i++) {
            var v = this.vertices[i];
            polykVerts.push(v[0]);
            polykVerts.push(v[1]);
        }
        // Triangulate
        var triangles = polyk_1.default.Triangulate(polykVerts);
        // Loop over all triangles, add their inertia contributions to I
        for (var i = 0; i < triangles.length; i += 3) {
            var id1 = triangles[i], id2 = triangles[i + 1], id3 = triangles[i + 2];
            // Add to triangles
            var T = new Float32Array(3);
            T[0] = id1;
            T[1] = id2;
            T[2] = id3;
            this.triangles.push(T);
        }
    };
    /**
     * Update the .centerOfMass property.
     * @method updateCenterOfMass
     */
    Convex.prototype.updateCenterOfMass = function () {
        var triangles = this.triangles, verts = this.vertices, cm = this.centerOfMass, centroid = updateCenterOfMass_centroid, a = updateCenterOfMass_a, b = updateCenterOfMass_b, c = updateCenterOfMass_c, centroid_times_mass = updateCenterOfMass_centroid_times_mass;
        vec2_1.default.set(cm, 0, 0);
        var totalArea = 0;
        for (var i = 0; i !== triangles.length; i++) {
            var t = triangles[i], a = verts[t[0]], b = verts[t[1]], c = verts[t[2]];
            vec2_1.default.centroid(centroid, a, b, c);
            // Get mass for the triangle (density=1 in this case)
            // http://math.stackexchange.com/questions/80198/area-of-triangle-via-vectors
            var m = Convex.triangleArea(a, b, c);
            totalArea += m;
            // Add to center of mass
            vec2_1.default.scale(centroid_times_mass, centroid, m);
            vec2_1.default.add(cm, cm, centroid_times_mass);
        }
        vec2_1.default.scale(cm, cm, 1 / totalArea);
    };
    /**
     * Compute the moment of inertia of the Convex.
     * @method computeMomentOfInertia
     * @return {Number}
     * @see http://www.gamedev.net/topic/342822-moment-of-inertia-of-a-polygon-2d/
     */
    Convex.prototype.computeMomentOfInertia = function () {
        var denom = 0.0, numer = 0.0, N = this.vertices.length;
        for (var j = N - 1, i = 0; i < N; j = i, i++) {
            var p0 = this.vertices[j];
            var p1 = this.vertices[i];
            var a = Math.abs(vec2_1.default.crossLength(p0, p1));
            var b = dot(p1, p1) + dot(p1, p0) + dot(p0, p0);
            denom += a * b;
            numer += a;
        }
        return (1.0 / 6.0) * (denom / numer);
    };
    /**
     * Updates the .boundingRadius property
     * @method updateBoundingRadius
     */
    Convex.prototype.updateBoundingRadius = function () {
        var verts = this.vertices, r2 = 0;
        if (!verts)
            return 0;
        for (var i = 0; i !== verts.length; i++) {
            var l2 = vec2_1.default.squaredLength(verts[i]);
            if (l2 > r2) {
                r2 = l2;
            }
        }
        this.boundingRadius = Math.sqrt(r2);
        return this.boundingRadius;
    };
    /**
     * Get the area of the triangle spanned by the three points a, b, c. The area is positive if the points are given in counter-clockwise order, otherwise negative.
     * @static
     * @method triangleArea
     * @param {Array} a
     * @param {Array} b
     * @param {Array} c
     * @return {Number}
     * @deprecated
     */
    Convex.triangleArea = function (a, b, c) {
        return (((b[0] - a[0]) * (c[1] - a[1])) - ((c[0] - a[0]) * (b[1] - a[1]))) * 0.5;
    };
    /**
     * Update the .area
     * @method updateArea
     */
    Convex.prototype.updateArea = function () {
        if (!this.vertices)
            return 0;
        this.updateTriangles();
        this.area = 0;
        var triangles = this.triangles, verts = this.vertices;
        for (var i = 0; i !== triangles.length; i++) {
            var t = triangles[i], a = verts[t[0]], b = verts[t[1]], c = verts[t[2]];
            // Get mass for the triangle (density=1 in this case)
            var m = Convex.triangleArea(a, b, c);
            this.area += m;
        }
        return this.area;
    };
    /**
     * @method computeAABB
     * @param  {AABB}   out
     * @param  {Array}  position
     * @param  {Number} angle
     * @todo: approximate with a local AABB?
     */
    Convex.prototype.computeAABB = function (out, position, angle) {
        out.setFromPoints(this.vertices, position, angle, 0);
    };
    /**
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Convex.prototype.raycast = function (result, ray, position, angle) {
        var rayStart = intersectConvex_rayStart;
        var rayEnd = intersectConvex_rayEnd;
        var normal = intersectConvex_normal;
        var vertices = this.vertices;
        // Transform to local shape space
        vec2_1.default.toLocalFrame(rayStart, ray.from, position, angle);
        vec2_1.default.toLocalFrame(rayEnd, ray.to, position, angle);
        var n = vertices.length;
        for (var i = 0; i < n && !result.shouldStop(ray); i++) {
            var q1 = vertices[i];
            var q2 = vertices[(i + 1) % n];
            var delta = vec2_1.default.getLineSegmentsIntersectionFraction(rayStart, rayEnd, q1, q2);
            if (delta >= 0) {
                vec2_1.default.subtract(normal, q2, q1);
                vec2_1.default.rotate(normal, normal, -Math.PI / 2 + angle);
                vec2_1.default.normalize(normal, normal);
                ray.reportIntersection(result, delta, normal, i);
            }
        }
    };
    Convex.prototype.pointTest = function (localPoint) {
        var r0 = pic_r0, r1 = pic_r1, verts = this.vertices, lastCross = null, numVerts = verts.length;
        for (var i = 0; i < numVerts + 1; i++) {
            var v0 = verts[i % numVerts], v1 = verts[(i + 1) % numVerts];
            vec2_1.default.subtract(r0, v0, localPoint);
            vec2_1.default.subtract(r1, v1, localPoint);
            var cross = vec2_1.default.crossLength(r0, r1);
            if (lastCross === null) {
                lastCross = cross;
            }
            // If we got a different sign of the distance vector, the point is out of the polygon
            if (cross * lastCross < 0) {
                return false;
            }
            lastCross = cross;
        }
        return true;
    };
    return Convex;
}(Shape_1.default));
exports.default = Convex;

},{"../math/polyk":27,"../math/vec2":28,"./Shape":38}],38:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var Shape = /** @class */ (function () {
    /**
     * Base class for shapes. Not to be used directly.
     * @class Shape
     * @constructor
     * @param {object} [options]
     * @param {number} [options.angle=0]
     * @param {number} [options.collisionGroup=1]
     * @param {number} [options.collisionMask=1]
     * @param {number} [options.id] Optional - specify an ID for this shape. Possibly useful for replacing shapes. Careful to avoid duplicates!
     * @param {boolean} [options.collisionResponse=true]
     * @param {Material} [options.material=null]
     * @param {array} [options.position]
     * @param {boolean} [options.sensor=false]
     * @param {object} [options.type=0]
     */
    function Shape(type, options) {
        var _a, _b, _c, _d, _e, _f;
        /**
         * Body-local position of the shape.
         * @property {Array} position
         */
        this.position = vec2_1.default.create();
        /**
         * Body-local angle of the shape.
         * @property {number} angle
         */
        this.angle = 0;
        /**
         * The type of the shape. One of:
         *
         * <ul>
         * <li><a href="Shape.html#property_CIRCLE">Shape.CIRCLE</a></li>
         * <li><a href="Shape.html#property_PARTICLE">Shape.PARTICLE</a></li>
         * <li><a href="Shape.html#property_PLANE">Shape.PLANE</a></li>
         * <li><a href="Shape.html#property_CONVEX">Shape.CONVEX</a></li>
         * <li><a href="Shape.html#property_LINE">Shape.LINE</a></li>
         * <li><a href="Shape.html#property_BOX">Shape.BOX</a></li>
         * <li><a href="Shape.html#property_CAPSULE">Shape.CAPSULE</a></li>
         * <li><a href="Shape.html#property_HEIGHTFIELD">Shape.HEIGHTFIELD</a></li>
         * </ul>
         *
         * @property {number} type
         */
        this.type = 0;
        /**
         * Shape object identifier. Read only.
         * @readonly
         * @type {Number}
         * @property id
         */
        this.id = 0;
        /**
         * Bounding circle radius of this shape
         * @readonly
         * @property boundingRadius
         * @type {Number}
         */
        this.boundingRadius = 0;
        /**
         * Collision group that this shape belongs to (bit mask). See <a href="http://www.aurelienribon.com/blog/2011/07/box2d-tutorial-collision-filtering/">this tutorial</a>.
         * @property collisionGroup
         * @type {Number}
         * @example
         *     // Setup bits for each available group
         *     var PLAYER = Math.pow(2,0),
         *         ENEMY =  Math.pow(2,1),
         *         GROUND = Math.pow(2,2)
         *
         *     // Put shapes into their groups
         *     player1Shape.collisionGroup = PLAYER;
         *     player2Shape.collisionGroup = PLAYER;
         *     enemyShape  .collisionGroup = ENEMY;
         *     groundShape .collisionGroup = GROUND;
         *
         *     // Assign groups that each shape collide with.
         *     // Note that the players can collide with ground and enemies, but not with other players.
         *     player1Shape.collisionMask = ENEMY | GROUND;
         *     player2Shape.collisionMask = ENEMY | GROUND;
         *     enemyShape  .collisionMask = PLAYER | GROUND;
         *     groundShape .collisionMask = PLAYER | ENEMY;
         *
         * @example
         *     // How collision check is done
         *     if(shapeA.collisionGroup & shapeB.collisionMask)!=0 && (shapeB.collisionGroup & shapeA.collisionMask)!=0){
         *         // The shapes will collide
         *     }
         */
        this.collisionGroup = 1;
        /**
         * Area of this shape.
         * @property area
         * @type {Number}
         */
        this.area = 0;
        if (options === null || options === void 0 ? void 0 : options.position) {
            vec2_1.default.copy(this.position, options.position);
        }
        this.angle = (_a = options === null || options === void 0 ? void 0 : options.angle) !== null && _a !== void 0 ? _a : 0;
        this.type = type;
        this.id = (_b = options === null || options === void 0 ? void 0 : options.id) !== null && _b !== void 0 ? _b : ++Shape.idCounter;
        this.collisionGroup = (_c = options === null || options === void 0 ? void 0 : options.collisionGroup) !== null && _c !== void 0 ? _c : 1;
        this.collisionResponse = (_d = options === null || options === void 0 ? void 0 : options.collisionResponse) !== null && _d !== void 0 ? _d : true;
        this.collisionMask = (_e = options === null || options === void 0 ? void 0 : options.collisionMask) !== null && _e !== void 0 ? _e : 1;
        this.material = options === null || options === void 0 ? void 0 : options.material;
        this.sensor = (_f = options === null || options === void 0 ? void 0 : options.sensor) !== null && _f !== void 0 ? _f : false;
        if (this.type) {
            this.updateBoundingRadius();
        }
        this.updateArea();
    }
    /**
     * Test if a point is inside this shape.
     * @method pointTest
     * @param {array} localPoint
     * @return {boolean}
     */
    Shape.prototype.pointTest = function (localPoint) { return false; };
    /**
     * Transform a world point to local shape space (assumed the shape is transformed by both itself and the body).
     * @method worldPointToLocal
     * @param {array} out
     * @param {array} worldPoint
     */
    Shape.prototype.worldPointToLocal = function (out, worldPoint) {
        var shapeWorldPosition = vec2_1.default.create();
        var body = this.body;
        if (!body)
            return;
        vec2_1.default.rotate(shapeWorldPosition, this.position, body.angle);
        vec2_1.default.add(shapeWorldPosition, shapeWorldPosition, body.position);
        vec2_1.default.toLocalFrame(out, worldPoint, shapeWorldPosition, body.angle + this.angle);
    };
    Shape.idCounter = 0;
    /**
     * @static
     * @property {Number} CIRCLE
     */
    Shape.CIRCLE = 1;
    /**
     * @static
     * @property {Number} PARTICLE
     */
    Shape.PARTICLE = 2;
    /**
     * @static
     * @property {Number} PLANE
     */
    Shape.PLANE = 4;
    /**
     * @static
     * @property {Number} CONVEX
     */
    Shape.CONVEX = 8;
    /**
     * @static
     * @property {Number} LINE
     */
    Shape.LINE = 16;
    /**
     * @static
     * @property {Number} BOX
     */
    Shape.BOX = 32;
    /**
     * @static
     * @property {Number} CAPSULE
     */
    Shape.CAPSULE = 64;
    /**
     * @static
     * @property {Number} HEIGHTFIELD
     */
    Shape.HEIGHTFIELD = 128;
    return Shape;
}());
exports.default = Shape;

},{"../math/vec2":28}],39:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// var Shape = require('./Shape')
// ,   shallowClone = require('../utils/Utils').shallowClone
// ,   vec2 = require('../math/vec2');
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var utils_1 = __importDefault(_dereq_("../utils/utils"));
var shape_1 = __importDefault(_dereq_("./shape"));
var shallowClone = utils_1.default.shallowClone;
function boxI(w, h) {
    return w * h * (Math.pow(w, 2) + Math.pow(h, 2)) / 12;
}
function semiA(r) {
    return Math.PI * Math.pow(r, 2) / 2;
}
// http://www.efunda.com/math/areas/CircleHalf.cfm
function semiI(r) {
    return ((Math.PI / 4) - (8 / (9 * Math.PI))) * Math.pow(r, 4);
}
function semiC(r) {
    return (4 * r) / (3 * Math.PI);
}
// https://en.wikipedia.org/wiki/Second_moment_of_area#Parallel_axis_theorem
function capsuleA(l, r) {
    return l * 2 * r + Math.PI * Math.pow(r, 2);
}
function capsuleI(l, r) {
    var d = l / 2 + semiC(r);
    return boxI(l, 2 * r) + 2 * (semiI(r) + semiA(r) * Math.pow(d, 2));
}
var intersectCapsule_hitPointWorld = vec2_1.default.create();
var intersectCapsule_normal = vec2_1.default.create();
var intersectCapsule_l0 = vec2_1.default.create();
var intersectCapsule_l1 = vec2_1.default.create();
var intersectCapsule_unit_y = vec2_1.default.fromValues(0, 1);
var Capsule = /** @class */ (function (_super) {
    __extends(Capsule, _super);
    /**
     * Capsule shape.
     * @class Capsule
     * @constructor
     * @extends Shape
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {Number} [options.length=1] The distance between the end points, extends along the X axis.
     * @param {Number} [options.radius=1] Radius of the capsule.
     * @example
     *     var body = new Body({ mass: 1 });
     *     var capsuleShape = new Capsule({
     *         length: 1,
     *         radius: 2
     *     });
     *     body.addShape(capsuleShape);
     */
    function Capsule(options) {
        var _a, _b;
        var _this = _super.call(this, shape_1.default.CAPSULE, options) || this;
        _this.length = (_a = options === null || options === void 0 ? void 0 : options.length) !== null && _a !== void 0 ? _a : 1;
        _this.radius = (_b = options === null || options === void 0 ? void 0 : options.radius) !== null && _b !== void 0 ? _b : 1;
        return _this;
    }
    /**
     * Compute the mass moment of inertia of the Capsule.
     * @method conputeMomentOfInertia
     * @return {Number}
     * @todo
     */
    Capsule.prototype.computeMomentOfInertia = function () {
        // http://www.efunda.com/math/areas/rectangle.cfm
        var r = this.radius, l = this.length, area = capsuleA(l, r);
        return (area > 0) ? capsuleI(l, r) / area : 0;
    };
    /**
     * @method updateBoundingRadius
     */
    Capsule.prototype.updateBoundingRadius = function () {
        this.boundingRadius = this.radius + this.length / 2;
        return this.boundingRadius;
    };
    /**
     * @method updateArea
     */
    Capsule.prototype.updateArea = function () {
        this.area = Math.PI * this.radius * this.radius + this.radius * 2 * this.length;
        return this.area;
    };
    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Capsule.prototype.computeAABB = function (out, position, angle) {
        var r = vec2_1.default.create();
        var radius = this.radius;
        // Compute center position of one of the the circles, world oriented, but with local offset
        vec2_1.default.set(r, this.length / 2, 0);
        if (angle !== 0) {
            vec2_1.default.rotate(r, r, angle);
        }
        // Get bounds
        vec2_1.default.set(out.upperBound, Math.max(r[0] + radius, -r[0] + radius), Math.max(r[1] + radius, -r[1] + radius));
        vec2_1.default.set(out.lowerBound, Math.min(r[0] - radius, -r[0] - radius), Math.min(r[1] - radius, -r[1] - radius));
        // Add offset
        vec2_1.default.add(out.lowerBound, out.lowerBound, position);
        vec2_1.default.add(out.upperBound, out.upperBound, position);
    };
    /**
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Capsule.prototype.raycast = function (result, ray, position, angle) {
        var from = ray.from;
        var to = ray.to;
        var hitPointWorld = intersectCapsule_hitPointWorld;
        var normal = intersectCapsule_normal;
        var l0 = intersectCapsule_l0;
        var l1 = intersectCapsule_l1;
        // The sides
        var halfLen = this.length / 2;
        for (var i = 0; i < 2; i++) {
            // get start and end of the line
            var y = this.radius * (i * 2 - 1);
            vec2_1.default.set(l0, -halfLen, y);
            vec2_1.default.set(l1, halfLen, y);
            vec2_1.default.toGlobalFrame(l0, l0, position, angle);
            vec2_1.default.toGlobalFrame(l1, l1, position, angle);
            var delta = vec2_1.default.getLineSegmentsIntersectionFraction(from, to, l0, l1);
            if (delta >= 0) {
                vec2_1.default.rotate(normal, intersectCapsule_unit_y, angle);
                vec2_1.default.scale(normal, normal, (i * 2 - 1));
                ray.reportIntersection(result, delta, normal, -1);
                if (result.shouldStop(ray)) {
                    return;
                }
            }
        }
        // Circles
        var diagonalLengthSquared = Math.pow(this.radius, 2) + Math.pow(halfLen, 2);
        for (var i = 0; i < 2; i++) {
            vec2_1.default.set(l0, halfLen * (i * 2 - 1), 0);
            vec2_1.default.toGlobalFrame(l0, l0, position, angle);
            var a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
            var b = 2 * ((to[0] - from[0]) * (from[0] - l0[0]) + (to[1] - from[1]) * (from[1] - l0[1]));
            var c = Math.pow(from[0] - l0[0], 2) + Math.pow(from[1] - l0[1], 2) - Math.pow(this.radius, 2);
            var delta = Math.pow(b, 2) - 4 * a * c;
            if (delta < 0) {
                // No intersection
                continue;
            }
            else if (delta === 0) {
                // single intersection point
                vec2_1.default.lerp(hitPointWorld, from, to, delta);
                if (vec2_1.default.squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
                    vec2_1.default.subtract(normal, hitPointWorld, l0);
                    vec2_1.default.normalize(normal, normal);
                    ray.reportIntersection(result, delta, normal, -1);
                    if (result.shouldStop(ray)) {
                        return;
                    }
                }
            }
            else {
                var sqrtDelta = Math.sqrt(delta);
                var inv2a = 1 / (2 * a);
                var d1 = (-b - sqrtDelta) * inv2a;
                var d2 = (-b + sqrtDelta) * inv2a;
                if (d1 >= 0 && d1 <= 1) {
                    vec2_1.default.lerp(hitPointWorld, from, to, d1);
                    if (vec2_1.default.squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
                        vec2_1.default.subtract(normal, hitPointWorld, l0);
                        vec2_1.default.normalize(normal, normal);
                        ray.reportIntersection(result, d1, normal, -1);
                        if (result.shouldStop(ray)) {
                            return;
                        }
                    }
                }
                if (d2 >= 0 && d2 <= 1) {
                    vec2_1.default.lerp(hitPointWorld, from, to, d2);
                    if (vec2_1.default.squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
                        vec2_1.default.subtract(normal, hitPointWorld, l0);
                        vec2_1.default.normalize(normal, normal);
                        ray.reportIntersection(result, d2, normal, -1);
                        if (result.shouldStop(ray)) {
                            return;
                        }
                    }
                }
            }
        }
    };
    Capsule.prototype.pointTest = function (localPoint) {
        var radius = this.radius;
        var halfLength = this.length * 0.5;
        if ((Math.abs(localPoint[0]) <= halfLength && Math.abs(localPoint[1]) <= radius)) {
            return true;
        }
        if (Math.pow(localPoint[0] - halfLength, 2) + Math.pow(localPoint[1], 2) <= radius * radius) {
            return true;
        }
        if (Math.pow(localPoint[0] + halfLength, 2) + Math.pow(localPoint[1], 2) <= radius * radius) {
            return true;
        }
        return false;
    };
    return Capsule;
}(shape_1.default));
exports.default = Capsule;

},{"../math/vec2":28,"../utils/utils":56,"./shape":46}],40:[function(_dereq_,module,exports){
module.exports=_dereq_(36)
},{"../math/vec2":28,"./Shape":38}],41:[function(_dereq_,module,exports){
module.exports=_dereq_(37)
},{"../math/polyk":27,"../math/vec2":28,"./Shape":38}],42:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// var Shape = require('./Shape')
// ,    vec2 = require('../math/vec2')
// ,    shallowClone = require('../utils/Utils').shallowClone;
var Shape_1 = __importDefault(_dereq_("./Shape"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var intersectHeightfield_worldNormal = vec2_1.default.create();
var intersectHeightfield_l0 = vec2_1.default.create();
var intersectHeightfield_l1 = vec2_1.default.create();
var intersectHeightfield_localFrom = vec2_1.default.create();
var intersectHeightfield_localTo = vec2_1.default.create();
var Heightfield = /** @class */ (function (_super) {
    __extends(Heightfield, _super);
    /**
     * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a distance "elementWidth".
     * @class Heightfield
     * @extends Shape
     * @constructor
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {array} [options.heights] An array of Y values that will be used to construct the terrain.
     * @param {Number} [options.minValue] Minimum value of the data points in the data array. Will be computed automatically if not given.
     * @param {Number} [options.maxValue] Maximum value.
     * @param {Number} [options.elementWidth=0.1] World spacing between the data points in X direction.
     *
     * @example
     *     // Generate some height data (y-values).
     *     var heights = [];
     *     for(var i = 0; i < 1000; i++){
     *         var y = 0.5 * Math.cos(0.2 * i);
     *         heights.push(y);
     *     }
     *
     *     // Create the heightfield shape
     *     var shape = new Heightfield({
     *         heights: heights,
     *         elementWidth: 1 // Distance between the data points in X direction
     *     });
     *     var body = new Body();
     *     body.addShape(shape);
     *     world.addBody(body);
     *
     * @todo Should use a scale property with X and Y direction instead of just elementWidth
     */
    function Heightfield(options) {
        var _a;
        var _this = _super.call(this, Shape_1.default.HEIGHTFIELD, options) || this;
        /**
         * An array of numbers, or height values, that are spread out along the x axis.
         * @property {array} heights
         */
        _this.heights = [];
        /**
         * Max value of the heights
         * @property {number} maxValue
         */
        _this.maxValue = 0;
        /**
         * Max value of the heights
         * @property {number} minValue
         */
        _this.minValue = 0;
        /**
         * The width of each element
         * @property {number} elementWidth
         */
        _this.elementWidth = 0;
        _this.heights = (options === null || options === void 0 ? void 0 : options.heights) ? options.heights.slice(0) : [];
        _this.elementWidth = (_a = options === null || options === void 0 ? void 0 : options.elementWidth) !== null && _a !== void 0 ? _a : 0.1;
        if ((options === null || options === void 0 ? void 0 : options.maxValue) && (options === null || options === void 0 ? void 0 : options.minValue)) {
            _this.maxValue = options === null || options === void 0 ? void 0 : options.maxValue;
            _this.minValue = options === null || options === void 0 ? void 0 : options.minValue;
        }
        else
            _this.updateMaxMinValues();
        return _this;
    }
    /**
     * Update the .minValue and the .maxValue
     * @method updateMaxMinValues
     */
    Heightfield.prototype.updateMaxMinValues = function () {
        var data = this.heights;
        var maxValue = data[0];
        var minValue = data[0];
        for (var i = 0; i !== data.length; i++) {
            var v = data[i];
            if (v > maxValue) {
                maxValue = v;
            }
            if (v < minValue) {
                minValue = v;
            }
        }
        this.maxValue = maxValue;
        this.minValue = minValue;
    };
    /**
     * @method computeMomentOfInertia
     * @return {Number}
     */
    Heightfield.prototype.computeMomentOfInertia = function () {
        return Infinity;
    };
    Heightfield.prototype.updateBoundingRadius = function () {
        this.boundingRadius = Infinity;
        return this.boundingRadius;
    };
    Heightfield.prototype.updateArea = function () {
        var data = this.heights, area = 0;
        for (var i = 0; i < data.length - 1; i++) {
            area += (data[i] + data[i + 1]) / 2 * this.elementWidth;
        }
        this.area = area;
        return this.area;
    };
    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Heightfield.prototype.computeAABB = function (out, position, angle) {
        var points = [
            vec2_1.default.create(),
            vec2_1.default.create(),
            vec2_1.default.create(),
            vec2_1.default.create()
        ];
        vec2_1.default.set(points[0], 0, this.maxValue);
        vec2_1.default.set(points[1], this.elementWidth * this.heights.length, this.maxValue);
        vec2_1.default.set(points[2], this.elementWidth * this.heights.length, this.minValue);
        vec2_1.default.set(points[3], 0, this.minValue);
        out.setFromPoints(points, position, angle);
    };
    /**
     * Get a line segment in the heightfield
     * @method getLineSegment
     * @param  {array} start Where to store the resulting start point
     * @param  {array} end Where to store the resulting end point
     * @param  {number} i
     */
    Heightfield.prototype.getLineSegment = function (start, end, i) {
        var data = this.heights;
        var width = this.elementWidth;
        vec2_1.default.set(start, i * width, data[i]);
        vec2_1.default.set(end, (i + 1) * width, data[i + 1]);
    };
    Heightfield.prototype.getSegmentIndex = function (position) {
        return Math.floor(position[0] / this.elementWidth);
    };
    Heightfield.prototype.getClampedSegmentIndex = function (position) {
        var i = this.getSegmentIndex(position);
        i = Math.min(this.heights.length, Math.max(i, 0)); // clamp
        return i;
    };
    /**
     * @method raycast
     * @param  {RayResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Heightfield.prototype.raycast = function (result, ray, position, angle) {
        var from = ray.from;
        var to = ray.to;
        var worldNormal = intersectHeightfield_worldNormal;
        var l0 = intersectHeightfield_l0;
        var l1 = intersectHeightfield_l1;
        var localFrom = intersectHeightfield_localFrom;
        var localTo = intersectHeightfield_localTo;
        // get local ray start and end
        vec2_1.default.toLocalFrame(localFrom, from, position, angle);
        vec2_1.default.toLocalFrame(localTo, to, position, angle);
        // Get the segment range
        var i0 = this.getClampedSegmentIndex(localFrom);
        var i1 = this.getClampedSegmentIndex(localTo);
        if (i0 > i1) {
            var tmp = i0;
            i0 = i1;
            i1 = tmp;
        }
        // The segments
        for (var i = 0; i < this.heights.length - 1; i++) {
            this.getLineSegment(l0, l1, i);
            var t = vec2_1.default.getLineSegmentsIntersectionFraction(localFrom, localTo, l0, l1);
            if (t >= 0) {
                vec2_1.default.subtract(worldNormal, l1, l0);
                vec2_1.default.rotate(worldNormal, worldNormal, angle + Math.PI / 2);
                vec2_1.default.normalize(worldNormal, worldNormal);
                ray.reportIntersection(result, t, worldNormal, -1);
                if (result.shouldStop(ray)) {
                    return;
                }
            }
        }
    };
    return Heightfield;
}(Shape_1.default));
exports.default = Heightfield;

},{"../math/vec2":28,"./Shape":38}],43:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// var Shape = require('./Shape')
// ,   shallowClone = require('../utils/Utils').shallowClone
// ,   vec2 = require('../math/vec2');
var Shape_1 = __importDefault(_dereq_("./Shape"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var raycast_normal = vec2_1.default.create();
var raycast_l0 = vec2_1.default.create();
var raycast_l1 = vec2_1.default.create();
var raycast_unit_y = vec2_1.default.fromValues(0, 1);
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    /**
     * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
     * @class Line
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {Number} [options.length=1] The total length of the line
     * @extends Shape
     * @constructor
     * @example
     *     var body = new Body();
     *     var lineShape = new Line({
     *         length: 1
     *     });
     *     body.addShape(lineShape);
     */
    function Line(options) {
        var _a;
        var _this = _super.call(this, Shape_1.default.LINE, options) || this;
        /**
         * Length of this line
         * @property {Number} length
         * @default 1
         */
        _this.length = 1;
        _this.length = (_a = options === null || options === void 0 ? void 0 : options.length) !== null && _a !== void 0 ? _a : 1;
        return _this;
    }
    Line.prototype.computeMomentOfInertia = function () {
        return Math.pow(this.length, 2) / 12;
    };
    ;
    Line.prototype.updateBoundingRadius = function () {
        this.boundingRadius = this.length / 2;
        return this.boundingRadius;
    };
    ;
    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Line.prototype.computeAABB = function (out, position, angle) {
        var points = [vec2_1.default.create(), vec2_1.default.create()];
        var l2 = this.length / 2;
        vec2_1.default.set(points[0], -l2, 0);
        vec2_1.default.set(points[1], l2, 0);
        out.setFromPoints(points, position, angle, 0);
    };
    ;
    Line.prototype.updateArea = function () { return 0; };
    /**
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @param  {number} angle
     * @param  {array} position
     */
    Line.prototype.raycast = function (result, ray, position, angle) {
        var from = ray.from;
        var to = ray.to;
        var l0 = raycast_l0;
        var l1 = raycast_l1;
        // get start and end of the line
        var halfLen = this.length / 2;
        vec2_1.default.set(l0, -halfLen, 0);
        vec2_1.default.set(l1, halfLen, 0);
        vec2_1.default.toGlobalFrame(l0, l0, position, angle);
        vec2_1.default.toGlobalFrame(l1, l1, position, angle);
        var fraction = vec2_1.default.getLineSegmentsIntersectionFraction(l0, l1, from, to);
        if (fraction >= 0) {
            var normal = raycast_normal;
            vec2_1.default.rotate(normal, raycast_unit_y, angle); // todo: this should depend on which side the ray comes from
            ray.reportIntersection(result, fraction, normal, -1);
        }
    };
    ;
    return Line;
}(Shape_1.default));
exports.default = Line;

},{"../math/vec2":28,"./Shape":38}],44:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// var Shape = require('./Shape')
// ,   shallowClone = require('../utils/Utils').shallowClone
// ,   copy = require('../math/vec2').copy;
var Shape_1 = __importDefault(_dereq_("./Shape"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var copy = vec2_1.default.copy;
var Particle = /** @class */ (function (_super) {
    __extends(Particle, _super);
    /**
     * Particle shape class.
     * @class Particle
     * @constructor
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @extends Shape
     * @example
     *     var body = new Body();
     *     var shape = new Particle();
     *     body.addShape(shape);
     */
    function Particle(options) {
        return _super.call(this, Shape_1.default.PARTICLE, options) || this;
    }
    Particle.prototype.computeMomentOfInertia = function () {
        return 0; // Can't rotate a particle
    };
    ;
    Particle.prototype.updateBoundingRadius = function () {
        this.boundingRadius = 0;
        return 0;
    };
    ;
    Particle.prototype.updateArea = function () { return 0; };
    /**
     * @method computeAABB
     * @param  {AABB}   out
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Particle.prototype.computeAABB = function (out, position /*, angle*/) {
        copy(out.lowerBound, position);
        copy(out.upperBound, position);
    };
    ;
    Particle.prototype.raycast = function (result, ray, position, angle) { 1; };
    return Particle;
}(Shape_1.default));
exports.default = Particle;

},{"../math/vec2":28,"./Shape":38}],45:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var shape_1 = __importDefault(_dereq_("./shape"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var intersectPlane_planePointToFrom = vec2_1.default.create();
var intersectPlane_normal = vec2_1.default.create();
var intersectPlane_len = vec2_1.default.create();
var Plane = /** @class */ (function (_super) {
    __extends(Plane, _super);
    /**
     * Plane shape class. The plane is facing in the Y direction.
     * @class Plane
     * @extends Shape
     * @constructor
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @example
     *     var body = new Body();
     *     var shape = new Plane();
     *     body.addShape(shape);
     */
    function Plane(options) {
        return _super.call(this, shape_1.default.PLANE, options) || this;
    }
    /**
     * Compute moment of inertia
     * @method computeMomentOfInertia
     */
    Plane.prototype.computeMomentOfInertia = function () {
        return 0; // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
    };
    /**
     * Update the bounding radius
     * @method updateBoundingRadius
     */
    Plane.prototype.updateBoundingRadius = function () {
        this.boundingRadius = Infinity;
        return Infinity;
    };
    /**
     * @method computeAABB
     * @param  {AABB}   out
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Plane.prototype.computeAABB = function (out, position, angle) {
        var a = angle % (2 * Math.PI);
        var set = vec2_1.default.set;
        var max = 1e7;
        var lowerBound = out.lowerBound;
        var upperBound = out.upperBound;
        // Set max bounds
        set(lowerBound, -max, -max);
        set(upperBound, max, max);
        if (a === 0) {
            // y goes from -inf to 0
            upperBound[1] = position[1];
        }
        else if (a === Math.PI / 2) {
            // x goes from 0 to inf
            lowerBound[0] = position[0];
        }
        else if (a === Math.PI) {
            // y goes from 0 to inf
            lowerBound[1] = position[1];
        }
        else if (a === 3 * Math.PI / 2) {
            // x goes from -inf to 0
            upperBound[0] = position[0];
        }
    };
    Plane.prototype.updateArea = function () {
        this.area = Infinity;
        return Infinity;
    };
    /**
     * @method raycast
     * @param  {RayResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Plane.prototype.raycast = function (result, ray, position, angle) {
        var from = ray.from;
        var to = ray.to;
        var direction = ray.direction;
        var planePointToFrom = intersectPlane_planePointToFrom;
        var normal = intersectPlane_normal;
        var len = intersectPlane_len;
        // Get plane normal
        vec2_1.default.set(normal, 0, 1);
        vec2_1.default.rotate(normal, normal, angle);
        vec2_1.default.subtract(len, from, position);
        var planeToFrom = vec2_1.default.dot(len, normal);
        vec2_1.default.subtract(len, to, position);
        var planeToTo = vec2_1.default.dot(len, normal);
        if (planeToFrom * planeToTo > 0) {
            // "from" and "to" are on the same side of the plane... bail out
            return;
        }
        if (vec2_1.default.squaredDistance(from, to) < planeToFrom * planeToFrom) {
            return;
        }
        var n_dot_dir = vec2_1.default.dot(normal, direction);
        vec2_1.default.subtract(planePointToFrom, from, position);
        var t = -vec2_1.default.dot(normal, planePointToFrom) / n_dot_dir / ray.length;
        ray.reportIntersection(result, t, normal, -1);
    };
    ;
    Plane.prototype.pointTest = function (localPoint) {
        return localPoint[1] <= 0;
    };
    return Plane;
}(shape_1.default));
exports.default = Plane;

},{"../math/vec2":28,"./shape":46}],46:[function(_dereq_,module,exports){
module.exports=_dereq_(38)
},{"../math/vec2":28}],47:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var solver_1 = __importDefault(_dereq_("./solver"));
var friction_equation_1 = __importDefault(_dereq_("../equations/friction-equation"));
// Sets the .multiplier property of each equation
function updateMultipliers(equations, invDt) {
    var l = equations.length;
    while (l--) {
        var eq = equations[l];
        eq.multiplier = eq.lambda * invDt;
    }
}
function iterateEquation(eq) {
    // Compute iteration
    var B = eq.B, eps = eq.epsilon, invC = eq.invC, lambdaj = eq.lambda, GWlambda = eq.computeGWlambda(), maxForce_dt = eq.maxForceDt, minForce_dt = eq.minForceDt;
    var deltalambda = invC * (B - GWlambda - eps * lambdaj);
    // Clamp if we are not within the min/max interval
    var lambdaj_plus_deltalambda = lambdaj + deltalambda;
    if (lambdaj_plus_deltalambda < minForce_dt) {
        deltalambda = minForce_dt - lambdaj;
    }
    else if (lambdaj_plus_deltalambda > maxForce_dt) {
        deltalambda = maxForce_dt - lambdaj;
    }
    eq.lambda += deltalambda;
    eq.addToWlambda(deltalambda);
    return deltalambda;
}
var GSSolver = /** @class */ (function (_super) {
    __extends(GSSolver, _super);
    /**
     * Iterative Gauss-Seidel constraint equation solver.
     *
     * @class GSSolver
     * @constructor
     * @extends Solver
     * @param {Object} [options]
     * @param {Number} [options.iterations=10]
     * @param {Number} [options.tolerance=0]
     */
    function GSSolver(options) {
        var _a, _b, _c;
        var _this = _super.call(this, options, solver_1.default.GS) || this;
        /**
         * The number of iterations that were made during the last solve. If .tolerance is zero, this value will always be equal to .iterations, but if .tolerance is larger than zero, and the solver can quit early, then this number will be somewhere between 1 and .iterations.
         * @property {Number} usedIterations
         */
        _this.usedIterations = 0;
        _this.iterations = (_a = options === null || options === void 0 ? void 0 : options.iterations) !== null && _a !== void 0 ? _a : 10;
        _this.tolerance = (_b = options === null || options === void 0 ? void 0 : options.tolerance) !== null && _b !== void 0 ? _b : 1e-7;
        _this.frictionIterations = (_c = options === null || options === void 0 ? void 0 : options.frictionIterations) !== null && _c !== void 0 ? _c : 0;
        return _this;
    }
    /**
     * Solve the system of equations
     * @method solve
     * @param  {Number}  h       Time step
     * @param  {World}   world    World to solve
     */
    GSSolver.prototype.solve = function (h, world) {
        this.sortEquations();
        var iter = 0, maxIter = this.iterations, maxFrictionIter = this.frictionIterations, equations = this.equations, Neq = equations.length, tolSquared = Math.pow(this.tolerance * Neq, 2), bodies = world.bodies, Nbodies = bodies.length;
        this.usedIterations = 0;
        if (Neq) {
            for (var i = 0; i !== Nbodies; i++) {
                var b = bodies[i];
                // Update solve mass
                b.updateSolveMassProperties();
            }
        }
        for (var i_1 = 0; i_1 !== Neq; i_1++) {
            var c_1 = equations[i_1];
            c_1.lambda = 0;
            if (c_1.timeStep !== h || c_1.needsUpdate) {
                c_1.timeStep = h;
                c_1.update();
            }
            c_1.B = c_1.computeB(c_1.a, c_1.b, h);
            c_1.invC = c_1.computeInvC(c_1.epsilon);
            c_1.maxForceDt = c_1.maxForce * h;
            c_1.minForceDt = c_1.minForce * h;
        }
        var c, deltalambdaTot, j;
        if (Neq !== 0) {
            for (i = 0; i !== Nbodies; i++) {
                var b = bodies[i];
                // Reset vlambda
                b.resetConstraintVelocity();
            }
            if (maxFrictionIter) {
                // Iterate over contact equations to get normal forces
                for (iter = 0; iter !== maxFrictionIter; iter++) {
                    // Accumulate the total error for each iteration.
                    deltalambdaTot = 0.0;
                    for (j = 0; j !== Neq; j++) {
                        c = equations[j];
                        var deltalambda = iterateEquation(c);
                        deltalambdaTot += Math.abs(deltalambda);
                    }
                    this.usedIterations++;
                    // If the total error is small enough - stop iterate
                    if (deltalambdaTot * deltalambdaTot <= tolSquared) {
                        break;
                    }
                }
                updateMultipliers(equations, 1 / h);
                // Set computed friction force
                for (j = 0; j !== Neq; j++) {
                    var eq = equations[j];
                    if (eq instanceof friction_equation_1.default) {
                        var f = 0.0;
                        for (var k = 0; k !== eq.contactEquations.length; k++) {
                            f += eq.contactEquations[k].multiplier;
                        }
                        f *= eq.frictionCoefficient / eq.contactEquations.length;
                        eq.maxForce = f;
                        eq.minForce = -f;
                        eq.maxForceDt = f * h;
                        eq.minForceDt = -f * h;
                    }
                }
            }
            // Iterate over all equations
            for (iter = 0; iter !== maxIter; iter++) {
                // Accumulate the total error for each iteration.
                deltalambdaTot = 0.0;
                for (j = 0; j !== Neq; j++) {
                    c = equations[j];
                    var deltalambda = iterateEquation(c);
                    deltalambdaTot += Math.abs(deltalambda);
                }
                this.usedIterations++;
                // If the total error is small enough - stop iterate
                if (deltalambdaTot * deltalambdaTot < tolSquared) {
                    break;
                }
            }
            // Add result to velocity
            for (i = 0; i !== Nbodies; i++) {
                bodies[i].addConstraintVelocity();
            }
            updateMultipliers(equations, 1 / h);
        }
    };
    ;
    return GSSolver;
}(solver_1.default));
exports.default = GSSolver;

},{"../equations/friction-equation":18,"./solver":48}],48:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var event_emitter_1 = __importDefault(_dereq_("../events/event-emitter"));
var Solver = /** @class */ (function (_super) {
    __extends(Solver, _super);
    /**
     * Base class for constraint solvers.
     * @class Solver
     * @constructor
     * @extends EventEmitter
     */
    function Solver(options, type) {
        var _a;
        var _this = _super.call(this) || this;
        _this.type = type;
        /**
         * Current equations in the solver.
         *
         * @property equations
         * @type {Array}
         */
        _this.equations = [];
        /**
         * Function that is used to sort all equations before each solve.
         * @property equationSortFunction
         * @type {function|boolean}
         */
        _this.equationSortFunction = (_a = options === null || options === void 0 ? void 0 : options.equationSortFunction) !== null && _a !== void 0 ? _a : undefined;
        return _this;
    }
    /**
     * Sort all equations using the .equationSortFunction. Should be called by subclasses before solving.
     * @method sortEquations
     */
    Solver.prototype.sortEquations = function () {
        if (this.equationSortFunction) {
            this.equations.sort(this.equationSortFunction);
        }
    };
    ;
    /**
     * Add an equation to be solved.
     *
     * @method addEquation
     * @param {Equation} eq
     */
    Solver.prototype.addEquation = function (eq) {
        if (eq.enabled) {
            this.equations.push(eq);
        }
    };
    ;
    /**
     * Add equations. Same as .addEquation, but this time the argument is an array of Equations
     *
     * @method addEquations
     * @param {Array} eqs
     */
    Solver.prototype.addEquations = function (eqs) {
        for (var i = 0, N = eqs.length; i !== N; i++) {
            var eq = eqs[i];
            if (eq.enabled) {
                this.equations.push(eq);
            }
        }
    };
    ;
    /**
     * Remove an equation.
     *
     * @method removeEquation
     * @param {Equation} eq
     */
    Solver.prototype.removeEquation = function (eq) {
        var i = this.equations.indexOf(eq);
        if (i !== -1) {
            this.equations.splice(i, 1);
        }
    };
    ;
    /**
     * Remove all currently added equations.
     *
     * @method removeAllEquations
     */
    Solver.prototype.removeAllEquations = function () {
        this.equations.length = 0;
    };
    ;
    /**
     * Gauss-Seidel solver.
     * @property GS
     * @type {Number}
     * @static
     */
    Solver.GS = 1;
    return Solver;
}(event_emitter_1.default));
exports.default = Solver;

},{"../events/event-emitter":21}],49:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pool_1 = __importDefault(_dereq_("./pool"));
var contact_equation_1 = __importDefault(_dereq_("../equations/contact-equation"));
var ContactEquationPool = /** @class */ (function (_super) {
    __extends(ContactEquationPool, _super);
    /**
     * @class
     */
    function ContactEquationPool(options) {
        return _super.call(this, options) || this;
    }
    /**
     * @method create
     * @return {ContactEquation}
     */
    ContactEquationPool.prototype.create = function () {
        return new contact_equation_1.default();
    };
    /**
     * @method destroy
     * @param {ContactEquation} equation
     * @return {ContactEquationPool}
     */
    ContactEquationPool.prototype.destroy = function (equation) {
        equation.bodyA = equation.bodyB = null;
        return this;
    };
    return ContactEquationPool;
}(pool_1.default));
exports.default = ContactEquationPool;

},{"../equations/contact-equation":16,"./pool":54}],50:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pool_1 = __importDefault(_dereq_("./pool"));
var friction_equation_1 = __importDefault(_dereq_("../equations/friction-equation"));
var FrictionEquationPool = /** @class */ (function (_super) {
    __extends(FrictionEquationPool, _super);
    /**
     * @class
     */
    function FrictionEquationPool(options) {
        return _super.call(this, options) || this;
    }
    /**
     * @method create
     * @return {FrictionEquation}
     */
    FrictionEquationPool.prototype.create = function () {
        return new friction_equation_1.default();
    };
    ;
    /**
     * @method destroy
     * @param {FrictionEquation} equation
     * @return {FrictionEquationPool}
     */
    FrictionEquationPool.prototype.destroy = function (equation) {
        equation.bodyA = equation.bodyB = null;
        return this;
    };
    ;
    return FrictionEquationPool;
}(pool_1.default));
exports.default = FrictionEquationPool;

},{"../equations/friction-equation":18,"./pool":54}],51:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pool_1 = __importDefault(_dereq_("./pool"));
var overlap_keeper_record_1 = __importDefault(_dereq_("./overlap-keeper-record"));
var OverlapKeeperRecordPool = /** @class */ (function (_super) {
    __extends(OverlapKeeperRecordPool, _super);
    /**
     * @class
     */
    function OverlapKeeperRecordPool(options) {
        return _super.call(this, options) || this;
    }
    /**
     * @method create
     * @return {OverlapKeeperRecord}
     */
    OverlapKeeperRecordPool.prototype.create = function () {
        return new overlap_keeper_record_1.default();
    };
    ;
    /**
     * @method destroy
     * @param {OverlapKeeperRecord} record
     * @return {OverlapKeeperRecordPool}
     */
    OverlapKeeperRecordPool.prototype.destroy = function (record) {
        record.set(undefined, undefined, undefined, undefined);
        return this;
    };
    ;
    return OverlapKeeperRecordPool;
}(pool_1.default));
exports.default = OverlapKeeperRecordPool;

},{"./overlap-keeper-record":52,"./pool":54}],52:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OverlapKeeperRecord = /** @class */ (function () {
    /**
     * Overlap data container for the OverlapKeeper
     * @class OverlapKeeperRecord
     * @constructor
     * @param {Body} bodyA
     * @param {Shape} shapeA
     * @param {Body} bodyB
     * @param {Shape} shapeB
     */
    function OverlapKeeperRecord(bodyA, shapeA, bodyB, shapeB) {
        this.set(bodyA, shapeA, bodyB, shapeB);
    }
    /**
     * Set the data for the record
     * @method set
     * @param {Body} bodyA
     * @param {Shape} shapeA
     * @param {Body} bodyB
     * @param {Shape} shapeB
     */
    OverlapKeeperRecord.prototype.set = function (bodyA, shapeA, bodyB, shapeB) {
        this.shapeA = shapeA;
        this.shapeB = shapeB;
        this.bodyA = bodyA;
        this.bodyB = bodyB;
    };
    ;
    return OverlapKeeperRecord;
}());
exports.default = OverlapKeeperRecord;

},{}],53:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tuple_dictionary_1 = __importDefault(_dereq_("./tuple-dictionary"));
var overlap_keeper_record_pool_1 = __importDefault(_dereq_("./overlap-keeper-record-pool"));
var OverlapKeeper = /** @class */ (function () {
    /**
     * Keeps track of overlaps in the current state and the last step state.
     * @class OverlapKeeper
     * @constructor
     */
    function OverlapKeeper() {
        this.overlappingShapesLastState = new tuple_dictionary_1.default();
        this.overlappingShapesCurrentState = new tuple_dictionary_1.default();
        this.recordPool = new overlap_keeper_record_pool_1.default({ size: 16 });
        this.tmpDict = new tuple_dictionary_1.default();
        this.tmpArray1 = [];
    }
    /**
     * Ticks one step forward in time. This will move the current overlap state to the "old" overlap state, and create a new one as current.
     * @method tick
     */
    OverlapKeeper.prototype.tick = function () {
        var last = this.overlappingShapesLastState;
        var current = this.overlappingShapesCurrentState;
        // Save old objects into pool
        var l = last.keys.length;
        while (l--) {
            var key = last.keys[l];
            var lastObject = last.getByKey(key);
            if (lastObject) {
                // The record is only used in the "last" dict, and will be removed. We might as well pool it.
                this.recordPool.release(lastObject);
            }
        }
        // Clear last object
        last.reset();
        // Transfer from new object to old
        last.copy(current);
        // Clear current object
        current.reset();
    };
    /**
     * @method setOverlapping
     * @param {Body} bodyA
     * @param {Body} shapeA
     * @param {Body} bodyB
     * @param {Body} shapeB
     */
    OverlapKeeper.prototype.setOverlapping = function (bodyA, shapeA, bodyB, shapeB) {
        var current = this.overlappingShapesCurrentState;
        // Store current contact state
        if (!current.get(shapeA.id, shapeB.id)) {
            var data = this.recordPool.get();
            data.set(bodyA, shapeA, bodyB, shapeB);
            current.set(shapeA.id, shapeB.id, data);
        }
    };
    OverlapKeeper.prototype.getNewOverlaps = function (result) {
        return this.getDiff(this.overlappingShapesLastState, this.overlappingShapesCurrentState, result);
    };
    OverlapKeeper.prototype.getEndOverlaps = function (result) {
        return this.getDiff(this.overlappingShapesCurrentState, this.overlappingShapesLastState, result);
    };
    /**
     * Checks if two bodies are currently overlapping.
     * @method bodiesAreOverlapping
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {boolean}
     */
    OverlapKeeper.prototype.bodiesAreOverlapping = function (bodyA, bodyB) {
        var current = this.overlappingShapesCurrentState;
        var l = current.keys.length;
        while (l--) {
            var key = current.keys[l];
            var data = current.data[key];
            if ((data.bodyA === bodyA && data.bodyB === bodyB) || data.bodyA === bodyB && data.bodyB === bodyA) {
                return true;
            }
        }
        return false;
    };
    OverlapKeeper.prototype.getDiff = function (dictA, dictB, result) {
        var result = result || [];
        var last = dictA;
        var current = dictB;
        result.length = 0;
        var l = current.keys.length;
        while (l--) {
            var key = current.keys[l];
            var data = current.data[key];
            if (!data) {
                throw new Error('Key ' + key + ' had no data!');
            }
            var lastData = last.data[key];
            if (!lastData) {
                // Not overlapping in last state, but in current.
                result.push(data);
            }
        }
        return result;
    };
    OverlapKeeper.prototype.isNewOverlap = function (shapeA, shapeB) {
        var last = this.overlappingShapesLastState;
        var current = this.overlappingShapesCurrentState;
        // Not in last but in new
        return !last.get(shapeA.id, shapeB.id) && !!current.get(shapeA.id, shapeB.id);
    };
    OverlapKeeper.prototype.getNewBodyOverlaps = function (result) {
        this.tmpArray1.length = 0;
        var overlaps = this.getNewOverlaps(this.tmpArray1);
        return this.getBodyDiff(overlaps, result);
    };
    OverlapKeeper.prototype.getEndBodyOverlaps = function (result) {
        this.tmpArray1.length = 0;
        var overlaps = this.getEndOverlaps(this.tmpArray1);
        return this.getBodyDiff(overlaps, result);
    };
    OverlapKeeper.prototype.getBodyDiff = function (overlaps, result) {
        result = result || [];
        var accumulator = this.tmpDict;
        var l = overlaps.length;
        while (l--) {
            var data = overlaps[l];
            // Since we use body id's for the accumulator, these will be a subset of the original one
            accumulator.set(data.bodyA.id | 0, data.bodyB.id | 0, data);
        }
        l = accumulator.keys.length;
        while (l--) {
            var data = accumulator.getByKey(accumulator.keys[l]);
            if (data) {
                result.push(data.bodyA);
                result.push(data.bodyB);
            }
        }
        accumulator.reset();
        return result;
    };
    return OverlapKeeper;
}());
exports.default = OverlapKeeper;

},{"./overlap-keeper-record-pool":51,"./tuple-dictionary":55}],54:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pool = /** @class */ (function () {
    /**
     * Object pooling utility.
     * @class Pool
     * @constructor
     */
    function Pool(options) {
        /**
         * @property {Array} objects
         * @type {Array}
         */
        this.objects = [];
        if (options === null || options === void 0 ? void 0 : options.size) {
            this.resize(options === null || options === void 0 ? void 0 : options.size);
        }
    }
    /**
     * @method resize
     * @param {number} size
     * @return {Pool} Self, for chaining
     */
    Pool.prototype.resize = function (size) {
        var objects = this.objects;
        while (objects.length > size) {
            objects.pop();
        }
        while (objects.length < size) {
            objects.push(this.create());
        }
        return this;
    };
    /**
     * Get an object from the pool or create a new instance.
     * @method get
     * @return {Object}
     */
    Pool.prototype.get = function () {
        var objects = this.objects;
        return objects.length ? objects.pop() : this.create();
    };
    /**
     * Clean up and put the object back into the pool for later use.
     * @method release
     * @param {Object} object
     * @return {Pool} Self for chaining
     */
    Pool.prototype.release = function (object) {
        this.destroy(object);
        this.objects.push(object);
        return this;
    };
    return Pool;
}());
exports.default = Pool;

},{}],55:[function(_dereq_,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __importDefault(_dereq_("./utils"));
var TupleDictionary = /** @class */ (function () {
    /**
     * @class TupleDictionary
     * @constructor
     */
    function TupleDictionary() {
        /**
         * The data storage
         * @property data
         * @type {Object}
         */
        this.data = {};
        /**
         * Keys that are currently used.
         * @property {Array} keys
         */
        this.keys = [];
    }
    /**
     * Generate a key given two integers
     * @method getKey
     * @param  {number} i
     * @param  {number} j
     * @return {number}
     */
    TupleDictionary.prototype.getKey = function (id1, id2) {
        if ((id1) === (id2)) {
            return -1;
        }
        // valid for values < 2^16
        return ((id1) > (id2) ?
            (id1 << 16) | (id2 & 0xFFFF) :
            (id2 << 16) | (id1 & 0xFFFF)) | 0;
    };
    /**
     * @method getByKey
     * @param  {Number} key
     * @return {Object}
     */
    TupleDictionary.prototype.getByKey = function (key) {
        key = key;
        return this.data[key];
    };
    /**
     * @method get
     * @param  {Number} i
     * @param  {Number} j
     * @return {Number}
     */
    TupleDictionary.prototype.get = function (i, j) {
        return this.data[this.getKey(i, j)];
    };
    /**
     * Set a value.
     * @method set
     * @param  {Number} i
     * @param  {Number} j
     * @param {Number} value
     */
    TupleDictionary.prototype.set = function (i, j, value) {
        if (!value) {
            throw new Error("No data!");
        }
        var key = this.getKey(i, j);
        // Check if key already exists
        if (!this.data[key]) {
            this.keys.push(key);
        }
        this.data[key] = value;
        return key;
    };
    /**
     * Remove all data.
     * @method reset
     */
    TupleDictionary.prototype.reset = function () {
        var data = this.data, keys = this.keys;
        var l = keys.length;
        while (l--) {
            delete data[keys[l]];
        }
        keys.length = 0;
    };
    /**
     * Copy another TupleDictionary. Note that all data in this dictionary will be removed.
     * @method copy
     * @param {TupleDictionary} dict The TupleDictionary to copy into this one.
     */
    TupleDictionary.prototype.copy = function (dict) {
        this.reset();
        utils_1.default.appendArray(this.keys, dict.keys);
        var l = dict.keys.length;
        while (l--) {
            var key = dict.keys[l];
            this.data[key] = dict.data[key];
        }
    };
    return TupleDictionary;
}());
exports.default = TupleDictionary;

},{"./utils":56}],56:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* global P2_ARRAY_TYPE */
/**
 * Misc utility functions
 */
var Utils = /** @class */ (function () {
    function Utils() {
    }
    /**
     * Append the values in array b to the array a. See <a href="http://stackoverflow.com/questions/1374126/how-to-append-an-array-to-an-existing-javascript-array/1374131#1374131">this</a> for an explanation.
     * @method appendArray
     * @static
     * @param  {Array} a
     * @param  {Array} b
     */
    Utils.prototype.appendArray = function (a, b) {
        for (var i = 0, len = b.length; i !== len; ++i) {
            a.push(b[i]);
        }
    };
    /**
     * Garbage free Array.splice(). Does not allocate a new array.
     * @method splice
     * @static
     * @param  {Array} array
     * @param  {Number} index
     * @param  {Number} howmany
     */
    Utils.prototype.splice = function (array, index, howmany) {
        howmany = howmany || 1;
        for (var i = index, len = array.length - howmany; i < len; i++) {
            array[i] = array[i + howmany];
        }
        array.length = len;
    };
    /**
     * Remove an element from an array, if the array contains the element.
     * @method arrayRemove
     * @static
     * @param  {Array} array
     * @param  {Number} element
     */
    Utils.prototype.arrayRemove = function (array, element) {
        var idx = array.indexOf(element);
        if (idx !== -1) {
            this.splice(array, idx, 1);
        }
    };
    /**
     * Extend an object with the properties of another
     * @static
     * @method extend
     * @param  {object} a
     * @param  {object} b
     */
    Utils.prototype.extend = function (a, b) {
        for (var key in b) {
            a[key] = b[key];
        }
    };
    /**
     * Shallow clone an object. Returns a new object instance with the same properties as the input instance.
     * @static
     * @method shallowClone
     * @param  {object} obj
     */
    Utils.prototype.shallowClone = function (obj) {
        var newObj = {};
        this.extend(newObj, obj);
        return newObj;
    };
    return Utils;
}());
exports.default = new Utils();

},{}],57:[function(_dereq_,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UnionFind = /** @class */ (function () {
    /**
     * Weighted Quick Union-Find with Path Compression. Based on https://github.com/juzerali/unionfind, but optimized for performance.
     * @class UnionFind
     * @constructor
     * @param {number} size
     */
    function UnionFind(size) {
        this.id = [];
        this.sz = [];
        /**
         * The number of elements.
         * @property {number} size
         */
        this.size = size;
        /**
         * The number of distinct groups.
         * @property {number} count
         */
        this.count = size;
        this.resize(size);
    }
    /**
     * Initialize the UnionFind data structure with number of distinct groups to begin with. Each group will be referred to as index of the array of size size starting at 0.
     * @method resize
     * @param {number} size
     */
    UnionFind.prototype.resize = function (size) {
        this.count = this.size = size;
        var sz = this.sz;
        var id = this.id;
        for (var i = 0; i < size; i++) {
            id[i] = i;
            sz[i] = 1;
        }
    };
    /**
     * Return the root (value) of the group in which p is.
     * @method find
     * @param {number} p
     */
    UnionFind.prototype.find = function (p) {
        var id = this.id;
        while (p !== id[p]) {
            id[p] = id[id[p]];
            p = id[p];
        }
        return p;
    };
    /**
     * Combine elements in groups p and q into a single group. In other words connect the two groups.
     * @method union
     * @param {number} p
     * @param {number} q
     */
    UnionFind.prototype.union = function (p, q) {
        var i = this.find(p), j = this.find(q);
        if (i === j) {
            return;
        }
        var sz = this.sz;
        var id = this.id;
        if (sz[i] < sz[j]) {
            id[i] = j;
            sz[j] += sz[i];
        }
        else {
            id[j] = i;
            sz[i] += sz[j];
        }
        this.count--;
        return;
    };
    return UnionFind;
}());
exports.default = UnionFind;

},{}],58:[function(_dereq_,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var gs_solver_1 = __importDefault(_dereq_("../solver/gs-solver"));
var vec2_1 = __importDefault(_dereq_("../math/vec2"));
var shape_1 = __importDefault(_dereq_("../shapes/shape"));
var event_emitter_1 = __importDefault(_dereq_("../events/event-emitter"));
var body_1 = __importDefault(_dereq_("../objects/body"));
var material_1 = __importDefault(_dereq_("../material/material"));
var contact_material_1 = __importDefault(_dereq_("../material/contact-material"));
var aabb_1 = __importDefault(_dereq_("../collision/aabb"));
var sap_broadphase_1 = __importDefault(_dereq_("../collision/sap-broadphase"));
var narrowphase_1 = __importDefault(_dereq_("../collision/narrowphase"));
var utils_1 = __importDefault(_dereq_("../utils/utils"));
//import arrayRemove from  "ayRemo"; // Get rid of this dependency!
var overlap_keeper_1 = __importDefault(_dereq_("../utils/overlap-keeper"));
var union_find_1 = __importDefault(_dereq_("./union-find"));
//import f32 from "f32";
/**
 * Fired after the step().
 * @event postStep
 */
var postStepEvent = {
    type: "postStep"
};
/**
 * Fired when a body is added to the world.
 * @event addBody
 * @param {Body} body
 */
var AddBodyEvent = /** @class */ (function () {
    function AddBodyEvent() {
        this.type = "addBody";
        this.body = null;
    }
    return AddBodyEvent;
}());
var addBodyEvent = new AddBodyEvent();
/**
 * Fired when a body is removed from the world.
 * @event removeBody
 * @param {Body} body
 */
var RemoveBodyEvent = /** @class */ (function () {
    function RemoveBodyEvent() {
        this.type = "removeBody";
        this.body = null;
    }
    return RemoveBodyEvent;
}());
var removeBodyEvent = new RemoveBodyEvent();
/**
 * Fired when a spring is added to the world.
 * @event addSpring
 * @param {Spring} spring
 */
var AddSpringEvent = /** @class */ (function () {
    function AddSpringEvent() {
        this.type = "addSpring";
        this.spring = null;
    }
    return AddSpringEvent;
}());
var addSpringEvent = new AddSpringEvent();
/**
 * Fired when a first contact is created between two bodies. This event is fired after the step has been done.
 * @event impact
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @deprecated Impact event will be removed. Use beginContact instead.
 */
var ImpactEvent = /** @class */ (function () {
    function ImpactEvent() {
        this.type = "impact";
        this.bodyA = null;
        this.bodyB = null;
        this.shapeA = null;
        this.shapeB = null;
        this.contactEquation = null;
    }
    return ImpactEvent;
}());
var impactEvent = new ImpactEvent();
/**
 * Fired after the Broadphase has collected collision pairs in the world.
 * Inside the event handler, you can modify the pairs array as you like, to
 * prevent collisions between objects that you don't want.
 * @event postBroadphase
 * @param {Array} pairs An array of collision pairs. If this array is [body1,body2,body3,body4], then the body pairs 1,2 and 3,4 would advance to narrowphase.
 */
var PostBroadphaseEvent = /** @class */ (function () {
    function PostBroadphaseEvent() {
        this.type = "postBroadphase";
        this.pairs = null;
    }
    return PostBroadphaseEvent;
}());
var postBroadphaseEvent = new PostBroadphaseEvent;
var BeginContactEvent = /** @class */ (function () {
    function BeginContactEvent() {
        this.type = "beginContact";
        this.shapeA = null;
        this.shapeB = null;
        this.bodyA = null;
        this.bodyB = null;
        this.contactEquations = [];
    }
    return BeginContactEvent;
}());
/**
 * Fired when two shapes starts start to overlap. Fired in the narrowphase, during step.
 * @event beginContact
 * @param {Shape} shapeA
 * @param {Shape} shapeB
 * @param {Body}  bodyA
 * @param {Body}  bodyB
 * @param {Array} contactEquations
 */
var beginContactEvent = new BeginContactEvent();
/**
 * Fired when two shapes stop overlapping, after the narrowphase (during step).
 * @event endContact
 * @param {Shape} shapeA
 * @param {Shape} shapeB
 * @param {Body}  bodyA
 * @param {Body}  bodyB
 */
var endContactEvent = {
    type: "endContact",
    shapeA: null,
    shapeB: null,
    bodyA: null,
    bodyB: null
};
var hitTest_tmp1 = vec2_1.default.create(), hitTest_tmp2 = vec2_1.default.create();
/**
 * Fired just before equations are added to the solver to be solved. Can be used to control what equations goes into the solver.
 * @event preSolve
 * @param {Array} contactEquations  An array of contacts to be solved.
 * @param {Array} frictionEquations An array of friction equations to be solved.
 */
var PreSolveEvent = /** @class */ (function () {
    function PreSolveEvent() {
        this.type = "preSolve";
        this.contactEquations = null;
        this.frictionEquations = null;
    }
    return PreSolveEvent;
}());
var preSolveEvent = new PreSolveEvent();
function sortBodiesByIsland(a, b) {
    return a.islandId - b.islandId;
}
function sortEquationsByIsland(equationA, equationB) {
    if (!(equationA === null || equationA === void 0 ? void 0 : equationA.bodyA) || !(equationA === null || equationA === void 0 ? void 0 : equationA.bodyB) || !(equationB === null || equationB === void 0 ? void 0 : equationB.bodyA) || !(equationB === null || equationB === void 0 ? void 0 : equationB.bodyB))
        return 0;
    var islandA = equationA.bodyA.islandId > 0 ? equationA.bodyA.islandId : equationA.bodyB.islandId;
    var islandB = equationB.bodyA.islandId > 0 ? equationB.bodyA.islandId : equationB.bodyB.islandId;
    if (islandA !== islandB) {
        return islandA - islandB;
    }
    else {
        // Sort by equation type if same island
        return equationA.index - equationB.index;
    }
}
// Why not just make this a private method in world?
// What are all these props???
function runNarrowphase(world, np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen) {
    var xiw = vec2_1.default.create();
    var xjw = vec2_1.default.create();
    // Check collision groups and masks
    if (!((si.collisionGroup & sj.collisionMask) !== 0 && (sj.collisionGroup & si.collisionMask) !== 0)) {
        return;
    }
    // Get world position and angle of each shape
    vec2_1.default.toGlobalFrame(xiw, xi, bi.position, bi.angle);
    vec2_1.default.toGlobalFrame(xjw, xj, bj.position, bj.angle);
    if (vec2_1.default.distance(xiw, xjw) > si.boundingRadius + sj.boundingRadius) {
        return;
    }
    var aiw = ai + bi.angle;
    var ajw = aj + bj.angle;
    np.enableFriction = cm.friction > 0;
    var reducedMass;
    if (bi.type === body_1.default.STATIC || bi.type === body_1.default.KINEMATIC) {
        reducedMass = bj.mass;
    }
    else if (bj.type === body_1.default.STATIC || bj.type === body_1.default.KINEMATIC) {
        reducedMass = bi.mass;
    }
    else {
        reducedMass = (bi.mass * bj.mass) / (bi.mass + bj.mass);
    }
    np.slipForce = cm.friction * glen * reducedMass;
    np.currentContactMaterial = cm;
    np.enabledEquations = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;
    var sensor = si.sensor || sj.sensor;
    var numFrictionBefore = np.frictionEquations.length;
    var numContacts = np.testContact(bi, si, xiw, bj, sj, xjw, sensor);
    var numFrictionEquations = np.frictionEquations.length - numFrictionBefore;
    if (numContacts) {
        if (bi.allowSleep &&
            bi.type === body_1.default.DYNAMIC &&
            bi.sleepState === body_1.default.SLEEPING &&
            bj.sleepState === body_1.default.AWAKE &&
            bj.type !== body_1.default.STATIC) {
            var speedSquaredB = vec2_1.default.squaredLength(bj.velocity) + Math.pow(bj.angularVelocity, 2);
            var speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit, 2);
            if (speedSquaredB >= speedLimitSquaredB * 2) {
                bi._wakeUpAfterNarrowphase = true;
            }
        }
        if (bj.allowSleep &&
            bj.type === body_1.default.DYNAMIC &&
            bj.sleepState === body_1.default.SLEEPING &&
            bi.sleepState === body_1.default.AWAKE &&
            bi.type !== body_1.default.STATIC) {
            var speedSquaredA = vec2_1.default.squaredLength(bi.velocity) + Math.pow(bi.angularVelocity, 2);
            var speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit, 2);
            if (speedSquaredA >= speedLimitSquaredA * 2) {
                bj._wakeUpAfterNarrowphase = true;
            }
        }
        world.overlapKeeper.setOverlapping(bi, si, bj, sj);
        if (world.has('beginContact') && world.overlapKeeper.isNewOverlap(si, sj)) {
            // Report new shape overlap
            var e = beginContactEvent;
            e.shapeA = si;
            e.shapeB = sj;
            e.bodyA = bi;
            e.bodyB = bj;
            // Reset contact equations
            e.contactEquations.length = 0;
            if (!sensor) {
                for (var i = np.contactEquations.length - numContacts; i < np.contactEquations.length; i++) {
                    e.contactEquations.push(np.contactEquations[i]);
                }
            }
            world.emit(e);
        }
        // divide the max friction force by the number of contacts
        if (!sensor && numFrictionEquations > 1) { // Why divide by 1?
            for (var i = np.frictionEquations.length - numFrictionEquations; i < np.frictionEquations.length; i++) {
                var f = np.frictionEquations[i];
                f.setSlipForce(f.getSlipForce() / numFrictionEquations);
            }
        }
    }
}
function setGlobalEquationParams(world, params) {
    var _a, _b;
    var constraints = world.constraints;
    for (var i = 0; i !== constraints.length; i++) {
        var c = constraints[i];
        var eqs = c.equations;
        for (var j = 0; j !== eqs.length; j++) {
            var eq = eqs[j];
            eq.relaxation = (_a = params === null || params === void 0 ? void 0 : params.relaxation) !== null && _a !== void 0 ? _a : eq.relaxation;
            eq.stiffness = (_b = params === null || params === void 0 ? void 0 : params.stiffness) !== null && _b !== void 0 ? _b : eq.stiffness;
            eq.needsUpdate = true;
        }
    }
}
var World = /** @class */ (function (_super) {
    __extends(World, _super);
    /**
     * The dynamics world, where all bodies and constraints live.
     *
     * @class World
     * @constructor
     * @param {Object} [options]
     * @param {Solver} [options.solver] Defaults to GSSolver.
     * @param {Array} [options.gravity] Defaults to y=-9.78.
     * @param {Broadphase} [options.broadphase] Defaults to SAPBroadphase
     * @param {Boolean} [options.islandSplit=true]
     * @extends EventEmitter
     *
     * @example
     *     var world = new World({
     *         gravity: [0, -10],
     *         broadphase: new SAPBroadphase()
     *     });
     *     world.addBody(new Body());
     */
    function World(options) {
        var _a, _b, _c, _d;
        var _this = _super.call(this) || this;
        /**
         * All springs in the world. To add a spring to the world, use {{#crossLink "World/addSpring:method"}}{{/crossLink}}.
         *
         * @property springs
         * @type {Array}
         */
        _this.springs = [];
        /**
         * All bodies in the world. To add a body to the world, use {{#crossLink "World/addBody:method"}}{{/crossLink}}.
         * @property {Array} bodies
         */
        _this.bodies = [];
        /**
         * Disabled body collision pairs. See {{#crossLink "World/disableBodyCollision:method"}}.
         * @private
         * @property {Array} disabledBodyCollisionPairs
         */
        _this.disabledBodyCollisionPairs = [];
        /**
         * The narrowphase to use to generate contacts.
         *
         * @property narrowphase
         * @type {Narrowphase}
         */
        _this.narrowphase = new narrowphase_1.default();
        /**
         * Gravity in the world. This is applied on all bodies in the beginning of each step().
         *
         * @property gravity
         * @type {Array}
         */
        _this.gravity = vec2_1.default.fromValues(0, -9.78);
        /**
         * Gravity to use when approximating the friction max force (mu*mass*gravity).
         * @property {Number} frictionGravity
         */
        _this.frictionGravity = 10;
        /**
         * Set to true if you want .frictionGravity to be automatically set to the length of .gravity.
         * @property {Boolean} useWorldGravityAsFrictionGravity
         * @default true
         */
        _this.useWorldGravityAsFrictionGravity = true;
        /**
         * If the length of .gravity is zero, and .useWorldGravityAsFrictionGravity=true, then switch to using .frictionGravity for friction instead. This fallback is useful for gravityless games.
         * @property {Boolean} useFrictionGravityOnZeroGravity
         * @default true
         */
        _this.useFrictionGravityOnZeroGravity = true;
        /**
         * User-added constraints.
         *
         * @property constraints
         * @type {Array}
         */
        _this.constraints = [];
        /**
         * Dummy default material in the world, used in .defaultContactMaterial
         * @property {Material} defaultMaterial
         */
        _this.defaultMaterial = new material_1.default();
        /**
         * For keeping track of what time step size we used last step
         * @property lastTimeStep
         * @type {Number}
         */
        _this.lastTimeStep = 1 / 60;
        /**
         * Enable to automatically apply spring forces each step.
         * @property applySpringForces
         * @type {Boolean}
         * @default true
         */
        _this.applySpringForces = true;
        /**
         * Enable to automatically apply body damping each step.
         * @property applyDamping
         * @type {Boolean}
         * @default true
         */
        _this.applyDamping = true;
        /**
         * Enable to automatically apply gravity each step.
         * @property applyGravity
         * @type {Boolean}
         * @default true
         */
        _this.applyGravity = true;
        /**
         * Enable/disable constraint solving in each step.
         * @property solveConstraints
         * @type {Boolean}
         * @default true
         */
        _this.solveConstraints = true;
        /**
         * The ContactMaterials added to the World.
         * @property contactMaterials
         * @type {Array}
         */
        _this.contactMaterials = [];
        /**
         * World time.
         * @property time
         * @type {Number}
         */
        _this.time = 0.0;
        _this.accumulator = 0;
        /**
         * Is true during step().
         * @property {Boolean} stepping
         */
        _this.stepping = false;
        /**
         * Whether to enable island splitting. Island splitting can be an advantage for both precision and performance.
         * @property {Boolean} islandSplit
         * @default false
         */
        _this.islandSplit = true;
        /**
         * Set to true if you want to the world to emit the "impact" event. Turning this off could improve performance.
         * @property emitImpactEvent
         * @type {Boolean}
         * @default true
         * @deprecated Impact event will be removed. Use beginContact instead.
         */
        _this.emitImpactEvent = true;
        /**
         * How to deactivate bodies during simulation. Possible modes are: {{#crossLink "World/NO_SLEEPING:property"}}World.NO_SLEEPING{{/crossLink}}, {{#crossLink "World/BODY_SLEEPING:property"}}World.BODY_SLEEPING{{/crossLink}} and {{#crossLink "World/ISLAND_SLEEPING:property"}}World.ISLAND_SLEEPING{{/crossLink}}.
         * If sleeping is enabled, you might need to {{#crossLink "Body/wakeUp:method"}}wake up{{/crossLink}} the bodies if they fall asleep when they shouldn't. If you want to enable sleeping in the world, but want to disable it for a particular body, see {{#crossLink "Body/allowSleep:property"}}Body.allowSleep{{/crossLink}}.
         * @property sleepMode
         * @type {number}
         * @default World.NO_SLEEPING
         */
        _this.sleepMode = World.NO_SLEEPING;
        /**
         * @property {UnionFind} unionFind
         */
        _this.unionFind = new union_find_1.default(1);
        // Id counters
        _this._constraintIdCounter = 0;
        _this._bodyIdCounter = 0;
        /**
         * @property {OverlapKeeper} overlapKeeper
         */
        _this.overlapKeeper = new overlap_keeper_1.default();
        _this.solver = (_a = options === null || options === void 0 ? void 0 : options.solver) !== null && _a !== void 0 ? _a : new gs_solver_1.default();
        if (options === null || options === void 0 ? void 0 : options.gravity) {
            vec2_1.default.copy(_this.gravity, options.gravity);
        }
        _this.frictionGravity = (_b = vec2_1.default.length(_this.gravity)) !== null && _b !== void 0 ? _b : 10;
        _this.broadphase = (_c = options === null || options === void 0 ? void 0 : options.broadphase) !== null && _c !== void 0 ? _c : new sap_broadphase_1.default();
        _this.broadphase.setWorld(_this);
        _this.defaultContactMaterial = new contact_material_1.default(_this.defaultMaterial, _this.defaultMaterial);
        _this.islandSplit = (_d = options === null || options === void 0 ? void 0 : options.islandSplit) !== null && _d !== void 0 ? _d : true;
        return _this;
    }
    /**
     * Add a constraint to the simulation. Note that both bodies connected to the constraint must be added to the world first. Also note that you can't run this method during step.
     *
     * @method addConstraint
     * @param {Constraint} constraint
     * @example
     *     var constraint = new LockConstraint(bodyA, bodyB);
     *     world.addConstraint(constraint);
     */
    World.prototype.addConstraint = function (constraint) {
        if (this.stepping) {
            throw new Error('Constraints cannot be added during step.');
        }
        var bodies = this.bodies;
        if (bodies.indexOf(constraint.bodyA) === -1) {
            throw new Error('Cannot add Constraint: bodyA is not added to the World.');
        }
        if (bodies.indexOf(constraint.bodyB) === -1) {
            throw new Error('Cannot add Constraint: bodyB is not added to the World.');
        }
        this.constraints.push(constraint);
    };
    /**
     * Add a ContactMaterial to the simulation.
     * @method addContactMaterial
     * @param {ContactMaterial} contactMaterial
     */
    World.prototype.addContactMaterial = function (contactMaterial) {
        this.contactMaterials.push(contactMaterial);
    };
    /**
     * Removes a contact material
     *
     * @method removeContactMaterial
     * @param {ContactMaterial} cm
     */
    World.prototype.removeContactMaterial = function (cm) {
        utils_1.default.arrayRemove(this.contactMaterials, cm);
    };
    /**
     * Get a contact material given two materials
     * @method getContactMaterial
     * @param {Material} materialA
     * @param {Material} materialB
     * @return {ContactMaterial} The matching ContactMaterial, or false on fail.
     * @todo Use faster hash map to lookup from material id's
     */
    World.prototype.getContactMaterial = function (materialA, materialB) {
        var cmats = this.contactMaterials;
        for (var i = 0, N = cmats.length; i !== N; i++) {
            var cm = cmats[i];
            if ((cm.materialA === materialA && cm.materialB === materialB) || (cm.materialA === materialB && cm.materialB === materialA)) {
                return cm;
            }
        }
        return null;
    };
    /**
     * Removes a constraint. Note that you can't run this method during step.
     *
     * @method removeConstraint
     * @param {Constraint} constraint
     */
    World.prototype.removeConstraint = function (constraint) {
        if (this.stepping) {
            throw new Error('Constraints cannot be removed during step.');
        }
        utils_1.default.arrayRemove(this.constraints, constraint);
    };
    /**
     * Step the physics world forward in time.
     *
     * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument. The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
     *
     * @method step
     * @param {Number} dt                       The fixed time step size to use.
     * @param {Number} [timeSinceLastCalled=0]  The time elapsed since the function was last called.
     * @param {Number} [maxSubSteps=10]         Maximum number of fixed steps to take per function call.
     *
     * @example
     *     // Simple fixed timestepping without interpolation
     *     var fixedTimeStep = 1 / 60;
     *     var world = new World();
     *     var body = new Body({ mass: 1 });
     *     world.addBody(body);
     *
     *     function animate(){
     *         requestAnimationFrame(animate);
     *         world.step(fixedTimeStep);
     *         renderBody(body.position, body.angle);
     *     }
     *
     *     // Start animation loop
     *     requestAnimationFrame(animate);
     *
     * @example
     *     // Fixed timestepping with interpolation
     *     var maxSubSteps = 10;
     *     var lastTimeSeconds;
     *
     *     function animate(time){
     *         requestAnimationFrame(animate);
     *         var timeSeconds = time / 1000;
     *
     *         if(lastTimeSeconds){
     *             var deltaTime = timeSeconds - lastTimeSeconds;
     *             world.step(fixedTimeStep, deltaTime, maxSubSteps);
     *         }
     *
     *         lastTimeSeconds = timeSeconds;
     *
     *         renderBody(body.interpolatedPosition, body.interpolatedAngle);
     *     }
     *
     *     // Start animation loop
     *     requestAnimationFrame(animate);
     *
     * @see http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World
     */
    World.prototype.step = function (dt, timeSinceLastCalled, maxSubSteps) {
        maxSubSteps = maxSubSteps || 10;
        timeSinceLastCalled = timeSinceLastCalled || 0;
        if (timeSinceLastCalled === 0) { // Fixed, simple stepping
            this.internalStep(dt);
            // Increment time
            this.time += dt;
        }
        else {
            this.accumulator += timeSinceLastCalled;
            var substeps = 0;
            while (this.accumulator >= dt && substeps < maxSubSteps) {
                // Do fixed steps to catch up
                this.internalStep(dt);
                this.time += dt;
                this.accumulator -= dt;
                substeps++;
            }
            var t = (this.accumulator % dt) / dt;
            for (var j = 0; j !== this.bodies.length; j++) {
                var b = this.bodies[j];
                vec2_1.default.lerp(b.interpolatedPosition, b.previousPosition, b.position, t);
                b.interpolatedAngle = b.previousAngle + t * (b.angle - b.previousAngle);
            }
        }
    };
    /**
     * Make a fixed step.
     * @method internalStep
     * @param  {number} dt
     * @private
     */
    World.prototype.internalStep = function (dt) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var step_mg = vec2_1.default.create();
        var endOverlaps = [];
        this.stepping = true;
        var Nsprings = this.springs.length, springs = this.springs, bodies = this.bodies, g = this.gravity, solver = this.solver, Nbodies = this.bodies.length, broadphase = this.broadphase, np = this.narrowphase, constraints = this.constraints, mg = step_mg, add = vec2_1.default.add;
        this.overlapKeeper.tick();
        this.lastTimeStep = dt;
        // Update approximate friction gravity.
        if (this.useWorldGravityAsFrictionGravity) {
            var gravityLen = vec2_1.default.length(this.gravity);
            if (!(gravityLen === 0 && this.useFrictionGravityOnZeroGravity)) {
                // Nonzero gravity. Use it.
                this.frictionGravity = gravityLen;
            }
        }
        // Add gravity to bodies
        if (this.applyGravity) {
            for (var i = 0; i !== Nbodies; i++) {
                var b = bodies[i], fi = b.force;
                if (b.type !== body_1.default.DYNAMIC || b.sleepState === body_1.default.SLEEPING) {
                    continue;
                }
                vec2_1.default.scale(mg, g, b.mass * b.gravityScale); // F=m*g
                add(fi, fi, mg);
            }
        }
        // Add spring forces
        if (this.applySpringForces) {
            for (var i = 0; i !== Nsprings; i++) {
                var s = springs[i];
                s.applyForce();
            }
        }
        if (this.applyDamping) {
            for (var i = 0; i !== Nbodies; i++) {
                var b = bodies[i];
                if (b.type === body_1.default.DYNAMIC) {
                    b.applyDamping(dt);
                }
            }
        }
        // Broadphase
        var result = broadphase.getCollisionPairs(this);
        // Remove ignored collision pairs
        var ignoredPairs = this.disabledBodyCollisionPairs;
        for (var i = ignoredPairs.length - 2; i >= 0; i -= 2) {
            for (var j = result.length - 2; j >= 0; j -= 2) {
                if ((ignoredPairs[i] === result[j] && ignoredPairs[i + 1] === result[j + 1]) ||
                    (ignoredPairs[i + 1] === result[j] && ignoredPairs[i] === result[j + 1])) {
                    result.splice(j, 2);
                }
            }
        }
        // Remove constrained pairs with collideConnected == false
        var Nconstraints = constraints.length;
        for (i = 0; i !== Nconstraints; i++) {
            var c = constraints[i];
            if (!c.collideConnected) {
                for (var j = result.length - 2; j >= 0; j -= 2) {
                    if ((c.bodyA === result[j] && c.bodyB === result[j + 1]) ||
                        (c.bodyB === result[j] && c.bodyA === result[j + 1])) {
                        result.splice(j, 2);
                    }
                }
            }
        }
        // postBroadphase event
        postBroadphaseEvent.pairs = result;
        this.emit(postBroadphaseEvent);
        postBroadphaseEvent.pairs = null;
        // Narrowphase
        np.reset();
        var defaultContactMaterial = this.defaultContactMaterial;
        var frictionGravity = this.frictionGravity;
        for (var i = 0, Nresults = result.length; i !== Nresults; i += 2) {
            var bi = result[i], bj = result[i + 1];
            // Loop over all shapes of body i
            for (var k = 0, Nshapesi = bi.shapes.length; k !== Nshapesi; k++) {
                var si = bi.shapes[k], xi = si.position, ai = si.angle;
                // All shapes of body j
                for (var l = 0, Nshapesj = bj.shapes.length; l !== Nshapesj; l++) {
                    var sj = bj.shapes[l], xj = sj.position, aj = sj.angle;
                    var contactMaterial = null;
                    if (si.material && sj.material) {
                        contactMaterial = this.getContactMaterial(si.material, sj.material);
                    }
                    runNarrowphase(this, np, bi, si, xi, ai, bj, sj, xj, aj, contactMaterial !== null && contactMaterial !== void 0 ? contactMaterial : defaultContactMaterial, frictionGravity);
                }
            }
        }
        // Wake up bodies
        for (var i = 0; i !== Nbodies; i++) {
            var body = bodies[i];
            if (body._wakeUpAfterNarrowphase) {
                body.wakeUp();
                body._wakeUpAfterNarrowphase = false;
            }
        }
        // Emit end overlap events
        if (_super.prototype.has.call(this, "endContact")) {
            this.overlapKeeper.getEndOverlaps(endOverlaps);
            var e = endContactEvent;
            var l = endOverlaps.length;
            while (l--) {
                var data = endOverlaps[l];
                e.shapeA = data.shapeA;
                e.shapeB = data.shapeB;
                e.bodyA = data.bodyA;
                e.bodyB = data.bodyB;
                this.emit(e);
            }
            endOverlaps.length = 0;
        }
        preSolveEvent.contactEquations = np.contactEquations;
        preSolveEvent.frictionEquations = np.frictionEquations;
        this.emit(preSolveEvent);
        preSolveEvent.contactEquations = preSolveEvent.frictionEquations = null;
        // update constraint equations
        var Nconstraints = constraints.length;
        for (i = 0; i !== Nconstraints; i++) {
            constraints[i].update();
        }
        if (np.contactEquations.length || np.frictionEquations.length || Nconstraints) {
            // Get all equations
            var equations = [];
            utils_1.default.appendArray(equations, np.contactEquations);
            utils_1.default.appendArray(equations, np.frictionEquations);
            for (i = 0; i !== Nconstraints; i++) {
                utils_1.default.appendArray(equations, constraints[i].equations);
            }
            if (this.islandSplit) {
                // Initialize the UnionFind
                var unionFind = this.unionFind;
                unionFind.resize(this.bodies.length + 1);
                // Update equation index
                for (var i = 0; i < equations.length; i++) {
                    equations[i].index = i;
                }
                // Unite bodies if they are connected by an equation
                for (var i = 0; i < equations.length; i++) {
                    var bodyA = equations[i].bodyA;
                    var bodyB = equations[i].bodyB;
                    if (!bodyA || !bodyB)
                        continue;
                    if (bodyA.type === body_1.default.DYNAMIC && bodyB.type === body_1.default.DYNAMIC) {
                        unionFind.union(bodyA.index, bodyB.index);
                    }
                }
                // Find the body islands
                for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    body.islandId = body.type === body_1.default.DYNAMIC ? unionFind.find(body.index) : -1;
                }
                // Sort equations by island
                equations = equations.sort(sortEquationsByIsland);
                var equationIndex = 0;
                while (equationIndex < equations.length) {
                    var equation = equations[equationIndex++];
                    solver.addEquation(equation);
                    if (!equation.bodyA || !equation.bodyB)
                        continue;
                    var currentIslandId = equation.bodyA.islandId > 0 ? equation.bodyA.islandId : equation.bodyB.islandId;
                    var nextIslandId = -1;
                    var ei = equations[equationIndex];
                    if (ei) {
                        if (ei.bodyA && ei.bodyB)
                            continue;
                        nextIslandId = ((_b = (_a = ei.bodyA) === null || _a === void 0 ? void 0 : _a.islandId) !== null && _b !== void 0 ? _b : 0) > 0 ? (_d = (_c = ei.bodyA) === null || _c === void 0 ? void 0 : _c.islandId) !== null && _d !== void 0 ? _d : 0 : (_f = (_e = ei.bodyB) === null || _e === void 0 ? void 0 : _e.islandId) !== null && _f !== void 0 ? _f : 0;
                    }
                    if (nextIslandId !== currentIslandId || equationIndex === equations.length) {
                        // Solve this island
                        if (this.solveConstraints) {
                            solver.solve(dt, this);
                        }
                        solver.removeAllEquations();
                    }
                }
            }
            else {
                // Solve all as one island
                solver.addEquations(equations);
                if (this.solveConstraints) {
                    solver.solve(dt, this);
                }
                solver.removeAllEquations();
            }
        }
        // Step forward
        for (var i = 0; i !== Nbodies; i++) {
            var body = bodies[i];
            if (body.type === body_1.default.DYNAMIC || body.type === body_1.default.KINEMATIC) {
                body.integrate(dt);
            }
        }
        // Reset force
        for (var i = 0; i !== Nbodies; i++) {
            bodies[i].setZeroForce();
        }
        // Emit impact event
        if (this.emitImpactEvent && this.has('impact')) {
            var ev = impactEvent;
            for (var i = 0; i !== np.contactEquations.length; i++) {
                var eq = np.contactEquations[i];
                if (eq.firstImpact) {
                    ev.bodyA = (_g = eq.bodyA) !== null && _g !== void 0 ? _g : null;
                    ev.bodyB = (_h = eq.bodyB) !== null && _h !== void 0 ? _h : null;
                    ev.shapeA = eq.shapeA;
                    ev.shapeB = eq.shapeB;
                    ev.contactEquation = eq;
                    this.emit(ev);
                }
            }
        }
        // Sleeping update
        if (this.sleepMode === World.BODY_SLEEPING) {
            for (i = 0; i !== Nbodies; i++) {
                bodies[i].sleepTick(this.time, false, dt);
            }
        }
        else if (this.sleepMode === World.ISLAND_SLEEPING && this.islandSplit) {
            // Tell all bodies to sleep tick but dont sleep yet
            for (i = 0; i !== Nbodies; i++) {
                bodies[i].sleepTick(this.time, true, dt);
            }
            // Sleep islands
            var bodiesSortedByIsland = bodies.sort(sortBodiesByIsland);
            var islandEnd = 1;
            for (var islandStart = 0; islandStart < bodiesSortedByIsland.length; islandStart = islandEnd) {
                var islandId = bodiesSortedByIsland[islandStart].islandId;
                // Get islandEnd index
                /* jshint ignore:start */
                for (islandEnd = islandStart + 1; islandEnd < bodiesSortedByIsland.length && bodiesSortedByIsland[islandEnd].islandId === islandId; islandEnd++) { }
                /* jshint ignore:end */
                // Don't check static objects
                if (islandId === -1) {
                    continue;
                }
                var islandShouldSleep = true;
                for (var i = islandStart; i < islandEnd; i++) {
                    if (!bodiesSortedByIsland[i].wantsToSleep) {
                        islandShouldSleep = false;
                        break;
                    }
                }
                if (islandShouldSleep) {
                    for (var i = islandStart; i < islandEnd; i++) {
                        bodiesSortedByIsland[i].sleep();
                    }
                }
            }
        }
        this.stepping = false;
        _super.prototype.emit.call(this, postStepEvent);
    };
    /**
     * Add a spring to the simulation. Note that this operation can't be done during step.
     *
     * @method addSpring
     * @param {Spring} spring
     */
    World.prototype.addSpring = function (spring) {
        if (this.stepping) {
            throw new Error('Springs cannot be added during step.');
        }
        this.springs.push(spring);
        addSpringEvent.spring = spring;
        this.emit(addSpringEvent);
        addSpringEvent.spring = null;
    };
    /**
     * Remove a spring. Note that this operation can't be done during step.
     *
     * @method removeSpring
     * @param {Spring} spring
     */
    World.prototype.removeSpring = function (spring) {
        if (this.stepping) {
            throw new Error('Springs cannot be removed during step.');
        }
        utils_1.default.arrayRemove(this.springs, spring);
    };
    /**
     * Add a body to the simulation. Note that you can't add a body during step: you have to wait until after the step (see the postStep event).
     * Also note that bodies can only be added to one World at a time.
     *
     * @method addBody
     * @param {Body} body
     *
     * @example
     *     var world = new World(),
     *         body = new Body();
     *     world.addBody(body);
     */
    World.prototype.addBody = function (body) {
        if (this.stepping) {
            throw new Error('Bodies cannot be added during step.');
        }
        // Already added?
        if (body.world) {
            throw new Error('Body is already added to a World.');
        }
        body.index = this.bodies.length;
        this.bodies.push(body);
        body.world = this;
        addBodyEvent.body = body;
        this.emit(addBodyEvent);
        addBodyEvent.body = null;
    };
    /**
     * Remove a body from the simulation. Note that bodies cannot be removed during step (for example, inside the beginContact event). In that case you need to wait until the step is done (see the postStep event).
     *
     * Also note that any constraints connected to the body must be removed before the body.
     *
     * @method removeBody
     * @param {Body} body
     *
     * @example
     *     var removeBody;
     *     world.on("beginContact",function(event){
     *         // We cannot remove the body here since the world is still stepping.
     *         // Instead, schedule the body to be removed after the step is done.
     *         removeBody = body;
     *     });
     *     world.on("postStep",function(event){
     *         if(removeBody){
     *             // Safely remove the body from the world.
     *             world.removeBody(removeBody);
     *             removeBody = null;
     *         }
     *     });
     */
    World.prototype.removeBody = function (body) {
        if (this.stepping) {
            throw new Error('Bodies cannot be removed during step.');
        }
        // TODO: would it be smart to have a .constraints array on the body?
        var constraints = this.constraints;
        var l = constraints.length;
        while (l--) {
            if (constraints[l].bodyA === body || constraints[l].bodyB === body) {
                throw new Error('Cannot remove Body from World: it still has constraints connected to it.');
            }
        }
        body.world = null;
        var bodies = this.bodies;
        utils_1.default.arrayRemove(bodies, body);
        body.index = -1;
        var l = bodies.length;
        while (l--) {
            bodies[l].index = l;
        }
        // Emit removeBody event
        removeBodyEvent.body = body;
        body.resetConstraintVelocity();
        this.emit(removeBodyEvent);
        removeBodyEvent.body = null;
        // Remove disabled body collision pairs that involve body
        var pairs = this.disabledBodyCollisionPairs;
        var i = 0;
        while (i < pairs.length) {
            if (pairs[i] === body || pairs[i + 1] === body) {
                pairs.splice(i, 2);
            }
            else {
                i += 2;
            }
        }
    };
    /**
     * Get a body by its id.
     * @method getBodyById
     * @param {number} id
     * @return {Body} The body, or false if it was not found.
     */
    World.prototype.getBodyById = function (id) {
        var bodies = this.bodies;
        for (var i = 0; i < bodies.length; i++) {
            var b = bodies[i];
            if (b.id === id) {
                return b;
            }
        }
        return null;
    };
    /**
     * Disable collision between two bodies
     * @method disableBodyCollision
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    World.prototype.disableBodyCollision = function (bodyA, bodyB) {
        this.disabledBodyCollisionPairs.push(bodyA);
        this.disabledBodyCollisionPairs.push(bodyB);
    };
    /**
     * Enable collisions between the given two bodies, if they were previously disabled using .disableBodyCollision().
     * @method enableBodyCollision
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    World.prototype.enableBodyCollision = function (bodyA, bodyB) {
        var pairs = this.disabledBodyCollisionPairs;
        for (var i = 0; i < pairs.length; i += 2) {
            if ((pairs[i] === bodyA && pairs[i + 1] === bodyB) || (pairs[i + 1] === bodyA && pairs[i] === bodyB)) {
                pairs.splice(i, 2);
                return;
            }
        }
    };
    /**
     * Removes all bodies, constraints, springs, and contact materials from the world.
     * @method clear
     */
    World.prototype.clear = function () {
        // Remove all solver equations
        this.solver.removeAllEquations();
        // Remove all constraints
        var cs = this.constraints;
        var i = cs.length;
        while (i--) {
            this.removeConstraint(cs[i]);
        }
        // Remove all bodies
        var bodies = this.bodies;
        i = bodies.length;
        while (i--) {
            this.removeBody(bodies[i]);
        }
        // Remove all springs
        var springs = this.springs;
        i = springs.length;
        while (i--) {
            this.removeSpring(springs[i]);
        }
        // Remove all contact materials
        var cms = this.contactMaterials;
        i = cms.length;
        while (i--) {
            this.removeContactMaterial(cms[i]);
        }
    };
    /**
     * Test if a world point overlaps bodies
     * @method hitTest
     * @param  {Array} worldPoint Point to use for intersection tests
     * @param  {Array} bodies A list of objects to check for intersection
     * @param  {Number} precision Used for matching against particles and lines. Adds some margin to these infinitesimal objects.
     * @return {Array} Array of bodies that overlap the point
     * @todo Should use an api similar to the raycast function
     * @todo Should probably implement a .containsPoint method for all shapes. Would be more efficient
     * @todo Should use the broadphase
     * @todo Returning the hit shape would be fine - it carries a reference to the body now
     */
    World.prototype.hitTest = function (worldPoint, bodies, precision) {
        precision = precision || 0;
        // Create a dummy particle body with a particle shape to test against the bodies
        var shapeWorldPosition = hitTest_tmp1, shapeLocalPoint = hitTest_tmp2;
        var result = [];
        // Check bodies
        for (var i = 0, N = bodies.length; i !== N; i++) {
            var body = bodies[i];
            for (var j = 0, NS = body.shapes.length; j !== NS; j++) {
                var shape = body.shapes[j];
                // Get local point position in the shape
                shape.worldPointToLocal(shapeLocalPoint, worldPoint);
                if (shape.pointTest(shapeLocalPoint)) {
                    result.push(body);
                }
                else {
                    // Get shape world position
                    vec2_1.default.rotate(shapeWorldPosition, shape.position, body.angle);
                    vec2_1.default.add(shapeWorldPosition, shapeWorldPosition, body.position);
                    if (shape.type === shape_1.default.PARTICLE && vec2_1.default.squaredDistance(shapeWorldPosition, worldPoint) < precision * precision) {
                        result.push(body);
                    }
                }
            }
        }
        return result;
    };
    /**
     * Set the stiffness for all equations and contact materials.
     * @method setGlobalStiffness
     * @param {Number} stiffness
     */
    World.prototype.setGlobalStiffness = function (stiffness) {
        setGlobalEquationParams(this, { stiffness: stiffness });
        // Set for all contact materials
        var contactMaterials = this.contactMaterials;
        for (var i = 0; i !== contactMaterials.length; i++) {
            var c = contactMaterials[i];
            c.stiffness = c.frictionStiffness = stiffness;
        }
        // Set for default contact material
        var c = this.defaultContactMaterial;
        c.stiffness = c.frictionStiffness = stiffness;
    };
    /**
     * Set the relaxation for all equations and contact materials.
     * @method setGlobalRelaxation
     * @param {Number} relaxation
     */
    World.prototype.setGlobalRelaxation = function (relaxation) {
        setGlobalEquationParams(this, { relaxation: relaxation });
        // Set for all contact materials
        for (var i = 0; i !== this.contactMaterials.length; i++) {
            var c = this.contactMaterials[i];
            c.relaxation = c.frictionRelaxation = relaxation;
        }
        // Set for default contact material
        var c = this.defaultContactMaterial;
        c.relaxation = c.frictionRelaxation = relaxation;
    };
    /**
     * Ray cast against all bodies in the world.
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @return {boolean} True if any body was hit.
     *
     * @example
     *     var ray = new Ray({
     *         mode: Ray.CLOSEST, // or ANY
     *         from: [0, 0],
     *         to: [10, 0],
     *     });
     *     var result = new RaycastResult();
     *     world.raycast(result, ray);
     *
     *     // Get the hit point
     *     var hitPoint = vec2.create();
     *     result.getHitPoint(hitPoint, ray);
     *     console.log('Hit point: ', hitPoint[0], hitPoint[1], ' at distance ' + result.getHitDistance(ray));
     *
     * @example
     *     var ray = new Ray({
     *         mode: Ray.ALL,
     *         from: [0, 0],
     *         to: [10, 0],
     *         callback: function(result){
     *
     *             // Print some info about the hit
     *             console.log('Hit body and shape: ', result.body, result.shape);
     *
     *             // Get the hit point
     *             var hitPoint = vec2.create();
     *             result.getHitPoint(hitPoint, ray);
     *             console.log('Hit point: ', hitPoint[0], hitPoint[1], ' at distance ' + result.getHitDistance(ray));
     *
     *             // If you are happy with the hits you got this far, you can stop the traversal here:
     *             result.stop();
     *         }
     *     });
     *     var result = new RaycastResult();
     *     world.raycast(result, ray);
     */
    World.prototype.raycast = function (result, ray) {
        var tmpAABB = new aabb_1.default();
        var tmpArray = [];
        // Get all bodies within the ray AABB
        ray.getAABB(tmpAABB);
        this.broadphase.aabbQuery(this, tmpAABB, tmpArray);
        ray.intersectBodies(result, tmpArray);
        tmpArray.length = 0;
        return result.hasHit();
    };
    /**
     * Never deactivate bodies.
     * @static
     * @property {number} NO_SLEEPING
     */
    World.NO_SLEEPING = 1;
    /**
     * Deactivate individual bodies if they are sleepy.
     * @static
     * @property {number} BODY_SLEEPING
     */
    World.BODY_SLEEPING = 2;
    /**
     * Deactivates bodies that are in contact, if all of them are sleepy. Note that you must enable {{#crossLink "World/islandSplit:property"}}.islandSplit{{/crossLink}} for this to work.
     * @static
     * @property {number} ISLAND_SLEEPING
     */
    World.ISLAND_SLEEPING = 4;
    return World;
}(event_emitter_1.default));
exports.default = World;

},{"../collision/aabb":1,"../collision/narrowphase":4,"../collision/sap-broadphase":7,"../events/event-emitter":21,"../material/contact-material":24,"../material/material":25,"../math/vec2":28,"../objects/body":30,"../shapes/shape":46,"../solver/gs-solver":47,"../utils/overlap-keeper":53,"../utils/utils":56,"./union-find":57}]},{},[22])
(22)
});