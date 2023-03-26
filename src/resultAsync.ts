import { Result, Ok, Err } from "./result";
class ResultAsync<T extends Result<T["ok"], T["err"]>> extends Promise<T> {
	map<U>(func: (data: T["ok"]) => Promise<U> | U): ResultAsync<Result<U, unknown>> {
		const wrappedPromise = this.then((data) => {
			if (data.isOk()) {
				try {
					const response = func(data.unwrap() as T["ok"]);
					return Ok(response);
				} catch (err) {
					console.log("ERROR");

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
}

export { ResultAsync };
