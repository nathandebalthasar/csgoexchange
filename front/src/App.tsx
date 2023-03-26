import Router from './Router';
import { createContext, useState } from 'react';
import { LanguageContextProps } from './utils/interface';
import './App.css';

export const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
});

export default function App() {
  const [language, setLanguage] = useState('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage}}>
      <Router />
    </LanguageContext.Provider>
  );
}
