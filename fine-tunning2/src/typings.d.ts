type Tags = keyof HTMLElementTagNameMap

type ElmByTag<K extends Tags> = HTMLElementTagNameMap[K]

type ElmFn<K extends Tags> = (props: object) => ElmByTag<K>

declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare const tsx: {
    parser<K extends keyof HTMLElementTagNameMap>(tagOrFn: K | ElmFn<K>, attrs: Partial<ElmByTag<K>>, ...nodes: Node[]): ElmByTag<K>;
}

declare namespace JSX {
    type IntrinsicElements = {
        [K in Tags]: Partial<ElmByTag<K>>
    }
}