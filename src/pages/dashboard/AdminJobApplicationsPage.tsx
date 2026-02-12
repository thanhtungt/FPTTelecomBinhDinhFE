import { useCallback, useEffect, useMemo, useState } from 'react';
import { JobApplicationAPI } from '../../api/jobApplications';
import { JobPostingAPI } from '../../api/jobPostings';
import type { JobApplication, JobApplicationStatus } from '../../types/jobApplication';
import type { JobPosting } from '../../types/jobPosting';
import { PostTableSkeleton } from '../../components/feedback/Skeleton';
import { formatDate } from '../../utils/format';
import { useToast } from '../../hooks/useToast';
import ConfirmModal from '../../components/common/ConfirmModal';

const statusFilters: Array<{ label: string; value: 'all' | JobApplicationStatus }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đang xem xét', value: 'reviewing' },
  { label: 'Chấp nhận', value: 'approved' },
  { label: 'Từ chối', value: 'rejected' }
];

const AdminJobApplicationsPage = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | JobApplicationStatus>('all');
  const [jobPostingFilter, setJobPostingFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [reviewModal, setReviewModal] = useState<{
    application: JobApplication;
    status: JobApplicationStatus;
    note: string;
  } | null>(null);
  const { showToast } = useToast();
  
  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    danger: false
  });

  const fetchApplications = useCallback(
    async (status: 'all' | JobApplicationStatus) => {
      setLoading(true);
      try {
        const data = await JobApplicationAPI.getAll(status === 'all' ? undefined : status);
        setApplications(data);
      } catch (error) {
        console.error(error);
        showToast('Không thể tải danh sách hồ sơ', 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const fetchJobPostings = useCallback(async () => {
    try {
      const data = await JobPostingAPI.getAll();
      setJobPostings(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchApplications(statusFilter);
    fetchJobPostings();
  }, [statusFilter, fetchApplications, fetchJobPostings]);

  const filteredApplications = useMemo(() => {
    let result = applications;

    // Filter by job posting
    if (jobPostingFilter !== 'all') {
      result = result.filter((item) => item.jobPostingId === jobPostingFilter);
    }

    // Filter by search keyword
    const keyword = search.trim().toLowerCase();
    if (keyword) {
      result = result.filter(
        (item) =>
          item.fullName.toLowerCase().includes(keyword) ||
          item.email.toLowerCase().includes(keyword) ||
          item.phone.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [applications, jobPostingFilter, search]);

  const handleUpdateStatus = () => {
    if (!reviewModal) return;
    
    const statusLabels: Record<JobApplicationStatus, string> = {
      pending: 'Chờ xử lý',
      reviewing: 'Đang xem xét',
      approved: 'Chấp nhận',
      rejected: 'Từ chối'
    };
    
    setConfirmModal({
      isOpen: true,
      title: 'Cập nhật trạng thái hồ sơ',
      message: `Bạn có chắc chắn muốn cập nhật trạng thái thành "${statusLabels[reviewModal.status]}" cho ứng viên "${reviewModal.application.fullName}"?`,
      danger: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          const updated = await JobApplicationAPI.updateStatus(reviewModal.application.id, {
            status: reviewModal.status,
            reviewNote: reviewModal.note || null
          });
          setApplications((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
          showToast('Trạng thái đã được cập nhật', 'success');
          setReviewModal(null);
        } catch (error) {
          console.error(error);
          showToast('Không thể cập nhật trạng thái', 'error');
        }
      }
    });
  };

  const handleDelete = (application: JobApplication) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa hồ sơ ứng tuyển',
      message: `Bạn có chắc chắn muốn xóa hồ sơ của "${application.fullName}"?\n\nHành động này không thể hoàn tác.`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await JobApplicationAPI.remove(application.id);
          setApplications((prev) => prev.filter((item) => item.id !== application.id));
          showToast('Hồ sơ đã được xóa', 'success');
        } catch (error) {
          console.error(error);
          showToast('Không thể xóa hồ sơ', 'error');
        }
      }
    });
  };

  const handleRefresh = () => {
    fetchApplications(statusFilter);
  };

  const openReviewModal = (app: JobApplication) => {
    setReviewModal({
      application: app,
      status: app.status,
      note: app.reviewNote || ''
    });
  };

  const getStatusLabel = (status: JobApplicationStatus) => {
    const labels: Record<JobApplicationStatus, string> = {
      pending: 'Chờ xử lý',
      reviewing: 'Đang xem xét',
      approved: 'Chấp nhận',
      rejected: 'Từ chối'
    };
    return labels[status];
  };

  return (
    <div className="container">
      <header className="section-header">
        <div>
          <p className="eyebrow">Quản lý tuyển dụng</p>
          <h1>Hồ sơ ứng tuyển</h1>
        </div>
      </header>

      <div className="filter-group">
        {statusFilters.map((item) => (
          <button
            key={item.value}
            type="button"
            className={statusFilter === item.value ? 'chip active' : 'chip'}
            onClick={() => setStatusFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="posts-panel">
        <div className="posts-panel__controls">
          <input
            type="search"
            placeholder="Tìm kiếm theo tên, email, số điện thoại"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            value={jobPostingFilter}
            onChange={(e) => setJobPostingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="all">Tất cả tin tuyển dụng</option>
            {jobPostings.map((jp) => (
              <option key={jp.id} value={jp.id}>
                {jp.title}
              </option>
            ))}
          </select>
          <button type="button" className="ghost-btn" onClick={handleRefresh} disabled={loading}>
            Tải lại
          </button>
        </div>
        {loading ? (
          <PostTableSkeleton />
        ) : filteredApplications.length === 0 ? (
          <p className="empty-state">Không tìm thấy hồ sơ ứng tuyển.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ứng viên</th>
                  <th>Tin tuyển dụng</th>
                  <th>Liên hệ</th>
                  <th>Trạng thái</th>
                  <th>Ngày nộp</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.fullName}</strong>
                      {item.address && <p className="table-subtitle">{item.address}</p>}
                    </td>
                    <td>
                      <strong>{item.jobPostingTitle}</strong>
                      <p className="table-subtitle">{item.jobPostingPosition}</p>
                    </td>
                    <td>
                      <small>{item.email}</small>
                      < br />
                      <small>{item.phone}</small>
                    </td>
                    <td>
                      <span className={`table-chip status-${item.status}`}>
                        {getStatusLabel(item.status)}
                      </span>
                      {item.reviewNote && (
                        <p className="table-subtitle" title={item.reviewNote}>
                          Ghi chú: {item.reviewNote.substring(0, 30)}
                          {item.reviewNote.length > 30 ? '...' : ''}
                        </p>
                      )}
                    </td>
                    <td>
                      <small>{formatDate(item.createdAt)}</small>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => openReviewModal(item)}
                        >
                          Xem xét
                        </button>
                        {item.resumeUrl && (
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => window.open(item.resumeUrl!, '_blank')}
                          >
                            CV
                          </button>
                        )}
                        <button type="button" className="danger-btn" onClick={() => handleDelete(item)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <div>
                <h2>Xem xét hồ sơ ứng tuyển</h2>
                <p className="review-modal-subtitle">Đánh giá và cập nhật trạng thái ứng viên</p>
              </div>
              <button 
                type="button" 
                className="review-modal-close"
                onClick={() => setReviewModal(null)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="review-modal-body">
              {/* Candidate Info Section */}
              <div className="review-section">
                <h3 className="review-section-title">Thông tin ứng viên</h3>
                <div className="review-info-grid">
                  <div className="review-info-item">
                    <span className="review-info-label"> Họ tên</span>
                    <span className="review-info-value">{reviewModal.application.fullName}</span>
                  </div>
                  <div className="review-info-item">
                    <span className="review-info-label">Email</span>
                    <span className="review-info-value">{reviewModal.application.email}</span>
                  </div>
                  <div className="review-info-item">
                    <span className="review-info-label">Số điện thoại</span>
                    <span className="review-info-value">{reviewModal.application.phone}</span>
                  </div>
                  {reviewModal.application.address && (
                    <div className="review-info-item">
                      <span className="review-info-label">Địa chỉ</span>
                      <span className="review-info-value">{reviewModal.application.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Posting Info */}
              <div className="review-section">
                <h3 className="review-section-title">Vị trí ứng tuyển</h3>
                <div className="review-job-card">
                  <div>
                    <div className="review-job-title">{reviewModal.application.jobPostingTitle}</div>
                    <div className="review-job-position">{reviewModal.application.jobPostingPosition}</div>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {reviewModal.application.coverLetter && (
                <div className="review-section">
                  <h3 className="review-section-title">Thư xin việc</h3>
                  <div className="review-cover-letter">
                    {reviewModal.application.coverLetter}
                  </div>
                </div>
              )}

              {/* Resume Link */}
              {reviewModal.application.resumeUrl && (
                <div className="review-section">
                  <h3 className="review-section-title">Hồ sơ đính kèm</h3>
                  <button
                    type="button"
                    className="review-resume-btn"
                    onClick={() => window.open(reviewModal.application.resumeUrl!, '_blank')}
                  >
                    <span>Xem CV/Resume</span>
                    <span className="review-resume-arrow">→</span>
                  </button>
                </div>
              )}

              {/* Status & Note Section */}
              <div className="review-section">
                <h3 className="review-section-title">Đánh giá & Trạng thái</h3>
                
                <label className="review-field">
                  <span className="review-field-label">Trạng thái <span className="required">*</span></span>
                  <select
                    value={reviewModal.status}
                    onChange={(e) =>
                      setReviewModal((prev) =>
                        prev ? { ...prev, status: e.target.value as JobApplicationStatus } : null
                      )
                    }
                    className="review-select"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="reviewing">Đang xem xét</option>
                    <option value="approved">Chấp nhận</option>
                    <option value="rejected">Từ chối</option>
                  </select>
                </label>

                <label className="review-field">
                  <span className="review-field-label">Ghi chú đánh giá</span>
                  <textarea
                    value={reviewModal.note}
                    onChange={(e) =>
                      setReviewModal((prev) => (prev ? { ...prev, note: e.target.value } : null))
                    }
                    rows={4}
                    className="review-textarea"
                    placeholder="Nhập ghi chú về ứng viên, lý do chấp nhận/từ chối, hoặc kế hoạch tiếp theo..."
                  />
                </label>
              </div>
            </div>

            <div className="review-modal-footer">
              <button type="button" className="ghost-btn" onClick={() => setReviewModal(null)}>
                Hủy bỏ
              </button>
              <button type="button" className="primary-btn" onClick={handleUpdateStatus}>
                Lưu cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        danger={confirmModal.danger}
      />
    </div>
  );
};

export default AdminJobApplicationsPage;
