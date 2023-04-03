import { Err, Ok, Result } from "../src/result";
import { ErrAsync, OkAsync } from "../src/resultAsync";

async function getNumberDelayedResolve(number: number, msWait: number) {
	return new Promise<number>((res) => {
		setTimeout(() => res(number), msWait);
	});
}

async function getStringDelayedResolve(string: string, msWait: number) {
	return new Promise<string>((res) => {
		setTimeout(() => res(string), msWait);
	});
}

async function getNumberDelayedReject(detail: string, msWait: number) {
	return new Promise<number>((_res, rej) => {
		setTimeout(() => rej(detail), msWait);
	});
}

function causeError(error: unknown) {
	throw new Error(`Issue occurred: ${error}`);
}

describe("OkAsync() tests", () => {
	test("OkASync should return an Ok Result after awaiting", async () => {
		const result = await OkAsync(12);

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toBe(12);
	});

	test("OkASync should return an Ok Result after awaiting even when given an Error", async () => {
		const result = await OkAsync(new Error("Why would you put this in an Ok?"));

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toStrictEqual(new Error("Why would you put this in an Ok?"));
	});

	test("OkASync should take any object", async () => {
		const result = await OkAsync({ age: 12, name: "bob" });

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toStrictEqual({ age: 12, name: "bob" });
	});

	test("Awaited OkASync should take throw an error trying to unwrapErr()", async () => {
		const result = await OkAsync({ age: 12, name: "bob" });

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(() => {
			result.unwrapErr();
		}).toThrowError(new Error('Called Result.unwrapErr() on an Ok value: {"age":12,"name":"bob"}'));
	});
});

describe("ErrAsync() tests", () => {
	test("ErrAsync should return an Err Result after awaiting", async () => {
		const result = await ErrAsync(12);

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toBe(12);
	});

	test("ErrAsync should take any object", async () => {
		const result = await ErrAsync({ age: 12, name: "bob" });

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual({ age: 12, name: "bob" });
	});

	test("Awaited ErrAsync should take throw an error trying to unwrap()", async () => {
		const result = await ErrAsync({ age: 12, name: "bob" });

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(() => {
			result.unwrap();
		}).toThrowError(new Error('Called Result.unwrap() on an Err value: {"age":12,"name":"bob"}'));
	});
});

describe("Result.fromPromise() tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const promiseResolve = <T>(variable: T): Promise<T> => new Promise<T>((resolve) => resolve(variable));
	const promiseReject = <T>(): Promise<T> => new Promise((_, reject) => reject("rejected"));
	// ---------------UTILITY FUNCTIONS END-------------------

	test("Result.fromPromise() resolve inferred types", async () => {
		// Type: Result<number, unknown>
		const result = await Result.fromPromise(promiseResolve(10));

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(10);
	});

	test("Result.fromPromise() resolve explicit types", async () => {
		// Type: Result<number, unknown>
		const result: Result<number, unknown> = await Result.fromPromise(promiseResolve(10));

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(10);
	});

	test("Result.fromPromise() reject inferred types", async () => {
		// Type: Result<number, unknown>
		const result = await Result.fromPromise(promiseReject());

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toBe("rejected");
	});

	test("Result.fromPromise() reject explicit types", async () => {
		// Type: Result<number, unknown>
		const result = await Result.fromPromise<number>(promiseReject());

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toBe("rejected");
	});
});

describe("Result.fromPromiseUnknown() tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const testPromiseResolve = new Promise((resolve) => resolve(123));
	const testPromiseReject = new Promise((_, reject) => reject(123));
	// ---------------UTILITY FUNCTIONS END-------------------

	test("Result.fromPromiseUnknown() resolve typed", async () => {
		// Type: Result<number, unknown>
		const result: Result<number, unknown> = await Result.fromPromiseUnknown(testPromiseResolve);

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(123);
	});

	test("Result.fromPromiseUnknown() reject typed", async () => {
		// Type: Result<number, unknown>
		const result = await Result.fromPromiseUnknown<number>(testPromiseReject);

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toBe(123);
	});

	test("Result.fromPromiseUnknown() accept untyped", async () => {
		// Type: Result<unknown, unknown>
		const result = await Result.fromPromiseUnknown(testPromiseResolve);

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(123);
	});

	test("Result.fromPromiseUnknown() reject untyped", async () => {
		// Type: Result<Unknown, unknown>
		const result = await Result.fromPromiseUnknown(testPromiseResolve);

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(123);
	});
});

