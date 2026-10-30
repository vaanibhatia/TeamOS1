import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({
  currentRole = 'manager',
  currentView = 'home',
  onNavigate = () => {},
  onSwitchRole = () => {},
  selectedMeetingId = 'meet_001',
  onSelectMeeting = () => {},
  meetings = [],
  searchQuery = '',
  onSearchChange = () => {},
  onOpenAddTask = () => {},
  counts = {},
  children,
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const activeMeeting = meetings.find((m) => m._id === selectedMeetingId) || meetings[0];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 flex flex-col font-sans transition-colors duration-200">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentRole={currentRole}
          currentView={currentView}
          onNavigate={onNavigate}
          onSwitchRole={onSwitchRole}
          meetingTitle={activeMeeting?.title}
          hasActiveMeeting={Boolean(activeMeeting)}
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenAddTask={onOpenAddTask}
          counts={counts}
        />

        {/* Right Side: Top Bar + Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <TopBar
            currentRole={currentRole}
            currentView={currentView}
            onSwitchRole={onSwitchRole}
            onSelectMeeting={onSelectMeeting}
            selectedMeetingId={selectedMeetingId}
            meetings={meetings}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />

          {/* Main Content Area */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Global Footer */}
          <footer className="border-t border-surface-200 dark:border-surface-800 py-4 px-4 sm:px-6 lg:px-8 mt-auto bg-white/50 dark:bg-surface-900/50">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-surface-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-surface-700 dark:text-surface-300">TeamOS Platform</span>
                <span>•</span>
                <span>Technical Contract v1.0 Compliant</span>
              </div>
              <div>AI-Powered Meeting Management & Intelligence</div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

