import { Result, Ok, Err } from "./result";

type GetOk<R> = R extends Result<infer T, unknown> ? T : never;
type GetErr<R> = R extends Result<unknown, infer E> ? E : never;
/**
 * Async implementation of the {@link Result} type.
 *
 * It extends {@link Promise} by adding some core {@link Result} methods to
 * allow chaining logic to occur in Promises without having to await on every
 * step.
 *
 * ---
 * @example
 * const getResponseBody = async (response: Response): Promise<Result<DummyProduct, ErrorMessage>> => {
 *   if (response.status === 200) {
 *     try {
 *       const body = await response.json();
 *       return Ok(body);
 *     } catch (err) {
 *       return Err({ error: "FailedToParseBody", detail: err });
 *     }
 *   }
 *   return Err({
 *     error: `StatusCode${response.status}`,
 *     detail: "Non 200 status code returned",
 *   });
 * };
 *
 * const result = await Result.fromPromise(fetch("https://dummyjson.com/products/1"))
 *   .andThen(getResponseBody)
 *   .map((responseBody) => responseBody.rating);
 *
 * result.isOk();   //true
 * result.unwrap(); // 4.69
 * @class ResultAsync
 * @extends {Promise<R>}
 * @template R The specific Result type being wrapped (e.g. Result<number, Error>).
 */
class ResultAsync<R extends Result<unknown, unknown>> extends Promise<R> {
	/**
	 * Maps a `ResultAsync<Result<T, E>>` to `ResultAsync<Result<U, E>>` by
	 * applying a function to the result's {@link Ok} value, leaving the
	 * {@link Err} untouched.
	 *
	 * This method can be used to compose the results of two or more functions.
	 *
	 * ---
	 * #### Note
	 * If the passed function `func` throws an error, it will be caught and
	 * wrapped into an {@link Err}. Preferably use {@link andThen} if you want
	 * to chain a function that can fail instead, as that allows you to
	 * better handle the potential errors.
	 *
	 * ---
	 * @example
	 * const getNumberDelayedResolve = async (number: number, msWait: number) => {
	 *   return new Promise<number>((res) => {
	 *     setTimeout(() => res(number), msWait);
	 *   });
	 * }
	 *
	 * const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)) //3
	 *   .map((x) => x * 2) // 6
	 *   .map((x) => getNumberDelayedResolve(x + 3, 100)); // 9
	 *
	 * result.isOk();   // true
	 * result.unwrap(); // 9
	 * @template U The new success type.
	 * @param {(data: GetOk<R>) => Promise<U> | U} func Transformation function for the success value.
	 * @returns {ResultAsync<Result<U, GetErr<R>>>} A new ResultAsync with the transformed success type.
	 * @memberof ResultAsync
	 */
	map<U>(func: (data: GetOk<R>) => Promise<U> | U): ResultAsync<Result<U, GetErr<R>>> {
		return new ResultAsync<Result<U, GetErr<R>>>((resolve) => {
			this.then((resultData) => {
				const result = resultData as Result<GetOk<R>, GetErr<R>>;
				if (result.isErr()) {
					return resolve(Err(result.unwrapErr()));
				}
				try {
					const response = func(result.unwrap());
					Promise.resolve(response)
						.then((data) => {
							resolve(Ok(data));
						})
						.catch((err) => {
							resolve(Err(err));
						});
				} catch (err: unknown) {
					resolve(Err(err as GetErr<R>));
				}
			});
		});
	}

	/**
	 * Maps a `ResultAsync<Result<T, E>>` to `ResultAsync<Result<T, F>>` by
	 * applying a function to a results' {@link Err} value, leaving its
	 * {@link Ok} value untouched.
	 *
	 * This function can be used to pass through a successful result while
	 * handling an error.
	 *
	 * ---
	 * #### Note
	 * If the passed function `op` throws an error, it will be caught and
	 * wrapped into an {@link Err} with the `unknown` type.
	 * Preferably use {@link andThen} if you want to chain a function that can
	 * fail instead, as that allows you to better handle the potential errors.
	 *
	 * ---
	 * @example
	 * const result = await Result.fromPromise(getNumberDelayedReject("InvalidNumber", 100))
	 *     .mapErr((err) => {
	 *       return { error: err, detail: "Failed to get number!" };
	 *      })
	 *
	 * result.isErr();     // true
	 * result.unwrapErr(); // { error: "InvalidNumber", detail: "Failed to get number!" }
	 *
	 * const result = await Result.fromPromise(getNumberDelayedResolve(4, 100))
	 *     .mapErr((err) => {
	 *       return { error: err, detail: "Failed to get number!" };
	 *     })
	 *     .map((number) => number * number); // 4 * 4
	 *
	 * result.isOk();   // true
	 * result.unwrap(); // 16
	 * @template F The new error type.
	 * @param {(err: GetErr<R>) => F | Promise<F>} op Transformation function for the error value.
	 * @returns {ResultAsync<Result<GetOk<R>, F>>} A new ResultAsync with the transformed error type.
	 * @memberof ResultAsync
	 */
	mapErr<F>(op: (err: GetErr<R>) => F | Promise<F>): ResultAsync<Result<GetOk<R>, F>> {
		return new ResultAsync<Result<GetOk<R>, F>>((resolve) => {
			this.then((resultData) => {
				const result = resultData as Result<GetOk<R>, GetErr<R>>;
				if (result.isOk()) {
					return resolve(Ok(result.unwrap()));
				}
				try {
					const error = op(result.unwrapErr());
					Promise.resolve(error)
						.then((data) => {
							resolve(Err(data));
						})
						.catch((err) => {
							resolve(Err(err));
						});
				} catch (err: unknown) {
					resolve(Err(err as F));
				}
			}).catch((err) => {
				resolve(Err(err as F));
			});
		});
	}

