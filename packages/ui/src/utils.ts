// ── ScanGo Shared Utilities ──

/**
 * Format a number as Indian Rupees (₹)
 */
export function formatINR(amount: number): string {
  return "₹" + Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Generate a receipt ID like SG-K9X2A1
 */
export function generateReceiptId(): string {
  return "SG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Validate an Indian phone number (10 digits starting with 6-9)
 */
export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/**
 * Mask a phone number for display: 9876XXXXXX → 9876XXXXXX
 */
export function maskPhone(phone: string): string {
  if (phone.length !== 10) return phone;
  return phone.slice(0, 4) + "XXXXXX";
}

/**
 * Calculate GST breakup (CGST + SGST, 50/50 split)
 */
export function calculateGST(amount: number, rate: number) {
  const total = amount * rate;
  return {
    cgst: total / 2,
    sgst: total / 2,
    total,
    rate: rate * 100,
  };
}

/**
 * Format a date for Indian locale
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Trigger haptic feedback if available
 */
export function vibrate(duration: number = 28): void {
  try {
    navigator?.vibrate?.(duration);
  } catch {
    // silently fail
  }
}
