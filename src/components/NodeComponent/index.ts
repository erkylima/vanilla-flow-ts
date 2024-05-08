import styles from "./styles.module.css";
interface Position {
    x: number;
    y: number;
}
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
    onMouseDown?: (event: any) => Position;
    onMouseUp?: (event: any) => void;
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
        if (props){
            var elements: HTMLElement[] = [];
            for (let i = 0; i < lenght; i++) {
                var element = document.createElement("div");
                element.className = styles.nodeInput
                element.addEventListener("mousedown", function(e) {
                    e.stopPropagation();
                })
                element.addEventListener("mouseup", function(e) {
                })
                
                elements.push(element)
            }
            return elements
        }
    }
    populateOutputPoints(lenght:number, props:NodeComponentProps): HTMLElement[] {
        var elements: HTMLElement[] = [];
        if (props){
            for (let i = 0; i < lenght; i++) {
                var element = document.createElement("div");
                element.className = styles.nodeOutput
                element.addEventListener("mousedown", function(e) {
                    if (props.onMouseDownOutput) props.onMouseDownOutput(i);
                })
                
                elements.push(element)
            }
            return elements
        }
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
        if (this.props.inputs > 0 ) {
            this.inputRefs.forEach(element => {
                inputs.append(element)
                
            })
        }
        return inputs
    }

    outputsElement(){
        var outputs = document.createElement("div")
        outputs.className = styles.nodeOutputs
        if (this.props.outputs > 0 ) {
            this.outputRefs.forEach(element => {
                outputs.append(element)
            });            
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
        drawer.id = this.props.id
        drawer.className = this.props.selected ? styles.nodeSelected : styles.node
        drawer.style.transform = `translate(${this.props.x}px, ${this.props.y}px)`
        drawer.addEventListener("dblclick", ((ev) => {
            ev.stopImmediatePropagation()
            this.props.selected = !this.props.selected
            document.getElementById("action-"+this.props.id).className = this.props.selected ? styles.actions : styles.actionsHidden
            drawer.className = this.props.selected ? styles.nodeSelected : styles.node
            
        }));
        drawer.addEventListener("mousedown", ((ev) => {
            setTimeout(function() {
                // You are now in a hold state, you can do whatever you like!
              }, 500);
            this.props.onMouseDown(ev)

        }));
        drawer.addEventListener("mouseup", ((ev) => {

            this.props.onMouseUp(ev)

        }));
        
        return drawer
    }

    deleteElement() {


        var actions = document.createElement("div")
        actions.className = this.props.selected ? styles.actions : styles.actionsHidden
        actions.id = "action-"+this.props.id


        var svg = document.createElementNS("http://www.w3.org/2000/svg","svg")
        svg.addEventListener("click", (ev) => {
            setTimeout(function() {
                // You are now in a hold state, you can do whatever you like!
              }, 500);
            this.props.onClickDelete()            
        })
        svg.setAttribute("class", styles.delete)
        svg.setAttribute("fill", "currentColor")
        svg.setAttribute("stroke-width", "0")
        svg.setAttribute("baseProfile", "tiny")
        svg.setAttribute("version", "1.2")
        svg.setAttribute("viewBox", "4 4 16 16")
        svg.style.overflow = 'visible';
        var path = document.createElementNS(svg.namespaceURI,"path");  


        path.setAttributeNS(null, "d", "M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8 8-3.582 8-8-3.581-8-8-8zm3.707 10.293a.999.999 0 11-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 01-1.414 0 .999.999 0 010-1.414L10.586 12 8.293 9.707a.999.999 0 111.414-1.414L12 10.586l2.293-2.293a.999.999 0 111.414 1.414L13.414 12l2.293 2.293z")
        svg.append(path)
        

        actions.appendChild(svg)

        
        return actions
    }
  

    
};

customElements.define('node-component', NodeComponent);

