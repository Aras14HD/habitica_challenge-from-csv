/*
CSV/TXT format:

Challenge Name
Short Name
Summary
Challenge Description
Guild ID
Categories
Gem Prize
Indicator for beginning of tasks
//Tasks are listed in this way:
Task Type: Habit; Title; Notes; Difficulty; Start Date;
Task Type: Daily; Title; Notes; Difficulty; Start Date; Repeats;
Task Type: To Do; Title; Notes; Difficulty; Due Date;
Task Type: Reward; Title; Notes; Cost;

tasks of the type Daily can be daily, weekly, monthly, or yearly. They have special requirements:
daily:   Repeat Every:
weekly:  Repeat On:    list of days not repeated seperated with commas
monthly: Repeat On:    list of days not repeated seperated with commas; Select DOM(0) or DOW(1); Days Of Month: list of days of the month seperated with commas; Weeks Of Month: list of weeks of the month seperated with commas
*/
const ChallengeFromCSV = {
  start: (e, userID, APIToken) => {
    ChallengeFromCSV.fileParse(e).then(result => ChallengeFromCSV.sendData(result, userID, APIToken));
  },
  /**
   *Sends the data via AJAX to habitica
   * @param {Object} data - An object containing a challenge and an array containig the tasks.
   */
  sendData: (data, userID, APIToken) => {
    Cdata = data.Cdata;
    tArray = data.tArray;
    console.log(Cdata);
    console.log(tArray);
    ChallengeFromCSV.postRequest("https://habitica.com/api/v3/challenges", userID, APIToken, Cdata).then(response => function(response) {
      id = JSON.parse(response).data.id;
      for(const task of tArray) {
        ChallengeFromCSV.postRequest("https://habitica.com/api/v3/tasks/callenge/" + id, userID, APIToken, task)
      }
    }, error => console.error(error))
  },
  postRequest: (url, userID, APIToken, queryParams={}) => {
		let promise = new Promise((resolve, reject) => {
			let req = new XMLHttpRequest();
			req.open("POST", url);

			req.onerror = function() {
				reject(this.responseText);
			};

			req.onload = function() {
				if (req.status === 200) {
					resolve(this.responseText);
				} else {
					reject(this.responseText);
				}
			}
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
        tempArray = Text.split("\n");
        Cdata = {
          name: tempArray[0],
          shortName: tempArray[1],
          summary: tempArray[2],
          description: tempArray[3],
          group: tempArray[4],
          prize: tempArray[6]
        };
        //tasks
        tArray = [];
        task = false;
        for(i = 8; i < tempArray.length - 2; i++) {
          taskArray = tempArray[i].split(";");
          tObject = {
            type: taskArray[0],
            text: taskArray[1],
            notes: taskArray[2],
          };

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
          switch(taskArray[0]) {
            case "Habit":
              tObject = Object.assign({
                priority: priority,
                startDate: taskArray[4]
              }, tObject);
              break
            case "Daily":
            tObject = Object.assign({
              priority: priority,
              frequency: taskArray[5],
              startDate: taskArray[4]
            }, tObject);
            switch(taskArray[5]) {
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
            case "To Do":
            tObject = Object.assign({
              priority: priority,
              date: taskArray[4]
            }, tObject);
            break
            case "Reward":
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
