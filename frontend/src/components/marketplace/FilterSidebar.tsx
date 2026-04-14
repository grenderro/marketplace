import React, { useState, useEffect } from 'react';

interface FilterSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onFilterChange?: (filters: any) => void;
}

export default function FilterSidebar({
  isOpen: controlledIsOpen,
  onClose,
  onFilterChange
}: FilterSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedCollection('all');
    setSortBy('newest');
  };

  const hasFilters = minPrice || maxPrice || selectedCollection !== 'all';

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setInternalOpen(true)}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#0f172a',
            zIndex: 99,
            cursor: 'pointer'
          }}
        >
          ⚙️
        </button>

        {isOpen && (
          <>
            <div
              onClick={() => setInternalOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 200
              }}
            />
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '85vh',
              background: '#1e293b',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              zIndex: 201,
              padding: '24px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ color: '#fff', margin: 0 }}>Filters</h2>
                <button onClick={() => setInternalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem' }}>✕</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '8px' }}>Collection</label>
                  <select 
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <option value="all">All Collections</option>
                    <option value="nerds">NERDs</option>
                  </select>
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '8px' }}>Price Range (EGLD)</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    <span style={{ color: '#64748b', alignSelf: 'center' }}>to</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  </div>
                </div>

                <button onClick={() => setInternalOpen(false)} style={{ width: '100%', padding: '16px', background: '#00d4ff', border: 'none', borderRadius: '12px', color: '#0f172a', fontWeight: 'bold', marginTop: '20px' }}>
                  Show Results
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // DESKTOP VERSION - MIN OVER MAX
  return (
    <aside style={{
      width: '300px',
      background: 'rgba(30, 41, 59, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.1)',
      position: 'sticky',
      top: '100px',
      height: 'fit-content',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Filters</h2>
        {hasFilters && (
          <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '0.875rem', cursor: 'pointer' }}>
            Reset
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Collection */}
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Collection
          </label>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Collections</option>
            <option value="nerds">NERD-794a0d</option>
            <option value="citem">CITEM-bdf5f1</option>
          </select>
        </div>

        {/* Price Range - STACKED VERTICALLY */}
        <div style={{ border: '2px solid #00d4ff', padding: '12px', borderRadius: '8px' }}> {/* Blue border to confirm file updated */}
          <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Price Range (EGLD)
          </label>
          
          {/* Min Input - Full Width */}
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.9rem',
              marginBottom: '8px',
              boxSizing: 'border-box',
              display: 'block'
            }}
          />
          
          {/* Max Input - Full Width, Below Min */}
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
              display: 'block'
            }}
          />
        </div>

        {/* Sort By */}
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              color: '#f59e0b',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Clear All Filters
          </button>
        )}
      </div>
    </aside>
  );
}
