import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project, isAdmin, onDelete }) {
  const navigate = useNavigate();
  const taskCount = project.taskCount || 0;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer">
      <div
        onClick={() => navigate(`/projects/${project.id}`)}
        className="p-6 border-t-4 border-indigo-500"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this project?')) {
                  onDelete(project.id);
                }
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          )}
        </div>

        {project.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
        )}

        <div className="flex justify-between items-end">
          <p className="text-gray-500 text-xs">👤 {project.owner?.name}</p>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded">
            {taskCount} tasks
          </span>
        </div>
      </div>
    </div>
  );
}
