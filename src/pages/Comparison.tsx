import React from 'react';
import {
  Grid,
  Column,
  Button,
  Tag,
} from '@carbon/react';
import {
  CheckmarkFilled,
  CloseFilled,
  ArrowRight,
  Launch,
} from '@carbon/icons-react';

const Comparison: React.FC = () => {
  const features = [
    {
      category: 'User Interface & Design',
      items: [
        { feature: 'Modern Carbon Design System', canvas: false, schoolapex: true },
        { feature: 'Responsive Mobile Design', canvas: 'partial', schoolapex: true },
        { feature: 'Dark Mode Support', canvas: false, schoolapex: true },
        { feature: 'Accessibility (WCAG 2.1 AA)', canvas: 'partial', schoolapex: true },
        { feature: 'Customizable Themes', canvas: false, schoolapex: true },
        { feature: 'Intuitive Navigation', canvas: 'partial', schoolapex: true },
      ]
    },
    {
      category: 'Performance & Technology',
      items: [
        { feature: 'Modern React + TypeScript', canvas: false, schoolapex: true },
        { feature: 'GraphQL API', canvas: false, schoolapex: true },
        { feature: 'Real-time Updates', canvas: false, schoolapex: true },
        { feature: 'Progressive Web App', canvas: false, schoolapex: true },
        { feature: 'Microservices Architecture', canvas: false, schoolapex: true },
        { feature: 'Cloud-Native Design', canvas: false, schoolapex: true },
      ]
    },
    {
      category: 'Analytics & Insights',
      items: [
        { feature: 'Real-time Analytics Dashboard', canvas: 'partial', schoolapex: true },
        { feature: 'Advanced Performance Metrics', canvas: 'partial', schoolapex: true },
        { feature: 'AI-Powered Insights', canvas: false, schoolapex: true },
        { feature: 'Custom Report Builder', canvas: 'partial', schoolapex: true },
        { feature: 'Predictive Analytics', canvas: false, schoolapex: true },
        { feature: 'Learning Outcome Tracking', canvas: 'partial', schoolapex: true },
      ]
    },
    {
      category: 'User Experience',
      items: [
        { feature: 'Smart Search & Filtering', canvas: 'partial', schoolapex: true },
        { feature: 'Drag & Drop Interface', canvas: 'partial', schoolapex: true },
        { feature: 'Keyboard Shortcuts', canvas: false, schoolapex: true },
        { feature: 'Personalized Dashboard', canvas: 'partial', schoolapex: true },
        { feature: 'Contextual Help System', canvas: 'partial', schoolapex: true },
        { feature: 'Offline Capabilities', canvas: false, schoolapex: true },
      ]
    }
  ];

  const renderFeatureIcon = (status: boolean | string) => {
    if (status === true) {
      return <CheckmarkFilled size={20} style={{ color: '#24a148' }} />;
    } else if (status === 'partial') {
      return <Tag type="yellow" size="sm">Partial</Tag>;
    } else {
      return <CloseFilled size={20} style={{ color: '#da1e28' }} />;
    }
  };

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '300', 
          margin: '0 0 1rem 0',
          background: 'linear-gradient(135deg, #0f62fe 0%, #8a3ffc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Canvas LMS vs SchoolApex LMS
        </h1>
        <p style={{ 
          fontSize: '1.5rem', 
          color: '#6f6f6f', 
          margin: '0 0 2rem 0',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Experience the future of learning management with SchoolApex's modern technology, 
          superior design, and enhanced functionality - all while seamlessly using your existing Canvas data.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            kind="primary" 
            size="lg"
            renderIcon={ArrowRight}
            onClick={() => window.location.href = '/'}
          >
            Experience SchoolApex
          </Button>
          <Button 
            kind="secondary"
            size="lg"
            renderIcon={Launch}
            onClick={() => window.open('http://localhost:3000', '_blank')}
          >
            View Canvas LMS
          </Button>
        </div>
      </div>

      {/* Side-by-side Visual Comparison */}
      <div className="comparison-section">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Visual Interface Comparison
        </h2>
        <Grid>
          <Column lg={8} md={4} sm={4}>
            <div className="canvas-comparison">
              <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                Canvas LMS (Traditional)
              </h3>
              <div style={{ 
                height: '300px', 
                backgroundColor: '#f8f8f8', 
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{ textAlign: 'center', color: '#6f6f6f' }}>
                  <h4>Traditional Canvas Interface</h4>
                  <p>Ruby on Rails • jQuery • Legacy Design</p>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CloseFilled size={16} style={{ color: '#da1e28' }} />
                  Outdated technology stack
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CloseFilled size={16} style={{ color: '#da1e28' }} />
                  Slow loading times
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CloseFilled size={16} style={{ color: '#da1e28' }} />
                  Complex, cluttered interface
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CloseFilled size={16} style={{ color: '#da1e28' }} />
                  Limited mobile experience
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CloseFilled size={16} style={{ color: '#da1e28' }} />
                  Monolithic architecture
                </li>
              </ul>
            </div>
          </Column>
          
          <Column lg={8} md={4} sm={4}>
            <div className="schoolapex-comparison">
              <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
                SchoolApex LMS (Modern)
              </h3>
              <div style={{ 
                height: '300px', 
                background: 'linear-gradient(135deg, #0f62fe 0%, #8a3ffc 100%)',
                border: '2px solid var(--schoolapex-primary)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: 'white'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <h4>🎓 SchoolApex Modern Interface</h4>
                  <p>React + TypeScript • Carbon Design • GraphQL</p>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckmarkFilled size={16} style={{ color: '#24a148' }} />
                  Modern React + TypeScript stack
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckmarkFilled size={16} style={{ color: '#24a148' }} />
                  Lightning-fast performance
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckmarkFilled size={16} style={{ color: '#24a148' }} />
                  Clean, intuitive Carbon Design
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckmarkFilled size={16} style={{ color: '#24a148' }} />
                  Mobile-first responsive design
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckmarkFilled size={16} style={{ color: '#24a148' }} />
                  Microservices architecture
                </li>
              </ul>
            </div>
          </Column>
        </Grid>
      </div>

      {/* Detailed Feature Comparison */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Comprehensive Feature Comparison
        </h2>
        
        {features.map((category, categoryIndex) => (
          <div key={categoryIndex} className="dashboard-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--schoolapex-primary)' }}>
              {category.category}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Header */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr', 
                gap: '1rem',
                padding: '1rem',
                backgroundColor: '#f4f4f4',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                <div>Feature</div>
                <div style={{ textAlign: 'center' }}>Canvas LMS</div>
                <div style={{ textAlign: 'center' }}>SchoolApex LMS</div>
              </div>
              
              {/* Feature rows */}
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr 1fr', 
                  gap: '1rem',
                  padding: '1rem',
                  borderBottom: itemIndex < category.items.length - 1 ? '1px solid #e0e0e0' : 'none',
                  alignItems: 'center'
                }}>
                  <div>{item.feature}</div>
                  <div style={{ textAlign: 'center' }}>
                    {renderFeatureIcon(item.canvas)}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    {renderFeatureIcon(item.schoolapex)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Migration Benefits */}
      <div className="dashboard-card" style={{ marginTop: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Seamless Migration Benefits
        </h2>
        
        <Grid>
          <Column lg={5} md={4} sm={4}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <CheckmarkFilled size={64} style={{ color: '#24a148', marginBottom: '1rem' }} />
              <h4>Zero Data Loss</h4>
              <p>All your existing Canvas data works seamlessly in SchoolApex. Courses, users, assignments, and grades transfer perfectly.</p>
            </div>
          </Column>
          
          <Column lg={5} md={4} sm={4}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <ArrowRight size={64} style={{ color: '#0f62fe', marginBottom: '1rem' }} />
              <h4>Instant Upgrade</h4>
              <p>Experience immediate performance improvements and modern features without any learning curve for your existing workflows.</p>
            </div>
          </Column>
          
          <Column lg={6} md={4} sm={4}>
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <Launch size={64} style={{ color: '#8a3ffc', marginBottom: '1rem' }} />
              <h4>Parallel Operation</h4>
              <p>Run SchoolApex alongside Canvas during transition. Switch back and forth until you're ready to fully migrate.</p>
            </div>
          </Column>
        </Grid>
      </div>

      {/* Call to Action */}
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem 2rem',
        background: 'linear-gradient(135deg, rgba(15, 98, 254, 0.1) 0%, rgba(138, 63, 252, 0.1) 100%)',
        borderRadius: '8px',
        marginTop: '3rem'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>
          Ready to Transform Your Learning Experience?
        </h2>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#6f6f6f', 
          marginBottom: '2rem',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          SchoolApex LMS delivers all Canvas functionality with superior performance, 
          modern design, and enhanced features. Your data, elevated.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            kind="primary" 
            size="lg"
            renderIcon={ArrowRight}
            onClick={() => window.location.href = '/'}
          >
            Explore SchoolApex Dashboard
          </Button>
          <Button 
            kind="secondary"
            size="lg"
            renderIcon={Launch}
            onClick={() => window.location.href = '/courses'}
          >
            View Live Course Data
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Comparison;
