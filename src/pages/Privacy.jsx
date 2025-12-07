import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiEyeOff, FiMail } from 'react-icons/fi';
import useDocumentTitle from '../hooks/useDocumentTitle';

const sections = [
  {
    title: '1. Data We Collect',
    items: [
      'Account basics: name, email, profile details, and authentication metadata.',
      'Usage data: pages visited, device information, and actions that help us improve reliability.',
      'Content: lessons, comments, and other materials you create or share on LifeCherry.'
    ]
  },
  {
    title: '2. How We Use Data',
    items: [
      'Operate and secure your account and the platform.',
      'Personalize content discovery and recommendations.',
      'Analyze performance, prevent fraud, and keep the community safe.',
      'Communicate updates, security alerts, and feature announcements.'
    ]
  },
  {
    title: '3. Sharing & Disclosure',
    items: [
      'Public content you choose to publish is visible to others.',
      'Service providers (e.g., analytics, payments) process data under strict confidentiality.',
      'We may disclose information if required by law or to protect rights, safety, and property.'
    ]
  },
  {
    title: '4. Cookies & Tracking',
    items: [
      'We use cookies and similar technologies to remember preferences, secure sessions, and understand usage patterns.',
      'You can control cookies via browser settings; disabling some cookies may limit functionality.'
    ]
  },
  {
    title: '5. Data Security',
    items: [
      'Encryption in transit (HTTPS) and access controls protect your data.',
      'No system is 100% secure; notify us immediately if you suspect unauthorized access.'
    ]
  },
  {
    title: '6. Your Choices & Rights',
    items: [
      'Access, update, or delete your account information from your profile.',
      'Opt out of non-essential emails via the unsubscribe link.',
      'Request a copy or deletion of your data by contacting support.'
    ]
  },
  {
    title: '7. Data Retention',
    items: [
      'We retain information while your account is active and as needed to meet legal or security obligations.',
      'Deleted lessons may persist in backups for a limited period before permanent removal.'
    ]
  },
  {
    title: '8. International Users',
    items: [
      'Your data may be processed in regions where our service providers operate.',
      'We apply reasonable safeguards to protect data transferred across borders.'
    ]
  },
  {
    title: '9. Changes to This Policy',
    items: [
      'We will update this page when our practices change.',
      'Continued use after updates means you accept the revised policy.'
    ]
  }
];

const heroImage = 'https://images.unsplash.com/photo-1521790361543-f645cf042ec4?auto=format&fit=crop&w=1600&q=80';

const Privacy = () => {
  useDocumentTitle('Privacy Policy - LifeCherry');

  return (
    <div className="bg-gradient-to-b from-white via-cherry-50/50 to-white">
      <section
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${heroImage}')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/35" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 flex flex-col gap-3 text-white">
          <nav className="flex items-center gap-2 text-sm text-white/80">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Privacy Policy</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold">Privacy Policy</h1>
          <p className="text-white/80 text-lg max-w-3xl">
            How we collect, use, and safeguard your data while you share your lessons on LifeCherry.
          </p>
          <p className="text-sm text-white/70">Last updated: December 7, 2025</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12">

          <div className="grid gap-8">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <div className="flex items-center gap-2">
                  <FiEyeOff className="w-4 h-4 text-cherry" />
                  <h2 className="text-xl font-semibold text-text-primary">{section.title}</h2>
                </div>
                <ul className="list-disc list-inside text-text-secondary space-y-2 leading-relaxed">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-semibold text-text-primary">Have a privacy request?</p>
              <p className="text-text-secondary">We respond to data access or deletion requests as quickly as possible.</p>
            </div>
            <a href="mailto:privacy@lifecherry.com" className="btn-ghost-capsule inline-flex items-center gap-2">
              <FiMail className="w-5 h-5" />
              Email privacy team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
