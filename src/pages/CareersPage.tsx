import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobPostingAPI } from '../api/jobPostings';
import type { JobPosting } from '../types/jobPosting';
import { PostTableSkeleton } from '../components/feedback/Skeleton';

const CareersPage = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  const fetchJobPostings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await JobPostingAPI.getActive();
      setJobPostings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobPostings();
  }, [fetchJobPostings]);

  // Extract unique departments and locations
  const departments = Array.from(new Set(jobPostings.map((jp) => jp.department)));
  const locations = Array.from(new Set(jobPostings.map((jp) => jp.location)));

  // Filter job postings
  const filteredPostings = jobPostings.filter((jp) => {
    if (departmentFilter !== 'all' && jp.department !== departmentFilter) return false;
    if (locationFilter !== 'all' && jp.location !== locationFilter) return false;
    return true;
  });

  const formatSalary = (min?: number | null, max?: number | null, currency?: string | null) => {
    if (!min && !max) return 'Thỏa thuận';
    const curr = currency || 'VND';
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${curr}`;
    }
    if (min) return `Từ ${min.toLocaleString()} ${curr}`;
    if (max) return `Đến ${max.toLocaleString()} ${curr}`;
    return 'Thỏa thuận';
  };

  const formatDeadline = (deadline?: string | null) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <header className="hero-section" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Tuyển dụng tại FPT Telecom</h1>
        <p style={{ fontSize: '1.25rem', color: '#666' }}>
          Gia nhập đội ngũ của chúng tôi và cùng nhau phát triển sự nghiệp
        </p>
      </header>

      {/* Filters */}
      <div className="filter-section" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ flex: '1', minWidth: '200px' }}
          >
            <option value="all">Tất cả phòng ban</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ flex: '1', minWidth: '200px' }}
          >
            <option value="all">Tất cả địa điểm</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Listings */}
      {loading ? (
        <PostTableSkeleton />
      ) : filteredPostings.length === 0 ? (
        <p className="empty-state">Hiện không có tin tuyển dụng nào.</p>
      ) : (
        <div className="job-grid" style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredPostings.map((job) => (
            <div
              key={job.id}
              className="job-card"
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: '#fff'
              }}
              onClick={() => navigate(`/careers/${job.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>{job.title}</h2>
              <p style={{ color: '#666', marginBottom: '1rem' }}>{job.position}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className="table-chip">{job.department}</span>
                <span className="table-chip">{job.location}</span>
                <span className="table-chip">{job.employmentType}</span>
                <span className="table-chip">{job.experienceLevel}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#444' }}>
                <p>
                  <strong>Lương:</strong> {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </p>
                <p>
                  <strong>Số lượng:</strong> {job.numberOfPositions} vị trí
                </p>
                {job.applicationDeadline && (
                  <p>
                    <strong>Hạn nộp:</strong> {formatDeadline(job.applicationDeadline)}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="primary-btn"
                style={{ marginTop: '1rem', width: '100%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/careers/${job.id}`);
                }}
              >
                Xem chi tiết & Ứng tuyển
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareersPage;
