(function() {
    app.controller('myCtrl', function($scope, $interval) {

        $scope.viewObject = {
            editMode: false,
            editText: "Edit"
        }

        const localStorageKey = "djwilkins.net/dynETA";
        if (localStorage.getItem(localStorageKey) === null) {
            $scope.tasks = [
                {name:'Task or Habit 1', minutes:5, active:true},
                {name:'Task or Habit 2', minutes:2, active:true},
                {name:'Task or Habit 3', minutes:2, active:true}
            ];
        } else {
            $scope.tasks = JSON.parse(localStorage.getItem(localStorageKey));
            // Reset all values to active
            $scope.tasks.map((task) => { task.active = true; });
        }

        let interval = 1000; // 1 second in milliseconds
        let duration;
        // let duration = moment.duration({'minutes': 5, 'seconds': 00});
        setCurrentTask();
        // updateCountdownInView(duration);

        // Every second, refresh the current Task Timer
        $interval(function(){
            if (duration.asMilliseconds() > 999) {
                duration = moment.duration(duration.asMilliseconds() - interval, 'milliseconds');
                updateCountdownInView(duration);
                // This is broken:
                // if (duration.asMilliseconds() == 3000) {
                //     var url = "https://www.youtube.com/watch?v=1l-9DOdxDKQ";
                //     var tabWindowId = window.open('about:blank', '_blank');
                //     tabWindowId.location.href = url;
                // }
            }
        }, interval);



        $scope.toggleTask = function(index) {

            // Don't run if in edit mode
            if(!$scope.viewObject.editMode) {
                let el = document.getElementById(index);

                if (el.classList.contains('active')) {
                    el.classList.remove('active');
                    el.classList.add('inactive');
                } else if (el.classList.contains('inactive')) {
                    el.classList.remove('inactive');
                    el.classList.add('skipped');
                } else if (el.classList.contains('skipped')) {
                    el.classList.remove('skipped');
                    el.classList.add('active');
                }

                // Toggle task's active value (true/false)
                if (el.classList.contains('active') || el.classList.contains('inactive')) {
                    $scope.tasks[index].active = !$scope.tasks[index].active;
                    setCurrentTask();
                }

                $scope.setTimeNow();
            }
        }

        $scope.setTimeNow = function() {
            let time = moment();
            $scope.timeNow = time.format('h:mm A');

            $scope.tasks.forEach(function (task) {
                if (task.active){
                    time.add(task.minutes,'m');
                }
            });

            $scope.eta = time.format('h:mm A');
        }

        $scope.setTimeNow();

        $scope.toggleEditMode = function() {
            $scope.viewObject.editMode = !$scope.viewObject.editMode;
            if ($scope.viewObject.editMode) {
                $scope.viewObject.editText="Save";
            } else {
                let changesPermanent = confirm("Okay to save changes for all future sessions?");
                if (changesPermanent) {
                    localStorage.setItem(localStorageKey, JSON.stringify($scope.tasks));
                }
                $scope.viewObject.editText="Edit";
                setCurrentTask();
                $scope.setTimeNow();
            }
        }

        $scope.resetTasks = function() {
            // Reset all tasks in task array active to true
            $scope.tasks.forEach(function (task) {
                if (!task.active){
                    task.active = !task.active;
                }
            });
            // Reset all task elements to active class (reset color to blue)
            for (var i = 0; i < $scope.tasks.length; i++) {
                let el = document.getElementById(i);
                if (el.classList.contains('inactive')) {
                    el.classList.remove('inactive')
                    el.classList.add('active');
                } else if (el.classList.contains('skipped')) {
                    el.classList.remove('skipped')
                    el.classList.add('active');
                }
            }
            // Reset ETA time so updated for all tasks reset to undone.
            $scope.setTimeNow();
            // Reset initial Current Task
            setCurrentTask();
        }

        function setCurrentTask() {
            let nextTask = returnNextTask();
            $scope.currentTaskName = nextTask.name;
            duration = moment.duration({'minutes': nextTask.minutes, 'seconds': 00});
            updateCountdownInView(duration);
        }

        function returnNextTask() {
            if($scope.tasks.length > 0) {
                for (let i=0; i < $scope.tasks.length; i++) {
                    if ($scope.tasks[i].active) {
                        return $scope.tasks[i];
                    } else if (i == ($scope.tasks.length - 1)) {
                        return {name:'All Done', minutes:0, active:false}
                    }
                }
            } else {
                return {name:'All Done', minutes:0, active:false}
            }
        }

        function formatSeconds(sec) {
            if (sec < 10 && sec.length != 2) sec = '0' + sec;
            return sec;
        }

        function updateCountdownInView(duration) {
            let seconds = formatSeconds(duration.seconds());
            $scope.viewObject.currentTaskTimer = duration.minutes() + ':' + seconds;
            // $scope.$apply();
            // Above was only needed cause didn't use $interval at first
            // https://stackoverflow.com/questions/31207513/window-setinterval-not-working-on-angularjs
        }

        $scope.removeTask = function(ind) {
            let removed = $scope.tasks[ind];
            $scope.tasks.splice(ind, 1);
            console.log(removed.name + " removed from task list.");
            setCurrentTask();
            $scope.setTimeNow();
        }

        $scope.addTask = function() {
            console.log("Added new task to task list.");
            let newTask = {name:'New Task', minutes:5, active:true};
            $scope.tasks.push(newTask);
            setCurrentTask();
            $scope.setTimeNow();
        }

        $scope.notFirst = function(ind) {
            if (ind > 0) return true
        }

        $scope.notLast = function(ind) {
            if (ind < ($scope.tasks.length - 1)) return true
        }

        $scope.moveTask = function(ind, direction) {
            let movingTask = $scope.tasks[ind];
            let newIndex;
            console.log(movingTask);
            $scope.removeTask(ind);
            if (direction == 'up') {
                newIndex = ind - 1;
            } else if (direction == 'down') {
                newIndex = ind + 1;
            }
            $scope.tasks.splice(newIndex,0,movingTask);
        }


    });

}());
