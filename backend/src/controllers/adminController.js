import prisma from '../config/prisma.js';
import Log from '../models/Log.js';

// Safe logging - won't crash if MongoDB is down
const addLog = async (adminId, action, targetId, details) => {
  try {
    if (Log && Log.create) {
      await Log.create({ adminId: adminId || 'System', action, targetId, details });
    }
  } catch (err) {
    console.warn("Logging skipped (MongoDB unavailable):", err.message);
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
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats", details: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name } });
    await addLog(req.user?.id, 'Created Category', category.id, { name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to create category" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await prisma.category.update({ where: { id }, data: { name } });
    await addLog(req.user?.id, 'Updated Category', category.id, { name });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    await addLog(req.user?.id, 'Deleted Category', id, {});
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({ include: { category: true } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const imagePath = req.file ? req.file.path : null;
    const product = await prisma.product.create({ 
      data: { 
        name, 
        description, 
        price: parseFloat(price), 
        stock: parseInt(stock), 
        categoryId, 
        image: imagePath 
      } 
    });
    await addLog(req.user?.id, 'Created Product', product.id, { name });
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;
    const updateData = { 
      name, 
      description, 
      price: parseFloat(price), 
      stock: parseInt(stock), 
      categoryId 
    };
    if (req.file) updateData.image = req.file.path;

    const product = await prisma.product.update({ where: { id }, data: updateData });
    await addLog(req.user?.id, 'Updated Product', product.id, { name });
    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Failed to update product", details: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    await addLog(req.user?.id, 'Deleted Product', id, {});
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({ include: { user: true } });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDelivered } = req.body;
    const updatedOrder = await prisma.order.update({ where: { id }, data: { isDelivered } });
    await addLog(req.user?.id, 'Updated Order Status', updatedOrder.id, { isDelivered });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({ where: { id } });
    await addLog(req.user?.id, 'Deleted Order', id, {});
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
  }
};

export const getLogs = async (req, res) => {
  try {
    // If MongoDB is not available, return empty array instead of crashing
    if (!Log || !Log.find) {
      return res.json([]);
    }
    const logs = await Log.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    console.warn("Logs fetch failed (MongoDB unavailable):", error.message);
    res.json([]); // Return empty instead of 500
  }
};

export const clearLogs = async (req, res) => {
  try {
    if (!Log || !Log.deleteMany) {
      return res.json({ message: "Logs cleared (MongoDB unavailable)" });
    }
    await Log.deleteMany({}); 
    res.json({ message: "All logs cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear logs" });
  }
};