const prisma = require('../db/prisma');
const { translateDatabaseError } = require('../utils/databaseErrors');

async function findAll() {
  return prisma.user.findMany({ orderBy: { id: 'asc' } });
}
async function findById(id) {
  return prisma.user.findUnique({ where: { id: Number(id) } });
}
async function create(fields) {
  try {
    return await prisma.user.create({ data: { name: fields.name, username: fields.username } });
  } catch (error) {
    throw translateDatabaseError(error);
  }
}
async function update(id, patch) {
  const numericId = Number(id);
  if (!(await findById(numericId))) return null;
  try {
    return await prisma.user.update({ where: { id: numericId }, data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.username !== undefined ? { username: patch.username } : {}),
    } });
  } catch (error) {
    if (error && error.code === 'P2025') return null;
    throw translateDatabaseError(error);
  }
}
async function remove(id) {
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return true;
  } catch (error) {
    if (error && error.code === 'P2025') return false;
    throw translateDatabaseError(error);
  }
}
async function findByUsername(username) {
  return prisma.user.findUnique({ where: { username } });
}
module.exports = { findAll, findById, create, update, remove, findByUsername };
