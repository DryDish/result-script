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
		if (this.isSome()) {
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
	 * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to
	 *  `Ok(v)` and `None` to `Err(err)`.
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

	okOrElse<E>(errorCallback: () => E): Result<T, E> {
		if (this.isSome()) {
			return Ok(this.#value);
		} else {
			return Err(errorCallback());
		}
	}

	and<U>(otherOption: Option<U>): Option<U> {
		if (this.isSome() && otherOption.isSome()) {
			return otherOption;
		} else {
			return None();
		}
	}

	andThen<U>(optionCallback: (value: T) => Option<U>): Option<U> {
		if (this.isSome()) {
			return optionCallback(this.#value);
		} else {
			return None();
		}
	}

	filter(predicate: (value: T) => boolean): Option<T> {
		if (this.isSome() && predicate(this.#value)) {
			return this;
		} else {
			return None();
		}
	}

	or(otherOption: Option<T>): Option<T> {
		if (this.isSome()) {
			return this;
		} else {
			return otherOption;
		}
	}

	orElse(callback: () => Option<T>): Option<T> {
		if (this.isSome()) {
			return this;
		} else {
			return callback();
		}
	}

	insert(value: T): T {
		this.#value = value;
		this.#type = OptionType.Some;
		return this.#value;
	}

	getOrInsert(altValue: T): T {
		if (this.isSome()) {
			return this.#value;
		} else {
			this.#value = altValue;
			this.#type = OptionType.Some;
			return this.#value;
		}
	}

	getOrInsertWith(callback: () => T): T {
		if (this.isSome()) {
			return this.#value;
		} else {
			this.#value = callback();
			this.#type = OptionType.Some;
			return this.#value;
		}
	}

	take(): Option<T> {
		if (this.isSome()) {
			const oldValue = structuredClone(this.#value);
			this.#value = undefined as T;
			this.#type = OptionType.None;
			return Some(oldValue);
		} else {
			return this;
		}
	}

	takeIf(predicate: (value: T) => boolean): Option<T> {
		if (this.isSome() && predicate(this.#value)) {
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
