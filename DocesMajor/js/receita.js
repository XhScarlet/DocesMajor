const DataManager = {
    calculateProportionalCost: function(totalQty, totalPrice, usedQty) {
        if (totalQty <= 0) return 0;
        return (totalPrice / totalQty) * usedQty;
    },
    saveFlavorWithExtras: async function(flavorData) {
        try {
            const response = await fetch('/receitas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(flavorData)
            });
            if (!response.ok) {
                console.error("Erro ao salvar no backend");
            } else {
                console.log("Receita salva com sucesso no backend!");
                DataManager.loadFlavors(); // Recarrega a lista
            }
        } catch (e) {
            console.error("Erro de conexão com o backend", e);
        }
    },
    loadFlavors: async function() {
        try {
            const response = await fetch('/receitas');
            if (response.ok) {
                const receitas = await response.json();
                DataManager.renderFlavors(receitas);
            }
        } catch (e) {
            console.error("Erro ao carregar sabores do backend", e);
        }
    },
    renderFlavors: function(receitas) {
        const grid = document.getElementById('sabores-salvos-grid');
        if (!grid) return;
        
        // Remove todos os cartões antigos, exceto o botão "Novo Sabor"
        const novoSaborBtn = document.getElementById('novo-sabor-btn');
        grid.innerHTML = '';
        
        receitas.forEach((receita, index) => {
            const delay = 0.1 + (index * 0.1);
            const nome = receita.nomeSabor || receita.flavorName || 'Sem Nome';
            const rendimento = receita.rendimento || receita.yield || 0;
            const subtotalBase = receita.subtotalBase || 0;
            const custoTotal = receita.custoTotalIngredientes || receita.totalIngredientsCost || 0;
            const custoManteiga = receita.custoManteiga || receita.butterCost || 0;
            const custoUnitario = (subtotalBase + custoTotal) / (rendimento > 0 ? rendimento : 1);
            
            const fotoUrl = receita.fotoUrl || '';
            const imgHtml = fotoUrl 
                ? `<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${fotoUrl}" alt="${nome}" />`
                : `<span class="material-symbols-outlined text-6xl text-primary/30">cake</span>`;

            const card = document.createElement('div');
            card.className = 'stagger-card glass-card rounded-xl overflow-hidden group';
            card.style.animationDelay = `${delay}s`;
            card.innerHTML = `
                <div class="h-40 overflow-hidden relative bg-primary/10 flex items-center justify-center">
                    ${imgHtml}
                </div>
                <div class="p-6">
                    <h3 class="font-headline-md text-headline-md text-secondary mb-1">${nome}</h3>
                    <p class="text-label-sm text-on-surface-variant mb-4">Rendimento: ${rendimento} unidades</p>
                    <div class="flex justify-between items-end border-t border-primary/10 pt-4">
                        <div>
                            <p class="text-label-sm text-on-surface-variant">Custo Unitário</p>
                            <p class="font-headline-md text-headline-md text-primary">R$ ${custoUnitario.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="text-primary hover:text-secondary transition-colors btn-edit-flavor" title="Editar Sabor">
                                <span class="material-symbols-outlined">edit_note</span>
                            </button>
                            <button class="text-error hover:text-error/80 transition-colors btn-delete-flavor" title="Excluir Sabor">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            card.querySelector('.btn-edit-flavor').addEventListener('click', () => {
                if (document.getElementById('flavor-id')) {
                    document.getElementById('flavor-id').value = receita.id || '';
                }
                document.getElementById('flavor-name').value = nome;
                if (document.getElementById('flavor-image')) {
                    document.getElementById('flavor-image').value = fotoUrl;
                }
                document.getElementById('Qt').value = rendimento;
                
                // Base ingredientes
                document.getElementById('P_LC').value = receita.valorLeiteCondensado || receita.leiteCondensadoValor || '';
                document.getElementById('P_CL').value = receita.valorCremeDeLeite || receita.cremeDeLeiteValor || '';
                document.querySelector('[data-butter-total-qty]').value = receita.quantidadeTotalManteiga || receita.manteigaTotalQty || '';
                document.querySelector('[data-butter-total-price]').value = receita.precoTotalManteiga || receita.manteigaTotalPrice || '';
                document.querySelector('[data-butter-used-qty]').value = receita.quantidadeUsadaManteiga || receita.manteigaUsedQty || '';
                
                if (typeof calculateButterCost === 'function') calculateButterCost();
                if (typeof updateSubtotalBase === 'function') updateSubtotalBase();
                
                const container = document.getElementById('ingredients-container');
                container.innerHTML = '';
                
                const ingredientes = receita.ingredientes || receita.ingredients || [];
                if (ingredientes.length === 0) {
                    if (typeof addIngredientField === 'function') addIngredientField();
                } else {
                    ingredientes.forEach(ing => {
                        if (typeof addIngredientField === 'function') addIngredientField();
                        const items = container.querySelectorAll('.ingredient-item');
                        const lastItem = items[items.length - 1];
                        
                        lastItem.querySelector('.ingredient-name').value = ing.nome || ing.name || '';
                        lastItem.querySelector('.ingredient-total-qty').value = ing.quantidadeTotal || ing.qtdTotal || ing.totalQty || '';
                        lastItem.querySelector('.ingredient-total-price').value = ing.valorTotal || ing.totalPrice || '';
                        lastItem.querySelector('.ingredient-used-qty').value = ing.quantidadeUsada || ing.qtdUsada || ing.usedQty || '';
                        
                        if (typeof calculateIngredientCost === 'function') calculateIngredientCost(lastItem);
                    });
                }
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            // Delete feature
            card.querySelector('.btn-delete-flavor').addEventListener('click', () => {
                if (confirm(`Tem certeza que deseja excluir o sabor "${nome}"?`)) {
                    DataManager.deleteFlavor(receita.id);
                }
            });

            grid.appendChild(card);
        });
        
        if (novoSaborBtn) {
            grid.appendChild(novoSaborBtn);
        }
    },
    deleteFlavor: async function(id) {
        if (!id) return;
        try {
            const response = await fetch(`/receitas?id=${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                console.log("Receita deletada com sucesso!");
                DataManager.loadFlavors();
                
                // Reset form if the deleted one was being edited
                const flavorIdInput = document.getElementById('flavor-id');
                if (flavorIdInput && flavorIdInput.value === id) {
                    const form = document.getElementById('flavor-form');
                    if (form) form.reset();
                    flavorIdInput.value = '';
                }
            } else {
                console.error("Erro ao deletar receita no backend");
            }
        } catch (e) {
            console.error("Erro de conexão com o backend", e);
        }
    }
};

