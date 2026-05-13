Canvas LMS
======

Canvas is a modern, open-source [LMS](https://en.wikipedia.org/wiki/Learning_management_system)
developed and maintained by [Instructure Inc.](https://www.instructure.com/) It is released under the
AGPLv3 license for use by anyone interested in learning more about or using
learning management systems.

[Please see our main wiki page for more information](http://github.com/instructure/canvas-lms/wiki)

Installation
=======

## Quick Start (Native Development Environment)

> **Note**: This installation guide is for **native Ruby/Rails setup**. While this repository includes Docker files for containerized deployment, this guide covers the native installation method that's currently configured and running.

### Prerequisites
- Ruby 3.4+
- Node.js 18+
- PostgreSQL
- Redis
- Git
- Bundler (`gem install bundler`)

### 1. Clone and Setup
```bash
git clone https://github.com/instructure/canvas-lms.git
cd canvas-lms
```

### 2. Install Dependencies
```bash
# Install Ruby gems
bundle install

# Install Node.js packages
npm install
```

### 3. Database Setup
```bash
# Create and migrate database
rails db:create
rails db:initial_setup
```

### 4. Start the Application
```bash
# Start Rails server
rails server

# Or start with specific port
rails server -p 3000
```

### 5. Generate Demo Data (Optional)
Canvas includes a comprehensive data generation script for testing:

```bash
# Generate basic course with students
rails runner spec/fixtures/data_generation/generate_data.rb -b -i 1

# Generate course with assignments
rails runner spec/fixtures/data_generation/generate_data.rb -d -i 1 -c "Demo Course with Assignments"

# Generate course with submissions
rails runner spec/fixtures/data_generation/generate_data.rb -s -i 1 -c "Demo Course with Submissions"
```

**Data Generation Options:**
- `-a` - Generate all types of data (comprehensive)
- `-b` - Generate basic course with students
- `-d` - Generate course with assignments
- `-s` - Generate course with submissions
- `-g` - Generate gradebook data
- `-i [account_id]` - Specify account ID (use 1 for main account)
- `-c [course_name]` - Custom course name

### 6. Create Demo Users
Create a Ruby script file for demo users:

```ruby
# create_demo_users.rb
# Demo teacher
user = User.create!(name: 'Demo Teacher', workflow_state: 'registered')
pseudonym = user.pseudonyms.create!(
  unique_id: 'teacher@demo.com',
  password: 'password123',
  password_confirmation: 'password123',
  account: Account.find(1)
)
Course.where('name LIKE ?', '%Play Course%').each { |c| c.enroll_teacher(user).accept! }
puts 'Teacher: teacher@demo.com / password123'

# Demo student
user = User.create!(name: 'Demo Student', workflow_state: 'registered')
pseudonym = user.pseudonyms.create!(
  unique_id: 'student@demo.com',
  password: 'password123',
  password_confirmation: 'password123',
  account: Account.find(1)
)
Course.where('name LIKE ?', '%Play Course%').each { |c| c.enroll_student(user).accept! }
puts 'Student: student@demo.com / password123'
```

```bash
# Run the script
rails runner create_demo_users.rb
```

### 7. Access Canvas
- **URL**: http://localhost:3000
- **Demo Teacher**: teacher@demo.com / password123
- **Demo Student**: student@demo.com / password123

## Running the Application

### Start Canvas LMS
```bash
# Start Rails server
rails server

# Or start on specific port
rails server -p 3000

# Start in background
rails server -d
```

### Stop Canvas LMS
```bash
# Stop Rails server (Ctrl+C if running in foreground)
# Or if running in background, find and kill the process:
ps aux | grep rails
kill [process_id]
```

### Development Commands
```bash
# Access Rails console
rails console

# Run database migrations
rails db:migrate

# Run tests
bundle exec rspec

# Generate demo data
rails runner spec/fixtures/data_generation/generate_data.rb -h
```

### Check Application Status
```bash
# Check if Canvas is responding
curl http://localhost:3000/login/canvas

# View application logs
tail -f log/development.log
```



## Troubleshooting

### Common Issues and Fixes

**1. Feature Flag Errors**
If you encounter `NoMethodError: undefined method 'enabled?' for nil:NilClass`, ensure proper nil checking in feature flag calls:
```ruby
# Fix in app/controllers/application_controller.rb
tools.select! { |tool| tool.feature_flag&.enabled? } if tool.feature_flag
```

**2. Missing Template Errors**
If you see `Missing partial shared/_top_header`, create the missing template:
```erb
<!-- app/views/shared/_top_header.html.erb -->
<%= render partial: "shared/new_nav_header" %>
```

**3. Missing Helper Methods**
Add missing helper methods to ApplicationController as needed:
```ruby
def show_career_switch?
  return false unless @current_user
  return false unless @domain_root_account&.feature_enabled?(:horizon_learner_app)
  # ... implementation
end
helper_method :show_career_switch?
```

**4. User Model Methods**
If you encounter missing user methods like `show_sidebar`:
```ruby
# Add to app/models/user.rb
def show_sidebar
  if has_attribute?(:show_sidebar)
    read_attribute(:show_sidebar)
  else
    true
  end
end
```

**5. Route Helper Errors**
Fix incorrect route helper references in models:
```ruby
# Fix in app/models/account.rb - change account_reports_path to account_reports_tab_path
href: :account_reports_tab_path
```

## Alternative Installation Methods

### Docker Installation
This repository includes Docker files for containerized deployment. If you prefer Docker:
- See `docker-compose.yml` and the `docker-compose/` directory
- Follow the [Docker documentation](http://github.com/instructure/canvas-lms/wiki/Quick-Start) on the Canvas wiki

### Production Installation
For production deployments, see our detailed guides:
- [Quick Start](http://github.com/instructure/canvas-lms/wiki/Quick-Start)
- [Production Start](http://github.com/instructure/canvas-lms/wiki/Production-Start)


## Modern UI and LTI 1.3 Integration

This repository includes a Carbon‑powered Modern UI (canvas-modern-ui) and a plan to integrate it into Canvas LMS as an LTI 1.3 (Advantage) tool.

### Quick Start for Modern UI Demo
```bash
cd canvas-modern-ui
pnpm install
pnpm build
pnpm dev
# Open http://localhost:3001/
```

### LTI 1.3 Integration Plan
- Implement LTI service endpoints: `/.well-known/jwks.json`, `/lti/login`, `/lti/launch`
- Register Developer Key and Tool in Canvas; enable course nav and deep linking
- Parse launch claims → create secure session → bootstrap Modern UI
- Optional: OAuth OBO to call Canvas REST; enable NRPS/AGS/Deep Linking services

See `docs/IMPLEMENTATION_PLAN.md` for the full LTI section and `canvas-modern-ui/HANDOVER-CHECKLIST.md` for readiness checklist.

## Development Notes

### Recent Fixes Applied
This installation includes fixes for common startup issues:
- Feature flag nil checking in external tools
- Missing navigation templates
- Missing helper methods for Canvas Career functionality
- User model method definitions
- Route helper corrections

### Testing
After installation, you can run tests to verify everything is working:
```bash
bundle exec rspec spec/controllers/application_controller_spec.rb
```
