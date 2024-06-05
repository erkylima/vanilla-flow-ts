import { NodeComponent, NodeProps } from "../NodeComponent";
import { EdgesComponent, EdgeProps } from "../EdgesComponent";

export interface FlowChartConfig {
    nodes: NodeProps[];
    edges: { startNodeIndex: number; endNodeIndex: number; inputTarget: number; outputTarget: number; }[];
}

export class FlowChart extends HTMLElement {
    private nodes: NodeComponent[] = [];
    edgesComponent: EdgesComponent | null = null;
    board: HTMLElement;
    wrapper: HTMLElement;
    scale: number = 1;
    translateX: number = 0;
    translateY: number = 0;
    private isPanning: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    actives: Array<{
        startNode: NodeComponent;
        endNode: NodeComponent;
        inputTarget: number;
        outputTarget: number;
    }>
    constructor(config: FlowChartConfig) {
        super();
        this.render();
        this.initializeNodes(config.nodes)
        const svg = this.querySelector("#edges");
        this.initializeEdges(config.edges,svg)
    }

    private render() {
        this.innerHTML = `
        <style>
            body {
                margin: 0;
                overflow: hidden;
            }
            #board {
                position: relative;
                width: 98vw;
                height: 80vh;
                background-color: #f0f0f0;
                cursor: grab;
            }
            .node {
                position: absolute;
                width: 100px;
                height: 50px;
                background-color: white;
                border: 1px solid black;
                border-radius: 5px;
                text-align: center;
                line-height: 50px;
                cursor: pointer;
                user-select: none;

            }
            .inputs {
                pointer-events: none;
                cursor: initial;
                z-index: -3;
                position: absolute;                    
                left: calc(12px * -0.1);                                        
                position: absolute;
                top: calc(50% - 3px );
                transform: translate(-50%,-50%);
                }
            .input {
                pointer-events: all;
                cursor: initial;
                background-color: #9c9c9c;
                width: 6px;
                height: 12px;
                margin: 6px 6px 0px 0px;
                box-shadow: 1px 1px 11px -6px rgba(0, 0, 0, 0.75);
            }
            .outputs {
                pointer-events: none;
                z-index: -3;
                position: absolute;                    
                right: calc(12px * -1.5);
                display: flex;
                flex-direction: column;
                top: 50%;
                transform: translate(-50%,-50%)
            }
            .output {
                pointer-events: all;
                cursor: crosshair;
                background-color: #e38b29;
                width: 12px;
                height: 12px;
                border-radius: 100%;
                margin: 5px 0px;
                box-shadow: 1px 1px 11px -6px rgba(0, 0, 0, 0.75);
            }
            svg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            line {
                stroke: black;
                stroke-width: 2;
            }
        </style>
        <div id="board">
            <svg id="edges"></svg>
            <!-- Nodes will be added here dynamically -->
        </div>
        `;
        this.board = this.querySelector("#board");
        this.board.addEventListener("wheel", (event) => {
            event.preventDefault();
            const delta = event.deltaY < 0 ? 0.1 : -0.1;
            this.scale = Math.min(Math.max(0.1, this.scale + delta), 3); // Limit zoom level between 0.1 and 3
            this.board.style.transform = `scale(${this.scale})`;
        })
        // Panning handling
        this.addEventListener('mousedown', (event) => {
            const target = <HTMLElement> event.target
            if (target.classList.contains('node')) return;
            this.isPanning = true;
            this.startX = event.clientX - this.translateX;
            this.startY = event.clientY - this.translateY;
            this.board.style.cursor = 'grabbing';
        });

        this.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.board.style.cursor = 'grab';
        });

        this.addEventListener('mousemove', (event) => {
            if (!this.isPanning) return;
            this.translateX = event.clientX - this.startX;
            this.translateY = event.clientY - this.startY;
            this.board.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        });

        this.addEventListener('mouseleave', () => {
            this.isPanning = false;
            this.board.style.cursor = 'grab';
        });
    }
            
        
    private initializeNodes(nodesConfig: NodeProps[]) {
        nodesConfig.forEach(nodeConfig => {
            nodeConfig.flowChart = this;
            const node = new NodeComponent(nodeConfig);        
            this.nodes.push(node);
            this.board.appendChild(node);
            
        });
    }
    
    private createEdgeElementLine(): SVGLineElement {
        const edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
        edge.setAttribute("class", "edge");
        edge.setAttribute("stroke", "rgba(168, 168, 168, 0.8)");
        edge.setAttribute("stroke-width", "2");
        edge.setAttribute("fill", "transparent");
        edge.setAttribute("marker-end", "url(#arrow)");
        return edge;
    }

    private initializeEdges(edgesConfig: FlowChartConfig['edges'], svg:Element) {
        const actives = edgesConfig.map(edgeConfig => ({
            startNode: this.nodes[edgeConfig.startNodeIndex - 1],
            endNode: this.nodes[edgeConfig.endNodeIndex - 1],
            inputTarget: edgeConfig.inputTarget - 1,
            outputTarget: edgeConfig.outputTarget - 1
        }))
        this.actives = actives        
    }
    createEdges() {
        const svg = this.querySelector('svg')
        svg.innerHTML = ''; // Clear existing edges
        if (svg) {
            this.actives.forEach((active) => {
                const inputTarget = active.inputTarget;
                const outputTarget = active.outputTarget;
                active.startNode.outputsElement.forEach((_, index) => {
                    if (index === outputTarget && inputTarget < active.endNode.inputsElement.length) {
                        

                        const startRect = active.startNode.outputsElement[active.outputTarget].getBoundingClientRect();
                        const endRect = active.endNode.inputsElement[active.inputTarget].getBoundingClientRect();

                        const startX = (startRect.left - this.translateX) / this.scale;
                        const startY = (startRect.top - this.translateY);
            
                        const endX = (endRect.left - (endRect.width * 2) - this.translateX);
                        const endY = (endRect.top - (endRect.width / 3) -this.translateY);  

                        const elementLine = this.createEdgeElementLine();
                        
                        elementLine.setAttribute("x1", startX.toString());
                        elementLine.setAttribute("y1", startY.toString());
                        elementLine.setAttribute("x2", endX.toString());
                        elementLine.setAttribute("y2", endY.toString());                                                
                        
                        
                        
                        svg.appendChild(elementLine);                        
                    }
                });
            });
        }
        
        

    }
}

    

customElements.define("flow-chart", FlowChart);
