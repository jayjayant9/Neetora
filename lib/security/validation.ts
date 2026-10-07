// Production Input Validation & Sanitization Engine

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

export function isStrongPassword(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, reason: "Password is required." };
  }
  if (password.length < 6) {
    return { valid: false, reason: "Password must be at least 6 characters long." };
  }
  return { valid: true };
}

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "") // Strip dangerous tags
    .trim();
}

export function validateAnswerPayload(answers: any): boolean {
  if (!answers || typeof answers !== "object") return false;
  // Verify key structure: keys should be numeric, values must conform to ExamAnswerRecord
  for (const key of Object.keys(answers)) {
    const num = Number(key);
    if (isNaN(num) || num < 0 || num > 300) return false;
    const rec = answers[key];
    if (rec && rec.selectedOption) {
      if (!["A", "B", "C", "D"].includes(rec.selectedOption)) {
        return false;
      }
    }
  }
  return true;
}
