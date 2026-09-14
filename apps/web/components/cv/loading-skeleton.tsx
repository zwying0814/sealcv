import Image from "next/image";

export function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo.webp"
          alt="SealCV"
          width={56}
          height={56}
          priority
        />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          SealCV
        </span>
        <div className="mt-1 flex items-center gap-2">
          <svg
            className="h-3 w-3 animate-spin text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
            正在加载编辑器…
          </span>
        </div>
      </div>
    </div>
  );
}
