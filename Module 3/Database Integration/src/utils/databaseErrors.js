class DatabaseError extends Error {
  constructor(code, status, message) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.status = status;
  }
}

// Translate known Prisma errors into safe application-level errors.
// Never return error.message from Prisma to an API client.
function translateDatabaseError(error) {
  if (!error || typeof error !== 'object') return new DatabaseError('DATABASE_ERROR', 500, 'Database operation failed');

  if (error.code === 'P2002') {
    return new DatabaseError('DUPLICATE_RESOURCE', 409, 'A record with these unique values already exists');
  }
  if (error.code === 'P2003') {
    return new DatabaseError('INVALID_RELATION', 400, 'A referenced record does not exist or cannot be removed');
  }
  if (error.code === 'P2025') {
    return new DatabaseError('NOT_FOUND', 404, 'The requested record was not found');
  }
  if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1017') {
    return new DatabaseError('DATABASE_UNAVAILABLE', 503, 'The database is temporarily unavailable');
  }
  return new DatabaseError('DATABASE_ERROR', 500, 'Database operation failed');
}

module.exports = { DatabaseError, translateDatabaseError };
