import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

// Generic Zod validation middleware factory.
// Why Zod? It gives you TypeScript-inferred types from your schemas —
// so the schema IS the type definition. No duplication.
// Usage: router.post('/', validate(createLeadSchema), createLead)
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // .parse() throws ZodError if validation fails
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Flatten Zod's nested error format into simple field: message pairs
        const errors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};
