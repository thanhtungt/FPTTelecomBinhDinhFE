import { useEffect, useState } from 'react';
import { PackageAPI } from '../api/packages';
import { CategoryAPI } from '../api/categories';
import type { Package } from '../types/package';
import type { Category } from '../types/category';
import PackageCard from '../components/cards/PackageCard';

const PackagesPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesData, packagesData] = await Promise.all([
          CategoryAPI.getAll(),
          PackageAPI.getAll()
        ]);
        setCategories(categoriesData);
        setPackages(packagesData);
      } catch (error) {
        console.error('[PackagesPage] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group packages by category
  const packagesByCategory = categories.map(category => ({
    category,
    packages: packages.filter(pkg => pkg.categoryId === category.id)
  })).filter(group => group.packages.length > 0);

  return (
    <div className="page packages-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Gói cước</p>
          <h1>Được thiết kế cho tải lên đồng bộ, luồng trực tiếp và làm việc luôn.</h1>
        </div>
      </header>

      {loading && <p>Đang tải gói cước...</p>}
      {!loading && (
        <div className="packages-sections">
          {packagesByCategory.map(({ category, packages: categoryPackages }) => (
            <section key={category.id} className="category-section">
              <h2 className="category-section-title">{category.name}</h2>
              {category.description && (
                <p className="category-section-description">{category.description}</p>
              )}
              <div className="packages-grid">
                {categoryPackages.map((item, index) => (
                  <PackageCard 
                    key={item.id} 
                    item={item} 
                    onSelect={() => {/* TODO: Open registration modal */}}
                    featured={index % 2 === 1}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackagesPage;
