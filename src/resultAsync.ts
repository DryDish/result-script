import { Result, Ok, Err } from "./result";

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

	// TODO: JSDOC and Readme docs
	mapErr<E>(op: (err: T["err"]) => E | Promise<E>): ResultAsync<Result<T["ok"], E>> {
		return new ResultAsync<Result<T["ok"], E>>((resolve) => {
			this.then((resultData) => {
				const result = resultData as Result<T["ok"], E>;
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
					resolve(Err(err as E));
				}
			}).catch((err) => {
				resolve(Err(err));
			});
		});
	}

	andThen<U, E>(op: (value: T["ok"]) => Result<U, E>): ResultAsync<Result<U, E>> {
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

// TODO: -MAYBE- update readme section to include this?
/**
 * Takes in `value` of type `T` and wraps it inside a {@link ResultAsync}
 * promise that resolves to an `Ok` {@link Result}.
 *
 * ---
 * @example
 * const result = await OkAsync(12);
 *
 * result.isOk(); // true
 * result.isErr(); // false;
 * result.unwrap(); // 12
 * @template U
 * @template T `Result<U, unknown>`
 * @param {U} data
 * @returns {ResultAsync<T>} ResultAsync<T>
 */
const OkAsync = <U, T extends Result<U, T["err"]>>(data: U): ResultAsync<T> => {
	return new ResultAsync<T>(async (resolve) => {
		resolve(Ok(data) as T);
	});
};

// TODO: -MAYBE- update readme section to include this?
/**
 * Takes in `value` of type `T` and wraps it inside a {@link ResultAsync}
 * promise that resolves to an `Err` {@link Result}.
 *
 * ---
 * @example
 * const result = await ErrAsync({ age: 12, name: "bob" });
 *
 * result.isOk(); // false;
 * result.isErr(); // true;
 * result.unwrapErr(); // { age: 12, name: "bob" });
 * @template U
 * @template T `Result<unknown, U>`
 * @param {U} data
 * @returns {ResultAsync<T>} ResultAsync<T>
 */
const ErrAsync = <U, T extends Result<T["ok"], U>>(data: U): ResultAsync<T> => {
	return new ResultAsync<T>(async (resolve) => {
		resolve(Err(data) as T);
	});
};

export { ResultAsync, OkAsync, ErrAsync };
