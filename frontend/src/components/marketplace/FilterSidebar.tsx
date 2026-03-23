import React, { useState, useEffect } from 'react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
}

interface FilterState {
  categories: string[];
  priceRange: { min: number; max: number } | null;
  status: string[];
  chains: string[];
  sortBy: string;
}

const categories: FilterOption[] = [
  { id: 'art', label: 'Art', count: 1234 },
  { id: 'collectibles', label: 'Collectibles', count: 856 },
  { id: 'gaming', label: 'Gaming', count: 2341 },
  { id: 'music', label: 'Music', count: 567 },
  { id: 'photography', label: 'Photography', count: 432 },
  { id: 'sports', label: 'Sports', count: 789 },
  { id: 'utility', label: 'Utility', count: 321 },
];

const statuses = [
  { id: 'buy-now', label: 'Buy Now' },
  { id: 'auction', label: 'On Auction' },
  { id: 'new', label: 'New' },
  { id: 'has-offers', label: 'Has Offers' },
];

export default function FilterSidebar({ 
  isOpen: controlledIsOpen, 
  onClose, 
  onFilterChange 
}: FilterSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: null,
    status: [],
    chains: [],
    sortBy: 'recent'
  });

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setInternalOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleCategory = (id: string) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(id)
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id];
      const newFilters = { ...prev, categories: newCategories };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const toggleStatus = (id: string) => {
    setFilters(prev => {
      const newStatus = prev.status.includes(id)
        ? prev.status.filter(s => s !== id)
        : [...prev.status, id];
      const newFilters = { ...prev, status: newStatus };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    setFilters(prev => {
      const newFilters = { ...prev, priceRange: { min, max } };
      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: null,
      status: [],
      chains: [],
      sortBy: 'recent'
    });
    onFilterChange?.({
      categories: [],
      priceRange: null,
      status: [],
      chains: [],
      sortBy: 'recent'
    });
  };

  const hasActiveFilters = filters.categories.length > 0 || 
    filters.status.length > 0 || 
    filters.priceRange !== null;

  // Mobile Drawer Version
  if (isMobile) {
    return (
      <>
        {/* Mobile Filter Button */}
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
          {hasActiveFilters && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              background: '#f59e0b',
              borderRadius: '50%',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0f172a'
            }}>
              {filters.categories.length + filters.status.length}
            </span>
          )}
        </button>

        {/* Mobile Drawer */}
        {isOpen && (
          <>
            <div 
              onClick={() => {
                setInternalOpen(false);
                onClose?.();
              }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 200,
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '85vh',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              zIndex: 201,
              animation: 'slideUp 0.3s ease-out',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Handle */}
              <div style={{
                width: '40px',
                height: '4px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                margin: '12px auto',
                flexShrink: 0
              }} />

              {/* Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <h2 style={{ 
                  margin: 0, 
                  color: '#fff', 
                  fontSize: '1.25rem',
                  fontWeight: 700 
                }}>
                  Filters
                </h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f59e0b',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setInternalOpen(false);
                      onClose?.();
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div style={{
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                {/* Categories */}
                <div>
                  <h3 style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.875rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px'
                  }}>
                    Categories
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        style={{
                          padding: '10px 16px',
                          background: filters.categories.includes(cat.id)
                            ? 'rgba(0, 212, 255, 0.2)'
                            : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${filters.categories.includes(cat.id)
                            ? '#00d4ff'
                            : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '20px',
                          color: filters.categories.includes(cat.id) ? '#00d4ff' : '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {cat.label}
                        <span style={{ 
                          color: filters.categories.includes(cat.id) ? '#00d4ff' : '#64748b',
                          fontSize: '0.8rem'
                        }}>
                          {cat.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.875rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px'
                  }}>
                    Price Range (EGLD)
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Under 1', min: 0, max: 1 },
                      { label: '1 - 5', min: 1, max: 5 },
                      { label: '5 - 10', min: 5, max: 10 },
                      { label: '10+', min: 10, max: 1000 }
                    ].map((range) => (
                      <button
                        key={range.label}
                        onClick={() => handlePriceChange(range.min, range.max)}
                        style={{
                          flex: 1,
                          minWidth: 'calc(50% - 4px)',
                          padding: '12px',
                          background: filters.priceRange?.min === range.min
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${filters.priceRange?.min === range.min
                            ? '#f59e0b'
                            : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '12px',
                          color: filters.priceRange?.min === range.min ? '#f59e0b' : '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.875rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '12px'
                  }}>
                    Status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {statuses.map(status => (
                      <label
                        key={status.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status.id)}
                          onChange={() => toggleStatus(status.id)}
                          style={{
                            width: '24px',
                            height: '24px',
                            accentColor: '#00d4ff',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ 
                          color: '#fff', 
                          fontSize: '1rem',
                          fontWeight: 500,
                          flex: 1
                        }}>
                          {status.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)',
                flexShrink: 0
              }}>
                <button
                  onClick={() => {
                    setInternalOpen(false);
                    onClose?.();
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Show Results
                </button>
              </div>
            </div>
          </>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
      </>
    );
  }

  // Desktop Sidebar Version
  return (
    <aside style={{
      width: '280px',
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.1)',
      height: 'fit-content',
      position: 'sticky',
      top: '100px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#fff', 
          fontSize: '1.25rem',
          fontWeight: 700 
        }}>
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f59e0b',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Categories */}
        <div>
          <h3 style={{ 
            color: '#94a3b8', 
            fontSize: '0.75rem', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}>
            Categories
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: filters.categories.includes(cat.id)
                    ? 'rgba(0, 212, 255, 0.1)'
                    : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: filters.categories.includes(cat.id) ? '#00d4ff' : '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span>{cat.label}</span>
                <span style={{ 
                  color: filters.categories.includes(cat.id) ? '#00d4ff' : '#64748b',
                  fontSize: '0.875rem'
                }}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Price Range */}
        <div>
          <h3 style={{ 
            color: '#94a3b8', 
            fontSize: '0.75rem', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}>
            Price Range
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Under 1 EGLD', min: 0, max: 1 },
              { label: '1 - 5 EGLD', min: 1, max: 5 },
              { label: '5 - 10 EGLD', min: 5, max: 10 },
              { label: '10+ EGLD', min: 10, max: 1000 }
            ].map((range) => (
              <button
                key={range.label}
                onClick={() => handlePriceChange(range.min, range.max)}
                style={{
                  padding: '10px 12px',
                  background: filters.priceRange?.min === range.min
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'transparent',
                  border: `1px solid ${filters.priceRange?.min === range.min
                    ? '#f59e0b'
                    : 'transparent'}`,
                  borderRadius: '8px',
                  color: filters.priceRange?.min === range.min ? '#f59e0b' : '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Status */}
        <div>
          <h3 style={{ 
            color: '#94a3b8', 
            fontSize: '0.75rem', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}>
            Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {statuses.map(status => (
              <label
                key={status.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              >
                <input
                  type="checkbox"
                  checked={filters.status.includes(status.id)}
                  onChange={() => toggleStatus(status.id)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#00d4ff'
                  }}
                />
                {status.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
