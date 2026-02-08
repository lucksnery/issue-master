// URL do Backend (FastAPI que criaremos na próxima etapa)
const API_URL = "http://127.0.0.1:8000/analisar_chamado"; 

async function avaliarChamado() {
    const textoDescricao = document.getElementById("descricaoChamado").value;
    const btn = document.getElementById("btnAvaliar");
    const loading = document.getElementById("loadingArea");
    const resultado = document.getElementById("resultadoArea");
    const emptyResult = document.getElementById("emptyResultArea");

    // Validação simples
    if (!textoDescricao.trim() || textoDescricao.length < 10) {
        alert("Por favor, digite uma descrição com pelo menos 10 caracteres.");
        return;
    }

    // UI: Prepara para processamento
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Analisando...';
    loading.classList.remove("d-none");
    resultado.classList.add("d-none");
    emptyResult.classList.add("d-none");

    try {
        // --- INÍCIO DA REQUISIÇÃO AO BACKEND ---
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ descricao: textoDescricao })
        });

        if (!response.ok) {
            throw new Error("Erro na comunicação com o servidor.");
        }

        const data = await response.json();
        // --- FIM DA REQUISIÇÃO ---

        // Se quiser testar SEM o backend agora, descomente a linha abaixo e comente o bloco fetch acima:
        // const data = mockDadosTeste(textoDescricao); await new Promise(r => setTimeout(r, 1500)); 

        exibirResultados(data);

    } catch (error) {
        console.error("Erro:", error);
        alert("Ocorreu um erro ao conectar com o Agente de IA. Verifique se o Backend está rodando.");
    } finally {
        // Restaura estado inicial dos controles
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-magic"></i> Avaliar Descrição';
        loading.classList.add("d-none");
    }
}

function exibirResultados(data) {
    const resultadoArea = document.getElementById("resultadoArea");
    const emptyResult = document.getElementById("emptyResultArea");
    const badgeNota = document.getElementById("badgeNota");
    const barraProgresso = document.getElementById("barraProgresso");
    const textoFeedback = document.getElementById("textoFeedback");
    const listaSugestoes = document.getElementById("listaSugestoes");

    // 1. Atualiza Nota
    const nota = data.nota; // Espera-se um valor float ou int
    badgeNota.innerText = `Nota: ${nota}/10`;
    
    // Lógica de Cores baseada na regra do projeto
    let corClasse = "bg-secondary";
    if (nota <= 4) corClasse = "bg-danger";      // 0-4: Insuficiente
    else if (nota <= 7) corClasse = "bg-warning text-dark"; // 5-7: Aceitável
    else corClasse = "bg-success";              // 8-10: Completo

    // Atualiza Badge e Barra
    badgeNota.className = `badge rounded-pill fs-6 ${corClasse}`;
    barraProgresso.className = `progress-bar ${corClasse.replace("text-dark", "")}`; // Remove text-dark da barra
    barraProgresso.style.width = `${nota * 10}%`;

    // 2. Atualiza Feedback
    textoFeedback.innerText = data.feedback;

    // 3. Atualiza Sugestões (Lista)
    listaSugestoes.innerHTML = ""; // Limpa anterior
    if (data.sugestoes && data.sugestoes.length > 0) {
        data.sugestoes.forEach(sugestao => {
            const li = document.createElement("li");
            li.innerText = sugestao;
            listaSugestoes.appendChild(li);
        });
    } else {
        const li = document.createElement("li");
        li.innerText = "Nenhuma ação adicional necessária. Descrição excelente!";
        li.className = "text-success";
        listaSugestoes.appendChild(li);
    }

    // Mostra a área final e esconde a vazia
    emptyResult.classList.add("d-none");
    resultadoArea.classList.remove("d-none");
    // Scroll suave até o resultado
    resultadoArea.scrollIntoView({ behavior: 'smooth' });
}

// --- FUNÇÃO DE MOCK PARA TESTES (OPCIONAL) ---
// Use isso se quiser ver a tela funcionando antes de criar o Python
function mockDadosTeste(texto) {
    // Simula uma resposta do servidor
    return {
        nota: 6.5,
        feedback: "A descrição menciona o problema 'computador travando', mas falta clareza sobre quando isso ocorre.",
        sugestoes: [
            "Informe se aparece alguma mensagem de erro na tela azul.",
            "O problema acontece ao abrir um programa específico?",
            "Reinicie o computador e verifique se o erro persiste."
        ]
    };
}