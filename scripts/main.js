class Medallion {
  constructor() {
    this.logo = document.getElementById('logo');
    this.logoimg = document.getElementById('logoimg');
    this.degrees = 0;
    this.rotations = 0;
    this.maxrotations = 0;
    this.timeout = 0;
    this.listener = null;
    this.realListener = null;
  }

  rotate(degrees, maxrotations, timeout, nextListener) {
    this.rotations = 0;
    this.maxrotations = maxrotations;
    this.timeout = timeout;

    if (typeof nextListener !== 'function') {
      throw new Error('nextListener must be a function');
    }
    this.listener = nextListener;
    this.rot();
  }

  lose(listener) {
    this.rotate(90, 10, () => {
      this.logoimg.src = 'images/logo_lost.png';
      this.rotate(270, 10, listener);
    });
  }

  win(listener) {
    this.rotate(90, 10, () => {
      this.logoimg.src = 'images/logo_won.png';
      this.rotate(270, 10, listener);
    });
  }

  rot() {
    if (this.rotations < this.maxrotations) {
      this.rotations++;
      this.rotateOneDegree();
      window.setTimeout(() => this.rot(), this.timeout);
    } else {
      if (typeof this.listener === 'function') {
        this.listener();
      }
    }
  }

  rotateOneDegree() {
    this.degrees += 1;
    if (this.degrees > 360) {
      this.degrees -= 360;
    }
    const transforms = 'rotateY(' + this.degrees + 'deg)';
    this.logo.style.transform = transforms;
    this.logo.style.webkitTransform = transforms;
    this.logo.style.OTransform = transforms;
    this.logo.style.MozTransform = transforms;
  }
}

class Question {
  constructor() {
    this.rank = null;
    this.name = null;
    this.answers = [];
    this.rightAnswer = null;
  }

  setAnswers(answers, rightAnswer) {
    this.answers = this.shuffle(answers);
    this.rightAnswer = this.answers.indexOf(rightAnswer);
  }

  getAnswers() {
    return this.answers;
  }

  shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}

class QuestionBoard {
  constructor(onClickListener) {
    this.ansElement = Array.from({ length: 4 }, (_, i) =>
      document.getElementById('ans' + (i + 1))
    );
    this.ansDiv = this.ansElement.map((_, i) =>
      document.getElementById('element' + i)
    );
    this.questionElement = document.getElementById('question');
    this.newestQuestion = null;
    this.ansDiv.forEach((div, i) => {
      div.addEventListener('click', () => onClickListener(i));
    });
  }

  setQuestion(question) {
    this.newestQuestion = question;
    this.questionElement.innerHTML = question.name;
    this.newestQuestion.getAnswers().forEach((answer, i) => {
      this.ansElement[i].innerHTML = answer;
    });
  }

  updateAnswerStatus(pos, status) {
    ['right', 'wrong'].forEach((cls) => this.ansDiv[pos].classList.remove(cls));
    if (status) {
      this.ansDiv[pos].classList.add(status);
    }
  }

  clear() {
    this.ansDiv.forEach((div) => {
      div.classList.remove('right', 'wrong');
    });
  }

  markSelected(i) {
    this.ansDiv.forEach((div, pos) => {
      div.classList[pos !== i ? 'remove' : 'add']('selected');
    });
  }
}

class LeaderBoard {
  constructor() {
    this.used5050 = false;
    this.usedTel = false;
    this.usedPub = false;
    this.jokers = {
      5050: document.getElementById('joker_5050'),
      Tel: document.getElementById('joker_tel'),
      Pub: document.getElementById('joker_pub'),
    };

    Object.entries(this.jokers).forEach(([key, joker]) => {
      joker.addEventListener('click', () => this.useJoker(key));
    });
  }

  setRank(rank) {
    const rankElement = document.getElementById('r_' + rank);
    if (rank > 1) {
      const prevRankElement = document.getElementById('r_' + (rank - 1));
      prevRankElement.classList.remove('marked');
    }
    rankElement.classList.add('marked');
  }

  useJoker(type) {
    if (!this['used' + type]) {
      this['use' + type]();
      this.jokers[type].src = `images/joker_${type}_x.svg`;
    }
  }

  use5050() {
    game.use5050();
  }

  usePub() {
    this.usedPub = true;
  }

  useTel() {
    this.usedTel = true;
  }
}

class Game {
  constructor() {
    this.questions = [];
    this.rank = 1;
    this.maxrank = 0;
    this.clickable = true;
    this.selectedAnswer = null;

    this.medallion = new Medallion();
    this.questionBoard = new QuestionBoard(this.answerClick.bind(this));
    this.leaderBoard = new LeaderBoard(this.use5050.bind(this));

    this.nextQuestionButton = document.getElementById('nextQuestionButton');
    this.nextQuestionButton.addEventListener(
      'click',
      this.handleNextQuestionClick.bind(this)
    );
    this.nextQuestionButton.style.display = 'none'; // Cacher le bouton au début

    // event clavier
    document.addEventListener('keydown', (event) => this.handlerKeybord(event));

    this.parseXML();
  }

  handleNextQuestionClick() {
    this.nextQuestionButton.style.display = 'none'; // Cacher le bouton
    this.newQuestion();
    this.questionBoard.clear();
    this.clickable = true; // Rendre les réponses cliquables pour la nouvelle question
  }

