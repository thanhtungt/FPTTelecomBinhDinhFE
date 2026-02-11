import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobPostingAPI } from '../api/jobPostings';
import { JobApplicationAPI } from '../api/jobApplications';
import type { JobPosting } from '../types/jobPosting';
import type { CreateJobApplicationPayload } from '../types/jobApplication';
import { useToast } from '../hooks/useToast';

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateJobApplicationPayload>({
    jobPostingId: 0,
    fullName: '',
    email: '',
    phone: '',
    address: '',
    coverLetter: '',
    resumeUrl: ''
  });

  useEffect(() => {
    if (id) {
      fetchJobPosting(Number(id));
    }
  }, [id]);

  const fetchJobPosting = async (jobId: number) => {
    setLoading(true);
    try {
      const data = await JobPostingAPI.getById(jobId);
      setJob(data);
      setFormData((prev) => ({ ...prev, jobPostingId: jobId }));
    } catch (error) { 
      console.error(error);
      showToast('Không thể tải thông tin tin tuyển dụng', 'error');
      navigate('/careers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await JobApplicationAPI.create(formData);
      showToast('Hồ sơ của bạn đã được gửi thành công!', 'success');
      // Reset form
      setFormData({
        jobPostingId: Number(id),
        fullName: '',
        email: '',
        phone: '',
        address: '',
        coverLetter: '',
        resumeUrl: ''
      });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.response?.data?.message || 'Không thể gửi hồ sơ ứng tuyển';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

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

  if (loading) {
    return <div className="container">Đang tải...</div>;
  }

  if (!job) {
    return (
      <div className="container">
        <p>Không tìm thấy tin tuyển dụng.</p>
        <button type="button" className="ghost-btn" onClick={() => navigate('/careers')}>
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <button
        type="button"
        className="ghost-btn"
        onClick={() => navigate('/careers')}
        style={{ marginBottom: '2rem' }}
      >
        ← Quay lại danh sách
      </button>

      {/* Job Details Section */}
      <section style={{ marginBottom: '3rem', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>{job.title}</h1>
        <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '1.5rem' }}>{job.position}</p>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <span className="table-chip">{job.department}</span>
          <span className="table-chip">{job.location}</span>
          <span className="table-chip">{job.employmentType}</span>
          <span className="table-chip">{job.experienceLevel}</span>
        </div>

        {/* Info Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div>
            <strong style={{ color: '#555' }}>Mức lương:</strong>
            <p style={{ marginTop: '0.25rem', color: '#1a1a1a' }}>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
          </div>
          <div>
            <strong style={{ color: '#555' }}>Số lượng tuyển:</strong>
            <p style={{ marginTop: '0.25rem', color: '#1a1a1a' }}>{job.numberOfPositions} vị trí</p>
          </div>
          {job.applicationDeadline && (
            <div>
              <strong style={{ color: '#555' }}>Hạn nộp hồ sơ:</strong>
              <p style={{ marginTop: '0.25rem', color: '#1a1a1a' }}>{formatDeadline(job.applicationDeadline)}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
            Mô tả công việc
          </h2>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#333' }}>{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
              Yêu cầu ứng viên
            </h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#333' }}>{job.requirements}</p>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1a1a1a', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
              Quyền lợi & Phúc lợi
            </h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: '#333' }}>{job.benefits}</p>
          </div>
        )}
      </section>

      {/* Application Form Section */}
      <section style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#1a1a1a' }}>Nộp hồ sơ ứng tuyển</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Vui lòng điền đầy đủ thông tin bên dưới để ứng tuyển vị trí này</p>
        
        <form onSubmit={handleSubmit} className="package-editor-form">
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {/* Full Name, Email, Phone - same row */}
            <div className="form-group">
              <label htmlFor="fullName">
                Họ và tên <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Số điện thoại <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength={20}
                placeholder="0123456789"
              />
            </div>

            {/* Address */}
            <div className="form-group full-width">
              <label htmlFor="address">
                Địa chỉ
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                maxLength={200}
                placeholder="Địa chỉ hiện tại của bạn"
              />
            </div>

            {/* Resume URL */}
            <div className="form-group full-width">
              <label htmlFor="resumeUrl">
                Link CV (Google Drive, Dropbox, etc.) <span className="required">*</span>
              </label>
              <input
                type="url"
                id="resumeUrl"
                name="resumeUrl"
                value={formData.resumeUrl || ''}
                onChange={handleChange}
                required
                maxLength={500}
                placeholder="https://drive.google.com/file/d/..."
              />
            </div>

            {/* Cover Letter */}
            <div className="form-group full-width">
              <label htmlFor="coverLetter">
                Thư xin việc
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter || ''}
                onChange={handleChange}
                rows={8}
                placeholder="Giới thiệu về bản thân, kinh nghiệm và lý do bạn muốn ứng tuyển vị trí này..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={submitting} style={{ minWidth: '200px' }}>
              {submitting ? 'Đang gửi...' : 'Gửi hồ sơ ứng tuyển'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default JobDetailPage;
