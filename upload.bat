@echo off
echo =================================================
echo   UPLOAD PARA GITHUB - SISTEMA CLINICA ESTETICA
echo =================================================
echo.

cd /d "C:\Users\kalel\OneDrive\Documents\Sistema_finissima\sistema-clinica"

echo 1. Inicializando Git...
git init
if %errorlevel% neq 0 (
    echo ERRO: Git nao encontrado ou falha na inicializacao
    pause
    exit /b 1
)

echo 2. Adicionando arquivos...
git add .

echo 3. Fazendo commit...
git commit -m "Initial commit - Sistema Clínica Estética"

echo 4. Conectando ao GitHub...
git remote add origin https://github.com/finissima-estetica/sistem.git

echo 5. Configurando branch...
git branch -M main

echo 6. Enviando para GitHub...
git push -u origin main

echo.
echo =================================================
echo   UPLOAD CONCLUIDO!
echo =================================================
echo.
echo Acesse: https://github.com/finissima-estetica/sistem
echo.
echo Depois va ao Render para fazer o deploy:
echo https://dashboard.render.com
echo.
pause
