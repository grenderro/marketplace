import React, { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

interface MobileFilterBarProps {
  onFilterChange?: (filters: any) => void;
  categories?: FilterOption[];
  sortOptions?: FilterOption[];
}

const defaultCategories: FilterOption[] = [
  { id: 'all', label: 'All Items', icon: '🌐' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'collectibles', label: 'Collectibles', icon: '🏆' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'photography', label: 'Photo', icon: '📷' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'utility', label: 'Utility', icon: '🔧' },
];

const defaultSort: FilterOption[] = [
  { id: 'recent', label: 'Recently Listed' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
];

export default function MobileFilterBar({ 
  onFilterChange, 
  categories = defaultCategories,
  sortOptions = defaultSort 
}: MobileFilterBarProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeSort, setActiveSort] = useState('recent');
  const [priceRange, setPriceRange] = useState<'all' | 'under100' | '100to500' | 'over500'>('all');

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    onFilterChange?.({ category: id, sort: activeSort, priceRange });
  };

  const handleSortClick = (id: string) => {
    setActiveSort(id);
    setShowSortMenu(false);
    onFilterChange?.({ category: activeCategory, sort: id, priceRange });
  };

  return (
    <div style={{
      position: 'sticky',
      top: '60px', // Height of navbar
      zIndex: 100,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      padding: '0.75rem 0'
    }}>
      {/* Main Filter Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0 1rem',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {/* Sort Dropdown Trigger */}
        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          style={{
            flexShrink: 0,
            padding: '0.5rem 1rem',
            background: showSortMenu ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255,255,255,0.1)',
            border: `1px solid ${showSortMenu ? '#00d4ff' : 'rgba(255,255,255,0.2)'}`,
            borderRadius: '20px',
            color: showSortMenu ? '#00d4ff' : '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <span>📊</span>
          Sort
          <span style={{ 
            transform: showSortMenu ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
            fontSize: '0.75rem'
          }}>▼</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Category Pills */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            style={{
              flexShrink: 0,
              padding: '0.5rem 1rem',
              background: activeCategory === cat.id 
                ? 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)' 
                : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '20px',
              color: activeCategory === cat.id ? '#0f172a' : '#94a3b8',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap',
              boxShadow: activeCategory === cat.id ? '0 4px 15px rgba(0, 212, 255, 0.3)' : 'none'
            }}
          >
            {cat.icon && <span>{cat.icon}</span>}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort Dropdown Menu */}
      {showSortMenu && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '1rem',
          right: '1rem',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '12px',
          marginTop: '0.5rem',
          padding: '0.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          zIndex: 101
        }}>
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSortClick(option.id)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeSort === option.id ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeSort === option.id ? '#00d4ff' : '#94a3b8',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {option.label}
              {activeSort === option.id && <span>✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Secondary Filter Row (Price Range) */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem 1rem 0',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {[
          { id: 'all', label: 'All Prices' },
          { id: 'under100', label: '< 100 EGLD' },
          { id: '100to500', label: '100-500 EGLD' },
          { id: 'over500', label: '> 500 EGLD' }
        ].map((price) => (
          <button
            key={price.id}
            onClick={() => {
              setPriceRange(price.id as any);
              onFilterChange?.({ category: activeCategory, sort: activeSort, priceRange: price.id });
            }}
            style={{
              flexShrink: 0,
              padding: '0.375rem 0.875rem',
              background: priceRange === price.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${priceRange === price.id ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '16px',
              color: priceRange === price.id ? '#f59e0b' : '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {price.label}
          </button>
        ))}
      </div>

      {/* Click outside to close sort menu */}
      {showSortMenu && (
        <div 
          onClick={() => setShowSortMenu(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1
          }}
        />
      )}
    </div>
  );
}
