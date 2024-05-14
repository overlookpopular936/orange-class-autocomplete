// ==UserScript==
// @name         橙点刷课
// @namespace    http://tampermonkey.net/
// @version      2024-05-13
// @description  try to take over the world!
// @author       You
// @match_abolish       *://*.zjy2.icve.com.cn/*
// @match       *://*.orange-class.com/*
// @icon         https://img.alicdn.com/imgextra/i3/O1CN01wVtLz024grylcUPyB_!!6000000007421-55-tps-32-32.svg
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Your code here...
  const maxRetries = 10;
  let retries = 0;
  function main() {
    checkCurriculumStatus();
    setTimeout(() => {
      document.querySelectorAll('.chapter_TCFS_')[0].click();
      document.querySelectorAll('.section_Xl1et')[0].click();
      autoPlayCurriculum();
    }, 5000);
    /*// 注入监听器
    window.reactRouterListener = () => {
      // 路由变化时执行
      console.log("change route")
      autoPlayCurriculum();
    }

    // 注入脚本
    const script = document.createElement('script');
    script.innerHTML = `
      const Router = ReactRouterDOM.Router;
      Router.prototype.listener = window.reactRouterListener;
    `
    document.body.appendChild(script);*/
  }

  function isLogin() {
    const allCookies = document.cookie;
    const cookieList = allCookies.split(";");

    let cookieLength = 1;
    for (let i = 0; i < cookieList.length; i++) {
      cookieLength++;
    }

    return cookieLength >= 9;
  }
  
  function autoRedirect() {
    if (isLogin()) {
      if(location.href === "https://www.orange-class.com/") {
        window.confirm("已经登录，是否跳转课程？") ? location.href = "https://www.orange-class.com/my/history" : location.reload();
        console.log("Redirect");
      }
    } else {
      alert("请先登录");
      console.log("未登录");
    }
  }
  
  function checkCurriculumStatus() {
    autoRedirect();
    setTimeout(() => {
      const curriculumList = document.querySelectorAll(".item_ACTXH");
      for (let i = 0; i < curriculumList.length; i++) {
        const allStatus = curriculumList[i].children[0].lastChild.lastChild.firstChild.textContent;
        const nowStatus = parseInt(allStatus.split('/')[0].replace(/\D/g, " "));
        const expectedStatus = parseInt(allStatus.split('/')[1].replace(/\D/g, " "));
        if (nowStatus !== expectedStatus) {
          console.log(`《${curriculumList[i].firstChild.lastChild.firstChild.firstChild.textContent}》未完成`);
          curriculumList[i].lastChild.firstChild.click();
        } else {
          console.log(`《${curriculumList[i].firstChild.lastChild.firstChild.firstChild.textContent}》已完成`);
          continue;
        }
      }
    }, 5000);
  }

  async function getStudiedCurriculum() {
    const courseId = location.href.split('/')[4];
    const curriculumId = location.href.split('/')[6];
    try {
      const res = await fetch(`https://www.orange-class.com/api/section/${curriculumId}/progress?courseId=${courseId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'Cache-Control': 'no-cache',
          'Cookie': document.cookie,
          'Pragma': 'no-cache',
          'Priority': 'u=1, i',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'X-Xsrf-Token': '' //对应的token值
        }
      });
      const result = await res.json();
      let learnStatus = false;
      if (result?.content?.learnStatus === "COMPLETED") {
        learnStatus = true;
      }
      console.log(result?.content?.learnStatus);
      return learnStatus;
    } catch (err) {
      console.log(err);
    }
  }
  
  async function autoPlayCurriculum() {
    let isCompleted = await getStudiedCurriculum();
    console.log(isCompleted);
    if (isCompleted) {
      document.querySelectorAll('.box_oYj_R')[2].click();
      setTimeout(() => {
        autoPlayCurriculum();
      }, 5000);
    }

    const video = document.querySelector('video');

    if (video) {
      video.muted = true;

      try {
        await video.play();
        console.log('视频播放');
      } catch (error) {
        console.log('自动播放失败:', error);
        retries++;

        if (retries < maxRetries) {
          console.log('尝试重新播放...');
          await autoPlayCurriculum();
        } else {
          console.log('达到最大重试次数,无法自动播放。');
        }
      }

    } else {
      retries++;

      if (retries < maxRetries) {
        console.log('尝试重新查找视频元素...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        await autoPlayCurriculum();
      } else {
        console.log('达到最大重试次数,无法自动播放。');
      }
    }
    video.addEventListener("ended", (evt) => {
      console.log("视频播放已结束");
      document.querySelectorAll('.box_oYj_R')[2].click();
      setTimeout(() => {
        autoPlayCurriculum();
      }, 5000);
    });
  }

  main();

})();
