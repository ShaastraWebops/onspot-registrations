angular.module('OnsiteRegistrationApp', ['indexedDB'])
       .config(['$indexedDBProvider', function($indexedDBProvider){
            $indexedDBProvider
            .connection('LocalDB')
            .upgradeDatabase(1, function(event, db, tx){
                var userStore = db.createObjectStore('user', {keyPath:'festID'})
            })
       }])
       .controller('MainCtrl',['$http', '$scope', '$indexedDB', function($http, $scope, $indexedDB){

        $scope.found = false
        $scope.error_msg = null
        $scope.same = true
        $scope.toggle = function(){
            if($scope.existing) $scope.existing = false
            else $scope.existing = true
        }

        $scope.getAll = function(){
            $http({
                method:'POST',
                url:'http://localhost:8001/api/users/getAll'
            })
            .then(function(res){
                console.log(res.data)
                $indexedDB.openStore('user', function(store){
                    store.upsert(res.data).then(function(response){
                        console.log("Inside this now")
                    })
                })
            })
        }

        $scope.getUserByFestID = function(){
            var festID = $scope.festID
            $indexedDB.openStore('user', function(store){
                store.find(festID).then(function(res){
                    $scope.profile = res
                    $scope.barcodeID = res.barcodeID
                    $scope.found = true
                },
                function(err){
                    $http({
                        method:'POST',
                        url:'http://localhost:8001/api/users/festid',
                        data:{
                            'festID':festID
                        }
                    })
                    .then(function(res){
                        console.log("From server, with love")
                        $scope.profile = res.data
                        $scope.barcodeID = res.data.barcodeID
                        $scope.found = true
                        $indexedDB.openStore('user', function(store){
                            store.upsert(res.data).then(function(response){
                                console.log("Inserted new data")
                            })
                        })
                    },
                     function(err){
                        console.log(err)
                        $scope.profile = null
                        $scope.barcodeID = null
                        $scope.found = false
                        $scope.error_msg = "Can't find user with given Shaastra ID"
                    })
                })
            })
        }

        $scope.clear = function(){
            $scope.festID = null
            $scope.barcodeID = null
            $scope.error_msg = null
            $scope.profile = null
            $scope.found = false
        }

        $scope.updateUserBarcode = function(){
            if($scope.barcodeID.trim()==null)
                return

            $http({
                method:'POST',
                url:'http://localhost:8001/api/users/barcode',
                data: {
                    'festID':$scope.profile.festID,
                    'barcodeID':$scope.barcodeID
                }
            })
            .then(function(res){
                // console.log(res.data.barcodeID)
                alert("Success")
            },
            function(err){
                alert(err)
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
                url: 'http://localhost:8001/api/users',
                data: $scope.user
            })
            .then(function(res){
                alert("Success")
            },
            function(err){
                alert(err)
            })

        }

       }]);
