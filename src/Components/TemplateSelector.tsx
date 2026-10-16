"use client";

import React from 'react';
import { useTheme } from '../Context/ThemeContext';
import { ShieldCheck, Palette, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TemplateSelector() {
  const { currentTheme, changeTheme, templates, selectorOpen, toggleSelector } = useTheme();

  const handleQuickChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newThemeId = e.target.value;
    if (newThemeId === 'modal') {
      toggleSelector();
      return;
    }
    changeTheme(newThemeId);
    const themeObj = templates.find((t) => t.id === newThemeId);
    if (themeObj) {
      toast.success(`Theme updated to ${themeObj.name}`);
    }
  };

  const handleSelectTheme = (themeId: string) => {
    changeTheme(themeId);
    const themeObj = templates.find((t) => t.id === themeId);
    if (themeObj) {
      toast.success(`Applied ${themeObj.name} theme!`);
    }
  };

  return (
    <div className="template-selector-wrapper">
      {/* Quick Header Theme Selector */}
      <div className="quick-theme-pill">
        <Palette size={16} className="palette-icon" />
        <select 
          value={currentTheme} 
          onChange={handleQuickChange}
          className="theme-dropdown-select"
          title="Switch App Theme"
        >
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
          <option value="modal">✨ Browse All Themes...</option>
        </select>
      </div>

      {/* Selector Modal Backdrop & Drawer */}
      {selectorOpen && (
        <div className="template-modal-backdrop" onClick={toggleSelector}>
          <div className="template-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="template-modal-header">
              <div>
                <h2 className="template-modal-title">
                  <Palette size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary-color)' }} />
                  Persistent Theme & Visual Selector
                </h2>
                <p className="template-modal-sub">
                  Choose your preferred color scheme. Your selected theme is automatically saved to your browser preferences.
                </p>
              </div>
              <button className="template-close-btn" onClick={toggleSelector}>
                &times;
              </button>
            </div>

            <div className="template-grid">
              {templates.map((tpl) => {
                const isActive = currentTheme === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    className={`template-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectTheme(tpl.id)}
                  >
                    <div className="template-card-top">
                      <div className="template-palette">
                        {tpl.previewColors.map((color, idx) => (
                          <span
                            key={idx}
                            className="color-swatch"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className={`template-badge ${isActive ? 'badge-active' : ''}`}>
                        {isActive ? 'Active Theme' : tpl.tag}
                      </span>
                    </div>

                    <h3 className="template-name">{tpl.name}</h3>
                    <p className="template-desc">{tpl.description}</p>

                    <button
                      className={`template-select-btn ${isActive ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTheme(tpl.id);
                      }}
                    >
                      {isActive ? (
                        <>
                          <Check size={14} style={{ display: 'inline', marginRight: '4px' }} /> Applied
                        </>
                      ) : (
                        'Apply Theme'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="template-modal-footer">
              <span className="template-footer-note">
                <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                All themes support full WCAG AA contrast standards and real-time voter interface updates.
              </span>
              <button className="btn-done" onClick={toggleSelector}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
