import { OkAsync } from "../src/resultAsync";

const numberOfTests = 10_000;

describe("Testing execution time", () => {
	test("Testing AsyncResult", async () => {
		const startTime = performance.now();

		for (let i = 0; i < numberOfTests; i++) {
			await OkAsync(123);
		}

		const endTime = performance.now();
		const executionTime = endTime - startTime;

		console.log(`Total execution time for ${numberOfTests} executions: ${executionTime} ms`);

		expect(executionTime).toBeLessThan(30);
	});

	test(`Measure execution time of Promise resolving ${numberOfTests} times`, async () => {
		const startTime = performance.now();

		for (let i = 0; i < numberOfTests; i++) {
			await Promise.resolve(123);
		}

		const endTime = performance.now();
		const executionTime = endTime - startTime;

		console.log(`Total execution time for ${numberOfTests} executions: ${executionTime} ms`);

		expect(executionTime).toBeLessThan(10);
	});
});
