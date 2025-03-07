"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const ses = getCookie('ses');
    if (ses) {
        showWordManageForm(ses);
    } else {
        showLoginForm();
    }
});


function showLoginForm() {
    const container = document.getElementById('manage-setup');

    container.innerHTML = `
        <div class="login-form">
            <div class="form-group">
            <label class="manage-lab">username:</label>
            <input id="username-in" />
            </div>
            <div class="form-group">
            <label class="manage-lab">password:</label>
            <input id="password-in" type="password" />
            </div>
            <button id="login-but">login</button>
        </div>
    `;

    const loginButton = document.getElementById('login-but');
    loginButton.addEventListener('click', async () => {
        const ses = await login();
        if (ses) {
            showWordManageForm(ses);
        } else {
            showLoginForm();
        }
    });
}

async function login() {
    const usernameInput = document.getElementById('username-in');
    const passwordInput = document.getElementById('password-in');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        alert('用户名和密码不能为空.');
        return;
    }

    const loginUrl = 'https://jl.charlesyin20218621.workers.dev/user/login';

    try {
        const response = await fetch(
            loginUrl, {
                method: 'post',
                body: JSON.stringify({}),
                headers: {
                    Authorization: 'Basic ' + btoa(`${username}:${password}`)
                }
            }
        );
        
        const result = await response.json();

        if (result.error) {
            console.error('账号登陆失败:', result.error);
            alert('账号密码有误，请重试');
            return;
        }

        console.log('response:', result);
        const ses = result.ses;

        console.log('ses:', ses);
        setCookie('ses', ses);

        console.log('cookie:', getCookie('ses'));

        return ses;
    } catch (error) {
        console.error('登陆失败:', error);
        alert('登陆失败，请检查用户名和密码.');
        return;
    }
}


async function showWordManageForm() {
    const container = document.getElementById('manage-setup');

    container.innerHTML = `
        <div class="word-manage-form">
            <div class="form-group">
            <label class="manage-lab">单词资源:</label>
            <select id="res-select"></select>
            </div>
            <div class="form-group">
            <label class="manage-lab">单词:</label>
            <input id="word-input" />
            </div>
            <button id="search-but">查询</button>
        </div>
    `;

    const sourceDatas = await getSourceList();

    console.log(sourceDatas);
    // if (sourceDatas.id === 403) {
    //     console.error('获取资源列表失败,重新登陆');
    //     alert('获取资源列表失败,重新登陆');
    //     showLoginForm();
    // }

    let sourceContent = '<option value="">请选择单词资源</option>';
    for (let item of sourceDatas) {
        sourceContent = sourceContent + `\n<option value="${item.id}">${item.name}</option>`;
    }

    const sourceSelector = document.getElementById('res-select');
    sourceSelector.innerHTML = sourceContent;

    const searchButton = document.getElementById('search-but');

    const wordInputor = document.getElementById('word-input');

    searchButton.addEventListener('click', async function() {
        const data =  await wordSearch();
        const wordInput = wordInputor.value;
        await showWordDetail(data, wordInput);
    });
}


