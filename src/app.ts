
import { FlowChart, FlowChartConfig } from '../packages/vanilla-flow/src/index';

export class App extends HTMLElement {
    connectedCallback() {

        const nodesConfig = [
            { id: 1, x: 300, y: 160, inputs: 0, outputs: 2, nodeCss: 'background: rgb(240, 216, 3);; color: white; text-align: center;', header: 'Node 1', content: '<i class="fas fa-bath"></i> Content 1' },
            { id: 2, x: 500, y: 260, inputs: 1, outputs: 1, iconCss: 'color: red; font-size: 16px;', header: 'Node 2', content: '<i class="fas fa-heart icon"></i> Content 2' },
            { id: 3, x: 500, y: 60, inputs: 1, outputs: 1, header: 'Node 3', content: '<i class="fas fa-chart-line"></i> Content 3' },
            { id: 4, x: 800, y: 160, inputs: 2, outputs: 2, header: 'Node 4', content: '<i class="fas fa-network-wired"></i> Content 4' },
            { id: 5, x: 1100, y: 160, inputs: 1, outputs: 0, header: 'Node 5', content: '<i class="fas fa-check-circle"></i> Content 5' },
            { id: 6, x: 1300, y: 260, inputs: 1, outputs: 0, header: 'Node 6', content: '<i class="fas fa-exclamation-triangle"></i> Content 6' },
        ];

        const edgesConfig = [
            { startNodeIndex: 1, endNodeIndex: 3, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 1, endNodeIndex: 2, outputTarget: 2, inputTarget: 1 },
            { startNodeIndex: 3, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 2, endNodeIndex: 4, outputTarget: 1, inputTarget: 2 },
            { startNodeIndex: 4, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 4, endNodeIndex: 6, outputTarget: 2, inputTarget: 1 },
        ];

        const flowChartConfig: FlowChartConfig = {
            nodes: nodesConfig,
            edges: edgesConfig,
            cssImports: ['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'],
            nodeCss: 'background: rgb(30, 14, 87);; color: white; text-align: center;', 
            headerCss: `
                background-color: #f1f1f1;
                color: black;
                padding: 0px;
                align-items: left-center;
                border-radius: 5px 5px 0 0;
            `,
            contentCss: `
                padding: 0px;
                border-radius: 0 0 5px 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
            `
        };

        const flowChart = new FlowChart(flowChartConfig);
        this.appendChild(flowChart);

        const addNodeButton = document.createElement('button');
        addNodeButton.innerHTML = '<i class="fas fa-plus"></i> Add Node';
        addNodeButton.addEventListener('click', () => {
            flowChart.addNode({
                id: flowChartConfig.nodes.length + 1,
                x: 200,
                y: 200,
                inputs: 1,
                outputs: 1,
                header: 'New Node',
                content: '<i class="fa fa-plus-circle icon"></i> New Content'
            });
        });

        const exportButton = document.createElement('button');
        exportButton.innerHTML = '<i class="fas fa-download"></i> Export Nodes & Edges';
        exportButton.addEventListener('click', () => {
            const exportedData = {
                nodes: flowChartConfig.nodes.map(node => ({
                    id: node.id,
                    x: node.x,
                    y: node.y,
                    inputs: node.inputs,
                    outputs: node.outputs,
                    header: node.header,
                    content: node.content
                })),
                edges: flowChartConfig.edges.map(edge => ({
                    startNodeIndex: edge.startNodeIndex,
                    endNodeIndex: edge.endNodeIndex,
                    outputTarget: edge.outputTarget,
                    inputTarget: edge.inputTarget
                }))
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportedData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "flowchart.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });

        this.appendChild(addNodeButton);
        this.appendChild(exportButton);

        const style = document.createElement('style');
        style.textContent = `
            button {
                margin-top: 10px;
                margin-right: 10px;
                padding: 10px 20px;
                font-size: 14px;
                cursor: pointer;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
            }
            button:hover {
                background-color: #0056b3;
            }
        `;
        this.appendChild(style);
    }
}

customElements.define('root-app', App);
