// //type i16=number; type i32=number;type i64=number;type u16=number; type u32=number;type u64=number;type f32=number;

// import vec2 from "../math/vec2";
// import Body from "../objects/body";
// import Constraint from "./constraint";
// import ContactEquation from "../equations/contact-equation";
// import Equation from "../equations/Equation";
// import RotationalLockEquation from "../equations/rotational-lock-equation";

// var worldAxisA = vec2.create(),
// worldAnchorA = vec2.create(),
// worldAnchorB = vec2.create(),
// orientedAnchorA = vec2.create(),
// orientedAnchorB = vec2.create(),
// tmp = vec2.create();

// export default class PrismaticConstraint extends Constraint{
// 	/**
// 	 * @property localAnchorA
// 	 * @type {Array}
// 	 */
// 	localAnchorA: Float32Array;
// 	/**
// 	 * @property localAnchorB
// 	 * @type {Array}
// 	 */
// 	localAnchorB: Float32Array;
// 	/**
// 	 * @property localAxisA
// 	 * @type {Array}
// 	 */
// 	localAxisA: Float32Array;
// 	maxForce: f32;
// 	position: number;
// 	velocity: number;
// 	lowerLimitEnabled: boolean;
// 	upperLimitEnabled: boolean;
// 	lowerLimit: any;
// 	upperLimit: any;
// 	upperLimitEquation: any;
// 	lowerLimitEquation: any;
// 	motorEquation: any;
// 	motorEnabled: boolean;
// 	motorSpeed: number;

// 	/**
// 	 * Constraint that only allows bodies to move along a line, relative to each other. See <a href="http://www.iforce2d.net/b2dtut/joints-prismatic">this tutorial</a>. Also called "slider constraint".
// 	 *
// 	 * @class PrismaticConstraint
// 	 * @constructor
// 	 * @extends Constraint
// 	 * @author schteppe
// 	 * @param {Body} bodyA
// 	 * @param {Body} bodyB
// 	 * @param {Object} [options]
// 	 * @param {Number} [options.maxForce] Max force to be applied by the constraint
// 	 * @param {Array} [options.localAnchorA] Body A's anchor point, defined in its own local frame.
// 	 * @param {Array} [options.localAnchorB] Body B's anchor point, defined in its own local frame.
// 	 * @param {Array} [options.localAxisA] An axis, defined in body A frame, that body B's anchor point may slide along.
// 	 * @param {boolean} [options.disableRotationalLock] If set to true, bodyB will be free to rotate around its anchor point.
// 	 * @param {Number} [options.upperLimit]
// 	 * @param {Number} [options.lowerLimit]
// 	 * @todo Ability to create using only a point and a worldAxis
// 	 * @example
// 	 *     var constraint = new PrismaticConstraint(bodyA, bodyB, {
// 	 *         localAxisA: [0, 1]
// 	 *     });
// 	 *     world.addConstraint(constraint);
// 	 */
// 	constructor(bodyA: Body, bodyB: Body, options ?: {
// 		localAnchorA?: Float32Array,
// 		localAxisA?: Float32Array, 
// 		localAnchorB?: Float32Array,
// 		maxForce?: f32,
// 		disableRotationalLock: boolean,
// 		lowerLimit?: f32,
// 		upperLimit?: f32,

// 		collideConnected?: boolean,
// 		wakeUpBodies?: boolean
// 	}){
// 		super(bodyA,bodyB,Constraint.PRISMATIC,options);

// 		// Get anchors
// 		var localAnchorA = vec2.create(),
// 			localAxisA = vec2.fromValues(1,0),
// 			localAnchorB = vec2.create();
// 		if(options?.localAnchorA){ vec2.copy(localAnchorA, options.localAnchorA); }
// 		if(options?.localAxisA){ vec2.copy(localAxisA,   options.localAxisA); }
// 		if(options?.localAnchorB){ vec2.copy(localAnchorB, options.localAnchorB); }

// 		this.localAnchorA = localAnchorA;
// 		this.localAnchorB = localAnchorB;
// 		this.localAxisA = localAxisA;

// 		/*

// 		The constraint violation for the common axis point is

// 			g = ( xj + rj - xi - ri ) * t   :=  gg*t

// 		where r are body-local anchor points, and t is a tangent to the constraint axis defined in body i frame.

// 			gdot =  ( vj + wj x rj - vi - wi x ri ) * t + ( xj + rj - xi - ri ) * ( wi x t )

// 		Note the use of the chain rule. Now we identify the jacobian

// 			G*W = [ -t      -ri x t + t x gg     t    rj x t ] * [vi wi vj wj]

// 		The rotational part is just a rotation lock.

// 		*/

// 		var maxForce = this.maxForce = options?.maxForce ?? Infinity;

// 		// Translational part
// 		var trans = new Equation(bodyA,bodyB,-maxForce,maxForce);
// 		var ri = vec2.create(),
// 			rj = vec2.create(),
// 			gg = vec2.create(),
// 			t =  vec2.create();

