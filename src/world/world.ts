type i16=number; type i32=number;type i64=number;type u16=number; type u32=number;type u64=number;type f32=number;

import GSSolver from  "../solver/gs-solver";
import vec2 from  "../math/vec2";
import Shape from  "../shapes/shape";
import EventEmitter from  "../events/event-emitter";
import Body from  "../objects/body";
import Material from  "../material/material";
import ContactMaterial from  "../material/contact-material";
import AABB from  "../collision/aabb";
import SAPBroadphase from  "../collision/sap-broadphase";
import Narrowphase from  "../collision/narrowphase";
import Utils from  "../utils/utils";
//import arrayRemove from  "ayRemo"; // Get rid of this dependency!
import OverlapKeeper from  "../utils/overlap-keeper";
import UnionFind from  "./union-find";
import Equation from "../equations/Equation";
import Solver from "../solver/solver";
import Spring from "../objects/spring";
import Broadphase from "../collision/broadphase";
import Constraint from "../constraints/constraint";
import FrictionEquation from "../equations/friction-equation";
import ContactEquation from "../equations/contact-equation";
import RaycastResult from "../collision/raycast-result";
import Ray from "../collision/ray";

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
class AddBodyEvent{
	type: String = "addBody";
	body: Body|null = null;
}
 var addBodyEvent = new AddBodyEvent();

/**
 * Fired when a body is removed from the world.
 * @event removeBody
 * @param {Body} body
 */
class RemoveBodyEvent{
	type: String = "removeBody";
	body : Body|null = null;
}
var removeBodyEvent = new RemoveBodyEvent();

/**
 * Fired when a spring is added to the world.
 * @event addSpring
 * @param {Spring} spring
 */
class AddSpringEvent{
	type: String = "addSpring";
	spring: Spring|null = null;
}
var addSpringEvent = new AddSpringEvent();

/**
 * Fired when a first contact is created between two bodies. This event is fired after the step has been done.
 * @event impact
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @deprecated Impact event will be removed. Use beginContact instead.
 */
class ImpactEvent{
	type: String = "impact";
	bodyA: Body|null = null;
	bodyB: Body|null = null;
	shapeA: Shape|null = null;
	shapeB: Shape|null = null;
	contactEquation: ContactEquation|null = null;
}
var impactEvent = new ImpactEvent();


/**
 * Fired after the Broadphase has collected collision pairs in the world.
 * Inside the event handler, you can modify the pairs array as you like, to
 * prevent collisions between objects that you don't want.
 * @event postBroadphase
 * @param {Array} pairs An array of collision pairs. If this array is [body1,body2,body3,body4], then the body pairs 1,2 and 3,4 would advance to narrowphase.
 */
class PostBroadphaseEvent{
	type: String = "postBroadphase";
	pairs: Body[]|null = null;
}
var postBroadphaseEvent = new PostBroadphaseEvent;


class BeginContactEvent{
	type: String = "beginContact";
	shapeA: Shape|null = null;
	shapeB: Shape|null = null;
	bodyA: Body|null = null;
	bodyB: Body|null = null;
	contactEquations: Equation[] = [];
}
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

var hitTest_tmp1 = vec2.create(),
	hitTest_tmp2 = vec2.create();

/**
 * Fired just before equations are added to the solver to be solved. Can be used to control what equations goes into the solver.
 * @event preSolve
 * @param {Array} contactEquations  An array of contacts to be solved.
 * @param {Array} frictionEquations An array of friction equations to be solved.
 */
class PreSolveEvent{
	type: String = "preSolve";
	contactEquations: ContactEquation[]|null = null;
	frictionEquations: FrictionEquation[]|null = null;
}
var preSolveEvent = new PreSolveEvent();

function sortBodiesByIsland(a: Body,b: Body){
	return a.islandId - b.islandId;
}

function sortEquationsByIsland(equationA: Equation, equationB: Equation): i32{
	if(!equationA?.bodyA || !equationA?.bodyB || !equationB?.bodyA || !equationB?.bodyB) return 0;

	var islandA = equationA.bodyA.islandId > 0 ? equationA.bodyA.islandId : equationA.bodyB.islandId;
	var islandB = equationB.bodyA.islandId > 0 ? equationB.bodyA.islandId : equationB.bodyB.islandId;

	if(islandA !== islandB){
		return islandA - islandB;
	} else {
		// Sort by equation type if same island
		return equationA.index - equationB.index;
	}
}

