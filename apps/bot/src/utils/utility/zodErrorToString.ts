import type { ZodError } from 'zod';

export const zodErrorToString = (error: ZodError) => error.flatten().formErrors.join('\n');
