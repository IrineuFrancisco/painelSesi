#!/bin/bash
# Script para buscar os dados do Supabase e salvar localmente

# Onde a pasta dist está hospedada no seu servidor Linux
DESTINO="/var/www/painelsesi/dist/avisos.json"

# Removemos o wget que estava bugado e voltamos para o curl com -k (para ignorar certificados)
curl -s -k "https://qfnibnhjdnczxoublxif.supabase.co/rest/v1/avisos?select=*&ativo=eq.true&order=ordem.asc" \
  -H "apikey: sb_publishable_rZf4HnUkAiO16oaQwserjg_Axj-2BwL" \
  -H "Authorization: Bearer sb_publishable_rZf4HnUkAiO16oaQwserjg_Axj-2BwL" \
  -o $DESTINO

echo "Avisos atualizados com sucesso em $DESTINO!"
