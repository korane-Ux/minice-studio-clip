// Fond décoratif de la page de connexion : vagues aux couleurs de Minice.
export function LoginWaves() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 900 1000" preserveAspectRatio="xMidYMid slice">
      <path d="M0 0H640C575 120 715 205 650 335C585 465 725 525 665 655C605 785 730 865 690 1000H0Z" fill="#6f65e8" />
      <path d="M0 0H480C430 140 550 240 490 380C430 520 570 600 510 760C470 880 530 940 510 1000H0Z" fill="#8880f0" opacity="0.55" />
      <path d="M0 760C150 700 290 840 450 785C560 748 615 860 650 1000H0Z" fill="#4a41c9" />
      <path d="M0 860C120 830 230 910 360 880C450 860 500 930 520 1000H0Z" fill="#0c182c" opacity="0.55" />
      <g fill="none" stroke="#ffffff" strokeLinecap="round">
        <path d="M585 40C515 150 655 235 595 365" strokeWidth="22" />
        <path d="M650 760C600 840 700 895 660 990" strokeWidth="16" opacity="0.9" />
        <path d="M120 120C190 90 230 160 300 130" strokeWidth="10" opacity="0.55" />
        <path d="M70 640C150 600 205 690 290 650" strokeWidth="10" opacity="0.45" />
      </g>
      <g fill="#ffffff">
        <circle cx="690" cy="430" r="12" />
        <circle cx="720" cy="470" r="6" opacity="0.8" />
        <circle cx="600" cy="700" r="9" opacity="0.85" />
      </g>
    </svg>
  );
}
