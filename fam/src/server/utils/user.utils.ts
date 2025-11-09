/**
 * Генерація простого унікального ID для користувача
 */
export function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15);
}
