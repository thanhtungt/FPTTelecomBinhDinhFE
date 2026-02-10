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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error('[PackagesPage] Error loading categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Load packages (filtered by category)
  useEffect(() => {
    let mounted = true;
    const fetchPackages = async () => {
      setLoading(true);
      try {
        const data = await PackageAPI.getAll(selectedCategory || undefined);
        if (!mounted) return;
        setPackages(data);
      } catch (error) {
        console.error('[PackagesPage] Error loading packages:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPackages();
    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  return (
    <div className="page packages-page">
      {/* Category tabs - Figma style */}
      <div className="category-tabs">
        <button
          className={selectedCategory === null ? 'category-tab category-tab--active' : 'category-tab'}
          onClick={() => setSelectedCategory(null)}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={selectedCategory === cat.id ? 'category-tab category-tab--active' : 'category-tab'}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <header className="page-header">
        <div>
          <p className="eyebrow">Gói cước</p>
          <h1>Được thiết kế cho tải lên đồng bộ, luồng trực tiếp và làm việc luôn.</h1>
        </div>
      </header>

      {loading && <p>Đang tải gói cước...</p>}
      {!loading && (
        <div className="packages-grid">
          {packages.map((item, index) => (
            <PackageCard 
              key={item.id} 
              item={item} 
              onSelect={() => {/* TODO: Open registration modal */}}
              featured={index % 2 === 1} // Mark every other package as featured
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PackagesPage;
