import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryAPI } from '../../api/categories';
import type { Category } from '../../types/category';
import { useToast } from '../../hooks/useToast';

const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CategoryAPI.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('[AdminCategoriesPage] Error fetching categories:', error);
      showToast('Không thể tải danh mục', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (category: Category) => {
    if (!confirm(`Xóa danh mục "${category.name}"?`)) return;
    try {
      await CategoryAPI.remove(category.id);
      setCategories((prev) => prev.filter((item) => item.id !== category.id));
      showToast('Danh mục đã được xóa', 'success');
    } catch (error: any) {
      console.error('[AdminCategoriesPage] Error deleting category:', error);
      const message = error.response?.data?.message || 'Không thể xóa danh mục';
      showToast(message, 'error');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const updated = await CategoryAPI.toggleActive(category.id);
      setCategories((prev) =>
        prev.map((item) => (item.id === category.id ? updated : item))
      );
      showToast(
        `Danh mục đã ${updated.active ? 'kích hoạt' : 'vô hiệu hóa'}`,
        'success'
      );
    } catch (error) {
      console.error('[AdminCategoriesPage] Error toggling active:', error);
      showToast('Không thể thay đổi trạng thái', 'error');
    }
  };

  const handleRefresh = () => {
    fetchCategories();
  };

  const handleCreateNew = () => {
    navigate('/dashboard/categories/new');
  };

  const handleEdit = (category: Category) => {
    navigate(`/dashboard/categories/${category.id}/edit`);
  };

  return (
    <div className="container">
      <header className="section-header">
        <div>
          <p className="eyebrow">Quản lý hệ thống</p>
          <h1>Danh mục gói cước</h1>
        </div>
        <button type="button" className="primary-btn" onClick={handleCreateNew}>
          + Tạo danh mục mới
        </button>
      </header>

      <section className="posts-panel">
        <div className="posts-panel__controls">
          <button type="button" className="ghost-btn" onClick={handleRefresh} disabled={loading}>
            Tải lại
          </button>
        </div>
        {loading ? (
          <p>Đang tải danh mục...</p>
        ) : categories.length === 0 ? (
          <p className="empty-state">Chưa có danh mục nào.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Slug</th>
                  <th>Thứ tự</th>
                  <th>Số gói cước</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>
                      <small>{item.slug}</small>
                    </td>
                    <td>{item.displayOrder}</td>
                    <td>{item.packageCount || 0}</td>
                    <td>
                      <span className={`table-chip ${item.active ? 'active' : 'inactive'}`}>
                        {item.active ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="ghost-btn" onClick={() => handleEdit(item)}>
                          Sửa
                        </button>
                        <button
                          type="button"
                          className={item.active ? 'ghost-btn' : 'primary-btn'}
                          onClick={() => handleToggleActive(item)}
                        >
                          {item.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
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
    </div>
  );
};

export default AdminCategoriesPage;
