import { NodeProps } from '../interfaces/node-props';

interface StyleConfig {
  match: RegExp;
  nodeCss: string;
  nodeHoverCss?: string;
  nodeActiveCss?: string;
  headerCss: string;
  cssImports?: string[];
  iconCss?: string;
}

const styleConfigs: StyleConfig[] = [
  {
    match: /dynamodb/i,
    nodeCss: `border-radius: 10%`,
    
    headerCss: 'background-color:rgba(255, 179, 0, 0); color: white; ',
    iconCss: 'fa-database'
  },
  {
    match: /s3/i,
    nodeCss: 'background-color: #bbdefb; border-radius: 50%;',
    headerCss: 'background-color: #64b5f6; color: white;',
    iconCss: 'fa-hdd'
  },
  {
    match: /lambda/i,
    nodeCss: 'background-color:rgb(255, 255, 255); border-radius: 10%;',
    headerCss: 'background-color:rgb(247, 247, 247); color: white; font-size: 13px;',
    iconCss: 'fa-bolt'
  },
  {
    match: /api gateway/i,
    nodeCss: 'background-color:rgb(255, 255, 255); border-radius: 10%;',
    headerCss: 'background-color: #388e3c; color: white; font-size: 13px;',
    iconCss: 'fa-network-wired'
  },
  {
    match: /batch/i,
    nodeCss: 'background-color: #ffe0b2; border-radius: 10%;',
    headerCss: 'background-color: #fb8c00; color: white; font-size: 13px;',
    iconCss: 'fa-cogs'
  },
  {
    match: /redshift/i,
    nodeCss: 'background-color: #f3e5f5; border-radius: 10%;',
    headerCss: 'background-color: #ab47bc; color: white; font-size: 13px;',
    iconCss: 'fa-chart-bar'
  },
  {
    match: /sns/i,
    nodeCss: 'background-color: #fff9c4; border-radius: 10%;',
    headerCss: 'background-color: #fdd835; color: white; font-size: 13px;',
    iconCss: 'fa-comment-alt'
  }
];

export function styleAwsNode(node: NodeProps): NodeProps {
  
  for (const cfg of styleConfigs) {
    if (node.content && cfg.match.test(node.content)) {
      if (/dynamodb/i.test(node.content) || /redshift/i.test(node.content)) {
        return {
          ...node,
          nodeCss: cfg.nodeCss,
          headerCss: cfg.headerCss,
          content: `${node.content}`,
        };
      }
      return {
        ...node,
        nodeCss: cfg.nodeCss,
        headerCss: cfg.headerCss,
        iconCss: cfg.iconCss
      };
    }
  }
  return node;
}
