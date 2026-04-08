// Maps each key to a finger (0=left pinky, 1=left ring, 2=left middle, 3=left index,
// 4=left thumb/space, 5=right thumb/space, 6=right index, 7=right middle, 8=right ring, 9=right pinky)

export type FingerIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const FINGER_MAP: Record<string, FingerIndex> = {
  // Number row
  "`": 0, "1": 0, "2": 1, "3": 2, "4": 3, "5": 3,
  "6": 6, "7": 6, "8": 7, "9": 8, "0": 9, "-": 9, "=": 9,
  // Top row
  "q": 0, "w": 1, "e": 2, "r": 3, "t": 3,
  "y": 6, "u": 6, "i": 7, "o": 8, "p": 9, "[": 9, "]": 9, "\\": 9,
  // Home row
  "a": 0, "s": 1, "d": 2, "f": 3, "g": 3,
  "h": 6, "j": 6, "k": 7, "l": 8, ";": 9, "'": 9,
  // Bottom row
  "z": 0, "x": 1, "c": 2, "v": 3, "b": 3,
  "n": 6, "m": 6, ",": 7, ".": 8, "/": 9,
  // Special
  "tab": 0, "caps": 0, "shift": 0, "backspace": 9, "enter": 9,
  " ": 4, // space — either thumb
};

export const FINGER_NAMES = ["Pinky", "Ring", "Middle", "Index", "Thumb"];
export const FINGER_COLORS = [
  "#5a6a9e", // pinky
  "#5a8a9e", // ring
  "#5a9e8a", // middle
  "#c96a2a", // index
  "#3a3a36", // thumb
];

export function getFingerForKey(key: string): FingerIndex | null {
  const normalized = key.toLowerCase();
  if (normalized in FINGER_MAP) return FINGER_MAP[normalized];
  return null;
}

// Which hand (0 = left, 1 = right)
export function getHandForFinger(finger: FingerIndex): 0 | 1 {
  return finger <= 4 ? 0 : 1;
}
