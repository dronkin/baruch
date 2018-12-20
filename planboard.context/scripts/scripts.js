'use strict';

/**
 * @ngdoc overview
 * @name dcmApp
 * @description
 * # dcmApp
 *
 * Main module of the application.ard
 */

function appConfig($stateProvider, $urlRouterProvider) {
	
	$urlRouterProvider.otherwise('/');
	// $urlRouterProvider.otherwise('/doctors');
	//
	$stateProvider
		.state('landing', {
			url: '/',
			controller: 'LandingCtrl',
			templateUrl: 'views/landing.html'
		})
		.state('hospitals', {
			url: '/hospitals',
			views: {
				'': {
					templateUrl: 'views/main.html',
					controller: 'HospitalsCtrl'
				},
				'topbar@hospitals': {
					templateUrl: 'views/topbar.html'
				},
				'sidebar@hospitals': {
					templateUrl: 'views/sidebar.html'
				},
				'dashboard@hospitals': {
					templateUrl: 'views/dashboard.html'
				}
			}
		})
		.state('doctors', {
			url: '/doctors',
			views: {
				'': {
					templateUrl: 'views/main.html',
					controller: 'DoctorsCtrl'
				},
				'topbar@doctors': {
					templateUrl: 'views/topbar.html'
				},
				'sidebar@doctors': {
					templateUrl: 'views/sidebar.html'
				},
				'dashboard@doctors': {
					templateUrl: 'views/dashboard.html'
				}
			}
		})        
		;	
}
angular
	.module('dcmApp', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngTouch',
		'ui.router',
		'ui.bootstrap',
		'ui.grid',
		'ui.grid.selection',
		])
	// .run(['values', appRun])
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache, no-store, must-revalidate';
		$httpProvider.defaults.headers.common.Pragma = 'no-cache';
		$httpProvider.defaults.headers.common.Expires = '0';
	}])
	.config(['$stateProvider', '$urlRouterProvider', appConfig])
	;



'use strict';

/**
 * @ngdoc function
 * @name dcmApp.controller:LandingCtrl
 * @description
 * # LandingCtrl
 * Controller of the dcmApp
 */
angular.module('dcmApp')
	.controller('LandingCtrl', function ($scope, $window, constants) {
		$scope.hrefHospitals = 'index.html#/hospitals';
		// $scope.hrefHospitals = constants.basePath + 'index.html#/hospitals';
		$scope.hrefHReports = constants.basePath + 'services/hospital_reports_final.php';
		$scope.hrefHReportsShift = constants.basePath + 'reports/hospital_reports_shift.php';
		$scope.hrefHReportsInvoice = constants.basePath + 'reports/hospital_reports_invoice.php';
		$scope.hrefDReports = constants.basePath + 'reports/doctor_reports_new_many.php';
		$scope.hrefDReportsSchedule = constants.basePath + 'reports/doctor_reports_schedule.php';
		$scope.hrefDReportsPyment = constants.basePath + 'reports/doctor_reports_payment.php';
		$scope.adminHospital = constants.basePath + 'admin/manage_hospitals.php';
		$scope.adminDoctors = constants.basePath + 'admin/doctors_manager_new.php';
		$scope.adminHollidays = constants.basePath + 'admin/manage_holidays.php';
		$scope.adminHistory = constants.basePath + 'admin/history.php';
		$scope.financialHospitalReports = constants.basePath + 'financial_reports/financial_reports_view.php';
		$scope.financialDoctorReports = constants.basePath + 'financial_reports/financial_reports_doctor_view.php';
		//
		$scope.goHref = function(url) {
			$window.open(url, '_blank');
		};
	});

'use strict';

/**
 * @ngdoc function
 * @name dcmApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the dcmApp
 */
