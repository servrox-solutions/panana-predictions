// components/LoadingSpinner.tsx
import React from "react";

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
            <div className="animate-spin text-6xl">
                🍌
            </div>
        </div>
    );
};

export default LoadingSpinner;
