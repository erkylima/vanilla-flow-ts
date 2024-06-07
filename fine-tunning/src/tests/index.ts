import {beforeEach, describe, expect, it, test} from '@jest/globals';
import { NodeComponent } from '../components/NodeComponent';
import { EdgesComponent } from '../components/EdgesComponent';


describe('NodeComponent', () => {
  let nodeComponent;

  beforeEach(() => {
    const props = {
      id: 1,
      x: 50,
      y: 50,
      inputs: 2,
      outputs: 2,
      flowChart: null // Mock flowchart object
    };
    nodeComponent = new NodeComponent(props);
  });

  it('should render inputs and outputs correctly', () => {
    expect(nodeComponent.inputsElement.length).toBe(2);
    expect(nodeComponent.outputsElement.length).toBe(2);
  });

  it('should toggle active class on double click', () => {
    const nodeElement = nodeComponent.shadowRoot.querySelector('div');
    expect(nodeElement.classList.contains('active')).toBe(false);
    nodeElement.dispatchEvent(new MouseEvent('dblclick'));
    expect(nodeElement.classList.contains('active')).toBe(true);
    nodeElement.dispatchEvent(new MouseEvent('dblclick'));
    expect(nodeElement.classList.contains('active')).toBe(false);
  });

  it('should move node when dragged', () => {
    const nodeElement = nodeComponent.shadowRoot.querySelector('div');
    const initialX = nodeComponent.props.x;
    const initialY = nodeComponent.props.y;
    const mouseDownEvent = new MouseEvent('mousedown', { clientX: 100, clientY: 100 });
    const mouseMoveEvent = new MouseEvent('mousemove', { clientX: 200, clientY: 200 });
    const mouseUpEvent = new MouseEvent('mouseup');
    
    nodeElement.dispatchEvent(mouseDownEvent);
    document.dispatchEvent(mouseMoveEvent);
    document.dispatchEvent(mouseUpEvent);
    
    expect(nodeComponent.props.x).toBe(initialX + 100); // Assuming 1px = 1 unit
    expect(nodeComponent.props.y).toBe(initialY + 100);
  });

  
});

describe('EdgesComponent', () => {
  let edgesComponent: EdgesComponent;
  let nodeComponent: NodeComponent;
  let nodeComponent2: NodeComponent;

  beforeEach(() => {
    const props = {
      actives: [],
      flowchart: null // Mock flowchart object
    };
    edgesComponent = new EdgesComponent(props);
    nodeComponent = new NodeComponent({
        id: 1,
        x: 50,
        y: 50,
        inputs: 2,
        outputs: 2,
        flowChart: null    
    });
    nodeComponent2 = new NodeComponent({
        id: 2,
        x: 50,
        y: 50,
        inputs: 2,
        outputs: 2,
        flowChart: null 
      });
    })


  it('should initialize with empty actives array', () => {
    expect(edgesComponent.props.actives.length).toBe(0);
  });

  // Add more test cases as needed
});
