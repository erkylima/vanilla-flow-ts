import { FlowChart, FlowChartConfig } from '../../packages/vanilla-flow/src/index';

export class MicroservicesPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section style="padding:20px;">
        <h2>Arquitetura de Microsserviços AWS</h2>
      </section>
    `;

    const config: FlowChartConfig = {
      nodes: [
        { id: 1, x: 100, y: 200, inputs: 0, outputs: 1, header: 'Cliente Web', content: 'Aplicação React' },
        { id: 2, x: 300, y: 200, inputs: 1, outputs: 1, header: 'API Gateway', content: 'AWS API Gateway (STS Auth)' },
        { id: 3, x: 500, y: 150, inputs: 1, outputs: 1, header: 'Auth Service', content: 'AWS Cognito User Pool' },
        { id: 4, x: 500, y: 250, inputs: 1, outputs: 1, header: 'Business Logic', content: 'AWS Lambda Functions' },
        { id: 5, x: 700, y: 200, inputs: 2, outputs: 0, header: 'Datastore', content: 'Amazon DynamoDB' }
      ],
      edges: [
        { startNodeIndex: 1, endNodeIndex: 2, outputTarget: 1, inputTarget: 1 },
        { startNodeIndex: 2, endNodeIndex: 3, outputTarget: 1, inputTarget: 1 },
        { startNodeIndex: 3, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
        { startNodeIndex: 4, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 }
      ],
      nodeCss: 'background-color: #e8f0fe; width: 140px;',
      headerCss: 'background-color: #1976d2; color: white; font-size: 13px;',
      cssImports: [],
      flowCss: 'background-color: #f5f5f5;'
    };

    const chart = new FlowChart(config);
    this.appendChild(chart);
  }
}

customElements.define('microservices-page', MicroservicesPage);
