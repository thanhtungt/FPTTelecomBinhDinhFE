import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageAPI } from '../api/packages';
import { CategoryAPI } from '../api/categories';
import { PostAPI } from '../api/posts';
import type { Package } from '../types/package';
import type { Category } from '../types/category';
import type { Post } from '../types/post';
import PackageCard from '../components/cards/PackageCard';
import PostCard from '../components/cards/PostCard';
import QuickRegistrationForm from '../components/forms/QuickRegistrationForm';
import { formatCurrency } from '../utils/format';
// cspell:ignore Nhon Binh Dinh

const HomePage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const navigate = useNavigate();

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error('[HomePage] Error loading categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pkgList, postList] = await Promise.all([
          PackageAPI.getAll(selectedCategory || undefined),
          PostAPI.getAll()
        ]);
        if (!mounted) return;
        setPackages(pkgList);
        setPosts(postList.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  const heroPackage = useMemo(() => packages[0], [packages]);

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">FPT Quy Nhon fiber network</p>
          <h1>Khởi động những ý tưởng táo bạo với internet không giới hạn.</h1>
          <p>
            Gói kết nối chuyên dụng, quy trình lắp đặt chuyên nghiệp, và đội ngũ hỗ trợ chuyên nghiệp cho các phòng
            studio, quán cà phê và các gia đình cao cấp khắp Bình Định.
          </p>
          <div className="hero__actions">
            <button className="primary-btn" onClick={() => navigate('/packages')}>
              Xem gói
            </button>
            <button className="ghost-btn" onClick={() => navigate('/posts')}>
              Tin Tức & Khuyến Mãi
            </button>
          </div>
          {heroPackage && (
            <div className="hero__highlight">
              <span>{heroPackage.name}</span>
              <strong>{formatCurrency(heroPackage.priceMonthly)}</strong>
              <span>/tháng</span>
            </div>
          )}
        </div>
        <div className="hero__panel">
          <QuickRegistrationForm packages={packages} />
        </div>
      </section>

      <section className="packages-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Các gói</p>
            <h2>Chọn gói phù hợp với nhu cầu của bạn.</h2>
          </div>
          <button className="ghost-btn" onClick={() => navigate('/packages')}>
            Xem tất cả gói cước →
          </button>
        </div>
        
        {/* Category filter tabs */}
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

        {loading && <p>Đang tải gói cước...</p>}
        {!loading && (
          <div className={packages.length <= 2 ? 'packages-carousel packages-carousel--centered' : 'packages-carousel'}>
            {packages.slice(0, 6).map((item) => (
              <PackageCard key={item.id} item={item} onSelect={() => navigate('/packages')} />
            ))}
          </div>
        )}
      </section>

      <section className="posts-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Tin tức & Khuyến mãi</p>
            <h2>Lắp đặt, ra mắt sản phẩm và nâng cấp hậu trường.</h2>
          </div>
          <button className="ghost-btn" onClick={() => navigate('/posts')}>
            Xem tất cả →
          </button>
        </div>
        {loading && <p>Đang tải tin tức...</p>}
        {!loading && (
          <div className="grid three">
            {posts.map((item) => (
              <PostCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="installation-dna-section">
        <div className="installation-dna-container">
          <div className="installation-dna-header">
            <p className="eyebrow">DNA lắp đặt</p>
            <h2>Chúng tôi lập kế hoạch, khảo sát, lắp đặt và kích hoạt trong vòng 72 giờ.</h2>
            <p className="installation-description">
              Nhân viên chuyên nghiệp theo dõi bảng trạng thái với các cập nhật chủ động để bạn luôn biết được điều gì tiếp theo.
            </p>
          </div>
          
          <div className="installation-stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <strong className="stat-number">48h</strong>
                <span className="stat-label">Khảo sát trung bình</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <strong className="stat-number">320+</strong>
                <span className="stat-label">Khách hàng nâng cấp trong năm 2025</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <strong className="stat-number">12</strong>
                <span className="stat-label">Đội ngũ chuyên nghiệp</span>
              </div>
            </div>
          </div>

          <div className="installation-process">
            <div className="process-step">
              <div className="process-number">1</div>
              <div className="process-info">
                <h3>Đăng ký & Tư vấn</h3>
                <p>Nhận tư vấn miễn phí và lựa chọn gói phù hợp</p>
              </div>
            </div>
            <div className="process-arrow">→</div>
            <div className="process-step">
              <div className="process-number">2</div>
              <div className="process-info">
                <h3>Khảo sát địa điểm</h3>
                <p>Kỹ thuật viên khảo sát và lên phương án lắp đặt</p>
              </div>
            </div>
            <div className="process-arrow">→</div>
            <div className="process-step">
              <div className="process-number">3</div>
              <div className="process-info">
                <h3>Lắp đặt & Kích hoạt</h3>
                <p>Hoàn tất lắp đặt và kích hoạt dịch vụ trong 72h</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
