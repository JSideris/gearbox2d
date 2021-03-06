type i16=number; type i32=number;type i64=number;type u16=number; type u32=number;type u64=number;type f32=number;

import vec2 from "../math/vec2";
import Body from "./body";
import Spring from "./spring";

var applyForce_r =              vec2.create(),
	applyForce_r_unit =         vec2.create(),
	applyForce_u =              vec2.create(),
	applyForce_f =              vec2.create(),
	applyForce_worldAnchorA =   vec2.create(),
	applyForce_worldAnchorB =   vec2.create(),
	applyForce_ri =             vec2.create(),
	applyForce_rj =             vec2.create(),
	applyForce_tmp =            vec2.create();

export default class LinearSpring extends Spring{
	/**
	 * Anchor for bodyA in local bodyA coordinates.
	 * @property localAnchorA
	 * @type {Array}
	 */
	localAnchorA: Float32Array;
	/**
	 * Anchor for bodyB in local bodyB coordinates.
	 * @property localAnchorB
	 * @type {Array}
	 */
	localAnchorB: Float32Array;
	/**
	 * Rest length of the spring. Can be set dynamically.
	 * @property restLength
	 * @type {number}
	 */
	restLength: f32;

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
	constructor(bodyA: Body,bodyB: Body,options?:{
		localAnchorA?: Float32Array,
		localAnchorB?: Float32Array,
		worldAnchorA?: Float32Array,
		worldAnchorB?: Float32Array,
		restLength?: f32,

		stiffness?: f32,
		damping?: f32
	}){

		super(bodyA, bodyB, options);

		this.localAnchorA = vec2.create();
		this.localAnchorB = vec2.create();

		if(options?.localAnchorA){ vec2.copy(this.localAnchorA, options.localAnchorA); }
		if(options?.localAnchorB){ vec2.copy(this.localAnchorB, options.localAnchorB); }
		if(options?.worldAnchorA){ this.setWorldAnchorA(options.worldAnchorA); }
		if(options?.worldAnchorB){ this.setWorldAnchorB(options.worldAnchorB); }

		var worldAnchorA = vec2.create();
		var worldAnchorB = vec2.create();
		this.getWorldAnchorA(worldAnchorA);
		this.getWorldAnchorB(worldAnchorB);
		var worldDistance = vec2.distance(worldAnchorA, worldAnchorB);

		this.restLength = options?.restLength ?? worldDistance;
	}

	/**
	 * Set the anchor point on body A, using world coordinates.
	 * @method setWorldAnchorA
	 * @param {Array} worldAnchorA
	 */
	setWorldAnchorA(worldAnchorA: Float32Array){
		this.bodyA.toLocalFrame(this.localAnchorA, worldAnchorA);
	}

	/**
	 * Set the anchor point on body B, using world coordinates.
	 * @method setWorldAnchorB
	 * @param {Array} worldAnchorB
	 */
	setWorldAnchorB(worldAnchorB: Float32Array){
		this.bodyB.toLocalFrame(this.localAnchorB, worldAnchorB);
	}

	/**
	 * Get the anchor point on body A, in world coordinates.
	 * @method getWorldAnchorA
	 * @param {Array} result The vector to store the result in.
	 */
	getWorldAnchorA(result: Float32Array){
		this.bodyA.toWorldFrame(result, this.localAnchorA);
	}

	/**
	 * Get the anchor point on body B, in world coordinates.
	 * @method getWorldAnchorB
	 * @param {Array} result The vector to store the result in.
	 */
	getWorldAnchorB(result: Float32Array){
		this.bodyB.toWorldFrame(result, this.localAnchorB);
	}

	/**
	 * Apply the spring force to the connected bodies.
	 * @private
	 * @method applyForce
	 */
	applyForce(){
		var k = this.stiffness,
			d = this.damping,
			l = this.restLength,
			bodyA = this.bodyA,
			bodyB = this.bodyB,
			r = applyForce_r,
			r_unit = applyForce_r_unit,
			u = applyForce_u,
			f = applyForce_f,
			tmp = applyForce_tmp;

		var worldAnchorA = applyForce_worldAnchorA,
			worldAnchorB = applyForce_worldAnchorB,
			ri = applyForce_ri,
			rj = applyForce_rj;

		// Get world anchors
		this.getWorldAnchorA(worldAnchorA);
		this.getWorldAnchorB(worldAnchorB);

		// Get offset points
		vec2.subtract(ri, worldAnchorA, bodyA.position);
		vec2.subtract(rj, worldAnchorB, bodyB.position);

		// Compute distance vector between world anchor points
		vec2.subtract(r, worldAnchorB, worldAnchorA);
		var rlen = vec2.length(r);
		vec2.normalize(r_unit,r);

		// Compute relative velocity of the anchor points, u
		vec2.subtract(u, bodyB.velocity, bodyA.velocity);
		vec2.crossZV(tmp, bodyB.angularVelocity, rj);
		vec2.add(u, u, tmp);
		vec2.crossZV(tmp, bodyA.angularVelocity, ri);
		vec2.subtract(u, u, tmp);

		// F = - k * ( x - L ) - D * ( u )
		vec2.scale(f, r_unit, -k*(rlen-l) - d*vec2.dot(u,r_unit));

		// Add forces to bodies
		vec2.subtract( bodyA.force, bodyA.force, f);
		vec2.add( bodyB.force, bodyB.force, f);

		// Angular force
		var ri_x_f = vec2.crossLength(ri, f);
		var rj_x_f = vec2.crossLength(rj, f);
		bodyA.angularForce -= ri_x_f;
		bodyB.angularForce += rj_x_f;
	}
}