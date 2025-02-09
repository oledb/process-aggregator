type ValidState = { valid: 'true' };
type InvalidState = { valid: 'false'; errorMessage?: string };

export type ValidationState = ValidState | InvalidState;
