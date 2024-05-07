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
            this.inputRefs = this.populateConectors(props.inputs);
            this.outputRefs = this.populateConectors(props.outputs);
            this.props = props;
            this.render()
        }
    }

    populateConectors(lenght:number): HTMLElement[] {
        var elements: HTMLElement[] = [];
        for (let i = 0; i < lenght; i++) {
            var element = document.createElement("div");
            element.className = styles.nodeInput
            element.addEventListener("mousedown", function(e) {
                e.stopPropagation();
                alert(e.target)
            })
            elements.push(element)
        }
        return elements
    }
    render() {

        const node = this.nodeElement()
        node.append(this.deleteElement())
        this.append(node)
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

        var label = document.createElement("span")
        label.className = styles.nodeLabel
        label.innerText = this.props.label? this.props.label : ""
        drawer.appendChild(actions)
        drawer.appendChild(label)
        return drawer
    }

    // return (
    //     <div
    //         ref={props.ref}
    //         class={props.selected ? styles.nodeSelected : styles.node}
    //         style={{ transform: `translate(${props.x}px, ${props.y}px)` }}
    //         onMouseDown={props.onMouseDown}
    //         use:clickOutside={() => props.onClickOutside()}
    //     >
    //         <div class={props.selected ? styles.actions : styles.actionsHidden}>
    //             {props.actions && props.actions.delete && (
    //                 <svg
    //                     class={styles.delete}
    //                     onClick={() => {
    //                         if (props.onClickDelete) props.onClickDelete();
    //                     }}
    //                     fill="currentColor"
    //                     stroke-width="0"
    //                     baseProfile="tiny"
    //                     version="1.2"
    //                     viewBox="4 4 16 16"
    //                     style="overflow: visible;"
    //                 >
    //                     <path d="M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8 8-3.582 8-8-3.581-8-8-8zm3.707 10.293a.999.999 0 11-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 01-1.414 0 .999.999 0 010-1.414L10.586 12 8.293 9.707a.999.999 0 111.414-1.414L12 10.586l2.293-2.293a.999.999 0 111.414 1.414L13.414 12l2.293 2.293z"></path>
    //                 </svg>
    //             )}
    //         </div>
    //         {props.label && <span class={styles.nodeLabel}>{props.label}</span>}
    //         <div class={styles.nodeContent}>{props.content}</div>
    //         {props.inputs > 0 && (
    //             <div class={styles.nodeInputs}>
    //                 <For each={[...Array(props.inputs).keys()]}>
    //                     {(item: number, index: Accessor<number>) => (
    //                         <div
    //                             ref={(ref: any) => {
    //                                 inputRefs[index()] = ref;
    //                             }}
    //                             class={styles.nodeInput}
    //                             onMouseDown={(event: any) => {
    //                                 event.stopPropagation();
    //                             }}
    //                             onMouseUp={(event: any) => {
    //                                 event.stopPropagation();
    //                                 if (props.onMouseUpInput) props.onMouseUpInput(index());
    //                             }}
    //                         ></div>
    //                     )}
    //                 </For>
    //             </div>
    //         )}
    //         {props.outputs > 0 && (
    //             <div id="outputs" class={styles.nodeOutputs}>
    //                 <For each={[...Array(props.outputs).keys()]}>
    //                     {(item: number, index: Accessor<number>) => (
    //                         <div
    //                             ref={(ref: any) => {
    //                                 outputRefs[index()] = ref;
    //                             }}
    //                             class={styles.nodeOutput}
    //                             onMouseDown={(event: any) => {
    //                                 event.stopPropagation();
    //                                 if (props.onMouseDownOutput) props.onMouseDownOutput(index());
    //                             }}
    //                         ></div>
    //                     )}
    //                 </For>
    //             </div>
    //         )}
    //     </div>
    // );

    onMount(){
        let inputs = [];
        let outputs = [];
        for (let i = 0; i < this.inputRefs.length; i++) {
            inputs.push({ offset: { x: this.inputRefs[i].getBoundingClientRect().x, y: this.inputRefs[i].getBoundingClientRect().y } });
        }

        for (let i = 0; i < this.outputRefs.length; i++) {
            outputs.push({ offset: { x: this.outputRefs[i].getBoundingClientRect().x, y: this.outputRefs[i].getBoundingClientRect().y } });
        }
        this.props.onNodeMount(inputs, outputs);
    }
 

    
};

customElements.define('node-component', NodeComponent);

