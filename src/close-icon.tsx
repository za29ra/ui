/** 閉じる（✕）のアイコン。色は currentColor、大きさは 20px、線は 2（DESIGN.md 2.5）。装飾なので読み上げない（ボタンに aria-label を付ける） */
export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}
