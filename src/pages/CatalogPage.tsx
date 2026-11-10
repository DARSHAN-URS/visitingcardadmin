import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Zap,
  Droplets,
  Hammer,
  Wrench,
  Paintbrush,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  FolderTree,
} from 'lucide-react';
import { CategoryItem } from '../types';
import { Modal } from '../components/Modal';

interface CatalogPageProps {
  categories: CategoryItem[];
  onCreateCategory: (cat: Omit<CategoryItem, 'id' | 'subcategories_count' | 'services_count'>) => Promise<void>;
  onToggleStatus: (id: string) => Promise<void>;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  categories,
  onCreateCategory,
  onToggleStatus,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Zap');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap size={22} color="var(--brand-primary)" />;
      case 'Droplets':
        return <Droplets size={22} color="#3B82F6" />;
      case 'Hammer':
        return <Hammer size={22} color="#F59E0B" />;
      case 'Wrench':
        return <Wrench size={22} color="#10B981" />;
      case 'Paintbrush':
        return <Paintbrush size={22} color="#EC4899" />;
      default:
        return <Sparkles size={22} color="#A855F7" />;
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateCategory({
        name,
        slug: slug || name.toLowerCase(),
        description,
        icon,
        image_url: imageUrl.trim(),
        is_active: true,
      });
      setIsAddModalOpen(false);
      setName('');
      setSlug('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="catalog-page">
      <div className="content-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <h3>Service Marketplace Catalog</h3>
            <p>Define trade categories, standard service pricing, and active customer booking domains</p>
          </div>

          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                backgroundColor: 'var(--bg-dark-700)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ height: 120, position: 'relative', backgroundColor: 'var(--bg-dark-800)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getCategoryIcon(cat.icon)
                )}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(14, 18, 27, 0.85)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: cat.is_active ? 'var(--status-verified)' : 'var(--text-muted)',
                  }}
                >
                  {cat.is_active ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>

              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: 'var(--bg-dark-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{cat.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      slug: /{cat.slug}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {cat.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                    paddingTop: 12,
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)' }}>
                    <span>
                      <strong style={{ color: 'var(--text-primary)' }}>{cat.subcategories_count}</strong> subcategories
                    </span>
                    <span>
                      <strong style={{ color: 'var(--brand-primary)' }}>{cat.services_count}</strong> services
                    </span>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onToggleStatus(cat.id)}
                    style={{ gap: 4 }}
                  >
                    {cat.is_active ? (
                      <>
                        <ToggleRight size={16} color="var(--status-verified)" /> Deactivate
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} /> Activate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Service Category"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Solar Panel Installation"
              style={{
                width: '100%',
                marginTop: 6,
                backgroundColor: 'var(--bg-dark-700)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="solar-panel-installation"
              style={{
                width: '100%',
                marginTop: 6,
                backgroundColor: 'var(--bg-dark-700)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Icon Type
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                backgroundColor: 'var(--bg-dark-700)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="Zap">Zap (Electrical / Power)</option>
              <option value="Droplets">Droplets (Plumbing / Liquid)</option>
              <option value="Hammer">Hammer (Woodwork / Construction)</option>
              <option value="Wrench">Wrench (Appliances / Mechanical)</option>
              <option value="Paintbrush">Paintbrush (Decor / Wall paint)</option>
              <option value="Sparkles">Sparkles (Cleaning / Polish)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of services included under this domain..."
              style={{
                width: '100%',
                marginTop: 6,
                backgroundColor: 'var(--bg-dark-700)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: 10,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
