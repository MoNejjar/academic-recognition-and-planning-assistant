
import { PersonalData } from "../types";
import { AnalyticsResponse } from "../types/analyticsTypes";
import { mockAnalyticsData } from "./mockAnalyticsData";

export interface StudentApplication {
    id: string;
    studentName: string;
    university: string;
    degree: string;
    submissionDate: string;
    status: 'pending' | 'reviewed' | 'approved' | 'rejected';
    score: number;
    personalData: PersonalData;
    analyticsData: AnalyticsResponse;
}

export const mockApplications: StudentApplication[] = [
    {
        id: "app_1",
        studentName: "Max Mustermann",
        university: "ETH Zürich",
        degree: "Bachelor of Science",
        submissionDate: "2023-10-15",
        status: 'pending',
        score: 45,
        personalData: {
            firstName: "Max",
            surname: "Mustermann",
            streetAndHouseNumber: "Arcisstraße 21",
            zipLocationCountry: "80333 Munich, Germany",
            phoneNumber: "+49 89 289 01",
            tumEmail: "max.mustermann@tum.de",
            courseAtTUM: "Informatics",
            aimedDegree: "Bachelor of Science",
            registrationNumberAtTUM: "03712345",
            semesterAtTUM: "3",
            nameOfPreviousUniversity: "ETH Zürich",
            countryOfPreviousUniversity: "Switzerland",
            previousDegreeProgram: "Computer Science",
            diploma: "Bachelor of Science",
            numberOfSemestersInPreviousCourse: "4",
            workloadOfOneCredit: "1 ECTS = 30 h",
            maximumGradeAtFormerUniversity: "6.0",
            minimumPassingGradeAtFormerUniversity: "4.0",
        },
        analyticsData: {
            ...mockAnalyticsData,
            averageScore: 45,
            modulesHighlyEquivalent: 1,
            modulesPartial: 4,
            modulesInsufficient: 2,

        }
    },
    {
        id: "app_2",
        studentName: "Sarah Connor",
        university: "MIT",
        degree: "Computer Science",
        submissionDate: "2023-10-14",
        status: 'pending',
        score: 85,
        personalData: {
            firstName: "Sarah",
            surname: "Connor",
            streetAndHouseNumber: "Tech Road 1",
            zipLocationCountry: "Boston, USA",
            phoneNumber: "+1 555 0199",
            tumEmail: "sarah.connor@tum.de",
            courseAtTUM: "Robotics",
            aimedDegree: "Master of Science",
            registrationNumberAtTUM: "03799999",
            semesterAtTUM: "1",
            nameOfPreviousUniversity: "MIT",
            countryOfPreviousUniversity: "USA",
            previousDegreeProgram: "Computer Science",
            diploma: "Bachelor of Science",
            numberOfSemestersInPreviousCourse: "8",
            workloadOfOneCredit: "1 Credit = 1 ECTS",
            maximumGradeAtFormerUniversity: "4.0",
            minimumPassingGradeAtFormerUniversity: "2.0",
        },
        analyticsData: {
            ...mockAnalyticsData,
            averageScore: 85,
            modulesHighlyEquivalent: 5,
            modulesPartial: 1,
            modulesInsufficient: 0,

        }
    },
    {
        id: "app_3",
        studentName: "Lara Croft",
        university: "University of Oxford",
        degree: "Archaeology",
        submissionDate: "2023-10-12",
        status: 'rejected',
        score: 20,
        personalData: {
            firstName: "Lara",
            surname: "Croft",
            streetAndHouseNumber: "Manor Drive 1",
            zipLocationCountry: "Derby, UK",
            phoneNumber: "+44 7700 900077",
            tumEmail: "lara.croft@tum.de",
            courseAtTUM: "Informatics",
            aimedDegree: "Bachelor of Science",
            registrationNumberAtTUM: "03788888",
            semesterAtTUM: "1",
            nameOfPreviousUniversity: "Oxford",
            countryOfPreviousUniversity: "UK",
            previousDegreeProgram: "Archaeology",
            diploma: "Bachelor of Arts",
            numberOfSemestersInPreviousCourse: "6",
            workloadOfOneCredit: "1 Credit = 2 ECTS",
            maximumGradeAtFormerUniversity: "100",
            minimumPassingGradeAtFormerUniversity: "40",
        },
        analyticsData: {
            ...mockAnalyticsData,
            averageScore: 20,
            modulesHighlyEquivalent: 0,
            modulesPartial: 1,
            modulesInsufficient: 6,

        }
    }
];
