document.addEventListener("DOMContentLoaded", function() {

  if (localStorage.getItem('userID') != null) {
    document.getElementById("UserID").value = localStorage.getItem('userID');
    document.getElementById("APItoken").value = localStorage.getItem('APIToken');
  }
  document.getElementById("challengeFile").addEventListener('change', function() {
    ChallengeFromCSV.fileParse(this).then(function(response) {
      sessionStorage.setItem('data', JSON.stringify(response));
      Cdata = response.Cdata;
      tArray = response.tArray;
      html = "<div id='Cdata'>\n<h2>Cdata:</h2>\n";
      for (const [key, value] of Object.entries(Cdata)) {
        html += key + ": " + value + "<br/>";
      }
      html += "</div>\n<div id='tArray'>\n<h2>tArray:</h2>"
      for (i =  0; i < tArray.length; i++) {
        html += "<h3>Task" + i + ":</h3>"
        for (const [key, value] of Object.entries(tArray[i])) {
          html += key + ": " + value + "<br/>";
        }
      }
      document.getElementById("Data").innerHTML = html;
    })
  }, false)
  document.getElementById("Submit").addEventListener("click", function() {
    userID = document.getElementById("UserID").value;
    APIToken = document.getElementById("APItoken").value;
    localStorage.setItem('userID', userID);
    localStorage.setItem('APIToken', APIToken);
    ChallengeFromCSV.sendData(JSON.parse(sessionStorage.getItem('data')), userID, APIToken)
  })
})
