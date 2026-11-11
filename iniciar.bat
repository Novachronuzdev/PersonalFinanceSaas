@echo off
title FinControl - Gestao Financeira Pessoal Inteligente
chcp 65001 > nul

echo ========================================================
echo       FinControl - Gestão Financeira Pessoal SaaS
echo ========================================================
echo.

:: Ensure Node is in PATH
if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
)

echo Iniciando o servidor FinControl na porta 3001...
echo Abrindo seu navegador em http://localhost:3001...
echo.

start http://localhost:3001

if exist "dist\server.js" (
    node dist\server.js
) else (
    call npm.cmd start
)

pause
