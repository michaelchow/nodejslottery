var fs = require('fs');
var data = fs.readFileSync('./data.txt').toString();


var timePattern = "<td>\\d{2}</td>\r\n.*<td>\\d{4}-\\d{2}-\\d{2} (\\d{2}):(\\d{2})</td>";
		var timeArray = Array();
		if (timePattern != '')
		{
		console.log(timePattern);
			var timeReg = new RegExp(timePattern,"ig");
			
			while(time = timeReg.exec(data)) {
				var timeGroup = Array();
				for(i=1;i<time.length;i++){
					timeGroup.push(time[i]);
				}
				timeArray.push(timeGroup.join(":"));
			}
			
		}
//console.log(data);
		console.log(timeArray);