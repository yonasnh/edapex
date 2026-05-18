# Canvas LMS Seed Data Scripts

These scripts help you populate Canvas LMS with sample data to demonstrate the ClassApex LMS frontend functionality.

## Quick Start (Browser Method - Recommended)

1. **Start Canvas LMS** (make sure it's running on http://localhost:3000)
2. **Login as Admin** - Visit http://localhost:3000 and login with admin credentials
3. **Open Browser Console** - Press F12 and go to Console tab
4. **Load the script**:
   ```javascript
   // Copy and paste the contents of seed-canvas-browser.js into the console
   ```
5. **Run the seeder**:
   ```javascript
   seedCanvasData()
   ```
6. **Wait for completion** - The script will create all sample data
7. **Visit ClassApex LMS** - Go to http://localhost:3003 to see the data

## What Gets Created

### 📚 **5 Sample Courses**
- Introduction to Computer Science (CS101)
- Advanced Mathematics (MATH301)  
- Web Development Fundamentals (WEB201)
- Data Science Essentials (DS101)
- Digital Marketing Strategy (MKT250)

### 📝 **15 Assignments** (3 per course)
- Programming Assignment 1 (Due in 7 days)
- Midterm Exam (Due in 14 days)
- Final Project (Due in 30 days)

### 💬 **15 Discussions** (3 per course)
- Welcome & Introductions
- Course Resources & Study Tips
- Q&A for Upcoming Assignment

### 📅 **3 Calendar Events**
- Office Hours (Tomorrow)
- Guest Lecture: Industry Trends (In 10 days)
- Study Group Session (In 5 days)

### 📁 **20 Folders** (4 per course)
- Lecture Notes
- Assignments
- Resources
- Supplementary Materials

## Alternative Methods

### Ruby Script Method
```bash
# Set admin token (optional)
export CANVAS_ADMIN_TOKEN=your_admin_token_here

# Run the Ruby script
ruby scripts/seed-canvas-data.rb
```

### Manual Canvas Setup
If the scripts don't work, you can manually create data in Canvas LMS:

1. **Create Courses**: Go to Admin → Courses → Add Course
2. **Add Assignments**: In each course, go to Assignments → Add Assignment
3. **Create Discussions**: Go to Discussions → Add Discussion
4. **Add Calendar Events**: Go to Calendar → Add Event
5. **Create Folders**: Go to Files → Add Folder

## Troubleshooting

### Script Fails with 401/403 Errors
- Make sure you're logged into Canvas LMS as an admin
- Check that Canvas LMS is running on http://localhost:3000
- Try refreshing the Canvas page and running the script again

### No Data Appears in ClassApex LMS
- Check that ClassApex LMS is running on http://localhost:3003
- Verify the Canvas REST API is responding (check browser network tab)
- Look for CORS errors in the browser console

### Rate Limiting Issues
- The script includes delays between requests
- If you get rate limited, wait a few minutes and try again
- Consider reducing the amount of data being created

## Verifying the Data

After running the seed script, you should see:

### In Canvas LMS (http://localhost:3000)
- 5 new courses in the courses list
- Assignments, discussions, and files in each course
- Calendar events in the calendar view

### In ClassApex LMS (http://localhost:3003)
- Dashboard showing real course and user statistics
- Course cards with actual Canvas data
- Calendar events from Canvas LMS
- File management with real folders and files
- Discussion forums with actual topics

## Customizing the Data

To modify the sample data:

1. **Edit the scripts** - Change course names, assignments, etc.
2. **Add more data types** - Extend scripts to create quizzes, modules, etc.
3. **Adjust timing** - Change due dates and event times
4. **Modify quantities** - Create more or fewer items

## Clean Up

To remove the seed data:
1. Go to Canvas LMS admin interface
2. Delete the created courses (this will remove associated assignments, discussions, etc.)
3. Delete calendar events from the calendar view
4. Or reset your Canvas LMS database if using a development environment

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Canvas LMS API endpoints are accessible
3. Ensure proper authentication and permissions
4. Check the Canvas LMS logs for server-side errors
