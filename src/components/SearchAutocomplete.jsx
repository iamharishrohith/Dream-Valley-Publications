'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useStore } from '@/context/StoreContext';

const SearchAutocomplete = ({
    placeholder = 'Search by Title or ISBN...',
    style,
    value,
    onQueryChange,
}) => {
    const [query, setQuery] = useState(value ?? '');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const { books } = useStore();
    const router = useRouter();
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);
    const isControlled = value !== undefined;

    useEffect(() => {
        if (isControlled) {
            setQuery(value ?? '');
        }
    }, [isControlled, value]);

    const search = useCallback((q) => {
        if (!q.trim()) { setResults([]); setOpen(false); return; }
        const lower = q.toLowerCase();
        const matched = books.filter(b =>
            b.title.toLowerCase().includes(lower) ||
            b.author?.toLowerCase().includes(lower) ||
            b.isbn?.toLowerCase().includes(lower)
        ).slice(0, 6);
        setResults(matched);
        setOpen(matched.length > 0);
        setActiveIndex(matched.length > 0 ? 0 : -1);
    }, [books]);

    const handleChange = (e) => {
        const v = e.target.value;
        if (!isControlled) {
            setQuery(v);
        }
        onQueryChange?.(v);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(v), 200);
    };

    const handleSelect = (item) => {
        setOpen(false);
        if (!isControlled) {
            setQuery('');
        }
        onQueryChange?.('');
        setActiveIndex(-1);
        router.push(`/book/${item.id}`);
    };

    const handleKeyDown = (event) => {
        if (!open || results.length === 0) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((current) => (current + 1) % results.length);
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
        }

        if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            handleSelect(results[activeIndex]);
        }

        if (event.key === 'Escape') {
            setOpen(false);
            setActiveIndex(-1);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentQuery = isControlled ? (value ?? '') : query;

    return (
        <div ref={wrapperRef} className="search-autocomplete" style={style}>
            <Input
                prefix={<SearchOutlined />}
                placeholder={placeholder}
                value={currentQuery}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => currentQuery && results.length && setOpen(true)}
                allowClear
                size="large"
                aria-expanded={open}
                aria-autocomplete="list"
                aria-controls="catalog-search-results"
            />
            {open && (
                <div className="search-dropdown" id="catalog-search-results" role="listbox">
                    {results.length === 0 ? (
                        <div className="search-no-results">No results found</div>
                    ) : (
                        results.map((item, index) => (
                            <div
                                key={item.id}
                                className={`search-dropdown-item ${index === activeIndex ? 'search-dropdown-item-active' : ''}`}
                                onClick={() => handleSelect(item)}
                                role="option"
                                aria-selected={index === activeIndex}
                            >
                                {item.cover ? (
                                    <img src={item.cover} alt="" className="search-dropdown-thumb" />
                                ) : (
                                    <div className="search-dropdown-thumb" />
                                )}
                                <div className="search-dropdown-info">
                                    <div className="search-dropdown-title">{item.title}</div>
                                    <div className="search-dropdown-author">{item.author}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;
