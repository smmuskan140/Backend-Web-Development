const prisma = require('../db/prisma');
const { translateDatabaseError } = require('../utils/databaseErrors');

async function findAll() { return prisma.tag.findMany({ orderBy: { id: 'asc' } }); }
async function findById(id) { return prisma.tag.findUnique({ where: { id: Number(id) } }); }
async function create(fields) {
  try { return await prisma.tag.create({ data: { name: fields.name } }); }
  catch (error) { throw translateDatabaseError(error); }
}
async function update(id, patch) {
  const numericId = Number(id);
  if (!(await findById(numericId))) return null;
  try { return await prisma.tag.update({ where: { id: numericId }, data: { name: patch.name } }); }
  catch (error) { if (error && error.code === 'P2025') return null; throw translateDatabaseError(error); }
}
async function remove(id) {
  try { await prisma.tag.delete({ where: { id: Number(id) } }); return true; }
  catch (error) { if (error && error.code === 'P2025') return false; throw translateDatabaseError(error); }
}
module.exports = { findAll, findById, create, update, remove };
