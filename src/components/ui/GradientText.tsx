"use client";

import { motion } from "framer-motion";

interface GradientTextProps {
    children: string;
    className?: string;
}

export default function GradientText({ children, className = "" }: GradientTextProps) {
    return (
        <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`gradient-text ${className}`}
        >
            {children}
        </motion.span>
    );
}
