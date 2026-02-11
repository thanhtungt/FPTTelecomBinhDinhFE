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
          Quay lại danh sách
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
      <section className="job-detail-section" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{job.title}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <span className="table-chip">{job.department}</span>
          <span className="table-chip">{job.location}</span>
          <span className="table-chip">{job.employmentType}</span>
          <span className="table-chip">{job.experienceLevel}</span>
        </div>

        <div className="job-info-grid" style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <strong>Vị trí:</strong> {job.position}
          </div>
          <div>
            <strong>Phòng ban:</strong> {job.department}
          </div>
          <div>
            <strong>Địa điểm:</strong> {job.location}
          </div>
          <div>
            <strong>Mức lương:</strong> {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </div>
          <div>
            <strong>Số lượng tuyển:</strong> {job.numberOfPositions} vị trí
          </div>
          {job.applicationDeadline && (
            <div>
              <strong>Hạn nộp hồ sơ:</strong> {formatDeadline(job.applicationDeadline)}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2>Mô tả công việc</h2>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{job.description}</p>
        </div>

        {job.requirements && (
          <div style={{ marginBottom: '2rem' }}>
            <h2>Yêu cầu</h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{job.requirements}</p>
          </div>
        )}

        {job.benefits && (
          <div style={{ marginBottom: '2rem' }}>
            <h2>Quyền lợi</h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{job.benefits}</p>
          </div>
        )}
      </section>

      {/* Application Form Section */}
      <section className="application-form-section">
        <h2 style={{ marginBottom: '1.5rem' }}>Nộp hồ sơ ứng tuyển</h2>
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <label>
              Họ và tên <span className="required">*</span>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Nhập họ và tên của bạn"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Email <span className="required">*</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="email@example.com"
              />
            </label>
            <label>
              Số điện thoại <span className="required">*</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                maxLength={20}
                placeholder="0123456789"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Địa chỉ
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                maxLength={200}
                placeholder="Địa chỉ hiện tại của bạn"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Link CV (Google Drive, Dropbox, etc.) <span className="required">*</span>
              <input
                type="url"
                name="resumeUrl"
                value={formData.resumeUrl || ''}
                onChange={handleChange}
                required
                maxLength={500}
                placeholder="https://drive.google.com/file/..."
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Thư xin việc
              <textarea
                name="coverLetter"
                value={formData.coverLetter || ''}
                onChange={handleChange}
                rows={8}
                placeholder="Giới thiệu về bản thân, kinh nghiệm và lý do bạn muốn ứng tuyển vị trí này..."
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi hồ sơ ứng tuyển'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default JobDetailPage;
