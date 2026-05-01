'use client';

import { useEffect, useRef } from 'react';

const useScrollReveal = () => {
    const observerRef = useRef(null);

    useEffect(() => {
        // Small delay to let page render and GSAP animations complete
        const timer = setTimeout(() => {
            observerRef.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('revealed');
                            observerRef.current?.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.05, rootMargin: '50px 0px 0px 0px' }
            );

            const elements = document.querySelectorAll('.reveal');
            elements.forEach((el) => observerRef.current?.observe(el));
        }, 300);

        return () => {
            clearTimeout(timer);
            observerRef.current?.disconnect();
        };
    }, []);
};

export default useScrollReveal;
