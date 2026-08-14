import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useContext, useState, useEffect } from 'react'; 
import { CartContext } from '../context/CartContext'; 
import api from '../api/axiosConfig';
import '../style/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  
  const token = localStorage.getItem('token');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (e) { console.error("Error decoding token"); }
    }
  }, [token]);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(res => res.data)
  });

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
    } catch (err) { console.error("Error fetching reviews", err); }
  };

  useEffect(() => { if (id) fetchReviews(); }, [id]);

  const handleAddToCart = () => {
    if (!token) {
      alert("You must be logged in to add items to your cart.");
      navigate('/login'); 
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image 
    });
    alert("Added to cart!");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reviews/${id}`, { rating, comment });
      setComment("");
      fetchReviews(); 
    } catch (err) { alert("Failed to submit review"); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        fetchReviews();
      } catch (err) { alert("Failed to delete review"); }
    }
  };

  if (isLoading) return <div className="details-container">Loading product details...</div>;

  return (
    <div className="details-container">
      <div className="product-hero">
        {product.image && (
          <img 
src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${product.image}`}
            alt={product.name} 
            className="product-image-large"
          />
        )}
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-price">${product.price}</p>
          <p><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} left in stock` : 'Out of stock'}</p>
          <p><strong>Category:</strong> {product.category?.name || "Uncategorized"}</p>
          <p>{product.description}</p>
          <button onClick={handleAddToCart} className="add-to-cart-btn">
            Add to Cart
          </button>
        </div>
      </div>

      <div className="reviews-section">
        <h3>Customer Reviews</h3>
        <form onSubmit={handleReviewSubmit} className="review-form">
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
          </select>
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a review..." required />
          <button type="submit">Submit Review</button>
        </form>

        {reviews.map(rev => (
          <div key={rev._id} className="review-card">
            <p><strong>{rev.userName}</strong> ({rev.rating} stars)</p>
            <p>{rev.comment}</p>
            {rev.userId === currentUserId && (
              <button onClick={() => handleDeleteReview(rev._id)} className="delete-btn">
                Delete Review
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;