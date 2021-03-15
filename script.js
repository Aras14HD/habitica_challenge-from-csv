//TODO: completion message
document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("userID") != null) {
    document.getElementById("UserID").value = localStorage.getItem("userID");
    document.getElementById("APItoken").value = localStorage.getItem(
      "APIToken"
    );
  }
  document.getElementById("challengeFile").addEventListener(
    "change",
    function () {
      ChallengeFromCSV.fileParse(this).then((response) => {
        displayData(response);
      });
    },
    false
  );
  document.getElementById("Submit").addEventListener("click", function () {
    var userID = document.getElementById("UserID").value;
    var APIToken = document.getElementById("APItoken").value;
    localStorage.setItem("userID", userID);
    localStorage.setItem("APIToken", APIToken);
    ChallengeFromCSV.sendData(
      JSON.parse(sessionStorage.getItem("data")),
      userID,
      APIToken
    ).then((response) => {
      var id = response;
      getRequest(
        "https://habitica.com/api/v3/challenges/" + response,
        userID,
        APIToken
      ).then((response) => {
        var name = JSON.parse(response).data.name;
        document.getElementById("status").innerHTML =
          '<a href="https://habitica.com/challenges/' +
          id +
          '">Challenge(' +
          name +
          ")</a>";
      });
    });
  });
});
function displayData(response) {
  var userID = document.getElementById("UserID").value;
  var APIToken = document.getElementById("APItoken").value;
  sessionStorage.setItem("data", JSON.stringify(response));
  var Cdata = response.Cdata;
  var tArray = response.tArray;
  getRequest(
    "https://habitica.com/api/v3/groups/" + Cdata.group,
    userID,
    APIToken
  ).then(
    function (response) {
      var html = "<div id='Cdata'>\n<h1>Challenge:</h1>\n";
      html += "<h2>" + Cdata.name + "</h2>";
      html +=
        "group: " +
        Cdata.group +
        "(" +
        JSON.parse(response).data.name +
        ")<br/>";
      for (const [key, value] of Object.entries(Cdata)) {
        if (key !== "name" && key !== "group")
          html += key + ": " + value + "<br/>";
      }
      html += "</div>\n<div id='tArray'>\n<h2>Tasks:</h2>";
      for (var i = 0; i < tArray.length; i++) {
        html += "<h3>" + tArray[i].text + ":</h3>";
        for (const [key, value] of Object.entries(tArray[i])) {
          if (key !== "text") html += key + ": " + value + "<br/>";
        }
      }
      document.getElementById("Data").innerHTML = html;
    },
    (response) => {
      data = JSON.parse(response);
      var html = "<h1>Error:" + data.error + "</h1>" + data.message;
      document.getElementById("Data").innerHTML = html;
    }
  );
}

/**
 * Make a GET request to the Habitica API.
 * Data object returned varies based on the API url called.
 * For accessing personal data endpoints, use {@link HabiticaAPIManager#authGetRequest|authGetRequest}
 * @param {string} baseURL - the url of the api call.
 * @param {object} [queryParams={}] - key-value pairs for any parameters needed by the api call.
 * @returns {Promise<String>} Promise containing the raw API response data as a string.
 */
function getRequest(url, userID, APIToken) {
  let promise = new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open("GET", url);

    req.onerror = function () {
      reject(this.statusText);
    };

    req.onload = function () {
      if (this.status == 200) {
        resolve(this.responseText);
      } else {
        reject(this.responseText);
      }
    };
    req.setRequestHeader("x-api-user", userID);
    req.setRequestHeader("x-api-key", APIToken);
    req.setRequestHeader(
      "x-client",
      "456b5feb-bd5c-4046-b5b3-83606a1f6a76-cfc"
    );
    req.send();
  });

  return promise;
}
