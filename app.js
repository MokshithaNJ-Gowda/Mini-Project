
(function () {
    "use strict";

    var app = angular.module("campusConnectApp", ["ngRoute"]);

    // Shared data service
    app.factory("CampusService", function () {
        var students = [
            {id:1, name:"Aarav Sharma", email:"aarav@example.com",
             department:"CSE", attendance:92, cgpa:9.10},
            {id:2, name:"Diya Rao", email:"diya@example.com",
             department:"ECE", attendance:86, cgpa:8.75},
            {id:3, name:"Rohan Kumar", email:"rohan@example.com",
             department:"AIML", attendance:71, cgpa:8.40},
            {id:4, name:"Ananya Shetty", email:"ananya@example.com",
             department:"CSE", attendance:96, cgpa:9.60},
            {id:5, name:"Ishaan Pai", email:"ishaan@example.com",
             department:"ISE", attendance:78, cgpa:8.95},
            {id:6, name:"Meera Nair", email:"meera@example.com",
             department:"CSE", attendance:89, cgpa:9.20}
        ];

        var courses = [
            {code:"CS01", name:"Data Structures",
             category:"Core Computing", instructor:"Prof. Rahul", progress:78},
            {code:"CS02", name:"Web Development",
             category:"Development", instructor:"Prof. Anjali", progress:65},
            {code:"CS03", name:"Database Management",
             category:"Core Computing", instructor:"Prof. Kiran", progress:88},
            {code:"CS04", name:"Machine Learning",
             category:"Artificial Intelligence", instructor:"Prof. Priya", progress:52}
        ];

        var assignments = [
            {id:1, title:"AngularJS Mini Project", course:"Web Development",
             dueDate:new Date(2026,9,22), status:"In Progress"},
            {id:2, title:"Binary Tree Implementation", course:"Data Structures",
             dueDate:new Date(2026,9,25), status:"Pending"},
            {id:3, title:"SQL Database Design", course:"Database Management",
             dueDate:new Date(2026,9,28), status:"Completed"},
            {id:4, title:"ML Data Analysis", course:"Machine Learning",
             dueDate:new Date(2026,10,3), status:"Pending"}
        ];

        return {
            students: students,
            courses: courses,
            assignments: assignments,

            addStudent: function (student) {
                var maxId = students.reduce(function (max, s) {
                    return Math.max(max, s.id);
                }, 0);

                student.id = maxId + 1;
                students.push(student);
            },

            removeStudent: function (id) {
                var index = students.findIndex(function (s) {
                    return s.id === id;
                });

                if (index !== -1) {
                    students.splice(index, 1);
                }
            }
        };
    });

    // SPA routing
    app.config(function ($routeProvider, $locationProvider) {
        $locationProvider.hashPrefix("!");

        $routeProvider
            .when("/dashboard", {
                templateUrl:"dashboard.html",
                controller:"DashboardController"
            })
            .when("/students", {
                templateUrl:"students.html",
                controller:"StudentsController"
            })
            .when("/courses", {
                templateUrl:"courses.html",
                controller:"CoursesController"
            })
            .when("/attendance", {
                templateUrl:"attendance.html",
                controller:"AttendanceController"
            })
            .when("/assignments", {
                templateUrl:"assignments.html",
                controller:"AssignmentsController"
            })
            .when("/register", {
                templateUrl:"register.html",
                controller:"RegisterController"
            })
            .when("/api", {
                templateUrl:"api.html",
                controller:"ApiController"
            })
            .otherwise({redirectTo:"/dashboard"});
    });

    // Global navigation controller
    app.controller("MainController", function ($rootScope) {
        var vm = this;

        vm.page = "dashboard";
        vm.title = "Command Center";
        vm.search = "";
        vm.dark = false;

        var titles = {
            dashboard:"Command Center",
            students:"Student Universe",
            courses:"Learning Space",
            attendance:"Attendance",
            assignments:"Mission Board",
            register:"New Student",
            api:"Live API Lab"
        };

        vm.toggleTheme = function () {
            vm.dark = !vm.dark;
            document.body.classList.toggle("dark-mode", vm.dark);
        };

        $rootScope.$on("$routeChangeSuccess", function (event, current) {
            var path = current && current.$$route ?
                current.$$route.originalPath : "/dashboard";

            vm.page = path.substring(1) || "dashboard";
            vm.title = titles[vm.page] || "Command Center";
        });

        // Keep the header search available to dashboard and student views.
        $rootScope.$watch(function () {
            return vm.search;
        }, function (value) {
            $rootScope.campusSearch = value || "";
        });
    });

    // Dashboard controller
    app.controller("DashboardController",
        function ($scope, CampusService) {
            $scope.students = CampusService.students;
            $scope.courses = CampusService.courses;
            $scope.assignments = CampusService.assignments;

            $scope.globalSearch = function (student) {
                var query = ($scope.campusSearch || "").toLowerCase();

                return !query ||
                    (student.name + " " + student.email + " " +
                     student.department).toLowerCase().indexOf(query) !== -1;
            };

            $scope.averageAttendance = function () {
                if (!$scope.students.length) return 0;

                var total = $scope.students.reduce(function (sum, s) {
                    return sum + Number(s.attendance || 0);
                }, 0);

                return total / $scope.students.length;
            };

            $scope.openAssignments = function () {
                return $scope.assignments.filter(function (task) {
                    return task.status !== "Completed";
                }).length;
            };
        }
    );

    // Student directory controller
    app.controller("StudentsController",
        function ($scope, CampusService) {
            $scope.students = CampusService.students;
            $scope.searchText = "";
            $scope.departmentFilter = "";
            $scope.sortField = "name";

            $scope.$watch("campusSearch", function (value) {
                $scope.globalSearch = value || "";
            });

            $scope.removeStudent = function (id) {
                if (window.confirm("Remove this student from the directory?")) {
                    CampusService.removeStudent(id);
                }
            };

            $scope.filteredCount = function () {
                var query = (
                    $scope.globalSearch + " " + $scope.searchText
                ).trim().toLowerCase();

                return $scope.students.filter(function (s) {
                    var textMatch = !query ||
                        (s.name + " " + s.email + " " + s.department)
                        .toLowerCase().indexOf(query) !== -1;

                    var departmentMatch = !$scope.departmentFilter ||
                        s.department === $scope.departmentFilter;

                    return textMatch && departmentMatch;
                }).length;
            };
        }
    );

    app.controller("CoursesController", function ($scope, CampusService) {
        $scope.courses = CampusService.courses;
    });

    app.controller("AttendanceController", function ($scope, CampusService) {
        $scope.students = CampusService.students;
    });

    app.controller("AssignmentsController", function ($scope, CampusService) {
        $scope.assignments = CampusService.assignments;
        $scope.assignmentStatuses = ["Pending", "In Progress", "Completed"];
    });

    // Registration controller
    app.controller("RegisterController",
        function ($scope, CampusService) {
            function emptyStudent() {
                return {
                    name:"",
                    email:"",
                    department:"",
                    cgpa:null,
                    attendance:null
                };
            }

            $scope.newStudent = emptyStudent();
            $scope.formMessage = "";

            $scope.addStudent = function (form) {
                if (form.$invalid) return;

                var name = $scope.newStudent.name.trim();
                var email = $scope.newStudent.email.trim();
                var cgpa = Number($scope.newStudent.cgpa);
                var attendance = Number($scope.newStudent.attendance);

                if (name.length < 3 ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
                    cgpa < 0 || cgpa > 10 ||
                    attendance < 0 || attendance > 100) {
                    return;
                }

                var duplicate = CampusService.students.some(function (s) {
                    return s.email.toLowerCase() === email.toLowerCase();
                });

                if (duplicate) {
                    $scope.formMessage =
                        "A student with this email already exists.";
                    return;
                }

                CampusService.addStudent({
                    name:name,
                    email:email,
                    department:$scope.newStudent.department,
                    cgpa:cgpa,
                    attendance:attendance
                });

                $scope.formMessage = "✓ Student profile created successfully!";
                $scope.newStudent = emptyStudent();

                form.$setPristine();
                form.$setUntouched();
            };
        }
    );

    // REST API / AJAX controller
    app.controller("ApiController", function ($scope, $http) {
        $scope.apiStudents = [];
        $scope.apiLoading = false;
        $scope.apiError = "";

        $scope.loadApiStudents = function () {
            $scope.apiLoading = true;
            $scope.apiError = "";
            $scope.apiStudents = [];

            $http.get("https://jsonplaceholder.typicode.com/users")
                .then(function (response) {
                    $scope.apiStudents = response.data;
                })
                .catch(function () {
                    $scope.apiError =
                        "Request failed. Check your connection and try again.";
                })
                .finally(function () {
                    $scope.apiLoading = false;
                });
        };
    });

})();