angular.module('dcmApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

'use strict';

/**
* @ngdoc function
* @name dcmApp.controller:DoctorsCtrl
* @description
* # DoctorsCtrl
* Controller of the dcmApp
*/
angular.module('dcmApp')
	.controller('EditShiftCtrl', function ($scope, $uibModal, $uibModalInstance, $http, $cacheFactory, $timeout, userinteraction, values, constants, params) {

		function getWeekdaysString(list) {
			var ret = '';
			for (var i = 0; i < list.length; i++) {
				var d = list[i];
				var w = values.weekShortNames[d];
				ret += (ret.length ? ', ' : '') + w;
			}

			return ret;
		}

		function convertMomentDate(date, increase) {
			var a = date.split('-');
			return new Date(a[0],parseInt(a[1]-1),a[2],(increase?parseInt(a[3])+12:a[3]),a[4]);
		}

		function getHospitalName(id) {
			var ret = 'Unknown';
			angular.forEach(values.hospitals, function (item) {
				if (item.id.toString() === id.toString()) {
					ret = item.name;
				}
			});
			return ret;
		}

		function zeroConcat(num) {
			return num < 9 ? '0' + num : num;
		}

		function getFormatedDate(date) {
			var d = new Date(date);
			return  d.getFullYear() + '-' + zeroConcat(d.getMonth() + 1) + '-' + zeroConcat(d.getDate());
		}

		function getFormatedTime(time) {
			var t = new Date(time);
			return  zeroConcat(t.getHours()) + ':' + zeroConcat(t.getMinutes());
		}		
		

		var doctors = [];
		var weekday = convertMomentDate(params.startdatestamp, false).getDay();
		//5 = friday console.log('today is: ',weekday);
		var iDoctor = -1;
		var nDoctor = '';

		$scope.loadingStatus = true;
		$scope.saveDisabled = true;
		$scope.onItemInit = function(row) {
			console.log(row);
		};
		$scope.gridOptions = {
			enableRowSelection: true,
			enableFiltering: false,
			enableRowHeaderSelection: false,
			multiSelect: false,
			modifierKeysToMultiSelect: false,
			noUnselect: false,
			data: doctors,
			columnDefs: [
			{ name: 'name',   displayName: 'Doctor name', width: 120 },
			{ name: 'status', displayName: 'Status', width: 80 },
			{ name: 'shifts', displayName: 'Month', width: 80 },
			{ name: 'weeks',  displayName: 'Week' },
			{ name: 'thu', displayName: 'Thu',
			  cellTemplate: '<div class="ui-grid-cell-contents" style="color:{{COL_FIELD.color}}">{{COL_FIELD.num}}</div>',
			  width: 40 },
			{ name: 'fri', displayName: 'Fri',
			  cellTemplate: '<div class="ui-grid-cell-contents" style="color:{{COL_FIELD.color}}">{{COL_FIELD.num}}</div>',
			  width: 40 },
			{ name: 'sat', displayName: 'Sat', 
			   cellTemplate: '<div class="ui-grid-cell-contents" style="color:{{COL_FIELD.color}}">{{COL_FIELD.num}}</div>',
			   width: 40 },
			{ name: 'sun', displayName: 'Sun',
			  cellTemplate: '<div class="ui-grid-cell-contents" style="color:{{COL_FIELD.color}}">{{COL_FIELD.num}}</div>',
			  width: 40 },
			],
			onRegisterApi: function(gridApi) {
				$scope.gridApi = gridApi;
			}
		};
		var $httpDefaultCache = $cacheFactory.get('$http');
		var url = constants.basePath + 'api/getdoctors_new.php';//WAS _test.php 16.9.18
	
		$http({
			url: url,
			method: 'GET',
			cache: false,
			params: {
				date: getFormatedDate(convertMomentDate(params.startdatestamp,false)),
				hid: params.hid
			}})
			.then(function(resp) {
				console.log(resp.data);
				$scope.loadingStatus = false;

				for (var i = 0; i < resp.data.length; i++) {
					var item = resp.data[i];
					var nameItem = item.name;
					var nameParams = params.name;					
					if (   nameParams.indexOf( nameItem )  >= 0  ) {
						iDoctor = i;
						nDoctor = item.name;
						$scope.saveDisabled = false;
					}
					doctors.push({
						name:   item.name,
						status: item.taken ? item.taken : 'Available',
						shifts: item.totshfts+" ("+item.hours_full+")",//david new
						weeks: getWeekdaysString(item.days),
						weekdays: item.days,
						thu: item.thu,
						fri: item.fri,
						sat: item.sat,
						sun: item.sun,
						category: item.category ? item.category : '1'//new 0 means Israely
					});
				}

				$scope.gridOptions.data = doctors;
				$timeout(function () {
					if (iDoctor >= 0) {
						$scope.gridApi.selection.selectRow($scope.gridOptions.data[iDoctor]);

						$timeout(function() {//scrollToFocus
							$scope.gridApi.core.scrollTo( $scope.gridOptions.data[iDoctor], $scope.gridOptions.columnDefs[0]);
						}, 0);
					}

					$scope.gridApi.selection.on.rowSelectionChanged($scope, function(row) {
//1st cond is new for - Friday for usraels: todo get doctype from server!
if( weekday == 5 && row.entity.category=='0' || row.entity.weekdays.indexOf(weekday) >= 0) {
	 var cond = ' is busy';//new
	 
	if(weekday == 5 && row.entity.category=='0') cond = ' is Off for Shabat ';   
	
							userinteraction.show({
								title: 'Confirmation',
								message: 'Doctor '+row.entity.name+cond,
								kind: 'confirm',
								btnTexOk: 'Add',
								btnClassOk: 'btn btn-primary',
								btnTexCancel: 'Cancel',
								btnClassCancel: 'btn btn-link',
								class: 'confirm interaction',//alert-succsess,alert-failed,confirm //promt: 'Default text'
							}, function() {
								nDoctor = row.entity.name;
								$scope.saveDisabled = false;
							});
						} else {
							nDoctor = row.entity.name;
							$scope.saveDisabled = false;
						}
					});
				}, 100);
				$httpDefaultCache.remove(url);
				// console.log('success step', new Date(), url);
			})
			.catch(function(e) {
				$scope.loadingStatus = false;
				console.log(e);
				$httpDefaultCache.remove(url);
				// console.log('failded step', new Date(), url);
			});

		$scope.hstep = 1;
		$scope.mstep = 30;

		if ( angular.isDefined(params.combine) && params.combine !== null ) {
			// console.log(params.combine);
			$scope.isCombine = true;
			$scope.nameCombineHospital1 = getHospitalName(params.combine.hosp1.hid);
			$scope.nameCombineHospital2 = getHospitalName(params.combine.hosp2.hid);

			$scope.startDate  = convertMomentDate(params.combine.hosp1.startdatestamp,false);
			$scope.endDate    = convertMomentDate(params.combine.hosp1.enddatestamp,false);
			$scope.startSplit = angular.copy($scope.endDate);
			$scope.endSplit   = angular.copy($scope.endDate);

			$scope.startCombineDate  = convertMomentDate(params.combine.hosp2.startdatestamp,false);
			$scope.endCombineDate    = convertMomentDate(params.combine.hosp2.enddatestamp,false);
			$scope.startCombineSplit = angular.copy($scope.endCombineDate);
			$scope.endCombineSplit = angular.copy($scope.endCombineDate);

			$scope.timezone = params.combine.hosp1.timezone;
			$scope.timezoneCombine = params.combine.hosp2.timezone;
		} else {
			$scope.isCombine = false;
			$scope.startDate  = convertMomentDate(params.startdatestamp,false);
			$scope.endDate    = convertMomentDate(params.enddatestamp,false);
			$scope.startSplit = angular.copy($scope.endDate);
			$scope.endSplit   = angular.copy($scope.endDate);
			$scope.timezone = params.timezone;
		}

		$scope.nameHospital = getHospitalName(params.hid);
		$scope.shiftDate  = angular.copy($scope.startDate);
		$scope.shiftTitle = (params.title == '' ? $scope.nameHospital + ' shift' :  params.title);//ws $scope.shiftTitle = params.title ;
		$scope.reportTitle = (params.titlerep == '' || params.titlerep == null ?  'Shift work in eICU' : params.titlerep) ;//new David	, was  params.titlerep	
	
		
		$scope.note = angular.copy(params.note) || '';
		$scope.isPrevious = params.previous === '1' ? true : false;

		$scope.showSplit = false;
		$scope.showTitle = true;
		
		//new
		$scope.copymode = false;
			
		$scope.isTraining =  params.training === '1' ? true : false;;//new David		????
			
		switch ( params.mode ) {
			case '2':
				$scope.isDaily = true;
				$scope.isSecondary = false;		
			break;
			case '3':
				$scope.isDaily = false;
				$scope.isSecondary = true;
				//$scope.note = 'Secondary';
			break;	
			default:
				$scope.isDaily = false;
				$scope.isSecondary = false;	
			break;		
		}
		$scope.shiftModeChangeIsSecondary = function() {
				$scope.isDaily = false;
				$scope.isSecondary = !$scope.isSecondary;
				$scope.saveDisabled = false;	
		};
		$scope.shiftModeChangeIsDaily = function() {
				$scope.isDaily = !$scope.isDaily;
				$scope.isSecondary = false;
				$scope.saveDisabled = false;	
		};
		//david
		$scope.shiftModeTraining = function() {			
				$scope.isTraining = !$scope.isTraining;
				console.log('inside',$scope.isTraining);
		};		
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		
		console.log('training:',$scope.isTraining , params.training);
		//wass training:  $scope.isTraining ?   true : false,
		$scope.save = function() {
			var ret = {
				shiftid: params.id,
				split:   $scope.showSplit ? '1' : '0',
				name:    nDoctor,
				title:   $scope.shiftTitle,
				titlerep:  $scope.reportTitle,
				training:  $scope.isTraining ? '1' : '0',
				note:    $scope.note,
				previous: $scope.isPrevious ? '1' : '0',
				combine: $scope.isCombine ? '1' : '0',
				sdate1:  getFormatedDate($scope.startDate),
				edate1:  getFormatedDate($scope.endDate),
				stime1:  getFormatedTime($scope.startDate),
				etime1:  getFormatedTime($scope.endDate),
				sdate2:  $scope.showSplit ? getFormatedDate($scope.startSplit) : '0',
				edate2:  $scope.showSplit ? getFormatedDate($scope.endSplit) : '0',
				stime2:  $scope.showSplit ? getFormatedTime($scope.startSplit) : '0',
				etime2:  $scope.showSplit ? getFormatedTime($scope.endSplit) : '0',
			};
			if ($scope.isCombine) {
				ret.hcid1 = params.combine.hosp1.hid;
				ret.hcid2 = params.combine.hosp2.hid;
				ret.sdate3 = getFormatedDate($scope.startCombineDate);
				ret.edate3 = getFormatedDate($scope.endCombineDate);
				ret.stime3 = getFormatedTime($scope.startCombineDate);
				ret.etime3 = getFormatedTime($scope.endCombineDate);
				ret.sdate4 = $scope.showSplit ? getFormatedDate($scope.startCombineSplit) : '0';
				ret.edate4 = $scope.showSplit ? getFormatedDate($scope.endCombineSplit) : '0';
				ret.stime4 = $scope.showSplit ? getFormatedTime($scope.startCombineSplit) : '0';
				ret.etime4 = $scope.showSplit ? getFormatedTime($scope.endCombineSplit) : '0';
			}
			switch (true) {
				case (   $scope.isDaily === true  &&  $scope.isSecondary === false  ):
					ret.mode = 2;
				break;
				case (   $scope.isDaily ===  false &&  $scope.isSecondary === true  ):
					ret.mode = 3;
				break;	
				default:
					ret.mode = 1;	
				break;	
			}
			// ret.mode = 1;
			if ($scope.isDaily) {
				ret.daily = 'true';
			}
		//	
		//	console.log(values);
			$uibModalInstance.close(ret);
		};

	});


'use strict';

//david new:
/*angular.module('cookiesApp', ['ngCookies'])
   .controller('CookiesController', function ($scope, $window, $cookies) {
            $scope.SetCookies = function () {
                $cookies.put("username", $scope.username);
            };
            $scope.GetCookies = function () {
               console.log('cookies:',$cookies.get('date'));
            };
            $scope.ClearCookies = function () {
                $cookies.remove('username');
            };
        });*/
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}
///////end david
/**
 * @ngdoc function
 * @name dcmApp.controller:HospitalsCtrl
 * @description
 * # HospitalsCtrl
 * Controller of the dcmApp
 */
 angular.module('dcmApp')
	.factory('HospitalsFctr', function($http, $cacheFactory, $uibModal, $state, $timeout, values, cmn, constants, userinteraction, eh) {//
		var scope;
		//
		function ScopeIntit($scope) {			
			
			scope = $scope;
			scope.loadingStatus = false;
			scope.date = values.date || cmn.currentDate();
			scope.calendarEvents = [];
			scope.orCheck = false;
			scope.amounts = [];
			scope.amount1 = [];
			scope.amount2 = [];
			scope.selectAll = false;			
			scope.doctors = [];
			
			scope.doctorsOptions = {
				id: -1,
				index: 0,
				list: [{id:'-1',name:'Assign Hospital Only'}, {id:'0',name:'Assign Doctor Popup'}]
			};

			scope.sender = 'hospital';
			scope.mode = 'view';
			scope.hollidays = true;
			scope.timezoneList = {};
			scope.typeShiftModeOptions = {
				list: [
					{id:'1',name:'Night Shift'},
					{id:'2',name:'Day Shift'},
					{id:'3',name:'Secondary'}
				]
			};
			scope.typeShiftModeOptions.id = scope.typeShiftModeOptions.list[0].id;
			scope.typeShiftModeOptions.index = 0;
			
			scope.sidebarList = [];
			scope.selectList = {};
			scope.filterby = [];
			scope.filterbydeleted = false;
			scope.copymode = false;//new
			// scope.openShiftDialogFlag = false;
			//
			/*************************/
			// NEW if coming from flip program:
			//$timeout(function () {
				if(getCookie('date')){
					var m=getCookie('date').substring(5, 7);				
					var y=getCookie('date').substring(0, 4); 
					console.log('getCookie: m-y',m,y);
					m = parseInt(m);
					scope.date = {month: m, year: y};
					scope.mode = 'edit';
				}	
			//}, 500);			
			
									
			var $httpDefaultCache, url;
			if (angular.isArray(values.hospitals) && values.hospitals.length === 0 && angular.isArray(values.doctors) && values.doctors.length === 0) {
				//
				scope.loadingStatus = true;
				$httpDefaultCache = $cacheFactory.get('$http');
				url = constants.basePath + 'api/initdata.php';
				// console.log('initdata', new Date());
				$http({
					url: url,
					method: 'GET',
					cache: false
				})
				.then(function(response) {
					values.hospitals = response.data[0];
					values.hospitalEventStyle = values.hospitalEventStyle.concat(response.data[1]);
					values.doctors = response.data[2];
					values.doctorEventStyle = values.hospitalEventStyle.concat(response.data[3]);
					values.mixed = response.data[4];
					
					angular.forEach(values.doctors, function(item) {
						if (item.deleted === 0 && item.name !== '?') {
							scope.doctorsOptions.list.push({
								id: item.id,
								name: item.name,
							});
						}
					});
					// console.log(scope.doctorsOptions);
					
					scope.sidebarList = values.hospitals;
					scope.filterby = cmn.filterby(values.doctors);
					scope.selectList = {
						id: values.hospitals.length ? values.hospitals[0].id : 0,
						index: 0,
						list: values.hospitals
					};
					// 
					
					
		 // New Feature - read from Local, also added only for coming from flip tool .php
                     const flipStr = localStorage.getItem('flipStorage') || '{"hospitals":[],"doctors":[]}';
                     const flipObj = JSON.parse(flipStr);
				//	 console.log('initdata LOCAl flipStr', flipStr,document.referrer,document.referrer.indexOf('flip'));
			//ALSO or BACK FROM COPY RELOAD:
			if (document.referrer != undefined && document.referrer.indexOf('flip') >-1 || getCookie('copy_shift') ){	 
					 if(flipObj.hospitals!= undefined)
                        scope.selectList.list.forEach(function (item) {
                            if (flipObj.hospitals.indexOf(item.id) > -1) {
                                item.active = true;
                            }
                        });
						 
					if(flipObj.doctors!= undefined)
                        scope.filterby.forEach(function (item) {
                            if (flipObj.doctors.indexOf(item.id) > -1) {
                                item.checked = true;
                            }
                        });
						
				if(getCookie('copy_shift')){
					scope.setCookie('copy_shift', '', 0);//unset
					console.log('stopped copy');
					scope.copymode = false;		
					scope.mode = 'edit';
				}
			}
					
					
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
				})
				.catch(function () {
					scope.loadingStatus = false;
					userinteraction.show({
						message: 'Cannot load init data',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-danger',
							class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
					}, null);
					// console.log(e);
					// console.log('initdata failed', new Date());
					$httpDefaultCache.remove(url);
					return false;
				});
			} else {
				
				scope.sidebarList = values.hospitals;
				scope.filterby = cmn.filterby(values.doctors);
				scope.selectList = {
					id: values.hospitals.length ? values.hospitals[0].id : 0,
					index: 0,
					list: values.hospitals
				};
			}
			//
			if (angular.isUndefined(values.timezone)) {
				//
				scope.loadingStatus = true;
				$httpDefaultCache = $cacheFactory.get('$http');
				url = constants.basePath + 'api/gettimezones.php';
				// console.log('initial step', new Date(), url);			
				$http({
					url: url,
					method: 'GET',
					cache: false
				})
				.then(function(response) {
					values.timezone = response.data;
					if (angular.isArray(response.data) && response.data.length) {
						values.timezone = {
							id: 0,
							index: 0,
							list: response.data//[{id:1,name:'Chicago'}, {id:2,name:'Phoenix'}, {id:3,name:'New-York'}]
						};
						scope.timezoneList = values.timezone;
					} else {
						values.timezone = {};
					}
					scope.loadingStatus = false;
					// console.log('success step', new Date(), url);
					$httpDefaultCache.remove(url);
				})
				.catch(function () {
					scope.loadingStatus = false;
					userinteraction.show({
						message: 'Cannot loadtimezone',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-danger',
							class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
					}, null);
					// console.log(e);
					// console.log('failded step', new Date(), url);
					$httpDefaultCache.remove(url);
					return false;
				});
			} else {
				scope.timezoneList = values.timezone;
			}
			//
			scope.report = function() {
				if (angular.isUndefined(scope.selectList.id)) {
					return;
				}
				//
				var url = constants.basePath + 'api/hospital_report.php';
				url += '?month=' + scope.date.month;
				url += '&year='  + scope.date.year;
				url += '&hid='   + scope.selectList.id;
				//console.log(url);
				window.open(url, '_blank');
			};
			//
			scope.toogleCheckOr = function() {
				scope.orCheck = !scope.orCheck;
			};
			//
			scope.upload = function(all) {
				scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/write_google.php';
				// console.log('initial step', new Date(), url);				
				return $http({
					url: url,
					method: 'GET',
					cache: false,
					params: {
						month: scope.date.month,
						year: scope.date.year,
						hid: all ? 0 : scope.selectList.id
					}})
				.then(function() {
					scope.loadingStatus = false;
					// console.log('success step', new Date(), url);
					$httpDefaultCache.remove(url);
					userinteraction.show({
						message: 'Upload succeeded',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-success',
							class: 'alert-succsess interaction',//alert-succsess,alert-failed,confirm
					}, null);
					getHospitalEventsList().then(function(data) {
							scope.calendarEvents = data.calendar;//todo add amounts
							scope.amounts = cmn.getAmountList(scope.sidebarList, data, 'hospital');
					});
				})
				.catch(function () {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					userinteraction.show({
						message: 'Upload failed',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-danger',
							class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
						}, null);
					// console.log(e);
					// console.log('failded step', new Date(), url);
					return false;
				});
			};
			//
			scope.download = function(all) {
				scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/download_shifts.php';
				// console.log('initial step', new Date(), url);
				return $http({
					url: url,
					method: 'GET',
					cache: false,
					params: {
						month: scope.date.month,
						year: scope.date.year,
						hid: all ? 0 : scope.selectList.id
					}})
				.then(function() {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					// console.log('success step', new Date(), url);
					userinteraction.show({
						message: 'Download succeeded',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-success',
							class: 'alert-succsess interaction',//alert-succsess,alert-failed,confirm
						}, null);
					updateViewData();
				})
				.catch(function () {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					userinteraction.show({
						message: 'Download failed',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-danger',
							class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
						}, null);
					// console.log(e);
					// console.log('failded step', new Date(), url);
					return false;
				});
			};
			//
			// scope.deleteMonth = function() {
			// 	console.log('deleteMonth()');
			// 	console.log(this);
			// };
			scope.undo = function() {
				scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/undo.php';
				// console.log('initial step', new Date(), url);
				return $http({
					url: url,
					method: 'GET',
					cache: false,
					params: {
						month: scope.date.month,
						year: scope.date.year,
						hid: scope.selectList.id
					}})
				.then(function() {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					// console.log('success step', new Date(), url);
					userinteraction.show({
						message: 'Undo succeeded',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-success',
							class: 'alert-succsess interaction',//alert-succsess,alert-failed,confirm
						}, null);
					updateViewData();
				})
				.catch(function () {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					userinteraction.show({
						message: 'Undo failed',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-danger',
							class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
						}, null);
					// console.log(e);
					// console.log('failded step', new Date(), url);
					return false;
				});
			};
			//
			scope.statego = function() {
				values.date = scope.date;
				$state.go('doctors');
			};
			//
			scope.permanent = function(all) {
				//scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/get_snapshot.php';
				//new: first confirm it!
				userinteraction.show({
					title: 'Confirmation',
					message: 'Are you sure to Download from the permanent DB table ??',
					kind: 'confirm',
					btnTexOk: 'Cancel',
					btnClassOk: 'btn btn-warning',
					btnTexCancel: 'Yes',
					btnClassCancel: 'btn btn-primary',
					class: 'confirm interaction',//alert-succsess,alert-failed,confirm //promt: 'Default text'
				}, function() {
					return;
				}, function() {				
				
				
				return $http({
					url: url,
					method: 'GET',
					cache: false,
					params: {
						month: scope.date.month,
						year: scope.date.year,
						hid: all ? 0 : scope.selectList.id
					}})
				.then(function() {
					//
					$httpDefaultCache.remove(url);
					// console.log('success step', new Date(), url);
					updateViewData();
					userinteraction.show({
						message: 'Download Permanent succeeded',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-success',
							class: 'alert-succsess interaction',//alert-succsess,alert-failed,confirm
					}, null);
				})
				.catch(function () {
				//???	scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					// console.log('failded step', new Date(), url);
					userinteraction.show({
						message: 'Download Permanent failed',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-danger',
							class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
						}, null);
					// console.log(e);
					//
					return false;
				});
				});
			};
			//
			scope.calendarReport = function() {
				var url = constants.basePath + 'api/calendar_report.php';
				url += '?month=' + scope.date.month;
				url += '&year=' + scope.date.year;
				url += '&hid=' + cmn.getSidebarActives(scope.sidebarList, (scope.mode==='edit')?scope.selectList.id:'');
				url += '&did=' + cmn.getFilters(scope.filterby, scope.filterbydeleted);
				url += '&timezone='  + scope.timezoneList.id;
				//
				window.open(url, '_blank');
			};
			//New: admin/history.php?hid=12&month=2&year=2018
            scope.showHistory = function() {
				var url = constants.basePath + 'admin/history.php';
                                url += '?hid=' + cmn.getSidebarActives(scope.sidebarList, (scope.mode==='edit')?scope.selectList.id:'');
				url += '&month=' + scope.date.month;
				url += '&year=' + scope.date.year+ '&did=' + cmn.getFilters(scope.filterby, scope.filterbydeleted);//todo  did
				window.open(url, '_blank');
			};
			
			//new:
            scope.alertsBatch = function() {
				var url = constants.basePath + 'admin/alerts_bat.php';//?month=4&year=2017'; 
                                url += '?month=' + scope.date.month;
				url += '&year=' + scope.date.year;
                                var dids = cmn.getFilters(scope.filterby, scope.filterbydeleted);
                                if(dids==undefined || dids != false)
                                  url += '&did=' + dids;				
				window.open(url, '_blank');
			};
			//New: admin/history.php?hid=12&month=2&year=2018
            scope.showPlanning = function() {
				var url = constants.basePath + 'reports/teken.php';                               
				url += '?day=' + scope.date.year+'-' + scope.date.month+'-01';
				console.log(url);
				window.open(url, '_blank');
			};
			
			scope.openMailDialog = function() {
				// console.log(scope);
				var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'views/maildialog.html',
					controller: 'MailDialogCtrl',
					windowClass: 'edit-shift-dialog',
					resolve: {
						params: function () {
							return {
								month: scope.date.month,
								year: scope.date.year,
								hid: cmn.getSidebarActives(scope.sidebarList, (scope.mode==='edit')?scope.selectList.id:''),
								did: cmn.getFilters(scope.filterby, scope.filterbydeleted),
								// timezone: scope.timezoneList.name
								timezone: scope.timezoneList.id
							};
							// return scope.date;
						}
					}
				});
				modalInstance.result.then(function () {}, null);
			};
			//new
			scope.copyShiftMode = function(shift) {
				  console.log(shift);
			};
		}
		//
		function getHospitalEventsList() {
			//
			scope.loadingStatus = true;
			//console.log(scope);
			/*
			var doctors_list_store = [];
			(scope.filterby || []).forEach(function(item) {
				if (item.checked) {
					doctors_list_store.push(item.id);
				}
			});
			//console.log(doctors_list_store);
			var hospitals_list_store = [];
			(scope.selectList.list || []).forEach(function(item) {
				if (item.active) {
					hospitals_list_store.push(item.id);
				}
			});

			if (hospitals_list_store.indexOf(scope.selectList.id) === -1) {
				hospitals_list_store.push(scope.selectList.id);
			}
			//console.log(hospitals_list_store);			
			
			var json_store = JSON.stringify({
				hospitals: hospitals_list_store,
				doctors: doctors_list_store
			});
			//console.log(json_store);
			
			localStorage.setItem('flip_filter', json_store);
			*/
			var ids = cmn.getSidebarActives(scope.sidebarList, (scope.mode==='edit')?scope.selectList.id:'');
			var filters = cmn.getFilters(scope.filterby, scope.filterbydeleted);
			//
			var $httpDefaultCache = $cacheFactory.get('$http');
			var url = constants.basePath + 'api/getcalendardata.php';
			// console.log('initial step', new Date(), url);
			return $http({
				url: url,
				method: 'GET',
				cache: false,
				params: {
					month: scope.date.month,
					year: scope.date.year,
					orcheck: scope.orCheck ? 1 : 0,
					hid: ids,
					filter: filters
				}})
			.then(function(response) {
				scope.loadingStatus = false;
				$httpDefaultCache.remove(url);
				// // console.log('success step', new Date(), url);
				return response.data;
			})
			.catch(function () {
				// console.log(e);
				scope.loadingStatus = false;
				$httpDefaultCache.remove(url);
				// console.log('failded step', new Date(), url);
				return false;
			});
		}
		//
		function openShiftDialog(shift) {
			if (scope.doctorsOptions.index > 1) {
				shift.did = scope.doctorsOptions.list[ scope.doctorsOptions.index ].id;
				shift.name = scope.doctorsOptions.list[ scope.doctorsOptions.index ].name;
				scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/editshift_alerts.php';
				return $http({
					url: url,
					method: 'GET',
					cache: false,
					params: angular.copy(shift)
				})
				.then(function() {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					updateViewData();
				})
				.catch(function (e) {
					scope.loadingStatus = false;
					eh.show(e.status, e.data, scope);
					return false;
				});
			}
			
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'views/editshiftdialog.html',
				controller: 'EditShiftCtrl',
				windowClass: 'edit-shift-dialog',
				resolve: {
					params: function () {
						return shift;
					}
				}
			});
			//
			modalInstance.result.then(function (data) {
				scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/editshift_alerts.php';
				return $http({
					url: url,
					method: 'GET',
					cache: false,
					params: data
				})
				.then(function() {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					updateViewData();
				})
				.catch(function (e) {
					scope.loadingStatus = false;
					eh.show(e.status, e.data, scope);
					return false;
				});
			}, null);
		}
		//
		function forceShiftDialog(shift) {
			var modalInstance = $uibModal.open({
				animation: true,
				templateUrl: 'views/editshiftdialog.html',
				controller: 'EditShiftCtrl',
				windowClass: 'edit-shift-dialog',
				resolve: {
					params: function () {
						return shift;
					}
				}
			});
			//
			modalInstance.result.then(function (data) {
				scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/editshift_alerts.php';
				return $http({
					url: url,
					method: 'GET',
					cache: false,
					params: data
				})
				.then(function() {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					updateViewData();
				})
				.catch(function (e) {
					scope.loadingStatus = false;
					eh.show(e.status, e.data, scope);
					return false;
				});
			}, null);
		}
	
		function addShift(day) {
			scope.loadingStatus = true;
			var $httpDefaultCache = $cacheFactory.get('$http');
			var url = constants.basePath + 'api/addshift.php';
			// console.log('initial step', new Date(), url);
			$http({
				url: url,
				method: 'GET',
				cache: false,
				params: {
					date: day.fdate,
					name: '',
					stime: '',
					etime: '',
					hid: scope.selectList.id,
					mode: scope.typeShiftModeOptions.id
				}})
			.then(function(resp) {
				scope.loadingStatus = false;
				$httpDefaultCache.remove(url);
				updateViewData( ( scope.doctorsOptions.index >= 1) ? function() {
					openShiftDialog(resp.data.item);
				} : null);
			})
			.catch(function(e) {
				scope.loadingStatus = false;
				$httpDefaultCache.remove(url);
				// console.log('failded step', new Date(), url);
				// console.log(e);
				// switch(e.errorCode) {
				// 	case 128:
				// 		break;
				// 	case 250:
				// 		break;
				// }
				// userinteraction.show({
				// 	title: 'Confirmation',
				// 	message: e.data,
				// 	kind: 'confirm',
				// 	btnTexOk: 'Add',
				// 	btnClassOk: 'btn btn-primary',
				// 	btnTexCancel: 'Cancel',
				// 	btnClassCancel: 'btn btn-link',
				// 	class: 'confirm interaction',//alert-succsess,alert-failed,confirm //promt: 'Default text'
				// }, function() {
				// 	nDoctor = row.entity.name;
				// 	$scope.saveDisabled = false;
				// });
				userinteraction.show({
					message: e.data,
					kind: 'alert',
					btnTexCancel: 'Close',
					btnClassCancel: 'btn btn-danger',
						class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
					}, null);
			});
		}
		//
		function removeShift(shift) {
			scope.loadingStatus = true;
			var $httpDefaultCache = $cacheFactory.get('$http');
			var url = constants.basePath + 'api/deleteshift.php';
			// console.log('initial step', new Date(), url);
			$http({
				url: url,
				method: 'GET',
				cache: false,
				params: {
					id: shift.id,
				}})
			.then(function() {
				scope.loadingStatus = false;
				$httpDefaultCache.remove(url);
				// console.log('success step', new Date(), url);
				updateViewData();
			})
			.catch(function() {
				scope.loadingStatus = false;
				$httpDefaultCache.remove(url);
			});
		}
		//
		function updateViewData(callback) {//
	
			
			getHospitalEventsList().then(function(data) {
				 console.log('debug',data);
				scope.calendarEvents = data.calendar;
				scope.amount1 = data.amount1;//Math.round( data.amount1.hours_full/12 ).toFixed(2);//bug NEW 22.4.18 data.amount1;
				scope.amount2 = data.amount2;
				if ( angular.isFunction(callback) ) {
					callback();
				}
			});
		}
		//insertDefault
		function clearAllShifts(date, hid) {
			var confirm = window.confirm('Clear default?');
			if (confirm === true) {
				scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/action.php';
				$http({
					url: url,
					method: 'GET',
					cache: false,
					params: {
						hid: hid,
						month: date.month,
						year: date.year,
		
						do: 'deleteall'
					}})
				.then(function() {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					// console.log('success step', new Date(), url);
					updateViewData();
				})
				.catch(function() {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					// console.log('failded step', new Date(), url);
					// console.log(e);
				});
			}
		}
		function insertDefaultsShifts(date, hid) {
			var confirm = window.confirm('Insert default?');
			if (confirm === true) {
				scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/action.php';
				$http({
					url: url,
					method: 'GET',
					cache: false,
					params: {
						hid: hid,
						month: date.month,
						year: date.year,
						do: 'insertdefault'
					}})
				.then(function() {//resp
					// console.log(resp);
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
					// console.log('success step', new Date(), url);
					updateViewData();
				})
				.catch(function() {
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
				
					updateViewData();
				});
			}
		}
		
		function copyShiftMode(shift){
			$timeout(function() {
				if(getCookie('copy_shift')){
					//moved to refresh setCookie('copy_shift', shift.id, 0);//unset
					//console.log('stopped copy');
					//scope.copymode = false;					
					scope.backToNormalEdit();//new
				}else{					
					scope.copymode = true;
					scope.setCookie('copy_shift', shift.id, 10);
					console.log('started copy');
					scope.$emit('WRITE_FLIP');///new
				}
				
				
			},50);
		}	//new
		return {
			init: ScopeIntit,
			getHospitalEventsList: getHospitalEventsList,
			openShiftDialog: openShiftDialog,
			forceShiftDialog: forceShiftDialog,
			addShift: addShift,
			removeShift: removeShift,
			updateViewData: updateViewData,
			clearAllShifts: clearAllShifts,
			insertDefaultsShifts: insertDefaultsShifts,
			copyShiftMode: copyShiftMode 
		}; 		
	})
	.controller('HospitalsCtrl', function ($rootScope, $scope, $timeout, cmn, HospitalsFctr) {
		//New Feature: Save a LOCAl Storage for Flip Shifts Feature
		  $scope.$on('WRITE_FLIP', function () {
            const hospitals = [];
            $scope.selectList.list.forEach(function (item) {
                if (item.active) {
                    hospitals.push(item.id);
                }
            });
            // console.log(hospitals);
            const doctors = [];
            $scope.filterby.forEach(function (item) {
                if (item.checked) {
                    doctors.push(item.id);
                }
            });
            // console.log(doctors);
            const json = JSON.stringify({
                hospitals: hospitals,
                doctors: doctors
            });
            // console.log(json);
            localStorage.setItem('flipStorage', json);
			 console.log('WRITE LOCAl flipStr', json);
        });
		
		HospitalsFctr.init($scope);
		
		$scope.changeMode = function() {
			$scope.mode = ($scope.mode === 'edit' ? 'view' : 'edit');
			// New Feature
            $scope.$emit('WRITE_FLIP');
		};
		//
		$scope.toogleSelectAll = function() {
			$scope.selectAll = $scope.selectAll === false;
			for (var i = 0; i < $scope.sidebarList.length; i++) {
				$scope.sidebarList[i].active = angular.copy($scope.selectAll);
			}
			// New Feature
            $scope.$emit('WRITE_FLIP');
		};
		//
		$scope.invertSelectAll = function() {
			for (var i = 0; i < $scope.sidebarList.length; i++) {
				$scope.sidebarList[i].active = $scope.sidebarList[i].active !== true;
			}
			// New Feature
            $scope.$emit('WRITE_FLIP');
		};
		$scope.insertDefault = function() {
			var date = $scope.date;
			var hid = $scope.selectList.id;
			HospitalsFctr.insertDefaultsShifts(date, hid);
		};
		//
		$scope.clearAllShifts = function() {
			var date = $scope.date;
			var hid = $scope.selectList.id;
			HospitalsFctr.clearAllShifts(date, hid);
		};
		//		
		$scope.toggleShowHollidays = function() {
			$scope.hollidays = ($scope.hollidays === false);
		};
		
		//new
		$scope.setCookie = function(cname, cvalue, exmin) {
			var d = new Date();
			d.setTime(d.getTime() + (exmin*60*1000));
			var expires = "expires="+ d.toUTCString();
			document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
		}
		
		//New  
		$scope.backToNormalEdit = function() {
			//console.log($scope.date);return
			$scope.setCookie('date', $scope.date.year+'-'+$scope.date.month, 10);		
			window.location.reload(); 
		};
				
		$scope.$on('filterbyDisplayDeleted', function() {
			$scope.filterbydeleted = !$scope.filterbydeleted;
		});		
		
		$scope.handlers = {
			selectCalendarItem: function(day) {
				HospitalsFctr.addShift(day);
			},
			selectEventItem: function(item) {
				// console.log(JSON.stringify(item));
				HospitalsFctr.openShiftDialog(item);
			},
			removeEventItem: function(item) {
				HospitalsFctr.removeShift(item);
			},
		};
		$scope.refresh = function() {
			HospitalsFctr.updateViewData();
		};
		$scope.$on('INIT_REFRESH_ViewData', function() {
			HospitalsFctr.updateViewData();
		});
		$rootScope.$on('INIT_FORCE_DIALOG', function(event, shift) {			
			HospitalsFctr.forceShiftDialog(shift);
		});	
//new
		$rootScope.$on('INIT_COPYSHIFT', function(event, shift) {			
			HospitalsFctr.copyShiftMode(shift);
		});	
		
		$rootScope.$on('UPDATE_LOCAL_STORAGE', function(event, shift) {
			var doctors_list_store = [];
			($scope.filterby || []).forEach(function(item) {
				if (item.checked) {
					doctors_list_store.push(item.id);
				}
			});
			
			var hospitals_list_store = [];
			($scope.selectList.list || []).forEach(function(item) {
				if (item.active) {
					hospitals_list_store.push(item.id);
				}
			});

			if (hospitals_list_store.indexOf($scope.selectList.id) === -1) {
				hospitals_list_store.push($scope.selectList.id);
			}
			
			
			var json_store = JSON.stringify({
				hospitals: hospitals_list_store,
				doctors: doctors_list_store
			});
		//	console.log('store',json_store);
			
			localStorage.setItem('flip_filter', json_store);
		});				
		//
		
		$scope.$watch('[date, sidebarList, selectList, mode, filterby, filterbydeleted, orCheck]', function() {
			//
			HospitalsFctr.updateViewData();
		}, true);
		//
			//new
		$scope.copyShiftMode  = function (shift) {
			//todo cookie
			console.log('copyShiftMode step',shift );
			return true;
		};
		//
	});

