#!/bin/bash
# Script para inicializar o banco de dados no Render

echo "Inicializando banco de dados..."

# Executar o schema.sql usando psql
psql $DATABASE_URL -f /app/database/schema.sql

echo "Banco de dados inicializado com sucesso!"