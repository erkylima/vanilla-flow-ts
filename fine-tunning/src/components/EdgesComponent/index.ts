import { NodeComponent } from "../NodeComponent";

export interface EdgeProps {
    startNode: NodeComponent;
    endNode: NodeComponent;
}

export class EdgeComponent extends HTMLElement {
    private props: EdgeProps;
    private edgeElement: SVGLineElement;

    constructor(props: EdgeProps) {
        super();
        this.props = props;
        this.edgeElement = this.createEdgeElement();
        this.render();
        this.updateEdgePosition();
        this.startListening();
    }

    private createEdgeElement(): SVGLineElement {
        const edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
        edge.setAttribute("stroke", "black");
        edge.setAttribute("stroke-width", "2");
        edge.setAttribute("stroke-linecap", "round");
        return edge;
    }

    private render() {
        this.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1080" height="800"></svg>`
        const svgContainer = this.querySelector("svg");
        alert(svgContainer)

        if (svgContainer) {
            svgContainer.appendChild(this.edgeElement);
        }
    }

    private updateEdgePosition() {
        const startRect = this.props.startNode.outputsElement[0].getBoundingClientRect();
        const endRect = this.props.endNode.inputsElement[0].getBoundingClientRect();

        const startX = (startRect.left + startRect.width / 2) - 7.5;
        const startY = (startRect.top + startRect.height / 2) - 7.5;

        const endX = (endRect.left + endRect.width / 2) - 7.5;
        const endY = (endRect.top + endRect.height / 2) - 7.5;

        this.edgeElement.setAttribute("x1", startX.toString());
        this.edgeElement.setAttribute("y1", startY.toString());
        this.edgeElement.setAttribute("x2", endX.toString());
        this.edgeElement.setAttribute("y2", endY.toString());
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