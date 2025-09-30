'use client';

interface StartAssessmentButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function StartAssessmentButton({ 
  onClick, 
  variant = 'primary',
  children 
}: StartAssessmentButtonProps) {
  const baseClasses = "relative inline-flex items-center px-10 py-5 text-xl font-bold rounded-2xl overflow-hidden group shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 text-white",
    secondary: "bg-white text-blue-600"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {variant === 'primary' && (
        <>
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Particle Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-6 right-8 w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-3 left-12 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-6 right-4 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
          </div>
        </>
      )}
      
      {variant === 'secondary' && (
        <>
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>
        </>
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center">
        {children}
      </span>
    </button>
  );
}
