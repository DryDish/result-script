import { Result } from "./result";

interface IOk<T> {
	ok: T;
}

interface IErr<E> {
	err: E;
}

interface OkResultCallback<T, E> {
	(x: T): Result<T, E>;
}

interface ErrResultCallback<T, E> {
	(x: E): Result<T, E>;
}

interface ErrorMessage<E, T> {
	error: E;
	detail: T;
}

export { OkResultCallback, ErrResultCallback, IOk, IErr, ErrorMessage };
