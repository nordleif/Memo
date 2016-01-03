module Memo {
    "use strict";
    
    export class MemoController {
        private accelerationService: IAccelerationService;
        private cardService: ICardService;
        private f7App: any;
        private mainView: any;
        private orientationService: OrientationService;
        private $scope: ng.IScope;
        private vibrateService: IVibrateService;
        
        static $inject = ["$scope", "f7App", "mainView", "accelerationService", "cardService", "orientationService", "vibrateService"];
        
        constructor($scope: ng.IScope, f7App: any, mainView: any, accelerationService: IAccelerationService, cardService: ICardService, orientationService: OrientationService, vibrateService : IVibrateService) {
            this.$scope = $scope;
            this.f7App = f7App;
            this.mainView = mainView;
            this.accelerationService = accelerationService;
            this.accelerationService.onShake = () => this.onShake();
            this.cardService = cardService;
            this.orientationService = orientationService;
            this.orientationService.onOrientationChange = (from: Orientation, to: Orientation) => this.onOrientationChange(from, to);
            this.vibrateService = vibrateService;
            
            this.cardService.getTopics().then((topics) => {
                this.topics = topics;
                this.topic = this.topics.length > 0 ? this.topics[0] : undefined;
                this.cardService.getCards(this.topic).then((cards) => {
                    this.cards = cards;
                    this.card = this.cards.length > 0 ? cards[0] : undefined;
                    this.onOrientationChange(Orientation.Portrait, this.orientationService.orientation);
                });
            });
        }

        card: Card;
        
        cards: Card[];

        topic: string;

        topics: string[];

        back(): void {
            this.mainView.router.back();
        }
        
        changeTopic(topic: string) : void {
            this.f7App.closePanel('left');
            this.topic = topic;
            this.cardService.getCards(this.topic).then((cards) => {
                this.cards = cards;
            });
        }
        
        shuffle(): void {
            let array = this.cards;
            let counter: number = array.length;
            let temp: any;
            let index: number;

            while (counter > 0) {
                index = Math.floor(Math.random() * counter);
                counter--;
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }
        }
        
        private onOrientationChange(from: Orientation, to: Orientation): void {

            switch (to) {
                case Orientation.Portrait:
                    this.mainView.router.load({ pageName: "portrait", animatePages: false, pushState: false });
                    break;
                case Orientation.PortraitUpsideDown:
                    this.mainView.router.load({ pageName: "portrait", animatePages: false, pushState: false });
                    break;
                case Orientation.Landscape:
                    this.mainView.router.load({ pageName: "landscape", animatePages: false, pushState: false });
                    break;
                case Orientation.LandscapeCounterClockwise:
                    this.mainView.router.load({ pageName: "landscape", animatePages: false, pushState: false });
                    break;
            }
                

            this.$scope.$apply((scope) => {
                this.turnCards(from, to)
            });
        }

        private onShake(): void {
            this.vibrateService.vibrate(1000);
            this.$scope.$apply((scope) => this.shuffle());
        }

        private turnCards(from: Orientation, to: Orientation): void {
            let turn: boolean = false;
            switch (from) {
                case Orientation.Portrait:
                    turn = to == Orientation.Landscape || to == Orientation.PortraitUpsideDown;
                    break;
                case Orientation.PortraitUpsideDown:
                    turn = to == Orientation.Landscape || to == Orientation.Portrait;
                    break;
                case Orientation.Landscape:
                    turn = to == Orientation.LandscapeCounterClockwise || to == Orientation.Portrait;
                    break;
                case Orientation.LandscapeCounterClockwise:
                    turn = to == Orientation.Landscape || to == Orientation.Portrait;
                    break;
            }
            if (!turn)
                return;
            
            for (let i = 0; i < this.cards.length; i++) {
             
                let card = this.cards[i];
                let upperText = card.upperText;
                card.upperText = card.lowerText;
                card.lowerText = upperText;
            }
        }
    }
}