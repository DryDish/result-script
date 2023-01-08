import { Err } from "./err";
import { Ok } from "./ok";

type T = any;
type E = any;
type D = any;

// type ResultCallback = <Type extends string>(value: Type) => Ok<T> | Err<E, D>;

export { D, T, E };
