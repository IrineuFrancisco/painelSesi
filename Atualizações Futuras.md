# 🚀 Guia de Atualizações Futuras

Nas próximas vezes que você alterar o sistema, precisará apenas de 2 passos simples:

---

### 1. No seu computador (VS Code local)

Abra o terminal do **PowerShell** no seu computador e execute:

```powershell
npm run build
git add .
git commit -m "Descrição das suas alterações"
git push origin main
```

---

### 2. No servidor (Terminal SSH)

No terminal SSH conectado ao seu servidor (`painel-sesi`), execute:

```bash
cd /var/www/painelsesi
git pull
```

---

✨ **Pronto!** Seu painel estará 100% atualizado e rodando com as alterações mais recentes no servidor!