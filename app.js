'use strict';

function cooSet(cname, cvalue, exdays) {
    if (exdays == null) exdays = 1;
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function cooGet(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function aready(func) {
    angular.element(document).ready(function () {
        func();
    });
}

var m_config = { VIEW_DEFAULT: 'manager_article' };

/* APP */
angular
    .module('app', ['app.services', 'app.directives'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.when('/', { template: '<div ng-module-controller="moduleCtrl"></div>', controller: PageController });
        $routeProvider.when('/:name', { template: '<div ng-module-controller="moduleCtrl"></div>', controller: PageController });
        $routeProvider.otherwise({ redirectTo: '/' });
        /* configure html5 to get links working. If you don't do this, you URLs will be base.com/#/home rather than base.com/home */
        //$locationProvider.html5Mode(false);//.hashPrefix('!');
        $locationProvider.html5Mode(true).hashPrefix('');
    }])
    .run(function ($rootScope, API) {
        /************************/
        /** Cache Data */
        /* This should now be available in controllers: function abcCtrl = function($scope) { $scope.save = function() { $scope.getCacheAll(); } }; */
        var cacheData = {};
        $rootScope.getCacheAll = function () {
            return cacheData;
        };
        $rootScope.getCache = function (key) {
            // console.log('<#> getCache = ', cacheData);
            return cacheData[key];
        };
        $rootScope.getPara = function (key) {
            return cacheData[key + '.para'];
        };
        $rootScope.getCallback = function (key) {
            return cacheData[key + '.callback'];
        };
        $rootScope.setCache = function (key, value) {
            cacheData[key] = value;
            // console.log('<#> setCache = ', cacheData);
        };
        $rootScope.lookupID = function (value) {
            var key = 'lookup_xxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            value['id'] = key;
            value['mode'] = 'select';
            cacheData[key] = value;
            // console.log('<#> cacheID = ', cacheData);
            return key;
        };
        $rootScope.removeCache = function (key) {
            if (cacheData.hasOwnProperty(key) != null)
                delete cacheData[key];
            //console.log('removeCache + cacheData = ', cacheData);
        };
        $rootScope.regKit = function (key, kitID) {
            var it = cacheData[key];
            var arrayKit = it['kit'];
            if (arrayKit == null) arrayKit = [];
            if (arrayKit.indexOf(kitID) == -1)
                arrayKit.push(kitID);
            it['kit'] = arrayKit;
            cacheData[key] = it;
            //console.log('regKit = ', it);
        };
        /************************/

        /************************/

        API.dashboard_Init();
    });

/* Controllers */
function PageController($scope, API) {
    var moduleCode = API.getModuleCode();
    var controllerName = moduleCode.split('-').join('').split('.').join('') + 'Ctrl';
    $scope.moduleCtrl = controllerName;
    console.log('PageController moduleCode = ' + moduleCode);
}

/* Directives */
angular
    .module('app.directives', [])
    .directive('ngResize', function ($window, $rootScope) {
        return function (scope, element) {
            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return {
                    'h': w.height(),
                    'w': w.width()
                };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;

                scope.resizeClass = function () {
                    var css = 'pc';
                    if (newValue.w < 480)
                        css = 'mobile';
                    else if (newValue.w < 1024)
                        css = 'tablet';

                    $rootScope.device = css;

                    //if (css == 'mobile' && document.getElementById('w2ui-popup') != null) {
                    //    try {
                    //        jQuery().w2popup('min');
                    //        w2popup.resize();
                    //    } catch (err) { }
                    //    setTimeout(function () { try { jQuery().w2popup('max'); w2popup.resize(); } catch (err) { } }, 500);
                    //}

                    return css;
                };
            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });
        }
    })
    .directive('ngModuleController', function ($compile, $window, $http, $routeParams, $timeout, API) {
        var linker = function (scope, element, attr) {
            var code = API.getModuleCode();
            API.module_Load({ code: code, type: '' });
        };
        return {
            restrict: 'A',
            link: linker
        };
    });

