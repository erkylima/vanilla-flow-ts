import { addClickOutsideListener } from "../../util/builder";


export interface NodeProps {
    x?: number;
    y?: number;
    inputs?: number;
    outputs?: number;
}

export class NodeComponent extends HTMLElement {
    props: NodeProps = {
        inputs: 0,
        outputs: 0,
        x: 20,
        y: 20,
    }
    private offsetX: number = 0;
    private offsetY: number = 0;
    inputsElement: Array<HTMLElement> = new Array<HTMLElement>();
    outputsElement: Array<HTMLElement> = new Array<HTMLElement>();
    private isDragging: boolean = false;
    
    constructor(props: NodeProps) {
        super();
        
        this.attachShadow({ mode: 'open' });
        this.props = props
        this.setPosition(props.x, props.y)
        this.render();
        this.populateInputPoints(this.props.inputs)
        this.populateOutputPoints(this.props.outputs)
    }
    
    private isActive: boolean = false;

    connectedCallback() {
        addClickOutsideListener(this.shadowRoot, () => {
            this.className = '';
            this.isActive = false;
        })
        this.addEventListener('dblclick', () => { this.className = this.isActive ? '':'active'; this.isActive = !this.isActive; });
        this.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    populateInputPoints(lenght:number) {                
        for (let i = 0; i < lenght; i++) {
            var element = document.createElement("div");                
            element.className = 'input'
            
            element.addEventListener("mousedown", function(e) {
                e.stopPropagation();
            })
            element.addEventListener("mouseup", function(e) {
            })
            this.inputsElement.push(element);
            this.shadowRoot.querySelector(".inputs").appendChild(element)
        }
        
    }

    populateOutputPoints(lenght:number) {
        for (let i = 0; i < lenght; i++) {
            var element = document.createElement("div");                
            element.className = 'output'
            
            element.addEventListener("mousedown", function(e) {
                e.stopPropagation();
            })
            element.addEventListener("mouseup", function(e) {
            })
            this.outputsElement.push(element);
            this.shadowRoot.querySelector(".outputs").appendChild(element)
        }
    }
    setPosition(x:number, y:number) {
        this.style.left = x + 'px'
        this.style.top = y + 'px'
    }
    private render() {
        this.shadowRoot.innerHTML = `
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
                    padding: 12px;
                    transition: border ease 0.2s, box-shadow ease 0.2s;
                    align-content: center;
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
                    z-index: -3;
                    position: absolute;
                    top: 0px;
                    left: calc(12px * -0.6);
                    display: flex;
                    flex-direction: column;
                    margin: 12px 0px;
                }
                .input {
                    pointer-events: all;
                    cursor: initial;
                    background-color: #9c9c9c;
                    width: 8px;
                    height: 12px;
                    
                    margin: 6px 5px 0px 0px;
                    box-shadow: 1px 1px 11px -6px rgba(0, 0, 0, 0.75);
                }
                .outputs {
                    pointer-events: none;
                    z-index: -3;
                    position: absolute;
                    top: 0px;
                    right: calc(12px * -1.5);
                    display: flex;
                    flex-direction: column;
                    margin: 12px 0px;
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
        this.offsetX = event.clientX - rect.left;
        this.offsetY = event.clientY - rect.top;

        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;

        const newX = event.clientX - this.offsetX;
        const newY = event.clientY - this.offsetY;

        this.style.left = `${newX}px`;
        this.style.top = `${newY}px`;
    }

    private onMouseUp(event: MouseEvent) {
        if (!this.isDragging) return;
        this.isDragging = false;

        window.removeEventListener('mousemove', this.onMouseMove.bind(this));
        window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }
}

customElements.define("node-component", NodeComponent);