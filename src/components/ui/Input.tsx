import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface InputProps extends HTMLMotionProps<"input"> {
    label?: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">{label}</label>}
            <motion.input
                whileFocus={{ borderColor: "var(--color-accent)" }}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none transition-all duration-200 focus:bg-white/10 ${className}`}
                {...props}
            />
        </div>
    );
}
