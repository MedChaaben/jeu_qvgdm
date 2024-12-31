const express = require('express');
const axios = require('axios');
const { Builder } = require('xml2js');
const deepl = require('deepl-node');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const translator = new deepl.Translator(process.env.AUTH_KEY_DEEPL);
const translateWithDeepl = (item, lang) => {
  return translator.translateText(
    [item.question, item.incorrect_answers.join('**'), item.correct_answer],
    null,
    lang
  );
};

// translat and format result from https://opentdb.com/api.php?amount=15&type=multiple
app.get('/fetch-questions-i18n', async (req, res) => {
  try {
    const { lang } = req.query;
    const { data } = await axios.get(
      'https://opentdb.com/api.php?amount=15&type=multiple'
    );

    const questions = [];
    let rank = 1;

    for (const item of data.results) {
      let question, incorrect_answers, correct_answer;

      if (!lang || lang === 'en') {
        question = { text: item.question };
        incorrect_answers = {
          text: item.incorrect_answers.join('**'),
        };
        correct_answer = { text: item.correct_answer };
      } else {
        [question, incorrect_answers, correct_answer] =
          await translateWithDeepl(item, lang);
      }

      questions.push({
        $: { rank: rank++ },
        name: question.text,
        answerWrong: incorrect_answers.text.split('**'),
        answerRight: correct_answer.text,
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
