import React, { useState } from 'react';
import clsx from 'clsx';

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function HelpSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a3 3 0 115.5 2c-1 1-1.5 1.5-1.5 3"/><circle cx="12" cy="18" r="0.5" fill="currentColor"/></svg>; }
function BookSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16v16H4z"/><path d="M8 4v16"/></svg>; }
function VideoSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>; }
function DownloadSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 16V4M8 12l4 4 4-4"/><path d="M4 18v2h16v-2"/></svg>; }
function DocumentSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>; }
function MailSvg() { return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="6" width="24" height="20" rx="2"/><path d="M4 10l12 10 12-10"/></svg>; }
function PhoneSvg() { return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2H10a2 2 0 00-2 2v24a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2z"/><path d="M16 26h.01"/></svg>; }
function ChatSvg() { return <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 16a12 12 0 1121.5 7.3L28 28l-4.7-2.5A12 12 0 014 16z"/></svg>; }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>; }
function ChevronDownSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 6l3 3 3-3"/></svg>; }
function ExternalSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 3L6 8M11 3H7.5M11 3v3.5"/><path d="M9 7v3.5a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-6a.5.5 0 01.5-.5H6"/></svg>; }

const faqCategories = [
  { id: 'all', label: 'All Categories' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'courses', label: 'Courses' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'grades', label: 'Grades' },
  { id: 'technical', label: 'Technical Issues' },
  { id: 'account', label: 'Account & Profile' },
];

const faqs = [
  { id: '1', category: 'getting-started', question: 'How do I get started with ClassApex?', answer: 'Welcome to ClassApex! Start by exploring your dashboard, enrolling in courses, and familiarizing yourself with the navigation.' },
  { id: '2', category: 'courses', question: 'How do I enroll in a course?', answer: 'Navigate to the Courses page, browse available courses, and click "Enroll" on any course you\'d like to join.' },
  { id: '3', category: 'assignments', question: 'Where can I find my assignments?', answer: 'All your assignments are available in the Assignments section. You can view upcoming deadlines, submit work, and track your progress.' },
  { id: '4', category: 'grades', question: 'How do I check my grades?', answer: 'Visit the Grades section to view all your grades, feedback from instructors, and overall course progress.' },
  { id: '5', category: 'technical', question: 'What browsers are supported?', answer: 'ClassApex works best with modern browsers including Chrome, Firefox, Safari, and Edge.' },
  { id: '6', category: 'account', question: 'How do I update my profile information?', answer: 'Click on your profile icon in the header and select "Profile Settings" to update your personal information.' },
];

const supportResources = [
  { id: '1', title: 'User Guide', description: 'Comprehensive guide covering all ClassApex features', icon: <BookSvg /> },
  { id: '2', title: 'Video Tutorials', description: 'Step-by-step video guides for common tasks', icon: <VideoSvg /> },
  { id: '3', title: 'Quick Start Guide', description: 'Get up and running quickly with this essential guide', icon: <DownloadSvg /> },
  { id: '4', title: 'API Documentation', description: 'Technical documentation for developers', icon: <DocumentSvg /> },
];

const contactOptions = [
  { id: 'email', title: 'Email Support', description: 'Get help via email within 24 hours', icon: <MailSvg />, contact: 'support@classapex.edu', availability: '24/7' },
  { id: 'phone', title: 'Phone Support', description: 'Speak directly with our support team', icon: <PhoneSvg />, contact: '1-800-CLASSAPEX', availability: 'Mon-Fri 8AM-6PM EST' },
  { id: 'chat', title: 'Live Chat', description: 'Chat with support representatives', icon: <ChatSvg />, contact: 'Available in app', availability: 'Mon-Fri 9AM-5PM EST' },
];

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const tabs = ['FAQ', 'Documentation', 'Contact Support'];
  const [contactForm, setContactForm] = useState({ subject: '', category: '', message: '', priority: 'medium' });

  const handleClearFilters = () => { setSearchTerm(''); setSelectedCategory('all'); };

  return (
    <div className="cx-page">


      <div className="cx-stats-grid">
        {[
          { label: 'Articles', value: '150+', icon: <DocumentSvg /> },
          { label: 'Video Tutorials', value: '25+', icon: <VideoSvg /> },
          { label: 'Avg Response Time', value: '< 2 hrs', icon: <ChatSvg /> },
          { label: 'Satisfaction Rate', value: '98%', icon: <HelpSvg /> },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon">{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="cx-tabs">
        {tabs.map((tab, i) => (
          <button key={i} className={clsx('cx-tab', activeTab === i && 'cx-tab--active')} onClick={() => setActiveTab(i)}>{tab}</button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="cx-section">
          <div className="cx-toolbar">
            <div className="cx-search">
              <SearchSvg />
              <input type="search" className="cx-search__input" placeholder="Search FAQs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="cx-select" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); }}>
              {faqCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="cx-empty">
              <HelpSvg />
              <h3>No results found</h3>
              <p>Try adjusting your search terms or browse all categories.</p>
              <button className="cx-btn cx-btn--secondary" onClick={handleClearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredFaqs.map(faq => (
                <div key={faq.id} style={{ borderBottom: '1px solid var(--cx-border-subtle)' }}>
                  <button
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9375rem', fontWeight: 500, color: 'var(--cx-text-primary)', textAlign: 'left' }}
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}>
                    <span>{faq.question}</span>
                    <ChevronDownSvg />
                  </button>
                  {expandedFaq === faq.id && (
                    <div style={{ padding: '0 16px 14px', fontSize: '0.875rem', color: 'var(--cx-text-secondary)', lineHeight: 1.6 }}>
                      <p style={{ margin: 0 }}>{faq.answer}</p>
                      <span className="cx-badge cx-badge--neutral" style={{ marginTop: 8 }}>{faqCategories.find(c => c.id === faq.category)?.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div>
          <p style={{ fontSize: '0.9375rem', color: 'var(--cx-text-secondary)', marginBottom: 20 }}>Access comprehensive guides, tutorials, and technical documentation.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {supportResources.map(r => (
              <div key={r.id} className="cx-help-card">
                <div className="cx-help-card__icon">{r.icon}</div>
                <div className="cx-help-card__body">
                  <h3>{r.title}</h3>
                  <p>{r.description}</p>
                  <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--cx-color-primary)', textDecoration: 'none', marginTop: 8 }}>
                    Access Resource <ExternalSvg />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
            {contactOptions.map(option => (
              <div key={option.id} className="cx-help-card" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div className="cx-help-card__icon" style={{ width: 56, height: 56, fontSize: 28 }}>{option.icon}</div>
                <div className="cx-help-card__body">
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                  <p style={{ fontWeight: 600, color: 'var(--cx-text-primary)', marginTop: 4 }}>{option.contact}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>{option.availability}</p>
                  <button className="cx-btn cx-btn--secondary cx-btn--sm" style={{ marginTop: 8 }} onClick={() => setShowContactModal(true)}>Get Help</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="cx-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Contact Support</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowContactModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Subject</label>
                  <input type="text" className="cx-search__input" style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)' }}
                    placeholder="Brief description of your issue" value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Category</label>
                  <select className="cx-select" style={{ width: '100%' }} value={contactForm.category} onChange={e => setContactForm({...contactForm, category: e.target.value})}>
                    <option value="">Select a category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account Problem</option>
                    <option value="course">Course Question</option>
                    <option value="billing">Billing Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Priority</label>
                  <select className="cx-select" style={{ width: '100%' }} value={contactForm.priority} onChange={e => setContactForm({...contactForm, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 }}>Message</label>
                  <textarea className="cx-search__input" style={{ border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', resize: 'vertical', fontFamily: 'inherit', minHeight: 120 }}
                    rows={6} placeholder="Please describe your issue in detail..." value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowContactModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => { setShowContactModal(false); }}>Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;
