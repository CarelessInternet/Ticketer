import type { ZodError } from 'zod';

export const zodErrorToString = (error: ZodError) => error.issues.map((error) => error.message).join('\n');
