"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export default function Card({ children, className = "", hover = true }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={hover ? { y: -4 } : {}}
            transition={{ duration: 0.3 }}
            className={`glass-effect rounded-xl p-6 ${className}`}
        >
            {children}
        </motion.div>
    );
}
