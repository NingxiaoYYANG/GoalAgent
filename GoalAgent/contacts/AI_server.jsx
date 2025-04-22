const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 8000;

app.post('/completions', async (req, res) => {
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: req.body.message }],
            max_tokens: 1000,
            temperature: 0
        })
    };
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        const data = await response.json();
        res.send(data);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

app.listen(PORT, () => console.log('Your server is running on PORT ' + PORT));

