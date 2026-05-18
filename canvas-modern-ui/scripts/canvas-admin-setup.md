# Canvas LMS Admin Setup Guide

This guide helps you set up admin access in Canvas LMS to run the seed data scripts.

## Quick Admin Setup

### Method 1: Rails Console (Recommended)

1. **Open Canvas LMS directory**:
   ```bash
   cd /path/to/canvas-lms
   ```

2. **Start Rails console**:
   ```bash
   bundle exec rails console
   ```

3. **Create admin user**:
   ```ruby
   # Create admin account
   account = Account.default
   
   # Create admin user
   user = User.create!(
     name: "Admin User",
     short_name: "Admin",
     workflow_state: "registered"
   )
   
   # Create pseudonym (login)
   pseudonym = user.pseudonyms.create!(
     unique_id: "admin@canvas.local",
     password: "password123",
     password_confirmation: "password123",
     account: account
   )
   
   # Make user site admin
   account.account_users.create!(user: user, role: admin_role)
   
   puts "✅ Admin user created!"
   puts "Email: admin@canvas.local"
   puts "Password: password123"
   ```

4. **Exit Rails console**:
   ```ruby
   exit
   ```

### Method 2: Database Direct (Alternative)

If Rails console doesn't work, you can create an admin user directly:

1. **Access Canvas LMS database**:
   ```bash
   # For PostgreSQL
   psql canvas_development
   
   # For MySQL  
   mysql canvas_development
   ```

2. **Run SQL commands**:
   ```sql
   -- Insert admin user
   INSERT INTO users (name, workflow_state, created_at, updated_at) 
   VALUES ('Admin User', 'registered', NOW(), NOW());
   
   -- Get the user ID
   SELECT id FROM users WHERE name = 'Admin User';
   
   -- Insert pseudonym (replace USER_ID with actual ID)
   INSERT INTO pseudonyms (user_id, account_id, unique_id, crypted_password, workflow_state, created_at, updated_at)
   VALUES (USER_ID, 1, 'admin@canvas.local', 'encrypted_password_here', 'active', NOW(), NOW());
   
   -- Make user admin (replace USER_ID with actual ID)
   INSERT INTO account_users (account_id, user_id, workflow_state, created_at, updated_at)
   VALUES (1, USER_ID, 'active', NOW(), NOW());
   ```

### Method 3: Canvas Web Interface

1. **Visit Canvas LMS**: http://localhost:3000
2. **Click "Don't have an account? Sign up"** (if available)
3. **Create account** with admin privileges
4. **Or use existing admin account** if Canvas was set up with one

## Login to Canvas LMS

1. **Visit**: http://localhost:3000
2. **Login with**:
   - Email: `admin@canvas.local`
   - Password: `password123`
3. **Verify admin access** - You should see admin menu options

## Run Seed Data Script

Once logged in as admin:

1. **Open browser console** (F12)
2. **Copy script content** from `scripts/seed-canvas-browser.js`
3. **Paste into console** and press Enter
4. **Run the seeder**:
   ```javascript
   seedCanvasData()
   ```
5. **Wait for completion** - Should take 1-2 minutes
6. **Check ClassApex LMS** at http://localhost:3003

## Troubleshooting

### "Access Denied" Errors
- Make sure the user has admin privileges
- Check that you're logged into the correct Canvas instance
- Verify the account_users table has the admin role

### Rails Console Won't Start
- Make sure you're in the Canvas LMS directory
- Run `bundle install` first
- Check that the database is running and accessible

### Database Connection Issues
- Verify Canvas LMS database is running
- Check database configuration in `config/database.yml`
- Ensure proper database permissions

### Script Fails with Authentication Errors
- Refresh the Canvas LMS page
- Make sure you're still logged in
- Try logging out and back in
- Clear browser cache/cookies

## Default Canvas Admin

If Canvas LMS was installed with default settings, try these common admin accounts:

- **Email**: `admin@instructure.com`
- **Password**: `password` or `admin123`

Or check your Canvas installation documentation for default credentials.

## Creating API Token (Optional)

For programmatic access, create an API token:

1. **Login to Canvas** as admin
2. **Go to Account → Settings**
3. **Click "New Access Token"**
4. **Set purpose**: "ClassApex LMS Integration"
5. **Copy the token** and save it securely
6. **Use in scripts**:
   ```bash
   export CANVAS_ADMIN_TOKEN=your_token_here
   ```

## Verification

After setup, verify everything works:

1. ✅ **Can login to Canvas LMS** at http://localhost:3000
2. ✅ **Have admin privileges** (can see admin menu)
3. ✅ **Can run seed script** without errors
4. ✅ **Data appears in ClassApex LMS** at http://localhost:3003
5. ✅ **Canvas REST API responds** (check browser network tab)

## Next Steps

1. **Run the seed data script** to populate Canvas with sample data
2. **Explore ClassApex LMS** to see the Canvas integration
3. **Test all features** - Dashboard, Courses, Calendar, etc.
4. **Customize the data** by modifying the seed scripts
5. **Add real users and content** as needed
