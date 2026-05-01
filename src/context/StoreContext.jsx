'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

const StoreContext = createContext();

export function StoreProvider({ children }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await api.getBooks({ status: 'Published' });
            setBooks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading library:', error);
            toast.error('Failed to load published catalog');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const getBookById = async (id) => {
        try {
            return await api.getBookById(id);
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const publishBook = async (data) => {
        try {
            const created = await api.createSubmission(data);
            toast.success('Submission received. Our editorial team will review it shortly.');
            return created;
        } catch (error) {
            toast.error(error.message || 'Submission failed');
            return null;
        }
    };

    const value = useMemo(() => ({
        books,
        loading,
        getBookById,
        publishBook,
        refreshBooks: fetchBooks,
    }), [books, loading]);

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => useContext(StoreContext);
