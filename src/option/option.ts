import { Err, Ok } from "../result/result";
import type { Result } from "../result/result";
import { ExpectError, UnwrapError } from "../util";

enum OptionType {
	Some = "Some",
	None = "None",
}

class Option<T> {
	#type: OptionType;
	#value: T;

	constructor(value: T, type: OptionType) {
		this.#value = value;
		this.#type = type;
	}

	isSome(): boolean {
		return this.#type === OptionType.Some;
	}

	isSomeAnd(predicate: (value: T) => boolean): boolean {
		if (this.isSome()) {
			return predicate(this.#value);
		} else {
			return false;
		}
	}

	isNone(): boolean {
		return this.#type === OptionType.None;
	}

	expect(message: string): T {
		if (this.isSome()) {
			return this.#value;
		} else {
			throw new ExpectError(message);
		}
	}

	unwrap(): T {
		if (this.isSome()) {
			return this.#value;
		} else {
			throw new UnwrapError("Called Option.unwrap() on a 'None' value");
		}
	}

	unwrapOr(defaultValue: T): T {
		if (this.isSome()) {
			return this.#value;
		} else {
			return defaultValue;
		}
	}

	unwrapOrElse(callback: () => T): T {
		if (this.isSome()) {
			return this.#value;
		} else {
			return callback();
		}
	}

	map<U>(executor: (value: T) => U): Option<U> {
		if (this.isSome()) {
			return Some(executor(this.#value));
		} else {
			return None();
		}
	}

	inspect(callback: (value: T) => void): Option<T> {
		if (this.isSome()) {
			// Cloning the value to prevent mutation of the original in callback
			const clonedValue = structuredClone(this.#value);
			callback(clonedValue);
		}
		return this;
	}

	mapOr<U>(defaultValue: U, executor: (value: T) => U): U {
		if (this.isSome()) {
			return executor(this.#value);
		} else {
			return defaultValue;
		}
	}

	mapOrElse<U>(defaultCallback: () => U, executor: (value: T) => U): U {
		if (this.isSome()) {
			return executor(this.#value);
		} else {
			return defaultCallback();
		}
	}

	okOr<E>(err: E): Result<T, E> {
		if (this.isSome()) {
			return Ok(this.#value);
		} else {
			return Err(err);
		}
	}

	okOrElse<E>(errorCallback: () => E): Result<T, E> {
		if (this.isSome()) {
			return Ok(this.#value);
		} else {
			return Err(errorCallback());
		}
	}

	and<U>(otherOption: Option<U>): Option<U> {
		if (this.isSome() && otherOption.isSome()) {
			return otherOption;
		} else {
			return None();
		}
	}

	andThen<U>(optionCallback: (value: T) => Option<U>): Option<U> {
		if (this.isSome()) {
			return optionCallback(this.#value);
		} else {
			return None();
		}
	}

	filter(predicate: (value: T) => boolean): Option<T> {
		if (this.isSome() && predicate(this.#value)) {
			return this;
		} else {
			return None();
		}
	}

	or(otherOption: Option<T>): Option<T> {
		if (this.isSome()) {
			return this;
		} else {
			return otherOption;
		}
	}

	orElse(callback: () => Option<T>): Option<T> {
		if (this.isSome()) {
			return this;
		} else {
			return callback();
		}
	}

	insert(value: T): T {
		this.#value = value;
		this.#type = OptionType.Some;
		return this.#value;
	}

	getOrInsert(altValue: T): T {
		if (this.isSome()) {
			return this.#value;
		} else {
			this.#value = altValue;
			this.#type = OptionType.Some;
			return this.#value;
		}
	}

	getOrInsertWith(callback: () => T): T {
		if (this.isSome()) {
			return this.#value;
		} else {
			this.#value = callback();
			this.#type = OptionType.Some;
			return this.#value;
		}
	}

	take(): Option<T> {
		if (this.isSome()) {
			const oldValue = structuredClone(this.#value);
			this.#value = undefined as T;
			this.#type = OptionType.None;
			return Some(oldValue);
		} else {
			return this;
		}
	}

	takeIf(predicate: (value: T) => boolean): Option<T> {
		if (this.isSome() && predicate(this.#value)) {
			return this.take();
		} else {
			return None();
		}
	}

	replace(value: T): Option<T> {
		if (this.isSome()) {
			const oldValue = structuredClone(this.#value);
			this.#value = value;
			return Some(oldValue);
		} else {
			this.#value = value;
			this.#type = OptionType.Some;
			return None();
		}
	}

	zip<U>(other: Option<U>): Option<[T, U]> {
		if (this.isSome() && other.isSome()) {
			return Some([this.#value, other.#value]);
		} else {
			return None();
		}
	}

	zipWith<U, V>(other: Option<U>, zipFunction: (a: T, b: U) => V): Option<V> {
		if (this.isSome() && other.isSome()) {
			return Some(zipFunction(this.#value, other.#value));
		} else {
			return None();
		}
	}

	unzip<A, B>(this: Option<[A, B]>): [Option<A>, Option<B>] {
		if (this.isSome() && Array.isArray(this.#value) && this.#value.length === 2) {
			return [Some(this.#value[0]), Some(this.#value[1])];
		} else {
			return [None(), None()];
		}
	}
}

const Some = <T>(value: T): Option<T> => {
	return new Option(value, OptionType.Some);
};

const None = <T>(): Option<T> => {
	return new Option(undefined as T, OptionType.None);
};

export { Option, Some, None };
