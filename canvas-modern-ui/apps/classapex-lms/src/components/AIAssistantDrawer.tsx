import React, { useState, useEffect, useRef } from 'react';

// Clean, professional, line-art SVG icons matching ClassApex/Canvas UI guidelines
function BotIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4M8 15h.01M16 15h.01M9 18h6" />
    </svg>
  );
}

function ChatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TeacherIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}

function EditIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
    </svg>
  );
}

function PathIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function LightningIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: () => void }[];
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
  currentRole?: string;
  theme?: 'light' | 'dark';
}

export function AIAssistantDrawer({ isOpen, onClose, currentPath = '', currentRole = 'student', theme = 'light' }: AIAssistantDrawerProps) {
  const isDark = theme === 'dark';

  const styles = {
    containerBg: isDark ? '#1e293b' : '#ffffff',
    containerBorder: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#475569',
    textTertiary: isDark ? '#64748b' : '#94a3b8',
    cardBg: isDark ? '#0f172a' : '#ffffff',
    cardBorder: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(226, 232, 240, 0.6)',
    activeTabBg: isDark ? '#0f172a' : '#ffffff',
    activeTabColor: isDark ? '#818cf8' : 'var(--cx-color-primary, #6366f1)',
    inactiveTabColor: isDark ? '#64748b' : '#64748b',
    tabSwitcherBg: isDark ? '#1e293b' : 'var(--cx-bg-surface-raised, #f8fafc)',
    chatAssistantBg: isDark ? '#334155' : '#f1f5f9',
    chatAssistantBorder: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0',
    chatAssistantText: isDark ? '#f8fafc' : '#0f172a',
    chatUserBg: 'var(--cx-color-primary, #6366f1)',
    chatUserText: '#ffffff',
    inputBg: isDark ? '#0f172a' : '#ffffff',
    inputBorder: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
    inputText: isDark ? '#f8fafc' : '#0f172a',
    buttonGhostBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.06)',
    buttonGhostBorder: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(99, 102, 241, 0.15)',
    buttonGhostText: isDark ? '#818cf8' : 'var(--cx-color-primary, #6366f1)',
    indicatorDangerBg: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.01)',
    indicatorDangerBorder: isDark ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(239, 68, 68, 0.15)',
    indicatorDangerText: isDark ? '#fca5a5' : '#b91c1c'
  };
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'teacher' | 'editor' | 'paths'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am your ClassApex AI Companion. I can summarize course documents, explain concepts, provide assignment hints, or analyze outcomes. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Smart Search (S21-04)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string; type: string; snippet: string }[]>([]);

  // Teacher feedback & quiz generation states (S21-05, S21-06)
  const [rubricScore, setRubricScore] = useState(3.5);
  const [rubricCriteria, setRubricCriteria] = useState('Critical Analysis');
  const [generatedFeedback, setGeneratedFeedback] = useState('');
  
  const [quizSourceText, setQuizSourceText] = useState('Enzyme chromatography involves separation based on lactase cartridge alignments.');
  const [generatedQuestions, setGeneratedQuestions] = useState<{ question: string; options: string[]; answer: string }[]>([]);

  // Writing Assistant & Accessibility Audits (S21-07, S21-08)
  const [draftText, setDraftText] = useState('');
  const [draftTone, setDraftTone] = useState<'academic' | 'peer' | 'concise'>('academic');
  const [improvedDraft, setImprovedDraft] = useState('');

  const [a11yInputHtml, setA11yInputHtml] = useState('<img src="banner.jpg"> <button>Submit</button>');
  const [a11yAuditResults, setA11yAuditResults] = useState<{ rating: string; violations: string[]; suggestions: string[] } | null>(null);

  // Personalized Path & Analytics Insights (S21-09, S21-10)
  const [masteryGaps, setMasteryGaps] = useState([
    { outcome: 'LO-1 Critical Analysis', current: 2.5, required: 3.5, recommendation: 'Review the protein synthesis wiki page and complete Practice Quiz 2.' },
    { outcome: 'LO-2 Citation & Sources', current: 4.0, required: 3.0, recommendation: 'Target achieved. Ready to peer-assess classmates.' }
  ]);
  const [atRiskStudents, setAtRiskStudents] = useState([
    { name: 'Marcus Vance', riskLevel: 'High', dropoff: '-25% attendance', intervention: 'Send personalized calendar reminder for capstone milestones.' },
    { name: 'Sarah Jenkins', riskLevel: 'Medium', dropoff: 'Missing Lab 3 Submission', intervention: 'Auto-unlock draft submission portal extensions.' }
  ]);

  // Scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend = chatInput) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI study buddy / assignment help response (S21-02, S21-03)
    setTimeout(() => {
      let replyText = 'I am processing your query across the course outlines...';
      const normalized = textToSend.toLowerCase();

      if (normalized.includes('explain') || normalized.includes('chromatography')) {
        replyText = '💡 **Chromatography Explaination**: In biochemistry, chromatography separates lactase enzymes using modular mobile phases. The stationary phase binds target nodes, while standard dev metrics validate the purity yield. Let me know if you would like me to draft a quiz question!';
      } else if (normalized.includes('hint') || normalized.includes('assignment') || normalized.includes('help')) {
        replyText = '📝 **Assignment Scaffold Hint**: Focus on building a clear thesis structure in your introduction. Do not worry about formatting bibliography records yet—first lay out the chromatography experiment findings in consecutive headings!';
      } else if (normalized.includes('summarize') || normalized.includes('course')) {
        replyText = '📚 **Course Summary**: This module targets protein alignments and biochemical mastery calculation methods. Key focus points: 1) Mastery thresholds (3.0/5.0 pts), 2) Modular enzymes, and 3) Quantitative reasonings.';
      } else {
        replyText = `Thank you for sharing that. Based on the active page context (${currentPath || 'Dashboard'}), I recommend targeting outcome mastery alignments. Is there a specific concept I can help explain?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  // Smart Search Simulation (S21-04)
  const handleSmartSearch = () => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    
    // Simulate semantic outcomes
    const results = [
      { title: 'Biochemistry Module 1: Enzyme Purification', type: 'Wiki Page', snippet: 'Explains chromatography cascades, mobile phases, and lactase alignments.' },
      { title: 'Lab Assignment 1: Protein chromatography writeup', type: 'Assignment', snippet: 'Submit by Friday. Worth 50 points. Requires Critical Analysis criteria.' },
      { title: 'Quiz 1: Introductory Biochemistry Diagnostic', type: 'Quiz', snippet: 'Contains 10 multiple choice questions regarding standard deviation yields.' }
    ].filter(item => item.title.toLowerCase().includes(query) || item.snippet.toLowerCase().includes(query));

    setSearchResults(results);
  };

  // Feedback Generation (S21-05)
  const generateAIFeedback = () => {
    setIsTyping(true);
    setTimeout(() => {
      let commentary = '';
      if (rubricScore >= 4) {
        commentary = `Excellent presentation on standard ${rubricCriteria}. The submission demonstrates professional insight, utilizes exhaustive citations, and maps research nodes flawlessly.`;
      } else if (rubricScore >= 3) {
        commentary = `Satisfactory meeting of the ${rubricCriteria} proficiency threshold. The chromatography arguments are clear, although adding more granular experimental yields would strengthen the final output.`;
      } else {
        commentary = `The submission requires additional focus in ${rubricCriteria}. I suggest reviewing modular chromatography guidelines and adding a secondary dataset for validation.`;
      }
      setGeneratedFeedback(commentary);
      setIsTyping(false);
    }, 600);
  };

  // Quiz Generation (S21-06)
  const generateAIQuiz = () => {
    setIsTyping(true);
    setTimeout(() => {
      setGeneratedQuestions([
        {
          question: 'What is primarily involved in biochemistry chromatography separation?',
          options: ['Lactase cartridge alignments', 'Rhetoric citation constraints', 'HTML validation overrides', 'Database sharding switchman'],
          answer: 'Lactase cartridge alignments'
        },
        {
          question: 'What metric is standardly tracked during enzyme purification simulations?',
          options: ['Chromatography deviation yield', 'CSS themes contrast ratio', 'JIRA fixing key counts', 'LTI deep-link payload frames'],
          answer: 'Chromatography deviation yield'
        }
      ]);
      setIsTyping(false);
    }, 800);
  };

  // Writing Assistant (S21-07)
  const rewriteDraftText = () => {
    if (!draftText.trim()) return;
    setIsTyping(true);
    setTimeout(() => {
      let output = '';
      if (draftTone === 'academic') {
        output = `The chromatography writeup meticulously details standard lactase cartridge alignments, verifying significant statistical outcomes in accordance with established biological methodologies.`;
      } else if (draftTone === 'peer') {
        output = `Here is my chromatography writeup! It explains how the lactase cartridge alignments works and highlights the main statistical outcomes we found in the lab.`;
      } else {
        output = `Chromatography details lactase cartridge alignments, verifying statistical biological outcomes.`;
      }
      setImprovedDraft(output);
      setIsTyping(false);
    }, 600);
  };

  // Accessibility Audit (S21-08)
  const runA11yAudit = () => {
    if (!a11yInputHtml.trim()) return;
    setIsTyping(true);
    setTimeout(() => {
      setA11yAuditResults({
        rating: 'Needs Improvement (Score: 60/100)',
        violations: [
          'Critical: <img> tag is missing an explicit "alt" description attribute.',
          'Serious: <button> text requires high contrast color ratio validation.'
        ],
        suggestions: [
          'Add alt="Course Header Banner" to your img element.',
          'Increase background-to-text contrast ratios on your buttons.'
        ]
      });
      setIsTyping(false);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '84px',
      right: '24px',
      width: '400px',
      height: 'calc(100vh - 144px)',
      background: styles.containerBg,
      border: styles.containerBorder,
      borderRadius: '16px',
      boxShadow: isDark 
        ? '0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)' 
        : '0 20px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(15,23,42,0.03)',
      zIndex: 99,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Drawer Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--cx-color-primary, #6366f1) 0%, #4f46e5 100%)',
        color: '#ffffff',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#ffffff', display: 'flex', alignItems: 'center' }}>
            <BotIcon size={24} />
          </span>
          <div>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, letterSpacing: '0.01em', color: '#ffffff' }}>ClassApex AI Assistant</h2>
            <p style={{ fontSize: '0.68rem', margin: 0, opacity: 0.85, fontWeight: 500 }}>Integrated Learning Co-pilot</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.85rem',
            padding: '6px 10px',
            borderRadius: '8px',
            transition: 'background 0.2s',
            fontWeight: 600
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          Close
        </button>
      </div>

      {/* Primary Tab Switcher */}
      <div style={{
        display: 'flex',
        background: styles.tabSwitcherBg,
        borderBottom: styles.containerBorder,
        padding: '8px',
        gap: 6
      }}>
        {(['chat', 'teacher', 'editor', 'paths'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: '0.72rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: activeSubTab === tab ? styles.activeTabBg : 'transparent',
              color: activeSubTab === tab ? styles.activeTabColor : styles.inactiveTabColor,
              boxShadow: activeSubTab === tab ? '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'chat' && (
              <>
                <ChatIcon size={14} />
                <span>Chat</span>
              </>
            )}
            {tab === 'teacher' && (
              <>
                <TeacherIcon size={14} />
                <span>Teacher</span>
              </>
            )}
            {tab === 'editor' && (
              <>
                <EditIcon size={14} />
                <span>Editor</span>
              </>
            )}
            {tab === 'paths' && (
              <>
                <PathIcon size={14} />
                <span>Paths</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Scrollable Drawer Body Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        
        {/* ── Tab A: Chat Buddy (S21-01, S21-02, S21-03, S21-04) ── */}
        {activeSubTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Natural Language Course Smart Search (S21-04) */}
            <div className="cx-card" style={{ 
              padding: 12, 
              marginBottom: 16, 
              background: styles.cardBg, 
              border: styles.cardBorder, 
              borderRadius: '10px' 
            }}>
              <label style={{ 
                fontSize: '0.68rem', 
                fontWeight: 700, 
                color: styles.textTertiary, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4, 
                marginBottom: 6,
                letterSpacing: '0.03em'
              }}>
                <SearchIcon size={12} />
                <span>SMART NATURAL LANGUAGE SEARCH</span>
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  placeholder="e.g. chromatography writeups..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ 
                    flex: 1, 
                    height: '32px', 
                    background: styles.inputBg, 
                    border: styles.inputBorder, 
                    color: styles.inputText, 
                    borderRadius: 8, 
                    padding: '0 10px', 
                    fontSize: '0.75rem',
                    outline: 'none'
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleSmartSearch()}
                />
                <button 
                  className="cx-btn cx-btn--primary" 
                  onClick={handleSmartSearch} 
                  style={{ height: '32px', padding: '0 12px', fontSize: '0.72rem', borderRadius: 8 }}
                >
                  Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div style={{ 
                  marginTop: 10, 
                  background: styles.tabSwitcherBg, 
                  padding: 8, 
                  borderRadius: 8, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 6,
                  border: styles.cardBorder 
                }}>
                  {searchResults.map((res, idx) => (
                    <div key={idx} style={{ borderBottom: idx < searchResults.length - 1 ? styles.cardBorder : 'none', paddingBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                        <span style={{ fontWeight: 'bold', color: styles.activeTabColor }}>{res.title}</span>
                        <span className="cx-badge cx-badge--neutral" style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}>{res.type}</span>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.68rem', color: styles.textSecondary }}>{res.snippet}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat History Panel */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, minHeight: '260px', paddingBottom: 16 }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '10px 14px', 
                    borderRadius: '12px', 
                    fontSize: '0.78rem', 
                    lineHeight: 1.4,
                    background: msg.sender === 'user' ? styles.chatUserBg : styles.chatAssistantBg,
                    color: msg.sender === 'user' ? styles.chatUserText : styles.chatAssistantText,
                    border: msg.sender === 'user' ? 'none' : styles.chatAssistantBorder,
                    borderBottomRightRadius: msg.sender === 'user' ? 2 : 12,
                    borderBottomLeftRadius: msg.sender === 'user' ? 12 : 2
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: styles.textTertiary, marginTop: 4, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: 8 }}>
                  <span className="cx-page-fallback__dots" style={{ width: 12 }}><span style={{ width: 4, height: 4 }} /><span style={{ width: 4, height: 4 }} /><span style={{ width: 4, height: 4 }} /></span>
                </div>
              )}
            </div>

            {/* Suggested prompts helper cards */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {[
                'Explain chromatography',
                'Give assignment hints',
                'Summarize active course page'
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  style={{
                    padding: '6px 12px', 
                    borderRadius: 12, 
                    background: styles.buttonGhostBg,
                    border: styles.buttonGhostBorder, 
                    color: styles.buttonGhostText,
                    fontSize: '0.68rem', 
                    cursor: 'pointer', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s',
                    fontWeight: 500
                  }}
                >
                  <LightningIcon size={10} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>

            {/* Text Message Input */}
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type="text"
                placeholder="Ask study buddy..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                style={{ 
                  flex: 1, 
                  height: '36px', 
                  background: styles.inputBg, 
                  border: styles.inputBorder, 
                  color: styles.inputText, 
                  borderRadius: 8, 
                  padding: '0 12px', 
                  fontSize: '0.78rem',
                  outline: 'none'
                }}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                className="cx-btn cx-btn--primary" 
                onClick={() => handleSendMessage()} 
                style={{ height: '36px', padding: '0 14px', borderRadius: 8 }}
              >
                <SendIcon size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Tab B: Teacher Tools (S21-05, S21-06) ── */}
        {activeSubTab === 'teacher' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Rubric Feedback Generator S21-05 */}
            <div className="cx-card" style={{ padding: 16, background: styles.cardBg, border: styles.cardBorder, borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: 700, color: styles.textPrimary }}>AI Rubric Feedback Generator</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 600, color: styles.textSecondary, display: 'block', marginBottom: 4 }}>Select Criteria</label>
                  <select
                    className="cx-select"
                    value={rubricCriteria}
                    onChange={e => setRubricCriteria(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '6px 8px', 
                      fontSize: '0.75rem',
                      background: styles.inputBg,
                      border: styles.inputBorder,
                      color: styles.inputText,
                      borderRadius: 8,
                      outline: 'none'
                    }}
                  >
                    <option value="Critical Analysis">LO-1: Critical Analysis</option>
                    <option value="Citation & Sources">LO-2: Citation &amp; Sources</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 600, color: styles.textSecondary, display: 'block', marginBottom: 4 }}>Score (Points possible: 5.0)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="5"
                    value={rubricScore}
                    onChange={e => setRubricScore(parseFloat(e.target.value))}
                    style={{ 
                      width: '100%', 
                      height: '32px', 
                      background: styles.inputBg, 
                      border: styles.inputBorder, 
                      color: styles.inputText, 
                      borderRadius: 8, 
                      padding: '0 8px', 
                      fontSize: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <button 
                  className="cx-btn cx-btn--primary" 
                  onClick={generateAIFeedback} 
                  style={{ fontSize: '0.72rem', alignSelf: 'flex-start', borderRadius: 8 }}
                >
                  Generate Feedback Draft
                </button>

                {generatedFeedback && (
                  <div style={{ 
                    background: styles.tabSwitcherBg, 
                    border: styles.cardBorder, 
                    borderRadius: 8, 
                    padding: 12, 
                    fontSize: '0.75rem', 
                    color: styles.textSecondary, 
                    lineHeight: 1.4 
                  }}>
                    <div style={{ fontWeight: 'bold', color: styles.textPrimary, marginBottom: 4 }}>Drafted AI Commentary:</div>
                    {generatedFeedback}
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Questions Auto-Generator S21-06 */}
            <div className="cx-card" style={{ padding: 16, background: styles.cardBg, border: styles.cardBorder, borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: 700, color: styles.textPrimary }}>AI Auto-Quiz Question Generator</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 600, color: styles.textSecondary, display: 'block', marginBottom: 4 }}>Provide Source Material/Content Text</label>
                  <textarea
                    value={quizSourceText}
                    onChange={e => setQuizSourceText(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: '60px', 
                      background: styles.inputBg, 
                      border: styles.inputBorder, 
                      color: styles.inputText, 
                      borderRadius: 8, 
                      padding: '8px 10px', 
                      fontSize: '0.75rem', 
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </div>
                <button 
                  className="cx-btn cx-btn--secondary" 
                  onClick={generateAIQuiz} 
                  style={{ fontSize: '0.72rem', alignSelf: 'flex-start', borderRadius: 8 }}
                >
                  Auto-Generate Interactive Questions
                </button>

                {generatedQuestions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                    {generatedQuestions.map((q, idx) => (
                      <div key={idx} style={{ 
                        background: styles.tabSwitcherBg, 
                        border: styles.cardBorder, 
                        borderRadius: 8, 
                        padding: 12, 
                        fontSize: '0.75rem' 
                      }}>
                        <div style={{ fontWeight: 'bold', color: styles.textPrimary, marginBottom: 6 }}>Q{idx+1}: {q.question}</div>
                        <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 4, color: styles.textSecondary }}>
                          {q.options.map(opt => (
                            <li key={opt} style={{ 
                              fontWeight: opt === q.answer ? 'bold' : 'normal', 
                              color: opt === q.answer ? (isDark ? '#34d399' : '#059669') : 'inherit' 
                            }}>
                              {opt} {opt === q.answer && '✓'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab C: Writing & accessibility Audit (S21-07, S21-08) ── */}
        {activeSubTab === 'editor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Writing Assistant rewrite S21-07 */}
            <div className="cx-card" style={{ padding: 16, background: styles.cardBg, border: styles.cardBorder, borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: 700, color: styles.textPrimary }}>AI Discussion Writing Assistant</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 600, color: styles.textSecondary, display: 'block', marginBottom: 4 }}>Paste Draft Text</label>
                  <textarea
                    placeholder="e.g. our chromatography lab report showed lactase alignments yields..."
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: '60px', 
                      background: styles.inputBg, 
                      border: styles.inputBorder, 
                      color: styles.inputText, 
                      borderRadius: 8, 
                      padding: '8px 10px', 
                      fontSize: '0.75rem', 
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 600, color: styles.textSecondary, display: 'block', marginBottom: 4 }}>Select Casing Tone</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['academic', 'peer', 'concise'] as const).map(tone => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setDraftTone(tone)}
                        className={`cx-btn cx-btn--sm ${draftTone === tone ? 'cx-btn--primary' : 'cx-btn--secondary'}`}
                        style={{ flex: 1, textTransform: 'capitalize', fontSize: '0.68rem', padding: '6px 0', borderRadius: 6 }}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  className="cx-btn cx-btn--primary" 
                  onClick={rewriteDraftText} 
                  style={{ fontSize: '0.72rem', alignSelf: 'flex-start', borderRadius: 8 }} 
                  disabled={!draftText.trim()}
                >
                  Optimize Casing Narrative
                </button>

                {improvedDraft && (
                  <div style={{ 
                    background: styles.tabSwitcherBg, 
                    border: styles.cardBorder, 
                    borderRadius: 8, 
                    padding: 12, 
                    fontSize: '0.75rem', 
                    color: styles.textSecondary, 
                    lineHeight: 1.4 
                  }}>
                    <div style={{ fontWeight: 'bold', color: styles.textPrimary, marginBottom: 4 }}>AI Improved Draft:</div>
                    {improvedDraft}
                  </div>
                )}
              </div>
            </div>

            {/* Accessibility checker with AI suggestions S21-08 */}
            <div className="cx-card" style={{ padding: 16, background: styles.cardBg, border: styles.cardBorder, borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: 700, color: styles.textPrimary }}>AI Content Accessibility Audit</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: 600, color: styles.textSecondary, display: 'block', marginBottom: 4 }}>Raw Wiki Page HTML</label>
                  <textarea
                    value={a11yInputHtml}
                    onChange={e => setA11yInputHtml(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: '50px', 
                      background: styles.inputBg, 
                      border: styles.inputBorder, 
                      color: styles.inputText, 
                      borderRadius: 8, 
                      padding: '8px 10px', 
                      fontSize: '0.75rem', 
                      fontFamily: 'monospace',
                      outline: 'none'
                    }}
                  />
                </div>
                <button 
                  className="cx-btn cx-btn--secondary" 
                  onClick={runA11yAudit} 
                  style={{ fontSize: '0.72rem', alignSelf: 'flex-start', borderRadius: 8 }}
                >
                  Analyze WCAG Contrast &amp; Alt Tags
                </button>

                {a11yAuditResults && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.72rem' }}>
                    <div style={{ fontWeight: 'bold', color: isDark ? '#fca5a5' : '#ef4444' }}>Rating: {a11yAuditResults.rating}</div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: styles.textPrimary }}>Violations Found:</div>
                      <ul style={{ paddingLeft: 14, margin: '2px 0 0 0', color: isDark ? '#fca5a5' : '#b91c1c' }}>
                        {a11yAuditResults.violations.map((v, i) => <li key={i}>{v}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: styles.textPrimary }}>AI Recommended Fixes:</div>
                      <ul style={{ paddingLeft: 14, margin: '2px 0 0 0', color: isDark ? '#a7f3d0' : '#047857' }}>
                        {a11yAuditResults.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab D: Paths & Analytics Insights (S21-09, S21-10) ── */}
        {activeSubTab === 'paths' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Student View: Personalized Learning Recommendation Path S21-09 */}
            <div className="cx-card" style={{ padding: 16, background: styles.cardBg, border: styles.cardBorder, borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '0.82rem', fontWeight: 700, color: styles.textPrimary }}>Personalized Learning Roadmaps</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.7rem', color: styles.textSecondary }}>
                Based on active Outcomes alignment rollups from your course assessments.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {masteryGaps.map((gap, index) => (
                  <div key={index} style={{ borderBottom: index < masteryGaps.length - 1 ? styles.cardBorder : 'none', paddingBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      <span style={{ color: styles.textPrimary }}>{gap.outcome}</span>
                      <span style={{ color: gap.current >= gap.required ? (isDark ? '#34d399' : '#059669') : (isDark ? '#fbbf24' : '#d97706') }}>
                        {gap.current} / {gap.required} pts
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: styles.textSecondary, lineHeight: 1.4 }}>
                      <strong style={{ color: styles.activeTabColor }}>AI Target Task:</strong> {gap.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher View: Student Dropoff Analytics intervention (S21-10) */}
            {currentRole === 'teacher' && (
              <div className="cx-card" style={{ 
                padding: 16, 
                borderRadius: '12px',
                background: styles.indicatorDangerBg,
                border: styles.indicatorDangerBorder
              }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '0.82rem', fontWeight: 700, color: styles.indicatorDangerText }}>AI Student-at-Risk Intervention Alerts</h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.7rem', color: styles.textSecondary }}>
                  Auto-detecting drops in course materials participation streams.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {atRiskStudents.map((std, index) => (
                    <div key={index} style={{ borderBottom: index < atRiskStudents.length - 1 ? styles.indicatorDangerBorder : 'none', paddingBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        <span style={{ color: styles.textPrimary }}>{std.name}</span>
                        <span className="cx-badge cx-badge--danger" style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}>{std.riskLevel} Risk</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: styles.indicatorDangerText, marginTop: 2, fontWeight: 600 }}>{std.dropoff}</div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: styles.textSecondary, lineHeight: 1.4 }}>
                        <strong style={{ color: styles.activeTabColor }}>Intervention Action:</strong> {std.intervention}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
