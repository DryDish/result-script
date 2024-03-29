import { Result, Ok, Err } from "../src/result";

interface ErrorMessage<E, T> {
	error: E;
	detail: T;
}

describe("Result.isOk() Tests", () => {
	test("result.isOk() should return true on a result with an Ok inside.", () => {
		const result: Result<number, string> = Ok(-3);
		expect(result.isOk()).toBe(true);
	});

	test("result.isOk() should return false on a result with an Err inside.", () => {
		const result: Result<number, ErrorMessage<Error, string>> = Err({
			error: Error(),
			detail: "All is good here, just some data",
		});
		expect(result.isOk()).toBe(false);
	});
});

describe("Result.isOkAnd() Tests", () => {
	test("result.isOkAnd() should return true on Ok(2) > 1", () => {
		const result: Result<number, string> = Ok(2);
		expect(result.isOkAnd((x) => x > 1)).toBe(true);
	});

	test("result.isOkAnd() should return false on Ok(0) > 1", () => {
		const result: Result<number, string> = Ok(0);
		expect(result.isOkAnd((x) => x > 1)).toBe(false);
	});

	test("result.isOkAnd() should return false on Err('hey') > 1", () => {
		const result: Result<number, string> = Err("hey");
		expect(result.isOkAnd((x) => x > 1)).toBe(false);
	});
});

describe("Result.isErr() Tests", () => {
	test("result.isErr() should return false on a result with an Ok inside.", () => {
		const result: Result<number, string> = Ok(-3);
		expect(result.isErr()).toBe(false);
	});

	test("result.isErr() should return true on a result with an Err inside.", () => {
		const result: Result<number, string> = Err("Big issues here!");
		expect(result.isErr()).toBe(true);
	});
});

describe("Result.isErrAnd() Tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	enum ErrorKinds {
		NotFound,
		PermissionDenied,
	}
	// ---------------UTILITY FUNCTIONS END-------------------

	test("result.isErrAnd() should return true on Ok(2) > 1", () => {
		const result: Result<number, ErrorKinds> = Err(ErrorKinds.NotFound);
		expect(result.isErrAnd((x) => x === ErrorKinds.NotFound)).toBe(true);
	});

	test("result.isErrAnd() should return true on Ok(2) > 1", () => {
		const result: Result<number, ErrorKinds> = Err(ErrorKinds.PermissionDenied);
		expect(result.isErrAnd((x) => x === ErrorKinds.NotFound)).toBe(false);
	});

	test("result.isErrAnd() should return true on Ok(2) > 1", () => {
		const result: Result<number, ErrorKinds> = Ok(123);
		expect(result.isErrAnd((x) => x === ErrorKinds.NotFound)).toBe(false);
	});
});

describe("Result.map() Tests", () => {
	test("Result.map() should do modify a T: string to a U: number result", () => {
		const result: Result<string, string> = Ok("foo");
		expect(result.map((x) => x.length)).toStrictEqual(Ok(3));
	});

	test("Result.map() should do modify a T: number to a U: string result", () => {
		const result: Result<number, string> = Ok(12);
		expect(result.map((x) => x.toString())).toStrictEqual(Ok("12"));
	});

	test("Result.map() should do nothing to an Err Result", () => {
		const result: Result<string, number> = Err(-1);
		expect(result.map((x) => x.length)).toStrictEqual(Err(-1));
	});

	test("Result.map() should do modify a T: number to a U: string result", () => {
		const result = Ok(5)
			.map((x) => x * x)
			.map((x) => x.toString())
			.map((x) => " Number is: " + x + " ")
			.map((x) => x.trim());

		expect(result).toStrictEqual(Ok("Number is: 25"));
	});
});

describe("Result.mapOr() Tests", () => {
	test("Result.mapOr() should do modify a T: string to a U: number result", () => {
		const result: Result<string, string> = Ok("foo");
		expect(result.mapOr(42, (x) => x.length)).toBe(3);
	});

	test("Result.mapOr() should do modify a T: string to a U: number result", () => {
		const result: Result<string, string> = Err("bar");
		expect(result.mapOr(42, (x) => x.length)).toBe(42);
	});
});

