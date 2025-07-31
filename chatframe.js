    const iframe = document.getElementById('fullscreen-frame');
    const openBtn = document.getElementById('openChatBtn');
    const clzBtn = document.getElementById('clzBtn');

    openBtn.addEventListener('click', () => {
      iframe.src = "https://animewaifuqc-v2.netlify.app/";
      iframe.style.display = "block";
      clzBtn.style.display = "block";
    });

    clzBtn.addEventListener('click', () => {
      iframe.style.display = "none";
      iframe.src = "";
      clzBtn.style.display = "none";
    });