import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-gray-900 font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-surface rounded-3xl shadow-xl overflow-hidden min-h-[600px]">
                {children}
            </div>
        </div>
    );
};

export default Layout;
