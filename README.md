# ts-result

A clone of Rust's `std::result` with full typing support.

Rust manages error handling with Results and i wanted to mimic this behavior.

I also wanted the types to be preserved when wrapped and unwrapped, and so I set
out to create this project.

The main goal of this project was to achieve as much feature parity with Rust's
Result as possible, and thus a lot of effort was spent to ensure that the data
types behaved as expected, both in declaration and usage.

# Installation

> npm install ts-result

# Introduction

I set out to implement as many of Rust's methods for interacting with Results
as possible.

The only ones I have skipped are the ones that deal directly with
references of the contents, or that deal with the `Some` and `None` data types,
as I have not implemented those.

This project is fully js-doc'ed with types, so it plays nicely with javascript
as well as providing good documentation directly to the users of this package.

# Usage

### Function declaration

```typescript
import { Err, Ok, Result } from "ts-result";

const getEnv = (envName: string): Result<string, string> => {
  const env = process.env["envName"];
  if (env) {
    return Ok(env);
  }
  return Err(`The env: ${envName} is not set!`);
};
```

### Variable usage

Exit on error

```Typescript
const connectionString: string = getEnv("SECRET_CONNECTION_STRING").expect("SECRET_CONNECTION_STRING should have been set by dotenv");
```

Alternative value

```typescript
const stringResult: string = getEnv("SECRET_CONNECTION_STRING").unwrapOr("<DEFAULT URL>");
```

Manual processing

```typescript
const stringResult: Result<string, string> = getEnv("SECRET_CONNECTION_STRING");
if (stringResult.isErr()) {
  console.error(stringResult.unwrapErr());
  process.exit(-1);
}
const connectionString: string = stringResult.unwrap();
```

# Methods

This is a list of all the methods that have been implemented along with a brief explanation for how to use them.

## isOk()

Returns `true` if the result is Ok.

```typescript
const result: Result<number, string> = Ok(-3);
result.isOk(); // true

const result: Result<number, string> = Err("Error Info");
result.isOk(); // false
```

## isOkAnd()

Returns `true` if the result is `Ok` and the value inside of it matches a
predicate.

```typescript
const result: Result<number, string> = Ok(2);
result.isOkAnd((x) => x > 1); // true

const result: Result<number, string> = Ok(0);
result.isOkAnd((x) => x > 1); // false

const result: Result<number, string> = Err("hey");
result.isOkAnd((x) => x > 1); // false
```

## isErr()

Returns `true` if the result is `Err`.

```typescript
const result: Result<number, string> = Ok(-3);
result.isErr(); // false

const result: Result<number, string> = Err("Some error");
result.isErr(); // true
```

## isErrAnd()

Returns `true` if the result is `Err` and the value inside of it matches a
predicate.

```typescript
const result: Result<number, ErrorKind> = Err(ErrorKind.NotFound);
result.isErrAnd((x) => x === ErrorKind.NotFound); // true

const result: Result<number, ErrorKind> = Err(ErrorKind.PermissionDenied);
result.isErrAnd((x) => x === ErrorKind.NotFound); // false

const result: Result<number, ErrorKind> = Ok(123);
result.isErrAnd((x) => x === ErrorKind.NotFound); // false
```

## map()

Maps a `Result<T, E>` to `Result<U, E>` by applying a function to the
result's `Ok` value, leaving the `Err` untouched.

This method can be used to compose the results of two or more functions.

```typescript
const result: Result<string, string> = Ok("foo");
result.map((x) => x.length); // Ok(3)

const result: Result<number, string> = Ok(12);
result.map((x) => x.toString()); // Ok("12")

const result: Result<string, number> = Err(-1);
result.map((x) => x.length); // Err(-1)

// TODO: FIX SPACING

const result = Ok(5) // Ok(5)
  .map((x) => x * x) // Ok(25)
  .map((x) => x.toString()) // Ok("25")
  .map((x) => " Number is: " + x + " ") // Ok(" Number is: 25 ")
  .map((x) => x.trim()); // Ok("Number is: 25")

console.log(result); // Ok("Number is: 25")
```

## mapOr()

Returns the provided `alternative` if the result is `Err`, or applies a
function to the contained value if the result is `Ok`

```typescript
const result: Result<string, string> = Ok("foo");
result.mapOr(42, (x) => x.length); // 3

const result: Result<string, string> = Err("bar");
result.mapOr(42, (x) => x.length); // 42
```

## mapOrElse()

Maps a `Result<T, E>` to `U` by applying a a fallback function `altF` to
a contained `Err` value, or function `f` to a contained `Ok` value.

This method can be used to unpack a successful result while handling an
error.