// Why not just make this a private method in world?
// What are all these props???
function runNarrowphase(world: World, np: Narrowphase, bi: Body, si: Shape, xi: Float32Array, ai: f32, bj: Body, sj: Shape, xj: Float32Array, aj: f32, cm: ContactMaterial, glen: f32){

	let xiw = vec2.create();
	let xjw = vec2.create();

	// Check collision groups and masks
	if(!((si.collisionGroup & sj.collisionMask) !== 0 && (sj.collisionGroup & si.collisionMask) !== 0)){
		return;
	}

	// Get world position and angle of each shape
	vec2.toGlobalFrame(xiw, xi, bi.position, bi.angle);
	vec2.toGlobalFrame(xjw, xj, bj.position, bj.angle);

	if(vec2.distance(xiw,xjw) > si.boundingRadius + sj.boundingRadius){
		return;
	}

	var aiw = ai + bi.angle;
	var ajw = aj + bj.angle;

	np.enableFriction = cm.friction > 0;
	var reducedMass;
	if(bi.type === Body.STATIC || bi.type === Body.KINEMATIC){
		reducedMass = bj.mass;
	} else if(bj.type === Body.STATIC || bj.type === Body.KINEMATIC){
		reducedMass = bi.mass;
	} else {
		reducedMass = (bi.mass*bj.mass)/(bi.mass+bj.mass);
	}
	np.slipForce = cm.friction*glen*reducedMass;
	np.currentContactMaterial = cm;
	np.enabledEquations = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;

	let sensor = si.sensor || sj.sensor;
	let numFrictionBefore = np.frictionEquations.length;

	let numContacts = np.testContact(bi, si, xiw, bj, sj, xjw, sensor);
	
	var numFrictionEquations = np.frictionEquations.length - numFrictionBefore;

	if(numContacts){

		if( bi.allowSleep &&
			bi.type === Body.DYNAMIC &&
			bi.sleepState  === Body.SLEEPING &&
			bj.sleepState  === Body.AWAKE &&
			bj.type !== Body.STATIC
		){
			var speedSquaredB = vec2.squaredLength(bj.velocity) + Math.pow(bj.angularVelocity,2);
			var speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit,2);
			if(speedSquaredB >= speedLimitSquaredB*2){
				bi._wakeUpAfterNarrowphase = true;
			}
		}

		if( bj.allowSleep &&
			bj.type === Body.DYNAMIC &&
			bj.sleepState  === Body.SLEEPING &&
			bi.sleepState  === Body.AWAKE &&
			bi.type !== Body.STATIC
		){
			var speedSquaredA = vec2.squaredLength(bi.velocity) + Math.pow(bi.angularVelocity,2);
			var speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit,2);
			if(speedSquaredA >= speedLimitSquaredA*2){
				bj._wakeUpAfterNarrowphase = true;
			}
		}

		world.overlapKeeper.setOverlapping(bi, si, bj, sj);
		if(world.has('beginContact') && world.overlapKeeper.isNewOverlap(si, sj)){

			// Report new shape overlap
			var e = beginContactEvent;
			e.shapeA = si;
			e.shapeB = sj;
			e.bodyA = bi;
			e.bodyB = bj;

			// Reset contact equations
			e.contactEquations.length = 0;

			if(!sensor){
				for(var i=np.contactEquations.length-numContacts; i<np.contactEquations.length; i++){
					e.contactEquations.push(np.contactEquations[i]);
				}
			}

			world.emit(e);
		}

		// divide the max friction force by the number of contacts
		if(!sensor && numFrictionEquations > 1){ // Why divide by 1?
			for(var i=np.frictionEquations.length-numFrictionEquations; i<np.frictionEquations.length; i++){
				var f = np.frictionEquations[i];
				f.setSlipForce(f.getSlipForce() / numFrictionEquations);
			}
		}
	}
}

function setGlobalEquationParams(world: World, params?: {
	relaxation?: f32,
	stiffness?: f32
}){
	var constraints = world.constraints;
	for(var i=0; i !== constraints.length; i++){
		var c = constraints[i];
		var eqs = c.equations;
		for(var j=0; j !== eqs.length; j++){
			var eq = eqs[j];
			eq.relaxation = params?.relaxation ?? eq.relaxation;
			eq.stiffness = params?.stiffness ?? eq.stiffness;
			eq.needsUpdate = true;
		}
	}
}

export default class World extends EventEmitter{

