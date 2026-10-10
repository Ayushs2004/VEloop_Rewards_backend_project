import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

export const ThemeToggle = ({ showLabel = false, className = '' }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getCurrentIcon = () => {
    if (theme === 'system') return <Monitor size={16} />;
    if (theme === 'light') return <Sun size={16} />;
    return <Moon size={16} />;
  };

  const options = [
    { id: 'light', label: 'Light mode', icon: <Sun size={15} /> },
    { id: 'dark', label: 'Dark mode', icon: <Moon size={15} /> },
    { id: 'system', label: 'Same as device', icon: <Monitor size={15} /> }
  ];

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }} className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`Theme: ${theme === 'system' ? 'Same as device' : theme === 'light' ? 'Light mode' : 'Dark mode'}`}
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
          padding: '0.45rem 0.65rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 500,
          transition: 'all 0.16s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--border-strong)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center' }}>{getCurrentIcon()}</span>
        {showLabel && (
          <span style={{ textTransform: 'capitalize' }}>
            {theme === 'system' ? 'Device' : theme}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            minWidth: '170px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            padding: '4px',
            zIndex: 100,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {options.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.14s ease, color 0.14s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ color: isSelected ? 'var(--primary)' : 'inherit', display: 'flex' }}>
                    {opt.icon}
                  </span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={14} color="#6366f1" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