function ValorUnitarioBrigadeiro() {

    // Manteiga
    let V_T = Number(document.getElementById("V_T").value);
    let G_T = Number(document.getElementById("G_T").value);
    let G_U = Number(document.getElementById("G_U").value);

    let P_M = G_T > 0 ? (V_T * G_U) / G_T : 0;

    // Sabor
    let V_TS = Number(document.getElementById("V_TS").value);
    let G_TS = Number(document.getElementById("G_TS").value);
    let G_US = Number(document.getElementById("G_US").value);

    let P_S = G_TS > 0 ? (V_TS * G_US) / G_TS : 0;

    // Base
    let P_LC = Number(document.getElementById("P_LC").value);
    let P_CL = Number(document.getElementById("P_CL").value);
    let Qt = Number(document.getElementById("Qt").value);

    let Resultado = Qt > 0
        ? (P_LC + P_CL + P_M + P_S) / Qt
        : 0;
}
// Inicialização e funções para cálculo proporcional
        function calculateButterCost() {
            const totalQty = parseFloat(document.querySelector('[data-butter-total-qty]').value) || 0;
            const totalPrice = parseFloat(document.querySelector('[data-butter-total-price]').value) || 0;
            const usedQty = parseFloat(document.querySelector('[data-butter-used-qty]').value) || 0;
            
            const cost = DataManager.calculateProportionalCost(totalQty, totalPrice, usedQty);
            document.querySelector('[data-butter-cost]').textContent = `R$ ${cost.toFixed(2).replace('.', ',')}`;
            updateSubtotalBase();
        }

        function updateSubtotalBase() {
            const P_LC = parseFloat(document.getElementById('P_LC').value) || 0;
            const P_CL = parseFloat(document.getElementById('P_CL').value) || 0;
            const butterCostText = document.querySelector('[data-butter-cost]').textContent.replace('R$ ', '').replace(',', '.');
            const P_M = parseFloat(butterCostText) || 0;

            const subtotal = P_LC + P_CL + P_M;
            document.getElementById('subtotal-base').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        }

        function calculateIngredientCost(ingredientItem) {
            const totalQty = parseFloat(ingredientItem.querySelector('.ingredient-total-qty').value) || 0;
            const totalPrice = parseFloat(ingredientItem.querySelector('.ingredient-total-price').value) || 0;
            const usedQty = parseFloat(ingredientItem.querySelector('.ingredient-used-qty').value) || 0;
            
            const cost = DataManager.calculateProportionalCost(totalQty, totalPrice, usedQty);
            ingredientItem.querySelector('.ingredient-cost').textContent = `R$ ${cost.toFixed(2).replace('.', ',')}`;
        }

        function addIngredientField() {
            const container = document.getElementById('ingredients-container');
            const ingredientItem = document.createElement('div');
            ingredientItem.className = 'ingredient-item bg-secondary-container/10 rounded-lg p-4 border-l-4 border-l-secondary';
            ingredientItem.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-label-sm text-on-surface-variant mb-1">Nome do Ingrediente</label>
                        <input
                            class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-name"
                            placeholder="Ex: Granulado, Calda, Recheio" type="text" />
                    </div>
                    <div>
                        <label class="block text-label-sm text-on-surface-variant mb-1">Qtd. Total Comprada (g)</label>
                        <input
                            class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-total-qty"
                            placeholder="Ex: 500" type="number" />
                    </div>
                    <div>
                        <label class="block text-label-sm text-on-surface-variant mb-1">Valor Total (R$)</label>
                        <input
                            class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-total-price"
                            placeholder="0,00" type="number" step="0.01" />
                    </div>
                    <div>
                        <label class="block text-label-sm text-on-surface-variant mb-1">Qtd. Usada na Receita (g)</label>
                        <input
                            class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-used-qty"
                            placeholder="Ex: 100" type="number" />
                    </div>
                    <div class="flex items-end gap-2">
                        <div class="flex-1">
                            <label class="block text-label-sm text-on-surface-variant mb-1">Custo (R$)</label>
                            <p class="bg-white/50 rounded-lg px-3 py-2 text-label-md font-bold text-secondary ingredient-cost">R$ 0,00</p>
                        </div>
                        <button type="button" class="remove-ingredient-btn text-error hover:scale-110 transition-transform" title="Remover ingrediente">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(ingredientItem);
            
            // Adicionar event listeners para o novo campo
            ingredientItem.querySelectorAll('.ingredient-total-qty, .ingredient-total-price, .ingredient-used-qty').forEach(input => {
                input.addEventListener('input', () => calculateIngredientCost(ingredientItem));
            });
            
            ingredientItem.querySelector('.remove-ingredient-btn').addEventListener('click', (e) => {
                e.preventDefault();
                ingredientItem.remove();
            });
        }

        document.addEventListener("DOMContentLoaded", () => {
            // Carregar os sabores salvos do backend
            DataManager.loadFlavors();

            // Inputs da manteiga
            const butterInputs = document.querySelectorAll('[data-butter-total-qty], [data-butter-total-price], [data-butter-used-qty]');
            butterInputs.forEach(input => {
                input.addEventListener('input', calculateButterCost);
            });

            // Inputs Base (Leite Condensado e Creme de Leite)
            document.getElementById('P_LC').addEventListener('input', updateSubtotalBase);
            document.getElementById('P_CL').addEventListener('input', updateSubtotalBase);

            // Botão Novo Sabor
            const novoSaborBtn = document.getElementById('novo-sabor-btn');
            if (novoSaborBtn) {
                novoSaborBtn.addEventListener('click', () => {
                    const flavorForm = document.getElementById('flavor-form');
                    if (flavorForm) flavorForm.reset();
                    document.getElementById('subtotal-base').textContent = 'R$ 0,00';
                    document.querySelector('[data-butter-cost]').textContent = 'R$ 0,00';
                    document.getElementById('ingredients-container').innerHTML = `
                        <div class="ingredient-item bg-secondary-container/10 rounded-lg p-4 border-l-4 border-l-secondary">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-label-sm text-on-surface-variant mb-1">Nome do Ingrediente</label>
                                    <input
                                        class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-name"
                                        placeholder="Ex: Pasta de Pistache" type="text" />
                                </div>
                                <div>
                                    <label class="block text-label-sm text-on-surface-variant mb-1">Qtd. Total Comprada (g)</label>
                                    <input
                                        class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-total-qty"
                                        placeholder="Ex: 500" type="number" />
                                </div>
                                <div>
                                    <label class="block text-label-sm text-on-surface-variant mb-1">Valor Total (R$)</label>
                                    <input
                                        class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-total-price"
                                        placeholder="0,00" type="number" step="0.01" />
                                </div>
                                <div>
                                    <label class="block text-label-sm text-on-surface-variant mb-1">Qtd. Usada na Receita (g)</label>
                                    <input
                                        class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-used-qty"
                                        placeholder="Ex: 100" type="number" />
                                </div>
                                <div class="flex items-end gap-2">
                                    <div class="flex-1">
                                        <label class="block text-label-sm text-on-surface-variant mb-1">Custo (R$)</label>
                                        <p class="bg-white/50 rounded-lg px-3 py-2 text-label-md font-bold text-secondary ingredient-cost">R$ 0,00</p>
                                    </div>
                                    <button type="button" class="remove-ingredient-btn text-error hover:scale-110 transition-transform" title="Remover ingrediente">
                                        <span class="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    const newItem = document.querySelector('#ingredients-container .ingredient-item');
                    if (newItem) {
                        newItem.querySelectorAll('.ingredient-total-qty, .ingredient-total-price, .ingredient-used-qty').forEach(input => {
                            input.addEventListener('input', () => calculateIngredientCost(newItem));
                        });
                        newItem.querySelector('.remove-ingredient-btn').addEventListener('click', (e) => {
                            e.preventDefault();
                            newItem.remove();
                        });
                    }

                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }

            // Botão adicionar ingrediente
            document.getElementById('add-ingredient-btn').addEventListener('click', (e) => {
                e.preventDefault();
                addIngredientField();
            });

            // Event listeners para ingredientes existentes
            document.querySelectorAll('.ingredient-item').forEach(item => {
                item.querySelectorAll('.ingredient-total-qty, .ingredient-total-price, .ingredient-used-qty').forEach(input => {
                    input.addEventListener('input', () => calculateIngredientCost(item));
                });

                item.querySelector('.remove-ingredient-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    item.remove();
                });
            });

            // Formulário de sabor
            const flavorForm = document.getElementById('flavor-form');
            if (flavorForm) {
                flavorForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const flavorName = document.getElementById('flavor-name').value;
                    const yield_units = document.getElementById('Qt').value;

                    const ingredientes = [];
                    document.querySelectorAll('.ingredient-item').forEach(item => {
                        const name = item.querySelector('.ingredient-name').value;
                        const totalQty = parseFloat(item.querySelector('.ingredient-total-qty').value) || 0;
                        const totalPrice = parseFloat(item.querySelector('.ingredient-total-price').value) || 0;
                        const usedQty = parseFloat(item.querySelector('.ingredient-used-qty').value) || 0;
                        
                        if (name && totalQty && totalPrice && usedQty) {
                            const cost = DataManager.calculateProportionalCost(totalQty, totalPrice, usedQty);
                            ingredientes.push({ 
                                nome: name, 
                                quantidadeTotal: Number(totalQty.toFixed(2)), 
                                valorTotal: Number(totalPrice.toFixed(2)), 
                                quantidadeUsada: Number(usedQty.toFixed(2)), 
                                custo: Number(cost.toFixed(2)) 
                            });
                        }
                    });

                    const custoTotalIngredientes = ingredientes.reduce((sum, ing) => sum + ing.custo, 0);
                    const subtotalBaseValue = parseFloat(document.getElementById('subtotal-base').textContent.replace('R$ ', '').replace(',', '.')) || 0;

                    const photoUrl = document.getElementById('flavor-image').value;
                    const leiteCondensadoValor = parseFloat(document.getElementById('P_LC').value) || 0;
                    const cremeDeLeiteValor = parseFloat(document.getElementById('P_CL').value) || 0;
                    const manteigaTotalQty = parseFloat(document.querySelector('[data-butter-total-qty]').value) || 0;
                    const manteigaTotalPrice = parseFloat(document.querySelector('[data-butter-total-price]').value) || 0;
                    const manteigaUsedQty = parseFloat(document.querySelector('[data-butter-used-qty]').value) || 0;
                    const flavorId = document.getElementById('flavor-id') ? document.getElementById('flavor-id').value : '';

                    const payload = {
                        nomeSabor: flavorName,
                        fotoUrl: photoUrl,
                        rendimento: Number(parseFloat(yield_units).toFixed(2)),
                        ingredientes: ingredientes,
                        custoTotalIngredientes: Number(custoTotalIngredientes.toFixed(2)),
                        custoManteiga: Number((parseFloat(document.querySelector('[data-butter-cost]').textContent.replace('R$ ', '').replace(',', '.')) || 0).toFixed(2)),
                        subtotalBase: Number(subtotalBaseValue.toFixed(2)),
                        valorLeiteCondensado: Number(leiteCondensadoValor.toFixed(2)),
                        valorCremeDeLeite: Number(cremeDeLeiteValor.toFixed(2)),
                        quantidadeTotalManteiga: Number(manteigaTotalQty.toFixed(2)),
                        precoTotalManteiga: Number(manteigaTotalPrice.toFixed(2)),
                        quantidadeUsadaManteiga: Number(manteigaUsedQty.toFixed(2))
                    };
                    
                    if (flavorId) {
                        payload.id = flavorId;
                    }

                    DataManager.saveFlavorWithExtras(payload);

                    alert('Sabor salvo com sucesso!');
                    flavorForm.reset();
                    if (document.getElementById('flavor-id')) {
                        document.getElementById('flavor-id').value = '';
                    }
                    document.getElementById('subtotal-base').textContent = 'R$ 0,00';
                    document.querySelector('[data-butter-cost]').textContent = 'R$ 0,00';
                    document.getElementById('ingredients-container').innerHTML = `
                        <div class="ingredient-item bg-secondary-container/10 rounded-lg p-4 border-l-4 border-l-secondary">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-label-sm text-on-surface-variant mb-1">Nome do Ingrediente</label>
                                    <input
                                        class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-name"
                                        placeholder="Ex: Pasta de Pistache" type="text" />
                                </div>
                                <div>
                                    <label class="block text-label-sm text-on-surface-variant mb-1">Qtd. Total Comprada (g)</label>
                                    <input
                                        class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-total-qty"
                                        placeholder="Ex: 500" type="number" />
                                </div>
                                <div>
                                    <label class="block text-label-sm text-on-surface-variant mb-1">Valor Total (R$)</label>
                                    <input
                                        class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-total-price"
                                        placeholder="0,00" type="number" step="0.01" />
                                </div>
                                <div>
                                    <label class="block text-label-sm text-on-surface-variant mb-1">Qtd. Usada na Receita (g)</label>
                                    <input
                                        class="w-full bg-white border-none rounded-lg px-3 py-2 focus:ring-0 transition-all font-body-md text-sm ingredient-used-qty"
                                        placeholder="Ex: 100" type="number" />
                                </div>
                                <div class="flex items-end gap-2">
                                    <div class="flex-1">
                                        <label class="block text-label-sm text-on-surface-variant mb-1">Custo (R$)</label>
                                        <p class="bg-white/50 rounded-lg px-3 py-2 text-label-md font-bold text-secondary ingredient-cost">R$ 0,00</p>
                                    </div>
                                    <button type="button" class="remove-ingredient-btn text-error hover:scale-110 transition-transform" title="Remover ingrediente">
                                        <span class="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    const newItem = document.querySelector('#ingredients-container .ingredient-item');
                    if (newItem) {
                        newItem.querySelectorAll('.ingredient-total-qty, .ingredient-total-price, .ingredient-used-qty').forEach(input => {
                            input.addEventListener('input', () => calculateIngredientCost(newItem));
                        });
                        newItem.querySelector('.remove-ingredient-btn').addEventListener('click', (e) => {
                            e.preventDefault();
                            newItem.remove();
                        });
                    }
                });
            }

            const inputs = document.querySelectorAll("input:not([data-butter-total-qty]):not([data-butter-total-price]):not([data-butter-used-qty]):not(.ingredient-name):not(.ingredient-total-qty):not(.ingredient-total-price):not(.ingredient-used-qty)");
            inputs.forEach(input => {
                input.addEventListener("focus", () => {
                    input.parentElement.classList.add("scale-[1.01]");
                    input.parentElement.classList.add("transition-transform");
                });
                input.addEventListener("blur", () => {
                    input.parentElement.classList.remove("scale-[1.01]");
                });
            });
        });
