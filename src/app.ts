import FlowChart, { BoardEdgeProps, BoardNodeProps } from "./components/Board";
import styles from "./style.module.css"

const initialNodes = [
    {
        id: "node-1",
        position: { x: 50, y: 100 },
        data: {
            content: "This is a simple node",
        },
        inputs: 0,
        outputs: 1,
    },
    {
        id: "node-2",
        position: { x: 350, y: 100 },
        data: {
            label: "Node with label",
            content: "This is a node with a label",
        },
        inputs: 1,
        outputs: 1,
    },
    {
        id: "node-3",
        position: { x: 350, y: 300 },
        data: {
            content: "This is a node with two inputs and two outputs",
        },
        inputs: 2,
        outputs: 2,
    },

    {
        id: "node-4",
        position: { x: 700, y: 100 },
        data: {
            label: "Only inputs",
            content: "This is a node with only inputs",
        },
        inputs: 2,
        outputs: 0,
    },
];

const initialEdges = [
    {
        id: "edge_0:0_1:0",
        sourceNode: "node-1",
        sourceOutput: 0,
        targetNode: "node-2",
        targetInput: 0,
    },
    {
        id: "edge_0:0_2:0",
        sourceNode: "node-1",
        sourceOutput: 0,
        targetNode: "node-3",
        targetInput: 0,
    },
    {
        id: "edge_1:0_3:0",
        sourceNode: "node-2",
        sourceOutput: 0,
        targetNode: "node-4",
        targetInput: 0,
    },
    {
        id: "edge_2:0_3:1",
        sourceNode: "node-3",
        sourceOutput: 0,
        targetNode: "node-4",
        targetInput: 1,
    },
];

export default class AppRoot extends HTMLElement {
    nodes:BoardNodeProps[];
    setNodes(nodes:BoardNodeProps[]){
        this.nodes = nodes;
    }
    edges:BoardEdgeProps[];
    setEdges(edges:BoardEdgeProps[]){
        this.edges = edges;
    }
    constructor(){
        super();   
        this.setNodes(initialNodes);
        this.setEdges(initialEdges);
        this.render();
    }


    render() {
        const flowchart = new FlowChart({
            nodes: this.nodes,
            edges: this.edges,
            onNodesChange: (newNodes: BoardNodeProps[]) => {
                this.setNodes(newNodes);
            },
            onEdgesChange: (newEdges: BoardEdgeProps[]) => {
                this.setEdges(newEdges);
            }
        })
        // var node = new NodeComponent({
        //     "id":"node-1",
        //     "x":50,
        //     "y":100,
        //     "selected":false,
        //     "label":"Node",
        //     "content":"This is a simple node",
        //     "inputs":0,
        //     "outputs":1

        // });
        this.append(flowchart);
    }
    
}

customElements.define("app-root", AppRoot);