import { FlowChart, FlowChartConfig } from '../../packages/vanilla-flow/src/index';

export class WorkflowsPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section style="padding:20px;">
        <h2>Workflows de Arquitetura Distribuída AWS</h2>
        <div class="workflow-list" style="display: grid; grid-template-columns: 1fr; gap: 40px; margin-top:20px;">
          <div id="workflow1"><h3>Arquitetura de Microsserviços AWS</h3></div>
          <div id="workflow2"><h3>Processamento Batch com Workers</h3></div>
          <div id="workflow3"><h3>Composição de Micro Frontends</h3></div>
        </div>
      </section>
    `;
    this.renderWorkflows();
  }

  private renderWorkflows() {
    const wf1 = this.querySelector('#workflow1');
    const wf2 = this.querySelector('#workflow2');
    const wf3 = this.querySelector('#workflow3');

    if (wf1) wf1.appendChild(this.createMicroservicesWorkflow());
    if (wf2) wf2.appendChild(this.createBatchProcessingWorkflow());
    if (wf3) wf3.appendChild(this.createMicroFrontendsWorkflow());
  }

  private createMicroservicesWorkflow(): HTMLElement {
    const nodesConfig = [
      { id: 1, x: 100, y: 200, inputs: 0, outputs: 1, header: 'API Gateway', content: 'AWS API Gateway' },
      { id: 2, x: 300, y: 200, inputs: 1, outputs: 1, header: 'BFF Service', content: 'AWS Lambda' },
      { id: 3, x: 500, y: 150, inputs: 1, outputs: 1, header: 'Auth Service', content: 'JWT Auth' },
      { id: 4, x: 500, y: 250, inputs: 1, outputs: 1, header: 'User Service', content: 'REST API' },
      { id: 5, x: 700, y: 200, inputs: 2, outputs: 0, header: 'Frontend', content: 'Micro Frontend' }
    ];
    const edgesConfig = [
      { startNodeIndex: 1, endNodeIndex: 2, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 2, endNodeIndex: 3, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 2, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 3, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 4, endNodeIndex: 5, outputTarget: 1, inputTarget: 2 }
    ];
    const config: FlowChartConfig = {
      nodes: nodesConfig,
      edges: edgesConfig,
      nodeCss: 'background-color: #e8f0fe; width: 140px;',
      headerCss: 'background-color: #1976d2; color: white; font-size: 13px;',
      cssImports: [],
      flowCss: 'background-color: #f5f5f5;'
    };
    return new FlowChart(config);
  }

  private createBatchProcessingWorkflow(): HTMLElement {
    const nodesConfig = [
      { id: 1, x: 100, y: 200, inputs: 0, outputs: 1, header: 'S3 Bucket', content: 'AWS S3 (Raw Data)' },
      { id: 2, x: 300, y: 200, inputs: 1, outputs: 1, header: 'ETL Lambda', content: 'AWS Lambda ETL Job' },
      { id: 3, x: 500, y: 200, inputs: 1, outputs: 1, header: 'Batch Worker', content: 'AWS Batch' },
      { id: 4, x: 700, y: 200, inputs: 1, outputs: 1, header: 'Redshift', content: 'AWS Redshift' },
      { id: 5, x: 900, y: 200, inputs: 1, outputs: 0, header: 'Notification', content: 'SNS Topic' }
    ];
    const edgesConfig = [
      { startNodeIndex: 1, endNodeIndex: 2, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 2, endNodeIndex: 3, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 3, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 4, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 }
    ];
    const config: FlowChartConfig = {
      nodes: nodesConfig,
      edges: edgesConfig,
      nodeCss: 'background-color: #fff3e0; width: 140px;',
      headerCss: 'background-color: #fb8c00; color: white; font-size: 13px;',
      cssImports: [],
      flowCss: 'background-color: #fafafa;'
    };
    return new FlowChart(config);
  }

  private createMicroFrontendsWorkflow(): HTMLElement {
    const nodesConfig = [
      { id: 1, x: 100, y: 200, inputs: 0, outputs: 1, header: 'API Gateway', content: 'AWS API Gateway' },
      { id: 2, x: 300, y: 100, inputs: 1, outputs: 1, header: 'Service A', content: 'Products API' },
      { id: 3, x: 300, y: 300, inputs: 1, outputs: 1, header: 'Service B', content: 'Cart API' },
      { id: 4, x: 500, y: 100, inputs: 1, outputs: 0, header: 'Frontend A', content: 'Micro Frontend A' },
      { id: 5, x: 500, y: 300, inputs: 1, outputs: 0, header: 'Frontend B', content: 'Micro Frontend B' }
    ];
    const edgesConfig = [
      { startNodeIndex: 1, endNodeIndex: 2, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 1, endNodeIndex: 3, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 2, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 3, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 }
    ];
    const config: FlowChartConfig = {
      nodes: nodesConfig,
      edges: edgesConfig,
      nodeCss: 'background-color: #e8f5e9; width: 140px;',
      headerCss: 'background-color: #43a047; color: white; font-size: 13px;',
      cssImports: [],
      flowCss: 'background-color: #f1f8e9;'
    };
    return new FlowChart(config);
  }
}

customElements.define('workflows-page', WorkflowsPage);
