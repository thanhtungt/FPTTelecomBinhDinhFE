import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobPostingAPI } from '../../api/jobPostings';
import type { JobPosting, JobPostingStatus } from '../../types/jobPosting';
import { PostTableSkeleton } from '../../components/feedback/Skeleton';
import { formatDate } from '../../utils/format';
import { useToast } from '../../hooks/useToast';
import ConfirmModal from '../../components/common/ConfirmModal';

const statusFilters: Array<{ label: string; value: 'all' | JobPostingStatus }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nháp', value: 'draft' },
  { label: 'Đang mở', value: 'active' },
  { label: 'Đã đóng', value: 'closed' },
  { label: 'Hết hạn', value: 'expired' }
];

const AdminJobPostingsPage = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | JobPostingStatus>('all');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();
  
  // Confirmation modal state
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

  const fetchJobPostings = useCallback(
    async (status: 'all' | JobPostingStatus) => {
      setLoading(true);
      try {
        const data = await JobPostingAPI.getAll(status === 'all' ? undefined : status);
        setJobPostings(data);
      } catch (error) {
        console.error(error);
        showToast('Không thể tải danh sách tin tuyển dụng', 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchJobPostings(statusFilter);
  }, [statusFilter, fetchJobPostings]);

  const filteredPostings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return jobPostings;
    return jobPostings.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.position.toLowerCase().includes(keyword) ||
        item.department.toLowerCase().includes(keyword)
    );
  }, [jobPostings, search]);

  const handleDelete = (posting: JobPosting) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa tin tuyển dụng',
      message: `Bạn có chắc chắn muốn xóa tin tuyển dụng "${posting.title}"?\n\nHành động này không thể hoàn tác.`,
      danger: true,
      onConfirm: async () => {
        try {
          await JobPostingAPI.remove(posting.id);
          setJobPostings((prev) => prev.filter((item) => item.id !== posting.id));
          showToast('Tin tuyển dụng đã được xóa', 'success');
        } catch (error) {
          console.error(error);
          showToast('Không thể xóa tin tuyển dụng', 'error');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleStatusChange = (posting: JobPosting, newStatus: JobPostingStatus) => {
    const statusLabels: Record<JobPostingStatus, string> = {
      draft: 'Nháp',
      active: 'Đang mở',
      closed: 'Đã đóng',
      expired: 'Hết hạn'
    };
    
    setConfirmModal({
      isOpen: true,
      title: 'Cập nhật trạng thái',
      message: `Bạn có chắc chắn muốn chuyển trạng thái thành "${statusLabels[newStatus]}"?`,
      danger: false,
      onConfirm: async () => {
        try {
          const updated = await JobPostingAPI.updateStatus(posting.id, newStatus);
          setJobPostings((prev) =>
            prev.map((item) => (item.id === posting.id ? updated : item))
          );
          showToast('Trạng thái đã được cập nhật', 'success');
        } catch (error) {
          console.error(error);
          showToast('Không thể cập nhật trạng thái', 'error');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleRefresh = () => {
    fetchJobPostings(statusFilter);
  };

  const handleCreateNew = () => {
    navigate('/dashboard/job-postings/new');
  };

  const handleEdit = (posting: JobPosting) => {
    navigate(`/dashboard/job-postings/${posting.id}/edit`);
  };

  return (
    <div className="container">
      <header className="section-header">
        <div>
          <p className="eyebrow">Quản lý tuyển dụng</p>
          <h1>Tin tuyển dụng</h1>
        </div>
        <button type="button" className="primary-btn" onClick={handleCreateNew}>
          + Tạo tin tuyển dụng
        </button>
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
            placeholder="Tìm kiếm theo tiêu đề, vị trí, phòng ban"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" className="ghost-btn" onClick={handleRefresh} disabled={loading}>
            Tải lại
          </button>
        </div>
        {loading ? (
          <PostTableSkeleton />
        ) : filteredPostings.length === 0 ? (
          <p className="empty-state">Không tìm thấy tin tuyển dụng.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Vị trí</th>
                  <th>Phòng ban</th>
                  <th>Số lượng</th>
                  <th>Trạng thái</th>
                  <th>Hạn nộp</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPostings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>{item.position}</td>
                    <td>{item.department}</td>
                    <td>{item.numberOfPositions}</td>
                    <td>
                      <select
                        className="table-select"
                        value={item.status}
                        onChange={(e) => handleStatusChange(item, e.target.value as JobPostingStatus)}
                      >
                        <option value="draft">Nháp</option>
                        <option value="active">Đang mở</option>
                        <option value="closed">Đã đóng</option>
                        <option value="expired">Hết hạn</option>
                      </select>
                    </td>
                    <td>
                      <small>{item.applicationDeadline ? formatDate(item.applicationDeadline) : '—'}</small>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="ghost-btn" onClick={() => handleEdit(item)}>
                          Sửa
                        </button>
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

export default AdminJobPostingsPage;
