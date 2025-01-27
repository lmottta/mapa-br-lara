// Configuração inicial
let isStateMode = true;
let isSoundEnabled = true;
let isFullscreen = false;
const synth = window.speechSynthesis;

// Cores para as regiões
const regionColors = {
    'Norte': '#7CB342',
    'Nordeste': '#FB8C00',
    'Centro-Oeste': '#FDD835',
    'Sudeste': '#F4511E',
    'Sul': '#42A5F5'
};

// Mapeamento de estados para regiões
const stateToRegion = {
    'AC': 'Norte', 'AM': 'Norte', 'AP': 'Norte', 'PA': 'Norte', 'RO': 'Norte', 'RR': 'Norte', 'TO': 'Norte',
    'AL': 'Nordeste', 'BA': 'Nordeste', 'CE': 'Nordeste', 'MA': 'Nordeste', 'PB': 'Nordeste', 
    'PE': 'Nordeste', 'PI': 'Nordeste', 'RN': 'Nordeste', 'SE': 'Nordeste',
    'DF': 'Centro-Oeste', 'GO': 'Centro-Oeste', 'MT': 'Centro-Oeste', 'MS': 'Centro-Oeste',
    'ES': 'Sudeste', 'MG': 'Sudeste', 'RJ': 'Sudeste', 'SP': 'Sudeste',
    'PR': 'Sul', 'RS': 'Sul', 'SC': 'Sul'
};

// Nomes completos dos estados
const stateNames = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia', 
    'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás', 
    'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais', 
    'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí', 
    'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul', 
    'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo', 
    'SE': 'Sergipe', 'TO': 'Tocantins'
};

// Função para falar o texto
function speak(text) {
    if (!isSoundEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    synth.speak(utterance);
}

// Função para alternar tela cheia
function toggleFullscreen() {
    const container = document.querySelector('.container');
    isFullscreen = !isFullscreen;
    
    if (isFullscreen) {
        container.classList.add('fullscreen');
        document.getElementById('toggleFullscreen').innerHTML = '🔳 Sair da Tela Cheia';
    } else {
        container.classList.remove('fullscreen');
        document.getElementById('toggleFullscreen').innerHTML = '📺 Tela Cheia';
    }
    
    // Atualiza o mapa para se ajustar ao novo tamanho
    updateMapSize();
}

// Função para atualizar o tamanho do mapa
function updateMapSize() {
    const container = document.querySelector('.container');
    const mapContainer = document.getElementById('map-container');
    const svg = d3.select('#map-container svg');
    
    if (isFullscreen) {
        const width = mapContainer.clientWidth;
        const height = mapContainer.clientHeight;
        svg.attr('width', width)
           .attr('height', height)
           .attr('viewBox', `0 0 ${width} ${height}`);
    } else {
        svg.attr('width', 800)
           .attr('height', 600)
           .attr('viewBox', '0 0 800 600');
    }
}

// Função para criar as legendas
function createLegends() {
    // Legenda das regiões
    const regionItems = document.getElementById('region-items');
    regionItems.innerHTML = '';
    Object.entries(regionColors).forEach(([region, color]) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="color-box" style="background-color: ${color}"></div>
            <span class="state-name">${region}</span>
        `;
        regionItems.appendChild(item);
    });

    // Legenda dos estados
    const stateItems = document.getElementById('state-items');
    stateItems.innerHTML = '';
    Object.entries(stateNames).forEach(([sigla, nome]) => {
        const region = stateToRegion[sigla];
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="color-box" style="background-color: ${d3.color(regionColors[region]).brighter(Math.random())}"></div>
            <span class="state-name">${nome}</span>
            <span class="state-info">(${sigla})</span>
        `;
        item.addEventListener('click', () => {
            speak(isStateMode ? nome : `Região ${region}`);
        });
        stateItems.appendChild(item);
    });
}

// Função para mostrar tooltip
function showTooltip(event, d) {
    const tooltip = document.getElementById('tooltip');
    const stateId = d.properties.sigla;
    const stateName = stateNames[stateId];
    const region = stateToRegion[stateId];
    
    tooltip.innerHTML = `
        <strong>${stateName}</strong> (${stateId})<br>
        Região: ${region}
    `;
    
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 10) + 'px';
}

// Função para esconder tooltip
function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}

// Event Listeners
document.getElementById('toggleMode').addEventListener('click', () => {
    isStateMode = !isStateMode;
    document.getElementById('currentMode').textContent = `Modo atual: ${isStateMode ? 'Estados' : 'Regiões'}`;
    updateMapColors();
});

document.getElementById('playSound').addEventListener('click', function() {
    isSoundEnabled = !isSoundEnabled;
    this.innerHTML = isSoundEnabled ? '🔊 Ativar Som' : '🔈 Som Desativado';
    speak('Som ' + (isSoundEnabled ? 'ativado' : 'desativado'));
});

document.getElementById('toggleFullscreen').addEventListener('click', toggleFullscreen);

// Função para atualizar as cores do mapa
function updateMapColors() {
    d3.selectAll('path')
        .transition()
        .duration(500)
        .style('fill', function() {
            const stateId = this.id;
            if (isStateMode) {
                const region = stateToRegion[stateId];
                return d3.color(regionColors[region]).brighter(Math.random());
            } else {
                return regionColors[stateToRegion[stateId]];
            }
        });
    createLegends();
}

// Função para adicionar rótulos aos estados
function addStateLabels(svg, brMap, path) {
    // Adicionar siglas dos estados
    svg.selectAll('.state-sigla')
        .data(brMap.features)
        .enter()
        .append('text')
        .attr('class', 'state-sigla')
        .attr('x', d => path.centroid(d)[0])
        .attr('y', d => path.centroid(d)[1])
        .text(d => d.properties.sigla);

    // Adicionar nomes dos estados
    svg.selectAll('.state-label')
        .data(brMap.features)
        .enter()
        .append('text')
        .attr('class', 'state-label')
        .attr('x', d => path.centroid(d)[0])
        .attr('y', d => path.centroid(d)[1] + 15)
        .text(d => stateNames[d.properties.sigla]);
}

// Carregar o mapa SVG usando D3.js
d3.json('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson')
    .then(function(brMap) {
        const width = 800;
        const height = 600;

        const projection = d3.geoMercator()
            .center([-52, -15])
            .scale(700)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        const svg = d3.select('#map-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        svg.selectAll('path')
            .data(brMap.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('id', d => d.properties.sigla)
            .style('fill', function(d) {
                const region = stateToRegion[d.properties.sigla];
                return d3.color(regionColors[region]).brighter(Math.random());
            })
            .on('click', function(event, d) {
                const stateId = d.properties.sigla;
                const stateName = stateNames[stateId];
                const region = stateToRegion[stateId];
                
                speak(isStateMode ? stateName : `Região ${region}`);
            })
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 0.8);
                showTooltip(event, d);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 1);
                hideTooltip();
            });

        // Adicionar rótulos aos estados
        addStateLabels(svg, brMap, path);
        createLegends();

        // Atualizar tamanho do mapa quando a janela for redimensionada
        window.addEventListener('resize', updateMapSize);
    })
    .catch(error => console.error('Erro ao carregar o mapa:', error));
