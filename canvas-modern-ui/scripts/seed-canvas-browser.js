// Canvas LMS Seed Data - Browser Console Script
// Run this in the browser console while logged into Canvas LMS as an admin

async function seedCanvasData() {
  console.log('🌱 Starting Canvas LMS seed data creation...');

  const baseUrl = window.location.origin;

  // Verify we're on Canvas and logged in
  if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('canvas')) {
    console.error('❌ Please run this script on the Canvas LMS page (localhost:3000)');
    return;
  }

  // Check for authentication
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                   document.querySelector('input[name="authenticity_token"]')?.value ||
                   window.ENV?.AUTHENTICITY_TOKEN;

  if (!csrfToken) {
    console.error('❌ No CSRF token found. Please make sure you are logged into Canvas LMS.');
    return;
  }

  console.log('✅ CSRF token found, proceeding with data creation...');
  
  // Helper function to make API calls
  async function canvasAPI(endpoint, method = 'GET', data = null) {
    // Get CSRF token from Canvas page
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                     document.querySelector('input[name="authenticity_token"]')?.value ||
                     window.ENV?.AUTHENTICITY_TOKEN;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'same-origin' // Include cookies for session
    };

    if (data) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, options);
      if (response.ok) {
        return await response.json();
      } else {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText}`);
        console.error(`Endpoint: ${method} ${endpoint}`);
        console.error(`Response: ${errorText}`);
        return null;
      }
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  }
  
  // Create sample courses
  console.log('📚 Creating sample courses...');
  const coursesData = [
    {
      name: "Introduction to Computer Science",
      course_code: "CS101",
      public_description: "Fundamental concepts of computer science including programming, algorithms, and data structures."
    },
    {
      name: "Advanced Mathematics", 
      course_code: "MATH301",
      public_description: "Advanced topics in calculus, linear algebra, and differential equations."
    },
    {
      name: "Web Development Fundamentals",
      course_code: "WEB201", 
      public_description: "Learn HTML, CSS, JavaScript, and modern web development frameworks."
    },
    {
      name: "Data Science Essentials",
      course_code: "DS101",
      public_description: "Introduction to data analysis, statistics, and machine learning."
    },
    {
      name: "Digital Marketing Strategy",
      course_code: "MKT250",
      public_description: "Modern digital marketing techniques and social media strategies."
    }
  ];

  const createdCourses = [];
  
  for (const courseData of coursesData) {
    const course = await canvasAPI('/api/v1/accounts/1/courses', 'POST', {
      course: {
        ...courseData,
        is_public: true,
        workflow_state: 'available'
      }
    });
    
    if (course) {
      console.log(`✅ Created course: ${courseData.name} (${courseData.course_code})`);
      createdCourses.push(course);
      
      // Publish the course
      await canvasAPI(`/api/v1/courses/${course.id}`, 'PUT', {
        course: { event: 'offer' }
      });
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Create assignments for each course
  console.log('📝 Creating assignments...');
  const assignmentsData = [
    {
      name: "Programming Assignment 1",
      description: "Implement basic algorithms and data structures",
      points_possible: 100,
      due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: "Midterm Exam",
      description: "Comprehensive exam covering first half of course",
      points_possible: 150,
      due_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: "Final Project",
      description: "Capstone project demonstrating course concepts",
      points_possible: 200,
      due_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const course of createdCourses) {
    for (const assignmentData of assignmentsData) {
      const assignment = await canvasAPI(`/api/v1/courses/${course.id}/assignments`, 'POST', {
        assignment: {
          ...assignmentData,
          submission_types: ['online_upload', 'online_text_entry'],
          workflow_state: 'published'
        }
      });
      
      if (assignment) {
        console.log(`  ✅ Created assignment: ${assignmentData.name} for ${course.name}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // Create discussions for each course
  console.log('💬 Creating discussions...');
  const discussionsData = [
    {
      title: "Welcome & Introductions",
      message: "Please introduce yourself and share what you hope to learn in this course."
    },
    {
      title: "Course Resources & Study Tips",
      message: "Share helpful resources and study strategies for success in this course."
    },
    {
      title: "Q&A for Upcoming Assignment",
      message: "Ask questions about the upcoming assignment here."
    }
  ];

  for (const course of createdCourses) {
    for (const discussionData of discussionsData) {
      const discussion = await canvasAPI(`/api/v1/courses/${course.id}/discussion_topics`, 'POST', {
        discussion_topic: {
          ...discussionData,
          discussion_type: 'threaded',
          workflow_state: 'active'
        }
      });
      
      if (discussion) {
        console.log(`  ✅ Created discussion: ${discussionData.title} for ${course.name}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // Create calendar events
  console.log('📅 Creating calendar events...');
  const eventsData = [
    {
      title: "Office Hours",
      description: "Weekly office hours for student questions",
      start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Guest Lecture: Industry Trends",
      description: "Special guest speaker discussing current industry trends",
      start_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Study Group Session",
      description: "Collaborative study session for upcoming exam",
      start_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      end_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const eventData of eventsData) {
    const event = await canvasAPI('/api/v1/calendar_events', 'POST', {
      calendar_event: eventData
    });
    
    if (event) {
      console.log(`  ✅ Created event: ${eventData.title}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Create folders for each course
  console.log('📁 Creating folders...');
  const foldersData = [
    { name: "Lecture Notes" },
    { name: "Assignments" },
    { name: "Resources" },
    { name: "Supplementary Materials" }
  ];

  for (const course of createdCourses) {
    for (const folderData of foldersData) {
      const folder = await canvasAPI(`/api/v1/courses/${course.id}/folders`, 'POST', {
        folder: folderData
      });
      
      if (folder) {
        console.log(`  ✅ Created folder: ${folderData.name} for ${course.name}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log('✅ Canvas LMS seed data creation completed!');
  console.log('🌐 Visit http://localhost:3003 to see the data in ClassApex LMS');
  console.log(`📊 Created: ${createdCourses.length} courses, ${createdCourses.length * 3} assignments, ${createdCourses.length * 3} discussions, ${eventsData.length} events`);
  
  return {
    courses: createdCourses.length,
    assignments: createdCourses.length * 3,
    discussions: createdCourses.length * 3,
    events: eventsData.length,
    folders: createdCourses.length * 4
  };
}

// Instructions for use
console.log(`
🚀 Canvas LMS Seed Data Generator
=================================

To create sample data in Canvas LMS:

1. Make sure you're logged into Canvas LMS as an admin
2. Open the browser console (F12)
3. Run: seedCanvasData()

This will create:
- 5 sample courses
- 15 assignments (3 per course)
- 15 discussions (3 per course)  
- 3 calendar events
- 20 folders (4 per course)

The data will then be visible in ClassApex LMS at http://localhost:3003
`);

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('Ready to seed Canvas data! Run seedCanvasData() to begin.');
}
