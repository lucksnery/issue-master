import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import os
from dotenv import load_dotenv

# 1. Carrega as variáveis do arquivo .env
load_dotenv()

# 2. Pega a chave de forma segura
API_KEY = os.getenv("GEMINI_API_KEY")

# Verifica se a chave foi carregada (boa prática para debug)
if not API_KEY:
    raise ValueError("A chave da API não foi encontrada! Verifique o arquivo .env")

# Entregamos a chave para a biblioteca do Google
genai.configure(api_key=API_KEY)

# Configuração do Modelo
model = genai.GenerativeModel(
    model_name="models/gemini-flash-latest",
    generation_config={
        "response_mime_type": "application/json" # Força a IA a responder SEMPRE em JSON
    }
)

# --- INICIALIZAÇÃO DO APP ---
app = FastAPI(title="IssueMaster API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChamadoInput(BaseModel):
    descricao: str

# --- PROMPT DO SISTEMA (A "Alma" do Agente) ---
def criar_prompt(descricao_usuario):
    return f"""
    Você é o IssueMaster, um especialista em Triagem de TI. 
    Sua missão é avaliar a qualidade da descrição de um chamado técnico.

    Analise a seguinte descrição enviada pelo usuário:
    ---
    "{descricao_usuario}"
    ---

    Critérios de Avaliação (Verifique se existem):
    1. Contexto (Qual equipamento? Qual sistema?)
    2. O Problema (O que está acontecendo exatemente?)
    3. Evidências (Mensagens de erro, prints, códigos)
    4. Momento (Quando começou?)
    5. Impacto (Impede o trabalho? É urgente?)

    Regras de Pontuação (0 a 10):
    - 0-4: Descrição vaga, impossível de resolver sem perguntar mais.
    - 5-7: Dá para entender, mas faltam detalhes cruciais.
    - 8-10: Perfeito, técnico tem tudo para resolver.

    SAÍDA ESPERADA (Formato JSON):
    {{
        "nota": (número float, ex: 8.5),
        "feedback":String curta explicando o porquê da nota,
        "sugestoes": [Lista de strings com perguntas para o usuário melhorar o chamado ou testes básicos para ele fazer]
    }}
    
    Responda apenas com o JSON.
    """

# --- ROTAS ---

@app.post("/analisar_chamado")
def analisar_chamado(chamado: ChamadoInput):
    print(f"Recebido: {chamado.descricao}")

    try:
        # 1. Envia o prompt para o Gemini
        response = model.generate_content(criar_prompt(chamado.descricao))
        
        # 2. Pega o texto da resposta
        resposta_json = response.text
        print("Resposta da IA:", resposta_json) # Log para debug

        # 3. Converte string JSON para dicionário Python
        dados_processados = json.loads(resposta_json)

        return dados_processados

    except Exception as e:
        print(f"Erro ao chamar Gemini: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a IA.")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)