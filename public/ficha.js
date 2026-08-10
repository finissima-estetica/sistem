// Função para abrir modal de novo atendimento
function openNovoAtendimento() {
    const modal = document.getElementById('modalAtendimento');
    if (modal) {
        modal.style.display = 'flex';
        // Limpar formulário
        const form = document.getElementById('formAtendimento');
        if (form) {
            form.reset();
        }
    }
}

// Função para fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função para gerar visualização do corpo com SVG do Figma
function generateBodyVisualization() {
    const container = document.getElementById('bodyVisualization');
    if (!container) return;
    
    console.log("Iniciando renderização do corpo SVG do Figma");
    
    // Análise das zonas disponíveis (dados reais do cadastro/atendimentos)
    const realZonesAnalysis = {
        'braco_direito': analyzeZone('braco_direito'),
        'braco_esquerdo': analyzeZone('braco_esquerdo'),
        'torax': analyzeZone('torax'),
        'cintura': analyzeZone('cintura'),
        'abdomen': analyzeZone('abdomen'),
        'quadril': analyzeZone('quadril'),
        'coxa_direita': analyzeZone('coxa_direita'),
        'coxa_esquerda': analyzeZone('coxa_esquerda'),
        'panturrilha_direita': analyzeZone('panturrilha_direita'),
        'panturrilha_esquerda': analyzeZone('panturrilha_esquerda')
    };
    
    console.log("Dados das zonas do banco:", Object.keys(realZonesAnalysis));
    
    // Mapeamento correto: dados do banco -> IDs do SVG (apenas 9 zonas existentes)
    const zoneMapping = {
        'braco_direito': ['zone-arm-r-upper'],
        'braco_esquerdo': ['zone-arm-l-upper'],
        'torax': ['zone-chest'],
        'cintura': ['zone-pelvis'],
        'abdomen': ['zone-ab-upper'],
        'quadril': ['zone-pelvis'],
        'coxa_direita': ['zone-thigh-r'],
        'coxa_esquerda': ['zone-thigh-l'],
        'panturrilha_direita': ['zone-shin-r'],
        'panturrilha_esquerda': ['zone-shin-l']
    };
    
    console.log("Mapeamento de zonas:", zoneMapping);
    
    // Função auxiliar para obter cor com fallback defensivo
    const getZoneColor = (zoneData) => {
        console.log("Obtendo cor para zona:", zoneData);
        const color = zoneData?.color || '#e0e0e0';
        console.log("Cor obtida:", color);
        return color;
    };
    
    // Mapear todas as zonas visuais para suas cores
    const zonesAnalysis = {};
    
    // Iterar sobre o mapeamento e atribuir cores
    Object.keys(zoneMapping).forEach(dataZone => {
        console.log("Processando zona do banco:", dataZone);
        const color = getZoneColor(realZonesAnalysis[dataZone]);
        zoneMapping[dataZone].forEach(svgZoneId => {
            console.log("Mapeando", dataZone, "->", svgZoneId, "com cor:", color);
            zonesAnalysis[svgZoneId] = color;
        });
    });
    
    console.log("Zonas Analysis final:", zonesAnalysis);
    
    // Adicionar fallback para as 9 zonas
    const allSvgZones = [
        'zone-chest', 'zone-ab-upper', 'zone-pelvis',
        'zone-arm-r-upper', 'zone-arm-l-upper',
        'zone-thigh-r', 'zone-thigh-l',
        'zone-shin-r', 'zone-shin-l'
    ];
    
    allSvgZones.forEach(zoneId => {
        if (!zonesAnalysis[zoneId]) {
            console.log("Zona sem mapeamento, usando fallback:", zoneId);
            zonesAnalysis[zoneId] = '#e0e0e0';
        }
    });
    
    console.log("Zonas Analysis final com fallbacks:", zonesAnalysis);
    
    // Função helper segura para obter cor do objeto
    const getSafeColor = (zoneId) => {
        const color = zonesAnalysis[zoneId] || '#e0e0e0';
        console.log("Renderizando zona:", zoneId, "com cor:", color);
        return color;
    };
    
    // SVG limpo apenas com as 9 zonas coloridas e contornos cinza
    let svgContent = `<svg width="435" height="800" viewBox="0 0 435 800" fill="none" xmlns="http://www.w3.org/2000/svg">
<!-- Camada 1: Zonas coloridas -->
<path id="zone-thigh-r" d="M194 566H235V527L241 490L250 425L184 385H179V418V453V490L184 527L194 566Z" fill="${getSafeColor('zone-thigh-r')}"/>
<path id="zone-shin-r" d="M194 659V595H241V626V656L237 681L231 714V739H202V714L194 659Z" fill="${getSafeColor('zone-shin-r')}"/>
<path id="zone-shin-l" d="M253 632L258 598H304V632V659L295 696V736H264V722V691L258 665L253 632Z" fill="${getSafeColor('zone-shin-l')}"/>
<path id="zone-thigh-l" d="M314 382L251 425L255 489L262 536V567H304L309 536L321 486V441V416L314 382Z" fill="${getSafeColor('zone-thigh-l')}"/>
<path id="zone-ab-upper" d="M194 316V294H296L302 316L316 367H183L194 316Z" fill="${getSafeColor('zone-ab-upper')}"/>
<path id="zone-arm-r-upper" d="M151 291L156 215L189 239L178 302L151 291Z" fill="${getSafeColor('zone-arm-r-upper')}"/>
<path id="zone-arm-l-upper" d="M320 311L310 239H343L349 299L320 311Z" fill="${getSafeColor('zone-arm-l-upper')}"/>
<path id="zone-chest" d="M186 214L194 286H305L315 214H186Z" fill="${getSafeColor('zone-chest')}"/>
<path id="zone-pelvis" d="M183 384V369H315V384L251 425L183 384Z" fill="${getSafeColor('zone-pelvis')}"/>
<!-- Camada 2: Contornos cinza por cima -->
<path d="M194 566H235V527L241 490L250 425L184 385H179V418V453V490L184 527L194 566Z" fill="none" stroke="#333333" stroke-width="2"/>
<path d="M194 659V595H241V626V656L237 681L231 714V739H202V714L194 659Z" fill="none" stroke="#333333" stroke-width="2"/>
<path d="M253 632L258 598H304V632V659L295 696V736H264V722V691L258 665L253 632Z" fill="none" stroke="#333333" stroke-width="2"/>
<path d="M314 382L251 425L255 489L262 536V567H304L309 536L321 486V441V416L314 382Z" fill="none" stroke="#333333" stroke-width="2"/>
<path d="M194 316V294H296L302 316L316 367H183L194 316Z" fill="none" stroke="#333333" stroke-width="2"/>
<path d="M151 291L156 215L189 239L178 302L151 291Z" fill="none" stroke="#333333" stroke-width="2"/>
<path d="M320 311L310 239H343L349 299L320 311Z" fill="none" stroke="#333333" stroke-width="2"/>
<path d="M186 214L194 286H305L315 214H186Z" fill="none" stroke="#333333" stroke-width="2"/>
<path d="M183 384V369H315V384L251 425L183 384Z" fill="none" stroke="#333333" stroke-width="2"/>
</svg>`;
    
    // HTML com SVG injetado e legenda
    let html = `
        <div class="body-visualization-container" style="position: relative; width: 100%; max-width: 500px; margin: 0 auto;">
            <!-- SVG injetado -->
            <div class="svg-container" style="position: relative; z-index: 1;">
                ${svgContent}
            </div>
            
            <!-- Legenda -->
            <div class="legend" style="position: absolute; top: 10px; right: 10px; background: white; padding: 10px; border-radius: 5px; border: 1px solid #6c757d; z-index: 10;">
                <div style="font-weight: bold; margin-bottom: 5px; font-size: 12px;">MUDANÇA</div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <div style="width: 12px; height: 12px; background: #28a745; margin-right: 5px;"></div>
                    <span style="font-size: 10px;">Redução</span>
                </div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <div style="width: 12px; height: 12px; background: #dc3545; margin-right: 5px;"></div>
                    <span style="font-size: 10px;">Aumento</span>
                </div>
                <div style="display: flex; align-items: center; margin: 3px 0;">
                    <div style="width: 12px; height: 12px; background: #6c757d; margin-right: 5px;"></div>
                    <span style="font-size: 10px;">Sem dado</span>
                </div>
            </div>
        </div>
        
        <style>
            .body-visualization-container {
                position: relative;
                width: 100%;
                max-width: 500px;
                margin: 0 auto;
            }
            .svg-container {
                position: relative;
                z-index: 1;
            }
            .svg-container svg {
                width: 100%;
                height: auto;
            }
            .legend {
                position: absolute;
                top: 10px;
                right: 10px;
                background: white;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #6c757d;
                z-index: 10;
                font-size: 12px;
            }
            .legend > div {
                display: flex;
                align-items: center;
                margin: 3px 0;
            }
        </style>
    `;
    
    container.innerHTML = html;
}

