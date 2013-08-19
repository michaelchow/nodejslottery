var fs = require("fs"),tz = require("timezone");
eval(fs.readFileSync('./library/dateformat.js').toString());
var url = "http://www.wclc.com/app/winning_numbers/keno.html?monthYear=" + tz(require("timezone/" + "Canada/Pacific"))(new Date().getTime(), "%d-%b-%Y ", "Canada/Pacific");

console.log(url);
canada = tz(require("timezone/" + "Canada/Pacific"));
var canadaNowHour = parseInt(canada(new Date().getTime(), "%-I", "Canada/Pacific"));
var firstTime;
if (canadaNowHour >=4){
	firstTime = canada(new Date().getTime(), "%F 04:30:00", "Canada/Pacific");
}else{
	firstTime = canada(new Date().getTime() - 60*60*24*1000, "%F 04:30:00", "Canada/Pacific");
}
var pastDraw = Math.floor((new Date().getTime() - canada(firstTime)) / 1000 / 300);
console.log(pastDraw);

console.log(canada(new Date().getTime(), "%F %T", "Canada/Pacific"));
console.log(canadaNowHour);
console.log(firstTime);

/*

                    ulong maxRound  = Convert.ToUInt64(GetMaxRound(rounds));//最后的期数
                    ulong minRound  = Convert.ToUInt64(GetMinRound(rounds));//最后的期数
                    ulong thisRound = Convert.ToUInt64(round);//当期期数
	

	
var url = "http://www.wclc.com/app/winning_numbers/keno.html?monthYear=" + TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.Local, TimeZoneInfo.FindSystemTimeZoneById("Pacific Standard Time")).ToString("dd-MMM-yyyy", System.Globalization.CultureInfo.InvariantCulture)";
var delaySecond = 30;//延迟n秒确定开奖 
*/