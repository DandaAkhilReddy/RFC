/**
 * ReddyFit Logo Component
 * Professional design featuring: Love (heart) + Fitness (dumbbell) + RFC branding
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
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        {/* Outer Ring - Professional Border */}
        <circle
          cx="60"
          cy="60"
          r="58"
          fill="url(#outerGradient)"
          opacity="0.15"
        />

        {/* Main Circle Background */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="url(#logoGradient)"
        />

        {/* Inner Glow */}
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="url(#innerGlow)"
          opacity="0.3"
        />

        {/* RFC Letters - Bold & Professional */}
        <text
          x="60"
          y="72"
          fontSize="36"
          fontWeight="900"
          fill="white"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          letterSpacing="1"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          RFC
        </text>

        {/* Heart Symbol (Love) - Top Right - More Professional */}
        <g transform="translate(80, 20)">
          {/* Heart Shadow */}
          <path
            d="M 0 8 C -3 4 -8 4 -10 8 C -12 4 -17 4 -20 8 C -23 11 -23 16 -20 20 L -10 30 L 0 20 C 3 16 3 11 0 8 Z"
            fill="rgba(0,0,0,0.2)"
            transform="translate(1, 1)"
          />
          {/* Heart Main */}
          <path
            d="M 0 8 C -3 4 -8 4 -10 8 C -12 4 -17 4 -20 8 C -23 11 -23 16 -20 20 L -10 30 L 0 20 C 3 16 3 11 0 8 Z"
            fill="url(#heartGradient)"
          />
          {/* Heart Shine */}
          <ellipse
            cx="-14"
            cy="12"
            rx="3"
            ry="4"
            fill="white"
            opacity="0.4"
          />
        </g>

        {/* Dumbbell (Fitness) - Top Left - Professional */}
        <g transform="translate(25, 25)">
          {/* Dumbbell Shadow */}
          <g transform="translate(1, 1)" opacity="0.2">
            <circle cx="0" cy="0" r="6" fill="black" />
            <rect x="0" y="-2" width="20" height="4" rx="2" fill="black" />
            <circle cx="20" cy="0" r="6" fill="black" />
          </g>
          {/* Dumbbell Main */}
          <circle cx="0" cy="0" r="6" fill="url(#dumbbellGradient)" />
          <rect x="0" y="-2" width="20" height="4" rx="2" fill="url(#dumbbellBarGradient)" />
          <circle cx="20" cy="0" r="6" fill="url(#dumbbellGradient)" />
          {/* Dumbbell Shine */}
          <circle cx="2" cy="-2" r="2.5" fill="white" opacity="0.5" />
          <circle cx="18" cy="-2" r="2.5" fill="white" opacity="0.5" />
        </g>

        {/* Decorative Stars - Professional Touch */}
        <g opacity="0.6">
          <circle cx="30" cy="90" r="2.5" fill="white" />
          <circle cx="90" cy="90" r="2.5" fill="white" />
          <circle cx="20" cy="60" r="1.5" fill="white" opacity="0.5" />
          <circle cx="100" cy="60" r="1.5" fill="white" opacity="0.5" />
        </g>

        {/* Bottom Accent Line */}
        <path
          d="M 30 85 Q 60 80 90 85"
          stroke="white"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
          strokeLinecap="round"
        />

        {/* Gradient Definitions */}
        <defs>
          {/* Main Logo Gradient - Orange to Red to Pink */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="40%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          {/* Outer Ring Gradient */}
          <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>

          {/* Inner Glow - Radial */}
          <radialGradient id="innerGlow" cx="50%" cy="30%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Heart Gradient - Pink Shades */}
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>

          {/* Dumbbell Gradient - Green Shades */}
          <linearGradient id="dumbbellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Dumbbell Bar Gradient */}
          <linearGradient id="dumbbellBarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-3xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
            ReddyFit
          </span>
          <span className="text-[10px] font-semibold text-gray-500 tracking-wide">
            RFC
          </span>
        </div>
      )}
    </div>
  );
}
