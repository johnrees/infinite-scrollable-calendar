var module = angular.module('scrollableCalendarModule', []);

module.controller('scrollableCalendarController', function($scope) {
    var scrollbarOffset = 20;
    $scope.setup = function(baseDate) {
        var day = moment.utc(baseDate);
        day.startOf('month');  // first day of the month
        day.startOf('week');   // first day of the week (the row)
        return day;
    }
    $scope.computeDimentions = function(element) {
        var parentWidth = jQuery(element).innerWidth() - scrollbarOffset;
        var width = Math.floor(parentWidth / 7);
        $scope.unitWidth = width;
    }
    $scope.dump = function() {
        console.log("A:" + $scope.rangeA + " B:" + $scope.rangeB);
    }
    $scope.selectRange = function(isSelecting) {
        var startDay = moment.utc($scope.rangeA);
        var endDay = moment.utc($scope.rangeB);
        var numDays = endDay.diff(startDay, 'days');
        $scope.dateFlipped = false;
        if (numDays < 0) {
            // flip
            var tmpDay = startDay;
            startDay = endDay;
            endDay = tmpDay;
            numDays = -1 * numDays;
            $scope.dateFlipped = true;
        }
        // Update model if isSelecting == true
        if (isSelecting) {
            $scope.startDate = startDay.format('YYYY-MM-DD');
            $scope.endDate = endDay.format('YYYY-MM-DD');
        }
        for (var i = 0; i <= numDays; ++i) {
            var id = startDay.format('YYYY-MM-DD');
            var div = $scope.body.find("#" + id);
            if (isSelecting) {
                div.addClass('selected');
            } else {
                div.removeClass('selected');
            }
            startDay.add('days', 1);
        }
    }
    $scope.updateRange = function(rangeA, rangeB) {
        // Unselect previous selection
        $scope.selectRange(false);
        // Make a new selection
        $scope.rangeA = rangeA;
        $scope.rangeB = rangeB;
        $scope.selectRange(true);
    }
    $scope.generateRow = function(param) {
        var day = param.clone();
        var html = jQuery('<div class="cal-row"></div>');
        html.css({'width': $scope.unitWidth * 7 + "px"});

        for (var i = 0; i < 7; ++i) {
            var dayDiv = jQuery('<div class="cal-column"></div>');
            // dayDiv.text(day.utc().format('MMM D'));
            dayDiv.css({'width': $scope.unitWidth + "px"});
            dayDiv.css({'height': $scope.unitWidth + "px"});
            dayDiv.attr('id', day.utc().format('YYYY-MM-DD'));

            var dayMonth = jQuery('<div class="cal-day-month"></div>');
            dayMonth.css({'height':  $scope.unitWidth / 3 + "px"});
            if (day.date() == 1) {
                dayMonth.text(day.utc().format('MMM'))
            }
            var dayNumber = jQuery('<div class="cal-day-number"></div>');
            dayNumber.css({'height': 2 * $scope.unitWidth / 3 + "px"});
            dayNumber.css({'line-height': 2 * $scope.unitWidth / 3 + "px"});

            dayNumber.text(day.utc().format('D'))

            dayDiv.append(dayMonth);
            dayDiv.append(dayNumber);

            if((day.month() % 2) == 0) {
                // even months
                dayDiv.addClass('cal-column-even');
            }
            if (day.isSame($scope.today)) {
                // add CSS class cal-today to today's column
                dayDiv.addClass('cal-today');
            }
            var dow = day.day();
            if ((dow == 0) || (dow == 6)) {
                // weekend
                dayNumber.addClass('cal-weekend');
            }

            /*
            dayDiv.bind('mousedown', function(event_info) {
                // Select the day
                $scope.updateRange(event_info.currentTarget.id, event_info.currentTarget.id);
                $scope.selecting = true;
                $scope.$apply();
            });
            dayDiv.bind('mousemove', function(event_info) {
                var leftButtonPressed = false;
                if (event_info.buttons != undefined) {
                    // Firefox returns event_info.which == 1 even if no mouse keys are pressed.
                    // event_info.buttons is available on Firefox but not on Chrome.
                    if (event_info.buttons == 1) {
                        leftButtonPressed = true;
                    }
                } else {
                    if (event_info.which == 1) {
                        leftButtonPressed = true;
                    }
                }

                if (leftButtonPressed) {
                    if ($scope.rangeB != event_info.currentTarget.id) {
                        $scope.updateRange($scope.rangeA, event_info.currentTarget.id);
                        $scope.$apply();
                    }
                }
            });
            */
            $scope.firstClick = true;
            dayDiv.bind('mouseup', function(event_info) {
                if ($scope.firstClick) {
                    $scope.updateRange(event_info.currentTarget.id, event_info.currentTarget.id);
                    $scope.firstClick = false;
                } else {
                    $scope.updateRange($scope.rangeA, event_info.currentTarget.id);
                    $scope.firstClick = true;
                }
                $scope.selecting = false;
                $scope.$apply();
                if ($scope.callback) {
                    $scope.callback($scope.startDate, $scope.endDate);
                }
            });

            html.append(dayDiv);
            day.add('days', 1);
        }
        return html;
    }
    $scope.setupHeading = function() {
        var height = $scope.unitWidth * 1.5;
        var width = $scope.unitWidth * 7
        $scope.head.css({'height':height, 'width': width});
        $scope.headYear = jQuery('<div id="cal-head-year"></div>');
        $scope.headYear.css({'height':$scope.unitWidth, 'width': width});


        $scope.headDayOfWeek = jQuery('<div id="cal-head-dow"></div>');
        $scope.headDayOfWeek.css({'height':$scope.unitWidth*0.5});

        var day = moment.utc().startOf('week');
        for (var i = 0; i < 7; ++i) {
            var dayDiv = jQuery('<div class="cal-column"></div>');
            dayDiv.text(day.utc().format('ddd'));
            dayDiv.css({'width': $scope.unitWidth + "px"});
            $scope.headDayOfWeek.append(dayDiv);
            day.add('days', 1);
        }
        $scope.head.append($scope.headYear);
        $scope.head.append($scope.headDayOfWeek);
    }
    $scope.setupBody = function(parentElement) {
        var height = parentElement.innerHeight() - $scope.head.innerHeight();
        var width = parentElement.innerWidth();
        $scope.body.css({'height': height, 'width': width});

    }
    $scope.refreshHeading = function() {
        var top = $scope.body.scrollTop();
        var height = $scope.body[0].scrollHeight;
        var visibleHeight = $scope.body.innerHeight();
        var bottom = top + visibleHeight;

        var centerDay = $scope.beginDay.clone();
        centerDay.add('days', Math.floor((top + visibleHeight/2) / $scope.unitWidth) * 7);

        $scope.headYear.text(centerDay.format('YYYY MMMM'));
    }
    // Angular -> UI
    $scope.setDatesFromModel = function() {
        if (($scope.startDate == undefined) || ($scope.endDate == undefined)) {
            return;
        }
        // this is required as update happens during dragging as well.
        if (!$scope.dateFlipped) {
            $scope.updateRange($scope.startDate, $scope.endDate);
        } else {
            $scope.updateRange($scope.endDate, $scope.startDate);
        }
    }
    $scope.$watch('startDate', $scope.setDatesFromModel);
    $scope.$watch('endDate', $scope.setDatesFromModel);
});

