import { NodeComponent, NodeProps } from "../NodeComponent";
import { EdgesComponent, EdgeProps } from "../EdgesComponent";

export interface FlowChartConfig {
    nodes: NodeProps[];
    edges: { startNodeIndex: number; endNodeIndex: number; inputTarget: number; outputTarget: number; }[];
}

export class FlowChart extends HTMLElement {
    private nodes: NodeComponent[] = [];
    private edgesComponent: EdgesComponent | null = null;

    constructor(config: FlowChartConfig) {
        super();
        this.initializeNodes(config.nodes);
        this.initializeEdges(config.edges);
    }

    private initializeNodes(nodesConfig: NodeProps[]) {
        nodesConfig.forEach(nodeConfig => {
            const node = new NodeComponent(nodeConfig);
            this.nodes.push(node);
            this.appendChild(node);
        });
    }

    private initializeEdges(edgesConfig: FlowChartConfig['edges']) {
        const edgeProps: EdgeProps = {
            actives: edgesConfig.map(edgeConfig => ({
                startNode: this.nodes[edgeConfig.startNodeIndex-1],
                endNode: this.nodes[edgeConfig.endNodeIndex-1],    
                inputTarget: edgeConfig.inputTarget - 1,
                outputTarget: edgeConfig.outputTarget - 1,
            })),
        };        

        this.edgesComponent = new EdgesComponent(edgeProps);
        this.appendChild(this.edgesComponent);
    }
}

customElements.define("flow-chart", FlowChart);