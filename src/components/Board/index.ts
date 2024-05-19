import { produce } from "../../util/builder";
import EdgesBoard from "../EdgesBoard";
import NodesBoard from "../NodesBoard";
import styles from "./styles.module.css";

export interface Position {
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

export interface BoardNodeProps {
    id: string;
    position: { x: number; y: number };
    data: { label?: string; content: any };
    inputs: number;
    outputs: number;
    actions?: { delete: boolean };
}

export interface BoardEdgeProps {
    id: string;
    sourceNode: string;
    targetNode: string;
    sourceOutput: number;
    targetInput: number;
}

export interface BoardProps {
    nodes: BoardNodeProps[];
    edges: BoardEdgeProps[];
    onNodesChange: (newNodes: BoardNodeProps[]) => void;
    onEdgesChange: (newEdges: BoardEdgeProps[]) => void;
}

function getEdgeId(nodeOutId: string, outputIndex: number, nodeInId: string, inputIndex: number) {
    return `edge_${nodeOutId}:${outputIndex}_${nodeInId}:${inputIndex}`;
}

function getInitialEdges(nodes: BoardNodeProps[]): {
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
    nodes: BoardNodeProps[],
    edges: BoardEdgeProps[]
): {
    initNodesPositions: Position[];
    initNodesData: NodeData[];
    initNodesOffsets: { inputs: { offset: Position }[]; outputs: { offset: Position }[] }[];
} {
    const initNodesPositions = nodes.map((node: BoardNodeProps) => node.position);
    const initNodesData = nodes.map((node: BoardNodeProps) => {
        return {
            edgesIn: edges
                .map((edge: BoardEdgeProps) => {
                    if (edge.targetNode === node.id)
                        return getEdgeId(edge.sourceNode, edge.sourceOutput, edge.targetNode, edge.targetInput);
                    return "null";
                })
                .filter((elem: string) => elem !== "null"),
            edgesOut: edges
                .map((edge: BoardEdgeProps) => {
                    if (edge.sourceNode === node.id)
                        return getEdgeId(edge.sourceNode, edge.sourceOutput, edge.targetNode, edge.targetInput);
                    return "null";
                })
                .filter((elem: string) => elem !== "null"),
            ...node,
        };
    });
    const initNodesOffsets = nodes.map((node: BoardNodeProps) => {
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

class FlowChart extends HTMLElement{
    static observedAttributes = ["nodesPositions", "edgesActive"];

    props : BoardProps;
    edgesBoard: EdgesBoard;
    nodesBoard: NodesBoard;
    content: HTMLElement
    // EDGES
    edgesNodes: EdgesNodes
    set setEdgeNodes(edgesNodes: EdgesNodes) {
        this.edgesNodes = edgesNodes;
    }
    edgesPositions: EdgesPositions
    set setEdgesPositions(edgesPositions: EdgesPositions) {
        this.edgesPositions = edgesPositions;
    }
    edgesActive: EdgesActive
    set setEdgesActive(edgesActive: EdgesActive) {
        this.edgesActive = edgesActive;
    }

    // NODES
    nodesPositions: Position[]
    set setNodesPositions(nodesPositions: Position[]) {
        this.nodesPositions = nodesPositions;
    }
    nodesData: NodeData[]
    set setNodesData(nodesData: NodeData[]) {
        this.nodesData = nodesData;
    }
    nodesOffsets: { inputs: { offset: Position }[]; outputs: { offset: Position }[] }[];
    set setNodesOffsets(nodesOffset: { inputs: { offset: Position }[]; outputs: { offset: Position }[] }[]) {
        this.nodesOffsets = nodesOffset;
    }

    clickedDelta:Position
    set setClickedDelta(clickedDelta: Position) {
        this.clickedDelta = clickedDelta;
    }
    get getClickedDelta():Position {
        return this.clickedDelta
    }

    newEdge: { position: Vector; sourceNode: number; sourceOutput: number } | null;
    set setNewEdge(newEdge: { position: Vector; sourceNode: number; sourceOutput: number }|null){
        this.newEdge = newEdge;
    }

    attributeChangedCallback(name: any, oldValue: any, newValue: any) {
        console.log(`Attribute ${name} has changed.`);
    }


    constructor(props: BoardProps) {
        super();
        this.props = props;
        if (this.props != undefined){
            
            const { initEdgesNodes, initEdgesPositions, initEdgesActives } = getInitialEdges(this.props.nodes);
            
            this.setEdgeNodes = initEdgesNodes;
            this.setEdgesPositions = initEdgesPositions;
            this.setEdgesActive = initEdgesActives;

            const { initNodesPositions, initNodesData, initNodesOffsets } = getInitialNodes(this.props.nodes, this.props.edges);
            this.setNodesPositions = initNodesPositions;
            this.setNodesData = initNodesData;
            this.setNodesOffsets = initNodesOffsets;
            this.clickedDelta = { x: 0, y: 0 };
            this.newEdge = null;

            this.render();
        }
    }
   
    
    
    mainElement():HTMLElement {
        var drawer = document.createElement('div');
        drawer.className = styles.main
        return drawer;
    }

    wrapperElement():HTMLElement {
        var drawer = document.createElement('div');
        drawer.className = styles.wrapper
        return drawer;
    }

    contentElement():HTMLElement {
        var drawer = document.createElement('div')
        drawer.className = styles.content
        drawer.style.cursor = this.newEdge !== null ? 'crosshair' : 'inherit'
        return drawer
    }


    connectedCallback() {
        if (this.props != undefined) {
            const nextNodesLength = this.props.nodes.length;
            const prevNodesLength = this.nodesData.length;      
            
            if (nextNodesLength !== prevNodesLength) {
                const { initEdgesNodes, initEdgesPositions, initEdgesActives } = getInitialEdges(this.props.nodes);
                this.setEdgeNodes = initEdgesNodes;
                this.setEdgesPositions = initEdgesPositions;
                this.setEdgesActive = initEdgesActives;
                const { initNodesPositions, initNodesData, initNodesOffsets } = getInitialNodes(this.props.nodes, this.props.edges);
                this.setNodesPositions = initNodesPositions;
                this.setNodesData =initNodesData;
                this.setNodesOffsets = initNodesOffsets;
            }
            
        }
    }


    render() {
            var main = this.mainElement()
            var wrapper = this.wrapperElement()
            var content = this.contentElement()
            const nodesBoard = new NodesBoard({
                nodesPositions:this.nodesPositions,
                nodes:this.nodesData,
                onNodeMount:((values) => this.handleOnNodeMount(values)),
                onNodePress:((deltaX, deltaY) => this.handleOnNodePress(deltaX, deltaY)),
                onNodeMove:((nodeIndex, x, y) => this.handleOnNodeMove(nodeIndex, x, y)),
                onNodeDelete:((nodeId) => this.handleOnNodeDelete(nodeId)),
                onOutputMouseDown:((nodeIndex, outputNode) => this.handleOnOutputMouseDown(nodeIndex, outputNode)),
                onInputMouseUp:((nodeIndex, InputNode) => this.handleOnInputMouseUp(nodeIndex, InputNode)),
                onMouseUp: (() => this.handleOnMouseUp()),
                onMouseMove:this.handleOnMouseMove            
            }); 
            
            content.appendChild(nodesBoard);
            this.content = content;
            setTimeout(() => {
                console.log('setting dynamic attribute. This should trigger attributeChangedCallback. But no.', JSON.stringify(this.edgesActive));
                
                const edgesBoard = new EdgesBoard({
                    newEdge:this.newEdge,
                    edgesActives:this.edgesActive,
                    edgesPositions:this.edgesPositions,
                    onDeleteEdge: ((e) => this.handleOnDeleteEdge(e))
                    
                });
    
                this.edgesBoard = edgesBoard
                this.content.appendChild(this.edgesBoard)
            }, 100);
            wrapper.append(content)
            main.append(wrapper)
            this.append(main)    
    }    


    // NODE HANDLERS
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

        this.setNodesOffsets = nodesOffset(this.nodesOffsets);
        const edgesActives = (prev: EdgesActive) => {
            const next = { ...prev };
            this.nodesData[values.nodeIndex].edgesIn.map((edgeId: string) => {
                next[edgeId] = true;
            });
            this.nodesData[values.nodeIndex].edgesOut.map((edgeId: string) => {
                next[edgeId] = true;
            });
            return next;
        }
        this.setEdgesActive = edgesActives(this.edgesActive);

        const edgesPositions = (prev: EdgesPositions)=> {
            const next = { ...prev };
            this.nodesData[values.nodeIndex].edgesIn.map((edgeId: string) => {                
                next[edgeId] = {
                    x0: prev[edgeId]?.x0 || 0,
                    y0: prev[edgeId]?.y0 || 0,
                    x1: this.nodesPositions[values.nodeIndex].x + values.inputs[this.edgesNodes[edgeId].inputIndex].offset.x,
                    y1: this.nodesPositions[values.nodeIndex].y + values.inputs[this.edgesNodes[edgeId].inputIndex].offset.y,
                };
                
            });
            this.nodesData[values.nodeIndex].edgesOut.map((edgeId: string) => {
                next[edgeId] = {
                    x0: this.nodesPositions[values.nodeIndex].x + values.outputs[this.edgesNodes[edgeId].outputIndex].offset.x,
                    y0: this.nodesPositions[values.nodeIndex].y + values.outputs[this.edgesNodes[edgeId].outputIndex].offset.y,
                    x1: prev[edgeId]?.x1 || 0,
                    y1: prev[edgeId]?.y1 || 0,
                };
                
            });
            return next;
        }
        this.setEdgesPositions = edgesPositions(this.edgesPositions);
    }

    handleOnNodePress(deltaX: number, deltaY: number) {
        this.clickedDelta = { x: deltaX, y: deltaY };

    }

    handleOnNodeMove(nodeIndex: number, x: number, y: number) {
        const prev = (prev:Position[]) => {
            const next:Position[] = [...prev];
            next[nodeIndex].x = x - this.clickedDelta.x;
            next[nodeIndex].y = y - this.clickedDelta.y;
            return next;
        }
        
        var prevNode = prev(this.nodesPositions);
        this.setNodesPositions = prevNode;
        const node = document.getElementById("node-" + (nodeIndex +1));
        
        node.style.transform = `translate(${x - this.clickedDelta.x}px, ${y - this.clickedDelta.y}px)`
        const calculateOffset = (value: number) => {            
            return (value * 100) / 200;            
        }
        const edgesPositions = (prev: EdgesPositions) => {
            const next = { ...prev };
            
            
            this.nodesData[nodeIndex].edgesIn.map((edgeId: string) => {
                if (this.edgesActive[edgeId]){
                    next[edgeId] = {
                        x0: prev[edgeId]?.x0 || 0,
                        y0: prev[edgeId]?.y0 || 0,
                        x1: x + this.nodesOffsets[nodeIndex].inputs[this.edgesNodes[edgeId].inputIndex].offset.x - this.clickedDelta.x,
                        y1: y + this.nodesOffsets[nodeIndex].inputs[this.edgesNodes[edgeId].inputIndex].offset.y - this.clickedDelta.y,
                    };

                    document.getElementById(edgeId).setAttribute('d', `
                    M ${next[edgeId].x0} ${next[edgeId].y0} C ${
                        next[edgeId].x0 + calculateOffset(Math.abs(next[edgeId].x1 - next[edgeId].x0))
                    } ${next[edgeId].y0}, ${next[edgeId].x1 - calculateOffset(Math.abs(next[edgeId].x1 - next[edgeId].x0))} ${
                        next[edgeId].y1
                    }, ${next[edgeId].x1} ${next[edgeId].y1}
                    `)                }
            });
            this.nodesData[nodeIndex].edgesOut.map((edgeId: string) => {
                if (this.edgesActive[edgeId]){
                    next[edgeId] = {
                        x0: x + this.nodesOffsets[nodeIndex].outputs[this.edgesNodes[edgeId].outputIndex].offset.x - this.clickedDelta.x,
                        y0: y + this.nodesOffsets[nodeIndex].outputs[this.edgesNodes[edgeId].outputIndex].offset.y - this.clickedDelta.y,
                        x1: prev[edgeId]?.x1 || 0,
                        y1: prev[edgeId]?.y1 || 0,
                    };
                    this.querySelector("#"+edgeId).setAttribute('d', `
                    M ${next[edgeId].x0} ${next[edgeId].y0} C ${
                        next[edgeId].x0 + calculateOffset(Math.abs(next[edgeId].x1 - next[edgeId].x0))
                    } ${next[edgeId].y0}, ${next[edgeId].x1 - calculateOffset(Math.abs(next[edgeId].x1 - next[edgeId].x0))} ${
                        next[edgeId].y1
                    }, ${next[edgeId].x1} ${next[edgeId].y1}
                    `)
                }
            });
            
            return next;
            
        }
        this.setEdgesPositions = edgesPositions(this.edgesPositions);


    }

    handleOnNodeDelete(nodeId: string) {
        const newNodes = this.props.nodes.filter((node: BoardNodeProps) => node.id !== nodeId);
        const newEdges = this.props.edges.filter((edge: BoardEdgeProps) => {
            edge.sourceNode !== nodeId && edge.targetNode !== nodeId            
        });
        this.props.onEdgesChange(newEdges);
        this.props.onNodesChange(newNodes);
        document.getElementById(nodeId).remove();

    }

    handleOnOutputMouseDown(nodeIndex: number, outputIndex: number) {
        const nodePosition = this.nodesPositions[nodeIndex];

        const outputOffset = this.nodesOffsets[nodeIndex].outputs[outputIndex].offset;
        this.setNewEdge ={
            position: {
                x0: nodePosition.x + outputOffset.x,
                y0: nodePosition.y + outputOffset.y,
                x1: nodePosition.x + outputOffset.x,
                y1: nodePosition.y + outputOffset.y,
            },
            sourceNode: nodeIndex,
            sourceOutput: outputIndex,
        };
        
    }

    handleOnInputMouseUp(nodeIndex: number, inputIndex: number) {
        if (this.newEdge?.sourceNode === nodeIndex) {
            this.setNewEdge = null;
            return;
        }

        const outputEdges: string[] = JSON.parse(JSON.stringify(this.nodesData[this.newEdge?.sourceNode || 0].edgesOut));
        const inputEdges: string[] = JSON.parse(JSON.stringify(this.nodesData[nodeIndex].edgesIn));

        if (!this.newEdge) return;
        const sourceNodeId = this.nodesData[this.newEdge?.sourceNode || 0].id;
        const targetNodeId = this.nodesData[nodeIndex].id;

        const edgeId = getEdgeId(sourceNodeId, this.newEdge?.sourceOutput || 0, targetNodeId, inputIndex);

        let haveEdge = false;
        if (outputEdges.includes(edgeId)) haveEdge = true;
        if (inputEdges.includes(edgeId)) haveEdge = true;

        if (!haveEdge) {
            const edgesPositions = (prev: EdgesPositions) => {
                const next = { ...prev };
                next[edgeId] = {
                    x0:
                    this.nodesPositions[this.newEdge?.sourceNode || 0].x +
                    this.nodesOffsets[this.newEdge?.sourceNode || 0].outputs[this.newEdge?.sourceOutput || 0].offset.x,
                    y0:
                    this.nodesPositions[this.newEdge?.sourceNode || 0].y +
                    this.nodesOffsets[this.newEdge?.sourceNode || 0].outputs[this.newEdge?.sourceOutput || 0].offset.y,
                    x1: this.nodesPositions[nodeIndex].x + this.nodesOffsets[nodeIndex].inputs[inputIndex].offset.x,
                    y1: this.nodesPositions[nodeIndex].y + this.nodesOffsets[nodeIndex].inputs[inputIndex].offset.y,
                };
                return next;
            }
            this.setEdgesPositions = edgesPositions(this.edgesPositions);
            
            const edgesActives = (prev: EdgesActive) => {
                const next = { ...prev };
                next[edgeId] = true;
                return next;
            }
            this.setEdgesActive = edgesActives(this.edgesActive);
            const nodesProduced = produce((nodesData: NodeData[]) => {
                this.nodesData[this.newEdge?.sourceNode || 0].edgesOut.push(edgeId);
                nodesData[nodeIndex].edgesIn.push(edgeId);
            })
            this.setNodesData = nodesProduced(this.nodesData);

            const activeEdgesKeys = Object.keys(this.edgesActive);
            const activeEdges: BoardEdgeProps[] = [];
            for (let i = 0; i < activeEdgesKeys.length; i++) {
                if (this.edgesActive[activeEdgesKeys[i]]) {
                    const edgeInfo = this.edgesNodes[activeEdgesKeys[i]];
                    activeEdges.push({
                        id: activeEdgesKeys[i],
                        sourceNode: edgeInfo.outNodeId,
                        sourceOutput: edgeInfo.outputIndex,
                        targetNode: edgeInfo.inNodeId,
                        targetInput: edgeInfo.inputIndex,
                    });
                }
            }
            this.props.onEdgesChange(activeEdges);
        }
        this.setNewEdge = null;

    }

    handleOnMouseUp() {
        
        this.setNewEdge = null;
    }

    handleOnMouseMove(x: number, y: number) {
        
        if (this.newEdge !== null)
            this.setNewEdge = {
                position: { x0: this.newEdge?.position?.x0 || 0, y0: this.newEdge?.position?.y0 || 0, x1: x, y1: y },
                sourceNode: this.newEdge?.sourceNode || 0,
                sourceOutput: this.newEdge?.sourceOutput || 0,
            };
    }

    // EDGE HANDLERS
    handleOnDeleteEdge(edgeId: string) {
        const nodesProduced = produce((nodesData: NodeData[]) => {
            const nodeSourceId = this.edgesNodes[edgeId].outNodeId;
            const nodeTargetId = this.edgesNodes[edgeId].inNodeId;

            const nodeSourceIndex = nodesData.findIndex((node: NodeData) => node.id === nodeSourceId);
            const nodeTargetIndex = nodesData.findIndex((node: NodeData) => node.id === nodeTargetId);

            nodesData[nodeTargetIndex].edgesIn = nodesData[nodeTargetIndex].edgesIn.filter((elem: string) => elem !== edgeId);
            nodesData[nodeSourceIndex].edgesOut = nodesData[nodeSourceIndex].edgesOut.filter((elem: string) => elem !== edgeId);
        })
        this.setNodesData = nodesProduced(this.nodesData);
        
        const edgesActives = (prev: EdgesActive) => {
            const next = { ...prev };
            next[edgeId] = false;
            return next;
        }

        this.setEdgesActive = edgesActives(this.edgesActive);

        const activeEdgesKeys = Object.keys(this.edgesActive);
        const activeEdges: BoardEdgeProps[] = [];
        for (let i = 0; i < activeEdgesKeys.length; i++) {
            if (this.edgesActive[activeEdgesKeys[i]]) {
                const edgeInfo = this.edgesNodes[activeEdgesKeys[i]];
                activeEdges.push({
                    id: activeEdgesKeys[i],
                    sourceNode: edgeInfo.outNodeId,
                    sourceOutput: edgeInfo.outputIndex,
                    targetNode: edgeInfo.inNodeId,
                    targetInput: edgeInfo.inputIndex,
                });
            }
        }
        this.props.onEdgesChange(activeEdges);
    }

}

customElements.define("flow-chart", FlowChart);


export default FlowChart;
