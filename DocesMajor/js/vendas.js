document.addEventListener("DOMContentLoaded", () => {
    loadVendasData();

    const bars = document.querySelectorAll(".chart-bar");
    bars.forEach((bar, index) => {
        const targetHeight = bar.style.height;
        bar.style.height = "0";
        setTimeout(() => {
            bar.style.height = targetHeight;
        }, 400 + (index * 100));
    });
});

async function loadVendasData() {
    try {
        const res = await fetch('/caixas');
        if (!res.ok) return;
        const caixas = await res.json();
        
        let totalVendasRS = 0;
        let totalLucroRS = 0;
        let caixasVendidas = 0;
        let saboresCount = {};
        
        caixas.forEach(caixa => {
            const vendas = parseInt(caixa.vendas) || 0;
            if (vendas > 0) {
                const pVenda = parseFloat(caixa.precoVenda) || 0;
                const lucro = parseFloat(caixa.lucroLiquido) || 0;
                
                totalVendasRS += (pVenda * vendas);
                totalLucroRS += (lucro * vendas);
                caixasVendidas += vendas;
                
                // Count flavors
                const getFlavorName = (str) => {
                    if (!str || str === 'Não escolhido') return null;
                    return str.split(" - R$")[0].trim();
                };

                const b1 = getFlavorName(caixa.brigadeiro1);
                const b2 = getFlavorName(caixa.brigadeiro2);
                const b3 = getFlavorName(caixa.brigadeiro3);
                const b4 = getFlavorName(caixa.brigadeiro4);
                
                [b1, b2, b3, b4].forEach(b => {
                    if (b) {
                        saboresCount[b] = (saboresCount[b] || 0) + vendas;
                    }
                });
            }
        });
        
        const ticketMedio = caixasVendidas > 0 ? (totalVendasRS / caixasVendidas) : 0;
        const margemMedia = totalVendasRS > 0 ? ((totalLucroRS / totalVendasRS) * 100) : 0;
        
        document.getElementById('kpi-vendas').textContent = `R$ ${totalVendasRS.toFixed(2).replace('.', ',')}`;
        document.getElementById('kpi-lucro').textContent = `R$ ${totalLucroRS.toFixed(2).replace('.', ',')}`;
        document.getElementById('kpi-ticket').textContent = `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`;
        document.getElementById('kpi-margem').textContent = `Margem média: ${margemMedia.toFixed(1).replace('.', ',')}%`;
        
        updateFlavorsChart(saboresCount);
        
    } catch (e) {
        console.error('Erro ao carregar dados de vendas:', e);
    }
}

function updateFlavorsChart(saboresCount) {
    const entries = Object.entries(saboresCount).sort((a, b) => b[1] - a[1]);
    const totalFlavors = entries.reduce((acc, curr) => acc + curr[1], 0);
    
    const donutList = document.getElementById('donut-list');
    const donutCircle = document.getElementById('donut-circle');
    const donutPercent = document.getElementById('donut-percent');
    const donutName = document.getElementById('donut-name');
    
    donutList.innerHTML = '';
    
    if (totalFlavors === 0) {
        donutCircle.style.background = 'conic-gradient(#e2e2e2 0% 100%)';
        donutPercent.textContent = '0%';
        donutName.textContent = 'Sem Vendas';
        return;
    }

    const top = entries.slice(0, 4);
    const colors = ['#B98A6C', '#F8C8DC', '#D8B4E2', '#FFF0A8']; // marrom claro, rosa bebe, lilas, amarelo clarinho
    
    let currentPct = 0;
    let gradients = [];

    top.forEach((item, index) => {
        const pct = Math.round((item[1] / totalFlavors) * 100);
        

        const start = currentPct;
        const end = currentPct + pct;
        gradients.push(`${colors[index]} ${start}% ${end}%`);
        currentPct = end;
        
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between';
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full" style="background-color: ${colors[index]}"></div>
                <span class="text-body-md">${item[0]}</span>
            </div>
            <span class="font-medium">${pct}%</span>
        `;
        donutList.appendChild(li);
        
        if (index === 0) {
            donutPercent.textContent = `${pct}%`;
            donutName.textContent = item[0];
        }
    });

    if (currentPct < 100) {
        gradients.push(`#e2e2e2 ${currentPct}% 100%`);
    }

    donutCircle.style.background = `conic-gradient(${gradients.join(', ')})`;
}
