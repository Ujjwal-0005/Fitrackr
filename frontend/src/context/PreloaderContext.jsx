import { createContext, useContext, useState, useEffect } from 'react';

const PreloaderContext = createContext();

export const usePreloader = () => {
    const context = useContext(PreloaderContext);
    if (!context) {
        throw new Error('usePreloader must be used within PreloaderProvider');
    }
    return context;
};

export const PreloaderProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate initial load time
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000); // 2 seconds minimum load time

        return () => clearTimeout(timer);
    }, []);

    return (
        <PreloaderContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
        </PreloaderContext.Provider>
    );
};
