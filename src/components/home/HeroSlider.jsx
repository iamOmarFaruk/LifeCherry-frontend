// Hero Slider Component - LifeCherry
import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { FiArrowRight, FiBookOpen, FiUsers, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import AnimatedCherry from '../shared/AnimatedCherry';

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
    lightGradient: "from-cherry-50 via-white to-cherry-100",
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
    lightGradient: "from-amber-50 via-white to-orange-50",
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
    lightGradient: "from-purple-50 via-white to-pink-50",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
  }
];

const HeroSlider = () => {
  return (
    <section className="relative dark:bg-gray-900">
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
          bulletClass: 'swiper-pagination-bullet !w-3 !h-3 !bg-cherry-300 dark:!bg-gray-600 !opacity-50',
          bulletActiveClass: '!bg-cherry dark:!bg-cherry !opacity-100 !w-8 !rounded-full'
        }}
        loop={true}
        className="hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {/* Light mode: colorful gradients, Dark mode: professional dark gradient */}
            <div className={`bg-gradient-to-br ${slide.lightGradient} dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 md:py-16 lg:py-24 transition-colors duration-300 overflow-hidden h-full`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                  {/* Content */}
                  <div className="text-center lg:text-left order-2 lg:order-1">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-cherry/10 dark:bg-cherry/20 text-cherry mb-4 md:mb-6"
                    >
                      {slide.icon}
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-3xl md:text-5xl lg:text-6xl font-bold text-text-primary dark:text-white mb-3 md:mb-4 leading-tight"
                    >
                      {slide.title}
                      <br />
                      <span className="text-cherry">{slide.highlight}</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-base md:text-xl text-text-secondary dark:text-gray-300 mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0"
                    >
                      {slide.description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start"
                    >
                      <Link
                        to={slide.primaryBtn.link}
                        className="btn-capsule text-base md:text-lg px-6 py-3 md:px-8 inline-flex items-center justify-center gap-2"
                      >
                        {slide.primaryBtn.text}
                        <FiArrowRight />
                      </Link>
                      <Link
                        to={slide.secondaryBtn.link}
                        className="btn-ghost-capsule text-base md:text-lg px-6 py-3 md:px-8 inline-flex items-center justify-center dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        {slide.secondaryBtn.text}
                      </Link>
                    </motion.div>
                  </div>

                  {/* Image */}
                  <div className="order-1 lg:order-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cherry/20 dark:from-cherry/10 to-transparent rounded-3xl transform rotate-3"></div>
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="relative rounded-3xl shadow-2xl dark:shadow-black/40 w-full h-[250px] md:h-[400px] object-cover border border-transparent dark:border-gray-700"
                      />
                      {/* Floating elements */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-black/30 p-4 hidden md:block border border-transparent dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cherry/10 dark:bg-cherry/20 flex items-center justify-center">
                            <AnimatedCherry className="text-xl" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary dark:text-white text-sm">10K+ Lessons</p>
                            <p className="text-text-muted dark:text-gray-400 text-xs">Shared by community</p>
                          </div>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-black/30 p-4 hidden md:block border border-transparent dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                            <span className="text-xl">⭐</span>
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary dark:text-white text-sm">Premium</p>
                            <p className="text-text-muted dark:text-gray-400 text-xs">Exclusive content</p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
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
