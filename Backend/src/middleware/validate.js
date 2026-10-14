import { HttpError } from '../utils/httpError.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new HttpError(400, result.error.errors.map((error) => error.message).join(', ')));
    }
    req[source] = result.data;
    next();
  };
}