	/**
	 * All springs in the world. To add a spring to the world, use {{#crossLink "World/addSpring:method"}}{{/crossLink}}.
	 *
	 * @property springs
	 * @type {Array}
	 */
	springs: Spring[] = [];

	/**
	 * All bodies in the world. To add a body to the world, use {{#crossLink "World/addBody:method"}}{{/crossLink}}.
	 * @property {Array} bodies
	 */
	bodies: Body[] = [];

	/**
	 * Disabled body collision pairs. See {{#crossLink "World/disableBodyCollision:method"}}.
	 * @private
	 * @property {Array} disabledBodyCollisionPairs
	 */
	disabledBodyCollisionPairs: Array<Body> = [];

	/**
	 * The solver used to satisfy constraints and contacts. Default is {{#crossLink "GSSolver"}}{{/crossLink}}.
	 * @property {Solver} solver
	 */
	solver: Solver;

	/**
	 * The narrowphase to use to generate contacts.
	 *
	 * @property narrowphase
	 * @type {Narrowphase}
	 */
	narrowphase: Narrowphase = new Narrowphase();

	/**
	 * Gravity in the world. This is applied on all bodies in the beginning of each step().
	 *
	 * @property gravity
	 * @type {Array}
	 */
	gravity: Float32Array = vec2.fromValues(0, -9.78);

	/**
	 * Gravity to use when approximating the friction max force (mu*mass*gravity).
	 * @property {Number} frictionGravity
	 */
	frictionGravity: f32 = 10;

	/**
	 * Set to true if you want .frictionGravity to be automatically set to the length of .gravity.
	 * @property {boolean} useWorldGravityAsFrictionGravity
	 * @default true
	 */
	useWorldGravityAsFrictionGravity = true;

	/**
	 * If the length of .gravity is zero, and .useWorldGravityAsFrictionGravity=true, then switch to using .frictionGravity for friction instead. This fallback is useful for gravityless games.
	 * @property {boolean} useFrictionGravityOnZeroGravity
	 * @default true
	 */
	useFrictionGravityOnZeroGravity = true;

	/**
	 * The broadphase algorithm to use.
	 *
	 * @property broadphase
	 * @type {Broadphase}
	 */
	broadphase: Broadphase;

	/**
	 * User-added constraints.
	 *
	 * @property constraints
	 * @type {Array}
	 */
	constraints: Constraint[] = [];

	/**
	 * Dummy default material in the world, used in .defaultContactMaterial
	 * @property {Material} defaultMaterial
	 */
	defaultMaterial: Material = new Material();

	/**
	 * The default contact material to use, if no contact material was set for the colliding materials.
	 * @property {ContactMaterial} defaultContactMaterial
	 */
	defaultContactMaterial: ContactMaterial;

	/**
	 * For keeping track of what time step size we used last step
	 * @property lastTimeStep
	 * @type {Number}
	 */
	lastTimeStep: f32 = 1/60;

	/**
	 * Enable to automatically apply spring forces each step.
	 * @property applySpringForces
	 * @type {boolean}
	 * @default true
	 */
	applySpringForces: boolean = true;

	/**
	 * Enable to automatically apply body damping each step.
	 * @property applyDamping
	 * @type {boolean}
	 * @default true
	 */
	applyDamping: boolean = true;

	/**
	 * Enable to automatically apply gravity each step.
	 * @property applyGravity
	 * @type {boolean}
	 * @default true
	 */
	applyGravity: boolean = true;

	/**
	 * Enable/disable constraint solving in each step.
	 * @property solveConstraints
	 * @type {boolean}
	 * @default true
	 */
	solveConstraints: boolean = true;

	/**
	 * The ContactMaterials added to the World.
	 * @property contactMaterials
	 * @type {Array}
	 */
	contactMaterials: Array<ContactMaterial> = [];

	/**
	 * World time.
	 * @property time
	 * @type {Number}
	 */
	time: f32 = 0.0;

	accumulator: f32 = 0;

	/**
	 * Is true during step().
	 * @property {boolean} stepping
	 */
	stepping: boolean = false;

	/**
	 * Whether to enable island splitting. Island splitting can be an advantage for both precision and performance.
	 * @property {boolean} islandSplit
	 * @default false
	 */
	islandSplit: boolean = true;

	/**
	 * Set to true if you want to the world to emit the "impact" event. Turning this off could improve performance.
	 * @property emitImpactEvent
	 * @type {boolean}
	 * @default true
	 * @deprecated Impact event will be removed. Use beginContact instead.
	 */
	emitImpactEvent: boolean = true;