// 		// TODO: This is a bad practice.
// 		trans.computeGq = function(){
// 			// g = ( xj + rj - xi - ri ) * t
// 			return vec2.dot(gg,t);
// 		};

// 		// TODO: This is a bad practice.
// 		trans.updateJacobian = function(): void{
// 			var G = this.G,
// 				xi = bodyA.position,
// 				xj = bodyB.position;
// 			vec2.rotate(ri,localAnchorA,bodyA.angle);
// 			vec2.rotate(rj,localAnchorB,bodyB.angle);
// 			vec2.add(gg,xj,rj);
// 			vec2.subtract(gg,gg,xi);
// 			vec2.subtract(gg,gg,ri);
// 			vec2.rotate(t,localAxisA,bodyA.angle+Math.PI/2);

// 			G[0] = -t[0];
// 			G[1] = -t[1];
// 			G[2] = -vec2.crossLength(ri,t) + vec2.crossLength(t,gg);
// 			G[3] = t[0];
// 			G[4] = t[1];
// 			G[5] = vec2.crossLength(rj,t);
// 		};
// 		this.equations.push(trans);

// 		// Rotational part
// 		if(!options?.disableRotationalLock){
// 			var rot = new RotationalLockEquation(bodyA,bodyB);
// 			this.equations.push(rot);
// 		}

// 		/**
// 		 * The position of anchor A relative to anchor B, along the constraint axis.
// 		 * @property position
// 		 * @type {Number}
// 		 */
// 		this.position = 0;

// 		// Is this one used at all?
// 		this.velocity = 0;

// 		/**
// 		 * Set to true to enable lower limit.
// 		 * @property lowerLimitEnabled
// 		 * @type {boolean}
// 		 */
// 		this.lowerLimitEnabled = options?.lowerLimit !== undefined ? true : false;

// 		/**
// 		 * Set to true to enable upper limit.
// 		 * @property upperLimitEnabled
// 		 * @type {boolean}
// 		 */
// 		this.upperLimitEnabled = options?.upperLimit !== undefined ? true : false;

// 		/**
// 		 * Lower constraint limit. The constraint position is forced to be larger than this value.
// 		 * @property lowerLimit
// 		 * @type {Number}
// 		 */
// 		this.lowerLimit = options?.lowerLimit ?? 0;

// 		/**
// 		 * Upper constraint limit. The constraint position is forced to be smaller than this value.
// 		 * @property upperLimit
// 		 * @type {Number}
// 		 */
// 		this.upperLimit = options?.upperLimit ?? 1;

// 		// Equations used for limits
// 		this.upperLimitEquation = new ContactEquation(bodyA,bodyB);
// 		this.lowerLimitEquation = new ContactEquation(bodyA,bodyB);

// 		// Set max/min forces
// 		this.upperLimitEquation.minForce = this.lowerLimitEquation.minForce = 0;
// 		this.upperLimitEquation.maxForce = this.lowerLimitEquation.maxForce = maxForce;

// 		/**
// 		 * Equation used for the motor.
// 		 * @property motorEquation
// 		 * @type {Equation}
// 		 */
// 		this.motorEquation = new Equation(bodyA,bodyB, null, null);

// 		/**
// 		 * The current motor state. Enable or disable the motor using .enableMotor
// 		 * @property motorEnabled
// 		 * @type {boolean}
// 		 */
// 		this.motorEnabled = false;

// 		/**
// 		 * Set the target speed for the motor.
// 		 * @property motorSpeed
// 		 * @type {Number}
// 		 */
// 		this.motorSpeed = 0;

// 		var that = this;
// 		var motorEquation = this.motorEquation;
// 		motorEquation.computeGq = function(): f32{ return 0; };
// 		motorEquation.computeGW = function(): f32{
// 			var G = this.G,
// 				bi = this.bodyA,
// 				bj = this.bodyB,
// 				vi = bi.velocity,
// 				vj = bj.velocity,
// 				wi = bi.angularVelocity,
// 				wj = bj.angularVelocity;
// 			return this.gmult(G,vi,wi,vj,wj) + that.motorSpeed;
// 		};
// 	}

// 	/**
// 	 * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
// 	 * @method update
// 	 */
// 	update(): void{
// 		var eqs = this.equations,
// 			trans = eqs[0],
// 			upperLimit = this.upperLimit,
// 			lowerLimit = this.lowerLimit,
// 			upperLimitEquation = this.upperLimitEquation,
// 			lowerLimitEquation = this.lowerLimitEquation,
// 			bodyA = this.bodyA,
// 			bodyB = this.bodyB,
// 			localAxisA = this.localAxisA,
// 			localAnchorA = this.localAnchorA,
// 			localAnchorB = this.localAnchorB;

// 		trans.updateJacobian();

