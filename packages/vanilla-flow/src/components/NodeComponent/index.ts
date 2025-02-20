import { addClickOutsideListener } from "../../util/builder";
import { FlowChart } from "../FlowChart/index";

export interface NodeProps {
    id: number;
    x: number;
    y: number;
    inputs: number;
    outputs: number;
    flowChart?: FlowChart;
}

export class NodeComponent extends HTMLElement {
    props: NodeProps;
    private offsetX: number = 0;
    private offsetY: number = 0;
    private initialX: number = 0;
    private initialY: number = 0;
    private initialNodeX: number = 0;
    private initialNodeY: number = 0;
    public inputsElement: Array<HTMLElement> = new Array<HTMLElement>();
    public outputsElement: Array<HTMLElement> = new Array<HTMLElement>();
    private isDragging: boolean = false;
    private shadow: ShadowRoot
    constructor(props: NodeProps) {
        super();
        this.id = props.id +"";
        this.shadow = this.attachShadow({ mode: 'open' });
        this.props = props;
        this.setPosition(props.x, props.y);
        this.render();
        this.populateInputPoints(this.props.inputs);
        this.populateOutputPoints(this.props.outputs);
    }

    private isActive: boolean = false;

    connectedCallback() {
        addClickOutsideListener(this.shadow, () => {
            this.className = '';
            this.isActive = false;
        });
        this.addEventListener('dblclick', () => { this.className = this.isActive ? '' : 'active'; this.isActive = !this.isActive; });
        this.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    populateInputPoints(length: number) {                
        for (let i = 0; i < length; i++) {
            const element = document.createElement("div");                
            element.className = 'input';
            
            element.addEventListener("mouseup", (e) => {
                e.preventDefault();
                if(this.props.flowChart?.edgesComponent?.hasNewEdge)
                    this.endNewEdge(e, i);
            });
            this.inputsElement.push(element);
            this.shadow.querySelector(".inputs")?.appendChild(element);
        }
    }

    populateOutputPoints(length: number) {
        for (let i = 0; i < length; i++) {
            const element = document.createElement("div");                
            element.className = 'output';
            
            element.addEventListener("mousedown", (e) => {
                e.stopPropagation();
                this.startNewEdge(e, i);
            });
            this.outputsElement.push(element);
            this.shadow.querySelector(".outputs")?.appendChild(element);
        }
    }

    setPosition(x: number, y: number) {
        this.style.left = x + 'px';
        this.style.top = y + 'px';
    }

    private render() {
        this.shadow.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    position: absolute;
                    cursor: grab;
                    background-color: white;
                    border: 1px solid #e6d4be;
                    border-radius: 6px;
                    box-shadow: 1px 1px 11px -6px rgba(0, 0, 0, 0.75);
                    user-select: none;
                    z-index: 1;
                    padding: 10px;
                    width:50px;
                    height: 50px;
                    transition: border ease 0.2s, box-shadow ease 0.2s;
                    align-content: center;
                    align-items: center;
                }
                :host(:hover){
                    box-shadow: 2px 2px 12px -6px rgba(0, 0, 0, 0.75);
                }
                :host(.active) {
                    display: flex;
                    flex-direction: column;
                    position: absolute;
                    cursor: grab;
                    background-color: white;
                    border: 1px solid #e38c29;
                    border-radius: 6px;
                    box-shadow: 1px 1px 11px -6px rgba(0, 0, 0, 0.75);
                    user-select: none;
                    z-index: 100;
                    transition: border ease 0.2s, box-shadow ease 0.2s;
                }
                .inputs {
                    pointer-events: none;
                    cursor: initial;
                    position: absolute;                    
                    left: calc(12px * -0.1);
                    display: flex;
                    flex-direction: column;
                    top: 50%;
                    transform: translate(-50%,-50%);
                    }
                .input {
                    pointer-events: all;
                    cursor: initial;
                    background-color: #9c9c9c;
                    width: 6px;
                    height: 12px;
                    margin: 6px 0px;
                    box-shadow: 1px 1px 11px -6px rgba(0, 0, 0, 0.75);
                }
                .outputs {
                    pointer-events: none;
                    z-index: -3;
                    position: absolute;                    
                    right: calc(12px * -1.5);
                    display: flex;
                    flex-direction: column;
                    top: 50%;
                    transform: translate(-50%,-50%)
                }
                .output {
                    pointer-events: all;
                    cursor: crosshair;
                    background-color: #e38b29;
                    width: 12px;
                    height: 12px;
                    border-radius: 100%;
                    margin: 5px 0px;
                    box-shadow: 1px 1px 11px -6px rgba(0, 0, 0, 0.75);
                }
            </style>
            <div class="inputs"></div>
            <div class="outputs"></div>
            <p>Text</p>
        `;
    }

    private onMouseDown(event: MouseEvent) {
        event.preventDefault();
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

        // Notificar o FlowChart de que um nó está sendo arrastado
        if (this.props.flowChart) {
            this.props.flowChart.notifyNodeDragging(true);
        }
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;
        let scale = (this.props.flowChart?.scale || 1);
        const dx = (event.clientX - this.initialX) / scale;
        const dy = (event.clientY - this.initialY) / scale ;    
        this.props.x = this.initialNodeX + dx;
        this.props.y = this.initialNodeY + dy;
        this.setPosition(this.props.x, this.props.y);
    }

    private onMouseUp(event: MouseEvent) {
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

    startNewEdge(event: MouseEvent, outputIndex: number) {
        this.props.flowChart!.edgesComponent.hasNewEdge = true;
        this.props.flowChart!.edgesComponent.startNewEdgeFromNode(this, outputIndex);
    }

    endNewEdge(event: MouseEvent, inputIndex: number) {
        this.props.flowChart!.edgesComponent.endNewEdgeAtNode(this, inputIndex);
    }
}

customElements.define("node-component", NodeComponent);