import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Eye, Download, Trash2, Copy, Check, X } from 'lucide-react';

// ====== DUMMY DATA WITH ANIMAL IMAGES ======
const DUMMY_RECORDS = [
  {
    _id: '673f1a2b3c4d5e6f78901234',
    animalId: 'AN001',
    tagNumber: 'COW001',
    animalType: 'cattle',
    breed: 'Holstein',
    score: 92,
    classification: 'A+',
    status: 'Completed',
    center: 'Karnal Center',
    imageUrl: 'https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/holstein-cows-photograph-taken-by-alan-hopps.jpg',
    createdAt: '2024-10-15T10:00:00Z'
  },
  {
    _id: '673f2b3c4d5e6f789012345a',
    animalId: 'AN002',
    tagNumber: 'COW002',
    animalType: 'cattle',
    breed: 'Jersey',
    score: 85,
    classification: 'A',
    status: 'Completed',
    center: 'Delhi Center',
    imageUrl: 'https://jerseymilkcow.com/wp-content/uploads/2020/11/iStock_000001687377_Small.jpg',
    createdAt: '2024-10-16T11:30:00Z'
  },
  {
    _id: '673f3c4d5e6f78901234567b',
    animalId: 'BUF001',
    tagNumber: 'BUF001',
    animalType: 'buffalo',
    breed: 'Murrah',
    score: 88,
    classification: 'A',
    status: 'Completed',
    center: 'Hisar Center',
    imageUrl: 'https://www.vetextension.com/wp-content/uploads/2019/10/murrah-buffalo.jpg',
    createdAt: '2024-10-17T09:15:00Z'
  },
  {
    _id: '673f4d5e6f78901234567890',
    animalId: 'AN003',
    tagNumber: 'COW003',
    animalType: 'cattle',
    breed: 'Sahiwal',
    score: 78,
    classification: 'B+',
    status: 'Under Review',
    center: 'Jaipur Center',
    imageUrl: 'https://img3.exportersindia.com/product_images/bc-full/dir_148/4420588/sahiwal-cow-1516346735-2835028.jpeg',
    createdAt: '2024-10-18T14:20:00Z'
  },
  {
    _id: '673f5e6f789012345678901a',
    animalId: 'BUF002',
    tagNumber: 'BUF002',
    animalType: 'buffalo',
    breed: 'Jaffarabadi',
    score: 81,
    classification: 'B+',
    status: 'Completed',
    center: 'Anand Center',
    imageUrl: 'https://tiimg.tistatic.com/fp/3/006/311/healthy-and-fit-jafarabadi-buffalo-254.jpg',
    createdAt: '2024-10-19T08:45:00Z'
  },
  {
    _id: '673f6f78901234567890123b',
    animalId: 'AN004',
    tagNumber: 'COW004',
    animalType: 'cattle',
    breed: 'Gir',
    score: 90,
    classification: 'A+',
    status: 'Completed',
    center: 'Ahmedabad Center',
    imageUrl: 'https://i.pinimg.com/originals/0a/2e/d1/0a2ed11a6dc4f539fd275580c072b228.jpg',
    createdAt: '2024-10-20T10:00:00Z'
  },
  {
    _id: '673f7890123456789012345c',
    animalId: 'AN005',
    tagNumber: 'COW005',
    animalType: 'cattle',
    breed: 'Red Sindhi',
    score: 75,
    classification: 'B',
    status: 'Pending',
    center: 'Karachi Center',
    imageUrl: 'https://sagbidaj.org/wp-content/uploads/2023/04/RS-10025.jpg',
    createdAt: '2024-10-21T13:30:00Z'
  },
  {
    _id: '673f8901234567890123456d',
    animalId: 'BUF003',
    tagNumber: 'BUF003',
    animalType: 'buffalo',
    breed: 'Mehsana',
    score: 83,
    classification: 'A',
    status: 'Completed',
    center: 'Mehsana Center',
    imageUrl: 'https://cpimg.tistatic.com/04742151/b/5/extra-04742151.jpg',
    createdAt: '2024-10-22T09:00:00Z'
  },
  {
    _id: '673f9012345678901234567e',
    animalId: 'AN006',
    tagNumber: 'COW006',
    animalType: 'cattle',
    breed: 'Tharparkar',
    score: 72,
    classification: 'B',
    status: 'Under Review',
    center: 'Jodhpur Center',
    imageUrl: 'https://alchetron.com/cdn/tharparkar-cattle-2a2bde23-c96f-4430-9fc2-55303d61e2d-resize-750.jpeg',
    createdAt: '2024-10-23T11:45:00Z'
  },
  {
    _id: '673fa123456789012345678f',
    animalId: 'AN007',
    tagNumber: 'COW007',
    animalType: 'cattle',
    breed: 'Kankrej',
    score: 87,
    classification: 'A',
    status: 'Completed',
    center: 'Palanpur Center',
    imageUrl: 'https://tse3.mm.bing.net/th/id/OIP.EZiBiR8MtaEIqLUmOpkMIgHaE7?rs=1&pid=ImgDetMain&o=7&rm=3',
    createdAt: '2024-10-24T15:20:00Z'
  },
  {
    _id: '673fb234567890123456789a',
    animalId: 'BUF004',
    tagNumber: 'BUF004',
    animalType: 'buffalo',
    breed: 'Surti',
    score: 79,
    classification: 'B+',
    status: 'Completed',
    center: 'Surat Center',
    imageUrl: 'https://1.bp.blogspot.com/-oEv3Fe6ryCY/V5d0mPSLGcI/AAAAAAAAAmI/Gj_ugIJnLB83sWMQgPRC0hZRBLUUQMKBQCLcB/s1600/Surti%2BFemale.jpg'
  },
  {
    _id: '673fc345678901234567890b',
    animalId: 'AN008',
    tagNumber: 'COW008',
    animalType: 'cattle',
    breed: 'Hariana',
    score: 84,
    classification: 'A',
    status: 'Completed',
    center: 'Rohtak Center',
    imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.3CHuJhv-KBAPCgE6MiYSzQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3',
    createdAt: '2024-10-26T10:15:00Z'
  },
  {
    _id: '673fd456789012345678901c',
    animalId: 'AN009',
    tagNumber: 'COW009',
    animalType: 'cattle',
    breed: 'Rathi',
    score: 76,
    classification: 'B+',
    status: 'Pending',
    center: 'Bikaner Center',
    imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.pd9-UyMUqy7gh6Ae6YQ6IwHaEJ?rs=1&pid=ImgDetMain&o=7&rm=3',
    createdAt: '2024-10-27T12:00:00Z'
  },
  {
    _id: '673fe567890123456789012d',
    animalId: 'BUF005',
    tagNumber: 'BUF005',
    animalType: 'buffalo',
    breed: 'Bhadawari',
    score: 80,
    classification: 'B+',
    status: 'Completed',
    center: 'Etawah Center',
    imageUrl: 'https://www.apnikheti.com/upload/liveStock/2465idea99919b64_4792d11653e14977a9aa340e2e64c8cd-mv2.jpg',
    createdAt: '2024-10-28T09:30:00Z'
  },
  {
    _id: '673ff678901234567890123e',
    animalId: 'AN010',
    tagNumber: 'COW010',
    animalType: 'cattle',
    breed: 'Ongole',
    score: 89,
    classification: 'A',
    status: 'Completed',
    center: 'Guntur Center',
    imageUrl: 'https://rurallivingtoday.com/wp-content/uploads/ongole-cattle-pasturing.jpg',
    createdAt: '2024-10-29T14:00:00Z'
  }
];

