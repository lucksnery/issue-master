import google.generativeai as genai

# COLE SUA CHAVE AQUI DENTRO
API_KEY = "COLOQUE A CHAVE DA SUA API AQUI"

genai.configure(api_key=API_KEY)

print("--- Buscando modelos disponíveis para sua chave ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Nome: {m.name}")
except Exception as e:
    print(f"Erro ao listar modelos: {e}")
