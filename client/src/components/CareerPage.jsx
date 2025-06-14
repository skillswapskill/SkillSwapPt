import { useNavigate } from "react-router-dom";

export default function CareerPortal() {
  const navigate = useNavigate();

  const jobs = [
    {
      id: "frontend-dev",
      title: "Frontend / UI-UX Developer",
      description: "Design and build modern UIs for SkillSwap.",
    },
    // Add more roles later
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 ">🚀 Career Portal</h1>
      <div className="grid gap-6 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg cursor-pointer transition"
            onClick={() => navigate(`/careers/${job.id}`)}
          >
            <h2 className="text-xl font-semibold text-indigo-600">{job.title}</h2>
            <p className="text-gray-600 mt-2">{job.description}</p>
            <p className="mt-4 text-sm text-blue-500 font-medium">View Details →</p>
          </div>
        ))}
      </div>
    </div>
  );
}