describe("Result.mapOrElse() Tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const stringErrToNum = (error: string): number => {
		if (error == "OutOfBounds") {
			return -1;
		} else {
			return -2;
		}
	};
	const k = 21;
	// ---------------UTILITY FUNCTIONS END-------------------
	test("Result.mapOrElse() should call the success callback and return 3", () => {
		const result: Result<string, string> = Ok("foo");
		expect(
			result.mapOrElse(
				(_e) => k * 2,
				(v) => v.length
			)
		).toBe(3);
	});

	test("Result.mapOrElse() should call the error callback and return 42", () => {
		const result: Result<string, string> = Err("bar");
		expect(
			result.mapOrElse(
				(_e) => k * 2,
				(v) => v.length
			)
		).toBe(42);
	});

	test("Result.mapOrElse() should call the error callback and return 42", () => {
		const result: Result<string, string> = Err("OutOfBounds");
		expect(
			result.mapOrElse(
				(e) => stringErrToNum(e),
				(v) => v.length
			)
		).toBe(-1);
	});

	test("Result.mapOrElse() should call the error callback and return 42", () => {
		const result: Result<string, string> = Err("SomethingElse");
		expect(
			result.mapOrElse(
				(e) => stringErrToNum(e),
				(v) => v.length
			)
		).toBe(-2);
	});
});

describe("Result.mapErr() Tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const stringify = (x: number): string => `error code is: ${x}`;
	// ---------------UTILITY FUNCTIONS END-------------------

	test("Result.mapErr() should do modify a E to an F without modifying the T", () => {
		const result = Ok<number, number>(2)
			.mapErr((err) => stringify(err))
			.map((x) => x * 2);
		expect(result).toStrictEqual(Ok(4));
	});

	test("Result.mapErr() should do modify a E to an F without modifying the T", () => {
		const result: Result<number, number> = Err(13);
		expect(result.mapErr(stringify)).toStrictEqual(Err("error code is: 13"));
	});
});

describe("Result.expect() Tests", () => {
	test("Result.expect() should throw an error when called on an Err", () => {
		const result: Result<number, string> = Err("emergency failure");
		expect(() => result.expect("Testing expect")).toThrowError(Error('Testing expect: "emergency failure"'));
	});

	test("Result.expect() should return T when called on Ok", () => {
		const result: Result<number, string> = Ok(123);
		expect(result.expect("Testing expect")).toBe(123);
	});
});

describe("Result.unwrap() Tests", () => {
	test("Result.unwrap() should return the it's data when called on an Ok", () => {
		const result: Result<number, string> = Ok(2);
		expect(result.unwrap()).toBe(2);
	});

	test("Result.unwrap() should throw error when called on an Err.", () => {
		const result: Result<number, ErrorMessage<string, string>> = Err({
			error: "SuperBadError",
			detail: "Error was thrown here today!",
		});
		expect(() => {
			result.unwrap();
		}).toThrowError(
			'Called Result.unwrap() on an Err value: {"error":"SuperBadError","detail":"Error was thrown here today!"}'
		);
	});

	test("Result.unwrap() should throw error when called on an Err.", () => {
		const result: Result<number, string> = Err("Something is wrong");
		expect(() => {
			result.unwrap();
		}).toThrowError('Called Result.unwrap() on an Err value: "Something is wrong"');
	});
});

describe("Result.expectErr() Tests", () => {
	test("Result.expectErr() should throw an error when called on an Ok", () => {
		const result: Result<number, string> = Ok(10);
		expect(() => result.expectErr("Testing expectErr")).toThrowError(Error("Testing expectErr: 10"));
	});

	test("Result.expectErr() should throw an error when called on an Ok", () => {
		const result: Result<object, string> = Ok({ name: "bob", age: 12 });
		expect(() => result.expectErr("Testing expectErr")).toThrowError(
			Error('Testing expectErr: {"name":"bob","age":12}')
		);
	});

	test("Result.expect() should return E when called on an Err", () => {
		const result: Result<number, string> = Err("Some Error");
		expect(result.expectErr("Testing expectErr")).toBe("Some Error");
	});
});

describe("Result.unwrapErr() Tests", () => {
	test("Result.unwrapErr() should throw error: 'Attempted to unwrapErr an Ok' when called on an Ok.", () => {
		const result: Result<number, string> = Ok(2);
		expect(() => result.unwrapErr()).toThrowError("Called Result.unwrapErr() on an Ok value: 2");
	});

	test("Result.unwrapErr() should throw error: 'Attempted to unwrapErr an Ok' when called on an Ok.", () => {
		const result: Result<{ name: string; age: number }, string> = Ok({ name: "Ann", age: 21 });
		expect(() => result.unwrapErr()).toThrowError('Called Result.unwrapErr() on an Ok value: {"name":"Ann","age":21}');
	});

	test("Result.unwrapErr() should return the Err's value when called on an Err", () => {
		const result: Result<number, ErrorMessage<string, string>> = Err({
			error: "SuperBadError",
			detail: "Error was thrown here today!",
		});
		expect(result.unwrapErr()).toStrictEqual({ error: "SuperBadError", detail: "Error was thrown here today!" });
	});

	test("Result.unwrapErr() should return the Err's value when called on an Err", () => {
		const result: Result<number, string> = Err("emergency failure");
		expect(result.unwrapErr()).toStrictEqual("emergency failure");
	});
});

