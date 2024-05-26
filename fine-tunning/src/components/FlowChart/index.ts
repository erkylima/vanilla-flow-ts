import { NodeComponent, NodeProps } from "../NodeComponent";
import { EdgesComponent, EdgeProps } from "../EdgesComponent";

export interface FlowChartConfig {
    nodes: NodeProps[];
    edges: { startNodeIndex: number; endNodeIndex: number; inputTarget: number; outputTarget: number; }[];
}

export class FlowChart extends HTMLElement {
    private nodes: NodeComponent[] = [];
    private edgesComponent: EdgesComponent | null = null;
    private scale: number = 1;

    private minScale: number = 0.5;
    private maxScale: number = 15;
    private originX: number = 0;
    private originY: number = 0;
    private board: HTMLElement;

    private isDragging: boolean = false;
    private nodeDragging: boolean = false;

    private lastMouseX: number = 0;
    private lastMouseY: number = 0;
    private dragThreshold: number = 5;

    constructor(config: FlowChartConfig) {
        super();
        this.render();
        this.initializeNodes(config.nodes);
        this.initializeEdges(config.edges);
        this.addEventListeners();

    }

    render() {
        this.innerHTML = `
        <style>
            .wrapper {
                position: fixed;
                width: 100vw;
                height: 100vh;
                top: 0px;
                left: 0px;
                overflow: scroll;
            }
            
            .board {
                position: relative;
                width: 100vw;
                height: 100vh;
                background-size: 30px 30px;
                background-image: radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px);
                cursor: grab;
            }        
        </style>
        <div class="wrapper">
            <div class="board">
                
            </div>
        </div>
        </div>
        `;
        this.board = this.querySelector('.board') as HTMLElement;
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
        this.appendChild(this.edgesComponent);
    } 
    
    private addEventListeners() {
        this.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        this.board.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.board.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.board.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.board.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // Adicione o evento 'mousedown' para os nós
        this.nodes.forEach(node => {
            node.addEventListener('mousedown', this.handleNodeMouseDown.bind(this, node));
        });
    }

    private handleNodeMouseDown(node: NodeComponent, event: MouseEvent) {
        event.stopPropagation(); // Impede que o evento 'mousedown' do board seja acionado
        this.nodeDragging = true;
        node.startDragging(event); // Chama o método handleMouseDown do nó
    }    
    
    private handleMouseDown(event: MouseEvent) {
        if (!this.nodeDragging) {
            event.preventDefault();
            this.isDragging = true;
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            this.board.style.cursor = 'grabbing';
        }
    }

    private handleWheel(event: WheelEvent) {
        event.preventDefault();
        const { offsetX, offsetY, deltaY } = event;
        const scaleChange = deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * scaleChange));

        if (newScale !== this.scale) {
            const rect = this.board.getBoundingClientRect();
            const mouseX = offsetX - rect.left;
            const mouseY = offsetY - rect.top;
            const dx = mouseX / this.scale;
            const dy = mouseY / this.scale;

            this.originX = this.originX - dx + (dx * newScale / this.scale);
            this.originY = this.originY - dy + (dy * newScale / this.scale);
            this.scale = newScale;

            this.updateTransform();
            this.edgesComponent.updateEdgePositions();
        }
    }


    private handleMouseMove(event: MouseEvent) {
        if (this.isDragging && !this.nodeDragging) {
            event.preventDefault();
            const deltaX = event.clientX - this.lastMouseX;
            const deltaY = event.clientY - this.lastMouseY;
            if (Math.abs(deltaX) > this.dragThreshold || Math.abs(deltaY) > this.dragThreshold) {
                this.originX += deltaX / this.scale;
                this.originY += deltaY / this.scale;
                this.lastMouseX = event.clientX;
                this.lastMouseY = event.clientY;
                this.updateTransform();
                this.edgesComponent.updateEdgePositions();
            }
        }
    }
    

    private handleMouseUp(event: MouseEvent) {
        event.preventDefault();
        this.isDragging = false;
        this.nodeDragging = false;
        this.board.style.cursor = 'grab';
    }

    private updateTransform() {
        this.board.style.transform = `scale(${this.scale}) translate(${this.originX}px, ${this.originY}px)`;
    }
}

customElements.define("flow-chart", FlowChart);