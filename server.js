// server.js
const express = require('express');
const path = require('path');
const app = express();

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Rutas API
app.get('/api/balances', async (req, res) => {
    try {
        // Simular datos de balance para prueba
        const balances = [
            { usdt: 1000.00, btc: 0.5, eur: 5000.00 },
            { usdt: 2000.00, btc: 0.3, eur: 3000.00 },
            { usdt: 1500.00, btc: 0.2, eur: 4000.00 }
        ];
        res.json(balances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
