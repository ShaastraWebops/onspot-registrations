
var URL_PREFIX = 'http://shaastra.org:8001/api/'

angular.module('OnsiteRegistrationApp', ['indexedDB'])
        .config(['$indexedDBProvider', function($indexedDBProvider){
                    $indexedDBProvider
                    .connection('LocalDataBase')
                    .upgradeDatabase(1, function(event, db, tx){
                        var collegeStore = db.createObjectStore('college', {keyPath:'_id'})
                    })
        }])
        .service('Helper', ['$http', '$indexedDB', function($http, $indexedDB){

            return {

                getColleges: function (success_callback){
                    if(localStorage.collegelist!=null){
                        $indexedDB.openStore('college', function(store){
                            store.getAll().then(function(colleges){
                                success_callback(colleges)
                            })
                        })
                    }
                    else
                    {
                        $http({
                            url: URL_PREFIX + "colleges/",
                            method:'GET'
                        })
                        .success(function(response){
                            $indexedDB.openStore('college', function(store){
                                store.upsert(response).then(function(res){
                                    localStorage.collegelist="Yeah"
                                });
                            })
                            success_callback(response)
                        })
                    }
                }

            }
        }])
        .controller('MainCtrl',['$http', '$scope', function($http, $scope){

            // var URL_PREFIX = 'http://shaastra.org:8001/api/'

            $scope.edit_processing = false;
            $scope.new_processing = false;
            $scope.get_processing = false;

            $scope.get_button = "Get"
            $scope.update_button = "Update"
            $scope.save_button = "Save changes"
            $scope.submit_button = "Submit"

            function settings(){
                if(!$scope.found && !$scope.existing){
                    $scope.user={}
                    $scope.user.gender = true
                    $scope.user.schoolStudent = false
                }
            }

            settings();

            $scope.found = false
            $scope.error_msg = null
            $scope.edit = false
            $scope.festID = "SHA16"
            $scope.existing = false
            $scope.same = true

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

            $scope.newUser = function (){
                if($scope.confirm_password != $scope.user.password){
                    $scope.same=false
                    return
                }
                else
                    $scope.same=true
                $scope.new_processing = true
                $scope.submit_button = "Processing ..."
                console.log($scope.user)
                $http({
                    method:'POST',
                    url: URL_PREFIX + 'users/onspot',
                    data: $scope.user
                })
                .then(function(res){
                    alert("Success: Your Shaastra ID is: "+res.data);
                    settings();
                    $scope.confirm_password=""
                    $scope.user = null
                    $scope.new_processing = false
                    $scope.submit_button = "Save changes"
                },
                function(err){
                    alert("We encountered some error")
                    $scope.new_processing = false
                    $scope.submit_button = "Save changes"
                })

            }

            $scope.getUserByFestID = function (){
                if($scope.festID==null)
                    return
                $scope.get_processing = true
                $scope.get_button = "Processing ..."
                $http({
                    method:'POST',
                    url: URL_PREFIX + 'users/festid',
                    data: {
                        'festID':$scope.festID
                    }
                })
                .then(function(res){
                    console.log(res)
                    $scope.profile = res.data
                    $scope.barcodeID = res.data.barcodeID
                    $scope.found = true
                    $scope.get_processing = false
                    $scope.get_button = "Get"
                },

                function(err){
                    console.log(err)
                    $scope.profile = null
                    $scope.found = false
                    $scope.error_msg = "Can't find user with given Shaastra ID"
                    $scope.get_processing = false
                    $scope.get_button = "Get"
                })
            }

            $scope.clear = function(){
                $scope.festID = "SHA16"
                $scope.error_msg = null
                $scope.profile = null
                $scope.found = false
            };

            $scope.updateUser = function (){
                $scope.edit_processing = true
                $scope.update_button = "Processing ..."
                $scope.save_button = "Processing ..."
                $http({
                    method:'POST',
                    url: URL_PREFIX + 'users/updateEverything',
                    data: {
                        'userUpdate':$scope.profile
                    }
                })
                .success(function(response){
                    $scope.edit = false;
                    alert("Success");
                    $scope.edit_processing = false
                    $scope.update_button = "Update"
                    $scope.save_button = "Save changes"
                })
                .error(function(response){
                    alert("We encountered some error")
                    $scope.edit_processing = false
                    $scope.update_button = "Update"
                    $scope.save_button = "Save changes"
                })
            }

        }])

       .run(['$rootScope', 'Helper', function ($rootScope, Helper){

          $rootScope.streams = [
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

          $rootScope.states = [
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

          $rootScope.degrees = [
            'Bachelors',
            'Masters',
            'PhD',
            'None'
          ];

          Helper.getColleges(function(list){
            $rootScope.collegelist=list;
          });

       }])
