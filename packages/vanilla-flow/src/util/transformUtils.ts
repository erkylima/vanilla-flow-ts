export interface TransformConfig {
    scale: number;
    translateX: number;
    translateY: number;
  }
  
  /**
   * Converte coordenadas de tela para o espaço transformado do FlowChart.
   * @param x Coordenada X em pixels (espaço de tela)
   * @param y Coordenada Y em pixels (espaço de tela)
   * @param containerRect BoundingClientRect do contêiner
   * @param transform Configuração de transformação
   * @returns Coordenadas no espaço do FlowChart
   */
  export function screenToFlowCoords(
    x: number,
    y: number,
    containerRect: DOMRect,
    transform: TransformConfig
  ): { x: number; y: number } {
    return {
      x: (x - containerRect.left - transform.translateX) / transform.scale,
      y: (y - containerRect.top - transform.translateY) / transform.scale,
    };
  }
  
  /**
   * Converte coordenadas do FlowChart para o espaço de tela.
   * @param x Coordenada X no espaço do FlowChart
   * @param y Coordenada Y no espaço do FlowChart
   * @param transform Configuração de transformação
   * @returns Coordenadas em pixels (espaço de tela)
   */
  export function flowToScreenCoords(
    x: number,
    y: number,
    transform: TransformConfig
  ): { x: number; y: number } {
    return {
      x: x * transform.scale + transform.translateX,
      y: y * transform.scale + transform.translateY,
    };
  }