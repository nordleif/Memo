module Memo {
    "use strict";
    
    export class MemoController {
        private _accelerationService: IAccelerationService;
        private _canShake: boolean = true;
        private _cardService: ICardService;
        private _f7App: any;
        private _mainView: any;
        private _orientationService: OrientationService;
        private _scope: ng.IScope;
        private _vibrateService: IVibrateService;
        
        static $inject = ["$scope", "f7App", "mainView", "accelerationService", "cardService", "orientationService", "vibrateService"];
        
        constructor(scope: ng.IScope, f7App: any, mainView: any, accelerationService: IAccelerationService, cardService: ICardService, orientationService: OrientationService, vibrateService : IVibrateService) {
            this._scope = scope;
            this._f7App = f7App;
            this._mainView = mainView;
            this._accelerationService = accelerationService;
            this._cardService = cardService;
            this._orientationService = orientationService;
            this._vibrateService = vibrateService;
            
            this.show = (this._orientationService.orientation == Orientation.Portrait || this._orientationService.orientation == Orientation.Landscape) ? "upper" : "lower";
            this._scope.$watch(() => this.show, (newValue, oldValue) => this.onShowChanged(newValue, oldValue));

            this._accelerationService.onShake = () => this.onShake();
            this._orientationService.onOrientationChange = (from: Orientation, to: Orientation) => this.onOrientationChange(from, to);
            
            this._cardService.getTopics().then((topics) => {
                this.topics = topics;
                this.viewTopics();
            });
        }
        
        card: CardViewModel;

        cards: CardViewModel[] = [];

        show: string;
        
        topic: string;

        topics: string[];
        
        editCard(card: CardViewModel) {
            this.card = new CardViewModel(card);
            if (card.show == "lower")
                this.card.turn();
            this._mainView.router.load({ pageName: "editCard" });
        }

        deleteCard(card: Card) {
            for (let i = this.cards.length; i > 0; i--) {
                if (this.cards[i - 1].cardId == card.cardId) {
                    this.cards.splice(i - 1, 1);
                }
            }
        }

        newCard() {
            let temp = new Card();
            temp.cardId = uid.newUid();
            this.editCard(new CardViewModel(temp));
        }

        saveCard() {
            for (let i = 0; i < this.cards.length; i++) {
                if (this.card.cardId == this.cards[i].cardId) {
                    this.cards[i].upperText = this.cards[i].show == "upper" ? this.card.upperText : this.card.lowerText;
                    this.cards[i].lowerText = this.cards[i].show == "lower" ? this.card.lowerText : this.card.lowerText;
                    this._mainView.router.back();
                    return;
                }
            }
            
            this.card.show = this.show;
            this.cards.unshift(this.card);
            this._mainView.router.back();
        }

        viewCards(topic: string) {
            this.safeApply(() => {
                let pageName = "cardsPortrait";
                if (this._orientationService.orientation == Orientation.Landscape || this._orientationService.orientation == Orientation.LandscapeCounterClockwise)
                    pageName = "cardsLandscape";
                this.topic = topic;
                this.cards.length = 0;
                this._cardService.getCards(topic).then((cards) => {
                    for (let i = 0; i < cards.length; i++) {
                        var c = cards[i];
                        this.cards.push(new CardViewModel(cards[i]));
                    }
                    this.shuffle();
                    this._mainView.router.load({ pageName: pageName, animatePages: false, pushState: false });
                });
            });
        }
   
        viewTopics() {
            this.safeApply(() => {
                this._mainView.router.load({ pageName: "topics", animatePages: false, pushState: false });
                this.topic = undefined;
            });
        }
     
        private onOrientationChange(from: Orientation, to: Orientation) {
            this.safeApply(() => {
                this.show = (to == Orientation.Portrait || to == Orientation.LandscapeCounterClockwise) ? "upper" : "lower";

                if (this._mainView.url != "#cardsPortrait" && this._mainView.url != "#cardsLandscape")
                    return;
                let pageName: string = (to == Orientation.Portrait || to == Orientation.PortraitUpsideDown) ? "cardsPortrait" : "cardsLandscape";
                if (pageName != this._mainView.url)
                    this._mainView.router.load({ pageName: pageName, animatePages: false, pushState: false });
            });
        }

        private onShake() {
            this.safeApply(() => {
                if (this._mainView.url != "#cardsPortrait" && this._mainView.url != "#cardsLandscape")
                    return;
                if (!this._canShake)
                    return;

                this._canShake = false;
                setTimeout(() => this._canShake = true, 2000);
                this._vibrateService.vibrate(2000);
                this.shuffle();
            });
        }

        private onShowChanged(newValue: string, oldValue: string) {
            this.safeApply(() => {
                if (this._mainView.url != "#cardsPortrait" && this._mainView.url != "#cardsLandscape")
                    return;
                if (newValue != oldValue) {
                    for (let i = 0; i < this.cards.length; i++)
                        this.cards[i].turn();
                }
            });
        }

        private safeApply(func: () => void) {            
            (this._scope.$$phase || this._scope.$root.$$phase) ? func() : this._scope.$apply(func);
        }        

        private shuffle() {
            this.safeApply(() => {
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
    }
    
    export class CardViewModel  {
        constructor(card?: Card) {
            this.cardId = card.cardId;
            this.topic = card.upperText;
            this.upperText = card.upperText;
            this.lowerText = card.lowerText;
            this.show = "upper";
        }

        cardId: string;

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