```typescript
const stringErrToNum = (error: string): number => {
  if (error == "OutOfBounds") {
    return -1;
  }
  return -2;
};
const k = 21;

const result: Result<string, string> = Err("OutOfBounds");
result.mapOrElse(
  (error) => stringErrToNum(e),
  (value) => v.length
); // -1

const result: Result<string, string> = Ok("foo");
result.mapOrElse(
  (error) => k * 2,
  (value) => v.length
); // 3

const result: Result<string, string> = Err("bar");
result.mapOrElse(
  (error) => k * 2,
  (value) => v.length
); // 42
```

## mapErr()

Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a
results' `Err` value, leaving its `Ok` value untouched.

This function can be used to pass through a successful result while
handling an error.

```typescript
const stringify = (x: number): string => `error code is: ${x}`;

const result: Result<number, number> = Ok(2);
result.mapErr(stringify); // Ok(2)

const result: Result<number, number> = Err(13);
result.mapErr(stringify); // Err("error code is: 13")
```

## expect()

Returns the contained `Ok` value. Throws an `Error` if the Result
is `Err`.

Because this method may throw an `Error`, its use is generally
discouraged. Instead, use conditions to check for `Err` explicitly
, or call the `unwrapOr` or `unwrapOrElse` methods.

`expect` messages should be used to describe the reason you _expect_ the
`Result` should be `Ok`.

In this example the function getEnv returns a Result:

```typescript
const path: string = getEnv("IMPORTANT_PATH").expect("Env variable 'PATH_NAME' should be set by dotenv.config().");'
```

**Hint**: If you are having trouble remembering how to phrase expect
error messages remember to focus on the word "should" as in "env
variable should be set by ..." or "the given binary should be available
and executable by the current user".

```typescript
const result: Result<number, string> = Err("emergency failure");
result.expect("Testing expect"); // throws Error with the text: 'Testing expect: "emergency failure"'
const result: Result<number, string> = Ok(123);
result.expect("Testing expect"); // 123;
```

## unwrap()

Returns the contained `Ok` value. Throws an `Error` if the Result is
`Err`.

Because this method may throw an `Error`, its use is generally discouraged.
Instead, use conditions to check for `Err` explicitly, or call `unwrapOr` or `unwrapOrElse`.

```typescript
const result: Result<number, string> = Ok(2);
result.unwrap(); // 2

const result: Result<number, string> = Err("emergency failure");
result.unwrap(); // Throws Error 'Called Result.unwrap() on an Err value: "emergency failure"'
```

## expectErr()

Returns the contained `Err`. Throws an `Error` if the Result is `Ok`.

Throws an error if the value is an `Ok`, with the error message including the
passed `msg`, and the content of the `Ok`.

```typescript
const result: Result<number, string> = Ok(10);
result.expectErr("Testing expectErr"); // Throws Error "Testing expectErr: 10"

const result: Result<number, string> = Err("Some Error");
result.expectErr("Testing expectErr"); // "Some Error"
```

## unwrapErr()

Returns the contained `Err` value. Throws an `Error` if the Result is `Ok`.

```typescript
const result: Result<number, string> = Ok(2);
result.unwrapErr(); // Throws Error: 'Called Result.unwrapErr() on an Ok value: 2'

const result: Result<number, string> = Err("emergency failure");
result.unwrapErr(); // "emergency failure"
```

## and()

Returns `res` if the result is `Ok`. otherwise returns the `Err` value of 'this'.

```typescript
const x: Result<number, string> = Ok(2);
const y: Result<string, string> = Err("late error");
x.and(y); // Err("late error")

const x: Result<number, string> = Err("early error");
const y: Result<string, string> = Ok("foo");
x.and(y); // Err("early error")

const x: Result<number, string> = Err("not a 2");
const y: Result<string, string> = Err("late error");
x.and(y); // Err("not a 2")

const x: Result<number, string> = Ok(2);
const y: Result<string, string> = Ok("Different Result Type");
x.and(y); // Ok("Different Result Type")
```

## andThen()

TODO: BETTER EXAMPLE CODE

Calls `op` if the result is `Ok`, otherwise returns the `Err` value of 'this'.

This function can be used for control flow based on `Result` values.

```typescript
const result: Result<string, ErrorMessage> = validateStringType("banana")
  .andThen(capitalizeFirstLetter)
  .andThen((x) => validateCorrectString(x, "Banana")); // Ok("Banana")

const result: Result<string, ErrorMessage> = validateStringType("pineapple")
  .andThen(capitalizeFirstLetter)
  .andThen((x: string) => validateCorrectString(x, "Banana")); // Err({ error: "InvalidCharSequenceError", detail: "Was expecting the char sequence: 'Banana' but got: 'Pineapple' })
```

## or()

Returns `res` if the result is `Err`, otherwise returns the `Ok` value of
'this'.

