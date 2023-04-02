import { Result, Ok, Err } from "./result";

// TODO: Add documentation and JSDoc
class ResultAsync<T extends Result<T["ok"], T["err"]>> extends Promise<T> {
	map<U>(func: (data: T["ok"]) => Promise<U> | U): ResultAsync<Result<U, unknown>> {
		const wrappedPromise = this.then((data) => {
			if (data.isOk()) {
				try {
					const response = func(data.unwrap() as T["ok"]);
					return Ok(response);
				} catch (err) {
					return Err(err as T["err"]);
				}
			} else {
				return data;
			}
		}).catch((err) => {
			return Err(err);
		});
		return new ResultAsync<Result<U, unknown>>((resolve) => {
			wrappedPromise.then((resultData) => {
				const result = resultData as Result<unknown, unknown>;
				if (result.isOk()) {
					const data = result.unwrap();
					if (data instanceof Promise) {
						data
							.then((data) => {
								resolve(Ok(data));
							})
							.catch((err) => {
								resolve(Err(err));
							});
					} else {
						resolve(Ok(data as U));
					}
				} else {
					resolve(Err(result.unwrapErr()));
				}
			});
		});
	}

	// TODO: JSDOC and Readme docs
	mapErr<E>(op: (err: T["err"]) => E | Promise<E>): ResultAsync<Result<T["ok"], E>> {
		// mapErr<F>(op: (err: E) => F): Result<T, F>
		const wrappedPromise = this.then((data) => {			if (data.isErr()) {
				try {
					const response = op(data.unwrapErr() as T["err"]);
					return Err(response);
				} catch (err) {
					return Err(err);
				}
			} else {
				return data;
			}
		}).catch((err) => {
			return Err(err);
		});

		return new ResultAsync<Result<T["ok"], E>>((resolve) => {
			wrappedPromise.then((resultData) => {
				const result = resultData as Result<T["ok"], E>;
				if (result.isOk()) {
					resolve(Ok(result.unwrap()));
				} else {
					const error = result.unwrapErr();
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
const ErrAsync = <U, T extends Result<unknown, U>>(data: U): ResultAsync<T> => {
	return new ResultAsync<T>(async (resolve) => {
		resolve(Err(data) as T);
	});
};

export { ResultAsync, OkAsync, ErrAsync };
