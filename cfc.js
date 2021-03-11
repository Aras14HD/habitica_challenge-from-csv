const ChallengeFromCSV = {
  start: (e, userID, APIToken) => {
    ChallengeFromCSV.fileParse(e).then((result) =>
      ChallengeFromCSV.sendData(result, userID, APIToken)
    );
  },
  /**
   *Sends the data via AJAX to habitica
   * @param {Object} data - An object containing a challenge and an array containig the tasks.
   * @param {string} userID - userID
   * @param {string} APIToken - APIToken
   */
  sendData: (data, userID, APIToken) => {
    ChallengeFromCSV.postRequest(
      "https://habitica.com/api/v3/challenges",
      userID,
      APIToken,
      data.Cdata
    ).then(function (response) {
      var id = JSON.parse(response).data.id;
      ChallengeFromCSV.postRequest(
        "https://habitica.com/api/v3/tasks/challenge/" + id,
        userID,
        APIToken,
        data.tArray
      );
    });
  },
  /**
   *Sends POST request to specified url with authentication and parameters
   * @param {string} url - url to send POST request to
   * @param {string} userID - userID
   * @param {string} APIToken - APIToken
   * @param {Object} queryParams - Request Payload
   * @returns {Promise} Promise for the POST request
   */
  postRequest: (url, userID, APIToken, queryParams = {}) => {
    let promise = new Promise((resolve, reject) => {
      let req = new XMLHttpRequest();
      req.open("POST", url);

      req.onerror = function () {
        reject(this.responseText);
      };

      req.onload = function () {
        if (req.status === (200 || 201)) {
          resolve(this.responseText);
        } else {
          reject(this.responseText);
        }
      };
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      req.setRequestHeader(
        "x-client",
        "d2195ddc-a540-4dad-b3d5-34fb1ba8d319-cfc"
      );
      req.setRequestHeader("x-api-user", userID);
      req.setRequestHeader("x-api-key", APIToken);
      req.send(JSON.stringify(queryParams));
    });
    return promise;
  },
  /**
   *Converts CSV/TXT File to usable data.
   * @param {Object} e - The Input Element of the CSV/TXT
   * @returns {Object} An object containing a challenge and an array containig the tasks.
   */
  fileParse: (e) => {
    return new Promise(function (resolve, reject) {
      var FileList = e.files;
      if (FileList.length > 1) reject("Multiple files selected!");
      var File = FileList[0];
      var reader = new FileReader();
      reader.readAsText(File);
      reader.onload = function (e) {
        Text = e.target.result;
        var tempArray = Text.split("\r\n");
        //Data for the challenge
        var Cdata = {
          group: tempArray[4],
          name: tempArray[0],
          shortName: tempArray[1],
          summary: tempArray[2],
          description: tempArray[3],
          prize: tempArray[5],
        };
        //tasks
        var tArray = [];
        for (var i = 6; i < tempArray.length; i++) {
          var taskArray = tempArray[i].split(";");
          console.log(taskArray[0]);
          var tObject = {
            type: taskArray[0],
            text: taskArray[1],
            notes: taskArray[2],
          };
          //task difficulty
          var priority = 1;
          switch (taskArray[3]) {
            case "Trivial":
              priority = 0.1;
              break;
            case "Easy":
              priority = 1;
              break;
            case "Medium":
              priority = 1.5;
              break;
            case "Hard":
              var priority = 2;
          }
          //task type
          switch (taskArray[0]) {
            case "habit":
              tObject = Object.assign(
                {
                  priority: priority,
                  startDate: taskArray[4],
                },
                tObject
              );
              break;
            case "daily":
              tObject = Object.assign(
                {
                  priority: priority,
                  frequency: taskArray[5],
                  startDate: taskArray[4],
                },
                tObject
              );
              switch (taskArray[5]) {
                //task daily type
                case "daily":
                  tObject = Object.assign(
                    {
                      everyX: taskArray[6],
                    },
                    tObject
                  );
                  break;
                case "weekly":
                  var days = taskArray[6].split(",");
                  var str = "{";
                  for (var j = 0; j < days.length; j++) {
                    if (days.length != 0) {
                      str += '"' + days[j] + '":false';
                      if (j != days.length - 1) str += ",";
                    }
                  }
                  str += "}";
                  var tempObject = JSON.parse(str);
                  tObject = Object.assign(
                    {
                      repeat: tempObject,
                    },
                    tObject
                  );
                  break;
                case "monthly":
                  var weeks = taskArray[6].split(",");
                  var str = "{";
                  for (j = 0; j < weeks.length; j++) {
                    if (weeks.length != 0) {
                      str += '"' + weeks[j] + '":false';
                      if (j != weeks.length - 1) str += ",";
                    }
                  }
                  str += "}";
                  var tempObject = JSON.parse(str);
                  if (taskArray[7] == 0) {
                    var dom = taskArray[8].split(",");
                    tObject = Object.assign(
                      {
                        repeat: tempObject,
                        daysOfMonth: dom,
                      },
                      tObject
                    );
                  } else {
                    var wom = taskArray[8].split(",");
                    tObject = Object.assign(
                      {
                        repeat: tempObject,
                        weeksOfMonth: wom,
                      },
                      tObject
                    );
                  }
              }
              break;
            case "todo":
              tObject = Object.assign(
                {
                  priority: priority,
                  date: taskArray[4],
                },
                tObject
              );
              break;
            case "reward":
              tObject = Object.assign(
                {
                  value: taskArray[3],
                },
                tObject
              );
          }
          tArray.push(tObject);
        }
        resolve({
          Cdata: Cdata,
          tArray: tArray,
        });
      };
    });
  },
};
