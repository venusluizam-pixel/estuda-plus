import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 10000;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json({ limit: '120kb' }));
app.use(express.static(__dirname));

// DEMO ONLY: enables Premium while you test the app. A real Premium system
// must verify the user's subscription on the server/database.
const premiumDemo = process.env.DEMO_PREMIUM === 'true';
function requirePremium(req, res, next) {
  if (!premiumDemo) return res.status(403).json({ error: 'premium_required', message: 'Este recurso é Premium.' });
  next();
}

app.get('/api/health', (req, res) => res.json({ ok: true, aiConfigured: !!openai, premiumDemo }));

app.post('/api/essay-correct', requirePremium, async (req, res) => {
  try {
    if (!openai) return res.status(503).json({ error: 'ai_not_configured', message: 'OPENAI_API_KEY não está configurada no Render.' });
    const essay = String(req.body?.essay || '').trim();
    if (!essay) return res.status(400).json({ error: 'empty_essay', message: 'Envie uma redação.' });
    if (essay.length > 12000) return res.status(400).json({ error: 'essay_too_long', message: 'A redação é muito longa para esta versão.' });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      store: false,
      input: [
        { role: 'developer', content: 'Você é um tutor de redação para estudantes brasileiros. Dê feedback educacional e respeitoso. Avalie tese, argumentação, organização, coesão/coerência, repertório e norma-padrão. Não escreva a redação pelo estudante. Responda em português com seções curtas e sugestões práticas.' },
        { role: 'user', content: `Analise esta redação:\n\n${essay}` }
      ]
    });
    res.json({ result: response.output_text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ai_error', message: 'Não foi possível corrigir a redação agora.' });
  }
});

app.post('/api/flashcards-ai', requirePremium, async (req, res) => {
  try {
    if (!openai) return res.status(503).json({ error: 'ai_not_configured', message: 'OPENAI_API_KEY não está configurada no Render.' });
    const text = String(req.body?.text || '').trim();
    if (!text) return res.status(400).json({ error: 'empty_text', message: 'Envie um conteúdo.' });
    if (text.length > 12000) return res.status(400).json({ error: 'text_too_long', message: 'O conteúdo é muito longo para esta versão.' });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      store: false,
      input: [
        { role: 'developer', content: 'Transforme o conteúdo em até 10 flashcards. Retorne somente JSON válido no formato {"cards":[{"question":"...","answer":"..."}]}. Não invente informações.' },
        { role: 'user', content: text }
      ]
    });
    const raw = response.output_text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.cards)) throw new Error('Formato inválido');
    res.json({ cards: parsed.cards.slice(0, 10) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'ai_error', message: 'Não foi possível gerar os flashcards agora.' });
  }
});

// Initial community prototype. It is intentionally in memory until a database is added.
const posts = [];

app.post('/api/community', requirePremium, (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 40);
  const text = String(req.body?.text || '').trim().slice(0, 500);
  if (!name || !text) return res.status(400).json({ error: 'invalid_post', message: 'Preencha nome e publicação.' });
  const post = { id: crypto.randomUUID(), name, text, createdAt: new Date().toISOString() };
  posts.unshift(post);
  res.status(201).json(post);
});
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`Estuda+ rodando na porta ${PORT}`));
