import { NodeComponent, NodeProps } from "../NodeComponent";
import { EdgesComponent, EdgeProps } from "../EdgesComponent";

export interface FlowChartConfig {
    nodes: NodeProps[];
    edges: { startNodeIndex: number; endNodeIndex: number; inputTarget: number; outputTarget: number; }[];
}

export class FlowChart extends HTMLElement {
    private nodes: NodeComponent[] = [];
    private edgesComponent: EdgesComponent | null = null;
    private board: HTMLElement;
    private scale: number = 1
    constructor(config: FlowChartConfig) {
        super();

        this.render();
        this.initializeNodes(config.nodes);
        this.initializeEdges(config.edges);
    }

    private render(){   
        this.innerHTML = `
        <style>                
            .wrapper {
                display: block;
                overflow: hidden;
                width: 100%;
                height: 100%;
                position: relative;
                border: 1px solid #ccc;
                cursor: grab;   
                background-color: white;
                background-size: 30px 30px;
                background-image: radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px);                 
            }
            .board {
                transform-origin: 0 0;
                transition: transform 0.1s ease;
                width: 100%;
                height: 100%;
                position: relative;
                
            }
        </style>
        <div class="wrapper" style="width: 98vw; height: 80vh; ">
            <div class="board">
                
            </div>
        </div>
        `
        const wrapper = this.querySelector('.wrapper') as HTMLDivElement;
        wrapper.addEventListener('wheel', this.onWheel.bind(this), {passive: false});

        this.board = this.querySelector('.board') as HTMLDivElement
    }

    private initializeNodes(nodesConfig: NodeProps[]) {
        nodesConfig.forEach(nodeConfig => {
            const node = new NodeComponent(nodeConfig);
            this.nodes.push(node);

            this.board.appendChild(node);
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
            flowchart: this,
        };        

        this.edgesComponent = new EdgesComponent(edgeProps);
        this.board.appendChild(this.edgesComponent);
    }

    onWheel(event: WheelEvent): void {
        event.preventDefault();
        const previousZoomLevel = this.scale;

        this.scale += event.deltaY * -0.01;
        this.scale = Math.min(Math.max(0.5, this.scale), 2);

        const scaleChange = this.scale / previousZoomLevel;
        

        this.board.style.transform = `translate: scale(${scaleChange})`;
    }
}

customElements.define("flow-chart", FlowChart);