import type { Package } from '../../types/package';
import { formatCurrency } from '../../utils/format';

interface PackageCardProps {
  item: Package;
  onSelect?: (pkg: Package) => void;
  featured?: boolean;
}

const PackageCard = ({ item, onSelect, featured = false }: PackageCardProps) => {
  const handleRegisterClick = () => {
    // Open registration form in new tab with selected package
    window.open(`/register-package?package=${item.id}`, '_blank');
    onSelect?.(item);
  };

  return (
    <article className={`package-card ${featured ? 'package-card--featured' : ''}`}>
      {/* Header with image */}
      <div className="package-card__image-wrapper">
        {featured && (
          <div className="package-card__badge">
            <span>Phổ biến ⚡</span>
          </div>
        )}
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="package-card__image" />
        ) : (
          <div className="package-card__placeholder">
            <div className="package-card__placeholder-icon">📡</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="package-card__content">
        <h3 className="package-card__title">{item.name}</h3>
        
        <div className="package-card__pricing">
          <span className="package-card__pricing-label">Chỉ từ</span>
          <div className="package-card__pricing-amount">
            <strong>{formatCurrency(item.priceMonthly)}</strong>
            <span>/tháng</span>
          </div>
        </div>

        {/* Features list with checkmarks */}
        <ul className="package-card__features">
          <li className="package-card__feature">
            <span className="package-card__check">✓</span>
            <span>Tốc độ tải xuống {item.speedDown} Mbps</span>
          </li>
          <li className="package-card__feature">
            <span className="package-card__check">✓</span>
            <span>Tốc độ tải lên {item.speedUp} Mbps</span>
          </li>
          {item.promotionText && (
            <li className="package-card__feature">
              <span className="package-card__check">✓</span>
              <span>{item.promotionText}</span>
            </li>
          )}
          {item.deviceBonus && (
            <li className="package-card__feature">
              <span className="package-card__check">✓</span>
              <span>{item.deviceBonus}</span>
            </li>
          )}
        </ul>

        {/* Actions */}
        <div className="package-card__actions">
          <button className="package-card__link">Xem chi tiết</button>
          <button className="package-card__cta" onClick={handleRegisterClick}>
            Đăng ký ngay
          </button>
        </div>
      </div>
    </article>
  );
};

export default PackageCard;
