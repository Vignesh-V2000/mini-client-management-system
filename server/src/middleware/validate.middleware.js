export function validate(source, schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request[source]);
    if (!result.success) {
      const errors = Object.fromEntries(
        result.error.issues.map((issue) => [issue.path.join('.') || source, issue.message]),
      );
      return response.status(400).json({ message: 'Validation failed', errors });
    }

    response.locals[source] = result.data;
    next();
  };
}
