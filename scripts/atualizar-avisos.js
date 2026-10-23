const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://qfnibnhjdnczxoublxif.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_rZf4HnUkAiO16oaQwserjg_Axj-2BwL';

async function atualizarAvisos() {
  console.log('🔄 Buscando avisos atualizados do Supabase...');
  
  try {
    const url = `${SUPABASE_URL}/rest/v1/avisos?select=*&ativo=eq.true&order=ordem.asc`;
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta do Supabase: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Sucesso! ${data.length} avisos ativos encontrados no Supabase:`);
    data.forEach(item => {
      console.log(`  - [${item.tipo}] ${item.titulo || '(Sem título)'} ${item.imagem_url ? `(Imagem: ${item.imagem_url.slice(0, 45)}...)` : ''}`);
    });

    const jsonString = JSON.stringify(data, null, 2);

    const publicPath = path.join(__dirname, '..', 'public', 'avisos.json');
    fs.writeFileSync(publicPath, jsonString, 'utf8');
    console.log(`📁 Atualizado: ${publicPath}`);

    const distDir = path.join(__dirname, '..', 'dist');
    if (fs.existsSync(distDir)) {
      const distPath = path.join(distDir, 'avisos.json');
      fs.writeFileSync(distPath, jsonString, 'utf8');
      console.log(`📁 Atualizado: ${distPath}`);
    }

    console.log('✨ avisos.json sincronizado com sucesso!');
  } catch (err) {
    console.error('❌ Falha ao atualizar avisos:', err.message);
    process.exit(1);
  }
}

atualizarAvisos();
