import { IErr, IOk, OkResultCallback, ErrResultCallback } from "./interfaces";

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

	isOk() {
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

	isErr() {
		if ("err" in this) {
			return true;
		} else if ("ok" in this) {
			return false;
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

	andThen(op: OkResultCallback<T, E>): Result<T, E> {
		if (this.isOk()) {
			return op(this.unwrap());
		} else {
			return this;
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

	orElse(op: ErrResultCallback<T, E>): Result<T, E> {
		if (this.isErr()) {
			return op(this.unwrapErr());
		} else if (this.isOk()) {
			return this;
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
