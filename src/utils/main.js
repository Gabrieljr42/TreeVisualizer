import * as d3 from 'd3';

// * Regras Desativadas
/* eslint-disable indent */

/**
 * Função para criar um campo de input de arquivo e processar seu conteúdo.
 */
export function inputFile() {
  const inputFile = document.createElement('input');
  inputFile.type = 'file';
  inputFile.accept = '.txt';

  inputFile.addEventListener('change', function () {
    const selectedFile = inputFile.files[0];

    const reader = new FileReader();
    reader.onload = function (event) {
      const fileContent = event.target.result;
      const matrix = fileContent.trim().split(';').map(row => row.split(',').map(Number));

      const graphData = matrix.filter(row => row.length > 1);

      console.log(graphData);
      createGraph(graphData);
    };

    reader.readAsText(selectedFile);
  });

  inputFile.click();
}

/**
 * Função para criar um gráfico de rede com base em uma matriz de adjacência.
 * @param {Array} matrix - A matriz de adjacência representando o grafo.
 */
function createGraph(matrix) {
  
  const width = 1800;
  const height = 450; 
  const nodeRadius = 20; 
  const linkStrokeWidth = 8;
  const linkDistance = 90; 

  const nodes = [];
  const links = [];

  matrix.forEach((row, i) => {
    
    nodes.push({ id: i });

    row.forEach((cell, j) => {
      if (i < j && cell !== 0) {
        links.push({
          source: i,
          target: j,
          value: cell 
        });
      }
    });
  });

  const svg = d3.select('main').append('svg')
      .attr('width', width)
      .attr('height', height);

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(linkDistance))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2));


  const link = svg.append('g')
      .attr('stroke', '#ffffff')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', linkStrokeWidth);

  
  const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .attr('z-index', 1)
      .enter().append('circle')
      .attr('r', nodeRadius)
      .attr('fill', '#007bff')
      .call(d3.drag()  // Habilita o arrastar para os nós
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));
  
  // Funções para lidar com eventos de arrastar
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  const labels = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .enter().append('text')
    .text(d => d.id)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle'); 

  simulation.on('tick', () => {
    link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

    labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);

    svg.selectAll('.distance-label')
        .data(links)
        .join(
            enter => enter.append('text')
                .attr('class', 'distance-label')
                .attr('fill', '#000') 
                .text(d => d.value)
                .attr('text-anchor', 'middle')
                .attr("font-size", "10px")
                .attr('dy', '0.45em'),

            update => update,
            exit => exit.remove()
        )
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);
  });

  d3.select('main').append('button')
  .text('Gerar MST')
  .on('click', generateMST)
  .attr('class', 'cvrzMj')
  .style('padding', '1rem')
  .style('border-radius', '1px')
  .style('font-size', '1.2rem')
  .style('line-height', '0')
  .style('color', '#000000')
  .style('outline', 'none')
  .style('border', 'none')
  .style('-webkit-transition', '0.1s')
  .style('transition', '0.1s')
  .style('cursor', 'pointer')
  .style('font-family', 'monospace')
  .style('font-weight', 'bold')
  .style('background-color', '#ffffff');

  /**
   * Função para gerar a Árvore de Abrangência Mínima (MST) usando o algoritmo de Kruskal.
   */
  function generateMST() {
    
    const mstEdges = kruskalMST(nodes, links);
  
    // Atualiza a aparência do gráfico para destacar a MST
    svg.selectAll('line')
      .filter(d => !mstEdges.includes(d))
      .attr('class', 'old-line') 
      .attr('stroke', 'white')
      .attr('stroke-opacity', 0.4); 
  
    svg.selectAll('.distance-label')
      .filter(d => !mstEdges.includes(d))
      .remove();
  
    // Atualiza as arestas na simulação para incluir apenas as da MST
    simulation.force('link').links(mstEdges);
  }
}

/**
 * Função para calcular a Árvore de Abrangência Mínima (MST) usando o algoritmo de Kruskal.
 * @param {Array} nodes - Lista de nós no grafo.
 * @param {Array} links - Lista de arestas no grafo.
 * @returns {Array} - Lista de arestas que compõem a MST.
 */
function kruskalMST(nodes, links) {
  // Cria uma nova lista de arestas para a MST
  const mstLinks = [];

  // Cria uma "floresta" (um conjunto de árvores), onde cada vértice no grafo é uma árvore separada
  const forest = new Map(nodes.map(node => [node.id, node]));

  // Cria um mapa para armazenar o "nome" da árvore de cada nó
  const name = new Map(nodes.map(node => [node.id, node.id]));

  // Função para verificar se dois nós estão na mesma árvore
  const connected = (a, b) => name.get(a.id) === name.get(b.id);

  // Função para unir duas árvores
  const union = (a, b) => {
    const aName = name.get(a.id);
    const bName = name.get(b.id);

    // Une as árvores
    for (const node of forest.values()) {
      if (name.get(node.id) === bName) {
        name.set(node.id, aName);
      }
    }
  };
  
  // Ordena as arestas por peso (ascendente)
  links.sort((a, b) => a.value - b.value);
  
  // Adiciona cada aresta à MST (se não criar um ciclo)
  for (const link of links) {
    if (!connected(link.source, link.target)) {
      mstLinks.push(link);
      union(link.source, link.target);
    }
  }

  return mstLinks;
}
