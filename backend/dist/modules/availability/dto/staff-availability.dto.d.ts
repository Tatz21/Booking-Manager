import { BreakTimeDto } from './business-hours.dto';
export declare class StaffDayShiftDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isOff?: boolean;
    breaks?: BreakTimeDto[];
}
export declare class SetStaffAvailabilityDto {
    shifts: StaffDayShiftDto[];
}
