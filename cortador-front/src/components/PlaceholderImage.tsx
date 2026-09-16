type PlaceholderImageProps = {
  url: string;
  alt: string;
  className?: string;
};

// Muestra la foto si hay una URL configurada; si no, deja un hueco
// reservado con un icono, para que se note claramente dónde falta
// subir una imagen real (foto del cortador, de un evento, etc.).
export default function PlaceholderImage({ url, alt, className = "" }: PlaceholderImageProps) {
  if (url) {
    return <img src={url} alt={alt} className={`object-cover ${className}`} />;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-surface-alt text-ink-muted ${className}`}
      role="img"
      aria-label={alt}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
        className="h-8 w-8 opacity-60"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="M21 16l-4.5-4.5a1.5 1.5 0 0 0-2.1 0L8 18" />
      </svg>
      <span className="px-4 text-center text-xs">{alt}</span>
    </div>
  );
}