/* Services */
angular.module('app.services', [])
.factory('API', function ($rootScope, $compile) {
    var api = {
        module_Callback: function (callbackID, data) {
            if (callbackID != null)
                $rootScope.$broadcast(callbackID, data);
        },
        module_Close: function (moduleID) {
            var pop = document.getElementById('module-' + moduleID);
            if (pop != null) {
                pop.remove();
                var kit = null;
                var it = $rootScope.getCache(moduleID);
                if (it != null) kit = it['kit'];
                //console.log('module close -> clear kit', kit);
                if (kit == null || kit.length > 0) {
                    for (var i = 0; i < kit.length; i++) {
                        var key = kit[i];
                        if (w2ui[key] != null) w2ui[key].destroy();
                        $rootScope.removeCache(moduleID);
                    }
                }
                $rootScope.removeCache(moduleID);
            }
        },
        module_Load: function (paraObj) {
            var moduleCode = paraObj['code'];

            var moduleType = paraObj['type'];
            if (moduleType == null || moduleType == '') moduleType = 'module';
            var moduleMode = paraObj['mode'];
            if (moduleMode == null || moduleMode == '') moduleMode = 'all';

            var backID = paraObj['backID'];
            var paraData = paraObj['para'];
            var backCode = '';
            if (backID != null && backID != null) {
                var backItem = $rootScope.getCache(backID);
                if (backItem != null && backItem['code'] != null)
                    backCode = backItem['code'];
            }

            if (moduleCode == null || moduleCode == '' || moduleCode == 'blank' || moduleCode == 'none') return;

            /** create id modal */
            var moduleID = paraObj['id'];
            if (moduleID == null || moduleID == '') moduleID = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            //var module = { type: moduleType, mode: moduleMode, id: moduleID, code: moduleCode, backID: backID, para: paraData };
            paraObj['type'] = moduleType;
            paraObj['mode'] = moduleMode;
            paraObj['id'] = moduleID;
            paraObj['code'] = moduleCode;
            paraObj['backID'] = backID;
            paraObj['para'] = paraData;
            console.log('///module_Load = ', paraObj);

            var pop = document.createElement('div');
            pop.className = 'module ' + (backCode == '' ? '' : backCode + '_') + moduleCode;
            pop.setAttribute('for', (backCode == '' ? '' : backCode + '_') + moduleCode);
            pop.id = 'module-' + moduleID;
            var element = document.createElement('div');
            element.setAttribute('for', moduleType);
            element.id = moduleID;
            element.className = 'module-controller';
            element.style = 'width:100%;height:100%;';
            pop.appendChild(element);
            $('body').append(pop);
            //var element = document.getElementById('popup');

            var controllerName = moduleCode.split('-').join('').split('.').join('') + 'Ctrl';
            element.setAttribute('ng-controller', controllerName);

            var path = '/view/' + moduleCode + '/';
            $rootScope.PATH = path;

            var js = api.getSynchronous(path + 'js.js');
            if (js == null) {
                //js = 'function ' + controllerID + '($scope) {}';
                console.log('CAN NOT FIND: ', controllerName);
                api.module_Close(moduleCode, []);
                return;
            } else {
                js = js.trim();
                var js_ext =
                ' $scope.$on("' + moduleID + '", function (events, msg_) { ' +
                '     $scope.callback(msg_); ' +
                ' }); ';
                js = js.substring(0, js.length - 1) + js_ext + ' } ';
            }

            var script = document.createElement('script');
            script.setAttribute("type", "text/javascript");
            script.innerHTML = js;
            element.parentElement.appendChild(script);

            //newElement = $compile("<div my-directive='n'></div>")(scope)
            //element.parent().append(newElement)

            var css = api.getSynchronous(path + 'css.css');
            if (css == null) css = '';
            var style = document.createElement('style');
            style.setAttribute("type", "text/css");
            style.innerHTML = css;
            element.parentElement.appendChild(style);

            var temp = ''; //service.getSynchronous(path + 'temp.htm');
            if (temp == null) temp = '';
            element.innerHTML = temp;

            $rootScope.setCache(moduleID, paraObj);

            var _scope = angular.element('#' + moduleID).scope();
            _scope.module = paraObj;
            $compile(element)(_scope);
            //$compile(element)($rootScope);
        },
        module_Render: function (moduleID, componentName, event) {
            if (componentName != null && componentName.length > 0)
                $('#' + moduleID).w2render(componentName);
            if (event != null) setTimeout(event, 333);
        },
        menu_Toggle: function () {
            var moduleID = 'menu';
            var element = document.getElementById('menu');
            if (element.style.display == 'block') {
                element.style.display = 'none';
                return;
            } else
                element.style.display = 'block';

            var controllerID = moduleID.split('-').join('').split('.').join('') + 'Ctrl';
            element.setAttribute('ng-controller', controllerID);

            var path = '/view/' + moduleID + '/';
            $rootScope.PATH = path;
            $rootScope.moduleID = moduleID;

            var js = api.getSynchronous(path + 'js.js');
            if (js == null)
                js = 'function ' + controllerID + '($scope) {}';

            var script = document.createElement('script');
            script.setAttribute("type", "text/javascript");
            script.innerHTML = js;
            element.parentElement.appendChild(script);

            //newElement = $compile("<div my-directive='n'></div>")(scope)
            //element.parent().append(newElement)

            var css = api.getSynchronous(path + 'css.css');
            if (css == null) css = '';
            var style = document.createElement('style');
            style.setAttribute("type", "text/css");
            style.innerHTML = css;
            element.parentElement.appendChild(style);

            var temp = '';//service.getSynchronous(path + 'temp.htm');
            if (temp == null) temp = '';
            element.innerHTML = temp;

            $compile(element)($rootScope);

            jQuery("#menu").show();
        },
        dashboard_Ready: function () {
            ////$('#mainTab').w2render('mainTab');
            ////$('#leftTab').w2render('leftTab');

            w2ui['layout_main'].content('top', w2ui['toolbar_top']);
            //w2ui['layout_main'].content('left', w2ui['grid_left']);
            //w2ui['layout_main'].content('main', w2ui['grid_main']);
            //////w2ui['layout_main'].content('preview', w2ui['grid_preview']);


            ////////w2ui['grid_left'].records = m_page.left.grid;
            ////////w2ui['grid_left'].refresh();
            //////w2ui['grid_preview'].records = m_page.preview.grid;
            //////w2ui['grid_preview'].refresh();

            //////for (var i = 0 ; i < m_page.preview.grid.length; i++)
            //////    w2ui['grid_preview'].expand(i + 1);

            ////////console.log('this is ready state');
            ////////w2ui['grid_left'].expand(2);
            ////////w2ui['grid_left'].expand(3);

            ////////w2ui['grid_preview'].expand(2);
            //api.module_Load('manager_user');
        },
        dashboard_Init: function () {
            /***************************************************/
            $().w2toolbar({
                name: 'toolbar_top',
                style: 'background-color: #ccc !important;',
                items: [
                    {
                        type: 'menu', id: 'menu', caption: 'Menu', icon: 'fa fa-bars', items:
                          [
                            //{ id: 'setting', text: 'Thiết lập', icon: 'fa fa-wrench' },
                            { id: 'change_pass', text: 'Đổi mật khẩu', icon: 'fa fa-key' },
                            { type: 'break' },
                            { id: 'manager_article', text: 'Quản lý bài viết', icon: 'fa fa-file-o' },
                            { id: 'manager_menu', text: 'Quản lý chuyên mục', icon: 'fa fa-bars' },
                            { id: 'manager_user', text: 'Quản lý tài khoản', icon: 'fa fa-user-o' },
                            { id: 'manager_image', text: 'Quản lý hình ảnh', icon: 'fa fa-image' },
                            { type: 'break' },
                            { id: 'theme_home', text: 'Sửa giao diện trang chính', icon: 'fa fa-trello' },
                            { id: 'theme_blog', text: 'Sửa giao diện trang chi tiết', icon: 'fa fa-trello' },
                            { type: 'break' },
                            { id: 'logout', text: 'Thoát', icon: 'fa fa-power-off' },
                          ]
                    },
                    { type: 'spacer' },
                    //{ type: 'menu', id: 'root', caption: '', icon: 'fa fa-user-o' },
                ],
                onClick: function (event) {
                    var id = event.target;
                    if (id.indexOf(':') != -1) id = id.substring(id.indexOf(':') + 1, id.length);
                    switch (id) {
                        case 'root':
                            break;
                        case 'menu':
                            //api.menu_Toggle();
                            break;
                        default:
                            api.module_Load({ code: id });
                    }

                    //console.log(id, event);
                    //////switch (id) {
                    //////    case 'mn_menu':
                    //////        if ($rootScope.device == 'mobile') {
                    //////            w2ui['layout_main'].hide('bottom');
                    //////            w2ui['layout_main'].hide('right');
                    //////        }
                    //////        w2ui['layout_main'].toggle('left', window.instant);
                    //////        break;
                    //////    case 'mn_grammar':
                    //////        w2ui['layout_main'].toggle('bottom', window.instant);
                    //////        break;
                    //////    case 'mn_bookmark':
                    //////        if ($rootScope.device == 'mobile') {
                    //////            w2ui['layout_main'].hide('bottom');
                    //////            w2ui['layout_main'].hide('left');
                    //////        }
                    //////        w2ui['layout_main'].toggle('right', window.instant);
                    //////        break;
                    //////    case 'mn_manager_menu':
                    //////        location.href = '/#/login';
                    //////        break;
                    //////    case 'mn_manager_user':
                    //////        break;
                    //////    case 'mn_edit_theme_home':
                    //////        break;
                    //////    case 'mn_edit_theme_news':
                    //////        break;
                    //////    case 'mn_setting':
                    //////        //location.href = '/login';
                    //////        location.href = '/#/login';
                    //////        //document.getElementById('link').click();
                    //////        break;
                    //////    case 'mn_change_pass':
                    //////        menu_OpenPopup();
                    //////        break;
                    //////    case 'mn_logout':
                    //////        w2confirm('Bạn chắc chắn muốn thoát phiên làm việc?')
                    //////           .yes(function () {
                    //////               //cooSet('userid', '');
                    //////               location.href = '/#/login';
                    //////               //window.location.assign("/#/login");
                    //////           })
                    //////        .no(function () { });
                    //////        break;
                    //////}
                }
            });

            var _leftTab = '<div id="leftPanel"><div id="leftTab"></div><div id="topicTab" class="tab"></div><div id="tagTab" class="tab"></div><div id="listenTab" class="tab"></div><div id="searchTab" class="tab"></div></div>';
            $().w2tabs({
                name: 'leftTab',
                active: 'topicTab',
                tabs: [
                    { id: 'topicTab', caption: 'Topic' },
                    { id: 'tagTab', caption: 'Tag' },
                    { id: 'listenTab', caption: 'Listen' },
                    { id: 'searchTab', caption: 'Search' },
                ],
                onRender: function (event) {
                    event.onComplete = function () {
                        $('#leftPanel .tab').hide();
                        $('#leftPanel #topicTab').show();
                    }
                },
                onClick: function (event) {
                    $('#leftPanel .tab').hide();
                    $('#leftPanel #' + event.target).show();
                }
            });

            var _mainTab = '<div id="mainPanel"><div id="mainTab"></div><div id="contentTab" class="tab"><div id="article"></div></div><div id="mediaTab" class="tab"></div><div id="grammarTab" class="tab"></div><div id="bookmarkTab" class="tab"></div></div>';
            $().w2tabs({
                name: 'mainTab',
                active: 'contentTab',
                tabs: [
                    { id: 'contentTab', caption: 'Article' },
                    { id: 'mediaTab', caption: 'Media' },
                    { id: 'grammarTab', caption: 'Grammar' },
                    { id: 'bookmarkTab', caption: 'BookMark' },
                ],
                onRender: function (event) {
                    event.onComplete = function () {
                        $('#mainPanel .tab').hide();
                        $('#mainPanel #contentTab').show();
                    }
                },
                onClick: function (event) {
                    $('#mainPanel .tab').hide();
                    $('#mainPanel #' + event.target).show();
                }
            });

            var pstyle = 'border: 1px solid #dfdfdf; padding: 0px;';
            $().w2layout({
                name: 'layout_main',
                panels: [
                    { type: 'top', size: 29, resizable: false, style: pstyle },
                    { type: 'left', size: 320, resizable: false, hidden: false, style: '', content: _leftTab },
                    { type: 'main', style: pstyle + 'border-top: 0px;', content: _mainTab },
                    { type: 'preview', size: '70%', resizable: true, hidden: true, style: pstyle, content: 'preview' },
                    { type: 'right', size: 320, resizable: false, hidden: true, style: pstyle, content: 'right' },
                    { type: 'bottom', size: '30%', resizable: false, hidden: true, style: pstyle, content: 'bottom' }
                ]
            });

            $('#layout_main').w2render('layout_main');

            w2ui['layout_main'].on('resize', function (event) {
                if ($rootScope.ready == null || $rootScope.ready == false) {
                    $rootScope.ready = true;
                    api.dashboard_Ready();
                }
            });
            /***************************************************/
        },
        getModuleCode: function () {
            //console.log('document.location.hash = ', document.location.hash);
            var moduleCode = document.location.hash;
            if (moduleCode == '' || moduleCode == '/' || moduleCode == '#/')
                moduleCode = m_config.VIEW_DEFAULT;
            else moduleCode = moduleCode.substring(2);
            return moduleCode;
        },
        checkLink: function (url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, false);  // `false` makes the request synchronous
            request.send(null);

            if (request.status === 200) {
                return true;
            }
            return false;
        },
        getSynchronous: function (url) {
            var request = new XMLHttpRequest();
            request.open('GET', url, false);  // `false` makes the request synchronous
            request.send(null);

            if (request.status === 200) {
                return request.responseText;
            }
            return null;
        },
        popupClose: function (scope) {
            var popupID = scope.popupID;
            if (popupID != null) {
                document.getElementById(popupID).remove();
            }
        },
        popupShow: function (scope, moduleID, data) {
            //var moduleID = 'article-view';

            var parent = scope.$parent;
            if (data != null) {
                for (var key in data) {
                    parent[key] = data[key];
                }
            }

            /** create id modal */
            var id = 'popup-' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            parent.popupID = id;

            var pop = document.createElement('div');
            pop.id = id;
            var element = document.createElement('div');
            element.className = 'popup';
            pop.appendChild(element);
            $('body').append(pop);
            //var element = document.getElementById('popup');

            var controllerID = moduleID.split('-').join('').split('.').join('') + 'Ctrl';

            element.setAttribute('ng-controller', controllerID);

            console.log('goView moduleID = ' + moduleID);
            console.log('goView controllerID = ' + controllerID);

            var path = '/Modules/' + moduleID + '/';
            scope.PATH = path;
            scope.moduleID = moduleID;

            var js = service.getSynchronous(path + 'controller.js');
            if (js == null) {
                js = '';
                element.getAttribute('ng-controller', 'noneCtrl');
                alertShow({ type: 'error', content: 'Cannot find controller: ' + controllerID });
            }

            var script = document.createElement('script');
            script.setAttribute("type", "text/javascript");
            script.innerHTML = js;
            element.parentElement.appendChild(script);

            //newElement = $compile("<div my-directive='n'></div>")(scope)
            //element.parent().append(newElement)

            var css = service.getSynchronous(path + 'css.css');
            if (css == null) css = '';
            var style = document.createElement('style');
            style.setAttribute("type", "text/css");
            style.innerHTML = css;
            element.parentElement.appendChild(style);

            var temp = service.getSynchronous(path + 'temp.htm');
            if (temp == null) temp = '';
            element.innerHTML = temp;

            $compile(element)(parent);

            jQuery("#popup").show();
        }
    };
    return api;
});

