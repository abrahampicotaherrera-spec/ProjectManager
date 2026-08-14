export default function Logo({
  variant = "completo",
  className,
}: {
  variant?: "icono" | "completo";
  className?: string;
}) {
  if (variant === "icono") {
    return (
      <svg
        viewBox="0 0 128 128"
        className={className ?? "h-9 w-9"}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ALPH"
      >
        <defs>
          <linearGradient
            id="alphGradiente"
            x1="0"
            y1="0"
            x2="128"
            y2="128"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#2C82C9" />
            <stop offset="1" stopColor="#18538A" />
          </linearGradient>
        </defs>
        <rect width="128" height="128" rx="28" fill="url(#alphGradiente)" />
        <text
          x="54"
          y="90"
          textAnchor="middle"
          fontFamily="Calibri, Arial, sans-serif"
          fontWeight={700}
          fontSize="68"
          fill="#FFFFFF"
        >
          A
        </text>
        <circle cx="99" cy="99" r="21" fill="#1E68AA" stroke="#FFFFFF" strokeWidth="4" />
        <path
          d="M89 99 L96 106 L110 90"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 360 100"
      className={className ?? "h-12"}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ALPH — Gestor de Proyectos"
    >
      <defs>
        <linearGradient
          id="alphGradienteCompleto"
          x1="0"
          y1="0"
          x2="100"
          y2="100"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#2C82C9" />
          <stop offset="1" stopColor="#18538A" />
        </linearGradient>
      </defs>

      <rect x="6" y="6" width="88" height="88" rx="20" fill="url(#alphGradienteCompleto)" />
      <text
        x="40"
        y="68"
        textAnchor="middle"
        fontFamily="Calibri, Arial, sans-serif"
        fontWeight={700}
        fontSize="46"
        fill="#FFFFFF"
      >
        A
      </text>
      <circle cx="72" cy="72" r="15" fill="#1E68AA" stroke="#FFFFFF" strokeWidth="3" />
      <path
        d="M65 72 L70 77 L80 65"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <text
        x="114"
        y="63"
        fontFamily="Calibri, Arial, sans-serif"
        fontWeight={700}
        fontSize="46"
        letterSpacing="2"
        fill="#111A2E"
      >
        ALPH
      </text>
      <text
        x="115"
        y="84"
        fontFamily="Calibri, Arial, sans-serif"
        fontWeight={400}
        fontSize="15"
        letterSpacing="1"
        fill="#2C82C9"
      >
        GESTOR DE PROYECTOS
      </text>
    </svg>
  );
}
