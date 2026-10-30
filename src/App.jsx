import React, { useState } from 'react';
import RoleSelection from './components/RoleSelection';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import AllMeetingsPage from './pages/AllMeetingsPage';
import MeetingDetailsPage from './pages/MeetingDetailsPage';
import ManagerWorkspaceView from './pages/ManagerWorkspaceView';
import EmployeeWorkspaceView from './pages/EmployeeWorkspaceView';
import StudentWorkspaceView from './pages/StudentWorkspaceView';
import TaskDependencyGraph from './components/TaskDependencyGraph';
import AddTaskModal from './components/AddTaskModal';
import EvidenceDrawer from './components/EvidenceDrawer';
import {
  mockMeetings,
  mockEmployees,
  initialTasks,
  studentInitialTasks,
  studentAiSuggestions,
  studentMeetings,
} from './api/mockData';

export default function App() {
  // 1. Role Selection State: null displays the initial Role Selection screen
  // User can choose 'manager' | 'employee' | 'student'
  const [currentRole, setCurrentRole] = useState(null);

  // 2. Active Employee ID (when in Employee workspace)
  // Default to first employee (Rahul Sharma: 'usr_001')
  const [activeEmployeeId, setActiveEmployeeId] = useState('usr_001');

  // 3. Navigation View State
  const [currentView, setCurrentView] = useState('home');

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

  // Handler when selecting a role from initial screen
  const handleSelectRole = (role) => {
    setCurrentRole(role);
    setCurrentView('home');
  };

  // Handler to return to Role Selection screen
  const handleSwitchRole = () => {
    setCurrentRole(null);
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

  // Render Role Selection screen if no role is active
  if (!currentRole) {
    return <RoleSelection onSelectRole={handleSelectRole} />;
  }

  return (
    <DashboardLayout
      currentRole={currentRole}
      currentView={currentView}
      onNavigate={setCurrentView}
      onSwitchRole={handleSwitchRole}
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
      {currentView === 'home' && (
        <HomePage
          currentRole={currentRole}
          meetings={meetings}
          tasks={tasks}
          activeEmployeeId={activeEmployeeId}
          studentTasks={studentTasks}
          studentMeetings={studentMeetings}
          onSelectMeeting={handleSelectMeeting}
          onViewAllMeetings={() => setCurrentView('meetings')}
          onNavigateWorkflow={() => {
            if (currentRole === 'manager') setCurrentView('manager-approvals');
            else if (currentRole === 'employee') setCurrentView('employee-pending');
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
      {currentRole === 'manager' && currentView === 'manager-approvals' && (
        <ManagerWorkspaceView
          subView="approvals"
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
          onOpenAddTask={() => setIsAddTaskModalOpen(true)}
        />
      )}

      {currentRole === 'manager' && currentView === 'manager-pending' && (
        <ManagerWorkspaceView
          subView="pending"
          tasks={tasks}
          onUpdateTasks={handleUpdateTasks}
          employees={mockEmployees}
          onOpenEvidence={handleOpenEvidence}
          onOpenAddTask={() => setIsAddTaskModalOpen(true)}
        />
      )}

      {currentRole === 'manager' && currentView === 'manager-completed' && (
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
      {currentRole === 'employee' && currentView === 'employee-pending' && (
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

      {currentRole === 'employee' && currentView === 'employee-in-progress' && (
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

      {currentRole === 'employee' && currentView === 'employee-completed' && (
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

      {currentRole === 'employee' && currentView === 'employee-blocked' && (
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
      {(currentRole === 'manager' || currentRole === 'employee') && currentView === 'dependency-graph' && (
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

      {/* Manager Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
        existingTasks={tasks}
        employees={mockEmployees}
        meetings={meetings}
      />

      {/* Slide-over Verified Evidence Drawer */}
      <EvidenceDrawer
        isOpen={isEvidenceDrawerOpen}
        onClose={handleCloseEvidence}
        transcripts={selectedMeeting?.transcriptSegments}
        highlightSegmentIds={activeEvidenceSegments}
      />
    </DashboardLayout>
  );
}
