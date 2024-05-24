import { EdgeComponent } from "./components/EdgesComponent";
import { NodeProps } from "./components/FlowChart";
import { NodeComponent } from "./components/NodeComponent";

export class App extends HTMLElement {

    constructor(){
        super();
    }

    connectedCallback(){
        this.attachShadow({mode: 'open'});

        let node1 = new NodeComponent({
            inputs: 2,
            outputs: 1,
            x: 200,
            y: 100
        })
        let node2 = new NodeComponent({
            inputs: 1,
            outputs: 2,
            x: 400,
            y: 200
        })
        this.shadowRoot.appendChild(node1);
        this.shadowRoot.appendChild(node2);
        let edge = new EdgeComponent({startNode: node1, endNode: node2});
        this.shadowRoot.appendChild(edge);
        const yourWebComponent = document.querySelector('node-component');


    }
}

customElements.define('root-app', App);