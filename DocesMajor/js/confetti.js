function createConfetti() {
  const container = document.getElementById("confetti-container");
  if (!container) return;

  const colors = ["#f8c8dc", "#795465", "#ffdcc5", "#ffffff"];
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    const size = Math.random() * 8 + 4;
    const duration = Math.random() * 3 + 4;
    const delay = Math.random() * 5;

    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.top = "-20px";
    confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    confetti.style.animation = `fall ${duration}s linear ${delay}s infinite`;

    container.appendChild(confetti);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  createConfetti();

  // Add click listener for "Limpar Tudo" button globally
  const buttons = document.querySelectorAll('button');
  const btnLimpar = Array.from(buttons).find(b => b && b.textContent.replace(/\s+/g, ' ').includes('Limpar Tudo'));
  
  if (btnLimpar) {
      btnLimpar.addEventListener('click', async () => {
          if (confirm('Tem certeza que deseja apagar todos os dados salvos (receitas, embalagens e caixas)? Essa ação não pode ser desfeita.')) {
              try {
                  const res = await fetch('http://localhost:3000/limpar-tudo', { method: 'DELETE' });
                  if (res.ok) {
                      alert('Todos os dados foram apagados com sucesso!');
                      location.reload();
                  } else {
                      alert('Erro ao apagar os dados.');
                  }
              } catch (e) {
                  console.error(e);
                  alert('Erro de conexão ao tentar apagar os dados.');
              }
          }
      });
  }
});
