# Syncora Dashboard

A clean, modern React + Tailwind CSS dashboard shell for **Syncora** built with Vite and pure JavaScript.

## Features & Highlights

- **Pure JavaScript & React 18**: Zero TypeScript compilation overhead, fully modern functional React with hooks.
- **Tailwind CSS & Lucide Icons**: Tailored dark/light neutral palette suitable for high-focus engineering productivity.
- **Technical Contract v1.0 Mock Data**:
  - `mockEmployees`: Registered team members with ID, name, role, email (`rahul@syncora.local`, `priya@syncora.local`).
  - `mockMeeting`: Extracted meeting model (`meet_001`), title "Sprint 1 Architecture & Milestones", 3 transcript segments with evidence IDs, decisions, open questions, and status-tracked tasks.
- **Top Navigation Bar (`Navbar.jsx`)**:
  - Syncora brand logo with version badge.
  - Interactive Meeting Dropdown Selector displaying "Sprint 1 Architecture & Milestones" with metadata flyout.
  - Mode Switcher Tabs for **[Manager View]**, **[Employee View]**, and **[Student View]**.
- **Slide-over Evidence Drawer (`EvidenceDrawer.jsx`)**:
  - Slide-over panel from the right screen edge with backdrop overlay and close icon.
  - Displays transcript segments sorted by `startTime` with formatted timestamps `[mm:ss]`, speaker ID, and text.
  - Visual highlighting for matched segment IDs with an amber accent border (`border-l-4 border-amber-500`), subtle amber tint (`bg-amber-500/10`), and bold text.
  - Match count badge and automatic smooth scrolling to the first highlighted segment.
- **Manager Dashboard (`ManagerDashboard.jsx`)**:
  - Header section with meeting metadata, completed status badge, and collapsible intelligence summary (Decisions with confidence scores & Open Questions with "View Context" buttons).
  - Pending Approvals Queue: editable task title and description, read-only speaker/deadline/type tags, uncertainty flags badge, assignee dropdown, native date input, "View Evidence", "Approve", and "Reject" buttons.
  - Approved Tasks Table: active deliverables tracking title, assigned employee, approved deadline, color-coded work status, and inspect evidence action.
- **Employee Dashboard (`EmployeeDashboard.jsx`)**:
  - Employee selector dropdown: switch view between registered team members (Rahul Sharma / Priya Patel).
  - Filters approved tasks assigned to the active employee with clean empty state when no tasks are assigned.
  - Interactive delivery status selector (`not_started`, `in_progress`, `blocked`, `completed`) with state sync to `App.jsx`.
  - Blocker & Clarification Notes: input text field and "Save Note" button with real-time alert highlighting.
  - "View Evidence" trigger linking directly to `EvidenceDrawer`.
- **Student & Observer View (`StudentView.jsx`)**:
  - High-level meeting summary card with metrics on analyzed segments, architecture decisions, and open questions.
  - Confirmed decisions and open questions with evidence context triggers.
  - Interactive self-study checklist: add custom topics/to-dos, toggle completion with progress meter, and delete items.
  - Full raw transcript stream with clickable segments to inspect evidence.
- **Root State & Shell (`App.jsx`)**:
  - Holds `currentRole` (default: `"manager"`), `meetingData`, and `activeEvidenceSegments`.
  - Conditionally renders `ManagerDashboard`, `EmployeeDashboard`, or `StudentView`.
  - Approving a task in Manager view commits the assignee and deadline, immediately displaying the item under that employee in Employee view.
  - Real-time status changes and notes in Employee view propagate across the application.
  - Includes a test button to open the drawer with `["seg_001"]` highlighted.

## Project Structure

```text
dashboard/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── src/
│   ├── index.css
│   ├── main.jsx
│   ├── App.jsx
│   ├── pages/
│   │   ├── ManagerDashboard.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   └── StudentView.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── EvidenceDrawer.jsx
│   └── api/
│       └── mockData.js
└── README.md
```

## Getting Started

To install dependencies and start the local development server:

```bash
cd dashboard
npm install
npm run dev
```
