function CalculoEmbalagem(){

    //forminha interna
    let V_EI = Number(document.getElementById("V_EI").value);
    let Q_EI = Number(document.getElementById("Q_EI").value);

    let R1 = V_EI / Q_EI

    //forminha externa
    let V_EE = Number(document.getElementById("V_EE").value);
    let Q_EE = Number(document.getElementById("Q_EE").value);

    let R2 = V_EE / Q_EE

    //Forma maior
    let V_E = Number(document.getElementById("V_E").value);
    let Q_E = Number(document.getElementById("Q_E").value);

    let R3 = V_E / Q_E
}
const PACKAGING_TYPES = {
            'Forminha Interna': { icon: 'filter_vintage', color: 'primary' },
            'Tapetinho Externo': { icon: 'layers', color: 'secondary' },
            'Caixa de Presente': { icon: 'featured_seasonal_and_gifts', color: 'tertiary' },
            'Etiquetas': { icon: 'label', color: 'secondary' }
        };

        const DataManager = {
            getAllPackagings: async function() {
                try {
                    const response = await fetch('/kits');
                    if (response.ok) {
                        const kits = await response.json();
                        const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6');
                        if (container) container.innerHTML = '';
                        kits.forEach(pkg => {
                            addPackagingToUI(pkg.id, pkg.nome, pkg.tipo, pkg.custo);
                        });
                        window.dispatchEvent(new Event('packagingsUpdated'));
                    }
                } catch (e) {
                    console.error('Erro ao carregar embalagens', e);
                }
            },
            savePackaging: async function(tipo, nome, custo) {
                try {
                    const response = await fetch('/kits', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ tipo, nome, custo })
                    });
                    if (response.ok) {
                        DataManager.getAllPackagings();
                    }
                } catch (e) {
                    console.error('Erro ao salvar embalagem', e);
                }
            },
            deletePackaging: async function(id) {
                try {
                    const response = await fetch(`/kits?id=${id}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        DataManager.getAllPackagings();
                    }
                } catch (e) {
                    console.error('Erro ao deletar embalagem', e);
                }
            }
        };

        function calculatePackagingCost(packagePrice, units) {
            if (!packagePrice || !units) return 0;
            return parseFloat(packagePrice) / parseFloat(units);
        }

        function addPackagingToUI(id, name, type, cost) {
            const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6');
            if (!container) return;

            const colorClass = PACKAGING_TYPES[type] ? PACKAGING_TYPES[type].color : 'primary';
            const card = document.createElement('div');
            card.className = `glass-card p-6 rounded-xl border-l-4 border-l-${colorClass} flex flex-col justify-between h-40 relative`;
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start">
                        <span class="font-label-md text-on-surface-variant opacity-70">${type}</span>
                        <span class="material-symbols-outlined text-outline text-lg cursor-pointer hover:text-error transition-colors delete-packaging">delete</span>
                    </div>
                    <p class="font-headline-md text-on-surface mt-1">${name}</p>
                </div>
                <div class="flex items-end justify-between">
                    <span class="text-${colorClass} font-bold text-2xl">R$ ${cost.toFixed(2).replace('.', ',')}</span>
                    <span class="text-xs font-label-sm text-outline">unid.</span>
                </div>
            `;

            card.querySelector('.delete-packaging').addEventListener('click', () => {
                if(confirm(`Excluir embalagem ${name}?`)) {
                    DataManager.deletePackaging(id);
                }
            });

            container.appendChild(card);
        }

        document.addEventListener("DOMContentLoaded", () => {
            // Carregar embalagens salvas do backend
            DataManager.getAllPackagings();

            // Botões de salvar cálculo
            const buttons = document.querySelectorAll('button:not(.delete-packaging)');
            const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');

            buttons.forEach((button, index) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Encontrar os inputs do card pai
                    const card = button.closest('.glass-card');
                    const title = card.querySelector('h3').textContent.trim();
                    const inputsList = card.querySelectorAll('input');
                    const priceInput = inputsList[0];
                    
                    let units = 0;
                    let description = title;

                    if (title === 'Caixa de Presente') {
                        units = 1;
                        description = inputsList[1].value || title;
                    } else {
                        units = parseFloat(inputsList[1].value) || 0;
                    }

                    const packagePrice = parseFloat(priceInput.value) || 0;

                    if (packagePrice > 0 && units > 0) {
                        const unitCost = calculatePackagingCost(packagePrice, units);
                        DataManager.savePackaging(title, description, unitCost);
                        
                        // Limpar inputs
                        priceInput.value = '';
                        if (inputsList[1]) inputsList[1].value = '';
                        
                        alert(`${title} salvo com sucesso! Custo unitário: R$ ${unitCost.toFixed(2).replace('.', ',')}`);
                    } else {
                        alert('Por favor, preencha todos os campos com valores válidos.');
                    }
                });
            });

            // Efeito de escala ao focar
            inputs.forEach(input => {
                input.addEventListener("focus", function () {
                    this.parentElement.parentElement.classList.add("scale-[1.02]");
                });
                input.addEventListener("blur", function () {
                    this.parentElement.parentElement.classList.remove("scale-[1.02]");
                });
            });

            // Atualizar número de itens
            window.addEventListener('packagingsUpdated', () => {
                const container = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6');
                const totalItems = container ? container.children.length : 0;
                const badge = document.querySelector('.bg-secondary-container');
                if (badge) {
                    badge.textContent = `Total: ${totalItems} Itens`;
                }
            });
        });
