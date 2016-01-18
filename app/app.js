angular.module('OnsiteRegistrationApp', [])
       .controller('MainCtrl',['$http', '$scope', function($http, $scope){

        $scope.found = false
        $scope.error_msg = null
        $scope.same = true
        $scope.edit = false

        function settings(){
            if(!$scope.found && !$scope.existing){
                $scope.user={}
                $scope.user.gender = true
                $scope.user.wantAccomodation = false
                $scope.user.schoolStudent = false
            }
        }
        settings();
        getColleges();

        $scope.streams = [
          'Aeronautical / Aerospace Engineering',
          'Chemical / Petroleum Engineering',
          'Civil Engineering',
          'Commerce',
          'Computer Science Engineering',
          'Electrical Engineering / Electronics & Telecommunication',
          'Humanities',
          'Information Technology / Information Science',
          'Mechanical Engineering',
          'Metallurgical Engineering',
          'Pure Sciences',
          'Others'
        ];

        $scope.states = [
          'Andhra Pradesh',
          'Delhi',
          'Goa',
          'Karnataka',
          'Kerala',
          'Madhya Pradesh',
          'Maharashtra',
          'Pondicherry',
          'Tamil Nadu',
          'Telangana',
          'Other State',
          'International'
        ];

        $scope.degrees = [
          'Bachelors',
          'Masters',
          'PhD',
          'None'
        ];

        $scope.toggle = function(){
            if($scope.existing) $scope.existing = false
            else $scope.existing = true
        }

        $scope.editUser = function(){
            $scope.original_profile = JSON.parse(JSON.stringify($scope.profile))
            $scope.edit = true
        }

        $scope.discardEdit = function(){
            $scope.edit = false
            $scope.profile = $scope.original_profile
        }

        $scope.getUserByFestID = function (){
            if($scope.festID==null)
                return

            $http({
                method:'POST',
                url:'http://shaastra.org:8001/api/users/festid',
                data: {
                    'festID':$scope.festID
                }
            })
            .then(function(res){
                console.log(res)
                $scope.profile = res.data
                $scope.barcodeID = res.data.barcodeID
                $scope.found = true
            },

            function(err){
                console.log(err)
                $scope.profile = null
                $scope.barcodeID = null
                $scope.found = false
                $scope.error_msg = "Can't find user with given Shaastra ID"
            })
        }

        $scope.clear = function(){
            $scope.festID = null
            $scope.barcodeID = null
            $scope.error_msg = null
            $scope.profile = null
            $scope.found = false
        };

        $scope.updateUser = function (){
            var college = JSON.parse(JSON.stringify($scope.profile.college));
            $scope.profile.college = $scope.profile.college._id
            $http({
                method:'POST',
                url:'http://shaastra.org:8001/api/users/updateEverything',
                data: {
                    'userUpdate':$scope.profile
                }
            })
            .success(function(response){
                $scope.edit = false;
                $scope.profile.college = college
                alert("Success");
            })
            .error(function(response){
                alert("We encountered some error")
            })
        }

        function getColleges(){
            $http({
                url:"http://shaastra.org:8001/api/colleges/",
                method:'GET'
            })
            .success(function(response){
                $scope.collegelist = response
            })
        }

        $scope.newUser = function (){
            if($scope.confirm_password != $scope.user.password){
                $scope.same=false
                return
            }
            else
                $scope.same=true
            console.log($scope.user)
            $http({
                method:'POST',
                url: 'http://shaastra.org:8001/api/users',
                data: $scope.user
            })
            .then(function(res){
                alert("Success")
                settings();
            },
            function(err){
                alert("We encountered some error")
            })

        }

       }]);
