export class HomePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = ` 
      <section style="padding:20px;">
        <h2>Bem-vindo ao FlowOps</h2>
        <p>Selecione um workflow no menu lateral para visualizar os fluxos de arquitetura distribuída AWS.</p>
      </section>
    `;
  }
}
customElements.define('home-page', HomePage);
