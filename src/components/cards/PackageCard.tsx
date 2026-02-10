import type { Package } from '../../types/package';
import { formatCurrency } from '../../utils/format';

interface PackageCardProps {
  item: Package;
  onSelect?: (pkg: Package) => void;
}

const PackageCard = ({ item, onSelect }: PackageCardProps) => (
  <article className="package-card">
    <div className="package-card__header">
      <p className="package-card__speed">{item.speedDown} / {item.speedUp} Mbps</p>
      <h3>{item.name}</h3>
      <p className="package-card__price">{formatCurrency(item.priceMonthly)}/tháng</p>
    </div>
    <ul>
      <li>{item.promotionText}</li>
      <li>{item.deviceBonus}</li>
      <li>Đăng ký lắp đặt trong 48h</li>
    </ul>
    <button className="secondary-btn" onClick={() => onSelect?.(item)}>
      Đăng ký gói
    </button>
  </article>
);

export default PackageCard;
