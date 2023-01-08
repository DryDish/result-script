import { IErr } from "./interfaces";
import { Result } from "./result";
import { T } from "./types";

class Err<E> extends Result<T, E> {
	constructor(err: E, detail?: any) {
		const errType: IErr<E> = { err, detail };
		super(errType);
	}
}

export { Err };
