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
            background-color: #333;
            color: white;
            padding: 10px;
            text-align: center;
        `;
        container.appendChild(header);

        const sidebar = document.createElement('aside');
        sidebar.innerHTML = `
            <ul>
                <li><a href="#example1">Example FlowChart 1</a></li>
                <li><a href="#example2">Example FlowChart 2</a></li>
                <li><a href="#example3">Example FlowChart 3</a></li>
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
        `;
        container.appendChild(contentArea);

        const flowCharts = {
            example1: this.createFlowChart('', 3),
            example2: this.createFlowChart('', 5),
            example3: this.createFlowChart('', 2),
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
        const nodesConfig = Array.from({ length: nodeCount }, (_, i) => ({
            id: i + 1,
            x: 300 + i * 200,
            y: 160 + (i % 2 === 0 ? 100 : -100),
            inputs: i === 0 ? 0 : 1,
            outputs: i === nodeCount - 1 ? 0 : 1,
            header: `<i class="fas fa-check"></i> ${title} Node ${i + 1}`,
            content: `Content ${i + 1}`,
        }));

        const edgesConfig = nodesConfig
            .slice(0, -1)
            .map((node, i) => ({
                startNodeIndex: node.id,
                endNodeIndex: nodesConfig[i + 1].id,
                outputTarget: 1,
                inputTarget: 1,
            }));

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
