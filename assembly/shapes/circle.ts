//type i16=number; type i32=number;type i64=number;type u16=number; type u32=number;type u64=number;type f32=number;

// var Shape = require('./Shape')
// ,    vec2 = require('../math/vec2')
// ,    shallowClone = require('../utils/Utils').shallowClone;

import Shape from "./shape";
import { ShapeOptions } from "./shape";
import AABB from "../collision/aabb";
import RaycastResult from "../collision/raycast-result";
import Ray from "../collision/ray";
import vec2 from "../math/vec2";

var Ray_intersectSphere_intersectionPoint = vec2.create();
var Ray_intersectSphere_normal = vec2.create();

export class CircleOptions extends ShapeOptions{
	radius: f32 = 1
}

export default class Circle extends Shape{
	radius: f32 = 1;

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
	constructor(options:CircleOptions|null){
		super(Shape.CIRCLE, options); // Just make sure this has the radius in it (if required).

		if(options)
			this.radius = options.radius;

	}

	/**
	 * @method computeMomentOfInertia
	 * @return {Number}
	 */
	computeMomentOfInertia(): f32{
		var r = this.radius;
		return r * r / 2;
	}

	/**
	 * @method updateBoundingRadius
	 * @return {Number}
	 */
	updateBoundingRadius(): f32{
		this.boundingRadius = this.radius;
		return this.boundingRadius;
	}

	/**
	 * @method updateArea
	 * @return {Number}
	 */
	updateArea(): f32{
		this.area = Mathf.PI * this.radius * this.radius;
		return this.area;
	}

	/**
	 * @method computeAABB
	 * @param  {AABB}   out      The resulting AABB.
	 * @param  {Array}  position
	 * @param  {Number} angle
	 */
	computeAABB(out: AABB, position: Float32Array, angle: f32): void{
		var r = this.radius;
		vec2.set(out.upperBound,  r,  r);
		vec2.set(out.lowerBound, -r, -r);
		if(position){
			vec2.add(out.lowerBound, out.lowerBound, position);
			vec2.add(out.upperBound, out.upperBound, position);
		}
	}


	/**
	 * @method raycast
	 * @param  {RaycastResult} result
	 * @param  {Ray} ray
	 * @param  {array} position
	 * @param  {number} angle
	 */
	raycast(result: RaycastResult, ray: Ray, position: Float32Array, angle: f32): void{
		let from: Float32Array = ray.from,
			to: Float32Array = ray.to,
			r: f32 = this.radius;

		let a: f32 = Mathf.pow(to[0] - from[0], 2) + Mathf.pow(to[1] - from[1], 2);
		let b: f32 = 2 * ((to[0] - from[0]) * (from[0] - position[0]) + (to[1] - from[1]) * (from[1] - position[1]));
		let c: f32 = Mathf.pow(from[0] - position[0], 2) + Mathf.pow(from[1] - position[1], 2) - Mathf.pow(r, 2);
		let delta: f32 = Mathf.pow(b, 2) - 4 * a * c;

		let intersectionPoint: Float32Array = Ray_intersectSphere_intersectionPoint;
		let normal: Float32Array = Ray_intersectSphere_normal;

		if(delta < 0){
			// No intersection
			return;

		} else if(delta === 0){
			// single intersection point
			vec2.lerp(intersectionPoint, from, to, delta);

			vec2.subtract(normal, intersectionPoint, position);
			vec2.normalize(normal,normal);

			ray.reportIntersection(result, delta, normal, -1);

		} else {
			let sqrtDelta: f32 = Mathf.sqrt(delta);
			let inv2a: f32 = 1.0 / (2.0 * a);
			let d1: f32 = (- b - sqrtDelta) * inv2a;
			let d2: f32 = (- b + sqrtDelta) * inv2a;

			if(d1 >= 0 && d1 <= 1){
				vec2.lerp(intersectionPoint, from, to, d1);

				vec2.subtract(normal, intersectionPoint, position);
				vec2.normalize(normal,normal);

				ray.reportIntersection(result, d1, normal, -1);

				if(result.shouldStop(ray)){
					return;
				}
			}

			if(d2 >= 0 && d2 <= 1){
				vec2.lerp(intersectionPoint, from, to, d2);

				vec2.subtract(normal, intersectionPoint, position);
				vec2.normalize(normal,normal);

				ray.reportIntersection(result, d2, normal, -1);
			}
		}
	}

	pointTest(localPoint: Float32Array): boolean{
		var radius = this.radius;
		return vec2.squaredLength(localPoint) <= radius * radius;
	}
}