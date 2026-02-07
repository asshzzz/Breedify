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
    alert(`📄 Downloading report for ${record.tagNumber}...`);
  };

  // ====== Helper Functions ======
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-700 bg-green-100';
    if (score >= 75) return 'text-blue-700 bg-blue-100';
    if (score >= 60) return 'text-yellow-700 bg-yellow-100';
    return 'text-orange-700 bg-orange-100';
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return 'text-green-700 bg-green-100';
    if (s === 'under review') return 'text-orange-700 bg-orange-100';
    if (s === 'pending') return 'text-yellow-700 bg-yellow-100';
    return 'text-blue-700 bg-blue-100';
  };

  // ====== Stats ======
  const stats = {
    total: records.length,
    cattle: records.filter(r => r.animalType?.toLowerCase() === 'cattle').length,
    buffalo: records.filter(r => r.animalType?.toLowerCase() === 'buffalo').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <button
                           onClick={() => navigate('/dashboard')}
                           className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all shadow-sm hover:shadow-md group"
                         >
                           <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                           <span className="font-medium text-sm">Dashboard</span>
                         </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">🐄 Animal Records</h1>
          <div className="w-32"></div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>Tip:</strong> Click the <Eye size={14} className="inline mb-1" /> icon to view animal images. 
            Use the <Copy size={14} className="inline mb-1" /> icon to copy Animal ID.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Animal ID, Tag, or Breed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
              >
                <option value="all">All Animals</option>
                <option value="cattle">Cattle Only</option>
                <option value="buffalo">Buffalo Only</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-700">{stats.total}</p>
              <p className="text-sm text-gray-600 mt-1">Total</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-700">{stats.cattle}</p>
              <p className="text-sm text-gray-600 mt-1">Cattle</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-700">{stats.buffalo}</p>
              <p className="text-sm text-gray-600 mt-1">Buffalo</p>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg font-medium">No records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Animal ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tag</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Breed</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Center</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {record._id.slice(0, 8)}...
                          </code>
                          <button
                            onClick={() => copyAnimalId(record._id)}
                            className="p-1 hover:bg-green-100 rounded"
                          >
                            {copiedId === record._id ? (
                              <Check size={16} className="text-green-600" />
                            ) : (
                              <Copy size={16} className="text-gray-500" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{record.tagNumber}</td>
                      <td className="px-4 py-3 text-sm capitalize">{record.animalType}</td>
                      <td className="px-4 py-3 text-sm">{record.breed}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.center}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(record.score)}`}>
                          {record.score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => viewAnimalImage(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Image"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => downloadReport(record)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => deleteRecord(record._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={18} />
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
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedAnimal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">{selectedAnimal.tagNumber}</h2>
                <p className="text-green-100 text-sm">
                  {selectedAnimal.breed} • {selectedAnimal.animalType}
                </p>
              </div>
              <button
                onClick={closeImageModal}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Image */}
              <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={selectedAnimal.imageUrl}
                  alt={selectedAnimal.tagNumber}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Animal ID</p>
                  <p className="font-mono text-xs bg-white px-3 py-2 rounded border">
                    {selectedAnimal._id}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedAnimal.score}/100
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Classification</p>
                  <p className="text-lg font-semibold">{selectedAnimal.classification}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Center</p>
                  <p className="text-lg font-semibold">{selectedAnimal.center}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => downloadReport(selectedAnimal)}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Report
                </button>
                <button
                  onClick={closeImageModal}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
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