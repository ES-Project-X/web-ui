interface Point {
    latitude: number,
    longitude: number,
}

export interface Route {
    id: string,
    name: string,
    points: Point[],
}