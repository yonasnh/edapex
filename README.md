# 🎓 ClassApex LMS Ecosystem

<div align="center">
  <img src="canvas-modern-ui/classapex.png" alt="ClassApex Logo" width="160" height="160" style="border-radius: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.15)">

  **Next-Generation Learning Management System combining a robust Rails API Core with a state-of-the-art React/Carbon frontend.**

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Ruby on Rails](https://img.shields.io/badge/Ruby_on_Rails-7.2+-CC0000?logo=ruby-on-rails&logoColor=white)](https://rubyonrails.org/)
  [![Carbon Design System](https://img.shields.io/badge/Carbon-Design-System-161616?logo=ibm&logoColor=white)](https://carbondesignsystem.com/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-18.2+-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
</div>

---

## 🌟 Overview

**ClassApex LMS** is an enterprise-grade, high-performance Learning Management System designed to bring premium aesthetics, accessibility, and modern interactivity to educational technology. 

By combining the battle-tested, sharded database infrastructure of the Rails Core with a cutting-edge, mobile-first frontend built using the **IBM Carbon Design System**, ClassApex delivers a fast, intuitive, and accessible learning ecosystem for institutions, teachers, and students.

---

## 🏗️ System Architecture

ClassApex is organized as a clean, unified workspace where the heavy-duty Rails backend handles business logic, databases, and GraphQL/REST APIs, while Vite servers deliver specialized frontend clients.

```
┌──────────────────────────────────────────────────────────────────┐
│                         ClassApex LMS                            │
├──────────────────────────────────────────────────────────────────┤
│             Vite-Powered Frontend Client (:3003)                 │
│         React 18 + TypeScript + Carbon Design System             │
├──────────────────┬─────────────────────────────┬─────────────────┤
│   GraphQL API    │      LTI 1.3 Service        │   REST Proxy    │
│     (:4003)      │          (:4001)            │     (:3000)     │
├──────────────────┴─────────────────────────────┴─────────────────┤
│                       ClassApex Rails Core                       │
│              Multi-tenancy + Sharding + PostgreSQL               │
└──────────────────────────────────────────────────────────────────┘
```

### Core Services:
* **ClassApex Frontend** (`:3003`): The primary modern app designed for students, teachers, and admins.
* **SchoolApex Demo Application** (`:3001`): A sandboxed alternative presentation application.
* **LTI Service** (`:4001`): Standardized LTI 1.3 integration engine.
* **GraphQL API Gateway** (`:4003`): Low-latency schema resolver for real-time notifications and widgets.
* **Rails Backend Engine** (`:3000`): The persistent relational controller layer.

---

## ✨ Platform Features

### 🔧 Unified Admin & Institution Operations
* **Administrative User Provisioning**: Fully integrated creation panel (`/admin/users`) allowing admins to register users, configure emails, passwords, and assign key institutional roles (`student`, `teacher`, `ta`, `observer`, `designer`, `admin`) directly syncing with the backend DB.
* **Act-As-User Masquerading**: Admins can instantly preview views through other student or instructor personas for live support and testing.
* **Parent / Observer Linking**: Direct UI and API capabilities to link student accounts to family/observer nodes.
* **SIS Imports Dashboard**: Queues bulk uploads of CSV/ZIP formatted rosters, syncing students, courses, and schedules securely via `/api/v1/accounts/1/sis_imports`.

### 📚 Course & Curriculum Management
* **Course Allocation**: Manage courses, schedule terms, edit syllabi, and coordinate multiple sections.
* **Content Migrations**: Upload standard Common Cartridge packages (`.imscc`) to automatically populate assignments, modules, and quizzes.
* **Course Catalog**: Accessible search engine allowing students to browse and self-enroll in courses.

### 👩‍🏫 Classroom & Learning Features
* **Modern Gradebook & Submissions**: Rich analytics dashboard to inspect score distributions and grading queues.
* **Enhanced Discussions**: Fast, responsive, threaded conversations with instant search.
* **AI-Powered Learning Assistant**: Conversational assistant drawer acting as a personal study tutor.

---

## 🚀 Quick Start (Development Setup)

ClassApex uses a multi-service runner to launch all services concurrently.

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Ruby** >= 3.4
* **Node.js** >= 18.0.0
* **pnpm** >= 8.0.0
* **PostgreSQL** & **Redis**

### 2. Startup Script
To launch the entire modern ecosystem at once:
```bash
# Start all background servers (Vite client, Rails server, LTI engine, GraphQL)
./canvas-modern-ui/start-services.sh start

# Check the health and PIDs of active servers
./canvas-modern-ui/start-services.sh status

# Stop all background servers
./canvas-modern-ui/start-services.sh stop
```

---

## 🧪 Testing & Database Seeding

### Seeding Demo Data
ClassApex includes custom Rails runners to populate your PostgreSQL DB with test records:
```bash
# Seed a basic course with students and sections
rails runner spec/fixtures/data_generation/generate_data.rb -b -i 1

# Seed courses with assignments and submissions
rails runner spec/fixtures/data_generation/generate_data.rb -a -i 1 -c "CS 101: Introduction to Programming"
```

### Running Tests
To verify system integrity across frontend and backend layers:
```bash
# Run backend RSpec suites
bundle exec rspec

# Run frontend Vitest suite
pnpm --filter classapex-lms test

# Run End-to-End Playwright UI tests
pnpm --filter classapex-lms test:e2e
```

---

## 📄 License & Attribution
ClassApex is built in partnership with the educational technology community. The platform leverages Instructure's open-source Canvas LMS database core engine, licensed under the AGPLv3. All custom modern interfaces, Carbon implementations, and integration layers are licensed under the MIT License.
