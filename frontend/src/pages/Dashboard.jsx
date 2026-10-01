import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { notifyTaskChange, subscribeToTaskChange } from '../api';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';

const formatDate = (value) => {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTaskId, setActiveTaskId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const unsubscribe = subscribeToTaskChange(() => {
      fetchDashboardData(false);
    });

    return unsubscribe;
    // the listener keeps admin/member views fresh in open tabs
  }, [user.id, user.role]);

  const fetchDashboardData = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }

      const tasksResponse = await api.get('/tasks');
      const visibleTasks = user.role === 'member'
        ? tasksResponse.data.filter((task) => task.assigneeId === user.id)
        : tasksResponse.data;

      setTasks(visibleTasks);

      if (user.role === 'admin') {
        const projectsResponse = await api.get('/projects');
        setProjectsCount(projectsResponse.data.length);
      }

      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    setActiveTaskId(taskId);

    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((currentTasks) => currentTasks.map((task) => (task.id === taskId ? { ...task, ...response.data } : task)));
      notifyTaskChange();
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task');
    } finally {
      setActiveTaskId(null);
    }
  };

  const groupedTasks = {
    todo: tasks.filter((task) => task.status === 'todo'),
    'in-progress': tasks.filter((task) => task.status === 'in-progress'),
    done: tasks.filter((task) => task.status === 'done'),
  };

  const overdueTasks = tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (user.role === 'member') {
    const sectionMeta = [
      { key: 'todo', title: 'Todo', color: 'bg-blue-50 border-blue-200 text-blue-700' },
      { key: 'in-progress', title: 'In Progress', color: 'bg-amber-50 border-amber-200 text-amber-700' },
      { key: 'done', title: 'Done', color: 'bg-green-50 border-green-200 text-green-700' },
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Your Tasks</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user.name}. Here’s everything assigned to you.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {tasks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">No tasks assigned to you yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sectionMeta.map((section) => {
                const items = groupedTasks[section.key];

                return (
                  <section key={section.key} className={`rounded-2xl border p-5 ${section.color} transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                      <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm">
                        {items.length}
                      </span>
                    </div>

                    {items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map((task) => (
                          <div key={task.id} className="transition-all duration-300">
                            <TaskCard
                              task={task}
                              user={user}
                              onStatusChange={handleTaskStatusChange}
                              loadingTaskId={activeTaskId}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-300 bg-white/70 p-8 text-center text-gray-500">
                        No {section.title.toLowerCase()} tasks yet
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon="📋" label="Total Tasks" value={tasks.length} color="blue" />
          <StatCard icon="⭕" label="To Do" value={groupedTasks.todo.length} color="blue" />
          <StatCard icon="⚙️" label="In Progress" value={groupedTasks['in-progress'].length} color="yellow" />
          <StatCard icon="✅" label="Done" value={groupedTasks.done.length} color="green" />
          <StatCard icon="📁" label="Projects" value={projectsCount} color="blue" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/projects"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 hover:shadow-lg transition"
          >
            <p className="text-2xl">📁</p>
            <p className="font-bold text-xl">Manage Projects</p>
            <p className="text-sm text-blue-100">Create and monitor project progress</p>
          </Link>
          <Link
            to="/members"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 hover:shadow-lg transition"
          >
            <p className="text-2xl">👥</p>
            <p className="font-bold text-xl">Manage Members</p>
            <p className="text-sm text-green-100">View and manage team members</p>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Overdue Tasks</h2>
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
              {overdueTasks.length}
            </span>
          </div>

          {overdueTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {overdueTasks.map((task) => (
                <TaskCard key={task.id} task={task} user={user} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-500">
              No overdue tasks. Nice work.
            </div>
          )}
        </div>

        {tasks.length === 0 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">📭 No tasks yet. Create a project to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
