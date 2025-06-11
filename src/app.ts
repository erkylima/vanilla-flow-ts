import { HomePage } from './pages/home';
import { MicroservicesPage } from './pages/microservices-architecture';
import { BatchProcessingPage } from './pages/batch-processing';
import { MicrofrontendsPage } from './pages/microfrontends-composition';

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

    // Header
    const header = document.createElement('header');
    header.innerHTML = '<h1>FlowOps</h1>';
    header.style.cssText = `
      grid-column: 1 / -1;
      background-color: #3f51b5;
      color: white;
      padding: 16px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;
    container.appendChild(header);

    // Sidebar navigation
    const sidebar = document.createElement('aside');
    sidebar.innerHTML = `
      <ul class="menu">
        <li><a href="#home">Home</a></li>
        <li class="dropdown">
          <span class="dropdown-toggle">Workflows ▼</span>
          <ul class="dropdown-menu">
            <li><a href="#microservices">Arquitetura de Microsserviços AWS</a></li>
            <li><a href="#batch">Processamento Batch com Workers</a></li>
            <li><a href="#microfrontends">Composição de Micro Frontends</a></li>
          </ul>
        </li>
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

    // Dropdown styles
    const style = document.createElement('style');
    style.textContent = `
      .dropdown-toggle {
        cursor: pointer;
        user-select: none;
      }
      .dropdown-menu {
        list-style: none;
        padding-left: 15px;
        margin: 5px 0 0;
        display: none;
      }
      .dropdown.open .dropdown-menu {
        display: block;
      }
      .dropdown-menu li {
        margin-bottom: 5px;
      }
      .menu, .menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .menu li {
        margin-bottom: 10px;
      }
      .menu a {
        text-decoration: none;
        color: inherit;
      }
    `;
    sidebar.appendChild(style);

    // Dropdown toggle event
    const dropdown = sidebar.querySelector('.dropdown') as HTMLElement;
    const toggleBtn = sidebar.querySelector('.dropdown-toggle') as HTMLElement;
    toggleBtn.addEventListener('click', () => {
      dropdown.classList.toggle('open');
    });

    // Content area
    const contentArea = document.createElement('main');
    contentArea.style.cssText = `
      padding: 20px;
      overflow: auto;
      background-color: #ffffff;
    `;
    container.appendChild(contentArea);

    const pages: Record<string, HTMLElement> = {
      home: new HomePage(),
      microservices: new MicroservicesPage(),
      batch: new BatchProcessingPage(),
      microfrontends: new MicrofrontendsPage()
    };

    const loadPage = () => {
      const hash = location.hash.substring(1) || 'home';
      contentArea.innerHTML = '';
      const page = pages[hash];
      if (page) {
        contentArea.appendChild(page);
      } else {
        contentArea.appendChild(pages['home']);
      }
    };

    window.addEventListener('hashchange', loadPage);
    loadPage();
  }
}

customElements.define('root-app', App);
