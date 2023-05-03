import { Result, Ok, Err } from "./result.js";

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
 * @extends {Promise<T>}
 * @template T
 */
class ResultAsync<T extends Result<T["ok"], T["err"]>> extends Promise<T> {
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
	 * @template U
	 * @param {((data: T["ok"]) => Promise<U> | U)} func
	 * @returns {ResultAsync<Result<U, T["err"]>>} ResultAsync<Result<U, T["err"]>>
	 * @memberof ResultAsync
	 */
	map<U>(func: (data: T["ok"]) => Promise<U> | U): ResultAsync<Result<U, T["err"]>> {
		return new ResultAsync<Result<U, unknown>>((resolve) => {
			this.then((resultData) => {
				if (!resultData.isOk()) {
					resolve(Err(resultData.unwrapErr()));
				}

				try {
					const response = func(resultData.unwrap() as T["ok"]);
					if (response instanceof Promise) {
						response
							.then((data) => {
								resolve(Ok(data));
							})
							.catch((err) => {
								resolve(Err(err));
							});
					} else {
						resolve(Ok(response));
					}
				} catch (err) {
					resolve(Err(err as T["err"]));
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
	 * @template F
	 * @param {((err: T["err"]) => F | Promise<F>)} op
	 * @returns {ResultAsync<Result<T["ok"], F>>} ResultAsync<Result<T["ok"], F>>
	 * @memberof ResultAsync
	 */
	mapErr<F>(op: (err: T["err"]) => F | Promise<F>): ResultAsync<Result<T["ok"], F>> {
		return new ResultAsync<Result<T["ok"], F>>((resolve) => {
			this.then((resultData) => {
				const result = resultData as Result<T["ok"], F>;
				if (!result.isErr()) {
					resolve(Ok(result.unwrap()));
				}

				try {
					const error = op(result.unwrapErr());
					if (error instanceof Promise) {
						error
							.then((data) => {
								resolve(Err(data));
							})
							.catch((err) => {
								resolve(Err(err));
							});
					} else {
						resolve(Err(error));
					}
				} catch (err) {
					resolve(Err(err as F));
				}
			}).catch((err) => {
				resolve(Err(err));
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
	 * @template U
	 * @template E
	 * @param {(value: T["ok"]) => Result<U, E>} op
	 * @returns {ResultAsync<Result<U, E> Promise<Result<U, E>>} ResultAsync<Result<U, E>>
	 * @memberof ResultAsync
	 */
	andThen<U, E>(op: (value: T["ok"]) => Result<U, E> | Promise<Result<U, E>>): ResultAsync<Result<U, E>> {
		return new ResultAsync<Result<U, E>>((resolve) => {
			this.then((resultData) => {
				const result = resultData;
				if (result.isOk()) {
					const data = result.unwrap();
					if (data instanceof Promise) {
						data.then((data) => resolve(op(data))).catch((err) => resolve(Err(err)));
					} else {
						resolve(op(data));
					}
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
 * @template U
 * @template T `Result<U, T["err"]>`
 * @param {U} data
 * @returns {ResultAsync<T>} ResultAsync<T>
 */
const OkAsync = <U, T extends Result<U, T["err"]>>(data: U): ResultAsync<T> => {
	return new ResultAsync<T>(async (resolve) => {
		resolve(Ok(data) as T);
	});
};

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
 * @template U
 * @template T `Result<T["ok"], U>`
 * @param {U} data
 * @returns {ResultAsync<T>} ResultAsync<T>
 */
const ErrAsync = <U, T extends Result<T["ok"], U>>(data: U): ResultAsync<T> => {
	return new ResultAsync<T>(async (resolve) => {
		resolve(Err(data) as T);
	});
};

export { ResultAsync, OkAsync, ErrAsync };
