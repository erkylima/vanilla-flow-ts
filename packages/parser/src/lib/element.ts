import type { ElmByTag, Tags } from "./types";

export function element<K extends Tags>(tagOrFn: K,
    attrs: Partial<ElmByTag<K>>) {
    return Object.assign(document.createElement(tagOrFn), attrs);
}
