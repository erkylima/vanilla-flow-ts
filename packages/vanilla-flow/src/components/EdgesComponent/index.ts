import { FlowChart } from "../FlowChart/index";
import { NodeComponent } from "../NodeComponent/index";

export interface EdgeProps {
    actives: Array<Edge>;
    flowchart: FlowChart;
}

interface Edge {
    startNode: NodeComponent;
    endNode: NodeComponent;
    inputTarget: number;
    outputTarget: number;
    edgeIndex?: string;
}

interface EdgeExchange {
    elementPath: SVGPathElement;
    elementLine: SVGLineElement;
    element: SVGPathElement | SVGLineElement;
    elementContainer: SVGElement;
}

export class EdgesComponent extends HTMLElement {
    props: EdgeProps;
    private readonly edgeElements: Array<EdgeExchange> = [];
    private readonly markerSize = 8; // Tamanho do marker
    private newEdge!: EdgeExchange;    
    private startNewEdgeX!: number;
    private startNewEdgeY!: number;
    private nodesObserver!: MutationObserver;
    hasNewEdge: boolean = false;
    private currentOutputIndex: number = -1;
    private currentStartNode: NodeComponent | null = null;

    constructor(props: EdgeProps) {
        super();
        this.props = props;
        this.render();
        this.startNewEdge();
        this.updateEdgePositions();
        this.startListening();

        // Adiciona eventos globais para mover e soltar a aresta
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    connectedCallback() {
        this.updateEdgePositions();
    }

    private createEdgeIndex(startNode: NodeComponent, outputIndex: number, endNode: NodeComponent, inputIndex: number): string {
        return `${startNode.id}-${outputIndex}-${endNode.id}-${inputIndex}`;
    }

    private startNewEdge(){
        // Add New Edge Element
        const elementNewEdgePath = this.createEdgeElementPath();
        const elementNewEdgeLine = this.createEdgeElementLine();
        let elementNewEdge!: SVGLineElement | SVGPathElement;

        const edgeNewEdgeContainer = document.createElementNS
        ('http://www.w3.org/2000/svg', 'svg');
        edgeNewEdgeContainer.setAttribute('xmlns', "http://www.w3.org/2000/svg");
        edgeNewEdgeContainer.setAttribute('version', '1.1');
        edgeNewEdgeContainer.innerHTML = `
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="${this.markerSize}"
            markerHeight="${this.markerSize}"                
            fill="rgba(168, 168, 168, 0.8)"
            orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        `;
        edgeNewEdgeContainer.setAttribute('class', 'edge-container new-edge');

        if (elementNewEdgePath) {
            edgeNewEdgeContainer.appendChild(elementNewEdgePath);
            elementNewEdge = elementNewEdgePath;
        }
        if (elementNewEdgeLine) {
            edgeNewEdgeContainer.appendChild(elementNewEdgeLine);
            elementNewEdge = elementNewEdgeLine;
        }
        edgeNewEdgeContainer.style.display = 'none';
        this.newEdge = {
            element: elementNewEdge,
            elementContainer: edgeNewEdgeContainer,
            elementPath: elementNewEdgePath,
            elementLine: elementNewEdgeLine
        }
        this.append(edgeNewEdgeContainer);
    }
    

    createEdgeElementPath(): SVGPathElement {
        const edge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        edge.setAttribute("class", "edge");
        edge.setAttribute("marker-end", "url(#arrow)");
        return edge;
    }

    createEdgeElementLine(): SVGLineElement {
        const edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
        edge.setAttribute("class", "edge");
        edge.setAttribute("stroke", "rgba(168, 168, 168, 0.8)");
        edge.setAttribute("stroke-width", "2");
        edge.setAttribute("fill", "transparent");
        edge.setAttribute("marker-end", "url(#arrow)");
        return edge;
    }

    private render() {
        this.innerHTML = `
        <style>
            .edge-container {
                position: absolute;
                pointer-events: none;
            }
            .edge {
                pointer-events: all;
                stroke: rgba(168, 168, 168, 0.8);
                stroke-width: 2;
                fill: transparent;
                cursor: pointer;
            }
            .edgeSelected {
                stroke: rgba(168, 168, 168, 1);
                stroke-width: 3;
                fill: transparent;
                z-index: 100;
            }
        </style>
        `;

        const svgContainer = this;

        if (svgContainer) {
            this.props.actives.forEach((active) => {
                const inputTarget = active.inputTarget;
                const outputTarget = active.outputTarget;

                if (!active.edgeIndex) {
                    active.edgeIndex = this.createEdgeIndex(active.startNode, active.outputTarget, active.endNode, active.inputTarget);
                }

                active.startNode.outputsElement.forEach((_, index) => {
                    if (index === outputTarget && inputTarget < active.endNode.inputsElement.length) {
                        const elementPath = this.createEdgeElementPath();
                        const elementLine = this.createEdgeElementLine();
                        let element!: SVGLineElement | SVGPathElement;

                        const edgeContainer = document.createElementNS
                        ('http://www.w3.org/2000/svg', 'svg');;
                        edgeContainer.setAttribute('xmlns', "http://www.w3.org/2000/svg");
                        edgeContainer.setAttribute('version', '1.1');
                        edgeContainer.innerHTML = `
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                            markerWidth="${this.markerSize}"
                            markerHeight="${this.markerSize}"                
                            fill="rgba(168, 168, 168, 0.8)"
                            orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" />
                        </marker>
                        `
                        edgeContainer.classList.add('edge-container');

                        if (elementPath) {
                            edgeContainer.appendChild(elementPath);
                            element = elementPath;
                        }
                        if (elementLine) {
                            edgeContainer.appendChild(elementLine);
                            element = elementLine;
                        }

                        svgContainer.appendChild(edgeContainer);
                        this.edgeElements.push({
                            element: element,
                            elementContainer: edgeContainer,
                            elementPath: elementPath,
                            elementLine: elementLine
                        });
                        edgeContainer.addEventListener('dblclick', () => {
                            this.removeEdge(active.edgeIndex!);
                        });
                    }
                    
                });
            });                       
        }
    }

    private removeEdge(edgeIndex: string) {
        const edgeIndexToRemove = this.props.actives.findIndex(active => active.edgeIndex === edgeIndex);
        if (edgeIndexToRemove !== -1) {
            const edgeElement = this.edgeElements[edgeIndexToRemove];
            edgeElement.elementContainer.remove();
            this.edgeElements.splice(edgeIndexToRemove, 1);
            this.props.actives.splice(edgeIndexToRemove, 1);
            this.props.flowchart.getConfig().edges.splice(edgeIndexToRemove, 1);
        }
    }

    calculateOffset(value: number): number {
        return (value * 100) / 200;
    }

    updateEdgePositions() {
        const scale = this.props.flowchart.scale;


        this.edgeElements.forEach((edgeElement, index) => {
        
            const activeIndex = index;
            const active = this.props.actives[activeIndex];
            if (active.outputTarget < active.startNode.outputsElement.length && active.inputTarget < active.endNode.inputsElement.length) {
                const startRect = active.startNode.outputsElement[active.outputTarget].getBoundingClientRect();
                const endRect = active.endNode.inputsElement[active.inputTarget].getBoundingClientRect();

                const startX = (startRect.left + (startRect.width / 2) - this.getBoundingClientRect().left) / scale;
                const startY = (startRect.top + (startRect.height / 2) - this.getBoundingClientRect().top) / scale;

                const endX = (endRect.left - this.getBoundingClientRect().left) / scale;
                const endY = (endRect.top + (endRect.height / 2) - this.getBoundingClientRect().top) / scale;

                const elementContainer = edgeElement.elementContainer;

                // Calcule a largura e a altura do contêiner
                let width = Math.abs(endX - startX);
                let height = Math.abs(endY - startY);

                // Ajuste a altura mínima do contêiner para a altura do marker
                const minHeight = this.markerSize + 40;
                if (height < minHeight) {
                    height = minHeight;
                }

                const minWidth = this.markerSize + 40;
                if (width < minWidth) {
                    width = minWidth;
                }


                // Calcule as margens de 50% a mais do elementContainer
                const marginX = width * 0.50;
                const marginY = height * 0.50;

                elementContainer.style.left = `${Math.min(startX, endX) - marginX}px`;
                elementContainer.style.top = `${Math.min(startY, endY) - marginY}px`;
                elementContainer.style.width = `${width + 2 * marginX}px`;
                elementContainer.style.height = `${height + 2 * marginY}px`;

                // Ajuste as coordenadas dos elementos internos
                const adjustedStartX = (startX - Math.min(startX, endX) + marginX);
                const adjustedStartY = (startY - Math.min(startY, endY) + marginY);
                const adjustedEndX = (endX - Math.min(startX, endX) + marginX - this.markerSize / scale);
                const adjustedEndY = (endY - Math.min(startY, endY) + marginY);

                if (startY > endY - 50 && startY < endY + 50) {
                    edgeElement.elementLine.setAttribute("x1", adjustedStartX.toString());
                    edgeElement.elementLine.setAttribute("y1", adjustedStartY.toString());
                    edgeElement.elementLine.setAttribute("x2", adjustedEndX.toString());
                    edgeElement.elementLine.setAttribute("y2", adjustedEndY.toString());
                    edgeElement.elementContainer.removeChild(edgeElement.element);
                    edgeElement.element = edgeElement.elementLine
                    edgeElement.elementContainer.appendChild(edgeElement.element);
                } else {
                    edgeElement.elementPath.setAttribute('d', `
                        M ${adjustedStartX} ${adjustedStartY} 
                        C ${adjustedStartX + this.calculateOffset(Math.abs(endX - startX))} ${adjustedStartY}, 
                        ${adjustedEndX - this.calculateOffset(Math.abs(endX - startX))} ${adjustedEndY}, 
                        ${adjustedEndX} ${adjustedEndY}
                    `);
                    edgeElement.elementContainer.removeChild(edgeElement.element)
                    edgeElement.element = edgeElement.elementPath
                    edgeElement.elementContainer.appendChild(edgeElement.element);
                }
            }
        });
    }

    private startListening() {
        const observer = new MutationObserver(() => {
            this.updateEdgePositions();
        });
        
        this.props.actives.forEach(active => {
            observer.observe(active.startNode, { attributes: true });
            observer.observe(active.endNode, { attributes: true });
        });
        this.nodesObserver = observer;
    }

    private onMouseMove(event: MouseEvent) {
        event.stopPropagation();
        if (!this.hasNewEdge) return;
    
        const { clientX, clientY } = event;
        const scale = this.props.flowchart.scale;
    
        // Obter a posição do EdgesComponent em relação à tela
        const rect = this.getBoundingClientRect();
    
        // Converter as coordenadas do mouse para o espaço do FlowChart (sem translate, como em updateEdgePositions)
        const endX = (clientX - rect.left) / scale;
        const endY = (clientY - rect.top) / scale;
    
        const startX = this.startNewEdgeX;
        const startY = this.startNewEdgeY;
    
        // Calcular a largura e altura do contêiner (sem scale, como em updateEdgePositions)
        let width = Math.abs(endX - startX);
        let height = Math.abs(endY - startY);
    
        // Definir dimensões mínimas
        const minSize = this.markerSize + 40;
        width = Math.max(width, minSize);
        height = Math.max(height, minSize);
    
        // Calcular margens (50% a mais)
        const marginX = width * 0.5;
        const marginY = height * 0.5;
    
        // Posicionar o contêiner SVG (sem scale no cálculo de posição, apenas nas dimensões)
        this.newEdge.elementContainer.style.left = `${Math.min(startX, endX) - marginX}px`;
        this.newEdge.elementContainer.style.top = `${Math.min(startY, endY) - marginY}px`;
        this.newEdge.elementContainer.style.width = `${width + 2 * marginX}px`;
        this.newEdge.elementContainer.style.height = `${height + 2 * marginY}px`;
    
        // Ajustar as coordenadas internas relativas ao contêiner SVG (sem scale adicional)
        const adjustedStartX = startX - Math.min(startX, endX) + marginX;
        const adjustedStartY = startY - Math.min(startY, endY) + marginY;
        const adjustedEndX = endX - Math.min(startX, endX) + marginX;
        const adjustedEndY = endY - Math.min(startY, endY) + marginY;
    
        const edgeElement = this.newEdge.element;
    
        if (edgeElement instanceof SVGLineElement) {
            edgeElement.setAttribute("x1", adjustedStartX.toString());
            edgeElement.setAttribute("y1", adjustedStartY.toString());
            edgeElement.setAttribute("x2", adjustedEndX.toString());
            edgeElement.setAttribute("y2", adjustedEndY.toString());
        } else if (edgeElement instanceof SVGPathElement) {
            const d = `
                M ${adjustedStartX} ${adjustedStartY}
                L ${adjustedEndX} ${adjustedEndY}
            `;
            edgeElement.setAttribute("d", d);
        }
    
        this.newEdge.elementContainer.style.display = "block";
    }

    private onMouseUp(event: MouseEvent) {
        if (this.hasNewEdge) {
            this.hasNewEdge = false;
            this.newEdge.elementContainer.style.display = 'none';
            this.currentStartNode = null;
            this.currentOutputIndex = -1;
            
        }
    }

    public startNewEdgeFromNode(startNode: NodeComponent, outputIndex: number) {
        const startRect = startNode.outputsElement[outputIndex].getBoundingClientRect();
        const containerRect = this.getBoundingClientRect();
        const scale = this.props.flowchart.scale;
    
        // Calcular a posição inicial no espaço do FlowChart (sem translate, como em updateEdgePositions)
        const startX = (startRect.left + startRect.width / 2 - containerRect.left) / scale;
        const startY = (startRect.top + startRect.height / 2 - containerRect.top) / scale;
    
        this.currentStartNode = startNode;
        this.currentOutputIndex = outputIndex;
        this.hasNewEdge = true;
        this.newEdge.elementContainer.style.display = "block";
    
        // Definir a posição inicial
        this.startNewEdgeX = startX;
        this.startNewEdgeY = startY;
    
        // Configurar o container SVG com tamanho mínimo inicial (como em updateEdgePositions)
        const minSize = this.markerSize + 40;
        const marginX = minSize * 0.5;
        const marginY = minSize * 0.5;
    
        this.newEdge.elementContainer.style.left = `${startX - marginX}px`;
        this.newEdge.elementContainer.style.top = `${startY - marginY}px`;
        this.newEdge.elementContainer.style.width = `${minSize + 2 * marginX}px`;
        this.newEdge.elementContainer.style.height = `${minSize + 2 * marginY}px`;
    
        // Coordenadas internas relativas ao container (ajustadas como em updateEdgePositions)
        const adjustedStartX = marginX; // Centro do container inicialmente
        const adjustedStartY = marginY;
    
        if (this.newEdge.element instanceof SVGLineElement) {
            this.newEdge.element.setAttribute("x1", adjustedStartX.toString());
            this.newEdge.element.setAttribute("y1", adjustedStartY.toString());
            this.newEdge.element.setAttribute("x2", adjustedStartX.toString());
            this.newEdge.element.setAttribute("y2", adjustedStartY.toString());
        } else if (this.newEdge.element instanceof SVGPathElement) {
            const d = `M ${adjustedStartX} ${adjustedStartY} L ${adjustedStartX} ${adjustedStartY}`;
            this.newEdge.element.setAttribute("d", d);
        }
    }

    public endNewEdgeAtNode(endNode: NodeComponent, inputIndex: number) {
        const existsEdge = this.props.actives.some(active => active.endNode === endNode && active.inputTarget === inputIndex && active.outputTarget === this.currentOutputIndex && active.startNode === this.currentStartNode);
        
        if (this.currentStartNode != endNode && !existsEdge) {

            const newEdge: Edge = {
                startNode: this.currentStartNode!,
                endNode,
                inputTarget: inputIndex,
                outputTarget: this.currentOutputIndex,
                edgeIndex: this.createEdgeIndex(this.currentStartNode!, this.currentOutputIndex, endNode, inputIndex)
            };
            const elementPath = this.createEdgeElementPath();
            const elementLine = this.createEdgeElementLine();
            let element!: SVGLineElement | SVGPathElement;

            const edgeContainer = document.createElementNS
            ('http://www.w3.org/2000/svg', 'svg');
            edgeContainer.setAttribute('xmlns', "http://www.w3.org/2000/svg");
            edgeContainer.setAttribute('version', '1.1');
            edgeContainer.innerHTML = `
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                markerWidth="${this.markerSize}"
                markerHeight="${this.markerSize}"                
                fill="rgba(168, 168, 168, 0.8)"
                orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            `;
            edgeContainer.classList.add('edge-container');

            if (elementPath) {
                edgeContainer.appendChild(elementPath);
                element = elementPath;
            }
            if (elementLine) {
                edgeContainer.appendChild(elementLine);
                element = elementLine;
            }

            this.appendChild(edgeContainer);
            this.edgeElements.push({
                element: element,
                elementContainer: edgeContainer,
                elementPath: elementPath,
                elementLine: elementLine
            });
            
            edgeContainer.addEventListener('dblclick', () => {
                this.removeEdge(newEdge.edgeIndex!);
            });
            this.props.actives.push(newEdge);
            
            this.updateEdgePositions();
            this.nodesObserver.observe(this.currentStartNode!, { attributes: true });
            this.nodesObserver.observe(endNode, { attributes: true });
        }        
        this.hasNewEdge = false;
        this.newEdge.elementContainer.style.display = 'none';
        this.currentStartNode = null;
        this.currentOutputIndex = -1;
    }
}

customElements.define("edges-component", EdgesComponent);
