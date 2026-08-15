import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getLogs = async (req, res) => {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Last 100 logs
    });
    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createLog = async (req, res) => {
  try {
    const { action, targetId, details } = req.body;
    const adminId = req.user?.id;

    const log = await prisma.log.create({
      data: {
        adminId,
        action,
        targetId,
        details: details || {}
      }
    });
    res.status(201).json(log);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ error: error.message });
  }
};