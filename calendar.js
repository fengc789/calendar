/*
Created by fengc on 2016/9/13.

#多月日历
var calendar = new Calendar(
	document.getElementById('calendar'),	//容器
	null,

	//当视图左右切换时, 或者月日历与周日历切换时执行的回调, 接收两个对象, 第二个参数对象是起止日期和结束日期
	function(calendar, dateRange){
		console.log(dataRange);
		if(this.activeView.name === 'month'){
			var date = calendar.getMonth();	//获取日历当前时间
			document.getElementById("calendar-month-head").innerHTML = date.year + '/' + date.month;
		}
		calendar.update(schedules);	//把事件添加到日历上
	},

	//月日历与周日历切换时触发的回调
	function(calendar){}
);
calendar.init();


#单月日历
var calendar = new CalendarMonth(document.getElementById('calendar-month-viewB'));
calendar.init();
*/

(function(global, factory){
	var obj = factory();
	global.Calendar = obj.Calendar;
	global.CalendarMonth = obj.CalendarMonth;
	global.TouchClass = obj.TouchClass;
})(window, function(){
	'use strict';
	var transitionProp = typeof document.documentElement.style.transform === 'string' ? 'transform' : 'webkitTransform';
	var extend = function(dst, src) {
	    var i = 0, property;
	    if (!src) src = {};
	    for (property in src) {
	        if (src.hasOwnProperty(property)) {
	            dst[property] = src[property];
	        }
	    }
	    return dst;
	};
	var inherit = function(subClass, superClass){
		var F = function(){};
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;
		subClass.superclass = superClass.prototype;
		if(superClass.prototype.constructor == Object.prototype.constructor){
			superClass.prototype.constructor = superClass;
		}
	};

	var Calendar = function(container, date, sliderCallback, toggleCallback){
		date = date || new Date;
		this.container = container;
		this.date = {
			year : date.getFullYear(),
			month : date.getMonth() + 1,
			day : date.getDate()
		}
		this.isSigned = false;
		this.sliderCallback = sliderCallback;
		this.toggleCallback = toggleCallback;
		this.width;

		this.monthClass = new compositeMonth;
		this.weekClass = new compositeWeek;
		this.activeView = this.monthClass;
	};
	Calendar.prototype = {
		init : function(){
			var _this = this;
			this.monthClass.init(this);
			this.weekClass.init(this);
			this.touchClass = new TouchClass(this.container, {
					touchstart : function(e, touch){
						touch.draging = true;
						delete touch.goView;
						_this.container.classList.remove("calendar-transition");
					},
					touchmove : function(e, touch){
						// 如果是在上下滑, 则不执行
						if(touch.direction === 3 || touch.direction === 4){
							e.preventDefault();
							e.stopPropagation();
							return;
						}
						var x = touch.distance;
						_this.activeView.container.style[transitionProp] = 'translate3d('+ x +'px,0,0)';
					},
					touchend : function(e, touch){
						// 如果是上下滑, 则退出 
						if(touch.direction === 3 || touch.direction === 4){
							return;
						}
						_this.container.classList.add("calendar-transition");
						if(touch.distance > 50){
							//右
							touch.goView = 'a';
							_this.activeView.container.style[transitionProp] = 'translate3d('+ _this.width +'px,0,0)';
						}else if(-touch.distance > 50){
							//左
							touch.goView = 'c';
							_this.activeView.container.style[transitionProp] = 'translate3d('+ -_this.width +'px,0,0)';
						}else{
							touch.goView = 'b';
							_this.activeView.container.style[transitionProp] = 'translate3d(0,0,0)';
						}
					},
				}
			);
			this.touchClass.init();
			this.activeView.render();
			this.expand();
			this.resize();
			this.sliderCallback(this, this.activeView.getDateRange());
		},
		setTime : function(year, month){
			// 设置时间只对月日历有效, 设置后会刷新视图
			this.monthClass.setTime(year, month);
			this.activeView.render();
		},
		getMonth : function(){
			var time = this.activeView.currentTime;
			return {
				year : time.year,
				month : time.month,
				day : time.day || 1,
			};
		},
		sign : function(){
			this.isSigned = true;
			var today = this.activeView.viewB.container.getElementsByClassName('i-today');
			if(today[0]){
				today[0].classList.add('i-signed');
			}
		},
		render : function(){
			this.activeView.render();
		},
		update : function(schedules){
			/*
			在日历上添加事件
			schedules = [
				{is_event : 1, is_sign : 1},
				{is_event : 0, is_sign : 0},
				{is_event : 0, is_sign : 0},
				{is_event : 1, is_sign : 1},
			];
			1 表示有, 0 表示无
			*/
			this.activeView.viewB.update(schedules);
		},
		refresh : function(){
			this.render();
			this.sliderCallback(this, this.activeView.getDateRange());
		},
		resize : function(){
			this.width = this.container.offsetWidth;
			this.activeView.resize(true);
		},
		goNext : function(){
			// 切换到下一视图
			this.container.classList.add("calendar-transition");
			this.touchClass.goView = 'c';
			this.activeView.container.style[transitionProp] = 'translate3d('+ -this.width +'px,0,0)';
		},
		goPrev : function(){
			// 切换到上一视图
			this.container.classList.add("calendar-transition");
			this.touchClass.goView = 'a';
			this.activeView.container.style[transitionProp] = 'translate3d('+ this.width +'px,0,0)';
		},
		expand : function(){
			if(this.activeView.name === 'month'){
				this.monthClass.container.parentNode.style.display = 'block';
				this.weekClass.container.style.display = 'none';
			}else if(this.activeView.name === 'week'){
				this.weekClass.container.style.display = 'block';
				this.monthClass.container.parentNode.style.display = 'none';
			}
		},
		toggle : function(){
			if(this.activeView.name === 'month'){
				this.activeView = this.weekClass;
			}else if(this.activeView.name === 'week'){
				this.activeView = this.monthClass;
			}
			this.expand();
			this.activeView.reset(this.date);
			this.activeView.render();
			this.activeView.resize(true);
			this.sliderCallback(this, this.activeView.getDateRange());
			this.toggleCallback(this);
		},
		destroy : function(){
			this.monthClass.destroy();
			this.weekClass.destroy();
			this.touchClass.destroy();
		}
	};

	function CalendarUnit(){}
	CalendarUnit.prototype = {
		getMaxDay : function(year, month){
			var monthDays;
			if(month == 2 && this.isLearYear(year)){
				return 29;
			}else{
				monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
				return monthDays[month-1];
			}
		},
		isLearYear : function(year){
			return year > 0 && !(year % 4) && (year % 100 || !(year % 400));
		},
		getFirstDay : function(year, month){
			return new Date(year, month-1, 1).getDay();
		},
		update : function(schedules){
			if(!this.tds) return;
			var tds = this.tds,
				td = null,
				schedule = null;
			for(var i=0, l = tds.length; i<l; i++){
				td = this.tds[i];
				if(schedule = schedules[i]){
					if(schedule.is_event === 1) td.classList.add('i-event');
					if(schedule.is_sign === 1) td.classList.add('i-signed');
				}
			}
		},
		addClass : function(originalYear, originalMonth, originalDay, year, month, day, isSigned){
			var classname = 'i-after';
			if(year < originalYear) classname = 'i-before';
			else if(year === originalYear){
				if(month === originalMonth){
					if(day < originalDay) classname = 'i-before';
					else if(originalDay === day){
						classname = isSigned ? 'i-signed i-today' : 'i-today';
					}
				}else if(month < originalMonth){
					classname = 'i-before';
				}
			}
			return classname;
		},
		weekNames : ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日", "周一", "周二", "周三", "周四", "周五", "周六"]
	};


	//表示3个月的月对象类
	var compositeMonth = function(){
		this.name = 'month'
		this.container = document.getElementById('calendar-month');
		this.viewA = new CalendarMonth('viewA', document.getElementById('calendar-month-viewA'));
		this.viewB = new CalendarMonth('viewB', document.getElementById('calendar-month-viewB'));
		this.viewC = new CalendarMonth('viewC', document.getElementById('calendar-month-viewC'));
	};
	compositeMonth.prototype = {
		init : function(parent){
			this.parent = parent;
			this.currentTime = {
				year : parent.date.year,
				month : parent.date.month
			};
			this.setTime(this.currentTime.year, this.currentTime.month);
			this.viewA.init(this);
			this.viewB.init(this);
			this.viewC.init(this);
			this.add();
		},
		setTime : function(year, month){
			if(month > 12){
				month -= 12;
				year++;
			}
			if(month < 1){
				month += 12
				year--;
			}
			var currentYear = year,
				currentMonth = month,
				prevYear = year,
				prevMonth = month-1,
				nextYear = year,
				nextMonth = month+1;

			if(prevMonth < 1){
				prevMonth += 12;
				prevYear++;
			}
			if(nextMonth > 12){
				nextMonth -= 12;
				nextYear++;
			}
			this.currentTime.year = currentYear;
			this.currentTime.month = currentMonth;

			this.viewA.setTime(prevYear, prevMonth);
			this.viewB.setTime(currentYear, currentMonth);
			this.viewC.setTime(nextYear, nextMonth);
		},
		add : function(){
			this.container.addEventListener('webkitTransitionEnd', this.transitionEnd(this));
			this.container.addEventListener('transitionEnd', this.transitionEnd(this));
		},
		off : function(){
			this.container.removeEventListener('webkitTransitionEnd', this.transitionEndHandler);
			this.container.removeEventListener('transitionEnd', this.transitionEndHandler);
			this.transitionEndHandler = null;
		},
		render : function(){
			this.viewA.render();
			this.viewB.render(true);
			this.viewC.render();
		},
		goNext : function(){
			this.parent.container.classList.add("calendar-transition");
			this.parent.touchClass.goView = 'c';
			this.container.style[transitionProp] = 'translate3d('+ -this.parent.width +'px,0,0)';
		},
		goPrev : function(){
			this.parent.container.classList.add("calendar-transition");
			this.parent.touchClass.goView = 'a';
			this.container.style[transitionProp] = 'translate3d('+ this.parent.width +'px,0,0)';
		},
		transitionEnd : function(self){
			return self.transitionEndHandler = function(){
				var goView = self.parent.touchClass.goView;
				
				if(goView === 'b') return;
				if(goView === 'c'){
					self.currentTime.month++;
				}
				if(goView === 'a'){
					self.currentTime.month--;
				}
				self.setTime(self.currentTime.year, self.currentTime.month);
				self.render();
				self.parent.container.classList.remove("calendar-transition");
				self.container.style[transitionProp] = 'translate3d(0,0,0)';
				self.resize();
				self.parent.sliderCallback(self.parent, self.getDateRange());
			};
		},
		resize : function(isOnResize){
			if(isOnResize){
				this.headerHeight = document.getElementById('calendar-month-head').offsetHeight;
			}
			this.parent.container.style.height = this.viewB.container.offsetHeight + this.headerHeight + 'px'
		},
		getDateRange : function(){
			var y = this.currentTime.year,
				m = this.currentTime.month;
			return {
				start : { year : y, month : m, day : 1},
				end : {year : y, month : m, day : this.viewB.time.maxDay }
			};
		},
		reset : function(date){
			this.setTime(date.year, date.month);
		},
		transitionEndHandler : null,
		destroy : function(){
			this.off();
			this.viewA = null;
			this.viewB = null;
			this.viewC = null;
		}
	};

	// 表示3个周的周对象类
	var compositeWeek = function(){
		this.name = 'week';
		this.container = document.getElementById('calendar-week');
		this.currentTime = {};
		this.viewA = new CalendarWeek('viewA', document.getElementById('calendar-week-viewA'));
		this.viewB = new CalendarWeek('viewB', document.getElementById('calendar-week-viewB'));
		this.viewC = new CalendarWeek('viewC', document.getElementById('calendar-week-viewC'));
	};
	compositeWeek.prototype = {
		init : function(parent){
			this.parent = parent;
			this.currentTime = {
				year : parent.date.year,
				month : parent.date.month,
				day : parent.date.day
			};
			this.setTime(this.currentTime.year, this.currentTime.month, this.currentTime.day);
			this.viewA.init(this);
			this.viewB.init(this);
			this.viewC.init(this);
			this.add();
		},
		setTime : function(year, month, day){
			var currentDate = new Date(year, month - 1, day),
				prevDate = new Date(year, month-1, day-7),
				nextDate = new Date(year, month-1, day+7),
				y = currentDate.getFullYear(),
				m = currentDate.getMonth() + 1,
				d = currentDate.getDate();
			this.currentTime.year = y;
			this.currentTime.month = m;
			this.currentTime.day = d;
			this.viewA.setTime(prevDate.getFullYear(), prevDate.getMonth() + 1, prevDate.getDate());
			this.viewB.setTime(y, m, d);
			this.viewC.setTime(nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate());
		},
		add : function(){
			this.container.addEventListener('webkitTransitionEnd', this.transitionEnd(this));
			this.container.addEventListener('transitionEnd', this.transitionEnd(this));
		},
		off : function(){
			this.container.removeEventListener('webkitTransitionEnd', this.transitionEndHandler);
			this.container.removeEventListener('transitionEnd', this.transitionEndHandler);
			this.transitionEndHandler = null;
		},
		render : function(){
			this.viewA.render();
			this.viewB.render(true);
			this.viewC.render();
		},
		transitionEnd : function(self){
			return self.transitionEndHandler = function(){
				var goView = self.parent.touchClass.goView;
				
				if(goView === 'b') return;
				if(goView === 'c'){
					self.currentTime.day += 7;
				}
				if(goView === 'a'){
					self.currentTime.day -= 7;
				}
				self.setTime(self.currentTime.year, self.currentTime.month, self.currentTime.day);
				self.render();
				self.parent.container.classList.remove("calendar-transition");
				self.container.style[transitionProp] = 'translate3d(0,0,0)';
				self.parent.sliderCallback(self.parent, self.getDateRange());
			}
		},
		resize : function(){
			this.parent.container.style.height = this.viewB.container.offsetHeight + 'px';
		},
		getDateRange : function(){
			var y = this.currentTime.year,
				m = this.currentTime.month,
				d = this.currentTime.day,
				endDate = new Date(y, m-1, d+6);
			return {
				start : { year : y, month : m, day : d},
				end : { year : endDate.getFullYear(), month : endDate.getMonth() + 1, day : endDate.getDate()}
			};
		},
		reset : function(date){
			this.setTime(date.year, date.month, date.day);
		},
		transitionEndHandler : null,
		destroy : function(){
			this.off();
			this.viewA = null;
			this.viewB = null;
			this.viewC = null;
		}
	};


	//表示一个月的类
	var CalendarMonth = function(name, container){
		this.name = name;
		this.container = container;
		this.time = {};
		this.tds = null;
	};
	inherit(CalendarMonth, CalendarUnit);
	extend(CalendarMonth.prototype, {
		init : function(parent){
			this.parent = parent;
		},
		setTime : function(year, month){
			this.time.year = year;
			this.time.month = month;
		},
		render : function(boole){
			var year = this.time.year,
				month = this.time.month,
				day = 0,
				firstDay = this.getFirstDay(year, month),
				maxDay = this.time.maxDay = this.getMaxDay(year, month),
				row = Math.ceil((firstDay + maxDay) / 7),
				html = "<table><tr>",
				originalYear = this.parent.parent.date.year,
				originalMonth = this.parent.parent.date.month,
				originalDay = this.parent.parent.date.day,
				isSigned = this.parent.parent.isSigned;
			var i=0, j=0;
			for(; i<7; i++){
				html += '<th>' + this.weekNames[i] + '</th>';
			}
			html += '</tr>';
			i=0;
			for(; i < row; i++){
				html += '<tr>';
				for(j=0; j<7; j++){
					day = i * 7 + j - firstDay + 1;
					if(day > 0 && day <= maxDay){
						html += '<td data-time="'+year+'-'+month+'-'+day+'" class="' + this.addClass(originalYear, originalMonth, originalDay, year, month, day, isSigned) +'">' + day + '</td>';
					}else{
						html += '<td></td>';
					}
				}
				html += '</tr>';
			}
			html += '</table>';
			this.container.innerHTML = html;
			if(boole) this.tds = this.container.querySelectorAll('td[data-time]');
		}
	});

	//表示一周的类
	var CalendarWeek = function(name, container){
		this.name = name;
		this.container = container;
		this.currentWeeks = [];
		this.weekDay = 0;
		this.tds = null;
	};
	inherit(CalendarWeek, CalendarUnit);
	extend(CalendarWeek.prototype, {
		init : function(parent){
			this.parent = parent;
		},
		setTime : function(year, month, day){
			var y,m,d;
			var currentMaxDay = this.getMaxDay(year, month);
			this.weekDay = new Date(year, month-1, day).getDay();	//周几
			for(var i=0; i<7; i++){
				y = year,
				m = month,
				d = day + i;
				if(d > currentMaxDay){
					d -= currentMaxDay;
					m++;
					if(m > 12){
						m -= 12;
						y++;
					}
				}
				this.currentWeeks.push({
					year : y,
					month : m,
					day : d
				});
			}
		},
		render : function(boole){
			var html = '<table><tbody><tr>',
				weeks = this.currentWeeks,
				weekDay = this.weekDay,
				originalYear = this.parent.parent.date.year,
				originalMonth = this.parent.parent.date.month,
				originalDay = this.parent.parent.date.day,
				isSigned = this.parent.parent.isSigned,
				today = {};
			for(var i=0; i<7; i++){
				html += '<th>' + this.weekNames[i + weekDay] + '</th>';
			}
			html += '</tr><tr>';
			for(i=0; i<7; i++){
				today = weeks[i];
				html += '<td data-time='+today.year+'-'+today.month+'-'+today.day+' class="'
						+ this.addClass(originalYear, originalMonth, originalDay, today.year, today.month, today.day, isSigned)
						+ '">' + today.day + '</td>';
			}
			html += '</tr></tbody></table>';
			this.container.innerHTML = html;
			if(boole) this.tds = this.container.getElementsByTagName('td');
			this.currentWeeks = [];
		},
	});
	
	//单月的装饰者
	var CalendarDecorator = function(container, date){
		date = date || new Date;
		this.container = container;
		this.calendar = new CalendarMonth('month', container);
		this.date = {
			year : date.getFullYear(),
			month : date.getMonth() + 1,
			day : date.getDate()
		};
		this.calendar.init(this);
		this.calendar.parent.parent = this;
	};
	CalendarDecorator.prototype = {
		init : function(){
			this.setTime(this.date.year, this.date.month);
			this.render();
		},
		setTime : function(year, month){
			this.calendar.setTime(year, month);
		},
		render : function(){
			this.calendar.render();
		}
	};

	//touch类
	var TouchClass = function(container, opts){
		this.container = container;
		this.draging = false;
		this.pos = {
			startX : 0,
			startY : 0,
			targetX : 0,
			targetY : 0
		};
		this.distance = 0;      //
		this.direction = 0;     //期望方向, 1 左, 2 右, 3 上, 4 下
		this.isslider = false;
		this.opts = {
			touchstart : opts.touchstart,
			touchmove : opts.touchmove,
			touchend : opts.touchend
		};
	};
	TouchClass.prototype = {
		init: function () {
			this.timeStamp = 0;    //touchmove到touchend的速度
			this.on();
		},
		on: function () {
			this.container.addEventListener('touchstart', this.touchStart(this));
			this.container.addEventListener('touchmove', this.touchMove(this));
			this.container.addEventListener('touchend', this.touchEnd(this));
		},
		off: function () {
			this.container.removeEventListener('touchstart', this.touchStartHandler);
			this.container.removeEventListener('touchmove', this.touchMoveHandler);
			this.container.removeEventListener('touchend', this.touchEndHandler);
		},
		touchStart: function (touch) {
			return touch.touchStartHandler = function(e){
				var point = e.touches[0];
				touch.pos.startX = touch.pos.targetX = point.clientX;
				touch.pos.startY = touch.pos.targetY = point.clientY;
				touch.opts.touchstart(e, touch);
			};
		},
		touchMove: function (touch) {
			return touch.touchMoveHandler = function(e){
				if(!touch.draging) return;
				var x = e.touches[0].clientX,
					y = e.touches[0].clientY,
					level, vertical,
					d = 0;
				//手机端浏览器很灵敏, touchstart的xy坐标可能会与touchmove的xy坐标一样
				if(touch.pos.startX != x || touch.pos.startY !== y){
					touch.timeStamp = e.timeStamp | 0;
					if(touch.direction === 0){
						level = x > touch.pos.startX ? 2 : 1;   //优先左
						vertical = y < touch.pos.startY ? 3 : 4;    //优先下
						d = Math.abs(x - touch.pos.startX) > Math.abs(y - touch.pos.startY) ? 0 : 1;    //优先上下
						touch.direction = d === 0 ? level : vertical;
					}
					touch.pos.targetX = x;
					touch.pos.targetY = y;
					touch.distance = x - touch.pos.startX;

					// 左右
					if(touch.direction === 1 || touch.direction === 2){
						// e.preventDefault();
						// e.stopPropagation();
						touch.pos.targetY = 0;
						// touch.moveFn(e, touch);
					}
					// 上下
					else if(touch.direction === 3 || touch.direction === 4){
						touch.pos.targetX = 0;
					}

					touch.opts.touchmove(e, touch);
				}else{
					e.preventDefault();
					e.stopPropagation();
				}
				// console.log(touch.level, touch.vertical, touch.direction);
			};
		},
		touchEnd: function (touch){
			return touch.touchEndHandler = function(e){
				touch.draging = false;
				// touch.distance = touch.pos.targetX - touch.pos.startX;
				touch.isslider = (e.timeStamp | 0) - touch.timeStamp < 20 ? true : false;    //根据时间戳判断滑动的速度(时间)
				touch.opts.touchend(e, touch);
				touch.pos.startX = touch.pos.startY = touch.pos.targetX = touch.pos.targetY = touch.distance = touch.direction = touch.timeStamp = 0;
				touch.isslider = false;
			}
		},
		touchStartHandler: null,
		touchMoveHandler: null,
		touchEndHandler : null
	};

	return {
		Calendar : Calendar,
		CalendarMonth : CalendarDecorator,
		TouchClass : TouchClass
	};
});
