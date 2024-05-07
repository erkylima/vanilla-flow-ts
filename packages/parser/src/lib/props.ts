import type { ElmByTag, Tags } from "./types";

export function props<K extends Tags>(attrs: Partial<ElmByTag<K>>) {
    return Object.entries(attrs)
        .reduce((prev, [prop, value]) => {
            if (prop.startsWith(":")) prop = prop.replace(":", "");
            return { ...prev, [prop]: value };
        }, attrs);
}
