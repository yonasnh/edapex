# Canvas LMS Installation Guide

## Complete Solution for Running Canvas LMS Successfully

This guide provides the exact steps to install and run Canvas LMS based on a successful resolution of PostgreSQL segmentation fault issues and dependency conflicts.

## Prerequisites

- macOS (tested on macOS)
- Homebrew package manager
- Git

## 1. Ruby Environment Setup

### Install rbenv (Ruby Version Manager)
```bash
# Install rbenv via Homebrew
brew install rbenv ruby-build

# Add rbenv to shell profile
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
source ~/.zshrc

# Install Ruby 3.2.7 (Canvas LMS compatible version)
rbenv install 3.2.7
rbenv global 3.2.7
rbenv rehash

# Verify Ruby installation
ruby -v  # Should show ruby 3.2.7
which ruby  # Should show ~/.rbenv/shims/ruby
```

## 2. PostgreSQL Setup

### Install PostgreSQL 13 (Critical Version)
```bash
# Install PostgreSQL 13 specifically (NOT version 14+)
brew install postgresql@13

# Add PostgreSQL 13 to PATH
echo 'export PATH="/usr/local/opt/postgresql@13/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Start PostgreSQL service
brew services start postgresql@13

# Verify PostgreSQL version
psql --version  # Should show PostgreSQL 13.x
```

### Create Database User
```bash
# Create PostgreSQL user for Canvas
createuser -s canvas
```

## 3. Canvas LMS Installation

### Clone Repository
```bash
# Clone Canvas LMS repository
git clone https://github.com/instructure/canvas-lms.git
cd canvas-lms
```

### Install Dependencies
```bash
# Install Bundler
gem install bundler

# Install Ruby dependencies with specific gem versions
bundle install

# Install Node.js dependencies
npm install
```

## 4. Critical Gem Version Configuration

### Update Gemfile for Compatibility
Add these specific versions to your `Gemfile`:

```ruby
# Critical: Use pg gem version 1.5.8 (NOT 1.5.9+)
gem 'pg', '1.5.8'

# Disable pg_query gem to avoid compilation issues
# gem 'pg_query'  # Comment out or remove this line
```

### Install with Correct Versions
```bash
# Update bundle with correct gem versions
bundle update pg
bundle install
```

## 5. Database Configuration

### Configure Database Settings
Create `config/database.yml`:

```yaml
development:
  adapter: postgresql
  encoding: unicode
  database: canvas_development
  pool: 5
  username: canvas
  password:
  host: localhost

test:
  adapter: postgresql
  encoding: unicode
  database: canvas_test
  pool: 5
  username: canvas
  password:
  host: localhost
```

### Setup Database
```bash
# Create and setup database
bundle exec rake db:create
bundle exec rake db:initial_setup

# When prompted, create admin account:
# - Name: Your Name
# - Email: your-email@example.com
# - Password: (choose a secure password)
```

## 6. Disable N+1 Query Detection (CRITICAL FIX)

### Problem Description
Canvas LMS uses the `prosopite` gem for N+1 query detection in development mode. This gem requires `pg_query` which often fails to compile on macOS due to native extension compatibility issues, causing the error:

```
LoadError (Could not load the 'pg_query' gem. Add `gem 'pg_query'` to your Gemfile)
```

### Method 1: Environment Variable (Recommended)
The cleanest solution is to disable N+1 detection entirely:

```bash
# Add to your shell profile (~/.zshrc or ~/.bash_profile)
echo 'export DISABLE_N_PLUS_ONE_DETECTION=true' >> ~/.zshrc
source ~/.zshrc

# Or run directly when starting the server
DISABLE_N_PLUS_ONE_DETECTION=true bundle exec rails server
```

### Method 2: Temporary Session Variable
For one-time use without modifying your shell profile:

```bash
# Start server with N+1 detection disabled
export DISABLE_N_PLUS_ONE_DETECTION=true
bundle exec rails server
```

### Method 3: Modify Prosopite Initializer (Alternative)
If you prefer to modify the code directly, edit `config/initializers/prosopite.rb`:

```ruby
module ProsopiteInitializer
  def self.configure!
    # Temporarily disable prosopite due to pg_query gem compatibility issues
    Rails.logger.info "Prosopite disabled: pg_query gem not available"
    # Comment out the prosopite configuration
  end
end

ProsopiteInitializer.configure!
```

### Why This Works
The Canvas application controller checks for this environment variable:

