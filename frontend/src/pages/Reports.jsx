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

      alert(`Report downloaded successfully in ${format} format!`);

    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again.');
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
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors">
            <ArrowLeft size={16} />
            Back
          </Link>
          <span className="text-sm font-semibold tracking-tight text-[#111827]">Analytics &amp; Reports</span>
          <button
            onClick={fetchReportData}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-[#FEF2F2] border border-[#FCA5A5]/60 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-[#DC2626]" size={18} />
            <div>
              <p className="text-[#991B1B] font-medium text-sm">Error loading report data</p>
              <p className="text-[#DC2626] text-sm">{error}</p>
            </div>
            <button
              onClick={fetchReportData}
              className="ml-auto text-sm font-medium bg-[#DC2626] text-white px-4 py-2 rounded-full hover:bg-[#B91C1C] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Date Range Filter and Export */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-[#166534]" size={18} />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                disabled={loading}
                className="px-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#166534]/30 focus:border-[#166534] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => downloadReport('PDF')}
                disabled={loading || exporting}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
              </button>
              <button
                onClick={() => downloadReport('Excel')}
                disabled={loading || exporting}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full bg-[#166534] text-white hover:bg-[#14532D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={16} />
                <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#166534] border-t-transparent"></div>
            <p className="mt-4 text-[#6B7280] text-sm">Loading analytics data...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#D1D5DB] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#6B7280] text-sm">Total Classifications</h3>
                  <TrendingUp className="text-[#166534]" size={18} />
                </div>
                <p className="text-3xl font-semibold text-[#111827]">{reportData.totalClassifications}</p>
                <p className={`text-sm mt-2 ${reportData.monthlyGrowth >= 0 ? 'text-[#166534]' : 'text-[#DC2626]'}`}>
                  {reportData.monthlyGrowth >= 0 ? '+' : ''}{reportData.monthlyGrowth}% from last period
                </p>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#D1D5DB] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#6B7280] text-sm">Cattle Classified</h3>
                  <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
                    <span className="text-[#166534] font-semibold text-sm">C</span>
                  </div>
                </div>
                <p className="text-3xl font-semibold text-[#111827]">{reportData.cattleCount}</p>
                <p className="text-sm text-[#9CA3AF] mt-2">
                  {reportData.totalClassifications > 0
                    ? Math.round((reportData.cattleCount / reportData.totalClassifications) * 100)
                    : 0}% of total
                </p>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#D1D5DB] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#6B7280] text-sm">Buffalo Classified</h3>
                  <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center">
                    <span className="text-[#6D28D9] font-semibold text-sm">B</span>
                  </div>
                </div>
                <p className="text-3xl font-semibold text-[#111827]">{reportData.buffaloCount}</p>
                <p className="text-sm text-[#9CA3AF] mt-2">
                  {reportData.totalClassifications > 0
                    ? Math.round((reportData.buffaloCount / reportData.totalClassifications) * 100)
                    : 0}% of total
                </p>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#D1D5DB] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#6B7280] text-sm">Average Score</h3>
                  <PieChart className="text-[#EA580C]" size={18} />
                </div>
                <p className="text-3xl font-semibold text-[#111827]">{reportData.averageScore}</p>
                <p className="text-sm text-[#9CA3AF] mt-2">Out of 100</p>
              </div>
            </div>

            {/* Classification Distribution */}
            <div className="grid lg:grid-cols-2 gap-5 mb-6">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#111827] mb-6">Classification Distribution</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#374151]">Elite (90-100)</span>
                      <span className="text-sm font-semibold text-[#111827]">{reportData.eliteCount}</span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                      <div
                        className="bg-[#166534] rounded-full h-2 transition-all duration-500"
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
                      <span className="text-sm text-[#374151]">Good (75-89)</span>
                      <span className="text-sm font-semibold text-[#111827]">{reportData.goodCount}</span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                      <div
                        className="bg-[#2563EB] rounded-full h-2 transition-all duration-500"
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
                      <span className="text-sm text-[#374151]">Average (&lt;75)</span>
                      <span className="text-sm font-semibold text-[#111827]">{reportData.averageCount}</span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                      <div
                        className="bg-[#EA580C] rounded-full h-2 transition-all duration-500"
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

              <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-[#111827] mb-6">Breed Distribution</h3>
                {breedDistribution.length === 0 ? (
                  <p className="text-center text-[#9CA3AF] text-sm py-8">No breed data available</p>
                ) : (
                  <div className="space-y-2">
                    {breedDistribution.map((breed, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
                            <span className="font-semibold text-sm text-[#166534]">{breed.count}</span>
                          </div>
                          <span className="text-sm font-medium text-[#111827]">{breed.breed}</span>
                        </div>
                        <span className="text-sm text-[#6B7280]">{breed.percentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-[#111827] mb-6">Monthly Classification Trends</h3>
              {monthlyTrends.length === 0 ? (
                <p className="text-center text-[#9CA3AF] text-sm py-8">No trend data available</p>
              ) : (
                <div className="h-64 flex items-end justify-between gap-2">
                  {monthlyTrends.map((item, index) => {
                    const maxValue = Math.max(...monthlyTrends.map(t => t.classifications), 1);
                    const heightPercent = (item.classifications / maxValue) * 100;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-[#F9FAFB] rounded-t-lg relative" style={{ height: '200px' }}>
                          <div
                            className="absolute bottom-0 w-full bg-[#166534] rounded-t-lg transition-all duration-500 hover:bg-[#14532D] cursor-pointer"
                            style={{ height: `${heightPercent}%` }}
                            title={`${item.classifications} classifications`}
                          >
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-[#374151]">
                              {item.classifications}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-[#6B7280] mt-2">{item.month}</p>
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