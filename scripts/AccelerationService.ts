module Memo {
    "use strict";
    
    export interface IAccelerationService {
        onShake: { (): void; };
    }

    export class AccelerationService implements IAccelerationService {
        private previousAcceleration: AccelerationChange = new AccelerationChange();
        private sensitivity: number = 30;
            
        constructor() {
            navigator.accelerometer.watchAcceleration((acceleration) => this.onAcceleration(acceleration), undefined, { frequency: 300 });
        }

        onShake: { (): void; };
        
        private onAcceleration(acceleration): void {
            let accelerationChange: AccelerationChange = new AccelerationChange();
            if (this.previousAcceleration.x !== null) {
                accelerationChange.x = Math.abs(this.previousAcceleration.x - acceleration.x);
                accelerationChange.y = Math.abs(this.previousAcceleration.y - acceleration.y);
                accelerationChange.z = Math.abs(this.previousAcceleration.z - acceleration.z);
            }
            this.previousAcceleration = { x: acceleration.x, y: acceleration.y, z: acceleration.z };
            
            if (typeof this.onShake !== 'undefined' && accelerationChange.x + accelerationChange.y + accelerationChange.z > this.sensitivity) {
                this.onShake();
            }
        }
    }

    class AccelerationChange {
        x: number;
        y: number;
        z: number;
    }
}