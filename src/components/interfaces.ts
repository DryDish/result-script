import { Result } from "./result";

interface IOk<T> {
	ok: T;
}

interface IErr<E> {
	err: E;
}

interface ResultCallbackOk<T, E> {
	(x: T): Result<T, E>;
}

interface ResultCallbackErr<T, E> {
	(x: E): Result<T, E>;
}

interface ErrorMessage<E, T> {
	error: E;
	detail: T;
}

export { ResultCallbackOk, ResultCallbackErr, IOk, IErr, ErrorMessage };
