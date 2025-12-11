// Hero Slider Component - LifeCherry
import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { FiArrowRight, FiBookOpen, FiUsers, FiStar } from 'react-icons/fi';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    id: 1,
    icon: <FiBookOpen className="w-12 h-12" />,
    title: "Share Your Life Lessons",
    highlight: "Inspire Others",
    description: "Preserve your wisdom and experiences. Create meaningful lessons that help others learn from your journey through life.",
    primaryBtn: { text: "Get Started Free", link: "/register" },
    secondaryBtn: { text: "Browse Lessons", link: "/public-lessons" },
    gradient: "from-cherry-50 via-white to-cherry-100",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
  },
  {
    id: 2,
    icon: <FiUsers className="w-12 h-12" />,
    title: "Learn From The Community",
    highlight: "Real Experiences",
    description: "Explore thousands of life lessons shared by people worldwide. From career advice to personal growth, find wisdom that resonates with you.",
    primaryBtn: { text: "Explore Lessons", link: "/public-lessons" },
    secondaryBtn: { text: "Join Now", link: "/register" },
    gradient: "from-amber-50 via-white to-orange-50",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    icon: <FiStar className="w-12 h-12" />,
    title: "Unlock Premium Insights",
    highlight: "Exclusive Wisdom",
    description: "Get access to premium lessons from top contributors. Dive deeper into life-changing insights and transform your perspective.",
    primaryBtn: { text: "Upgrade to Premium", link: "/pricing" },
    secondaryBtn: { text: "Learn More", link: "/public-lessons" },
    gradient: "from-purple-50 via-white to-pink-50",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
  }
];

const HeroSlider = () => {
  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={800}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !w-3 !h-3 !bg-cherry-300 !opacity-50',
          bulletActiveClass: '!bg-cherry !opacity-100 !w-8 !rounded-full'
        }}
        loop={true}
        className="hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className={`bg-gradient-to-br ${slide.gradient} py-12 md:py-16 lg:py-24`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                  {/* Content */}
                  <div className="text-center lg:text-left order-2 lg:order-1">
                    <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-cherry/10 text-cherry mb-4 md:mb-6">
                      {slide.icon}
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-3 md:mb-4 leading-tight">
                      {slide.title}
                      <br />
                      <span className="text-cherry">{slide.highlight}</span>
                    </h1>

                    <p className="text-base md:text-xl text-text-secondary mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0">
                      {slide.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                      <Link
                        to={slide.primaryBtn.link}
                        className="btn-capsule text-base md:text-lg px-6 py-3 md:px-8 inline-flex items-center justify-center gap-2"
                      >
                        {slide.primaryBtn.text}
                        <FiArrowRight />
                      </Link>
                      <Link
                        to={slide.secondaryBtn.link}
                        className="btn-ghost-capsule text-base md:text-lg px-6 py-3 md:px-8 inline-flex items-center justify-center"
                      >
                        {slide.secondaryBtn.text}
                      </Link>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="order-1 lg:order-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-cherry/20 to-transparent rounded-3xl transform rotate-3"></div>
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="relative rounded-3xl shadow-2xl w-full h-[250px] md:h-[400px] object-cover"
                      />
                      {/* Floating elements */}
                      <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 hidden md:block">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cherry/10 flex items-center justify-center">
                            <span className="text-xl">🍒</span>
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary text-sm">10K+ Lessons</p>
                            <p className="text-text-muted text-xs">Shared by community</p>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 hidden md:block">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-xl">⭐</span>
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary text-sm">Premium</p>
                            <p className="text-text-muted text-xs">Exclusive content</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom styles for pagination */}
      <style>{`
        .hero-swiper .swiper-pagination {
          bottom: 20px !important;
        }
        .hero-swiper .swiper-pagination-bullet {
          transition: all 0.3s ease;
        }
      `}</style>
    </section>
  );
};

export default HeroSlider;
