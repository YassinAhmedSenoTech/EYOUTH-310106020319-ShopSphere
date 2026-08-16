import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    const [productCount, orderCount, userCount, revenue] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } })
    ]);

    res.status(200).json({
      report: 'ShopSphere Daily Summary',
      products: productCount,
      orders: orderCount,
      users: userCount,
      totalRevenue: revenue._sum.totalPrice || 0,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
}
