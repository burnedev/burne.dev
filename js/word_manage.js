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
            <label class="manage-lab">username:</label>
            <input id="username-in" />
            <label class="manage-lab">password:</label>
            <input id="password-in" type="password" />
            <button id="login-but">login</button>
        </div>
    `;

    const loginButton = document.getElementById('login-but');
    loginButton.addEventListener('click', () => {
        login().then(ses => {
            showWordManageForm(ses);
            console.log('ses:', ses);
            setCookie('ses', ses);
        }).catch(error => {
            console.error('got error:', error)
        });
    });
}

async function login() {
    const usernameInput = document.getElementById('username-in');
    const passwordInput = document.getElementById('password-in');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // for test
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('naiei323i');
        }, 1000);
    });

    if (!username || !password) {
        alert('用户名和密码不能为空.');
        return;
    }

    const loginUrl = '';

    try {
        const response = await fetch(
            loginUrl, {
                method: 'post'
            }
        );

        const resContent = await response.json();

        if (resContent.error) {
            alert(resContent.error);
            return;
        }

        setCookie('ses', resContent.ses);
        return resContent.ses;
    } catch (error) {
        console.error('登陆失败:', error);
        alert('登陆失败，请检查用户名和密码.');
    }
}


async function showWordManageForm() {
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

    const ses = getCookie('ses');

    try {
        const sourceGetUrl = '';
        const response = await fetch(
            sourceGetUrl, {
                method: 'post',
                body: JSON.stringify({
                    ses: ses
                })
            }
        );

        const sourceData = await response.json();

        if (sourceData.error) {
            alert(data.error);

            if (data.error === 'ses is incorrect!') {
                showLoginForm();
            }
            return;
        }

        let sourceContent = '<option value="">请选择单词资源</option>';
        for (let item of sourceData.datas) {
            sourceContent = sourceContent + `\n<option value="${item.id}">${item.name}</option>`;
        }

        const sourceSelector = document.getElementById('res-select');
        sourceSelector.innerHTML = sourceContent;
    } catch (error) {
        console.error('获取单词资源列表失败:', error);
        alert('获取数据失败，请检查网络');
    }

    const searchButton = document.getElementById('search-but');
    const addButton = document.getElementById('add-but');

    searchButton.addEventListener('click', function() {
        data = wordSearch();
        showWordDetail(data);
    });
}


function showWordDetail(data) {
    const container = document.getElementById('setup');

    const sourceList = getSourceList();
    const lessonList = getLessonList();

    container.innerHTML = `
        <h3>${data.word}</h3>
        <div class="word-detail-form">
            <label class="word-detail-lab">单词</label>
            <input id="word-in" value=`${data.word}` />
            <label class="word-detail-lab">读音</label>
            <input id="reading-in" value=`${data.pronunciation}`/>
            <label class="word-detail-lab">单词来源</label>
            <select id="source-in"></select>
            <label class="word-detail-lab">第几课</label>
            <input id="lesson-in" value=`${data.lesson}` />
            <label class="word-detail-lab">中文意思</label>
            <input id="zh-meaning-in" value=`${data.zh_meaning}` />
            <label class="word-detail-lab">英文意思</label>
            <input id="en-meaning-in" value=`${data.en_meaning}` />
            <label class="word-detail-lab">等级</label>
            <input id="level-in" value=`${data.level}` />
            <div id="is-main-container">
                <label class="word-detail-lab">是否是附加课程</label>
                <input type="checkbox" id="is-main" />
            </div>
            <button id="save-word">保存</button>
            <button id="return-search-page">返回搜索页</button>
        </div>
    `;
    
    const saveButton = document.getElementById("save-word");
    const returnButton = document.getElementById("return-search-page");
    
    saveButton.addEventListener("click", () =>{
        if (data.id) {
            wordUpdate();
        } else {
            wordInsert();
    }
}


async function wordSearch() {
    const searchUrl = '';

    try {
        return new Promise((resolve, reject) => {
            const response = fetch(
                searchUrl, {
                    method: 'post'
                }
            );

            const searchResult = response.json();

            if (searchResult.error) {
                alert(searchResult.error);
                reject(searchResult.error);
            }

            resolve(searchResult.data);
        });
    } catch (error) {
        console.error('查找单词失败:', error);
        alert('查找单词失败，请重试.');
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