const Records = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Image Modal State
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Fetch records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

  // Apply filters when search/filter changes
  useEffect(() => {
    filterRecords();
  }, [searchQuery, filterType, records]);

  // ====== Load Dummy Records ======
  const fetchRecords = async () => {
    setLoading(true);
    setTimeout(() => {
      setRecords(DUMMY_RECORDS);
      setLoading(false);
    }, 500);
  };

  // ====== Filter Records ======
  const filterRecords = () => {
    let filtered = [...records];

    if (filterType !== 'all') {
      filtered = filtered.filter(r =>
        r.animalType?.toLowerCase() === filterType.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.animalId?.toLowerCase().includes(query) ||
        r.breed?.toLowerCase().includes(query) ||
        r.tagNumber?.toLowerCase().includes(query) ||
        r._id?.toLowerCase().includes(query)
      );
    }

    setFilteredRecords(filtered);
  };

  // ====== Copy Animal ID ======
  const copyAnimalId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ====== View Animal Image ======
  const viewAnimalImage = (record) => {
    setSelectedAnimal(record);
    setShowImageModal(true);
  };

  // ====== Close Modal ======
  const closeImageModal = () => {
    setShowImageModal(false);
    setTimeout(() => setSelectedAnimal(null), 300);
  };

  // ====== Delete Record ======
  const deleteRecord = (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(prevRecords => prevRecords.filter(r => r._id !== recordId));
    }
  };

  // ====== Download Report ======
  const downloadReport = (record) => {
    alert(`Downloading report for ${record.tagNumber}...`);
  };

  // ====== Helper Functions ======
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-[#166534] bg-[#F0FDF4]';
    if (score >= 75) return 'text-[#1D4ED8] bg-[#EFF6FF]';
    if (score >= 60) return 'text-[#A16207] bg-[#FEFCE8]';
    return 'text-[#C2410C] bg-[#FFF7ED]';
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return 'text-[#166534] bg-[#F0FDF4]';
    if (s === 'under review') return 'text-[#C2410C] bg-[#FFF7ED]';
    if (s === 'pending') return 'text-[#A16207] bg-[#FEFCE8]';
    return 'text-[#1D4ED8] bg-[#EFF6FF]';
  };

  // ====== Stats ======
  const stats = {
    total: records.length,
    cattle: records.filter(r => r.animalType?.toLowerCase() === 'cattle').length,
    buffalo: records.filter(r => r.animalType?.toLowerCase() === 'buffalo').length,
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
          <span className="text-sm font-semibold tracking-tight text-[#111827]">Animal Records</span>
          <div className="w-24"></div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        {/* Info Banner */}
        <div className="mb-6 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4">
          <p className="text-[#1D4ED8] text-sm">
            <strong>Tip:</strong> Click the <Eye size={14} className="inline mb-0.5" /> icon to view animal images.
            Use the <Copy size={14} className="inline mb-0.5" /> icon to copy the record ID.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
              <input
                type="text"
                placeholder="Search by Animal ID, Tag, or Breed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-3.5 text-[#9CA3AF]" size={18} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none cursor-pointer"
              >
                <option value="all">All Animals</option>
                <option value="cattle">Cattle Only</option>
                <option value="buffalo">Buffalo Only</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-[#F0FDF4] rounded-xl">
              <p className="text-2xl font-semibold text-[#166534]">{stats.total}</p>
              <p className="text-sm text-[#6B7280] mt-1">Total</p>
            </div>
            <div className="text-center p-4 bg-[#EFF6FF] rounded-xl">
              <p className="text-2xl font-semibold text-[#1D4ED8]">{stats.cattle}</p>
              <p className="text-sm text-[#6B7280] mt-1">Cattle</p>
            </div>
            <div className="text-center p-4 bg-[#F5F3FF] rounded-xl">
              <p className="text-2xl font-semibold text-[#6D28D9]">{stats.buffalo}</p>
              <p className="text-sm text-[#6B7280] mt-1">Buffalo</p>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#166534] border-t-transparent"></div>
              <p className="mt-4 text-sm text-[#6B7280]">Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-16 text-center">
              <Search size={40} className="mx-auto text-[#D1D5DB] mb-4" />
              <p className="text-[#6B7280] font-medium">No records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Record ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Tag</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Breed</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Center</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-[#F3F4F6] text-[#374151] px-2 py-1 rounded">
                            {record._id.slice(0, 8)}...
                          </code>
                          <button
                            onClick={() => copyAnimalId(record._id)}
                            className="p-1 hover:bg-[#F0FDF4] rounded"
                          >
                            {copiedId === record._id ? (
                              <Check size={14} className="text-[#166534]" />
                            ) : (
                              <Copy size={14} className="text-[#9CA3AF]" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#111827]">{record.tagNumber}</td>
                      <td className="px-4 py-3 text-sm text-[#374151] capitalize">{record.animalType}</td>
                      <td className="px-4 py-3 text-sm text-[#374151]">{record.breed}</td>
                      <td className="px-4 py-3 text-sm text-[#6B7280]">{record.center}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(record.score)}`}>
                          {record.score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => viewAnimalImage(record)}
                            className="p-2 text-[#1D4ED8] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                            title="View Image"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => downloadReport(record)}
                            className="p-2 text-[#166534] hover:bg-[#F0FDF4] rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => deleteRecord(record._id)}
                            className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && filteredRecords.length > 0 && (
          <div className="mt-4 text-center text-sm text-[#9CA3AF]">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedAnimal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-[#E5E7EB]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between sticky top-0">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">{selectedAnimal.tagNumber}</h2>
                <p className="text-[#6B7280] text-sm">
                  {selectedAnimal.breed} · {selectedAnimal.animalType}
                </p>
              </div>
              <button
                onClick={closeImageModal}
                className="p-2 hover:bg-[#F9FAFB] rounded-lg text-[#6B7280]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Image */}
              <div className="mb-6 rounded-xl overflow-hidden border border-[#E5E7EB]">
                <img
                  src={selectedAnimal.imageUrl}
                  alt={selectedAnimal.tagNumber}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F9FAFB] p-4 rounded-xl">
                  <p className="text-xs text-[#9CA3AF] mb-1">Record ID</p>
                  <p className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#374151]">
                    {selectedAnimal._id}
                  </p>
                </div>
                <div className="bg-[#F9FAFB] p-4 rounded-xl">
                  <p className="text-xs text-[#9CA3AF] mb-1">Score</p>
                  <p className="text-2xl font-semibold text-[#166534]">
                    {selectedAnimal.score}/100
                  </p>
                </div>
                <div className="bg-[#F9FAFB] p-4 rounded-xl">
                  <p className="text-xs text-[#9CA3AF] mb-1">Classification</p>
                  <p className="text-base font-semibold text-[#111827]">{selectedAnimal.classification}</p>
                </div>
                <div className="bg-[#F9FAFB] p-4 rounded-xl">
                  <p className="text-xs text-[#9CA3AF] mb-1">Center</p>
                  <p className="text-base font-semibold text-[#111827]">{selectedAnimal.center}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => downloadReport(selectedAnimal)}
                  className="flex-1 bg-[#166534] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#14532D] transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Report
                </button>
                <button
                  onClick={closeImageModal}
                  className="px-6 py-3 border border-[#E5E7EB] text-[#374151] text-sm font-medium rounded-full hover:bg-[#F9FAFB] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;