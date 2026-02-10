import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PackageAPI } from '../../api/packages';
import { CategoryAPI } from '../../api/categories';
import type { Package, CreatePackageDto, UpdatePackageDto } from '../../types/package';
import type { Category } from '../../types/category';
import { useToast } from '../../hooks/useToast';

const AdminPackageEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    speedDown: 0,
    speedUp: 0,
    priceMonthly: 0,
    promotionText: '',
    deviceBonus: '',
    imageUrl: '',
    categoryId: 0,
    active: true
  });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryAPI.getAllCategories();
        setCategories(data.filter(c => c.active));
      } catch (error) {
        console.error('[AdminPackageEditorPage] Error loading categories:', error);
        showToast('Không thể tải danh mục', 'error');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [showToast]);

  // Load package for edit mode
  useEffect(() => {
    if (!id) return;

    const fetchPackage = async () => {
      setLoading(true);
      try {
        const data = await PackageAPI.getById(parseInt(id, 10));
        setPkg(data);
        setFormData({
          name: data.name,
          speedDown: data.speedDown,
          speedUp: data.speedUp,
          priceMonthly: data.priceMonthly,
          promotionText: data.promotionText,
          deviceBonus: data.deviceBonus,
          imageUrl: data.imageUrl || '',
          categoryId: data.categoryId,
          active: data.active
        });
      } catch (error) {
        console.error('[AdminPackageEditorPage] Error fetching package:', error);
        showToast('Không thể tải gói cước', 'error');
        navigate('/dashboard/packages');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id, showToast, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên gói cước', 'error');
      return;
    }
    if (formData.speedDown <= 0 || formData.speedUp <= 0) {
      showToast('Tốc độ phải lớn hơn 0', 'error');
      return;
    }
    if (formData.priceMonthly <= 0) {
      showToast('Giá phải lớn hơn 0', 'error');
      return;
    }
    if (!formData.categoryId || formData.categoryId === 0) {
      showToast('Vui lòng chọn danh mục', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreatePackageDto | UpdatePackageDto = {
        name: formData.name.trim(),
        speedDown: formData.speedDown,
        speedUp: formData.speedUp,
        priceMonthly: formData.priceMonthly,
        promotionText: formData.promotionText.trim(),
        deviceBonus: formData.deviceBonus.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
        categoryId: formData.categoryId,
        active: formData.active
      };

      if (isEditMode && pkg) {
        await PackageAPI.update(pkg.id, payload);
        showToast('Gói cước đã được cập nhật', 'success');
      } else {
        await PackageAPI.create(payload);
        showToast('Gói cước đã được tạo', 'success');
      }
      navigate('/dashboard/packages');
    } catch (error: any) {
      console.error('[AdminPackageEditorPage] Error:', error);
      const message = error.response?.data?.message || 'Không thể lưu gói cước';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/packages');
  };

  if (loading || loadingCategories) {
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
          <p className="eyebrow">Quản lý hệ thống</p>
          <h1>{isEditMode ? 'Sửa gói cước' : 'Tạo gói cước mới'}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="package-editor-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">
              Tên gói cước <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Fiber Basic"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">
              Danh mục <span className="required">*</span>
            </label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
              required
            >
              <option value="0">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="speedDown">
              Tốc độ tải xuống (Mbps) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="speedDown"
              value={formData.speedDown}
              onChange={(e) => setFormData({ ...formData, speedDown: parseFloat(e.target.value) })}
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="speedUp">
              Tốc độ tải lên (Mbps) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="speedUp"
              value={formData.speedUp}
              onChange={(e) => setFormData({ ...formData, speedUp: parseFloat(e.target.value) })}
              min="0"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="priceMonthly">
              Giá hàng tháng (VND) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="priceMonthly"
              value={formData.priceMonthly}
              onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) })}
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="promotionText">Văn bản khuyến mãi</label>
            <input
              type="text"
              id="promotionText"
              value={formData.promotionText}
              onChange={(e) => setFormData({ ...formData, promotionText: e.target.value })}
              placeholder="Ví dụ: Miễn phí 2 tháng đầu"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="deviceBonus">Thiết bị tặng kèm</label>
            <input
              type="text"
              id="deviceBonus"
              value={formData.deviceBonus}
              onChange={(e) => setFormData({ ...formData, deviceBonus: e.target.value })}
              placeholder="Ví dụ: Modem WiFi 6"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="imageUrl">URL hình ảnh</label>
            <input
              type="url"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.png"
            />
          </div>

          <div className="form-group full-width">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <span>Kích hoạt gói cước</span>
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

export default AdminPackageEditorPage;
