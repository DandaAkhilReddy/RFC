interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 48, className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

        <path
          d="M30 25 L30 75 L42 75 L42 55 L50 55 L62 75 L76 75 L62 52 C68 50 72 44 72 36 C72 26 64 25 56 25 L30 25 Z M42 35 L54 35 C58 35 60 37 60 40 C60 43 58 45 54 45 L42 45 L42 35 Z"
          fill="white"
          strokeWidth="2"
          stroke="white"
          strokeLinejoin="round"
        />

        <circle cx="24" cy="50" r="8" fill="#ef4444" />
        <rect x="20" y="46" width="8" height="8" fill="#ef4444" />

        <circle cx="76" cy="50" r="8" fill="#ef4444" />
        <rect x="72" y="46" width="8" height="8" fill="#ef4444" />

        <path
          d="M35 82 Q40 78 45 82"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M55 82 Q60 78 65 82"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-2xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent">
            ReddyFit
          </span>
          <span className="text-sm font-bold text-gray-700">
            Club
          </span>
        </div>
      )}
    </div>
  );
}
