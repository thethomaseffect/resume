import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import Home from './pages/Home';
import './App.css';

const ProfileContext = createContext(null);

export function useProfile() {
  return useContext(ProfileContext);
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const urlLang = searchParams.get('lang');
  const language = urlLang === 'sv' ? 'sv' : 'en';
  const skillFilter = searchParams.get('skill') || '';
  const includeExtras = searchParams.get('extras') === '1';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [language, theme]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/profile.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, []);

  const setLanguage = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'en') params.delete('lang');
    else params.set('lang', next);
    setSearchParams(params, { replace: true });
  };

  const setSkillFilter = (skillId) => {
    const params = new URLSearchParams(searchParams);
    if (!skillId || skillId === skillFilter) params.delete('skill');
    else params.set('skill', skillId);
    setSearchParams(params, { replace: true });
  };

  const setIncludeExtras = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next) params.set('extras', '1');
    else params.delete('extras');
    setSearchParams(params, { replace: true });
  };

  const ui = profile?.ui?.[language] || profile?.ui?.en;
  const value = useMemo(
    () => ({
      profile,
      language,
      setLanguage,
      theme,
      setTheme,
      ui,
      skillFilter,
      setSkillFilter,
      includeExtras,
      setIncludeExtras,
    }),
    [profile, language, theme, ui, skillFilter, includeExtras]
  );

  if (error) {
    return <div className="boot-message">{error}</div>;
  }

  if (!profile || !ui) {
    return <div className="boot-message">Loading…</div>;
  }

  return (
    <ProfileContext.Provider value={value}>
      <div className="app">
        <a className="skip-link" href="#main">
          {ui.skipToContent}
        </a>
        <header className="site-header">
          <div className="header-inner">
            <span className="wordmark">{ui.navName}</span>
            <div className="header-actions">
              <div className="segmented" role="group" aria-label={ui.language}>
                <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
                  EN
                </button>
                <button type="button" className={language === 'sv' ? 'active' : ''} onClick={() => setLanguage('sv')}>
                  SV
                </button>
              </div>
              <div className="segmented" role="group" aria-label="Theme">
                <button
                  type="button"
                  className={theme === 'light' ? 'active' : ''}
                  onClick={() => setTheme('light')}
                >
                  {ui.themeLight}
                </button>
                <button
                  type="button"
                  className={theme === 'dark' ? 'active' : ''}
                  onClick={() => setTheme('dark')}
                >
                  {ui.themeDark}
                </button>
              </div>
              <label className="extras-toggle">
                <input
                  type="checkbox"
                  checked={includeExtras}
                  onChange={(event) => setIncludeExtras(event.target.checked)}
                />
                {ui.includeExtras}
              </label>
              <a
                className="pdf-button"
                href={`${import.meta.env.BASE_URL}${
                  language === 'sv'
                    ? includeExtras
                      ? 'thomas-geraghty-sv-extras.pdf'
                      : 'thomas-geraghty-sv.pdf'
                    : includeExtras
                      ? 'thomas-geraghty-extras.pdf'
                      : 'thomas-geraghty.pdf'
                }`}
                download={
                  language === 'sv'
                    ? includeExtras
                      ? 'Thomas-Geraghty-CV-sv-extras.pdf'
                      : 'Thomas-Geraghty-CV-sv.pdf'
                    : includeExtras
                      ? 'Thomas-Geraghty-CV-extras.pdf'
                      : 'Thomas-Geraghty-CV.pdf'
                }
              >
                {ui.downloadPdf}
              </a>
            </div>
          </div>
        </header>
        {language === 'sv' ? <p className="translation-banner">{ui.translationBanner}</p> : null}
        <main id="main" className="main">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </ProfileContext.Provider>
  );
}
