import { Position } from "../Board";
import NodeComponent, { NodeComponentProps } from "../NodeComponent";
import styles from "./styles.module.css";

export interface NodeProps {
    id: string;
    data: { label?: string; content: any };
    inputs: number;
    outputs: number;
    actions?: { delete: boolean };
}

export interface Props {
    nodesPositions: { x: number; y: number }[];
    nodes: NodeProps[];
    onNodeMount: (values: {
        nodeIndex: number;
        inputs: { offset: { x: number; y: number } }[];
        outputs: { offset: { x: number; y: number } }[];
    }) => void;
    onNodePress: (x: number, y: number) => void;
    onNodeMove: (nodeIndex: number, x: number, y: number) => void;
    onNodeDelete: (nodeId: string) => void;
    onOutputMouseDown: (nodeIndex: number, outputIndex: number) => void;
    onInputMouseUp: (nodeIndex: number, inputIndex: number) => void;
    onMouseUp: () => void;
    onMouseMove: (x: number, y: number) => void;
}

export default class NodesBoard extends HTMLElement {
    grabbing: number | null = null;
    set setGrabbing(value: number | null){
        this.grabbing = value;
    }

    selected: number | null = null;
    set setSelected(value: number | null) {
        this.selected = value;
    }
    props: Props;
    scene: HTMLElement;
    set setScene(scene: HTMLElement) {
        this.scene = scene;
    }
    constructor(props: Props) {
        super();        
        this.props = props;        
        var scene = document.createElement('div')
        scene.addEventListener('mousemove', (ev) => this.handleOnMouseMoveScene(ev, scene))
        scene.addEventListener('mouseup', (ev) => this.handleOnMouseUpScene(ev, props))
        this.className = styles.main
        this.render(scene);
    }

    render(scene: HTMLElement): void {
        
        this.props.nodes.forEach((node, index) => {
            var props: NodeComponentProps = {
                id: node.id,
                x:this.props.nodesPositions[index].x,
                y:this.props.nodesPositions[index].y,
                selected:this.selected === index,
                label:node.data.label,
                content:node.data.content,
                inputs:node.inputs,
                outputs:node.outputs,
                onNodeMount: (inputs: { offset: { x: number; y: number } }[], outputs: { offset: { x: number; y: number } }[]) =>
                    this.props.onNodeMount({                            
                        nodeIndex: index,
                        inputs: inputs.map((values: { offset: { x: number; y: number } }) => {     
                            
                            return {
                                offset: {
                                    x: values.offset.x - scene.getBoundingClientRect().x - this.props.nodesPositions[index].x + 6,
                                    y: values.offset.y - scene.getBoundingClientRect().y - this.props.nodesPositions[index].y + 6,
                                },
                            };
                        }),
                        outputs: outputs.map((values: { offset: { x: number; y: number } }) => {
                            return {
                                offset: {
                                    x: values.offset.x - scene.getBoundingClientRect().x - this.props.nodesPositions[index].x + 6,
                                    y: values.offset.y - scene.getBoundingClientRect().y - this.props.nodesPositions[index].y + 6,
                                },
                            };
                        }),
                }),
                onMouseDown: (event: MouseEvent):Position => {
                    return this.handleOnMouseDownNode(index, event.x, event.y, this.props, scene)
                },
                onMouseUp: (event: MouseEvent) => {
                    this.handleOnMouseUpScene(event, this.props)
                },
                
                onMouseDownOutput: (outputIndex: number) => this.props.onOutputMouseDown(index, outputIndex),
                onMouseUpInput: (inputIndex: number) => this.props.onInputMouseUp(index, inputIndex),
                onClickOutside: () => {
                    if (index === this.selected) this.setSelected = null;
                },
                onClickDelete: () => {
                    this.setSelected = null ;
                    this.props.onNodeDelete(node.id);
                },
            }
            var nodeComp = new NodeComponent(props)
            
            scene.append(nodeComp);
        })
        this.appendChild(scene)
        this.scene = scene;
    }
    handleOnMouseMoveScene(event: any, scene:HTMLElement) {
        if (this.selected != null) {
        const x = event.x - scene.getBoundingClientRect().x;
        const y = event.y - scene.getBoundingClientRect().y;
        if (this.grabbing !== null) {
            this.props.onNodeMove(this.grabbing || 0, x, y);
        }
        
        this.props.onMouseMove(x, y);
    }
    }

    handleOnMouseUpScene(event: any, props:Props) {
        this.setGrabbing = null;

        this.setSelected = null;
        props.onMouseUp();
    }

    handleOnMouseDownNode(index: number, x: number, y: number, props:Props, scene: HTMLElement):Position {
        this.setGrabbing = index;
        this.setSelected = index;
        props.onNodePress(
            x - scene.getBoundingClientRect().x - props.nodesPositions[index].x,
            y - scene.getBoundingClientRect().y - props.nodesPositions[index].y
        );
        props.onNodeMove(index, x, y);
        return {x:x, y:y}
    }
};

customElements.define('nodes-board', NodesBoard)