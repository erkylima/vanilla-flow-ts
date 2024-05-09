import styles from './styles.module.css'
export interface EdgeComponentProps {
    selected: boolean;
    isNew: boolean;
    position: { x0: number; y0: number; x1: number; y1: number };
    onClickEdge: () => void;
    onClickDelete: () => void;
    onClickOutside: () => void;
}

export interface Position{ x: number; y: number }

export default class EdgeComponent extends HTMLElement {
    props:EdgeComponentProps
    middlePoint:Position
    path:SVGPathElement

    constructor(props: EdgeComponentProps) {
        super();        
        this.props = props;        
        if (this.props){
            this.middlePoint = {
                x: props.position.x0 + (props.position.x1 - props.position.x0) / 2,
                y: props.position.y0 + (props.position.y1 - props.position.y0) / 2,
            };

            
            this.render();
        }
    }

    setMiddlePoint(middlePoint:Position){
        this.middlePoint = middlePoint;
    }
    render(){
        if(this.props){
            const middleX = this.props.position.x0 + (this.props.position.x1 - this.props.position.x0) / 2;
            const middleY = this.props.position.y0 + (this.props.position.y1 - this.props.position.y0) / 2;
            this.setMiddlePoint({
                x: middleX,
                y: middleY,
            })
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            var m = `${this.props.position.x0} ${this.props.position.y0}`
            var c = `${
                this.props.position.x0 + this.calculateOffset(Math.abs(this.props.position.x1 - this.props.position.x0))
            } ${this.props.position.y0}, ${this.props.position.x1 - this.calculateOffset(Math.abs(this.props.position.x1 - this.props.position.x0))} ${
                this.props.position.y1
            }, ${this.props.position.x1} ${this.props.position.y1}`
            
            var d = "M " + m + " C " + c
            path.setAttribute("class", this.props.isNew ? styles.edgeNew : this.props.selected ? styles.edgeSelected : styles.edge);
            path.setAttribute('d',d);
            
            path.onclick = ((ev) => this.props.onClickEdge());
            // this.appendChild(path)
            // this.innerHTML = `<path d="${d}" class="${styles.edge}"></path>`
           this.path = path;

        }
    }
    getPath():SVGPathElement {
        return this.path
    }

    calculateOffset(value: number): number {
        return (value * 100) / 200;
    }
            
}


customElements.define("edge-component", EdgeComponent)