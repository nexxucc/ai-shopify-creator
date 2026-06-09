import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import './CreateStoreForm.css';

const INITIAL_FORM = {
  niche: '',
  targetAudience: '',
  budgetTier: 'budget',
  productCount: 3,
  uniqueSellingPoint: '',
  contactEmail: '',
};

export default function CreateStoreForm({ onSubmit, disabled }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'productCount' ? Number.parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <section className="configuration-panel fade-in" aria-labelledby="create-store-heading">
      <div className="section-heading">
        <div>
          <h2 id="create-store-heading">New Store Configuration</h2>
          <span className="heading-line" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="creator-form">
        <div className="field-row">
          <div className="field-group">
            <label htmlFor="niche">Target niche</label>
            <input
              id="niche"
              name="niche"
              type="text"
              placeholder="e.g. Minimalist Tech Accessories"
              value={form.niche}
              onChange={handleChange}
              required
              disabled={disabled}
            />
          </div>

          <div className="field-group">
            <label htmlFor="targetAudience">Primary audience</label>
            <input
              id="targetAudience"
              name="targetAudience"
              type="text"
              placeholder="e.g. Urban Professionals, 25–40"
              value={form.targetAudience}
              onChange={handleChange}
              required
              disabled={disabled}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field-group select-group">
            <label htmlFor="budgetTier">Initial budget level</label>
            <select id="budgetTier" name="budgetTier" value={form.budgetTier} onChange={handleChange} disabled={disabled}>
              <option value="budget">Bootstrapped ($0 - $1k)</option>
              <option value="mid">Mid-range ($30 - $150)</option>
              <option value="premium">Premium ($80 - $400)</option>
              <option value="luxury">Luxury ($200+)</option>
            </select>
          </div>

          <div className="field-group select-group">
            <label htmlFor="productCount">Est. product count</label>
            <select id="productCount" name="productCount" value={form.productCount} onChange={handleChange} disabled={disabled}>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
          </div>
        </div>

        <div className="field-group full">
          <label htmlFor="uniqueSellingPoint">Unique selling proposition (USP)</label>
          <textarea
            id="uniqueSellingPoint"
            name="uniqueSellingPoint"
            placeholder="Describe what makes this store uniquely valuable..."
            value={form.uniqueSellingPoint}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <div className="field-group full slim">
          <label htmlFor="contactEmail">Notification email</label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="admin@creator.io"
            value={form.contactEmail}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </div>

        <button type="submit" className="generate-button" disabled={disabled}>
          {disabled ? (
            <>
              <Loader2 size={18} className="spinner-icon" />
              <span>Generating store</span>
            </>
          ) : (
            <>
              <span>Generate store</span>
              <ArrowRight size={19} />
            </>
          )}
        </button>
      </form>
    </section>
  );
}
