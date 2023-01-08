type T = any;
type E = any;
type D = any;

interface IErr<E, D> {
	err?: E;
	detail?: D;
}

interface IOk<T> {
	ok?: T;
}

class Result<T, E> {
	ok?: T;
	err?: E;
	detail?: D;

	constructor(data: IOk<T> | IErr<E, D>) {
		if ("ok" in data) {
			this.ok = data.ok;
		} else if ("err" in data) {
			const errData: IErr<E, D> = data;
			if (!errData.detail) {
				this.err = errData.err;
			} else {
				this.err = errData.err;
				this.detail = errData.detail;
			}
		} else {
			throw new Error("Bad constructor format!");
		}
	}

	isOk() {
		if ("ok" in this) {
			return true;
		} else if ("err" in this) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	isErr() {
		if ("err" in this) {
			return true;
		} else if ("ok" in this) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	unwrap() {
		if (this && this.isOk()) {
			return this.ok;
		} else {
			throw new Error("Attempted to unwrap an Err.");
		}
	}

	unwrapErr() {
		if (this && this.isErr()) {
			if (!this.detail) {
				return { err: this.err };
			} else {
				return { err: this.err, detail: this.detail };
			}
		} else {
			throw new Error("Attempted to unwrapErr an Ok.");
		}
	}

	andThen(callableFunction: ResultCallback): Ok<T> | Err<E, D> {
		if (this.isOk()) {
			return callableFunction(this.unwrap());
		} else {
			return this;
		}
	}
}

type ResultCallback = (value: any) => Ok<T> | Err<E, D>;

class Ok<T> extends Result<T, E> {
	constructor(data: T) {
		const okType: IOk<T> = { ok: data };
		super(okType);
	}
}

class Err<E, D> extends Result<T, E> {
	constructor(err: E, detail?: D) {
		const errType: IErr<E, D> = { err, detail };
		super(errType);
	}
}

const validateStringType = (data: any): Ok<string> | Err<string, string> => {
	if (typeof data === "string") {
		return new Ok(data);
	} else {
		return new Err("InvalidDataType");
	}
};

const testCapitalB = (chars: string): Ok<string> | Err<string, string> => {
	if (chars.startsWith("B")) {
		return new Ok(chars);
	} else {
		return new Err("InvalidChars");
	}
};

const testCorrectWord = (chars: string): Ok<string> | Err<string, string> => {
	if (chars === "Banana") {
		return new Ok(chars);
	} else {
		return new Err("The word was not correct!");
	}
};

const result = validateStringType("Banana").andThen(testCorrectWord).andThen(testCapitalB);

export { Result, Ok, Err };