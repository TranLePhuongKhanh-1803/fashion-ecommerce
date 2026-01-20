/**
 * Loader Component
 */
const Loader = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex justify-center items-center p-8">
      <div className={`spinner ${sizeClasses[size] || sizeClasses.md}`}></div>
    </div>
  );
};

export default Loader;
