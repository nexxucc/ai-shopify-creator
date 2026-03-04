import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import './CreateStoreForm.css';

export default function CreateStoreForm({ onSubmit, disabled }) {
  const [form, setForm] = useState({
    niche: '',
    targetAudience: '',
    budgetTier: 'mid',
    productCount: 5,
    uniqueSellingPoint: '',
    contactEmail: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'productCount' ? parseInt(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="create-card fade-in">
      <div className="create-card-gradient" />
      <div className="create-card-header">
        <div>
          <h2><Sparkles size={20} /> Create a New AI Store</h2>
          <p>Enter your business niche and let AI build your complete Shopify store — products, collections, pages, and SEO content.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="niche">Business Niche *</label>
          <input
            id="niche"
            name="niche"
            type="text"
            placeholder="e.g., eco-friendly yoga accessories"
            value={form.niche}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetAudience">Target Audience *</label>
          <input
            id="targetAudience"
            name="targetAudience"
            type="text"
            placeholder="e.g., Women 25-45 into wellness"
            value={form.targetAudience}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <div className="form-group">
          <label htmlFor="budgetTier">Budget Tier</label>
          <select id="budgetTier" name="budgetTier" value={form.budgetTier} onChange={handleChange} disabled={disabled}>
            <option value="budget">💰 Budget ($10–50)</option>
            <option value="mid">💎 Mid-Range ($30–150)</option>
            <option value="premium">👑 Premium ($80–400)</option>
            <option value="luxury">✨ Luxury ($200+)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="productCount">Product Count</label>
          <select id="productCount" name="productCount" value={form.productCount} onChange={handleChange} disabled={disabled}>
            <option value={3}>3 Products</option>
            <option value={5}>5 Products</option>
            <option value={8}>8 Products</option>
            <option value={10}>10 Products</option>
          </select>
        </div>

        <div className="form-group full">
          <label htmlFor="uniqueSellingPoint">Unique Selling Point *</label>
          <textarea
            id="uniqueSellingPoint"
            name="uniqueSellingPoint"
            placeholder="What makes your store unique? This helps AI create tailored content..."
            value={form.uniqueSellingPoint}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Contact Email *</label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="you@example.com"
            value={form.contactEmail}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <div className="form-group" style={{ alignSelf: 'end' }}>
          <button type="submit" className={`btn-create ${disabled ? 'loading' : ''}`} disabled={disabled}>
            {disabled ? (
              <>
                <Loader2 size={18} className="spinner-icon" />
                <span>Creating Store...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Create Store with AI</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
