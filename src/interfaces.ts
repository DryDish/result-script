interface IOk<T> {
	ok: T;
}

interface IErr<E> {
	err: E;
}

interface IResult<T, E> {
	isOk(): boolean;
	isOkAnd(f: (x: T) => boolean): boolean;
	isErr(): boolean;
	isErrAnd(f: (x: E) => boolean): boolean;
	map<U>(op: (value: T) => U): IResult<U, E>;
	mapOr<U>(alternative: U, f: (value: T) => U): U;
	mapOrElse<U>(altF: (err: E) => U, f: (value: T) => U): U;
	mapErr<F>(op: (err: E) => F): IResult<T, F>;
	expect(msg: string): T;
	unwrap(): T;
	expectErr(msg: string): E;
	unwrapErr(): E;
	and<U>(res: IResult<U, E>): IResult<U, E>;
	andThen<U>(op: (value: T) => IResult<U, E>): IResult<U, E>;
	or(res: IResult<T, E>): IResult<T, E>;
	orElse<F>(op: (err: E) => IResult<T, F>): IResult<T, F>;
	unwrapOr(alternative: T): T;
	unwrapOrElse(op: (err: E) => T): T;
	contains<U extends T>(x: U): boolean;
	containsErr<F extends E>(x: F): boolean;
}


export { IOk, IErr, IResult };
