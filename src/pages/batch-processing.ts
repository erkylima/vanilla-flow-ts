import { FlowChart, FlowChartConfig } from '../../packages/vanilla-flow/src/index';

export class BatchProcessingPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section style="padding:20px;">
        <h2>Processamento Batch com Workers</h2>
      </section>
    `;

    const config: FlowChartConfig = {
      nodes: [
        { id: 1, x: 100, y: 200, inputs: 0, outputs: 1, header: 'Raw Data', content: 'Amazon S3 Bucket' },
        { id: 2, x: 300, y: 200, inputs: 1, outputs: 1, header: 'ETL Job', content: 'AWS Glue Job' },
        { id: 3, x: 500, y: 200, inputs: 1, outputs: 1, header: 'Batch Compute', content: 'AWS Batch' },
        { id: 4, x: 700, y: 200, inputs: 1, outputs: 1, header: 'Processed Data', content: 'Amazon S3 (Processed)' },
        { id: 5, x: 900, y: 200, inputs: 1, outputs: 0, header: 'Data Warehouse', content: 'Amazon Redshift' }
      ],
      edges: [
        { startNodeIndex: 1, endNodeIndex: 2, outputTarget: 1, inputTarget: 1 },
        { startNodeIndex: 2, endNodeIndex: 3, outputTarget: 1, inputTarget: 1 },
        { startNodeIndex: 3, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
        { startNodeIndex: 4, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 }
      ],
      nodeCss: 'background-color: #fff3e0; width: 140px;',
      headerCss: 'background-color: #fb8c00; color: white; font-size: 13px;',
      cssImports: [],
      flowCss: 'background-color: #fafafa;'
    };

    const chart = new FlowChart(config);
    this.appendChild(chart);
  }
}

customElements.define('batch-processing-page', BatchProcessingPage);
