import { IOk } from "./interfaces";
import { Result } from "./result";
import { D, E } from "./types";

class Ok<T> extends Result<T, E> {
	constructor(data: T) {
		const okType: IOk<T> = { ok: data };
		super(okType);
	}
}

export { Ok };