```ruby
if Rails.env.development? && !Canvas::Plugin.value_to_boolean(ENV["DISABLE_N_PLUS_ONE_DETECTION"])
  around_action :n_plus_one_detection
  # ... prosopite code that requires pg_query
end
```

Setting `DISABLE_N_PLUS_ONE_DETECTION=true` bypasses the entire N+1 detection system and avoids the `pg_query` dependency.

## 7. Application Configuration

### Create Required Config Files
```bash
# Copy example configuration files
cp config/delayed_jobs.yml.example config/delayed_jobs.yml
cp config/domain.yml.example config/domain.yml
cp config/external_migration.yml.example config/external_migration.yml
cp config/outgoing_mail.yml.example config/outgoing_mail.yml
cp config/security.yml.example config/security.yml
```

### Configure Domain Settings
Edit `config/domain.yml`:

```yaml
development:
  domain: "localhost:3000"
  ssl: false
```

## 8. Asset Compilation

### Compile Assets
```bash
# Compile CSS and JavaScript assets
bundle exec rake canvas:compile_assets
```

## 9. Start the Application

### Launch Canvas LMS
```bash
# Set critical environment variables and start server
export PATH="/usr/local/opt/postgresql@13/bin:$PATH"
export PATH="$HOME/.rbenv/shims:$PATH"
export DISABLE_N_PLUS_ONE_DETECTION=true  # CRITICAL: Prevents pg_query LoadError

# Start Rails server
bundle exec rails server

# Alternative one-liner (if environment variables not set globally)
DISABLE_N_PLUS_ONE_DETECTION=true bundle exec rails server
```

### Verify Server Startup
You should see output similar to:
```
=> Booting Puma
=> Rails 7.1.3 application starting in development
=> Run `bin/rails server --help` for more startup options
Puma starting in single mode...
* Puma version: 6.4.3 (ruby 3.2.7-p253) ("The Eagle of Durango")
*  Min threads: 0
*  Max threads: 1
*  Environment: development
*          PID: 12345
* Listening on http://127.0.0.1:3000
* Listening on http://[::1]:3000
Use Ctrl-C to stop
```

**Important**: If you see `LoadError (Could not load the 'pg_query' gem)`, the N+1 detection is still enabled. Stop the server and restart with the environment variable.

### Access Application
- Open browser to: `http://localhost:3000`
- Login with the admin account created during database setup

## 10. Verification Steps

### Test Core Functionality
1. **Dashboard**: Navigate to main dashboard
2. **Calendar**: Visit `/calendar` to test calendar functionality
3. **API Endpoints**: Check `/api/v1/accounts` for API functionality
4. **User Management**: Test user login/logout

### Check Logs
Monitor the Rails console for:
- ✅ No PostgreSQL segmentation faults
- ✅ No pg_query LoadError messages
- ✅ Successful database queries
- ✅ 200 OK responses for all pages

## Troubleshooting

### Common Issues and Solutions

#### pg_query LoadError (Most Common Issue)
**Error**: `LoadError (Could not load the 'pg_query' gem. Add 'gem pg_query' to your Gemfile)`

**Solution**:
```bash
# Stop the server and restart with N+1 detection disabled
export DISABLE_N_PLUS_ONE_DETECTION=true
bundle exec rails server

# Or add to your shell profile permanently
echo 'export DISABLE_N_PLUS_ONE_DETECTION=true' >> ~/.zshrc
source ~/.zshrc
```

#### PostgreSQL Version Issues
```bash
# If using wrong PostgreSQL version
brew uninstall postgresql
brew install postgresql@13
brew services restart postgresql@13
```

#### Ruby Version Conflicts
```bash
# Reset rbenv if conflicts occur
rbenv rehash
rbenv global 3.2.7
```

#### Gem Version Issues
```bash
# Force correct pg gem version
bundle update pg --conservative
gem uninstall pg_query  # Remove if installed
```

#### Database Connection Issues
```bash
# Reset database if needed
bundle exec rake db:drop
bundle exec rake db:create
bundle exec rake db:initial_setup
```

## Success Indicators

When properly installed, you should see:
- Canvas LMS dashboard loads completely
- No segmentation faults in terminal
- All navigation menus functional
- Calendar page accessible
- API endpoints responding
- Database queries executing successfully

## Version Compatibility Matrix

