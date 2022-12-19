/**
 * A library to parse CSV files and interact with the Habitica API to create Challenges from them
 * @param {Object} e - The Input Element of the CSV/TXT
 * @param {string} userID - userID
 * @param {string} APIToken -APIToken
 */
const ChallengeFromCSV = {
  /**
   * Creates a cfc instance
   * @param {Object} e - The Input Element of the CSV/TXT
   * @param {string} userID - userID
   * @param {string} APIToken -APIToken
   */
  start: (e, userID, APIToken) => {
    ChallengeFromCSV.fileParse(e).then((result) =>
      ChallengeFromCSV.sendData(result, userID, APIToken)
    );
  },

  /**
   *Sends the data via AJAX to habitica
   * @param {Object} data - An object containing a challenge and an array containig the tasks
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
    return new Promise((resolve, reject) => {
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
      let reader = new FileReader();
      reader.readAsText(File);
      reader.onload = function (e) {
        let text = e.target.result;
        let tempArray = text.split("\r\n");
        if (tempArray.length < 6)
          reject({
            title: "Invalid CSV",
            message: `Not enough lines in file for challenge! Text: 
        ${text}`,
          });
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
          let taskArray = tempArray[i].split(";");
          if (taskArray.length !== 1) {
            if (taskArray.length < 4)
              reject({
                title: "Invalid CSV",
                message: `Not enough Items in line for Task! Task Text: 
            ${tempArray[i]}`,
              });
            let tObject = {
              type: taskArray[0],
              text: taskArray[1],
              notes: taskArray[2],
            };
            //task difficulty
            let priority = 1;
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
              case "habit": {
                if (taskArray.length < 5)
                  reject({
                    title: "Invalid CSV",
                    message: `Not enough Items in line for Task of type "habit"! Task Text: 
                    ${tempArray[i]}`,
                  });
                tObject = Object.assign(
                  {
                    priority: priority,
                    startDate: taskArray[4],
                  },
                  tObject
                );
                break;
              }
              case "daily": {
                if (taskArray.length < 7)
                  reject({
                    title: "Invalid CSV",
                    message: `Not enough Items in line for Task of type "daily"! Task Text:
                    ${tempArray[i]}`,
                  });
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
                  case "daily": {
                    tObject = Object.assign(
                      {
                        everyX: taskArray[6] || 1,
                      },
                      tObject
                    );
                    break;
                  }
                  case "weekly": {
                    let days = taskArray[6].split(",");
                    let repeat = {};
                    for (let i = 0; i < days.length; i++) {
                      if (
                        !["m", "t", "w", "th", "f", "s", "su"].includes(days[i])
                      )
                        reject({
                          title: `Unknown weekday "${days[i]}"`,
                          message: `Valid weekdays: "m" (Monday), "t" (Tuesday), "w" (Wednesday), "th" (Thursday), "f" (Friday), "s" (Saturday), "su" (Sunday)`,
                        });
                      repeat[days[i]] = false;
                    }
                    tObject = Object.assign(
                      {
                        repeat,
                      },
                      tObject
                    );
                    break;
                  }
                  case "monthly": {
                    let weeks = taskArray[6].split(",");
                    let repeat = {};
                    for (let i = 0; i < weeks.length; i++) {
                      repeat[weeks[i]] = false;
                    }
                    if (taskArray[7] == 0) {
                      let dom = taskArray[8].split(",");
                      tObject = Object.assign(
                        {
                          repeat,
                          daysOfMonth: dom,
                        },
                        tObject
                      );
                    } else {
                      let wom = taskArray[8].split(",");
                      tObject = Object.assign(
                        {
                          repeat,
                          weeksOfMonth: wom,
                        },
                        tObject
                      );
                    }
                    break;
                  }
                  case "yearly": {
                    tObject = Object.assign(
                      {
                        everyX: taskArray[6] || 1,
                      },
                      tObject
                    );
                    break;
                  }
                  default: {
                    reject({
                      title: `Unknown frequency type (task type daily) "${taskArray[5]}"`,
                      message: `Valid frequency types: "daily", "weekly", "monthly"`,
                    });
                  }
                }
              }
              case "todo": {
                if (taskArray.length < 5)
                  reject({
                    title: "Invalid CSV",
                    message: `Not enough Items in line for Task of type "todo"! Task Text: 
                    ${tempArray[i]}`,
                  });
                tObject = Object.assign(
                  {
                    priority: priority,
                    date: taskArray[4],
                  },
                  tObject
                );
                break;
              }
              case "reward": {
                tObject = Object.assign(
                  {
                    value: taskArray[3],
                  },
                  tObject
                );
                break;
              }
              default: {
                reject({
                  title: `Unknown task type "${taskArray[0]}"`,
                  message: `Valid types (comma seperated): "habit", "daily", "todo", "reward"`,
                });
              }
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
