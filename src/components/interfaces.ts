interface IOk<T> {
	ok: T;
}

interface IErr<E> {
	err: E;
}

interface ErrorMessage<E, T> {
	error: E;
	detail: T;
}

export { IOk, IErr, ErrorMessage };