describe("Result.and() tests", () => {
	test("Result.and() Should return the Err object.", () => {
		const x: Result<number, string> = Ok(2);
		const y: Result<string, string> = Err("late error");
		expect(x.and(y)).toStrictEqual(Err("late error"));
	});

	test("Result.and() Should still return the Err object.", () => {
		const x: Result<number, string> = Err("early error");
		const y: Result<string, string> = Ok("foo");
		expect(x.and(y)).toStrictEqual(Err("early error"));
	});

	test("Result.and() Should return the first Err object.", () => {
		const x: Result<number, string> = Err("not a 2");
		const y: Result<string, string> = Err("late error");
		expect(x.and(y)).toStrictEqual(Err("not a 2"));
	});

	test("Result.and() Should return the first Err object.", () => {
		const x: Result<number, string> = Ok(2);
		const y: Result<string, string> = Ok("Different Result Type");
		expect(x.and(y)).toStrictEqual(Ok("Different Result Type"));
	});
});

describe("Result.andThen() tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const validateStringType = (data: unknown): Result<string, ErrorMessage<string, string>> => {
		if (typeof data === "string") {
			return Ok(data);
		}
		return Err({
			error: "InvalidDataType",
			detail: `The datatype provided was supposed to be 'string' but was given: '${typeof data}'`,
		});
	};
	const capitalizeFirstLetter = (chars: string): Result<string, ErrorMessage<string, string>> => {
		try {
			const updatedChars = chars.charAt(0).toUpperCase() + chars.slice(1);
			return Ok(updatedChars);
		} catch (error) {
			return Err({ error: error as string, detail: "Whoopsie" });
		}
	};
	const validateCorrectString = (
		chars: string,
		correctString: string
	): Result<string, ErrorMessage<string, string>> => {
		if (chars === correctString) {
			return Ok(chars);
		}
		return Err({
			error: "InvalidCharSequenceError",
			detail: `Was expecting the char sequence: '${correctString}' but got: '${chars}'.`,
		});
	};
	const returnErrorUnreasonably = (item: unknown): Result<string, ErrorMessage<string, string>> => {
		return Err({ error: "UnreasonableError", detail: `An unreasonable error has been encountered! ${item}` });
	};
	// ---------------UTILITY FUNCTIONS END-------------------

	test("Result.andThen() Should return an Ok with the string 'Banana' inside at end of the chain.", () => {
		const result: Result<string, ErrorMessage<string, string>> = validateStringType("banana")
			.andThen(capitalizeFirstLetter)
			.andThen((x) => validateCorrectString(x, "Banana"));

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe("Banana");
	});

	test("Result.andThen() Should return an Err with the error: 'InvalidDataType', halting execution early.", () => {
		const result: Result<string, ErrorMessage<string, string>> = validateStringType(12345)
			.andThen(capitalizeFirstLetter)
			.andThen((x) => validateCorrectString(x, "Banana"));

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual({
			error: "InvalidDataType",
			detail: "The datatype provided was supposed to be 'string' but was given: 'number'",
		});
	});

	test("Result.andThen() Should return an Err with the error: 'UnreasonableError', halting execution early.", () => {
		const result: Result<string, ErrorMessage<string, string>> = validateStringType("pineapple")
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
		const result: Result<string, ErrorMessage<string, string>> = validateStringType("pineapple")
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
		const x: Result<number, string> = Ok(2);
		const y: Result<number, string> = Err("Late error");

		expect(x.or(y)).toStrictEqual(Ok(2));
	});

	test("Test should return 'res'.", () => {
		const x: Result<number, string> = Err("Early error");
		const y: Result<number, string> = Ok(2);

		expect(x.or(y)).toStrictEqual(Ok(2));
	});

	test("Test should return error from 'res'.", () => {
		const x: Result<number, string> = Err("Not a 2");
		const y: Result<number, string> = Err("Late error");

		expect(x.or(y)).toStrictEqual(Err("Late error"));
	});

	test("Test should return 'this'.", () => {
		const x: Result<number, string> = Ok(2);
		const y: Result<number, string> = Ok(1234);

		expect(x.or(y)).toStrictEqual(Ok(2));
	});
});

