module Memo {
    "use strict";
    
    declare var Dom7;
    declare var Framework7;
    declare var window;

    let $$: any;
    let f7App: any;
    let mainView: any;

    export module Application {
        export function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
        }

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
            angular.module("ngApp").factory("f7App", () => f7App);
            angular.module("ngApp").factory("mainView", () => mainView);
            angular.module("ngApp").service("accelerationService", AccelerationService);
            angular.module("ngApp").service("cardService", CardService);
            angular.module("ngApp").service("orientationService", OrientationService);
            angular.module("ngApp").service("vibrateService", VibrateService);
            angular.module("ngApp").controller("memoController", MemoController);
            angular.bootstrap(document.body, ['ngApp']);
        }

        function onPause() {

        }

        function onResume() {

        }

        function onNavbarInit(e: any) {

        }

        function onPageBeforeInit(e: any) {
            switch (e.detail.page.name) {
                case "landscape":
                    let mySwiper1 = f7App.swiper('.swiper-1', {
                        pagination: '.swiper-1 .swiper-pagination',
                        spaceBetween: 50
                    });
                    break;
            }
        }

        function onPageInit(e: any) {
            //let $page = angular.element(e.detail.page.container);
            //let $scope = $page.scope();
            //let $compile = $page.injector().get("$compile");
            //$compile($page)($scope);
            //$scope.$digest();
        }

        function onPageBeforeAnimation(e: any) {
            
        }

        function onPageAfterAnimation(e: any) {
            
        }

        function onPageBeforeRemove(e: any) {
            
        }

        function onPageBack(e: any) {
            
        }

        function onPageAfterBack(e: any) {
            
        }
    }

    window.shouldRotateToOrientation = (degrees) => { return true };
    window.onload = () => { Application.initialize() };
}