'use strict';

/**
 * @ngdoc function
 * @name dcmApp.controller:DoctorsCtrl
 * @description
 * # DoctorsCtrl
 * Controller of the dcmApp
 */
angular.module('dcmApp')
	.factory('DoctorsFctr', function($http, $cacheFactory, $state, values, cmn, constants, userinteraction) {
		var scope;
		function scopeIntit($scope) {
			scope = $scope;
			scope.loadingStatus = false;
			scope.date = values.date || cmn.currentDate();
			scope.calendarEvents = [];
			scope.amounts = [];
			scope.amount1 = [];
			scope.amount2 = [];
			scope.selectAll = false;

			scope.sender = 'doctor';
			scope.mode = 'view';
			scope.sidebarList = [];
			scope.selectList = {
				id: ''
			};
			scope.filterby = [];
			//
			if (angular.isArray(values.hospitals) && values.hospitals.length === 0 && angular.isArray(values.doctors) && values.doctors.length === 0) {
				//
				scope.loadingStatus = true;
				var $httpDefaultCache = $cacheFactory.get('$http');
				var url = constants.basePath + 'api/initdata.php';
				$http({
					url: constants.basePath + 'api/initdata.php',
					method: 'GET',
				})
				.then(function(response) {
					values.hospitals = response.data[0];
					values.hospitalEventStyle = values.hospitalEventStyle.concat(response.data[1]);
					values.doctors = response.data[2];
					values.doctorEventStyle = values.hospitalEventStyle.concat(response.data[3]);
					scope.sidebarList = values.doctors;

					scope.filterby = cmn.filterby(values.hospitals);
					scope.selectList = {
						id: values.doctors.length ? values.doctors[0].id : 0,
						index: 0,
						list: values.doctors
					};
					scope.loadingStatus = false;
					$httpDefaultCache.remove(url);
				})
				.catch(function (e) {
					scope.loadingStatus = false;
					userinteraction.show({
						message: 'Cannot load init data',
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-danger',
							class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
					}, null);
				//	console.log(e);
					$httpDefaultCache.remove(url);
					return false;
				});
			} else {
				scope.sidebarList = values.doctors;	
				scope.filterby = cmn.filterby(values.hospitals);
				scope.selectList = {
					id: values.doctors.length ? values.doctors[0].id : 0,
					index: 0,
					list: values.doctors
				};				
			}

			//
			scope.report = function() {
				if (angular.isUndefined(scope.selectList.id)) {
					return;
				}
				//
				var url = constants.basePath + 'api/doctor_report.php';
				url += '?month=' + scope.date.month;
				url += '&year='  + scope.date.year;
				url += '&did='   + scope.selectList.id;
				//console.log(url);
				window.open(url, '_blank');
			};
			//
			scope.statego = function() {
				values.date = scope.date;
				$state.go('hospitals');
			};			
			//
		}
		//
		function getDoctorEventsList() {
			//
			var ids = cmn.getSidebarActives(angular.isDefined(scope.sidebarList) && angular.isArray(scope.sidebarList) && scope.sidebarList.length ? scope.sidebarList : [], scope.selectList.id);
			var filters = cmn.getFilters(scope.filterby);
			// 
	        scope.loadingStatus = true;
		var $httpDefaultCache = $cacheFactory.get('$http');
		var url = constants.basePath + 'api/getcalendardata.php';	        
		return $http({
			url: url,
			method: 'GET',
			params: {
				month: scope.date.month, 
				year: scope.date.year, 
				hid: ids,
				mode: 'docs',
				filter: filters
			}})
		.then(function(response) {
			scope.loadingStatus = false;
			$httpDefaultCache.remove(url);
			return response.data;
		})
		.catch(function (e) {
			console.log(e);
			scope.loadingStatus = false;
			$httpDefaultCache.remove(url);
			return false;
		});
		}
		//		
		return {
			init: scopeIntit,
			getDoctorEventsList: getDoctorEventsList
		};
	})
	.controller('DoctorsCtrl', function ($scope, cmn, DoctorsFctr) {
		DoctorsFctr.init($scope);
		//
		$scope.toogleSelectAll = function() {
			$scope.selectAll = $scope.selectAll === false;
			for (var i = 0; i < $scope.sidebarList.length; i++) {
				$scope.sidebarList[i].active = angular.copy($scope.selectAll);
			}
		};
		//
		$scope.invertSelectAll = function() {
			for (var i = 0; i < $scope.sidebarList.length; i++) {
				$scope.sidebarList[i].active = $scope.sidebarList[i].active !== true;
			}
		};
		//		
		$scope.$watch('[date, sidebarList, selectList, mode, filterby]', function() {
			// console.log('watcher');
			//
			DoctorsFctr.getDoctorEventsList().then(function(data) {
				// console.log(data);
				$scope.calendarEvents = data.calendar;
				$scope.amount1 = data.amount1;
				$scope.amount2 = data.amount2;
				// $scope.amounts = cmn.getAmountList($scope.sidebarList, data, 'doctor');
			});
			//
		}, true);
	});

