const prisma = require('../db/prisma');
const { translateDatabaseError } = require('../utils/databaseErrors');

async function findAll() {
  return prisma.post.findMany({ orderBy: { id: 'asc' } });
}

async function findById(id) {
  return prisma.post.findUnique({ where: { id: Number(id) } });
}

async function create(fields) {
  try {
    return await prisma.post.create({
      data: {
        title: fields.title,
        body: fields.body ?? '',
        authorId: Number(fields.authorId),
      },
    });
  } catch (error) {
    throw translateDatabaseError(error);
  }
}

async function update(id, patch) {
  const numericId = Number(id);
  if (!(await findById(numericId))) return null;

  try {
    return await prisma.post.update({
      where: { id: numericId },
      data: {
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.body !== undefined ? { body: patch.body } : {}),
        ...(patch.authorId !== undefined ? { authorId: Number(patch.authorId) } : {}),
      },
    });
  } catch (error) {
    if (error && error.code === 'P2025') return null;
    throw translateDatabaseError(error);
  }
}

async function remove(id) {
  const numericId = Number(id);
  try {
    await prisma.post.delete({ where: { id: numericId } });
    return true;
  } catch (error) {
    if (error && error.code === 'P2025') return false;
    throw translateDatabaseError(error);
  }
}

module.exports = { findAll, findById, create, update, remove };
