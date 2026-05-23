const { chromium } = require('playwright');
const path = require('path');

async function verifyUI() {
  console.log('🚀 Starting Playwright UI Verification on http://localhost:3003 ...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  try {
    // 1. Navigate to main page
    console.log('Navigating to http://localhost:3003...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    
    // 2. Set student role in localStorage to mock/simulate Yonas Nebro persona
    console.log('Setting localStorage demo role to student...');
    await page.evaluate(() => {
      // Switch demo role to student
      localStorage.setItem('classapex-demo-role', 'student');
      
      // Also set the mock token to represent Yonas Nebro (User ID: 1)
      const mockToken = {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: '1',
          name: 'Yonas Nebro',
          email: 'mail2yonas@example.com',
        },
        created_at: Date.now(),
        integrity: 'mock-integrity-hash',
      };
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify(mockToken));
      localStorage.setItem('cx_access_token', 'mock-access-token');
    });
    
    // Reload page to apply localStorage credentials
    console.log('Reloading page to apply credentials...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take screenshot of the Dashboard
    const dashboardScreenshotPath = path.join(__dirname, 'dashboard_screen.png');
    await page.screenshot({ path: dashboardScreenshotPath });
    console.log(`📸 Dashboard screenshot saved to: ${dashboardScreenshotPath}`);
    
    // Check if the Dashboard rendered
    const dashboardTitle = await page.title();
    console.log(`Page Title: "${dashboardTitle}"`);
    
    // Print all course names visible on the Dashboard
    const courseCards = await page.$$eval('.cx-course-card, [data-testid="course-card"]', cards => {
      return cards.map(c => ({
        title: c.querySelector('.cx-course-card__title, h3, h4')?.textContent?.trim() || 'No Title',
        code: c.querySelector('.cx-course-card__code, .course-code')?.textContent?.trim() || 'No Code'
      }));
    });
    console.log('Visible Course Cards on Dashboard:', courseCards);

    // Let's find if "Advanced Software Engineering Practice" is present
    const courseId = 15; // From our backend lifecycle run
    console.log(`Navigating to Course 15 homepage (/courses/${courseId})...`);
    await page.goto(`http://localhost:3003/courses/${courseId}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const courseHomeScreenshotPath = path.join(__dirname, 'course_home_screen.png');
    await page.screenshot({ path: courseHomeScreenshotPath });
    console.log(`📸 Course Home screenshot saved to: ${courseHomeScreenshotPath}`);
    
    // Print visible module elements
    const moduleItems = await page.$$eval('.cx-module, .module-item, h2, h3, h4', headings => {
      return headings.map(h => h.textContent?.trim()).filter(t => t);
    });
    console.log('Visible Module Elements on Course Homepage:', moduleItems.slice(0, 10));

    // Navigate to Grades screen
    console.log(`Navigating to Grades screen (/courses/${courseId}/grades)...`);
    await page.goto(`http://localhost:3003/courses/${courseId}/grades`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const gradesScreenshotPath = path.join(__dirname, 'grades_screen.png');
    await page.screenshot({ path: gradesScreenshotPath });
    console.log(`📸 Grades Screen screenshot saved to: ${gradesScreenshotPath}`);
    
    // Retrieve table row cell texts
    const gradeRows = await page.$$eval('table tr, .cx-grade-row', rows => {
      return rows.map(r => r.textContent?.trim().replace(/\s+/g, ' ')).filter(t => t);
    });
    console.log('Visible Rows on Grades Page:', gradeRows);
    
  } catch (error) {
    console.error('❌ Error during UI verification:', error);
  } finally {
    await browser.close();
    console.log('🏁 Playwright UI Verification Finished.');
  }
}

verifyUI();
