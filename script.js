if (location.search) {
  user = location.search.slice(1);
  Htitleurl.innerHTML = "webstock.dev?" + user;
  document.title = "webstock.dev?" + user;
  Htitleurl.href = "https://webstock.dev?" + user;
  getGistList(user);
  if (localStorage.getItem(user + "_token")) {
    Htoken.value = localStorage.getItem(user + "_token");
    document.body.classList.replace("nologin", "login");
  }
} else {
  document.location = "about.html";
}

async function view(content) {  
  localStorage.setItem(user + "_webstock", JSON.stringify(content));
  var stockList = '';
  content.forEach(function(value) {
    stockList += '<li class=site><div class=delete>×</div><img src="https://s.wordpress.com/mshots/v1/'+value+'"></li>';
  });
  Hstock.innerHTML = stockList;

  document.querySelectorAll(".delete").forEach((elm,i) => {
    elm.addEventListener("click", () => {
      let webstock = JSON.parse(localStorage.getItem(user + "_webstock"));
      webstock.splice(i, 1);
      view(webstock);
      setGist(webstock);
    });
  });
}

async function getGistList() {
  Htitleurl.classList.replace("done", "loading");
  if (localStorage.getItem(user+"_id")){
    getGist(localStorage.getItem(user+"_id"));
    console.log("id > view");
  } else {
    await (await fetch("https://api.github.com/users/" + user + "/gists", { cache: "reload" })).json()
      .then(data => {
        let state = 0;
        data.forEach(function (value) {
          if (value.files["webstock.json"]) {
            let url = new URL(value.files["webstock.json"].raw_url);
            let url_id = url.pathname.split('/')[2];
            localStorage.setItem(user + "_id", url_id);
            getGist(url_id);
            console.log("userName > id > view");
            state = 1;
          }
        });
        if (state == 0) {
          Htitleurl.classList.replace("loading", "warning");
          Hstock.innerHTML = "ERROR: not found webstock.json on your gist.";
        }
      })
      .catch(err => {
        Htitleurl.classList.replace("loading", "err");
      });
  }
}

async function getGist(id) {
  Htitleurl.classList.replace("done", "loading");
  await (await fetch("https://api.github.com/gists/" + id, { cache: "reload" })).json()
    .then(data => {
      const array = JSON.parse(data.files["webstock.json"].content);
      view(array);
      Htitleurl.classList.replace("loading", "done");
    })
    .catch(err => {
      Htitleurl.classList.replace("loading", "err");
    });
}

async function setGist(content) {
  Htitleurl.classList.replace("done", "loading");
  let token = localStorage.getItem(user + "_token");
  await fetch("https://api.github.com/gists/" + localStorage.getItem(user + "_id"), {
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "token " + token
    },
    body: JSON.stringify({
      description: "Updated at " + new Date().toLocaleString(),
      files: {
        "webstock.json": {
          content: JSON.stringify(content),
        },
      },
    }),
    cache: "reload"
  }).then(data => {
    console.log("DONE:setGist");
    Htitleurl.classList.replace("loading", "done");
  })
    .catch(err => {
      Htitleurl.classList.replace("loading", "err");
    });
}

function addGist(e) {
  let content = JSON.parse(localStorage.getItem(user + "_webstock"));
  content.unshift(e);
  view(content);
  setGist(content);
  setTimeout(function () {
    Hstock.innerHTML = "";
    view(JSON.parse(localStorage.getItem(user + "_webstock")));
    // }, 1000);
  }, 10000);
}