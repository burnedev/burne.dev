// 题型常量
const QUESTION_TYPES = {
    WORD_TO_MEANING: 'word_to_meaning',    // 单词选意思
    WORD_TO_READING: 'word_to_reading',    // 单词选读音
    MEANING_TO_WORD: 'meaning_to_word'     // 意思选单词
};

// 添加题型提示语常量
const QUESTION_HINTS = {
    [QUESTION_TYPES.WORD_TO_MEANING]: '请选择正确的中文含义',
    [QUESTION_TYPES.WORD_TO_READING]: '请选择正确的读音',
    [QUESTION_TYPES.MEANING_TO_WORD]: '请选择对应的单词'
};

let words = [];
let currentWordIndex = 0;
let currentWord = null;
let currentQuestionType = QUESTION_TYPES.WORD_TO_MEANING;
let wordProgress = {};  // 记录每个单词在不同题型下的答题情况
let password = ''; // 存储密码
let baseUrl = 'https://jl.charlesyin20218621.workers.dev/words'

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 显示密码输入界面
    showPasswordInput();
});

function showPasswordInput() {
    const container = document.getElementById('setup');
    container.innerHTML = `
        <div class="password-container">
            <h2>请输入密码</h2>
            <input type="password" id="passwordInput" class="password-input" placeholder="请输入密码">
            <button onclick="verifyPassword()" class="password-button">确认</button>
        </div>
    `;
}

function verifyPassword() {
    const passwordInput = document.getElementById('passwordInput');
    password = passwordInput.value.trim();
    
    if (!password) {
        alert('请输入密码');
        return;
    }
    
    // 显示课程选择界面
    reshowSelectorPage();
    showLevelSelect(password);
    showLessonSelect(password);
}


function reshowSelectorPage() {
    const container = document.getElementById('setup');
    container.innerHTML = `
        <h2>选择学习等级和课程</h2>
        <div class="setup-form">
            <label>选择等级:</label>
            <select id="levelSelect"></select>
            <label>选择课程：</label>
            <select id="lessonSelect"></select>
            <div id="isMainContainer">
                <label>是否包含附加章节单词</label>
                <input type="checkbox" id="isMain"/>
            </div>
            <button onclick="startLearning()">开始学习</button>
        </div>
    `;
}


async function showLevelSelect(password) {
    const levelSelector = document.getElementById('levelSelect');
    console.log(levelSelector);

    levelSelector.addEventListener('change', function() {
        showLessonSelect(password);
    });

    try {
        const response = await fetch(
            baseUrl + `/level?p=${password}`,
            {
                method: 'post'
            }
        );

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            // 如果密码错误，返回密码输入界面
            if (data.error === 'password is incorrect!') {
                showPasswordInput();
            }
            return;
        }

        levelMap = {
            1: '初级',
            2: '初中级',
            3: '中级'
        };

        let levelContent = '<option value="">请选择课程</option>';

        for (let item of data.datas) {
            levelContent = levelContent + `\n<option value="${item.level}">${levelMap[item.level]}</option>`
        };

        levelSelector.innerHTML = levelContent;
    } catch (error) {
        console.error('获取数据失败:', error);
        alert('获取数据失败，请检查网络连接');
    };
}

async function showLessonSelect(password) {
    const lessonSelector = document.getElementById('lessonSelect');
    console.log(lessonSelector);

    const levelSelector = document.getElementById('levelSelect');
    const level = Number(levelSelector.value);

    if (level == 0) {
        lessonSelector.innerHTML = '<option value="">请选择课程</option>';
    } else {
        try {
            const response = await fetch(
                baseUrl + `/lesson?p=${password}&level=${level}`,
                {
                    method: 'post'
                }
            );

            const data = await response.json();

            if (data.error) {
                alert(data.error);
                // 如果密码错误，返回密码输入界面
                if (data.error === 'password is incorrect!') {
                    showPasswordInput();
                }
                return;
            }

            let lessonContent = '<option value="">请选择课程</option>';

            for (let item of data.datas) {
                lessonContent = lessonContent + `\n<option value="${item.lesson}">第${item.lesson}课</option>`
            };

            lessonSelector.innerHTML = lessonContent;
        } catch (error) {
            console.error('获取数据失败:', error);
            alert('获取数据失败，请检查网络连接');
        };
    };
}