```typescript
const x: Result<number, string> = Ok(2);
const y: Result<number, string> = Err("Late error");
x.or(y); // Ok(2)

const x: Result<number, string> = Err("Early error");
const y: Result<number, string> = Ok(2);
x.or(y); // Ok(2)

const x: Result<number, string> = Err("Not a 2");
const y: Result<number, string> = Err("Late error");
x.or(y); // Err("Late error")

const x: Result<number, string> = Ok(2);
const y: Result<number, string> = Ok(1234);
x.or(y); // Ok(2)
```

## orElse()

Calls `op` if the result is {@link Err}, otherwise returns the `Ok` value of
'this'.

This function can be used for control flow based on result values.

```typescript
const sq = (x: number): Result<number, number> => Ok(x * x);
const err = (x: number): Result<number, number> => Err(x);

TODO: FIX SPACING

Ok<number, number>(2).orElse(sq).orElse(sq); // Ok(2)
Ok<number, number>(2).orElse(err).orElse(sq); // Ok(2)
Err<number, number>(3).orElse(sq).orElse(err); // Ok(9)
Err<number, number>(3).orElse(err).orElse(err); // Err(3)
```

## unwrapOr()

Returns the contained `Ok` value or a provided `alternative` if the result is
an `Err`.

```typescript
const result: Result<number, string> = Ok(9);
result.unwrapOr(2); // 9

const result: Result<number, string> = Err("error");
result.unwrapOr(2); // 2
```

## unwrapOrElse()

Returns the contained `Ok` value or computes it from the function `op`.

```typescript
const count = (x: string): number => x.length;

const result: Result<number, string> = Ok(9);
result.unwrapOrElse(count); // 9

const result: Result<number, string> = Err("foo");
result.unwrapOrElse(count); // 3
```

## contains()

Returns `true` if the Result is an `Ok` containing the given value.

```typescript
const result: Result<number, string> = Ok(2);
result.contains(2); // true

const result: Result<number, string> = Ok(3);
result.contains(2); // false

const result: Result<number, string> = Err("Some error message");
result.contains(2); // false

const result: Result<unknown, string> = Ok({ data: 123 });
result.contains({ data: 123 }); // true
result.contains({ data: "123" }); // false
```

## containsErr()

Returns `true` if the result is an `Err` containing the given value.

```typescript
const result: Result<number, string> = Ok(2);
result.containsErr("Some error message"); // false

const result: Result<number, string> = Err("Some error message");
result.containsErr("Some error message"); // true

const result: Result<number, string> = Err("Some other error message");
result.containsErr("Some error message"); // false

const result: Result<number, ErrMsg> = Err({ detail: "Some error has occurred" });
result.containsErr({ detail: "Some error has occurred" }); // true
result.containsErr({ detail: "Some other error has occurred" }); // false
```

## fromPromise()

Converts a `Promise` to a `Result`.

NOTE: due to `Promise`'s implementation, only the resolution can be typed.
The rejection will always be untyped.

```typescript
TODO: UPDATE THE INTERFACES TO BE MORE CLEAR
interface promiseResolve<T> {
  (variable: T): Promise<T>;
}
interface promiseReject<T> {
  (_: T): Promise<T>;
}

// Type: Result<number, unknown> - inferred type
const result = await Result.fromPromise(promiseResolve(10));
result.isOk(); // true
result.unwrap(); // 10

// Type: Result<number, unknown> - explicit type
const result: Result<number, unknown> = await Result.fromPromise(promiseResolve(10));
result.isOk(); // true
result.unwrap(); // 10

// Type: Result<number, unknown> - inferred type
const result = await Result.fromPromise(promiseReject(10));
result.isErr(); // true
result.unwrapErr(); // "rejected"

// Type: Result<number, unknown> - explicit type alternative
const result = await Result.fromPromise<number>(promiseReject(10));
result.isErr(); // true
result.unwrapErr(); // "rejected"
```

## fromPromiseUnknown()

Converts a `Promise` to a `Result`.

If used with a type, it will treat the resolved data type as that type,
otherwise the type will be `unknown`

### Warning:

This is a loosely typed function that treats the resolved type of the
`Promise` as the named type: <`T`>, regardless of what the actual type
of the data is.

If the `Promise` being converted is typed, it is recommended to
instead use `fromPromise` as that function will enforce types.

This is intended to be used when the `Promise` returns `unknown` or
`any`.

```typescript
const promiseResolve = new Promise((resolve) => resolve(123));
const promiseReject = new Promise((_, reject) => reject(456));

// Explicit typing
const result: Result<number, unknown> = await Result.fromPromiseUnknown(promiseResolve);
result.isOk(); // true
result.unwrap(); // 123

// Type: Result<number, unknown> - Explicit typing alternative
const result = await Result.fromPromiseUnknown<number>(promiseReject);
result.isErr(); // true
result.unwrapErr(); // 456

// Type: Result<unknown, unknown>
const result = await Result.fromPromiseUnknown(promiseResolve);
result.isOk(); // true
result.unwrap(); // 123
```
