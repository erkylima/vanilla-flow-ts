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
    private props: EdgeProps;
    private edgeElements: Array<EdgeExchange> = [];
    private markerSize = 6; // Tamanho do marker

    constructor(props: EdgeProps) {
        super();
        this.props = props;
        this.render();
        this.updateEdgePositions();
        this.startListening();
    }

    connectedCallback() {
        this.updateEdgePositions();
    }

    private createEdgeElementPath(): SVGPathElement {
        const edge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        edge.setAttribute("class", "edge");
        edge.setAttribute("marker-end", "url(#arrow)");
        return edge;
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

    private calculateOffset(value: number): number {
        return (value * 100) / 200;
    }

    updateEdgePositions() {
        const scale = this.props.flowchart.scale;
        const translateX = this.props.flowchart.translateX;
        const translateY = this.props.flowchart.translateY;

        this.edgeElements.forEach((edgeElement, index) => {
            const activeIndex = index;
            const active = this.props.actives[activeIndex];
            if (active.outputTarget < active.startNode.outputsElement.length && active.inputTarget < active.endNode.inputsElement.length) {
                const startRect = active.startNode.outputsElement[active.outputTarget].getBoundingClientRect();
                const endRect = active.endNode.inputsElement[active.inputTarget].getBoundingClientRect();

                const startX = (startRect.left + (startRect.width) - this.getBoundingClientRect().left) / scale;
                const startY = (startRect.top + (startRect.height / 2) - this.getBoundingClientRect().top) / scale;

                const endX = (endRect.left - this.getBoundingClientRect().left - (endRect.width)) / scale;
                const endY = (endRect.top + (endRect.height / 2) - this.getBoundingClientRect().top) / scale;

                const elementContainer = edgeElement.elementContainer;

                // Calcule a largura e a altura do contêiner
                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);

                elementContainer.style.left = `${Math.min(startX, endX  )}px`;
                elementContainer.style.top = `${Math.min(startY, endY)}px`;
                elementContainer.style.width = `${width + 20}px`;
                elementContainer.style.height = `${height + 20}px`;

                if (startY > endY - 50 && startY < endY + 50) {
                    edgeElement.elementLine.setAttribute("x1", (startX - Math.min(startX, endX)).toString());
                    edgeElement.elementLine.setAttribute("y1", (startY - Math.min(startY, endY)).toString());
                    edgeElement.elementLine.setAttribute("x2", (endX - Math.min(startX, endX) - this.markerSize / scale).toString());
                    edgeElement.elementLine.setAttribute("y2", (endY - Math.min(startY, endY)).toString());
                    edgeElement.elementContainer.removeChild(edgeElement.element);
                    edgeElement.element = edgeElement.elementLine
                    edgeElement.elementContainer.appendChild(edgeElement.element);
                } else {
                    edgeElement.elementPath.setAttribute('d', `
                        M ${(startX - Math.min(startX, endX))} ${(startY - Math.min(startY, endY))} C ${
                        (startX - Math.min(startX, endX)) + this.calculateOffset(Math.abs(endX - startX))
                    } ${(startY - Math.min(startY, endY))}, ${(endX - Math.min(startX, endX) - this.markerSize / scale) - this.calculateOffset(Math.abs(endX - startX))} ${
                        (endY - Math.min(startY, endY))
                    }, ${(endX - Math.min(startX, endX) - this.markerSize / scale)} ${(endY - Math.min(startY, endY))}
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
}

customElements.define("edge-component", EdgesComponent);
