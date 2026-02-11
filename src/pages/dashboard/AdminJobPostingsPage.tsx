import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobPostingAPI } from '../../api/jobPostings';
import type { JobPosting, JobPostingStatus } from '../../types/jobPosting';
import { PostTableSkeleton } from '../../components/feedback/Skeleton';
import { formatDate } from '../../utils/format';
import { useToast } from '../../hooks/useToast';

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

  const handleDelete = async (posting: JobPosting) => {
    if (!confirm(`Xóa tin tuyển dụng "${posting.title}"?`)) return;
    try {
      await JobPostingAPI.remove(posting.id);
      setJobPostings((prev) => prev.filter((item) => item.id !== posting.id));
      showToast('Tin tuyển dụng đã được xóa', 'success');
    } catch (error) {
      console.error(error);
      showToast('Không thể xóa tin tuyển dụng', 'error');
    }
  };

  const handleStatusChange = async (posting: JobPosting, newStatus: JobPostingStatus) => {
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
          + Tạo tin tuyển dụng mới
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
                  <th>Tiêu đề & Vị trí</th>
                  <th>Phòng ban</th>
                  <th>Địa điểm</th>
                  <th>Trạng thái</th>
                  <th>Số hồ sơ</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPostings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      <p className="table-subtitle">{item.position}</p>
                    </td>
                    <td>
                      <span className="table-chip">{item.department}</span>
                    </td>
                    <td>
                      <small>{item.location}</small>
                    </td>
                    <td>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item, e.target.value as JobPostingStatus)
                        }
                        className="table-select"
                      >
                        <option value="draft">Nháp</option>
                        <option value="active">Đang mở</option>
                        <option value="closed">Đã đóng</option>
                        <option value="expired">Hết hạn</option>
                      </select>
                    </td>
                    <td>
                      <strong>{item.applicationCount}</strong>
                    </td>
                    <td>
                      <small>{formatDate(item.createdAt)}</small>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="ghost-btn" onClick={() => handleEdit(item)}>
                          Sửa
                        </button>
                        <button type="button" className="danger-btn" onClick={() => handleDelete(item)}>
                          Xóa
                        </button>
                        <button
                          type="button"
                          className="ghost-btn"
                          onClick={() => window.open(`/careers/${item.id}`, '_blank')}
                        >
                          Xem
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
    </div>
  );
};

export default AdminJobPostingsPage;
