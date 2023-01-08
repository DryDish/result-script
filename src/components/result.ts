type T = any;
type E = any;
type D = any;

interface IErr<E> {
	err: E;
	detail?: D;
}

interface IOk<T> {
	ok: T;
}

enum ResultTypes {
	Ok,
	Err,
}

class Result<T, E> {
	ok?: T;
	err?: E;
	detail?: string;

	constructor(data: T | E, type: ResultTypes) {
		if (type == ResultTypes.Ok) {
			this.ok = data as T;
		} else if (type == ResultTypes.Err) {
			const errData: IErr<E> = data as IErr<E>;
			if (!errData.detail) {
				this.err = errData.err;
			} else {
				this.err = errData.err;
				this.detail = errData.detail as string;
			}
		} else {
			throw new Error("Bad constructor format!");
		}
	}

	isErr() {
		if (this.err) {
			return true;
		} else if (this.ok) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	isOk() {
		if (this.ok) {
			return true;
		} else if (this.err) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}
}

const Ok = (data: T): Result<IOk<T>, IErr<null>> => {
	return new Result(data, ResultTypes.Ok);
};

const Err = (err: E, detail?: D): Result<IErr<E>, IErr<E>> => {
	const obj = { err, detail };
	return new Result(obj, ResultTypes.Err);
};

export { Result, Ok, Err };
