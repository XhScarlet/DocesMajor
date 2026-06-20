const DataManager = {
    receitas: [],
    kits: [],
    caixas: [],
    loadData: async function() {
        try {
            const resReceitas = await fetch('/receitas');
            if (resReceitas.ok) {
                this.receitas = await resReceitas.json();
            }
            const resKits = await fetch('/kits');
            if (resKits.ok) {
                this.kits = await resKits.json();
            }
            const resCaixas = await fetch('/caixas');
            if (resCaixas.ok) {
                this.caixas = await resCaixas.json();
            }
            window.dispatchEvent(new Event('dataLoaded'));
        } catch (e) {
            console.error('Erro ao carregar dados', e);
        }
    },
    getTotalPackagingCost: function() {
        return this.kits.reduce((total, kit) => total + (parseFloat(kit.custo) || 0), 0);
    },
    salvarPrecificacao: async function(caixa, silent = false) {
        try {
            const response = await fetch('/caixas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(caixa)
            });
            if (response.ok) {
                if (!silent) alert('Caixa salva com sucesso!');
                this.loadData();
            } else {
                if (!silent) alert('Erro ao salvar caixa.');
            }
        } catch (e) {
            console.error('Erro ao salvar', e);
        }
    },
    deletarCaixa: async function(id) {
        try {
            const response = await fetch(`/caixas?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                this.loadData();
            }
        } catch (e) {
            console.error('Erro ao deletar caixa', e);
        }
    }
};

function updatePackagingCost() {
    const totalPackagingCost = DataManager.getTotalPackagingCost();
    const packagingCostElement = document.getElementById('packaging-cost');
    const updateInfoElement = document.getElementById('packaging-update-info');
    
    if (packagingCostElement) {
        packagingCostElement.textContent = `R$ ${totalPackagingCost.toFixed(2).replace('.', ',')}`;
    }
    
    if (updateInfoElement) {
        if (totalPackagingCost > 0) {
            updateInfoElement.textContent = 'Custo atualizado automaticamente de Embalagens.';
        } else {
            updateInfoElement.textContent = 'Atualize os custos de embalagens para refletir aqui automaticamente.';
        }
    }

    // Atualizar o cálculo de custo total
    updateFinancialSummary();
}

function updateFinancialSummary() {
    const selects = document.querySelectorAll('select');
    let totalProductionCost = 0;

    selects.forEach(select => {
        const value = parseFloat(select.value) || 0;
        totalProductionCost += value;
    });

    // Adicionar custo de embalagem
    const packagingCost = DataManager.getTotalPackagingCost();
    totalProductionCost += packagingCost;

    const costElement = document.getElementById('total-production-cost');
    if (costElement) {
        costElement.textContent = `R$ ${totalProductionCost.toFixed(2).replace('.', ',')}`;
    }

    // Recalcular lucro e margem
    const priceInput = document.querySelector('input[type="number"]');
    if (priceInput) {
        const salePrice = parseFloat(priceInput.value) || 0;
        const profit = salePrice - totalProductionCost;
        const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

        // Atualizar exibição
        const profitElement = document.querySelector('[class*="bg-primary/5"] .font-headline-md');
        const marginElement = document.querySelector('[class*="bg-secondary/5"] .font-headline-md');

        if (profitElement) {
            profitElement.textContent = `R$ ${profit.toFixed(2).replace('.', ',')}`;
        }
        if (marginElement) {
            marginElement.textContent = `${margin.toFixed(1).replace('.', ',')}%`;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Carregar dados iniciais do backend
    DataManager.loadData();

    window.addEventListener('dataLoaded', () => {
        // Render Caixas Salvas
        renderCaixasSalvas();

        // Preencher selects com receitas cadastradas
        const selects = document.querySelectorAll("select");
        
        if (DataManager.receitas.length === 0) {
            selects.forEach((select) => {
                select.innerHTML = '<option value="0" disabled selected>Nenhuma receita. Crie em Custo da Receita</option>';
            });
        } else {
            selects.forEach((select, index) => {
                select.innerHTML = '<option value="0" data-foto="https://via.placeholder.com/300x300.png?text=Escolha+um+sabor">Escolha um sabor...</option>';
                DataManager.receitas.forEach(receita => {
                    const name = receita.nomeSabor || receita.flavorName;
                    const custoBase = parseFloat(receita.subtotalBase) || 0;
                    const custoIngr = parseFloat(receita.custoTotalIngredientes) || 0;
                    const rendimento = parseFloat(receita.rendimento) || 1;
                    
                    let unitCost = (custoBase + custoIngr) / rendimento;
                    
                    const option = document.createElement('option');
                    option.value = unitCost.toFixed(2);
                    option.textContent = `${name} - R$ ${unitCost.toFixed(2).replace('.', ',')}`;
                    option.setAttribute('data-foto', receita.fotoUrl || 'https://via.placeholder.com/300x300.png?text=Sem+Foto');
                    select.appendChild(option);
                });
                
                select.addEventListener("change", () => {
                    select.classList.add("scale-95");
                    setTimeout(() => select.classList.remove("scale-95"), 100);
                    
                    const selectedOption = select.options[select.selectedIndex];
                    const img = document.getElementById(`img-brigadeiro-${index + 1}`);
                    if (img && selectedOption) {
                        img.src = selectedOption.getAttribute('data-foto');
                        img.classList.remove('opacity-50');
                        if (select.selectedIndex === 0) img.classList.add('opacity-50');
                    }
                    
                    updateFinancialSummary();
                });
            });
        }

        updatePackagingCost();
    });

    function renderCaixasSalvas() {
        const container = document.getElementById('caixas-container');
        const badge = document.getElementById('caixas-count-badge');
        if (!container) return;
        
        container.innerHTML = '';
        badge.textContent = `Total: ${DataManager.caixas.length} Caixas`;
        
        DataManager.caixas.forEach(caixa => {
            const card = document.createElement('div');
            card.className = 'glass-card p-6 rounded-xl flex flex-col h-full relative';
            
            // Render images grid
            const fotosHtml = [caixa.foto1, caixa.foto2, caixa.foto3, caixa.foto4].map(f => {
                return `<div class="aspect-square bg-surface-container-high rounded-full overflow-hidden border-2 border-white/50">
                          <img src="${f || 'https://via.placeholder.com/300x300.png?text=Vazio'}" class="w-full h-full object-cover">
                        </div>`;
            }).join('');

            card.innerHTML = `
                <div class="flex justify-between items-start mb-4">
                    <span class="font-label-md text-primary bg-primary/10 px-3 py-1 rounded-full">Lucro: R$ ${parseFloat(caixa.lucroLiquido).toFixed(2).replace('.', ',')}</span>
                    <div class="flex gap-2">
                        <button class="text-on-surface-variant hover:text-primary transition-colors btn-edit-caixa" title="Editar Caixa">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="text-on-surface-variant hover:text-error transition-colors btn-delete-caixa" title="Excluir Caixa">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 mb-4">
                    ${fotosHtml}
                </div>
                <div class="space-y-1 mt-auto">
                    <div class="flex justify-between text-label-sm">
                        <span class="text-on-surface-variant">Venda:</span>
                        <span class="font-bold text-on-surface">R$ ${parseFloat(caixa.precoVenda).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="flex justify-between text-label-sm">
                        <span class="text-on-surface-variant">Custo:</span>
                        <span class="font-bold text-on-surface">R$ ${parseFloat(caixa.custoTotalProducao).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="flex justify-between text-label-sm items-center mt-4 pt-4 border-t border-outline-variant">
                        <span class="text-on-surface-variant font-medium">Caixas Vendidas:</span>
                        <div class="flex items-center gap-2">
                            <input type="number" class="w-16 bg-surface-container border border-outline-variant rounded p-1 text-center text-on-surface input-vendas" value="${caixa.vendas || 0}" min="0">
                        </div>
                    </div>
                </div>
            `;
            
            card.querySelector('.btn-delete-caixa').addEventListener('click', () => {
                if (confirm('Tem certeza que deseja excluir esta caixa?')) {
                    DataManager.deletarCaixa(caixa.id);
                }
            });

            card.querySelector('.btn-edit-caixa').addEventListener('click', () => {
                document.querySelector('input[type="number"]').value = caixa.precoVenda;
                
                window.editingCaixaId = caixa.id;

                const selects = document.querySelectorAll('select');
                const brigadeiros = [caixa.brigadeiro1, caixa.brigadeiro2, caixa.brigadeiro3, caixa.brigadeiro4];
                
                selects.forEach((sel, i) => {
                    let found = false;
                    Array.from(sel.options).forEach((opt, idx) => {
                        if (opt.text === brigadeiros[i]) {
                            sel.selectedIndex = idx;
                            found = true;
                        }
                    });
                    if (!found) sel.selectedIndex = 0;
                    sel.dispatchEvent(new Event('change'));
                });
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            const inputVendas = card.querySelector('.input-vendas');
            inputVendas.addEventListener('change', () => {
                caixa.vendas = parseInt(inputVendas.value) || 0;
                DataManager.salvarPrecificacao(caixa, true);
            });

            container.appendChild(card);
        });
    }

    // Input de preço
    const priceInput = document.querySelector("input[type='number']");
    if (priceInput) {
        priceInput.addEventListener("input", updateFinancialSummary);
    }

    // Salvar Precificação
    const buttons = document.querySelectorAll('button');
    let btnSalvar;
    buttons.forEach(btn => {
        if (btn.textContent.includes('Salvar Precificação')) {
            btnSalvar = btn;
        }
    });
    
    if (btnSalvar) {
        btnSalvar.addEventListener('click', (e) => {
            e.preventDefault();
            
            const selects = document.querySelectorAll('select');
            const priceInput = document.querySelector('input[type="number"]');
            
            const totalProductionCostText = document.getElementById('total-production-cost').textContent;
            const totalProductionCost = parseFloat(totalProductionCostText.replace('R$ ', '').replace(',', '.')) || 0;
            
            const salePrice = parseFloat(priceInput.value) || 0;
            const profit = salePrice - totalProductionCost;
            const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
            
            const getOptInfo = (index) => {
                const sel = selects[index];
                if (sel && sel.selectedIndex > 0) {
                    return { text: sel.options[sel.selectedIndex].text, foto: sel.options[sel.selectedIndex].getAttribute('data-foto') };
                }
                return { text: 'Não escolhido', foto: '' };
            };
            
            const caixaData = {
                brigadeiro1: getOptInfo(0).text,
                foto1: getOptInfo(0).foto,
                brigadeiro2: getOptInfo(1).text,
                foto2: getOptInfo(1).foto,
                brigadeiro3: getOptInfo(2).text,
                foto3: getOptInfo(2).foto,
                brigadeiro4: getOptInfo(3).text,
                foto4: getOptInfo(3).foto,
                custoEmbalagem: DataManager.getTotalPackagingCost(),
                custoTotalProducao: totalProductionCost,
                precoVenda: salePrice,
                lucroLiquido: profit,
                margemLucro: margin,
                vendas: 0
            };

            if (window.editingCaixaId) {
                caixaData.id = window.editingCaixaId;
                delete window.editingCaixaId;
            }

            DataManager.salvarPrecificacao(caixaData);
        });
    }
});
