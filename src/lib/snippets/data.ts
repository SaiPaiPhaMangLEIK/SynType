import { Snippet } from "@/types";

export const SNIPPETS: Snippet[] = [
  // ── BEGINNER ────────────────────────────────────────────────────────────

  // Python – beginner
  {
    id: "py-binary-search",
    language: "python",
    topic: "Binary Search",
    difficulty: "beginner",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    explanation:
      "Binary search finds a target in a sorted array by repeatedly halving the search range. It compares the middle element and discards the irrelevant half, achieving O(log n) time complexity.",
  },
  {
    id: "py-bubble-sort",
    language: "python",
    topic: "Bubble Sort",
    difficulty: "beginner",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
    explanation:
      "Bubble sort repeatedly steps through the list and swaps adjacent elements that are out of order. The early-exit optimization stops the algorithm if no swaps occurred in a pass, making best-case O(n).",
  },
  {
    id: "py-fibonacci",
    language: "python",
    topic: "Fibonacci",
    difficulty: "beginner",
    code: `def fibonacci(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]`,
    explanation:
      "This memoized recursive Fibonacci function caches previously computed values in a dictionary, reducing time complexity from exponential O(2^n) to linear O(n). The memo dict persists across calls due to Python's default argument behavior.",
  },
  {
    id: "py-dataclass",
    language: "python",
    topic: "Dataclasses",
    difficulty: "beginner",
    code: `from dataclasses import dataclass, field
from typing import List

@dataclass(order=True)
class Student:
    name: str
    grade: float
    courses: List[str] = field(default_factory=list)

    def gpa_letter(self) -> str:
        if self.grade >= 90: return "A"
        if self.grade >= 80: return "B"
        if self.grade >= 70: return "C"
        return "F"

students = [Student("Alice", 92.5), Student("Bob", 78.0)]
students.sort(key=lambda s: s.grade, reverse=True)`,
    explanation:
      "dataclass auto-generates __init__, __repr__, and __eq__ from field annotations. order=True also generates comparison methods. field(default_factory=list) creates a fresh list per instance, avoiding the classic mutable-default-argument bug.",
  },
  {
    id: "py-sec-caesar-cipher",
    language: "python",
    topic: "Caesar Cipher",
    difficulty: "beginner",
    code: `def caesar_cipher(text: str, shift: int, decrypt: bool = False) -> str:
    if decrypt:
        shift = -shift
    result = []
    for ch in text:
        if ch.isalpha():
            base = ord("A") if ch.isupper() else ord("a")
            result.append(chr((ord(ch) - base + shift) % 26 + base))
        else:
            result.append(ch)
    return "".join(result)

ciphertext = caesar_cipher("Hello, World!", shift=13)
plaintext  = caesar_cipher(ciphertext, shift=13, decrypt=True)`,
    explanation:
      "The Caesar cipher shifts each letter by a fixed amount modulo 26. The base offset separates upper and lower case. Using % 26 ensures wrap-around. ROT13 (shift=13) is self-inverse: encrypting twice returns the original text.",
  },
  {
    id: "py-sec-password-hash",
    language: "python",
    topic: "Password Hashing",
    difficulty: "beginner",
    code: `import hashlib
import os
import hmac

def hash_password(password: str) -> tuple[bytes, bytes]:
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations=600_000,
    )
    return salt, key

def verify_password(password: str, salt: bytes, key: bytes) -> bool:
    candidate = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        iterations=600_000,
    )
    return hmac.compare_digest(candidate, key)`,
    explanation:
      "PBKDF2-HMAC-SHA256 is an approved password-hashing KDF. os.urandom(32) generates a cryptographically secure random salt. 600 000 iterations follows current NIST guidance. hmac.compare_digest performs a constant-time comparison to prevent timing attacks.",
  },
  {
    id: "py-sec-sql-injection",
    language: "python",
    topic: "SQL Injection Prevention",
    difficulty: "beginner",
    code: `import sqlite3
from dataclasses import dataclass

@dataclass
class User:
    id: int
    username: str
    email: str

def get_user(conn: sqlite3.Connection, username: str) -> User | None:
    cursor = conn.execute(
        "SELECT id, username, email FROM users WHERE username = ?",
        (username,),
    )
    row = cursor.fetchone()
    return User(*row) if row else None

def create_user(conn: sqlite3.Connection, username: str, email: str) -> int:
    cursor = conn.execute(
        "INSERT INTO users (username, email) VALUES (?, ?)",
        (username, email),
    )
    conn.commit()
    return cursor.lastrowid`,
    explanation:
      "Parameterised queries pass user input as bind parameters rather than interpolating it into the SQL string. The database driver escapes the values, making it impossible for an attacker to inject SQL. Never use f-strings or % formatting to build SQL.",
  },
  {
    id: "py-sec-xss-sanitize",
    language: "python",
    topic: "XSS Sanitization",
    difficulty: "beginner",
    code: `import html
import re

ALLOWED_TAGS = re.compile(r"<(?!/?(?:b|i|em|strong|p|br)\b)[^>]+>", re.IGNORECASE)
DANGEROUS_ATTRS = re.compile(
    r'\s*(?:on\w+|href\s*=\s*["\']?javascript)[^"\'>\s]*',
    re.IGNORECASE,
)

def sanitize(user_input: str, allow_basic_html: bool = False) -> str:
    if not allow_basic_html:
        return html.escape(user_input)
    cleaned = DANGEROUS_ATTRS.sub("", user_input)
    cleaned = ALLOWED_TAGS.sub("", cleaned)
    return cleaned

safe_text   = sanitize('<script>alert("xss")</script>')
safe_html   = sanitize("<b>Hello</b> <script>bad()</script>", allow_basic_html=True)`,
    explanation:
      "html.escape converts <, >, &, \" and ' to HTML entities — the simplest and safest approach. The allow_basic_html path strips disallowed tags and dangerous event-handler attributes with regex. Always prefer a battle-tested library like bleach for production HTML sanitisation.",
  },

  // JavaScript – beginner
  {
    id: "js-async-fetch",
    language: "javascript",
    topic: "Async Fetch",
    difficulty: "beginner",
    code: `async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}`,
    explanation:
      "A reusable async fetch wrapper that merges default headers with caller-supplied options, checks the HTTP status code, and parses the JSON body. Errors are logged and re-thrown so callers can handle them.",
  },
  {
    id: "js-regex-validator",
    language: "javascript",
    topic: "Regex Validator",
    difficulty: "beginner",
    code: `const validators = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{7,14}$/,
  url:   /^https?:\/\/[\w\-]+(\.[\w\-]+)+(\/\S*)?$/,
  uuid:  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

function validate(type, value) {
  const pattern = validators[type];
  if (!pattern) throw new Error(\`Unknown validator: \${type}\`);
  return pattern.test(value);
}`,
    explanation:
      "A registry of compiled regular expressions for common formats. The validate function looks up the pattern by name and tests the value, throwing for unknown types. Pre-compiling regexes avoids recompilation on every call.",
  },
  {
    id: "js-debounce",
    language: "javascript",
    topic: "Debounce",
    difficulty: "beginner",
    code: `function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

const onResize = debounce(() => {
  console.log('resized:', window.innerWidth);
}, 200);

window.addEventListener('resize', onResize);`,
    explanation:
      "Debounce delays invoking fn until delay milliseconds have passed since the last call. The closure captures timer so each call resets it. apply preserves the original this context and forwards all arguments, making it a drop-in wrapper.",
  },

  // Go – beginner
  {
    id: "go-stack",
    language: "go",
    topic: "Stack",
    difficulty: "beginner",
    code: `type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    var zero T
    if len(s.items) == 0 {
        return zero, false
    }
    top := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return top, true
}

func (s *Stack[T]) Peek() (T, bool) {
    var zero T
    if len(s.items) == 0 {
        return zero, false
    }
    return s.items[len(s.items)-1], true
}

func (s *Stack[T]) Len() int {
    return len(s.items)
}`,
    explanation:
      "A generic stack implementation using Go 1.18+ type parameters. Push appends to the backing slice, Pop removes and returns the last element with an ok sentinel, and Peek reads without removing. The zero value trick safely returns the type's default when empty.",
  },
  {
    id: "go-http-handler",
    language: "go",
    topic: "HTTP Handler",
    difficulty: "beginner",
    code: `package main

import (
    "encoding/json"
    "log"
    "net/http"
)

type Response struct {
    Status  string \`json:"status"\`
    Message string \`json:"message"\`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(Response{
        Status:  "ok",
        Message: "service is healthy",
    })
}

func main() {
    http.HandleFunc("/health", healthHandler)
    log.Fatal(http.ListenAndServe(":8080", nil))
}`,
    explanation:
      "A minimal Go HTTP server with a JSON health-check endpoint. The handler sets the Content-Type header, writes a 200 status, and encodes a struct directly to the response writer. log.Fatal ensures the process exits if the server fails to start.",
  },

  // TypeScript – beginner
  {
    id: "ts-zod-schema",
    language: "typescript",
    topic: "Schema Validation",
    difficulty: "beginner",
    code: `import { z } from "zod";

const UserSchema = z.object({
  id:        z.string().uuid(),
  email:     z.string().email(),
  age:       z.number().int().min(0).max(150),
  role:      z.enum(["admin", "user", "guest"]),
  createdAt: z.string().datetime().optional(),
});

type User = z.infer<typeof UserSchema>;

function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}`,
    explanation:
      "Zod schema that describes a User object with built-in validation rules. z.infer extracts the TypeScript type automatically so schema and type stay in sync. parse throws ZodError with detailed field-level messages on invalid input.",
  },

  // Rust – beginner
  {
    id: "rs-ownership",
    language: "rust",
    topic: "Ownership & Borrowing",
    difficulty: "beginner",
    code: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &byte) in bytes.iter().enumerate() {
        if byte == b' ' {
            return &s[..i];
        }
    }
    s
}

