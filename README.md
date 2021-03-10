# habitica_challenge-from-csv

This was created for [Memry](https://github.com/Memry)

CSV/TXT format:

Challenge Name
Short Name
Summary
Challenge Description
Guild ID
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

Date format: YYYY-MM-DDTHH:mm:ss.sssZ
