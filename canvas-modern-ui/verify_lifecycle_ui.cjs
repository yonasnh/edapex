const { chromium } = require('playwright');
const path = require('path');

const API_TOKEN = 'Ew3Q6H6JDWHUB7JD4M8fkcBmt8VvL3xc6TDEXfvvFRFaLcYmJuc3Y7zMYEfQmQec';

async function verifyUI() {
  console.log('🚀 Starting Playwright UI Verification on http://localhost:3003 ...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  // Register diagnostic page event listeners
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('[HMR]') && !text.includes('componentRef') && !text.includes('Inside renderOutcomes')) {
      console.log('BROWSER LOG:', text);
    }
  });
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('BAD RESPONSE:', response.status(), response.url());
    }
  });
  
  try {
    // 1. Navigate to main page
    console.log('Navigating to http://localhost:3003...');
    await page.goto('http://localhost:3003', { waitUntil: 'domcontentloaded' });
    
    // 2. Set credentials and tokens in localStorage
    console.log('Setting localStorage credentials and tokens...');
    await page.evaluate((token) => {
      // Switch demo role to student
      localStorage.setItem('classapex-demo-role', 'student');
      
      // Real API token to pass Rails authentication checks
      localStorage.setItem('cx_access_token', token);
      localStorage.setItem('schoolapex_canvas_token', JSON.stringify({
        access_token: token,
        token_type: 'Bearer',
        expires_in: 3600,
        user: {
          id: '1',
          name: 'Yonas Nebro',
          email: 'mail2yonas@example.com',
        },
        created_at: Date.now(),
        integrity: 'mock-integrity-hash',
      }));
    }, API_TOKEN);
    
    // Reload page to apply credentials
    console.log('Reloading page to apply credentials...');
    await page.goto('http://localhost:3003', { waitUntil: 'load' });
    await page.waitForSelector('.cx-course-card, [data-testid="course-card"], .card', { timeout: 15000 });
    
    // Take screenshot of the Dashboard
    const dashboardScreenshotPath = path.join(__dirname, 'dashboard_screen.png');
    await page.screenshot({ path: dashboardScreenshotPath });
    console.log(`📸 Dashboard screenshot saved to: ${dashboardScreenshotPath}`);
    
    // Check if the Dashboard rendered
    const dashboardTitle = await page.title();
    console.log(`Page Title: "${dashboardTitle}"`);
    
    // Print all course names visible on the Dashboard
    const courseCards = await page.$$eval('.cx-course-card, [data-testid="course-card"], .card', cards => {
      return cards.map(c => ({
        title: c.querySelector('.cx-course-card__title, h3, h4')?.textContent?.trim() || 'No Title',
        code: c.querySelector('.cx-course-card__code, .course-code')?.textContent?.trim() || 'No Code'
      }));
    });
    console.log('Visible Course Cards on Dashboard:', courseCards);

    // Dynamically find course link on dashboard matching CS-402
    const courseId = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      for (const link of links) {
        const href = link.getAttribute('href') || '';
        const match = href.match(/\/courses\/(\d+)/);
        if (match) {
          const cardText = link.textContent || '';
          const cardParentText = link.closest('.cx-course-card, [data-testid="course-card"], .card')?.textContent || '';
          if (cardText.includes('CS-402') || cardText.includes('Advanced Software') ||
              cardParentText.includes('CS-402') || cardParentText.includes('Advanced Software')) {
            return match[1];
          }
        }
      }
      return null;
    });

    console.log(`Detected Course ID from Dashboard: ${courseId}`);
    const finalCourseId = courseId || '35'; // Fallback to 35 if not found

    console.log(`Navigating to Course homepage (/courses/${finalCourseId})...`);
    await page.goto(`http://localhost:3003/courses/${finalCourseId}`, { waitUntil: 'load' });
    try {
      await page.waitForSelector('.cx-module, .module-item, .cx-module__title', { timeout: 10000 });
    } catch (e) {
      console.log('Timeout waiting for module selector, continuing...');
    }
    
    const courseHomeScreenshotPath = path.join(__dirname, 'course_home_screen.png');
    await page.screenshot({ path: courseHomeScreenshotPath });
    console.log(`📸 Course Home screenshot saved to: ${courseHomeScreenshotPath}`);
    
    // Print visible module elements
    const moduleItems = await page.$$eval('.cx-module, .module-item, h2, h3, h4, .cx-module__title', headings => {
      return headings.map(h => h.textContent?.trim()).filter(t => t);
    });
    console.log('Visible Module Elements on Course Homepage:', moduleItems);

    // Navigate to Grades screen
    console.log(`Navigating to Grades screen (/grades)...`);
    await page.goto(`http://localhost:3003/grades`, { waitUntil: 'load' });
    try {
      await page.waitForSelector('select.cx-select option', { timeout: 10000 });
    } catch (e) {
      console.log('Timeout waiting for select option selector, continuing...');
    }

    // Select the course in the dropdown
    const selectOptions = await page.$$eval('select.cx-select option', opts => opts.map(o => ({ value: o.value, text: o.textContent?.trim() })));
    console.log('Available options in the course select dropdown:', selectOptions);

    console.log(`Selecting course ${finalCourseId} in the dropdown...`);
    await page.selectOption('select.cx-select', finalCourseId);
    try {
      await page.waitForSelector('.cx-table__row, table tr, .cx-grade-row', { timeout: 10000 });
    } catch (e) {
      console.log('Timeout waiting for grade table rows, continuing...');
    }
    
    const gradesScreenshotPath = path.join(__dirname, 'grades_screen.png');
    await page.screenshot({ path: gradesScreenshotPath });
    console.log(`📸 Grades Screen screenshot saved to: ${gradesScreenshotPath}`);
    
    // Retrieve table row cell texts
    const gradeRows = await page.$$eval('.cx-table__row, table tr, .cx-grade-row, .cx-grades-table tr', rows => {
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