fn main() {
    let s = String::from("hello world");
    let word = first_word(&s);
    println!("{}", word);
}`,
    explanation:
      "Demonstrates Rust lifetime annotations and string slices. longest uses lifetime 'a to tell the borrow checker the return value lives as long as the shorter input. first_word returns a slice into the original String, so no allocation is needed.",
  },
  {
    id: "rs-hashmap-wordcount",
    language: "rust",
    topic: "HashMap Word Count",
    difficulty: "beginner",
    code: `use std::collections::HashMap;

fn word_count(text: &str) -> HashMap<&str, usize> {
    let mut map = HashMap::new();
    for word in text.split_whitespace() {
        *map.entry(word).or_insert(0) += 1;
    }
    map
}

fn top_n(counts: &HashMap<&str, usize>, n: usize) -> Vec<(&&str, &usize)> {
    let mut pairs: Vec<_> = counts.iter().collect();
    pairs.sort_by(|a, b| b.1.cmp(a.1));
    pairs.into_iter().take(n).collect()
}`,
    explanation:
      "word_count uses entry().or_insert() to initialise missing keys to 0 and then increments in one step. top_n collects all key-value pairs, sorts by count descending, and takes the first n — a common idiom for frequency analysis.",
  },

  // C – beginner
  {
    id: "c-binary-search",
    language: "c",
    topic: "Binary Search",
    difficulty: "beginner",
    code: `#include <stdio.h>

