module Memo {
    "use strict";
    
    export class Card {
        cardId: string;
        topic: string;
        upperText: string;
        lowerText: string;
    }

    export interface ICardService {
        getCards(topic: string): ng.IPromise<Card[]>;
        getTopics(): ng.IPromise<string[]>;
    }

    export class CardService implements ICardService {
        private _http: ng.IHttpService;
        private _q: ng.IQService;

        static $inject = ["$http", "$q"];

        constructor(http: ng.IHttpService, q: ng.IQService) {
            this._http = http;
            this._q = q;
        }

        getCards(topic: string): ng.IPromise<Card[]> {
            let defer = this._q.defer<Card[]>();
            this._http.get<any>('cards.json').success((data) => {
                let cards: Card[] = data.cards;
                let result: Card[] = [];
                for (let i = 0; i < cards.length; i++) {
                    let card = cards[i];
                    card.cardId = uid.newUid();
                    if (card.topic == topic) {
                        result.push(card);
                    }
                }
                defer.resolve(result);
            })
            return defer.promise;
        }

        getTopics(): ng.IPromise<string[]> {
            let defer = this._q.defer<string[]>();
            this._http.get<any>('cards.json').success((data) => {
                let cards: Card[] = data.cards;
                let result: string[] = [];
                for (let i = 0; i < cards.length; i++) {
                    let card = cards[i];
                    let topic = card.topic;
                    if (!this.contains(result, topic)) {
                        result.push(topic);
                    }
                }
                defer.resolve(result);
            })
            return defer.promise;
        }

        private contains(array: Array<any>, obj: any) {
            for (let j = 0; j < array.length; j++) {
                if (array[j] === obj) {
                    return true;
                }
            }
            return false;
        }
    }
}