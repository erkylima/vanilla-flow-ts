import { FlowChart } from '../../packages/vanilla-flow/src/index';

export interface NodeProps {
    id: number;
    x: number;
    y: number;
    inputs: number;
    outputs: number;
    header?: string;
    content?: string;
    flowChart?: FlowChart;
    cssImports?: string[];
    iconCss?: string;
    nodeCss?: string;
    nodeHoverCss?: string;
    nodeActiveCss?: string;
    headerCss?: string;
    contentCss?: string;
    data?: Record<string, unknown>;
}
