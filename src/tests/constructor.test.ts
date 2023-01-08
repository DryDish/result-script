import { Result, Err, Ok } from "../components/result";

describe("Result Constructor Tests", () => {
	test("Print preview of my data", () => {
		console.log(Err(Error(), "Big mistake happened"));
		console.log(Err(Error("OH NO!")));

		console.log(Ok("lol"));
		console.log(Ok({ data: "some data", arrayData: [1, 2, 3], nestedData: { data: "even more data" } }));

		expect(true).toBe(true);
	});

	test("result.isErr() should return true on a result with an Err inside.", () => {
		const result = Err(Error("Big issues here!"), "This is an Err!");
		expect(result.isErr()).toBe(true);
	});

	test("result.isErr() should return false on a result with an Ok inside.", () => {
		const result = Ok({ stuff: "All is good here, just some data", moreStuff: [1, 2, 3] });
		expect(result.isErr()).toBe(false);
	});

	test("result.isOk() should return false on a result with an Err inside.", () => {
		const result = Err(Error(), "All is good here, just some data");
		expect(result.isOk()).toBe(false);
	});

	test("result.isOk() should return true on a result with an Ok inside.", () => {
		const result = Ok({ stuff: "All is good here, just some data", moreStuff: [1, 2, 3] });
		expect(result.isOk()).toBe(true);
	});
});
