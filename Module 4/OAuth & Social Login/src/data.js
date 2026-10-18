// In-memory users for the OAuth assignment.
const users = [
  { id: 'u-bob', googleId: 'google-bob-123', email: 'bob@example.com', name: 'Bob', role: 'moderator' },
  { id: 'u-alice', email: 'alice@example.com', name: 'Alice', role: 'member' },
  { id: 'u-admin', email: 'admin@example.com', name: 'Admin', role: 'admin' },
];

let idCounter = 4;
function nextId() {
  return `u-${idCounter++}`;
}

module.exports = { users, nextId };
