let lastAnswered: string | null = null;

export function setLastAnsweredQuestion(q: string | null) {
  try { lastAnswered = q ?? null; } catch (e) { lastAnswered = q ?? null; }
}

export function getLastAnsweredQuestion() {
  return lastAnswered;
}
