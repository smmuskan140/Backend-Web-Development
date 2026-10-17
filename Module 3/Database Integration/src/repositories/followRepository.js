const prisma = require('../db/prisma');
const { translateDatabaseError } = require('../utils/databaseErrors');

async function findAll() {
  return prisma.follow.findMany({ orderBy: [{ followerId: 'asc' }, { followingId: 'asc' }] });
}
async function findById(id) {
  if (!id || id.followerId === undefined || id.followingId === undefined) return null;
  return prisma.follow.findUnique({ where: { followerId_followingId: {
    followerId: Number(id.followerId), followingId: Number(id.followingId),
  } } });
}
async function create(fields) {
  try {
    return await prisma.follow.create({ data: {
      followerId: Number(fields.followerId), followingId: Number(fields.followingId),
    } });
  } catch (error) { throw translateDatabaseError(error); }
}
async function update(id, patch) {
  const where = { followerId_followingId: {
    followerId: Number(id.followerId), followingId: Number(id.followingId),
  } };
  if (!(await prisma.follow.findUnique({ where }))) return null;
  // Composite-key changes are represented as delete + create to preserve the contract.
  const data = { followerId: Number(patch.followerId ?? id.followerId), followingId: Number(patch.followingId ?? id.followingId) };
  try {
    if (data.followerId === Number(id.followerId) && data.followingId === Number(id.followingId)) {
      return prisma.follow.findUnique({ where });
    }
    return await prisma.$transaction(async (tx) => {
      await tx.follow.delete({ where });
      return tx.follow.create({ data });
    });
  } catch (error) { throw translateDatabaseError(error); }
}
async function remove(id) {
  try {
    await prisma.follow.delete({ where: { followerId_followingId: {
      followerId: Number(id.followerId), followingId: Number(id.followingId),
    } } });
    return true;
  } catch (error) { if (error && error.code === 'P2025') return false; throw translateDatabaseError(error); }
}
module.exports = { findAll, findById, create, update, remove };
