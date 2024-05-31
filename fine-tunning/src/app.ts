import { FlowChart, FlowChartConfig } from "./components/FlowChart";


export class App extends HTMLElement {

    constructor(){
        super();
    }

    connectedCallback(){
        this.attachShadow({mode: 'open'});
        const nodesConfig = [
            { id: 1, x: 200+100, y: 160, inputs: 0, outputs: 2 },
            { id: 2, x: 200+300, y: 260, inputs: 1, outputs: 1 },
            { id: 3, x: 200+300, y: 60, inputs: 1, outputs: 1 },
            { id: 4, x: 200+600, y: 160, inputs: 2, outputs: 2 },
            { id: 5, x: 200+900, y: 160, inputs: 1, },
            { id: 6, x: 200+900+200, y: 160, inputs: 1 },
        ];
        
        const edgesConfig = [
            { startNodeIndex: 1, endNodeIndex: 3, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 1, endNodeIndex: 2, outputTarget: 2, inputTarget: 1 },
            { startNodeIndex:  3, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex:  2, endNodeIndex: 4, outputTarget: 1, inputTarget: 2 },
            { startNodeIndex:  4, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex:  4, endNodeIndex: 6, outputTarget: 2, inputTarget: 1 },
        ];
        
        // Criando o objeto de configuração para o FlowChart
        const flowChartConfig: FlowChartConfig = {
            nodes: nodesConfig,
            edges: edgesConfig,
        };
        
        // Instanciando o FlowChart com os objetos de configuração
        const flowChart = new FlowChart(flowChartConfig);
        this.shadowRoot.appendChild(flowChart);
        let doc = document.createElement('div')
        doc.innerText = 'teste'
        this.shadowRoot.appendChild(doc)
        

    }
}

customElements.define('root-app', App);