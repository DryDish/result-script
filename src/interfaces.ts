interface IOk<T> {
	ok: T;
}

interface IErr<E> {
	err: E;
}

export { IOk, IErr };