// Missing feature parity!
// Initializing Ok  does not return a data type with a know E, even after function returns
// Initializing Err does not return a data type with a know T, even after function returns
// Currently, when initializing Ok or Err alone, you must also define the possible other type
describe("Result.orElse() tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const sq = (x: number): Result<number, number> => Ok(x * x);
	const err = (x: number): Result<number, number> => Err(x);
	// ---------------UTILITY FUNCTIONS END-------------------

	test("Test should return 'Ok(2)'.", () => {
		const result = Ok<number, number>(2).orElse(sq).orElse(sq);
		expect(result).toStrictEqual(Ok(2));
	});

	test("Test should return 'Ok(2)'.", () => {
		const result = Ok<number, number>(2).orElse(err).orElse(sq);
		expect(result).toStrictEqual(Ok(2));
	});

	test("Test should return 'Ok(9)'.", () => {
		const result = Err<number, number>(3).orElse(sq).orElse(err);
		expect(result).toStrictEqual(Ok(9));
	});

	test("Test should return 'Err(3)'.", () => {
		const result = Err<number, number>(3).orElse(err).orElse(err);
		expect(result).toStrictEqual(Err(3));
	});
});

describe("Result.unwrapOr() tests", () => {
	test("Result.unwrapOr(2) should return 9 on Ok(9)", () => {
		const result: Result<number, string> = Ok(9);
		expect(result.unwrapOr(2)).toBe(9);
	});

	test("Result.unwrapOr(2) should return 2 on Err(...)", () => {
		const result: Result<number, string> = Err("error");
		expect(result.unwrapOr(2)).toBe(2);
	});
});

describe("Result.unwrapOrElse() tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const count = (x: string): number => x.length;
	// ---------------UTILITY FUNCTIONS END-------------------
	test("Result.unwrapOrElse(count) should return 9 on Ok(9)", () => {
		const result: Result<number, string> = Ok(9);
		expect(result.unwrapOrElse(count)).toBe(9);
	});

	test("Result.unwrapOrElse(count) should return 3 on Err('foo')", () => {
		const result: Result<number, string> = Err("foo");
		expect(result.unwrapOrElse(count)).toBe(3);
	});
});

describe("Result.contains() tests", () => {
	test("Result.contains(2) should return true on Ok(2)", () => {
		const result: Result<number, string> = Ok(2);
		expect(result.contains(2)).toBe(true);
	});

	test("Result.contains(2) should return false on Ok(3)", () => {
		const result: Result<number, string> = Ok(3);
		expect(result.contains(2)).toBe(false);
	});

	test("Result.contains(2) should return true on Ok(2)", () => {
		const result: Result<number, string> = Err("Some error message");
		expect(result.contains(2)).toBe(false);
	});

	test("Result.contains(<Object>) should return true when comparing an equal object", () => {
		const result: Result<unknown, string> = Ok({ data: 123 });
		expect(result.contains({ data: 123 })).toBe(true);
	});

	test("Result.contains(<Object>) should return false when comparing a different object", () => {
		const result: Result<unknown, string> = Ok({ data: 123 });
		expect(result.contains({ data: "123" })).toBe(false);
	});
});

describe("Result.containsErr() tests", () => {
	test("Result.contains('Some error message') should return false on Ok(2)", () => {
		const result: Result<number, string> = Ok(2);
		expect(result.containsErr("Some error message")).toBe(false);
	});

	test("Result.contains('Some error message') should return true on Ok('Some error message')", () => {
		const result: Result<number, string> = Err("Some error message");
		expect(result.containsErr("Some error message")).toBe(true);
	});

	test("Result.contains('Some error message') should return false on Err('Some other error message')", () => {
		const result: Result<number, string> = Err("Some other error message");
		expect(result.containsErr("Some error message")).toBe(false);
	});

	interface ErrMsg {
		detail: string;
	}

	test("Result.contains(<Object>) should return true when comparing equal objects", () => {
		const result: Result<number, ErrMsg> = Err({ detail: "Some error has occurred" });
		expect(result.containsErr({ detail: "Some error has occurred" })).toBe(true);
	});

	test("Result.contains(<Object>) should return false when comparing different objects", () => {
		const result: Result<number, ErrMsg> = Err({ detail: "Some error has occurred" });
		expect(result.containsErr({ detail: "Some other error has occurred" })).toBe(false);
	});
});
