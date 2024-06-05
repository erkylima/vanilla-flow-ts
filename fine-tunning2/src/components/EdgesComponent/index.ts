import { FlowChart } from "../FlowChart";
import { NodeComponent } from "../NodeComponent";

export interface EdgeProps {
    actives: Array<{
        startNode: NodeComponent;
        endNode: NodeComponent;
        inputTarget: number;
        outputTarget: number;
    }>;
    flowchart: FlowChart;
    svg: Element;
}

interface EdgeExchange {
    element: SVGPathElement | SVGLineElement
    elementPath: SVGPathElement;
    elementLine: SVGLineElement;
}

export class EdgesComponent extends HTMLElement {
    private props: EdgeProps;
    private edgeElements: Array<EdgeExchange> = [];    

    constructor(props: EdgeProps) {
        super();
        this.props = props;
        this.render();
        this.updateEdgePositions();
        // this.startListening();
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
            .main {
                pointer-events: none;
                position: absolute;
                width: 1000px;
                height: 800px;
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
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg"  class="main">
            <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"                
                fill="rgba(168, 168, 168, 0.8)"
                orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
        </svg>
        `
        const svgContainer = this.props.svg
        
        if (svgContainer) {
            this.props.actives.forEach((active) => {
                const inputTarget = active.inputTarget;
                const outputTarget = active.outputTarget;

                active.startNode.outputsElement.forEach((_, index) => {                    
                    
                    if (index === outputTarget && inputTarget < active.endNode.inputsElement.length) {
                        const startRect = active.startNode.outputsElement[outputTarget].getBoundingClientRect();
                        const endRect = active.endNode.inputsElement[inputTarget].getBoundingClientRect();    
                        
                        const startY = (startRect.top + startRect.height / 2);    
                        const endY = (endRect.top + endRect.height / 2);    
                        const elementPath = this.createEdgeElementPath();
                        const elementLine = this.createEdgeElementLine();
                        let element: SVGLineElement | SVGPathElement;
                        
                        if (startY > endY - 50 && startY < endY + 50) {
                            element = elementLine;
                        } else {
                            element = elementPath;
                        }
                        
                        svgContainer.appendChild(element);
                        this.edgeElements.push({
                            element,
                            elementPath,
                            elementLine
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
                
                const startX = startRect.x;
                const startY = startRect.y;
    
                const endX = endRect.left - (endRect.width * 2);
                const endY = endRect.top - (endRect.width / 3);
    
                const svgContainer = this.props.svg;
                if (svgContainer) {
                    svgContainer.removeChild(edgeElement.element);
                }
    
                edgeElement.elementLine.setAttribute("x1", startX.toString());
                edgeElement.elementLine.setAttribute("y1", startY.toString());
                edgeElement.elementLine.setAttribute("x2", endX.toString());
                edgeElement.elementLine.setAttribute("y2", endY.toString());
                edgeElement.element = edgeElement.elementLine;
                
    
                if (svgContainer) {
                    svgContainer.append(edgeElement.element);
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