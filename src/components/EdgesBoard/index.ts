import EdgeComponent, { EdgeComponentProps } from "../EdgeComponent";
import styles from "./styles.module.css";
export interface Vector {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

export interface EdgesPositions {
    [id: string]: Vector;    
}

export interface EdgesActive {
    [id: string]: boolean;
}

interface EdgeBoardProps {
    newEdge: { position: Vector; sourceNode: number; sourceOutput: number } | null;
    edgesActives: EdgesActive;
    edgesPositions: EdgesPositions;
    onDeleteEdge: (edgeId: string) => void;
}
export class EdgesBoard extends HTMLElement {
    ids: string[] = []
    set setIds(ids: string[]){
        this.ids = ids;
    }
    selected: string = "null";
    set setSelected(id: string){
        this.selected = id;
    }
    props: EdgeBoardProps
    constructor(props:EdgeBoardProps){
        super();
        this.props = props;
        var newIds = Object.keys(this.props.edgesActives).filter((elem:string) => this.props.edgesActives[elem]);
        this.setIds = newIds;
        
        if (this.selected !== "null" && this.props.newEdge !== null){                 
            this.setSelected = "null";
    
        }
        this.render();
    }

    connectedCallback() {
        
    }

    render() {
        if(this.props){
            
            let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", styles.main);
            
            this.ids.forEach((edgeId: string) => {
                
                if (this.props.edgesActives[edgeId])
                    var props: EdgeComponentProps = {
                        id: edgeId,
                        selected: this.selected === edgeId,
                        position: {
                            x0: this.props.edgesPositions[edgeId]?.x0 || 0,
                            y0: this.props.edgesPositions[edgeId]?.y0 || 0,
                            x1: this.props.edgesPositions[edgeId]?.x1 || 0,
                            y1: this.props.edgesPositions[edgeId]?.y1 || 0,
                        },
                        isNew: false,
                        onClickDelete: () => {
                            this.props.onDeleteEdge(edgeId);
                        },
                        onClickOutside: () => {
    
                        },
                        onClickEdge: () => {
                            this.setSelected = edgeId;
    
                        }
    
                    };
                    const edge = new EdgeComponent(props)
                    svg.append(edge.getPath())
                    
            });
            if (this.props.newEdge !== null) {
                
                var props: EdgeComponentProps = {
                    
                    selected: false,                      
                    position: {
                        x0: this.props.newEdge.position.x0,
                        y0: this.props.newEdge.position.y0,
                        x1: this.props.newEdge.position.x1,
                        y1: this.props.newEdge.position.y1,
                    },
                    isNew: true,
                    onClickDelete: () => {
                    },
                    onClickOutside: () => {
                    },
                    onClickEdge: () => {
                    }
    
                };
                const edge = new EdgeComponent(props)
                svg.append(edge.getPath());
            }        
            this.append(svg)

        }
        
    }
}    

customElements.define("edges-board", EdgesBoard);

export default EdgesBoard;