int binary_search(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target)  left  = mid + 1;
        else                    right = mid - 1;
    }
    return -1;
}

int main(void) {
    int arr[] = {1, 3, 5, 7, 9, 11, 13};
    int n = sizeof(arr) / sizeof(arr[0]);
    printf("%d\\n", binary_search(arr, n, 7));
    return 0;
}`,
    explanation:
      "Classic iterative binary search in C. mid is computed as left + (right - left) / 2 to avoid integer overflow. sizeof(arr) / sizeof(arr[0]) is the idiomatic way to get the length of a stack-allocated array.",
  },
  {
    id: "c-stack",
    language: "c",
    topic: "Stack (Array)",
    difficulty: "beginner",
    code: `#include <stdio.h>
#include <stdbool.h>
#define MAX 256

typedef struct {
    int items[MAX];
    int top;
} Stack;

void stack_init(Stack *s)      { s->top = -1; }
bool stack_empty(Stack *s)     { return s->top < 0; }
bool stack_full(Stack *s)      { return s->top == MAX - 1; }

bool push(Stack *s, int val) {
    if (stack_full(s)) return false;
    s->items[++s->top] = val;
    return true;
}

bool pop(Stack *s, int *out) {
    if (stack_empty(s)) return false;
    *out = s->items[s->top--];
    return true;
}`,
    explanation:
      "A fixed-capacity stack backed by a C array. The top index starts at -1 (empty). push pre-increments top before storing the value; pop reads then post-decrements. Boolean return values signal overflow and underflow without exceptions.",
  },
  {
    id: "c-string-utils",
    language: "c",
    topic: "String Utilities",
    difficulty: "beginner",
    code: `#include <string.h>
#include <ctype.h>

void str_trim(char *s) {
    char *end = s + strlen(s) - 1;
    while (end > s && isspace((unsigned char)*end)) *end-- = '\\0';
    char *start = s;
    while (*start && isspace((unsigned char)*start)) start++;
    memmove(s, start, strlen(start) + 1);
}

void str_lower(char *s) {
    for (; *s; s++) *s = tolower((unsigned char)*s);
}

int str_starts_with(const char *s, const char *prefix) {
    return strncmp(s, prefix, strlen(prefix)) == 0;
}`,
    explanation:
      "Three common string helpers. str_trim removes leading and trailing whitespace in-place using memmove to shift the string. str_lower iterates pointer-style. Casting to unsigned char before isspace/tolower avoids undefined behaviour on negative char values.",
  },

  // C++ – beginner
  {
    id: "cpp-vector-algorithms",
    language: "cpp",
    topic: "STL Algorithms",
    difficulty: "beginner",
    code: `#include <algorithm>
#include <vector>
#include <numeric>
#include <iostream>

