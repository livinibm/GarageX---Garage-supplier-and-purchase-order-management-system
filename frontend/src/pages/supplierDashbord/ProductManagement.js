import React from 'react';

const ProductManagement = () => {
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            backgroundColor: '#f8fafc'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>
                    This page has been removed
                </h1>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                    The My Parts feature is no longer available.
                </p>
                <a 
                    href="/dashboard" 
                    style={{ 
                        display: 'inline-block',
                        padding: '0.75rem 1.5rem',
                        background: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: '600'
                    }}
                >
                    Return to Dashboard
                </a>
            </div>
        </div>
    );
};

export default ProductManagement;