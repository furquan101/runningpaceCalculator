import React from 'react';

const InputCard = ({ label, children, className = "" }) => {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <label className="text-gray-600 font-medium text-sm">{label}</label>
            {children}
        </div>
    );
};

export default InputCard;
