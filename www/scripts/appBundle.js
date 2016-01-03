var Memo;
(function (Memo) {
    "use strict";
    var AccelerationService = (function () {
        function AccelerationService() {
            var _this = this;
            this.previousAcceleration = new AccelerationChange();
            this.sensitivity = 30;
            navigator.accelerometer.watchAcceleration(function (acceleration) { return _this.onAcceleration(acceleration); }, undefined, { frequency: 300 });
        }
        AccelerationService.prototype.onAcceleration = function (acceleration) {
            var accelerationChange = new AccelerationChange();
            if (this.previousAcceleration.x !== null) {
                accelerationChange.x = Math.abs(this.previousAcceleration.x - acceleration.x);
                accelerationChange.y = Math.abs(this.previousAcceleration.y - acceleration.y);
                accelerationChange.z = Math.abs(this.previousAcceleration.z - acceleration.z);
            }
            this.previousAcceleration = { x: acceleration.x, y: acceleration.y, z: acceleration.z };
            if (typeof this.onShake !== 'undefined' && accelerationChange.x + accelerationChange.y + accelerationChange.z > this.sensitivity) {
                this.onShake();
            }
        };
        return AccelerationService;
    })();
    Memo.AccelerationService = AccelerationService;
    var AccelerationChange = (function () {
        function AccelerationChange() {
        }
        return AccelerationChange;
    })();
})(Memo || (Memo = {}));
var Memo;
(function (Memo) {
    "use strict";
    var $$;
    var f7App;
    var mainView;
    var Application;
    (function (Application) {
        function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
        }
        Application.initialize = initialize;
        function onDeviceReady() {
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);
            $$ = Dom7;
            $$(document).on('navbarInit', onNavbarInit);
            $$(document).on('pageBeforeInit', onPageBeforeInit);
            $$(document).on('pageInit', onPageInit);
            $$(document).on('pageBeforeAnimation', onPageBeforeAnimation);
            $$(document).on('pageAfterAnimation', onPageAfterAnimation);
            $$(document).on('pageBeforeRemove', onPageBeforeRemove);
            $$(document).on('pageBack', onPageBack);
            $$(document).on('pageAfterBack', onPageAfterBack);
            f7App = new Framework7();
            mainView = f7App.addView('.view-main', { domCache: true, dynamicNavbar: true });
            angular.module("ngApp", []);
            angular.module("ngApp").factory("f7App", function () { return f7App; });
            angular.module("ngApp").factory("mainView", function () { return mainView; });
            angular.module("ngApp").service("accelerationService", Memo.AccelerationService);
            angular.module("ngApp").service("cardService", Memo.CardService);
            angular.module("ngApp").service("orientationService", Memo.OrientationService);
            angular.module("ngApp").service("vibrateService", Memo.VibrateService);
            angular.module("ngApp").controller("memoController", Memo.MemoController);
            angular.bootstrap(document.body, ['ngApp']);
        }
        function onPause() {
        }
        function onResume() {
        }
        function onNavbarInit(e) {
        }
        function onPageBeforeInit(e) {
            switch (e.detail.page.name) {
                case "landscape":
                    var mySwiper1 = f7App.swiper('.swiper-1', {
                        pagination: '.swiper-1 .swiper-pagination',
                        spaceBetween: 50
                    });
                    break;
            }
        }
        function onPageInit(e) {
            //let $page = angular.element(e.detail.page.container);
            //let $scope = $page.scope();
            //let $compile = $page.injector().get("$compile");
            //$compile($page)($scope);
            //$scope.$digest();
        }
        function onPageBeforeAnimation(e) {
        }
        function onPageAfterAnimation(e) {
        }
        function onPageBeforeRemove(e) {
        }
        function onPageBack(e) {
        }
        function onPageAfterBack(e) {
        }
    })(Application = Memo.Application || (Memo.Application = {}));
    window.onload = function () {
        Application.initialize();
    };
})(Memo || (Memo = {}));
var Memo;
(function (Memo) {
    "use strict";
    var CardService = (function () {
        function CardService($http, $q) {
            this.$http = $http;
            this.$q = $q;
        }
        CardService.prototype.getCards = function (topic) {
            var defer = this.$q.defer();
            this.$http.get('cards.json').success(function (data) {
                var cards = data.cards;
                var result = [];
                for (var i = 0; i < cards.length; i++) {
                    var card = cards[i];
                    if (card.topic == topic) {
                        result.push(card);
                    }
                }
                defer.resolve(result);
            });
            return defer.promise;
        };
        CardService.prototype.getTopics = function () {
            var _this = this;
            var defer = this.$q.defer();
            this.$http.get('cards.json').success(function (data) {
                var cards = data.cards;
                var result = [];
                for (var i = 0; i < cards.length; i++) {
                    var card = cards[i];
                    var topic = card.topic;
                    if (!_this.contains(result, topic)) {
                        result.push(topic);
                    }
                }
                defer.resolve(result);
            });
            return defer.promise;
        };
        CardService.prototype.contains = function (array, obj) {
            for (var j = 0; j < array.length; j++) {
                if (array[j] === obj) {
                    return true;
                }
            }
            return false;
        };
        CardService.$inject = ["$http", "$q"];
        return CardService;
    })();
    Memo.CardService = CardService;
})(Memo || (Memo = {}));
var Memo;
(function (Memo) {
    "use strict";
    var MemoController = (function () {
        function MemoController($scope, f7App, mainView, accelerationService, cardService, orientationService, vibrateService) {
            var _this = this;
            this.$scope = $scope;
            this.f7App = f7App;
            this.mainView = mainView;
            this.accelerationService = accelerationService;
            this.accelerationService.onShake = function () { return _this.onShake(); };
            this.cardService = cardService;
            this.orientationService = orientationService;
            this.orientationService.onOrientationChange = function (from, to) { return _this.onOrientationChange(from, to); };
            this.vibrateService = vibrateService;
            this.cardService.getTopics().then(function (topics) {
                _this.topics = topics;
                _this.topic = _this.topics.length > 0 ? _this.topics[0] : undefined;
                _this.cardService.getCards(_this.topic).then(function (cards) {
                    _this.cards = cards;
                    _this.card = _this.cards.length > 0 ? cards[0] : undefined;
                    _this.onOrientationChange(Memo.Orientation.Portrait, _this.orientationService.orientation);
                });
            });
        }
        MemoController.prototype.back = function () {
            this.mainView.router.back();
        };
        MemoController.prototype.changeTopic = function (topic) {
            var _this = this;
            this.f7App.closePanel('left');
            this.topic = topic;
            this.cardService.getCards(this.topic).then(function (cards) {
                _this.cards = cards;
            });
        };
        MemoController.prototype.shuffle = function () {
            var array = this.cards;
            var counter = array.length;
            var temp;
            var index;
            while (counter > 0) {
                index = Math.floor(Math.random() * counter);
                counter--;
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }
        };
        MemoController.prototype.onOrientationChange = function (from, to) {
            var _this = this;
            switch (to) {
                case Memo.Orientation.Portrait:
                    this.mainView.router.load({ pageName: "portrait", animatePages: false, pushState: false });
                    break;
                case Memo.Orientation.PortraitUpsideDown:
                    this.mainView.router.load({ pageName: "portrait", animatePages: false, pushState: false });
                    break;
                case Memo.Orientation.Landscape:
                    this.mainView.router.load({ pageName: "landscape", animatePages: false, pushState: false });
                    break;
                case Memo.Orientation.LandscapeCounterClockwise:
                    this.mainView.router.load({ pageName: "landscape", animatePages: false, pushState: false });
                    break;
            }
            this.$scope.$apply(function (scope) {
                _this.turnCards(from, to);
            });
        };
        MemoController.prototype.onShake = function () {
            var _this = this;
            this.vibrateService.vibrate(1000);
            this.$scope.$apply(function (scope) { return _this.shuffle(); });
        };
        MemoController.prototype.turnCards = function (from, to) {
            var turn = false;
            switch (from) {
                case Memo.Orientation.Portrait:
                    turn = to == Memo.Orientation.Landscape || to == Memo.Orientation.PortraitUpsideDown;
                    break;
                case Memo.Orientation.PortraitUpsideDown:
                    turn = to == Memo.Orientation.Landscape || to == Memo.Orientation.Portrait;
                    break;
                case Memo.Orientation.Landscape:
                    turn = to == Memo.Orientation.LandscapeCounterClockwise || to == Memo.Orientation.Portrait;
                    break;
                case Memo.Orientation.LandscapeCounterClockwise:
                    turn = to == Memo.Orientation.Landscape || to == Memo.Orientation.Portrait;
                    break;
            }
            if (!turn)
                return;
            for (var i = 0; i < this.cards.length; i++) {
                var card = this.cards[i];
                var upperText = card.upperText;
                card.upperText = card.lowerText;
                card.lowerText = upperText;
            }
        };
        MemoController.$inject = ["$scope", "f7App", "mainView", "accelerationService", "cardService", "orientationService", "vibrateService"];
        return MemoController;
    })();
    Memo.MemoController = MemoController;
})(Memo || (Memo = {}));
var Memo;
(function (Memo) {
    "use strict";
    var OrientationService = (function () {
        function OrientationService() {
            var _this = this;
            this.orientation = this.GetOrientation();
            window.onorientationchange = function (ev) {
                var from = _this.orientation;
                _this.orientation = _this.GetOrientation();
                if (typeof _this.onOrientationChange !== 'undefined') {
                    _this.onOrientationChange(from, _this.orientation);
                }
            };
            window.onorientationchange(undefined);
        }
        OrientationService.prototype.GetOrientation = function () {
            switch (window.orientation) {
                case 0:
                    // Portrait 
                    return Orientation.Portrait;
                    break;
                case 180:
                    // Portrait (Upside-down)
                    return Orientation.PortraitUpsideDown;
                    break;
                case 90:
                    // Landscape (Clockwise)
                    return Orientation.Landscape;
                    break;
                case -90:
                    // Landscape (Counterclockwise)
                    return Orientation.LandscapeCounterClockwise;
                    break;
            }
        };
        return OrientationService;
    })();
    Memo.OrientationService = OrientationService;
    (function (Orientation) {
        Orientation[Orientation["Portrait"] = 0] = "Portrait";
        Orientation[Orientation["PortraitUpsideDown"] = 1] = "PortraitUpsideDown";
        Orientation[Orientation["Landscape"] = 2] = "Landscape";
        Orientation[Orientation["LandscapeCounterClockwise"] = 3] = "LandscapeCounterClockwise";
    })(Memo.Orientation || (Memo.Orientation = {}));
    var Orientation = Memo.Orientation;
})(Memo || (Memo = {}));
var Memo;
(function (Memo) {
    "use strict";
    var VibrateService = (function () {
        function VibrateService() {
        }
        VibrateService.prototype.vibrate = function (time) {
            navigator.vibrate(time);
        };
        return VibrateService;
    })();
    Memo.VibrateService = VibrateService;
})(Memo || (Memo = {}));
//# sourceMappingURL=appBundle.js.map