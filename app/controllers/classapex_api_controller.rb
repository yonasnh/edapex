# frozen_string_literal: true

class ClassapexApiController < ApplicationController
  before_action :require_user_or_dev

  def require_user_or_dev
    return true if Rails.env.development?
    @account = Account.default
    unless @account.grants_right?(@current_user, :manage_account_settings)
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def cleanup_test_records
    begin
      course_pattern = "%Test%"
      e2e_pattern = "%E2E%"
      
      courses = Course.where("name ILIKE ? OR course_code ILIKE ?", course_pattern, course_pattern)
                      .or(Course.where("name ILIKE ? OR course_code ILIKE ?", e2e_pattern, e2e_pattern))
                      .to_a
      
      demo_course_codes = ["CS-402", "HCI-350", "DS-101"]
      courses += Course.where(course_code: demo_course_codes).to_a
      
      deleted_courses_count = 0
      courses.uniq.each do |c|
        c.destroy
        deleted_courses_count += 1
      end

      users = User.where("name LIKE 'PlayStudent%'").to_a
      
      demo_usernames = ["sarah.johnson", "michael.chen", "alice.smith", "bob.wilson"]
      demo_pseudonyms = Pseudonym.where(unique_id: demo_usernames).to_a
      demo_users = demo_pseudonyms.map(&:user).compact
      
      users += demo_users
      
      deleted_users_count = 0
      users.uniq.each do |u|
        u.pseudonyms.destroy_all
        u.communication_channels.destroy_all
        u.destroy
        deleted_users_count += 1
      end

      AccountReport.delete_all

      render json: { 
        status: 'success', 
        message: "Cleaned up #{deleted_courses_count} courses and #{deleted_users_count} mock users successfully."
      }
    rescue => e
      render json: { status: 'error', message: e.message }, status: :internal_server_error
    end
  end

  def import_demo_data
    begin
      # 1. Look up student (Yonas Nebro)
      student = User.find_by(id: 1) || User.first
      if student.nil?
        return render json: { status: 'error', message: 'No student user (ID: 1) found.' }, status: :bad_request
      end

      # Update student name to Yonas Nebro to ensure consistency
      student.update!(name: "Yonas Nebro")

      # 2. Find or create teachers and other students
      p1 = Pseudonym.where(unique_id: "sarah.johnson").first
      teacher1 = p1&.user || User.create!(
        name: "Dr. Sarah Johnson",
        workflow_state: 'registered'
      )
      if teacher1.pseudonyms.empty?
        teacher1.pseudonyms.create!(unique_id: "sarah.johnson", password: "password123", password_confirmation: "password123", account: Account.default)
        teacher1.communication_channels.create!(path: "sarah.johnson@university.edu", path_type: "email", workflow_state: "active")
      end

      p2 = Pseudonym.where(unique_id: "michael.chen").first
      teacher2 = p2&.user || User.create!(
        name: "Prof. Michael Chen",
        workflow_state: 'registered'
      )
      if teacher2.pseudonyms.empty?
        teacher2.pseudonyms.create!(unique_id: "michael.chen", password: "password123", password_confirmation: "password123", account: Account.default)
        teacher2.communication_channels.create!(path: "michael.chen@university.edu", path_type: "email", workflow_state: "active")
      end

      p_alice = Pseudonym.where(unique_id: "alice.smith").first
      student_alice = p_alice&.user || User.create!(
        name: "Alice Smith",
        workflow_state: 'registered'
      )
      if student_alice.pseudonyms.empty?
        student_alice.pseudonyms.create!(unique_id: "alice.smith", password: "password123", password_confirmation: "password123", account: Account.default)
        student_alice.communication_channels.create!(path: "alice.smith@student.edu", path_type: "email", workflow_state: "active")
      end

      p_bob = Pseudonym.where(unique_id: "bob.wilson").first
      student_bob = p_bob&.user || User.create!(
        name: "Bob Wilson",
        workflow_state: 'registered'
      )
      if student_bob.pseudonyms.empty?
        student_bob.pseudonyms.create!(unique_id: "bob.wilson", password: "password123", password_confirmation: "password123", account: Account.default)
        student_bob.communication_channels.create!(path: "bob.wilson@student.edu", path_type: "email", workflow_state: "active")
      end

      # 3. Create or cleanup the three target courses
      courses_data = [
        { code: "CS-402", name: "Advanced Software Engineering Practice", teacher: teacher1, students: [student, student_alice, student_bob] },
        { code: "HCI-350", name: "Human-Computer Interaction", teacher: teacher2, students: [student, student_alice] },
        { code: "DS-101", name: "Data Science Essentials", teacher: teacher1, students: [student, student_bob] }
      ]

      created_courses = []

      courses_data.each do |cdata|
        # Clean up existing course with the same code first to have a clean slate
        existing = Course.where(course_code: cdata[:code]).to_a
        existing.each(&:destroy)

        course = Course.new(name: cdata[:name], course_code: cdata[:code])
        course.account = Account.default
        course.workflow_state = "available"
        course.save!

        # Enroll teacher
        course.enroll_teacher(cdata[:teacher], enrollment_state: 'active')

        # Enroll students
        cdata[:students].each do |s|
          course.enroll_student(s, enrollment_state: 'active')
        end

        created_courses << { course: course, teacher: cdata[:teacher], students: cdata[:students] }
      end

      # --- POPULATE COURSE 1 (CS-402) ---
      c1_info = created_courses.find { |cc| cc[:course].course_code == "CS-402" }
      c1 = c1_info[:course]
      t1 = c1_info[:teacher]

      # Syllabus
      c1.syllabus_body = "<h3>CS-402 Syllabus</h3><p>Welcome to Advanced Software Engineering. In this course we will learn about Agile methodologies, requirements gathering, unit testing, CI/CD pipelines, and microservice architectures.</p>"
      c1.save!

      # Modules
      m1 = c1.context_modules.create!(name: "Module 1: Agile Methodologies & Project Infrastructure")
      m2 = c1.context_modules.create!(name: "Module 2: Testing Strategies & TDD")
      m3 = c1.context_modules.create!(name: "Module 3: Deployments & Microservices")

      # Module 1 Items
      # Quiz 1
      q1 = c1.quizzes.create!(
        title: "Quiz 1: Agile Methods & Requirements",
        points_possible: 20,
        quiz_type: 'assignment',
        allowed_attempts: 1
      )
      qq1 = q1.quiz_questions.create!(
        question_data: {
          name: "Question 1",
          question_text: "Which Agile framework uses Sprints and Daily Standups?",
          question_type: "multiple_choice_question",
          points_possible: 10,
          answers: [
            { id: 1001, text: "Scrum", weight: 100 },
            { id: 1002, text: "Waterfall", weight: 0 },
            { id: 1003, text: "Spiral", weight: 0 }
          ]
        }
      )
      qq2 = q1.quiz_questions.create!(
        question_data: {
          name: "Question 2",
          question_text: "What does CI stand for in CI/CD?",
          question_type: "multiple_choice_question",
          points_possible: 10,
          answers: [
            { id: 2001, text: "Continuous Integration", weight: 100 },
            { id: 2002, text: "Continuous Improvement", weight: 0 }
          ]
        }
      )
      q1.publish!
      m1.add_item({ type: 'quiz', id: q1.id })

      # Submit and grade Quiz 1 for Yonas
      q1_sub = q1.generate_submission(student)
      q1_sub.submission_data = {
        "question_#{qq1.id}" => "1001",
        "question_#{qq2.id}" => "2001"
      }
      q1_sub.complete!

      # Assignment 1
      a1 = c1.assignments.create!(
        title: "Assignment 1: Complete Git & CI/CD workflow",
        points_possible: 100,
        submission_types: 'online_text_entry',
        description: 'Submit your repository link and details of the CI/CD pipeline.',
        due_at: 3.days.ago
      )
      m1.add_item({ type: 'assignment', id: a1.id })

      # Submit and grade Assignment 1 for Yonas
      sub1 = a1.submit_homework(
        student,
        submission_type: 'online_text_entry',
        body: "https://github.com/ynebro/sw-project-cicd. Pipeline runs on GitHub Actions and validates all unit tests."
      )
      a1.grade_student(student, grade: "95", score: 95, grader: t1)
      sub1.add_comment(author: t1, comment: "Excellent CI/CD pipeline setup. Please add documentation next time.")

      # Module 2 Items
      # Assignment 2 (Submitted but Ungraded for SpeedGrader verification)
      a2 = c1.assignments.create!(
        title: "Assignment 2: Unit Testing & Mocking Practice",
        points_possible: 100,
        submission_types: 'online_text_entry',
        description: 'Implement unit tests using RSpec/Jest with mocking libraries.',
        due_at: 1.day.from_now
      )
      m2.add_item({ type: 'assignment', id: a2.id })

      sub2 = a2.submit_homework(
        student,
        submission_type: 'online_text_entry',
        body: "I completed the tests using Jest and mocked all database connections. Code coverage is at 98%."
      )

      # Discussion
      disc1 = c1.discussion_topics.create!(
        title: "Why TDD? Pros and Cons",
        message: "Discuss the advantages and disadvantages of Test-Driven Development in real-world team setups.",
        user: t1,
        workflow_state: 'active'
      )
      disc1.discussion_entries.create!(message: "I think TDD is great for clarity but can slow down initial velocity.", user: student)
      disc1.discussion_entries.create!(message: "Agree, but it saves maintenance time in the long run!", user: t1)

      # Module 3 Items
      # Assignment 3 (Future, not submitted)
      a3 = c1.assignments.create!(
        title: "Assignment 3: Dockerizing a Multi-service App",
        points_possible: 100,
        submission_types: 'online_text_entry',
        description: 'Create a docker-compose setup containing rails, react, and postgres.',
        due_at: 10.days.from_now
      )
      m3.add_item({ type: 'assignment', id: a3.id })

      # Announcement
      ann1 = Announcement.new
      ann1.context = c1
      ann1.title = "Guest speaker on Kubernetes next Monday!"
      ann1.message = "Don't miss it! A lead engineer from Google will join us to talk about cluster scaling."
      ann1.user = t1
      ann1.workflow_state = 'active'
      ann1.save!


      # --- POPULATE COURSE 2 (HCI-350) ---
      c2_info = created_courses.find { |cc| cc[:course].course_code == "HCI-350" }
      c2 = c2_info[:course]
      t2 = c2_info[:teacher]

      # Syllabus
      c2.syllabus_body = "<h3>HCI-350 Syllabus</h3><p>Introduction to UI/UX, user testing, prototyping, and accessibility audits.</p>"
      c2.save!

      # Modules & Assignments
      m2_1 = c2.context_modules.create!(name: "Module 1: Design Principles")
      a2_1 = c2.assignments.create!(
        title: "Assignment 1: Figma Mockup of a Dashboard",
        points_possible: 100,
        submission_types: 'online_text_entry',
        description: 'Design a high-fidelity dashboard mockup for a tutoring platform.',
        due_at: 5.days.ago
      )
      m2_1.add_item({ type: 'assignment', id: a2_1.id })

      # Submit and grade
      sub2_1 = a2_1.submit_homework(student, submission_type: 'online_text_entry', body: "Figma link: figma.com/file/dash-mockup")
      a2_1.grade_student(student, grade: "92", score: 92, grader: t2)

      # Discussion
      disc2 = c2.discussion_topics.create!(
        title: "Critique a Bad UI",
        message: "Find a website with poor UI and critique it using Nielsen's Heuristics.",
        user: t2,
        workflow_state: 'active'
      )
      disc2.discussion_entries.create!(message: "I selected my local DMV website. It violates 'Consistency and standards' everywhere.", user: student)


      # --- POPULATE COURSE 3 (DS-101) ---
      c3_info = created_courses.find { |cc| cc[:course].course_code == "DS-101" }
      c3 = c3_info[:course]
      t3 = c3_info[:teacher]

      # Modules & Assignments
      m3_1 = c3.context_modules.create!(name: "Module 1: Python Libraries")
      a3_1 = c3.assignments.create!(
        title: "Assignment 1: Jupyter Analysis of Airbnb Data",
        points_possible: 100,
        submission_types: 'online_text_entry',
        description: 'Use Pandas and Matplotlib to inspect price correlations.',
        due_at: 4.days.ago
      )
      m3_1.add_item({ type: 'assignment', id: a3_1.id })

      # Submit and grade
      sub3_1 = a3_1.submit_homework(student, submission_type: 'online_text_entry', body: "Submitted notebook on Airbnb data.")
      a3_1.grade_student(student, grade: "88", score: 88, grader: t3)

      # Recalculate grades for Yonas Nebro in all courses
      Enrollment.recompute_final_score(student.id, c1.id)
      Enrollment.recompute_final_score(student.id, c2.id)
      Enrollment.recompute_final_score(student.id, c3.id)

      # 4. Seed realistic completed/running/error reports
      require 'tempfile'
      AccountReport.delete_all

      create_report_attachment = ->(account, user, filename, content) do
        temp = Tempfile.open([filename, ".csv"])
        temp.write(content)
        temp.close
        data = Canvas::UploadedFile.new(temp.path, "text/csv")
        attachment = account.attachments.create!(
          uploaded_data: data,
          display_name: filename,
          filename: filename,
          user: user
        )
        temp.unlink
        attachment
      end

      # Grade Export CSV
      att1 = create_report_attachment.call(
        Account.default,
        student,
        "grade_export_#{Time.zone.now.strftime('%d_%b_%Y')}_1.csv",
        "student_id,student_name,course_id,course_name,grade,score\n1,Yonas Nebro,15,Advanced Software Engineering Practice,A,95.83\n"
      )
      Account.default.account_reports.create!(
        user: student,
        report_type: 'grade_export_csv',
        workflow_state: 'complete',
        progress: 100,
        created_at: 2.hours.ago,
        start_at: 2.hours.ago + 5.seconds,
        end_at: 2.hours.ago + 45.seconds,
        attachment: att1
      )

      # Last User Access CSV
      att2 = create_report_attachment.call(
        Account.default,
        student,
        "last_user_access_#{Time.zone.now.strftime('%d_%b_%Y')}_2.csv",
        "user_id,user_name,last_login,ip_address\n1,Yonas Nebro,#{Time.zone.now.iso8601},127.0.0.1\n"
      )
      Account.default.account_reports.create!(
        user: student,
        report_type: 'last_user_access_csv',
        workflow_state: 'complete',
        progress: 100,
        created_at: 1.day.ago,
        start_at: 1.day.ago + 2.seconds,
        end_at: 1.day.ago + 20.seconds,
        attachment: att2
      )

      # Student Activity CSV (last_enrollment_activity_csv)
      att3 = create_report_attachment.call(
        Account.default,
        student,
        "last_enrollment_activity_#{Time.zone.now.strftime('%d_%b_%Y')}_3.csv",
        "course_id,course_code,student_name,total_activity_time_seconds\n15,CS-402,Yonas Nebro,42300\n"
      )
      Account.default.account_reports.create!(
        user: student,
        report_type: 'last_enrollment_activity_csv',
        workflow_state: 'complete',
        progress: 100,
        created_at: 5.hours.ago,
        start_at: 5.hours.ago + 3.seconds,
        end_at: 5.hours.ago + 50.seconds,
        attachment: att3
      )

      # Unused Courses CSV (running)
      Account.default.account_reports.create!(
        user: student,
        report_type: 'unused_courses_csv',
        workflow_state: 'running',
        progress: 45,
        created_at: 2.minutes.ago,
        start_at: 2.minutes.ago + 4.seconds
      )

      # Zero Activity CSV (error)
      Account.default.account_reports.create!(
        user: student,
        report_type: 'zero_activity_csv',
        workflow_state: 'error',
        progress: 100,
        message: "Generating the report failed. Unable to query activity logs.",
        created_at: 3.hours.ago,
        start_at: 3.hours.ago + 10.seconds,
        end_at: 3.hours.ago + 15.seconds
      )

      render json: { 
        status: 'success', 
        message: 'Comprehensive realistic demo data imported successfully!'
      }
    rescue => e
      render json: { status: 'error', message: e.message }, status: :internal_server_error
    end
  end

  def factory_reset
    begin
      # 1. Identify administrators and current user to safeguard them
      keep_user_ids = [@current_user&.id].compact
      admin_users = Account.default.account_users.map(&:user).compact rescue []
      keep_user_ids += admin_users.map(&:id) if admin_users.any?
      keep_user_ids = keep_user_ids.uniq

      deleted_courses_count = 0
      deleted_users_count = 0

      ActiveRecord::Base.transaction do
        # 2. Destroy all courses (which cascades to enrollments, assignments, quizzes, etc.)
        courses = Course.all.to_a
        courses.each do |c|
          c.destroy
          deleted_courses_count += 1
        end

        # 3. Destroy all non-admin users and their login pseudonyms
        users = User.where.not(id: keep_user_ids).to_a
        users.each do |u|
          u.pseudonyms.destroy_all
          u.communication_channels.destroy_all
          u.destroy
          deleted_users_count += 1
        end

        # 4. Clear all generated reports
        AccountReport.delete_all

        # 5. Clear all attachments except those associated with administrative users
        Attachment.where.not(context_type: 'User', context_id: keep_user_ids).destroy_all rescue nil

        # 6. Reset custom branding configurations
        BrandConfig.destroy_all rescue nil
      end

      render json: { 
        status: 'success', 
        message: "System factory reset complete! Purged #{deleted_courses_count} courses, #{deleted_users_count} custom users, and all custom branding styles while safeguarding administrative accounts."
      }
    rescue => e
      render json: { status: 'error', message: e.message }, status: :internal_server_error
    end
  end
end
