import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageAPI } from '../api/packages';
import type { Package } from '../types/package';
import QuickRegistrationForm from '../components/forms/QuickRegistrationForm';
import PackageCard from '../components/cards/PackageCard';

const QuickRegistrationPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const selectedPackageId = searchParams.get('package') ? Number(searchParams.get('package')) : undefined;

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = await PackageAPI.getAll();
        setPackages(data);
      } catch (error) {
        console.error('[QuickRegistrationPage] Error loading packages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="page quick-registration-page">
      {/* Registration Form Section */}
      <section className="registration-form-section">
        <div className="container">
          <div className="registration-form-wrapper">
            <QuickRegistrationForm packages={packages} selectedPackageId={selectedPackageId} />
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="packages-showcase">
        <div className="section-header">
          <h2>Gói Combo Internet WiFi 6 kèm Truyền hình FPT Play</h2>
          <p>Trải nghiệm xem phim, thi đấu Ngoại Hạng Anh trực tiếp trên FPT Play với tốc độ Internet siêu cao</p>
        </div>
        
        {loading ? (
          <p className="text-center">Đang tải gói cước...</p>
        ) : (
          <div className="packages-carousel">
            {packages.map((pkg, index) => (
              <PackageCard 
                key={pkg.id} 
                item={pkg}
                featured={index % 3 === 1}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default QuickRegistrationPage;
