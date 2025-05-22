export default function JobDetail() {
  return (
    <div className="min-h-screen bg-white p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">Frontend / UI-UX Developer</h1>
      <p className="text-gray-700 mb-4">
        We're looking for a creative and passionate frontend/UI-UX dev to join SkillSwap. You'll design user-centric interfaces, work with React and Tailwind, and help shape the future of learning experiences.
      </p>

      <ul className="list-disc list-inside text-gray-700 mb-6">
        <li>Build responsive web interfaces using React</li>
        <li>Collaborate with backend and product team</li>
        <li>Design intuitive UI/UX with Tailwind or Figma</li>
        <li>5 days a week, remote-friendly</li>
        <li>Certificate and recommendation letter on successful completion</li>
      </ul>

      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSdm9Tbo8WwXdJuCQXcmJQc4bS0x-20RU-ZdqfSDQ0x9i7NPhA/viewform"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Apply Now
      </a>
    </div>
  );
}