	/**
	 * How to deactivate bodies during simulation. Possible modes are: {{#crossLink "World/NO_SLEEPING:property"}}World.NO_SLEEPING{{/crossLink}}, {{#crossLink "World/BODY_SLEEPING:property"}}World.BODY_SLEEPING{{/crossLink}} and {{#crossLink "World/ISLAND_SLEEPING:property"}}World.ISLAND_SLEEPING{{/crossLink}}.
	 * If sleeping is enabled, you might need to {{#crossLink "Body/wakeUp:method"}}wake up{{/crossLink}} the bodies if they fall asleep when they shouldn't. If you want to enable sleeping in the world, but want to disable it for a particular body, see {{#crossLink "Body/allowSleep:property"}}Body.allowSleep{{/crossLink}}.
	 * @property sleepMode
	 * @type {number}
	 * @default World.NO_SLEEPING
	 */
	sleepMode: u16 = World.NO_SLEEPING;

	/**
	 * @property {UnionFind} unionFind
	 */
	unionFind: UnionFind = new UnionFind(1);

	// Id counters
	private _constraintIdCounter = 0;
	private _bodyIdCounter = 0;

	/**
	 * @property {OverlapKeeper} overlapKeeper
	 */
	overlapKeeper: OverlapKeeper = new OverlapKeeper();

	/**
	 * The dynamics world, where all bodies and constraints live.
	 *
	 * @class World
	 * @constructor
	 * @param {Object} [options]
	 * @param {Solver} [options.solver] Defaults to GSSolver.
	 * @param {Array} [options.gravity] Defaults to y=-9.78.
	 * @param {Broadphase} [options.broadphase] Defaults to SAPBroadphase
	 * @param {boolean} [options.islandSplit=true]
	 * @extends EventEmitter
	 *
	 * @example
	 *     var world = new World({
	 *         gravity: [0, -10],
	 *         broadphase: new SAPBroadphase()
	 *     });
	 *     world.addBody(new Body());
	 */
	constructor(options?: {
		solver?: Solver,
		gravity?: Float32Array,
		broadphase?: Broadphase,
		islandSplit?: boolean
	}){
		super();
	
		this.solver = options?.solver ?? new GSSolver();

		if(options?.gravity){
			vec2.copy(this.gravity, options.gravity);
		}
	
		this.frictionGravity = vec2.length(this.gravity) ?? 10;
		this.broadphase = options?.broadphase ?? new SAPBroadphase();
		this.broadphase.setWorld(this);
		this.defaultContactMaterial = new ContactMaterial(this.defaultMaterial,this.defaultMaterial);
		this.islandSplit = options?.islandSplit ?? true;
	}

	/**
	 * Never deactivate bodies.
	 * @static
	 * @property {number} NO_SLEEPING
	 */
	static NO_SLEEPING: u16 = 1;

	/**
	 * Deactivate individual bodies if they are sleepy.
	 * @static
	 * @property {number} BODY_SLEEPING
	 */
	static BODY_SLEEPING: u16 = 2;

	/**
	 * Deactivates bodies that are in contact, if all of them are sleepy. Note that you must enable {{#crossLink "World/islandSplit:property"}}.islandSplit{{/crossLink}} for this to work.
	 * @static
	 * @property {number} ISLAND_SLEEPING
	 */
	static ISLAND_SLEEPING: u16 = 4;

	/**
	 * Add a constraint to the simulation. Note that both bodies connected to the constraint must be added to the world first. Also note that you can't run this method during step.
	 *
	 * @method addConstraint
	 * @param {Constraint} constraint
	 * @example
	 *     var constraint = new LockConstraint(bodyA, bodyB);
	 *     world.addConstraint(constraint);
	 */
	addConstraint(constraint: Constraint): void{
		if(this.stepping){
			throw new Error('Constraints cannot be added during step.');
		}

		var bodies = this.bodies;
		if(bodies.indexOf(constraint.bodyA) === -1){
			throw new Error('Cannot add Constraint: bodyA is not added to the World.');
		}
		if(bodies.indexOf(constraint.bodyB) === -1){
			throw new Error('Cannot add Constraint: bodyB is not added to the World.');
		}

		this.constraints.push(constraint);
	}

	/**
	 * Add a ContactMaterial to the simulation.
	 * @method addContactMaterial
	 * @param {ContactMaterial} contactMaterial
	 */
	addContactMaterial(contactMaterial: ContactMaterial): void{
		this.contactMaterials.push(contactMaterial);
	}

