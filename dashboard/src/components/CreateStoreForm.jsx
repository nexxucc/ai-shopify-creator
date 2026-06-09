import { useState } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import './CreateStoreForm.css';

const INITIAL_FORM = {
  niche: '',
  targetAudience: '',
  budgetTier: 'mid',
  productCount: 3,
  uniqueSellingPoint: '',
  contactEmail: '',
};

export default function CreateStoreForm({ onSubmit, disabled }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'productCount' ? Number.parseInt(value, 10) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <section className="create-card fade-in" aria-labelledby="create-store-heading">
      <div className="create-card-glow" />
      <div className="create-card-header">
        <div className="create-title-block">
          <div className="section-icon" aria-hidden="true">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="section-kicker">New generation</p>
            <h2 id="create-store-heading">Create a storefront brief</h2>
            <p>Keep the prompt narrow while rate limits are active. Three products is the safest test setting.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label htmlFor="niche">Business niche</label>
          <input
            id="niche"
            name="niche"
            type="text"
            placeholder="fitness accessories"
            value={form.niche}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetAudience">Target audience</label>
          <input
            id="targetAudience"
            name="targetAudience"
            type="text"
            placeholder="college students who train at home"
            value={form.targetAudience}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <div className="form-group">
          <label htmlFor="budgetTier">Budget tier</label>
          <select id="budgetTier" name="budgetTier" value={form.budgetTier} onChange={handleChange} disabled={disabled}>
            <option value="budget">Budget ($10-50)</option>
            <option value="mid">Mid-range ($30-150)</option>
            <option value="premium">Premium ($80-400)</option>
            <option value="luxury">Luxury ($200+)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="productCount">Product count</label>
          <select id="productCount" name="productCount" value={form.productCount} onChange={handleChange} disabled={disabled}>
            <option value={3}>3 products</option>
            <option value={5}>5 products</option>
            <option value={8}>8 products</option>
            <option value={10}>10 products</option>
          </select>
        </div>

        <div className="form-group full">
          <label htmlFor="uniqueSellingPoint">Unique selling point</label>
          <textarea
            id="uniqueSellingPoint"
            name="uniqueSellingPoint"
            placeholder="Compact affordable gear for small rooms, hostel spaces, and quick daily routines."
            value={form.uniqueSellingPoint}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Contact email</label>
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

        <div className="form-submit">
          <button type="submit" className="btn-create" disabled={disabled}>
            {disabled ? (
              <>
                <Loader2 size={18} className="spinner-icon" />
                <span>Creating store</span>
              </>
            ) : (
              <>
                <span>Create store</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <p>Submits one production n8n run. Avoid repeated retries while provider rate limits are active.</p>
        </div>
      </form>
    </section>
  );
}
