import { children } from "./children";
import { element } from "./element";
import { props } from "./props";
import { ElmByTag, ElmFn, Tags } from "./types";


export const tsx = {
    parser<K extends Tags>(
        tagOrFn: K | ElmFn<K>,
        attrs: Partial<ElmByTag<K>>,
        ...nodes: Node[]
    ) {
        attrs = props(attrs ?? {})
        const tagIsString = typeof tagOrFn === "string"
        const component = tagIsString ? 
            element(tagOrFn, attrs) :
            tagOrFn(attrs);

        component.append(...children(...nodes));
        return component;
    }
}

globalThis.tsx = tsx;