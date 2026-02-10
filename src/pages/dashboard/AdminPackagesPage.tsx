import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageAPI } from '../../api/packages';
import type { Package } from '../../types/package';
import { useToast } from '../../hooks/useToast';

const AdminPackagesPage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PackageAPI.getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error('[AdminPackagesPage] Error fetching packages:', error);
      showToast('Không thể tải gói cước', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const filteredPackages = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return packages;
    return packages.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [packages, search]);

  const handleDelete = async (pkg: Package) => {
    if (!confirm(`Xóa gói cước "${pkg.name}"?`)) return;
    try {
      await PackageAPI.remove(pkg.id);
      setPackages((prev) => prev.filter((item) => item.id !== pkg.id));
      showToast('Gói cước đã được xóa', 'success');
    } catch (error: any) {
      console.error('[AdminPackagesPage] Error deleting package:', error);
      const message = error.response?.data?.message || 'Không thể xóa gói cước';
      showToast(message, 'error');
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      const updated = await PackageAPI.toggleActive(pkg.id);
      setPackages((prev) =>
        prev.map((item) => (item.id === pkg.id ? updated : item))
      );
      showToast(
        `Gói cước đã ${updated.active ? 'kích hoạt' : 'vô hiệu hóa'}`,
        'success'
      );
    } catch (error) {
      console.error('[AdminPackagesPage] Error toggling active:', error);
      showToast('Không thể thay đổi trạng thái', 'error');
    }
  };

  const handleRefresh = () => {
    fetchPackages();
  };

  const handleCreateNew = () => {
    navigate('/dashboard/packages/new');
  };

  const handleEdit = (pkg: Package) => {
    navigate(`/dashboard/packages/${pkg.id}/edit`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="container">
      <header className="section-header">
        <div>
          <p className="eyebrow">Quản lý hệ thống</p>
          <h1>Gói cước</h1>
        </div>
        <button type="button" className="primary-btn" onClick={handleCreateNew}>
          + Tạo gói cước mới
        </button>
      </header>

      <section className="posts-panel">
        <div className="posts-panel__controls">
          <input
            type="search"
            placeholder="Tìm kiếm theo tên gói"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="button" className="ghost-btn" onClick={handleRefresh} disabled={loading}>
            Tải lại
          </button>
        </div>
        {loading ? (
          <p>Đang tải gói cước...</p>
        ) : filteredPackages.length === 0 ? (
          <p className="empty-state">Không tìm thấy gói cước.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tên gói</th>
                  <th>Tốc độ</th>
                  <th>Giá/tháng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      {item.promotionText && (
                        <p className="table-subtitle">{item.promotionText}</p>
                      )}
                    </td>
                    <td>
                      <small>
                        ↓ {item.speedDown} Mbps / ↑ {item.speedUp} Mbps
                      </small>
                    </td>
                    <td>
                      <strong>{formatPrice(item.priceMonthly)}</strong>
                    </td>
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

export default AdminPackagesPage;
