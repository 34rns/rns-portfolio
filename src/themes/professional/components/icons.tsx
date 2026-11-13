export function ArrowIcon({ up = false }: { up?: boolean }) {
  return <svg className="rns-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={up ? "M12 20V4m-7 7 7-7 7 7" : "M5 19 19 5M5 5h14v14"} />
  </svg>;
}

export function RotateIcon() {
  return <svg className="rns-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M20 8a8 8 0 1 0 .5 6M20 3v5h-5" />
  </svg>;
}