async function startLearning() {
    const lessonSelect = document.getElementById('lessonSelect');
    const selectedLesson = lessonSelect.value;
    const mainSelect = document.getElementById('isMain');
    let isMain = 0;

    if (mainSelect.checked) {
        isMain = 1;
    }
    
    if (!selectedLesson) {
        alert('请选择课程');
        return;
    }

    const levelSelect = document.getElementById('levelSelect');
    const selectedLevel = levelSelect.value;
    
    try {
        // 从接口获取数据
        const response = await fetch(
            `${baseUrl}/list?level=${selectedLevel}&lesson=${selectedLesson}&p=${password}&is_main=${isMain}`,
            {
                method: 'post'
            }
        );
        const data = await response.json();
        
        if (data.error) {
            alert(data.error);
            // 如果密码错误，返回密码输入界面
            if (data.error === 'password is incorrect!') {
                showPasswordInput();
            }
            return;
        }
        
        // 使用接口返回的数据
        words = data.datas;
        console.log('获取到的单词数据:', words);
        
        // 初始化单词进度
        initWordProgress(words);
        
        // 随机排序单词
        shuffleArray(words);
        
        // 隐藏设置界面，显示练习界面
        document.getElementById('setup').style.display = 'none';
        document.getElementById('practice').style.display = 'block';
        
        currentWordIndex = 0;
        showNextWord();
        
    } catch (error) {
        console.error('获取数据失败:', error);
        alert('获取数据失败，请检查网络连接');
    }
}

function initWordProgress(words) {
    console.log('初始化单词进度追踪');
    words.forEach(word => {
        wordProgress[word.word] = {
            [QUESTION_TYPES.WORD_TO_MEANING]: false,
            [QUESTION_TYPES.WORD_TO_READING]: word.reading ? false : true,
            [QUESTION_TYPES.MEANING_TO_WORD]: false
        };
        console.log(`单词 ${word.word} 的初始进度:`, wordProgress[word.word]);
    });
}

