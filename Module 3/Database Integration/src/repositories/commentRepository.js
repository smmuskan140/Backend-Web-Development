const prisma = require('../db/prisma');
const { translateDatabaseError } = require('../utils/databaseErrors');

async function findAll() { return prisma.comment.findMany({ orderBy: { id: 'asc' } }); }
async function findById(id) { return prisma.comment.findUnique({ where: { id: Number(id) } }); }
async function create(fields) {
  try {
    return await prisma.comment.create({ data: {
      body: fields.body, userId: Number(fields.userId), postId: Number(fields.postId),
    } });
  } catch (error) { throw translateDatabaseError(error); }
}
async function update(id, patch) {
  const numericId = Number(id);
  if (!(await findById(numericId))) return null;
  try {
    return await prisma.comment.update({ where: { id: numericId }, data: {
      ...(patch.body !== undefined ? { body: patch.body } : {}),
      ...(patch.userId !== undefined ? { userId: Number(patch.userId) } : {}),
      ...(patch.postId !== undefined ? { postId: Number(patch.postId) } : {}),
    } });
  } catch (error) {
    if (error && error.code === 'P2025') return null;
    throw translateDatabaseError(error);
  }
}
async function remove(id) {
  try { await prisma.comment.delete({ where: { id: Number(id) } }); return true; }
  catch (error) { if (error && error.code === 'P2025') return false; throw translateDatabaseError(error); }
}
module.exports = { findAll, findById, create, update, remove };