	/**
	 * Calls the passed function `op` if the result is {@link Ok}, otherwise
	 * returns the {@link Err} value of 'this' Result.
	 *
	 * This function can be used for control flow based on `Result` values.
	 *
	 * ---
	 * @example
	 * const getResponseBody = async (response: Response): Promise<Result<DummyProduct, ErrorMessage>> => {
	 *   if (response.status === 200) {
	 *     try {
	 *       const body = await response.json();
	 *       return Ok(body);
	 *     } catch (err) {
	 *       return Err({ error: "FailedToParseBody", detail: err });
	 *     }
	 *   }
	 *   return Err({
	 *     error: `StatusCode${response.status}`,
	 *     detail: "Non 200 status code returned",
	 *   });
	 * };
	 *
	 * const result = await Result.fromPromise(fetch("https://dummyjson.com/products/1"))
	 *   .andThen(getResponseBody)
	 *   .map((responseBody) => responseBody.rating);
	 *
	 * result.isOk();   // true
	 * result.unwrap(); // 4.69
	 *
	 * const result = await Result.fromPromise(fetch("http://www.reddit.com/.rss")) // Xml response, not json
	 *   .andThen(getResponseBody)
	 *   .map((responseBody) => responseBody.rating);
	 *
	 * console.log(result.isErr());     //true
	 * console.log(result.unwrapErr()); // {error: 'FailedToParseBody', detail: SyntaxError: Unexpected token '<', ... }
	 * @template U The new success type.
	 * @template E The new error type.
	 * @param {(value: GetOk<R>) => Result<U, E> | Promise<Result<U, E>>} op
	 * @returns {ResultAsync<Result<U, E>>}
	 * @memberof ResultAsync
	 */
	andThen<U, E>(op: (value: GetOk<R>) => Result<U, E> | Promise<Result<U, E>>): ResultAsync<Result<U, E>> {
		return new ResultAsync<Result<U, E>>((resolve) => {
			this.then((resultData) => {
				const result = resultData as Result<GetOk<R>, GetErr<R>>;
				if (result.isOk()) {
					Promise.resolve(op(result.unwrap()))
						.then(resolve)
						.catch((err: unknown) => resolve(Err(err as E)));
				} else {
					resolve(Err(result.unwrapErr() as E));
				}
			});
		});
	}
}

/**
 * Takes in `value` of type `T` and wraps it inside a {@link ResultAsync}
 * promise that resolves to an `Ok` {@link Result}.
 *
 * ---
 * @example
 * const result = await OkAsync(12);
 *
 * result.isOk();   // true
 * result.isErr();  // false;
 * result.unwrap(); // 12
 * @template T Success type.
 * @template E Error type (defaults to never).
 * @param {T | Promise<T>} data The value or promise to wrap.
 * @returns {ResultAsync<Result<T, E>>}
 */
function OkAsync<T, E = never>(data: T | Promise<T>): ResultAsync<Result<T, E>> {
	return new ResultAsync<Result<T, E>>(async (resolve) => {
		const val = await data;
		resolve(Ok<T, E>(val));
	});
}
/**
 * Takes in `value` of type `T` and wraps it inside a {@link ResultAsync}
 * promise that resolves to an `Err` {@link Result}.
 *
 * ---
 * @example
 * const result = await ErrAsync({ age: 12, name: "bob" });
 *
 * result.isOk();      // false;
 * result.isErr();     // true;
 * result.unwrapErr(); // { age: 12, name: "bob" };
 * @template T Success type.
 * @template E Error type.
 * @param {E | Promise<E>} data The error value or promise to wrap.
 * @returns {ResultAsync<Result<T, E>>}
 */
function ErrAsync<E>(data: E | Promise<E>): ResultAsync<Result<never, E>>;
function ErrAsync<T, E>(data: E | Promise<E>): ResultAsync<Result<T, E>>;

function ErrAsync<T, E>(data: E | Promise<E>): ResultAsync<Result<T, E>> {
	return new ResultAsync<Result<T, E>>(async (resolve) => {
		const err = await data;
		resolve(Err<T, E>(err));
	});
}

export { ResultAsync, OkAsync, ErrAsync };
