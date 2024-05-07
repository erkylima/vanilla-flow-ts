export type Tags = keyof HTMLElementTagNameMap

export type ElmByTag<K extends Tags> = HTMLElementTagNameMap[K]

export type ElmFn<K extends Tags> = (props: object) => ElmByTag<K>