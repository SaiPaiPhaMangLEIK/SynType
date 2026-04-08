import { Language } from "@/types";
import { Token, TOKEN_COLORS } from "./tokenizer";

// ── Per-language keyword manuals ──────────────────────────────────────────────

const PYTHON_KW: Record<string, string> = {
  def:       "Defines a function — a named, reusable block of code",
  class:     "Defines a class — a blueprint for creating objects",
  return:    "Exits the function and optionally sends a value back to the caller",
  if:        "Runs the block only if the condition evaluates to true",
  elif:      "Alternative branch — checked only if all earlier conditions were false",
  else:      "Default branch — runs when every condition above was false",
  for:       "Iterates over each item in a sequence or iterable",
  while:     "Loops as long as the condition remains true",
  in:        "Membership test, or marks the iterable in a for loop",
  not:       "Logical NOT — inverts a boolean value",
  and:       "Logical AND — true only when both sides are true",
  or:        "Logical OR — true when at least one side is true",
  import:    "Brings a module into the current namespace",
  from:      "Specifies the module to import names from",
  as:        "Creates an alias for an import or exception variable",
  pass:      "No-op placeholder — keeps the block syntactically valid",
  break:     "Exits the enclosing loop immediately",
  continue:  "Skips the rest of this iteration and starts the next",
  try:       "Wraps code that might raise an exception",
  except:    "Catches exceptions raised in the try block",
  raise:     "Throws an exception",
  finally:   "Always runs after try/except — used for cleanup",
  with:      "Context manager — guarantees setup and teardown (e.g. open files)",
  lambda:    "Creates a small anonymous inline function expression",
  None:      "The null singleton — represents the absence of a value",
  True:      "Boolean true constant",
  False:     "Boolean false constant",
  self:      "Reference to the current class instance",
  yield:     "Pauses the generator and emits a value to the caller",
  del:       "Deletes a variable or removes items from a collection",
  global:    "Declares that a variable lives in the global scope",
  nonlocal:  "Refers to a variable in the nearest enclosing (non-global) scope",
  is:        "Identity test — checks if two names point to the exact same object",
  assert:    "Raises AssertionError if the condition is false — used for sanity checks",
  async:     "Marks a function as asynchronous — it returns a coroutine",
  await:     "Suspends execution until the awaitable (coroutine) completes",
};

const JS_KW: Record<string, string> = {
  const:      "Block-scoped immutable binding — the name cannot be reassigned",
  let:        "Block-scoped mutable variable",
  var:        "Function-scoped variable — prefer const or let in modern JS",
  function:   "Declares a named, reusable block of code",
  return:     "Exits the function and sends a value back to the caller",
  if:         "Runs the block only if the condition is truthy",
  else:       "Runs when the preceding if condition was falsy",
  for:        "Loop — counted iteration or collection traversal",
  while:      "Repeats the block while the condition is truthy",
  in:         "Iterates over object keys — use of for array values",
  of:         "Iterates over iterable values (arrays, sets, maps, strings)",
  new:        "Creates a new object instance via a constructor or class",
  this:       "Refers to the object that owns the current execution context",
  class:      "Defines a class with a constructor and prototype methods",
  extends:    "Inherits from a parent class — enables subclassing",
  import:     "Imports bindings exported by another ES module",
  export:     "Makes a value available to other modules",
  default:    "Marks the single default export, or fallback switch case",
  from:       "Specifies the source module path in an import statement",
  async:      "Marks a function as asynchronous — it returns a Promise",
  await:      "Pauses execution inside an async function until the Promise resolves",
  try:        "Wraps code that may throw an error or exception",
  catch:      "Handles errors thrown inside the associated try block",
  throw:      "Constructs and throws an error object",
  typeof:     "Returns the type of a value as a lowercase string",
  instanceof: "Tests whether an object was created by a specific constructor",
  null:       "Intentionally empty object reference — assigned by the programmer",
  undefined:  "Variable declared but not yet assigned any value",
  true:       "Boolean true constant",
  false:      "Boolean false constant",
  break:      "Exits the nearest enclosing loop or switch statement",
  continue:   "Skips the rest of this loop iteration",
  switch:     "Multi-way branch — compares a value against multiple cases",
  case:       "A single branch inside a switch statement",
  do:         "Do-while loop — body always runs at least once",
  delete:     "Removes a property from an object",
  void:       "Evaluates an expression and discards the result (returns undefined)",
  yield:      "Pauses a generator function and emits a value",
};

const TS_EXTRA_KW: Record<string, string> = {
  type:      "Defines a named type alias",
  interface: "Defines a structural contract — shape that objects must match",
  enum:      "Defines a set of named constant values",
  readonly:  "Marks a property as immutable after initialisation",
  as:        "Type assertion — tells the compiler to treat a value as a given type",
  keyof:     "Produces a union type of all keys in the given type",
  infer:     "Infers a type variable inside a conditional type expression",
  never:     "Represents an impossible type — e.g. a function that always throws",
  unknown:   "Like any but type-safe — must be narrowed before use",
  any:       "Disables type-checking for this value — use sparingly",
  string:    "Primitive string type annotation",
  number:    "Primitive number type annotation",
  boolean:   "Primitive boolean type annotation",
  object:    "Represents any non-primitive value",
  symbol:    "Unique, immutable primitive — often used as object keys",
};

