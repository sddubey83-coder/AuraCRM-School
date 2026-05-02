// LibraryManagement.jsx — 100% PURE JS (NO TYPESCRIPT ERRORS)
import React, { useState, useCallback, useMemo, useEffect, useReducer } from 'react';

const C = {
    bg: '#0d1117',
    card: '#111827',
    primary: '#4e8ef7',
    success: '#00d97e',
    danger: '#f87171',
    warning: '#f59e0b',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151'
};

const CATEGORIES = ['All', 'Textbook', 'Story', 'Fiction', 'Non-Fiction', 'Reference'];
const SORT_OPTIONS = [
    { value: 'title', label: 'Title A-Z' },
    { value: '-title', label: 'Title Z-A' },
    { value: 'author', label: 'Author A-Z' },
    { value: '-author', label: 'Author Z-A' },
    { value: 'available', label: 'Available ↑' },
    { value: '-available', label: 'Available ↓' }
];

const INITIAL_BOOKS = [
    {
        id: 1,
        title: 'NCERT Maths Class 5',
        author: 'NCERT',
        isbn: '978-817450',
        available: 25,
        issued: 8,
        category: 'Textbook',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    },
    {
        id: 2,
        title: 'Panchtantra Tales',
        author: 'Traditional',
        isbn: '123456789',
        available: 12,
        issued: 12,
        category: 'Story',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    },
    {
        id: 3,
        title: 'Advanced JavaScript',
        author: 'John Smith',
        isbn: '987654321',
        available: 2,
        issued: 18,
        category: 'Reference',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    }
];

// 🏢 Pure JS State Management
const appReducer = (state, action) => {
    switch (action.type) {
        case 'SET_BOOKS':
            return { ...state, books: action.payload };
        case 'ADD_BOOK':
            return {
                ...state,
                books: [action.payload, ...state.books],
                isLoading: false
            };
        case 'UPDATE_BOOK':
            return {
                ...state,
                books: state.books.map(book =>
                    book.id === action.payload.id ? { ...book, ...action.payload } : book
                )
            };
        case 'SET_FILTERS':
            return { ...state, filters: { ...state.filters, ...action.payload } };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

// 🎯 Custom Hook (Pure JS)
const useBooks = () => {
    const [state, dispatch] = useReducer(appReducer, {
        books: [],
        filters: { search: '', category: 'All', sort: 'title' },
        isLoading: false,
        error: null
    });

    const issueBook = useCallback((bookId) => {
        dispatch({
            type: 'UPDATE_BOOK',
            payload: {
                id: bookId,
                available: -1,
                issued: 1
            }
        });
    }, []);

    const returnBook = useCallback((bookId) => {
        dispatch({
            type: 'UPDATE_BOOK',
            payload: {
                id: bookId,
                available: 1,
                issued: -1
            }
        });
    }, []);

    const filteredBooks = useMemo(() => {
        let result = [...state.books];

        // Search filter
        if (state.filters.search) {
            result = result.filter(book =>
                book.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                book.author.toLowerCase().includes(state.filters.search.toLowerCase())
            );
        }

        // Category filter
        if (state.filters.category !== 'All') {
            result = result.filter(book => book.category === state.filters.category);
        }

        // Sort
        result.sort((a, b) => {
            const [field, direction] = state.filters.sort.split('-');
            const multiplier = direction === '-' ? -1 : 1;

            if (field === 'title' || field === 'author') {
                return multiplier * a[field].localeCompare(b[field]);
            }
            return multiplier * (a[field] - b[field]);
        });

        return result;
    }, [state.books, state.filters]);

    const stats = useMemo(() => ({
        totalBooks: state.books.length,
        totalAvailable: state.books.reduce((sum, b) => sum + b.available, 0),
        totalIssued: state.books.reduce((sum, b) => sum + b.issued, 0),
        lowStock: state.books.filter(b => b.available > 0 && b.available <= 3).length,
        outOfStock: state.books.filter(b => b.available === 0).length
    }), [state.books]);

    return {
        ...state,
        books: filteredBooks,
        stats,
        issueBook,
        returnBook,
        dispatch
    };
};

// 🏗️ Components (Pure JS)
const StatsGrid = ({ stats }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24
    }}>
        {[
            { value: stats.totalBooks, label: 'Total Books', icon: '📚', color: C.primary },
            { value: stats.totalAvailable, label: 'Available', icon: '✅', color: C.success },
            { value: stats.totalIssued, label: 'Issued', icon: '📖', color: C.primary },
            { value: stats.lowStock, label: 'Low Stock', icon: '⚠️', color: C.warning },
            { value: stats.outOfStock, label: 'Out of Stock', icon: '❌', color: C.danger }
        ].map(({ value, label, icon, color }, i) => (
            <div key={i} style={{
                background: C.card,
                padding: 24,
                borderRadius: 16,
                textAlign: 'center',
                border: `2px solid ${color}20`
            }}>
                <div style={{ fontSize: 36, color }}>{icon} {value}</div>
                <div style={{ fontSize: 12, color: C.textSecondary }}>{label}</div>
            </div>
        ))}
    </div>
);

