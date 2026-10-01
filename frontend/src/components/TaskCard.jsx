const statusColors = {
  todo: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-amber-100 text-amber-800',
  done: 'bg-green-100 text-green-800',
};

const formatDate = (value) => {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

export default function TaskCard({ task, user, onStatusChange, onDelete, onEdit, loadingTaskId }) {
  const isOwnTask = user?.role === 'member' && task.assigneeId === user?.id;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const isBusy = loadingTaskId === task.id;
  const actionLabel = task.status === 'todo' ? 'Start Task' : task.status === 'in-progress' ? 'Close Ticket' : 'Completed ✓';

  const handleMemberAction = (nextStatus) => {
    if (isBusy || !onStatusChange) return;
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${isOverdue ? 'ring-1 ring-red-200' : ''}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 leading-5">{task.title}</h3>
            {task.Project?.name && (
              <p className="mt-1 text-xs font-medium text-gray-500">Project: {task.Project.name}</p>
            )}
          </div>

          {user?.role === 'admin' && onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs text-red-600 hover:text-red-800 font-semibold"
            >
              Delete
            </button>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 leading-6">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {task.assignee?.name && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
              👤 {task.assignee.name}
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
            📅 {formatDate(task.dueDate)}
          </span>
          {isOverdue && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700">
              Overdue
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusColors[task.status] || 'bg-gray-100 text-gray-700'}`}>
            {task.status === 'in-progress' ? 'in-progress' : task.status}
          </span>

          {user?.role === 'member' && isOwnTask && task.status !== 'done' ? (
            <button
              onClick={() => handleMemberAction(task.status === 'todo' ? 'in-progress' : 'done')}
              disabled={isBusy}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition ${task.status === 'todo' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-500 hover:bg-rose-600'} disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {isBusy ? 'Updating...' : task.status === 'todo' ? 'Start Task' : 'Close Ticket'}
            </button>
          ) : user?.role === 'member' && isOwnTask && task.status === 'done' ? (
            <span className="inline-flex items-center rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
              Completed ✓
            </span>
          ) : null}

          {user?.role === 'admin' && onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
