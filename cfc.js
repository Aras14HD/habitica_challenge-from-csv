const ChallengeFromCSV = {
  start: (e, userID, APIToken) => {
    ChallengeFromCSV.fileParse(e).then(result => ChallengeFromCSV.sendData(result, userID, APIToken));
  },
  /**
   *Sends the data via AJAX to habitica
   * @param {Object} data - An object containing a challenge and an array containig the tasks.
   * @param {string} userID - userID
   * @param {string} APIToken - APIToken
   */
  sendData: (data, userID, APIToken) => {
    ChallengeFromCSV.postRequest("https://habitica.com/api/v3/challenges", userID, APIToken, data.Cdata).then(function(response) {
      console.log(response);
      id = JSON.parse(response).data.id;
      for(const task of data.tArray) {
        ChallengeFromCSV.postRequest("https://habitica.com/api/v3/tasks/challenge/" + id, userID, APIToken, task)
      }
    })
  },
  /**
  *Sends POST request to specified url with authentication and parameters
   * @param {string} url - url to send POST request to
   * @param {string} userID - userID
   * @param {string} APIToken - APIToken
   * @param {Object} queryParams - Request Payload
   * @returns {Promise} Promise for the POST request
   */
  postRequest: (url, userID, APIToken, queryParams={}) => {
		let promise = new Promise((resolve, reject) => {
			let req = new XMLHttpRequest();
			req.open("POST", url);

			req.onerror = function() {
				reject(this.responseText);
			};

			req.onload = function() {
				if (req.status === 200 || 201) {
					resolve(this.responseText);
				} else {
					reject(this.responseText);
				}
			}
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			req.setRequestHeader("x-client", "456b5feb-bd5c-4046-b5b3-83606a1f6a76-cfc");
			req.setRequestHeader("x-api-user", userID);
			req.setRequestHeader("x-api-key", APIToken);
			req.send(JSON.stringify(queryParams));
		});
		return promise
	},
  /**
   *Converts CSV/TXT File to usable data.
   * @param {Object} e - The Input Element of the CSV/TXT
   * @returns {Object} An object containing a challenge and an array containig the tasks.
   */
  fileParse: (e) => {
    return new Promise(function(resolve, reject) {
      FileList = e.files
      if (FileList.length > 1) console.error("multiple files selected");
      File = FileList[0];
      var reader = new FileReader();
      reader.readAsText(File);
      reader.onload = function(e) {
        Text = e.target.result;
        tempArray = Text.split("\r\n");
        //Data for the challenge
        Cdata = {
          group: tempArray[4],
          name: tempArray[0],
          shortName: tempArray[1],
          summary: tempArray[2],
          description: tempArray[3],
          prize: tempArray[5]
        };
        //tasks
        tArray = [];
        task = false;
        for(i = 6; i < tempArray.length; i++) {
          taskArray = tempArray[i].split(";");
          tObject = {
            type: taskArray[0],
            text: taskArray[1],
            notes: taskArray[2],
          };
          //task difficulty
          switch(taskArray[3]) {
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
          switch(taskArray[0]) {
            case "habit":
              tObject = Object.assign({
                priority: priority,
                startDate: taskArray[4]
              }, tObject);
              break
            case "daily":
            tObject = Object.assign({
              priority: priority,
              frequency: taskArray[5],
              startDate: taskArray[4]
            }, tObject);
            switch(taskArray[5]) {
              //task daily type
              case "daily":
                tObject = Object.assign({
                  everyX: taskArray[6]
                }, tObject);
                break;
              case "weekly":
                days = taskArray[6].split(",");
                str = "{";
                for (j = 0; j < days.length; j++) {
                  if (days.length != 0) {
                    str += "\"" + days[j] + "\":false";
                    if (j != days.length - 1) str += ",";
                  };
                };
                str += "}";
                tempObject = JSON.parse(str);
                tObject = Object.assign({
                  repeat: tempObject
                }, tObject);
                break;
              case "monthly":
                weeks = taskArray[6].split(",");
                str = "{";
                for (j = 0; j < weeks.length; j++) {
                  if (weeks.length != 0) {
                    str += "\"" + weeks[j] + "\":false";
                    if (j != weeks.length - 1) str += ",";
                  }
                };
                str += "}";
                tempObject = JSON.parse(str);
                if (taskArray[7] == 0){
                  dom = taskArray[8].split(",");
                  tObject = Object.assign({
                    repeat: tempObject,
                    daysOfMonth: dom
                  }, tObject);
                } else {
                  wom = taskArray[8].split(",");
                  tObject = Object.assign({
                    repeat: tempObject,
                    weeksOfMonth: wom
                  }, tObject);
                }
            }
            break
            case "todo":
            tObject = Object.assign({
              priority: priority,
              date: taskArray[4]
            }, tObject);
            break
            case "reward":
            tObject = Object.assign({
              value: taskArray[3]
            }, tObject);
          };
          tArray.push(tObject);
        }
        resolve({
          Cdata: Cdata,
          tArray: tArray
        });
      }
    });

  }
}
