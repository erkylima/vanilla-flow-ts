import { produce } from "../../util/builder"

export class FlowChart extends HTMLElement {
    #props: Props
    
    #edgesNodes: EdgesNodes
    private draggableElement: HTMLElement | null = null;

    set setEdgesNodes(edgesNodes: EdgesNodes){
        this.#edgesNodes = edgesNodes
    }
    #edgesPositions: EdgesPositions
    set setEdgesPositions(edgesPositions: EdgesPositions){
        this.#edgesPositions = edgesPositions
    }
    #edgesActives: EdgesActive
    set setEdgesActives(edgesActives: EdgesActive){
        this.#edgesActives = edgesActives
    }

    #nodesPositions: Position[]
    set setNodesPositions(nodesPositions: Position[]){
        this.#nodesPositions = nodesPositions
    }
    #nodesData: NodeData[]
    set setNodesData(nodesData: NodeData[]){
        this.#nodesData = nodesData
    }
    #nodesOffsets: { inputs: { offset: Position }[]; outputs: { offset: Position }[] }[]
    set setNodesOffsets(nodesOffsets: { inputs: { offset: Position }[]; outputs: { offset: Position }[] }[]){
        this.#nodesOffsets = nodesOffsets
    }

    #clickedDelta: Position
    set setClickedDelta(clickedDelta: Position){
        this.#clickedDelta = clickedDelta
    }

    #newEdge: { position: Vector; sourceNode: number; sourceOutput: number } | null
    set setNewEdge(newEdge: { position: Vector; sourceNode: number; sourceOutput: number } | null){
        this.#newEdge = newEdge
    }
    private offsetX: number = 0;
    private offsetY: number = 0;
    private inputElement!: HTMLDivElement;
    private outputElement!: HTMLDivElement;
    shadowRoot: ShadowRoot
    constructor() {
        super();
        
        this.shadowRoot = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    private render() {
        this.shadowRoot!.innerHTML = `
            <style>
                .draggable {
                    width: 100px;
                    height: 100px;
                    background-color: blue;
                    position: absolute;
                    cursor: pointer;
                }
                .connector {
                    width: 10px;
                    height: 10px;
                    background-color: red;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                }
                .input {
                    left: -5px;
                }
                .output {
                    right: -5px;
                }
            </style>
            <div class="draggable">
                <div class="connector input"></div>
                <div class="connector output"></div>
            </div>
        `;
        this.draggableElement = this.shadowRoot!.querySelector('.draggable') as HTMLElement;
        this.draggableElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    }
    private isDragging: boolean = false;

    private onMouseDown(event: MouseEvent) {
        event.preventDefault();
        this.isDragging = true;

        const rect = this.draggableElement.getBoundingClientRect();
        this.offsetX = event.clientX - rect.left;
        this.offsetY = event.clientY - rect.top;

        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;

        const dropzoneRect = this.getBoundingClientRect();
        const newX = event.clientX - dropzoneRect.left - this.offsetX;
        const newY = event.clientY - dropzoneRect.top - this.offsetY;

        this.draggableElement.style.left = `${newX}px`;
        this.draggableElement.style.top = `${newY}px`;
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.isDragging) return;
        this.isDragging = false;

        window.removeEventListener('mousemove', this.onMouseMove.bind(this));
        window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }

    handleOnNodeMount(values: {
        nodeIndex: number;
        inputs: { offset: { x: number; y: number } }[];
        outputs: { offset: { x: number; y: number } }[];
    }) {
        const nodesOffset = produce(
            (nodesOffsets: {
                inputs: { offset: { x: number; y: number } }[];
                outputs: { offset: { x: number; y: number } }[];
            }[]) => {
                if (values.inputs.length > 0) {
                    nodesOffsets[values.nodeIndex].inputs = values.inputs;
                }
                if (values.outputs.length > 0) {
                    nodesOffsets[values.nodeIndex].outputs = values.outputs;
                }
            }
        );

        this.setNodesOffsets = nodesOffset(this.#nodesOffsets)

        const edgesActives = (prev: EdgesActive) => {
            const next = { ...prev };
            this.#nodesData[values.nodeIndex].edgesIn.map((edgeId: string) => {
                next[edgeId] = true;
            });
            this.#nodesData[values.nodeIndex].edgesOut.map((edgeId: string) => {
                next[edgeId] = true;
            });
            return next;
        }
        this.setEdgesActives = edgesActives(this.#edgesActives);

        const edgesPositions = (prev: EdgesPositions)=> {
            const next = { ...prev };
            this.#nodesData[values.nodeIndex].edgesIn.map((edgeId: string) => {                
                next[edgeId] = {
                    x0: prev[edgeId]?.x0 || 0,
                    y0: prev[edgeId]?.y0 || 0,
                    x1: this.#nodesPositions[values.nodeIndex].x + values.inputs[this.#edgesNodes[edgeId].inputIndex].offset.x,
                    y1: this.#nodesPositions[values.nodeIndex].y + values.inputs[this.#edgesNodes[edgeId].inputIndex].offset.y,
                };
                
            });
            this.#nodesData[values.nodeIndex].edgesOut.map((edgeId: string) => {
                next[edgeId] = {
                    x0: this.#nodesPositions[values.nodeIndex].x + values.outputs[this.#edgesNodes[edgeId].outputIndex].offset.x,
                    y0: this.#nodesPositions[values.nodeIndex].y + values.outputs[this.#edgesNodes[edgeId].outputIndex].offset.y,
                    x1: prev[edgeId]?.x1 || 0,
                    y1: prev[edgeId]?.y1 || 0,
                };
                
            });
            return next;
        }
        this.setEdgesPositions = edgesPositions(this.#edgesPositions);
    }
}