const GO_KW: Record<string, string> = {
  func:      "Declares a function — Go's basic unit of reusable code",
  return:    "Returns one or more values from the function",
  if:        "Conditional statement — can include a short initializer before the condition",
  else:      "Else branch of an if statement",
  for:       "Go's only loop keyword — handles counting, while-style, and range loops",
  range:     "Iterates over a slice, map, string, or channel — yields index and value",
  var:       "Declares a variable with an explicit type",
  const:     "Declares a compile-time constant",
  type:      "Defines a new named type or type alias",
  struct:    "Composite data type — groups named fields of different types",
  interface: "Defines a set of method signatures that a type must implement",
  map:       "Built-in key-value hash map type",
  chan:       "Channel — typed conduit for safe goroutine communication",
  go:        "Starts a new goroutine — lightweight, concurrent execution",
  defer:     "Schedules a function call to run when the surrounding function returns",
  select:    "Waits on multiple channel operations — picks whichever is ready",
  case:      "A branch inside select or switch",
  default:   "Default branch in select or switch when no other case matches",
  break:     "Exits the nearest loop or switch",
  continue:  "Skips to the next loop iteration",
  package:   "Declares the package this file belongs to",
  import:    "Imports one or more packages",
  make:      "Allocates and initialises a slice, map, or channel",
  new:       "Allocates memory and returns a pointer to its zero value",
  append:    "Appends elements to a slice, growing its backing array if needed",
  len:       "Returns the number of elements in a slice, string, map, or channel",
  cap:       "Returns the capacity of a slice or channel buffer",
  nil:       "Zero value for pointers, slices, maps, channels, and interfaces",
  true:      "Boolean true constant",
  false:     "Boolean false constant",
  string:    "Built-in string type — immutable sequence of bytes",
  int:       "Default integer type — platform word size (32 or 64 bit)",
  bool:      "Boolean type — either true or false",
  error:     "Built-in interface for error values — implement Error() string",
  any:       "Alias for interface{} — matches any type (Go 1.18+)",
};

const RUST_KW: Record<string, string> = {
  fn:      "Declares a function",
  let:     "Binds a value to a name — immutable by default",
  mut:     "Makes a variable binding or reference mutable",
  if:      "Conditional expression — also evaluates to a value",
  else:    "Else branch of a conditional",
  for:     "Iterates over an iterator using IntoIterator",
  while:   "Loops while the condition is true",
  loop:    "Infinite loop — use break (with a value) to exit",
  return:  "Explicitly returns a value — last expression returns implicitly",
  struct:  "Defines a named composite type with typed fields",
  enum:    "Defines a type with multiple exclusive named variants",
  impl:    "Adds methods or trait implementations to a type",
  trait:   "Defines shared behaviour — a set of methods a type must implement",
  use:     "Brings an item from a module or crate into the current scope",
  mod:     "Declares a module — organises code into namespaces",
  pub:     "Makes an item publicly visible outside its module",
  self:    "The current instance inside an impl block (like this in other languages)",
  super:   "Refers to the parent module",
  crate:   "Refers to the root of the current crate",
  match:   "Pattern matching — exhaustive, each arm can return a value",
  ref:     "Borrows a value by reference inside a pattern",
  move:    "Transfers ownership of captured variables into a closure",
  async:   "Marks a function as asynchronous — it returns a Future",
  await:   "Suspends execution until the Future resolves",
  type:    "Defines a type alias",
  where:   "Adds type constraints to generic parameters",
  const:   "Compile-time constant — evaluated before runtime",
  static:  "Static lifetime value — lives for the entire program",
  unsafe:  "Opts out of Rust's safety guarantees — use with care",
  extern:  "Declares external functions (FFI) or links to a crate",
  dyn:     "Dynamic dispatch through a trait object — vtable at runtime",
  Box:     "Heap-allocated smart pointer — Box<T>",
  Option:  "Optional value — either Some(T) or None",
  Result:  "Success-or-failure type — Ok(T) on success, Err(E) on failure",
  Some:    "Option variant — wraps a present value",
  None:    "Option variant — represents the absence of a value",
  Ok:      "Result variant — the operation succeeded",
  Err:     "Result variant — the operation failed with an error",
  true:    "Boolean true constant",
  false:   "Boolean false constant",
};

const KEYWORD_MAP: Partial<Record<Language, Record<string, string>>> = {
  python:     PYTHON_KW,
  javascript: JS_KW,
  typescript: { ...JS_KW, ...TS_EXTRA_KW },
  go:         GO_KW,
  rust:       RUST_KW,
};

// ── Badge metadata ────────────────────────────────────────────────────────────

export interface TokenInfo {
  label: string;    // short badge text shown in the bar
  color: string;    // colour for the badge and value
  description: string | null;
}

export function getTokenInfo(token: Token, language: Language): TokenInfo | null {
  if (token.type === "whitespace") return null;

  const color = TOKEN_COLORS[token.type];

  if (token.type === "keyword") {
    const desc = KEYWORD_MAP[language]?.[token.value] ?? `\`${token.value}\` — language keyword`;
    return { label: "keyword", color, description: desc };
  }

  if (token.type === "function") {
    return { label: "function", color, description: `\`${token.value}()\` — function call` };
  }

  if (token.type === "plain") {
    return { label: "identifier", color: TOKEN_COLORS.plain, description: null };
  }

  if (token.type === "string") {
    return { label: "string", color, description: "string literal — a sequence of characters" };
  }

  if (token.type === "number") {
    return { label: "number", color, description: "numeric literal" };
  }

  if (token.type === "comment") {
    return { label: "comment", color, description: "comment — not executed, explains intent" };
  }

  if (token.type === "operator") {
    return { label: "operator", color, description: null };
  }

  return null;
}
