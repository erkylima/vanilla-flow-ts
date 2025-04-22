import { FlowChart, FlowChartConfig } from '../packages/vanilla-flow/src/index';

export class App extends HTMLElement {
    connectedCallback() {
        const container = document.createElement('div');
        container.style.cssText = `
            display: grid;
            grid-template-rows: auto 1fr;
            grid-template-columns: 250px 1fr;
            height: 100vh;
            margin: 0;
        `;
        this.appendChild(container);

        const header = document.createElement('header');
        header.innerHTML = `<h1>FlowOps</h1>`;
        header.style.cssText = `
            grid-column: 1 / -1;
            background-color: #3f51b5;
            color: white;
            padding: 16px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        `;
        container.appendChild(header);

        const sidebar = document.createElement('aside');
        sidebar.innerHTML = `
            <ul>
                <li><a href="#example1">Microservices Architecture</a></li>
                <li><a href="#example2">Data Migration Flow</a></li>
                <li><a href="#example3">Telecom Network Routing</a></li>
            </ul>
        `;
        sidebar.style.cssText = `
            background-color: #f4f4f4;
            padding: 20px;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
            font-size: 16px;
            line-height: 1.5;
        `;
        container.appendChild(sidebar);

        const contentArea = document.createElement('main');
        contentArea.style.cssText = `
            padding: 20px;
            overflow: hidden;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        `;
        container.appendChild(contentArea);

        const flowCharts = {
            example1: this.createFlowChart('Microservices Architecture', 10),
            example2: this.createFlowChart('Data Migration Flow', 5),
            example3: this.createFlowChart('Telecom Network Routing', 7),
        };

        window.addEventListener('hashchange', () => {
            const hash = location.hash.substring(1);
            contentArea.innerHTML = '';
            if (flowCharts[hash]) {
                contentArea.appendChild(flowCharts[hash]);
            }
        });

        if (location.hash) {
            const hash = location.hash.substring(1);
            if (flowCharts[hash]) {
                contentArea.appendChild(flowCharts[hash]);
            }
        } else {
            contentArea.appendChild(flowCharts.example1);
        }

        const style = document.createElement('style');
        style.textContent = `
            button {
                margin-top: 10px;
                margin-right: 10px;
                padding: 10px 20px;
                font-size: 14px;
                cursor: pointer;
                background-color: #3f51b5;
                color: white;
                border: none;
                border-radius: 4px;
                transition: background-color 0.3s;
            }
            button:hover {
                background-color: #303f9f;
            }
        `;
        this.appendChild(style);
        const addNodeButton = document.createElement('button');
        addNodeButton.innerHTML = '<i class="fas fa-plus"></i> Add Node';
        addNodeButton.addEventListener('click', () => {
            const hash = location.hash.substring(1);

            flowCharts[hash].addNode({
                id: flowCharts[hash].config.nodes.length + 1,
                x: 200,
                y: 200,
                inputs: 1,
                outputs: 1,
                header: '<i class="fas fa-circle"></i> New Node',
                content: '<i class="fa fa-plus-circle icon"></i> New Content'
            });
        });

        const exportButton = document.createElement('button');
        exportButton.innerHTML = '<i class="fas fa-download"></i> Export Nodes & Edges';
        exportButton.addEventListener('click', () => {
            const hash = location.hash.substring(1);

            const exportedData = {
                nodes: flowCharts[hash].config.nodes.map(node => ({
                    id: node.id,
                    x: node.x,
                    y: node.y,
                    inputs: node.inputs,
                    outputs: node.outputs,
                    header: node.header,
                    content: node.content
                })),
                edges: flowCharts[hash].config.edges.map(edge => ({
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

        sidebar.appendChild(addNodeButton);
        sidebar.appendChild(exportButton);
    }

    createFlowChart(title, nodeCount) {
        const nodesConfig = [
            { id: 1, x: 100, y: 200, inputs: 0, outputs: 1, header: 'Frontend 1', content: 'Frontend Service 1' },
            { id: 2, x: 300, y: 200, inputs: 0, outputs: 1, header: 'Frontend 2', content: 'Frontend Service 2' },
            { id: 3, x: 500, y: 200, inputs: 2, outputs: 1, header: 'API Gateway', content: 'API Gateway' },
            { id: 4, x: 700, y: 150, inputs: 1, outputs: 1, header: 'BFF 1', content: 'Backend for Frontend 1' },
            { id: 5, x: 700, y: 250, inputs: 1, outputs: 1, header: 'BFF 2', content: 'Backend for Frontend 2' },
            { id: 6, x: 900, y: 100, inputs: 1, outputs: 0, header: 'Microservice 1', content: 'Microservice 1' },
            { id: 7, x: 900, y: 150, inputs: 1, outputs: 0, header: 'Microservice 2', content: 'Microservice 2' },
            { id: 8, x: 900, y: 200, inputs: 1, outputs: 0, header: 'Microservice 3', content: 'Microservice 3' },
            { id: 9, x: 900, y: 250, inputs: 1, outputs: 0, header: 'Microservice 4', content: 'Microservice 4' },
            { id: 10, x: 900, y: 300, inputs: 1, outputs: 0, header: 'Microservice 5', content: 'Microservice 5' },
        ];

        const edgesConfig = [
            { startNodeIndex: 1, endNodeIndex: 3, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 2, endNodeIndex: 3, outputTarget: 1, inputTarget: 2 },
            { startNodeIndex: 3, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 3, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 4, endNodeIndex: 6, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 4, endNodeIndex: 7, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 5, endNodeIndex: 8, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 5, endNodeIndex: 9, outputTarget: 1, inputTarget: 1 },
            { startNodeIndex: 5, endNodeIndex: 10, outputTarget: 1, inputTarget: 1 },
        ];

        const flowChartConfig: FlowChartConfig = {
            nodes: nodesConfig,
            edges: edgesConfig,
            nodeCss: 'background-color: rgb(255, 255, 255); width: 120px;',
            headerCss: 'background-color: rgb(58, 58, 58); color: white; font-size: 14px;',
            cssImports: ['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'],
            flowCss: 'background-color: rgb(129, 129, 129);',
        };

        const flowChart = new FlowChart(flowChartConfig);
        return flowChart;
    }
}

customElements.define('root-app', App);
