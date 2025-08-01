// Quiz Data
const quizData = [
    {
        question: "What is the capital of France?",
        answers: ["London", "Berlin", "Paris", "Madrid"],
        correct: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        question: "Who painted the Mona Lisa?",
        answers: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2
    },
    {
        question: "What is the largest ocean on Earth?",
        answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: 3
    },
    {
        question: "In which year did World War II end?",
        answers: ["1943", "1944", "1945", "1946"],
        correct: 2
    },
    {
        question: "What is the smallest country in the world?",
        answers: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
        correct: 2
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        answers: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correct: 1
    },
    {
        question: "What is the chemical symbol for gold?",
        answers: ["Go", "Gd", "Au", "Ag"],
        correct: 2
    },
    {
        question: "Which country is home to the kangaroo?",
        answers: ["New Zealand", "South Africa", "Australia", "Brazil"],
        correct: 2
    },
    {
        question: "What is the fastest land animal?",
        answers: ["Lion", "Cheetah", "Leopard", "Tiger"],
        correct: 1
    }
];

// Quiz State Variables
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let userAnswers = [];

// DOM Elements - Buttons
const startBtn = document.getElementById('startBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');

// DOM Elements - Containers
const startScreen = document.getElementById('startScreen');
const questionContainer = document.getElementById('questionContainer');
const resultsContainer = document.getElementById('resultsContainer');
const answersContainer = document.getElementById('answersContainer');

// DOM Elements - Display Elements
const questionText = document.getElementById('questionText');
const progressBar = document.getElementById('progressBar');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const scoreSpan = document.getElementById('score');
const totalScoreSpan = document.getElementById('totalScore');
const percentageSpan = document.getElementById('percentage');
const resultMessage = document.getElementById('resultMessage');

// Initialize Display Values
totalQuestionsSpan.textContent = quizData.length;
totalScoreSpan.textContent = quizData.length;

// Event Listeners
startBtn.addEventListener('click', startQuiz);
prevBtn.addEventListener('click', previousQuestion);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartQuiz);

function startQuiz() {
    startScreen.style.display = 'none';
    questionContainer.style.display = 'block';
    loadQuestion();
}

function loadQuestion() {
    const question = quizData[currentQuestion];
    questionText.textContent = question.question;
    answersContainer.innerHTML = '';
    selectedAnswer = userAnswers[currentQuestion] !== undefined ? userAnswers[currentQuestion] : null;

    /* 
    Create answer options
    Create radio buttons (only one can be selected at a time)
    Create labels for each answer
    Add event listeners to each answer option for selection
    Append answer div to answersContainer
    */
    question.answers.forEach((answer, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.className = 'answer-option';
        if (selectedAnswer === index) {
            answerDiv.classList.add('selected');
        }

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'answer';
        radio.value = index;
        radio.id = `answer${index}`;
        radio.checked = selectedAnswer === index;

        const label = document.createElement('label');
        label.htmlFor = `answer${index}`;
        label.textContent = answer;

        answerDiv.appendChild(radio);
        answerDiv.appendChild(label);
        
        answerDiv.addEventListener('click', () => selectAnswer(index));
        answersContainer.appendChild(answerDiv);
    });

    updateUI();
}

// Function to handle answer selection
function selectAnswer(index) {
    selectedAnswer = index;
    userAnswers[currentQuestion] = index;

    document.querySelectorAll('.answer-option').forEach((option, i) => {
        if (i === index) {
            option.classList.add('selected');
            option.querySelector('input').checked = true;
        } else {
            option.classList.remove('selected');
            option.querySelector('input').checked = false;
        }
    });

    nextBtn.disabled = false;
}

// Navigation Functions
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

function nextQuestion() {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        showResults();
    }
}

// Update UI Functions
function updateUI() {
    prevBtn.disabled = currentQuestion === 0;
    nextBtn.disabled = selectedAnswer === null;
    
    if (currentQuestion === quizData.length - 1) {
        nextBtn.textContent = 'Finish';
    } else {
        nextBtn.textContent = 'Next';
    }

    currentQuestionSpan.textContent = currentQuestion + 1;
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function calculateScore() {
    score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === quizData[index].correct) {
            score++;
        }
    });
}

function showResults() {
    calculateScore();
    questionContainer.style.display = 'none';
    resultsContainer.style.display = 'block';

    scoreSpan.textContent = score;
    const percentage = Math.round((score / quizData.length) * 100);
    percentageSpan.textContent = percentage;

    if (percentage >= 80) {
        resultMessage.textContent = "Excellent work! You're a quiz master!";
        resultMessage.style.color = '#10b981';
    } else if (percentage >= 60) {
        resultMessage.textContent = "Good job! Keep practicing to improve.";
        resultMessage.style.color = '#f59e0b';
    } else {
        resultMessage.textContent = "Keep trying! Practice makes perfect.";
        resultMessage.style.color = '#ef4444';
    }
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    userAnswers = [];
    
    resultsContainer.style.display = 'none';
    startScreen.style.display = 'block';
    progressBar.style.width = '0%';
}