'use strict';

/**
 * @ngdoc directive
 * @name dcmApp.directive:calendar
 * @description
 * # calendar
 */
function setCalendarEvent(date, resp) {
	// console.log(date, resp);
	var ret = [], found = false;
	for (var i = 0; resp && i < resp.length && !found; i++) {
		if ( resp[i].date === date ) {
			if ( angular.isDefined(resp[i].holidayname) && resp[i].holidayname && angular.isDefined(resp[i].holidaycolor) && resp[i].holidaycolor  ) {			
				ret.holliday = {
					color: resp[i].holidaycolor,
					// color: 'rgba(0, 0, 255, 0.17)',
					// text: 'This is holiday'
					text: resp[i].holidayname
				};				
			}

			ret.shifts = resp[i].shift;
			// console.log(ret);
			found = true;
		}
	}
	//
	// console.log(ret);
	return ret;
}
//
function createCalendarList(date, resp) {
	// console.log(resp);
	var w, i, d, list = [];
	if (angular.isUndefined(date)) {
		return;
	}
	//console.log(date);
	var curDate = new Date();
	curDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate()).valueOf();
	//
	w = new Date(date.year, (date.month-1), 1).getDay();
	//
	for (i = 1; i <= w; i++) {
		d = new Date( date.year, (date.month-1), (1 - i) ).valueOf();
		list.push({
			date: d,
			// shift: setDateShift(d, resp),
			current: false,
			disabled: true
		});
	}
	list = list.reverse();
	//
	var max = new Date(date.year, date.month, 0).getDate();
	for (i = 1; i <= max; i++) {
		var cur = new Date( date.year, (date.month-1), i );
		d = cur.valueOf();
		var fdate = '' + date.year + '-' + ((date.month > 9) ? date.month : '0' + date.month) + '-' + ((i > 9) ? i : '0' + i);
		var events = setCalendarEvent(fdate, resp);
		// console.log(events);
		// console.log('>>>>>>>>>>>>>>>>>>>>>');
		list.push({
			date: d,
			fdate: fdate,
			holliday: events.holliday,
			events: events.shifts,
			current: (d === curDate),
			weekday: cur.getDay(),
			disabled: false
		});
	}
	//
	w = new Date(date.year, date.month, 1).getDay();
	for (i = 1; (i <= 7 - w) && w; i++) {
		d = new Date( date.year, date.month, i ).valueOf();
		list.push({
			date: d,
			// shift: setDateShift(d, resp),
			current: false,
			disabled: true
		});
	}
	//
	var ret = [];
	for (i = 0; i < list.length; i=i+7) {
		ret.push(list.slice(i,i+7));
	}
	return ret;
}
//
angular.module('dcmApp')
	.directive('contextMenu', ['$window', '$rootScope', '$timeout', '$http', '$uibModal', 'constants', function($window, $rootScope, $timeout, $http, $uibModal, constants) {
		return {
			restrict: 'E',
			templateUrl: 'views/contextmenuCalendarItem.html',
			link: function postLink(scope, element) {
				console.log(scope, element);
				scope.date = undefined;
				scope.event = true;
				scope.show = false;
				scope.isOut = false;
				scope.style = {};
				var width, height;
				$timeout(function() {
					width = angular.element(element[0].querySelector('ul')).width() + 12;
					height = angular.element(element[0].querySelector('ul')).height() + 12;
					scope.event = undefined;
				}, 0);
				scope.viewDoctorList = function() {
					var url = constants.basePath + 'api/context1.php?date=' + scope.date;
					$http({
						url: url,
						method: 'GET',
						cache: false
					}).then(function(response) {
						scope.show = false;
						scope.event = undefined;
						scope.style = {};
						var template = '';
						template += '<ul class="list-group"style="min-height: 300px; max-height: 500px; overflow-x: auto;">';
						angular.forEach(response.data, function(value) {
							template += '<li class="list-group-item">'+value+'</li>';
						});
						
						template += '</ul>';
						var modalInstance = $uibModal.open({
							animation: true,
							template: template,
							controller: function() {},
							size: 'sm',
						});
						modalInstance.result.then(function () {}, null);
					}).catch(function (error) {scope.loadingStatus = false;console.log(error);});
				};
				//new for Filps:
				scope.flipDoctorList = function() {
					var url = constants.basePath + 'api/context1.php?date=' + scope.date;
					$http({
						url: url,
						method: 'GET',
						cache: false
					}).then(function(response) {
						scope.show = false;
						scope.event = undefined;
						scope.style = {};
						var template = '';
						template += '<ul id="fliplist" class="list-group"style="min-height: 300px; max-height: 500px; overflow-x: auto;">';
						angular.forEach(response.data, function(value) {
							template += '<li class="list-group-item list-group-item-flip">'+value+'</li>';
						});
						
						template += '</ul>';
						var modalInstance = $uibModal.open({
							animation: true,
							template: template,
							controller: function() {},
							size: 'sm',
						});
						modalInstance.result.then(function () {}, null);
						$timeout(function() {
						
							var lis = document.getElementById("fliplist").getElementsByClassName("list-group-item-flip");
							console.log(document.getElementById("fliplist"))
							for (var i=0; i<lis.length; i++) {
								lis[i].addEventListener('click', doStuff, false);
							}
							function doStuff(e) {
							//	self=this;
							//	$timeout(function() {
									window.location = "http://10.89.0.241/prodnew/planboard.secondary/services/fliptest.php?day="+scope.date+"&dname="+this.innerHTML;
									win = window.open(window.location,"_self" );//,''	,_self	
								/*	win.focus();
									e.stopPropagation();
									e.preventDefault();*/
							//	},100); 								
							}
							return;
						},0); 
							
					}).catch(function (error) {scope.loadingStatus = false;console.log(error);});
				};
				scope.forceShiftDialog = function() {
					$rootScope.$emit('INIT_FORCE_DIALOG', scope.event);
					scope.show = false;
					scope.event = undefined;
					scope.style = {};
				};
				//new Copy TODO
				scope.copyShiftMode = function() {	
					$rootScope.$emit('INIT_COPYSHIFT', scope.event);				
					scope.show = false;
					scope.event = undefined;
					scope.style = {};
					console.log("copy shift started")
				};
				$window.addEventListener('mousedown', function() {
					if (scope.show && scope.isOut) {
						$timeout(function() {
							scope.show = false;
							scope.event = undefined;
							scope.style = {};						
						}, 0);
					}
				});
				$window.addEventListener('mousewheel', function() {
					if (scope.show) {
						$timeout(function() {
							scope.show = false;
							scope.event = undefined;
							scope.style = {};						
						}, 0);
					}
				});				
				$rootScope.$on('INNER_CONTEXTMENU', function(event, context) {
					$timeout(function() {
						scope.isOut = true;
						scope.date = context.date;
						scope.event = context.event;
						scope.style = {};
						if (context.x < angular.element($window).width() - width) {
							scope.style.left = context.x + 'px';
						} else {
							scope.style.left = context.x - width + 'px';
						}
						if (context.y < angular.element($window).height() - height - 24) {
							scope.style.top = context.y + 'px';
						} else {
							scope.style.bottom = -1 * context.y - 24 + 'px';
						}
						scope.show = true;						
					}, 200);
				});	
			}
		};
	}])
	.directive('contextmenuClick', ['$rootScope', function($rootScope) {
		return {
			restrict: 'A',
			link: function postLink(scope, element) {
				element.bind('contextmenu', function(e) {
					e.stopPropagation();
					e.preventDefault();
					$rootScope.$broadcast('INNER_CONTEXTMENU', {
						date: scope.day.fdate,
						event: scope.event,
						x: e.pageX,
						y: e.pageY
					});
				});
			}
		};
	}])
	.directive('calendar', ['values', 'cmn', function (values, cmn) {
		return {
			templateUrl: 'views/calendar.html',
			restrict: 'A',
			scope: {
				date: '=',
				events: '=',
				mode: '=',
				sender: '=',
				hollidays: '=',
				functions: '='
			},
			link: function postLink(scope) {//scope, element, attrs
				scope.monthNames = angular.copy(values.monthNames);
				scope.weekhNames = angular.copy(values.weekShortNames);
				//
				scope.setEventStyle = function(item) {
					// console.log(item);
					var id = (scope.sender==='hospital'?item.hid:item.did);
					var list = values[scope.sender+'EventStyle'];
					if (angular.isUndefined(list)) {
						return {};
					}
					var ret = {
						background: list[0].background,
						color: list[0].color,
						border: list[0].border
					};
					var found = false;
					for (var i = 0; angular.isDefined(list) && i < list.length && !found; i++) {
						if (id === list[i].id) {
							found = true;
							ret = {
								background: list[i].background,
								color: list[i].color,
								border: list[i].border
							};
						}
					}
					return ret;
				};
				//
				scope.setHolidayStyle = function(item) {
					return {
						background:  (scope.hollidays && angular.isDefined(item.holliday) && item.holliday && angular.isDefined(item.holliday.color) && item.holliday.color) ? item.holliday.color : 'inherit'
					};
				};
				//
				scope.decreaseYear = function() {
					scope.date.year--;
				};
				//
				scope.decreaseMonth = function() {
					//
					if (scope.date.month > 1) {
						scope.date.month--;
					} else {
						scope.date.month = 12;
						scope.date.year--;
					}
				};
				//
				scope.setCurrentMonth = function() {
					var date = cmn.currentDate();
					scope.date.month = date.month;
					scope.date.year  = date.year;
				};
				//
				scope.incraceMonth = function() {
					//
					if (scope.date.month < 12) {
						scope.date.month++;
					} else {
						scope.date.month = 1;
						scope.date.year++;
					}
				};
				//
				scope.incraceYear = function() {
					scope.date.year++;
				};
				//
				scope.selectCalendarItem = function(item) {
					if (angular.isDefined(scope.functions.selectCalendarItem)) {
						scope.functions.selectCalendarItem(item);
					}
				};
				//
				scope.selectEventItem = function(item, event) {
					event.stopPropagation();
					if (angular.isDefined(scope.functions.selectEventItem)) {
						scope.functions.selectEventItem(item);
					}
				};
				//
				scope.removeEventItem = function(item, event) {
					event.stopPropagation();
					if (angular.isDefined(scope.functions.removeEventItem)) {
						scope.functions.removeEventItem(item);
					}
				};
				//
				scope.$watch('events', function() {
					//
					scope.list = createCalendarList(scope.date, scope.events);
					//
				});
			}
		};
	}]);

