#!/usr/bin/env python3
import os
import psycopg2

# Script para inicializar o banco de dados no Render

def init_database():
    try:
        # Conectar ao banco de dados
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cursor = conn.cursor()
        
        # Ler o schema.sql
        with open('/app/database/schema.sql', 'r') as f:
            schema_sql = f.read()
        
        # Executar o schema
        cursor.execute(schema_sql)
        
        # Commit das mudanças
        conn.commit()
        
        print("✓ Banco de dados inicializado com sucesso!")
        
    except Exception as e:
        print(f"✗ Erro ao inicializar banco: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    init_database()