// 		// Transform local things to world
// 		vec2.rotate(worldAxisA,      localAxisA,      bodyA.angle);
// 		vec2.rotate(orientedAnchorA, localAnchorA,    bodyA.angle);
// 		vec2.add(worldAnchorA,       orientedAnchorA, bodyA.position);
// 		vec2.rotate(orientedAnchorB, localAnchorB,    bodyB.angle);
// 		vec2.add(worldAnchorB,       orientedAnchorB, bodyB.position);

// 		var relPosition = this.position = vec2.dot(worldAnchorB,worldAxisA) - vec2.dot(worldAnchorA,worldAxisA);

// 		// Motor
// 		if(this.motorEnabled){
// 			// G = [ a     a x ri   -a   -a x rj ]
// 			var G = this.motorEquation.G;
// 			G[0] = worldAxisA[0];
// 			G[1] = worldAxisA[1];
// 			G[2] = vec2.crossLength(worldAxisA,orientedAnchorB);
// 			G[3] = -worldAxisA[0];
// 			G[4] = -worldAxisA[1];
// 			G[5] = -vec2.crossLength(worldAxisA,orientedAnchorA);
// 		}

// 		/*
// 			Limits strategy:
// 			Add contact equation, with normal along the constraint axis.
// 			min/maxForce is set so the constraint is repulsive in the correct direction.
// 			Some offset is added to either equation.contactPointA or .contactPointB to get the correct upper/lower limit.

// 					^
// 					|
// 		upperLimit x
// 					|    ------
// 			anchorB x<---|  B |
// 					|    |    |
// 			------   |    ------
// 			|    |   |
// 			|  A |-->x anchorA
// 			------   |
// 					x lowerLimit
// 					|
// 					axis
// 		*/


// 		if(this.upperLimitEnabled && relPosition > upperLimit){
// 			// Update contact constraint normal, etc
// 			vec2.scale(upperLimitEquation.normalA, worldAxisA, -1);
// 			vec2.subtract(upperLimitEquation.contactPointA, worldAnchorA, bodyA.position);
// 			vec2.subtract(upperLimitEquation.contactPointB, worldAnchorB, bodyB.position);
// 			vec2.scale(tmp,worldAxisA,upperLimit);
// 			vec2.add(upperLimitEquation.contactPointA,upperLimitEquation.contactPointA,tmp);
// 			if(eqs.indexOf(upperLimitEquation) === -1){
// 				eqs.push(upperLimitEquation);
// 			}
// 		} else {
// 			var idx = eqs.indexOf(upperLimitEquation);
// 			if(idx !== -1){
// 				eqs.splice(idx,1);
// 			}
// 		}

// 		if(this.lowerLimitEnabled && relPosition < lowerLimit){
// 			// Update contact constraint normal, etc
// 			vec2.scale(lowerLimitEquation.normalA, worldAxisA, 1);
// 			vec2.subtract(lowerLimitEquation.contactPointA, worldAnchorA, bodyA.position);
// 			vec2.subtract(lowerLimitEquation.contactPointB, worldAnchorB, bodyB.position);
// 			vec2.scale(tmp,worldAxisA,lowerLimit);
// 			vec2.subtract(lowerLimitEquation.contactPointB,lowerLimitEquation.contactPointB,tmp);
// 			if(eqs.indexOf(lowerLimitEquation) === -1){
// 				eqs.push(lowerLimitEquation);
// 			}
// 		} else {
// 			var idx = eqs.indexOf(lowerLimitEquation);
// 			if(idx !== -1){
// 				eqs.splice(idx,1);
// 			}
// 		}
// 	}

// 	/**
// 	 * Enable the motor
// 	 * @method enableMotor
// 	 */
// 	enableMotor(): void{
// 		if(this.motorEnabled){
// 			return;
// 		}
// 		this.equations.push(this.motorEquation);
// 		this.motorEnabled = true;
// 	}

// 	/**
// 	 * Disable the rotational motor
// 	 * @method disableMotor
// 	 */
// 	disableMotor(): void{
// 		if(!this.motorEnabled){
// 			return;
// 		}
// 		var i = this.equations.indexOf(this.motorEquation);
// 		this.equations.splice(i,1);
// 		this.motorEnabled = false;
// 	}

// 	/**
// 	 * Set the constraint limits.
// 	 * @method setLimits
// 	 * @param {number} lower Lower limit.
// 	 * @param {number} upper Upper limit.
// 	 */
// 	setLimits (lower: f32, upper: f32) : void{
// 		if(typeof(lower) === 'number'){
// 			this.lowerLimit = lower;
// 			this.lowerLimitEnabled = true;
// 		} else {
// 			this.lowerLimit = lower;
// 			this.lowerLimitEnabled = false;
// 		}

// 		if(typeof(upper) === 'number'){
// 			this.upperLimit = upper;
// 			this.upperLimitEnabled = true;
// 		} else {
// 			this.upperLimit = upper;
// 			this.upperLimitEnabled = false;
// 		}
// 	}

// }