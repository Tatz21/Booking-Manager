export declare class BreakTimeDto {
    start: string;
    end: string;
}
export declare class DayHoursDto {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed?: boolean;
    breaks?: BreakTimeDto[];
}
export declare class SetBusinessHoursDto {
    hours: DayHoursDto[];
}