interface Position {
    x: number;
    y: number;
}

interface Vector {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

interface NodeData {
    id: string;
    data: { label?: string; content: any };
    inputs: number;
    outputs: number;
    edgesIn: string[];
    edgesOut: string[];
}

interface EdgesNodes {
    [id: string]: { outNodeId: string; outputIndex: number; inNodeId: string; inputIndex: number };
}

interface EdgesPositions {
    [id: string]: Vector;
}

interface EdgesActive {
    [id: string]: boolean;
}

export interface NodeProps {
    id: string;
    position: { x: number; y: number };
    data: { label?: string; content: any };
    inputs: number;
    outputs: number;
    actions?: { delete: boolean };
}

export interface EdgeProps {
    id: string;
    sourceNode: string;
    targetNode: string;
    sourceOutput: number;
    targetInput: number;
}

interface Props {
    nodes: NodeProps[];
    edges: EdgeProps[];
    onNodesChange: (newNodes: NodeProps[]) => void;
    onEdgesChange: (newEdges: EdgeProps[]) => void;
}

function getEdgeId(nodeOutId: string, outputIndex: number, nodeInId: string, inputIndex: number) {
    return `edge_${nodeOutId}:${outputIndex}_${nodeInId}:${inputIndex}`;
}

function getInitialEdges(nodes: NodeProps[]): {
    initEdgesNodes: EdgesNodes;
    initEdgesPositions: EdgesPositions;
    initEdgesActives: EdgesActive;
} {
    const initEdgesNodes: EdgesNodes = {};
    const initEdgesPositions: EdgesPositions = {};
    const initEdgesActives: EdgesActive = {};

    for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            if (i !== j) {
                const nodeI = nodes[i];
                const nodeJ = nodes[j];

                for (let x = 0; x < nodeI.outputs; x++) {
                    for (let y = 0; y < nodeJ.inputs; y++) {
                        const edgeId = getEdgeId(nodeI.id, x, nodeJ.id, y);
                        initEdgesPositions[edgeId] = { x0: 0, y0: 0, x1: 0, y1: 0 };
                        initEdgesActives[edgeId] = false;
                        initEdgesNodes[edgeId] = { outNodeId: nodeI.id, outputIndex: x, inNodeId: nodeJ.id, inputIndex: y };
                    }
                }
            }
        }
    }
    return { initEdgesNodes, initEdgesPositions, initEdgesActives };
}

function getInitialNodes(
    nodes: NodeProps[],
    edges: EdgeProps[]
): {
    initNodesPositions: Position[];
    initNodesData: NodeData[];
    initNodesOffsets: { inputs: { offset: Position }[]; outputs: { offset: Position }[] }[];
} {
    const initNodesPositions = nodes.map((node: NodeProps) => node.position);
    const initNodesData = nodes.map((node: NodeProps) => {
        return {
            edgesIn: edges
                .map((edge: EdgeProps) => {
                    if (edge.targetNode === node.id)
                        return getEdgeId(edge.sourceNode, edge.sourceOutput, edge.targetNode, edge.targetInput);
                    return "null";
                })
                .filter((elem: string) => elem !== "null"),
            edgesOut: edges
                .map((edge: EdgeProps) => {
                    if (edge.sourceNode === node.id)
                        return getEdgeId(edge.sourceNode, edge.sourceOutput, edge.targetNode, edge.targetInput);
                    return "null";
                })
                .filter((elem: string) => elem !== "null"),
            ...node,
        };
    });
    const initNodesOffsets = nodes.map((node: NodeProps) => {
        return {
            inputs: [...Array(node.inputs)].map(() => {
                return { offset: { x: 0, y: 0 } };
            }),
            outputs: [...Array(node.outputs)].map(() => {
                return { offset: { x: 0, y: 0 } };
            }),
        };
    });

    return { initNodesPositions, initNodesData, initNodesOffsets };
}

customElements.define("flow-chart", FlowChart)