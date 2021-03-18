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
    return ChallengeFromCSV.postRequest(
      "https://habitica.com/api/v3/challenges",
      userID,
      APIToken,
      data.Cdata
    ).then((response) => {
      ChallengeFromCSV.postRequest(
        "https://habitica.com/api/v3/tasks/challenge/" +
          JSON.parse(response).data.id,
        userID,
        APIToken,
        data.tArray
      );
      return JSON.parse(response).data.id;
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
        if (req.status === 201) {
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
      let FileList = e.files;
      if (FileList.length > 1) reject("Multiple files selected!");
      let File = FileList[0];
      var reader = new FileReader();
      reader.readAsText(File);
      reader.onload = function (e) {
        let text = e.target.result;
        let tempArray = text.split("\r\n");
        //Data for the challenge
        let Cdata = {
          group: tempArray[4],
          name: tempArray[0],
          shortName: tempArray[1],
          summary: tempArray[2],
          description: tempArray[3],
          prize: tempArray[5],
        };
        //tasks
        let tArray = [];
        for (let i = 6; i < tempArray.length; i++) {
          var taskArray = tempArray[i].split(";");
          if (taskArray.length !== 1) {
            let tObject = {
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
                priority = 2;
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
                var tempObject = {};
                var str = "";
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
                    let days = taskArray[6].split(",");
                    str = "{";
                    for (let i = 0; i < days.length; i++) {
                      if (days.length != 0) {
                        str += '"' + days[i] + '":false';
                        if (i != days.length - 1) str += ",";
                      }
                    }
                    str += "}";
                    tempObject = JSON.parse(str);
                    tObject = Object.assign(
                      {
                        repeat: tempObject,
                      },
                      tObject
                    );
                    break;
                  case "monthly":
                    let weeks = taskArray[6].split(",");
                    str = "{";
                    for (let i = 0; i < weeks.length; i++) {
                      if (weeks.length != 0) {
                        str += '"' + weeks[j] + '":false';
                        if (i != weeks.length - 1) str += ",";
                      }
                    }
                    str += "}";
                    tempObject = JSON.parse(str);
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
        }
        resolve({
          Cdata: Cdata,
          tArray: tArray,
        });
      };
    });
  },
};
