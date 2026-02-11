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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? null : Number(value)
    }));
  };

  return (
    <div className="container">
      <header className="section-header">
        <div>
          <p className="eyebrow">Quản lý tuyển dụng</p>
          <h1>{isEditMode ? 'Chỉnh sửa tin tuyển dụng' : 'Tạo tin tuyển dụng mới'}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h2>Thông tin cơ bản</h2>
          
          <div className="form-row">
            <label>
              Tiêu đề <span className="required">*</span>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="Ví dụ: Tuyển dụng nhân viên kinh doanh"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Vị trí <span className="required">*</span>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Ví dụ: Nhân viên kinh doanh"
              />
            </label>
            <label>
              Phòng ban <span className="required">*</span>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Ví dụ: Kinh doanh"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Địa điểm <span className="required">*</span>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="Ví dụ: Hà Nội"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Loại hình công việc
              <select name="employmentType" value={formData.employmentType} onChange={handleChange}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </label>
            <label>
              Cấp độ kinh nghiệm
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
                <option value="Junior">Junior</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Manager">Manager</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Mức lương tối thiểu (VND)
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin ?? ''}
                onChange={handleNumberChange}
                min={0}
                placeholder="Ví dụ: 10000000"
              />
            </label>
            <label>
              Mức lương tối đa (VND)
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax ?? ''}
                onChange={handleNumberChange}
                min={0}
                placeholder="Ví dụ: 15000000"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Số lượng tuyển dụng
              <input
                type="number"
                name="numberOfPositions"
                value={formData.numberOfPositions}
                onChange={handleNumberChange}
                required
                min={1}
                max={1000}
              />
            </label>
            <label>
              Hạn nộp hồ sơ
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline?.split('T')[0] ?? ''}
                onChange={handleChange}
              />
            </label>
          </div>

          {isEditMode && (
            <div className="form-row">
              <label>
                Trạng thái
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="draft">Nháp</option>
                  <option value="active">Đang mở</option>
                  <option value="closed">Đã đóng</option>
                  <option value="expired">Hết hạn</option>
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Mô tả công việc</h2>
          <label>
            Mô tả chi tiết <span className="required">*</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={8}
              placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Yêu cầu</h2>
          <label>
            Yêu cầu ứng viên
            <textarea
              name="requirements"
              value={formData.requirements || ''}
              onChange={handleChange}
              rows={6}
              placeholder="Yêu cầu về kinh nghiệm, kỹ năng, bằng cấp..."
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Quyền lợi</h2>
          <label>
            Quyền lợi được hưởng
            <textarea
              name="benefits"
              value={formData.benefits || ''}
              onChange={handleChange}
              rows={6}
              placeholder="Các quyền lợi, chế độ đãi ngộ..."
            />
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => navigate('/dashboard/job-postings')}
            disabled={loading}
          >
            Hủy
          </button>
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Tạo tin tuyển dụng'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminJobPostingEditorPage;
