const prisma = require('../db/prisma');
const { translateDatabaseError } = require('../utils/databaseErrors');

async function findAll() { return prisma.vote.findMany({ orderBy: { id: 'asc' } }); }
async function findById(id) { return prisma.vote.findUnique({ where: { id: Number(id) } }); }
async function create(fields) {
  try {
    return await prisma.vote.create({ data: { userId: Number(fields.userId), postId: Number(fields.postId) } });
  } catch (error) { throw translateDatabaseError(error); }
}
async function update(id, patch) {
  const numericId = Number(id);
  if (!(await findById(numericId))) return null;
  try {
    return await prisma.vote.update({ where: { id: numericId }, data: {
      ...(patch.userId !== undefined ? { userId: Number(patch.userId) } : {}),
      ...(patch.postId !== undefined ? { postId: Number(patch.postId) } : {}),
    } });
  } catch (error) {
    if (error && error.code === 'P2025') return null;
    throw translateDatabaseError(error);
  }
}
async function remove(id) {
  try { await prisma.vote.delete({ where: { id: Number(id) } }); return true; }
  catch (error) { if (error && error.code === 'P2025') return false; throw translateDatabaseError(error); }
}
async function findByUserAndPost(userId, postId) {
  return prisma.vote.findUnique({ where: { userId_postId: { userId: Number(userId), postId: Number(postId) } } });
}
module.exports = { findAll, findById, create, update, remove, findByUserAndPost };