'use strict';

/**
 * @ngdoc directive
 * @name dcmApp.directive:multiselect
 * @description
 * # multiselect
 */
angular.module('dcmApp')
	.directive('multiselect', ['$rootScope', 'values', function ($rootScope, values) {
			return {
				templateUrl: 'views/multiselect.html',
				restrict: 'A',
				scope: {
					list: '=',
					amount: '=',
					sender: '=',
					selected: '=',
					mode: '='
				},
				link: function postLink(scope) {//scope, element, attrs
									//
					scope.listAmounts = [];
					scope.filterbyCheckList = values.mixed;
					console.log( angular.copy(scope.list));
					scope.selectItem = function(item) {
						item.active = item.active!==true;
						// New Feature
                        scope.$emit('WRITE_FLIP');
					};
					//new
					scope.getTotalAmountBilled = function() {	
						var ret = 0;
						for (var i = 0; scope.amount &&  i < scope.amount.length; i++) {
							ret += scope.amount[i].billed_hours;
						}
						
						return ret.toFixed(2) ;
					};
					//
					scope.getTotalAmount = function() {
						var ret = 0;
						for (var i = 0; scope.amount &&  i < scope.amount.length; i++) {
							ret += scope.amount[i].shifts;
						}
						return ret.toFixed(2);
					};
					//
					scope.getTotalHours = function() {
						//
						var ret = 0;
						for (var i = 0; scope.amount &&  i < scope.amount.length; i++) {
							ret += scope.amount[i].hours;
						}
						return ret.toFixed(2);
					};
					//
					
					scope.filterbyToggleCheck = function() {
						if (scope.list.length === 0) {return;}
						var concatArr = [];
						angular.forEach(scope.filterbyCheckList, function(value ) {
							if (value.check) {
								angular.forEach(value.doctors, function(vID ) {
									if (concatArr.indexOf(vID) < 0) {
										concatArr.push(vID);	
									}
								});
							}
						});
						$rootScope.$broadcast('INNER_MSELECT_FILTERBY_BC', concatArr);
						$rootScope.$broadcast('UPDATE_LOCAL_STORAGE');
					};
					scope.$watch('amount', function() {
						//
						scope.listAmounts = angular.copy(scope.list);
						if (angular.isArray(scope.listAmounts) && scope.listAmounts.length && angular.isArray(scope.amount) && scope.amount.length)  {
							var styles = values[scope.sender+'EventStyle'] || [];
							angular.forEach(scope.listAmounts, function(item) {
								item.style = null;
								item.shifts = 0;
								angular.forEach(scope.amount, function(amount) {
									if (amount.id === item.id && amount.shifts !== 0) {
										item.shifts = amount.shifts;
										item.hours = amount.hours;
										item.hours_full = amount.hours_full;//david
										item.billed_hours = amount.billed_hours;//david
										if (styles.length) {
											item.style = {
												background: styles[0].background,
												border: styles[0].border,
												color: styles[0].color
											};
											angular.forEach(styles, function(style) {
												if (style.id ===  item.id) {
													item.style = {
														background: style.background,
														border: style.border,
														color: style.color
													};													
												}
											});
										}
									}
								});
							});
						}
						if ( scope.filterbyCheckList.length === 0 ) {
							scope.filterbyCheckList = values.mixed;
						}
					});
				}
			};
		}]);

