import { createContext, useContext, useEffect } from 'react';
const ThemeContext = createContext({dark:false,toggle:()=>{}});
export function ThemeProvider({children}){ useEffect(()=>document.documentElement.classList.remove('dark'),[]); return <ThemeContext.Provider value={{dark:false,toggle:()=>{}}}>{children}</ThemeContext.Provider>; }
export const useTheme=()=>useContext(ThemeContext);
