import { Err, Ok } from "../components/result";

describe("Result Constructor Tests", () => {
	test("result.isErr() should return true on a result with an Err inside.", () => {
		const result = new Err(Error("Big issues here!"), "This is an Err!");
		expect(result.isErr()).toBe(true);
	});

	test("result.isErr() should return false on a result with an Ok inside.", () => {
		const result = new Ok({ stuff: "All is good here, just some data", moreStuff: [1, 2, 3] });
		expect(result.isErr()).toBe(false);
	});

	test("result.isOk() should return false on a result with an Err inside.", () => {
		const result = new Err(Error(), "All is good here, just some data");
		expect(result.isOk()).toBe(false);
	});

	test("result.isOk() should return true on a result with an Ok inside.", () => {
		const result = new Ok({ stuff: "All is good here, just some data", moreStuff: [1, 2, 3] });
		expect(result.isOk()).toBe(true);
	});

	test("result.unwrap() should return the it's data when called on an Ok", () => {
		const data = { stuff: "sample data", moreStuff: [1, 2, 3] };
		const result = new Ok(data);

		expect(result.unwrap()).toBe(data);
	});

	test("result.unwrap() should throw error: 'Attempted to unwrap an Err.' when called on an Err.", () => {
		const err = "SuperBadError";
		const detail = "Error was thrown here today!";

		const result = new Err(err, detail);

		expect(result.unwrap).toThrowError("Attempted to unwrap an Err.");
	});

	test("result.unwrapErr() should return the it's Error when called on an Err", () => {
		const err = "SuperBadError";
		const detail = "Error was thrown here today!";

		const result = new Err(err, detail);

		expect(result.unwrapErr()).toStrictEqual({ err, detail });
	});

	test("result.unwrapErr() should throw error: 'Attempted to unwrapErr an Ok' when called on an Ok.", () => {
		const data = { stuff: "sample data", moreStuff: [1, 2, 3] };
		const result = new Ok(data);

		expect(result.unwrapErr).toThrowError("Attempted to unwrapErr an Ok.");
	});
});

describe("Result.andThen() chaining tests", () => {
	// -----------------UTILITY FUNCTIONS---------------------
	const validateStringType = (data: any): Ok<string> | Err<string, string> => {
		if (typeof data === "string") {
			return new Ok(data);
		} else {
			return new Err(
				"InvalidDataType",
				`The datatype provided was supposed to be 'string' but was given: '${typeof data}'`
			);
		}
	};
	const capitalizeFirstLetter = (chars: string): Ok<string> | Err<string, string> => {
		try {
			const updatedChars = chars.charAt(0).toUpperCase() + chars.slice(1);
			return new Ok(updatedChars);
		} catch (error) {
			return new Err(error);
		}
	};
	const validateCorrectString = (chars: string, correctString: string): Ok<string> | Err<string, string> => {
		if (chars === correctString) {
			return new Ok(chars);
		} else {
			return new Err(
				"InvalidCharSequenceError",
				`Was expecting the char sequence: '${correctString}' but got: '${chars}'.`
			);
		}
	};
	const returnErrorUnreasonably = (item: unknown): Ok<string> | Err<string, string> => {
		return new Err("UnreasonableError", `An unreasonable error has been encountered! ${item}`);
	};
	// ---------------UTILITY FUNCTIONS END-------------------

	test(".andThen() Should return an Ok with the string 'Banana' inside at end of the chain.", () => {
		const result = validateStringType("banana")
			.andThen(capitalizeFirstLetter)
			.andThen((x) => validateCorrectString(x, "Banana"));

		expect(result.isOk()).toBe(true);
		expect(result.unwrap()).toBe("Banana");
	});

	test(".andThen() Should return an Err with the error: 'InvalidDataType', halting execution early.", () => {
		const result = validateStringType(12345)
			.andThen(capitalizeFirstLetter)
			.andThen((x) => validateCorrectString(x, "Banana"));

		console.log(result);

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual({
			err: "InvalidDataType",
			detail: "The datatype provided was supposed to be 'string' but was given: 'number'",
		});
	});

	test(".andThen() Should return an Err with the error: 'UnreasonableError', halting execution early.", () => {
		const result = validateStringType("pineapple")
			.andThen(capitalizeFirstLetter)
			.andThen(returnErrorUnreasonably)
			.andThen((x) => validateCorrectString(x, "Banana"));

		console.log(result);

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual({
			err: "UnreasonableError",
			detail: "An unreasonable error has been encountered! Pineapple",
		});
	});

	test(".andThen() Should return an Err with the error: 'InvalidCharSequenceError', halting execution at the last step.", () => {
		const result = validateStringType("pineapple")
			.andThen(capitalizeFirstLetter)
			.andThen((x) => validateCorrectString(x, "Banana"));

		console.log(result);

		expect(result.isErr()).toBe(true);
		expect(result.unwrapErr()).toStrictEqual({
			err: "InvalidCharSequenceError",
			detail: "Was expecting the char sequence: 'Banana' but got: 'Pineapple'.",
		});
	});
});
