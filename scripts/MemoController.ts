module Memo {
    "use strict";
    
    export class MemoController {
        private _accelerationService: IAccelerationService;
        private _cardService: ICardService;
        private _f7App: any;
        private _mainView: any;
        private _orientationService: OrientationService;
        private _scope: ng.IScope;
        private _vibrateService: IVibrateService;
        
        static $inject = ["$scope", "f7App", "mainView", "accelerationService", "cardService", "orientationService", "vibrateService"];
        
        constructor($scope: ng.IScope, f7App: any, mainView: any, accelerationService: IAccelerationService, cardService: ICardService, orientationService: OrientationService, vibrateService : IVibrateService) {
            this._scope = $scope;
            this._f7App = f7App;
            this._mainView = mainView;
            this._accelerationService = accelerationService;
            this._cardService = cardService;
            this._orientationService = orientationService;
            this._vibrateService = vibrateService;
            
            this._accelerationService.onShake = () => this.onShake();
            this._orientationService.onOrientationChange = (from: Orientation, to: Orientation) => this.onOrientationChange(from, to);
            this._scope.$watch(() => this.topic, (newValue, oldValue) => this.onTopicChanged(newValue, oldValue));

            this._cardService.getTopics().then((topics) => {
                this.topics = topics;
                this.topic = this.topics.length > 0 ? this.topics[0] : undefined;
                this.cards.length = 0;
            });



            
                

            
        }
        
        cards: CardViewModel[] = [];

        topic: string;

        topics: string[];

        back(): void {
            this._mainView.router.back();
        }
        
        private onOrientationChange(from: Orientation, to: Orientation): void {
            this.safeApply(() => {
                let turn: boolean = false;
                switch (from) {
                    case Orientation.Portrait:
                        turn = to == Orientation.PortraitUpsideDown || to == Orientation.LandscapeCounterClockwise;
                        break;
                    case Orientation.PortraitUpsideDown:
                        turn = to == Orientation.Portrait || to == Orientation.Landscape;
                        break;
                    case Orientation.Landscape:
                        turn = to == Orientation.LandscapeCounterClockwise || to == Orientation.PortraitUpsideDown;
                        break;
                    case Orientation.LandscapeCounterClockwise:
                        turn = to == Orientation.Landscape || to == Orientation.Portrait;
                        break;
                }
                if (turn) {
                    for (let i = 0; i < this.cards.length; i++) {
                        this.cards[i].turn();
                    }
                }

                let pageName: string;
                switch (to) {
                    case Orientation.Portrait:
                        pageName = "portrait";
                        break;
                    case Orientation.PortraitUpsideDown:
                        pageName = "portrait";
                        break;
                    case Orientation.Landscape:
                        pageName = "landscape";
                        break;
                    case Orientation.LandscapeCounterClockwise:
                        pageName = "landscape";
                        break;
                }
                this._mainView.router.load({ pageName: pageName, animatePages: false, pushState: false });
            });
        }

        private onShake(): void {
            this.safeApply(() => {
                this._vibrateService.vibrate(1000);
                
                let counter: number = this.cards.length;
                let temp: any;
                let index: number;
                while (counter > 0) {
                    index = Math.floor(Math.random() * counter);
                    counter--;
                    temp = this.cards[counter];
                    this.cards[counter] = this.cards[index];
                    this.cards[index] = temp;
                }
            });
        }

        private onTopicChanged(newValue: string, oldValue: string) {
            this.safeApply(() => {
                this._f7App.closePanel('left');
                this.cards.length = 0;
                this._cardService.getCards(this.topic).then((cards) => {
                    for (let i = 0; i < cards.length; i++) {
                        this.cards.push(new CardViewModel(cards[i]));
                    }
                    this.onOrientationChange(Orientation.Portrait, this._orientationService.orientation);
                });
            });
        }

        private safeApply(func : () => void) {
            (this._scope.$$phase || this._scope.$root.$$phase) ? func() : this._scope.$apply(func);
        }        
    }
    
    export class CardViewModel  {
        constructor(card: Card) {
            this.topic = card.upperText;
            this.upperText = card.upperText;
            this.lowerText = card.lowerText;
            this.show = "upper";
        }

        topic: string;
        upperText: string;
        lowerText: string;
        show: string;

        turn() {
            let upperText = this.upperText;
            this.upperText = this.lowerText;
            this.lowerText = upperText;
            this.show = this.show == "upper" ? "lower" : "upper";
        }
    }
}