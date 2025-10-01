/**
 * ReddyFit Logo Component
 * Features: Love (heart) + Fitness (dumbbell) + RFC branding
 * @module components/Logo
 */

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
        {/* Main Circle Background */}
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

        {/* RFC Letter - Stylized */}
        <text
          x="50"
          y="58"
          fontSize="32"
          fontWeight="900"
          fill="white"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          RFC
        </text>

        {/* Heart Symbol (Love) - Top Right */}
        <path
          d="M 72 22 C 68 18 62 18 60 22 C 58 18 52 18 48 22 C 44 26 44 32 48 36 L 60 48 L 72 36 C 76 32 76 26 72 22 Z"
          fill="#ec4899"
          opacity="0.9"
        />

        {/* Dumbbell (Fitness) - Top Left */}
        <g opacity="0.9">
          <circle cx="28" cy="28" r="5" fill="#10b981" />
          <rect x="28" y="26" width="14" height="4" fill="#10b981" />
          <circle cx="42" cy="28" r="5" fill="#10b981" />
        </g>

        {/* Decorative Elements */}
        <circle cx="20" cy="75" r="3" fill="white" opacity="0.3" />
        <circle cx="80" cy="75" r="3" fill="white" opacity="0.3" />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-2xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent">
            ReddyFit
          </span>
          <span className="text-xs font-bold text-gray-600 tracking-wider">
            CLUB RFC
          </span>
        </div>
      )}
    </div>
  );
}
