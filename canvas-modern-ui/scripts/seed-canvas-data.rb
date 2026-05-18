#!/usr/bin/env ruby
# Canvas LMS Seed Data Script
# This script creates sample data in Canvas LMS to demonstrate the ClassApex frontend

require 'net/http'
require 'json'
require 'uri'

class CanvasSeedData
  def initialize(canvas_url = 'http://localhost:3000', admin_token = nil)
    @canvas_url = canvas_url
    @admin_token = admin_token
    @headers = {
      'Content-Type' => 'application/json',
      'Accept' => 'application/json'
    }
    @headers['Authorization'] = "Bearer #{@admin_token}" if @admin_token
  end

  def seed_all_data
    puts "🌱 Starting Canvas LMS seed data creation..."
    
    # Create accounts and users first
    create_sample_users
    
    # Create courses
    courses = create_sample_courses
    
    # Create assignments for each course
    courses.each { |course| create_sample_assignments(course['id']) }
    
    # Create discussions for each course
    courses.each { |course| create_sample_discussions(course['id']) }
    
    # Create calendar events
    create_sample_calendar_events
    
    # Create files and folders
    courses.each { |course| create_sample_files(course['id']) }
    
    puts "✅ Canvas LMS seed data creation completed!"
    puts "🌐 Visit http://localhost:3003 to see the data in ClassApex LMS"
  end

  private

  def make_request(method, endpoint, data = nil)
    uri = URI("#{@canvas_url}#{endpoint}")
    http = Net::HTTP.new(uri.host, uri.port)
    
    case method.upcase
    when 'GET'
      request = Net::HTTP::Get.new(uri, @headers)
    when 'POST'
      request = Net::HTTP::Post.new(uri, @headers)
      request.body = data.to_json if data
    when 'PUT'
      request = Net::HTTP::Put.new(uri, @headers)
      request.body = data.to_json if data
    end

    response = http.request(request)
    
    if response.code.to_i >= 200 && response.code.to_i < 300
      JSON.parse(response.body) rescue response.body
    else
      puts "❌ API Error: #{response.code} #{response.message}"
      puts "Response: #{response.body}"
      nil
    end
  end

  def create_sample_users
    puts "👥 Creating sample users..."
    
    users = [
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@university.edu",
        login: "sarah.johnson",
        role: "teacher"
      },
      {
        name: "Prof. Michael Chen",
        email: "michael.chen@university.edu", 
        login: "michael.chen",
        role: "teacher"
      },
      {
        name: "Alice Smith",
        email: "alice.smith@student.edu",
        login: "alice.smith", 
        role: "student"
      },
      {
        name: "Bob Wilson",
        email: "bob.wilson@student.edu",
        login: "bob.wilson",
        role: "student"
      },
      {
        name: "Emma Davis",
        email: "emma.davis@student.edu",
        login: "emma.davis",
        role: "student"
      }
    ]

    users.each do |user_data|
      user = make_request('POST', '/api/v1/accounts/1/users', {
        user: {
          name: user_data[:name],
          short_name: user_data[:name].split(' ').first,
          sortable_name: user_data[:name]
        },
        pseudonym: {
          unique_id: user_data[:login],
          password: 'password123',
          sis_user_id: user_data[:login]
        },
        communication_channel: {
          type: 'email',
          address: user_data[:email]
        }
      })
      
      if user
        puts "✅ Created user: #{user_data[:name]}"
      end
    end
  end

  def create_sample_courses
    puts "📚 Creating sample courses..."
    
    courses_data = [
      {
        name: "Introduction to Computer Science",
        course_code: "CS101",
        description: "Fundamental concepts of computer science including programming, algorithms, and data structures.",
        term: "Fall 2024"
      },
      {
        name: "Advanced Mathematics", 
        course_code: "MATH301",
        description: "Advanced topics in calculus, linear algebra, and differential equations.",
        term: "Fall 2024"
      },
      {
        name: "Web Development Fundamentals",
        course_code: "WEB201", 
        description: "Learn HTML, CSS, JavaScript, and modern web development frameworks.",
        term: "Fall 2024"
      },
      {
        name: "Data Science Essentials",
        course_code: "DS101",
        description: "Introduction to data analysis, statistics, and machine learning.",
        term: "Fall 2024"
      },
      {
        name: "Digital Marketing Strategy",
        course_code: "MKT250",
        description: "Modern digital marketing techniques and social media strategies.",
        term: "Fall 2024"
      }
    ]

    created_courses = []
    
    courses_data.each do |course_data|
      course = make_request('POST', '/api/v1/accounts/1/courses', {
        course: {
          name: course_data[:name],
          course_code: course_data[:course_code],
          public_description: course_data[:description],
          is_public: true,
          workflow_state: 'available'
        }
      })
      
      if course
        puts "✅ Created course: #{course_data[:name]} (#{course_data[:course_code]})"
        created_courses << course
        
        # Publish the course
        make_request('PUT', "/api/v1/courses/#{course['id']}", {
          course: { event: 'offer' }
        })
      end
    end
    
    created_courses
  end

  def create_sample_assignments(course_id)
    puts "📝 Creating assignments for course #{course_id}..."
    
    assignments = [
      {
        name: "Programming Assignment 1",
        description: "Implement basic algorithms and data structures",
        points_possible: 100,
        due_at: (Date.today + 7).to_time.iso8601
      },
      {
        name: "Midterm Exam",
        description: "Comprehensive exam covering first half of course",
        points_possible: 150,
        due_at: (Date.today + 14).to_time.iso8601
      },
      {
        name: "Final Project",
        description: "Capstone project demonstrating course concepts",
        points_possible: 200,
        due_at: (Date.today + 30).to_time.iso8601
      }
    ]

    assignments.each do |assignment_data|
      assignment = make_request('POST', "/api/v1/courses/#{course_id}/assignments", {
        assignment: assignment_data.merge(
          submission_types: ['online_upload', 'online_text_entry'],
          workflow_state: 'published'
        )
      })
      
      if assignment
        puts "  ✅ Created assignment: #{assignment_data[:name]}"
      end
    end
  end

  def create_sample_discussions(course_id)
    puts "💬 Creating discussions for course #{course_id}..."
    
    discussions = [
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
    ]

    discussions.each do |discussion_data|
      discussion = make_request('POST', "/api/v1/courses/#{course_id}/discussion_topics", {
        discussion_topic: discussion_data.merge(
          discussion_type: 'threaded',
          workflow_state: 'active'
        )
      })
      
      if discussion
        puts "  ✅ Created discussion: #{discussion_data[:title]}"
      end
    end
  end

  def create_sample_calendar_events
    puts "📅 Creating calendar events..."
    
    events = [
      {
        title: "Office Hours",
        description: "Weekly office hours for student questions",
        start_at: (Date.today + 1).to_time.iso8601,
        end_at: (Date.today + 1).to_time.advance(hours: 2).iso8601
      },
      {
        title: "Guest Lecture: Industry Trends",
        description: "Special guest speaker discussing current industry trends",
        start_at: (Date.today + 10).to_time.iso8601,
        end_at: (Date.today + 10).to_time.advance(hours: 1.5).iso8601
      }
    ]

    events.each do |event_data|
      event = make_request('POST', '/api/v1/calendar_events', {
        calendar_event: event_data
      })
      
      if event
        puts "  ✅ Created event: #{event_data[:title]}"
      end
    end
  end

  def create_sample_files(course_id)
    puts "📁 Creating files for course #{course_id}..."
    
    # Create folders first
    folders = [
      { name: "Lecture Notes" },
      { name: "Assignments" },
      { name: "Resources" }
    ]

    folders.each do |folder_data|
      folder = make_request('POST', "/api/v1/courses/#{course_id}/folders", {
        folder: folder_data
      })
      
      if folder
        puts "  ✅ Created folder: #{folder_data[:name]}"
      end
    end
  end
end

# Run the seed script
if __FILE__ == $0
  puts "🚀 Canvas LMS Seed Data Generator"
  puts "================================="
  
  # You can pass an admin token as an environment variable
  admin_token = ENV['CANVAS_ADMIN_TOKEN']
  
  if admin_token.nil? || admin_token.empty?
    puts "⚠️  No admin token provided. Some operations may require authentication."
    puts "   Set CANVAS_ADMIN_TOKEN environment variable for full functionality."
  end
  
  seeder = CanvasSeedData.new('http://localhost:3000', admin_token)
  seeder.seed_all_data
end
