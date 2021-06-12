export interface SchoolOptions {
    initialize?: boolean,
    fetchRequestInfo?: boolean,
    getSchoolInfo?: boolean,
    refresh?: boolean
};

export interface SchoolPayload {
    region: string,
    name: string,
    sccode: number
};
