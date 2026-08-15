import prisma from '../config/prisma.js';

export const getProducts = async (req, res) => {
  const { search, category, sort, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const where = {
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
    ...(category && { categoryId: category }) 
  };

  let orderBy = { createdAt: 'desc' }; 
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: parseInt(skip),
      take: parseInt(limit),
    }),
    prisma.product.count({ where })
  ]);

  // ✅ Cloudinary images are already full URLs — no path splitting needed
  const cleanedProducts = products.map((product) => ({
    ...product,
    image: product.image || null
  }));

  res.json({ 
    products: cleanedProducts, 
    total, 
    page: Number(page), 
    totalPages: Math.ceil(total / limit) 
  });
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: { category: true }
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Return image as-is (Cloudinary URL)
    const cleanedProduct = {
      ...product,
      image: product.image || null
    };

    res.status(200).json(cleanedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, stock } = req.body;

    if (process.env.NODE_ENV !== 'test' && !req.file) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    // ✅ Cloudinary returns the full URL in req.file.path
    const imageUrl = req.file ? req.file.path : 'test-image.jpg';

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        image: imageUrl
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create product." });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, categoryId } = req.body;

  try {
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ✅ Use req.file.path for Cloudinary URL
    const imageUrl = req.file ? req.file.path : existingProduct.image;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        description: description || existingProduct.description,
        price: price ? parseFloat(price) : existingProduct.price,
        stock: stock ? parseInt(stock) : existingProduct.stock,
        categoryId: categoryId || existingProduct.categoryId,
        image: imageUrl,
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id: id },
    });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};