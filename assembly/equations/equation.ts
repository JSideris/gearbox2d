//type i16=number; type i32=number;type i64=number;type u16=number; type u32=number;type u64=number;type f32=number;

import Body from "../objects/body";
import vec2 from "../math/vec2";
import Utils from "../utils/utils";

export default class Equation{

	/**
	 * Minimum force to apply when solving.
	 * @property minForce
	 * @type {Number}
	 */
	public minForce: f32;

	/**
	 * Max force to apply when solving.
	 * @property maxForce
	 * @type {Number}
	 */
	public maxForce: f32;

	/**
	 * Cap the constraint violation (G*q) to this value.
	 * @property maxBias
	 * @type {Number}
	 */
	public maxBias: f32 = Infinity;

	/**
	 * First body participating in the constraint
	 * @property bodyA
	 * @type {Body}
	 */
	public bodyA: Body|null;

	/**
	 * Second body participating in the constraint
	 * @property bodyB
	 * @type {Body}
	 */
	public bodyB: Body|null;

	/**
	 * The stiffness of this equation. Typically chosen to a large number (~1e7), but can be chosen somewhat freely to get a stable simulation.
	 * @property stiffness
	 * @type {Number}
	 */
	public stiffness: f32 = Equation.DEFAULT_STIFFNESS;

	/**
	 * The number of time steps needed to stabilize the constraint equation. Typically between 3 and 5 time steps.
	 * @property relaxation
	 * @type {Number}
	 */
	public relaxation: f32 = Equation.DEFAULT_RELAXATION;

	/**
	 * The Jacobian entry of this equation. 6 numbers, 3 per body (x,y,angle).
	 * @property G
	 * @type {Array}
	 */
	public G: Float32Array;

	public offset: f32 = 0;

	public a: f32 = 0;
	public b: f32 = 0;
	public epsilon: f32 = 0;
	public timeStep: f32 = 1/60;

	/**
	 * Indicates if stiffness or relaxation was changed.
	 * @property {boolean} needsUpdate
	 */
	public needsUpdate: boolean = true;

	/**
	 * The resulting constraint multiplier from the last solve. This is mostly equivalent to the force produced by the constraint.
	 * @property multiplier
	 * @type {Number}
	 */
	public multiplier: f32 = 0;

	/**
	 * Relative velocity.
	 * @property {Number} relativeVelocity
	 */
	public relativeVelocity: f32 = 0;

	/**
	 * Whether this equation is enabled or not. If true, it will be added to the solver.
	 * @property {boolean} enabled
	 */
	public enabled: boolean = true;

	// Temp stuff
	maxForceDt: f32 = 0;
	minForceDt: f32 = 0;
	invC: f32 = 0;
	B: f32 = 0;
	lambda: f32 = 0;
	index: i32 = -1;

	/**
	 * Base class for constraint equations.
	 * @class Equation
	 * @constructor
	 * @param {Body} bodyA First body participating in the equation
	 * @param {Body} bodyB Second body participating in the equation
	 * @param {number} minForce Minimum force to apply. Default: -Infinity
	 * @param {number} maxForce Maximum force to apply. Default: Infinity
	 */
	constructor(bodyA: Body|null, bodyB: Body|null, minForce: f32, maxForce: f32){

		// f32 is not nullable in assemblyscript.....
		// this.minForce = minForce == null ? -Infinity : minForce;
		// this.maxForce = maxForce == null ? Infinity : maxForce;
		this.minForce = minForce;
		this.maxForce = maxForce;
		this.maxBias = Infinity;
		this.bodyA = bodyA || null;
		this.bodyB = bodyB || null;
		this.stiffness = Equation.DEFAULT_STIFFNESS;
		this.relaxation = Equation.DEFAULT_RELAXATION;
		this.G = new Float32Array(6);
		for(let i: u16 = 0; i < 6; i++){
			this.G[i] = 0;
		}
	}

	computeGq(): f32 {
		var G = this.G,
			bi = this.bodyA,
			bj = this.bodyB;
		if(!bi || ! bj) return 0;
		var ai = bi.angle,
			aj = bj.angle;
	
		var qi = vec2.create(),
			qj = vec2.create()
		return this.gmult(G, qi, ai, qj, aj) + this.offset;
	}

	/**
	 * The default stiffness when creating a new Equation.
	 * @static
	 * @property {Number} DEFAULT_STIFFNESS
	 * @default 1e6
	 */
	static DEFAULT_STIFFNESS:f32 = 1e6;

	/**
	 * The default relaxation when creating a new Equation.
	 * @static
	 * @property {Number} DEFAULT_RELAXATION
	 * @default 4
	 */
	static DEFAULT_RELAXATION:f32 = 4;


	/**
	 * Compute SPOOK parameters .a, .b and .epsilon according to the current parameters. See equations 9, 10 and 11 in the <a href="http://www8.cs.umu.se/kurser/5DV058/VT09/lectures/spooknotes.pdf">SPOOK notes</a>.
	 * @method update
	 */
	update(): void{
		var k = this.stiffness,
			d = this.relaxation,
			h = this.timeStep;

		this.a = 4 / (h * (1 + 4 * d));
		this.b = (4 * d) / (1 + 4 * d);
		this.epsilon = 4 / (h * h * k * (1 + 4 * d));

		this.needsUpdate = false;
	}

