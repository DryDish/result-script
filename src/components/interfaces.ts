interface IOk<T> {
	ok: T;
}

interface IErr<E> {
	err: E;
	detail?: any;
}

export { IOk, IErr };
