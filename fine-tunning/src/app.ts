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
            y: 160
        });

        let node2 = new NodeComponent({
            inputs: 1,
            outputs: 2,
            x: 400,
            y: 160
        });
        let node3 = new NodeComponent({
            inputs: 1,
            outputs: 2,
            x: 600,
            y: 160
        });
        
        this.shadowRoot.appendChild(node1);
        this.shadowRoot.appendChild(node2);
        this.shadowRoot.appendChild(node3);
        let edge = new EdgeComponent({startNode: node1, endNode: node2});
        let edge2 = new EdgeComponent({startNode: node2, endNode: node3});

        this.shadowRoot.appendChild(edge);
        this.shadowRoot.appendChild(edge2);
        const yourWebComponent = document.querySelector('node-component');


    }
}

customElements.define('root-app', App);