describe("ResultAsync.map() Tests", () => {
	test("ResultAsync.map() should map two async functions.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)).map((x) =>
			getNumberDelayedResolve(x + 3, 100)
		);

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(6);
	});

	test("ResultAsync.map() should map async and regular functions in chain.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)).map((x) => x * 2);

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(6);
	});

	test("ResultAsync.map() should map async and regular functions repeatedly.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)) //3
			.map((x) => x * 2) // 6
			.map((x) => getNumberDelayedResolve(x + 3, 100)) // 9
			.map((x) => getNumberDelayedResolve(x + 3, 400)) // 12
			.map((x) => x - 2) // 10
			.map((x) => x - 9); // 1

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(1);
	});

	test("ResultAsync.map() should return an Err object without crashing on rejection.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)) //3
			.map((x) => x * 2) // 6
			.map((x) => getNumberDelayedReject("reason", 100)); // Rejection

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toBe("reason");
	});

	test("ResultAsync.map() should return the first Err object without crashing on rejection.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)) //3
			.map((x) => x * 2) // 6
			.map((_x) => getNumberDelayedReject("First Reject", 100)) // Rejection 1
			.map((x) => x * 2)
			.map((_x) => getNumberDelayedReject("Second Reject", 100)); // Rejection 2

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual("First Reject");
	});

	test("ResultAsync.map() should capture thrown errors into an Err object.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100))
			.map((x) => x * 2) // 6
			.map((x) => getNumberDelayedResolve(x + 3, 100))
			.map((x) => getNumberDelayedResolve(x + 3, 100))
			.map((x) => {
				causeError(x);
				return x;
			})
			.map((x) => getNumberDelayedResolve(x + 3, 100));

		expect(result.isErr()).toBe(true);
		expect(result.isErrAnd((err) => err instanceof Error)).toBe(true);
	});

	test("ResultAsync.map() should not await other promises after rejection.", async () => {
		const start = performance.now();
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)) // 100 ms total
			.map((x) => x * 2) // 6
			.map((_x) => getNumberDelayedReject("First Reject", 100)) // 100 ms total
			.map((_x) => getNumberDelayedReject("Second Reject", 1000)) // 1100 ms total
			.map((_x) => getNumberDelayedReject("Third Reject", 1000)); //2100 ms total
		const end = performance.now();

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toBe("First Reject");
		expect(end - start).toBeLessThan(1000);
	});
});

