import type { ZodError } from 'zod/v4';

export const zodErrorToString = (error: ZodError) => error.issues.map((error) => error.message).join('\n');
