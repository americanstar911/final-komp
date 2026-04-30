import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [currentActiveTheme, setCurrentActiveTheme] = useState('light');

    useEffect(() => {
        document.body.setAttribute('data-theme', currentActiveTheme);
    }, [currentActiveTheme]);

    const toggleLightDarkTheme = () => {
        setCurrentActiveTheme((previousTheme) =>
            previousTheme === 'light' ? 'dark' : 'light'
        );
    };

    return (
        <ThemeContext.Provider
            value={{ theme: currentActiveTheme, toggleTheme: toggleLightDarkTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
