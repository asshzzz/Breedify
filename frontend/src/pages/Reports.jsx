import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, TrendingUp, PieChart, RefreshCw, AlertCircle } from 'lucide-react';
import { reportAPI, recordAPI } from '../api'; // ← Import API services

const Reports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    totalClassifications: 0,
    cattleCount: 0,
    buffaloCount: 0,
    averageScore: 0,
    eliteCount: 0,
    goodCount: 0,
    averageCount: 0,
    monthlyGrowth: 0
  });
  const [breedDistribution, setBreedDistribution] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [exporting, setExporting] = useState(false);

  // Fetch report data on mount and when date range changes
  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  // ====== Fetch Report Data from Backend ======
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Calculate date range
      const { startDate, endDate } = getDateRangeValues(dateRange);

      // Fetch reports from backend
      const reportsResponse = await reportAPI.getByDateRange(startDate, endDate);
      
      // Fetch all records for calculations
      const recordsResponse = await recordAPI.getAll();
      const records = recordsResponse.records || recordsResponse || [];

      // Process and calculate metrics
      const metrics = calculateMetrics(records, startDate, endDate);
      setReportData(metrics.summary);
      setBreedDistribution(metrics.breeds);
      setMonthlyTrends(metrics.trends);

    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // ====== Calculate Date Range ======
  const getDateRangeValues = (range) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (range) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1); // Far back date
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // ====== Calculate Metrics from Records ======
  const calculateMetrics = (records, startDate, endDate) => {
    // Filter records by date range
    const filteredRecords = records.filter(r => {
      const recordDate = new Date(r.createdAt || r.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });

    // Calculate summary metrics
    const cattleCount = filteredRecords.filter(r => r.animalType?.toLowerCase() === 'cattle').length;
    const buffaloCount = filteredRecords.filter(r => r.animalType?.toLowerCase() === 'buffalo').length;
    
    const totalScore = filteredRecords.reduce((sum, r) => sum + (r.score || r.classificationScore || 0), 0);
    const averageScore = filteredRecords.length > 0 ? (totalScore / filteredRecords.length).toFixed(1) : 0;

    // Classification distribution
    const eliteCount = filteredRecords.filter(r => (r.score || 0) >= 90 || r.classification?.toLowerCase() === 'elite').length;
    const goodCount = filteredRecords.filter(r => {
      const score = r.score || 0;
      return (score >= 75 && score < 90) || r.classification?.toLowerCase() === 'good';
    }).length;
    const averageCount = filteredRecords.filter(r => {
      const score = r.score || 0;
      return score < 75 || r.classification?.toLowerCase() === 'average';
    }).length;

    // Calculate growth (compare with previous period)
    const previousPeriodStart = new Date(startDate);
    const daysDiff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);
    
    const previousRecords = records.filter(r => {
      const recordDate = new Date(r.createdAt || r.date);
      return recordDate >= previousPeriodStart && recordDate < new Date(startDate);
    });
    
    const monthlyGrowth = previousRecords.length > 0 
      ? (((filteredRecords.length - previousRecords.length) / previousRecords.length) * 100).toFixed(1)
      : 0;

    // Breed distribution
    const breedCounts = {};
    filteredRecords.forEach(r => {
      const breed = r.breed || 'Unknown';
      breedCounts[breed] = (breedCounts[breed] || 0) + 1;
    });

    const breeds = Object.entries(breedCounts)
      .map(([breed, count]) => ({
        breed,
        count,
        percentage: Math.round((count / filteredRecords.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 breeds

    // Monthly trends (last 7 months)
    const trends = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRecords = records.filter(r => {
        const recordDate = new Date(r.createdAt || r.date);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });

      trends.push({
        month: monthNames[date.getMonth()],
        classifications: monthRecords.length
      });
    }

    return {
      summary: {
        totalClassifications: filteredRecords.length,
        cattleCount,
        buffaloCount,
        averageScore: parseFloat(averageScore),
        eliteCount,
        goodCount,
        averageCount,
        monthlyGrowth: parseFloat(monthlyGrowth)
      },
      breeds,
      trends
    };
  };

  // ====== Download Report (PDF/Excel) ======
  const downloadReport = async (format) => {
    setExporting(true);
    
    try {
      const { startDate, endDate } = getDateRangeValues(dateRange);
      
      if (format === 'PDF') {
        // Generate and download PDF report
        const reportConfig = {
          reportType: 'summary',
          startDate,
          endDate,
          includeCharts: true
        };

        const response = await reportAPI.generate(reportConfig);
        
        // If response is a report ID, fetch the PDF
        if (response.reportId) {
          const pdfBlob = await reportAPI.exportPDF(response.reportId);
          downloadFile(pdfBlob, `Report_${dateRange}_${Date.now()}.pdf`);
        }
        
      } else if (format === 'Excel') {
        // Export as Excel (CSV alternative)
        const csvData = generateCSVData();
        const blob = new Blob([csvData], { type: 'text/csv' });
        downloadFile(blob, `Report_${dateRange}_${Date.now()}.csv`);
      }

      alert(`✅ Report downloaded successfully in ${format} format!`);
      
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('❌ Failed to download report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ====== Generate CSV Data ======
  const generateCSVData = () => {
    let csv = 'Metric,Value\n';
    csv += `Total Classifications,${reportData.totalClassifications}\n`;
    csv += `Cattle Count,${reportData.cattleCount}\n`;
    csv += `Buffalo Count,${reportData.buffaloCount}\n`;
    csv += `Average Score,${reportData.averageScore}\n`;
    csv += `Elite Count,${reportData.eliteCount}\n`;
    csv += `Good Count,${reportData.goodCount}\n`;
    csv += `Average Count,${reportData.averageCount}\n`;
    csv += `Monthly Growth,${reportData.monthlyGrowth}%\n\n`;
    
    csv += 'Breed Distribution\n';
    csv += 'Breed,Count,Percentage\n';
    breedDistribution.forEach(breed => {
      csv += `${breed.breed},${breed.count},${breed.percentage}%\n`;
    });
    
    csv += '\nMonthly Trends\n';
    csv += 'Month,Classifications\n';
    monthlyTrends.forEach(trend => {
      csv += `${trend.month},${trend.classifications}\n`;
    });
    
    return csv;
  };

  // ====== Download File Helper ======
  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
          <button
            onClick={fetchReportData}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <p className="text-red-800 font-medium">Error loading report data</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button 
              onClick={fetchReportData}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Date Range Filter and Export */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Calendar className="text-gray-600" size={24} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => downloadReport('PDF')}
                disabled={loading || exporting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
              </button>
              <button
                onClick={() => downloadReport('Excel')}
                disabled={loading || exporting}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading analytics data...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">Total Classifications</h3>
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-800">{reportData.totalClassifications}</p>
                <p className={`text-sm mt-2 ${reportData.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {reportData.monthlyGrowth >= 0 ? '+' : ''}{reportData.monthlyGrowth}% from last period
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">Cattle Classified</h3>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold">C</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{reportData.cattleCount}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {reportData.totalClassifications > 0 
                    ? Math.round((reportData.cattleCount / reportData.totalClassifications) * 100)
                    : 0}% of total
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">Buffalo Classified</h3>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-700 font-bold">B</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">{reportData.buffaloCount}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {reportData.totalClassifications > 0 
                    ? Math.round((reportData.buffaloCount / reportData.totalClassifications) * 100)
                    : 0}% of total
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">Average Score</h3>
                  <PieChart className="text-orange-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-800">{reportData.averageScore}</p>
                <p className="text-sm text-gray-500 mt-2">Out of 100</p>
              </div>
            </div>

            {/* Classification Distribution */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Classification Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Elite (90-100)</span>
                      <span className="text-sm font-bold text-gray-800">{reportData.eliteCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 rounded-full h-3 transition-all duration-500"
                        style={{ 
                          width: reportData.totalClassifications > 0 
                            ? `${(reportData.eliteCount / reportData.totalClassifications) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Good (75-89)</span>
                      <span className="text-sm font-bold text-gray-800">{reportData.goodCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 rounded-full h-3 transition-all duration-500"
                        style={{ 
                          width: reportData.totalClassifications > 0 
                            ? `${(reportData.goodCount / reportData.totalClassifications) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Average (&lt;75)</span>
                      <span className="text-sm font-bold text-gray-800">{reportData.averageCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-orange-500 rounded-full h-3 transition-all duration-500"
                        style={{ 
                          width: reportData.totalClassifications > 0 
                            ? `${(reportData.averageCount / reportData.totalClassifications) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Breed Distribution</h3>
                {breedDistribution.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No breed data available</p>
                ) : (
                  <div className="space-y-3">
                    {breedDistribution.map((breed, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-blue-100' : 
                            index === 1 ? 'bg-green-100' : 
                            index === 2 ? 'bg-purple-100' : 
                            index === 3 ? 'bg-orange-100' : 'bg-gray-200'
                          }`}>
                            <span className={`font-bold text-sm ${
                              index === 0 ? 'text-blue-700' : 
                              index === 1 ? 'text-green-700' : 
                              index === 2 ? 'text-purple-700' : 
                              index === 3 ? 'text-orange-700' : 'text-gray-700'
                            }`}>{breed.count}</span>
                          </div>
                          <span className="font-medium text-gray-800">{breed.breed}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{breed.percentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Monthly Classification Trends</h3>
              {monthlyTrends.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No trend data available</p>
              ) : (
                <div className="h-64 flex items-end justify-between space-x-2">
                  {monthlyTrends.map((item, index) => {
                    const maxValue = Math.max(...monthlyTrends.map(t => t.classifications), 1);
                    const heightPercent = (item.classifications / maxValue) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                          <div 
                            className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500 hover:from-green-600 hover:to-green-500 cursor-pointer"
                            style={{ height: `${heightPercent}%` }}
                            title={`${item.classifications} classifications`}
                          >
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
                              {item.classifications}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-gray-600 mt-2">{item.month}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;