const express = require('express');
const axios = require('axios');
const { Builder } = require('xml2js');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use(cors());

// format result from https://opentdb.com/api.php?amount=15&type=multiple
app.get('/fetch-questions', async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://opentdb.com/api.php?amount=15&type=multiple'
    );

    const questions = [];

    for (const item of data.results) {
      questions.push({
        $: { rank: questions.length + 1 },
        name: item.question,
        answerWrong: item.incorrect_answers,
        answerRight: item.correct_answer,
      });
    }

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

// translat and format result from https://opentdb.com/api.php?amount=15&type=multiple
app.get('/fetch-questions-i18n', async (req, res) => {
  try {
    const deepl = require('deepl-node');
    const translator = new deepl.Translator(process.env.AUTH_KEY_DEEPL);
    const { lang } = req.query;
    const { data } = await axios.get(
      'https://opentdb.com/api.php?amount=1&type=multiple'
    );

    const questions = [];

    for (const item of data.results) {
      const [
        question_translated,
        incorrect_answers_translated,
        correct_answer_translated,
      ] = await translator.translateText(
        [item.question, item.incorrect_answers.join('**'), item.correct_answer],
        null,
        lang
      );

      questions.push({
        $: { rank: questions.length + 1 },
        name: question_translated.text,
        answerWrong: incorrect_answers_translated.text.split('**'),
        answerRight: correct_answer_translated.text,
      });
    }

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

// format result from french api https://quizzapi.jomoreschi.fr/api/v1/quiz?limit=15
app.get('/fetch-questions-fr', async (req, res) => {
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