int main() {
    std::vector<int> v = {5, 3, 8, 1, 9, 2, 7};

    std::sort(v.begin(), v.end());

    auto it = std::lower_bound(v.begin(), v.end(), 7);
    std::cout << "lower_bound(7) = " << *it << "\\n";

    int sum = std::accumulate(v.begin(), v.end(), 0);
    std::cout << "sum = " << sum << "\\n";

    std::reverse(v.begin(), v.end());
    return 0;
}`,
    explanation:
      "Demonstrates four core STL algorithms. std::sort runs introsort (O(n log n)). std::lower_bound does binary search on a sorted range. std::accumulate folds over the range with a starting value. All algorithms operate on half-open iterator ranges [begin, end).",
  },

  // ── INTERMEDIATE ─────────────────────────────────────────────────────────

  // Python – intermediate
  {
    id: "py-linked-list",
    language: "python",
    topic: "Linked List",
    difficulty: "intermediate",
    code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node`,
    explanation:
      "A singly linked list where each Node holds data and a pointer to the next node. The append method traverses to the tail before inserting, giving O(n) insertion at the end.",
  },
  {
    id: "py-decorator",
    language: "python",
    topic: "Decorator Pattern",
    difficulty: "intermediate",
    code: `import functools
import time

def retry(max_attempts=3, delay=1.0):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(delay)
        return wrapper
    return decorator

@retry(max_attempts=3, delay=0.5)
def unstable_api_call():
    pass`,
    explanation:
      "A parametrized retry decorator that wraps a function with automatic retry logic. functools.wraps preserves the original function's metadata. The outer factory takes configuration, the middle decorator wraps the function, and the inner wrapper executes it.",
  },
  {
    id: "py-quick-sort",
    language: "python",
    topic: "Quick Sort",
    difficulty: "intermediate",
    code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left   = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right  = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
    explanation:
      "A functional quicksort that picks the middle element as pivot and partitions into three lists: elements less than, equal to, and greater than the pivot. Concatenating the sorted halves with the middle gives a sorted result at O(n log n) average time.",
  },
  {
    id: "py-generator",
    language: "python",
    topic: "Generator",
    difficulty: "intermediate",
    code: `def infinite_primes():
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n ** 0.5) + 1):
            if n % i == 0:
                return False
        return True

    n = 2
    while True:
        if is_prime(n):
            yield n
        n += 1

primes = infinite_primes()
first_ten = [next(primes) for _ in range(10)]`,
    explanation:
      "An infinite generator that lazily yields prime numbers. yield suspends execution and returns a value to the caller, resuming when next() is called again. The nested is_prime helper uses trial division up to the square root.",
  },
  {
    id: "py-context-manager",
    language: "python",
    topic: "Context Manager",
    difficulty: "intermediate",
    code: `import time
from contextlib import contextmanager

@contextmanager
def timer(label: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}s")

with timer("heavy computation"):
    result = sum(i ** 2 for i in range(1_000_000))`,
    explanation:
      "contextmanager turns a generator function into a context manager. Code before yield runs on __enter__, code in the finally block runs on __exit__ — even if an exception is raised. perf_counter provides high-resolution wall-clock timing.",
  },
  {
    id: "py-async-gather",
    language: "python",
    topic: "Async / Await",
    difficulty: "intermediate",
    code: `import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        resp.raise_for_status()
        return await resp.json()

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)

urls = ["https://api.example.com/a", "https://api.example.com/b"]
results = asyncio.run(fetch_all(urls))`,
    explanation:
      "asyncio.gather schedules all coroutines concurrently and waits for all of them. A single ClientSession is reused across requests for connection pooling. return_exceptions=True prevents one failed request from cancelling the others.",
  },
  {
    id: "py-itertools",
    language: "python",
    topic: "Itertools",
    difficulty: "intermediate",
    code: `import itertools
from collections import Counter

def sliding_window(iterable, n):
    iters = itertools.tee(iterable, n)
    for i, it in enumerate(iters):
        next(itertools.islice(it, i, i), None)
    return zip(*iters)

data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
windows = list(sliding_window(data, 3))
max_window = max(windows, key=sum)

pairs = list(itertools.combinations(range(5), 2))
grouped = {k: list(v) for k, v in itertools.groupby(sorted(data))}`,
    explanation:
      "itertools provides lazy, memory-efficient combinatorics. tee clones an iterator n times; islice advances each clone to create staggered starts for the window. groupby collapses consecutive equal elements — sorting first ensures all equal values are together.",
  },
  {
    id: "py-sec-hmac-signing",
    language: "python",
    topic: "HMAC Request Signing",
    difficulty: "intermediate",
    code: `import hashlib
import hmac
import time

SECRET_KEY = b"super-secret-key-change-in-prod"

def sign_request(payload: bytes) -> tuple[bytes, int]:
    timestamp = int(time.time())
    message = f"{timestamp}:".encode() + payload
    signature = hmac.new(SECRET_KEY, message, hashlib.sha256).digest()
    return signature, timestamp

def verify_request(
    payload: bytes, signature: bytes, timestamp: int, max_age: int = 300
) -> bool:
    if abs(time.time() - timestamp) > max_age:
        return False
    message = f"{timestamp}:".encode() + payload
    expected = hmac.new(SECRET_KEY, message, hashlib.sha256).digest()
    return hmac.compare_digest(expected, signature)`,
    explanation:
      "Webhook-style request signing with HMAC-SHA256. The timestamp is mixed into the message to create a replay window — requests older than max_age seconds are rejected. compare_digest prevents timing oracle attacks by comparing in constant time.",
  },
  {
    id: "py-sec-port-scanner",
    language: "python",
    topic: "Port Scanner",
    difficulty: "intermediate",
    code: `import socket
from concurrent.futures import ThreadPoolExecutor, as_completed

def scan_port(host: str, port: int, timeout: float = 1.0) -> int | None:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return port
    except (socket.timeout, ConnectionRefusedError, OSError):
        return None

def scan_range(host: str, start: int, end: int, workers: int = 100):
    open_ports = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(scan_port, host, p): p for p in range(start, end + 1)}
        for fut in as_completed(futures):
            if (port := fut.result()) is not None:
                open_ports.append(port)
    return sorted(open_ports)`,
    explanation:
      "A threaded TCP port scanner. create_connection does a full TCP handshake and raises an exception if the port is closed or filtered. ThreadPoolExecutor fans out probes concurrently and as_completed collects results as they finish, reducing total scan time.",
  },
  {
    id: "py-sec-rate-limiter",
    language: "python",
    topic: "Rate Limiter",
    difficulty: "intermediate",
    code: `import time
import functools
from collections import deque

def rate_limit(max_calls: int, period: float):
    def decorator(func):
        calls: deque[float] = deque()

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.monotonic()
            while calls and now - calls[0] >= period:
                calls.popleft()
            if len(calls) >= max_calls:
                raise RuntimeError(
                    f"Rate limit exceeded: {max_calls} calls per {period}s"
                )
            calls.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator

@rate_limit(max_calls=5, period=1.0)
def call_api(endpoint: str) -> dict:
    pass`,
    explanation:
      "A sliding-window rate limiter implemented as a decorator. A deque stores the timestamps of recent calls. Old timestamps outside the window are pruned on each call. If the window is full, a RuntimeError is raised before calling the underlying function.",
  },
  {
    id: "py-sec-path-traversal",
    language: "python",
    topic: "Path Traversal Prevention",
    difficulty: "intermediate",
    code: `from pathlib import Path

SAFE_ROOT = Path("/var/app/uploads").resolve()

def safe_open(filename: str) -> bytes:
    requested = (SAFE_ROOT / filename).resolve()
    if not requested.is_relative_to(SAFE_ROOT):
        raise PermissionError(
            f"Access denied: '{filename}' resolves outside the allowed directory"
        )
    if not requested.exists():
        raise FileNotFoundError(f"File not found: {filename}")
    return requested.read_bytes()

try:
    data = safe_open("report.pdf")
    evil = safe_open("../../etc/passwd")
except PermissionError as e:
    print(e)`,
    explanation:
      "Path traversal attacks use sequences like ../../ to escape a directory. resolve() normalises the path by eliminating symlinks and .. components. is_relative_to checks that the final resolved path is still under SAFE_ROOT, rejecting any attempt to escape it.",
  },

  // JavaScript – intermediate
  {
    id: "js-query-builder",
    language: "javascript",
    topic: "Query Builder",
    difficulty: "intermediate",
    code: `class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.conditions = [];
    this.columns = ['*'];
    this.limitVal = null;
  }

  select(...cols) {
    this.columns = cols;
    return this;
  }

  where(col, op, val) {
    this.conditions.push(\`\${col} \${op} '\${val}'\`);
    return this;
  }

  limit(n) {
    this.limitVal = n;
    return this;
  }

  build() {
    let sql = \`SELECT \${this.columns.join(', ')} FROM \${this.table}\`;
    if (this.conditions.length) {
      sql += \` WHERE \${this.conditions.join(' AND ')}\`;
    }
    if (this.limitVal !== null) {
      sql += \` LIMIT \${this.limitVal}\`;
    }
    return sql;
  }
}`,
    explanation:
      "A fluent SQL query builder that chains select, where, and limit calls before calling build(). Each method returns this for chaining, and build() assembles the final SQL string from accumulated state.",
  },
  {
    id: "js-event-emitter",
    language: "javascript",
    topic: "Event Emitter",
    difficulty: "intermediate",
    code: `class EventEmitter {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    this.#listeners.get(event)?.delete(fn);
  }

  emit(event, ...args) {
    this.#listeners.get(event)?.forEach((fn) => fn(...args));
  }

  once(event, fn) {
    const wrapper = (...args) => { fn(...args); this.off(event, wrapper); };
    return this.on(event, wrapper);
  }
}`,
    explanation:
      "A typed event emitter using private class fields and a Map of Sets. on returns an unsubscribe function. once wraps the handler to auto-remove itself after the first call. Sets prevent duplicate listeners for the same handler reference.",
  },
  {
    id: "js-promise-all",
    language: "javascript",
    topic: "Promise.all",
    difficulty: "intermediate",
    code: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) return resolve([]);
    const results = new Array(promises.length);
    let settled = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then((value) => {
        results[i] = value;
        if (++settled === promises.length) resolve(results);
      }).catch(reject);
    });
  });
}`,
    explanation:
      "A hand-rolled Promise.all that resolves with an ordered array of results once all promises settle, or rejects immediately on the first failure. Promise.resolve(p) normalises non-promise values so plain values work alongside real promises.",
  },

  // Go – intermediate
  {
    id: "go-merge-sort",
    language: "go",
    topic: "Merge Sort",
    difficulty: "intermediate",
    code: `func mergeSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    mid := len(arr) / 2
    left := mergeSort(arr[:mid])
    right := mergeSort(arr[mid:])
    return merge(left, right)
}