  parseXML() {
    const xmlhttp = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject('Microsoft.XMLHTTP');

    xmlhttp.onload = () => {
      const xmlDoc = new DOMParser().parseFromString(
        xmlhttp.responseText,
        'text/xml'
      );
      const parsedQuestions = xmlDoc.getElementsByTagName('question');
      this.maxrank = parsedQuestions.length;

      Array.from(parsedQuestions).forEach((pq, x) => {
        const question = new Question();
        question.rank = pq.getAttribute('rank');
        question.name =
          pq.getElementsByTagName('name')[0].childNodes[0].nodeValue;
        const answers = [
          pq.getElementsByTagName('answerWrong')[0].childNodes[0].nodeValue,
          pq.getElementsByTagName('answerWrong')[1].childNodes[0].nodeValue,
          pq.getElementsByTagName('answerWrong')[2].childNodes[0].nodeValue,
          pq.getElementsByTagName('answerRight')[0].childNodes[0].nodeValue,
        ];
        const rightAnswer =
          pq.getElementsByTagName('answerRight')[0].childNodes[0].nodeValue;
        question.setAnswers(answers, rightAnswer);
        this.questions[x] = question;
      });

      this.startGame();
    };

    xmlhttp.open('GET', 'http://localhost:3000/fetch-questions', true);
    // xmlhttp.open('GET', 'quiz.xml', false); // uncomment this line to use the xml file
    xmlhttp.send();
  }

  startGame() {
    this.newQuestion();
  }

  newQuestion() {
    const currentQuestion = this.questions.find(
      (q) => q.rank === this.rank.toString()
    );
    if (currentQuestion) {
      this.leaderBoard.setRank(this.rank);
      this.questionBoard.setQuestion(currentQuestion);
      console.log(currentQuestion);
    }
  }

  answerClick(i) {
    if (this.clickable) {
      const answerSound = document.getElementById('answerSound');
      if (this.selectedAnswer === i) {
        // Si la réponse sélectionnée est cliquée à nouveau, validez-la
        answerSound.pause();
        answerSound.currentTime = 0;
        document.getElementById('questionSound').play();
        this.selectedAnswer = null;
        this.questionBoard.markSelected(null);
        this.check(i);
      } else {
        // Sinon, marquez simplement la réponse comme sélectionnée
        answerSound.play();
        this.selectedAnswer = i;
        this.questionBoard.markSelected(i);
      }
    }
  }

  check(i) {
    this.clickable = false;

    if (i === this.questionBoard.newestQuestion.rightAnswer) {
      this.questionBoard.updateAnswerStatus(i, 'right');
      this.rank++;
      if (this.rank <= this.maxrank) {
        this.medallion.rotate(90, 360, 5, () => {
          console.log('OK');
        });
        this.nextQuestionButton.style.display = 'block';
      } else {
        this.medallion.win(() => {
          console.log('You win');
          document.getElementById('generiqueSound').play();
        });
      }
    } else {
      this.questionBoard.updateAnswerStatus(
        this.questionBoard.newestQuestion.rightAnswer,
        'right'
      );
      this.questionBoard.updateAnswerStatus(i, 'wrong');
      this.medallion.lose(() => {
        console.log('you lose');
        // location.reload();
      });
    }
  }

  use5050() {
    if (this.clickable) {
      const answers = this.questionBoard.newestQuestion.getAnswers();
      let wrongAnswers = answers
        .map((ans, index) =>
          index !== this.questionBoard.newestQuestion.rightAnswer ? index : null
        )
        .filter((index) => index !== null);
      while (wrongAnswers.length > 2) {
        wrongAnswers.splice(Math.floor(Math.random() * wrongAnswers.length), 1);
      }
      wrongAnswers.forEach((ans) =>
        this.questionBoard.updateAnswerStatus(ans, 'wrong')
      );
      return true;
    }
    return false;
  }

  handlerKeybord(event) {
    let key = event.code;
    if (key.includes('Digit')) {
      key = key.slice(-1);
    }

    console.log(key, event);

    // Gérer la progression vers la question suivante
    if (
      (key === 'Space' || key === 'ArrowRight' || key === 'Enter') &&
      this.nextQuestionButton.style.display !== 'none'
    ) {
      this.handleNextQuestionClick();
      return;
    }

    // Gérer la sélection et la validation des réponses
    if (this.clickable) {
      // Si une réponse est déjà sélectionnée et que l'utilisateur appuie sur 'Enter', validez cette réponse
      if (key === 'Enter' && this.selectedAnswer != null) {
        this.answerClick(this.selectedAnswer);
      } else if (key >= '1' && key <= '4') {
        // Sinon, sélectionnez la réponse correspondant à la touche pressée
        const answerIndex = parseInt(key, 10) - 1;
        this.answerClick(answerIndex);
      }
    } else {
      if (key === 'Enter') document.location.reload();
    }
  }

  confirmReload() {
    if (
      confirm(
        'Êtes-vous sûr de vouloir recommencer ?\nCette action effacera votre progression et démarera une nouvelle partie'
      )
    ) {
      window.location.reload();
    }
  }
}

const game = new Game();
game.startGame();
