angular.module('OnsiteRegistrationApp', ['indexedDB'])
       .config(['$indexedDBProvider', function($indexedDBProvider){
            $indexedDBProvider
            .connection('LocalDB')
            .upgradeDatabase(1, function(event, db, tx){
                var userStore = db.createObjectStore('user', {keyPath:'festID'})
            })
       }])
       .controller('MainCtrl',['$http', '$scope', '$indexedDB', '$interval', function($http, $scope, $indexedDB, $interval){

        $scope.found = false
        $scope.error_msg = null
        $scope.same = true
        $scope.toggle = function(){
            if($scope.existing) $scope.existing = false
            else $scope.existing = true
        }

        $scope.getAll = function(){
            console.log("Syncing like a ship")
            $http({
                method:'POST',
                url:'http://localhost:8001/api/users/servertime',
            })
            .then(function(time){
                var url='http://localhost:8001/api/users/getAll'
                if(localStorage['last_fetched_date']!=null)
                    url = url + 'Since'
                $http({
                    method:'POST',
                    url:url,
                    data:{
                        'last_fetched_date':localStorage['last_fetched_date']
                    }
                })
                .then(function(res){
                    $indexedDB.openStore('user', function(store){
                        store.upsert(res.data).then(function(response){
                            localStorage['last_fetched_date']=time.data.date;
                        })
                    })
                })
            })
        }

        $interval($scope.getAll, 100*1000)

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