	/**
	 * Multiply a jacobian entry with corresponding positions or velocities
	 * @method gmult
	 * @return {Number}
	 */
	gmult(G: Float32Array,vi: Float32Array,wi: f32,vj: Float32Array,wj: f32): f32{
		return  G[0] * vi[0] +
				G[1] * vi[1] +
				G[2] * wi +
				G[3] * vj[0] +
				G[4] * vj[1] +
				G[5] * wj;
	}

	/**
	 * Computes the RHS of the SPOOK equation
	 * @method computeB
	 * @return {Number}
	 */
	computeB(a: f32,b: f32,h: f32): f32{
		let GW: f32 = this.computeGW();
		let Gq: f32 = this.computeGq();
		let maxBias = this.maxBias;
		if(Math.abs(Gq) > maxBias){
			Gq = Gq > 0 ? maxBias : -maxBias;
		}
		let GiMf = this.computeGiMf();
		let B = - Gq * a - GW * b - GiMf * h;
		return B;
	}

	/**
	 * Computes G\*W, where W are the body velocities
	 * @method computeGW
	 * @return {Number}
	 */
	computeGW(): f32{
		var G = this.G,
			bi = this.bodyA,
			bj = this.bodyB;
		if(!bi || ! bj) return 0;
		var vi = bi.velocity,
			vj = bj.velocity,
			wi = bi.angularVelocity,
			wj = bj.angularVelocity;
		return this.gmult(G,vi,wi,vj,wj) + this.relativeVelocity;
	}

	/**
	 * Computes G\*Wlambda, where W are the body velocities
	 * @method computeGWlambda
	 * @return {Number}
	 */
	computeGWlambda(): f32{
		var G = this.G,
			bi = this.bodyA,
			bj = this.bodyB;
		if(!bi || ! bj) return 0;
		var vi = bi.vlambda,
			vj = bj.vlambda,
			wi = bi.wlambda,
			wj = bj.wlambda;
		return this.gmult(G,vi,wi,vj,wj);
	}

	/**
	 * Computes G\*inv(M)\*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
	 * @method computeGiMf
	 * @return {Number}
	 */
	computeGiMf(): f32{
		var bi = this.bodyA,
			bj = this.bodyB;
		if(!bi || ! bj) return 0;
		var fi = bi.force,
			ti = bi.angularForce,
			fj = bj.force,
			tj = bj.angularForce,
			invMassi = bi.invMassSolve,
			invMassj = bj.invMassSolve,
			invIi = bi.invInertiaSolve,
			invIj = bj.invInertiaSolve,
			G = this.G;

		var iMfi = vec2.create(),
			iMfj = vec2.create();

		vec2.scale(iMfi, fi, invMassi);
		vec2.multiply(iMfi, bi.massMultiplier, iMfi);
		vec2.scale(iMfj, fj,invMassj);
		vec2.multiply(iMfj, bj.massMultiplier, iMfj);

		return this.gmult(G,iMfi,ti*invIi,iMfj,tj*invIj);
	}

	/**
	 * Computes G\*inv(M)\*G'
	 * @method computeGiMGt
	 * @return {Number}
	 */
	computeGiMGt(): f32{
		var bi = this.bodyA,
			bj = this.bodyB;
		if(!bi || ! bj) return 0;
		var invMassi = bi.invMassSolve,
			invMassj = bj.invMassSolve,
			invIi = bi.invInertiaSolve,
			invIj = bj.invInertiaSolve,
			G = this.G;

		return  G[0] * G[0] * invMassi * bi.massMultiplier[0] +
				G[1] * G[1] * invMassi * bi.massMultiplier[1] +
				G[2] * G[2] *    invIi +
				G[3] * G[3] * invMassj * bj.massMultiplier[0] +
				G[4] * G[4] * invMassj * bj.massMultiplier[1] +
				G[5] * G[5] *    invIj;
	}

	updateJacobian(): void{};

	/**
	 * Add constraint velocity to the bodies.
	 * @method addToWlambda
	 * @param {Number} deltalambda
	 */
	addToWlambda(deltalambda: f32): void{
		var bi = this.bodyA,
			bj = this.bodyB;
		if(!bi || ! bj) return;
		var invMassi = bi.invMassSolve,
			invMassj = bj.invMassSolve,
			invIi = bi.invInertiaSolve,
			invIj = bj.invInertiaSolve,
			G = this.G;

		// v_lambda = G * inv(M) * delta_lambda

		addToVLambda(bi.vlambda, G[0], G[1], invMassi, deltalambda, bi.massMultiplier);
		bi.wlambda += invIi * G[2] * deltalambda;

		addToVLambda(bj.vlambda, G[3], G[4], invMassj, deltalambda, bj.massMultiplier);
		bj.wlambda += invIj * G[5] * deltalambda;
	}

	/**
	 * Compute the denominator part of the SPOOK equation: C = G\*inv(M)\*G' + eps
	 * @method computeInvC
	 * @param  {Number} eps
	 * @return {Number}
	 */
	computeInvC(eps: f32): f32{
		var invC: f32 = 1.0 / (this.computeGiMGt() + eps);
		return invC;
	}

}

function addToVLambda(vlambda: Float32Array, Gx: f32, Gy: f32, invMass: f32, deltalambda: f32, massMultiplier: Float32Array): void{
	vlambda[0] += Gx * invMass * deltalambda * massMultiplier[0];
	vlambda[1] += Gy * invMass * deltalambda * massMultiplier[1];
}