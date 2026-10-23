#!/bin/bash
# Script para buscar os dados do Supabase e salvar localmente

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Define destinos locais e de produção
DESTINO_PROD="/var/www/painelsesi/dist/avisos.json"
DESTINO_LOCAL="${SCRIPT_DIR}/dist/avisos.json"

TMP_FILE="/tmp/avisos_novo.json"

# Busca dados do Supabase com curl ignorando SSL (-k) para Smart TVs
curl -s -k "https://qfnibnhjdnczxoublxif.supabase.co/rest/v1/avisos?select=*&ativo=eq.true&order=ordem.asc" \
  -H "apikey: sb_publishable_rZf4HnUkAiO16oaQwserjg_Axj-2BwL" \
  -H "Authorization: Bearer sb_publishable_rZf4HnUkAiO16oaQwserjg_Axj-2BwL" \
  -o "$TMP_FILE"

# Valida se o arquivo baixado é um JSON válido e não está vazio
if [ -s "$TMP_FILE" ] && grep -q '"id"' "$TMP_FILE"; then
  if [ -d "/var/www/painelsesi/dist" ]; then
    cp "$TMP_FILE" "$DESTINO_PROD"
    echo "Avisos atualizados com sucesso em $DESTINO_PROD!"
  fi

  if [ -d "${SCRIPT_DIR}/dist" ]; then
    cp "$TMP_FILE" "$DESTINO_LOCAL"
    echo "Avisos atualizados com sucesso em $DESTINO_LOCAL!"
  fi

  if [ -d "${SCRIPT_DIR}/public" ]; then
    cp "$TMP_FILE" "${SCRIPT_DIR}/public/avisos.json"
  fi
  rm -f "$TMP_FILE"
else
  echo "Erro: Falha ao obter dados válidos do Supabase."
  rm -f "$TMP_FILE"
  exit 1
fi
