// Footer Component - LifeCherry
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FiHome, FiBookOpen, FiFileText, FiShield, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--color-footer-bg)' }} className="border-t border-border dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🍒</span>
              <span className="text-2xl font-bold text-text-primary dark:text-white">LifeCherry</span>
            </Link>
            <p className="text-text-secondary dark:text-gray-400 max-w-md mb-6">
              A platform where users can create, store, and share meaningful life lessons,
              personal growth insights, and wisdom they have gathered over time.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon group w-10 h-10 rounded-full bg-cherry-50 dark:bg-gray-800 flex items-center justify-center transition-all duration-200 hover:bg-cherry"
              >
                <FaFacebookF
                  size={18}
                  className="text-cherry transition-transform duration-200 group-hover:!text-white group-hover:scale-110 group-hover:-rotate-3"
                />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon group w-10 h-10 rounded-full bg-cherry-50 dark:bg-gray-800 flex items-center justify-center transition-all duration-200 hover:bg-cherry"
              >
                <FaXTwitter
                  size={18}
                  className="text-cherry transition-transform duration-200 group-hover:!text-white group-hover:scale-110 group-hover:rotate-3"
                />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon group w-10 h-10 rounded-full bg-cherry-50 dark:bg-gray-800 flex items-center justify-center transition-all duration-200 hover:bg-cherry"
              >
                <FaInstagram
                  size={18}
                  className="text-cherry transition-transform duration-200 group-hover:!text-white group-hover:scale-110 group-hover:-rotate-3"
                />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon group w-10 h-10 rounded-full bg-cherry-50 dark:bg-gray-800 flex items-center justify-center transition-all duration-200 hover:bg-cherry"
              >
                <FaLinkedinIn
                  size={18}
                  className="text-cherry transition-transform duration-200 group-hover:!text-white group-hover:scale-110 group-hover:rotate-3"
                />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-text-primary dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-cherry transition-colors">
                  <FiHome className="text-cherry" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="public-lessons" className="flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-cherry transition-colors">
                  <FiBookOpen className="text-cherry" />
                  Public Lessons
                </Link>
              </li>
              <li>
                <Link to="terms" className="flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-cherry transition-colors">
                  <FiFileText className="text-cherry" />
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="privacy" className="flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-cherry transition-colors">
                  <FiShield className="text-cherry" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-text-primary dark:text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-text-secondary dark:text-gray-400">
              <li>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cherry-50 dark:bg-gray-800 text-cherry">
                    <FiMail />
                  </span>
                  <div>
                    <span className="block text-text-primary dark:text-white font-medium leading-tight">Email</span>
                    <a href="mailto:support@lifecherry.com" className="hover:text-cherry transition-colors leading-tight">
                      support@lifecherry.com
                    </a>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cherry-50 dark:bg-gray-800 text-cherry">
                    <FiPhone />
                  </span>
                  <div>
                    <span className="block text-text-primary dark:text-white font-medium leading-tight">Phone</span>
                    <a href="tel:+8801234567890" className="hover:text-cherry transition-colors leading-tight">
                      +880 1234-567890
                    </a>
                  </div>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cherry-50 dark:bg-gray-800 text-cherry">
                    <FiMapPin />
                  </span>
                  <div>
                    <span className="block text-text-primary dark:text-white font-medium leading-tight">Address</span>
                    <span className="leading-tight">Dhaka, Bangladesh</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted dark:text-gray-500 text-sm">
            © {currentYear} LifeCherry. All rights reserved.
          </p>
          <div className="flex gap-6" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
