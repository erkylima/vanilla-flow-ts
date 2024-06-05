import { addClickOutsideListener } from "../../util/builder";
import { FlowChart } from "../FlowChart";

export interface NodeProps {
    id: number;
    x?: number;
    y?: number;
    inputs?: number;
    outputs?: number;
    flowChart?: FlowChart;
}

export class NodeComponent extends HTMLElement {
    props: NodeProps = {
        id: 0,
        inputs: 0,
        outputs: 0,
        x: 20,
        y: 20,
    };
    private offsetX: number = 0;
    private offsetY: number = 0;
    private initialX: number = 0;
    private initialY: number = 0;
    private initialNodeX: number = 0;
    private initialNodeY: number = 0;
    inputsElement: Array<HTMLElement> = new Array<HTMLElement>();
    outputsElement: Array<HTMLElement> = new Array<HTMLElement>();
    private isDragging: boolean = false;
    private isActive: boolean = false;
    
    constructor(props: NodeProps) {
        super();
        this.props = props;
        this.render();
        this.setPosition(props.x, props.y);
        this.populateInputPoints(this.props.inputs);
        this.populateOutputPoints(this.props.outputs);
    }    

    render(){
        this.className = 'node'
        this.innerHTML = `
        Olá
            <div class="inputs"></div>
            <div class="outputs"></div>            
        `;
    }

    connectedCallback() {
        addClickOutsideListener(this, () => {
            this.className = 'node';
            this.isActive = false;
        });
        this.addEventListener('dblclick', () => { this.className = this.isActive ? 'node' : 'node active'; this.isActive = !this.isActive; });
        this.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    populateInputPoints(length: number) {                
        for (let i = 0; i < length; i++) {
            var element = document.createElement("div");                
            element.className = 'input';
            
            element.addEventListener("mousedown", function(e) {
                e.stopPropagation();
            });
            element.addEventListener("mouseup", function(e) {
            });
            this.inputsElement.push(element);
            this.querySelector(".inputs").appendChild(element);
        }
    }

    populateOutputPoints(length: number) {
        for (let i = 0; i < length; i++) {
            var element = document.createElement("div");                
            element.className = 'output';
            
            element.addEventListener("mousedown", function(e) {
                e.stopPropagation();
            });
            element.addEventListener("mouseup", function(e) {
            });
            this.outputsElement.push(element);
            this.querySelector(".outputs").appendChild(element);
        }
    }

    setPosition(x: number, y: number) {
        this.style.left = (x)+ 'px';
        this.style.top = (y) + 'px';
        this.props.x = x;
        this.props.y = y;
    }



    onMouseDown(event: MouseEvent){
        this.isDragging = true;
        const rect = this.getBoundingClientRect();
        this.offsetX = (event.clientX - rect.left) ;
        this.offsetY = (event.clientY - rect.top) ;    
        this.initialX = event.clientX;
        this.initialY = event.clientY;
        this.initialNodeX = this.props.x
        this.initialNodeY = this.props.y
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
    onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;
        const dx = (event.clientX - this.initialX)/this.props.flowChart.scale 
        const dy = (event.clientY - this.initialY)/this.props.flowChart.scale        
        this.props.x = this.initialNodeX - this.offsetX + dx;
        this.props.y = this.initialNodeY - this.offsetY + dy;
        this.style.left = this.props.x + 'px';
        this.style.top = this.props.y + 'px';
        this.props.flowChart.createEdges();
    }

    onMouseUp(event: MouseEvent) {
        if (!this.isDragging) return;        
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.initialNodeX = 0;
        this.initialNodeY = 0;
        this.initialX = 0;
        this.initialY = 0;
        window.removeEventListener('mousemove', this.onMouseMove.bind(this));
        window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }

}

customElements.define("node-component", NodeComponent);