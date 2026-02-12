import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PackageAPI } from '../api/packages';
import type { Package } from '../types/package';
import { formatCurrency } from '../utils/format';

const PackageDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await PackageAPI.getById(Number(id));
        setPackageData(data);
      } catch (error) {
        console.error('[PackageDetailPage] Error loading package:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  const handleRegister = () => {
    if (packageData) {
      window.open(`/register-package?package=${packageData.id}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="page package-detail-page">
        <div className="loading-state">Đang tải thông tin gói...</div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="page package-detail-page">
        <div className="error-state">
          <h2>Không tìm thấy gói cước</h2>
          <button className="primary-btn" onClick={() => navigate('/packages')}>
            Quay lại danh sách gói
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page package-detail-page">
      <div className="package-detail-container">
        {/* Header with image */}
        <section className="package-detail-header">
          <div className="package-detail-image">
            {packageData.imageUrl ? (
              <img src={packageData.imageUrl} alt={packageData.name} />
            ) : (
              <div className="package-detail-placeholder">
                <div className="package-detail-placeholder-icon">📡</div>
              </div>
            )}
          </div>
          <div className="package-detail-info">
            <div className="package-category-badge">{packageData.categoryName}</div>
            <h1 className="package-detail-title">{packageData.name}</h1>
            <div className="package-detail-pricing">
              <div className="pricing-main">
                <span className="pricing-amount">{formatCurrency(packageData.priceMonthly)}</span>
                <span className="pricing-period">/tháng</span>
              </div>
            </div>
            <div className="package-detail-actions">
              <button className="primary-btn primary-btn--large" onClick={handleRegister}>
                Đăng ký ngay
              </button>
              <button className="ghost-btn" onClick={() => navigate('/packages')}>
                Xem gói khác
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="package-detail-section">
          <h2 className="section-title">Thông tin gói cước</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-content">
                <h3>Tốc độ tải xuống</h3>
                <p className="feature-value">{packageData.speedDown} Mbps</p>
                <p className="feature-desc">Tốc độ tải xuống cực nhanh cho mọi nhu cầu</p>
              </div>
            </div>
                    <div className="feature-card">
              <div className="feature-content">
                <h3>Tốc độ tải lên</h3>
                <p className="feature-value">{packageData.speedUp} Mbps</p>
                <p className="feature-desc">Upload file, livestream mượt mà</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-content">
                <h3>Giá cước hàng tháng</h3>
                <p className="feature-value">{formatCurrency(packageData.priceMonthly)}</p>
                <p className="feature-desc">Giá chưa bao gồm VAT</p>
              </div>
            </div>
          </div>
        </section>

        {/* Promotions & Benefits */}
        {(packageData.promotionText || packageData.deviceBonus) && (
          <section className="package-detail-section">
            <h2 className="section-title">Ưu đãi & Quà tặng</h2>
            <div className="benefits-list">
              {packageData.promotionText && (
                <div className="benefit-item">
                  <span className="benefit-text">{packageData.promotionText}</span>
                </div>
              )}
              {packageData.deviceBonus && (
                <div className="benefit-item">
                  <span className="benefit-text">{packageData.deviceBonus}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Additional Information */}
        <section className="package-detail-section">
          <h2 className="section-title">Điều khoản & Lưu ý</h2>
          <div className="terms-list">
            <div className="term-item">
              <span className="term-icon">✓</span>
              <span>Miễn phí lắp đặt tại nhà trong vòng 24 giờ</span>
            </div>
            <div className="term-item">
              <span className="term-icon">✓</span>
              <span>Hỗ trợ kỹ thuật 24/7 qua hotline và online</span>
            </div>
            <div className="term-item">
              <span className="term-icon">✓</span>
              <span>Cam kết tốc độ ổn định theo gói đăng ký</span>
            </div>
            <div className="term-item">
              <span className="term-icon">✓</span>
              <span>Không giới hạn dung lượng sử dụng</span>
            </div>
            <div className="term-item">
              <span className="term-icon">✓</span>
              <span>Thanh toán linh hoạt theo tháng hoặc năm</span>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="package-detail-cta">
          <div className="cta-content">
            <h3>Sẵn sàng trải nghiệm?</h3>
            <p>Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt</p>
            <button className="primary-btn primary-btn--large" onClick={handleRegister}>
              Đăng ký {packageData.name}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PackageDetailPage;