func merge(left, right []int) []int {
    result := make([]int, 0, len(left)+len(right))
    i, j := 0, 0
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            result = append(result, left[i])
            i++
        } else {
            result = append(result, right[j])
            j++
        }
    }
    result = append(result, left[i:]...)
    result = append(result, right[j:]...)
    return result
}`,
    explanation:
      "Merge sort divides the slice in half recursively until single elements remain, then merges sorted halves by comparing elements one at a time. It achieves O(n log n) time at the cost of O(n) extra space for the merged slices.",
  },
  {
    id: "go-binary-tree",
    language: "go",
    topic: "Binary Search Tree",
    difficulty: "intermediate",
    code: `type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

func insert(root *TreeNode, val int) *TreeNode {
    if root == nil {
        return &TreeNode{Val: val}
    }
    if val < root.Val {
        root.Left = insert(root.Left, val)
    } else if val > root.Val {
        root.Right = insert(root.Right, val)
    }
    return root
}

func inorder(root *TreeNode, result *[]int) {
    if root == nil {
        return
    }
    inorder(root.Left, result)
    *result = append(*result, root.Val)
    inorder(root.Right, result)
}`,
    explanation:
      "A binary search tree with recursive insert and inorder traversal. Insert places smaller values left and larger values right. Inorder traversal visits left subtree, root, then right, yielding a sorted sequence.",
  },
  {
    id: "go-goroutine-channel",
    language: "go",
    topic: "Goroutines & Channels",
    difficulty: "intermediate",
    code: `func producer(ch chan<- int, n int) {
    for i := 0; i < n; i++ {
        ch <- i
    }
    close(ch)
}

