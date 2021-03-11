# habitica_challenge-from-csv

This was created for [Memry](https://github.com/Memry)

Takes an CSV/TXT file in the format:

> > Challenge Name
> > Short Name
> > Summary
> > Challenge Description
> > Guild ID
> > Gem Prize
> > Indicator for beginning of tasks
> > Task Type: Habit; Title; Notes; Difficulty; Start Date;
> > Task Type: Daily; Title; Notes; Difficulty; Start Date; Repeats;
> > Task Type: To Do; Title; Notes; Difficulty; Due Date;
> > Task Type: Reward; Title; Notes; Cost;
>
> tasks of the type Daily can be daily, weekly, monthly, or yearly. They have special requirements:
> daily: Repeat Every:
> weekly: Repeat On: list of days not repeated seperated with commas
> monthly: Repeat On: list of days not repeated seperated with commas; Select DOM(0) or DOW(1); Days Of Month: list of days of the month seperated with commas; Weeks Of Month: list of weeks of the month seperated with commas
>
> Date format: _YYYY_-_MM_-_DDTHH_:_mm_:_ss_.*sss*Z

and creates a new habitica Challenge based on that data.

## Usage

You can access the example via [Github Pages](https://aras14hd.github.io/habitica_challenge-from-csv/) or put the cfc.js/cfc.min.js file into your own project and access it via the namespace ChallengeFromCSV.

ChallengeFromCSV contains 3 functions:

- fileParse(file) - Takes CSV/TXT File of input and returns an object containing a challenge and an array containig the tasks.
- sendData(data, userID, APIToken) - Sends the Challenge and tasks via AJAX to habitica
- start(file, userID, APIToken) - calls fileParse(file) then calls sendData(data, userID, APIToken) [data being the returned object].
