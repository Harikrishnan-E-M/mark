import { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import EventsPage from './pages/EventsPage';
import StudentActivitiesPage from './pages/StudentActivitiesPage';
import StudentEventsPage from './pages/StudentEventsPage';
import ReportsPage from './pages/ReportsPage';
import './index.css';

const tabs = [
  'Dashboard',
  'Students',
  'Activities',
  'Events',
  'Student Activity Marks',
  'Student Event Entries',
  'Reports',
];

function TabPanel({ activeTab }) {
  if (activeTab === 'Dashboard') return <DashboardPage />;
  if (activeTab === 'Students') return <StudentsPage />;
  if (activeTab === 'Activities') return <ActivitiesPage />;
  if (activeTab === 'Events') return <EventsPage />;
  if (activeTab === 'Student Activity Marks') return <StudentActivitiesPage />;
  if (activeTab === 'Student Event Entries') return <StudentEventsPage />;
  return <ReportsPage />;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="app-shell">
      <header>
        <h1>Student Mark and Event Manager</h1>
        <p>No login required. Manage students, activities, events, and mappings.</p>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? 'tab active-tab' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main>
        <TabPanel activeTab={activeTab} />
      </main>
    </div>
  );
}
