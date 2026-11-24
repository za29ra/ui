import type { Notify } from "./toast-state.ts";
/** buildId は画面に埋め込んだビルドの ID（version.json の buildId と比べる） */
export declare function useUpdateCheck(buildId: string, notify: Notify): void;
