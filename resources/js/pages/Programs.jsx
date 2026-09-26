import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Programs = () => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const res = await api.get('/programs');
                if (res.data.success) {
                    setPrograms(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    const stripHtml = (html) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20" style={{ minHeight: '100vh', background: '#F9FAFB' }}>
                <div className="w-10 h-10 border-4 border-[#1D6B48] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                .catalog-wrap { font-family: 'Inter', sans-serif; }
                .prog-card {
                    background: #fff;
                    border-radius: 20px;
                    border: 1px solid #E5E7EB;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                }
                .prog-card:hover {
                    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
                    border-color: #1D6B48;
                    transform: translateY(-2px);
                }
                .status-open {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #166534;
                    background: #DCFCE7;
                    padding: 6px 12px;
                    border-radius: 99px;
                    letter-spacing: 0.02em;
                }
                .status-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #16A34A;
                    animation: blink 2s infinite ease-in-out;
                }
                @keyframes blink {
                    0%,100% { opacity:1; transform: scale(1); } 
                    50% { opacity:0.4; transform: scale(0.85); }
                }
                .daftar-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 14px;
                    background: #1D6B48;
                    color: #fff;
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                    text-decoration: none;
                    box-shadow: 0 4px 12px rgba(29, 107, 72, 0.2);
                }
                .daftar-btn:hover { 
                    background: #155438; 
                    box-shadow: 0 6px 16px rgba(29, 107, 72, 0.3);
                    transform: translateY(-1px);
                }
                .daftar-btn svg {
                    transition: transform 0.2s ease;
                }
                .daftar-btn:hover svg {
                    transform: translateX(4px);
                }
            `}</style>
            
            <div className="catalog-wrap" style={{ minHeight: '100vh', background: '#F9FAFB' }}>
                {/* Header */}
                <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '48px 0 36px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                            Pendaftaran Bantuan
                        </h1>
                        <p style={{ fontSize: '0.95rem', color: '#6B7280', margin: 0, maxWidth: '500px', lineHeight: 1.6 }}>
                            Pilih bantuan yang sesuai dengan kriteria Anda dan ajukan pendaftaran secara online.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>
                    {programs.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            {programs.map((program) => (
                                <div className="prog-card" key={program.id}>
                                    {/* Card Body */}
                                    <div style={{ padding: '28px 24px 20px', flexGrow: 1 }}>
                                        {/* Status */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <span className="status-open" style={{
                                                background: program.is_open ? '#DCFCE7' : '#FEE2E2',
                                                color: program.is_open ? '#166534' : '#991B1B'
                                            }}>
                                                <span className="status-dot" style={{
                                                    background: program.is_open ? '#16A34A' : '#DC2626'
                                                }}></span>
                                                {program.is_open ? 'Pendaftaran Dibuka' : 'Pendaftaran Ditutup'}
                                            </span>
                                        </div>

                                        {/* Nama Program */}
                                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', lineHeight: 1.4, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
                                            {program.nama_program}
                                        </h3>

                                        {/* Deskripsi */}
                                        <p style={{
                                            fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, margin: 0,
                                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>
                                            {stripHtml(program.deskripsi)}
                                        </p>
                                    </div>

                                    {/* Card Footer */}
                                    <div style={{ padding: '0 24px 24px' }}>
                                        <Link to={`/${program.slug}`} className="daftar-btn" style={!program.is_open ? { background: '#9CA3AF', cursor: 'not-allowed', boxShadow: 'none' } : {}}>
                                            Lihat &amp; Daftar
                                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '64px 40px', textAlign: 'center', marginTop: '8px' }}>
                            <svg style={{ width: '40px', height: '40px', color: '#D1D5DB', margin: '0 auto 16px', display: 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 4px' }}>Belum ada program yang dibuka</p>
                            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: 0 }}>Silakan cek kembali nanti.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Programs;
