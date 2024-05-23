import FlowChart, { BoardEdgeProps, BoardNodeProps } from "./components/Board";
import { ElementBuilder } from "./util/builder";
const pnode1 = ElementBuilder("p", "This is a simple node");

const pnode2 = document.createElement("p");
pnode2.textContent = "This is a node with a label"
const pnode4 = document.createElement("p");
pnode4.textContent = "This is a node with only inputs"
const p = document.createElement("p");
p.textContent = "This is a node with two inputs and two outputs"


const initialNodes = [
    {
        id: "node-1",
        position: { x: 50, y: 100 },
        data: {
            content: pnode1,
        },
        inputs: 0,
        outputs: 1,
    },
    {
        id: "node-2",
        position: { x: 350, y: 100 },
        data: {
            label: "Node with label",
            content: pnode2,
        },
        inputs: 1,
        outputs: 1,
    },
    {
        id: "node-3",
        position: { x: 350, y: 300 },
        data: {
            content: p,
        },
        inputs: 2,
        outputs: 2,
    },

    {
        id: "node-4",
        position: { x: 900, y: 100 },
        data: {
            label: "Only inputs",
            content: pnode4,
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
    set setNodes(nodes:BoardNodeProps[]){
        this.nodes = nodes;
    }
    edges:BoardEdgeProps[];
    set setEdges(edges:BoardEdgeProps[]){
        this.edges = edges;
    }
    constructor(){
        super();   
        this.setNodes = initialNodes;
        this.setEdges = initialEdges;
        this.render();
    }


    render() {
        const flowchart = new FlowChart({
            nodes: this.nodes,
            edges: this.edges,
            onNodesChange: (newNodes: BoardNodeProps[]) => {
                this.setNodes =newNodes;
            },
            onEdgesChange: (newEdges: BoardEdgeProps[]) => {
                this.setEdges = newEdges;
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