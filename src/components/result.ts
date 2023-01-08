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
}

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

export { Result, Ok, Err };
