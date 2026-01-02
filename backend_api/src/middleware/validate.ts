import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

// PUBLIC_INTERFACE
export function validate(schema: ZodSchema): RequestHandler {
  /**
   * Validates req.body/req.query/req.params based on a Zod schema.
   * The schema should be shaped as: { body?: ..., query?: ..., params?: ... }.
   */
  return (req, _res, next) => {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  };
}
