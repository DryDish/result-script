import { Err, Ok, Result } from "../../src/result/result";
import { ErrAsync, OkAsync, ResultAsync } from "../../src/result/resultAsync";
import { describe, test, expectTypeOf } from "vitest";

describe("ResultAsync type tests", () => {
	describe("OkAsync type tests", () => {
		test("OkAsync / ResultAsync should be assignable to Promise<Result<T, E>>", () => {
			const result: Promise<Result<number, never>> = OkAsync(5);
			expectTypeOf(result).toEqualTypeOf<Promise<Result<number, never>>>();
		});

		test("A not awaited OkAsync should return a ResultAsync<Result<number, never>>", () => {
			const result = OkAsync(12);
			expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, never>>>();
		});

		test("An awaited OkAsync should return a Result<number, never>", async () => {
			const result = await OkAsync(12);
			expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
		});

		test("Explicitly typed OkAsync<T> should return ResultAsync<Result<T, never>>", () => {
			const result = OkAsync<number>(12);
			expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, never>>>();
		});

		test("An awaited explicitly typed OkAsync<T> should return Result<T, never>", async () => {
			const result = await OkAsync<number>(12);
			expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
		});

		test("Explicitly typed OkAsync<T, E> should return ResultAsync<Result<T, E>>", () => {
			const result = OkAsync<string, Error>("test");
			expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<string, Error>>>();
		});

		test("An awaited explicitly typed OkAsync<T, E> should return Result<T, E>", async () => {
			const result = await OkAsync<string, Error>("test");
			expectTypeOf(result).toEqualTypeOf<Result<string, Error>>();
		});
	});
	describe("ErrAsync type tests", () => {
		test("ErrAsync / ResultAsync should be assignable to Promise<Result<T, E>>", () => {
			const result: Promise<Result<never, string>> = ErrAsync("error");
			expectTypeOf(result).toEqualTypeOf<Promise<Result<never, string>>>();
		});

		test("A not awaited ErrAsync should return a ResultAsync<Result<never, string>>", () => {
			const result = ErrAsync("error");
			expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<never, string>>>();
		});

		test("An awaited ErrAsync should return a Result<never, string>", async () => {
			const result = await ErrAsync("error");
			expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
		});

		test("Explicitly typed ErrAsync<E> should return ResultAsync<Result<never, E>>", () => {
			const result = ErrAsync<Error>(new Error("error"));
			expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<never, Error>>>();
		});

		test("An awaited explicitly typed ErrAsync<E> should return Result<never, E>", async () => {
			const result = await ErrAsync<Error>(new Error("error"));
			expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
		});

		test("Explicitly typed ErrAsync<T, E> should return ResultAsync<Result<T, E>>", () => {
			const result = ErrAsync<number, Error>(new Error("error"));
			expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, Error>>>();
		});

		test("An awaited explicitly typed ErrAsync<T, E> should return Result<T, E>", async () => {
			const result = await ErrAsync<number, Error>(new Error("error"));
			expectTypeOf(result).toEqualTypeOf<Result<number, Error>>();
		});
	});
	describe("Method type tests", () => {
		// -----------------UTILITY FUNCTIONS---------------------
		const promiseResolve = <T>(variable: T): Promise<T> => new Promise<T>((resolve) => resolve(variable));
		const promiseReject = <T>(): Promise<T> => new Promise((_, reject) => reject("rejected"));
		// ---------------UTILITY FUNCTIONS END-------------------

		describe("ResultAsync.fromPromise() Tests", () => {
			test(" ResultAsync.fromPromise() resolve inferred types, should return a ResultAsync<Result<number, unknown>> when not awaited", () => {
				const result = Result.fromPromise(promiseResolve(10));
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, unknown>>>();
			});

			test("ResultAsync.fromPromise() resolve inferred types, should return a Result<number, unknown> when awaited", async () => {
				const result = await Result.fromPromise(promiseResolve(10));
				expectTypeOf(result).toEqualTypeOf<Result<number, unknown>>();
			});

			test("ResultAsync.fromPromise<number>() resolve explicit types, should return a ResultAsync<Result<number, unknown>> when not awaited", () => {
				const result = Result.fromPromise<number>(promiseResolve(10));
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, unknown>>>();
			});

			test("ResultAsync.fromPromise<number>() resolve explicit types, should return a Result<number, unknown> when awaited", async () => {
				const result = await Result.fromPromise<number>(promiseResolve(10));
				expectTypeOf(result).toEqualTypeOf<Result<number, unknown>>();
			});

			test("ResultAsync.fromPromise<number>(promiseResolve('string')) should have a ts-error", () => {
				// @ts-expect-error: type 'string' is not assignable to type 'number'.
				Result.fromPromise<number>(promiseResolve("string"));
			});

			test("Result.fromPromise<number>(untypedPromise()) should set the return type to ResultAsync<Result<number, unknown>>", () => {
				const result = Result.fromPromise<number>(promiseReject());
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, unknown>>>();
			});

			test("Result.fromPromise<number>(untypedPromise()) should set the return type to Result<number, unknown> when not awaited", async () => {
				const result = await Result.fromPromise<number>(promiseReject());
				expectTypeOf(result).toEqualTypeOf<Result<number, unknown>>();
			});

			test("ResultAsync.fromPromise() reject should not implicitly know the return type of a rejected promise", () => {
				const result = Result.fromPromise(promiseReject());
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<unknown, unknown>>>();
			});
		});

		describe("ResultAsync.fromPromiseUnknown() Tests", () => {
			test("ResultAsync.fromPromiseUnknown() should retain the unknown type unless it's specified, when not awaited", () => {
				const result = Result.fromPromiseUnknown(promiseResolve(10));
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<unknown, unknown>>>();
			});

			test("ResultAsync.fromPromiseUnknown() should retain the unknown type unless it's specified, when awaited", async () => {
				const result = await Result.fromPromiseUnknown(promiseResolve(10));
				expectTypeOf(result).toEqualTypeOf<Result<unknown, unknown>>();
			});

			test("ResultAsync.fromPromiseUnknown() should set the return type, regardless of the type of the promise", () => {
				// promiseResolve('10') returns a string
				const result = Result.fromPromiseUnknown<bigint>(promiseResolve("10"));
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<bigint, unknown>>>();
			});

			test("ResultAsync.fromPromiseUnknown() should set the return type when awaited, regardless of the type of the promise", async () => {
				// promiseResolve('10') returns a string
				const result = await Result.fromPromiseUnknown<bigint>(promiseResolve("10"));
				expectTypeOf(result).toEqualTypeOf<Result<bigint, unknown>>();
			});
		});

		describe("ResultAsync.map() Tests", () => {
			test("ResultAsync.map() should map a Promise<T> to a ResultAsync<Result<U, E>> when not awaited", () => {
				const result = OkAsync(promiseResolve(5)).map((x) => x.toString());
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<string, never>>>();
			});
			test("ResultAsync.map() should map a Promise<T> to a Result<U, E> result when awaitwed", async () => {
				const result = await OkAsync(promiseResolve(5)).map((x) => x.toString());
				expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
			});
			test("ResultAsync.map() should modify a T: number to a U: string back to a V: number result, and handle nested awaits", () => {
				const result = OkAsync<number>(promiseResolve(5))
					.map((x) => x.toString())
					.map(async (x) => Number(x) + (await promiseResolve(5)));
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, never>>>();
			});
			test("ResultAsync.map() should modify a promise<T>: number to a U: { age: Promise<T> } result", () => {
				const result = OkAsync(promiseResolve(5)).map((number) => {
					return { age: number };
				});
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<{ age: number }, never>>>();
			});
			test("ResultAsync.map() should modify a promise<T>: number to a U: { age: Promise<T> } result when awaited", async () => {
				const result = await OkAsync(promiseResolve(5)).map((number) => {
					return { age: number };
				});
				expectTypeOf(result).toEqualTypeOf<Result<{ age: number }, never>>();
			});
		});
		describe("ResultAsync.mapErr() Tests", () => {
			test("ResultAsync.mapErr() should map a Promise<T> to a ResultAsync<Result<U, E>> when not awaited", () => {
				const result = ErrAsync(promiseResolve(5)).mapErr((x) => x.toString());
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<never, string>>>();
			});
			test("ResultAsync.mapErr() should map a Promise<T> to a Result<U, E> result when awaitwed", async () => {
				const result = await ErrAsync(promiseResolve(5)).mapErr((x) => x.toString());
				expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
			});
			test("ResultAsync.mapErr() should modify a T: number to a U: string back to a V: number result, and handle nested awaits", () => {
				const result = ErrAsync(promiseResolve("5"))
					.mapErr((x) => x.toString())
					.mapErr(async (x) => Number(x) + (await promiseResolve(5)));
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<never, number>>>();
			});
			test("ResultAsync.mapErr() should modify a promise<T>: number to a U: { age: Promise<T> } result", () => {
				const result = ErrAsync(promiseResolve(5)).mapErr((number) => {
					return { errorCode: number };
				});
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<never, { errorCode: number }>>>();
			});
			test("ResultAsync.mapErr() should modify a promise<T>: number to a U: { age: Promise<T> } result when awaited", async () => {
				const result = await ErrAsync(promiseResolve(5)).mapErr((number) => {
					return { errorCode: number };
				});
				expectTypeOf(result).toEqualTypeOf<Result<never, { errorCode: number }>>();
			});
			test("ResultAsync.mapErr() should keep the types inferred", () => {
				const result = ErrAsync<string, number>(promiseResolve(5)).mapErr((number) => {
					return { errorCode: number };
				});
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<string, { errorCode: number }>>>();
			});
			test("ResultAsync.mapErr() should type only the error given one type", () => {
				const result = ErrAsync<number>(promiseResolve(5)).mapErr((number) => new Error(number.toString()));
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<never, Error>>>();
			});
			test("ResultAsync.mapErr() should correctly map a function's return types", () => {
				const returnResult = (number: number): ResultAsync<Result<number, { errorCode: number; message: string }>> => {
					if (number > 5) {
						return OkAsync(number);
					} else {
						return ErrAsync({ errorCode: number, message: "error" });
					}
				};

				const result = returnResult(10).mapErr((error) => error.message);
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, string>>>();
			});
		});
		describe("ResultAsync.andThen() Tests", () => {
			// ----------- Helper functions -----------
			interface ErrorDetail {
				error: string;
				detail: unknown;
			}
			const checkValidString = (data: string, correctData: string): Result<string, ErrorDetail> => {
				if (data === correctData) {
					return Ok(data);
				}
				return Err({
					error: "IncorrectStringError",
					detail: `The passed string: ${data} did not match: ${correctData}`,
				});
			};

			const stringToNumber = (data: string): Result<number, ErrorDetail> => {
				const number = Number(data);

				if (!isNaN(number) || !isFinite(number)) {
					return Ok(number);
				}

				return Err({
					error: "InvalidNumberStringError",
					detail: `The passed string: ${data} did not resolve to a number`,
				});
			};

			const checkNumberLength = (data: number, minLength: number): Result<number, ErrorDetail> => {
				if (data > minLength) {
					return Ok(data);
				}
				return Err({
					error: "IncorrectNumberError",
					detail: `The passed number: ${data} did not match: > 5`,
				});
			};
			// ----------------------------------------

			test("ResultAsync.andThen() should correctly map a ResultAsync.", () => {
				const result = Result.fromPromise(promiseResolve("Hello!")).andThen((x) => checkValidString(x, "Hello!"));
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<string, ErrorDetail>>>();
			});
			test("ResultAsync.andThen() should correctly map a ResultAsync to a Resultwhen awaited.", async () => {
				const result = await Result.fromPromise(promiseResolve("Hello!")).andThen((x) => checkValidString(x, "Hello!"));
				expectTypeOf(result).toEqualTypeOf<Result<string, ErrorDetail>>();
			});
			test("ResultAsync.andThen() should correctly handle a mixture of promise and normal functions while preserving types.", () => {
				const result = Result.fromPromise(promiseResolve("1234"))
					.andThen((x) => checkValidString(x, "1234"))
					.andThen((x) => stringToNumber(x))
					.andThen((x) => checkNumberLength(x, 10))
					.andThen(async (x) => {
						// inline requires return types on Err or Ok, or the types will not union correctly
						const addNum = await promiseResolve(5);
						const addedNum = x + addNum;

						if (addedNum > 10) {
							return Ok<number>(addedNum);
						} else {
							return Err<ErrorDetail>({
								error: "IncorrectNumberError",
								detail: `The passed number: ${addedNum} did not match: > 10`,
							});
						}
					})
					.andThen((x) => checkNumberLength(x, 15));
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, ErrorDetail>>>();
			});

			test("ResultAsync.andThen() should flatten a returned ResultAsync", () => {
				const asyncOp = (n: number) => OkAsync<string, ErrorDetail>(n.toString());

				const result = Result.fromPromise(promiseResolve(10)).andThen((n) => asyncOp(n));

				// This is the intended type
				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<string, ErrorDetail>>>();
				// @ts-expect-error: ResultAsync should always flatten nested ResultAsync
				expectTypeOf(result).toEqualTypeOf<ResultAsync<ResultAsync<Result<string, ErrorDetail>>>>();
			});

			test("ResultAsync.andThen() should override different error types in the chain", () => {
				interface NetworkError {
					type: "NETWORK";
				}
				interface ValidationError {
					type: "VALIDATION";
				}

				const result = OkAsync<string, NetworkError>("data").andThen<string, ValidationError>((_x) => {
					return ErrAsync({ type: "VALIDATION" });
				});

				expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<string, ValidationError>>>();
			});
		});
	});
});
