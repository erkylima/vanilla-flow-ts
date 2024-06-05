import { FlowChart } from "../FlowChart";
import { NodeComponent, NodeProps } from "../NodeComponent";

export interface EdgeProps {
    actives: Array<{
        startNode: NodeComponent;
        endNode: NodeComponent;
        inputTarget: number;
        outputTarget: number;
    }>;
    flowchart: FlowChart;
}

interface EdgeExchange {
    elementPath: SVGPathElement;
    elementLine: SVGLineElement;
    element: SVGPathElement | SVGLineElement;
    elementContainer: SVGElement;
}

export class EdgesComponent extends HTMLElement {
    props: EdgeProps;
    private edgeElements: Array<EdgeExchange> = [];
    private markerSize = 6; // Tamanho do marker
    private newEdge: EdgeExchange
    private startNewEdgeContainerX: number
    private startNewEdgeContainerY: number
    private startNewEdgeX: number;
    private startNewEdgeY: number;
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

    private startNewEdge(){
        // Add New Edge Element
        const elementNewEdgePath = this.createEdgeElementPath();
        const elementNewEdgeLine = this.createEdgeElementLine();
        let elementNewEdge: SVGLineElement | SVGPathElement;

        const edgeNewEdgeContainer = document.createElementNS
        ('http://www.w3.org/2000/svg', 'svg');;
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
        `
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

                active.startNode.outputsElement.forEach((_, index) => {
                    if (index === outputTarget && inputTarget < active.endNode.inputsElement.length) {
                        const elementPath = this.createEdgeElementPath();
                        const elementLine = this.createEdgeElementLine();
                        let element: SVGLineElement | SVGPathElement;

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
                    }
                });
            });                       
        }
    }

    calculateOffset(value: number): number {
        return (value * 100) / 200;
    }

    updateEdgePositions() {
        const scale = this.props.flowchart.scale;
        const translateX = this.props.flowchart.translateX;
        const translateY = this.props.flowchart.translateY;

        this.edgeElements.forEach((edgeElement, index) => {
            
            // if (index === this.edgeElements.length-1) {
            //     // alert("s")
            //     return;
            // }
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
    }

    private onMouseMove(event: MouseEvent) {
        event.stopPropagation;
        if (!this.hasNewEdge) return;
        const { clientX, clientY } = event;
        const scale = this.props.flowchart.scale;
        const translateX = this.props.flowchart.translateX;
        const translateY = this.props.flowchart.translateY;        

        // Calcule a largura e a altura do contêiner
        let width = Math.abs(clientX - this.startNewEdgeX);
        let height = Math.abs(clientY - this.startNewEdgeY);

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

        this.newEdge.elementContainer.style.left = `${Math.min(this.startNewEdgeX, clientX) - marginX}px`;
        this.newEdge.elementContainer.style.top = `${Math.min(this.startNewEdgeY, clientY) - marginY}px`;
        this.newEdge.elementContainer.style.width = `${width + 2 * marginX}px`;
        this.newEdge.elementContainer.style.height = `${height + 2 * marginY}px`;

        // Ajuste as coordenadas dos elementos internos
        const adjustedStartX = (this.startNewEdgeX - Math.min(this.startNewEdgeX, clientX) + marginX);
        const adjustedStartY = (this.startNewEdgeY - Math.min(this.startNewEdgeY, clientY) + marginY);
        const adjustedEndX = (clientX - Math.min(this.startNewEdgeX, clientX) + marginX - this.markerSize / scale);
        const adjustedEndY = (clientY - Math.min(this.startNewEdgeY, clientY) + marginY - 8);        
        

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
            edgeElement.setAttribute('d', d);
        }

        this.newEdge.elementContainer.style.display = 'block';
    }

    private onMouseUp(event: MouseEvent) {
        if (this.hasNewEdge) {
            this.hasNewEdge = false;
            this.newEdge.elementContainer.style.display = 'none';
            // this.currentStartNode = null;
            this.currentOutputIndex = -1;
            
        }
    }

    public startNewEdgeFromNode(startNode: NodeComponent, outputIndex: number, ) {
        const startRect = startNode.outputsElement[outputIndex].getBoundingClientRect();
        const startX = (startRect.left + (startRect.width / 2) - this.getBoundingClientRect().left) / this.props.flowchart.scale;
        const startY = (startRect.top + (startRect.height / 2) - this.getBoundingClientRect().top) / this.props.flowchart.scale;

        this.currentStartNode = startNode;
        this.currentOutputIndex = outputIndex;        
        this.hasNewEdge = true;        
        this.newEdge.elementContainer.style.display = 'block';
        this.newEdge.elementContainer.style.left = startX + "px";
        this.newEdge.elementContainer.style.top = startX + "px";

        this.startNewEdgeContainerX = startX;
        this.startNewEdgeContainerY = startY;
        this.startNewEdgeX = startX;
        this.startNewEdgeY = startY;

        if (this.newEdge.element instanceof SVGLineElement) {
            this.newEdge.element.setAttribute("x1", this.startNewEdgeX.toString());
            this.newEdge.element.setAttribute("y1", this.startNewEdgeY.toString());
            this.newEdge.element.setAttribute("x2", startX.toString());
            this.newEdge.element.setAttribute("y2", startY.toString());
        } else if (this.newEdge.element instanceof SVGPathElement) {
            const d = `
                M ${startX} ${startY}
                L ${startX} ${startY}
            `;
            this.newEdge.element.setAttribute('d', d);
        }
    }

    public endNewEdgeAtNode(endNode: NodeComponent, inputIndex: number) {
        if (this.currentStartNode) {
            
            const newEdge = {
                startNode: this.currentStartNode,
                endNode,
                inputTarget: inputIndex,
                outputTarget: this.currentOutputIndex
            }
            const elementPath = this.createEdgeElementPath();
            const elementLine = this.createEdgeElementLine();
            let element: SVGLineElement | SVGPathElement;

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

            this.appendChild(edgeContainer);
            this.edgeElements.push({
                element: element,
                elementContainer: edgeContainer,
                elementPath: elementPath,
                elementLine: elementLine
            });
            this.props.actives.push(newEdge);
            // this.render();
            this.updateEdgePositions();
        }

        this.hasNewEdge = false;
        this.newEdge.elementContainer.style.display = 'none';
        this.currentStartNode = null;
        this.currentOutputIndex = -1;
    }
}

customElements.define("edges-component", EdgesComponent);
