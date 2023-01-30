import { IErr, IOk } from "./interfaces";

class Result<T, E> {
	ok!: T;
	err!: E;

	constructor(data: IOk<T> | IErr<E>) {
		if ("ok" in data) {
			this.ok = data.ok;
		} else if ("err" in data) {
			this.err = data.err;
		} else {
			throw new Error("Bad constructor format!");
		}
	}

	/**
	 * Returns `true` if the result is `Ok`.
	 *
	 * @returns {boolean}  boolean
	 * @memberof Result
	 *
	 * @example
	 * const result: Result<number, string> = new Ok(-3);
	 * result.isOk(); // true
	 * @example
	 * const result: Result<number, string> = new Err("Error Info");
	 * result.isOk(); // false
	 */
	isOk(): boolean {
		if ("ok" in this) {
			return true;
		} else if ("err" in this) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns `true` if the result is `Ok` and the value inside of it matches a predicate.
	 *
	 * @param {(x: T) => boolean} f predicate
	 * @returns {boolean} boolean
	 * @memberof Result
	 *
	 * @example
	 * const result: Result<number, string> = new Ok(2);
	 * result.isOkAnd((x) => x > 1); // true
	 * @example
	 * const result: Result<number, string> = new Ok(0);
	 * result.isOkAnd((x) => x > 1); // false
	 * @example
	 * const result: Result<number, string> = new Err("hey");
	 * result.isOkAnd((x) => x > 1); // false
	 */
	isOkAnd(f: (x: T) => boolean): boolean {
		if (this.isOk()) {
			return f(this.unwrap());
		} else if ("err" in this) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns `true` if the result is `Err`.
	 *
	 * @returns {boolean} boolean
	 * @memberof Result
	 *
	 * @example
	 * const result: Result<number, string> = new Ok(-3);
	 * result.isErr(); // false
	 * @example
	 * const result: Result<number, string> = new Err("Some error");
	 * result.isErr(); // true
	 */
	isErr(): boolean {
		if ("err" in this) {
			return true;
		} else if ("ok" in this) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns `true` if the result is `Err` and the value inside of it matches a predicate.
	 *
	 * @param {(x: E) => boolean} f predicate
	 * @returns {boolean} boolean
	 * @memberof Result
	 *
	 * @external
	 * enum ErrorKind {
	 *   NotFound,
	 *   PermissionDenied
	 * }
	 * @example
	 * const result: Result<number, ErrorKind> = new Err(ErrorKind.NotFound);
	 * result.isErrAnd((x) => x === ErrorKind.NotFound); // true
	 * @example
	 * const result: Result<number, ErrorKind> = new Err(ErrorKind.PermissionDenied);
	 * result.isErrAnd((x) => x === ErrorKind.NotFound); // false
	 * @example
	 * const result: Result<number, ErrorKind> = new Ok(123);
	 * result.isErrAnd((x) => x === ErrorKind.NotFound); // false
	 */
	isErrAnd(f: (x: E) => boolean): boolean {
		if (this.isOk()) {
			return false;
		} else if (this.isErr()) {
			return f(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to the
	 * contained `Ok`'s value, leaving the `Err`'s value untouched.
	 *
	 * This method can be used to compose the results of two or more functions.
	 *
	 * @param {(value: T) => U} op
	 * @returns {Result<U, E>}  Result<U, E>
	 * @memberof Result
	 *
	 * @example
	 * const result: Result<string, string> = new Ok("foo");
	 * result.map((x) => x.length); // Ok(3)
	 * @example
	 * const result: Result<number, string> = new Ok(12);
	 * result.map((x) => x.toString()); // Ok("12")
	 * @example
	 * const result: Result<string, number> = new Err(-1);
	 * result.map((x) => x.length); // Err(-1)
	 * @example
	 * const result = new Ok(5)                   // Ok(5)
	 *     .map((x) => x * x)                     // Ok(25)
	 *     .map((x) => x.toString())              // Ok("25")
	 *     .map((x) => " Number is: " + x + " ")  // Ok(" Number is: 25 ")
	 *     .map((x) => x.trim());                 // Ok("Number is: 25")
	 *
	 * console.log(result);                       // Ok("Number is: 25")
	 */
	map<U>(op: (value: T) => U): Result<U, E> {
		if (this.isOk()) {
			return new Ok<U, E>(op(this.unwrap()));
		} else if (this.isErr()) {
			return new Err<U, E>(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns the provided `alternative` if the result is `Err`, or
	 * applies a function to the contained value if the result is `Ok`
	 *
	 * @param {U} alternative
	 * @param {(value: T) => U} f function to apply
	 * @returns {U} U
	 * @memberof Result
	 *
	 * @example
	 * const result: Result<string, string> = new Ok("foo");
	 * result.mapOr(42, (x) => x.length); // 3
	 * @example
	 * const result: Result<string, string> = new Err("bar");
	 * result.mapOr(42, (x) => x.length); // 42
	 */
	mapOr<U>(alternative: U, f: (value: T) => U): U {
		if (this.isOk()) {
			return f(this.unwrap());
		} else if (this.isErr()) {
			return alternative;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Maps a `Result<T, E>` to `U` by applying a a fallback function `altF` to
	 * a contained `Err` value, or function `f` to a contained `Ok` value.
	 *
	 * @param {(err: E) => U} altF
	 * @param {(value: T) => U} f
	 * @returns {U} U
	 * @memberof Result
	 *
	 * @extern
	 * 	const stringErrToNum = (error: string): number => {
	 *	if (error == "OutOfBounds") {
	 *		return -1;
	 *	} else {
	 *		return -2;
	 *	}
	 * };
	 * @example
	 * const result: Result<string, string> = new Err("OutOfBounds");
	 * result.mapOrElse((e) => stringErrToNum(e),(v) => v.length) // -1
	 * @example
	 * const k = 21;
	 * const result: Result<string, string> = new Ok("foo");
	 * result.mapOrElse((_e) => k * 2, (v) => v.length); // 3
	 * @example
	 * const k = 21;
	 * const result: Result<string, string> = new Err("bar");
	 * result.mapOrElse((_e) => k * 2, (v) => v.length); // 42
	 */
	mapOrElse<U>(altF: (err: E) => U, f: (value: T) => U): U {
		if (this.isOk()) {
			return f(this.unwrap());
		} else if (this.isErr()) {
			return altF(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	mapErr<F>(op: (err: E) => F): Result<T, F> {
		if (this.isOk()) {
			return new Ok(this.unwrap());
		} else if (this.isErr()) {
			return new Err(op(this.unwrapErr()));
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	expect(msg: string): T {
		if (this.isOk()) {
			return this.unwrap();
		} else if (this.isErr()) {
			throw new Error(msg + ": " + this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	unwrap(): T {
		if (this && this.isOk()) {
			return this.ok;
		} else {
			throw new Error("Attempted to unwrap an Err.");
		}
	}

	expectErr(msg: string): E {
		if (this.isErr()) {
			return this.unwrapErr();
		} else if (this.isOk()) {
			throw new Error(msg + ": " + this.unwrap());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	unwrapErr(): E {
		if (this && this.isErr()) {
			return this.err;
		} else {
			throw new Error("Attempted to unwrapErr an Ok.");
		}
	}

	and<U>(res: Result<U, E>): Result<U, E> {
		if (this.isErr()) {
			return new Err<U, E>(this.err);
		} else if (res.isOk()) {
			return res;
		} else if (res.isErr()) {
			return new Err<U, E>(res.err);
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	andThen<U>(op: (value: T) => Result<U, E>): Result<U, E> {
		if (this.isOk()) {
			return op(this.unwrap());
		} else {
			return new Err(this.unwrapErr());
		}
	}

	or(res: Result<T, E>): Result<T, E> {
		if (this.isErr()) {
			return res;
		} else if (this.isOk()) {
			return this;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	orElse<F>(op: (err: E) => Result<T, F>): Result<T, F> {
		if (this.isOk()) {
			return new Ok(this.unwrap());
		} else if (this.isErr()) {
			return op(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	unwrapOr(alternative: T): T {
		if (this.isOk()) {
			return this.unwrap();
		} else if (this.isErr()) {
			return alternative;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	unwrapOrElse(op: (err: E) => T): T {
		if (this.isOk()) {
			return this.unwrap();
		} else if (this.isErr()) {
			return op(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	contains<U extends T>(x: U): boolean {
		if (this.isOk()) {
			return this.unwrap() === x;
		} else if (this.isErr()) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	containsErr<F extends E>(x: F): boolean {
		if (this.isErr()) {
			return this.unwrapErr() === x;
		} else if (this.isOk()) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static async fromPromise<T>(promise: Promise<T | unknown>): Promise<Result<T, any>> {
		return await promise
			.then((value) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return new Ok<T, any>(value as T);
			})
			.catch((err) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return new Err<T, any>(err);
			});
	}

	static async fromPromiseStrict<T>(promise: Promise<T>): Promise<Result<T, unknown>> {
		return await promise
			.then((value: T) => {
				return new Ok<T, unknown>(value);
			})
			.catch((err: unknown) => {
				return new Err<T, unknown>(err);
			});
	}
}

class Ok<T, E> extends Result<T, E> {
	constructor(data: T) {
		const okType: IOk<T> = { ok: data };
		super(okType);
	}
}

class Err<T, E> extends Result<T, E> {
	constructor(err: E) {
		const errObj: IErr<E> = { err: err };
		super(errObj);
	}
}

export { Result, Ok, Err };