const Filters = ({
    filters,
    onFilterChange,
    onClear
}) => {
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div style={{
            background: C.card,
            padding: 20,
            borderRadius: 16,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
                <span style={{ fontSize: 20 }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search books..."
                    value={filters.search}
                    onChange={(e) => onFilterChange({ search: e.target.value })}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: C.text,
                        flex: 1,
                        fontSize: 14,
                        outline: 'none'
                    }}
                />
                {filters.search && (
                    <span
                        style={{ fontSize: 18, cursor: 'pointer', color: C.textSecondary }}
                        onClick={() => onFilterChange({ search: '' })}
                    >
                        ✕
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 16px',
                            background: C.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13
                        }}
                    >
                        <span style={{ fontSize: 16 }}>🎚️</span>
                        Filters
                        <span style={{ fontSize: 16, transition: 'transform 0.2s', transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                    </button>

                    {showFilters && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            background: C.card,
                            borderRadius: 12,
                            padding: 16,
                            marginTop: 8,
                            boxShadow: '0 20px 25px -5px rgba(0, 0,0, 0.5)',
                            minWidth: 200,
                            zIndex: 1000,
                            border: `1px solid ${C.border}`
                        }}>
                            <select
                                value={filters.category}
                                onChange={(e) => onFilterChange({ category: e.target.value })}
                                style={{
                                    background: 'transparent',
                                    border: `1px solid ${C.border}`,
                                    color: C.text,
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    width: '100%',
                                    marginBottom: 12,
                                    fontSize: 14
                                }}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select
                                value={filters.sort}
                                onChange={(e) => onFilterChange({ sort: e.target.value })}
                                style={{
                                    background: 'transparent',
                                    border: `1px solid ${C.border}`,
                                    color: C.text,
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    width: '100%',
                                    fontSize: 14
                                }}
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                {(filters.search || filters.category !== 'All' || filters.sort !== 'title') && (
                    <button
                        onClick={onClear}
                        style={{
                            padding: '8px 16px',
                            background: C.danger,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            cursor: 'pointer'
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

const BookRow = ({
    book,
    onIssue,
    onReturn
}) => {
    const getStatusColor = () => {
        if (book.available === 0) return C.danger;
        if (book.available <= 3) return C.warning;
        if (book.issued > 5) return C.primary;
        return C.success;
    };

    return (
        <tr style={{ borderBottom: `1px solid ${C.border}20` }}>
            <td style={{ padding: '20px', fontWeight: 600, color: C.text }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        background: `linear-gradient(135deg, ${getStatusColor()}, ${getStatusColor()}80)`,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20
                    }}>
                        📚
                    </div>
                    <div>
                        <div>{book.title}</div>
                        <div style={{ fontSize: 12, color: C.textSecondary }}>{book.category}</div>
                    </div>
                </div>
            </td>
            <td style={{ padding: '20px', color: C.text }}>{book.author}</td>
            <td style={{ padding: '20px', fontFamily: 'monospace', color: C.textSecondary }}>
                {book.isbn}
            </td>
            <td style={{ padding: '20px', textAlign: 'center', color: getStatusColor(), fontWeight: 700, fontSize: 16 }}>
                {book.available}
            </td>
            <td style={{ padding: '20px', textAlign: 'center', color: C.primary, fontWeight: 700, fontSize: 16 }}>
                {book.issued}
            </td>
            <td style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {book.available > 0 && (
                        <button
                            onClick={() => onIssue(book.id)}
                            style={{
                                padding: '10px 16px',
                                background: `linear-gradient(135deg, ${C.primary}, ${C.primary}80)`,
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            📤 Issue
                        </button>
                    )}
                    {book.issued > 0 && (
                        <button
                            onClick={() => onReturn(book.id)}
                            style={{
                                padding: '10px 16px',
                                background: `linear-gradient(135deg, ${C.success}, ${C.success}80)`,
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            📥 Return
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

// 🎨 MAIN COMPONENT
export default function LibraryManagement() {
    const {
        books,
        stats,
        filters,
        isLoading,
        error,
        issueBook,
        returnBook,
        dispatch
    } = useBooks();

    useEffect(() => {
        dispatch({ type: 'SET_BOOKS', payload: INITIAL_BOOKS });
    }, [dispatch]);

    const handleFilterChange = useCallback((newFilters) => {
        dispatch({ type: 'SET_FILTERS', payload: newFilters });
    }, [dispatch]);

    const handleClearFilters = useCallback(() => {
        dispatch({
            type: 'SET_FILTERS',
            payload: { search: '', category: 'All', sort: 'title' }
        });
    }, [dispatch]);

    if (isLoading) {
        return (
            <div style={{
                padding: 24,
                background: C.bg,
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: C.primary, fontSize: 24 }}>Loading Library...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, background: C.bg, minHeight: '100vh' }}>
            <StatsGrid stats={stats} />

            <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
            />

            <div style={{
                background: C.card,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #1f2937, #111827)' }}>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: C.text }}>Title</th>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: C.text }}>Author</th>
                            <th style={{ padding: '20px 24px', fontWeight: 700, color: C.text }}>ISBN</th>
                            <th style={{ padding: '20px 24px', textAlign: 'center', fontWeight: 700, color: C.text }}>Available</th>
                            <th style={{ padding: '20px 24px', textAlign: 'center', fontWeight: 700, color: C.text }}>Issued</th>
                            <th style={{ padding: '20px 24px', textAlign: 'center', fontWeight: 700, color: C.text }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{
                                    padding: '60px 24px',
                                    textAlign: 'center',
                                    color: C.textSecondary,
                                    fontSize: 18
                                }}>
                                    No books found matching your criteria
                                </td>
                            </tr>
                        ) : (
                            books.map(book => (
                                <BookRow
                                    key={book.id}
                                    book={book}
                                    onIssue={issueBook}
                                    onReturn={returnBook}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {error && (
                <div style={{
                    marginTop: 24,
                    padding: 20,
                    background: `${C.danger}20`,
                    border: `1px solid ${C.danger}`,
                    borderRadius: 12,
                    color: C.danger
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}