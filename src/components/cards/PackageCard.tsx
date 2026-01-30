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
      <p className="package-card__price">{formatCurrency(item.priceMonthly)}/month</p>
    </div>
    <ul>
      <li>{item.promotionText}</li>
      <li>{item.deviceBonus}</li>
      <li>Priority install within 48h</li>
    </ul>
    <button className="secondary-btn" onClick={() => onSelect?.(item)}>
      Book this plan
    </button>
  </article>
);

export default PackageCard;
