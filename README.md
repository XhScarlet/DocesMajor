# 🍫 Doces da Major - Sistema de Gestão e Precificação

Sistema de gestão e precificação desenvolvido sob medida para doces artesanais e ateliês de confeitaria. O projeto auxilia no cálculo preciso do custo de receitas, precificação de embalagens, composição de caixas de doces, controle de vendas e análise de lucratividade por meio de dashboards integrados. 

---

## 🚀 Funcionalidades do Sistema

O sistema é dividido em módulos estratégicos acessíveis pelo menu lateral:

* **🫕 Custo da Receita:** Calcule o investimento exato para cada doce artesanal. Inclui uma base para brigadeiro tradicional (Leite Condensado, Creme de Leite e Manteiga proporcional) e permite adicionar novos sabores com ingredientes extras personalizados e cálculo automático de rendimento em unidades.
* **📦 Custo de Embalagens:** Organize e rateie os custos de apresentação do seu produto (Forminha interna, tapetinho externo, caixas de presente e etiquetas personalizadas) por unidade.
* **💰 Precificação:** Monte caixas personalizadas combinando diferentes sabores, aplique os custos das embalagens e defina o preço de venda desejado para visualizar instantaneamente o Lucro Líquido e a Margem de Lucro (%).
* **📊 Gráficos de Vendas (Dashboard):** Painel financeiro completo com métricas de Vendas Totais, Lucro Total, Margem Média, Ticket Médio por caixa e gráfico de distribuição de sabores favoritos.
* **🧹 Limpar Tudo / Suporte:** Atalhos para resetar dados ou entrar em contato direto com o suporte do ateliê.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando tecnologias web modernas para o front-end e um servidor Node.js leve para persistência:

* **Front-end:** HTML5, CSS3 (com ícones da biblioteca Material Icons) e JavaScript Assíncrono.
* **Back-end:** Node.js (Servidor local `server.js`).
* **Armazenamento de Dados:** Arquivos locais no formato **JSON** (Sem necessidade de instalar bancos de dados complexos como MySQL ou MongoDB).

---

## 📋 Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão 14 ou superior recomendada).
* Um gerenciador de pacotes como o **npm** (já vem instalado com o Node).

---

## 🔧 Como Instalar e Rodar o Projeto

Clique no link: (https://docesmajor.onrender.com/) ou
Siga os passos abaixo para executar o sistema localmente na sua máquina:

### 1. Clonar ou Baixar o Repositório
Se você utiliza o Git, clone o repositório executando o comando no terminal:
```bash
git clone https://github.com/XhScarlet/DocesMajor.git
```

*Caso não utilize o Git, basta baixar o arquivo ZIP do projeto diretamente no GitHub e extrair na sua máquina.*

### 2. Acessar a Pasta do Projeto

Pelo terminal/prompt de comando, entre no diretório onde estão os arquivos:

```bash
cd DocesMajor
```

### 3. Instalar as Dependências (Se houver)

Caso o projeto utilize alguma dependência (como o `express`), instale executando:

```bash
npm install
```

### 4. Iniciar o Servidor

Com tudo pronto, inicie o servidor Node.js executando:

```bash
node server.js
```

### 5. Acessar no Navegador

Após rodar o comando, o servidor estará ativo. Abra o seu navegador de preferência e digite o endereço local (geralmente `http://localhost:3000` ou a porta configurada no seu arquivo `server.js`).

---
## 6. Contribuições:

https://github.com/XhScarlet : Desenvolvedora Full-Stack
https://github.com/murilosilvsilva-jpg : Desenvolvedor por trás da lógica do Back-end


---

## 💾 Estrutura de Armazenamento (Banco de Dados JSON)

Como o sistema **não utiliza um banco de dados tradicional**, todas as informações salvas de sabores, custos de embalagens e registros de vendas são escritas e mantidas em ficheiros `.json` locais dentro do próprio projeto.

> ⚠️ **Nota Importante:** Não apague os ficheiros `.json` gerados na raiz ou na pasta de dados do projeto, pois eles contêm o histórico e as configurações salvas do seu ateliê.

---

## 📝 Licença

Este projeto está sob a licença de uso do Ateliê Doces da Major.
© 2026 Doces da Major - Calculadora Artesanal. Todos os direitos reservados.
