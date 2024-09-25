// components/LoadingSpinner.tsx
import React from "react";

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin text-6xl">
                🍌
            </div>
        </div>
    );
};

export default LoadingSpinner;
