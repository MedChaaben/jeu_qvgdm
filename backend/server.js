const express = require('express');
const axios = require('axios');
const { Builder } = require('xml2js');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.get('/fetch-questions', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://quizzapi.jomoreschi.fr/api/v1/quiz?limit=15'
    );
    const questions = [];
    data.quizzes.forEach((item, index) => {
      questions.push({
        $: { rank: index + 1 },
        name: item.question,
        answerWrong: item.badAnswers,
        answerRight: item.answer,
      });
    });

    const builder = new Builder();
    const xml = builder.buildObject({
      quiz: { questions: { question: questions } },
    });

    res.type('application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
