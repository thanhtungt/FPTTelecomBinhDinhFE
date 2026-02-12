import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bannerPlay from '../../assets/bannerfpttele11.png';
import bannerWifi from '../../assets/bannerfpttele2.png';

const BannerCarousel = () => {
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);

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

  return (
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
  );
};

export default BannerCarousel;