	/**
	 * Removes a contact material
	 *
	 * @method removeContactMaterial
	 * @param {ContactMaterial} cm
	 */
	removeContactMaterial(cm: ContactMaterial): void{
		Utils.arrayRemove(this.contactMaterials, cm);
	}

	/**
	 * Get a contact material given two materials
	 * @method getContactMaterial
	 * @param {Material} materialA
	 * @param {Material} materialB
	 * @return {ContactMaterial} The matching ContactMaterial, or false on fail.
	 * @todo Use faster hash map to lookup from material id's
	 */
	getContactMaterial(materialA: Material,materialB: Material): ContactMaterial | null{
		let cmats = this.contactMaterials;
		for(let i=0, N=cmats.length; i!==N; i++){
			let cm = cmats[i];
			if((cm.materialA === materialA && cm.materialB === materialB) || (cm.materialA === materialB && cm.materialB === materialA)){
				return cm;
			}
		}
		return null;
	}

	/**
	 * Removes a constraint. Note that you can't run this method during step.
	 *
	 * @method removeConstraint
	 * @param {Constraint} constraint
	 */
	removeConstraint(constraint: Constraint): void{
		if(this.stepping){
			throw new Error('Constraints cannot be removed during step.');
		}
		Utils.arrayRemove(this.constraints, constraint);
	}

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
	step(dt: f32,timeSinceLastCalled: f32,maxSubSteps: u16){
		maxSubSteps = maxSubSteps || 10;
		timeSinceLastCalled = timeSinceLastCalled || 0;

		if(timeSinceLastCalled === 0){ // Fixed, simple stepping

			this.internalStep(dt);

			// Increment time
			this.time += dt;

		} else {

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
			for(var j=0; j!==this.bodies.length; j++){
				var b = this.bodies[j];
				vec2.lerp(b.interpolatedPosition, b.previousPosition, b.position, t);
				b.interpolatedAngle = b.previousAngle + t * (b.angle - b.previousAngle);
			}
		}
	}

