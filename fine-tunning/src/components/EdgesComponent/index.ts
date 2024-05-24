import { NodeComponent } from "../NodeComponent";

export interface EdgeProps {
    startNode: NodeComponent;
    endNode: NodeComponent;
}

export class EdgeComponent extends HTMLElement {
    private props: EdgeProps;
    private edgeElement: SVGPathElement | SVGLineElement;
    private edgeElementPath: SVGPathElement;
    private edgeElementLine: SVGLineElement;
    constructor(props: EdgeProps) {
        super();
        this.props = props;
        this.edgeElementPath = this.createEdgeElementPath();
        this.edgeElementLine = this.createEdgeElementLine();
        this.edgeElement = this.edgeElementLine
        this.render();
        this.updateEdgePosition();
        this.startListening();
    }

    private createEdgeElementPath(): SVGPathElement {
        const edge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        edge.setAttribute("class", "edge")
        edge.setAttribute("marker-end", "url(#arrow)")

        return edge;
    }

    private createEdgeElementLine(): SVGLineElement {
        const edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
        edge.setAttribute("class", "edge");
        edge.setAttribute("stroke", "rgba(168, 168, 168, 0.8)");
        edge.setAttribute("stroke-width", "2");
        edge.setAttribute("fill", "transparent");
        edge.setAttribute("marker-end", "url(#arrow)")
        return edge;
    }
    private render() {
        this.innerHTML = `
        <style>
            .main {
                pointer-events: none;
                position: absolute;
                top: 0;
                width: 100%;
                height: 100%;
            }
            
            .delete {
                pointer-events: all;
            }
            
            .icon {
                width: 100px;
                height: 100px;
                background-color: white;
                fill: white;
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
            
            .edgeNew {
                stroke: rgba(168, 168, 168, 0.4);
                stroke-width: 2;
                fill: transparent;
            }
        
        </style>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="100%" height="100vh" class="main">
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
        const svgContainer = this.querySelector("svg");

        if (svgContainer) {
            svgContainer.appendChild(this.edgeElement);
        }
    }
    private calculateOffset(value: number): number {
        return (value * 100) / 200;
    }

    private updateEdgePosition() {
        const startRect = this.props.startNode.outputsElement[0].getBoundingClientRect();
        const endRect = this.props.endNode.inputsElement[0].getBoundingClientRect();

        const startX = (startRect.left + startRect.width / 2) - 4;
        const startY = (startRect.top + startRect.height / 2);

        const endX = (endRect.left + endRect.width / 2) - 16;
        const endY = (endRect.top + endRect.height / 2);

        if (startY > endY - 50 && startY < endY + 50) {
            this.edgeElementLine.setAttribute("x1", startX.toString());
            this.edgeElementLine.setAttribute("y1", startY.toString());
            this.edgeElementLine.setAttribute("x2", endX.toString());
            this.edgeElementLine.setAttribute("y2", endY.toString());            
            if (this.edgeElement != this.edgeElementLine) {
                const svgContainer = this.querySelector("svg");

                if (svgContainer) {
                    svgContainer.removeChild(this.edgeElement);
                }
                this.edgeElement = this.edgeElementLine                
                if (svgContainer) {
                    svgContainer.appendChild(this.edgeElement);
                }
            }
        } else {
            this.edgeElementPath.setAttribute('d',`
                M ${startX} ${startY} C ${
                    startX + this.calculateOffset(Math.abs(endX - startX))
                } ${startY}, ${endX - this.calculateOffset(Math.abs(endX - startX))} ${
                    endY
                }, ${endX} ${endY}
            `);
            if (this.edgeElement != this.edgeElementPath) {
                const svgContainer = this.querySelector("svg");

                if (svgContainer) {
                    svgContainer.removeChild(this.edgeElement);
                }
                this.edgeElement = this.edgeElementPath                
                if (svgContainer) {
                    svgContainer.appendChild(this.edgeElement);
                }
            }
        }
        
        // this.edgeElement.setAttribute("x1", startX.toString());
        // this.edgeElement.setAttribute("y1", startY.toString());
        // this.edgeElement.setAttribute("x2", endX.toString());
        // this.edgeElement.setAttribute("y2", endY.toString());
    }

    private startListening() {
        const observer = new MutationObserver(() => {
            this.updateEdgePosition();
        });

        observer.observe(this.props.startNode, { attributes: true });
        observer.observe(this.props.endNode, { attributes: true });
    }
}

customElements.define("edge-component", EdgeComponent);