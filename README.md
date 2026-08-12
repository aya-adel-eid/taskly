# Taskly

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.17.

## Development server

Run `ng serve --port 3000` for a dev server. Navigate to `http://localhost:3000/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# 📋 Taskly — Task Management System

A modern and responsive **task management web application** inspired by Jira, built to help teams organize projects, manage tasks, and track progress efficiently.

🔗 **Live Demo:** https://taskly-99u5.vercel.app/

---

## ✨ Features

- 📁 **Project Management** — Create and manage projects.
- ✅ **Task Management** — Create, update, and organize tasks.
- 📌 **Epic Management** — Manage project epics and deadlines.
- 👥 **Team Members** — Assign members to tasks and epics.
- 🖱️ **Drag & Drop Board** — Move tasks between different statuses.
- 📄 **Pagination** — Efficiently handle large amounts of data.
- 🔄 **Loading Skeletons** — Improved loading experience.
- 📱 **Responsive Design** — Optimized for desktop, tablet, and mobile.
- 🔐 **Project-based Routing** — Navigate between project sections easily.

## 🛠️ Tech Stack

- **Angular 17**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
- **Reactive Forms**
- **Angular Signals**
- **Angular Router**
- **REST APIs**
- **Git & GitHub**

## 📁 Project Structure

````text
## 📁 Project Structure

```text
src/
└── app/
    ├── core/
    │   ├── components/
    │   │   └── side-bar/
    │   ├── constants/
    │   ├── guards/
    │   ├── interceptors/
    │   ├── layout/
    │   └── services/
    │
    ├── features/
    │   ├── auth/
    │   ├── epics/
    │   ├── members/
    │   ├── projects/
    │   ├── statistics/
    │   └── tasks/
    │       ├── pages/
    │       │   ├── list-view/
    │       │   ├── task-details-page/
    │       │   └── task-form-page/
    │       ├── tasks/
    │       └── services/
    │
    ├── shared/
    │   ├── components/
    │   │   ├── breadcrumb/
    │   │   ├── pagination/
    │   │   ├── reusable-button/
    │   │   └── toast-message/
    │   ├── directives/
    │   │   └── infinite-scroll.directive.ts
    │   └── shared-service.service.ts
    │
    ├── app.component.ts
    ├── app.config.ts
    └── app.routes.ts
│
├── assets/
│   ├── images/
│   └── styles/
│
├── environments/
├── index.html
├── main.ts
└── styles.css
````

### 🏗️ Architecture

Taskly uses a **feature-based architecture** with clear separation of concerns:

- **Core** — Application-wide services, guards, interceptors, layout, and constants.
- **Features** — Independent business features such as Authentication, Projects, Tasks, Epics, Members, and Statistics.
- **Shared** — Reusable components, directives, and services used across multiple features.
- **Tasks** — Organized into dedicated pages, components, and services for better maintainability.
- **Assets** — Images and global styling resources.

## 📂 Main Sections

- Projects
- List View (Tasks)
- Board View (Tasks)
- Epics
- Members
- Project Details

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- pnpm

### Installation

Clone the repository:

```bash
git clone https://github.com/aya-adel-eid/taskly.git
```

Navigate to the project:

```bash
cd taskly
```

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
ng serve --port 3000
```

Open your browser and visit:

```text
http://localhost:3000
```

## 🔐 Demo Credentials

Use the following credentials to test the application:

**Email:** `ayaadel.dev9@gmail.com`
**Password:** `oya1235Aya$`

> This account is provided for demonstration and testing purposes.

## 👩‍💻 Author

**Aya Adel**

Frontend Developer passionate about building modern, responsive, and user-friendly web applications.

🔗 GitHub: https://github.com/aya-adel-eid/taskly
