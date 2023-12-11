export interface UserProps {
    fname: string,
    lname: string,
    id: number,
    username: string,
    email: string,
    avatar: string,
}

export interface UserData {
    id: string,
    email: string,
    username: string,
    cognito_id: string,
    first_name: string,
    last_name: string,
    image_url: string,
    created_at: string,
    total_xp: number,
    birth_date: string,
    added_pois_count: number,
    received_ratings_count: number,
    given_ratings_count: number,
}