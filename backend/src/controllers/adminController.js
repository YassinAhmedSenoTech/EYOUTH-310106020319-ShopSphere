import prisma from '../config/prisma.js';
import Log from '../models/Log.js';

const addLog = async (adminId, action, targetId, details) => {
  try {
    await Log.create({ adminId: adminId || 'System', action, targetId, details });
  } catch (err) {
    console.error("Logging failed:", err);
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, revenueData] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } })
    ]);
    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: revenueData._sum.totalPrice || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const getCategories = async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
};

export const createCategory = async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({ data: { name } });
  await addLog(req.user?.id, 'Created Category', category.id, { name });
  res.status(201).json(category);
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await prisma.category.update({ where: { id }, data: { name } });
  await addLog(req.user?.id, 'Updated Category', category.id, { name });
  res.json(category);
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id } });
  await addLog(req.user?.id, 'Deleted Category', id, {});
  res.json({ message: "Category deleted" });
};

export const getProducts = async (req, res) => {
  const products = await prisma.product.findMany({ include: { category: true } });
  res.json(products);
};

export const createProduct = async (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;
const imagePath = req.file ? req.file.path : null;
  const product = await prisma.product.create({ 
    data: { name, description, price: parseFloat(price), stock: parseInt(stock), categoryId, image: imagePath } 
  });
  await addLog(req.user?.id, 'Created Product', product.id, { name });
  res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, categoryId } = req.body;
  const updateData = { name, description, price: parseFloat(price), stock: parseInt(stock), categoryId };
if (req.file) updateData.image = req.file.path;

  const product = await prisma.product.update({ where: { id }, data: updateData });
  await addLog(req.user?.id, 'Updated Product', product.id, { name });
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  await addLog(req.user?.id, 'Deleted Product', id, {});
  res.json({ message: "Product deleted" });
};

export const getAllOrders = async (req, res) => {
  const orders = await prisma.order.findMany({ include: { user: true } });
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { isDelivered } = req.body;
  const updatedOrder = await prisma.order.update({ where: { id }, data: { isDelivered } });
  await addLog(req.user?.id, 'Updated Order Status', updatedOrder.id, { isDelivered });
  res.json(updatedOrder);
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  await prisma.order.delete({ where: { id } });
  await addLog(req.user?.id, 'Deleted Order', id, {});
  res.json({ message: "Order deleted" });
};

export const getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs" });
  }
};

export const clearLogs = async (req, res) => {
  try {
    await Log.deleteMany({}); 
    res.json({ message: "All logs cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear logs" });
  }
};