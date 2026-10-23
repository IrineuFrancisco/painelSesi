# 🚀 Guia de Atualizações e Sincronização dos Banners

Agora o sistema sincroniza os avisos e banners do Supabase de forma inteligente e resiliente tanto em computadores quanto nas Smart TVs.

---

## 🔄 Como Atualizar Banners e Cardápios

### Opção A: Em tempo real pelo Gerenciador (`cardapio.html` ou Supabase)
- Em computadores, notebooks e celulares, o painel lê **diretamente do Supabase** em tempo real a cada 5 segundos.
- Quando você adiciona, edita ou desativa um banner no Supabase ou no `cardapio.html`, a alteração é imediata.

### Opção B: Atualização rápida local dos arquivos JSON
Se você quiser atualizar os arquivos locais `avisos.json` (usados como contingência e pelas Smart TVs):
```powershell
npm run atualizar-avisos
```

---

## 📺 Sincronização Automática nas Smart TVs (Servidor Linux)

Para que a TV do painel atualize os banners automaticamente sempre que você salvar no Supabase (sem precisar de `git pull`), configure o `cron` no servidor Linux uma única vez:

1. No terminal SSH do servidor (`painel-sesi`):
```bash
crontab -e
```

2. Adicione esta linha no final do arquivo (executa a cada 2 minutos):
```text
*/2 * * * * /var/www/painelsesi/atualizar_avisos.sh > /dev/null 2>&1
```

3. Salve e feche.
> **Pronto!** O servidor baixará as novidades do Supabase a cada 2 minutos com `curl -k` (ignorando SSL para não travar a Smart TV) e a TV atualizará a tela automaticamente a cada 5 segundos!

---

## 💻 Para Atualizações de Código (Deploy Completo)

Quando você alterar o código-fonte (React, CSS, componentes):

### 1. No seu computador (VS Code local)
```powershell
npm run build
git add .
git commit -m "Atualizações dos banners e componentes"
git push origin main
```

*(O `npm run build` já executa automaticamente o script que baixa os dados mais recentes do Supabase antes de compilar).*

---

### 2. No servidor (Terminal SSH)
```bash
cd /var/www/painelsesi
git pull
```

---

✨ **Pronto!** Seu painel estará 100% atualizado e rodando com as alterações mais recentes no servidor!