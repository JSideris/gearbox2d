type i16=number; type i32=number;type i64=number;type u16=number; type u32=number;type u64=number;type f32=number;

import EventEmitter from "../events/event-emitter";
import Equation from "../equations/Equation";
import World from "../world/world";


export default abstract class Solver extends EventEmitter{
	type?: u16;
	equations: Equation[];
	equationSortFunction?: (a: Equation, b: Equation) => number;

	/**
	 * Base class for constraint solvers.
	 * @class Solver
	 * @constructor
	 * @extends EventEmitter
	 */
	constructor(options?: {
		equationSortFunction?: (a: Equation, b: Equation) => number
	},type?: u16){
		super();

		this.type = type;

		/**
		 * Current equations in the solver.
		 *
		 * @property equations
		 * @type {Array}
		 */
		this.equations = [];

		/**
		 * Function that is used to sort all equations before each solve.
		 * @property equationSortFunction
		 * @type {function|boolean}
		 */
		this.equationSortFunction = options?.equationSortFunction ?? undefined;
	}

	/**
	 * Method to be implemented in each subclass
	 * @method solve
	 * @param  {Number} dt
	 * @param  {World} world
	 */
	abstract solve(h: f32, world: World): void;

	/**
	 * Sort all equations using the .equationSortFunction. Should be called by subclasses before solving.
	 * @method sortEquations
	 */
	sortEquations(){
		if(this.equationSortFunction){
			this.equations.sort(this.equationSortFunction);
		}
	};

	/**
	 * Add an equation to be solved.
	 *
	 * @method addEquation
	 * @param {Equation} eq
	 */
	addEquation(eq: Equation){
		if(eq.enabled){
			this.equations.push(eq);
		}
	};

	/**
	 * Add equations. Same as .addEquation, but this time the argument is an array of Equations
	 *
	 * @method addEquations
	 * @param {Array} eqs
	 */
	addEquations(eqs: Equation[]){
		for(var i=0, N=eqs.length; i!==N; i++){
			var eq = eqs[i];
			if(eq.enabled){
				this.equations.push(eq);
			}
		}
	};

	/**
	 * Remove an equation.
	 *
	 * @method removeEquation
	 * @param {Equation} eq
	 */
	removeEquation(eq: Equation){
		var i = this.equations.indexOf(eq);
		if(i !== -1){
			this.equations.splice(i,1);
		}
	};

	/**
	 * Remove all currently added equations.
	 *
	 * @method removeAllEquations
	 */
	removeAllEquations(){
		this.equations.length=0;
	};

	/**
	 * Gauss-Seidel solver.
	 * @property GS
	 * @type {Number}
	 * @static
	 */
	static GS: u16 = 1;
}