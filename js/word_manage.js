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


async function showWordManageForm(ses) {
    const container = document.getElementById('manage-setup');

    container.innerHTML = `
        <div class="word-manage-form">
            <label class="manage-lab">单词资源:</label>
            <select id="res-select"></select>
            <label class="manage-lab">单词</label>
            <input id="word-input" />
            <button id="search-but">查询</button>
        </div>
    `;

    const sourceDatas = await getSourceList();

    let sourceContent = '<option value="">请选择单词资源</option>';
    for (let item of sourceDatas) {
        sourceContent = sourceContent + `\n<option value="${item.id}">${item.name}</option>`;
    }

    const sourceSelector = document.getElementById('res-select');
    sourceSelector.innerHTML = sourceContent;

    const searchButton = document.getElementById('search-but');

    searchButton.addEventListener('click', async function() {
        const data =  await wordSearch();
        await showWordDetail(data);
    });
}


async function showWordDetail(datas) {
    const container = document.getElementById('manage-setup');

    const sourceList = await getSourceList();
    // const lessonList = getLessonList();
    // const levelList = getLevelList();

    container.innerHTML = '';

    for (let data of datas) {
        container.innerHTML +=`
            <div class="word-detail-form">
                <div class="form-group">
                    <label class="word-detail-lab">单词:</label>
                    <input id="word-in-${data.id}" value="${data.word}" />
                </div> 
                <div class="form-group">
                    <label class="word-detail-lab">读音:</label>
                    <input id="reading-in-${data.id}" value="${data.pronunciation}" />
                </div>
                <div class="form-group">
                    <label class="word-detail-lab">中文意思:</label>
                    <input id="zh-meaning-in-${data.id}" value="${data.zh_meaning}" />
                </div>
                <div class="form-group">
                    <label class="word-detail-lab">英文意思:</label>
                    <input id="en-meaning-in-${data.id}" value="${data.en_meaning}" />
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
                    <select id="lesson-in-${data.id}"></select>
                </div>
                <div class="form-group">
                    <label class="word-detail-lab">等级:</label>
                    <select id="level-in-${data.id}"></select>
                </div>
                <div id="is-main-container">
                    <label class="word-detail-lab">是否是附加课程</label>
                    <input type="checkbox" id="is-main-${data.id}" />
                </div>
            </div>
        `;
    }

    container.innerHTML += `
        <div class="form-group">
        <button id="save-word">保存</button>
        <button id="return-search-page">返回搜索页</button>
        </div>
    `;

    let lessonContent = '<option value="">请选择课时</option>';
    let levelContent = '<option value="">请选择级别</option>';


    // for (let item of lessonList.datas) {
    //     lessonContent = lessonContent + `\n<option value="${item.lesson}">第${item.lesson}</option>`;
    // }

    const levelMap = {
        1: '初级',
        2: '初中级',
        3: '中级'
    }

    // for (let item of levelList.datas) {
    //     levelContent = LevelContent + `\n<option value="${item.level}">${levelMap[item.level]}</option>`;
    // }
   
    
    // const saveButton = document.getElementById("save-word");
    // const returnButton = document.getElementById("return-search-page");
    
    // saveButton.addEventListener("click", () =>{
    //         if (data.id) {
    //             wordUpdate();
    //         } else {
    //             wordInsert();
    //         }
    //     }
    // );

    // returnButton.addEventListener("click", () => {
    //     showWordManageForm();
    // });
}


async function wordSearch() {
    const ses = getCookie('ses');
    console.log('ses:', ses);
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


async function wordUpdate() {
    const updateUrl = '';

    try {
        return new Promise((resolve, reject) => {
            const response = fetch(
                updateUrl, {
                    method: 'post'
                }
            );
    
            const updateResult = response.json();
    
            if (updateResult.error) {
                alert(updateResult.error);
                reject(updateResult.error);
            }

            resolve(updateResult.data);
        });
    } catch (error) {
        console.error('更新单词失败:', error);
        alert('更新单词失败，请重试');
    }
}


async function wordInsert() {
    const insertUrl = '';

    try {
        return new Promise((resolve, reject) => {
            const response = fetch(
                insertUrl, {
                    method: 'post'
                }
            );

            const insertResult = response.json();

            if (insertResult.error) {
                alert(insertResult.error);
                reject(insertResult.error);
            }

            resolve(insertResult.data);
        });
    } catch (error) {
        console.error('新增单词失败:', error);
        alert('新增单词失败，请重试');
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
            alert(data.error);
            
            if (data.error === 'ses is incorrect') {
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
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=${path}`;
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