func fanOut(in <-chan int, workers int) []<-chan int {
    outs := make([]<-chan int, workers)
    for i := range outs {
        out := make(chan int)
        outs[i] = out
        go func(dst chan<- int) {
            for v := range in {
                dst <- v * v
            }
            close(dst)
        }(out)
    }
    return outs
}`,
    explanation:
      "Demonstrates Go concurrency primitives. producer sends integers on a channel then closes it. fanOut fans one input channel out to multiple worker goroutines that each square the values. Closing the input automatically propagates termination via range loops.",
  },

  // TypeScript – intermediate
  {
    id: "ts-generic-result",
    language: "typescript",
    topic: "Result Type",
    difficulty: "intermediate",
    code: `type Ok<T>  = { ok: true;  value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E = Error> = Ok<T> | Err<E>;

function ok<T>(value: T): Ok<T>   { return { ok: true,  value }; }
function err<E>(error: E): Err<E> { return { ok: false, error }; }

async function parseJson<T>(raw: string): Promise<Result<T>> {
  try {
    return ok(JSON.parse(raw) as T);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}`,
    explanation:
      "A discriminated union Result type that makes errors explicit without exceptions. The ok and err constructors set the discriminant field. parseJson wraps JSON.parse so callers can pattern-match on result.ok instead of catching exceptions.",
  },

  // Rust – intermediate
  {
    id: "rs-enum-result",
    language: "rust",
    topic: "Enum & Pattern Matching",
    difficulty: "intermediate",
    code: `use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    Parse(ParseIntError),
    OutOfRange(i32),
}

impl From<ParseIntError> for AppError {
    fn from(e: ParseIntError) -> Self {
        AppError::Parse(e)
    }
}

fn parse_age(s: &str) -> Result<u8, AppError> {
    let n: i32 = s.trim().parse()?;
    if !(0..=150).contains(&n) {
        return Err(AppError::OutOfRange(n));
    }
    Ok(n as u8)
}`,
    explanation:
      "A custom error enum with two variants and a From impl that enables the ? operator to auto-convert ParseIntError. parse_age parses a string, validates the range, and returns a typed Result — no exceptions, only explicit error paths.",
  },
  {
    id: "rs-trait-impl",
    language: "rust",
    topic: "Traits",
    difficulty: "intermediate",
    code: `use std::fmt;

trait Shape {
    fn area(&self) -> f64;
    fn perimeter(&self) -> f64;
    fn describe(&self) -> String {
        format!("area={:.2} perimeter={:.2}", self.area(), self.perimeter())
    }
}

struct Circle { radius: f64 }
struct Rectangle { width: f64; height: f64 }

impl Shape for Circle {
    fn area(&self)      -> f64 { std::f64::consts::PI * self.radius * self.radius }
    fn perimeter(&self) -> f64 { 2.0 * std::f64::consts::PI * self.radius }
}

impl Shape for Rectangle {
    fn area(&self)      -> f64 { self.width * self.height }
    fn perimeter(&self) -> f64 { 2.0 * (self.width + self.height) }
}`,
    explanation:
      "A Shape trait with a provided describe method that calls the required area and perimeter. Circle and Rectangle each implement the trait. Rust traits are similar to interfaces but allow default method bodies, enabling code reuse without inheritance.",
  },

  // C – intermediate
  {
    id: "c-linked-list",
    language: "c",
    topic: "Linked List",
    difficulty: "intermediate",
    code: `#include <stdlib.h>
#include <stdio.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node *node_new(int data) {
    Node *n = malloc(sizeof(Node));
    n->data = data;
    n->next = NULL;
    return n;
}

