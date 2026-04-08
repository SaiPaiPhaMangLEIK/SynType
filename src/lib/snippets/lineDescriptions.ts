import { Language } from "@/types";

/**
 * Returns a short plain-English description of what a single code line does.
 * Uses regex-based pattern matching for each supported language.
 * Returns null for blank / unrecognised lines.
 */
export function describeCodeLine(raw: string, language: Language): string | null {
  const line = raw.trim();
  if (!line) return null;

  // ── Universal patterns ────────────────────────────────────────
  if (/^\/\//.test(line) || /^#(?!\[)/.test(line) || /^--/.test(line)) {
    return "Comment — explains intent without executing";
  }
  if (/^\/\*|^\*[^*]|^\*\/$/.test(line)) return "Block comment — documentation or note";
  if (/^"""/.test(line) || /^'''/.test(line)) return "Docstring — describes the function or module";
  if (/^{$/.test(line)) return "Opens a code block";
  if (/^}[;,]?$/.test(line)) return "Closes a code block";

  // ── Python ────────────────────────────────────────────────────
  if (language === "python") {
    const def = line.match(/^def\s+(\w+)\s*\(/);
    if (def) return `Defines function \`${def[1]}\` — a named, reusable block of code you can call by name`;

    const cls = line.match(/^class\s+(\w+)/);
    if (cls) return `Defines class \`${cls[1]}\` — a blueprint for creating objects with shared structure and behaviour`;

    if (/^return\b/.test(line)) return "Returns a value from the function";
    if (/^yield\b/.test(line)) return "Yields a value — makes this function a generator";

    const forM = line.match(/^for\s+(\w+)\s+in\s+(.+?)\s*:/);
    if (forM) return `Iterates over \`${forM[2]}\`, binding each item to \`${forM[1]}\``;

    if (/^while\b/.test(line)) return "Loop — repeats while the condition is true";
    if (/^if\b/.test(line)) return "Checks a condition — runs next block if true";
    if (/^elif\b/.test(line)) return "Alternative condition — checked if earlier branches were false";
    if (/^else\s*:/.test(line)) return "Fallback branch — runs when all conditions above are false";

    const imp1 = line.match(/^import\s+(\S+)/);
    if (imp1) return `Imports \`${imp1[1]}\` — makes its functions and objects available in this file`;

    const imp2 = line.match(/^from\s+(\S+)\s+import\s+(.+)/);
    if (imp2) return `Imports \`${imp2[2]}\` from \`${imp2[1]}\` — brings a specific item into this scope`;

    if (/^raise\b/.test(line)) return "Raises (throws) an exception";
    if (/^try\s*:/.test(line)) return "Starts a try block — code that may throw an exception";
    if (/^except\b/.test(line)) return "Catches exceptions thrown in the try block";
    if (/^finally\s*:/.test(line)) return "Always executes — used for cleanup";
    if (/^with\b/.test(line)) return "Context manager — ensures proper resource setup and teardown";
    if (/^assert\b/.test(line)) return "Assertion — raises an error if the condition is false";
    if (/^pass$/.test(line)) return "No-op placeholder — does nothing";
    if (/^break$/.test(line)) return "Exits the enclosing loop immediately";
    if (/^continue$/.test(line)) return "Skips the rest of this iteration and goes to the next";
    if (/^print\s*\(/.test(line)) return "Prints output to the console";
    if (/^@\w+/.test(line)) return "Decorator — wraps the function below to add behaviour";

    const selfAttr = line.match(/\bself\.(\w+)\s*=/);
    if (selfAttr && !line.includes("==")) return `Sets instance attribute \`${selfAttr[1]}\` — stores a value directly on this object`;

    const multiAssign = line.match(/^(\w+),\s*(\w+)\s*=/);
    if (multiAssign && !line.includes("==")) return "Unpacks multiple values — assigns each result to its own variable in one step";

    const assign = line.match(/^(\w+)\s*=/);
    if (assign && !line.includes("==") && !line.includes("=>")) {
      return `Assigns a value to \`${assign[1]}\` — stores data in this local variable`;
    }

    if (/\breturn\b/.test(line)) return "Returns a computed value";
    return null;
  }

  // ── JavaScript / TypeScript ───────────────────────────────────
  if (language === "javascript" || language === "typescript") {
    if (/^export\s+default\b/.test(line)) return "Default export of this module";
    if (/^export\s+/.test(line) && !/{/.test(line.slice(7))) return "Exports a value for use in other modules";

    const fnDecl = line.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)/);
    if (fnDecl) {
      const isAsync = /\basync\b/.test(line);
      return `${isAsync ? "Async f" : "F"}unction \`${fnDecl[1]}\` — a named block of code you can call by name`;
    }

    const cls = line.match(/^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/);
    if (cls) return `Defines class \`${cls[1]}\` — a blueprint for creating objects with methods and properties`;

    const varDecl = line.match(/^(?:export\s+)?(const|let|var)\s+(\w+)/);
    if (varDecl) {
      const kw = varDecl[1];
      const name = varDecl[2];
      if (kw === "const") return `Declares \`${name}\` — an immutable binding whose value cannot be reassigned`;
      return `Declares \`${name}\` — a mutable variable that can be updated later`;
    }

    if (/^interface\s+(\w+)/.test(line)) {
      const name = line.match(/^interface\s+(\w+)/)?.[1];
      return `Defines interface \`${name}\` — a structural contract that objects must satisfy`;
    }
    if (/^type\s+(\w+)\s*=/.test(line)) {
      const name = line.match(/^type\s+(\w+)/)?.[1];
      return `Defines type \`${name}\` — a named alias for a type expression`;
    }
    if (/^enum\s+(\w+)/.test(line)) {
      const name = line.match(/^enum\s+(\w+)/)?.[1];
      return `Defines enum \`${name}\` — a fixed set of named constant values`;
    }

    if (/^return\b/.test(line)) return "Returns a value from the function";
    if (/^if\s*\(/.test(line)) return "Checks a condition — runs next block if true";
    if (/^}\s*else\s+if\s*\(/.test(line) || /^else\s+if\s*\(/.test(line)) return "Alternative condition check";
    if (/^}\s*else\s*\{?$/.test(line) || /^else\s*\{?$/.test(line)) return "Fallback branch — runs if all above conditions were false";
    if (/^for\s*\(/.test(line)) return "Loop — iterates with a counter or over a collection";
    if (/^for\s+\w+\s+(?:of|in)\s/.test(line)) return "Iterates over collection items";
    if (/^while\s*\(/.test(line)) return "Loop — repeats while condition is true";
    if (/^switch\s*\(/.test(line)) return "Switch — selects a branch based on a value";
    if (/^case\s+/.test(line)) return "Matches this value in the switch statement";
    if (/^default\s*:/.test(line)) return "Default case — runs when no other case matches";
    if (/^break;?$/.test(line)) return "Exits the loop or switch statement";
    if (/^continue;?$/.test(line)) return "Skips to the next iteration of the loop";

    if (/^import\b/.test(line)) {
      const from = line.match(/from\s+['"](.+)['"]/)?.[1];
      return from ? `Imports from \`${from}\` — brings exported names into this file` : "Imports a module or value — makes it available in the current scope";
    }
    if (/^require\s*\(/.test(line)) return "Requires (imports) a CommonJS module";

    if (/^try\s*\{/.test(line)) return "Starts a try block — code that might throw";
    if (/^}\s*catch\s*\(/.test(line) || /^catch\s*\(/.test(line)) return "Catches errors from the try block";
    if (/^}\s*finally/.test(line) || /^finally/.test(line)) return "Always runs — cleanup after try/catch";
    if (/^throw\b/.test(line)) return "Throws an error";

    if (/\bawait\b/.test(line)) return "Waits for a Promise to resolve before continuing";
    if (/^async\b/.test(line)) return "Marks this function as asynchronous (returns a Promise)";

    if (/^console\.(log|error|warn|info)\s*\(/.test(line)) return "Logs output to the developer console";
    if (/^this\.\w+\s*=/.test(line)) {
      const attr = line.match(/this\.(\w+)\s*=/)?.[1];
      return `Sets instance property \`${attr}\` — stores a value on this object`;
    }

    if (/^\w+\.push\s*\(/.test(line) || /\.push\s*\(/.test(line)) return "Appends an item to the end of an array";
    if (/\.map\s*\(/.test(line)) return "Transforms each element of an array into a new array";
    if (/\.filter\s*\(/.test(line)) return "Filters an array to only items matching a condition";
    if (/\.reduce\s*\(/.test(line)) return "Reduces an array to a single accumulated value";
    if (/\.find\s*\(/.test(line)) return "Finds the first array element matching a condition";
    if (/\.forEach\s*\(/.test(line)) return "Iterates over each element of an array";
    if (/\.includes\s*\(/.test(line)) return "Checks whether a value exists in an array or string";
    if (/\.split\s*\(/.test(line)) return "Splits a string into an array by a delimiter";
    if (/\.join\s*\(/.test(line)) return "Joins array elements into a string";

    if (/^(\w+)\s*:\s*\{/.test(line)) return "Object property with a nested object value";
    if (/^\.{3}\w+/.test(line) || /\.\.\.\w+/.test(line)) return "Spread operator — expands the iterable inline";

    return null;
  }

  // ── Go ────────────────────────────────────────────────────────
  if (language === "go") {
    if (/^package\b/.test(line)) {
      const name = line.match(/^package\s+(\w+)/)?.[1];
      return `Declares this file belongs to package \`${name}\``;
    }
    if (/^import\b/.test(line)) return "Imports packages — makes their exported functions and types available here";
    if (/^func\s+\(/.test(line)) {
      const m = line.match(/func\s+\(\w+\s+\*?(\w+)\)\s+(\w+)/);
      return m ? `Method \`${m[2]}\` on \`${m[1]}\` — a function associated with this type` : "Defines a method with a receiver — attaches a function to a type";
    }
    const fn = line.match(/^func\s+(\w+)/);
    if (fn) return `Defines function \`${fn[1]}\` — a named block of code callable from elsewhere in the program`;

    const st = line.match(/^type\s+(\w+)\s+struct/);
    if (st) return `Defines struct \`${st[1]}\` — a composite type that groups named fields together`;

    const iface = line.match(/^type\s+(\w+)\s+interface/);
    if (iface) return `Defines interface \`${iface[1]}\` — a contract of method signatures a type must satisfy`;

    const typeAlias = line.match(/^type\s+(\w+)\s+/);
    if (typeAlias) return `Defines type \`${typeAlias[1]}\` — a new named type built on an existing one`;

    if (/^var\b/.test(line)) return "Declares a variable — allocates a named slot in memory with an explicit type";
    if (/^const\b/.test(line)) return "Declares a constant — a fixed value evaluated at compile time, never changed at runtime";
    if (/:=/.test(line)) {
      const m = line.match(/^(\w+)\s*:=/);
      return m ? `Declares \`${m[1]}\` — short-form, type inferred from the assigned value` : "Short variable declaration — compiler infers the type automatically";
    }

    if (/^return\b/.test(line)) return "Returns values from the function — sends results back to the caller";
    if (/^if\b/.test(line)) return "Conditional — executes the block only if the condition is true";
    if (/^else\b/.test(line)) return "Else — runs when the preceding if condition was false";
    if (/^for\b/.test(line)) {
      if (/^for\s*\{/.test(line) || /^for\s*$/m.test(line)) return "Infinite loop — use break to exit";
      if (/range\b/.test(line)) return "Range loop — iterates over a slice, map, or channel";
      return "Loop — Go's only loop keyword";
    }
    if (/^switch\b/.test(line)) return "Switch statement — multi-way branching";
    if (/^case\b/.test(line)) return "Matches this value in the switch";
    if (/^default\s*:/.test(line)) return "Default case — runs when no case matches";
    if (/^go\s+\w+/.test(line)) return "Launches a goroutine — lightweight concurrent execution";
    if (/^defer\b/.test(line)) return "Defers this call until the surrounding function returns";
    if (/^panic\b/.test(line)) return "Panics — immediately stops normal execution";
    if (/^recover\b/.test(line)) return "Recovers from a panic inside a deferred function";
    if (/^make\s*\(/.test(line)) return "Allocates and initialises a slice, map, or channel";
    if (/^append\s*\(/.test(line) || /\bappend\s*\(/.test(line)) return "Appends elements to a slice";
    if (/^fmt\./.test(line)) return "Formats or prints output using the `fmt` package";
    if (/^log\./.test(line)) return "Logs a message using the `log` package";
    if (/^break$/.test(line)) return "Exits the enclosing loop or switch";
    if (/^continue$/.test(line)) return "Skips to the next loop iteration";
    return null;
  }

  // ── Rust ─────────────────────────────────────────────────────
  if (language === "rust") {
    if (/^use\b/.test(line)) {
      const path = line.match(/^use\s+(.+);/)?.[1];
      return path ? `Brings \`${path}\` into scope — no need to write the full path when using it` : "Imports items into the current scope — shortens the path needed to use them";
    }
    if (/^mod\b/.test(line)) {
      const name = line.match(/^mod\s+(\w+)/)?.[1];
      return name ? `Declares module \`${name}\` — organises related code into a named namespace` : "Declares a sub-module — groups related items under a shared namespace";
    }
    if (/^pub\s+fn\b/.test(line) || /^fn\b/.test(line)) {
      const name = line.match(/fn\s+(\w+)/)?.[1];
      const isPub = /^pub\b/.test(line);
      return name ? `${isPub ? "Public f" : "F"}unction \`${name}\` — a named block of code you can call by name` : "Function definition — a named, reusable block of executable code";
    }
    const st = line.match(/^(?:pub\s+)?struct\s+(\w+)/);
    if (st) return `Defines struct \`${st[1]}\` — a named composite type that groups related data fields`;

    const en = line.match(/^(?:pub\s+)?enum\s+(\w+)/);
    if (en) return `Defines enum \`${en[1]}\` — a type with multiple exclusive named variants`;

    const tr = line.match(/^(?:pub\s+)?trait\s+(\w+)/);
    if (tr) return `Defines trait \`${tr[1]}\` — a shared behaviour interface types can implement`;

    const impl = line.match(/^impl(?:<.+>)?\s+(\w+)/);
    if (impl) {
      const forType = line.match(/\bfor\s+(\w+)/)?.[1];
      return forType
        ? `Implements \`${impl[1]}\` for \`${forType}\` — adds the trait's required methods to this type`
        : `Implements methods for \`${impl[1]}\` — attaches functions that belong to this type`;
    }

    const letDecl = line.match(/^let\s+(mut\s+)?(\w+)/);
    if (letDecl) {
      const isMut = !!letDecl[1];
      return `Binds \`${letDecl[2]}\` — ${isMut ? "mutable variable, its value can be updated later" : "immutable by default, cannot be reassigned after this point"}`;
    }

    if (/^return\b/.test(line)) return "Explicitly returns a value (last expression returns implicitly)";
    if (/^if\b/.test(line)) return "Conditional expression — evaluates to a value in Rust";
    if (/^else\b/.test(line)) return "Else branch of a conditional";
    if (/^for\b/.test(line)) return "Loop — iterates over an iterator";
    if (/^while\b/.test(line)) return "Loop — repeats while condition is true";
    if (/^loop\b/.test(line)) return "Infinite loop — must use `break` to exit";
    if (/^match\b/.test(line)) return "Pattern match — exhaustively branches on a value";
    if (/^=>/.test(line) || /=>\s/.test(line)) return "Match arm — maps pattern to expression";
    if (/^panic!\(/.test(line)) return "Panics — unrecoverable error, terminates the thread";
    if (/^println!\(/.test(line)) return "Prints a formatted line to stdout";
    if (/^eprintln!\(/.test(line)) return "Prints a formatted line to stderr";
    if (/^vec!\[/.test(line) || /\bvec!\[/.test(line)) return "Creates a heap-allocated `Vec` from literal values";
    if (/^#\[/.test(line)) {
      if (/derive/.test(line)) return "Auto-derives trait implementations (e.g. Debug, Clone, PartialEq)";
      return "Attribute — metadata or code generation hint";
    }
    if (/\?$/.test(line)) return "Propagates error upward with the `?` operator";
    if (/\.unwrap\(\)/.test(line)) return "Unwraps the value — panics if it is `None` or `Err`";
    if (/\.expect\(/.test(line)) return "Unwraps with a custom panic message";
    if (/^break/.test(line)) return "Exits the enclosing loop (can carry a value)";
    if (/^continue/.test(line)) return "Skips to the next loop iteration";
    return null;
  }

  // ── C / C++ ───────────────────────────────────────────────────
  if (language === "c" || language === "cpp") {
    const inc = line.match(/^#include\s*[<"]([^>"]+)/);
    if (inc) return `Includes \`${inc[1]}\` — brings declarations from this header file into scope`;

    if (/^#define\b/.test(line)) return "Macro — textual substitution at compile time";
    if (/^#ifdef|^#ifndef|^#endif|^#else/.test(line)) return "Preprocessor conditional compilation directive";
    if (/^#pragma\b/.test(line)) return "Compiler-specific directive";

    if (/^int\s+main\s*\(/.test(line)) return "Main entry point — program execution starts here";

    const fn = line.match(/^(?:\w+\s+)+(\w+)\s*\([^)]*\)\s*(?:const)?\s*\{?$/);
    if (fn && !line.includes("=") && !line.includes(",")) {
      const name = fn[1];
      if (!["if", "for", "while", "switch"].includes(name))
        return `Defines function \`${name}\` — a named block of code callable from other parts of the program`;
    }

    if (language === "cpp") {
      const cls = line.match(/^(?:class|struct)\s+(\w+)/);
      if (cls) return `Defines \`${cls[1]}\` — a user-defined type grouping data and methods together`;

      const ns = line.match(/^namespace\s+(\w+)/);
      if (ns) return `Opens namespace \`${ns[1]}\` — groups related identifiers to avoid naming conflicts`;

      if (/^template\s*</.test(line)) return "Template declaration — generic parameterised code";
      if (/^using\b/.test(line)) return "Type alias or namespace import";
      if (/\bstd::/.test(line)) return "Uses a standard library component";
      if (/\bnew\s+\w+/.test(line)) return "Allocates memory on the heap — remember to `delete`";
      if (/\bdelete\b/.test(line)) return "Frees heap-allocated memory";
      if (/\bauto\b/.test(line)) return "Type-inferred variable — compiler deduces the type";
    }

    if (/^for\s*\(/.test(line)) return "For loop — iterates with a counter";
    if (/^while\s*\(/.test(line)) return "While loop — repeats while condition is true";
    if (/^do\s*\{/.test(line)) return "Do-while loop — body runs at least once";
    if (/^if\s*\(/.test(line)) return "Conditional — runs the following block only if the condition is true";
    if (/^else\b/.test(line)) return "Else — runs when the preceding if condition was false";
    if (/^switch\s*\(/.test(line)) return "Switch — selects a branch based on the value, skipping all other cases";
    if (/^case\s+/.test(line)) return "Matches this value in the switch";
    if (/^return\b/.test(line)) return "Returns a value from the function";
    if (/^printf\s*\(/.test(line)) return "Prints formatted output to stdout";
    if (/^scanf\s*\(/.test(line)) return "Reads formatted input from stdin";
    if (/^malloc\s*\(/.test(line) || /\bmalloc\s*\(/.test(line)) return "Allocates a block of memory on the heap";
    if (/^free\s*\(/.test(line) || /\bfree\s*\(/.test(line)) return "Frees previously allocated heap memory";
    if (/^break;?$/.test(line)) return "Exits the loop or switch statement";
    if (/^continue;?$/.test(line)) return "Skips to the next loop iteration";

    const varDecl = line.match(/^(?:int|char|float|double|bool|long|unsigned|void)\s+\*?(\w+)/);
    if (varDecl) return `Declares variable \`${varDecl[1]}\` — allocates a named slot in memory to store a value`;

    return null;
  }

  // ── Java ─────────────────────────────────────────────────────
  if (language === "java") {
    if (/^package\b/.test(line)) {
      const name = line.match(/^package\s+(.+);/)?.[1];
      return `Declares this file belongs to package \`${name}\``;
    }
    if (/^import\b/.test(line)) {
      const name = line.match(/^import\s+(.+);/)?.[1];
      return name ? `Imports \`${name}\` — makes this class or package usable without its full path` : "Imports a class or package — brings it into scope for use in this file";
    }

    const cls = line.match(/^(?:public\s+)?(?:abstract\s+)?(?:final\s+)?class\s+(\w+)/);
    if (cls) return `Defines class \`${cls[1]}\` — a blueprint for creating objects with state and behaviour`;

    const iface = line.match(/^(?:public\s+)?interface\s+(\w+)/);
    if (iface) return `Defines interface \`${iface[1]}\` — a contract of methods every implementing class must provide`;

    const en = line.match(/^(?:public\s+)?enum\s+(\w+)/);
    if (en) return `Defines enum \`${en[1]}\` — a fixed set of named constant values`;

    if (/^@Override/.test(line)) return "Marks this method as overriding a superclass method";
    if (/^@/.test(line)) return "Java annotation — metadata for the compiler or runtime";

    const method = line.match(/^(?:public|private|protected)\s+(?:static\s+)?(?:\w+)\s+(\w+)\s*\(/);
    if (method) return `Declares method \`${method[1]}\` — a function that belongs to this class`;

    if (/^return\b/.test(line)) return "Returns a value from the method";
    if (/^if\s*\(/.test(line)) return "Conditional — runs the following block only if the condition is true";
    if (/^}\s*else\s+if/.test(line) || /^else\s+if/.test(line)) return "Alternative condition — checked only if the preceding if was false";
    if (/^}\s*else/.test(line) || /^else\s*\{/.test(line)) return "Else — runs when every condition above was false";
    if (/^for\s*\(/.test(line)) return "Loop — iterates with a counter or over a collection";
    if (/^while\s*\(/.test(line)) return "While loop — repeats the block while the condition remains true";
    if (/^do\s*\{/.test(line)) return "Do-while loop — body runs at least once";
    if (/^switch\s*\(/.test(line)) return "Switch — branches to different code based on the matched value";
    if (/^case\s+/.test(line)) return "Matches this value in the switch";
    if (/^try\s*\{/.test(line)) return "Starts a try block — code that may throw";
    if (/^}\s*catch\s*\(/.test(line) || /^catch\s*\(/.test(line)) return "Catches the thrown exception";
    if (/^}\s*finally/.test(line) || /^finally/.test(line)) return "Always runs — cleanup block";
    if (/^throw\b/.test(line)) return "Throws an exception";
    if (/^System\.out\.print/.test(line)) return "Prints output to the console";
    if (/^super\s*\(/.test(line)) return "Calls the parent class constructor";
    if (/^this\s*\(/.test(line)) return "Calls another constructor in this class";
    if (/^break;?$/.test(line)) return "Exits the loop or switch";
    if (/^continue;?$/.test(line)) return "Skips to the next loop iteration";

    const field = line.match(/^(?:private|protected|public)\s+(?:final\s+)?(\w+)\s+(\w+)/);
    if (field) return `Declares field \`${field[2]}\` — stores a \`${field[1]}\` value on every instance of this class`;

    return null;
  }

  // ── HTML ─────────────────────────────────────────────────────
  if (language === "html") {
    if (/<!DOCTYPE/.test(line)) return "Document type declaration — tells browsers this is HTML5";
    if (/<html/.test(line)) return "Root element — wraps the entire HTML document";
    if (/<\/html>/.test(line)) return "Closes the root HTML element";
    if (/<head>/.test(line)) return "Document head — holds metadata, title, and resource links";
    if (/<\/head>/.test(line)) return "Closes the document head section";
    if (/<body/.test(line)) return "Document body — all visible page content goes here";
    if (/<\/body>/.test(line)) return "Closes the visible body of the page";
    if (/<title>/.test(line)) return "Sets the text shown in the browser tab";
    if (/<meta/.test(line)) return "Metadata tag — provides info for browsers and search engines";
    if (/<link/.test(line)) return "Links an external resource (commonly a CSS stylesheet)";
    if (/<script/.test(line)) return "Embeds or links a JavaScript file";
    if (/<style/.test(line)) return "Embeds CSS rules directly in the HTML";
    if (/<div/.test(line)) return "Block container — groups elements for layout or styling";
    if (/<span/.test(line)) return "Inline container — groups text for styling without breaking flow";
    if (/<p[> ]/.test(line)) return "Paragraph of text";
    if (/<h[1-6]/.test(line)) {
      const level = line.match(/<h([1-6])/)?.[1];
      return `Heading level ${level} — semantic section title`;
    }
    if (/<a\s/.test(line)) return "Hyperlink — navigates to another page or anchor";
    if (/<img/.test(line)) return "Displays an image";
    if (/^<input/.test(line)) return "Interactive form input element";
    if (/<button/.test(line)) return "Clickable button — triggers an action";
    if (/<form/.test(line)) return "Form — groups inputs and sends data on submit";
    if (/<ul>/.test(line)) return "Unordered (bullet) list container";
    if (/<ol>/.test(line)) return "Ordered (numbered) list container";
    if (/<li>/.test(line)) return "List item inside a `ul` or `ol`";
    if (/<table/.test(line)) return "Table — displays data in rows and columns";
    if (/<tr/.test(line)) return "Table row";
    if (/<th/.test(line)) return "Table header cell — bold and centred by default";
    if (/<td/.test(line)) return "Table data cell";
    if (/<nav/.test(line)) return "Navigation section — contains links";
    if (/<header/.test(line)) return "Page or section header area";
    if (/<footer/.test(line)) return "Page or section footer area";
    if (/<main/.test(line)) return "Main content area — unique to the page";
    if (/<section/.test(line)) return "Thematic section of content";
    if (/<article/.test(line)) return "Self-contained piece of content";
    if (/<aside/.test(line)) return "Sidebar or supplementary content";
    if (/<!--/.test(line)) return "HTML comment — visible in source but not rendered";
    return null;
  }

  // ── CSS ───────────────────────────────────────────────────────
  if (language === "css" || language === "tailwind") {
    if (/@media/.test(line)) return "Media query — applies styles based on screen or device conditions";
    if (/@keyframes/.test(line)) return "Defines a CSS animation with named keyframe steps";
    if (/@import/.test(line)) return "Imports another stylesheet";
    if (/@font-face/.test(line)) return "Defines a custom font to load";
    if (/@layer/.test(line)) return "Declares a cascade layer for specificity control";
    if (/:root/.test(line)) return "Root element selector — ideal for declaring global CSS variables";
    if (/--[\w-]+\s*:/.test(line)) {
      const name = line.match(/--([\w-]+)\s*:/)?.[1];
      return `Defines CSS custom property (variable) \`--${name}\``;
    }
    if (/var\(--.+\)/.test(line)) {
      const name = line.match(/var\(--([\w-]+)\)/)?.[1];
      return name ? `References CSS variable \`--${name}\`` : "References a CSS custom property";
    }

    const prop = line.match(/^([\w-]+)\s*:/);
    if (prop && !line.includes("{")) {
      const descriptions: Record<string, string> = {
        display: "Controls how the element is laid out (block, flex, grid…)",
        position: "Sets the positioning method (static, relative, absolute, fixed)",
        "flex-direction": "Sets the main axis direction for flex children",
        "justify-content": "Aligns flex/grid children along the main axis",
        "align-items": "Aligns flex/grid children along the cross axis",
        gap: "Sets the spacing between flex or grid items",
        margin: "Sets space outside the element's border",
        padding: "Sets space inside the element's border",
        border: "Sets the element's border width, style, and colour",
        "border-radius": "Rounds the element's corners",
        background: "Sets the element's background (colour, gradient, or image)",
        "background-color": "Sets the element's background colour",
        color: "Sets the text colour",
        "font-size": "Sets the text size",
        "font-weight": "Sets text boldness",
        "font-family": "Sets the typeface",
        width: "Sets the element's width",
        height: "Sets the element's height",
        "max-width": "Limits how wide the element can grow",
        "min-height": "Sets the minimum height of the element",
        overflow: "Controls what happens when content overflows its box",
        opacity: "Sets the element's transparency (0 = invisible, 1 = fully visible)",
        transform: "Applies a 2D/3D transformation (translate, rotate, scale…)",
        transition: "Animates property changes smoothly over time",
        animation: "Applies a CSS `@keyframes` animation",
        cursor: "Sets the mouse cursor appearance over the element",
        "z-index": "Controls stacking order — higher values appear on top",
        content: "Inserts generated content for `::before` or `::after`",
        "box-shadow": "Adds shadow effects around the element's box",
        "text-align": "Aligns inline content (left, right, center, justify)",
        "line-height": "Sets the spacing between lines of text",
        "letter-spacing": "Adjusts space between individual characters",
        "white-space": "Controls how whitespace and line breaks are handled",
        "text-overflow": "Specifies how overflowed text is signalled (e.g. ellipsis)",
        "list-style": "Sets the appearance of list item markers",
        outline: "Draws a line outside the border (commonly used for focus rings)",
        "pointer-events": "Controls whether an element can be the target of mouse events",
        "user-select": "Controls whether the user can select text",
        resize: "Allows the user to resize the element",
        appearance: "Resets or overrides the native platform look of a form element",
        "flex-wrap": "Allows flex items to wrap onto multiple lines",
        "flex-grow": "Sets how much a flex item should grow relative to siblings",
        "flex-shrink": "Sets how much a flex item should shrink relative to siblings",
        "align-self": "Overrides `align-items` for a single flex item",
        "grid-template-columns": "Defines the column structure of a grid",
        "grid-template-rows": "Defines the row structure of a grid",
        "grid-column": "Specifies which columns a grid item spans",
        "grid-row": "Specifies which rows a grid item spans",
        top: "Sets the element's top offset (used with positioned elements)",
        right: "Sets the element's right offset",
        bottom: "Sets the element's bottom offset",
        left: "Sets the element's left offset",
      };
      const desc = descriptions[prop[1]];
      return desc ?? `Sets CSS property \`${prop[1]}\``;
    }

    const sel = line.match(/^([\w.#:*\[\]()> +~,\-"'=^$|]+)\s*\{/);
    if (sel) return `CSS rule for selector \`${sel[1].trim()}\``;

    return null;
  }

  // ── JSON ─────────────────────────────────────────────────────
  if (language === "json") {
    if (/^\{$/.test(line)) return "Opens a JSON object";
    if (/^\}[,]?$/.test(line)) return "Closes a JSON object";
    if (/^\[$/.test(line)) return "Opens a JSON array";
    if (/^\][,]?$/.test(line)) return "Closes a JSON array";

    const objProp = line.match(/^"([\w$\-. ]+)"\s*:\s*\{/);
    if (objProp) return `Object property \`${objProp[1]}\` — value is a nested object`;

    const arrProp = line.match(/^"([\w$\-. ]+)"\s*:\s*\[/);
    if (arrProp) return `Array property \`${arrProp[1]}\` — its value is a list of items`;

    const numProp = line.match(/^"([\w$\-. ]+)"\s*:\s*(-?\d+\.?\d*)/);
    if (numProp) return `Property \`${numProp[1]}\` with numeric value \`${numProp[2]}\``;

    const boolProp = line.match(/^"([\w$\-. ]+)"\s*:\s*(true|false)/);
    if (boolProp) return `Property \`${boolProp[1]}\` — boolean flag (\`${boolProp[2]}\`)`;

    const nullProp = line.match(/^"([\w$\-. ]+)"\s*:\s*null/);
    if (nullProp) return `Property \`${nullProp[1]}\` is explicitly absent (\`null\`)`;

    const strProp = line.match(/^"([\w$\-. ]+)"\s*:\s*"([^"]*)"/);
    if (strProp) return `Property \`${strProp[1]}\` — holds a string value`;

    return null;
  }

  return null;
}
