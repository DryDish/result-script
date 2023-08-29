import { Ok } from "../src/result";
import { OkAsync } from "../src/resultAsync";

const numberOfTests = 10_000;

describe("Testing execution time", () => {
	describe("Testing AsyncResult", () => {
		test(`Measure execution time of OkAsync resolving ${numberOfTests} times`, async () => {
			const startTime = performance.now();

			for (let i = 0; i < numberOfTests; i++) {
				await OkAsync(123);
			}

			const endTime = performance.now();
			const executionTime = endTime - startTime;

			console.log(`OkAsync: Total execution time for ${numberOfTests} executions: ${executionTime} ms`);

			expect(executionTime).toBeLessThan(70);
		});

		test(`Measure execution time of chained OkAsync resolving ${numberOfTests} times`, async () => {
			const startTime = performance.now();

			let result = Ok(111);
			for (let i = 0; i < numberOfTests; i++) {
				result = await OkAsync(123).andThen((x) => OkAsync(x + 1));
			}

			const endTime = performance.now();

			const executionTime = endTime - startTime;

			console.log(
				`OkAsync(Promise):Total execution time for ${numberOfTests} executions: ${executionTime} ms.\n Result: `,
				result.unwrap()
			);

			expect(executionTime).toBeLessThan(100);
		});
	});
	describe("Testing Promise", () => {
		test(`Measure execution time of Promise resolving ${numberOfTests} times`, async () => {
			const startTime = performance.now();

			for (let i = 0; i < numberOfTests; i++) {
				await Promise.resolve(123);
			}

			const endTime = performance.now();
			const executionTime = endTime - startTime;

			console.log(`Promise: Total execution time for ${numberOfTests} executions: ${executionTime} ms`);

			expect(executionTime).toBeLessThan(15);
		});

		test(`Measure execution time of a chained promise resolving ${numberOfTests} times `, async () => {
			const startTime = performance.now();

			let result = {};
			for (let i = 0; i < numberOfTests; i++) {
				result = await Promise.resolve(123).then((x) => Promise.resolve(x + 1));
			}

			const endTime = performance.now();

			const executionTime = endTime - startTime;

			console.log(
				`Promise(Promise):Total execution time for ${numberOfTests} executions: ${executionTime} ms.\nResult: `,
				result
			);

			expect(executionTime).toBeLessThan(70);
		});
	});
});
