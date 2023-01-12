import { ErrorMessage } from "../components/interfaces";
import { Err, Ok, Result } from "../components/result";

describe("Result.isOk() Tests", () => {
	test("result.isOk() should return true on a result with an Ok inside.", () => {
		const result: Result<number, string> = new Ok(-3);
		expect(result.isOk()).toBe(true);
	});

	test("result.isOk() should return false on a result with an Err inside.", () => {
		const result: Result<number, ErrorMessage<Error, string>> = new Err({
			error: Error(),
			detail: "All is good here, just some data",
		});
		expect(result.isOk()).toBe(false);
	});
});

describe("Result.isOkAnd() Tests", () => {
	test("result.isOkAnd() should return true on Ok(2) > 1", () => {
		const result: Result<number, string> = new Ok(2);
		expect(result.isOkAnd((x) => x > 1)).toBe(true);
	});

	test("result.isOkAnd() should return false on Ok(0) > 1", () => {
		const result: Result<number, string> = new Ok(0);
		expect(result.isOkAnd((x) => x > 1)).toBe(false);
	});

	test("result.isOkAnd() should return false on Err('hey') > 1", () => {
		const result: Result<number, string> = new Err("hey");
		expect(result.isOkAnd((x) => x > 1)).toBe(false);
	});
});

describe("Result.isErr() Tests", () => {
	test("result.isErr() should return false on a result with an Ok inside.", () => {
		const result: Result<number, string> = new Ok(-3);
		expect(result.isErr()).toBe(false);
	});

	test("result.isErr() should return true on a result with an Err inside.", () => {
		const result: Result<number, string> = new Err("Big issues here!");
		expect(result.isErr()).toBe(true);
	});
});

describe("Result.unwrap() Tests", () => {
	test("result.unwrap() should return the it's data when called on an Ok", () => {
		const result: Result<number, string> = new Ok(2);
		expect(result.unwrap()).toBe(2);
	});

	test("result.unwrap() should throw error: 'Attempted to unwrap an Err.' when called on an Err.", () => {
		const result: Result<number, ErrorMessage<string, string>> = new Err({
			error: "SuperBadError",
			detail: "Error was thrown here today!",
		});
		expect(result.unwrap).toThrowError("Attempted to unwrap an Err.");
	});
});

describe("Result.unwrapErr() Tests", () => {
	test("Result.unwrapErr() should throw error: 'Attempted to unwrapErr an Ok' when called on an Ok.", () => {
		const result: Result<number, string> = new Ok(2);
		expect(result.unwrapErr).toThrowError("Attempted to unwrapErr an Ok.");
	});

	test("Result.unwrapErr() should return the it's Error when called on an Err", () => {
		const result: Result<number, ErrorMessage<string, string>> = new Err({
			error: "SuperBadError",
			detail: "Error was thrown here today!",
		});
		expect(result.unwrapErr()).toStrictEqual({ error: "SuperBadError", detail: "Error was thrown here today!" });
	});
});

describe("Result.and() tests", () => {
	test("Result.and() Should return the Err object.", () => {
		const x: Result<number, string> = new Ok(2);
		const y: Result<string, string> = new Err("late error");
		expect(x.and(y)).toStrictEqual(new Err("late error"));
	});

	test("Result.and() Should still return the Err object.", () => {
		const x: Result<number, string> = new Err("early error");
		const y: Result<string, string> = new Ok("foo");
		expect(x.and(y)).toStrictEqual(new Err("early error"));
	});

	test("Result.and() Should return the first Err object.", () => {
		const x: Result<number, string> = new Err("not a 2");
		const y: Result<string, string> = new Err("late error");
		expect(x.and(y)).toStrictEqual(new Err("not a 2"));
	});

	test("Result.and() Should return the first Err object.", () => {
		const x: Result<number, string> = new Ok(2);
		const y: Result<string, string> = new Ok("Different Result Type");
		expect(x.and(y)).toStrictEqual(new Ok("Different Result Type"));
	});
});

