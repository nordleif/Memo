module Memo {
    "use strict";
    
    export interface IOrientationService {
        orientation: Orientation;
        onOrientationChange: { (from: Orientation, to: Orientation): void; };
    }

    export class OrientationService implements IOrientationService {
        constructor() {
            this.orientation = this.GetOrientation();
            window.onorientationchange = (ev: Event) => {
                let from: Orientation = this.orientation;
                this.orientation = this.GetOrientation();
                if (typeof this.onOrientationChange !== 'undefined') {
                    this.onOrientationChange(from, this.orientation);
                }
            };    
            window.onorientationchange(undefined);
        }

        orientation: Orientation;

        onOrientationChange: { (from: Orientation, to: Orientation): void; };

        private GetOrientation(): Orientation {
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
        }
    }

    export enum Orientation {
        Portrait,
        PortraitUpsideDown,
        Landscape,
        LandscapeCounterClockwise,
    }
}