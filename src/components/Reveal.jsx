'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function Reveal({ children, width = "fit-content", delay = 0.25 }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    return (
        <div ref={ref} style={{ position: "relative", width, zIndex: 1 }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 }
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.5, delay }}
            >
                {children}
            </motion.div>
        </div>
    );
}