describe("Result.andThen() tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const validateStringType = (data: unknown): Result<string, ErrorMessage<string, string>> => {
		if (typeof data === "string") {
			return new Ok(data);
		} else {
			return new Err({
				error: "InvalidDataType",
				detail: `The datatype provided was supposed to be 'string' but was given: '${typeof data}'`,
			});
		}
	};
	const capitalizeFirstLetter = (chars: string): Result<string, ErrorMessage<string, string>> => {
		try {
			const updatedChars = chars.charAt(0).toUpperCase() + chars.slice(1);
			return new Ok(updatedChars);
		} catch (error) {
			return new Err({ error: error as string, detail: "Whoopsie" });
		}
	};
	const validateCorrectString = (
		chars: string,
		correctString: string
	): Result<string, ErrorMessage<string, string>> => {
		if (chars === correctString) {
			return new Ok(chars);
		} else {
			return new Err({
				error: "InvalidCharSequenceError",
				detail: `Was expecting the char sequence: '${correctString}' but got: '${chars}'.`,
			});
		}
	};
	const returnErrorUnreasonably = (item: unknown): Result<string, ErrorMessage<string, string>> => {
		return new Err({ error: "UnreasonableError", detail: `An unreasonable error has been encountered! ${item}` });
	};
	// ---------------UTILITY FUNCTIONS END-------------------

	test("Result.andThen() Should return an Ok with the string 'Banana' inside at end of the chain.", () => {
		const result = validateStringType("banana")
			.andThen(capitalizeFirstLetter)
			.andThen((x: string) => validateCorrectString(x, "Banana"));

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe("Banana");
	});

	test("Result.andThen() Should return an Err with the error: 'InvalidDataType', halting execution early.", () => {
		const result = validateStringType(12345)
			.andThen(capitalizeFirstLetter)
			.andThen((x: string) => validateCorrectString(x, "Banana"));

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual({
			error: "InvalidDataType",
			detail: "The datatype provided was supposed to be 'string' but was given: 'number'",
		});
	});

	test("Result.andThen() Should return an Err with the error: 'UnreasonableError', halting execution early.", () => {
		const result = validateStringType("pineapple")
			.andThen(capitalizeFirstLetter)
			.andThen(returnErrorUnreasonably)
			.andThen((x: string) => validateCorrectString(x, "Banana"));

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual({
			error: "UnreasonableError",
			detail: "An unreasonable error has been encountered! Pineapple",
		});
	});

	test("Result.andThen() Should return an Err with the error: 'InvalidCharSequenceError', halting execution at the last step.", () => {
		const result = validateStringType("pineapple")
			.andThen(capitalizeFirstLetter)
			.andThen((x: string) => validateCorrectString(x, "Banana"));

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual({
			error: "InvalidCharSequenceError",
			detail: "Was expecting the char sequence: 'Banana' but got: 'Pineapple'.",
		});
	});
});

describe("Result.or() tests", () => {
	test("Test should return 'this'.", () => {
		const x: Result<number, string> = new Ok(2);
		const y: Result<number, string> = new Err("Error Has occurred!");

		expect(x.or(y)).toStrictEqual(new Ok(2));
	});

	test("Test should return 'res'.", () => {
		const x: Result<number, string> = new Err("Error Has occurred!");
		const y: Result<number, string> = new Ok(2);

		expect(x.or(y)).toStrictEqual(new Ok(2));
	});

	test("Test should return error from 'res'.", () => {
		const x: Result<number, string> = new Err("Not a 2");
		const y: Result<number, string> = new Err("Error Has occurred!");

		expect(x.or(y)).toStrictEqual(new Err("Error Has occurred!"));
	});

	test("Test should return 'this'.", () => {
		const x: Result<number, string> = new Ok(2);
		const y: Result<number, string> = new Ok(1234);

		expect(x.or(y)).toStrictEqual(new Ok(2));
	});
});

// TODO: Missing feature parity!
// Initializing Ok  does not return a data type with a know E, even after function returns
// Initializing Err does not return a data type with a know T, even after function returns
// Currently, when initialize Ok or Err alone, you must also define the possible other type
describe("Result.orElse() tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const sq = (x: number): Result<number, number> => {
		return new Ok(x * x);
	};

	const err = (x: number): Result<number, number> => {
		return new Err(x);
	};
	// ---------------UTILITY FUNCTIONS END-------------------

	test("Test should return 'Ok(2)'.", () => {
		const result = new Ok<number, number>(2).orElse(sq).orElse(sq);
		expect(result).toStrictEqual(new Ok(2));
	});

	test("Test should return 'Ok(2)'.", () => {
		const result = new Ok<number, number>(2).orElse(err).orElse(sq);
		expect(result).toStrictEqual(new Ok(2));
	});

	test("Test should return 'Ok(9)'.", () => {
		const result = new Err<number, number>(3).orElse(sq).orElse(err);
		expect(result).toStrictEqual(new Ok(9));
	});

	test("Test should return 'Err(3)'.", () => {
		const result = new Err<number, number>(3).orElse(err).orElse(err);
		expect(result).toStrictEqual(new Err(3));
	});
});

describe("Result.unwrapOr() tests", () => {
	test("Result.unwrapOr(2) should return 9 on Ok(9)", () => {
		const result = new Ok<number, string>(9);
		expect(result.unwrapOr(2)).toBe(9);
	});

	test("Result.unwrapOr(2) should return 2 on Err(...)", () => {
		const result = new Err<number, string>("error");
		expect(result.unwrapOr(2)).toBe(2);
	});
});
