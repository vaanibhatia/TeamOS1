import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import RoleSelection from './components/RoleSelection';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import AllMeetingsPage from './pages/AllMeetingsPage';
import MeetingDetailsPage from './pages/MeetingDetailsPage';
import ManagerWorkspaceView from './pages/ManagerWorkspaceView';
import EmployeeWorkspaceView from './pages/EmployeeWorkspaceView';
import StudentWorkspaceView from './pages/StudentWorkspaceView';
import DeveloperDashboard from './pages/DeveloperDashboard';
import TaskDependencyGraph from './components/TaskDependencyGraph';
import AddTaskModal from './components/AddTaskModal';
import EvidenceDrawer from './components/EvidenceDrawer';
import DiscussionBoard from './components/DiscussionBoard';
import ProjectTimeline from './pages/ProjectTimeline';
import ProjectArchitectureView from './pages/ProjectArchitectureView';
import SolutionView from './pages/SolutionView';
import { ArchitectureProvider } from './context/ArchitectureContext';
import {
  mockMeetings,
  mockEmployees,
  initialTasks,
  studentInitialTasks,
  studentAiSuggestions,
  studentMeetings,
} from './api/mockData';

export default function App() {
  // 1. Role Selection & Authentication State
  // Check localStorage for persisted user session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('syncora_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      const savedAuth = localStorage.getItem('syncora_auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return parsed?.user || null;
      }
    } catch (e) {
      console.error('Failed to restore user from localStorage', e);
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const savedUser = localStorage.getItem('syncora_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return parsed?.role || null;
      }
      const savedAuth = localStorage.getItem('syncora_auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return parsed?.role || null;
      }
    } catch (e) {
      console.error('Failed to restore role from localStorage', e);
    }
    return null;
  });

  // Selected role for the dedicated full-page Login screen transition
  const [authRole, setAuthRole] = useState(null);

  // 2. Active Employee ID (when in Employee or Event Member workspace)
  // Default to first employee (Rahul Sharma: 'usr_001' or Marcus Vance: 'usr_event_001')
  const [activeEmployeeId, setActiveEmployeeId] = useState('usr_001');

  React.useEffect(() => {
    if (currentRole === 'event_member') {
      setActiveEmployeeId('usr_event_001');
    } else if (currentRole === 'employee' && activeEmployeeId.startsWith('usr_event')) {
      setActiveEmployeeId('usr_001');
    }
  }, [currentRole]);

  // 3. Navigation View State
  const [currentView, setCurrentView] = useState(() => {
    try {
      const savedUser = localStorage.getItem('syncora_user') || localStorage.getItem('syncora_auth');
      return savedUser ? 'home' : 'landing';
    } catch (e) {
      return 'landing';
    }
  });

  // 4. SHARED UNDERLYING TASK RECORDS (Manager & Employee workspace single source of truth)
  const [tasks, setTasks] = useState(initialTasks);

  // 5. CRITICAL DATA SEPARATION: Dedicated Student Workspace Data (Completely isolated)
  // Student tasks and suggestions never enter manager or employee state
  const [studentTasks, setStudentTasks] = useState(studentInitialTasks);
  const [studentSuggestions, setStudentSuggestions] = useState(studentAiSuggestions);

  // 6. Active Meetings State
  const [meetings, setMeetings] = useState(mockMeetings);
  const [selectedMeetingId, setSelectedMeetingId] = useState(mockMeetings[0]?._id || 'meet_001');

  // 7. Search query
  const [searchQuery, setSearchQuery] = useState('');

  // 8. Add Task Modal State (Manager action)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // 9. Evidence Drawer State
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState(false);
  const [activeEvidenceSegments, setActiveEvidenceSegments] = useState([]);

  // Active meeting lookup
  const selectedMeeting =
    meetings.find((m) => m._id === selectedMeetingId) || meetings[0];

  // Handler to open evidence drawer
  const handleOpenEvidence = (segmentIds = []) => {
    setActiveEvidenceSegments(segmentIds);
    setIsEvidenceDrawerOpen(true);
  };

  // Handler to close evidence drawer
  const handleCloseEvidence = () => {
    setIsEvidenceDrawerOpen(false);
  };

  // Handler when selecting a role / logging in from initial screen
  const handleSelectRole = (role, session = null) => {
    setCurrentRole(role);
    if (session?.user) {
      setCurrentUser(session.user);
    }
    setCurrentView('home');
  };

  // Handler to logout (clears localStorage and returns to workspace selection)
  const handleLogout = () => {
    try {
      localStorage.removeItem('syncora_user');
      localStorage.removeItem('syncora_auth');
      localStorage.removeItem('syncora_token');
    } catch (e) {
      console.error('Failed to clear session from localStorage', e);
    }
    setCurrentRole(null);
    setCurrentUser(null);
    setAuthRole(null);
    setCurrentView('landing');
  };

  // Handler to select and view a meeting
  const handleSelectMeeting = (meetingId) => {
    setSelectedMeetingId(meetingId);
    setCurrentView('meeting-details');
  };

  // Manager: Add Task handler
  const handleAddTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    setCurrentView('manager-pending');
  };

  // Update tasks shared by both Manager and Employee
  const handleUpdateTasks = (updatedTasks) => {
    setTasks(updatedTasks);
  };

  // Compute counts for sidebar badges
  const sidebarCounts = {
    // Manager counts
    needsApproval: tasks.filter((t) => t.approvalStatus === 'pending').length,
    managerPending: tasks.filter(
      (t) => t.approvalStatus === 'approved' && t.workStatus !== 'completed'
    ).length,
    // Employee counts
    employeePending: tasks.filter(
      (t) =>
        t.approvalStatus === 'approved' &&
        t.assigneeId === activeEmployeeId &&
        (t.workStatus === 'not_started' || !t.workStatus)
    ).length,
    employeeInProgress: tasks.filter(
      (t) =>
        t.approvalStatus === 'approved' &&
        t.assigneeId === activeEmployeeId &&
        t.workStatus === 'in_progress'
    ).length,
    employeeBlocked: tasks.filter(
      (t) =>
        t.approvalStatus === 'approved' &&
        t.assigneeId === activeEmployeeId &&
        t.workStatus === 'blocked'
    ).length,
    // Student counts
    studentPending: studentTasks.filter((t) => t.status !== 'completed').length,
    studentCompleted: studentTasks.filter((t) => t.status === 'completed').length,
  };

  // Flow Transition: Landing Page -> Workspaces (Role Selection) -> Dedicated Full-Page Login -> Dashboard
  if (!currentRole) {
    if (currentView === 'landing') {
      return (
        <LandingPage
          onContinue={() => setCurrentView('workspaces')}
        />
      );
    }

    if (authRole) {
      return (
        <LoginPage
          roleId={authRole}
          onBack={() => setAuthRole(null)}
          onLoginSuccess={({ role, email }) => {
            setCurrentRole(role);
            setCurrentUser({ role, email });
            setAuthRole(null);
            setCurrentView(role === 'developer' ? 'project-architecture' : 'home');
          }}
        />
      );
    }

    return (
      <RoleSelection
        onSelectRole={(roleId) => setAuthRole(roleId)}
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <ArchitectureProvider>
      <DashboardLayout
        currentRole={currentRole}
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={setCurrentView}
        onSwitchRole={handleLogout}
        onLogout={handleLogout}
        selectedMeetingId={selectedMeetingId}
        onSelectMeeting={handleSelectMeeting}
        meetings={currentRole === 'student' ? studentMeetings : meetings}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q && currentView !== 'meetings') {
            setCurrentView('meetings');
          }
        }}
        onOpenAddTask={() => setIsAddTaskModalOpen(true)}
        counts={sidebarCounts}
      >
      {/* 1. Common Homepage View */}
      {currentView === 'home' && currentRole !== 'developer' && (
        <HomePage
          currentRole={currentRole}
          currentUser={currentUser}
          meetings={meetings}
          tasks={tasks}
          activeEmployeeId={activeEmployeeId}
          studentTasks={studentTasks}
          studentMeetings={studentMeetings}
          onSelectMeeting={handleSelectMeeting}
          onViewAllMeetings={() => setCurrentView('meetings')}
          onNavigateWorkflow={() => {
            if (currentRole === 'manager' || currentRole === 'event_manager') setCurrentView('manager-approvals');
            else if (currentRole === 'employee' || currentRole === 'event_member') setCurrentView('employee-pending');
            else setCurrentView('student-tasks');
          }}
          onNavigate={setCurrentView}
        />
      )}

      {/* 2. All Meetings Archive View */}
      {currentView === 'meetings' && (
        <AllMeetingsPage
          meetings={currentRole === 'student' ? studentMeetings : meetings}
          onSelectMeeting={handleSelectMeeting}
          onBackToHome={() => setCurrentView('home')}
          initialSearchQuery={searchQuery}
        />
      )}

      {/* 3. Shared Meeting Details Page View */}
      {currentView === 'meeting-details' && (
        <MeetingDetailsPage
          meeting={selectedMeeting}
          onBack={() => setCurrentView(currentRole === 'student' ? 'home' : 'meetings')}
          onOpenEvidence={handleOpenEvidence}
        />
      )}

      {/* 4. MANAGER WORKSPACE SUB-VIEWS */}
      {(currentRole === 'manager' || currentRole === 'event_manager') && currentView === 'manager-approvals' && (
        <ManagerWorkspaceView
          subView="approvals"
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
          onOpenAddTask={() => setIsAddTaskModalOpen(true)}
        />
      )}

      {(currentRole === 'manager' || currentRole === 'event_manager') && currentView === 'manager-pending' && (
        <ManagerWorkspaceView
          subView="pending"
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
          onOpenAddTask={() => setIsAddTaskModalOpen(true)}
        />
      )}

      {(currentRole === 'manager' || currentRole === 'event_manager') && currentView === 'manager-completed' && (
        <ManagerWorkspaceView
          subView="completed"
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
          onOpenAddTask={() => setIsAddTaskModalOpen(true)}
        />
      )}

      {/* 5. EMPLOYEE WORKSPACE SUB-VIEWS */}
      {(currentRole === 'employee' || currentRole === 'event_member') && currentView === 'employee-pending' && (
        <EmployeeWorkspaceView
          subView="pending"
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          activeEmployeeId={activeEmployeeId}
          onChangeActiveEmployee={setActiveEmployeeId}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
        />
      )}

      {(currentRole === 'employee' || currentRole === 'event_member') && currentView === 'employee-in-progress' && (
        <EmployeeWorkspaceView
          subView="in-progress"
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          activeEmployeeId={activeEmployeeId}
          onChangeActiveEmployee={setActiveEmployeeId}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
        />
      )}

      {(currentRole === 'employee' || currentRole === 'event_member') && currentView === 'employee-completed' && (
        <EmployeeWorkspaceView
          subView="completed"
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          activeEmployeeId={activeEmployeeId}
          onChangeActiveEmployee={setActiveEmployeeId}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
        />
      )}

      {(currentRole === 'employee' || currentRole === 'event_member') && currentView === 'employee-blocked' && (
        <EmployeeWorkspaceView
          subView="blocked"
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          activeEmployeeId={activeEmployeeId}
          onChangeActiveEmployee={setActiveEmployeeId}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
        />
      )}

      {/* 6. SHARED DEPENDENCY GRAPH VIEW (Manager & Employee only) */}
      {(currentRole === 'manager' || currentRole === 'employee' || currentRole === 'event_manager' || currentRole === 'event_member') && currentView === 'dependency-graph' && (
        <TaskDependencyGraph
          currentRole={currentRole}
          activeEmployeeId={activeEmployeeId}
          tasks={tasks}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
        />
      )}

      {/* 7. STUDENT WORKSPACE SUB-VIEWS (Isolated personal tasks) */}
      {currentRole === 'student' && currentView === 'student-tasks' && (
        <StudentWorkspaceView
          subView="tasks"
          tasks={studentTasks}
          onUpdateTasks={setStudentTasks}
          suggestions={studentSuggestions}
          onUpdateSuggestions={setStudentSuggestions}
          meetings={studentMeetings}
          onOpenEvidence={handleOpenEvidence}
          onSelectMeeting={handleSelectMeeting}
        />
      )}

      {currentRole === 'student' && currentView === 'student-completed' && (
        <StudentWorkspaceView
          subView="completed"
          tasks={studentTasks}
          onUpdateTasks={setStudentTasks}
          suggestions={studentSuggestions}
          onUpdateSuggestions={setStudentSuggestions}
          meetings={studentMeetings}
          onOpenEvidence={handleOpenEvidence}
          onSelectMeeting={handleSelectMeeting}
        />
      )}

      {/* 8. DEDICATED DEVELOPER WORKSPACE (Architecture Graph, Code Task Board, Blocker Radar) */}
      {currentRole === 'developer' && (currentView.startsWith('dev-') || currentView === 'developer-dashboard') && (
        <DeveloperDashboard
          subView={currentView}
          onOpenEvidence={handleOpenEvidence}
          onSelectMeeting={handleSelectMeeting}
        />
      )}

      {/* 9. TEAM DISCUSSIONS & CLARIFICATIONS (Shared across all roles) */}
      {currentView === 'discussions' && (
        <DiscussionBoard
          currentRole={currentRole}
          currentUser={currentUser}
        />
      )}

      {/* 10. PROJECT TIMELINE (Visual Roadmap & Milestones) */}
      {currentView === 'timeline' && (
        <ProjectTimeline
          currentRole={currentRole}
          currentUser={currentUser}
          onOpenEvidence={handleOpenEvidence}
          onSelectMeeting={handleSelectMeeting}
        />
      )}

      {/* 11. PROJECT ARCHITECTURE (Developer Primary View) */}
      {currentRole === 'developer' && (currentView === 'project-architecture' || currentView === 'home') && (
        <ProjectArchitectureView onNavigate={setCurrentView} />
      )}

      {/* Manager Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
        existingTasks={tasks}
        employees={mockEmployees}
        meetings={meetings}
      />


      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={handleCloseEvidence}
        transcripts={selectedMeeting?.transcriptSegments}
        highlightSegmentIds={activeEvidenceSegments}
      />
    </DashboardLayout>
  </ArchitectureProvider>
);
}
