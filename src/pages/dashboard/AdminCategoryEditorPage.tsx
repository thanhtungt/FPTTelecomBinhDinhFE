import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CategoryAPI } from '../../api/categories';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/category';
import { useToast } from '../../hooks/useToast';

const AdminCategoryEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayOrder: 0,
    active: true
  });

  useEffect(() => {
    if (!id) return;

    const fetchCategory = async () => {
      setLoading(true);
      try {
        const data = await CategoryAPI.getById(parseInt(id, 10));
        setCategory(data);
        setFormData({
          name: data.name,
          displayOrder: data.displayOrder,
          active: data.active
        });
      } catch (error) {
        console.error('[AdminCategoryEditorPage] Error fetching category:', error);
        showToast('Không thể tải danh mục', 'error');
        navigate('/dashboard/categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, showToast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên danh mục', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateCategoryDto | UpdateCategoryDto = {
        name: formData.name.trim(),
        displayOrder: formData.displayOrder,
        active: formData.active
      };

      if (isEditMode && category) {
        await CategoryAPI.update(category.id, payload);
        showToast('Danh mục đã được cập nhật', 'success');
      } else {
        await CategoryAPI.create(payload);
        showToast('Danh mục đã được tạo', 'success');
      }
      navigate('/dashboard/categories');
    } catch (error: any) {
      console.error('[AdminCategoryEditorPage] Error:', error);
      const message = error.response?.data?.message || 'Không thể lưu danh mục';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/categories');
  };

  if (loading) {
    return (
      <div className="container">
        <p>Đang tải danh mục...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="section-header">
        <div>
          <p className="eyebrow">Quản lý hệ thống</p>
          <h1>{isEditMode ? 'Sửa danh mục' : 'Tạo danh mục mới'}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="package-editor-form">
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="name">
              Tên danh mục <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Internet Gói, Internet Combo Truyền hình"
              required
            />
            <small className="form-hint">Slug sẽ được tự động tạo từ tên danh mục</small>
          </div>

          <div className="form-group">
            <label htmlFor="displayOrder">
              Thứ tự hiển thị <span className="required">*</span>
            </label>
            <input
              type="number"
              id="displayOrder"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              min="0"
              required
            />
            <small className="form-hint">Số thứ tự ưu tiên hiển thị (nhỏ hơn = hiển thị trước)</small>
          </div>

          <div className="form-group full-width">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <span>Kích hoạt danh mục</span>
            </label>
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

export default AdminCategoryEditorPage;
