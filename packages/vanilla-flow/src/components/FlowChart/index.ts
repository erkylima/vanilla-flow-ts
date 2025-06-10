import { NodeComponent, NodeProps } from "../NodeComponent/index";
import { EdgesComponent, EdgeProps } from "../EdgesComponent/index";

export interface FlowChartConfig {
    nodes: NodeProps[];
    edges: { startNodeIndex: number; endNodeIndex: number; inputTarget: number; outputTarget: number; edgeIndex?: string; data?: any }[];
    edgeCss?: CSSStyleSheet;
    flowCss?: string;
    cssImports?: string[];
    nodeCss?: string;
    headerCss?: string;
    contentCss?: string;
    onNodeClick?: (node: NodeComponent) => void;
    onEdgeClick?: (edge: { startNodeIndex: number; endNodeIndex: number; inputTarget: number; outputTarget: number; edgeIndex?: string; data?: any }) => void;
}

export class FlowChart extends HTMLElement {
    private readonly nodes: NodeComponent[] = [];
    edgesComponent!: EdgesComponent;
    board!: HTMLElement;
    wrapper!: HTMLElement;
    scale: number = 1;
    translateX: number = 0;
    translateY: number = 0;
    private isPanning: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private isDraggingNode: boolean = false;
    private config: FlowChartConfig;

    public onNodeClick?: (node: NodeComponent) => void;
    public onEdgeClick?: (edge: { startNodeIndex: number; endNodeIndex: number; inputTarget: number; outputTarget: number; edgeIndex?: string; data?: any }) => void;

    // Touch state for panning
    private isTouchPanning: boolean = false;
    private touchStartX: number = 0;
    private touchStartY: number = 0;

