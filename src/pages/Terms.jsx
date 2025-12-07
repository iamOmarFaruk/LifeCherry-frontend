import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiFileText } from 'react-icons/fi';
import useDocumentTitle from '../hooks/useDocumentTitle';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using LifeCherry, you agree to be bound by these Terms & Conditions and all applicable laws. If you do not agree, please do not use the platform.'
  },
  {
    title: '2. Eligibility & Accounts',
    body: 'You must be at least 16 years old to create an account. You are responsible for safeguarding your login credentials and for all activities that occur under your account.'
  },
  {
    title: '3. User Content & Ownership',
    body: 'You own the lessons, stories, and materials you post. By publishing on LifeCherry, you grant us a worldwide, non-exclusive license to display, distribute, and promote your content on the platform.'
  },
  {
    title: '4. Acceptable Use',
    body: 'Do not upload harmful, hateful, harassing, or misleading content. Do not attempt to disrupt the service, scrape data, or infringe on the rights of others.'
  },
  {
    title: '5. Payments & Premium Features',
    body: 'Premium purchases are final unless required by law. We may update pricing or features with prior notice. Taxes or processing fees may apply depending on your location.'
  },
  {
    title: '6. Intellectual Property',
    body: 'The LifeCherry brand, design, and underlying software are owned by us. You may not copy, modify, or redistribute platform assets without written permission.'
  },
  {
    title: '7. Disclaimers',
    body: 'The platform is provided “as is.” We do not guarantee uninterrupted access or that content is accurate, complete, or suitable for your purposes.'
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the fullest extent permitted by law, LifeCherry and its team are not liable for indirect, incidental, or consequential damages arising from your use of the service.'
  },
  {
    title: '9. Termination',
    body: 'We may suspend or terminate access if you violate these terms or misuse the platform. You may delete your account at any time from your profile settings.'
  },
  {
    title: '10. Changes to Terms',
    body: 'We may update these Terms & Conditions periodically. Continued use after changes means you accept the revised terms. The “Last updated” date will always be posted below.'
  }
];

const highlights = [
  'You own what you publish; we only need a license to show it on LifeCherry.',
  'Stay kind: no harassment, spam, or rights violations.',
  'Premium sales are generally final unless required by local law.',
  'You can leave anytime by deleting your account; data handling is covered in our Privacy Policy.'
];

const heroImage = 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80';

const Terms = () => {
  useDocumentTitle('Terms & Conditions - LifeCherry');

  return (
    <div className="bg-gradient-to-b from-cherry-50/60 via-white to-white">
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
            <span className="text-white">Terms & Conditions</span>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold">Terms & Conditions</h1>
          <p className="text-white/80 text-lg max-w-3xl">
            The rules of the road for sharing your stories, lessons, and wisdom on LifeCherry.
          </p>
          <p className="text-sm text-white/70">Last updated: December 7, 2025</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">

        <div className="bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12">
          <div className="bg-cherry-50/60 border border-cherry-100 rounded-2xl p-6 mb-10">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-cherry shadow-inner">
                <FiShield className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-text-primary">Quick highlights</p>
                <ul className="list-disc list-inside text-text-secondary space-y-1">
                  {highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h2 className="text-xl font-semibold text-text-primary">{section.title}</h2>
                <p className="text-text-secondary leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-semibold text-text-primary">Questions about these terms?</p>
              <p className="text-text-secondary">Reach out and we will clarify how they apply to your use of LifeCherry.</p>
            </div>
            <a href="mailto:support@lifecherry.com" className="btn-capsule inline-flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5" />
              Contact support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
