import { FlowChart, FlowChartConfig } from '../packages/vanilla-flow/src/index';
export class App extends HTMLElement {

    connectedCallback(){
        this.attachShadow({mode: 'open'});
        const nodesConfig = [
            { id: 1, x: 200+100, y: 160, inputs: 0, outputs: 2, header: 'Node 1', content: 'Content 1' },
            { id: 2, x: 200+300, y: 260, inputs: 1, outputs: 1, header: 'Node 2', content: 'Content 2' },
            { id: 3, x: 200+300, y: 60, inputs: 1, outputs: 1, header: 'Node 3', content: 'Content 3' },
            { id: 4, x: 200+600, y: 160, inputs: 2, outputs: 2, header: 'Node 4', content: 'Content 4' },
            { id: 5, x: 200+900, y: 160, inputs: 1, outputs: 0, header: 'Node 5', content: 'Content 5' },
            { id: 6, x: 200+900+200, y: 260, inputs: 1, outputs: 0, header: 'Node 6', content: 'Content 6' },
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
            headerCss: `
            
                background-color: #f1f1f1;
                padding: 0px;
                align-items: left-center;
                border-radius: 5px 5px 0 0;
            `,
            contentCss: `
                padding: 0px;
                border-radius: 0 0 5px 5px;
            `
        };
        
        // Instanciando o FlowChart com os objetos de configuração
        const flowChart = new FlowChart(flowChartConfig);
        this.shadowRoot.appendChild(flowChart);
        let doc = document.createElement('button')
        doc.innerText = 'Add Node';
        doc.addEventListener('click', () => {
            flowChart.addNode({ id: 2, x: 200, y: 200, inputs: 1, outputs: 1 });
        });
        
        this.shadowRoot.appendChild(doc)
        

    }
}

customElements.define('root-app', App);