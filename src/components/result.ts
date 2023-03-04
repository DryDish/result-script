import { IErr, IOk } from "./interfaces";
import { isDeepStrictEqual } from "node:util";

class Result<T, E> {
	ok!: T;
	err!: E;

	/**
	 * Creates an instance of Result.
	 * @param {({"ok": T} | {"err": E})} data
	 * @memberof Result
	 */
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
	 * Returns `true` if the result is {@link Ok}.
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Ok(-3);
	 * result.isOk(); // true
	 *
	 * const result: Result<number, string> = new Err("Error Info");
	 * result.isOk(); // false
	 * @returns {boolean}  boolean
	 * @memberof Result
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
	 * Returns `true` if the result is {@link Ok} and the value inside of it matches a predicate.
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Ok(2);
	 * result.isOkAnd((x) => x > 1); // true
	 *
	 * const result: Result<number, string> = new Ok(0);
	 * result.isOkAnd((x) => x > 1); // false
	 *
	 * const result: Result<number, string> = new Err("hey");
	 * result.isOkAnd((x) => x > 1); // false
	 * @param {(x: T) => boolean} f predicate
	 * @returns {boolean} boolean
	 * @memberof Result
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
	 * Returns `true` if the result is {@link Err}.
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Ok(-3);
	 * result.isErr(); // false
	 *
	 * const result: Result<number, string> = new Err("Some error");
	 * result.isErr(); // true
	 * @returns {boolean} boolean
	 * @memberof Result
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
	 * Returns `true` if the result is {@link Err} and the value inside of it matches a predicate.
	 *
	 *  ---
	 * @example
	 * const result: Result<number, ErrorKind> = new Err(ErrorKind.NotFound);
	 * result.isErrAnd((x) => x === ErrorKind.NotFound); // true
	 *
	 * const result: Result<number, ErrorKind> = new Err(ErrorKind.PermissionDenied);
	 * result.isErrAnd((x) => x === ErrorKind.NotFound); // false
	 *
	 * const result: Result<number, ErrorKind> = new Ok(123);
	 * result.isErrAnd((x) => x === ErrorKind.NotFound); // false
	 * @param {(x: E) => boolean} f predicate
	 * @returns {boolean} boolean
	 * @memberof Result
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
	 * result's {@link Ok} value, leaving the {@link Err} untouched.
	 *
	 * This method can be used to compose the results of two or more functions.
	 *
	 * ---
	 * @example
	 * const result: Result<string, string> = new Ok("foo");
	 * result.map((x) => x.length); // Ok(3)
	 *
	 * const result: Result<number, string> = new Ok(12);
	 * result.map((x) => x.toString()); // Ok("12")
	 *
	 * const result: Result<string, number> = new Err(-1);
	 * result.map((x) => x.length); // Err(-1)
	 *
	 * const result = new Ok(5)                  // Ok(5)
	 *     .map((x) => x * x)                    // Ok(25)
	 *     .map((x) => x.toString())             // Ok("25")
	 *     .map((x) => " Number is: " + x + " ") // Ok(" Number is: 25 ")
	 *     .map((x) => x.trim());                // Ok("Number is: 25")
	 *
	 * console.log(result);                      // Ok("Number is: 25")
	 * @template U
	 * @param {(value: T) => U} op
	 * @returns {Result<U, E>}  Result<U, E>
	 * @memberof Result
	 *
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
	 * Returns the provided `alternative` if the result is {@link Err}, or
	 * applies a function to the contained value if the result is {@link Ok}
	 *
	 * ---
	 * @example
	 * const result: Result<string, string> = new Ok("foo");
	 * result.mapOr(42, (x) => x.length); // 3
	 *
	 * const result: Result<string, string> = new Err("bar");
	 * result.mapOr(42, (x) => x.length); // 42
	 * @template U
	 * @param {U} alternative
	 * @param {(value: T) => U} f function to apply
	 * @returns {U} U
	 * @memberof Result
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
	 * a contained {@link Err} value, or function `f` to a contained {@link Ok} value.
	 *
	 * This method can be used to unpack a successful result while handling an
	 * error.
	 *
	 * ---
	 * @example
	 * const k = 21;
	 *
	 * const result: Result<string, string> = new Err("OutOfBounds");
	 * result.mapOrElse((e) => stringErrToNum(e),(v) => v.length) // -1
	 *
	 * const result: Result<string, string> = new Ok("foo");
	 * result.mapOrElse((_e) => k * 2, (v) => v.length); // 3
	 *
	 * const result: Result<string, string> = new Err("bar");
	 * result.mapOrElse((_e) => k * 2, (v) => v.length); // 42
	 *
	 * const stringErrToNum = (error: string): number => {
	 *    if (error == "OutOfBounds") {
	 *        return -1;
	 *    }
	 *    return -2;
	 * };
	 * @template U
	 * @param {(err: E) => U} altF
	 * @param {(value: T) => U} f
	 * @returns {U} U
	 * @memberof Result
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

