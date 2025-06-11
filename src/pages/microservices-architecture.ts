// 1. Componente Modal Editável
class EditableModal extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="modal-backdrop" style="
        position:fixed;top:0;left:0;width:100vw;height:100vh;
        background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:1000;">
        <div class="modal-content" style="
          background:#fff;padding:24px 32px;border-radius:8px;min-width:320px;max-width:90vw;position:relative;">
          <button id="close-modal" style="
            position:absolute;top:8px;right:8px;background:none;color:#000;border:none;font-size:20px;cursor:pointer;">&times;</button>
          <div id="modal-body"></div>
        </div>
      </div>
    `;
    this.querySelector('#close-modal')?.addEventListener('click', () => this.remove());
  }
  setContent(html: string) {
    const body = this.querySelector('#modal-body');
    if (body) body.innerHTML = html;
  }
}
customElements.define('editable-modal', EditableModal);

// 2. Página Microservices com modal editável
import { FlowChart, FlowChartConfig } from '../../packages/vanilla-flow/src/index';
import { styleAwsNode } from '../utils/node-factory';
import { NodeProps } from '../interfaces/node-props';
import dynamo from '../assets/aws-dynamodb-icon.png';
import lambda from '../assets/aws-lambda-icon.png';
import cognito from '../assets/aws-cognito-icon.png';
import apigateway from '../assets/aws-api-gateway-icon.png';
import cloudfront from '../assets/aws-cloudfront-icon.jpeg';

export class MicroservicesPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section style="padding:20px;">
        <h2>Arquitetura de Microsserviços AWS</h2>
      </section>
    `;
    const baseNodes: NodeProps[] = [
      {
        id: 1, x: 100, y: 200, inputs: 0, outputs: 1, header: '',
        content: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <img src="${cloudfront}" height="50px"/>
            <span>Aplicação React</span>
          </div>`,
        data: {
          auth: true,
          connection_interface: "arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_aBcDeFGHi"
        }
      },
      {
        id: 2, x: 300, y: 200, inputs: 1, outputs: 1, header: '',
        content: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <img src="${apigateway}" height="50px" />
            <span>AWS API Gateway</span>
          </div>`,
        data: {
          auth: true,
          connection_interface: "arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_aBcDeFGHi"
        }
      },
      {
        id: 3, x: 500, y: 150, inputs: 1, outputs: 1, header: '',
        content: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <img src="${cognito}" height="50px" />
            <span>Amazon Cognito</span>
          </div>`,
        data: {
          auth: true,
          connection_interface: "arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_aBcDeFGHi"
        }
      },
      {
        id: 4, x: 700, y: 250, inputs: 1, outputs: 1, header: '',
        content: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <img src="${lambda}" height="50px" />
            <span>Amazon Lambda</span>
          </div>`,
        data: {
          auth: true,
          connection_interface: "arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_aBcDeFGHi"
        }
      },
      {
        id: 5, x: 950, y: 200, inputs: 1 , outputs: 0, header: '',
        content: `
          <div style="display: flex; flex-direction: column; align-items: center;">
            <img src="${dynamo}" height="50px" />
            <span>Amazon DynamoDB</span>
          </div>`,
        data: {
          auth: true,
          connection_interface: "arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_aBcDeFGHi"
        }
      }
    ];
    const nodesConfig = baseNodes.map(styleAwsNode);
    const edgesConfig = [
      { startNodeIndex: 1, endNodeIndex: 2, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 2, endNodeIndex: 3, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 3, endNodeIndex: 4, outputTarget: 1, inputTarget: 1 },
      { startNodeIndex: 4, endNodeIndex: 5, outputTarget: 1, inputTarget: 1 }
    ];
    const config: FlowChartConfig = {
      nodes: nodesConfig,
      edges: edgesConfig,
      nodeCss: 'background-color: #e8f0fe; width: 140px; border-radius: 10%;',
      headerCss: 'background-color: #1976d2; color: white; font-size: 13px;',
      cssImports: [`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`],
      flowCss: 'background-color: #f5f5f5;',
      onNodeClick: (node) => this.openModal(node)
    };
    const chart = new FlowChart(config);
    this.appendChild(chart);
  }

  // Função para gerar o HTML do modal editável
  getModalHtml(node: any) {
    const data = node.props.data || {};
    let html = `<h3>Detalhes do Node</h3>`;
    html += node.props.content;
    html += `<h4 style="margin-top:16px;">Data (editável):</h4>`;
    html += `<form id="data-form">`;
    html += `
      <div style="margin-bottom:10px;">
        <label style="font-weight:bold;">auth:</label>
        <input type="checkbox" name="auth" ${data.auth ? 'checked' : ''} />
      </div>
    `;
    html += `
      <div style="margin-bottom:10px;">
        <label style="font-weight:bold;">connection_interface:</label>
        <input type="text" name="connection_interface" value="${data.connection_interface || ''}" style="width:100%;padding:4px 8px;margin-top:2px;" />
      </div>
    `;
    html += `
      <div style="margin-top:12px;text-align:right;">
        <button type="submit" style="padding:6px 18px;background:#1976d2;color:#fff;border:none;border-radius:4px;cursor:pointer;">Salvar</button>
      </div>
    </form>`;
    return html;
  }

  openModal(node: any) {
    const modal = document.createElement('editable-modal') as EditableModal;
    document.body.appendChild(modal);

    // Função para atualizar o conteúdo e reanexar o event listener
    const renderModalContent = () => {
      modal.setContent(this.getModalHtml(node));
      // Reanexar o event listener do form
      modal.querySelector('#data-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const newData: Record<string, any> = {};
        newData.auth = formData.get('auth') === 'on';
        newData.connection_interface = formData.get('connection_interface') || '';
        if (typeof node.setData === 'function') {
          node.setData(newData);
        } else {
          node.props.data = newData;
        }
        // Atualiza o conteúdo do modal com os dados atualizados
        renderModalContent();
        alert('Data atualizado com sucesso!');
      });
    };

    renderModalContent();
  }
}
customElements.define('microservices-page', MicroservicesPage);