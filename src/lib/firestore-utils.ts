/**
 * Utility functions for Firestore REST API operations
 * Used by API routes that interact with Firestore via REST API
 */

export interface FirestoreDoc {
  name: string;
  fields: Record<string, any>;
  createTime?: string;
  updateTime?: string;
}

/**
 * Extracts the actual value from a Firestore REST API field representation
 * Firestore REST API wraps values in type-specific objects (e.g., { stringValue: "hello" })
 */
export function extractField(value: Record<string, any>): any {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return parseInt(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return new Date(value.timestampValue).getTime();
  if ("nullValue" in value) return null;
  return null;
}
