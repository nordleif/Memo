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
            if (typeof this.onShake !== "undefined" && accelerationChange.x + accelerationChange.y + accelerationChange.z > this.sensitivity) {
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
            //switch (e.detail.page.name) {
            //    case "landscape":
            //        let mySwiper1 = f7App.swiper('.swiper-1', {
            //            pagination: '.swiper-1 .swiper-pagination',
            //            spaceBetween: 50
            //        });
            //        break;
            //}
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
    window.shouldRotateToOrientation = function (degrees) { return true; };
    window.onload = function () { Application.initialize(); };
})(Memo || (Memo = {}));
var Memo;
(function (Memo) {
    "use strict";
    var Card = (function () {
        function Card() {
        }
        return Card;
    })();
    Memo.Card = Card;
    var CardService = (function () {
        function CardService(http, q) {
            this._http = http;
            this._q = q;
        }
        CardService.prototype.deleteCard = function (card) {
            var _this = this;
            return this.internalReadCards().then(function (cards) {
                var found = false;
                for (var i = cards.length; i > 0; i--) {
                    if (cards[i - 1].cardId == card.cardId) {
                        cards.splice(i - 1, 1);
                        break;
                    }
                }
                return cards;
            }).then(function (cards) {
                return _this.internalWriteCard(cards);
            });
        };
        CardService.prototype.getCards = function (topic) {
            var defer = this._q.defer();
            this.internalReadCards().then(function (cards) {
                var result = [];
                for (var i = 0; i < cards.length; i++) {
                    var card = cards[i];
                    if (card.topic == topic)
                        result.push(card);
                }
                defer.resolve(result);
            });
            return defer.promise;
        };
        CardService.prototype.getTopics = function () {
            var _this = this;
            var defer = this._q.defer();
            this.internalReadCards().then(function (cards) {
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
        CardService.prototype.saveCard = function (card) {
            var _this = this;
            return this.internalReadCards().then(function (cards) {
                var found = false;
                for (var i = cards.length; i > 0; i--) {
                    if (cards[i - 1].cardId == card.cardId) {
                        cards[i - 1].topic = card.topic;
                        cards[i - 1].upperText = card.upperText;
                        cards[i - 1].lowerText = card.lowerText;
                        found = true;
                        break;
                    }
                }
                if (!found)
                    cards.push(card);
                return _this.internalWriteCard(cards);
            });
        };
        CardService.prototype.contains = function (array, obj) {
            for (var j = 0; j < array.length; j++) {
                if (array[j] === obj) {
                    return true;
                }
            }
            return false;
        };
        CardService.prototype.internalReadCards = function () {
            var defer = this._q.defer();
            var cards = JSON.parse(localStorage.getItem("memo.cards"));
            if (cards) {
                defer.resolve(cards);
            }
            else {
                this._http.get('cards.json').success(function (data) {
                    cards = data.cards;
                    for (var i = 0; i < cards.length; i++) {
                        cards[i].cardId = Memo.uid.newUid();
                    }
                    defer.resolve(cards);
                });
            }
            return defer.promise;
        };
        CardService.prototype.internalWriteCard = function (cards) {
            var defer = this._q.defer();
            localStorage.setItem("memo.cards", JSON.stringify(cards));
            defer.resolve(undefined);
            return defer.promise;
        };
        CardService.$inject = ["$http", "$q"];
        return CardService;
    })();
    Memo.CardService = CardService;
})(Memo || (Memo = {}));
var Memo;
(function (Memo) {
    "use strict";
    var uid;
    (function (uid_1) {
        function newUid() {
            var d = new Date().getTime();
            var uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uid;
        }
        uid_1.newUid = newUid;
    })(uid = Memo.uid || (Memo.uid = {}));
})(Memo || (Memo = {}));
var Memo;
(function (Memo) {
    "use strict";
    var MemoController = (function () {
        function MemoController(scope, f7App, mainView, accelerationService, cardService, orientationService, vibrateService) {
            var _this = this;
            this._canShake = true;
            this.cards = [];
            this._scope = scope;
            this._f7App = f7App;
            this._mainView = mainView;
            this._accelerationService = accelerationService;
            this._cardService = cardService;
            this._orientationService = orientationService;
            this._vibrateService = vibrateService;
            this.show = (this._orientationService.orientation == Memo.Orientation.Portrait || this._orientationService.orientation == Memo.Orientation.Landscape) ? "upper" : "lower";
            this._scope.$watch(function () { return _this.show; }, function (newValue, oldValue) { return _this.onShowChanged(newValue, oldValue); });
            this._accelerationService.onShake = function () { return _this.onShake(); };
            this._orientationService.onOrientationChange = function (from, to) { return _this.onOrientationChange(from, to); };
            this._cardService.getTopics().then(function (topics) {
                _this.topics = topics;
                _this.viewTopics();
            });
        }
        MemoController.prototype.editCard = function (card) {
            this.card = new CardViewModel(card);
            if (card.show == "lower")
                this.card.turn();
            this._mainView.router.load({ pageName: "editCard" });
        };
        MemoController.prototype.deleteCard = function (card) {
            var _this = this;
            this._cardService.deleteCard(card).then(function () {
                for (var i = _this.cards.length; i > 0; i--) {
                    if (_this.cards[i - 1].cardId == card.cardId) {
                        _this.cards.splice(i - 1, 1);
                    }
                }
                _this._cardService.getTopics().then(function (topics) {
                    _this.topics.length = 0;
                    for (var i = 0; i < topics.length; i++) {
                        _this.topics.push(topics[i]);
                    }
                    if (_this.cards.length == 0) {
                        _this._mainView.router.back();
                    }
                });
            });
        };
        MemoController.prototype.newCard = function () {
            var temp = new Memo.Card();
            temp.cardId = Memo.uid.newUid();
            temp.topic = this.topic;
            this.editCard(new CardViewModel(temp));
        };
        MemoController.prototype.saveCard = function () {
            var _this = this;
            this._cardService.saveCard(this.card).then(function () {
                if (_this.topic == _this.card.topic) {
                    var found = false;
                    for (var i = 0; i < _this.cards.length; i++) {
                        if (_this.card.cardId == _this.cards[i].cardId) {
                            _this.cards[i].upperText = _this.cards[i].show == "upper" ? _this.card.upperText : _this.card.lowerText;
                            _this.cards[i].lowerText = _this.cards[i].show == "lower" ? _this.card.lowerText : _this.card.lowerText;
                            found = true;
                        }
                    }
                    if (!found) {
                        _this.card.show = _this.show;
                        _this.cards.unshift(_this.card);
                    }
                }
                _this._cardService.getTopics().then(function (topics) {
                    _this.topics.length = 0;
                    for (var i = 0; i < topics.length; i++) {
                        _this.topics.push(topics[i]);
                    }
                    _this._mainView.router.back();
                });
            });
        };
        MemoController.prototype.viewCards = function (topic) {
            var _this = this;
            this.safeApply(function () {
                var pageName = "cardsPortrait";
                if (_this._orientationService.orientation == Memo.Orientation.Landscape || _this._orientationService.orientation == Memo.Orientation.LandscapeCounterClockwise)
                    pageName = "cardsLandscape";
                _this.topic = topic;
                _this.cards.length = 0;
                _this._cardService.getCards(topic).then(function (cards) {
                    for (var i = 0; i < cards.length; i++) {
                        var c = cards[i];
                        _this.cards.push(new CardViewModel(cards[i]));
                    }
                    _this.shuffle();
                    _this._mainView.router.load({ pageName: pageName, animatePages: false, pushState: false });
                });
            });
        };
        MemoController.prototype.viewTopics = function () {
            var _this = this;
            this.safeApply(function () {
                _this.cards.length = 0;
                _this.show = "upper";
                _this.topic = undefined;
                _this._cardService.getTopics().then(function (topics) {
                    _this.topics = topics;
                    _this._mainView.router.load({ pageName: "topics", animatePages: false, pushState: false });
                });
            });
        };
        MemoController.prototype.onOrientationChange = function (from, to) {
            var _this = this;
            this.safeApply(function () {
                if (_this._mainView.url != "#cardsPortrait" && _this._mainView.url != "#cardsLandscape")
                    return;
                _this.show = (to == Memo.Orientation.Portrait || to == Memo.Orientation.LandscapeCounterClockwise) ? "upper" : "lower";
                var pageName = (to == Memo.Orientation.Portrait || to == Memo.Orientation.PortraitUpsideDown) ? "cardsPortrait" : "cardsLandscape";
                if (pageName != _this._mainView.url)
                    _this._mainView.router.load({ pageName: pageName, animatePages: false, pushState: false });
            });
        };
        MemoController.prototype.onShake = function () {
            var _this = this;
            this.safeApply(function () {
                if (_this._mainView.url != "#cardsPortrait" && _this._mainView.url != "#cardsLandscape")
                    return;
                if (!_this._canShake)
                    return;
                _this._canShake = false;
                setTimeout(function () { return _this._canShake = true; }, 2000);
                _this._vibrateService.vibrate(2000);
                _this.shuffle();
            });
        };
        MemoController.prototype.onShowChanged = function (newValue, oldValue) {
            var _this = this;
            this.safeApply(function () {
                if (_this._mainView.url != "#cardsPortrait" && _this._mainView.url != "#cardsLandscape")
                    return;
                if (newValue != oldValue) {
                    for (var i = 0; i < _this.cards.length; i++)
                        _this.cards[i].turn();
                }
            });
        };
        MemoController.prototype.safeApply = function (func) {
            (this._scope.$$phase || this._scope.$root.$$phase) ? func() : this._scope.$apply(func);
        };
        MemoController.prototype.shuffle = function () {
            var _this = this;
            this.safeApply(function () {
                var counter = _this.cards.length;
                var temp;
                var index;
                while (counter > 0) {
                    index = Math.floor(Math.random() * counter);
                    counter--;
                    temp = _this.cards[counter];
                    _this.cards[counter] = _this.cards[index];
                    _this.cards[index] = temp;
                }
            });
        };
        MemoController.$inject = ["$scope", "f7App", "mainView", "accelerationService", "cardService", "orientationService", "vibrateService"];
        return MemoController;
    })();
    Memo.MemoController = MemoController;
    var CardViewModel = (function () {
        function CardViewModel(card) {
            this.cardId = card.cardId;
            this.topic = card.topic;
            this.upperText = card.upperText;
            this.lowerText = card.lowerText;
            this.show = "upper";
        }
        CardViewModel.prototype.turn = function () {
            var upperText = this.upperText;
            this.upperText = this.lowerText;
            this.lowerText = upperText;
            this.show = this.show == "upper" ? "lower" : "upper";
        };
        return CardViewModel;
    })();
    Memo.CardViewModel = CardViewModel;
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