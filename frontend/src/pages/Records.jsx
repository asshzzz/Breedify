import React, { useEffect, useState } from 'react';
import { ArrowLeft, Eye, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recordAPI } from '../api';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1$/, '');

const getImageUrl = (record) => {
  const imageUrl = record.images?.[0]?.imageUrl || record.imageUrl;
  return imageUrl?.startsWith('/') ? `${API_ORIGIN}${imageUrl}` : imageUrl;
};

const Records = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await recordAPI.getAll();
      const savedRecords = response.data || response.records || [];
      setRecords(Array.isArray(savedRecords) ? savedRecords : []);
    } catch (err) {
      setError(err || 'Unable to load saved cattle records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((record) => {
    const query = searchQuery.trim().toLowerCase();
    return !query || [record.animalId, record.breed].some((value) =>
      value?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-start">
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827]">
            <ArrowLeft size={16} /> Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8E23]">Saved data</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#173B2D]">Cattle records</h1>
          <p className="mt-2 text-sm text-[#66756D]">Every uploaded image, breed prediction, and unique cattle number in one place.</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-3 text-[#9CA3AF]" size={18} />
            <input type="search" placeholder="Search cattle number or breed" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full pl-10 pr-4 py-3 text-sm border border-[#DCE7D5] bg-white outline-none focus:border-[#6B8E23]" />
          </div>
          <span className="text-sm text-[#66756D]">{filteredRecords.length} saved record{filteredRecords.length === 1 ? '' : 's'}</span>
        </div>

        {error && <p className="mb-6 border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">{error}</p>}

        <div className="bg-white border border-[#DCE7D5] overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-sm text-[#66756D]">Loading saved records...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-16 text-center">
              <p className="font-medium text-[#173B2D]">No saved cattle records yet</p>
              <p className="mt-2 text-sm text-[#66756D]">Upload an image to create the first breed prediction.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {filteredRecords.map((record) => (
                <div key={record._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-[#F7FAF4]">
                  <div className="w-20 h-20 shrink-0 bg-[#F3F6F0] overflow-hidden">
                    {getImageUrl(record) ? <img src={getImageUrl(record)} alt={record.breed} className="w-full h-full object-cover" /> : <span className="flex h-full items-center justify-center text-xs text-[#9CA3AF]">No image</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B8E23]">{record.animalId}</p>
                    <h2 className="mt-1 text-lg font-semibold text-[#173B2D]">{record.breed}</h2>
                    <p className="mt-1 text-sm text-[#66756D]">Cattle · Saved {new Date(record.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setSelectedRecord(record)} className="inline-flex items-center justify-center gap-2 border border-[#B7C9AD] px-4 py-2 text-sm font-medium text-[#173B2D] hover:bg-[#F0F6EA]"><Eye size={16} /> View image</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelectedRecord(null)}>
          <div className="w-full max-w-3xl bg-white p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B8E23]">{selectedRecord.animalId}</p><h2 className="text-xl font-semibold text-[#173B2D]">{selectedRecord.breed}</h2></div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 text-[#66756D] hover:bg-[#F3F6F0]"><X size={20} /></button>
            </div>
            {getImageUrl(selectedRecord) && <img src={getImageUrl(selectedRecord)} alt={selectedRecord.breed} className="max-h-[70vh] w-full object-contain bg-[#F3F6F0]" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
