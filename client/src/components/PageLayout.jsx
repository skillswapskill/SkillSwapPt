import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageLayout = ({ children }) => {
    return (
        <div className="w-full min-h-screen">
            {children}
        </div>
    );
};

export default PageLayout;
