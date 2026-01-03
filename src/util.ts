class UnwrapError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UnwrapError";
	}
}

class ExpectError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ExpectError";
	}
}

export { UnwrapError, ExpectError };
