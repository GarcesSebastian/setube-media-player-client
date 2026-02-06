import React, { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles = "rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white",
        secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
        ghost: "hover:bg-white/5 text-white",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            whileHover={props.disabled ? {} : { scale: 1.02 }}
            whileTap={props.disabled ? {} : { scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}