| Component | Working Version | Problematic Version | Notes |
|-----------|----------------|-------------------|-------|
| PostgreSQL | 13.16 | 14.17+ | Version 14+ causes segfaults |
| pg gem | 1.5.8 | 1.5.9+ | Later versions incompatible with PG 13 |
| Ruby | 3.2.7 | - | Canvas LMS requirement |
| pg_query | Disabled via env var | Any version | Fails to compile on macOS |
| N+1 Detection | Disabled | Enabled | Requires pg_query gem |

## Support

If you encounter issues:
1. Verify all version requirements are met
2. Check PostgreSQL is running on correct version
3. Ensure N+1 detection is disabled
4. Review Rails logs for specific error messages

## Advanced Configuration

### Optional: Redis Setup (for better performance)
```bash
# Install Redis for caching and job processing
brew install redis
brew services start redis

# Add to config/cache_store.yml
development:
  cache_store: redis_cache_store
```

### Optional: Background Job Processing
```bash
# Start delayed job workers (in separate terminal)
bundle exec script/delayed_job start

# Or run in foreground for development
bundle exec script/delayed_job run
```

### Development Tools Setup
```bash
# Install additional development tools
gem install solargraph  # Ruby language server
npm install -g eslint   # JavaScript linting

# Setup code quality tools
bundle exec rubocop --auto-gen-config  # Ruby style guide
```

## Production Deployment Notes

### Environment Variables for Production
```bash
# Required production environment variables
export RAILS_ENV=production
export SECRET_KEY_BASE=$(bundle exec rake secret)
export DATABASE_URL="postgresql://username:password@localhost/canvas_production"
export CANVAS_LMS_ADMIN_EMAIL="admin@yourdomain.com"
export CANVAS_LMS_ADMIN_PASSWORD="secure_password"
export CANVAS_LMS_ACCOUNT_NAME="Your Institution"
```

### Production Database Setup
```bash
# Production database setup
RAILS_ENV=production bundle exec rake db:create
RAILS_ENV=production bundle exec rake db:initial_setup
RAILS_ENV=production bundle exec rake canvas:compile_assets
```

## Security Considerations

### File Permissions
```bash
# Set appropriate file permissions
chmod 600 config/database.yml
chmod 600 config/security.yml
chmod -R 755 public/
```

### SSL Configuration (Production)
```yaml
# config/domain.yml for production
production:
  domain: "your-canvas-domain.com"
  ssl: true
  files_domain: "files.your-canvas-domain.com"
```

## Backup and Maintenance

### Database Backup
```bash
# Create database backup
pg_dump canvas_development > canvas_backup_$(date +%Y%m%d).sql

# Restore from backup
psql canvas_development < canvas_backup_YYYYMMDD.sql
```

### Log Management
```bash
# Monitor application logs
tail -f log/development.log

# Clean old logs
bundle exec rake log:clear
```

### Regular Maintenance Tasks
```bash
# Update Canvas LMS
git pull origin master
bundle install
npm install
bundle exec rake db:migrate
bundle exec rake canvas:compile_assets

# Clear cache
bundle exec rake tmp:clear
```

## Performance Optimization

### Database Optimization
```sql
-- Add database indexes for better performance
-- Run in PostgreSQL console
CREATE INDEX CONCURRENTLY idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX CONCURRENTLY idx_assignments_context ON assignments(context_id, context_type);
```

### Application Tuning
```ruby
# config/environments/development.rb additions
config.cache_classes = false
config.eager_load = false
config.consider_all_requests_local = true
config.action_controller.perform_caching = true
config.cache_store = :memory_store
```

## Integration Examples

### LTI Tool Integration
```ruby
# Example LTI tool configuration
# Add to config/lti_tools.yml
development:
  example_tool:
    consumer_key: "your_key"
    shared_secret: "your_secret"
    launch_url: "https://your-tool.com/launch"
    icon_url: "https://your-tool.com/icon.png"
```

### API Usage Examples
```bash
# Test API endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/accounts

# Create course via API
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"course":{"name":"Test Course"}}' \
     http://localhost:3000/api/v1/accounts/1/courses
```

---

**Note**: This installation guide is based on resolving specific compatibility issues between PostgreSQL 14+ and the pg gem, along with pg_query compilation problems. The solution involves using PostgreSQL 13 with pg gem 1.5.8 and disabling N+1 query detection.

**Last Updated**: August 2025
**Tested Environment**: macOS with PostgreSQL 13.16, Ruby 3.2.7, Rails 7.1.3
