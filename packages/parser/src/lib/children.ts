export function children(...nodes: Node[]) {
    return nodes.flatMap(node => typeof node === "string" ? new Text(node) : node);
}