module.directive('scrollableCalendar', function() {
   return {
       restrict: 'A',
       controller: 'scrollableCalendarController',
       scope: {
         'startDate': '=',
         'endDate': '=',
         'baseDate': '=',
         'callback': '='
       },
       template: '<div class="cal-head"></div><div class="cal-body"></div>',
       link: function($scope, $element, $attrs) {
           $scope.computeDimentions($element);
           $scope.body = jQuery($element).find(".cal-body");
           $scope.head = jQuery($element).find(".cal-head");
           $scope.dateFlipped = false;

           $scope.setupHeading();
           $scope.setupBody($element);

           $scope.addInitialCalendarDays = function() {
               // Run it only once
               if ($scope.initialized) {
                   return;
               }
               $scope.initialized = true;
               var day = $scope.setup($scope.baseDate);
               var localNow = moment();
               $scope.today = moment.utc([localNow.year(), localNow.month(), localNow.date()]);  // using UTC internally
               // going back 300px
               var hiddenNumRows = Math.floor(300 / $scope.unitWidth);
               day.subtract('days', 7 * hiddenNumRows);

               $scope.beginDay = day.clone();
               for (var i = 0; i < 50; ++i) {
                   var rowElement = $scope.generateRow(day);
                   $scope.body.append(rowElement);
                   day.add('days', 7);
               }
               var endDay = day.clone();
               $scope.body.scrollTop(hiddenNumRows * $scope.unitWidth);
               $scope.refreshHeading();
               $scope.setDatesFromModel();
           }

           $scope.body.bind('scroll', function(event_info) {
               var top = $scope.body.scrollTop();
               var height = $scope.body[0].scrollHeight;
               var visibleHeight = $scope.body.innerHeight();
               var bottom = top + visibleHeight;
               if (top < 100) {
                   // create rows
                   var hiddenNumRows = Math.floor(300 / $scope.unitWidth);
                   for (var i = 0; i < hiddenNumRows; ++i) {
                       $scope.beginDay.subtract('days', 7);
                       var rowElement = $scope.generateRow($scope.beginDay);
                       $scope.body.prepend(rowElement);
                   }
                   jQuery($scope.body).scrollTop(top + hiddenNumRows * $scope.unitWidth);
               } else if ((height - bottom) < 100) {
                   // create rows at the bottom
                   var hiddenNumRows = Math.floor(300 / $scope.unitWidth);
                   for (var i = 0; i < hiddenNumRows; ++i) {
                       var rowElement = $scope.generateRow($scope.endDate);
                       $scope.body.append(rowElement);
                       $scope.endDate.add('days', 7);
                   }
               }
               $scope.refreshHeading();
           });

           $scope.$watch('baseDate', function() {
               if ($scope.baseDate != undefined) {
                   $scope.addInitialCalendarDays();
               }
           })
       }
    };
});