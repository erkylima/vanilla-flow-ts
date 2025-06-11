import { FlowChart, FlowChartConfig } from '../../packages/vanilla-flow/src/index';
import { styleAwsNode } from '../utils/node-factory';
import { NodeProps } from '../interfaces/node-props';

export class MicrofrontendsPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section style="padding:20px;">
        <h2>Composição de Micro Frontends</h2>
      </section>
    `;

    const baseNodes: NodeProps[] = [
      { id: 1, x: 100, y: 200, inputs: 0, outputs: 2, header: 'API Gateway', content: 'AWS API Gateway' },
      { id: 2, x: 300, y: 100, inputs: 1, outputs: 1, header: 'Products Service', content: 'AWS Lambda' },
      { id: 3, x: 300, y: 300, inputs: 1, outputs: 1, header: 'Cart Service', content: 'AWS Lambda' },
      { id: 4, x: 500, y: 100, inputs: 1, outputs: 0, header: 'Product UI', content: 'Microfrontend A (S3/CloudFront)' },
      { id: 5, x: 500, y: 300, inputs: 1, outputs: 0, header: 'Cart UI', content: 'Microfrontend B (S3/CloudFront)' }
    ];

    const nodesConfig = baseNodes.map(styleAwsNode);

    const edgesConfig = [
      { startNodeIndex: 1, endNodeIndex: 2, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 1, endNodeIndex: 3, outputTarget: 2, inputTarget: 1 },
      { startNodeIndex: 2, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 3, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 }
    ];

    const config: FlowChartConfig = {
      nodes: nodesConfig,
      edges: edgesConfig,
      nodeCss: 'background-color: #e8f5e9; width: 140px; border-radius: 4px;',
      headerCss: 'background-color: #43a047; color: white; font-size: 13px;',
      cssImports: [],
      flowCss: 'background-color: #f1f8e9;'
    };

    const chart = new FlowChart(config);
    this.appendChild(chart);
  }
}

customElements.define('microfrontends-page', MicrofrontendsPage);