    constructor(config: FlowChartConfig) {
        super();
        this.config = config;
        this.onNodeClick = config.onNodeClick;
        this.onEdgeClick = config.onEdgeClick;
        this.render();
        this.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        this.initializeNodes(config.nodes, config.cssImports, config.nodeCss, config.headerCss, config.contentCss);
        this.initializeEdges(config.edges);
        this.attachNodeClickListeners();
        this.attachEdgeClickListeners();
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
                background-size: 30px 30px;
                background-image: radial-gradient(circle, #b8b8b8bf 1px, rgba(0, 0, 0, 0) 1px);
                ${this.config?.flowCss || ''}
            }
            .wrapper:active {
                cursor: grabbing;
            }
            .board {
                width: 100%;
                height: 100%;
                position: relative;
                top: 0;
                left: 0;
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
        this.wrapper.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.wrapper.addEventListener('wheel', this.onMouseWheel.bind(this));

        // Touch events for panning
        this.wrapper.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.wrapper.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.wrapper.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
    }

    private initializeNodes(nodesConfig: NodeProps[], cssImports?: string[], nodeCss?: string, headerCss?: string, contentCss?: string) {
        cssImports?.forEach(cssImport => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssImport;
            document.head.appendChild(link);
        });
        nodesConfig.forEach(nodeConfig => {
            nodeConfig.flowChart = this;
            nodeConfig.cssImports = cssImports;
            nodeConfig.nodeCss = nodeConfig.nodeCss ? nodeConfig.nodeCss : nodeCss;
            nodeConfig.headerCss = headerCss;
            nodeConfig.contentCss = contentCss;
            const node = new NodeComponent(nodeConfig);
            this.nodes.push(node);
            this.board?.appendChild(node);

            // Touch events for node dragging
            node.addEventListener('touchstart', (e: TouchEvent) => {
                if (e.touches.length === 1) {
                    e.stopPropagation();
                    this.isDraggingNode = true;
                    node.dispatchEvent(new CustomEvent('dragstart', { bubbles: true }));
                    node.__touchDragStartX = e.touches[0].clientX;
                    node.__touchDragStartY = e.touches[0].clientY;
                    node.__origX = node.props.x;
                    node.__origY = node.props.y;
                }
            }, { passive: false });

            node.addEventListener('touchmove', (e: TouchEvent) => {
                if (this.isDraggingNode && e.touches.length === 1) {
                    e.preventDefault();
                    e.stopPropagation();
                    const dx = e.touches[0].clientX - node.__touchDragStartX;
                    const dy = e.touches[0].clientY - node.__touchDragStartY;
                    node.setPosition(node.__origX + dx / this.scale, node.__origY + dy / this.scale);
                    this.edgesComponent?.updateEdgePositions();
                }
            }, { passive: false });

            node.addEventListener('touchend', (e: TouchEvent) => {
                if (this.isDraggingNode) {
                    e.stopPropagation();
                    this.isDraggingNode = false;
                    node.dispatchEvent(new CustomEvent('dragend', { bubbles: true }));
                }
            }, { passive: false });
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
        this.board?.appendChild(this.edgesComponent);
    }

    public notifyNodeDragging(isDragging: boolean): void {
        this.isDraggingNode = isDragging;
    }

    private onMouseWheel(event: WheelEvent): void {
        event.preventDefault();

        const { offsetX, offsetY, deltaY } = event;
        const zoomFactor = 0.1;
        const newScale = this.scale * (deltaY > 0 ? (1 - zoomFactor) : (1 + zoomFactor));

        if (newScale < 0.1 || newScale > 3) return;

        const originDeltaX = offsetX - this.translateX;
        const originDeltaY = offsetY - this.translateY;

        this.translateX -= originDeltaX * (newScale / this.scale - 1);
        this.translateY -= originDeltaY * (newScale / this.scale - 1);

        this.scale = newScale;

        this.updateTransform();
    }

    private onMouseDown(event: MouseEvent): void {
        if (event.button !== 2) return;

        this.isPanning = true;
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.board?.classList.add('grabbing');
        event.stopPropagation();
    }

    private onMouseMove(event: MouseEvent): void {
        if (!this.isPanning || this.isDraggingNode) return;
        event.preventDefault();
        const deltaX = event.clientX - this.startX;
        const deltaY = event.clientY - this.startY;
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.translateX += deltaX;
        this.translateY += deltaY;

        this.updateTransform();
    }

    private onMouseUp(event: MouseEvent): void {
        this.isPanning = false;
        this.board?.classList.remove('grabbing');
        this.isDraggingNode = false;
    }

    private onTouchStart(event: TouchEvent): void {
        if (event.touches.length === 2) {
            return;
        }
        if (event.touches.length === 1) {
            this.isTouchPanning = true;
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
            this.board?.classList.add('grabbing');
            event.stopPropagation();
        }
    }

    private onTouchMove(event: TouchEvent): void {
        if (!this.isTouchPanning || this.isDraggingNode || event.touches.length !== 1) return;
        event.preventDefault();
        const deltaX = event.touches[0].clientX - this.touchStartX;
        const deltaY = event.touches[0].clientY - this.touchStartY;
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;

        this.translateX += deltaX;
        this.translateY += deltaY;

        this.updateTransform();
    }

    private onTouchEnd(event: TouchEvent): void {
        this.isTouchPanning = false;
        this.board?.classList.remove('grabbing');
        this.isDraggingNode = false;
    }

    updateTransform() {
        this.board.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        this.wrapper.style.backgroundPositionX = this.translateX + "px";
        this.wrapper.style.backgroundPositionY = this.translateY + "px";
        this.nodes.forEach(node => { node.setPosition(node.props.x, node.props.y); });
    }

    public addNode(nodeProps: NodeProps): void {
        nodeProps.flowChart = this;
        const node = new NodeComponent(nodeProps);
        node.props.id = this.nodes.length + 1;
        node.props.flowChart = this;
        this.nodes.push(node);
        this.board.appendChild(node);
        this.edgesComponent?.updateEdgePositions();
        this.attachNodeClickListeners();
    }

    public getConfig(): FlowChartConfig {
        return this.config;
    }

    public getNodeElements(): HTMLElement[] {
        return this.nodes;
    }

    public getEdgeElements(): HTMLElement[] {
        if (!this.edgesComponent) return [];
        // @ts-ignore
        return this.edgesComponent.edgeElements.map(e => e.elementContainer);
    }

    private attachNodeClickListeners() {
        this.nodes.forEach((node, idx) => {
            node.ondblclick = (e: MouseEvent) => {
                e.stopPropagation();
                if (this.onNodeClick) {
                    this.onNodeClick(node);
                }
            };
        });
    }

    private attachEdgeClickListeners() {
        if (!this.edgesComponent) return;
        // @ts-ignore
        this.edgesComponent.edgeElements.forEach((edgeElement, idx) => {
            edgeElement.elementContainer.onclick = (e: MouseEvent) => {
                e.stopPropagation();
                if (this.onEdgeClick) {
                    const edgeConfig = this.config.edges[idx];
                    this.onEdgeClick(edgeConfig);
                }
            };
        });
    }
}

customElements.define("flow-chart", FlowChart);
