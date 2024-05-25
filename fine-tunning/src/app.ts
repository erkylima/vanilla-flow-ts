import { EdgesComponent } from "./components/EdgesComponent";
import { FlowChart, FlowChartConfig } from "./components/FlowChart";
import { NodeComponent } from "./components/NodeComponent";

export class App extends HTMLElement {

    constructor(){
        super();
    }

    connectedCallback(){
        this.attachShadow({mode: 'open'});
        const nodesConfig = [
            { x: 100, y: 160, inputs: 2, outputs: 2 },
            { x: 300, y: 160, inputs: 2, outputs: 2 },
            { x: 500, y: 160, inputs: 2, outputs: 2 },
        ];
        
        const edgesConfig = [
            { startNodeIndex: 1, endNodeIndex: 2, inputTarget: 0, outputTarget: 0 },
            { startNodeIndex: 2, endNodeIndex: 3, inputTarget: 1, outputTarget: 0 },
        ];
        
        // Criando o objeto de configuração para o FlowChart
        const flowChartConfig: FlowChartConfig = {
            nodes: nodesConfig,
            edges: edgesConfig,
        };
        
        // Instanciando o FlowChart com os objetos de configuração
        const flowChart = new FlowChart(flowChartConfig);
        
        this.shadowRoot.appendChild(flowChart);
        


    }
}

customElements.define('root-app', App);