'use strict';

/**
 * @ngdoc directive
 * @name dcmApp.directive:dropdown
 * @description
 * # dropdown
 */
angular.module('dcmApp')
  .directive('dropDown', function () {
    return {
      templateUrl: 'views/dropdown.html',
      restrict: 'A',
      scope: {
      	options: '='
      },
      link: function postLink(scope) {//scope, element, attrs
        scope.selectItem = function(item, indx) {
          scope.options.index = indx;
          scope.options.id = scope.options.list[indx].id;
          console.log(scope.options);
        };
        //
      }
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name dcmApp.directive:checkbox
 * @description
 * # checkbox
 */
angular.module('dcmApp')
  .directive('checkbox', function () {
    return {
      templateUrl: 'views/checkbox.html',
      restrict: 'A',
      replace: true,
      scope: {
      	model: '=',
      	text: '@'
      },
      // link: function postLink(scope) {//scope, element, attrs
      //   element.text('this is the checkbox directive');
      // }
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name dcmApp.values
 * @description
 * # values
 * Value in the dcmApp.
 */
angular.module('dcmApp').value('values', {
	hospitals: [],
	doctors: [],
	hospitalEventStyle: [{'id':'default','background':'#e4e4e4','color':'#171515','border':'solid 1px #555555'}],
	doctorEventStyle: [{'id':'default','background':'#e4e4e4','color':'#171515','border':'solid 1px #555555'}],
	weekShortNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	weekNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	mixed: []
});

'use strict';

/**
 * @ngdoc directive
 * @name dcmApp.directive:timestamp
 * @description
 * # timestamp
 */
angular.module('dcmApp')
	.directive('timestamp', function () {
		return {
			templateUrl: 'views/timestamp.html',
			restrict: 'A',
			scope: {
				datetime: '='
			},
			link: function postLink(scope) {//scope, element, attrs
				// console.log(scope.datetime);
				// scope.date = angular.copy(scope.datetime);
				// scope.time = angular.copy(scope.datetime);
				scope.format = 'MM-dd-yyyy';
				scope.hstep = 1;
				scope.mstep = 30;
				scope.minDate = null;
				scope.maxDate = null;
				scope.isopen = false;

				scope.open = function() {
					scope.isopen = true;
				};

				scope.changedate = function() {
					console.log('changedate');
				};
				//
				//
			}
		};
	});

'use strict';

/**
 * @ngdoc directive
 * @name dcmApp.directive:loading
 * @description
 * # loading
 */
angular.module('dcmApp')
  .directive('loading', function () {
    return {
      templateUrl: 'views/loading.html',
      restrict: 'E',
      replace: true,
      // link: function (scope) {//, element, attr
      //   // scope.$watch('loading', function (val) {
      //   //     if (val) {
      //   //       scope.loadingStatus = 'true';
      //   //     } else {
      //   //       scope.loadingStatus = 'false';
      //   //     } 
      //   // });
      // }
    };
  });

'use strict';

/**
 * @ngdoc directive
 * @name dcmApp.directive:filterby
 * @description
 * # filterby
 */
 angular.module('dcmApp')
 .directive('filterby', function ($rootScope) {
	return {
		templateUrl: 'views/filterby.html',
		restrict: 'A',
		replace: true,
		scope: {
			list: '=',
			amount: '=',
			filterbydeleted: '=',
			handler: '='
		},
			link: function (scope) {//, element, attr
				//
				scope.toggleCheck = false;
				//
				scope.clickToggleCheck = function() {
					scope.toggleCheck = !scope.toggleCheck;
					angular.forEach(scope.list, function(item) {
						item.checked = scope.toggleCheck;
					});
					$rootScope.$broadcast('UPDATE_LOCAL_STORAGE');
					// New Feature
                    scope.$emit('WRITE_FLIP');	
				};
				//
				scope.updateToggleCheck = function() {
					if (angular.isArray(scope.list) && scope.list.length) {
						var checkedCount = 0;
						scope.list.filter(function(item) {
							if (item.checked) {
								checkedCount++;
							}
						});
						//
						scope.toggleCheck = (scope.list.length === checkedCount);						
					} else {
						scope.toggleCheck = false;
					}		
					// New Feature
                    scope.$emit('WRITE_FLIP');					
				};
				//
				scope.clickToggleDisplayDeleted = function(e) {
					e.preventDefault();
					scope.$emit('filterbyDisplayDeleted');
				};
				//
				scope.$watch('amount', function() {
					scope.listAmounts = angular.copy(scope.list);
					//
					if (angular.isArray(scope.listAmounts) && scope.list.length && angular.isArray(scope.amount) && scope.amount.length) {

						angular.forEach(scope.listAmounts, function(item) {
							item.hours = 0;
							angular.forEach(scope.amount, function(amount) {
								console.log('bill',amount.billed_hours);
								if (item.id.toString() === amount.id.toString()) {
									
									item.hours = amount.hours;
									item.hours_full = amount.hours_full;//david
									item.billed_hours = amount.billed_hours;//new
								}
							});
						});
					}
				});
				
				$rootScope.$on('INNER_MSELECT_FILTERBY_BC', function(e, msList) {
					// var fbList = angular.copy(scope.list);
					// angular.forEach(fbList, function(item) {
					angular.forEach(scope.list, function(item) {
						item.checked = msList.indexOf(item.id) >= 0;
						if (   msList.indexOf(item.id) >= 0  ) {
							console.log('aa ok');
						}
					});					
				} );
			}
		};
	});

'use strict';

/**
 * @ngdoc directive
 * @name dcmApp.directive:checkDropList
 * @description
 * # checkdroplist
 */
angular.module('dcmApp')
	.filter('chdrp', function(){ return function(list) {
		var ret = [];
		angular.forEach(list, function(item) {
			if ( item.selected === true ) {
				ret.push(item);
			}
		});
		return ret;
	};})
	.directive('checkDropList', function ($timeout) {
		return {
			templateUrl: 'views/checklist.html',
			restrict: 'A',
			replace: true,
			scope: {
				list: '=',
				text: '@'
			},
			link: function postLink(scope, element) {//scope, element, attrs
				scope.showList = false;
				scope.toggleList = function() {
					scope.showList = !scope.showList;
				};
				//
				console.log(     );

angular.element(element[0].querySelector('.form-control'))
	.bind('blur', function() {
		$timeout(function(){
			scope.showList = false;
		},0);
	});


			}
		};
	});

'use strict';

/**
 * @ngdoc service
 * @name dcmApp.constants
 * @description
 * # constants
 * Constant in the dcmApp.
 */
angular.module('dcmApp')
	.constant('constants', {
		// basePath: planboard.reports/api/addshift.php '
		basePath: '/prodnew/planboard.secondary/'
	});

'use strict';

/**
 * @ngdoc function
 * @name dcmApp.controller:UserinteractionCtrl
 * @description
 * # UserinteractionCtrl
 * Controller of the dcmApp
 */
angular.module('dcmApp')
	.controller('UserInteractionCtrl', function ($scope, $uibModalInstance, params) {
	//console.log(params);
		$scope.message = params.message;
		$scope.kind = params.kind;
		$scope.title = params.title;
		$scope.titlerep = params.titlerep;//new david
		$scope.training = params.training;//new david
		$scope.tOk     = params.btnTexOk || 'OK';
		$scope.btnClassOk = params.btnClassOk;// || 'btn';
		$scope.tCancel = params.btnTexCancel || 'Cancel';
		$scope.btnClassCancel = params.btnClassCancel;
		$scope.promt = params.promt;
		// console.log($scope);
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		//
		$scope.ok = function() {
			$uibModalInstance.close();
		};
	});

'use strict';

/**
 * @ngdoc function
 * @name dcmApp.controller:MailDialogCtrl
 * @description
 * # MailDialogCtrl
 * Controller of the dcmApp
 */
angular.module('dcmApp')
	.filter('mailsend', function() {
		return function(items) {
			var tmp = [];
			angular.forEach(items, function(item) {
				if ( item.checked ) {
					tmp.push( item );
				}
			});
			return tmp;
			// console.log(items);
			// return false;
		};
	})
	.controller('MailDialogCtrl', function ($scope, $http, userinteraction, constants, values, $uibModalInstance, params) {//, params
		//
		function getIds(list) {
			var ret = [];
			angular.forEach(list, function(item) {
				if (item.selected) {
					ret.push(item.id);
				}
			});
			return ret.join();
		}
		// function validation(data) {
		// 	var ret = [];
		// 	if ( data.to.length === 0 ) {
		// 		ret.push('To list empty');
		// 	}
		// 	if ( data.cc.length === 0 ) {
		// 		ret.push('Cc list empty');
		// 	}
		// 	if ( angular.isUndefined( data.subject ) || data.subject.length === 0 ) {
		// 		ret.push('Subject list empty');
		// 	}
		// 	if ( angular.isUndefined( data.message ) || data.message.length === 0 ) {
		// 		ret.push('Message list empty');
		// 	}			
		// 	console.log(ret);
		// 	return ret.length === 0 ? false : ret.join('\n');
		// }
		//
		// console.log(params);
		$scope.doctors = angular.copy(values.doctors);
		$scope.toList = angular.copy(values.doctors);
		// $scope.ccList = angular.copy(values.doctors);

		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
		//
		$scope.ok = function() {
			var data = {
				to: getIds($scope.toList),
				cc: $scope.cc,//getIds($scope.ccList),
				subject: $scope.subject,
				text: $scope.message,
				month: params.month,
				year: params.year,
				hid: params.hid,
				did: params.did,
				timezone: params.timezone
			};
			$http({
				url: constants.basePath + 'api/popupmail.php',
				method: 'GET',
				params: data
			}).then(function(resp) {
				if ( resp.data ) {
					userinteraction.show({
						message: resp.data,
						kind: 'alert',
						btnTexCancel: 'Close',
						btnClassCancel: 'btn btn-danger',
						class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
					}, null);	
				} else {
					$uibModalInstance.close(resp);
				}
			}).catch(function(error) {
				console.log(error);
				userinteraction.show({
					message: 'Server error. See console',
					kind: 'alert',
					btnTexCancel: 'Close',
					btnClassCancel: 'btn btn-danger',
					class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
				}, null);					
			});

			// .catchfinction(error) {
			// 	userinteraction.show({
			// 		message: error,
			// 		kind: 'alert',
			// 		btnTexCancel: 'Close',
			// 		btnClassCancel: 'btn btn-danger',
			// 		class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
			// 	}, null);	
			// });			
			// var notValid = validation(data);
			// if ( notValid === false ) {
			// 	$http({

			// 	})
			// 	console.log(data);				
			// } else {
			// 	userinteraction.show({
			// 		message: notValid,
			// 		kind: 'alert',
			// 		btnTexCancel: 'Close',
			// 		btnClassCancel: 'btn btn-danger',
			// 		class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm
			// 	}, null);				
			// }


			// $uibModalInstance.close(ret);
		};
	});

'use strict';

/**
* @ngdoc function
* @name dcmApp.controller:DoctorsCtrl
* @description
* # DoctorsCtrl
* Controller of the dcmApp
*/
angular.module('dcmApp')
	.controller('CalendarItemContextmenuCtrl', ['$rootScope', '$scope', '$http', '$uibModal', '$uibModalInstance', 'constants', 'params', function ($rootScope, $scope, $http, $uibModal, $uibModalInstance, constants, params) {
		$scope.displayDate = params.date;
		$scope.event = params.event;
		$scope.viewDoctorList = function() {
			var url = constants.basePath + 'api/context1.php?date=' + params.date;
				$http({
					url: url,
					method: 'GET',
					cache: false
				}).then(function(response) {
					var template = '';
					template += '<ul class="list-group"style="min-height: 300px; max-height: 500px; overflow-x: auto;">';
					angular.forEach(response.data, function(value) {
						template += '<li class="list-group-item">'+value+'</li>';
					});
					
					template += '</ul>';
					var modalInstance = $uibModal.open({
						animation: true,
						template: template,
						controller: function() {},
						size: 'sm',
					});
					modalInstance.result.then(function () {}, null);
					$uibModalInstance.close();
				}).catch(function (error) {$scope.loadingStatus = false;console.log(error);});
		};
		$scope.forceShiftDialog = function() {
			$rootScope.$emit('INIT_FORCE_DIALOG', params.event);
			$uibModalInstance.close();
		};
		$scope.onApply = function() {
			$uibModalInstance.close();
		};
	}]);

'use strict';

/**
 * @ngdoc service
 * @name dcmApp.common
 * @description
 * # common
 * Factory in the dcmApp.
 */
angular.module('dcmApp')
  .factory('cmn', function (values) {
    function currentDate() {
      var date = new Date();
      return {
        month: date.getMonth()+1,
        year: date.getFullYear()
      };
    }
    //
    function setEventStyle(id, list) {
      var ret = {};
      if (angular.isUndefined(list)) {
        return ret;
      }
      if (angular.isDefined(list) && list.length) {
        ret = {
          background: list[0].background,
          color: list[0].color,
          border: list[0].border
        };
      }
      var found = false;
      for (var i = 0; angular.isDefined(list) && i < list.length && !found; i++) {
        if (id === list[i].id) {
          found = true;
          ret = {
            background: list[i].background,
            color: list[i].color,
            border: list[i].border
          };
        }
      }
      return ret;
    }
    //
    function getAmountList(list, data, sender) {
      function getAmountById(id, list) {
        var ret = {
          amount: 0,
          hours: 0
        };
        for (var i = 0;angular.isDefined(list) && i < list.length; i++) {
          var shiftList = list[i].shift;
          for (var j = 0; j < shiftList.length; j++) {
            var shiftItem = shiftList[j];
            var shiftId = sender === 'hospital' ? shiftItem.hid : shiftItem.did;
            if (shiftId === id) {
              ret.amount++;
              if (!shiftItem.splited) {
                ret.hours += shiftItem.hours;
              }
            }
          }
        }
        //
        return ret;
      }
      //
      var ret = [];
      //
      for (var i = 0; i < list.length; i++) {
        var id = list[i].id;
        var oAmount = getAmountById(id, data);
        ret.push({
          id: id,
          amount: oAmount.amount,
          hours: oAmount.hours,
          style: setEventStyle(id, values[sender+'EventStyle'])
        });
      }
      //
      return ret;
    }
    //
    function getSidebarActives(list, selected) {
      // console.log(list, selected);
      var ret = selected || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].active === true && list[i].id !== selected) {
          ret += (ret.length?',':'') + list[i].id;
        }
      }
      // console.log(ret);
      // console.log('===================');
      return ret.length ? ret : false;
    }
    //
    function filterby(list) {
      var ret = [];
      for (var i = 0; i < list.length; i++) {
        ret.push({
          id: list[i].id,
          name: list[i].name,
          deleted: list[i].deleted,
          checked: false
        });
      }
      return ret;
    }
    //
    function getFilters(list, display) {
      var arr = [];
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (item.checked && (item.deleted ? display : true) ) {
          arr.push(item.id);
        }
      }
      return arr.length ? arr.join(',') : display;
    }
    //
    return {
      currentDate: currentDate,
      getAmountList: getAmountList,
      setEventStyle: setEventStyle,
      getSidebarActives: getSidebarActives,
      filterby: filterby,
      getFilters: getFilters,
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name dcmApp.userinteraction
 * @description
 * # userinteraction
 * Factory in the dcmApp.
 */
angular.module('dcmApp')//
  .factory('userinteraction', function ($uibModal) {
    function show(data, handler, cancelation) {
      console.log(data, handler);
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'views/userinteraction.html',
          controller: 'UserInteractionCtrl',
          windowClass: data.class,
          resolve: {
            params: function () {
              return data;
            }
          }
        });
        //
        modalInstance.result.then(function () {
          handler();
        }, function() {
          if (angular.isFunction(cancelation)) {
            cancelation();
          }
        });
    } 

    return {
      show: show
    };
  });

'use strict';

/**
 *  Error Handler
 * @ngdoc service
 * @name dcmApp.errorhandler
 * @description
 * # errorhandler
 * Factory in the dcmApp.
 */
 angular.module('dcmApp')
 .factory('eh', ['userinteraction', function (userinteraction) {
 		// Service logic
 		// ...
 		
 		var meaningOfLife = 42;
 		function showAlert(message, type) {
 			var classNames = 'interaction';
 			var classCancel = 'btn ';
 			switch(type) {
 				case 0: classNames += ' alert-failed'; classCancel += 'btn-danger'; break;
 				case 1: classNames += ' alert-succsess'; classCancel += 'btn-success'; break;
 				default: classNames += ' alert-succsess'; classCancel += 'btn-warning'; break;
 			}
 			
 			userinteraction.show({
 				message: message,
 				kind: 'alert',
 				btnTexCancel: 'Close',
 				btnClassCancel: classCancel,
					class: classNames//            'alert-failed interaction',//alert-succsess,alert-failed,confirm
				}, null); 			
 		}
 		var errorHandler = {
 			
 			403 : function() {
				userinteraction.show({
					title: 'Confirmation',
					message: 'Doctor  is busy',
					kind: 'confirm',
					btnTexOk: 'Add',
					btnClassOk: 'btn btn-primary',
					btnTexCancel: 'Cancel',
					btnClassCancel: 'btn btn-link',
					class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm //promt: 'Default text'
				}, function() {
					show(503);
				});
 			},
 			400 : function(message, scope) {
				userinteraction.show({
					title: 'Confirmation',
					message: message,
					kind: 'confirm',
					btnTexOk: 'Undo',
					btnClassOk: 'btn btn-warning',
					btnTexCancel: 'Accept',
					btnClassCancel: 'btn btn-primary',
					class: 'confirm interaction',//alert-succsess,alert-failed,confirm //promt: 'Default text'
				}, function() {
					scope.undo();
				}, function() {
					scope.refresh();
				});
 			},  			
 			500 : function(message, scope) {
				userinteraction.show({
					title: 'Confirmation',
					message: message,
					kind: 'confirm',
					btnTexOk: 'Undo',
					btnClassOk: 'btn btn-warning',
					btnTexCancel: 'Accept',
					btnClassCancel: 'btn btn-link',
					class: 'confirm interaction',//alert-succsess,alert-failed,confirm //promt: 'Default text'
				}, function() {
					scope.undo();
				}, function() {
					scope.refresh();
				});
 			}, 			
 			// 502 : function(message, obj) {
 				
 			// 	// if (angular.isFunction(f)) {
		 	// 	// 	userinteraction.show({
				// 	// title: 'Confirmation',
				// 	// message: 'Doctor  is busy',
				// 	// kind: 'confirm',
				// 	// btnTexOk: 'Add',
				// 	// btnClassOk: 'btn btn-primary',
				// 	// btnTexCancel: 'Cancel',
				// 	// btnClassCancel: 'btn btn-link',
				// 	// class: 'alert-failed interaction',//alert-succsess,alert-failed,confirm //promt: 'Default text'
		 	// 	// 	}, function() {
		 	// 	// 		console.log(f);
		 	// 	// 		f();
		 	// 	// 	});
 			// 	// } else {
 			// 	// 	showAlert( 'Error 503', 1);
 			// 	// }
 			// },
  			503 : function() {
 				showAlert( 'Error 503', 1);
 			},			
 			default: function() {
 				showAlert( 'Cannot find handler', 0);
 			},
 		};
 		function show(er, message, obj) {
 			if ( angular.isNumber(er) && angular.isDefined( errorHandler[er] ) )  {
 				errorHandler[er](message, obj);
 			} else {
 				errorHandler['default']();
 			}
 			// showAlert( 'Cannot load init data...', 1);
 		}
 		
 		// Public API here
 		return {
 			show: show,
 			someMethod: function () {
 				return meaningOfLife;
 			}
 		};
 	}]);
 /*
 

 */
