import styles from "./styles.module.css";

export interface NodeComponentProps {
    ref?: any;
    id?: string;
    x: number;
    y: number;
    selected: boolean;
    actions?: { delete?: boolean };
    label?: string;
    content: any;
    inputs: number;
    outputs: number;
    onNodeMount?: (inputs: { offset: { x: number; y: number } }[], outputs: { offset: { x: number; y: number } }[]) => void;
    onMouseDown?: (event: any) => void;
    onMouseDownOutput?: (outputIndex: number) => void;
    onMouseUpInput?: (inputIndex: number) => void;
    onClickOutside?: () => void;
    onClickDelete?: () => void;
}

export default class NodeComponent extends HTMLElement {
    props: NodeComponentProps
    inputRefs: HTMLElement[]
    outputRefs: HTMLElement[]
    constructor(props: NodeComponentProps) {
        super();
        if (props){
            this.inputRefs = this.populateInputPoints(props.inputs, props);
            this.outputRefs = this.populateOutputPoints(props.outputs, props);

            this.props = props;


            this.render()
        }
    }


    render() {
        if (this.props.content == "Only Inputs"){
            alert("check");
        }
        const node = this.nodeElement()
        node.append(this.deleteElement())
        node.append(this.labelElement())
        node.append(this.contentElement())
        node.append(this.inputsElement());
        node.append(this.outputsElement());
        this.append(node)
    }


    populateInputPoints(lenght:number, props): HTMLElement[] {
        var elements: HTMLElement[] = [];
        for (let i = 0; i < lenght; i++) {
            var element = document.createElement("div");
            element.className = styles.nodeInput
            element.addEventListener("mousedown", function(e) {
                e.stopPropagation();
            })
            element.addEventListener("mouseup", function(e) {
            if (props.onMouseUpInput) props.onMouseUpInput(i);
            })
            elements.push(element)
        }
        return elements
    }
    populateOutputPoints(lenght:number, props:NodeComponentProps): HTMLElement[] {
        var elements: HTMLElement[] = [];
        for (let i = 0; i < lenght; i++) {
            var element = document.createElement("div");
            element.className = styles.nodeInput
            
            element.addEventListener("mousedown", function(e) {
                e.stopPropagation();
            })
            
            elements.push(element)
        }
        return elements
    }

    clickOutside(el, accessor) {
        const onClick = (e) => {
            if (!el.contains(e.target)) {
                accessor()?.();
            }
        };
        document.body.addEventListener("click", onClick);
        document.body.removeEventListener("click", onClick);
    }

    inputsElement(){
        var inputs = document.createElement("div")
        inputs.className = styles.nodeInputs
        
        for (var i = 0; i < this.inputRefs.length; i++) {            
            inputs.append(this.inputRefs[i])
            
        }
        return inputs
    }

    outputsElement(){
        var outputs = document.createElement("div")
        outputs.className = styles.nodeOutputs
        
        for (var i = 0; i < this.inputRefs.length; i++) {
            outputs.append(this.outputRefs[i])
            
        }
        return outputs
    }

    contentElement(){
        var content  = document.createElement("div")
        content.className = styles.nodeContent
        content.innerText = this.props.content
        return content
    }

    labelElement() {
        var label = document.createElement("span")
        label.className = styles.nodeLabel
        label.innerText = this.props.label? this.props.label : ""
        
        return label
    }

    nodeElement() {
        var drawer = document.createElement("div");
        drawer.className = this.props.selected ? styles.nodeSelected : styles.node
        drawer.style.transform = `translate(${this.props.x}px, ${this.props.y}px)`
        drawer.addEventListener("mousedown", this.props.onMouseDown)        
        return drawer
    }

    deleteElement() {
        var drawer = document.createElement("div");
        drawer.className = this.props.selected ? styles.actions : styles.actionsHidden
        drawer.addEventListener("click", this.props.onClickDelete)
        

        var actions = document.createElement("div")
        actions.className = this.props.selected ? styles.actions : styles.actionsHidden
        

        var svg = document.createElement("svg")
        svg.innerHTML = `<path d="M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8 8-3.582 8-8-3.581-8-8-8zm3.707 10.293a.999.999 0 11-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 01-1.414 0 .999.999 0 010-1.414L10.586 12 8.293 9.707a.999.999 0 111.414-1.414L12 10.586l2.293-2.293a.999.999 0 111.414 1.414L13.414 12l2.293 2.293z"></path>`

        actions.appendChild(svg)

        
        drawer.appendChild(actions)
        return drawer
    }
  

    
};

customElements.define('node-component', NodeComponent);

