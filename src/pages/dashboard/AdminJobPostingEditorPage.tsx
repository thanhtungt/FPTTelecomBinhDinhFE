import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JobPostingAPI } from '../../api/jobPostings';
import type { CreateJobPostingPayload, UpdateJobPostingPayload } from '../../types/jobPosting';
import { useToast } from '../../hooks/useToast';

const AdminJobPostingEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateJobPostingPayload>({
    title: '',
    description: '',
    position: '',
    department: '',
    location: '',
    employmentType: 'Full-time',
    experienceLevel: 'Junior',
    salaryMin: null,
    salaryMax: null,
    requirements: '',
    benefits: '',
    numberOfPositions: 1,
    applicationDeadline: null,
    status: 'draft'
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchJobPosting(Number(id));
    }
  }, [id, isEditMode]);

  const fetchJobPosting = async (postingId: number) => {
    setLoading(true);
    try {
      const data = await JobPostingAPI.getById(postingId);
      setFormData({
        title: data.title,
        description: data.description,
        position: data.position,
        department: data.department,
        location: data.location,
        employmentType: data.employmentType,
        experienceLevel: data.experienceLevel,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        requirements: data.requirements || '',
        benefits: data.benefits || '',
        numberOfPositions: data.numberOfPositions,
        applicationDeadline: data.applicationDeadline,
        status: data.status
      });
    } catch (error) {
      console.error(error);
      showToast('Không thể tải thông tin tin tuyển dụng', 'error');
      navigate('/dashboard/job-postings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tiêu đề', 'error');
      return;
    }
    if (!formData.position.trim()) {
      showToast('Vui lòng nhập vị trí', 'error');
      return;
    }
    if (!formData.department.trim()) {
      showToast('Vui lòng nhập phòng ban', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('Vui lòng nhập mô tả công việc', 'error');
      return;
    }
    
    // Validate application deadline
    if (formData.applicationDeadline) {
      const deadlineDate = new Date(formData.applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (deadlineDate < today) {
        showToast('Hạn nộp hồ sơ không được là ngày trong quá khứ', 'error');
        return;
      }
    }
    
    // Validate salary range
    if (formData.salaryMin && formData.salaryMax && formData.salaryMin > formData.salaryMax) {
      showToast('Mức lương tối thiểu không được lớn hơn mức lương tối đa', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && id) {
        await JobPostingAPI.update(Number(id), formData);
        showToast('Tin tuyển dụng đã được cập nhật', 'success');
      } else {
        const payload: CreateJobPostingPayload = {
          title: formData.title,
          description: formData.description,
          position: formData.position,
          department: formData.department,
          location: formData.location,
          employmentType: formData.employmentType,
          experienceLevel: formData.experienceLevel,
          salaryMin: formData.salaryMin,
          salaryMax: formData.salaryMax,
          requirements: formData.requirements || null,
          benefits: formData.benefits || null,
          numberOfPositions: formData.numberOfPositions,
          applicationDeadline: formData.applicationDeadline
        };
        await JobPostingAPI.create(payload);
        showToast('Tin tuyển dụng đã được tạo', 'success');
      }
      navigate('/dashboard/job-postings');
    } catch (error) {
      console.error(error);
      showToast('Không thể lưu tin tuyển dụng', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/job-postings');
  };

  if (loading) {
    return (
      <div className="container">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="section-header">
        <div>
          <p className="eyebrow">Quản lý tuyển dụng</p>
          <h1>{isEditMode ? 'Sửa tin tuyển dụng' : 'Tạo tin tuyển dụng mới'}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="package-editor-form">
        <div className="form-grid">
          {/* Tiêu đề & Vị trí */}
          <div className="form-group">
            <label htmlFor="title">
              Tiêu đề tin tuyển dụng <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ví dụ: Tuyển dụng Nhân viên Kinh doanh"
              required
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label htmlFor="position">
              Vị trí <span className="required">*</span>
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Ví dụ: Nhân viên Kinh doanh"
              required
              maxLength={100}
            />
          </div>

          {/* Phòng ban & Địa điểm */}
          <div className="form-group">
            <label htmlFor="department">
              Phòng ban <span className="required">*</span>
            </label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Ví dụ: Phòng Kinh doanh"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">
              Địa điểm làm việc <span className="required">*</span>
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ví dụ: Hà Nội, TP.HCM"
              required
              maxLength={200}
            />
          </div>

          {/* Loại hình & Kinh nghiệm */}
          <div className="form-group">
            <label htmlFor="employmentType">
              Loại hình công việc <span className="required">*</span>
            </label>
            <select
              id="employmentType"
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              required
            >
              <option value="Full-time">Toàn thời gian (Full-time)</option>
              <option value="Part-time">Bán thời gian (Part-time)</option>
              <option value="Contract">Hợp đồng (Contract)</option>
              <option value="Internship">Thực tập (Internship)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="experienceLevel">
              Cấp độ kinh nghiệm <span className="required">*</span>
            </label>
            <select
              id="experienceLevel"
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              required
            >
              <option value="Junior">Mới vào nghề (Junior)</option>
              <option value="Mid-level">Trung cấp (Mid-level)</option>
              <option value="Senior">Cao cấp (Senior)</option>
              <option value="Lead">Trưởng nhóm (Lead)</option>
              <option value="Manager">Quản lý (Manager)</option>
            </select>
          </div>

          {/* Số lượng & Deadline */}
          <div className="form-group">
            <label htmlFor="numberOfPositions">
              Số lượng cần tuyển <span className="required">*</span>
            </label>
            <input
              type="number"
              id="numberOfPositions"
              value={formData.numberOfPositions}
              onChange={(e) => setFormData({ ...formData, numberOfPositions: parseInt(e.target.value) })}
              min={1}
              max={1000}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="applicationDeadline">
              Hạn nộp hồ sơ <span className="required">*</span>
            </label>
            <input
              type="date"
              id="applicationDeadline"
              value={formData.applicationDeadline?.split('T')[0] ?? ''}
              onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value || null })}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Lương */}
          <div className="form-group">
            <label htmlFor="salaryMin">
              Mức lương tối thiểu (VND)
            </label>
            <input
              type="number"
              id="salaryMin"
              value={formData.salaryMin ?? ''}
              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value ? parseFloat(e.target.value) : null })}
              min={0}
              step={1000000}
              placeholder="10000000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="salaryMax">
              Mức lương tối đa (VND)
            </label>
            <input
              type="number"
              id="salaryMax"
              value={formData.salaryMax ?? ''}
              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value ? parseFloat(e.target.value) : null })}
              min={0}
              step={1000000}
              placeholder="20000000"
            />
          </div>

          {/* Status (chỉ khi edit) */}
          {isEditMode && (
            <div className="form-group">
              <label htmlFor="status">
                Trạng thái
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="draft">Nháp</option>
                <option value="active">Đang mở</option>
                <option value="closed">Đã đóng</option>
                <option value="expired">Hết hạn</option>
              </select>
            </div>
          )}

          {/* Mô tả công việc */}
          <div className="form-group full-width">
            <label htmlFor="description">
              Mô tả công việc <span className="required">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={10}
              placeholder="Mô tả chi tiết về công việc, trách nhiệm chính, môi trường làm việc...&#10;&#10;Ví dụ:&#10;- Tư vấn và bán sản phẩm/dịch vụ cho khách hàng&#10;- Chăm sóc và duy trì mối quan hệ với khách hàng&#10;- Báo cáo kết quả công việc hàng tuần"
              required
            />
          </div>

          {/* Yêu cầu */}
          <div className="form-group full-width">
            <label htmlFor="requirements">
              Yêu cầu ứng viên
            </label>
            <textarea
              id="requirements"
              value={formData.requirements || ''}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={8}
              placeholder="Yêu cầu về kinh nghiệm, kỹ năng, bằng cấp...&#10;&#10;Ví dụ:&#10;- Tốt nghiệp Đại học chuyên ngành kinh tế, quản trị kinh doanh&#10;- Có ít nhất 1 năm kinh nghiệm trong lĩnh vực kinh doanh&#10;- Kỹ năng giao tiếp tốt, thuyết trình tự tin&#10;- Sử dụng tốt tin học văn phòng"
            />
          </div>

          {/* Quyền lợi */}
          <div className="form-group full-width">
            <label htmlFor="benefits">
              Quyền lợi & Phúc lợi
            </label>
            <textarea
              id="benefits"
              value={formData.benefits || ''}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              rows={8}
              placeholder="Các quyền lợi, chế độ đãi ngộ...&#10;&#10;Ví dụ:&#10;- Lương cơ bản + thưởng KPI + hoa hồng&#10;- Đầy đủ chế độ BHXH, BHYT, BHTN theo quy định&#10;- Thưởng lễ, tết, sinh nhật&#10;- Du lịch, team building hàng năm&#10;- Cơ hội thăng tiến rõ ràng"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="ghost-btn" onClick={handleCancel} disabled={submitting}>
            Hủy
          </button>
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminJobPostingEditorPage;
