export class Direction {
    direction: string;
    distance: number;
    duration: number;
    constructor(direction: string, distance: number, duration: number) {
        this.direction = direction;
        this.distance = distance;
        this.duration = duration;
    }
}