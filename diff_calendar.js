/*
@fengc 2016/10/4
日历
var calendar = new Calendar(document.getElementById('calendar'));

//改变日历时间
calendar.setTime(2016, 12);

//设置开始时间
calendar.setEndTime(2016,10,9);

//设置结束时间
calendar.setEndTime(2016,10,9);

//改变时间后要生成日历html
calendar.render();

//清空时间
calendar.restore();
*/


(function(global, factory){
	global.Calendar = factory();
})(this, function(){
	'use strict';
	var Calendar = function(container, date){
		date = date || new Date;
		this.container = container;
		this.date = {
			year : date.getFullYear(),
			month : date.getMonth() + 1,
			day : date.getDate()
		};
		this.checkedTime = '';
		this.startTime = null;
		this.endTime = null;
	};
	Calendar.prototype = {
		setTime : function(year, month){
			this.date.year = year;
			this.date.month = month;
		},
		getTime : function(){
			var date = this.date;
			return {
				year : date.year,
				month : date.month
			};
		},
		setStartTime : function(year, month, day){
			this.endTime = null;
			this.checkedTime = 'startTime';
			this.startTime = {
				year : year,
				month : month,
				day : day
			};
		},
		setEndTime : function(year, month, day){
			this.startTime = null;
			this.checkedTime = 'endTime';
			this.endTime = {
				year : year,
				month : month,
				day : day
			};
		},
		render : function(){
			var year = this.date.year,
				month = this.date.month,
				day = 0,
				firstDay = this.getFirstDay(year, month),
				maxDay = this.getMaxDay(year, month),
				row = Math.ceil((firstDay + maxDay) / 7),
				html = "<table><thead><tr>",
				i=0,
				j=0,
				checkedTime = this.checkedTime,
				time1 = {
					year : year,
					month : month
				},
				time2 = this[checkedTime];
			for(; i<7; i++){
				html += '<th>' + this.weekNames[i] + '</th>';
			}
			html += '</thead></tr><tbody>';
			i=0;
			for(; i < row; i++){
				html += '<tr>';
				for(j=0; j<7; j++){
					day = i * 7 + j - firstDay + 1;
					if(day > 0 && day <= maxDay){
						time1.day = day;
						html += '<td data-time="'+year+'-'+month+'-'+day+ '"' + this.diff(time1, time2, checkedTime) +'>' + day + '</td>';
					}else{
						html += '<td></td>';
					}
				}
				html += '</tr>';
			}
			html += '</tbody></table>';
			this.container.innerHTML = html;
		},
		getMaxDay : function(year, month){
			var monthDays;
			if(month === 2 && this.isLearYear(year)){
				return 29;
			}else{
				monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
				return monthDays[month-1];
			}
		},
		getFirstDay : function(year, month){
			return new Date(year, month-1, 1).getDay();
		},
		isLearYear : function(year){
			return year > 0 && !(year % 4) && (year % 100 || !(year % 400));
		},
		diff : function(time1, time2, checkedTime){
			if(!time2 || !checkedTime) return '';
			var classname = '';
			if(checkedTime === 'startTime'){
				if(time1.year < time2.year) classname = ' class=i-disabled';
				else if(time1.year === time2.year){
					if(time1.month === time2.month){
						if(time1.day < time2.day) classname = ' class=i-disabled';
					}else if(time1.month < time2.month){
						classname = ' class=i-disabled';
					}
				}
			}else if(checkedTime === 'endTime'){
				if(time2.year < time1.year) classname = ' class=i-disabled';
				else if(time2.year === time1.year){
					if(time2.month === time1.month){
						if(time2.day < time1.day) classname = ' class=i-disabled';
					}else if(time2.month < time1.month){
						classname = ' class=i-disabled';
					}
				}
			}
			return classname;
		},
		restore : function(){
			this.startTime = this.endTime = null;
		},
		weekNames : ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
	};
	return Calendar;
});