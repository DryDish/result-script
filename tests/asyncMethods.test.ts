import { Result } from "../src/result";
import { ErrAsync, OkAsync } from "../src/resultAsync";

async function getNumberDelayedResolve(number: number, msWait: number) {
	return new Promise<number>((res) => {
		setTimeout(() => res(number), msWait);
	});
}

async function getNumberDelayedReject(detail: string, msWait: number) {
	return new Promise<number>((_res, rej) => {
		setTimeout(() => rej("Rejected!"), msWait);
	});
}

function causeError() {
	throw new Error("Error was thrown!");
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
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 200)).map((x) =>
			getNumberDelayedResolve(x + 3, 200)
		);

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(6);
	});

	test("ResultAsync.map() should map async and regular functions in chain.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 200)).map((x) => x * 2);

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(6);
	});

	test("ResultAsync.map() should map async and regular functions repeatedly.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)) //3
			.map((x) => x * 2) // 6
			.map((x) => getNumberDelayedResolve(x + 3, 200)) // 9
			.map((x) => getNumberDelayedResolve(x + 3, 400)) // 12
			.map((x) => x - 2) // 10
			.map((x) => x - 9); // 1

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe(1);
	});

	test("ResultAsync.map() should return an Err object without crashing on rejection.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)) //3
			.map((x) => x * 2) // 6
			.map((x) => getNumberDelayedReject("reason", 200)); // Rejection

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toBe("Rejected!");
	});

	test("ResultAsync.map() should return the first Err object without crashing on rejection.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100)) //3
			.map((x) => x * 2) // 6
			.map((_x) => getNumberDelayedReject("First Reject", 200)) // Rejection 1
			.map((x) => x * 2)
			.map((_x) => getNumberDelayedReject("Second Reject", 200)); // Rejection 2

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual("Rejected!");
	});

	test("ResultAsync.map() should capture thrown errors into an Err object.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(3, 100))
			.map((x) => x * 2) // 6
			.map((x) => getNumberDelayedResolve(x + 3, 100))
			.map((x) => getNumberDelayedResolve(x + 3, 100))
			.map((x) => {
				causeError();
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
			.map((_x) => getNumberDelayedReject("First Reject", 100)) // 200 ms total
			.map((_x) => getNumberDelayedReject("Second Reject", 1000)) // 1200 ms total
			.map((_x) => getNumberDelayedReject("Third Reject", 1000)); //2200 ms total
		const end = performance.now();

		expect(result.isErr()).toBe(true);
		expect(end - start).toBeLessThan(1000);
	});
});

describe("ResultAsync.mapErr() Tests", () => {
	test("ResultAsync.mapErr() should be able to modify an error response.", async () => {
		const result = await Result.fromPromise(getNumberDelayedReject("InvalidNumber", 200)).mapErr((err) => {
			return { error: err, detail: "Failed to get number!" };
		});

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toEqual({ error: "Rejected!", detail: "Failed to get number!" });
	});

	test("ResultAsync.mapErr() should be able to modify an error response without affecting the Ok type.", async () => {
		const result = await Result.fromPromise(getNumberDelayedReject("InvalidNumber", 200))
			.mapErr((err) => {
				return { error: err, detail: "Failed to get number!" };
			})
			.map((number) => number * number);

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toEqual({ error: "Rejected!", detail: "Failed to get number!" });
	});

	test("ResultAsync.mapErr() should be able to modify an error response without affecting the Ok return.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(12, 200))
			.mapErr((err) => {
				return { error: err, detail: "Failed to get number!" };
			})
			.map((number) => number * number);

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toBe(144);
	});

	test("ResultAsync.mapErr() should be able to modify an error response without affecting the Ok return.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(12, 200))
			.mapErr((err) => {
				return { error: err, detail: "Failed to get number!" };
			})
			.map((number) => number * number);

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toBe(144);
	});

	test("ResultAsync.mapErr() should return an error if the mapErr's function throws an error.", async () => {
		const result = await Result.fromPromise(getNumberDelayedReject("InvalidNumber", 200))
			.mapErr((err) => causeError())
			.map((number) => number * number);

		expect(result.isOk()).toBe(false);
		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toEqual(new Error("Error was thrown!"));
	});

	test("ResultAsync.mapErr() should not change the Ok return if the mapErr throws an Error.", async () => {
		const result = await Result.fromPromise(getNumberDelayedResolve(12, 200))
			.mapErr((err) => causeError())
			.map((number) => number * number);

		expect(result.isOk()).toBe(true);
		expect(result.isErr()).toBe(false);
		expect(result.unwrap()).toBe(144);
	});
});
