import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageAPI } from '../api/packages';
import { PostAPI } from '../api/posts';
import type { Package } from '../types/package';
import type { Post } from '../types/post';
import PackageCard from '../components/cards/PackageCard';
import PostCard from '../components/cards/PostCard';
import QuickRegistrationForm from '../components/forms/QuickRegistrationForm';
import { formatCurrency } from '../utils/format';
import bannerPlay from '../assets/bannerfpttele11.png';
import bannerWifi from '../assets/bannerfpttele2.png';
// cspell:ignore Nhon Binh Dinh

const HomePage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBanner, setActiveBanner] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [pkgList, postList] = await Promise.all([PackageAPI.getAll(), PostAPI.getAll()]);
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
  }, []);

  const banners = useMemo(
    () => [
      {
        id: 'play',
        image: bannerPlay,
        alt: 'FPT Play Ngoại Hạng Anh chỉ từ 59K mỗi tháng',
      },
      {
        id: 'wifi7',
        image: bannerWifi,
        alt: 'WiFi 7 dẫn đầu tốc độ',
      },
    ],
    []
  );

  useEffect(() => {
    if (isBannerPaused || banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [banners.length, isBannerPaused]);

  const heroPackage = useMemo(() => packages[0], [packages]);

  return (
    <div className="page home-page">
      <section
        className="banner-carousel"
        onMouseEnter={() => setIsBannerPaused(true)}
        onMouseLeave={() => setIsBannerPaused(false)}
        aria-label="Promotional banners"
      >
        <div className="banner-carousel__viewport">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              className={`banner-carousel__slide ${index === activeBanner ? 'is-active' : ''}`}
              type="button"
              onClick={() => navigate('/packages')}
              aria-label={banner.alt}
            >
              <img src={banner.image} alt={banner.alt} />
            </button>
          ))}
        </div>
        <div className="banner-carousel__controls">
          <button
            className="banner-carousel__nav"
            type="button"
            onClick={() =>
              setActiveBanner((current) => (current - 1 + banners.length) % banners.length)
            }
            aria-label="Previous banner"
          >
            ‹
          </button>
          <div className="banner-carousel__dots" role="tablist">
            {banners.map((banner, index) => (
              <button
                key={`${banner.id}-dot`}
                className={`banner-carousel__dot ${index === activeBanner ? 'is-active' : ''}`}
                type="button"
                onClick={() => setActiveBanner(index)}
                aria-label={`Go to banner ${index + 1}`}
                aria-pressed={index === activeBanner}
              />
            ))}
          </div>
          <button
            className="banner-carousel__nav"
            type="button"
            onClick={() => setActiveBanner((current) => (current + 1) % banners.length)}
            aria-label="Next banner"
          >
            ›
          </button>
        </div>
      </section>

      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">FPT Quy Nhon fiber network</p>
          <h1>Launch bold ideas with unconstrained internet.</h1>
          <p>
            Dedicated connectivity packages, pro installation workflow, and same-day support team for studios,
            cafes, and premium households across Binh Dinh.
          </p>
          <div className="hero__actions">
            <button className="primary-btn" onClick={() => navigate('/packages')}>
              Explore packages
            </button>
            <button className="ghost-btn" onClick={() => navigate('/posts')}>
              Stories and updates
            </button>
          </div>
          {heroPackage && (
            <div className="hero__highlight">
              <span>{heroPackage.name}</span>
              <strong>{formatCurrency(heroPackage.priceMonthly)}</strong>
              <span>/month</span>
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
            <p className="eyebrow">Performance tiers</p>
            <h2>Pick a plan engineered for streaming, gaming, or creative uploads.</h2>
          </div>
          <button className="ghost-btn" onClick={() => navigate('/packages')}>
            View all →
          </button>
        </div>
        {loading && <p>Loading packages...</p>}
        {!loading && (
          <div className="grid three">
            {packages.slice(0, 3).map((item) => (
              <PackageCard key={item.id} item={item} onSelect={() => navigate('/packages')} />
            ))}
          </div>
        )}
      </section>

      <section className="posts-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Stories from the field</p>
            <h2>Installations, product drops, and behind-the-scenes upgrades.</h2>
          </div>
          <button className="ghost-btn" onClick={() => navigate('/posts')}>
            All stories →
          </button>
        </div>
        {loading && <p>Loading stories...</p>}
        {!loading && (
          <div className="grid three">
            {posts.map((item) => (
              <PostCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="cta-section">
        <div>
          <p className="eyebrow">Installation DNA</p>
          <h2>We plan, survey, install, and activate in less than 72 hours.</h2>
          <p>
            Dedicated staff follow a transparent status board with proactive updates so you always know what is next.
          </p>
        </div>
        <div className="stats">
          <div>
            <strong>48h</strong>
            <span>Average survey window</span>
          </div>
          <div>
            <strong>320+</strong>
            <span>Homes upgraded in 2025</span>
          </div>
          <div>
            <strong>12</strong>
            <span>Specialist staff on duty</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