/**********************************************************/

function scope(moduleID) {
    return angular.element('#' + moduleID).scope();
}

function push(moduleID, data, afterCloseModule) {
    var $body = angular.element(document.body);
    var $rootScope = $body.injector().get('$rootScope');

    var callbackID = $rootScope.getCallback(moduleID);
    var eleCallbackID = $rootScope.getCache(callbackID);

    $rootScope.$apply(function () {
        $rootScope.$broadcast(eleCallbackID, data);
    });

    if (afterCloseModule == true) {
        var eleID = $rootScope.getCache(moduleID);
        var pop = document.getElementById('module-' + eleID);
        if (pop != null) pop.remove();
    }
}

function module_Load(configID, event) {
    var funcName = 'module_Load';
    var $body = angular.element(document.body);
    var $api = $body.injector().get('API');
    var $rootScope = $body.injector().get('$rootScope');

    var para = null;
    if (configID != null && configID.length > 0)
        para = $rootScope.getCache(configID);
    if (para == null) para = {};

    var moduleID = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    para['id'] = moduleID;

    //console.log('module_Load = id: ' + moduleID, para);
    //console.log('module_Load = event: ' + moduleID, event.target);

    if (event != null) 
        para['backTarget'] = event.target;
     
    if ($api[funcName] != null)  
        $api[funcName](para); 
}