async function showWordDetail(datas, word) {
    const container = document.getElementById('manage-setup');

    const sourceList = await getSourceList();

    container.innerHTML = '';

    if (datas.length > 0) {
        for (let data of datas) {
            container.innerHTML +=`
                <div class="word-detail-form">
                    <input id="word-id-${data.id}" value=${data.id} style="display: none" />
                    <div class="form-group">
                        <label class="word-detail-lab">单词:</label>
                        <input id="word-in-${data.id}" value="${data.word || ''}" />
                    </div> 
                    <div class="form-group">
                        <label class="word-detail-lab">读音:</label>
                        <input id="reading-in-${data.id}" value="${data.pronunciation || '' }" />
                    </div>
                    <div class="form-group">
                        <label class="word-detail-lab">中文意思:</label>
                        <input id="zh-meaning-in-${data.id}" value="${data.zh_meaning || ''}" />
                    </div>
                    <div class="form-group">
                        <label class="word-detail-lab">英文意思:</label>
                        <input id="en-meaning-in-${data.id}" value="${data.en_meaning || ''}" />
                    </div>
                    <div class="form-group">
                        <label class="word-detail-lab">单词来源:</label>
                        <select id="source-in-${data.id}">
                            <option value="">请选择单词来源</option>
                            ${sourceList.map(source => `
                                <option value="${source.id}" ${source.id === data.resource ? 'selected' : ''}>
                                    ${source.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="word-detail-lab">课时:</label>
                        <input id="lesson-in-${data.id}" value=${data.lesson || ''} />
                    </div>
                    <div class="form-group">
                        <label class="word-detail-lab">等级:</label>
                        <input id="level-in-${data.id}" value=${data.level || ''} />
                    </div>
                    <div id="is-main-container">
                        <label class="word-detail-lab">是否是附加课程</label>
                        <input type="checkbox" id="is-main-${data.id}" ${data.is_main === 0 ? 'checked' : ''} />
                    </div>
                </div>
            `;
        }
    } else {
        container.innerHTML +=`
            <div class="word-detail-form">
                <input id="word-id-0" value=0 style="display: none" />
                <div class="form-group">
                    <label class="word-detail-lab">单词:</label>
                    <input id="word-in-0" value="${word}" />
                </div> 
                <div class="form-group">
                    <label class="word-detail-lab">读音:</label>
                    <input id="reading-in-0" value="" />
                </div>
                <div class="form-group">
                    <label class="word-detail-lab">中文意思:</label>
                    <input id="zh-meaning-in-0" value="" />
                </div>
                <div class="form-group">
                    <label class="word-detail-lab">英文意思:</label>
                    <input id="en-meaning-in-0" value="" />
                </div>
                <div class="form-group">
                    <label class="word-detail-lab">单词来源:</label>
                    <select id="source-in-0">
                        <option value="">请选择单词来源</option>
                        ${sourceList.map(source => `
                            <option value="${source.id}"}>
                                ${source.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="word-detail-lab">课时:</label>
                    <input id="lesson-in-0" value="" />
                </div>
                <div class="form-group">
                    <label class="word-detail-lab">等级:</label>
                    <input id="level-in-0" value="" />
                </div>
                <div id="is-main-container">
                    <label class="word-detail-lab">是否是附加课程</label>
                    <input type="checkbox" id="is-main-0" value="" />
                </div>
            </div>
        `;
    }

    container.innerHTML += `
        <div class="button-container">
        <button id="save-word">保存</button>
        <button id="return-search-page" onClick="showWordManageForm()">返回搜索页</button>
        </div>
    `;

    const saveButton = document.getElementById("save-word");
    
    saveButton.addEventListener("click", async () =>{
            if (datas.length === 0) {
                const newWord = new Object({id: 0});
                
                const wordIn = document.getElementById('word-in-0');
                const readinIn = document.getElementById('reading-in-0');
                const zhMeaningIn = document.getElementById('zh-meaning-in-0');
                const enMeaningIn = document.getElementById('en-meaning-in-0');
                const sourceIn = document.getElementById('source-in-0');
                const lessonIn = document.getElementById('lesson-in-0');
                const levelIn = document.getElementById('level-in-0');
                const isMainIn = document.getElementById('is-main-0');

                Object.assign(newWord, {
                    word: wordIn.value,
                    pronunciation: readinIn.value? readinIn.value : null,
                    zh_meaning: zhMeaningIn.value,
                    en_meaning: enMeaningIn.value? enMeaningIn.value : null,
                    resource: Number(sourceIn.value),
                    lesson: Number(lessonIn.value),
                    level: Number(levelIn.value),
                    is_main: isMainIn.checked? 0 : 1
                });

                console.log(newWord);
                const result = await wordInsert(newWord);
                console.log(`${newWord.word} insert result:`, result);
                alter(`${newWord.word} insert result:`, result);
            } else {
                for (let item of datas) {
                    const correctedWord = new Object({id: item.id});
                    const wordIn = document.getElementById(`word-in-${item.id}`);
                    const readinIn = document.getElementById(`reading-in-${item.id}`);
                    const zhMeaningIn = document.getElementById(`zh-meaning-in-${item.id}`);
                    const enMeaningIn = document.getElementById(`en-meaning-in-${item.id}`);
                    const sourceIn = document.getElementById(`source-in-${item.id}`);
                    const lessonIn = document.getElementById(`lesson-in-${item.id}`);
                    const levelIn = document.getElementById(`level-in-${item.id}`);
                    const isMainIn = document.getElementById(`is-main-${item.id}`);

                    Object.assign(correctedWord, {
                        word: wordIn.value,
                        pronunciation: readinIn.value? readinIn.value : null,
                        zh_meaning: zhMeaningIn.value,
                        en_meaning: enMeaningIn.value? enMeaningIn.value : null,
                        resource: Number(sourceIn.value),
                        lesson: Number(lessonIn.value),
                        level: Number(levelIn.value),
                        is_main: isMainIn.checked? 0 : 1
                    });

                    if (!objectShallowEqual(item, correctedWord)) {
                        const result = await wordUpdate(correctedWord);

                        console.log(`${item.word} update status:`, result);
                        alert(`${item.word} update status: ${result}`);
                    } else {
                        console.log(`${item.word} no need to update`);
                        alert(`${item.word} no need to update`);
                    }
                }
            }
        }
    );

    // returnButton.addEventListener("click", () => {
    //     showWordManageForm();
    // });
}

function objectShallowEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every((key) => obj1[key] === obj2[key]);
}


async function wordSearch() {
    const ses = getCookie('ses');
    const searchUrl = `https://jl.charlesyin20218621.workers.dev/words/search?ses=${ses}`;

    try {
        const wordInputor = document.getElementById('word-input');
        const wordInput = wordInputor.value;
        const resSelector = document.getElementById('res-select');
        const resInput = Number(resSelector.value);
        const response = await fetch(
            searchUrl, {
                method: 'post',
                body: JSON.stringify({
                    sourceId: resInput,
                    word: wordInput
                })
            }
        );

        const searchResult = await response.json();

        if (searchResult.error) {
            console.log('查找单词接口调用失败:', searchResult.error);
            alert(searchResult.error);
            return;
        }

        return searchResult.datas;
    } catch (error) {
        console.error('查找单词失败:', error);
        alert('查找单词失败，请重试.');
        return;
    }
}


async function wordUpdate(word) {
    const ses = getCookie('ses');
    const updateUrl = `https://jl.charlesyin20218621.workers.dev/words/correct?ses=${ses}`;

    try {
        const response = await fetch(
            updateUrl, {
                method: 'post',
                body: JSON.stringify({
                    'word': word
                })
            }
        );

        const updateResult = await response.json();

        if (updateResult.error) {
            console.error('更新单词失败:', updateResult.error);
            alert(updateResult.error);
        }

        return updateResult.status;
    } catch (error) {
        console.error('更新单词失败:', error);
        alert('更新单词失败，请重试');
        return;
    }
}


async function wordInsert(word) {
    const ses = getCookie('ses');
    const insertUrl = `https://jl.charlesyin20218621.workers.dev/words/create?ses=${ses}`;

    try {
        const response = await fetch(
            insertUrl, {
                method: 'post',
                body: JSON.stringify({
                    word: word
                })
            }
        );

        const insertResult = await response.json();

        if (insertResult.error) {
            console.log('创建单词失败:', insertResult.error);
            alert(insertResult.error);
            return;
        }

        return insertResult.msg;
    } catch (error) {
        console.error('新增单词失败:', error);
        alert('新增单词失败，请重试');
        return;
    }
}


async function getSourceList() {
    const ses = getCookie('ses');
    if (! ses) {
        console.error('cookie ses is expired');
        alert('login is expired, please re-login');
        return showLoginForm();
    }

    try {
        const sourceGetUrl = `https://jl.charlesyin20218621.workers.dev/words/resource?ses=${ses}`;
        const response = await fetch(
            sourceGetUrl, {
                method: 'post'
            }
        );

        const sourceData = await response.json();
        if (sourceData.error) {
            alert(sourceData.error);
            
            if (sourceData.id === 403) {
                showLoginForm();
            }
            return;
        }

        return sourceData.datas;
    } catch (error) {
        console.error('获取资源列表失败:', error);
        alert('获取资源列表失败，请刷新页面');
        return;
    }
}


function setCookie(name, value, daysToExpire = 0.5, path = '/') {
    const date = new Date();
    date.setTime(date.getTime + (daysToExpire * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=${path}; SameSite=Lax`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i< cookies.length; i++) {
        const cookiePair = cookies[i].split('=');
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }

    return null;
}

function deleteCookie(name, path = '/') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}
