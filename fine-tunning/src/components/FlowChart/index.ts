import { NodeComponent, NodeProps } from "../NodeComponent";
import { EdgesComponent, EdgeProps } from "../EdgesComponent";

export interface FlowChartConfig {
    nodes: NodeProps[];
    edges: { startNodeIndex: number; endNodeIndex: number; inputTarget: number; outputTarget: number; }[];
}

export class FlowChart extends HTMLElement {
    private nodes: NodeComponent[] = [];
    private edgesComponent: EdgesComponent | null = null;
    board: HTMLElement;
    wrapper: HTMLElement;
    scale: number = 1;
    translateX: number = 0;
    translateY: number = 0;
    private isPanning: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private isDraggingNode: boolean = false;

    constructor(config: FlowChartConfig) {
        super();
        this.render();
        this.initializeNodes(config.nodes);
        this.initializeEdges(config.edges);
    }

    private render() {   
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
            .wrapper:active {
                cursor: grabbing;
            }
            .board {
                transform-origin: 0 0;
                width: 100%;
                height: 100%;
                position: relative;
            }
            .grabbing {
                cursor: grabbing;
            }
        </style>
        <div class="wrapper" style="width: 98vw; height: 80vh;">
            <div class="board"></div>
        </div>
        `;        
        
        this.board = this.querySelector('.board') as HTMLDivElement;
        this.wrapper = this.querySelector('.wrapper') as HTMLDivElement;
        this.board.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        this.wrapper.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    private initializeNodes(nodesConfig: NodeProps[]) {
        nodesConfig.forEach(nodeConfig => {
            nodeConfig.flowChart = this;
            const node = new NodeComponent(nodeConfig);
            this.nodes.push(node);
            this.board.appendChild(node);
        });
    }

    private initializeEdges(edgesConfig: FlowChartConfig['edges']) {
        const edgeProps: EdgeProps = {
            actives: edgesConfig.map(edgeConfig => ({
                startNode: this.nodes[edgeConfig.startNodeIndex - 1],
                endNode: this.nodes[edgeConfig.endNodeIndex - 1],
                inputTarget: edgeConfig.inputTarget - 1,
                outputTarget: edgeConfig.outputTarget - 1
            })),
            flowchart: this
        };

        this.edgesComponent = new EdgesComponent(edgeProps);
        this.board.appendChild(this.edgesComponent);
    }

    private onWheel(event: WheelEvent): void {
        event.preventDefault();
    
        const { offsetX, offsetY, deltaY } = event;
        const zoomFactor = 0.05;
        const newScale = this.scale * (deltaY > 0 ? (1 - zoomFactor) : (1 + zoomFactor));

        // Limit the scale to avoid too much zooming in or out
        if (newScale < 0.7 || newScale > 1.5) return;

        // Adjust origin to zoom around the mouse position
        const originDeltaX = offsetX - this.translateX;
        const originDeltaY = offsetY - this.translateY;
        this.translateX -= originDeltaX * (newScale / this.scale - 1);
        this.translateY -= originDeltaY * (newScale / this.scale - 1);

        this.scale = newScale;
        this.updateTransform();

        this.edgesComponent.updateEdgePositions();
    }

    public notifyNodeDragging(isDragging: boolean): void {
        this.isDraggingNode = isDragging;
    }
    
    private onMouseDown(event: MouseEvent): void {
        this.isPanning = true;
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.board.classList.add('grabbing');
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.isPanning || this.isDraggingNode) return;
        const deltaX = event.clientX - this.startX;
        const deltaY = event.clientY - this.startY;
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.translateX += deltaX;
        this.translateY += deltaY;
        this.updateTransform();

        this.edgesComponent.updateEdgePositions();

    }

    private onMouseUp(event: MouseEvent): void {
        this.isPanning = false;
        // this.board.classList.remove('grabbing');
        this.isDraggingNode = false;
    }

    updateTransform() {
        this.board.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        this.wrapper.style.backgroundSize = `translate(${30 * this.scale}px, ${30 * this.scale})`;        
    }

   
}

customElements.define("flow-chart", FlowChart);