	/**
	 * Make a fixed step.
	 * @method internalStep
	 * @param  {number} dt
	 * @private
	 */
	internalStep(dt: f32): void{

		let step_mg = vec2.create();

		let endOverlaps: any[] = [];

		this.stepping = true;

		let Nsprings = this.springs.length,
			springs = this.springs,
			bodies = this.bodies,
			g = this.gravity,
			solver = this.solver,
			Nbodies = this.bodies.length,
			broadphase = this.broadphase,
			np = this.narrowphase,
			constraints = this.constraints,
			mg = step_mg,
			add = vec2.add;

		this.overlapKeeper.tick();

		this.lastTimeStep = dt;

		// Update approximate friction gravity.
		if(this.useWorldGravityAsFrictionGravity){
			var gravityLen = vec2.length(this.gravity);
			if(!(gravityLen === 0 && this.useFrictionGravityOnZeroGravity)){
				// Nonzero gravity. Use it.
				this.frictionGravity = gravityLen;
			}
		}

		// Add gravity to bodies
		if(this.applyGravity){
			for(var i=0; i!==Nbodies; i++){
				var b = bodies[i],
					fi = b.force;
				if(b.type !== Body.DYNAMIC || b.sleepState === Body.SLEEPING){
					continue;
				}
				vec2.scale(mg,g,b.mass*b.gravityScale); // F=m*g
				add(fi,fi,mg);
			}
		}

		// Add spring forces
		if(this.applySpringForces){
			for(var i=0; i!==Nsprings; i++){
				var s = springs[i];
				s.applyForce();
			}
		}

		if(this.applyDamping){
			for(var i=0; i!==Nbodies; i++){
				var b = bodies[i];
				if(b.type === Body.DYNAMIC){
					b.applyDamping(dt);
				}
			}
		}

		// Broadphase
		var result: Body[] = broadphase.getCollisionPairs(this);

		// Remove ignored collision pairs
		var ignoredPairs = this.disabledBodyCollisionPairs;
		for(var i=ignoredPairs.length-2; i>=0; i-=2){
			for(var j=result.length-2; j>=0; j-=2){
				if( (ignoredPairs[i]   === result[j] && ignoredPairs[i+1] === result[j+1]) ||
					(ignoredPairs[i+1] === result[j] && ignoredPairs[i]   === result[j+1])){
					result.splice(j,2);
				}
			}
		}

		// Remove constrained pairs with collideConnected == false
		var Nconstraints = constraints.length;
		for(i=0; i!==Nconstraints; i++){
			var c = constraints[i];
			if(!c.collideConnected){
				for(var j=result.length-2; j>=0; j-=2){
					if( (c.bodyA === result[j] && c.bodyB === result[j+1]) ||
						(c.bodyB === result[j] && c.bodyA === result[j+1])){
						result.splice(j,2);
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
		for(var i=0, Nresults=result.length; i!==Nresults; i+=2){
			var bi = result[i],
				bj = result[i+1];

			// Loop over all shapes of body i
			for(var k=0, Nshapesi=bi.shapes.length; k!==Nshapesi; k++){
				var si = bi.shapes[k],
					xi = si.position,
					ai = si.angle;

				// All shapes of body j
				for(var l=0, Nshapesj=bj.shapes.length; l!==Nshapesj; l++){
					var sj = bj.shapes[l],
						xj = sj.position,
						aj = sj.angle;

					var contactMaterial: ContactMaterial | null = null;
					if(si.material && sj.material){
						contactMaterial = this.getContactMaterial(si.material,sj.material);
					}

					runNarrowphase(this,np,bi,si,xi,ai,bj,sj,xj,aj,contactMaterial ?? defaultContactMaterial, frictionGravity);
				}
			}
		}

		// Wake up bodies
		for(var i=0; i!==Nbodies; i++){
			var body = bodies[i];
			if(body._wakeUpAfterNarrowphase){
				body.wakeUp();
				body._wakeUpAfterNarrowphase = false;
			}
		}

		// Emit end overlap events
		if(super.has("endContact")){
			this.overlapKeeper.getEndOverlaps(endOverlaps);
			var e = endContactEvent;
			var l = endOverlaps.length;
			while(l--){
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
		for(i=0; i!==Nconstraints; i++){
			constraints[i].update();
		}

		if(np.contactEquations.length || np.frictionEquations.length || Nconstraints){

			// Get all equations
			var equations: Equation[] = [];
			Utils.appendArray(equations, np.contactEquations);
			Utils.appendArray(equations, np.frictionEquations);
			for(i=0; i!==Nconstraints; i++){
				Utils.appendArray(equations, constraints[i].equations);
			}

			if(this.islandSplit){

				// Initialize the UnionFind
				var unionFind = this.unionFind;
				unionFind.resize(this.bodies.length + 1);

				// Update equation index
				for(var i=0; i<equations.length; i++){
					equations[i].index = i;
				}

				// Unite bodies if they are connected by an equation
				for(var i=0; i<equations.length; i++){
					var bodyA = equations[i].bodyA;
					var bodyB = equations[i].bodyB;
					if(!bodyA || !bodyB) continue;
					if(bodyA.type === Body.DYNAMIC && bodyB.type === Body.DYNAMIC){
						unionFind.union(bodyA.index, bodyB.index);
					}
				}

				// Find the body islands
				for(var i=0; i<bodies.length; i++){
					var body = bodies[i];
					body.islandId = body.type === Body.DYNAMIC ? unionFind.find(body.index) : -1;
				}

				// Sort equations by island
				equations = equations.sort(sortEquationsByIsland);

				var equationIndex = 0;
				while(equationIndex < equations.length){
					var equation = equations[equationIndex++];
					solver.addEquation(equation);
					if(!equation.bodyA || !equation.bodyB) continue;
					var currentIslandId = equation.bodyA.islandId > 0 ? equation.bodyA.islandId : equation.bodyB.islandId;
					var nextIslandId = -1;
					let ei = equations[equationIndex];
					if(ei){
						if(ei.bodyA && ei.bodyB) continue;
						nextIslandId = (ei.bodyA?.islandId ?? 0) > 0 ? ei.bodyA?.islandId ?? 0 : ei.bodyB?.islandId ?? 0;
					}

					if(nextIslandId !== currentIslandId || equationIndex === equations.length){
						// Solve this island
						if(this.solveConstraints){
							solver.solve(dt,this);
						}
						solver.removeAllEquations();
					}
				}

			} else {

				// Solve all as one island
				solver.addEquations(equations);
				if(this.solveConstraints){
					solver.solve(dt,this);
				}
				solver.removeAllEquations();

			}
		}

		// Step forward
		for(var i=0; i!==Nbodies; i++){
			var body = bodies[i];
			if(body.type === Body.DYNAMIC || body.type === Body.KINEMATIC){
				body.integrate(dt);
			}
		}

		// Reset force
		for(var i=0; i!==Nbodies; i++){
			bodies[i].setZeroForce();
		}

		// Emit impact event
		if(this.emitImpactEvent && this.has('impact')){
			var ev = impactEvent;
			for(var i=0; i!==np.contactEquations.length; i++){
				var eq = np.contactEquations[i];
				if(eq.firstImpact){
					ev.bodyA = eq.bodyA ?? null;
					ev.bodyB = eq.bodyB ?? null;
					ev.shapeA = eq.shapeA;
					ev.shapeB = eq.shapeB;
					ev.contactEquation = eq;
					this.emit(ev);
				}
			}
		}

		// Sleeping update
		if(this.sleepMode === World.BODY_SLEEPING){

			for(i=0; i!==Nbodies; i++){
				bodies[i].sleepTick(this.time, false, dt);
			}

		} else if(this.sleepMode === World.ISLAND_SLEEPING && this.islandSplit){

			// Tell all bodies to sleep tick but dont sleep yet
			for(i=0; i!==Nbodies; i++){
				bodies[i].sleepTick(this.time, true, dt);
			}

			// Sleep islands
			var bodiesSortedByIsland = bodies.sort(sortBodiesByIsland);
			var islandEnd = 1;
			for(var islandStart=0; islandStart < bodiesSortedByIsland.length; islandStart = islandEnd){
				var islandId = bodiesSortedByIsland[islandStart].islandId;

				// Get islandEnd index
				/* jshint ignore:start */
				for(islandEnd = islandStart+1; islandEnd < bodiesSortedByIsland.length && bodiesSortedByIsland[islandEnd].islandId === islandId; islandEnd++){}
				/* jshint ignore:end */

				// Don't check static objects
				if(islandId === -1){
					continue;
				}

				var islandShouldSleep = true;
				for(var i=islandStart; i<islandEnd; i++){
					if(!bodiesSortedByIsland[i].wantsToSleep){
						islandShouldSleep = false;
						break;
					}
				}
				if(islandShouldSleep){
					for(var i=islandStart; i<islandEnd; i++){
						bodiesSortedByIsland[i].sleep();
					}
				}
			}
		}

		this.stepping = false;

		super.emit(postStepEvent);
	}

	/**
	 * Add a spring to the simulation. Note that this operation can't be done during step.
	 *
	 * @method addSpring
	 * @param {Spring} spring
	 */
	addSpring(spring: Spring): void{
		if(this.stepping){
			throw new Error('Springs cannot be added during step.');
		}
		this.springs.push(spring);
		addSpringEvent.spring = spring;
		this.emit(addSpringEvent);
		addSpringEvent.spring = null;
	}

	/**
	 * Remove a spring. Note that this operation can't be done during step.
	 *
	 * @method removeSpring
	 * @param {Spring} spring
	 */
	removeSpring(spring: Spring): void{
		if(this.stepping){
			throw new Error('Springs cannot be removed during step.');
		}
		Utils.arrayRemove(this.springs, spring);
	}

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
	addBody(body: Body): void{
		if(this.stepping){
			throw new Error('Bodies cannot be added during step.');
		}

		// Already added?
		if(body.world){
			throw new Error('Body is already added to a World.');
		}

		body.index = this.bodies.length;
		this.bodies.push(body);
		body.world = this;

		addBodyEvent.body = body;
		this.emit(addBodyEvent);
		addBodyEvent.body = null;
	}

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
	removeBody(body: Body): void{
		if(this.stepping){
			throw new Error('Bodies cannot be removed during step.');
		}

		// TODO: would it be smart to have a .constraints array on the body?
		var constraints = this.constraints;
		var l = constraints.length;
		while (l--) {
			if(constraints[l].bodyA === body || constraints[l].bodyB === body){
				throw new Error('Cannot remove Body from World: it still has constraints connected to it.');
			}
		}

		body.world = null;
		var bodies = this.bodies;
		Utils.arrayRemove(bodies, body);
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
			} else {
				i += 2;
			}
		}
	}

	/**
	 * Get a body by its id.
	 * @method getBodyById
	 * @param {number} id
	 * @return {Body} The body, or false if it was not found.
	 */
	getBodyById(id: u32): Body|null{
		var bodies = this.bodies;
		for(var i=0; i<bodies.length; i++){
			var b = bodies[i];
			if(b.id === id){
				return b;
			}
		}
		return null;
	}

	/**
	 * Disable collision between two bodies
	 * @method disableBodyCollision
	 * @param {Body} bodyA
	 * @param {Body} bodyB
	 */
	disableBodyCollision(bodyA: Body, bodyB: Body): void{
		this.disabledBodyCollisionPairs.push(bodyA);
		this.disabledBodyCollisionPairs.push(bodyB);
	}

	/**
	 * Enable collisions between the given two bodies, if they were previously disabled using .disableBodyCollision().
	 * @method enableBodyCollision
	 * @param {Body} bodyA
	 * @param {Body} bodyB
	 */
	enableBodyCollision(bodyA: Body,bodyB: Body): void{
		var pairs = this.disabledBodyCollisionPairs;
		for(var i=0; i<pairs.length; i+=2){
			if((pairs[i] === bodyA && pairs[i+1] === bodyB) || (pairs[i+1] === bodyA && pairs[i] === bodyB)){
				pairs.splice(i,2);
				return;
			}
		}
	}

	/**
	 * Removes all bodies, constraints, springs, and contact materials from the world.
	 * @method clear
	 */
	clear(): void{

		// Remove all solver equations
		this.solver.removeAllEquations();

		// Remove all constraints
		var cs = this.constraints;
		var i = cs.length;
		while(i--){
			this.removeConstraint(cs[i]);
		}

		// Remove all bodies
		var bodies = this.bodies;
		i = bodies.length;
		while(i--){
			this.removeBody(bodies[i]);
		}

		// Remove all springs
		var springs = this.springs;
		i = springs.length;
		while(i--){
			this.removeSpring(springs[i]);
		}

		// Remove all contact materials
		var cms = this.contactMaterials;
		i = cms.length;
		while(i--){
			this.removeContactMaterial(cms[i]);
		}
	}


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
	hitTest(worldPoint: Float32Array, bodies: Body[], precision: f32): Body[]{

		precision = precision || 0;

		// Create a dummy particle body with a particle shape to test against the bodies
		var shapeWorldPosition = hitTest_tmp1,
			shapeLocalPoint = hitTest_tmp2;

		var result = [];

		// Check bodies
		for(var i=0, N = bodies.length; i!==N; i++){
			var body = bodies[i];

			for(var j=0, NS = body.shapes.length; j!==NS; j++){
				var shape = body.shapes[j];

				// Get local point position in the shape
				shape.worldPointToLocal(shapeLocalPoint, worldPoint);

				if(shape.pointTest(shapeLocalPoint)){
					result.push(body);
				} else {

					// Get shape world position
					vec2.rotate(shapeWorldPosition, shape.position, body.angle);
					vec2.add(shapeWorldPosition, shapeWorldPosition, body.position);

					if(shape.type === Shape.PARTICLE && vec2.squaredDistance(shapeWorldPosition, worldPoint) < precision * precision){
						result.push(body);
					}
				}
			}
		}

		return result;
	}

	/**
	 * Set the stiffness for all equations and contact materials.
	 * @method setGlobalStiffness
	 * @param {Number} stiffness
	 */
	setGlobalStiffness(stiffness: f32): void{
		setGlobalEquationParams(this, { stiffness: stiffness });

		// Set for all contact materials
		var contactMaterials = this.contactMaterials;
		for(var i=0; i !== contactMaterials.length; i++){
			var c = contactMaterials[i];
			c.stiffness = c.frictionStiffness = stiffness;
		}

		// Set for default contact material
		var c = this.defaultContactMaterial;
		c.stiffness = c.frictionStiffness = stiffness;
	}

	/**
	 * Set the relaxation for all equations and contact materials.
	 * @method setGlobalRelaxation
	 * @param {Number} relaxation
	 */
	setGlobalRelaxation(relaxation: f32): void{
		setGlobalEquationParams(this, { relaxation: relaxation });

		// Set for all contact materials
		for(var i=0; i !== this.contactMaterials.length; i++){
			var c = this.contactMaterials[i];
			c.relaxation = c.frictionRelaxation = relaxation;
		}

		// Set for default contact material
		var c = this.defaultContactMaterial;
		c.relaxation = c.frictionRelaxation = relaxation;
	}

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
	raycast(result: RaycastResult, ray: Ray): boolean{

		let tmpAABB = new AABB();
		var tmpArray: Body[] = [];

		// Get all bodies within the ray AABB
		ray.getAABB(tmpAABB);
		this.broadphase.aabbQuery(this, tmpAABB, tmpArray);
		ray.intersectBodies(result, tmpArray);
		tmpArray.length = 0;

		return result.hasHit();
	}
}
