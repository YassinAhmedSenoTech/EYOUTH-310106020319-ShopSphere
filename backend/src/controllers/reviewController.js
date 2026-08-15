import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match frontend expectations (Mongoose-style _id and userName)
    const formatted = reviews.map(r => ({
      _id: r.id,
      userName: r.user?.name || 'Anonymous',
      userId: r.userId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a review
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params; // From URL: /reviews/:productId
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Get user name to return in response
    const user = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { name: true } 
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: parseInt(rating),
        comment
      }
    });

    res.status(201).json({
      _id: review.id,
      userName: user?.name || 'Anonymous',
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // Review ID

    // Optional: verify the review belongs to the current user
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    
    // Check ownership (optional but recommended)
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: error.message });
  }
};