'use client';

const FloatingBooks = () => {
    // Replaced the animated background with a lightweight, static alternative
    // to resolve performance and lag issues reported by the user.
    return (
        <div className="performance-bg absolute inset-0 -z-50" />
    );
};

export default FloatingBooks;
