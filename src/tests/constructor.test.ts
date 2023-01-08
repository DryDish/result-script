import { Result, Err, Ok } from "../components/result";

describe("Result Constructor Tests", () => {
	test("Print preview of my data", () => {
		console.log(new Err(Error(), "Big mistake happened"));
		console.log(new Err(Error("OH NO!")));

		console.log(new Ok("lol"));
		console.log(new Ok({ data: "some data", arrayData: [1, 2, 3], nestedData: { data: "even more data" } }));

		expect(true).toBe(true);
	});

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
});