describe("ResultAsync.mapErr() Tests", () => {
	test("ResultAsync.mapErr() should be able to modify an error response.", async () => {
		const result = await Result.fromPromise(getNumberDelayedReject("InvalidNumber", 100)).mapErr((err) => {
			return { error: err, detail: "Failed to get number!" };
		});

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toEqual({ error: "InvalidNumber", detail: "Failed to get number!" });
	});

	test("ResultAsync.mapErr() should be able to modify an error response without affecting the Ok type.", async () => {
		const result = await Result.fromPromise(getNumberDelayedReject("InvalidNumber", 100))
			.mapErr((err) => {
				return { error: err, detail: "Failed to get number!" };
			})
			.map((number) => number * number);

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toEqual({ error: "InvalidNumber", detail: "Failed to get number!" });
	});

	test("ResultAsync.mapErr() should be able to modify an error response without affecting the Ok return.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(12, 100))
			.mapErr((err) => {
				return { error: err, detail: "Failed to get number!" };
			})
			.map((number) => number * number);

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toBe(144);
	});

	test("ResultAsync.mapErr() should be able to modify an error response without affecting the Ok return.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(12, 100))
			.mapErr((err) => {
				return { error: err, detail: "Failed to get number!" };
			})
			.map((number) => number * number);

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toBe(144);
	});

	test("ResultAsync.mapErr() should return an error if the mapErr's function throws an error.", async () => {
		const result = await Result.fromPromise(getNumberDelayedReject("InvalidNumber", 100))
			.mapErr((err) => causeError(err))
			.map((number) => number * number);

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toEqual(new Error("Issue occurred: InvalidNumber"));
	});

	test("ResultAsync.mapErr() should not change the Ok return if the mapErr throws an Error.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(12, 100))
			.mapErr((err) => causeError(err))
			.map((number) => number * number);

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toBe(144);
	});

	test("ResultAsync.mapErr() should work even with a promise.", async () => {
		const result = await Result.fromPromise(getNumberDelayedReject("issue", 100))
			.mapErr((err) => getStringDelayedResolve(err as string, 100))
			.mapErr((err) => {
				return { error: "UnknownError", detail: err };
			})
			.map((number) => number * number);

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toEqual({ detail: "issue", error: "UnknownError" });
	});

	test("ResultAsync.mapErr() should work even with a promise and regular mapping promise.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(12, 100))
			.map((data) => getNumberDelayedResolve(10 + data, 100))
			.map((data) => getNumberDelayedResolve(8 + data, 100))
			.mapErr((err) => getStringDelayedResolve(err as string, 100))
			.mapErr((err) => getStringDelayedResolve(err as string, 100))
			.mapErr((err) => {
				return { error: "UnknownError", detail: err };
			})
			.map((number) => number * number);

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toEqual(900);
	});
});

describe("ResultAsync.andThen() Tests", () => {
	// ----------- Helper functions -----------
	interface ErrorDetail {
		error: string;
		detail: any;
	}
	const checkValidString = (data: string, correctData: string): Result<string, ErrorDetail> => {
		if (data === correctData) {
			return Ok(data);
		}
		return Err({ error: "IncorrectStringError", detail: `The passed string: ${data} did not match: ${correctData}` });
	};
	// ----------------------------------------

	test("ResultAsync.andThen() should correctly map a ResultAsync.", async () => {
		const result = await Result.fromPromise(getStringDelayedResolve("hello!", 0)).andThen((x) =>
			checkValidString(x, "hello!")
		);

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe("hello!");
	});

	test("ResultAsync.andThen() should correctly map a ResultAsync two.", async () => {
		const result = await Result.fromPromise(getStringDelayedResolve("hello!", 0))
			.andThen((x) => checkValidString(x, "hello!"))
			.map(() => "pancake")
			.andThen((x) => checkValidString(x, "pancakes"))
			.map((x) => x.length);

		expect(result.isOk()).toBe(false);
		expect(result.unwrapErr()).toEqual({
			error: "IncorrectStringError",
			detail: "The passed string: pancake did not match: pancakes",
		});
	});

	test("ResultAsync.andThen() should correctly return as soon as an Err is returned.", async () => {
		const result = await Result.fromPromise(getStringDelayedResolve("hello!", 0))
			.andThen((x) => checkValidString(x, "wrong!"))
			.map((x) => getStringDelayedResolve(x + " and chocolate", 1000));

		expect(result.isOk()).toBe(false);
		expect(result.unwrapErr()).toEqual({
			error: "IncorrectStringError",
			detail: "The passed string: hello! did not match: wrong!",
		});
	});

	test("ResultAsync.andThen() should correctly if the data is a promise.", async () => {
		const result = await Result.fromPromise(getStringDelayedResolve("pancakes", 0))
			.andThen((x) => checkValidString(x, "pancakes"))
			.map((x) => getStringDelayedResolve(x + " and chocolate", 0))
			.andThen((x) => checkValidString(x, "pancakes and chocolate"));

		console.log(result);

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toEqual("pancakes and chocolate");
	});
});
