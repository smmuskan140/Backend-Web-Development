const prisma = require('../db/prisma');
const { translateDatabaseError } = require('../utils/databaseErrors');

async function findAll() { return prisma.postTag.findMany({ orderBy: [{ postId: 'asc' }, { tagId: 'asc' }] }); }
async function findById(id) {
  if (!id || id.postId === undefined || id.tagId === undefined) return null;
  return prisma.postTag.findUnique({ where: { postId_tagId: { postId: Number(id.postId), tagId: Number(id.tagId) } } });
}
async function create(fields) {
  try { return await prisma.postTag.create({ data: { postId: Number(fields.postId), tagId: Number(fields.tagId) } }); }
  catch (error) { throw translateDatabaseError(error); }
}
async function update(id, patch) {
  const where = { postId_tagId: { postId: Number(id.postId), tagId: Number(id.tagId) } };
  if (!(await prisma.postTag.findUnique({ where }))) return null;
  const data = { postId: Number(patch.postId ?? id.postId), tagId: Number(patch.tagId ?? id.tagId) };
  try {
    if (data.postId === Number(id.postId) && data.tagId === Number(id.tagId)) return prisma.postTag.findUnique({ where });
    return await prisma.$transaction(async (tx) => {
      await tx.postTag.delete({ where });
      return tx.postTag.create({ data });
    });
  } catch (error) { throw translateDatabaseError(error); }
}
async function remove(id) {
  try { await prisma.postTag.delete({ where: { postId_tagId: { postId: Number(id.postId), tagId: Number(id.tagId) } } }); return true; }
  catch (error) { if (error && error.code === 'P2025') return false; throw translateDatabaseError(error); }
}
module.exports = { findAll, findById, create, update, remove };
