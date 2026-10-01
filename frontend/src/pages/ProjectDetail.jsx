import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { notifyTaskChange, subscribeToTaskChange } from '../api';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';

export default function ProjectDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assigneeId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);

  useEffect(() => {
    fetchProjectData();
    const unsubscribe = subscribeToTaskChange(() => {
      fetchProjectData(false);
    });

    return unsubscribe;
  }, [id, user.id, user.role]);

  const fetchProjectData = async (showSpinner = true) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }

      const projectRes = await api.get(`/projects/${id}`);
      const tasksRes = await api.get('/tasks');

      setProject(projectRes.data);

      const projectTasks = tasksRes.data.filter((task) => task.projectId === id);
      setTasks(user.role === 'member' ? projectTasks.filter((task) => task.assigneeId === user.id) : projectTasks);

      if (user.role === 'admin') {
        const usersRes = await api.get('/users');
        setMembers(usersRes.data);
      } else {
        setMembers([]);
      }

      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load project');
      console.error(err);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/tasks', {
        ...formData,
        projectId: id,
      });
      setFormData({ title: '', description: '', dueDate: '', assigneeId: '' });
      setShowTaskModal(false);
      setError('');
      notifyTaskChange();
      fetchProjectData(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    setActiveTaskId(taskId);

    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((currentTasks) => currentTasks.map((task) => (task.id === taskId ? { ...task, ...response.data } : task)));
      notifyTaskChange();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task');
    } finally {
      setActiveTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm('Delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        notifyTaskChange();
        fetchProjectData(false);
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Project not found</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const KanbanColumn = ({ title, items, statusColor, emptyText }) => (
    <div className="bg-gray-100 rounded-2xl p-4 flex-1 min-h-96">
      <h3 className={`font-bold text-lg mb-4 ${statusColor}`}>
        {title} ({items.length})
      </h3>
      <div className="space-y-3">
        {items.map((task) => (
          <div key={task.id} className="transition-all duration-300">
            <TaskCard
              task={task}
              user={user}
              onStatusChange={handleTaskStatusChange}
              onDelete={user.role === 'admin' ? handleDeleteTask : undefined}
              loadingTaskId={activeTaskId}
            />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">{emptyText}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/projects')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Projects
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
          <p className="text-gray-500 text-sm mt-2">Owner: {project.owner?.name}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {user.role === 'admin' && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mb-6"
          >
            + Create Task
          </button>
        )}

        {user.role === 'admin' && (
          <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create New Task">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Design homepage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Task details..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To
                </label>
                <select
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a member...</option>
                  {members.filter((m) => m.role === 'member').map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded-lg transition"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn title="📋 Todo" items={todoTasks} statusColor="text-blue-600" emptyText={user.role === 'member' ? 'No todo tasks assigned to you' : 'No todo tasks'} />
          <KanbanColumn title="⚙️ In Progress" items={inProgressTasks} statusColor="text-amber-600" emptyText={user.role === 'member' ? 'No in-progress tasks assigned to you' : 'No tasks in progress'} />
          <KanbanColumn title="✅ Done" items={doneTasks} statusColor="text-green-600" emptyText={user.role === 'member' ? 'No completed tasks yet' : 'No completed tasks'} />
        </div>
      </div>
    </div>
  );
}
