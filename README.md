
# Biblioteca UI Node Based para Criação de Páginas de Fluxo

Este projeto é uma biblioteca UI baseada em Web Components e TypeScript, projetada para facilitar a criação de páginas de fluxo em aplicações web. Ele fornece componentes reutilizáveis e customizáveis que podem ser facilmente integrados em qualquer projeto web.

## Pré-visualização

![Preview 1](https://github.com/erkylima/vanilla-flow-ts/blob/main/images/preview1.png?raw=true)

## Instalação

Para começar a usar a biblioteca, você pode instalá-la via npm ou yarn:

`npm install vanilla-flow-ts` ou `yarn add vanilla-flow-ts`

## Uso

Após a instalação, você pode importar os componentes desejados em seu projeto e começar a usá-los. Por exemplo:
```typescript
import { FlowChart, FlowChartConfig } from "vanilla-flow-ts";

const nodesConfig = [
    { id: 1, x: 200, y: 160, inputs: 0, outputs: 2 },
    { id: 2, x: 400, y: 260, inputs: 1, outputs: 1 },
    { id: 3, x: 400, y: 60, inputs: 1, outputs: 1 },
    { id: 4, x: 700, y: 160, inputs: 2, outputs: 2 },
    { id: 5, x: 1000, y: 160, inputs: 1, outputs: 0 },
    { id: 6, x: 1200, y: 260, inputs: 1, outputs: 0 },
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
};

const flowChart = new FlowChart(flowChartConfig);
document.body.appendChild(flowChart);
```

## Desenvolvimento

Para iniciar o desenvolvimento local, siga estas etapas:

1. Clone este repositório:

git clone https://github.com/erkylima/vanilla-flow-ts.git

2. Navegue até o diretório do projeto:

cd vanilla-flow-ts

3. Instale as dependências:

yarn install

4. Inicie o ambiente de desenvolvimento:

yarn dev

Este comando iniciará um servidor de desenvolvimento local e abrirá automaticamente o seu navegador padrão com a aplicação em execução.

## Build

Para construir a biblioteca para produção, execute o seguinte comando:

yarn build

Isso criará uma versão otimizada da biblioteca na pasta `dist`, pronta para ser utilizada em produção.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir problemas (issues) ou enviar pull requests com melhorias.

Para publicar, é necessário executar os comandos:

yarn build

## Licença

Este projeto está licenciado sob a MIT License.
