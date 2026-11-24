/**
 * トーストの状態（DESIGN.md 3.4）。一度に 1 つ。新しいものが古いものに替わる
 */
import { useRef, useState } from "preact/hooks";
export function useToastState() {
    const [toast, setToast] = useState(null);
    const seq = useRef(0);
    const notify = (text, action, sticky) => setToast({ id: ++seq.current, text, action, sticky });
    const dismiss = (id) => setToast((t) => (t?.id === id ? null : t));
    return { toast, notify, dismiss };
}