void list_push(Node **head, int data) {
    Node *n = node_new(data);
    n->next = *head;
    *head   = n;
}

void list_free(Node *head) {
    while (head) {
        Node *tmp = head->next;
        free(head);
        head = tmp;
    }
}`,
    explanation:
      "A singly linked list with prepend (O(1)) and full deallocation. list_push takes a pointer-to-pointer so it can update the caller's head variable. list_free saves the next pointer before freeing each node to avoid use-after-free.",
  },
  {
    id: "c-merge-sort",
    language: "c",
    topic: "Merge Sort",
    difficulty: "intermediate",
    code: `#include <stdlib.h>
#include <string.h>

static void merge(int *arr, int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int *L = malloc(n1 * sizeof(int));
    int *R = malloc(n2 * sizeof(int));
    memcpy(L, arr + l, n1 * sizeof(int));
    memcpy(R, arr + m + 1, n2 * sizeof(int));
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2)
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
    free(L); free(R);
}

void merge_sort(int *arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        merge_sort(arr, l, m);
        merge_sort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
    explanation:
      "In-place merge sort that allocates temporary left/right buffers with malloc. memcpy copies sub-arrays before the merge loop. Pointer arithmetic (arr + l) selects sub-array start positions. Always free temporary buffers to avoid memory leaks.",
  },

  // C++ – intermediate
  {
    id: "cpp-smart-pointers",
    language: "cpp",
    topic: "Smart Pointers",
    difficulty: "intermediate",
    code: `#include <memory>
#include <iostream>

struct Resource {
    int id;
    explicit Resource(int id) : id(id) {
        std::cout << "Resource " << id << " created\\n";
    }
    ~Resource() {
        std::cout << "Resource " << id << " destroyed\\n";
    }
};

void demo() {
    auto owner = std::make_unique<Resource>(1);
    std::shared_ptr<Resource> shared1 = std::make_shared<Resource>(2);
    std::shared_ptr<Resource> shared2 = shared1;
    std::cout << "use_count: " << shared1.use_count() << "\\n";
    std::weak_ptr<Resource> weak = shared2;
    if (auto locked = weak.lock()) {
        std::cout << "still alive: " << locked->id << "\\n";
    }
}`,
    explanation:
      "Showcases unique_ptr (exclusive ownership), shared_ptr (reference-counted shared ownership), and weak_ptr (non-owning observer). make_unique and make_shared are preferred over raw new. weak_ptr::lock returns a shared_ptr or nullptr if the object was destroyed.",
  },
  {
    id: "cpp-template-stack",
    language: "cpp",
    topic: "Template Stack",
    difficulty: "intermediate",
    code: `#include <vector>
#include <stdexcept>

template<typename T>
class Stack {
    std::vector<T> data_;
public:
    void push(T value) { data_.push_back(std::move(value)); }

    T pop() {
        if (empty()) throw std::underflow_error("stack is empty");
        T top = std::move(data_.back());
        data_.pop_back();
        return top;
    }

    const T& top() const {
        if (empty()) throw std::underflow_error("stack is empty");
        return data_.back();
    }

    bool empty() const { return data_.empty(); }
    size_t size() const { return data_.size(); }
};`,
    explanation:
      "A generic Stack built on std::vector. std::move transfers ownership of the value into the vector and out of pop(), avoiding unnecessary copies. pop returns by value after moving from the back element. Exceptions signal underflow instead of returning sentinel values.",
  },
  {
    id: "cpp-lambda-functional",
    language: "cpp",
    topic: "Lambdas & Functional",
    difficulty: "intermediate",
    code: `#include <algorithm>
#include <functional>
#include <vector>

template<typename T, typename F>
std::vector<T> filter(const std::vector<T>& v, F pred) {
    std::vector<T> out;
    std::copy_if(v.begin(), v.end(), std::back_inserter(out), pred);
    return out;
}

template<typename T, typename U, typename F>
std::vector<U> map(const std::vector<T>& v, F fn) {
    std::vector<U> out;
    out.reserve(v.size());
    std::transform(v.begin(), v.end(), std::back_inserter(out), fn);
    return out;
}

auto compose = [](auto f, auto g) {
    return [=](auto x) { return f(g(x)); };
};`,
    explanation:
      "Functional-style filter and map wrappers over STL algorithms. std::copy_if selects elements matching a predicate. std::transform applies a function to each element. compose returns a lambda that chains two functions, demonstrating higher-order functions in C++.",
  },

  // ── ADVANCED ──────────────────────────────────────────────────────────────

  // Python – advanced
  {
    id: "py-lru-cache",
    language: "python",
    topic: "LRU Cache",
    difficulty: "advanced",
    code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
    explanation:
      "An O(1) LRU cache backed by OrderedDict. get moves the accessed key to the end (most recently used). put does the same on update, then evicts the front entry (least recently used) when capacity is exceeded.",
  },
  {
    id: "py-descriptors",
    language: "python",
    topic: "Descriptors",
    difficulty: "advanced",
    code: `class Validator:
    def __set_name__(self, owner, name):
        self.name = name
        self.private = f"_{name}"

    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, self.private, None)

    def __set__(self, obj, value):
        if not isinstance(value, (int, float)) or value < 0:
            raise ValueError(f"{self.name} must be a non-negative number")
        setattr(obj, self.private, value)

class Product:
    price = Validator()
    quantity = Validator()

    def __init__(self, price, quantity):
        self.price = price
        self.quantity = quantity`,
    explanation:
      "__set_name__ is called at class creation time and injects the attribute name. The descriptor protocol (__get__/__set__) intercepts attribute access on instances, enabling reusable validation logic that lives outside the class body.",
  },
  {
    id: "py-sec-jwt-manual",
    language: "python",
    topic: "JWT Signing",
    difficulty: "advanced",
    code: `import base64
import hashlib
import hmac
import json
import time

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def create_jwt(payload: dict, secret: str) -> str:
    header  = b64url(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body    = b64url(json.dumps({**payload, "iat": int(time.time())}).encode())
    sig_input = f"{header}.{body}".encode()
    signature = b64url(hmac.new(secret.encode(), sig_input, hashlib.sha256).digest())
    return f"{header}.{body}.{signature}"

def verify_jwt(token: str, secret: str, max_age: int = 3600) -> dict:
    header, body, sig = token.split(".")
    expected = b64url(hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(expected, sig):
        raise ValueError("Invalid signature")
    claims = json.loads(base64.urlsafe_b64decode(body + "=="))
    if time.time() - claims["iat"] > max_age:
        raise ValueError("Token expired")
    return claims`,
    explanation:
      "A from-scratch HS256 JWT implementation showing the three-part structure: base64url(header).base64url(payload).base64url(HMAC-SHA256 signature). compare_digest prevents timing attacks on the signature comparison. In production, use PyJWT or python-jose instead.",
  },

  // TypeScript – advanced
  {
    id: "ts-deep-readonly",
    language: "typescript",
    topic: "Deep Readonly",
    difficulty: "advanced",
    code: `type DeepReadonly<T> =
  T extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

interface Config {
  server: { host: string; port: number };
  flags: string[];
}

const config: DeepReadonly<Config> = {
  server: { host: "localhost", port: 3000 },
  flags: ["feature-a"],
};`,
    explanation:
      "A recursive conditional type that freezes every level of a nested structure. Arrays become ReadonlyArray of deeply-frozen elements, objects get readonly on every key, and primitives pass through unchanged. The infer keyword extracts the element type of arrays.",
  },
  {
    id: "ts-decorator-factory",
    language: "typescript",
    topic: "Method Decorator",
    difficulty: "advanced",
    code: `function memoize(_target: object, _key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value as (...args: unknown[]) => unknown;
  const cache = new Map<string, unknown>();
  descriptor.value = function (...args: unknown[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };
  return descriptor;
}

class Math {
  @memoize
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}`,
    explanation:
      "A TypeScript method decorator that adds memoization by replacing the original method with a caching wrapper. Arguments are serialised to a JSON key, results stored in a Map closure. apply preserves the class instance as this.",
  },

  // C++ – advanced
  {
    id: "cpp-raii-file",
    language: "cpp",
    topic: "RAII File Handle",
    difficulty: "advanced",
    code: `#include <fstream>
#include <stdexcept>
#include <string>

class FileHandle {
    std::fstream file_;
public:
    explicit FileHandle(const std::string& path,
                        std::ios::openmode mode = std::ios::in | std::ios::out) {
        file_.open(path, mode);
        if (!file_.is_open())
            throw std::runtime_error("Cannot open: " + path);
    }

    ~FileHandle() { if (file_.is_open()) file_.close(); }

    FileHandle(const FileHandle&)            = delete;
    FileHandle& operator=(const FileHandle&) = delete;

    std::string read_all() {
        return {std::istreambuf_iterator<char>(file_),
                std::istreambuf_iterator<char>()};
    }
};`,
    explanation:
      "RAII file wrapper that opens in the constructor and closes in the destructor, guaranteeing cleanup even on exceptions. Copy constructor and copy assignment are explicitly deleted to prevent double-close bugs. read_all uses istreambuf_iterator for efficient whole-file reads.",
  },
];

export function getSnippetsByLanguage(language: string): Snippet[] {
  return SNIPPETS.filter((s) => s.language === language);
}

export function getSnippetById(id: string): Snippet | undefined {
  return SNIPPETS.find((s) => s.id === id);
}

export function getLanguageCounts(): Record<string, number> {
  return SNIPPETS.reduce((acc, s) => {
    acc[s.language] = (acc[s.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
