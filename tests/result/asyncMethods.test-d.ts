import { Err, Ok, Result } from "../../src/result/result";
import { ErrAsync, OkAsync, ResultAsync } from "../../src/result/resultAsync";
import { describe, test, expect, expectTypeOf } from "vitest";

describe("ResultAsync type tests", () => {
	describe("OkAsync type tests", () => {
		test("A not awaited OkAsync should return a ResultAsync<Result<number, never>>", () => {
			const result = OkAsync(12);
			expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<number, never>>>();
		});

		test("An awaited OkAsync should return a Result<number, never>", async () => {
			const result = await OkAsync(12);
			expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
		});
	});
	describe("ErrAsync type tests", () => {
		test("A not awaited ErrAsync should return a ResultAsync<Result<never, string>>", () => {
			const result = ErrAsync("error");
			expectTypeOf(result).toEqualTypeOf<ResultAsync<Result<never, string>>>();
		});

		test("An awaited ErrAsync should return a Result<never, string>", async () => {
			const result = await ErrAsync("error");
			expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
		});
	});
	describe("Method type tests", () => {
		// -----------------UTILITY FUNCTIONS---------------------
		const promiseResolve = <T>(variable: T): Promise<T> => new Promise<T>((resolve) => resolve(variable));
		const promiseReject = <T>(): Promise<T> => new Promise((_, reject) => reject("rejected"));
		// ---------------UTILITY FUNCTIONS END-------------------

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
});
