# Estuda+

Versão com visual de app de estudos + backend Render + recursos Premium/IA.

## Render
Crie um **Web Service** apontando para este projeto.
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variable: `OPENAI_API_KEY` = sua chave da API (somente no Render)
- Optional: `OPENAI_MODEL=gpt-5`
- Optional while testing Premium: `DEMO_PREMIUM=true`

Não coloque a chave da OpenAI no HTML/JavaScript do navegador.

## O que está implementado
- Design de app de estudos responsivo.
- Organizador + progresso.
- Flashcards manuais.
- Flashcards gerados por IA (Premium).
- Corretor de redação com IA (Premium).
- Comunidade (Premium, protótipo em memória).

## Importante sobre Premium
`DEMO_PREMIUM=true` é apenas uma chave de teste para liberar as telas Premium. Não é cobrança nem autenticação real.

Para um Premium real, a próxima etapa é adicionar login no servidor, banco de dados e assinatura/pagamento, verificando o plano no backend.
