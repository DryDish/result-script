import { describe, test, expectTypeOf } from "vitest";
import { Result, Ok, Err } from "../../src/result/result";

interface ComplexObject {
	name: string;
	age: number;
	address: {
		street: string;
		city: string;
		country: string;
	};
}

describe("Result type tests", () => {
	describe("Ok type tests", () => {
		describe("Simple type tests", () => {
			describe("Inferred types", () => {
				test("Ok(number) should have the type Result<number, never>", () => {
					const result = Ok(123);
					expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
				});

				test("Ok(string)should have the typeResult<string, never>", () => {
					const result = Ok("foo");
					expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
				});

				test("Ok(boolean)should have the typeResult<boolean, never>", () => {
					const result = Ok(true);
					expectTypeOf(result).toEqualTypeOf<Result<boolean, never>>();
				});

				test("Ok(number[]) should have the type Result<number[], never>", () => {
					const result = Ok([1, 2, 3]);
					expectTypeOf(result).toEqualTypeOf<Result<number[], never>>();
				});

				test("Ok(string[]) should have the type Result<string[], never>", () => {
					const result = Ok(["a", "b", "c"]);
					expectTypeOf(result).toEqualTypeOf<Result<string[], never>>();
				});
			});
			describe("Explicit types", () => {
				test("Ok<number, string> should have the type Result<number, string>", () => {
					const result = Ok<number, string>(123);
					expectTypeOf(result).toEqualTypeOf<Result<number, string>>();
				});

				test("Ok<string, string> should have the type Result<string, string>", () => {
					const result = Ok<string, string>("foo");
					expectTypeOf(result).toEqualTypeOf<Result<string, string>>();
				});

				test("Ok<boolean, Error> should have the type Result<boolean, Error>", () => {
					const result = Ok<boolean, Error>(true);
					expectTypeOf(result).toEqualTypeOf<Result<boolean, Error>>();
				});

				test("Ok<number[], number> should have the type Result<number[], number>", () => {
					const result = Ok<number[], number>([1, 2, 3]);
					expectTypeOf(result).toEqualTypeOf<Result<number[], number>>();
				});

				test("Ok<string[], bigint> should have the type Result<string[], number>", () => {
					const result = Ok<string[], bigint>(["a", "b", "c"]);
					expectTypeOf(result).toEqualTypeOf<Result<string[], bigint>>();
				});
			});
		});

		describe("Complex type tests", () => {
			test("Ok(ComplexObject) should be of type Result<ComplexObject, never>", () => {
				const result = Ok({
					name: "John Tester",
					age: 30,
					address: {
						street: "Test street",
						city: "Test city",
						country: "Test country",
					},
				});
				expectTypeOf(result).toEqualTypeOf<Result<ComplexObject, never>>();
			});

			test("Ok(ComplexObject & {class: string}) should not be of type Result<ComplexObject, never>", () => {
				const result = Ok({
					name: "John Tester",
					age: 30,
					address: {
						street: "Test street",
						city: "Test city",
						country: "Test country",
					},
					class: "Test class",
				});

				// @ts-expect-error: result should not be of type Result<ComplexObject, never>
				expectTypeOf(result).toEqualTypeOf<Result<ComplexObject, never>>();
			});

			test("Ok(Error) should be of type Result<Error, never>", () => {
				const result = Ok(new Error("Test error"));
				expectTypeOf(result).toEqualTypeOf<Result<Error, never>>();
			});
		});
	});

	describe("Err simple type tests", () => {
		describe("Simple type tests", () => {
			describe("Inferred types", () => {
				test("Err(number) should have the type Result<never, number>", () => {
					const result = Err(123);
					expectTypeOf(result).toEqualTypeOf<Result<never, number>>();
				});

				test("Err(string) should have the type Result<never, string>", () => {
					const result = Err("foo");
					expectTypeOf(result).toEqualTypeOf<Result<never, string>>();
				});

				test("Err(boolean) should have the type Result<never, boolean>", () => {
					const result = Err(true);
					expectTypeOf(result).toEqualTypeOf<Result<never, boolean>>();
				});

				test("Err(number[]) should have the type Result<never, number[]>", () => {
					const result = Err([1, 2, 3]);
					expectTypeOf(result).toEqualTypeOf<Result<never, number[]>>();
				});

				test("Err(string[]) should have the type Result<never, string[]>", () => {
					const result = Err(["a", "b", "c"]);
					expectTypeOf(result).toEqualTypeOf<Result<never, string[]>>();
				});
			});

			describe("Explicit types", () => {
				test("Err<string, number> should have the type Result<string, number>", () => {
					const result = Err<string, number>(123);
					expectTypeOf(result).toEqualTypeOf<Result<string, number>>();
				});

				test("Err<string, string> should have the type Result<string, string>", () => {
					const result = Err<string, string>("foo");
					expectTypeOf(result).toEqualTypeOf<Result<string, string>>();
				});

				test("Err<number, boolean> should have the type Result<number, boolean>", () => {
					const result = Err<number, boolean>(true);
					expectTypeOf(result).toEqualTypeOf<Result<number, boolean>>();
				});

				test("Err<number, number[]> should have the type Result<number, number[]>", () => {
					const result = Err<number, number[]>([1, 2, 3]);
					expectTypeOf(result).toEqualTypeOf<Result<number, number[]>>();
				});

				test("Err<string[], bigint> should have the type Result<string[], number>", () => {
					const result = Err<string[], bigint>(BigInt(1234));
					expectTypeOf(result).toEqualTypeOf<Result<string[], bigint>>();
				});
			});
		});

		describe("Complex type tests", () => {
			test("Err(ComplexObject) should be of type Result<never, ComplexObject>", () => {
				const result = Err({
					name: "John Tester",
					age: 30,
					address: {
						street: "Test street",
						city: "Test city",
						country: "Test country",
					},
				});
				expectTypeOf(result).toEqualTypeOf<Result<never, ComplexObject>>();
			});

			test("Err(ComplexObject & {class: string}) should not be of type Result<never, ComplexObject>", () => {
				const result = Err({
					name: "John Tester",
					age: 30,
					address: {
						street: "Test street",
						city: "Test city",
						country: "Test country",
					},
					class: "Test class",
				});

				// @ts-expect-error: result should not be of type Result<never, ComplexObject>
				expectTypeOf(result).toEqualTypeOf<Result<never, ComplexObject>>();
			});

			test("Err(Error) should be of type Result<never, Error>", () => {
				const result = Err(new Error("Test error"));
				expectTypeOf(result).toEqualTypeOf<Result<never, Error>>();
			});
		});
	});

	describe("Result method tests", () => {
		describe("Result.map() tests", () => {
			test("Result<number, never>.map() should modify a T: number to a U: string result", () => {
				const result = Ok(5).map((x) => x.toString());

				console.log(result.ok);

				expectTypeOf(result).toEqualTypeOf<Result<string, never>>();
			});
			test("Result<number, never>.map() should modify a T: number to a U: string back to a V: number result", () => {
				const result = Ok(5)
					.map((x) => x.toString())
					.map((x) => Number(x));
				expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
			});
			test("Result<number, string>.map() should modify a T: number to a U: { age: number } result", () => {
				const result = Ok<number, string>(5).map((number) => {
					return { age: number };
				});
				expectTypeOf(result).toEqualTypeOf<Result<{ age: number }, string>>();
			});
		});

		describe("Result.mapOr() tests", () => {
			test("Result<number, never>.mapOr() should modify a T: number to a U: string result", () => {
				const result = Ok(5).mapOr("42", (x) => x.toString());

				expectTypeOf(result).toEqualTypeOf<string>();
			});
		});

		describe("Result.mapOrElse() tests", () => {});

		describe("Result.mapErr() tests", () => {});

		describe("Result.andThen() tests", () => {});

		describe("Result.or() tests", () => {});

		describe("Result.orElse() tests", () => {});
	});
});