	/**
	 * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a
	 * results' {@link Err} value, leaving its {@link Ok} value untouched.
	 *
	 * This function can be used to pass through a successful result while
	 * handling an error.
	 * 
	 * ---
	 * @example
	 * const stringify = (x: number): string => `error code is: ${x}`;

	 * const result: Result<number, number> = new Ok(2);
	 * result.mapErr(stringify); // Ok(2)
	 * 
	 * const result: Result<number, number> = new Err(13);
	 * result.mapErr(stringify); // Err("error code is: 13")
	 * @template F
	 * @param {(err: E) => F} op
	 * @returns {Result<T, F>} Result<T, F>
	 * @memberof Result
	 */
	mapErr<F>(op: (err: E) => F): Result<T, F> {
		if (this.isOk()) {
			return new Ok(this.unwrap());
		} else if (this.isErr()) {
			return new Err(op(this.unwrapErr()));
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns the contained {@link Ok} value. Throws an `Error` if the Result
	 * is {@link Err}.
	 *
	 * Because this method may throw an `Error`, its use is generally
	 * discouraged. Instead, use conditions to check for {@link Err} explicitly
	 * , or call {@link unwrapOr} or {@link unwrapOrElse}.
	 *
	 * `expect` messages should be used to describe the reason you _expect_ the
	 * `Result` should be `Ok`.
	 *
	 * In this example the function getEnv returns a Result:
	 * ```typescript
	 * const path: string = getEnv("IMPORTANT_PATH").expect("Env variable 'PATH_NAME' should be set by dotEnv.");'
	 * ```
	 *
	 * **Hint**: If you are having trouble remembering how to phrase expect
	 * error messages remember to focus on the word "should" as in "env
	 * variable should be set by ..." or "the given binary should be available
	 * and executable by the current user".
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Err("emergency failure");
	 * result.expect("Testing expect"); // throws Error with the text: 'Testing expect: "emergency failure"'
	 *
	 * const result: Result<number, string> = new Ok(123);
	 * result.expect("Testing expect"); // 123;
	 * @throws {Error} `Error` with text: `${msg} :` + the contents of the `Err`.
	 * @param {string} msg
	 * @returns {T} T
	 * @memberof Result
	 */
	expect(msg: string): T {
		if (this.isOk()) {
			return this.unwrap();
		} else if (this.isErr()) {
			throw new Error(msg + ": " + JSON.stringify(this.unwrapErr()));
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns the contained {@link Ok} value. Throws an `Error` if the Result
	 * is {@link Err}.
	 *
	 * Because this method may throw an `Error`, its use is generally
	 * discouraged. Instead, use conditions to check for {@link Err} explicitly
	 * , or call {@link unwrapOr} or {@link unwrapOrElse}.
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Ok(2);
	 * result.unwrap(); // 2
	 *
	 * const result: Result<number, string> = new Err("emergency failure");
	 * result.unwrap(); // Throws Error 'Called Result.unwrap() on an Err value: "emergency failure"'
	 *
	 * @returns {T} T
	 * @memberof Result
	 */
	unwrap(): T {
		if (this && this.isOk()) {
			return this.ok;
		} else {
			throw new Error("Called Result.unwrap() on an Err value: " + JSON.stringify(this.unwrapErr()));
		}
	}

	/**
	 * Returns the contained {@link Err}. Throws an `Error` if the Result
	 * is {@link Ok}.
	 *
	 * Throws an error if the value is an {@link Ok}, with the error message
	 * including the passed `msg`, and the content of the {@link Ok}.
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Ok(10);
	 * result.expectErr("Testing expectErr"); // Throws Error "Testing expectErr: 10"
	 *
	 * const result: Result<number, string> = new Err("Some Error");
	 * result.expectErr("Testing expectErr"); // "Some Error"
	 * @param {string} msg
	 * @returns {E} E
	 * @memberof Result
	 */
	expectErr(msg: string): E {
		if (this.isErr()) {
			return this.unwrapErr();
		} else if (this.isOk()) {
			throw new Error(msg + ": " + JSON.stringify(this.unwrap()));
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns the contained {@link Err} value. Throws an `Error` if the Result
	 * is {@link Ok}.
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Ok(2);
	 * result.unwrapErr(); // Throws Error: 'Called Result.unwrapErr() on an Ok value: 2'
	 *
	 * const result: Result<number, string> = new Err("emergency failure");
	 * result.unwrapErr(); // "emergency failure"
	 *
	 * @returns {E} E
	 * @memberof Result
	 */
	unwrapErr(): E {
		if (this && this.isErr()) {
			return this.err;
		} else {
			throw new Error("Called Result.unwrapErr() on an Ok value: " + JSON.stringify(this.unwrap()));
		}
	}

	/**
	 * Returns `res` if the result is {@link Ok}. otherwise returns the
	 * {@link Err} value of 'this'.
	 *
	 * ---
	 * @example
	 * const x: Result<number, string> = new Ok(2);
	 * const y: Result<string, string> = new Err("late error");
	 * x.and(y); // Err("late error")
	 *
	 * const x: Result<number, string> = new Err("early error");
	 * const y: Result<string, string> = new Ok("foo");
	 * x.and(y); // Err("early error")
	 *
	 * const x: Result<number, string> = new Err("not a 2");
	 * const y: Result<string, string> = new Err("late error");
	 * x.and(y); // Err("not a 2")
	 *
	 * const x: Result<number, string> = new Ok(2);
	 * const y: Result<string, string> = new Ok("Different Result Type");
	 * x.and(y); // Ok("Different Result Type")
	 *
	 * @template U
	 * @param {Result<U, E>} res
	 * @returns {Result<U, E>} Result<U, E>
	 * @memberof Result
	 */
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

	/**
	 * Calls `op` if the result is {@link Ok}, otherwise returns the
	 * {@link Err} value of 'this'.
	 *
	 * This function can be used for control flow based on `Result` values.
	 *
	 * ---
	 * @example
	 * const result: Result<string, ErrorMessage<string, string>> = validateStringType("banana")
	 *   .andThen(capitalizeFirstLetter)
	 *   .andThen((x) => validateCorrectString(x, "Banana")); // Ok("Banana")
	 *
	 * const result: Result<string, ErrorMessage<string, string>> = validateStringType("pineapple")
	 *   .andThen(capitalizeFirstLetter)
	 *   .andThen((x: string) => validateCorrectString(x, "Banana")); // Err({ error: "InvalidCharSequenceError", detail: "Was expecting the char sequence: 'Banana' but got: 'Pineapple' })
	 *
	 * @template U
	 * @param {(value: T) => Result<U, E>} op
	 * @returns {Result<U, E>} Result<U, E>
	 * @memberof Result
	 */
	andThen<U>(op: (value: T) => Result<U, E>): Result<U, E> {
		if (this.isOk()) {
			return op(this.unwrap());
		} else {
			return new Err(this.unwrapErr());
		}
	}

	/**
	 * Returns `res` if the result is {@link Err}, otherwise returns the
	 * {@link Ok} value of 'this'.
	 *
	 * ---
	 * @example
	 * const x: Result<number, string> = new Ok(2);
	 * const y: Result<number, string> = new Err("Late error");
	 * x.or(y); // Ok(2)
	 *
	 * const x: Result<number, string> = new Err("Early error");
	 * const y: Result<number, string> = new Ok(2);
	 * x.or(y); // Ok(2)
	 *
	 * const x: Result<number, string> = new Err("Not a 2");
	 * const y: Result<number, string> = new Err("Late error");
	 * x.or(y); // Err("Late error")
	 *
	 * const x: Result<number, string> = new Ok(2);
	 * const y: Result<number, string> = new Ok(1234);
	 * x.or(y); // Ok(2)
	 *
	 * @param {Result<T, E>} res
	 * @returns {Result<T, E>} Result<T, E>
	 * @memberof Result
	 */
	or(res: Result<T, E>): Result<T, E> {
		if (this.isErr()) {
			return res;
		} else if (this.isOk()) {
			return this;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Calls `op` if the result is {@link Err}, otherwise returns the
	 * {@link Ok} value of 'this'.
	 *
	 * This function can be used for control flow based on result values.
	 *
	 * ---
	 * @example
	 * const sq = (x: number): Result<number, number> => new Ok(x * x);
	 * const err = (x: number): Result<number, number> => new Err(x);
	 *
	 * new Ok<number, number>(2).orElse(sq).orElse(sq);    // Ok(2)
	 * new Ok<number, number>(2).orElse(err).orElse(sq);   // Ok(2)
	 * new Err<number, number>(3).orElse(sq).orElse(err);  // Ok(9)
	 * new Err<number, number>(3).orElse(err).orElse(err); // Err(3)
	 *
	 * @template F
	 * @param {(err: E) => Result<T, F>} op
	 * @returns {Result} Result<T, F>
	 * @memberof Result
	 */
	orElse<F>(op: (err: E) => Result<T, F>): Result<T, F> {
		if (this.isOk()) {
			return new Ok(this.unwrap());
		} else if (this.isErr()) {
			return op(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns the contained {@link Ok} value or a provided `alternative` if
	 * the result is an {@link Err}.
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Ok(9);
	 * result.unwrapOr(2); // 9
	 *
	 * const result: Result<number, string> = new Err("error");
	 * result.unwrapOr(2); // 2
	 *
	 * @param {T} alternative
	 * @returns {T} T
	 * @memberof Result
	 */
	unwrapOr(alternative: T): T {
		if (this.isOk()) {
			return this.unwrap();
		} else if (this.isErr()) {
			return alternative;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns the contained {@link Ok} value or computes it from the function
	 * `op`.
	 *
	 * ---
	 * @example
	 * const count = (x: string): number => x.length;
	 *
	 * const result: Result<number, string> = new Ok(9);
	 * result.unwrapOrElse(count); // 9
	 *
	 * const result: Result<number, string> = new Err("foo");
	 * result.unwrapOrElse(count); // 3
	 * @param {(err: E) => T} op
	 * @returns {T} T
	 * @memberof Result
	 */
	unwrapOrElse(op: (err: E) => T): T {
		if (this.isOk()) {
			return this.unwrap();
		} else if (this.isErr()) {
			return op(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns `true` if the Result is an {@link Ok} containing the given value.
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Ok(2);
	 * result.contains(2); // true
	 *
	 * const result: Result<number, string> = new Ok(3);
	 * result.contains(2); // false
	 *
	 * const result: Result<number, string> = new Err("Some error message");
	 * result.contains(2); // false
	 *
	 * const result: Result<unknown, string> = new Ok({ data: 123 })
	 * result.contains({ data: 123 });   // true
	 * result.contains({ data: "123" }); // false
	 * @template U
	 * @param {U} x Variable to compare to the Result's {@link Ok}.
	 * @returns {boolean} boolean
	 * @memberof Result
	 */
	contains<U extends T>(x: U): boolean {
		if (this.isOk()) {
			return isDeepStrictEqual(this.unwrap(), x);
		} else if (this.isErr()) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	/**
	 * Returns `true` if the result is an {@link Err} containing the given value.
	 *
	 * ---
	 * @example
	 * const result: Result<number, string> = new Ok(2);
	 * result.containsErr("Some error message"); // false
	 *
	 * const result: Result<number, string> = new Err("Some error message");
	 * result.containsErr("Some error message"); // true
	 *
	 * const result: Result<number, string> = new Err("Some other error message");
	 * result.containsErr("Some error message"); // false
	 *
	 * const result: Result<number, ErrMsg> = new Err({ detail: "Some error has occurred" });
	 * result.containsErr({ detail: "Some error has occurred" });       // true
	 * result.containsErr({ detail: "Some other error has occurred" }); // false
	 * @template F
	 * @param {F} x Variable to compare to the Result's {@link Err}.
	 * @returns {boolean} boolean
	 * @memberof Result
	 */
	containsErr<F extends E>(x: F): boolean {
		if (this.isErr()) {
			return isDeepStrictEqual(this.unwrapErr(), x);
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
