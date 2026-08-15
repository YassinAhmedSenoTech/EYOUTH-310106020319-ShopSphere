import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import api from '../api/axiosConfig'; 
import '../style/products.css'; 

const Products = () => {

const getImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http')) return image; // Cloudinary URL — use directly
  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
  return `${baseUrl}${image}`; // Old local path — prepend API
};


  const [params, setParams] = useState({ search: '', category: '', sort: 'createdAt_desc', page: 1 });
  const [searchInput, setSearchInput] = useState(''); 
  const [categories, setCategories] = useState([]); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories'); 
        setCategories(data);
      } catch (err) { console.error("Error fetching categories:", err); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setParams(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 500); 
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading } = useProducts(params);
  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  const clearFilters = () => {
    setParams({ search: '', category: '', sort: 'createdAt_desc', page: 1 });
    setSearchInput('');
  };

  if (isLoading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading products...</div>;

  return (
    <div className="products-container">
      {}
      <div className="filter-bar">
        <input 
          type="text" 
          value={searchInput} 
          placeholder="Search products..." 
          onChange={(e) => setSearchInput(e.target.value)} 
        />
        
        <select value={params.category} onChange={(e) => setParams({ ...params, category: e.target.value, page: 1 })}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>

        <select value={params.sort} onChange={(e) => setParams({ ...params, sort: e.target.value })}>
          <option value="createdAt_desc">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        <button onClick={clearFilters}>Clear All</button>
      </div>

      {}
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            {product.image && (
    <img 
  src={getImageUrl(product.image)} 
  alt={product.name} 
  className="product-image"
/>
            )}
            <h3>{product.name}</h3>
            <p style={{fontWeight: 'bold', color: '#333'}}>${product.price}</p>
            <Link to={`/products/${product.id}`}>
              <button className="view-btn">View Details</button>
            </Link>
          </div>
        ))}
      </div>

      {}
      <div className="pagination">
        <button disabled={params.page === 1} onClick={() => setParams({ ...params, page: params.page - 1 })}>Prev</button>
        <span>Page {params.page} of {totalPages}</span>
        <button disabled={params.page >= totalPages} onClick={() => setParams({ ...params, page: params.page + 1 })}>Next</button>
      </div>
    </div>
  );
};

export default Products;