import { Err, Ok } from "../result/result";
import type { Result } from "../result/result";
import { ExpectError, UnwrapError } from "../util";

enum OptionType {
	Some = "Some",
	None = "None",
}

class Option<T> {
	#type: OptionType.Some | OptionType.None;
	#value: T;

	/**
	 * Constructor for the Option class
	 * Do not use directly.
	 *
	 * @param value
	 * @param type
	 */
	constructor(value: T, type: OptionType) {
		this.#value = value;
		this.#type = type;
	}

	/**
	 * Returns `true` if the option is {@link Some}.
	 *
	 * ---
	 * @example
	 * const option: Option<number> = Some(123);
	 * option.isSome(); // true
	 *
	 * const option: Option<number> = None();
	 * option.isSome(); // false
	 *
	 * @returns {boolean}
	 */
	isSome(): boolean {
		return this.#type === OptionType.Some;
	}

	/**
	 * Returns `true` if the option is {@link Some} and the value inside of it matches a predicate.
	 *
	 * ---
	 * @example
	 * const option: Option<number> = Some(2);
	 * option.isSomeAnd((x) => x > 1); // true
	 *
	 * const option: Option<number> = Some(0);
	 * option.isSomeAnd((x) => x > 1); // false
	 *
	 * const option: Option<number> = None();
	 * option.isSomeAnd((x) => x > 1); // false
	 * @param {(value: T) => boolean} f predicate
	 * @returns {boolean}
	 */
	isSomeAnd(f: (x: T) => boolean): boolean {
		if (this.#type === OptionType.Some) {
			return f(this.#value);
		} else {
			return false;
		}
	}

	/**
	 * Returns `true` if the option is {@link None}.
	 *
	 * ---
	 * @example
	 * const option: Option<number> = Some(2);
	 * option.isNone(); // false
	 *
	 * const option: Option<number> = None();
	 * option.isNone(); // true
	 *
	 * @returns {boolean} boolean
	 */
	isNone(): boolean {
		return this.#type === OptionType.None;
	}

	/**
	 * Returns `true` if the option is {@link None} or the value inside of it matches a predicate.
	 *
	 * ---
	 * @example
	 * const option: Option<number> = Some(2);
	 * option.isNoneOr((x) => x > 1); // true
	 *
	 * const option: Option<number> = Some(0);
	 * option.isNoneOr((x) => x > 1); // false
	 *
	 * const option: Option<number> = None();
	 * option.isNoneOr((x) => x > 1); // true
	 *
	 * @param {(x: T) => boolean} f predicate
	 * @returns {boolean} boolean
	 */
	isNoneOr(f: (x: T) => boolean): boolean {
		if (this.#type === OptionType.None) {
			return true;
		} else {
			return f(this.#value);
		}
	}

	/**
	 * Returns the contained {@link Some} value if the option is {@link Some},
	 *  or throws an ExpectError if the option is {@link None} with the custom
	 *  message provided by `msg`.
	 *
	 * **Reccomended message style**: It is reccomended that `expect` messages
	 *  should be used to describe the reason you _expect_ the `Option` should
	 *  be `Some`.
	 * ```typescript
	 * const criticalEnv: string = getEnv("SOME_KEY").expect("Env variable 'SOME_KEY' should be set in the current environment.");
	 * ```
	 * **Hint**: If you are having trouble remembering how to phrase expect
	 *  error messages remember to focus on the word "should" as in "env
	 *  variable should be set by ___" or "the given binary should be available
	 *  and executable by the current user".
	 *
	 * ---
	 * @example
	 * const option: Option<number> = Some(2);
	 * option.expect("Testing expect"); // 2
	 *
	 * const option: Option<number> = None();
	 * option.expect("Testing expect"); // Throws ExpectError "Testing expect"
	 *
	 *
	 * @throws {ExpectError} Throws an ExpectError if the option is {@link None}, with the custom message provided by `msg`.
	 * @param msg
	 * @returns {T} T
	 */
	expect(msg: string): T {
		if (this.#type === OptionType.Some) {
			return this.#value;
		} else {
			throw new ExpectError(msg);
		}
	}

	/**
	 * Returns the contained {@link Some} value if the option is {@link Some},
	 *  or throws an UnwrapError if the option is {@link None}.
	 *
	 * Because this function may throw an `UnwrapError`, its use is generally
	 *  discouraged. Instead, use conditions to check for {@link None} explicitly,
	 *  or call {@link unwrapOr} or {@link unwrapOrElse}.
	 *
	 * ---
	 * @example
	 * const option: Option<number> = Some(2);
	 * option.unwrap(); // 2
	 *
	 * const option: Option<number> = None();
	 * option.unwrap(); // Throws UnwrapError "Called Option.unwrap() on a 'None' value"
	 *
	 * @throws {UnwrapError} Throws an UnwrapError if the option is {@link None}.
	 * @returns {T} T
	 */
	unwrap(): T {
		if (this.#type === OptionType.Some) {
			return this.#value;
		} else {
			throw new UnwrapError("Called Option.unwrap() on a 'None' value");
		}
	}

	/**
	 * Returns the contained {@link Some} value if the option is {@link Some},
	 *  or the provided default value if the option is {@link None}.
	 *
	 * ---
	 * @example
	 * const option: Option<number> = Some(2);
	 * option.unwrapOr(0); // 2
	 *
	 * const option: Option<number> = None();
	 * option.unwrapOr(0); // 0
	 *
	 * @param defaultValue
	 * @returns {T} T
	 */
	unwrapOr(defaultValue: T): T {
		if (this.#type === OptionType.Some) {
			return this.#value;
		} else {
			return defaultValue;
		}
	}

	/**
	 * Returns the contained {@link Some} value if the option is {@link Some},
	 *  or the result of the provided function if the option is {@link None}.
	 *
	 * ---
	 * @example
	 * const k = 10;
	 * const option: Option<number> = Some(4);
	 * option.unwrapOrElse(() => 2 * k); // 4
	 *
	 * const option: Option<number> = None();
	 * option.unwrapOrElse(() => 2 * k); // 20
	 *
	 * @param callback
	 * @returns {T} T
	 */
	unwrapOrElse(callback: () => T): T {
		if (this.#type === OptionType.Some) {
			return this.#value;
		} else {
			return callback();
		}
	}

	/**
	 * Maps an Option<T> to Option<U> by applying a function to a contained
	 *  value (if {@link Some}), or returns None if the option is {@link None}.
	 *
	 * ---
	 * @example
	 * const option: Option<number> = Some<number>(2);
	 * option.map((x) => x * 2); // Some<number>(4)
	 * option.map((x) => x.toString()); // Some<string>("4")
	 *
	 * const option: Option<number> = None<number>();
	 * option.map((x) => x * 2); // None<number>()
	 * option.map((x) => x.toString()); // None<string>()
	 *
	 * @param {(value: T) => U} f
	 * @returns {Option<U>} Option<U>
	 */
	map<U>(f: (x: T) => U): Option<U> {
		if (this.#type === OptionType.Some) {
			return Some(f(this.#value));
		} else {
			return None();
		}
	}

	/**
	 * Calls a function with a reference to the contained value (if {@link Some}),
	 *  and returns the original Option. Does nothing if the option is {@link None}.
	 *
	 * >**NOTE**: In rust it's possible to pass an immutable reference to the
	 *  callback, but this is not possible in typescript / javascript.
	 *  The chosen workaround is to return the original option's value as a
	 *  Readonly<T>. Hopefully the code editors will warn the users if they
	 *  try to modify the value.
	 * ---
	 * @example
	 * const list = [1, 2, 3];
	 *
	 * const x = getArrayIndex(list, 1) // Some(2)
	 *     .inspect((x) => console.log("Got: '%d'", x)) // "Got: '2'"
	 *     .expect("List should be large enough");
	 *
	 * getArrayIndex(list, 4) // None()
	 *     .inspect((x) => console.log("Got: %d", x)) // Won't be called
	 * @param callback
	 * @returns
	 */
	inspect(callback: (value: T) => void): Option<T> {
		if (this.#type === OptionType.Some) {
			callback(this.#value as Readonly<T>);
		}
		return this;
	}

	/**
	 * Returns the provided default value if the option is {@link None},
	 *  or applies a function to the contained value if the option is {@link Some}.
	 *
	 * ---
	 * @example
	 * const x = Some<string>("foo");
	 * x.mapOr(42, (v) => v.length); // 3
	 *
	 * const x = None<string>();
	 * x.mapOr(42, (x) => x.length); // 42
	 *
	 * @param defaultValue
	 * @param f
	 * @returns
	 */
	mapOr<U>(defaultValue: U, f: (value: T) => U): U {
		if (this.#type === OptionType.Some) {
			return f(this.#value);
		} else {
			return defaultValue;
		}
	}

	/**
	 * Maps an Option<T> to U by applying a fallback function `defaultCallback`
	 *  to a contained {@link None} value, or function `f` to a contained
	 *  {@link Some} value.
	 *
	 * ---
	 * @example
	 * const httpCodeToMessage = (code: number): string => {
	 *   if (code == 404) {
	 *     return "Not found";
	 *   }
	 *     return "Internal server error";
	 * };
	 * 
	 * const errorCode = Some<number>(404);
	 * errorCode.mapOrElse(() => httpCodeToMessage(500), httpCodeToMessage); // "Not found"
	 *
	 * const errorCode = None<number>();
	 * errorCode.mapOrElse(() => httpCodeToMessage(500), httpCodeToMessage); // "Internal server error"
	 *

	 * @template U The return type of both functions
	 * @param defaultCallback The function to compute the default value if the option is {@link None}
	 * @param f The function to compute the value if the option is {@link Some}
	 * @returns U The result of either `f` or `defaultCallback`
	 */
	mapOrElse<U>(defaultCallback: () => U, f: (value: T) => U): U {
		if (this.#type === OptionType.Some) {
			return f(this.#value);
		} else {
			return defaultCallback();
		}
	}

	/**
	 * Transforms the {@link Option} into a {@link Result}, mapping `Some<T>(v)` to
	 *  `Ok<T>(v)` and `None` to `Err<E>(err)`.
	 *
	 * ---
	 * @example
	 * const x = some<string>("foo");
	 * x.okOr("NotFound"); // Ok("foo");
	 *
	 * const x = None<string>();
	 * x.okOr("NotFound"); // Err("NotFound");
	 * @param err The error value to put in the Err if the option is None
	 * @returns {Result<T, E>} The Result with the `Some` value in `T` and the `err` value in `E`
	 */
	okOr<E>(err: E): Result<T, E> {
		if (this.#type === OptionType.Some) {
			return Ok<T, E>(this.#value);
		} else {
			return Err<T, E>(err);
		}
	}

	/**
	 * Transforms the {@link Option} into a {@link Result}, mapping `Some<T>(v)`
	 *  to `Ok<T>(v)` and `None` to `Err<E>(errorCallback())`.
	 *
	 * ---
	 * @example
	 * const x = some<string>("foo");
	 * x.okOrElse(() => -1); // Ok<string, number>("foo");
	 *
	 * const x = None<string>();
	 * x.okOrElse(() => -1); // Err<string, number>(-1);
	 * @param errCallback The function to compute the error value if the option is None
	 * @returns {Result<T, E>} The Result with the `Some` value in `T` and the `errCallback()` value in `E`
	 */
	okOrElse<E>(errCallback: () => E): Result<T, E> {
		if (this.#type === OptionType.Some) {
			return Ok(this.#value);
		} else {
			return Err(errCallback());
		}
	}

	/**
	 * Returns {@link None} if the option is {@link None}, otherwise returns
	 *  `optb`.
	 *
	 * ---
	 * @example
	 * const x: Option<number> = Some(2);
	 * const y: Option<string> = None<string>();
	 * x.and(y); // None();
	 *
	 * const x: Option<number> = None();
	 * const y: Option<string> = Some("foo");
	 * x.and(y); // None();
	 *
	 * const x: Option<number> = Some(2);
	 * const y: Option<string> = Some("foo");
	 * x.and(y); // Some("foo");
	 *
	 * const x: Option<number> = None();
	 * const y: Option<string> = None();
	 * x.and(y); // None();
	 *
	 * @template U The type of `optb`
	 * @param {Option<U>} optb The option to return
	 * @returns {Option<U>}  The option `optb`
	 */
	and<U>(optb: Option<U>): Option<U> {
		if (this.#type === OptionType.Some) {
			return optb;
		} else {
			return None();
		}
	}

	/**
	 * Returns {@link None} if the option is {@link None}, otherwise calls `f`
	 *  with the wrapped value and returns the result.
	 *
	 * Some languages call this operation flatmap.
	 *
	 * Often used to chain together falliable operations that may return {@link None}.
	 *
	 * ---
	 * @example
	 * const findSquareRoot = (x: number) => {
	 *   if (x < 0) {
	 * 	  return None();
	 *   }
	 *   return Some(Math.sqrt(x));
	 * }
	 *
	 * const numberToString = (x: number) => {
	 *   return Some(x.toString());
	 * }
	 *
	 * Some<number>(4)
	 *   .andThen(findSquareRoot)  // Some<number>(2)
	 *   .andThen(numberToString); // Some<string>("2")
	 *
	 * None<number>()
	 *   .andThen(findSquareRoot)  // Won't be called
	 *   .andThen(numberToString); // Won't be called
	 *
	 * Some<number>(-1)
	 *   .andThen(findSquareRoot)  // None<number>()
	 *   .andThen(numberToString); // won't be called
	 *
	 * Some<number>(4)
	 *   .andThen(findSquareRoot)  // Some<number>(2)
	 *   .map((x) => -x);          // Some<number>(-2)
	 *   .andThen(findSquareRoot)  // None<number>()
	 *   .andThen(numberToString); // won't be called
	 *
	 * @param {(value: T) => Option<U>} f
	 * @returns {Option<U>}
	 *
	 */
	andThen<U>(f: (value: T) => Option<U>): Option<U> {
		if (this.#type === OptionType.Some) {
			return f(this.#value);
		} else {
			return None();
		}
	}

	/**
	 * Returns {@link None} if the option is {@link None}, otherwise calls
	 *  `predicate` with the wrapped value and returns:
	 *  - {@link Some} if `predicate` returns `true`
	 *  - {@link None} if `predicate` returns `false`
	 *
	 * This function works similar to Array.prototype.filter(). You can imagine
	 *  the `Option<T>` being an iterator over one or zero elements. `filter()`
	 *  lets you decide which elements to keep.
	 *
	 * ---
	 * @example
	 * const isEven = (x: number) => x % 2 === 0;
	 *
	 * Some(2).filter(isEven); // Some(2)
	 * Some(1).filter(isEven); // None()
	 * None<number>().filter(isEven); // None()
	 * @param {(value: T) => boolean} predicate
	 * @returns {Option<T>} The option that satisfies the predicate
	 */
	filter(predicate: (value: T) => boolean): Option<T> {
		if (this.#type === OptionType.Some && predicate(this.#value) === true) {
			return this;
		} else {
			return None();
		}
	}

	/**
	 * Returns the option if it contains a value, otherwise returns `optb`.
	 *
	 * ---
	 * @example
	 * const x = Some(2);
	 * const y = None();
	 *
	 * x.or(y); // Some(2)
	 *
	 * cosnt x = None();
	 * const y = Some(100);\
	 *
	 * x.or(y); // Some(100)
	 *
	 * const x = Some(2);
	 * const y = Some(100);
	 *
	 * x.or(y); // Some(2)
	 *
	 * const x = None<number>();
	 * const y = None<number>();
	 *
	 * x.or(y); // None()
	 * @param {Option<T>} optb The option to return
	 * @returns {Option<T>} The option
	 */
	or(optb: Option<T>): Option<T> {
		if (this.#type === OptionType.Some) {
			return this;
		} else {
			return optb;
		}
	}

	/**
	 * Returns the option if it contains a value, otherwise calls `f` and
	 * returns the result.
	 *
	 * ---
	 * @example
	 * const nobody = (): Option<string> => None();
	 * const vikings = (): Option<string> => Some("vikings");
	 *
	 * Some("Barbarians").orElse(vikings); // Some("Barbarians")
	 * None<string>().orElse(vikings); // Some("vikings")
	 * None<string>().orElse(nobody); // None()
	 * @param {() => Option<T>} f
	 * @returns {Option<T>}
	 */
	orElse(f: () => Option<T>): Option<T> {
		if (this.#type === OptionType.Some) {
			return this;
		} else {
			return f();
		}
	}

	/**
	 * Returns {@link Some} if exactly one of `this` or `optb` is {@link Some},
	 *  otherwise returns {@link None}.
	 *
	 * ---
	 * @example
	 * const x = Some(2);
	 * const y = None<number>();
	 * x.xor(y); // Some(2);
	 *
	 * cosnt x = None<number>();
	 * const y = Some(2);
	 * x.xor(y); // Some(2);
	 *
	 * const x = Some(2);
	 * const y = Some(2);
	 * x.xor(y); // None();
	 *
	 * const x = None<number>();
	 * const y = None<number>();
	 * x.xor(y); // None();
	 * @param {Option<T>} optb The second option to evaluate
	 * @returns {Option<T>} The only option of the two that is {@link Some}
	 */
	xor(optb: Option<T>): Option<T> {
		if (this.#type === OptionType.Some && optb.#type === OptionType.None) {
			return this;
		} else if (this.#type === OptionType.None && optb.#type === OptionType.Some) {
			return optb;
		}
		// if both are Some or both are None
		return None();
	}

	// TODO: test to ensure this works as expected.
	/**
	 * Inserts `value` into the option, then returns the option's value.
	 *
	 * If the option already contains a value, the old value is overwritten.
	 *
	 * See also {@link getOrInsert}, which doesn't update the value if the
	 *  option already contains {@link Some}.
	 *
	 * > **NOTE**: In Rust, it also returns a mutable reference to the value.
	 *  In Javascript / Typescript, primitives cannot be returned as references,
	 *  so this function returns the value instead. However, non-primitives can
	 *  and are returned as mutable references.
	 * ---
	 * @example
	 * // Primitives
	 * const opt = None<number>();
	 * const val = opt.insert(1);
	 *
	 * val; // 1
	 * opt.unwrap(); // 1
	 * const val2 = opt.insert(2);
	 *
	 * val2; // 2
	 * val2 = 3;
	 *
	 * opt.unwrap(); // 2 not 3, since number is primitive.
	 *
	 * // Non-primitives
	 * const opt = None<{name: string}>();
	 * const val = opt.insert({name: "bob"});
	 *
	 * val.name = "bobbert";
	 * opt.unwrap(); // {name: "bobbert"} // updated the object inside, since non-primitives are returned as references
	 * @param {T} value The value to insert
	 * @returns {T} The inserted value from the option
	 */
	insert(value: T): T {
		this.#value = value;
		this.#type = OptionType.Some;
		return this.#value;
	}

	// TODO: test to ensure this works as expected.
	/**
	 * Inserts `value` into the option if it is {@link None}, then returns the
	 *  option's value, as a reference when possible.
	 *
	 * > **NOTE**: In Rust, it also returns a mutable reference to the value.
	 *  In Javascript / Typescript, primitives cannot be returned as references,
	 *  so this function returns the value instead. However, non-primitives can
	 *  and are returned as mutable references.
	 *
	 * ---
	 * @example
	 * // Primitives
	 * const x = None<number>();
	 * const y = x.getOrInsert(5);
	 *
	 * y; // 5
	 * x.unwrap(); // 5
	 *
	 * y = 7;
	 * x.unwrap(); // 5 not 7, since number is primitive.
	 *
	 * // Non-primitives
	 * const x = None<{name: string}>();
	 * const y = x.getOrInsert({name: "bob"});
	 *
	 * y.name = "bobbert";
	 * x.unwrap(); // {name: "bobbert"}; // updated the object inside, since non-primitives are returned as references
	 * @param {T} value The value to insert, if the option is {@link None}
	 * @returns {T} The inserted value from the option, or the option's value if it is {@link Some}
	 */
	getOrInsert(value: T): T {
		if (this.#type === OptionType.Some) {
			return this.#value;
		} else {
			this.#value = value;
			this.#type = OptionType.Some;
			return this.#value;
		}
	}

	// TODO: test to ensure this works as expected.
	/**
	 * Inserts a value computed from `f` into the option if it is {@link None},
	 *  then returns the option's value, as a reference when possible.
	 *
	 * > **NOTE**: In Rust, it also returns a mutable reference to the value.
	 *  In Javascript / Typescript, primitives cannot be returned as references,
	 *  so this function returns the value instead. However, non-primitives can
	 *  and are returned as mutable references.
	 *
	 * ---
	 * @example
	 * // Primitives
	 * const x = None<number>();
	 * const y = x.getOrInsertWith(() => 5);
	 *
	 * y; // 5
	 * x.unwrap(); // 5
	 *
	 * y = 7;
	 * x.unwrap(); // 5 not 7, since number is primitive.
	 *
	 * // Non-primitives
	 * const x = None<{name: string}>();
	 * const y = x.getOrInsertWith(() => ({name: "bob"}));
	 *
	 * y.name = "bobbert";
	 * x.unwrap(); // {name: "bobbert"}; // updated the object inside, since non-primitives are returned as references
	 * @param {() => T} f The function to compute the value to insert, if the option is {@link None}
	 * @returns {T} The inserted value from the option, or the option's value if it is {@link Some}
	 */
	getOrInsertWith(f: () => T): T {
		if (this.#type === OptionType.Some) {
			return this.#value;
		} else {
			this.#value = f();
			this.#type = OptionType.Some;
			return this.#value;
		}
	}

	/**
	 * Takes the value out of the option, leaving a {@link None} in its place.
	 *
	 * ---
	 * @example
	 * const x = Some(2);
	 * const y = x.take();
	 *
	 * x; // None()
	 * y; // Some(2)
	 *
	 * const x = None();
	 * const y = x.take();
	 *
	 * x; // None()
	 * y; // None()
	 *
	 * @returns {Option<T>} The taken value, or {@link None} if the option is {@link None}
	 */
	take(): Option<T> {
		if (this.#type === OptionType.Some) {
			const oldValue = structuredClone(this.#value);
			this.#value = undefined as T;
			this.#type = OptionType.None;
			return Some(oldValue);
		} else {
			return this;
		}
	}

	// TODO: test to ensure this works as expected.
	/**
	 * Takes the value out of the option, but only if the predicate evaluates to `true`.
	 *
	 * In other words, replaces `this` with {@link None} if the predicate returns `true`.
	 * This method operates similar to {@link take} but conditional.
	 *
	 * > **NOTE**: In Rust, a mutable reference to the value is passed to the predicate.
	 *  In Javascript / Typescript, primitives cannot be returned as references,
	 *  so this function passes a copy of the value instead. However, non-primitives can
	 *  and are passed as mutable references by default.
	 * ---
	 * @example
	 *
	 * // Primitives
	 * const x = Some(42);
	 * const prev = x.takeIf((x) => {
	 *   x += 1; // This is only updated in this local scope
	 *   if (x === 42) {
	 *     return false;
	 *   } else {
	 *     return false;
	 *   }
	 * });
	 *
	 * x; Some(42);
	 * prev; None();
	 *
	 * const prev = x.takeIf((x) => x === 42);
	 * x; // None();
	 * prev; // Some(42);
	 *
	 * // Non-primitives
	 * const x = Some({name: "bob"});
	 * const prev = x.takeIf((x) => {
	 *   x.name = "bobbert"; // This will update the option's value, since non-primitives are passed by reference
	 *   return false;
	 * });
	 *
	 * x; // Some({name: "bobbert"});
	 * prev; // None();
	 *
	 * const prev = x.takeIf((x) => x.name === "bobbert");
	 * x; // None();
	 * prev; // Some({name: "bobbert"});
	 *
	 *
	 * @param {(value: T) => boolean} predicate The predicate to check
	 * @returns {Option<T>} The taken value, {@link None} if the option is {@link None} or the predicate does not match
	 */
	takeIf(predicate: (value: T) => boolean): Option<T> {
		if (this.#type === OptionType.Some && predicate(this.#value)) {
			return this.take();
		} else {
			return None();
		}
	}

	replace(value: T): Option<T> {
		if (this.isSome()) {
			const oldValue = structuredClone(this.#value);
			this.#value = value;
			return Some(oldValue);
		} else {
			this.#value = value;
			this.#type = OptionType.Some;
			return None();
		}
	}

	zip<U>(other: Option<U>): Option<[T, U]> {
		if (this.isSome() && other.isSome()) {
			return Some([this.#value, other.#value]);
		} else {
			return None();
		}
	}

	zipWith<U, V>(other: Option<U>, zipFunction: (a: T, b: U) => V): Option<V> {
		if (this.isSome() && other.isSome()) {
			return Some(zipFunction(this.#value, other.#value));
		} else {
			return None();
		}
	}

	unzip<A, B>(this: Option<[A, B]>): [Option<A>, Option<B>] {
		if (this.isSome() && Array.isArray(this.#value) && this.#value.length === 2) {
			return [Some(this.#value[0]), Some(this.#value[1])];
		} else {
			return [None(), None()];
		}
	}
}

/**
 * Creates a new `Some` option.
 * It is used to represent the presence of a value.
 *
 * ---
 * @example
 * const divide = (numerator: number, denominator: number): Option<number> => {
 *   if (denominator === 0) {
 *     return None();
 * 	 } else {
 *     return Some(numerator / denominator);
 * 	 }
 * };
 *
 * const result = divide(4, 2);
 * result.isSome(); // true
 *
 * const result = divide(4, 0);
 * result.isSome(); // false
 *
 * @template T
 * @param value
 * @returns {Option<T>} Option<T>
 */
const Some = <T>(value: T): Option<T> => {
	return new Option(value, OptionType.Some);
};

/**
 * Creates a new `None` option.
 * It is used to represent the absence of a value.
 *
 * ---
 * @example
 * const findNumberInArray = (array: number[], number: number): Option<number> => {
 *   if (array.length === 0) {
 *     return None();
 *   }
 *   const item = array.find((x) => x === number);
 *   return item ? Some(item) : None();
 * };
 *
 * const option: Option<number> = findNumberInArray([1, 2, 3], 2);
 * option.isSome(); // true
 *
 * const option: Option<number> = findNumberInArray([], 2);
 * option.isSome(); // false
 *
 * @template T
 * @returns {Option<T>} Option<T>
 */
const None = <T>(): Option<T> => {
	return new Option(undefined as T, OptionType.None);
};

export { Option, Some, None };
