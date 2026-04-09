'use client';

import { motion } from "framer-motion";
import { Ticket, Sparkles } from "lucide-react";

export default function ImmersiveBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* Grainy Noise texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none z-50"
                style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }}
            />

            {/* Animated Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 100, 0],
                    y: [0, 50, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -100, 0],
                    y: [100, 0, 100]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 50, 0],
                    y: [0, -50, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] bg-cyan-500/10 rounded-full blur-[110px]"
            />

            {/* Floating Symbols */}
            <div className="absolute inset-0 z-0 opacity-10">
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute top-[15%] right-[10%] text-primary"
                >
                    <Ticket className="w-16 h-16" />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 20, 0], rotate: [0, -45, 0] }}
                    transition={{ duration: 18, repeat: Infinity }}
                    className="absolute top-[40%] left-[5%] text-purple-500"
                >
                    <Sparkles className="w-20 h-20" />
                </motion.div>
            </div>
        </div>
    );
}
