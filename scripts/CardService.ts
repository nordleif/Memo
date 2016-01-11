module Memo {
    "use strict";
    
    export class Card {
        cardId: string;
        topic: string;
        upperText: string;
        lowerText: string;
    }

    export interface ICardService {
        deleteCard(card: Card): ng.IPromise<void>;
        getCards(topic: string): ng.IPromise<Card[]>;
        getTopics(): ng.IPromise<string[]>;
        saveCard(card: Card): ng.IPromise<void>;
    }

    export class CardService implements ICardService {
        private _http: ng.IHttpService;
        private _q: ng.IQService;

        static $inject = ["$http", "$q"];

        constructor(http: ng.IHttpService, q: ng.IQService) {
            this._http = http;
            this._q = q;
        }

        deleteCard(card: Card): ng.IPromise<void> {
            return this.internalReadCards().then((cards) => {
                let found: boolean = false;
                for (let i = cards.length; i > 0; i--) {
                    if (cards[i - 1].cardId == card.cardId) {
                        cards.splice(i - 1, 1);
                        break;
                    }
                }
                return cards;
            }).then((cards) => {
                return this.internalWriteCard(cards);
            });
        }

        getCards(topic: string): ng.IPromise<Card[]> {
            let defer = this._q.defer<Card[]>();
            this.internalReadCards().then((cards) => {
                let result: Card[] = [];
                for (let i = 0; i < cards.length; i++) {
                    let card = cards[i];
                    if (card.topic == topic)
                        result.push(card);
                }
                defer.resolve(result);
            });
            return defer.promise;
        }

        getTopics(): ng.IPromise<string[]> {
            let defer = this._q.defer<string[]>();
            this.internalReadCards().then((cards) => {
                let result: string[] = [];
                for (let i = 0; i < cards.length; i++) {
                    let card = cards[i];
                    let topic = card.topic;
                    if (!this.contains(result, topic)) {
                        result.push(topic);
                    }
                }
                defer.resolve(result);
            });
            return defer.promise;
        }

        saveCard(card: Card): ng.IPromise<void> {
            return this.internalReadCards().then((cards) => {
                let found: boolean = false;
                for (let i = cards.length; i > 0; i--) {
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
                return this.internalWriteCard(cards);
            });
        }

        private contains(array: Array<any>, obj: any) {
            for (let j = 0; j < array.length; j++) {
                if (array[j] === obj) {
                    return true;
                }
            }
            return false;
        }
        
        private internalReadCards(): ng.IPromise<Card[]> {
            let defer = this._q.defer<Card[]>();
            let cards: Card[] = JSON.parse(localStorage.getItem("memo.cards"));
            if (cards) {
                defer.resolve(cards);
            } else {
                this._http.get<any>('cards.json').success((data) => {
                    cards = data.cards;
                    for (let i = 0; i < cards.length; i++) {
                        cards[i].cardId = uid.newUid();
                    }
                    defer.resolve(cards);
                });
            }
            return defer.promise;
        }

        private internalWriteCard(cards: Card[]): ng.IPromise<void> {
            let defer = this._q.defer<void>();
            localStorage.setItem("memo.cards", JSON.stringify(cards));
            defer.resolve(undefined);
            return defer.promise;
        }
    }
}