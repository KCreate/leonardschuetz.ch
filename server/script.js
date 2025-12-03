const BLOG_DEV_MODE = false;
const BLOG_DEV_RELOAD_TIME = 3000;

if (BLOG_DEV_MODE) {
  setTimeout(() => {
    location.reload();
  }, BLOG_DEV_RELOAD_TIME);
}

// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-89960492-1', 'auto');
ga('send', 'pageview');

const messageLines = []
messageLines.push("  _    _              _   _                   _                                                                   ");
messageLines.push(" | |  | |            | | | |                 | |                                                                  ");
messageLines.push(" | |__| | ___ _   _  | |_| |__   ___ _ __ ___| |                                                                  ");
messageLines.push(" |  __  |/ _ \\ | | | | __| '_ \\ / _ \\ '__/ _ \\ |                                                                  ");
messageLines.push(" | |  | |  __/ |_| | | |_| | | |  __/ | |  __/_|                                                                  ");
messageLines.push(" |_|  |_|\\___|\\__, |  \\__|_| |_|\\___|_|  \\___(_)                                                                  ");
messageLines.push("               __/ |                                                                                              ");
messageLines.push("  _______ _   |___/     _     _               _                                                                 _ ");
messageLines.push(" |__   __| |   (_)     | |   | |             (_)                                                               | |");
messageLines.push("    | |  | |__  _ ___  | |__ | | ___   __ _   _ ___    ___  _ __   ___ _ __ ______ ___  ___  _   _ _ __ ___ ___| |");
messageLines.push("    | |  | '_ \\| / __| | '_ \\| |/ _ \\ / _` | | / __|  / _ \\| '_ \\ / _ \\ '_ \\______/ __|/ _ \\| | | | '__/ __/ _ \\ |");
messageLines.push("    | |  | | | | \\__ \\ | |_) | | (_) | (_| | | \\__ \\ | (_) | |_) |  __/ | | |     \\__ \\ (_) | |_| | | | (_|  __/_|");
messageLines.push("    |_|  |_| |_|_|___/ |_.__/|_|\\___/ \\__, | |_|___/  \\___/| .__/ \\___|_| |_|     |___/\\___/ \\__,_|_|  \\___\\___(_)");
messageLines.push("                                       __/ |               | |                                                    ");
messageLines.push("                                      |___/                |_|                                                    ");
console.log(messageLines.join("\n"))

console.log("Check it out on GitHub: ", "https://github.com/KCreate/leonardschuetz.ch")
