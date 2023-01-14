import { IErr, IOk } from "./interfaces";

class Result<T, E> {
	ok!: T;
	err!: E;

	constructor(data: IOk<T> | IErr<E>) {
		if ("ok" in data) {
			this.ok = data.ok;
		} else if ("err" in data) {
			this.err = data.err;
		} else {
			throw new Error("Bad constructor format!");
		}
	}

	isOk(): boolean {
		if ("ok" in this) {
			return true;
		} else if ("err" in this) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	isOkAnd(f: (x: T) => boolean): boolean {
		if ("ok" in this) {
			return f(this.unwrap());
		} else if ("err" in this) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	isErr(): boolean {
		if ("err" in this) {
			return true;
		} else if ("ok" in this) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	isErrAnd(f: (x: E) => boolean): boolean {
		if (this.isOk()) {
			return false;
		} else if (this.isErr()) {
			return f(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	map<U>(op: (value: T) => U): Result<U, E> {
		if (this.isOk()) {
			return new Ok<U, E>(op(this.unwrap()));
		} else if (this.isErr()) {
			return new Err<U, E>(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	mapOr<U>(alternative: U, f: (value: T) => U): U {
		if (this.isOk()) {
			return f(this.unwrap());
		} else if (this.isErr()) {
			return alternative;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	mapOrElse<U>(altF: (err: E) => U, f: (value: T) => U): U {
		if (this.isOk()) {
			return f(this.unwrap());
		} else if (this.isErr()) {
			return altF(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	mapErr<F>(op: (err: E) => F): Result<T, F> {
		if (this.isOk()) {
			return new Ok(this.unwrap());
		} else if (this.isErr()) {
			return new Err(op(this.unwrapErr()));
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	expect(msg: string): T {
		if (this.isOk()) {
			return this.unwrap();
		} else if (this.isErr()) {
			throw new Error(msg + ": " + this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	unwrap(): T {
		if (this && this.isOk()) {
			return this.ok;
		} else {
			throw new Error("Attempted to unwrap an Err.");
		}
	}

	expectErr(msg: string): E {
		if (this.isErr()) {
			return this.unwrapErr();
		} else if (this.isOk()) {
			throw new Error(msg + ": " + this.unwrap());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	unwrapErr(): E {
		if (this && this.isErr()) {
			return this.err;
		} else {
			throw new Error("Attempted to unwrapErr an Ok.");
		}
	}

	and<U>(res: Result<U, E>): Result<U, E> {
		if (this.isErr()) {
			return new Err<U, E>(this.err);
		} else if (res.isOk()) {
			return res;
		} else if (res.isErr()) {
			return new Err<U, E>(res.err);
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	andThen<U>(op: (value: T) => Result<U, E>): Result<U, E> {
		if (this.isOk()) {
			return op(this.unwrap());
		} else {
			return new Err(this.unwrapErr());
		}
	}

	or(res: Result<T, E>): Result<T, E> {
		if (this.isErr()) {
			return res;
		} else if (this.isOk()) {
			return this;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	orElse<F>(op: (err: E) => Result<T, F>): Result<T, F> {
		if (this.isOk()) {
			return new Ok(this.unwrap());
		} else if (this.isErr()) {
			return op(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	unwrapOr(alternative: T): T {
		if (this.isOk()) {
			return this.unwrap();
		} else if (this.isErr()) {
			return alternative;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	unwrapOrElse(op: (err: E) => T): T {
		if (this.isOk()) {
			return this.unwrap();
		} else if (this.isErr()) {
			return op(this.unwrapErr());
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	contains<U extends T>(x: U): boolean {
		if (this.isOk()) {
			return this.unwrap() === x;
		} else if (this.isErr()) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}

	containsErr<F extends E>(x: F): boolean {
		if (this.isErr()) {
			return this.unwrapErr() === x;
		} else if (this.isOk()) {
			return false;
		} else {
			throw new Error("Something is deeply wrong with the Result object");
		}
	}
}

class Ok<T, E> extends Result<T, E> {
	constructor(data: T) {
		const okType: IOk<T> = { ok: data };
		super(okType);
	}
}

class Err<T, E> extends Result<T, E> {
	constructor(err: E) {
		const errObj: IErr<E> = { err: err };
		super(errObj);
	}
}

export { Result, Ok, Err };