function showNextWord() {
    console.log('\n=== 显示下一个问题 ===');
    
    if (currentWordIndex >= words.length && !hasUnmasteredWords()) {
        console.log('所有单词学习完成，显示结果');
        showResult();
        return;
    }

    if (currentWordIndex >= words.length) {
        currentWordIndex = 0;
    }

    currentWord = words[currentWordIndex];
    const questionData = generateQuestion(words, currentWord);
    
    // 获取容器
    const practiceContainer = document.getElementById('practice');
    
    // 重置容器内容，添加进度条
    practiceContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress"></div>
        </div>
        <div class="word-card">
            <div class="question-hint"></div>
            <div class="word-japanese"></div>
        </div>
        <div class="options-container"></div>
        <button class="dont-know-button">不认识</button>
    `;
    
    // 获取新创建的元素
    const questionHint = practiceContainer.querySelector('.question-hint');
    const wordJapanese = practiceContainer.querySelector('.word-japanese');
    const optionsContainer = practiceContainer.querySelector('.options-container');
    const dontKnowButton = practiceContainer.querySelector('.dont-know-button');
    
    // 设置提示语和问题文本
    questionHint.textContent = QUESTION_HINTS[currentQuestionType];
    wordJapanese.textContent = questionData.question;
    
    // 绑定"不认识"按钮事件
    dontKnowButton.onclick = () => handleDontKnow(questionData.correctAnswer);
    
    // 添加选项按钮
    questionData.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option;
        button.onclick = () => checkAnswer(option, questionData.correctAnswer);
        optionsContainer.appendChild(button);
    });
    
    updateProgressBar();
}

function generateQuestion(words, currentWord) {
    console.log('\n=== 生成问题 ===');
    console.log('当前题型:', currentQuestionType);
    console.log('当前单词:', currentWord);

    const options = [];
    let question, correctAnswer;
    
    // 添加一个函数来获取可用的错误选项池
    const getWrongOptions = (words, correctAnswer, type) => {
        return words.filter(word => {
            switch(type) {
                case QUESTION_TYPES.WORD_TO_MEANING:
                    return word.meaning !== correctAnswer;
                case QUESTION_TYPES.WORD_TO_READING:
                    return word.reading && word.reading !== correctAnswer;
                case QUESTION_TYPES.MEANING_TO_WORD:
                    return word.word !== correctAnswer;
            }
        });
    };

    switch(currentQuestionType) {
        case QUESTION_TYPES.WORD_TO_MEANING:
            console.log('生成单词选意思的题目');
            question = currentWord.word;
            correctAnswer = currentWord.meaning;
            // 获取所有可用的错误选项
            const wrongMeanings = getWrongOptions(words, correctAnswer, QUESTION_TYPES.WORD_TO_MEANING)
                .map(word => word.meaning);
            // 随机选择3个不重复的错误选项
            while (options.length < 3 && wrongMeanings.length > 0) {
                const randomIndex = Math.floor(Math.random() * wrongMeanings.length);
                options.push(wrongMeanings.splice(randomIndex, 1)[0]);
            }
            break;

        case QUESTION_TYPES.WORD_TO_READING:
            console.log('生成单词选读音的题目');
            if (!currentWord.reading) {
                console.log('当前单词没有读音，切换题型');
                switchQuestionType();
                return generateQuestion(words, currentWord);
            }
            question = currentWord.word;
            correctAnswer = currentWord.reading;
            const wrongReadings = getWrongOptions(words, correctAnswer, QUESTION_TYPES.WORD_TO_READING)
                .map(word => word.reading);
            while (options.length < 3 && wrongReadings.length > 0) {
                const randomIndex = Math.floor(Math.random() * wrongReadings.length);
                options.push(wrongReadings.splice(randomIndex, 1)[0]);
            }
            break;

        case QUESTION_TYPES.MEANING_TO_WORD:
            console.log('生成意思选单词的题目');
            question = currentWord.meaning;
            correctAnswer = currentWord.word;
            const wrongWords = getWrongOptions(words, correctAnswer, QUESTION_TYPES.MEANING_TO_WORD)
                .map(word => word.word);
            while (options.length < 3 && wrongWords.length > 0) {
                const randomIndex = Math.floor(Math.random() * wrongWords.length);
                options.push(wrongWords.splice(randomIndex, 1)[0]);
            }
            break;
    }

    // 如果没有足够的错误选项，用占位符填充
    while (options.length < 3) {
        options.push(`选项${options.length + 1}`);
    }

    options.push(correctAnswer);
    shuffleArray(options);
    console.log('生成的选项:', options);
    console.log('正确答案:', correctAnswer);

    return {
        question,
        options,
        correctAnswer
    };
}

function checkAnswer(selectedOption, correctAnswer) {
    console.log('\n=== 检查答案 ===');
    console.log('用户选择:', selectedOption);
    console.log('正确答案:', correctAnswer);

    const buttons = document.querySelectorAll('.option, .dont-know-button');
    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent === correctAnswer) {
            button.style.backgroundColor = '#90EE90';
        }
        if (button.textContent === selectedOption && selectedOption !== correctAnswer) {
            button.style.backgroundColor = '#FFB6C1';
        }
    });

    const isCorrect = selectedOption === correctAnswer;
    console.log('答案是否正确:', isCorrect);

    if (isCorrect) {
        wordProgress[currentWord.word][currentQuestionType] = true;
        console.log('更新后的单词进度:', wordProgress[currentWord.word]);
        
        const allTypesCompleted = Object.values(wordProgress[currentWord.word]).every(v => v === true);
        console.log('是否完成所有题型:', allTypesCompleted);

        if (allTypesCompleted) {
            console.log('单词已完全掌握，进入下一个单词');
            currentWord.memoryQuality = 1.0;
            setTimeout(() => {
                switchQuestionType();
                currentWordIndex++;
                showNextWord();
            }, 1000);
        } else {
            console.log('切换到下一个题型');
            setTimeout(() => {
                switchQuestionType();
                showNextWord();
            }, 1000);
        }
    } else {
        console.log('答错了，重置进度并移到队列末尾');
        resetWordProgress(currentWord.word);
        moveWordToEnd();
        setTimeout(() => {
            currentWordIndex++;
            showNextWord();
        }, 1000);
    }
}

function switchQuestionType() {
    console.log('\n=== 切换题型 ===');
    console.log('当前题型:', currentQuestionType);

    const types = Object.values(QUESTION_TYPES);
    const currentIndex = types.indexOf(currentQuestionType);
    let nextIndex = (currentIndex + 1) % types.length;
    
    while (nextIndex !== currentIndex) {
        currentQuestionType = types[nextIndex];
        console.log('尝试切换到:', currentQuestionType);
        if (currentQuestionType === QUESTION_TYPES.WORD_TO_READING && !currentWord.reading) {
            console.log('当前单词没有读音，继续切换');
            nextIndex = (nextIndex + 1) % types.length;
        } else {
            break;
        }
    }
    console.log('最终切换到的题型:', currentQuestionType);
}

function updateProgressBar() {
    const percentage = (currentWordIndex / words.length) * 100;
    console.log('更新进度条:', percentage + '%');
    const progress = document.querySelector('.progress');
    progress.style.width = `${percentage}%`;
}

function showResult() {
    const practiceContainer = document.getElementById('practice');
    practiceContainer.innerHTML = `
        <div class="result">
            <h2>学习完成！</h2>
            <p>总单词数：${words.length}</p>
            <button onclick="location.reload()">重新开始</button>
        </div>
    `;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function handleDontKnow(correctAnswer) {
    console.log('\n=== 用户不认识该单词 ===');
    
    // 禁用所有按钮
    const buttons = document.querySelectorAll('.option, .dont-know-button');
    buttons.forEach(button => button.disabled = true);
    
    // 显示单词详细信息
    showWordDetails();
}

function showWordDetails() {
    const practiceContainer = document.getElementById('practice');
    
    // 重置容器内容并添加详情视图
    practiceContainer.innerHTML = `
        <div class="word-card">
            <div class="word-details">
                <div class="detail-item word">${currentWord.word}</div>
                <div class="detail-item reading">${currentWord.reading || '(无假名读音)'}</div>
                <div class="detail-item meaning">${currentWord.meaning}</div>
            </div>
        </div>
        <div class="options-container">
            <button class="next-button">下一个</button>
        </div>
    `;
    
    // 绑定下一个按钮事件
    const nextButton = practiceContainer.querySelector('.next-button');
    nextButton.onclick = () => {
        resetWordProgress(currentWord.word);
        moveWordToEnd();
        currentWordIndex++;
        showNextWord();
    };
}

// 新增：重置单词进度
function resetWordProgress(word) {
    wordProgress[word] = {
        [QUESTION_TYPES.WORD_TO_MEANING]: false,
        [QUESTION_TYPES.WORD_TO_READING]: words.find(w => w.word === word).reading ? false : true,
        [QUESTION_TYPES.MEANING_TO_WORD]: false
    };
    console.log(`重置单词 ${word} 的进度:`, wordProgress[word]);
}

// 新增：将当前单词移到队列末尾
function moveWordToEnd() {
    const currentWord = words[currentWordIndex];
    words.splice(currentWordIndex, 1);
    words.push(currentWord);
    console.log('将单词移到队列末尾:', currentWord);
}

// 新增：检查是否还有未掌握的单词
function hasUnmasteredWords() {
    return words.some(word => {
        const progress = wordProgress[word.word];
        return !Object.values(progress).every(v => v === true);
    });
}

// 修改样式
const style = document.createElement('style');
style.textContent = `
    #practice {
        display: flex;
        flex-direction: column;
        gap: 20px;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }

    .word-card {
        position: relative;
        background-color: white;
        padding: 30px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .word-japanese {
        font-size: 2em;
        text-align: center;
    }

    .options-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 10px;
    }

    .option {
        padding: 15px 20px;
        font-size: 1.1em;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .option:hover {
        background-color: #f5f5f5;
    }

    .dont-know-button {
        padding: 8px 20px;
        font-size: 0.9em;
        background-color: #ff9800;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        transition: background-color 0.3s;
        margin: 0 auto;
        display: block;
        min-width: 100px;
        width: fit-content;
    }

    .dont-know-button:hover {
        background-color: #f57c00;
    }

    .word-details {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .detail-item {
        text-align: center;
        padding: 10px;
        border-bottom: 1px solid #e0e0e0;
    }

    .detail-item:last-child {
        border-bottom: none;
    }

    .detail-item.word {
        font-size: 2em;
        font-weight: bold;
        color: #333;
    }

    .detail-item.reading {
        font-size: 1.5em;
        color: #666;
    }

    .detail-item.meaning {
        font-size: 1.3em;
        color: #2196F3;
    }

    .next-button {
        padding: 15px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1em;
        width: 100%;
        transition: background-color 0.3s;
    }

    .next-button:hover {
        background-color: #45a049;
    }

    /* 禁用状态的样式 */
    .option:disabled,
    .dont-know-button:disabled {
        cursor: not-allowed;
    }

    .question-hint {
        font-size: 0.9em;
        color: #666;
        text-align: center;
        margin-bottom: 15px;
        padding: 5px;
        background-color: #f5f5f5;
        border-radius: 4px;
    }

    .progress-container {
        width: 100%;
        height: 10px;
        background-color: #f0f0f0;
        border-radius: 5px;
        margin-bottom: 20px;
        overflow: hidden;
    }

    .progress {
        width: 0;
        height: 100%;
        background-color: #4CAF50;
        transition: width 0.3s ease;
    }
`;
document.head.appendChild(style);

// 添加密码输入界面的样式
const passwordStyle = document.createElement('style');
passwordStyle.textContent = `
    .password-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 20px;
    }

    .password-input {
        padding: 10px;
        font-size: 1em;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 200px;
    }

    .password-button {
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1em;
    }

    .password-button:hover {
        background-color: #45a049;
    }
`;
document.head.appendChild(passwordStyle); 