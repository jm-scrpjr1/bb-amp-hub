'use client';

export default function TutorialButton() {
  const handleClick = () => {
    const event = new CustomEvent('showAmplificationOnboarding');
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-cyan-400 text-blue-900 px-8 py-4 rounded-xl font-semibold hover:bg-cyan-300 transition-colors duration-200 shadow-lg text-lg"
    >
      Quick Tutorial Tour ↗
    </button>
  );
}
