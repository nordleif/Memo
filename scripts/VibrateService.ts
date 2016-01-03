module Memo {
    "use strict";
    
    declare var navigator: any;

    export interface IVibrateService {
        vibrate(time: number): void;
    }

    export class VibrateService implements IVibrateService {            
        constructor() {
            
        }
        
        vibrate(time: number): void {
            navigator.vibrate(time);
        }
    }
}