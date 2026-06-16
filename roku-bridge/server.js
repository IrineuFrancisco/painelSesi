const puppeteer = require('puppeteer');
const express = require('express');
const path = require('path');
const app = express();

const REACT_APP_URL = 'http://localhost:5173'; // Ou a porta que o seu Vite usa
const PORT = 3000; // Porta onde a Roku vai buscar a imagem

// Função que tira o print da sua tela React
async function takeScreenshot() {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 }); // Resolução da TV
        await page.goto(REACT_APP_URL, { waitUntil: 'networkidle0' });
        await page.screenshot({ path: path.join(__dirname, 'painel.png') });
        await browser.close();
        console.log('Print atualizado: ' + new Date().toLocaleTimeString());
    } catch (e) {
        console.error('Erro ao tirar print:', e);
    }
}

// Atualiza o print a cada 30 segundos
setInterval(takeScreenshot, 30000);
takeScreenshot(); // Tira o primeiro print ao iniciar

// Serve a imagem para a Roku
app.get('/painel.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'painel.png'));
});

app.listen(PORT, () => {
    console.log(`Ponte Roku rodando em http://10.137.146.23:${PORT}/painel.png`);
});