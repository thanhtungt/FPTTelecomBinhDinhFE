import { useEffect, useMemo, useState } from 'react';
import { PackageAPI } from '../api/packages';
import type { Package } from '../types/package';
import PackageCard from '../components/cards/PackageCard';
import QuickRegistrationForm from '../components/forms/QuickRegistrationForm';
// cspell:ignore Mbps

const speedOptions = [
  { label: 'All speeds', value: 0 },
  { label: '≥ 200 Mbps', value: 200 },
  { label: '≥ 500 Mbps', value: 500 }
];

const PackagesPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [selected, setSelected] = useState<number | undefined>();

  useEffect(() => {
    let mounted = true;
    const fetchPackages = async () => {
      try {
        const data = await PackageAPI.getAll();
        if (!mounted) return;
        setPackages(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPackages();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => packages.filter((item) => item.speedDown >= speed), [packages, speed]);

  return (
    <div className="page packages-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Packages</p>
          <h1>Engineered for symmetric uploads, live streaming, and always-on work.</h1>
        </div>
        <div className="filter-group">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              className={speed === option.value ? 'chip active' : 'chip'}
              onClick={() => setSpeed(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {loading && <p>Loading packages...</p>}
      {!loading && (
        <div className="packages-layout">
          <div className="grid two">
            {filtered.map((item) => (
              <PackageCard key={item.id} item={item} onSelect={() => setSelected(item.id)} />
            ))}
          </div>
          <div className="sticky-form">
            <QuickRegistrationForm packages={packages} selectedPackageId={selected} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesPage;
