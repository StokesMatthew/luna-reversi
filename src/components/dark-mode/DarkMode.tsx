import { useState } from "react";
import { toggleTheme, getCurrentTheme } from "../../utils/theme";

const DarkMode: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(getCurrentTheme());

    const handleThemeToggle = () => {
        const newIsDarkMode = toggleTheme();
        setIsDarkMode(newIsDarkMode);
    };
    return (
        <div>
            <button className="button" onClick={handleThemeToggle}>
                {isDarkMode ? '🌙' : '☀️'}
            </button>
        </div>
    );
    
}

export default DarkMode;